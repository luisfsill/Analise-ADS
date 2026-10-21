import { brl, dec, int } from "./formato";
import {
  DIAS_APRENDIZADO, LIMITE_TACOS, META_CPV, META_IMP_DIA, META_IPC, META_ROAS, META_TACOS,
  MIN_IMP_DIA, PTS, REF_INV, ROAS_ALTO_PARA_TACOS, TIERS,
} from "./regras";
import type { Acao, Entradas, Gargalo, Indicador, Resultado, Status, StatusPorIndicador } from "./tipos";

export const ENTRADAS_VAZIAS: Entradas = {
  dias: null, inv: null, imp: null, cli: null, ven: null, roas: null, tacos: null, margem: null, envio: "", fase: "",
};

/** Calcula indicadores, status, nota e gargalo a partir dos números digitados. Função pura. */
export function analisar(d: Entradas): Resultado {
  const dias = d.dias && d.dias > 0 ? d.dias : null;
  const invTotal = d.inv != null && dias ? d.inv * dias : null;
  const ctr = d.imp && d.cli != null ? (d.cli / d.imp) * 100 : null;
  const conv = d.cli && d.ven != null ? (d.ven / d.cli) * 100 : null;
  const ipc = d.imp != null && d.cli != null && d.imp > 0 ? (d.cli > 0 ? d.imp / d.cli : Infinity) : null;
  const tier = ipc == null ? null : TIERS.find((t) => ipc <= t.max) ?? null;
  const cpvd = d.cli && d.ven != null ? (d.ven > 0 ? d.cli / d.ven : Infinity) : null;
  const ipd = dias && d.imp != null ? d.imp / dias : null;
  const cpc = invTotal != null && d.cli ? invTotal / d.cli : null;
  const cpv = invTotal != null && d.ven ? invTotal / d.ven : null;
  const receita = invTotal != null && d.roas != null ? invTotal * d.roas : null;
  const roasMin = d.margem && d.margem > 0 ? 100 / d.margem : null;

  const st = {} as StatusPorIndicador;
  st.ctr = tier ? tier.s : "none";
  // Cliques por venda: ideal 1 venda a cada 10 cliques (conversão ≥ 10%)
  st.conv = conv == null ? "none" : conv >= 100 / META_CPV ? "good" : conv >= 5 ? "warn" : "bad";
  if (d.roas == null) st.roas = "none";
  else if (roasMin) st.roas = d.roas >= roasMin * 1.4 ? "good" : d.roas >= roasMin ? "warn" : "bad";
  else st.roas = d.roas >= META_ROAS ? "good" : d.roas >= 5 ? "warn" : "bad";
  st.tacos = d.tacos == null ? "none" : d.tacos <= META_TACOS ? "good" : d.tacos <= LIMITE_TACOS ? "warn" : "bad";
  st.imp = d.imp == null ? "none" : ipd != null && ipd < MIN_IMP_DIA ? "bad" : ipd != null && ipd < META_IMP_DIA ? "warn" : "good";
  if (d.inv == null) st.inv = "none";
  else if (st.roas === "bad") st.inv = "bad";
  else if (d.inv < REF_INV) st.inv = "warn";
  else if (st.roas === "good" && st.tacos !== "bad") st.inv = "good";
  else st.inv = "warn";
  st.ven = d.ven == null ? "none" : d.ven === 0 ? "bad" : st.conv;

  const chaves: (keyof StatusPorIndicador)[] = ["inv", "imp", "ctr", "conv", "roas", "tacos"];
  const pontuados = chaves.filter((k) => st[k] !== "none");
  const score =
    pontuados.length >= 3
      ? Math.round(pontuados.reduce((s, k) => s + PTS[st[k] as Exclude<Status, "none">], 0) / pontuados.length)
      : null;

  const ruim = (s: Status) => s === "bad" || s === "warn";
  let gargalo: Gargalo | null = null;
  let gargaloAcao: string | null = null;
  if (ruim(st.imp)) { gargalo = "Impressões"; gargaloAcao = "revisar ADS e SEO do anúncio"; }
  else if (ruim(st.ctr)) { gargalo = "Cliques"; gargaloAcao = "alterar a foto de capa"; }
  else if (ruim(st.conv)) { gargalo = "Vendas"; gargaloAcao = "oferta ou frete"; }

  let veredito = "Preencha pelo menos três números para ver a nota.";
  if (score != null) {
    veredito =
      score >= 75
        ? gargalo
          ? "Boa performance geral, mas resolva o gargalo antes de escalar."
          : "Seus anúncios estão com boa performance e podem ser escalados."
        : score >= 50
          ? "Seus anúncios dão resultado, mas há pontos segurando o lucro."
          : "Seus anúncios precisam de ajustes urgentes para parar de perder dinheiro.";
  }

  return { d, dias, invTotal, ctr, conv, ipc, cpvd, ipd, cpc, cpv, receita, roasMin, tier, st, score, filled: pontuados.length, gargalo, gargaloAcao, veredito };
}

