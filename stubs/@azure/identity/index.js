/* Stub de @azure/identity — ver stubs/README.md.

   O tedious importa este pacote no topo de connection.js e referencia
   quatro classes de credencial, todas dentro dos ramos
   azure-active-directory-*. Autenticando por login SQL nenhum deles roda.

   Em vez de exportar undefined, exportamos construtores que lançam: se
   alguém habilitar autenticação AAD um dia, o erro diz exatamente o que
   fazer em vez de estourar um "is not a constructor" a esmo. */

function indisponivel(nome) {
  return class {
    constructor() {
      throw new Error(
        `${nome} indisponível: este build removeu @azure/* para reduzir ~40 MB. ` +
          `Para usar autenticação Azure AD, remova as exclusões de @azure em ` +
          `package.json (campo build.files) e reconstrua.`,
      );
    }
  };
}

module.exports = {
  DefaultAzureCredential: indisponivel("DefaultAzureCredential"),
  ClientSecretCredential: indisponivel("ClientSecretCredential"),
  ManagedIdentityCredential: indisponivel("ManagedIdentityCredential"),
  UsernamePasswordCredential: indisponivel("UsernamePasswordCredential"),
};
