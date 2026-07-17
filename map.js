/* ============================================================
   Aba "Análise Ambiental" — mapa Leaflet + consulta de restrição
   ambiental (adaptado do módulo BT/MT da CEMIG para o Simulador
   de Carga). Fontes de coordenada (todas sincronizadas em duas
   vias com o pino): os campos amb_lat/amb_lon/amb_utm da própria
   aba e os campos lat_input/lon_input do card "Local de
   atendimento" (aba Simulador) — a análise de carga já tem sua
   implementação de coordenada (parseDMSCoordinate, validarLatLon,
   latLonToUTM) e ela é REUTILIZADA aqui; só a conversão inversa
   UTM → lat/long é definida neste arquivo. Digitar em qualquer
   campo move o pino e dispara a consulta (debounce, como no BT);
   clicar no mapa ou arrastar o pino preenche todos os campos
   (o que também atualiza UTM/distância de rede no simulador).
   Depende de: Leaflet (window.L), Turf (window.turf), geo.js
   (consultarRestricoesObra, desenharRestricoesNoMapa, …), core.js
   (alertHTML) e parseDMSCoordinate/validarLatLon do index.html.
   ============================================================ */
let mapaAmb = null;
let marcadorAmb = null;
let restricaoLayerAmb = null;
let carLayerAmb = null; // perímetro do imóvel CAR (SICAR), desenhado à parte
let _ambDebounce = null;
let _ambLastKey = "";

// Cor do contorno do imóvel CAR no mapa — verde institucional CEMIG, para
// distinguir do vermelho/amarelo das restrições ambientais. É informativo.
const COR_CAR = "#0f6c58";

// Evita consultar/mover o pino com coordenada pela metade (como no BT:
// só reage quando lat e lng têm ao menos 5 dígitos digitados).
const _ambNDig = (s) => (String(s || "").match(/\d/g) || []).length;

function _ambStatus(msg, erro) {
  const el = document.getElementById("ambStatus");
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("err", !!erro);
}

// Lê e valida um par de campos de coordenada (aceita decimal ou GMS, via
// parseDMSCoordinate da análise de carga). Retorna { lat, lng } ou null.
function _lerParCoordenada(idLat, idLon) {
  const latEl = document.getElementById(idLat);
  const lonEl = document.getElementById(idLon);
  if (!latEl || !lonEl) return null;
  const latRaw = latEl.value.trim();
  const lonRaw = lonEl.value.trim();
  if (!latRaw || !lonRaw) return null;
  if (_ambNDig(latRaw) < 5 || _ambNDig(lonRaw) < 5) return null;
  try {
    const lat = parseDMSCoordinate(latRaw);
    const lng = parseDMSCoordinate(lonRaw);
    validarLatLon(lat, lng);
    return { lat, lng };
  } catch (e) {
    return null;
  }
}
// Coordenada digitada no simulador (Local de atendimento).
const lerCoordenadaFormulario = () => _lerParCoordenada("lat_input", "lon_input");
// Coordenada digitada na própria aba ambiental.
const lerCoordenadaAmb = () => _lerParCoordenada("amb_lat", "amb_lon");

// Escreve num campo apenas se ele não está em edição — evita "roubar" o
// texto enquanto o usuário digita (a sincronização roda por debounce).
function _setValSeNaoFocado(id, v) {
  const el = document.getElementById(id);
  if (el && document.activeElement !== el) el.value = v;
}

// Espelha a coordenada nos campos da aba ambiental (lat/lon decimais + UTM
// no MESMO formato do utm_output do simulador, via latLonToUTM.label).
function _atualizarCamposAmb(lat, lng) {
  _setValSeNaoFocado("amb_lat", String(+lat.toFixed(6)));
  _setValSeNaoFocado("amb_lon", String(+lng.toFixed(6)));
  try {
    _setValSeNaoFocado("amb_utm", latLonToUTM(lat, lng).label);
  } catch (e) {}
}

