# Design e acessibilidade

## Direção

Ferramenta de trabalho para vendedores do Mercado Livre: clara, direta e confiável, com números grandes e status por cor. Português do Brasil. Uso em desktop e celular (o vendedor costuma conferir pelo celular). Tom visual: limpo, cartões brancos sobre fundo azulado claro, um azul de destaque, verde/âmbar/vermelho para bom/atenção/crítico.

## Sistema existente

Fonte da verdade: `app/globals.css` (não duplicar valores aqui).

- **Tokens** no topo do arquivo, em `:root`, com tema escuro automático (`prefers-color-scheme`) e forçado por `data-theme`: `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--soft`, `--accent`, `--accent-soft`, `--good`, `--warn`, `--bad`.
- **Tipografia**: Bricolage Grotesque (títulos e números, `--display`) e Manrope (texto, `--body`), via Google Fonts em `app/layout.tsx`.
- **Componentes de classe**: `.card`, `.btn` (`.primary`, `.danger`, `.mini`), `.f` + `.box` (campos), `.chip`/`.pill` (status com `--c`), `.gcard` + `.ringbox` (indicadores), `.stage` (funil), `.action` (plano), `.item` (listas), `.kpis`, `.tabela-admin`, `.auth` (telas de acesso).
- **Status**: classes `.good`, `.warn`, `.bad`, `.none` definem `--c`, usado por chips, anéis e bordas.

## Interação

HTML semântico, navegação por teclado, foco visível (`:focus-visible` com contorno no `--accent`) e contraste adequado. Todo campo tem `<label>`. Erros aparecem junto ao formulário (`.msg-erro`, `role="alert"`); operações assíncronas mostram progresso no botão ("Salvando…", "Entrando…"). Ações destrutivas pedem confirmação em dois cliques (o botão muda para "Confirmar exclusão"). Respeitar `prefers-reduced-motion`.

## Layout e revisão

- Largura máxima de conteúdo 1180px (`.wrap`); telas de conta usam `.estreito` (720px).
- Quebras usadas: 1000px (indicadores 6→3 colunas), 900px (resumo), 820px, 720px (funil vertical), 520px e 480px (celular). Gutter lateral mínimo de 16px com `safe-area-inset`.
- A tabela do admin rola na horizontal no celular (largura mínima 760px).
- Estados existentes: vazio no histórico ("Você ainda não salvou nenhuma análise"), plano vazio ("Preencha pelo menos três números…"), erro de carregamento, somente leitura (admin vendo cliente), teste grátis (faixa no topo), acesso vencido (`/assinatura`).
- Revisões feitas: telas logadas, admin (desktop e 390px) e assinatura conferidas com Supabase simulado em 20/10/2026.
- Ainda não existe: página pública de vendas, logo/marca, estados de carregamento com skeleton.

## Ferramentas de design instaladas

- `ui-ux-pro-max` (`.claude/skills/`): gerar e validar sistema de design, paletas, tipografia e anti-padrões. Ao usar, informar a stack "Next.js com CSS puro" e manter os tokens existentes, salvo pedido de redesign.
- `web-design-guidelines`: revisão de acessibilidade, teclado, foco, formulários e estados.
- Chrome DevTools MCP e agent-browser: conferir a interface rodando em `http://localhost:3002`.

## Manutenção

Mudanças visuais e de interação atualizam `app/globals.css` e este guia quando uma regra mudar.
