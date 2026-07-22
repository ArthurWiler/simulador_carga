const SISEMA_WFS = "https://geoserver.meioambiente.mg.gov.br/ows";
const SISEMA_VERSION = "1.1.0";
const SISEMA_FLIP_BBOX = false;
/* ------------------------------------------------------------------
   SICAR (CAR federal) — GeoServer público, serviços virtuais POR CAMADA
   (padrão .../geoserver/sicar/<camada>/wfs).
   CONFIRMADO no GetCapabilities de sicar_imoveis_mg (17/07/2026):
   - typeName sicar:sicar_imoveis_mg (perímetro do IMÓVEL/CAR de MG)
   - outputFormat application/json habilitado
   - WFS 1.0.0/1.1.0; DefaultSRS EPSG:4674 (SIRGAS 2000) — pedimos
     srsName=EPSG:4326 e o GeoServer reprojeta (diferença desprezível)
   - BBOX com "EPSG:4326" (código simples) => ordem long,lat (flip=false)
   - CORS OK: o servidor ECOA o Origin no Access-Control-Allow-Origin
     (o header só aparece quando a requisição envia Origin — testar
     sem ele dá falso negativo).
   - NÃO existe camada de Reserva Legal: o GetCapabilities do workspace
     (https://geoserver.car.gov.br/geoserver/sicar/wfs) lista 27 camadas,
     todas sicar_imoveis_<uf>. A RL vem do AgroTag/Embrapa (abaixo).
   ------------------------------------------------------------------ */
const SICAR_WFS_IMOVEIS =
  "https://geoserver.car.gov.br/geoserver/sicar/sicar_imoveis_mg/wfs";
const SICAR_VERSION = "1.1.0";
const SICAR_FLIP_BBOX = false;
/* ------------------------------------------------------------------
   AgroTag/Embrapa — GeoServer público com a RESERVA LEGAL do CAR de MG
   (base derivada do SICAR). CONFIRMADO em GetFeature real (17/07/2026):
   - typeName bases:mg_reserva_legal (workspace "bases")
   - outputFormat application/json habilitado; resposta ~1 s
   - DefaultSRS EPSG:4674; srsName=EPSG:4326 reprojeta; coords long,lat
     (flip=false)
   - CORS liberado: Access-Control-Allow-Origin: *
   - atributos: idf, nom_tema ("Reserva Legal Proposta"…), num_area (ha),
     geocodigo (município IBGE) — não há nº do CAR
   ------------------------------------------------------------------ */
