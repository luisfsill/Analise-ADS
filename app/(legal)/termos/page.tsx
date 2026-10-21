import type { Metadata } from "next";
import Link from "next/link";
import DocumentoLegal, { type SecaoLegal } from "@/components/DocumentoLegal";
import { EMPRESA, PRODUTO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso · Análise ADS",
  description: "Regras de uso do Análise ADS: conta, teste grátis, assinatura, responsabilidades e direitos.",
};

const SECOES: SecaoLegal[] = [
  {
    id: "aceite",
    titulo: "Aceite destes Termos",
    conteudo: (
      <>
        <p>
          Estes Termos de Uso regulam o uso do <strong>{PRODUTO}</strong>, oferecido por <strong>{EMPRESA.nome}</strong>, inscrito sob o nº{" "}
          {EMPRESA.documento}, com endereço em {EMPRESA.endereco} (“nós”).
        </p>
        <p>
          Ao criar uma conta, você declara que leu, entendeu e aceita estes Termos e a <Link href="/privacidade">Política de Privacidade</Link>. O
          aceite é registrado com data, hora e versão dos documentos. Se não concordar, não crie a conta nem use o serviço.
        </p>
      </>
    ),
  },
  {
    id: "servico",
    titulo: "O que é o serviço",
    conteudo: (
      <>
        <p>
          O {PRODUTO} é uma ferramenta online que, a partir dos números que você informa sobre suas campanhas de anúncios, calcula uma nota de 0 a
          100, aponta o gargalo do funil, mostra indicadores comparados a metas de referência e sugere um plano de ação. Também permite salvar o
          histórico e gerar relatórios em PDF.
        </p>
        <p>
          O {PRODUTO} é independente e <strong>não tem vínculo com o Mercado Livre</strong> nem com outras plataformas citadas. Os nomes dessas
          plataformas são usados apenas para identificar os canais de venda analisados e pertencem aos seus titulares.
        </p>
      </>
    ),
  },
  {
    id: "conta",
    titulo: "Sua conta",
    conteudo: (
      <ul>
        <li>Para usar o serviço, você precisa ter pelo menos 18 anos e capacidade para contratar.</li>
        <li>Os dados do cadastro devem ser verdadeiros e mantidos atualizados.</li>
        <li>A conta é pessoal. Você é responsável por manter sua senha em sigilo e por tudo o que for feito com o seu acesso. Avise-nos imediatamente se suspeitar de uso indevido.</li>
        <li>Não é permitido compartilhar a mesma conta entre pessoas ou empresas diferentes sem a nossa autorização.</li>
      </ul>
    ),
  },
  {
    id: "teste-assinatura",
    titulo: "Teste grátis, assinatura e cancelamento",
    conteudo: (
      <>
        <h3>Teste grátis</h3>
        <p>Novas contas têm 7 dias de teste grátis, sem cartão de crédito. Ao fim do teste, você continua podendo entrar, mas para criar e editar análises é preciso assinar.</p>
        <h3>Assinatura</h3>
        <p>
          Os planos, preços e formas de pagamento são os informados na página de planos e no checkout no momento da contratação. A assinatura
          vale pelo período contratado. Ao vencer sem renovação, o acesso para criar e editar análises é suspenso, mas suas análises continuam
          guardadas e você volta a usá-las ao renovar.
        </p>
        <h3>Direito de arrependimento</h3>
        <p>
          Por ser uma contratação feita pela internet, você pode desistir em até 7 dias a contar da contratação, com devolução integral do valor
          pago, como garante o art. 49 do Código de Defesa do Consumidor. Basta escrever para{" "}
          <a href={`mailto:${EMPRESA.emailContato}`}>{EMPRESA.emailContato}</a>.
        </p>
        <h3>Cancelamento</h3>
        <p>Você pode cancelar a renovação a qualquer momento. O acesso continua até o fim do período já pago. Fora do prazo de arrependimento, não há devolução proporcional do período em curso, salvo previsão diferente na oferta contratada.</p>
        <h3>Mudança de preço</h3>
        <p>Podemos alterar os preços dos planos. Assinaturas em curso mantêm o valor até o fim do período contratado, e você será avisado com antecedência antes de qualquer renovação com valor novo.</p>
      </>
    ),
  },
  {
    id: "uso",
    titulo: "Uso permitido",
    conteudo: (
      <>
        <p>Você se compromete a usar o serviço de forma lícita e a não:</p>
        <ul>
          <li>copiar, revender, sublicenciar ou disponibilizar o serviço a terceiros sem autorização;</li>
          <li>tentar acessar dados de outros usuários, áreas restritas ou burlar limites e medidas de segurança;</li>
          <li>fazer engenharia reversa, extrair dados em massa ou usar robôs e automações que sobrecarreguem o sistema;</li>
          <li>inserir conteúdo ilegal, ofensivo, que viole direitos de terceiros ou códigos maliciosos;</li>
          <li>usar o serviço para qualquer fim que viole a lei ou estes Termos.</li>
        </ul>
      </>
    ),
  },
  {
    id: "natureza",
    titulo: "Natureza das análises",
    conteudo: (
      <>
        <p>
          As notas, indicadores e planos de ação são <strong>referências gerais e informativas</strong>, calculadas exclusivamente sobre os números
          que você digita. Eles não consideram todas as particularidades do seu negócio, da sua categoria ou das regras das plataformas, que
          mudam com o tempo.
        </p>
        <p>
          O resultado das suas vendas depende de muitos fatores fora do nosso controle. Por isso, <strong>não garantimos aumento de vendas,
          lucro ou qualquer resultado</strong>. As decisões sobre investimento, preço e campanhas são sempre suas. A exatidão das análises
          depende da exatidão dos números informados.
        </p>
      </>
    ),
  },
  {
    id: "propriedade",
    titulo: "Propriedade intelectual",
    conteudo: (
      <p>
        O software, a marca, o visual, os textos, as regras de diagnóstico e os demais elementos do {PRODUTO} são de nossa titularidade ou
        licenciados para nós, e são protegidos por lei. Estes Termos dão a você apenas uma licença pessoal, limitada, não exclusiva e
        intransferível para usar o serviço enquanto sua conta estiver ativa.
      </p>
    ),
  },
  {
    id: "dados",
    titulo: "Seus dados e conteúdos",
    conteudo: (
      <p>
        As informações que você insere continuam sendo suas. Você nos autoriza a tratá-las apenas para prestar o serviço, como descrito na{" "}
        <Link href="/privacidade">Política de Privacidade</Link>, que faz parte destes Termos. Você pode baixar seus relatórios em PDF e pedir a
        exclusão da conta a qualquer momento.
      </p>
    ),
  },
  {
    id: "disponibilidade",
    titulo: "Disponibilidade e mudanças no serviço",
    conteudo: (
      <p>
        Trabalhamos para manter o serviço disponível e seguro, mas ele pode ficar fora do ar por manutenções, atualizações, falhas de
        fornecedores ou motivos de força maior. Podemos melhorar, alterar ou descontinuar funcionalidades. Mudanças que reduzam de forma
        relevante o que foi contratado serão avisadas com antecedência e, se você não concordar, poderá cancelar com devolução proporcional
        do período não usado.
      </p>
    ),
  },
  {
    id: "suspensao",
    titulo: "Suspensão e encerramento",
    conteudo: (
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos ou a lei, que tragam risco à segurança do serviço ou de outros usuários, ou
        em caso de fraude no pagamento, comunicando o motivo quando possível. Você pode encerrar sua conta quando quiser. Após o encerramento,
        os dados são tratados conforme a Política de Privacidade.
      </p>
    ),
  },
  {
    id: "responsabilidade",
    titulo: "Limitação de responsabilidade",
    conteudo: (
      <>
        <p>
          Na máxima extensão permitida pela lei, não respondemos por decisões comerciais tomadas com base nas análises, por resultados de
          vendas, por perdas causadas por números informados de forma incorreta, por falhas de serviços de terceiros (como plataformas de venda,
          provedores de internet e de pagamento), nem por uso indevido da sua conta decorrente de falta de cuidado com a senha.
        </p>
        <p>Nada nestes Termos limita os direitos que o Código de Defesa do Consumidor garante a você quando a relação for de consumo.</p>
      </>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Alterações destes Termos",
    conteudo: (
      <p>
        Podemos atualizar estes Termos. A data da última atualização fica no topo da página. Mudanças relevantes serão avisadas por e-mail ou
        dentro do sistema com antecedência razoável e, quando necessário, pediremos um novo aceite. Continuar usando o serviço depois do aviso
        significa concordar com a nova versão.
      </p>
    ),
  },
  {
    id: "lei",
    titulo: "Lei aplicável e foro",
    conteudo: (
      <p>
        Estes Termos seguem as leis brasileiras. Para consumidores, fica eleito o foro do domicílio do consumidor. Nos demais casos, fica eleito
        o foro da comarca de {EMPRESA.cidadeForo}. Antes de qualquer medida, procure-nos: a maioria das questões se resolve por conversa.
      </p>
    ),
  },
  {
    id: "contato",
    titulo: "Contato",
    conteudo: (
      <p>
        Dúvidas, cancelamentos ou pedidos: <a href={`mailto:${EMPRESA.emailContato}`}>{EMPRESA.emailContato}</a>. Assuntos de privacidade e
        dados pessoais: <a href={`mailto:${EMPRESA.emailEncarregado}`}>{EMPRESA.emailEncarregado}</a>.
      </p>
    ),
  },
];

export default function Termos() {
  return (
    <DocumentoLegal
      titulo="Termos de Uso"
      resumo={
        <p>
          <strong>Em resumo:</strong> você tem 7 dias grátis e depois assina para continuar. As análises são referências calculadas sobre os
          números que você informa e não garantem resultados. Você pode desistir em até 7 dias da contratação e cancelar quando quiser.
        </p>
      }
      secoes={SECOES}
    />
  );
}