// Espelha a coordenada nos campos do simulador e dispara os listeners de lá
// (UTM, distância de rede, recálculo). O dispatch também aciona o listener
// desta aba, mas a deduplicação por _ambLastKey evita consulta dupla.
function _espelharNoSimulador(lat, lng) {
  [
    ["lat_input", lat],
    ["lon_input", lng],
  ].forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
      el.value = String(v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

/* ===== UTM → lat/long (inversa da latLonToUTM do simulador) =====
   WGS-84, fórmulas de Snyder/USGS — mesmo elipsoide e k0 da conversão
   de ida da análise de carga. Hemisfério Sul assumido (MG). */
function utmParaLatLon(zona, easting, northing, sul) {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const x = easting - 500000;
  const y = sul ? northing - 10000000 : northing;
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 ** 3) / 256));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);
  const sin1 = Math.sin(phi1);
  const cos1 = Math.cos(phi1);
  const tan1 = Math.tan(phi1);
  const N1 = a / Math.sqrt(1 - e2 * sin1 * sin1);
  const T1 = tan1 * tan1;
  const C1 = ep2 * cos1 * cos1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sin1 * sin1, 1.5);
  const D = x / (N1 * k0);
  const lat =
    phi1 -
    ((N1 * tan1) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) *
          D ** 6) /
          720);
  const lon0 = (((zona - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const lon =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * D ** 3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) *
        D ** 5) /
        120) /
      cos1;
  return { lat: (lat * 180) / Math.PI, lng: (lon * 180) / Math.PI };
}

// Interpreta a string de UTM do campo amb_utm. Aceita "23K 611111 7795555",
// "23S E:611111 N:7795555", "23 611111:7795555" etc. A letra de banda é
// ignorada: assume-se hemisfério Sul (área de concessão em MG) — mesmo "S"
// que a latLonToUTM do simulador usa no rótulo. Retorna { lat, lng } | null.
function utmStringParaLatLon(str) {
  const m = String(str == null ? "" : str)
    .trim()
    .match(
      /^(\d{1,2})\s*([a-z])?\s*[,;]?\s*E?\s*:?\s*(\d{5,7}(?:[.,]\d+)?)[\s,;:]+N?\s*:?\s*(\d{6,8}(?:[.,]\d+)?)\s*$/i,
    );
  if (!m) return null;
  const zona = parseInt(m[1]);
  if (zona < 1 || zona > 60) return null;
  const easting = parseFloat(m[3].replace(",", "."));
  const northing = parseFloat(m[4].replace(",", "."));
  const c = utmParaLatLon(zona, easting, northing, true);
  try {
    validarLatLon(c.lat, c.lng);
  } catch (e) {
    return null;
  }
  return c;
}

function initMapaAmbiental() {
  const div = document.getElementById("mapAmbiental");
  if (!div || !window.L || mapaAmb) return;
  // Enquadramento inicial: Minas Gerais inteira.
  mapaAmb = window.L.map(div).setView([-18.5, -44.6], 6);
  // Camadas base alternáveis: Satélite (Esri World Imagery — mesma fonte
  // usada pelo Sisema; sem subdomínio {s} e eixos {z}/{y}/{x}) e Ruas (OSM).
  const ruas = window.L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19, attribution: "© OpenStreetMap" },
  );
  const satelite = window.L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution:
        "Tiles © Esri — Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
  );
  satelite.addTo(mapaAmb);
  window.L.control
    .layers({ Satélite: satelite, Ruas: ruas })
    .addTo(mapaAmb);
  mapaAmb.on("click", (e) => aplicarCoordDoMapa(e.latlng.lat, e.latlng.lng));
  setTimeout(() => mapaAmb.invalidateSize(), 200);
}

// Chamado pelo core.js (ativarAba) ao abrir a aba: cria o mapa na primeira
// visita, corrige o tamanho (o Leaflet mede errado em container oculto) e
// sincroniza com a coordenada já digitada no simulador.
function onAbaAmbiental() {
  initMapaAmbiental();
  if (mapaAmb) setTimeout(() => mapaAmb.invalidateSize(), 150);
  sincronizarAmbientalDoFormulario();
}

