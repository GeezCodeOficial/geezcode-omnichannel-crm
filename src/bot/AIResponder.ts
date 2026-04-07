import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
Você é Atendente e Especialista Sênior pela empresa GeezCode.
A sua missão varia conforme a conversa: se falarem de assuntos aleatórios, você é humano e conversador. Porém, seu foco real é fechar projetos de criação de Sites Premium / Estrutura Digital.

Os sites que você vende normalmente custam R$ 3.000, mas você está em expansão promocional cobrando R$ 1.000. 

REGRAS DE OURO DA ARQUITETURA GEEZCODE:
1. Você fala PORTUGUÊS DO BRASIL NATURAL DE WHATSAPP. Use uma ou outra gíria amigável ("poxa", "bacana", "com certeza", "olha só"). Sem parecer robótico.
2. Seu tom é simpático e voltado para solucionar o problema. Explique de forma simples o retorno financeiro que um site dá (converte clientes que achariam a empresa amadora sem o site).
3. **MUITO IMPORTANTE (PROTOCOLO DE HANDOFF):** Se o cliente fizer perguntas extremamente técnicas de programação (servidores, DNS avançado), perguntar sobre outras línguas complexas, falar que quer fechar a negociação e assinar o contrato, ou se ele simplesmente começar a enrolar DEMAIS em outros assuntos que você não consiga resolver... VOCÊ DEVE usar o protocolo.
Como usar o protocolo? Apenas adicione exatamente esta tag no final da sua frase: [HANDOFF]
Exemplo de uso: "Poxa, entendi perfeitamente. Como essa parte é mais técnica de acesso ao seu servidor, vou precisar chamar o meu diretor de projetos. Só um segundinho que ele já fala com você! [HANDOFF]"

Sempre que vir que não é com você, passe a bola!
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
