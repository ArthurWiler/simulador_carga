# Portal PE — CEMIG

Site estático com as ferramentas de análise usadas na distribuição:

| Ferramenta | Link direto | O que faz |
|---|---|---|
| **Simulação de Carga** | `?aba=simulador` | Dimensionamento de transformador, disjuntores e queda de tensão |
| **Análise Ambiental** | `?aba=ambiental` | Restrições da obra por coordenada — consulta 64+ camadas WFS do Sisema, SICAR e AgroTag |
| **Textos Padrão** | `?aba=textos` | 42 textos de indeferimento e pendência, com busca e cópia |

Mais as **Normas de Distribuição** (`docs/*.pdf`) e os **Atalhos** para
sistemas externos, que abrem em aba nova.

**Tudo vive em `index.html`**: as três ferramentas são painéis
`.aba-painel` do mesmo documento, e a **sidebar fixa** troca de painel sem
recarregar nada. A sidebar é gerada a partir do catálogo `ITENS` em
`home.js` — acrescentar uma ferramenta, uma norma ou um atalho é
acrescentar um objeto ali. Um item com `aba` troca o painel; um item com
`href` abre em aba nova. O `?aba=` na URL é o link direto para uma
ferramenta.

### Coordenada e unidade de conservação nos textos

Os textos ambientais trazem os placeholders `{coord}` e `{unidade}`. Depois
de rodar a **Análise Ambiental**, eles saem preenchidos com a coordenada
consultada e o nome da UC encontrada; sem análise, aparecem destacados em
amarelo como valor a preencher, e o **Copiar** leva `(coordenada)` em vez
da chave crua — um marcador em linguagem natural é visto e corrigido num
e-mail, uma chave de template passa despercebida.

A ponte é `ambientalUltimo()` (`map.js`), a única porta para o resultado da
análise fora daquele arquivo; `textos.js` interpola na renderização e o
`core.js` reinterpola ao entrar no painel, se o dado mudou.

Sem build, sem bundler, sem framework. HTML/CSS/JS puro; Chart.js, Leaflet e
Turf vivem em `vendor/` (não em CDN — a rede corporativa pode bloquear
unpkg/jsdelivr).

## Rodar local

Qualquer servidor HTTP estático na raiz do repositório. O VS Code já vem
configurado: extensão **Live Server**, porta 5502 (`.vscode/settings.json`).

```
http://127.0.0.1:5502/
```

Não abra por `file://`. Os GeoServers do SICAR ecoam o cabeçalho `Origin`, e
sob `file://` o navegador manda `Origin: null` — a Análise Ambiental quebra.

## Publicação

GitHub Pages, a partir do branch `main`, pasta `/ (root)`:
**Settings → Pages → Source: Deploy from a branch**. Um `git push` publica.

O `.nojekyll` na raiz desliga o processamento Jekyll do Pages.

## Ligar o preenchimento pelo banco

Hoje o simulador é 100% manual: `API_BASE` em `index.html` está vazio.

O navegador **não fala TDS** — o SQL Server (porta 1433) é inalcançável de
dentro de uma página, e isso não muda por estar na rede interna: o limite é o
sandbox do navegador. O caminho é uma API HTTP rodando dentro da rede.

`src/db.js` já é essa API pela metade. `buscarTrafo(codigo, municipio)` valida
o formato do código, roda a query parametrizada e devolve **um objeto cujas
chaves já são ids de input do simulador**, ou `null`. Falta a casca:

```js
const express = require("express");
const db = require("./src/db");        // sem uma linha de mudança
const app = express();

app.use((req, res, next) => {
  // Só necessário se a API NÃO estiver na mesma origem do site.
  res.set("Access-Control-Allow-Origin", "https://arthurwiler.github.io");
  res.set("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/trafo", async (req, res) => {
  const dados = await db.buscarTrafo(req.query.codigo, req.query.municipio);
  res.json(dados || null);             // null = não achei, e a UI segue manual
});

app.listen(3000);
```

Depois é só apontar `API_BASE` em `index.html` para essa URL.

### O que a API exige

- **HTTPS com certificado de CA confiável nas máquinas** — a CA interna da
  CEMIG (AD CS) serve. Autoassinado **não funciona**: o navegador bloqueia o
  `fetch` e a falha chega como um `TypeError` genérico, indistinguível de
  "servidor fora do ar". Num ambiente Windows/AD o caminho de menor atrito é
  IIS como reverse proxy (ARR + URL Rewrite) terminando o TLS com a PKI
  corporativa, com o processo Node atrás.
- **Mesma origem elimina metade disso.** Se o servidor interno servir também
  os arquivos estáticos, não há CORS, não há Private Network Access, e
  `API_BASE` continua `""` porque `/api/trafo` resolve relativo. São os
  mesmos arquivos do Pages — dá para ter os dois no ar.
- Uma máquina ligada com Node, regra de firewall e nome DNS interno.

### Testar o banco antes

```
npm install
npm run db:check                          # 368-3-150 / Bom Despacho
npm run db:check -- 18759-3-45 "Abaete"   # código e município próprios
```

Só roda dentro da rede interna; fora dela o host não resolve (`ENOTFOUND`), que
é o esperado. Só executa `SELECT`.

## Arquivos fora do Git

O repositório é público, então dois conjuntos ficam de fora (ver `.gitignore`):

- **`.env`** — credenciais do SQL Server. Modelo em `.env.example`.
- **`query/*.txt`** — as consultas carregam a modelagem interna do sistema de
  distribuição. Convenções em `query/README.example.md`.

Nada disso é usado pelo site; só pelo `db:check` e por uma futura API.