// Clique no mapa / arrasto do pino → escreve nos campos da aba e do
// simulador e consulta. Mantém a funcionalidade original do pino.
function aplicarCoordDoMapa(lat, lng) {
  lat = +lat.toFixed(6);
  lng = +lng.toFixed(6);
  _atualizarCamposAmb(lat, lng);
  _espelharNoSimulador(lat, lng);
  moverMarcadorAmb(lat, lng);
  consultarAmbiental(lat, lng);
}

// Lat/long digitados na aba ambiental → normaliza o UTM, espelha no
// simulador, move o pino e consulta.
function aplicarCoordDosCamposAmb() {
  const c = lerCoordenadaAmb();
  if (!c) return;
  try {
    _setValSeNaoFocado("amb_utm", latLonToUTM(c.lat, c.lng).label);
  } catch (e) {}
  _espelharNoSimulador(c.lat, c.lng);
  moverMarcadorAmb(c.lat, c.lng);
  consultarAmbiental(c.lat, c.lng);
}

// UTM digitado na aba ambiental → converte, preenche lat/long (da aba e do
// simulador), move o pino e consulta.
function aplicarCoordDoUtmAmb() {
  const el = document.getElementById("amb_utm");
  const c = el && utmStringParaLatLon(el.value);
  if (!c) return;
  const lat = +c.lat.toFixed(6);
  const lng = +c.lng.toFixed(6);
  _setValSeNaoFocado("amb_lat", String(lat));
  _setValSeNaoFocado("amb_lon", String(lng));
  _espelharNoSimulador(lat, lng);
  moverMarcadorAmb(lat, lng);
  consultarAmbiental(lat, lng);
}

function moverMarcadorAmb(lat, lng) {
  if (!mapaAmb) return;
  const ll = window.L.latLng(lat, lng);
  if (marcadorAmb) {
    marcadorAmb.setLatLng([lat, lng]);
    if (!mapaAmb.getBounds().contains(ll))
      mapaAmb.setView(ll, Math.max(mapaAmb.getZoom(), 17));
  } else {
    marcadorAmb = window.L.marker([lat, lng], { draggable: true }).addTo(
      mapaAmb,
    );
    marcadorAmb.on("dragend", (e) => {
      const p = e.target.getLatLng();
      aplicarCoordDoMapa(p.lat, p.lng);
    });
    // Primeira aparição do pino: centraliza no zoom máximo dos tiles.
    const zMax = Number.isFinite(mapaAmb.getMaxZoom())
      ? mapaAmb.getMaxZoom()
      : 19;
    mapaAmb.setView(ll, zMax);
  }
  setTimeout(() => mapaAmb.invalidateSize(), 100);
}

// Coordenada digitada no simulador → campos da aba + pino + consulta (se o
// mapa já existe; antes da primeira visita, o onAbaAmbiental sincroniza).
function sincronizarAmbientalDoFormulario() {
  if (!mapaAmb) return;
  const c = lerCoordenadaFormulario();
  if (!c) return;
  _atualizarCamposAmb(c.lat, c.lng);
  moverMarcadorAmb(c.lat, c.lng);
  consultarAmbiental(c.lat, c.lng);
}

function _limparCamadasAmb() {
  if (mapaAmb && restricaoLayerAmb) mapaAmb.removeLayer(restricaoLayerAmb);
  restricaoLayerAmb = null;
  if (mapaAmb && carLayerAmb) mapaAmb.removeLayer(carLayerAmb);
  carLayerAmb = null;
  // Some com a legenda junto do contorno (desenharRestricoesNoMapa recria).
  if (mapaAmb && typeof atualizarLegendaRestricoes === "function")
    atualizarLegendaRestricoes(mapaAmb, null);
}

// Desenha o perímetro do imóvel CAR (Feature GeoJSON de consultarImovelCAR).
// Contorno tracejado verde institucional, sem preenchimento, para não competir
// visualmente com as restrições. Popup com o nº do CAR/situação. Não reenquadra.
function desenharCARNoMapa(car) {
  if (!mapaAmb || !window.L || !car || !car.dentro || !car.feicao) return null;
  const f = car.feicao;
  if (!f.geometry) return null;
  return window.L.geoJSON(f, {
    style: {
      color: COR_CAR,
      weight: 2,
      opacity: 0.9,
      dashArray: "6 4",
      fill: false,
    },
    onEachFeature: (feat, lyr) => {
      const txt = car.nome ? "Imóvel CAR: " + car.nome : "Imóvel CAR";
      lyr.bindPopup(txt);
    },
  }).addTo(mapaAmb);
}

