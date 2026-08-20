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
   A Clipboard API exige contexto seguro; app://local é registrado como
   secure (main.js) e o Live Server serve por http://localhost, que
   também conta. O fallback cobre o resto. */
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

/* Destaca os valores de exemplo — (*762113:7989433*) e afins — para que
   ninguém envie a coordenada de outro cliente. */
function _txCorpoHTML(corpo) {
  return _txEsc(corpo).replace(
    /\(\*(.+?)\*\)/g,
    '<mark class="tx-ph">($1)</mark>',
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
      return void _txCopiar(t.corpo, e.target.closest(".tx-copiar"));

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

document.addEventListener("DOMContentLoaded", () => {
  const aviso = document.getElementById("txAviso");
  if (aviso)
    aviso.innerHTML = alertHTML(
      "warn",
      "Confira os dados específicos antes de enviar — coordenada, nome da " +
        "unidade de conservação e documentos exigidos variam por caso. Os " +
        "valores de exemplo aparecem <mark class=\"tx-ph\">destacados</mark>.",
    );

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
