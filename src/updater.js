/* ============================================================
   Atualização automática do CONTEÚDO WEB a partir do GitHub.

   Só o conteúdo web (index.html, js, css, vendor) se atualiza
   sozinho — a casca Electron (main.js/preload.js/dependências)
   exige um .exe novo, porque no Windows nenhum executável em uso
   consegue se auto-substituir.

   Fonte: raw.githubusercontent.com, e NÃO a API do GitHub. A API
   limita 60 requisições/hora POR IP sem autenticação; atrás do NAT
   corporativo todos os usuários saem pelo mesmo IP público e o
   limite estouraria, fazendo o update falhar de forma intermitente
   e difícil de diagnosticar. O raw é servido por CDN, sem esse
   limite (o custo é um cache de ~5 min, irrelevante aqui).

   Usa net.fetch do Electron (pilha de rede do Chromium) em vez do
   módulo https: assim as configurações de proxy do Windows e os
   PAC corporativos são respeitados automaticamente.

   REGRA INEGOCIÁVEL: qualquer falha aqui é silenciosa. Sem rede,
   com github.com bloqueado ou com download corrompido, o app abre
   normalmente com o conteúdo que já tem.
   ============================================================ */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { net } = require("electron");
const { webRoot, lerJson } = require("./webcontent");

/* SIMULADOR_UPDATE_BASE sobrescreve a origem do update. Serve para
   testar o ciclo completo contra um servidor local e, se um dia o
   github.com for bloqueado na rede da CEMIG, para apontar a um espelho
   interno sem alterar o código. */
const RAW_BASE =
  process.env.SIMULADOR_UPDATE_BASE ||
  "https://raw.githubusercontent.com/ArthurWiler/simulador_carga/main";
const TIMEOUT_MS = 15000;

const stagedDir = (app) => path.join(app.getPath("userData"), "web-staged");

async function baixar(url, comoTexto = false) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // cache-buster: o CDN do raw guarda ~5 min, mas proxies corporativos
    // podem guardar bem mais
    const sep = url.includes("?") ? "&" : "?";
    const resp = await net.fetch(`${url}${sep}t=${Date.now()}`, {
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return comoTexto ? await resp.text() : Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

/* Promove um update já baixado. Só um rename — barato o bastante para
   rodar no boot, antes de a janela existir. */
function promoverStaged(app, log = () => {}) {
  const staged = stagedDir(app);
  const raiz = webRoot(app);
  if (!fs.existsSync(path.join(staged, "manifest.json"))) return false;

  const antigo = `${raiz}-antigo-${Date.now()}`;
  try {
    if (fs.existsSync(raiz)) fs.renameSync(raiz, antigo);
    fs.renameSync(staged, raiz);
    fs.rmSync(antigo, { recursive: true, force: true });
    const m = lerJson(path.join(raiz, "manifest.json"));
    log(`atualização aplicada — v${m ? m.version : "?"}`);
    return true;
  } catch (e) {
    // Rollback: se o rename do novo falhou, devolve o antigo ao lugar
    if (!fs.existsSync(raiz) && fs.existsSync(antigo)) fs.renameSync(antigo, raiz);
    log(`falha ao aplicar atualização: ${e.message}`);
    return false;
  }
}

/* Verifica o GitHub e, havendo novidade, deixa o conteúdo novo pronto em
   web-staged. Retorna o resumo para o renderer.

   O diretório staged é montado COMPLETO (arquivos inalterados vêm por
   cópia local, só os alterados são baixados) e o manifest só é gravado
   no final — se algo falhar no meio, o staged fica sem manifest e é
   ignorado por promoverStaged(). Nunca existe estado meio-atualizado. */
async function verificarAtualizacao(app, log = () => {}) {
  const raiz = webRoot(app);
  const local = lerJson(path.join(raiz, "manifest.json"));
  if (!local) return { status: "erro", motivo: "manifest local ausente" };

  let remoto;
  try {
    remoto = JSON.parse(await baixar(`${RAW_BASE}/manifest.json`, true));
  } catch (e) {
    // HTTP 4xx = o manifest ainda não está no main (ou o repo mudou);
    // qualquer outra falha = sem rede, proxy barrando ou timeout. Os dois
    // casos são silenciosos, mas rendem diagnósticos bem diferentes.
    const http = /^HTTP (\d+)$/.exec(e.message);
    const motivo = http
      ? `manifest.json não encontrado no GitHub (HTTP ${http[1]})`
      : `GitHub inacessível (${e.message})`;
    log(`sem atualização — ${motivo}`);
    return { status: "offline", motivo };
  }

  const porCaminho = new Map(local.files.map((f) => [f.path, f.sha256]));
  const alterados = remoto.files.filter((f) => porCaminho.get(f.path) !== f.sha256);
  const removidos = local.files.filter(
    (f) => !remoto.files.some((r) => r.path === f.path),
  );

  if (alterados.length === 0 && removidos.length === 0) {
    log(`conteúdo em dia (v${local.version})`);
    return { status: "em-dia", versao: local.version };
  }

  log(`v${remoto.version}: ${alterados.length} arquivo(s) a baixar`);
  const staged = stagedDir(app);
  fs.rmSync(staged, { recursive: true, force: true });
  fs.mkdirSync(staged, { recursive: true });

  try {
    for (const f of remoto.files) {
      const destino = path.join(staged, f.path);
      fs.mkdirSync(path.dirname(destino), { recursive: true });

      if (porCaminho.get(f.path) === f.sha256) {
        fs.copyFileSync(path.join(raiz, f.path), destino); // inalterado
        continue;
      }
      const buf = await baixar(`${RAW_BASE}/${f.path}`);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      if (hash !== f.sha256)
        throw new Error(`sha256 divergente em ${f.path}`);
      fs.writeFileSync(destino, buf);
    }
    // manifest por último: é ele que marca o staged como válido
    fs.writeFileSync(
      path.join(staged, "manifest.json"),
      JSON.stringify(remoto, null, 2),
    );
  } catch (e) {
    fs.rmSync(staged, { recursive: true, force: true });
    log(`atualização abortada: ${e.message}`);
    return { status: "erro", motivo: e.message };
  }

  log(`v${remoto.version} pronta — será aplicada na próxima abertura`);
  return { status: "pronta", versao: remoto.version, de: local.version };
}

module.exports = { verificarAtualizacao, promoverStaged };