async function consultarAmbiental(lat, lng) {
  if (!mapaAmb) return;
  if (!window.turf || typeof consultarRestricoesObra !== "function") {
    _ambStatus(
      "Bibliotecas de consulta não carregadas (verifique a conexão).",
      true,
    );
    return;
  }
  const key = lat.toFixed(5) + "," + lng.toFixed(5);
  if (_ambLastKey === key) return;
  _ambLastKey = key;
  _ambStatus("Consultando restrições… (várias camadas, pode levar alguns segundos)");
  const box = document.getElementById("ambResultado");
  try {
    // Imóvel CAR (SICAR): consulta INFORMATIVA (fora do critério de restrição
    // ambiental). Consultada SEMPRE — todo ponto de MG pode cair em um imóvel
    // cadastrado; o resultado traz o nº do CAR/situação e o perímetro.
    const [res, car] = await Promise.all([
      consultarRestricoesObra(lat, lng),
      typeof consultarImovelCAR === "function"
        ? consultarImovelCAR(lat, lng)
        : Promise.resolve(null),
    ]);
    if (_ambLastKey !== key) return; // consulta mais nova em andamento
    const errosTodos = res.length > 0 && res.every((r) => r.erro);
    _limparCamadasAmb();
    if (errosTodos) {
      _ambLastKey = "";
      if (box) box.innerHTML = "";
      _ambStatus(
        "Não foi possível consultar a restrição ambiental (verifique conexão/camadas).",
        true,
      );
      return;
    }
    restricaoLayerAmb = desenharRestricoesNoMapa(window.L, mapaAmb, res);
    carLayerAmb = desenharCARNoMapa(car);
    if (box) box.innerHTML = _htmlResultadoAmb(lat, lng, res, car);
    const comErro = res.filter((r) => r.erro).length;
    _ambStatus(
      comErro
        ? `${comErro} camada(s) falharam — resultado parcial.`
        : "",
      comErro > 0,
    );
  } catch (e) {
    _ambLastKey = "";
    _ambStatus((e && e.message) || "Falha na consulta de restrições.", true);
  }
}

function _htmlResultadoAmb(lat, lng, res, car) {
  const det = detalhesRestricoes(res);
  const dentros = res.filter((r) => r.dentro);
  const erros = res.filter((r) => r.erro);
  const foraQtd = res.length - dentros.length - erros.length;
  let html = `<p class="mapa-hint" style="margin-top:12px">Ponto consultado: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>`;
  if (dentros.length) {
    html += alertHTML("warn", restricaoSentencaHTML(det));
    // ctx { lat, lng } alimenta o placeholder {coord} do texto de APP.
    html += restricaoDocsHTML(det, { lat, lng });
  } else {
    html += alertHTML(
      "ok",
      "<strong>Nenhuma restrição ambiental encontrada</strong> nas camadas consultadas para o ponto informado.",
    );
  }
  html += _htmlCAR(car);
  // Chips só das camadas relevantes (interseção ou erro) — com as APPs
  // hídricas por URFBio a lista completa passa de 20 camadas.
  const chips = []
    .concat(
      dentros.map(
        (r) =>
          `<span class="chip chip-on" title="${_escHtml(r.typeName)}">${_escHtml(r.rotulo)}: DENTRO</span>`,
      ),
    )
    .concat(
      erros.map(
        (r) =>
          `<span class="chip chip-err" title="${_escHtml(r.typeName)}">${_escHtml(r.rotulo)}: ${_escHtml(r.erro)}</span>`,
      ),
    );
  if (foraQtd > 0)
    chips.push(
      `<span class="chip chip-off">${foraQtd} camada(s) consultada(s) sem interseção</span>`,
    );
  html += `<div class="restricao-chips">${chips.join("")}</div>`;
  return html;
}