const AGROTAG_WFS = "https://www.agrotag.cnpma.embrapa.br/geoserver/ows";
const AGROTAG_VERSION = "1.1.0";
const AGROTAG_FLIP_BBOX = false;
// Extrator de rótulo p/ feições do SICAR (não têm "nome" próprio): nº do
// CAR + situação/condição do cadastro. Atributos confirmados em GetFeature
// real de sicar_imoveis_mg: cod_imovel e condicao ("Aguardando análise").
function _nomeFeicaoSicar(p) {
  if (!p) return null;
  const pega = (...ks) => {
    for (const k of ks) {
      const v = p[k] != null ? p[k] : p[String(k).toUpperCase()];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };
  const cod = pega("cod_imovel", "codigo_car", "cod_car");
  const sit = pega("situacao", "ind_status", "des_condic", "condicao");
  const partes = [cod, sit ? `(${sit})` : null].filter(Boolean);
  return partes.length ? partes.join(" ") : null;
}

const URFBIO_APP_HIDRICA = [
  ["ne", "da URFBio Nordeste"],
  ["amsf", "na URFBio Alto Médio São Francisco"],
  ["ap", "na URFBio Alto Paranaíba"],
  ["cnor", "na URFBio Centro-Norte"],
  ["co", "na URFBio Centro-Oeste"],
  ["cs", "na URFBio Centro-Sul"],
  ["jeq", "na URFBio Jequitinhonha"],
  ["mata", "na URFBio Mata"],
  ["cm", "na URFBio Metropolitana"],
  ["nor", "na URFBio Noroeste"],
  ["no", "na URFBio Norte"],
  ["riodoce", "na URFBio Rio Doce"],
  ["sul", "na URFBio Sul"],
  ["tm", "na URFBio Triângulo"],
];

// APPs (FBDS) por CIRCUNSCRIÇÃO HIDROGRÁFICA — 42 camadas com typeName no
// padrão IDE:ide_240905_<suf>_apps_fbds_pol. [sufixo, nome da circunscrição].
// O `nome` entra na frase como "APP: <nome>".
const FBDS_APP_CIRCUNSCRICAO = [
  ["gd2", "Vertentes do rio Grande"],
  ["jq1", "Alto rio Jequitinhonha"],
  ["sf1", "Alto rio São Francisco"],
  ["gd8", "Baixo rio Grande"],
  ["pn3", "Baixo rio Paranaíba"],
  ["sf4", "Entorno da Represa de Três Marias"],
  ["gd3", "Entorno do Reservatório de Furnas"],
  ["jq3", "Médio e Baixo rio Jequitinhonha"],
  ["gd7", "Médio rio Grande"],
  ["pn2", "rio Araguari"],
  ["jq2", "rio Araçuaí"],
  ["bu1", "rio Buranhém"],
  ["do5", "rio Caratinga"],
  ["pn1", "rio Dourados e Alto rio Paranaíba"],
  ["ib1", "rio Itabapoana"],
  ["in1", "rio Itanhém"],
  ["ip1", "rio Itapemirim"],
  ["iu1", "rio Itaúnas"],
  ["ju1", "rio Jucuruçu"],
  ["do6", "rio Manhuaçu"],
  ["mu1", "rio Mucuri"],
  ["sf9", "rio Pandeiros"],
  ["sf7", "rio Paracatu"],
  ["sf3", "rio Paraopeba"],
  ["pa1", "rio Pardo"],
  ["sf2", "rio Pará"],
  ["pe1", "rio Peruípe"],
  ["do2", "rio Piracicaba"],
  ["do1", "rio Piranga"],
  ["do3", "rio Santo Antônio"],
  ["gd5", "rio Sapucaí"],
  ["do4", "rio Suaçuí Grande"],
  ["sm1", "rio São Mateus"],
  ["sf8", "rio Urucuia"],
  ["gd4", "rio Verde"],
  ["sf10", "rio Verde Grande"],
  ["sf5", "rio das Velhas"],
  ["gd1", "Afluentes Mineiros do Alto rio Grande"],
  ["sf6", "rios Jequitaí e Pacuí"],
  ["gd6", "rios Mogi-Guaçu e Pardo"],
  ["pj1", "rios Piracicaba e Jaguari"],
  ["ps2", "rios Pompa e Muriaé"],
  ["ps1", "rios Preto e Paraibuna"],
];

const DOC_INTRO =
  "Para que o cliente obtenha ligação de energia elétrica, é necessário anexar os seguintes documentos:";
/* ---- Área de Preservação Permanente (APP) — texto de indeferimento ----
   O texto cita a COORDENADA consultada: use o placeholder {coord}, que o
   builder (restricaoDocsHTML) substitui por "(-lat, -lng)". Como não há
   `intro` própria dele e a introdução padrão (DOC_INTRO, "anexar…") não se
   aplica a esta redação, o texto vive numa `intro` própria via campo
   `introPropria` — ver restricaoDocsMesclado(). */
const DOC_APP = {
  introPropria:
    "Como o imóvel de V.Sa. está localizado dentro de uma APP, para que possamos dar continuidade ao seu atendimento, V.Sa. deverá comprovar à Cemig que sua residência ou benfeitoria na coordenada {coord}, encontra-se regular através de um dos documentos a seguir:",
  bullets: [
    "Termo de Ajustamento de Conduta;",
    "Comprovação de Uso Antrópico Consolidado;",
    "Declaração de Interesse Social ou Utilidade Pública, no caso de propriedade rural; ou",
    "Simples Declaração do órgão ambiental.",
  ],
  notas: [],
};
/* ---- Unidade de Conservação — texto VARIÁVEL por dois eixos ----
   A redação da UC depende de duas escolhas do atendente (switches na aba
   Análise Ambiental, ver ambCenario() no map.js):
   - zona: "urbana" | "rural"        → muda a LISTA de documentos
   - rede: "porta" | "extensao"      → muda a INTRODUÇÃO
   Regra de negócio: com rede à porta basta o cliente apresentar os
   documentos; sem rede à porta (extensão) a própria CEMIG precisa pedir
   autorização ao órgão gestor da UC, então a frase de localização ganha um
   complemento e a introdução dos documentos muda para "subsidiar a análise".
   A nota final do órgão ambiental vale nos quatro cenários.
   Resolvido em docsUnidadeConservacao(cenario), abaixo. */
const UC_NOTA_ORGAO =
  "A critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.";
// Documentos por ZONA.
const UC_BULLETS_ZONA = {
  urbana: [
    "Documentos que comprovem posse e regularidade do imóvel simultaneamente (IPTU, Registro de Imóvel, Escritura Pública, etc) ou;",
    "Documentos que comprovem posse (Contrato de Compra e Venda, Contrato de Locação, Termo de Doação, Termo de Permissão de Uso, etc) e regularidade (Certidão de número/Habite-se/Declaração da Prefeitura, Planta de Arquitetura Aprovada) separadamente.",
  ],
  rural: [
    "Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, e o CAR – Cadastro Ambiental Rural.",
  ],
};
// Introdução da lista por REDE.
const UC_INTRO_REDE = {
  porta:
    "Para que o cliente obtenha a ligação de energia elétrica, é necessário apresentar:",
  extensao:
    "Visando subsidiar a análise do órgão ambiental, o requerente deve apresentar os seguintes documentos:",
};
// Complemento da FRASE de localização — só no cenário de extensão de rede.
// Entra logo após o ponto final da sentença montada por
// restricaoSentencaSegmentos(). Sem rede à porta a obra é da CEMIG, e é ela
// quem precisa da autorização do órgão gestor.
const UC_COMPLEMENTO_EXTENSAO =
  "Neste caso a CEMIG necessitará solicitar autorização do órgão responsável pela administração Unidade de Conservação, para a execução de obras/projetos de extensão de rede de distribuição de energia elétrica.";
// Monta o objeto `documentos` da UC para o cenário escolhido. Usa
// `introPropria` (em vez do DOC_INTRO compartilhado) porque as duas
// introduções acima são específicas da UC — assim o bloco da UC não se
// mistura com o de outras camadas em restricaoDocsBlocos().
function docsUnidadeConservacao(cenario) {
  const c = normalizarCenario(cenario);
  return {
    introPropria: UC_INTRO_REDE[c.rede],
    bullets: UC_BULLETS_ZONA[c.zona].slice(),
    notas: [UC_NOTA_ORGAO],
  };
}
// Normaliza/valida o cenário vindo da UI. Padrão: urbana + rede à porta.
function normalizarCenario(cenario) {
  const c = cenario || {};
  return {
    zona: c.zona === "rural" ? "rural" : "urbana",
    rede: c.rede === "extensao" ? "extensao" : "porta",
  };
}
// Marcador de identidade da camada de UC. As entradas de camada apontam para
// ESTE objeto; o texto real é resolvido por cenário em restricaoDocsBlocos().
// Mantido como objeto próprio (e não um doc pronto) para que a dedup por
// referência continue tratando todas as UCs como um bloco só.
const DOC_UNIDADE_CONSERVACAO = { unidadeConservacao: true };
const DOC_TERRA_QUILOMBOLA = {
  bullets: [
    "Certidão/Registro de Autodefinição emitido pela Fundação Cultural Palmares, comprovando o vínculo do(s) interessado(s) com a comunidade quilombola;",
    "Documento do INCRA que comprove o domínio da terra em nome da comunidade, juntamente com a demarcação da área;",
    "Mapa georreferenciado contendo a delimitação do imóvel e a identificação das áreas de preservação ambiental;",
    "Lista de beneficiários emitida pela liderança comunitária;",
    "Formulário de Solicitação de Atendimento Rural devidamente preenchido (um para cada beneficiário);",
    "Documento oficial de identificação com CPF de cada beneficiário.",
  ],
  notas: [
    "Observação: Caso o processo de demarcação das terras ainda não tenha sido concluído, a solicitação poderá ser protocolada pelo procedimento padrão, como atendimento rural comum, sem enquadramento como comunidade quilombola.",
  ],
};
const DOC_TERRA_INDIGENA = {
  bullets: [
    "Autorização formal da FUNAI para execução do serviço;",
    "Documento emitido pela comunidade indígena ou liderança reconhecida, indicando os beneficiários;",
    "Mapa ou croqui da área, com delimitação do imóvel e identificação da aldeia;",
    "Documento oficial de identificação com CPF dos beneficiários ou representantes legais.",
  ],
  notas: [
    "Observação: Caso o processo de demarcação das terras ainda não tenha sido concluído, a solicitação poderá ser protocolada pelo procedimento padrão, como atendimento rural comum, sem enquadramento como comunidade indígena.",
  ],
};
/* ---- Reserva Legal (CAR) — textos por STATUS (nom_tema) ----
   A base AgroTag/Embrapa traz três status de RL no atributo nom_tema:
   "Reserva Legal Averbada", "Reserva Legal Aprovada e não Averbada" e
   "Reserva Legal Proposta".
   - AVERBADA: é IMPEDITIVA — a CEMIG não pode fornecer energia à UC em RL
     averbada (Lei federal 12.651/2012). Não há documento a anexar; é uma
     mensagem de recusa (só `notas`, sem `bullets`).
   - PROPOSTA / Aprovada e não Averbada: ainda em análise; basta constar a
     realocação da reserva no registro do imóvel ou no CAR.
   docsReservaLegal() (abaixo) escolhe o objeto conforme o nom_tema. */
const DOC_RL_AVERBADA = {
  bullets: [],
  notas: [
    "Em atendimento à sua solicitação, identificamos que o ponto para a ligação de energia elétrica encontra-se em uma área de reserva legal averbada de interesse de preservação ambiental, definidas pela lei federal 12.651/2012. Sendo assim não podemos realizar o fornecimento de energia elétrica a essa unidade consumidora.",
  ],
};
const DOC_RL_PROPOSTA = {
  bullets: [
    "Constar realocação da reserva no registro do imóvel ou CAR, em processo de ou concluída.",
  ],
  notas: [],
};
// Escolhe o objeto de texto da Reserva Legal pelo status (nom_tema).
// "Averbada" (sem "não/nao") é impeditiva (DOC_RL_AVERBADA); "Proposta" e
// "Aprovada e não Averbada" pedem a realocação no registro/CAR
// (DOC_RL_PROPOSTA). Retorna null se o status não for reconhecido.
function docsReservaLegal(props) {
  const t = String((props && props.nom_tema) || "").toLowerCase();
  if (t.includes("averbada") && !t.includes("não") && !t.includes("nao"))
    return DOC_RL_AVERBADA;
  if (t.includes("proposta") || t.includes("averbada")) return DOC_RL_PROPOSTA;
  return null;
}

const SISEMA_CAMADAS = [
  // { id, rotulo, typeName, tipoNome, documentos }
  //   rotulo    — título do dropdown (categoria da camada)
  //   tipoNome  — como o TIPO aparece na frase de localização
  //   documentos— texto de exigências (varia por tipo; null = só a frase)
  //   typeName DEVE ser confirmado no GetCapabilities
  // OPCIONAIS por camada (default = servidor do Sisema):
  //   wfs, version, flipBBox — endpoint/versão/ordem do BBOX próprios,
  //     permitindo camadas de OUTROS GeoServers (ex.: SICAR) no mesmo fluxo
  //   nomeFeicao(props) — extrator de rótulo específico da camada (tem
  //     prioridade sobre a heurística genérica nomeFeicaoRestricao)
  {
    id: "ape",
    rotulo: "Área de Proteção Especial",
    typeName: "IDE:ide_2010_mg_areas_protecao_especial_pol",
    tipoNome: "Área de Proteção Especial",
    documentos: DOC_UNIDADE_CONSERVACAO,
  },
  {
    id: "uce",
    rotulo: "Unidade de Conservação Estadual",
    typeName: "IDE:ide_2010_mg_unidades_conservacao_estaduais_pol",
    tipoNome: "Unidade de Conservação",
    documentos: DOC_UNIDADE_CONSERVACAO,
  },
  {
    id: "ucf",
    rotulo: "Unidade de Conservação Federal",
    typeName: "IDE:ide_2010_mg_unidades_conservacao_federais_pol",
    tipoNome: "Unidade de Conservação",
    documentos: DOC_UNIDADE_CONSERVACAO,
  },
  {
    id: "ucm",
    rotulo: "Unidade de Conservação Municipal",
    typeName: "IDE:ide_2010_mg_unidades_conservacao_municipais_pol",
    tipoNome: "Unidade de Conservação",
    documentos: DOC_UNIDADE_CONSERVACAO,
  },
  {
    id: "tq",
    rotulo: "Terra Quilombola",
    typeName: "IDE:ide_2005_mg_terras_quilombolas_pol",
    tipoNome: "Terra Quilombola",
    documentos: DOC_TERRA_QUILOMBOLA,
  },
  {
    id: "ti",
    rotulo: "Terra Indígena",
    typeName: "IDE:ide_2003_mg_terras_indigenas_pol",
    tipoNome: "Terra Indígena",
    documentos: DOC_TERRA_INDIGENA,
  },
  {
    id: "rl",
    rotulo: "Reserva Legal (CAR)",
    typeName: "bases:mg_reserva_legal",
    tipoNome: "Reserva Legal",
    // Documentos VARIAM por feição (status da RL): quem manda é
    // documentosFeicao(props); o `documentos` fixo fica null.
    documentos: null,
    documentosFeicao: (p) => docsReservaLegal(p),
    wfs: AGROTAG_WFS,
    version: AGROTAG_VERSION,
    flipBBox: AGROTAG_FLIP_BBOX,
    nomeFeicao: (p) => {
      const t = p && p.nom_tema != null ? String(p.nom_tema).trim() : "";
      return t || null;
    },
  },

  ...URFBIO_APP_HIDRICA.map(([suf, regiao]) => ({
    id: "apph_" + suf,
    rotulo: "APPs hídricas " + regiao,
    typeName: `IDE:ide_210603_mg_hid_app_hidrica_mapcar_${suf}_pol`,
    tipoNome: "APP hídrica",
    documentos: DOC_APP,
    nomeFeicao: (p) => {
      const c = p && p.categoria != null ? String(p.categoria).trim() : "";
      return c ? "faixa " + c.replace(/\bAte\b/g, "até") : null;
    },
  })),

  // APPs (FBDS) por circunscrição hidrográfica — 42 camadas geradas.
  // O nome da circunscrição vira o rótulo/nome da área; a categoria (quando
  // presente na feição) refina o rótulo como "faixa …".
  ...FBDS_APP_CIRCUNSCRICAO.map(([suf, nome]) => ({
    id: "appfbds_" + suf,
    rotulo: "APPs (FBDS) — " + nome,
    typeName: `IDE:ide_240905_${suf}_apps_fbds_pol`,
    tipoNome: "Área de Preservação Permanente",
    documentos: DOC_APP,
    nomeFeicao: (p) => {
      const c = p && p.categoria != null ? String(p.categoria).trim() : "";
      return c ? "faixa " + c.replace(/\bAte\b/g, "até") : nome;
    },
  })),

  {
    id: "rppn",
    rotulo: "Reserva Particular do Patrimônio Natural (RPPN)",
    typeName: "IDE:ide_2010_mg_reservas_particulares_patrimonio_natural_pol",
    tipoNome: "Reserva Particular do Patrimônio Natural",
    documentos: DOC_UNIDADE_CONSERVACAO,
  },
];

const SICAR_CAM_IMOVEL = {
  typeName: "sicar:sicar_imoveis_mg",
  wfs: SICAR_WFS_IMOVEIS,
  version: SICAR_VERSION,
  flipBBox: SICAR_FLIP_BBOX,
};
async function consultarImovelCAR(lat, lng) {
  if (!window.turf) throw new Error("Turf.js não carregado.");
  const ponto = window.turf.point([lng, lat]);
  try {
    const resp = await fetch(_urlWfs(SICAR_CAM_IMOVEL, lat, lng));
    if (!resp.ok) return { erro: `HTTP ${resp.status}` };
    const gj = await resp.json();
    const feats = (gj && gj.features) || [];
    const f = feats.find(
      (x) =>
        x.geometry &&
        (x.geometry.type === "Polygon" || x.geometry.type === "MultiPolygon") &&
        window.turf.booleanPointInPolygon(ponto, x),
    );
    if (!f) return { dentro: false };
    const completa = await geometriaCompletaFeicao(SICAR_CAM_IMOVEL, f.id);
    return {
      dentro: true,
      nome: _nomeFeicaoSicar(f.properties),
      props: f.properties || {},
      feicao: completa || f,
    };
  } catch (e) {
    return { erro: "Falha de rede/CORS" };
  }
}
// Monta a URL de GetFeature por bbox usando o endpoint/versão/ordem de BBOX
// DA CAMADA (cam.wfs/version/flipBBox), com fallback nos defaults do Sisema —
// assim camadas de outros GeoServers (SICAR) usam o MESMO fluxo de consulta.
function _urlWfs(cam, lat, lng) {
  const d = 8e-4;
  const flip = cam.flipBBox != null ? cam.flipBBox : SISEMA_FLIP_BBOX;
  const box = flip
    ? `${lat - d},${lng - d},${lat + d},${lng + d}`
    : `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const q = new URLSearchParams({
    service: "WFS",
    version: cam.version || SISEMA_VERSION,
    request: "GetFeature",
    typeName: cam.typeName,
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    maxFeatures: "50",
    bbox: `${box},EPSG:4326`,
  });
  return `${cam.wfs || SISEMA_WFS}?${q.toString()}`;
}
/* ============================================================
   Restrição ambiental (IDE-Sisema) — consulta COMPARTILHADA
   Fonte única de verdade usada de forma idêntica pelo BT
   (bt/js/map.js) e pelo MT (mt/js/app.js), garantindo o MESMO
   critério, as MESMAS camadas e a MESMA formatação de resultado
   nos dois fluxos (Regras 2 e 3). Alterar a lógica aqui reflete
   automaticamente em ambas as tensões.
   ============================================================ */
// Extrai um nome legível da feição (varre props por chaves de rótulo comuns).
function nomeFeicaoRestricao(props) {
  if (!props) return null;
  const k = Object.keys(props).find(
    (key) =>
      /nome|^nm_|name|denom|titulo|t_tulo|unidade|categoria/i.test(key) &&
      props[key] != null &&
      String(props[key]).trim() !== "",
  );
  return k ? String(props[k]).trim() : null;
}
// Busca a GEOMETRIA COMPLETA de uma feição pelo seu ID (WFS featureID).
// A consulta principal usa uma bbox minúscula (~80 m) só para o teste
// ponto-em-polígono, o que RECORTA polígonos grandes. Para desenhar o
// contorno inteiro da reserva no mapa, refazemos o GetFeature filtrando
// pelo id da feição (sem bbox). Retorna a Feature GeoJSON completa ou null.
async function geometriaCompletaFeicao(cam, featureId) {
  if (!featureId) return null;
  try {
    const q = new URLSearchParams({
      service: "WFS",
      version: cam.version || SISEMA_VERSION,
      request: "GetFeature",
      typeName: cam.typeName,
      outputFormat: "application/json",
      srsName: "EPSG:4326",
      maxFeatures: "1",
      featureID: featureId,
    });
    const resp = await fetch(`${cam.wfs || SISEMA_WFS}?${q.toString()}`);
    if (!resp.ok) return null;
    const gj = await resp.json();
    const f = gj && gj.features && gj.features[0];
    return f && f.geometry ? f : null;
  } catch (e) {
    return null;
  }
}
// Consulta todas as camadas do Sisema e retorna, por camada,
// { ...cam, dentro:Boolean, nomes:[...], geometrias:[Feature,...] } ou
// { ...cam, erro:"..." }. `geometrias` traz o contorno COMPLETO de cada
// reserva intersectada (busca ampla por id, com fallback p/ a recortada).
async function consultarRestricoesObra(lat, lng) {
  if (!window.turf) throw new Error("Turf.js não carregado.");
  if (typeof SISEMA_CAMADAS === "undefined")
    throw new Error("Configuração do Sisema (geo.js) não carregada.");
  const ponto = window.turf.point([lng, lat]);
  const out = [];
  for (const cam of SISEMA_CAMADAS) {
    try {
      // URL única de GetFeature (fonte: _urlWfs) — respeita endpoint/versão/
      // flip de BBOX POR CAMADA (Sisema ou SICAR).
      const resp = await fetch(_urlWfs(cam, lat, lng));
      if (!resp.ok) {
        out.push({ ...cam, erro: `HTTP ${resp.status}` });
        continue;
      }
      const gj = await resp.json();
      const feats = (gj && gj.features) || [];
      const dentro = feats.filter(
        (f) =>
          f.geometry &&
          (f.geometry.type === "Polygon" ||
            f.geometry.type === "MultiPolygon") &&
          window.turf.booleanPointInPolygon(ponto, f),
      );
      // Uma ENTRADA POR FEIÇÃO intersectada (não por camada): nome, geometria
      // completa e documentos específicos da feição. Isso permite que áreas
      // distintas da MESMA camada (ex.: 2 UCs estaduais no mesmo ponto, ou RLs
      // de status diferentes) tenham cor/legenda/documentos próprios.
      const areas = [];
      for (const f of dentro) {
        const completa = await geometriaCompletaFeicao(cam, f.id);
        // Extrator específico da camada (cam.nomeFeicao) tem prioridade —
        // ex.: RL exibe o status; fallback: heurística de nome.
        const nome =
          (cam.nomeFeicao && cam.nomeFeicao(f.properties)) ||
          nomeFeicaoRestricao(f.properties) ||
          null;
        // documentosFeicao(props) manda quando a camada os define por feição
        // (RL: Averbada vs. Proposta); senão, os documentos fixos da camada.
        const documentos = cam.documentosFeicao
          ? cam.documentosFeicao(f.properties)
          : cam.documentos || null;
        areas.push({ nome, documentos, geometria: completa || f });
      }
      out.push({
        ...cam,
        dentro: dentro.length > 0,
        areas,
        // Compatibilidade: `nomes`/`geometrias` (consumidos por resumos e
        // desenho legados) derivam de `areas`.
        nomes: areas.map((a) => a.nome).filter(Boolean),
        geometrias: areas.map((a) => a.geometria),
      });
    } catch (e) {
      out.push({ ...cam, erro: "Falha de rede/CORS" });
    }
  }
  return out;
}
// Desenha, num mapa Leaflet, o contorno das reservas intersectadas e devolve
// a camada criada (L.geoJSON) — ou null se não houver geometria. Uso idêntico
// em BT (bt/js/map.js) e MT (mt/js/app.js) p/ manter o mesmo estilo/UX. O
// chamador é responsável por remover a camada anterior antes de chamar.
// `res` é o retorno de consultarRestricoesObra; `L` é window.L.
// Paleta para diferenciar VÁRIAS restrições no mapa (contorno + legenda).
// Ordem definida pelo design: erro/600, amarelo aviso, neutra/300,
// neutra/600 e verde on. Cicla se houver mais áreas que cores.
const CORES_RESTRICAO = [
  "#C8303F", // erro/600 (vermelho)
  "#FFC107", // amarelo (warning/500)
  "#B1B9B7", // neutra/300
  "#364B46", // neutra/600
  "#C4FF3F", // verde on
];
// Legenda ABAIXO do mapa: um item por CAMADA intersectada, na MESMA cor do
// contorno desenhado (CORES_RESTRICAO por índice, como desenharRestricoesNoMapa
// e detalhesRestricoes). O elemento .mapa-legenda (shared.css) é inserido logo
// após o container do mapa e SÓ existe quando o ponto cai em restrição —
// atualizar com `res` vazio/null remove a legenda (usado também ao limpar a
// camada nos fluxos de erro do BT/MT).
function atualizarLegendaRestricoes(map, res) {
  if (!map || typeof map.getContainer !== "function") return;
  const cont = map.getContainer();
  const pai = cont.parentNode;
  if (!pai) return;
  const antiga = pai.querySelector(".mapa-legenda");
  if (antiga) antiga.remove();
  // Uma entrada por ÁREA (não por camada) — casa com a frase e o mapa.
  const areas = detalhesRestricoes(res);
  if (!areas.length) return;
  const div = document.createElement("div");
  div.className = "mapa-legenda";
  // Texto corrido: cada área com seu quadradinho de cor inline (mantém a
  // correspondência com o contorno no mapa), separadas por "; ".
  div.innerHTML = areas
    .map((a) => {
      // Rótulo: nome da área quando existe (distingue 2 UCs na mesma camada);
      // senão, o rótulo da camada.
      const texto = a.nome ? `${a.rotulo}: ${a.nome}` : a.rotulo;
      return (
        `<span class="mapa-legenda-cor" style="background:${a.cor}"></span>` +
        `<span class="mapa-legenda-rotulo">${_escHtml(texto)}</span>`
      );
    })
    .join(`<span class="mapa-legenda-sep">; </span>`);
  cont.insertAdjacentElement("afterend", div);
}
function desenharRestricoesNoMapa(L, map, res) {
  if (!L || !map || !res) return null;
  // Cor por ÁREA (detalhesRestricoes) — mesma fonte da frase e da legenda, para
  // que mapa, legenda e texto batam de cor mesmo com várias áreas por camada.
  const areas = detalhesRestricoes(res);
  // Legenda abaixo do mapa acompanha o desenho: aparece com as áreas
  // intersectadas e some quando o ponto sai de todas as restrições.
  atualizarLegendaRestricoes(map, res);
  const feicoes = [];
  areas.forEach((a) => {
    const f = a.geometria;
    if (f && f.geometry) {
      feicoes.push({
        ...f,
        properties: {
          ...(f.properties || {}),
          _rotulo: a.rotulo,
          _nome: a.nome || a.rotulo,
          _cor: a.cor,
        },
      });
    }
  });
  if (!feicoes.length) return null;
  const layer = L.geoJSON(
    { type: "FeatureCollection", features: feicoes },
    {
      // Cor por feição (alterna quando há mais de uma restrição).
      style: (feat) => {
        const cor =
          (feat && feat.properties && feat.properties._cor) || "#C8303F";
        return {
          color: cor,
          weight: 2,
          opacity: 0.9,
          fillColor: cor,
          fillOpacity: 0.12,
        };
      },
      onEachFeature: (feat, lyr) => {
        const p = (feat && feat.properties) || {};
        const txt = p._nome || p._rotulo;
        if (txt) lyr.bindPopup(String(txt));
      },
    },
  ).addTo(map);
  // NÃO reenquadrar o mapa: o contorno da reserva é desenhado mantendo o zoom
  // e o centro atuais (o pino da UC continua visível no mesmo enquadramento).
  // Antes havia um map.fitBounds(...) aqui, que dava zoom out para caber a área
  // inteira da restrição (reservas são enormes) — comportamento indesejado.
  return layer;
}
// Resume a lista de camadas no formato consumido pela UI (idêntico ao BT):
// restricaoAmbiental "Sim"/"Não" (ou "" se todas as camadas falharam) e
// restricoesTexto "Rótulo (nome1, nome2); Rótulo2 …".
function resumirRestricoes(res) {
  const lista = res || [];
  const dentros = lista.filter((r) => r.dentro);
  const errosTodos = lista.length > 0 && lista.every((r) => r.erro);
  // Uma reserva/camada por linha ("\n") para leitura mais clara. Os displays
  // (BT/MT) usam white-space: pre-line e o PDF respeita "\n" via splitTextToSize.
  const restricoesTexto = dentros
    .map(
      (r) =>
        r.rotulo +
        (r.nomes && r.nomes.length ? " (" + r.nomes.join(", ") + ")" : ""),
    )
    .join("\n");
  return {
    errosTodos,
    algumaDentro: dentros.length > 0,
    restricaoAmbiental: errosTodos ? "" : dentros.length ? "Sim" : "Não",
    restricoesTexto,
  };
}
// Detalha as áreas intersectadas para a UI (BT e MT). Uma entrada por ÁREA:
//   { id, rotulo, tipoNome, nome, cor, documentos }
//   tipoNome  — como o TIPO aparece na frase ("Unidade de Conservação").
//   nome      — nome legível da feição, ou null quando a camada não o traz.
//   documentos— objeto { bullets, notas } do tipo (ou null).
// A frase de localização e o bloco de documentos são montados a partir desta
// lista por restricaoSentencaSegmentos() e restricaoDocsMesclado().
// FONTE ÚNICA da lista de áreas para a UI (frase, documentos, legenda e
// mapa). Uma entrada por ÁREA/feição intersectada, com cor por ÁREA (contador
// global) — assim duas áreas da mesma camada recebem cores distintas e a
// legenda/mapa batem com a frase. Inclui `geometria` p/ o desenho reaproveitar.
function detalhesRestricoes(res) {
  const dentros = (res || []).filter((r) => r.dentro);
  const out = [];
  let ai = 0; // índice GLOBAL de área (define a cor)
  dentros.forEach((r) => {
    const tipoNome = r.tipoNome || r.rotulo;
    // Retrocompatível: camadas antigas sem `areas` caem no par nomes/geometrias.
    const areas =
      r.areas && r.areas.length
        ? r.areas
        : (r.nomes && r.nomes.length ? r.nomes : [null]).map((nome, i) => ({
            nome,
            documentos: r.documentos || null,
            geometria: (r.geometrias && r.geometrias[i]) || null,
          }));
    for (const a of areas) {
      out.push({
        id: r.id,
        rotulo: r.rotulo,
        tipoNome,
        nome: a.nome || null,
        cor: CORES_RESTRICAO[ai % CORES_RESTRICAO.length],
        documentos: a.documentos || null,
        geometria: a.geometria || null,
      });
      ai++;
    }
  });
  return out;
}
// Escapa texto p/ inserção segura em HTML (usado no builder do MT/innerHTML).
function _escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
// Título fixo do banner e rótulo do aceite — fonte única p/ BT e MT.
const RESTRICAO_AVISO_TITULO = "Unidade em área de restrição ambiental";
const RESTRICAO_ACEITE_LABEL =
  "Declaro que li e estou de acordo com as informações acima.";
// Segmentos da frase de localização (após o título). Cada segmento é
// { t:texto, b:true? } p/ o consumidor destacar em negrito. Trata singular/
// plural (1 vs N áreas) e destaca o NOME de cada área (ou o tipo, quando a
// camada não traz nome). Consumido em HTML pela aba Análise Ambiental.
// `cenario` ({ zona, rede }) é opcional: com rede === "extensao" e alguma
// Unidade de Conservação entre as áreas, acrescenta o complemento sobre a
// autorização que a CEMIG precisa pedir ao órgão gestor.
function restricaoSentencaSegmentos(detalhe, cenario) {
  const areas = detalhe || [];
  if (!areas.length) return [];
  const plural = areas.length > 1;
  const segs = [
    {
      t:
        "O ponto de ligação está localizado " +
        (plural ? "nas áreas" : "na área") +
        " de abrangência de ",
    },
  ];
  areas.forEach((a, i) => {
    if (i > 0) segs.push({ t: i === areas.length - 1 ? " e " : ", " });
    if (a.nome) {
      segs.push({ t: a.tipoNome + ": " });
      segs.push({ t: a.nome, b: true });
    } else {
      segs.push({ t: a.tipoNome, b: true });
    }
  });
  segs.push({ t: "." });
  // Complemento da extensão de rede: só faz sentido quando há UC no ponto.
  const temUC = areas.some((a) => a.documentos && a.documentos.unidadeConservacao);
  if (temUC && normalizarCenario(cenario).rede === "extensao")
    segs.push({ t: " " + UC_COMPLEMENTO_EXTENSAO });
  return segs;
}
// Versão em HTML da frase (título em negrito + segmentos) — usada pelo MT.
function restricaoSentencaHTML(detalhe, cenario) {
  const corpo = restricaoSentencaSegmentos(detalhe, cenario)
    .map((s) => (s.b ? `<strong>${_escHtml(s.t)}</strong>` : _escHtml(s.t)))
    .join("");
  return `<strong>${_escHtml(RESTRICAO_AVISO_TITULO)}</strong>. ${corpo}`;
}
// Substitui placeholders dinâmicos no texto. Hoje só {coord} (coordenada
// consultada, usada pelo texto de APP). ctx = { lat, lng }.
function _interpTexto(txt, ctx) {
  if (txt == null) return txt;
  let s = String(txt);
  if (ctx && ctx.lat != null && ctx.lng != null) {
    const coord = `(${(+ctx.lat).toFixed(6)}, ${(+ctx.lng).toFixed(6)})`;
    s = s.replace(/\{coord\}/g, coord);
  }
  return s;
}
// Mescla os documentos das áreas em BLOCOS. A maioria dos tipos compartilha a
// introdução padrão (DOC_INTRO) — seus bullets/notas caem num único bloco
// "compartilhado". Tipos com introdução PRÓPRIA (doc.introPropria, ex.: APP)
// viram um bloco separado cada, para que a redação e seus bullets fiquem
// coerentes. Dedup por referência do objeto `documentos` e por texto idêntico.
// ctx = { lat, lng } alimenta os placeholders ({coord}). Retorna
// [ { intro, bullets:[...], notas:[...] }, … ].
function restricaoDocsBlocos(detalhe, ctx) {
  const areas = detalhe || [];
  const compart = { intro: "", bullets: [], notas: [] };
  const proprios = [];
  const vistos = new Set();
  for (const a of areas) {
    let doc = a.documentos;
    if (!doc || vistos.has(doc)) continue; // dedup por tipo (referência)
    vistos.add(doc);
    // A UC não tem texto fixo: resolve agora, conforme os switches
    // zona/rede que vêm no ctx. Dedup já feita pela referência marcadora.
    if (doc.unidadeConservacao) doc = docsUnidadeConservacao(ctx);
    const bullets = (doc.bullets || []).map((b) => _interpTexto(b, ctx));
    const notas = (doc.notas || []).map((n) => _interpTexto(n, ctx));
    if (doc.introPropria) {
      proprios.push({
        intro: _interpTexto(doc.introPropria, ctx),
        bullets,
        notas,
      });
    } else {
      bullets.forEach((b) => {
        if (!compart.bullets.includes(b)) compart.bullets.push(b);
      });
      notas.forEach((n) => {
        if (!compart.notas.includes(n)) compart.notas.push(n);
      });
    }
  }
  const blocos = [];
  if (compart.bullets.length || compart.notas.length) {
    compart.intro = compart.bullets.length ? DOC_INTRO : "";
    blocos.push(compart);
  }
  return blocos.concat(proprios);
}
// Retrocompat.: primeiro bloco no formato antigo { intro, bullets, notas }.
function restricaoDocsMesclado(detalhe, ctx) {
  const b = restricaoDocsBlocos(detalhe, ctx);
  return b[0] || { intro: "", bullets: [], notas: [] };
}
// Versão em HTML do(s) bloco(s) de documentos (intro + <ul> + notas).
// ctx = { lat, lng } para os placeholders ({coord}).
function restricaoDocsHTML(detalhe, ctx) {
  const blocos = restricaoDocsBlocos(detalhe, ctx);
  const partes = blocos
    .map((d) => {
      if (!d.bullets.length && !d.notas.length) return "";
      let html = '<div class="restricao-docs">';
      if (d.intro)
        html += `<p class="restricao-docs-intro">${_escHtml(d.intro)}</p>`;
      if (d.bullets.length)
        html +=
          '<ul class="restricao-docs-lista">' +
          d.bullets.map((b) => `<li>${_escHtml(b)}</li>`).join("") +
          "</ul>";
      html += d.notas
        .map((n) => `<p class="restricao-docs-nota">${_escHtml(n)}</p>`)
        .join("");
      html += "</div>";
      return html;
    })
    .filter(Boolean);
  return partes.join("");
}
