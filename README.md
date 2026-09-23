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
