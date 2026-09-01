/* ============================================================
   Textos padrão de indeferimento e pendência — interface.

   Lista, busca e cópia dos textos declarados em textos-dados.js
   (TEXTOS_PADRAO). O ponto da tela é UM: achar o texto certo e
   levá-lo para a área de transferência com um clique — por isso
   o botão Copiar fica na linha do título, sem exigir abrir o
   texto antes.

   Página puramente local: não fala com o processo main nem com a
   rede. Funciona igual no aplicativo e no navegador.
   ============================================================ */

const _txEsc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Normaliza para busca: sem acento e em minúsculas, para que
   "unidade de conservacao" ache "Unidade de Conservação". */
const _txNorm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    // ̀-ͯ = marcas diacríticas combinantes, escritas por código
    // de propósito: literais aqui somem em qualquer conversão de encoding.
    .replace(/[\u0300-\u036f]/g, "");

/* Índice de busca pré-calculado — a lista inteira é refiltrada a cada
   tecla, e normalizar 40 corpos a cada vez é desperdício. */
const _txIndice = TEXTOS_PADRAO.map((t) =>
  _txNorm(`${t.titulo} ${t.grupo} ${t.sub} ${t.corpo}`),
);
const _txIndiceTitulo = TEXTOS_PADRAO.map((t) => _txNorm(t.titulo));

/* ===== Cópia =====
   A Clipboard API exige contexto seguro: https conta, e http://localhost
   também — que cobre o GitHub Pages e o Live Server. O fallback cobre o
   resto. */
function _txCopiarFallback(texto) {
  const ta = document.createElement("textarea");
  ta.value = texto;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

async function _txCopiar(texto, btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(texto);
    ok = true;
  } catch (e) {
    ok = _txCopiarFallback(texto);
  }

  // Confirmação no próprio botão: sem ela o clique não tem retorno
  // nenhum e o atendente copia duas vezes na dúvida.
  const rotulo = btn.dataset.rotulo || btn.textContent;
  btn.dataset.rotulo = rotulo;
  btn.textContent = ok ? "Copiado!" : "Falhou";
  btn.classList.toggle("tx-copiado", ok);
  btn.classList.toggle("tx-falhou", !ok);
  clearTimeout(btn._t);
  btn._t = setTimeout(() => {
    btn.textContent = rotulo;
    btn.classList.remove("tx-copiado", "tx-falhou");
  }, 1600);
}

/* ===== Render ===== */

/* ===== Dados da Análise Ambiental =====
   Os textos ambientais trazem {coord} e {unidade}. Havendo uma análise
   feita nesta sessão, saem preenchidos com a coordenada consultada e o
   nome da unidade de conservação encontrada; sem análise, viram um
   destaque amarelo, e o atendente vê exatamente o que falta preencher.

   A fonte é ambientalUltimo() (map.js). Se ele não existir — ordem de
   scripts diferente, ou esta ferramenta embutida sozinha em outra
   página — tudo cai no destaque, que é a degradação certa. */
const _TX_ROTULO = { coord: "coordenada", unidade: "unidade de conservação" };

function _txDados() {
  if (typeof ambientalUltimo !== "function") return {};
  try {
    return ambientalUltimo() || {};
  } catch (e) {
    return {};
  }
}

/* Troca os placeholders pelo dado real; o que não tem dado permanece como
   {chave}. Quem o vira destaque é _txCorpoHTML, DEPOIS do escape — aqui
   não pode entrar HTML, porque esta mesma função alimenta o Copiar e a
   área de transferência recebe texto puro. É o que garante que o que se
   vê e o que se cola sejam a mesma coisa. */
function _txInterp(corpo) {
  const d = _txDados();
  return String(corpo).replace(/\{(coord|unidade)\}/g, (m, k) => d[k] || m);
}

/* Versão para a área de transferência: o que ficou sem dado vira
   "(coordenada)" em vez de "{coord}". O atendente cola isto num e-mail
   oficial — um marcador em linguagem natural é visto e corrigido; uma
   chave de template passa despercebida. */
function _txParaCopiar(corpo) {
  return _txInterp(corpo).replace(
    /{(coord|unidade)}/g,
    (m, k) => "(" + _TX_ROTULO[k] + ")",
  );
}

/* Destaca o que precisa de conferência: os valores de exemplo no formato
   (*762113:7989433*) e os placeholders que ficaram sem dado. */
function _txCorpoHTML(corpo) {
  return _txEsc(_txInterp(corpo))
    .replace(/\(\*(.+?)\*\)/g, '<mark class="tx-ph">($1)</mark>')
    .replace(
      /\{(coord|unidade)\}/g,
      (m, k) => '<mark class="tx-ph">' + _TX_ROTULO[k] + '</mark>',
    );
}

function _txItemHTML(t, i) {
  return `<article class="tx-item" data-i="${i}">
      <div class="tx-cab">
        <button type="button" class="tx-toggle" aria-expanded="false"
                aria-controls="tx-corpo-${i}">${_txEsc(t.titulo)}</button>
        <button type="button" class="tx-copiar secondary">Copiar</button>
      </div>
      <div class="tx-corpo" id="tx-corpo-${i}" hidden>${_txCorpoHTML(t.corpo)}</div>
    </article>`;
}

