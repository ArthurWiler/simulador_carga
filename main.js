/* ============================================================
   Casca Electron do Simulador de Carga — processo main.

   Responsabilidades, nesta ordem:
   1. servir o conteúdo web por um scheme próprio app://
   2. aplicar atualização já baixada e checar o GitHub em background
   3. abrir as janelas do portal (ver ROTAS/SITES/DOCUMENTOS abaixo)
   4. expor ao renderer uma superfície mínima (ver preload.js)

   O renderer roda com sandbox e sem Node: a partir da Fase 2 ele
   executa JS baixado da internet, e são essas flags que garantem
   que esse JS não alcance o sistema de arquivos nem o banco.
   ============================================================ */

const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  shell,
  Menu,
  dialog,
} = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const { garantirConteudoWeb, webRoot, versaoLocal } = require("./src/webcontent");
const { verificarAtualizacao, promoverStaged } = require("./src/updater");
const db = require("./src/db");

const ORIGEM = "app://local";
const log = (msg) => console.log(`[simulador] ${msg}`);

/* ============================================================
   Catálogos do portal — a ALLOWLIST do que a homepage pode abrir.

   O renderer executa JS baixado da internet (ver src/updater.js).
   Por isso ele NUNCA envia uma URL nem um caminho de arquivo para
   cá: ele envia uma CHAVE, e é este arquivo — que só muda com um
   .exe novo — que a traduz. Um index.html comprometido por um
   update malicioso não consegue abrir arquivo arbitrário nem
   navegar para host arbitrário; no máximo abre o que já está aqui.

   Para acrescentar um item ao portal: uma entrada aqui + uma
   entrada em ITENS (home.js).
   ============================================================ */

// Janelas de conteúdo local. A query ?aba= é lida pelo core.js, que
// ativa a aba e esconde a barra de abas (body.janela-solo).
const ROTAS = {
  simulador: {
    rota: "index.html?aba=simulador",
    titulo: "Simulação de Carga",
  },
  ambiental: {
    rota: "index.html?aba=ambiental",
    titulo: "Análise Ambiental",
  },
  textos: {
    rota: "textos.html",
    titulo: "Textos Padrão",
  },
};

const SITES = {
  principal: "https://carga-ad8b9.firebaseapp.com/",
};

// Caminhos relativos à raiz do conteúdo web (userData/web). Os PDFs
// vivem em docs/ e entram no manifest/auto-update como qualquer outro
// arquivo — ver build.js (CONTEUDO_WEB) e docs/README.md.
const DOCUMENTOS = {
  "nd-5-1": "docs/ND-5.1.pdf",
  "nd-5-2": "docs/ND-5.2.pdf",
};

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
  ".pdf": "application/pdf",
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

/* Diagnóstico e DevTools — igual em toda janela, inclusive na do site
   externo, onde é a única forma de investigar um problema. */
function instrumentar(win) {
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
}

/* Janela de conteúdo LOCAL (homepage, simulador, ambiental). Todas
   carregam app://local e recebem o preload — é a mesma configuração de
   sempre, agora parametrizada pela rota. */
