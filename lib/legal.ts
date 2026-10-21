/**
 * Dados do responsável pelo serviço, usados nos Termos de Uso e na Política de Privacidade.
 * PREENCHA antes de publicar. Enquanto um campo começar com "[", a página mostra um aviso.
 */
export const EMPRESA = {
  nome: "[Razão social ou nome completo do responsável]",
  documento: "[CNPJ ou CPF]",
  endereco: "[Endereço completo, cidade/UF, CEP]",
  emailContato: "[e-mail de contato]",
  encarregado: "[Nome do encarregado de dados (DPO)]",
  emailEncarregado: "[e-mail do encarregado]",
  cidadeForo: "[Cidade/UF]",
};

export const PRODUTO = "Análise ADS";

/** Muda quando o texto dos documentos mudar; fica gravada no aceite de cada cadastro. */
export const VERSAO_TERMOS = "2026-10-21";
export const VERSAO_PRIVACIDADE = "2026-10-21";
export const ATUALIZADO_EM = "21 de outubro de 2026";

export const dadosPendentes = () => Object.values(EMPRESA).some((v) => v.startsWith("["));
