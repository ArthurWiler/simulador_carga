/* ============================================================
   Acesso ao SQL Server — preenchimento automático dos dados do
   transformador.

   HOJE NADA CHAMA ESTE ARQUIVO. O site é estático e o navegador
   não fala TDS: o SQL Server só é alcançável por código Node
   rodando DENTRO da rede da CEMIG. Este módulo é a metade que já
   está pronta desse serviço — falta a casca HTTP em volta. Ver a
   seção "Ligar o preenchimento pelo banco" no README, e
   tools/check-db.js, que já o exercita pela linha de comando.

   O contrato importa: buscarTrafo(codigo, municipio) devolve um
   objeto cujas chaves JÁ SÃO ids de input do simulador.html, ou
   null. Uma API que apenas repasse esse retorno como JSON é tudo
   o que simulador.html espera.

   Driver: mssql/tedious, JS puro. Não exige nenhum driver ODBC
   instalado na máquina.

   Configuração: .env na raiz do repositório (gitignored — o
   repositório é público).

   FALHAR EM SILÊNCIO É REQUISITO. Fora da rede interna o host não
   resolve, e a interface precisa simplesmente não preencher: sem
   mensagem, sem aviso, sem indicador na tela. Quem impede o acesso
   externo é a rede, não a aplicação.
   ============================================================ */

const fs = require("node:fs");
const path = require("node:path");

// Raiz do repositório — onde ficam .env e query/.
const BUNDLE_DIR = path.join(__dirname, "..");

/* ---- .env: parser mínimo (não vale uma dependência para isto) ----
   Importante: NÃO removemos comentário inline. A senha do banco contém
   '#' no meio, e tratá-lo como início de comentário truncaria o valor. */
function lerEnv() {
  const arquivo = path.join(BUNDLE_DIR, ".env");
  const env = {};
  try {
    for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i.exec(linha);
      if (!m) continue; // comentários de linha inteira e linhas vazias
      env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sem .env — app roda em modo manual */
  }
  return env;
}

const env = lerEnv();

/* DB_SERVER aceita "HOST" ou "HOST\INSTANCIA".

   Com instância nomeada é obrigatório usar options.instanceName e NÃO
   enviar port: no tedious os dois são mutuamente exclusivos, e mandar
   ambos derruba a conexão. Instância nomeada também depende do SQL
   Browser (UDP 1434) alcançável; se estiver bloqueado, o contorno é
   descobrir a porta fixa da instância e informar só DB_PORT. */
function montarConfig() {
  if (!env.DB_SERVER) return null;

  const [host, instancia] = env.DB_SERVER.split("\\");
  const config = {
    server: host,
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    options: {
      encrypt: env.DB_ENCRYPT !== "false",
      trustServerCertificate: env.DB_TRUST_CERT === "true",
    },
    connectionTimeout: 8000,
    requestTimeout: 8000,
    pool: { max: 4, min: 0, idleTimeoutMillis: 30000 },
  };

  if (instancia) config.options.instanceName = instancia;
  else config.port = Number(env.DB_PORT || 1433);

  /* DB_TLS_MIN — versão mínima de TLS aceita no handshake.

     O padrão do Node é TLSv1.2, e contra um SQL Server antigo que só fala
     TLS 1.0/1.1 a conexão morre em
     "SSL routines:OPENSSL_internal:UNSUPPORTED_PROTOCOL". Isso acontece
     mesmo com DB_ENCRYPT=false, porque o SQL Server sempre criptografa o
     pacote de login.

     Verificado no BoringSSL do Electron: com minVersion TLSv1 o handshake
     fecha (protocolo negociado TLSv1); sem ele, TLSV1_ALERT_PROTOCOL.

     NÃO use ciphers "DEFAULT@SECLEVEL=0" aqui — é a receita comum na
     internet para este erro, mas é sintaxe de OpenSSL: o BoringSSL do
     Electron responde INVALID_COMMAND e derruba a conexão.

     Baixar o mínimo é contorno para servidor obsoleto; o conserto de
     verdade é habilitar TLS 1.2 no SQL Server. */
  if (env.DB_TLS_MIN)
    config.options.cryptoCredentialsDetails = { minVersion: env.DB_TLS_MIN };

  return config;
}

const config = montarConfig();

/* ---- A query vive em query/, fora do Git (o repositório é público e os
   nomes de tabela são internos).

   O carregador descarta as linhas iniciais que começam com ' — é a
   convenção de comentário usada nos arquivos de query, então eles podem
   continuar sendo anotados sem quebrar o loader. */
