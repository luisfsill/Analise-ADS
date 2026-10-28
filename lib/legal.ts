/**
 * Dados do responsável pelo serviço, usados nos Termos de Uso e na Política de Privacidade.
 * PREENCHA antes de publicar. Enquanto um campo começar com "[", a página mostra um aviso.
 */
export const EMPRESA = {
  nome: "Análise ADS",
  documento: "[CNPJ a informar]",
  endereco: "[endereço a informar]",
  emailContato: "suporte@analiseads.com",
  encarregado: "Análise ADS",
  emailEncarregado: "suporte@analiseads.com",
  cidadeForo: "Ribeirão Preto/SP",
};

export const PRODUTO = "Análise ADS";

/** Muda quando o texto dos documentos mudar; fica gravada no aceite de cada cadastro. */
export const VERSAO_TERMOS = "2026-10-22";
export const VERSAO_PRIVACIDADE = "2026-10-22";
export const ATUALIZADO_EM = "22 de outubro de 2026";

export const dadosPendentes = () => Object.values(EMPRESA).some((v) => v.startsWith("["));
