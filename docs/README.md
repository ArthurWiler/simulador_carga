# docs/ — Normas de Distribuição (PDFs)

Os PDFs desta pasta aparecem como cards na homepage e abrem no leitor de PDF
padrão do Windows (`shell.openPath`), não dentro do app.

Eles fazem parte do **conteúdo web**: entram no `manifest.json` com sha256 e
são distribuídos pelo auto-update como o `index.html` ou o `estilo.css`. Ou
seja, acrescentar uma ND e dar `git push` na `main` faz o PDF chegar em quem
já tem o `.exe` instalado, sem reinstalar nada.

## Acrescentar uma ND

1. Coloque o PDF aqui, com nome sem espaços e sem acento (`ND-5.1.pdf`).
2. Registre o caminho na allowlist `DOCUMENTOS`, em `main.js`:

   ```js
   const DOCUMENTOS = {
     "nd-5-1": "docs/ND-5.1.pdf",
   };
   ```

3. Acrescente o card em `ITENS`, em `home.js` — há um modelo comentado lá:

   ```js
   {
     grupo: "Normas de Distribuição",
     titulo: "ND-5.1",
     desc: "Fornecimento de energia elétrica em tensão secundária.",
     icone: "📄",
     tipo: "pdf",
     alvo: "nd-5-1",
     href: "docs/ND-5.1.pdf",
   },
   ```

   A chave (`"nd-5-1"`) é o que a homepage envia ao processo main. Ela precisa
   ser idêntica nos dois arquivos; o caminho do arquivo o renderer nunca vê.

4. `npm run manifest` e commite o PDF junto com o `manifest.json`.

## Duas armadilhas

**A chave em `main.js` é obrigatória.** Um PDF solto aqui, sem entrada em
`DOCUMENTOS`, é inalcançável: o main recusa qualquer chave que não esteja na
allowlist. Isso é proposital — o conteúdo web é baixado da internet e não pode
escolher que arquivo o app abre.

**`*.pdf binary` no `.gitattributes` não pode sair.** Sem essa linha, o
`* text=auto eol=lf` pode converter fim de linha dentro do PDF; os bytes no
repositório deixam de bater com o sha256 do manifest e o updater rebaixa o
mesmo arquivo para sempre, sem nunca convergir. Já aconteceu com o
`vendor/leaflet.css`.

## Peso

Cada ND costuma ter alguns MB e o repositório é **público** — vale conferir se
a redistribuição é aceitável antes do push. Se não for, a alternativa é apontar
`DOCUMENTOS` para um caminho UNC na rede da CEMIG; só o resolvedor do
`ipcMain.handle("app:abrir")` em `main.js` muda.