function criarJanelaApp({ rota, titulo, largura = 1400, altura = 900 }) {
  const win = new BrowserWindow({
    width: largura,
    height: altura,
    minWidth: 1000,
    minHeight: 700,
    title: titulo,
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
  win.loadURL(`${ORIGEM}/${rota}`);

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

  instrumentar(win);
  return win;
}

/* Janela do site EXTERNO (hospedado no Firebase).

   Sem preload de propósito: o site não enxerga window.api e portanto não
   alcança o IPC nem o SQL Server. É uma aba de navegador com a moldura do
   app, nada além disso. A navegação fica presa à origem do próprio site;
   qualquer link para fora vai para o navegador do sistema. */
function criarJanelaSite(url, titulo) {
  const origem = new URL(url).origin;

  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: titulo,
    backgroundColor: "#041e18",
    show: false,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url: destino }) => {
    if (/^https?:/.test(destino)) shell.openExternal(destino);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, destino) => {
    if (!destino.startsWith(origem)) {
      e.preventDefault();
      if (/^https?:/.test(destino)) shell.openExternal(destino);
    }
  });

  /* Bloqueio de NAVEGADOR pelo proxy corporativo (Zscaler Browser Control).

     O Chromium embutido no Electron se anuncia como "Chrome/130" — versão
     que a política da CEMIG não aprova —, então nas máquinas atrás do
     agente Zscaler esta janela recebe uma página de bloqueio no lugar do
     site. Ela chega com HTTP 200, e por isso o did-fail-load abaixo NÃO
     dispara: sem o tratamento daqui o usuário fica olhando a tela do
     proxy, que não explica o que ela tem a ver com o Simulador.

     A saída é entregar o endereço ao navegador padrão da máquina — que é,
     esse sim, um navegador homologado. Mascarar o User-Agent também
     "funcionaria", mas seria contornar a política da empresa e voltaria a
     quebrar assim que a lista de versões aprovadas andasse (o Chromium do
     Electron está sempre atrás do Chrome estável). Onde não há agente
     Zscaler — a VM dos usuários — nada disto dispara. */
  const proxyBloqueou = (texto) => /zscaler|internet security by/i.test(texto);
  let entregue = false;

  function entregarAoNavegador(sinal) {
    if (entregue || win.isDestroyed()) return;
    entregue = true;
    log(`site ${origem} barrado pelo proxy (${sinal}) — indo para o navegador padrão`);

    // Fecha ANTES do diálogo. O did-navigate vem antes do ready-to-show,
    // então a janela pode nem ter aparecido — e um diálogo modal preso a
    // uma janela invisível corre o risco de não ser visto. Sem pai, ele
    // pertence ao aplicativo e sempre aparece.
    win.close();
    shell.openExternal(url).catch((e) => log(`openExternal falhou: ${e.message}`));
    dialog.showMessageBox({
      type: "info",
      title: "Abrindo no navegador",
      message: "O site foi aberto no seu navegador padrão.",
      detail:
        `${origem}\n\nA rede da CEMIG não permite abrir este endereço dentro ` +
        `do aplicativo: o proxy só aceita navegadores homologados. Se a janela ` +
        `do navegador não aparecer, copie o endereço acima para ele.`,
      buttons: ["Fechar"],
    });
  }

  // Dois sinais porque o Zscaler ora redireciona para um host próprio, ora
  // devolve a página de bloqueio na própria URL do site (com inspeção SSL,
  // como no caso relatado). Um dos dois pega cada caso; entregarAoNavegador
  // é idempotente para quando os dois baterem.
  win.webContents.on("did-navigate", (_e, destino) => {
    if (proxyBloqueou(destino)) entregarAoNavegador("url");
  });
  win.webContents.on("page-title-updated", (_e, tituloPagina) => {
    if (proxyBloqueou(tituloPagina)) entregarAoNavegador("título");
  });

  /* Sem rede ou com o host bloqueado pelo proxy da CEMIG, o padrão do
     Chromium é uma tela branca sem explicação. Aqui o usuário recebe o
     motivo e a janela some. -3 (ABORTED) é ruído normal de navegação. */
  win.webContents.on("did-fail-load", (_e, codigo, descricao, _url, main) => {
    if (!main || codigo === -3 || win.isDestroyed()) return;
    log(`site ${origem} falhou: ${codigo} ${descricao}`);
    dialog
      .showMessageBox(win, {
        type: "warning",
        title: "Site indisponível",
        message: "Não foi possível abrir o site.",
        detail:
          `${origem}\n\nVerifique a conexão com a internet. Se você está na ` +
          `rede da CEMIG, o endereço pode estar bloqueado pelo proxy.\n\n` +
          `(${descricao})`,
        buttons: ["Fechar"],
      })
      .then(() => {
        if (!win.isDestroyed()) win.close();
      });
  });

  instrumentar(win);
  win.loadURL(url);
  return win;
}

/* Registro das janelas abertas, por chave.

   Sem isso, clicar duas vezes no card do Simulador renderia duas janelas
   iguais — e duas cópias do formulário divergindo em silêncio é pior do
   que nenhuma. Reabrir um item que já está aberto apenas o foca. */
const janelas = new Map();

function focarOuCriar(chave, criar) {
  const aberta = janelas.get(chave);
  if (aberta && !aberta.isDestroyed()) {
    if (aberta.isMinimized()) aberta.restore();
    aberta.focus();
    return aberta;
  }
  const win = criar();
  janelas.set(chave, win);
  win.on("closed", () => janelas.delete(chave));
  return win;
}

