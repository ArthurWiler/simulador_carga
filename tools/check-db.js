#!/usr/bin/env node
/**
 * tools/check-db.js — diagnóstico da conexão e da busca do transformador.
 *
 *   npm run db:check                          usa 368-3-150 / Bom Despacho
 *   npm run db:check -- 18759-3-45 "Abaete"   código e município próprios
 *
 * Roda SOMENTE na rede interna: fora dela o host do banco não resolve.
 * Só executa SELECT — nada é alterado no banco.
 *
 * Este script é um invólucro fino: o diagnóstico de verdade mora em
 * src/db.js e roda sozinho quando a busca volta vazia, porque a máquina que
 * alcança o banco é uma VM com apenas o .exe. Aqui a mesma saída só vai
 * para o terminal em vez do arquivo de log. Nenhum SQL vive neste arquivo:
 * as consultas e as sondas estão em query/, fora do Git.
 */

process.env.SIMULADOR_DEBUG = "1"; // antes do require: liga o log no console

const db = require("../src/db");

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
const sep = () => console.log(c.bold("\n" + "-".repeat(58)));

const [codigoArg, cidadeArg] = process.argv.slice(2);
const codigo = codigoArg || "368-3-150";
const cidadeBruta = cidadeArg || "Bom Despacho";

// Mesma normalização do simulador.html: NFD, sem diacríticos,
// MAIÚSCULAS — é assim que o banco guarda o nome.
const cidade = cidadeBruta
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .trim()
  .toUpperCase();

(async () => {
  const env = db.lerEnv();
  const config = db.montarConfig();

  sep();
  console.log(c.bold(" Diagnóstico do banco — Simulador de Carga"));
  sep();
  if (!config) {
    console.log(c.red("  .env ausente ou sem DB_SERVER"));
    process.exit(1);
  }
  console.log(`  transformador : ${codigo}`);
  console.log(`  município     : "${cidadeBruta}" -> "${cidade}"`);
  console.log(`  servidor      : ${env.DB_SERVER}`);
  console.log(`  instância     : ${config.options.instanceName || "(nenhuma)"}`);
  console.log(`  porta         : ${config.port || "(via SQL Browser)"}`);
  console.log(
    `  encrypt       : ${config.options.encrypt} / trustCert: ${config.options.trustServerCertificate}`,
  );
  console.log(
    `  TLS mínimo    : ${(config.options.cryptoCredentialsDetails || {}).minVersion || "TLSv1.2 (padrão do Node)"}`,
  );
  sep();

  const status = await db.statusDb();
  if (!status.conectado) {
    console.log(c.red(`  X   conexão falhou: ${status.motivo}`));
    const m = String(status.motivo);
    if (/ENOTFOUND|EAI_AGAIN/.test(m))
      console.log("      o host não resolve — fora da rede interna ou sem VPN");
    if (/self.signed|certificate/i.test(m))
      console.log("      certificado autoassinado: troque para DB_TRUST_CERT=true no .env");
    if (/instance|Browser/i.test(m))
      console.log("      instância nomeada: o SQL Browser (UDP 1434) pode estar bloqueado");
    if (/UNSUPPORTED_PROTOCOL|ALERT_PROTOCOL|SSL routines/i.test(m))
      console.log("      TLS: o servidor não fala TLS 1.2 — use DB_TLS_MIN=TLSv1 no .env");
    sep();
    process.exit(1);
  }
  console.log(c.green("  ok  conexão estabelecida"));
  sep();

  // A busca dispara sozinha as sondas quando volta vazia (src/db.js).
  const dados = await db.buscarTrafo(codigo, cidade);
  sep();
  if (dados) {
    console.log(c.green("  ok  dados encontrados:"));
    for (const [k, v] of Object.entries(dados)) console.log(`      ${k} = ${v}`);
  } else {
    console.log(c.red("  X   busca vazia — a causa está nas sondas acima"));
  }
  sep();

  await db.encerrar();
  process.exit(0);
})();