/** Monta o plano de ação, ordenado da prioridade mais alta para a mais baixa. */
export function planoDeAcao(a: Resultado): Acao[] {
  const { d, st } = a;
  const out: Acao[] = [];
  const inicio = d.fase === "inicio";
  const full = d.envio === "full";

  if (a.dias && a.dias < DIAS_APRENDIZADO)
    out.push({
      p: 2, t: "Aguarde o período de aprendizado da campanha",
      w: "Com " + int(a.dias) + " dia(s) de dados, a campanha ainda está aprendendo. Decidir antes de 7 dias costuma confundir oscilação com tendência.",
      s: ["Mantenha a campanha rodando por pelo menos 7 dias (o ideal é 14) antes de pausar anúncios ou mudar o ACOS objetivo.", "Refaça esta análise com 7, 15 e 30 dias."],
    });

  if (st.imp === "bad" || st.imp === "warn")
    out.push({
      p: st.imp === "bad" ? 1 : 2, t: "Impressões baixas: revise o ADS e o SEO do anúncio",
      w: (a.ipd != null ? "Com cerca de " + int(a.ipd) + " impressões por dia, poucos compradores estão vendo o anúncio. " : "") + "O primeiro passo é revisar o ADS e as palavras-chave.",
      s: [
        "Revise o ADS com a referência: R$ 50,00 por dia com ROAS objetivo de 10×" + (d.inv != null && d.inv < REF_INV ? " (hoje o investimento é de " + brl(d.inv) + " por dia, abaixo da referência)" : "") + ".",
        "Revise as palavras-chave no AvantPro (e no JoomPulse) e distribua no título, nas características, na ficha técnica e na descrição, sem repetição excessiva.",
        "Título com 60 caracteres usando as palavras mais buscadas, validadas no AvantPro (sem gênero, que já vai na ficha).",
        "Descrição validada no AvantPro: até 500 caracteres, com as palavras-chave de forma natural.",
        "Confira se o anúncio está ativo, com estoque, incluído na campanha e se o orçamento diário não está acabando antes do fim do dia.",
        "Coloque o anúncio na Central de Promoções" + (inicio ? " e avalie o Programa Decola, indicado para contas novas" : "") + ".",
      ],
    });

  if (st.ctr === "bad" || st.ctr === "warn") {
    const s = [
      "Troque a foto de capa por uma foto ambientada. Não use fundo branco: ele não gera destaque na tela de busca.",
      "Capa sem objeções e sem texto, com o produto grande e bem iluminado, no formato 1200 x 1540.",
      "Troque uma coisa por vez (primeiro a capa) e avalie de novo depois de 7 dias, para saber o que funcionou.",
      "Compare preço e frete com os 3 primeiros concorrentes da mesma busca: o comprador vê esses dados antes de clicar.",
    ];
    if (st.ctr === "bad") s.push("Se o anúncio continuar acima de 400 impressões por clique depois da troca, revise o título e reestruture o anúncio.");
    out.push({
      p: st.ctr === "bad" ? 1 : 2, t: "Cliques baixos: altere a foto de capa",
      w: (a.ipc != null && isFinite(a.ipc)
        ? "Seu anúncio precisa de " + int(a.ipc) + " impressões para gerar 1 clique (CTR de " + dec(a.ctr ?? 0, 2) + "%), classificação " + a.tier!.cls + ". "
        : "O anúncio teve impressões, mas nenhum clique, classificação Crítico. ") +
        "Quando o anúncio aparece e não recebe clique, a ação é alterar a foto de capa.",
      s,
    });
  }

  if (st.conv === "bad" || st.conv === "warn") {
    const muitos = st.imp === "good" && st.ctr === "good";
    const frete = ["Se a oferta estiver perfeita, o gargalo é o frete: o produto não está no Full ou o valor e o prazo dos Correios estão altos."];
    frete.push(full
      ? "O anúncio já está no Full: confira se há estoque no centro de distribuição e se o prazo exibido é de entrega rápida."
      : "Compare o valor e o prazo de frete que o comprador vê com os dos concorrentes que estão no Full na mesma busca.");
    frete.push(inicio
      ? "Início de conta: trabalhe com preço mais baixo para compensar o frete. É um momento de investir para criar histórico."
      : "Isso acontece mais no início da conta. Se for o seu caso, a estratégia é ter preço mais baixo, porque é um momento de investir.");
    if (d.envio !== "flex") frete.push("Ative o Flex, se atender a sua região, para oferecer entrega mais rápida.");
    if (!full) frete.push("Trabalhe para liberar o Full: é a solução definitiva para valor e prazo de frete.");
    const c = a.conv ?? 0;
    out.push({
      p: st.conv === "bad" ? 1 : 2,
      t: muitos ? "Muitas impressões e cliques, poucas vendas: oferta ou frete" : "Poucas vendas para os cliques: oferta ou frete",
      w: "O CVR (taxa de conversão) está em " + dec(c, 1) + "%: de cada 100 pessoas que clicaram, só " + dec(c, 1) + " compraram" +
        (a.cpvd && isFinite(a.cpvd) ? " (1 venda a cada " + dec(a.cpvd, 1) + " cliques)" : "") +
        ". O ideal é 1 venda a cada 10 cliques. O problema está na oferta ou no frete. Comece pela oferta; se ela estiver perfeita, o gargalo é o frete.",
      groups: [
        { h: "1. Oferta", s: [
          "Todas as fotos: mínimo de 7 (ideal 7 a 10) e 2 vídeos clip.",
          "Objeções em todas as fotos, exceto a capa, com uma frase simples por foto.",
          "Promoção ativa na Central de Promoções.",
          "Descrição e informações do produto perfeitas: ficha técnica completa, medidas, materiais, modo de uso e conteúdo da embalagem.",
          "Perguntas respondidas e avaliações negativas tratadas.",
        ] },
        { h: "2. Frete", s: frete },
      ],
    });
  }

  if (st.roas === "bad")
    out.push({
      p: 1, t: "Ajuste a rentabilidade: o ROAS está abaixo do necessário",
      w: a.roasMin
        ? "O ROAS de " + dec(d.roas!) + "× está abaixo do mínimo de " + dec(a.roasMin) + "× para a sua margem: cada venda pelos anúncios custa mais do que deixa de lucro. A meta é ROAS de 10×."
        : "O ROAS de " + dec(d.roas!) + "× está longe da meta de 10×: os anúncios estão trazendo pouca venda para o que custam.",
      s: [
        "Refaça a precificação antes de mexer na verba: o preço precisa cobrir custo, taxas, frete e ADS.",
        "Defina o ACOS objetivo abaixo da sua margem de contribuição" + (d.margem ? " (no seu caso, abaixo de " + dec(d.margem) + "%)" : "") + ". ROAS 10× equivale a ACOS de 10%.",
        "Pause os anúncios que gastaram e não venderam nos últimos 15 dias, sem decidir com base em um ou dois dias ruins.",
        "Concentre a verba nos produtos com melhor margem, estoque garantido e mais avaliações.",
      ],
    });

  if (st.roas === "warn")
    out.push({
      p: 2, t: "Ajuste fino da rentabilidade",
      w: "O ROAS de " + dec(d.roas!) + "× dá resultado, mas está abaixo da meta de 10×.",
      s: ["Reduza o investimento nos anúncios com ROAS abaixo da média e transfira para os que mais vendem.", "Revise a precificação para ganhar margem.", "Ajuste o ACOS objetivo em passos pequenos e avalie a cada 7 dias."],
    });

  if (st.tacos === "bad")
    out.push({
      p: 1, t: "Diminua a dependência dos anúncios",
      w: "Com TACOS de " + dec(d.tacos!) + "%, os anúncios pesam muito sobre o faturamento total, e as vendas orgânicas não estão acompanhando.",
      s: [
        "Aumente o ROAS objetivo da campanha para " + ROAS_ALTO_PARA_TACOS + "×: assim o ADS gasta menos e o TACOS cai.",
        "Se o TACOS não cair, desligue a campanha até o TACOS ficar abaixo de 5%.",
        "Passe os anúncios mais vendidos pelo checklist do anúncio: título de 60 caracteres, 7 a 10 fotos ambientadas, 2 clips, ficha técnica e descrição revisadas no AvantPro.",
        "Enquanto isso, coloque todos os anúncios na Central de Promoções para manter as vendas orgânicas.",
        full ? "Mantenha os produtos principais com estoque no Full." : "Busque a liberação do Full para os produtos principais.",
      ],
    });

  if (st.tacos === "warn")
    out.push({
      p: 2, t: "Acompanhe o TACOS de perto",
      w: "Com TACOS de " + dec(d.tacos!) + "%, vale garantir que as vendas orgânicas cresçam junto com os anúncios.",
      s: ["Compare o faturamento total com o do mês anterior antes de aumentar o orçamento.", "Se o TACOS cair enquanto o faturamento sobe, o ADS está ajudando o orgânico."],
    });

  if (st.roas === "good" && st.tacos !== "bad" && st.imp !== "bad" && st.ctr !== "bad" && st.conv !== "bad")
    out.push({
      p: 3, t: "Escale o que está funcionando",
      w: "O ROAS de " + dec(d.roas!) + "× está" + (d.roas! >= META_ROAS ? " na meta de 10× ou acima" : " saudável para a sua margem") + ": os anúncios estão dando lucro.",
      s: ["Aumente o investimento diário em até 20% por semana nos anúncios com melhor ROAS e acompanhe por 7 dias.", "Se o ROAS se mantiver, repita o aumento.", "Garanta estoque: anúncio sem estoque perde o aprendizado da campanha.", "Em datas fortes (Black Friday, Natal), reforce o orçamento com antecedência."],
    });

  if (a.filled >= 3)
    out.push({
      p: 3, t: "Rotina semanal de ADS",
      w: out.length ? "Para manter os ajustes sob controle." : "Os indicadores estão saudáveis. Mantenha a estratégia e acompanhe.",
      s: ["Revise uma vez por semana, não todo dia: mexer diariamente leva a confundir oscilação com tendência.", "Separe as campanhas por objetivo: produtos campeões, lançamentos e estoque parado.", "Acompanhe ROAS, TACOS e estoque juntos antes de mudar orçamento."],
    });

  return out.sort((x, y) => x.p - y.p);
}