/* Ponto de entrada do portal. Idempotente: se a home já está aberta,
   focarOuCriar apenas a traz para a frente.

   O fallback para index.html não é zelo excessivo. O conteúdo web vem do
   GitHub e pode estar em uma versão ANTERIOR à homepage — basta um .exe
   novo alcançar uma máquina antes de o manifest correspondente subir para
   a main. Nesse intervalo, carregar home.html daria 404 e a janela abriria
   em branco, sem nada que explicasse o quê. Cair no simulador é uma
   degradação que o usuário entende sozinho. */
function abrirHome() {
  return focarOuCriar("home", () => {
    const temHome = fs.existsSync(path.join(webRoot(app), "home.html"));
    if (!temHome) log("home.html ausente no conteúdo web — abrindo o simulador");
    return criarJanelaApp({
      rota: temHome ? "home.html" : "index.html",
      titulo: "Simulador de Carga - CEMIG",
    });
  });
}

/* Uma instância só: em portable é comum o usuário clicar duas vezes. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // Traz a HOME para a frente (e a reabre se o usuário a tiver fechado
  // deixando só uma ferramenta aberta) — não uma janela qualquer.
  app.on("second-instance", () => abrirHome());

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

    const home = abrirHome();

    // Diagnóstico do banco: SÓ sob SIMULADOR_DEBUG, no console — que um
    // .exe portable nem tem anexado. O usuário nunca vê nada; serve para
    // rodar pelo terminal quando a conexão falhar em uma máquina específica.
    if (process.env.SIMULADOR_DEBUG) {
      db.statusDb().then((st) => log(`banco: ${JSON.stringify(st)}`));
    }

    // Update em background: nunca bloqueia a abertura da janela, e
    // qualquer falha morre aqui dentro sem afetar o app. Quem exibe o
    // resultado é o rodapé da home (home.js).
    home.webContents.once("did-finish-load", () => {
      verificarAtualizacao(app, log)
        .then((r) => home.webContents.send("update:estado", r))
        .catch((e) => log(`updater falhou: ${e.message}`));
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) abrirHome();
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
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.webContents.getURL().startsWith(ORIGEM)) win.webContents.reload();
    }
  }
  return ok;
});

/* Abre um item do portal a partir da CHAVE enviada pela homepage.

   Tudo que não estiver nas allowlists do topo do arquivo é recusado —
   é aqui que a promessa "o conteúdo web não escolhe o que abrir" se
   cumpre. O retorno é sempre {ok, motivo?}: a home mostra o motivo ao
   usuário em vez de simplesmente não reagir ao clique. */
ipcMain.handle("app:abrir", async (_e, tipo, alvo) => {
  if (tipo === "janela" && Object.hasOwn(ROTAS, alvo)) {
    focarOuCriar(`janela:${alvo}`, () => criarJanelaApp(ROTAS[alvo]));
    return { ok: true };
  }

  if (tipo === "site" && Object.hasOwn(SITES, alvo)) {
    const url = SITES[alvo];
    if (url.includes("PREENCHER")) {
      return { ok: false, motivo: "endereço do site ainda não configurado" };
    }
    focarOuCriar(`site:${alvo}`, () => criarJanelaSite(url, "Site"));
    return { ok: true };
  }

  if (tipo === "pdf" && Object.hasOwn(DOCUMENTOS, alvo)) {
    // O caminho vem da allowlist, mas o join é normalizado e conferido
    // contra a raiz do mesmo jeito que no protocolo app:// — defesa em
    // profundidade contra uma entrada mal escrita no catálogo.
    const raiz = webRoot(app);
    const arquivo = path.normalize(path.join(raiz, DOCUMENTOS[alvo]));
    if (!arquivo.startsWith(raiz)) return { ok: false, motivo: "caminho inválido" };
    if (!fs.existsSync(arquivo)) {
      log(`documento ausente: ${arquivo}`);
      return { ok: false, motivo: "documento não encontrado nesta versão do app" };
    }
    // openPath devolve string vazia em caso de sucesso.
    const erro = await shell.openPath(arquivo);
    return erro ? { ok: false, motivo: erro } : { ok: true };
  }

  log(`app:abrir recusado — tipo=${tipo} alvo=${alvo}`);
  return { ok: false, motivo: "item desconhecido" };
});
