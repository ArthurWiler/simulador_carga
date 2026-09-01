/* ============================================================
   Sidebar do Portal PE — a navegação do site.

   Gerada a partir de um CATÁLOGO declarativo (ITENS abaixo):
   acrescentar uma ferramenta, uma norma ou um atalho é
   acrescentar um objeto ali — o resto se vira sozinho.

   Dois comportamentos, decididos por qual campo o item tem:

   - `aba`  → é uma FERRAMENTA. Vira <button class="aba-btn"
     data-aba="…">, que é exatamente o que ativarAba() do core.js
     já consome: a troca de painel acontece dentro deste mesmo
     documento, sem recarregar nada.
   - `href` → é uma NORMA ou um ATALHO. Vira uma âncora com
     target="_blank" e sai para uma aba nova do navegador.

   Nenhum item tem os dois: é um ou outro, e é isso que decide se
   ele troca de painel ou navega para fora.
   ============================================================ */

const ITENS = [
  /* ---- Ferramentas: trocam o painel aqui mesmo ---- */
  {
    grupo: "Ferramentas",
    titulo: "Simulação de Carga",
    icone: "⚡",
    aba: "simulador",
    dica: "Dimensionamento de transformador, disjuntores e queda de tensão.",
  },
  {
    grupo: "Ferramentas",
    titulo: "Análise Ambiental",
    icone: "🌿",
    aba: "ambiental",
    dica: "Restrições da obra por coordenada — Sisema, SICAR e AgroTag.",
  },
  {
    grupo: "Ferramentas",
    titulo: "Textos Padrão",
    icone: "📝",
    aba: "textos",
    dica: "Indeferimento e pendência: busca e cópia com um clique.",
  },

  /* ---- Normas: PDF em docs/, aberto no visualizador do navegador.
     Para acrescentar uma ND: ponha o PDF em docs/ e copie um bloco. ---- */
  {
    grupo: "Normas de Distribuição",
    titulo: "ND-5.1",
    icone: "📄",
    href: "docs/ND-5.1.pdf",
    dica: "Tensão secundária, rede aérea — edificações individuais. Rev. MAR/2026.",
  },
  {
    grupo: "Normas de Distribuição",
    titulo: "ND-5.2",
    icone: "📄",
    href: "docs/ND-5.2.pdf",
    dica: "Tensão secundária, rede aérea — edificações coletivas. Rev. MAR/2026.",
  },

  /* ---- Atalhos: sistemas externos ---- */
  {
    grupo: "Atalhos",
    titulo: "Distribuição de notas",
    icone: "📊",
    href: "https://carga-ad8b9.firebaseapp.com/",
    dica: "Distribuição de notas para técnicos, painel e prazos.",
  },
  {
    grupo: "Atalhos",
    titulo: "CEMIG ON — Produção",
    icone: "🟢",
    href: "https://cemig-on-prod.cemig.com.br/",
    dica: "Ambiente de produção.",
  },
  {
    grupo: "Atalhos",
    titulo: "CEMIG ON — QA",
    icone: "🟡",
    href: "https://cemig-on-qa.cemig.com.br/",
    dica: "Ambiente de homologação.",
  },
  {
    grupo: "Atalhos",
    titulo: "CEMIG ON — Dev",
    icone: "🔵",
    href: "https://cemig-on-dev.cemig.com.br/",
    dica: "Ambiente de desenvolvimento.",
  },
];

/* ===== util ===== */
function _esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===== Render =====
   O botão de ferramenta nasce sem .on: quem marca o ativo é o
   ativarAba() do core.js, chamado logo após desenhar. */
function _itemHTML(item) {
  const icone = `<span class="sb-icone" aria-hidden="true">${_esc(item.icone || "▸")}</span>`;
  const rotulo = `<span class="sb-rotulo">${_esc(item.titulo)}</span>`;
  const dica = item.dica ? ` title="${_esc(item.dica)}"` : "";

  if (item.aba) {
    return `<button type="button" class="sb-item aba-btn" data-aba="${_esc(item.aba)}"${dica}>${icone}${rotulo}</button>`;
  }
  return `<a class="sb-item sb-externo" href="${_esc(item.href)}" target="_blank" rel="noopener"${dica}>${icone}${rotulo}<span class="sb-seta" aria-hidden="true">↗</span></a>`;
}

function renderizarSidebar() {
  const alvo = document.getElementById("sidebarConteudo");
  if (!alvo) return;

  // Map preserva a ordem de inserção: os grupos saem na ordem em que
  // aparecem no catálogo, sem precisar de índice.
  const grupos = new Map();
  for (const item of ITENS) {
    if (!grupos.has(item.grupo)) grupos.set(item.grupo, []);
    grupos.get(item.grupo).push(item);
  }

  const html = [];
  for (const [titulo, itens] of grupos) {
    html.push(`<nav class="sb-grupo" aria-label="${_esc(titulo)}">
      <h2 class="sb-grupo-titulo">${_esc(titulo)}</h2>
      ${itens.map(_itemHTML).join("")}
    </nav>`);
  }
  alvo.innerHTML = html.join("");

  // Os botões são .aba-btn, mas o listener que o core.js instala roda no
  // DOMContentLoaded — antes destes botões existirem. Ligamos aqui.
  alvo
    .querySelectorAll(".aba-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => ativarAba(btn.dataset.aba)),
    );
}

/* A sidebar é desenhada depois do core.js, que já resolveu qual painel
   nasce ativo (o ?aba= da URL, ou o primeiro). Reaplicamos essa aba para
   que o botão recém-criado receba o .on — sem isto a sidebar abriria com
   um painel visível e nenhum item marcado. */
document.addEventListener("DOMContentLoaded", () => {
  renderizarSidebar();
  const painel = document.querySelector(".aba-painel.show");
  if (painel && typeof ativarAba === "function")
    ativarAba(painel.id.replace(/^aba-/, ""));
});
