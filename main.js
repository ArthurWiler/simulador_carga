/* ============================================================
   Casca Electron do Simulador de Carga — processo main.

   Responsabilidades, nesta ordem:
   1. servir o conteúdo web por um scheme próprio app://
   2. aplicar atualização já baixada e checar o GitHub em background
   3. expor ao renderer uma superfície mínima (ver preload.js)

   O renderer roda com sandbox e sem Node: a partir da Fase 2 ele
   executa JS baixado da internet, e são essas flags que garantem
   que esse JS não alcance o sistema de arquivos nem o banco.
   ============================================================ */

const { app, BrowserWindow, protocol, ipcMain, shell, Menu } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const { garantirConteudoWeb, webRoot, versaoLocal } = require("./src/webcontent");
const { verificarAtualizacao, promoverStaged } = require("./src/updater");
const db = require("./src/db");

const ORIGEM = "app://local";
const log = (msg) => console.log(`[simulador] ${msg}`);

/* Scheme próprio em vez de file://.

   Sob file:// o fetch do renderer envia "Origin: null", e os GeoServers
   que ecoam o Origin (o SICAR faz isso — ver comentário no topo de
   geo.js) responderiam "Access-Control-Allow-Origin: null". Isso é
   frágil e quebraria a aba Análise Ambiental. Com um scheme standard +
   secure a origem é real (app://local), o CORS se comporta como em
   qualquer servidor web e o localStorage do tema persiste. */
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function registrarProtocolo(raiz) {
  protocol.handle("app", async (req) => {
    const url = new URL(req.url);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (rel === "") rel = "index.html";

    const arquivo = path.normalize(path.join(raiz, rel));
    // Barreira contra path traversal vindo do conteúdo web
    if (!arquivo.startsWith(raiz)) return new Response("", { status: 403 });

    try {
      const buf = await fs.promises.readFile(arquivo);
      return new Response(buf, {
        headers: {
          "content-type": MIME[path.extname(arquivo).toLowerCase()] || "application/octet-stream",
          "cache-control": "no-cache",
        },
      });
    } catch {
      return new Response("", { status: 404 });
    }
  });
}

function criarJanela() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#041e18",
    show: false,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null); // sem menu; F12 e Ctrl+Shift+I abaixo
  win.once("ready-to-show", () => win.show());
  win.loadURL(`${ORIGEM}/index.html`);

  // Links externos (attribution do mapa, etc.) abrem no navegador do
  // sistema — nunca dentro da janela do app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(ORIGEM)) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });

  // Com SIMULADOR_DEBUG=1 os erros do renderer aparecem no log do main.
  // No portable não há como abrir o DevTools remotamente; isto é o que
  // permite pedir ao usuário um log quando algo falha só na máquina dele.
  if (process.env.SIMULADOR_DEBUG) {
    win.webContents.on("console-message", (_e, nivel, msg, linha, origem) => {
      if (nivel >= 2) log(`renderer: ${msg} (${origem}:${linha})`);
    });
  }

  win.webContents.on("before-input-event", (_e, input) => {
    const devtools =
      input.key === "F12" ||
      (input.control && input.shift && input.key.toLowerCase() === "i");
    if (devtools) win.webContents.toggleDevTools();
  });

  return win;
}

/* Uma instância só: em portable é comum o usuário clicar duas vezes. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId("br.com.cemig.simuladorcarga");

    // Log do banco em arquivo. A máquina que alcança o SQL Server é uma VM
    // com apenas o .exe — sem terminal e sem Node, um arquivo em userData é
    // a única forma de saber por que o preenchimento não veio.
    db.configurarLog(app.getPath("userData"));

    // Ordem importa: promover o update baixado ANTES de semear e de
    // registrar o protocolo, para a janela já abrir com a versão nova.
    promoverStaged(app, log);
    const raiz = garantirConteudoWeb(app, log);
    registrarProtocolo(raiz);

    const win = criarJanela();

    // Diagnóstico do banco: SÓ sob SIMULADOR_DEBUG, no console — que um
    // .exe portable nem tem anexado. O usuário nunca vê nada; serve para
    // rodar pelo terminal quando a conexão falhar em uma máquina específica.
    if (process.env.SIMULADOR_DEBUG) {
      db.statusDb().then((st) => log(`banco: ${JSON.stringify(st)}`));
    }

    // Update em background: nunca bloqueia a abertura da janela, e
    // qualquer falha morre aqui dentro sem afetar o app.
    win.webContents.once("did-finish-load", () => {
      verificarAtualizacao(app, log)
        .then((r) => win.webContents.send("update:estado", r))
        .catch((e) => log(`updater falhou: ${e.message}`));
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) criarJanela();
    });
  });

  app.on("window-all-closed", async () => {
    await db.encerrar();
    if (process.platform !== "darwin") app.quit();
  });
}

/* ---- Superfície exposta ao renderer (ver preload.js) ---- */
ipcMain.handle("trafo:buscar", (_e, codigo, municipio) =>
  db.buscarTrafo(codigo, municipio),
);
ipcMain.handle("db:status", () => db.statusDb());
ipcMain.handle("app:versao", () => ({
  app: app.getVersion(),
  conteudo: versaoLocal(app),
  raiz: webRoot(app),
}));
ipcMain.handle("update:aplicar", () => {
  const ok = promoverStaged(app, log);
  if (ok) {
    const [win] = BrowserWindow.getAllWindows();
    if (win) win.webContents.reload();
  }
  return ok;
});
