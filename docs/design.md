# Design e acessibilidade

## Direção

Ferramenta de trabalho para vendedores do Mercado Livre: clara, direta e confiável, com números grandes e status por cor. Português do Brasil. Uso em desktop e celular (o vendedor costuma conferir pelo celular). Tom visual inspirado na linguagem da Apple: muito espaço, o mesmo fundo em todas as telas (`#F5F5F7`/preto com brilho azul suave no topo), cartões de vidro translúcido (`--card` com desfoque) e bordas ultrafinas, sem blocos sólidos de grafite; campos e sub-blocos (funil, plano, indicadores) leves e translúcidos; vidro jateado na navegação e no menu, um azul de destaque e verde/laranja/vermelho para bom/atenção/crítico.

## Sistema existente

Fonte da verdade: `app/globals.css` (não duplicar valores aqui).

- **Tokens** no topo do arquivo, em `:root`, com tema escuro automático (`prefers-color-scheme`) e forçado por `data-theme`: cores (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--soft`, `--field`, `--accent`, `--accent-soft`, `--cta`, `--on-cta`, `--good`, `--warn`, `--bad`), vidro (`--glass`, `--glass-line` para navegação, menu e toast; `--card`, `--card-line`, `--card-shadow` para cartões), sombras (`--shadow-sm`, `--shadow`, `--shadow-lg`), raios (`--r-lg`, `--r-md`, `--r-sm`) e movimento (`--ease`, `--ease-out`, `--fast`, `--med`). `--accent` é para texto/foco; botões principais usam `--cta` (branco sobre `#0071E3`, contraste ≥ 4,5:1 nos dois temas).
- **Tema**: lógica em `lib/tema.ts` (salva em `localStorage`, chave `tema`); o script inline em `app/layout.tsx` aplica o tema salvo antes da primeira pintura. Nas telas de acesso, `components/BotaoTema.tsx` alterna automático → claro → escuro no canto; na área logada, o seletor fica no menu do usuário.
- **Barra superior (área logada)**: grade de três colunas: logo "Análise ADS" à esquerda, menus no centro (`components/NavLinks.tsx`, hoje só "Início", com destaque e `aria-current` na página atual) e, à direita, `components/MenuUsuario.tsx`: avatar com iniciais + nome, que abre um painel com nome/e-mail, Minha conta, Painel admin (só `papel = 'admin'`), Aparência (Automático/Claro/Escuro, `role="radiogroup"`) e Sair. Fecha com Esc (foco volta ao botão), clique fora ou troca de página. No celular (< 560px) mostra só os ícones e o avatar. "Nova análise" fica no topo da tela inicial e dentro do painel de análise.
- **Tipografia**: fonte do sistema da Apple (SF Pro) quando disponível, senão Inter (Google Fonts em `app/layout.tsx`); `--display` para títulos e números, `--body` para texto. Corpo em 16px.
- **Ícones**: `lucide-react`, traço 1.9, tamanho `1.1em` via `svg.lucide` no CSS. Ícone ao lado de texto fica decorativo (`aria-hidden`, padrão da biblioteca); botão só com ícone precisa de `aria-label`.
- **Movimento**: entrada em fade + deslize curto, em cascata, nos blocos de `.wrap` e no cartão de acesso; botões com compressão `scale(.97)` ao clicar; anéis animam o progresso. Tudo desligado com `prefers-reduced-motion`; o vidro vira superfície sólida com `prefers-reduced-transparency`.
- **Componentes de classe**: `.card`, `.btn` (pílula; `.primary`, `.danger`, `.mini`, `.icone`), `.f` + `.box` (campos), `.chip`/`.pill` (status com `--c`), `.gcard` + `.ringbox` (indicadores), `.stage` (funil), `.action` (plano), `.item` (listas), `.kpis`, `.tabela-admin`, `.auth` (telas de acesso).
- **Status**: classes `.good`, `.warn`, `.bad`, `.none` definem `--c`, usado por chips, anéis e bordas.

- **Login em modal** (21/10/2026): "Entrar" na apresentação abre `components/ModalLogin.tsx` (`<dialog>` nativo, fundo `::backdrop` escurecido e desfocado, foco no e-mail, fecha com Esc, X ou clique no fundo) com o card `components/CardLogin.tsx`. Aberto por `?entrar=1` na URL (`lib/rotas.ts` → `ROTA_LOGIN`), usado também pela proteção de rotas e por links de e-mail expirados.
- **Prévia do hero**: `components/InclinaPrevia.tsx` inclina o card até 7° acompanhando o mouse (o lado do ponteiro vai para trás); em repouso fica reto; desligado em toque e com reduzir movimento. Brilho azul escuro e discreto por trás (`--glow-previa`), card mais opaco.

## Interação

HTML semântico, navegação por teclado, foco visível (`:focus-visible` com contorno no `--accent`) e contraste adequado. Todo campo tem `<label>`. Erros aparecem junto ao formulário (`.msg-erro`, `role="alert"`); operações assíncronas mostram progresso no botão ("Salvando…", "Entrando…"). Ações destrutivas pedem confirmação em dois cliques (o botão muda para "Confirmar exclusão"). Respeitar `prefers-reduced-motion`. Campos preenchidos automaticamente pelo navegador mantêm a cor da caixa (regras `:-webkit-autofill` em `globals.css`), sem o retângulo azulado padrão do Chrome.

## Layout e revisão

- Largura máxima de conteúdo 1180px (`.wrap`); telas de conta usam `.estreito` (720px).
- Quebras usadas: 1000px (indicadores 6→3 colunas), 900px (resumo), 820px, 720px (funil vertical), 520px e 480px (celular). Gutter lateral mínimo de 16px com `safe-area-inset`.
- A tabela do admin rola na horizontal no celular (largura mínima 760px).
- Estados existentes: vazio no histórico ("Você ainda não salvou nenhuma análise", direto sobre o fundo, sem cartão), plano vazio ("Preencha pelo menos três números…"), erro de carregamento, somente leitura (admin vendo cliente), teste grátis (faixa no topo), acesso vencido (`/assinatura`).
- Revisões feitas: telas logadas, admin (desktop e 390px) e assinatura conferidas com Supabase simulado em 20/10/2026.
- Redesign no estilo Apple em 21/10/2026: login conferido em 390px e desktop, claro e escuro; telas logadas não conferidas no navegador (exigem sessão do Supabase).
- Barra superior com menu do usuário em 21/10/2026: conferida com Supabase simulado em 1280px (claro e escuro) e 390px, como admin e como cliente; teclado (Esc), clique fora, troca de tema e navegação testados.
- Barra e menu do usuário em vidro escuro denso (21/10/2026): o vidro da barra fica numa camada `::before` (tokens `--nav-bg`, `--menu-bg`), para o menu ter desfoque próprio; antes, o Chrome ignorava o desfoque do menu dentro da barra e o conteúdo de trás aparecia nítido. Menu 8px abaixo da linha da barra, alinhado à direita com o botão do usuário.
- Vidro translúcido em 21/10/2026: login conferido em 1280px escuro e 390px claro; formulário, resumo e indicadores conferidos com marcação simulada (sem sessão do Supabase).
- **Apresentação pública** (`app/apresentacao/`, estilos em `landing.css` sob `.lp`): barra em vidro com âncoras (Recursos, Como funciona, Indicadores, Planos; escondidas abaixo de 820px), hero com título em gradiente e prévia inclinada do painel (dados de exemplo calculados por `lib/analise`), bento de recursos, passos, metas reais dos seis indicadores, planos (Grátis 7 dias e Pro R$ 97/mês, valor em `PLANOS` na página), CTA final e rodapé com `BotaoTema`. Conferida em 21/10/2026 em 1440px escuro e 390px claro, sem rolagem horizontal.
- Ainda não existe: logo/marca definitiva (hoje um ícone de gráfico em quadrado azul), estados de carregamento com skeleton.

## Ferramentas de design instaladas

- `ui-ux-pro-max` (`.claude/skills/`): gerar e validar sistema de design, paletas, tipografia e anti-padrões. Ao usar, informar a stack "Next.js com CSS puro" e manter os tokens existentes, salvo pedido de redesign.
- `web-design-guidelines`: revisão de acessibilidade, teclado, foco, formulários e estados.
- Chrome DevTools MCP e agent-browser: conferir a interface rodando em `http://localhost:3002`.

## Manutenção

Mudanças visuais e de interação atualizam `app/globals.css` e este guia quando uma regra mudar.
