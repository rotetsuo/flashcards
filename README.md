# Flashcards da planilha

Plataforma de flashcards que lê os termos **ao vivo** da sua planilha Google e só você acessa.

## Como funciona

| Peça | O que é |
|---|---|
| Banco de dados | A própria planilha, aba **Glossario**. As colunas são achadas pelo nome do cabeçalho: ID, Termo, Categoria, Definição, Onde aparece, Exemplo |
| Backend | `apps-script/Code.gs` (Google Apps Script, roda nos servidores do Google) |
| Frontend | `apps-script/Index.html` (abre no celular e no computador) |
| Segurança | O app é publicado com acesso **"Somente eu"**: o Google exige login na sua conta. Qualquer outra pessoa com o link recebe "acesso negado". |

Toda vez que você abre a página (ou toca em **↻ Atualizar**), as palavras são lidas da planilha. Adicionou uma linha nova? Ela já aparece.
O que você escolheu estudar e o que já marcou como "já sei" ficam salvos na sua conta, então valem no celular e no computador.

## Instalação (uma vez, ~5 min)

1. Abra a planilha → menu **Extensões → Apps Script**.
2. No editor, apague o conteúdo de `Código.gs` e cole o conteúdo de [apps-script/Code.gs](apps-script/Code.gs).
3. Clique em **+ (Adicionar arquivo) → HTML**, nomeie **`Index`** (exatamente assim) e cole o conteúdo de [apps-script/Index.html](apps-script/Index.html).
4. Salve (💾).
5. **Implantar → Nova implantação** → ícone de engrenagem → **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Somente eu**
6. Clique em **Implantar**, autorize o acesso à planilha (o Google mostra "app não verificado": clique em *Avançado → Acessar (não seguro)*; é seu próprio script).
7. Copie a URL que termina em `/exec`. Esse é o seu app.

### No celular
Abra a URL `/exec` no navegador logado na sua conta Google e use **Compartilhar → Adicionar à Tela de Início** (iPhone) ou **⋮ → Adicionar à tela inicial** (Android).

## Uso

- **Estudar**: toque no card para virar. "✓ Já sei" (ou deslizar para a direita) / "✗ Ainda não sei" (ou deslizar para a esquerda; o card volta mais tarde na rodada). No computador: espaço vira, setas → / ← respondem.
- **Escolher palavras**:
  - *Intervalo*: ex. da 1 à 50 (padrão). Atalhos 1–50, 51–100, Todas.
  - *Escolher uma a uma*: busca, caixas de seleção e atalhos para marcar uma categoria inteira.
  - Opções: significado na frente; incluir ou excluir palavras já dominadas; pular palavras ainda sem definição (ligado por padrão); zerar progresso.
- O verso do card mostra a definição e, quando preenchidos, a categoria, onde aparece no projeto e o exemplo.

## Se mudar a planilha de formato

Pode reordenar ou inserir colunas à vontade: o app acha cada uma pelo nome do cabeçalho. Só se renomear a aba ou os cabeçalhos, ajuste `SHEET_NAME` e `HEADERS` no topo do `Code.gs`. Depois, **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar** (a URL continua a mesma).
Mudanças só nos *dados* da planilha não precisam de nada disso.
