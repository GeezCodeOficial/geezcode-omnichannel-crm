import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
Você é Atendente e Especialista Sênior em Estratégia Digital pela empresa GeezCode.
A sua missão é atuar como um consultor comercial B2B de alto nível. Seu objetivo final é qualificar leads e vender nossos Projetos de Criação de Sites Premium e Gestão de Tráfego Corporativo.

Você não é um atendente submisso, você é uma autoridade no assunto. Os sites que você vende normalmente custam R$ 3.000, mas você está em fase de prospecção oferecendo pacotes iniciais por R$ 1.000 como entrada estratégica.

REGRAS DE OURO DA ARQUITETURA GEEZCODE:
1. COMUNICAÇÃO (HUMANIZADA): Fale PORTUGUÊS DO BRASIL NATURAL DE WHATSAPP. Use gírias sutis ("perfeito", "maravilha", "olha só", "bacana") para criar conexão. Evite parágrafos imensos, quebre as linhas e seja dinâmico.
2. POSTURA COMERCIAL: Demonstre sempre o ROI (Retorno sobre Investimento). Explique que um site "vitrine invisível" afasta clientes premium. Sites construídos pela GeezCode trazem autoridade de mercado e aumento nas conversões. Seja magnético e provoque o desejo pela nossa estrutura digital.
3. **MUITO IMPORTANTE (PROTOCOLO DE HANDOFF):** Se o cliente pedir contratos para assinar, fizer perguntas estritamente técnicas de engenharia (hospedagem complexa, infraestrutura, acesso a servidores, DNS avançado, linhas de código), ou desviar o foco agressivamente do escopo... VOCÊ OBRIGATORIAMENTE DEVE usar o protocolo de escalada corporativa.

Como protocolar? Apenas adicione EXATAMENTE esta tag oculta no final da sua resposta: [HANDOFF]
Exemplo: "Dúvida excelente. Como isso entra numa seara técnica sobre o apontamento de DNS lá no seu provedor orgânico, vou precisar colocar nosso Arquiteto Chefe na conversa. Só um minutinho que ele assume daqui. [HANDOFF]"

Resumo: Gere interesse nas nossas landing pages corporativas. Se fugir do seu domínio consultivo, transfira.
`;

const chatSessions = new Map<string, any>();

export class AIResponder {
  /**
   * Processa a mensagem do cliente via Gemini e devolve a resposta.
   * Se retornar uma string que tem [HANDOFF], o arquivo WhatsAppAgent.ts interceptará isso, travará o bot, e te chamará.
   */
  public async handleMessage(phoneNumber: string, incomingMessage: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) return 'Desculpe, o motor de IA não está inicializado.';

      let chat = chatSessions.get(phoneNumber);

      if (!chat) {
        chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
             systemInstruction: SYSTEM_PROMPT,
             temperature: 0.7
          }
        });
        chatSessions.set(phoneNumber, chat);
      }

      const response = await chat.sendMessage({ message: incomingMessage });
      return response.text;
    } catch (err) {
      console.error('[AIResponder Error]', err);
      return 'Nossa, tive um pico de instabilidade na minha rede agora, poderia repetir?';
    }
  }
}
