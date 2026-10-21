import type { Metadata } from "next";
import Link from "next/link";
import DocumentoLegal, { type SecaoLegal } from "@/components/DocumentoLegal";
import { EMPRESA, PRODUTO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade · Análise ADS",
  description: "Como o Análise ADS coleta, usa, guarda e protege seus dados pessoais, de acordo com a LGPD (Lei 13.709/2018).",
};

const SECOES: SecaoLegal[] = [
  {
    id: "quem-somos",
    titulo: "Quem é o responsável pelos seus dados",
    conteudo: (
      <>
        <p>
          Esta Política explica como o <strong>{PRODUTO}</strong> trata dados pessoais, nos termos da Lei Geral de Proteção de Dados
          Pessoais (Lei nº 13.709/2018, “LGPD”). O controlador dos dados, ou seja, quem decide sobre o tratamento, é{" "}
          <strong>{EMPRESA.nome}</strong>, inscrito sob o nº {EMPRESA.documento}, com endereço em {EMPRESA.endereco}.
        </p>
        <p>
          Encarregado pelo tratamento de dados (art. 41 da LGPD): <strong>{EMPRESA.encarregado}</strong>, pelo e-mail{" "}
          <a href={`mailto:${EMPRESA.emailEncarregado}`}>{EMPRESA.emailEncarregado}</a>. É por esse canal que você exerce seus direitos e tira dúvidas sobre privacidade.
        </p>
      </>
    ),
  },
  {
    id: "dados",
    titulo: "Quais dados coletamos",
    conteudo: (
      <>
        <p>Coletamos apenas o necessário para oferecer o serviço:</p>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome, e-mail e senha. A senha é guardada de forma criptografada (hash) pelo provedor de autenticação; nem nós temos acesso a ela.</li>
          <li><strong>Dados que você insere nas análises:</strong> nome da campanha ou produto e números do período (investimento, impressões, cliques, vendas, ROAS, TACOS, margem, modalidade de envio), além dos passos do plano de ação que você marca.</li>
          <li><strong>Registro do seu aceite:</strong> data, hora e versão dos Termos de Uso e desta Política que você aceitou ao criar a conta.</li>
          <li><strong>Dados da assinatura:</strong> situação do acesso (teste, ativo, inativo), datas de vencimento e anotações administrativas sobre o plano. Dados de cartão ou de pagamento são tratados diretamente pelo provedor de pagamento escolhido; não os armazenamos.</li>
          <li><strong>Dados técnicos e de acesso:</strong> endereço IP, data e hora de acesso, navegador e dispositivo, registrados pelos nossos provedores de hospedagem e autenticação para segurança e funcionamento do serviço.</li>
          <li><strong>Cookies e armazenamento local:</strong> veja a seção “Cookies”.</li>
        </ul>
        <p>Não coletamos dados pessoais sensíveis (art. 5º, II, da LGPD) e não pedimos dados de acesso à sua conta do Mercado Livre.</p>
      </>
    ),
  },
  {
    id: "finalidades",
    titulo: "Para que usamos e com qual base legal",
    conteudo: (
      <>
        <p>Cada uso tem uma base legal prevista no art. 7º da LGPD:</p>
        <div className="legal-tabela-wrap">
          <table className="legal-tabela">
            <thead><tr><th>Finalidade</th><th>Base legal</th></tr></thead>
            <tbody>
              <tr><td>Criar e manter sua conta, autenticar seu acesso, gerar e guardar suas análises e relatórios</td><td>Execução de contrato (art. 7º, V)</td></tr>
              <tr><td>Controlar o período de teste e a assinatura, liberar ou bloquear o acesso</td><td>Execução de contrato (art. 7º, V)</td></tr>
              <tr><td>Enviar e-mails do serviço: confirmação de cadastro, recuperação de senha, avisos sobre a conta</td><td>Execução de contrato (art. 7º, V)</td></tr>
              <tr><td>Prestar suporte, inclusive consultar suas análises quando você pedir ajuda</td><td>Execução de contrato (art. 7º, V) e legítimo interesse (art. 7º, IX)</td></tr>
              <tr><td>Garantir a segurança, prevenir fraudes e abusos, manter registros de acesso</td><td>Legítimo interesse (art. 7º, IX) e cumprimento de obrigação legal (art. 7º, II; art. 15 do Marco Civil da Internet)</td></tr>
              <tr><td>Guardar registros fiscais e contábeis de pagamentos</td><td>Cumprimento de obrigação legal (art. 7º, II)</td></tr>
              <tr><td>Defender nossos direitos em processos judiciais, administrativos ou arbitrais</td><td>Exercício regular de direitos (art. 7º, VI)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Não vendemos seus dados, não os usamos para publicidade de terceiros e não tomamos decisões automatizadas que afetem seus interesses
          com base neles. A nota e o plano de ação são cálculos feitos sobre os números que você mesmo informa, apenas para lhe mostrar o resultado.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos",
    conteudo: (
      <>
        <p>Compartilhamos dados apenas com fornecedores (operadores) necessários para o serviço funcionar, que tratam os dados conforme nossas instruções:</p>
        <ul>
          <li><strong>Supabase:</strong> banco de dados e autenticação (cadastro, login, análises).</li>
          <li><strong>Vercel:</strong> hospedagem do site e das funções do sistema.</li>
          <li><strong>Provedor de envio de e-mails:</strong> e-mails de confirmação, recuperação de senha e avisos.</li>
          <li><strong>Provedor de pagamento:</strong> processamento da assinatura, quando houver.</li>
          <li><strong>Google Fonts:</strong> as fontes do site são carregadas dos servidores do Google, que recebem seu endereço IP para entregá-las.</li>
        </ul>
        <p>
          Também podemos compartilhar dados quando a lei exigir ou por ordem de autoridade competente, e em caso de reorganização societária,
          sempre mantendo a proteção prevista nesta Política.
        </p>
        <p>
          Dentro da nossa equipe, apenas pessoas autorizadas acessam dados de clientes, e somente para suporte, segurança e gestão da assinatura.
        </p>
      </>
    ),
  },
  {
    id: "transferencia",
    titulo: "Transferência internacional",
    conteudo: (
      <p>
        Alguns fornecedores mantêm servidores ou equipes fora do Brasil, então parte dos dados pode ser processada no exterior. Essas transferências
        seguem o art. 33 da LGPD e ocorrem com fornecedores que oferecem garantias contratuais de proteção de dados, como cláusulas padrão e
        compromissos de segurança. Sempre que possível, usamos servidores localizados no Brasil.
      </p>
    ),
  },
  {
    id: "retencao",
    titulo: "Por quanto tempo guardamos",
    conteudo: (
      <>
        <ul>
          <li><strong>Conta e análises:</strong> enquanto sua conta existir. Se você pedir a exclusão, apagamos sua conta e suas análises em até 30 dias.</li>
          <li><strong>Registros de acesso:</strong> por 6 meses, como exige o art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).</li>
          <li><strong>Registros de pagamento:</strong> pelo prazo exigido pela legislação fiscal e contábil.</li>
          <li><strong>Registro de aceite dos documentos:</strong> enquanto a conta existir e pelo prazo necessário para comprovar o consentimento ou nos defender em eventual disputa.</li>
        </ul>
        <p>Terminado o prazo, os dados são eliminados ou anonimizados, salvo as exceções do art. 16 da LGPD.</p>
      </>
    ),
  },
  {
    id: "direitos",
    titulo: "Seus direitos",
    conteudo: (
      <>
        <p>Pelo art. 18 da LGPD, você pode, a qualquer momento e sem custo:</p>
        <ul>
          <li>confirmar se tratamos seus dados e acessá-los;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados (nome e senha podem ser alterados em “Minha conta”);</li>
          <li>pedir anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;</li>
          <li>pedir a portabilidade dos seus dados a outro fornecedor;</li>
          <li>pedir a eliminação dos dados tratados com base no seu consentimento;</li>
          <li>saber com quem compartilhamos seus dados;</li>
          <li>ser informado sobre a possibilidade de não consentir e suas consequências, e revogar o consentimento;</li>
          <li>pedir a exclusão da sua conta;</li>
          <li>apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>
          Para exercer qualquer direito, escreva para <a href={`mailto:${EMPRESA.emailEncarregado}`}>{EMPRESA.emailEncarregado}</a>. Podemos pedir
          informações para confirmar sua identidade. Respondemos à confirmação de existência e ao acesso de forma simplificada imediatamente, ou
          com declaração completa em até 15 dias, como prevê o art. 19 da LGPD.
        </p>
      </>
    ),
  },
  {
    id: "seguranca",
    titulo: "Como protegemos seus dados",
    conteudo: (
      <>
        <p>Adotamos medidas técnicas e administrativas para proteger seus dados (art. 46 da LGPD), entre elas:</p>
        <ul>
          <li>conexão criptografada (HTTPS) em todo o site;</li>
          <li>isolamento dos dados no banco: cada cliente só consegue ler e alterar as próprias análises, por regras aplicadas no próprio banco de dados;</li>
          <li>senhas guardadas apenas em formato criptografado pelo provedor de autenticação;</li>
          <li>acesso administrativo restrito a pessoas autorizadas e chaves de acesso mantidas fora do código.</li>
        </ul>
        <p>
          Nenhum sistema é totalmente imune a incidentes. Se ocorrer um incidente de segurança que possa causar risco ou dano relevante a você,
          comunicaremos você e a ANPD, como determina o art. 48 da LGPD.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    titulo: "Cookies",
    conteudo: (
      <>
        <p>Usamos somente o necessário para o site funcionar:</p>
        <ul>
          <li><strong>Cookies de sessão (essenciais):</strong> mantêm você conectado depois do login. Sem eles, não é possível usar a área logada.</li>
          <li><strong>Armazenamento local do navegador:</strong> guarda sua preferência de tema (claro, escuro ou automático).</li>
        </ul>
        <p>Não usamos cookies de publicidade nem de rastreamento de terceiros. Você pode apagar cookies nas configurações do navegador, mas será desconectado.</p>
      </>
    ),
  },
  {
    id: "menores",
    titulo: "Crianças e adolescentes",
    conteudo: (
      <p>
        O {PRODUTO} é destinado a maiores de 18 anos que vendem pela internet. Não coletamos intencionalmente dados de crianças e adolescentes.
        Se identificarmos um cadastro nessa situação, a conta será excluída.
      </p>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Alterações desta Política",
    conteudo: (
      <p>
        Podemos atualizar esta Política para refletir mudanças no serviço ou na lei. A data da última atualização fica no topo da página. Mudanças
        relevantes serão avisadas por e-mail ou dentro do sistema e, quando a lei exigir, pediremos um novo aceite. Veja também os{" "}
        <Link href="/termos">Termos de Uso</Link>.
      </p>
    ),
  },
  {
    id: "contato",
    titulo: "Contato",
    conteudo: (
      <p>
        Dúvidas sobre esta Política ou sobre seus dados: encarregado <strong>{EMPRESA.encarregado}</strong>,{" "}
        <a href={`mailto:${EMPRESA.emailEncarregado}`}>{EMPRESA.emailEncarregado}</a>. Outros assuntos:{" "}
        <a href={`mailto:${EMPRESA.emailContato}`}>{EMPRESA.emailContato}</a>.
      </p>
    ),
  },
];

export default function Privacidade() {
  return (
    <DocumentoLegal
      titulo="Política de Privacidade"
      resumo={
        <p>
          <strong>Em resumo:</strong> usamos seu nome, e-mail e os números que você digita apenas para fazer o {PRODUTO} funcionar. Não vendemos seus
          dados, não usamos publicidade de terceiros e você pode pedir acesso, correção ou exclusão quando quiser.
        </p>
      }
      secoes={SECOES}
    />
  );
}
