/* ============================================================
   Núcleo compartilhado do Simulador de Carga — utilidades DOM,
   navegação por abas e banners de aviso. Adaptado do núcleo dos
   formulários vanilla da CEMIG BT (o restante daquele core —
   estado/binding, proprietário PF/CNPJ, CEP, correspondência e
   formulário de cargas — não se aplica a este projeto).
   As abas são declaradas no HTML: botões .aba-btn[data-aba="X"]
   e painéis .aba-painel#aba-X; o painel ativo recebe .show.
   ============================================================ */

/* ===== util ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ===== Banner de aviso (mesmo markup do BT/MT) =====
   tipo "warn" = alerta amarelo (restrição encontrada);
   qualquer outro valor = banner informativo/ok (verde). */
function alertHTML(tipo, html) {
  const cls = tipo === "warn" ? "cmg-aviso cmg-aviso--warn" : "cmg-aviso";
  return `<div class="${cls}"><div class="cmg-aviso-icon" aria-hidden="true"></div><p class="cmg-aviso-texto">${html}</p></div>`;
}

/* ===== Navegação por abas ===== */
function ativarAba(id) {
  $$(".aba-btn").forEach((b) =>
    b.classList.toggle("on", b.dataset.aba === id),
  );
  $$(".aba-painel").forEach((p) =>
    p.classList.toggle("show", p.id === "aba-" + id),
  );
  // Os botões fixos Calcular/Limpar pertencem ao simulador.
  const acoes = $("#fixed-actions");
  if (acoes) acoes.style.display = id === "simulador" ? "" : "none";
  // Hook da aba ambiental (map.js): inicializa/redimensiona o Leaflet e
  // sincroniza o pino com as coordenadas digitadas no simulador.
  if (id === "ambiental" && typeof onAbaAmbiental === "function")
    onAbaAmbiental();
}
document.addEventListener("DOMContentLoaded", () => {
  $$(".aba-btn").forEach((b) =>
    b.addEventListener("click", () => ativarAba(b.dataset.aba)),
  );
});