// Bloco informativo do imóvel CAR (SICAR). Retorna "" quando a consulta não
// rodou (car == null). Distingue: erro de consulta, ponto fora de qualquer
// imóvel, e ponto dentro (com nº do CAR/situação e, se houver, a área em ha).
// É INFORMATIVO — não entra no critério de restrição ambiental.
function _htmlCAR(car) {
  if (!car) return "";
  const linha = (txt, cor) =>
    `<p class="mapa-hint" style="margin:8px 0 0${cor ? ";color:" + cor : ""}">${txt}</p>`;
  if (car.erro) {
    return linha(
      "Cadastro Ambiental Rural (CAR): não foi possível consultar o imóvel (" +
        _escHtml(car.erro) +
        ").",
      "var(--cmg-neutral-500)",
    );
  }
  if (!car.dentro) {
    return linha(
      "Cadastro Ambiental Rural (CAR): o ponto não está dentro de um imóvel cadastrado.",
    );
  }
  const p = car.props || {};
  const area =
    p.num_area != null && String(p.num_area).trim() !== ""
      ? Number(String(p.num_area).replace(",", "."))
      : null;
  const areaTxt =
    area != null && !isNaN(area)
      ? ` — ${area.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha`
      : "";
  return (
    `<p class="mapa-hint" style="margin:8px 0 0">Cadastro Ambiental Rural (CAR) — ` +
    `<strong>${_escHtml(car.nome || "imóvel identificado")}</strong>${areaTxt} ` +
    `<span style="color:var(--cmg-neutral-500)">(informativo)</span></p>`
  );
}

// Chamado pelo botão "Limpar" do simulador: remove pino, contornos,
// legenda e resultado, e permite reconsultar a mesma coordenada.
function limparAmbiental() {
  _ambLastKey = "";
  clearTimeout(_ambDebounce);
  _limparCamadasAmb();
  if (mapaAmb && marcadorAmb) {
    mapaAmb.removeLayer(marcadorAmb);
    marcadorAmb = null;
  }
  ["amb_lat", "amb_lon", "amb_utm"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const box = document.getElementById("ambResultado");
  if (box) box.innerHTML = "";
  _ambStatus("");
}
window.limparAmbiental = limparAmbiental;

document.addEventListener("DOMContentLoaded", () => {
  // Digitação de coordenada no simulador → sincroniza com debounce (600 ms,
  // como no BT). O dispatch de input feito por aplicarCoordDoMapa também cai
  // aqui, mas a deduplicação por _ambLastKey evita consulta dupla.
  ["lat_input", "lon_input"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      clearTimeout(_ambDebounce);
      _ambDebounce = setTimeout(sincronizarAmbientalDoFormulario, 600);
    });
  });
  // Lat/long da própria aba: mesma normalização vírgula→ponto da análise de
  // carga (normalizarEntrada) + debounce para pino/consulta.
  ["amb_lat", "amb_lon"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      el.value = el.value.replace(",", ".");
      clearTimeout(_ambDebounce);
      _ambDebounce = setTimeout(aplicarCoordDosCamposAmb, 600);
    });
  });
  // UTM da própria aba (sem normalização de vírgula: pode ser separador).
  const utmEl = document.getElementById("amb_utm");
  if (utmEl)
    utmEl.addEventListener("input", () => {
      clearTimeout(_ambDebounce);
      _ambDebounce = setTimeout(aplicarCoordDoUtmAmb, 600);
    });
  const btn = document.getElementById("btnConsultarAmb");
  if (btn)
    btn.addEventListener("click", () => {
      const c =
        lerCoordenadaAmb() ||
        (utmEl && utmStringParaLatLon(utmEl.value)) ||
        lerCoordenadaFormulario();
      if (!c) {
        _ambStatus(
          "Informe uma coordenada válida (lat/long ou UTM) ou clique no mapa.",
          true,
        );
        return;
      }
      _ambLastKey = ""; // força reconsulta manual
      _atualizarCamposAmb(c.lat, c.lng);
      moverMarcadorAmb(c.lat, c.lng);
      consultarAmbiental(c.lat, c.lng);
    });
});
