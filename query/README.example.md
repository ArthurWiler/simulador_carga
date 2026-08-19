# query/

Queries do SQL Server usadas pelo preenchimento automático. **Esta pasta não
vai para o Git** (ver `.gitignore`): o repositório é público e os arquivos
carregam a modelagem interna do sistema de distribuição. O
`electron-builder` os embute no asar no build, junto com o `.env`.

Este README é a única coisa aqui que é versionada.

## Formato

Arquivos `.txt` com SQL puro. As linhas iniciais que começam com `'` são
tratadas como comentário e descartadas pelo carregador (`carregarQuery` em
`src/db.js`), então dá para anotar cada query no topo do arquivo:

    'Encontra os dados internos do transformador a partir do número e município.

    SELECT ...

## Em uso hoje

### `query_dadosTransformador.txt`

A única ligada ao aplicativo. Recebe quatro parâmetros e deve devolver no
máximo uma linha:

| Parâmetro | Origem no formulário |
|---|---|
| `@serial` | 1a parte do código do trafo (`18759`-3-45) |
| `@fases` | 2a parte (18759-`3`-45) |
| `@potencia` | 3a parte (18759-3-`45`) |
| `@city` | campo Município, em MAIÚSCULAS e sem acento |

O `@city` chega já normalizado pelo renderer, porque o banco guarda o nome em
maiúsculas, sem acento e sem cedilha.

Colunas consumidas — o resto do SELECT é ignorado sem erro:

    AUTOPROTEGIDO
    CLIENTES_RESIDENCIAIS   DEMANDA_RESIDENCIAL
    CLIENTES_COMERCIAIS     DEMANDA_COMERCIAL
    CLIENTES_INDUSTRIAIS    DEMANDA_INDUSTRIAL
    CLIENTES_RURAIS         DEMANDA_RURAL
    CLIENTES_OUTROS         DEMANDA_OUTROS
    DEMANDA_IP

O de-para para os ids dos campos está em `MAPA_COLUNAS`, em `src/db.js`.

## Sondas de diagnóstico

`diag_trafo.txt` e `diag_municipio.txt` rodam sozinhas quando a busca volta
vazia, e o resultado vai para `%APPDATA%\simulador-carga\diagnostico-banco.log`.
Existem porque a máquina que alcança o banco é uma VM com apenas o `.exe`:
sem elas, "não preencheu" não distingue transformador inexistente de nome de
município que não casa.

| Arquivo | Parâmetros | Responde |
|---|---|---|
| `diag_trafo.txt` | `@serial`, `@fases`, `@potencia` | o transformador existe, ignorando o município? |
| `diag_municipio.txt` | `@busca` (fragmento com `%`) | como o nome do município está gravado de fato? |

## Guardadas para depois

As demais queries da pasta ainda não estão ligadas ao aplicativo e mantêm
valores de busca hardcoded. Para entrar, cada uma precisa ser parametrizada e,
em vários casos, ganhar campos que o `index.html` ainda não tem (número de
instalação, busca por coordenada UTM, painel de conversão de rede).
