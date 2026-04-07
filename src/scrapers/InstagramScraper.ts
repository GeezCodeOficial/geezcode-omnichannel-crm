import { Lead } from '../types/Lead';

/**
 * Instagram Validator
 * Simula a verificação de links associados ao Instagram (Linktree, forms)
 */
export class InstagramScraper {
  /**
   * Analisa a lista de leads gerada pelo Google Maps
   * Identifica se os que tem website usam Linktree em vez de dominio proprio
   */
  public async analyzeLeads(leads: Lead[]): Promise<Lead[]> {
    return leads.map(lead => {
      // Regra de Negócio: Se a falha já foi detectada (Sem Site), passamos reto
      if (lead.falhaDigitalDetectada !== 'Pendente Checagem Avançada') {
         return lead;
      }
      
      // Simulação Mock (Uma integração real usaria APi do IG ou webscraping por proxy)
      // Como a arquitetura requer velocidade, usamos uma lógica randômica para fins didáticos/prova de conceito V1
      const isUsingLinktree = Math.random() > 0.5;

      if (isUsingLinktree) {
        lead.falhaDigitalDetectada = 'Usa Linktree ou Site Lento no Instagram';
      } else {
        lead.falhaDigitalDetectada = 'Site Genérico não otimizado para Conversão';
      }

      return lead;
    });
  }
}
