/* Stub de @azure/core-auth — ver stubs/README.md.

   O tedious importa este pacote no topo de connection.js e usa exatamente
   um símbolo: isTokenCredential(), chamado só dentro do ramo
   type === "token-credential". Autenticando por login SQL esse ramo nunca
   é alcançado; devolver false é a resposta correta e honesta. */

function isTokenCredential() {
  return false;
}

module.exports = { isTokenCredential };
