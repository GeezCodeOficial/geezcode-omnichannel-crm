import { Lead } from '../types/Lead';

export class Copywriter {
  /**
   * Constrói a mensagem "Cold Email" (ou Cold WhatsApp Message)
   * Baseado na metodologia Loss Aversion (Aversão à perda)
   */
  public generateColdMessage(lead: Lead): string {
    const nomeComercial = lead.nomeEmpresa || 'Responsável';

    const failMap: Record<string, string> = {
      'Nenhum Website (Possível amadorismo digital)': 'notei que vocês ainda não possuem um site profissional próprio, o que joga muito potencial cliente para a concorrência após eles verem o Google Maps de vocês',
      'Usa Linktree ou Site Lento no Instagram': 'percebi que estão usando um Linktree no perfil, o que infelizmente corta a retenção e tira aquele aspecto de exclusividade/premium do negócio',
      'Site Genérico não otimizado para Conversão': 'o site de vocês está legalzinho, mas não está engatilhado para conversão direta pelo celular'
    };

    const painPoint = failMap[lead.falhaDigitalDetectada] || 'notei que a estrutura digital de vocês não reflete o quão bons vocês são no mundo físico (vi as avaliações altas!)';

    return `Fala pessoal da ${nomeComercial}, tudo bem?
Dando uma garimpada rápida no Google Maps aqui em ${lead.cidade}, encontrei vocês!
Porém, sendo bem direto e profissional: ${painPoint}.

Sou o responsável pela GeezCode e construo Estruturas Digitais Premium para negócios que querem parar de perder vendas na internet. Eu pego o projeto do zero, faço UX Design, Copywriting e Estruturação de Conversão.

Normalmente, um projeto de alto nível como esse fica em torno de R$ 3.000. Mas, como estou ativamente expandindo minha carteira de grandes parceiros, estou com uma condição promocional fechando por volta de R$ 1.000 (valor que podemos negociar numa boa para fecharmos negócio!).

Topam um bate-papo super rápido amanhã, sem compromisso, só pra eu mostrar como podemos virar o jogo de vendas da ${nomeComercial}?
Abraços.`;
  }

  /**
   * Gera uma tabela em Markdown com base no prompt
   */
  public generateMarkdownTable(leads: Lead[]): string {
    let md = `| Empresa | Cidade | Contato (WhatsApp) | Falha Digital Detectada | Link de Referência |\n`;
    md += `|---|---|---|---|---|\n`;

    leads.forEach(l => {
      // Usa MD puro para tabela
      md += `| **${l.nomeEmpresa}** | ${l.cidade} | ${l.contato} | ❌ *${l.falhaDigitalDetectada}* | [Link](${l.linkReferencia}) |\n`;
    });

    return md;
  }
}
