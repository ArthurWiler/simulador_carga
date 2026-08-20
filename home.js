/* ============================================================
   Homepage do Simulador de Carga — o portal do aplicativo.

   A página é gerada a partir de um CATÁLOGO declarativo (ITENS
   abaixo): acrescentar uma ferramenta, uma norma ou um link é
   acrescentar um objeto ali — o layout se vira sozinho.

   Nada aqui decide O QUE abrir. O clique envia ao processo main
   apenas a CHAVE do item (tipo + alvo); quem traduz chave ->
   janela/arquivo/URL são as allowlists ROTAS, DOCUMENTOS e SITES
   do main.js. Isso existe porque este arquivo é baixado da
   internet pelo updater: se um dia ele for adulterado, o estrago
   possível continua limitado ao que a casca já autoriza.

   Sem window.api (aberto no navegador, via Live Server) a página
   cai no campo `href` de cada item — mesma degradação que o
   index.html faz no "modo manual". Ver preload.js.
   ============================================================ */

/* ===== Catálogo =====
   grupo    : título da seção. Sem grupo = card em destaque no topo.
   tipo/alvo: a chave enviada ao main. tipo ∈ janela | pdf | site.
   href     : caminho equivalente, usado SÓ no modo navegador. O item
              do tipo "site" não tem href de propósito — a URL mora
              apenas no main.js, para não haver duas fontes da verdade. */
const ITENS = [
  {
    titulo: "Simulação de Carga",
    desc: "Dimensionamento de transformador, disjuntores e queda de tensão.",
    icone: "⚡",
    tipo: "janela",
    alvo: "simulador",
    href: "index.html?aba=simulador",
  },
  {
    titulo: "Análise Ambiental",
    desc: "Restrições da obra por coordenada — Sisema, SICAR e AgroTag.",
    icone: "🌿",
    tipo: "janela",
    alvo: "ambiental",
    href: "index.html?aba=ambiental",
  },
  {
    titulo: "Textos Padrão",
    desc: "Indeferimento e pendência: busca e cópia com um clique.",
    icone: "📝",
    tipo: "janela",
    alvo: "textos",
    href: "textos.html",
  },

  /* ---- Normas de Distribuição ----
     Para acrescentar uma ND: coloque o PDF em docs/, registre o caminho
     em DOCUMENTOS (main.js), copie um dos blocos abaixo e rode
     `npm run manifest`. Ver docs/README.md. */
  {
    grupo: "Normas de Distribuição",
    titulo: "ND-5.1",
    desc: "Fornecimento em tensão secundária — rede aérea, edificações individuais. Rev. MAR/2026.",
    icone: "📄",
    tipo: "pdf",
    alvo: "nd-5-1",
    href: "docs/ND-5.1.pdf",
  },
  {
    grupo: "Normas de Distribuição",
    titulo: "ND-5.2",
    desc: "Fornecimento em tensão secundária — rede aérea, edificações coletivas. Rev. MAR/2026.",
    icone: "📄",
    tipo: "pdf",
    alvo: "nd-5-2",
    href: "docs/ND-5.2.pdf",
  },

  {
    grupo: "Ferramentas",
    titulo: "Gerenciamento de Produção",
    desc: "Distribuição de notas para técnicos, painel e prazos. Requer login e internet.",
    icone: "📊",
    tipo: "site",
    alvo: "principal",
  },
];

/* ===== util ===== */
function _esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Faixa de mensagem no topo do conteúdo. Reaproveita alertHTML() do
   core.js — mesmo banner .cmg-aviso usado no simulador e na ambiental. */
function _aviso(tipo, html) {
  const el = document.getElementById("homeAviso");
  if (el) el.innerHTML = tipo ? alertHTML(tipo, html) : "";
}

/* ===== Abertura de um item ===== */
async function abrirItem(item) {
  if (window.api && window.api.abrir) {
    let r;
    try {
      r = await window.api.abrir(item.tipo, item.alvo);
    } catch (e) {
      r = { ok: false, motivo: e.message };
    }
    if (r && r.ok) return _aviso(null);
    // Falhar em silêncio aqui seria pior que o normal: o usuário clicou e
    // a tela não mudou. Ele precisa saber por quê.
    return _aviso(
      "warn",
      `Não foi possível abrir <strong>${_esc(item.titulo)}</strong>: ` +
        `${_esc((r && r.motivo) || "erro desconhecido")}.`,
    );
  }

  // Modo navegador: sem ponte com o main.
  if (item.href) return void window.open(item.href, "_blank", "noopener");
  _aviso(
    "warn",
    `<strong>${_esc(item.titulo)}</strong> só abre pelo aplicativo.`,
  );
}

/* ===== Render ===== */
function _cardHTML(item, indice) {
  return `<button type="button" class="home-card" data-item="${indice}">
      <span class="home-card-icone" aria-hidden="true">${_esc(item.icone || "▸")}</span>
      <span class="home-card-titulo">${_esc(item.titulo)}</span>
      <span class="home-card-desc">${_esc(item.desc || "")}</span>
    </button>`;
}

/* Itens sem `grupo` viram a faixa de destaque do topo; o resto é
   agrupado na ordem em que aparece no catálogo (Map preserva inserção).
   Grupo sem item não gera seção vazia. */
function renderizar() {
  const alvo = document.getElementById("homeConteudo");
  if (!alvo) return;

  const destaque = [];
  const grupos = new Map();
  ITENS.forEach((item, i) => {
    if (!item.grupo) return void destaque.push(i);
    if (!grupos.has(item.grupo)) grupos.set(item.grupo, []);
    grupos.get(item.grupo).push(i);
  });

  const secao = (titulo, indices, extra = "") =>
    `<section class="home-secao">
      ${titulo ? `<h2>${_esc(titulo)}</h2>` : ""}
      <div class="home-grid${extra}">
        ${indices.map((i) => _cardHTML(ITENS[i], i)).join("")}
      </div>
    </section>`;

  const html = [];
  if (destaque.length) html.push(secao(null, destaque, " home-grid--destaque"));
  for (const [titulo, indices] of grupos) html.push(secao(titulo, indices));
  alvo.innerHTML = html.join("");

  alvo.querySelectorAll(".home-card").forEach((btn) =>
    btn.addEventListener("click", () => abrirItem(ITENS[+btn.dataset.item])),
  );
}

/* ===== Rodapé: versão e status da atualização =====
   window.api.versao() e aoAtualizar() já eram expostos pelo preload e
   não tinham consumidor — o update:estado enviado pelo main caía no
   vazio. É aqui que ele vira informação visível. */
function _rodape() {
  const el = document.getElementById("homeVersao");
  if (!el) return;

  if (!window.api || !window.api.versao) {
    el.textContent = "modo navegador";
    return;
  }

  window.api
    .versao()
    .then((v) => {
      el.textContent = `Aplicativo v${v.app} · conteúdo v${v.conteudo || "?"}`;
    })
    .catch(() => {
      el.textContent = "";
    });

  if (!window.api.aoAtualizar) return;
  window.api.aoAtualizar((estado) => {
    if (!estado || estado.status !== "pronta") return;
    _aviso(
      "ok",
      `Atualização <strong>v${_esc(estado.versao)}</strong> baixada — ` +
        `será aplicada quando você reabrir o aplicativo.`,
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizar();
  _rodape();
});