function carregarQuery(nome) {
  try {
    const bruto = fs.readFileSync(path.join(BUNDLE_DIR, "query", nome), "utf8");
    const linhas = bruto.split(/\r?\n/);
    while (linhas.length && (linhas[0].trim() === "" || linhas[0].trim().startsWith("'")))
      linhas.shift();
    return linhas.join("\n").trim();
  } catch {
    return "";
  }
}

const SQL_DADOS_TRAFO = carregarQuery("query_dadosTransformador.txt");

/* Sondas de diagnóstico, usadas só quando a busca volta vazia. Vivem em
   query/ com as demais porque também carregam nomes de tabela internos —
   nada de schema pode entrar em arquivo versionado. Ausentes, o
   diagnóstico simplesmente não roda. */
const SQL_DIAG_TRAFO = carregarQuery("diag_trafo.txt");
const SQL_DIAG_MUNICIPIO = carregarQuery("diag_municipio.txt");

/* Colunas do SELECT → ids dos inputs em simulador.html. A query devolve mais
   colunas do que o formulário tem campo (IDTRAFO, TRAFO, DEMANDA_TOTAL,
   DEMANDA_FASE_A/B/C); o que não está aqui é simplesmente ignorado.

   pottr fica de fora de propósito: já é derivado do código digitado do
   transformador e o campo é readonly — o código que o usuário digitou
   continua mandando. */
const MAPA_COLUNAS = {
  CLIENTES_RESIDENCIAIS: "uc_residencial",
  DEMANDA_RESIDENCIAL: "demanda_residencial",
  CLIENTES_COMERCIAIS: "uc_comercial",
  DEMANDA_COMERCIAL: "demanda_comercial",
  CLIENTES_INDUSTRIAIS: "uc_industrial",
  DEMANDA_INDUSTRIAL: "demanda_industrial",
  CLIENTES_RURAIS: "uc_rural",
  DEMANDA_RURAL: "demanda_rural",
  CLIENTES_OUTROS: "uc_outros",
  DEMANDA_OUTROS: "demanda_outros",
  DEMANDA_IP: "demanda_iluminação",
};

let pool = null;
let ultimoErro = null;

/* Log de diagnóstico.

   Vai para ARQUIVO, não só para o console: a máquina que alcança o banco é
   uma VM da rede interna, e um .log é a forma de saber o que aconteceu lá
   sem estar na frente dela. configurarLog(dir) escolhe onde; sem chamada,
   só o console sob SIMULADOR_DEBUG.

   Isso NÃO viola o requisito de silêncio: nada aparece na tela do usuário,
   e o arquivo não contém credencial nenhuma. */
let dirLog = null;
function configurarLog(dir) {
  dirLog = dir;
}

const debug = (msg) => {
  if (process.env.SIMULADOR_DEBUG) console.log(`[simulador] db: ${msg}`);
  if (!dirLog) return;
  try {
    const arq = path.join(dirLog, "diagnostico-banco.log");
    // mantém o arquivo pequeno: recomeça passando de 64 KB
    if (fs.existsSync(arq) && fs.statSync(arq).size > 65536) fs.rmSync(arq);
    fs.appendFileSync(arq, `${new Date().toISOString()}  ${msg}
`);
  } catch {
    /* diagnóstico nunca pode quebrar o app */
  }
};

