# stubs/@azure

Substitutos mínimos para `@azure/identity` e `@azure/core-auth`, os dois únicos
pacotes `@azure` que o `tedious` importa no topo de `lib/connection.js`.

## Por que

O driver `mssql` -> `tedious` arrasta ~40 MB de `@azure/*` para suportar
autenticação Azure AD, dos quais 15 MB são `@azure/msal-browser` — uma
biblioteca de navegador que nunca é alcançada em Node. Este aplicativo
autentica com login SQL (usuário e senha no `.env`), então nada disso roda.

## Como funciona

O `package.json` exclui `node_modules/@azure/**` e `node_modules/@azure-rest/**`
do pacote e copia esta pasta para `node_modules/@azure` dentro do asar. Os
`require()` de topo de arquivo do tedious continuam resolvendo; o código real
some.

## Superfície coberta

Levantada em `tedious/lib/connection.js`:

| Símbolo | Linha | Quando roda |
|---|---|---|
| `isTokenCredential` | 314 | só se `type === "token-credential"` |
| `UsernamePasswordCredential` | 2489 | só em `azure-active-directory-password` |
| `ManagedIdentityCredential` | 2494 | só em `azure-active-directory-msi-*` |
| `DefaultAzureCredential` | 2500 | só em `azure-active-directory-default` |
| `ClientSecretCredential` | 2503 | só em `azure-active-directory-service-principal-secret` |

## Se um dia precisar de Azure AD

Remova as duas exclusões `!node_modules/@azure...` e o mapeamento `from/to` em
`build.files` no `package.json`. O `.exe` volta a crescer ~10 MB comprimido.

## Ao atualizar o mssql/tedious

Reconferir a lista acima:

    grep -n "@azure" node_modules/tedious/lib/connection.js
    grep -o "_identity\.[A-Za-z]*\|_coreAuth\.[A-Za-z]*" node_modules/tedious/lib/connection.js | sort -u

Se aparecer símbolo novo, acrescente ao stub. A falha, se escapar, é um
`TypeError` no boot — barulhenta, não silenciosa.
