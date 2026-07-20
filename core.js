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
  // A coluna fixa (#fixed-actions) agora contém as PRÓPRIAS abas +
  // Limpar, e fica sempre visível — o Limpar também zera a aba
  // ambiental (limparAmbiental), então vale nas duas abas.
  // Hook da aba ambiental (map.js): inicializa/redimensiona o Leaflet e
  // sincroniza o pino com as coordenadas digitadas no simulador.
  if (id === "ambiental" && typeof onAbaAmbiental === "function")
    onAbaAmbiental();
}
document.addEventListener("DOMContentLoaded", () => {
  $$(".aba-btn").forEach((b) =>
    b.addEventListener("click", () => ativarAba(b.dataset.aba)),
  );
  _initTema();
});

/* ===== Tema claro/escuro =====
   O tema efetivo é: data-theme no <html> (escolha explícita, salva em
   localStorage pelo boot script do index.html) OU a preferência do SO.
   O botão #btnTheme alterna e persiste; após alternar, o gráfico é
   re-plotado (via calcular()) para adotar as cores do novo tema. */
function _temaAtivo() {
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function _initTema() {
  const btn = $("#btnTheme");
  if (!btn) return;
  const atualizarIcone = () => {
    btn.textContent = _temaAtivo() === "dark" ? "☀️" : "🌙";
    btn.title =
      _temaAtivo() === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
  };
  atualizarIcone();
  btn.addEventListener("click", () => {
    const novo = _temaAtivo() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch (e) {}
    atualizarIcone();
    // Re-plota a curva com as cores do novo tema (se o gate permite)
    if (
      typeof podeCalcular === "function" &&
      podeCalcular() &&
      typeof calcular === "function"
    )
      calcular();
  });
  // Se o SO mudar de tema e o usuário não tiver escolha explícita,
  // só o ícone precisa acompanhar (o CSS já reage sozinho).
  if (window.matchMedia)
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", atualizarIcone);
}