async function obterPool() {
  if (!config) return null;
  if (pool && pool.connected) return pool;
  const sql = require("mssql");
  pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

/* Estado da conexão. NÃO é usado para exibir nada ao usuário — existe para
   o log de diagnóstico do main.js sob SIMULADOR_DEBUG. */
async function statusDb() {
  if (!config) return { configurado: false, motivo: "sem .env" };
  if (!SQL_DADOS_TRAFO)
    return { configurado: false, motivo: "query_dadosTransformador.txt ausente" };
  try {
    await obterPool();
    return { configurado: true, conectado: true, servidor: env.DB_SERVER };
  } catch (e) {
    ultimoErro = e.message;
    return { configurado: true, conectado: false, motivo: e.message };
  }
}

/* Busca os dados de um transformador.

   O código vem normalizado no formato NUMTR-FASTR-POTTR ("18759-3-45"),
   que é exatamente o que a query espera em @serial/@fases/@potencia. O
   município é o quarto parâmetro porque o mesmo número de transformador
   pode existir em municípios diferentes.

   Devolve null para "não achei" e TAMBÉM para qualquer falha — banco fora
   do ar, host que não resolve, timeout. A UI segue no preenchimento
   manual sem nunca saber que houve erro. */
async function buscarTrafo(codigo, municipio) {
  if (!config) return debug("sem config (.env ausente)"), null;
  if (!SQL_DADOS_TRAFO) return debug("query ausente"), null;
  if (!codigo || !municipio) return debug("código ou município vazio"), null;

  const partes = String(codigo).split("-");
  if (partes.length !== 3) return debug(`código fora do formato: ${codigo}`), null;
  const [serial, fases, potencia] = partes.map(Number);
  if (![serial, fases, potencia].every(Number.isFinite))
    return debug(`código não numérico: ${codigo}`), null;

  try {
    const sql = require("mssql");
    const p = await obterPool();
    const r = await p
      .request()
      .input("serial", sql.Int, serial)
      .input("fases", sql.Int, fases)
      .input("potencia", sql.Int, potencia)
      .input("city", sql.VarChar(60), String(municipio))
      .query(SQL_DADOS_TRAFO);

    const linha = r.recordset && r.recordset[0];
    debug(
      `serial=${serial} fases=${fases} potencia=${potencia} city="${municipio}" ` +
        `-> ${r.recordset ? r.recordset.length : 0} linha(s)`,
    );
    if (!linha) {
      await diagnosticarVazio(p, sql, serial, fases, potencia, municipio);
      return null;
    }

    const dados = {};
    for (const [coluna, campo] of Object.entries(MAPA_COLUNAS)) {
      const v = linha[coluna];
      if (v !== null && v !== undefined && v !== "") dados[campo] = v;
    }
    // 1 = autoprotegido, 0 = convencional (o "" é o value do <option> padrão)
    if (linha.AUTOPROTEGIDO !== null && linha.AUTOPROTEGIDO !== undefined)
      dados.tipo_TRF = Number(linha.AUTOPROTEGIDO) === 1 ? "1" : "";

    return Object.keys(dados).length ? dados : null;
  } catch (e) {
    ultimoErro = e.message;
    debug(`erro: ${e.message}`);
    return null;
  }
}

/* Busca vazia é ambígua: o transformador pode não existir, ou existir e o
   nome do município não casar. Como quem consegue reproduzir isso está numa
   VM sem ferramenta nenhuma, o próprio app tira a dúvida e escreve no log.

   Roda UMA vez por sessão: são duas consultas a mais, e repeti-las a cada
   digitação seria peso inútil no banco. */
let jaDiagnosticou = false;

async function diagnosticarVazio(p, sql, serial, fases, potencia, municipio) {
  if (jaDiagnosticou) return;
  jaDiagnosticou = true;

  if (SQL_DIAG_TRAFO) {
    try {
      const r = await p
        .request()
        .input("serial", sql.Int, serial)
        .input("fases", sql.Int, fases)
        .input("potencia", sql.Int, potencia)
        .query(SQL_DIAG_TRAFO);
      if (!r.recordset.length) {
        debug("  sonda: NENHUM transformador com esse número/fases/potência");
      } else {
        debug(`  sonda: transformador existe (${r.recordset.length} registro(s)) ignorando município`);
        for (const t of r.recordset)
          debug(`    IDTRAFO=${t.IDTRAFO} IDLOGR=${t.IDLOGR}${t.IDLOGR == null ? "  <- nulo derruba o INNER JOIN" : ""}`);
      }
    } catch (e) {
      debug(`  sonda trafo falhou: ${e.message}`);
    }
  }

  if (SQL_DIAG_MUNICIPIO) {
    try {
      const fragmento = String(municipio).split(" ")[0];
      const r = await p
        .request()
        .input("busca", sql.VarChar(80), `%${fragmento}%`)
        .query(SQL_DIAG_MUNICIPIO);
      if (!r.recordset.length) {
        debug(`  sonda: nada parecido com "${fragmento}" na tabela de municípios`);
      } else {
        let casou = false;
        for (const m of r.recordset) {
          const igual = m.NOME === municipio;
          casou = casou || igual;
          debug(`    ${igual ? "=" : " "} "${m.NOME}" (len=${m.tamanho}, bytes=${m.bytes})`);
        }
        if (!casou)
          debug(`  sonda: NENHUM casa exatamente com "${municipio}" — causa provável`);
      }
    } catch (e) {
      debug(`  sonda município falhou: ${e.message}`);
    }
  }
}

async function encerrar() {
  if (pool) {
    try {
      await pool.close();
    } catch {
      /* encerrando de qualquer forma */
    }
    pool = null;
  }
}

module.exports = {
  buscarTrafo,
  statusDb,
  encerrar,
  // reaproveitados por tools/check-db.js — uma fonte de verdade para
  // leitura do .env e montagem da config de conexão
  lerEnv,
  montarConfig,
  configurarLog,
  get ultimoErro() {
    return ultimoErro;
  },
};
