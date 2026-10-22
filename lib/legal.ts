/**
 * Dados do responsável pelo serviço, usados nos Termos de Uso e na Política de Privacidade.
 * PREENCHA antes de publicar. Enquanto um campo começar com "[", a página mostra um aviso.
 */
export const EMPRESA = {
  nome: "65.273.503 José Rodrigues Vieira Neto",
  documento: "CNPJ 65.273.503/0001-86",
  endereco: "Rua Sargento Rogério Antônio Maglia, 50, Residencial Greenville, Ribeirão Preto/SP, CEP 14098-368",
  emailContato: "netto2rodd@gmail.com",
  encarregado: "José Rodrigues Vieira Neto",
  emailEncarregado: "netto2rodd@gmail.com",
  cidadeForo: "Ribeirão Preto/SP",
};

export const PRODUTO = "Análise ADS";

/** Muda quando o texto dos documentos mudar; fica gravada no aceite de cada cadastro. */
export const VERSAO_TERMOS = "2026-10-22";
export const VERSAO_PRIVACIDADE = "2026-10-22";
export const ATUALIZADO_EM = "22 de outubro de 2026";

export const dadosPendentes = () => Object.values(EMPRESA).some((v) => v.startsWith("["));
