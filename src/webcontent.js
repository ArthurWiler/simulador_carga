/* ============================================================
   Conteúdo web servido pelo app — semeadura e localização.

   O renderer NÃO é servido de dentro do .exe: na primeira
   execução o conteúdo embutido no asar é copiado para uma pasta
   gravável (userData/web), e é de lá que o protocolo app:// lê
   daí em diante. É essa pasta que o updater (src/updater.js)
   atualiza a cada push no main do GitHub, sem reinstalar nada.

   O manifest.json é a fonte da verdade sobre QUAIS arquivos
   formam o conteúdo web — build.js o gera, este módulo e o
   updater o consomem.
   ============================================================ */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

// Raiz do conteúdo embutido no .exe (dentro do asar, somente-leitura)
const BUNDLE_DIR = path.join(__dirname, "..");

function webRoot(app) {
  return path.join(app.getPath("userData"), "web");
}
function statePath(app) {
  return path.join(app.getPath("userData"), "web-state.json");
}

function lerJson(arquivo) {
  try {
    return JSON.parse(fs.readFileSync(arquivo, "utf8"));
  } catch {
    return null;
  }
}

function sha256Arquivo(arquivo) {
  return crypto.createHash("sha256").update(fs.readFileSync(arquivo)).digest("hex");
}

/* Identidade do conteúdo embutido: hash do próprio manifest. Qualquer
   alteração em qualquer arquivo web muda o manifest e, portanto, este
   hash — é o gatilho para re-semear quando um .exe novo é distribuído. */
function idDoBundle() {
  const m = path.join(BUNDLE_DIR, "manifest.json");
  return fs.existsSync(m) ? sha256Arquivo(m) : null;
}

/* Garante que userData/web exista e corresponda ao .exe em uso.

   Re-semeia (sobrescrevendo o conteúdo quente) em dois casos:
   - primeira execução, ou pasta corrompida/sem manifest;
   - .exe novo instalado — o bundle mudou, então o conteúdo quente
     antigo é descartado e o updater volta a subir a partir daqui.
   Fora isso, o conteúdo quente é preservado intacto. */
function garantirConteudoWeb(app, log = () => {}) {
  const raiz = webRoot(app);
  const bundleId = idDoBundle();
  const estado = lerJson(statePath(app));
  const manifestLocal = lerJson(path.join(raiz, "manifest.json"));

  const precisaSemear =
    !manifestLocal || !estado || estado.semeadoDe !== bundleId;

  if (!precisaSemear) {
    log(`conteúdo web em ${raiz} (v${manifestLocal.version})`);
    return raiz;
  }

  log(estado ? "bundle novo detectado — re-semeando" : "primeira execução — semeando");
  fs.rmSync(raiz, { recursive: true, force: true });
  fs.mkdirSync(raiz, { recursive: true });

  const manifestBundle = lerJson(path.join(BUNDLE_DIR, "manifest.json"));
  const arquivos = manifestBundle
    ? manifestBundle.files.map((f) => f.path)
    : ["index.html"];

  for (const rel of arquivos.concat("manifest.json")) {
    const origem = path.join(BUNDLE_DIR, rel);
    if (!fs.existsSync(origem)) continue;
    const destino = path.join(raiz, rel);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origem, destino);
  }

  fs.writeFileSync(
    statePath(app),
    JSON.stringify({ semeadoDe: bundleId, em: new Date().toISOString() }, null, 2),
  );
  log(`${arquivos.length} arquivos copiados para ${raiz}`);
  return raiz;
}

function versaoLocal(app) {
  const m = lerJson(path.join(webRoot(app), "manifest.json"));
  return m ? m.version : null;
}

module.exports = { BUNDLE_DIR, webRoot, garantirConteudoWeb, versaoLocal, lerJson, sha256Arquivo };