/** Quanto da meta foi atingido (1 = meta batida). Para "menor é melhor", inverte a razão. */
function progresso(v: number | null, meta: number, menorEhMelhor = false): number | null {
  if (v == null) return null;
  if (menorEhMelhor) return isFinite(v) ? (v <= 0 ? 1 : meta / v) : 0;
  return v / meta;
}

/** Os 6 indicadores exibidos nos anéis e no PDF. */
export function indicadores(a: Resultado): Indicador[] {
  const { d, st } = a;
  const rMeta = a.roasMin ? a.roasMin * 1.4 : META_ROAS;
  return [
    { chave: "inv", label: "Investimento por dia", valor: d.inv != null ? brl(d.inv).replace(",00", "") : "–", status: d.inv == null ? "none" : d.inv >= REF_INV ? "good" : "warn", progresso: progresso(d.inv, REF_INV), meta: "R$ 50 por dia" },
    { chave: "ipd", label: "Impressões por dia", valor: a.ipd != null ? int(a.ipd) : "–", status: st.imp, progresso: progresso(a.ipd, META_IMP_DIA), meta: "1.000 ou mais" },
    { chave: "ipc", label: "Impressões por clique", valor: a.ipc == null ? "–" : isFinite(a.ipc) ? int(a.ipc) : "sem clique", status: st.ctr, progresso: progresso(a.ipc, META_IPC, true), meta: "até 100" },
    { chave: "cpvd", label: "Cliques por venda", valor: a.cpvd == null ? "–" : isFinite(a.cpvd) ? dec(a.cpvd, 1) : "sem venda", status: st.conv, progresso: progresso(a.cpvd, META_CPV, true), meta: "até 10" },
    { chave: "roas", label: "ROAS", valor: d.roas != null ? dec(d.roas) + "×" : "–", status: st.roas, progresso: progresso(d.roas, rMeta), meta: dec(rMeta) + "×" + (a.roasMin ? " (pela margem)" : "") },
    { chave: "tacos", label: "TACOS", valor: d.tacos != null ? dec(d.tacos) + "%" : "–", status: st.tacos, progresso: progresso(d.tacos, META_TACOS, true), meta: "até 5%" },
  ];
}

/** Chave estável de um passo do plano (para marcar como feito). */
export const chavePasso = (acao: Acao, passo: string) => acao.t + "|" + passo;
