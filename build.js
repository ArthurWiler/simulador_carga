#!/usr/bin/env node
/**
 * build.js — build do Simulador de Carga (Windows portable)
 *
 *   node build.js              checa o ambiente, gera o manifest e empacota
 *   node build.js --manifest   só regenera o manifest.json
 *
 * Alvo é Windows portable e só isso: sem instalador NSIS, sem Linux,
 * sem cross-build. Um .exe que o usuário copia e abre.
 */

const { execSync, spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = __dirname;
const args = process.argv.slice(2);

/* Diretório de saída.

   O padrão seria RAIZ/dist, mas quando o repositório vive dentro do OneDrive
   isso quebra: o OneDrive começa a sincronizar os ~385 MB de win-unpacked
   durante o build, mantém um handle aberto no app.asar e o electron-builder
   falha com "O arquivo já está sendo usado por outro processo" no build
   seguinte. Detectado o OneDrive, a saída vai para %LOCALAPPDATA%.

   SIMULADOR_DIST sobrescreve a escolha. */
function resolverSaida() {
  if (process.env.SIMULADOR_DIST) return path.resolve(process.env.SIMULADOR_DIST);

  const oneDrive = process.env.OneDrive || process.env.OneDriveConsumer;
  const dentroDoOneDrive =
    oneDrive && RAIZ.toLowerCase().startsWith(path.resolve(oneDrive).toLowerCase());

  if (dentroDoOneDrive) {
    const base = process.env.LOCALAPPDATA || require("node:os").tmpdir();
    return path.join(base, "SimuladorCarga-build");
  }
  return path.join(RAIZ, "dist");
}

const SAIDA = resolverSaida();

/* Arquivos que formam o CONTEÚDO WEB — o que é servido pelo app:// e o
   que o updater sincroniza com o GitHub. Diretórios entram inteiros.
   A casca (main.js, preload.js, src/) NÃO entra: ela só muda com um
   .exe novo. */
const CONTEUDO_WEB = [
  "home.html",
  "home.js",
  "index.html",
  "textos.html",
  "textos.js",
  "textos-dados.js",
  "core.js",
  "geo.js",
  "map.js",
  "estilo.css",
  "logo.png",
  "vendor",
  // PDFs das NDs. Entram no manifest como qualquer outro arquivo, então
  // acompanham o auto-update — ver docs/README.md.
  "docs",
];

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
const ok = (m) => console.log(c.green("  ok  ") + m);
const fail = (m) => console.error(c.red("  X   ") + m);
const info = (m) => console.log(c.cyan("  ->  ") + m);
const warn = (m) => console.log(c.yellow("  !   ") + m);
const sep = () => console.log(c.bold("\n" + "-".repeat(52)));

/* ---------------- manifest.json ---------------- */

/* Documentação que mora dentro de uma pasta de conteúdo (docs/README.md)
   é para quem mantém o repositório, não para o app: fora do manifest ela
   não ocupa espaço no .exe nem viaja no auto-update a cada correção de
   texto. */
const ehDoc = (rel) => rel.toLowerCase().endsWith(".md");

function listarArquivos(rel) {
  const abs = path.join(RAIZ, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return ehDoc(rel) ? [] : [rel];
  return fs
    .readdirSync(abs)
    .flatMap((n) => listarArquivos(path.posix.join(rel.split(path.sep).join("/"), n)));
}

function gerarManifest() {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"),
  );

  const files = CONTEUDO_WEB.flatMap(listarArquivos)
    .sort()
    .map((rel) => {
      const buf = fs.readFileSync(path.join(RAIZ, rel));
      return {
        path: rel,
        sha256: crypto.createHash("sha256").update(buf).digest("hex"),
        bytes: buf.length,
      };
    });

  const manifest = { version, gerado: new Date().toISOString(), files };
  fs.writeFileSync(
    path.join(RAIZ, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  const total = files.reduce((s, f) => s + f.bytes, 0);
  ok(`manifest.json — v${version}, ${files.length} arquivos, ${(total / 1024).toFixed(0)} KB`);
  return manifest;
}

/* ---------------- checagem de ambiente ---------------- */

function checarAmbiente() {
  let erros = 0;

  const [maj] = process.versions.node.split(".").map(Number);
  if (maj >= 18) ok(`Node.js ${process.versions.node}`);
  else {
    fail(`Node.js ${process.versions.node} — mínimo: 18`);
    erros++;
  }

  try {
    ok(`npm ${execSync("npm --version", { encoding: "utf8" }).trim()}`);
  } catch {
    fail("npm não encontrado");
    erros++;
  }

  const nm = path.join(RAIZ, "node_modules");
  if (fs.existsSync(nm)) ok("node_modules presente");
  else {
    fail("node_modules ausente — execute: npm install");
    erros++;
  }

  const eb = path.join(nm, ".bin", "electron-builder.cmd");
  if (fs.existsSync(eb) || fs.existsSync(path.join(nm, "electron-builder")))
    ok("electron-builder instalado");
  else {
    fail("electron-builder não encontrado — execute: npm install");
    erros++;
  }

  if (fs.existsSync(path.join(RAIZ, "assets", "icon.ico"))) ok("assets/icon.ico presente");
  else {
    fail("assets/icon.ico ausente");
    erros++;
  }

  // O .env é opcional: sem ele o app roda em modo manual (ver src/db.js)
  if (fs.existsSync(path.join(RAIZ, ".env")))
    ok(".env presente — será embutido no .exe");
  else warn(".env ausente — o app será empacotado sem acesso ao banco");

  if (process.platform !== "win32") {
    fail(`plataforma ${process.platform} — o alvo é Windows portable; build precisa rodar no Windows`);
    erros++;
  }

  return erros;
}

/* ---------------- empacotamento em pasta ---------------- */

/* O alvo padrão é "dir" + zip, NÃO o auto-extrator "portable".

   Motivo: o alvo portable do electron-builder é um SFX 7z que, ao ser
   aberto, grava um segundo executável em %TEMP% e o executa. Isso é o
   padrão de comportamento de um dropper, e o CrowdStrike Falcon colocou o
   arquivo em quarentena na rede interna ("comportamento malicioso
   detectado"). Distribuir a pasta compactada não disfarça a detecção — ela
   ELIMINA o comportamento detectado: não há extração em %TEMP% nem
   processo filho sendo lançado.

   O alvo portable continua disponível em `node build.js --portable`, para
   quando houver certificado de assinatura de codigo. */
function compactarPasta(versao) {
  const seteZip = path.join(RAIZ, "node_modules", "7zip-bin", "win", "x64", "7za.exe");
  if (!fs.existsSync(seteZip)) {
    warn("7za.exe não encontrado — pasta gerada, zip nao");
    return null;
  }

  const nome = `SimuladorCarga-${versao}`;
  const pasta = path.join(SAIDA, nome);
  const zip = path.join(SAIDA, `${nome}-win.zip`);

  // pasta com o nome da versão para o zip ter uma raiz, em vez de
  // despejar ~100 arquivos onde o usuário descompactar
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.renameSync(path.join(SAIDA, "win-unpacked"), pasta);
  fs.rmSync(zip, { force: true }); // 7za APPENDA em arquivo existente

  info("compactando (pode levar um minuto)...");
  const r = spawnSync(seteZip, ["a", "-tzip", "-mx=5", zip, nome], {
    cwd: SAIDA,
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) {
    fail("compactação falhou");
    return null;
  }
  return { zip, pasta };
}

/* ---------------- execução ---------------- */

const querPortable = args.includes("--portable");

sep();
console.log(
  c.bold(
    ` Simulador de Carga — build (Windows ${querPortable ? "portable .exe" : "pasta + zip"})`,
  ),
);
sep();

if (args.includes("--manifest")) {
  gerarManifest();
  process.exit(0);
}

const erros = checarAmbiente();
sep();
if (erros > 0) {
  fail(`${erros} erro(s). Corrija antes de continuar.`);
  process.exit(1);
}

const { version } = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));
gerarManifest();
sep();

if (querPortable)
  warn("alvo portable: SFX que grava em %TEMP% — sujeito a bloqueio por EDR sem assinatura");

const alvo = querPortable ? "portable" : "dir";
const cmd =
  `npx electron-builder --win --x64` +
  ` --config.win.target=${alvo}` +
  ` --config.directories.output="${SAIDA}"`;
if (SAIDA !== path.join(RAIZ, "dist"))
  info(`saída fora do repositório (OneDrive detectado): ${SAIDA}`);
info(`executando: ${cmd}`);
sep();

const r = spawnSync(cmd, { shell: true, stdio: "inherit", cwd: RAIZ });

sep();
if (r.status !== 0) {
  fail("build falhou.");
  process.exit(r.status || 1);
}

const mb = (arquivo) => (fs.statSync(arquivo).size / 1024 / 1024).toFixed(1);

if (querPortable) {
  for (const f of fs.readdirSync(SAIDA).filter((f) => f.endsWith(".exe")))
    ok(`${f} (${mb(path.join(SAIDA, f))} MB)`);
} else {
  const saidaZip = compactarPasta(version);
  if (saidaZip) {
    ok(c.bold(`SimuladorCarga-${version}-win.zip (${mb(saidaZip.zip)} MB)`));
    info(`pasta: ${saidaZip.pasta}`);
    info(`o usuário descompacta e abre "Simulador de Carga.exe" — sem instalação`);
  }
}

ok(c.bold("build concluído"));
info(`artefatos em: ${SAIDA}`);
