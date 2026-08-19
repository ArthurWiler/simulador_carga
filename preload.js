/* ============================================================
   Ponte renderer ↔ main. Superfície deliberadamente mínima: o
   conteúdo web (que a partir da Fase 2 é baixado do GitHub) só
   enxerga estas funções — nunca ipcRenderer cru, nunca require,
   nunca a string de conexão do banco.

   No navegador comum window.api não existe, e o index.html trata
   isso como "modo manual". É o que mantém o repositório sendo um
   app web que funciona sozinho.
   ============================================================ */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Dados do transformador no SQL Server. Precisa do município porque o
  // mesmo número de transformador existe em municípios diferentes.
  // null = não achou, banco fora, ou fora da rede interna — a UI não
  // distingue os casos de propósito.
  buscarTrafo: (codigo, municipio) =>
    ipcRenderer.invoke("trafo:buscar", codigo, municipio),
  statusDb: () => ipcRenderer.invoke("db:status"),
  versao: () => ipcRenderer.invoke("app:versao"),

  // Atualização do conteúdo web
  aplicarAtualizacao: () => ipcRenderer.invoke("update:aplicar"),
  aoAtualizar: (cb) =>
    ipcRenderer.on("update:estado", (_e, estado) => cb(estado)),
});