/* Monta grupo > subgrupo > itens preservando a ordem do catálogo. */
function _txRenderizar() {
  const alvo = document.getElementById("txLista");
  if (!alvo) return;

  const grupos = new Map();
  TEXTOS_PADRAO.forEach((t, i) => {
    if (!grupos.has(t.grupo)) grupos.set(t.grupo, new Map());
    const subs = grupos.get(t.grupo);
    if (!subs.has(t.sub)) subs.set(t.sub, []);
    subs.get(t.sub).push(i);
  });

  const html = [];
  for (const [grupo, subs] of grupos) {
    const partes = [];
    for (const [sub, indices] of subs) {
      partes.push(
        `<div class="tx-sub" data-sub="${_txEsc(sub)}">
          ${sub ? `<h3>${_txEsc(sub)}</h3>` : ""}
          ${indices.map((i) => _txItemHTML(TEXTOS_PADRAO[i], i)).join("")}
        </div>`,
      );
    }
    html.push(
      `<section class="tx-grupo">
        <h2>${_txEsc(grupo)}</h2>
        ${partes.join("")}
      </section>`,
    );
  }
  alvo.innerHTML = html.join("");

  alvo.addEventListener("click", (e) => {
    const item = e.target.closest(".tx-item");
    if (!item) return;
    const t = TEXTOS_PADRAO[+item.dataset.i];

    if (e.target.closest(".tx-copiar"))
      return void _txCopiar(_txParaCopiar(t.corpo), e.target.closest(".tx-copiar"));

    if (e.target.closest(".tx-toggle")) _txAlternar(item);
  });
}

function _txAlternar(item, forcar) {
  const btn = item.querySelector(".tx-toggle");
  const corpo = item.querySelector(".tx-corpo");
  const abrir = forcar === undefined ? corpo.hidden : forcar;
  corpo.hidden = !abrir;
  btn.setAttribute("aria-expanded", String(abrir));
}

/* ===== Busca =====
   Item cujo corpo casa mas o título não abre sozinho: sem isso o
   resultado apareceria sem mostrar POR QUE casou. */
function _txFiltrar(termo) {
  const q = _txNorm(termo.trim());
  const lista = document.getElementById("txLista");
  let visiveis = 0;

  lista.querySelectorAll(".tx-item").forEach((item) => {
    const i = +item.dataset.i;
    const casa = !q || _txIndice[i].includes(q);
    item.hidden = !casa;
    if (!casa) return;
    visiveis++;
    // Casou pelo corpo mas não pelo título: abre, senão o resultado
    // apareceria sem mostrar POR QUE casou. Todo o resto fecha —
    // inclusive ao limpar a busca, que volta a lista ao estado inicial.
    _txAlternar(item, Boolean(q) && !_txIndiceTitulo[i].includes(q));
  });

  // Some com subgrupo/grupo que ficaram sem nenhum item visível.
  lista.querySelectorAll(".tx-sub").forEach((sub) => {
    sub.hidden = !sub.querySelector(".tx-item:not([hidden])");
  });
  lista.querySelectorAll(".tx-grupo").forEach((g) => {
    g.hidden = !g.querySelector(".tx-item:not([hidden])");
  });

  const cont = document.getElementById("txContagem");
  if (cont) {
    cont.textContent = q
      ? `${visiveis} de ${TEXTOS_PADRAO.length}`
      : `${TEXTOS_PADRAO.length} textos`;
    cont.classList.toggle("tx-vazio", q && visiveis === 0);
  }
}

/* Chamado pelo ativarAba() do core.js ao entrar nos Textos Padrão. A
   análise ambiental pode ter rodado desde a última visita, então os
   {coord}/{unidade} são reinterpolados — mas só quando o dado mudou de
   verdade: re-renderizar à toa fecharia os textos que o atendente
   deixou abertos. A busca digitada é preservada. */
let _txCtx = null;

function onAbaTextos() {
  const d = _txDados();
  const ctx = (d.coord || "") + "|" + (d.unidade || "");
  if (ctx === _txCtx) return;
  _txCtx = ctx;
  const busca = document.getElementById("txBusca");
  _txRenderizar();
  _txFiltrar(busca ? busca.value : "");
}

document.addEventListener("DOMContentLoaded", () => {
  const aviso = document.getElementById("txAviso");
  if (aviso)
    aviso.innerHTML = alertHTML(
      "warn",
      "Confira os dados específicos antes de enviar — os documentos exigidos " +
        "variam por caso. O que aparece <mark class=\"tx-ph\">destacado</mark> " +
        "precisa ser preenchido; a coordenada e a unidade de conservação entram " +
        "sozinhas depois que você usa a <strong>Análise Ambiental</strong>.",
    );

  const d0 = _txDados();
  _txCtx = (d0.coord || "") + "|" + (d0.unidade || "");
  _txRenderizar();
  _txFiltrar("");

  const busca = document.getElementById("txBusca");
  if (busca) {
    busca.addEventListener("input", () => _txFiltrar(busca.value));
    // Esc limpa a busca sem tirar a mão do teclado.
    busca.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && busca.value) {
        busca.value = "";
        _txFiltrar("");
      }
    });
    busca.focus();
  }
});
