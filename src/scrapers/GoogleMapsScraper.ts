import puppeteer, { Browser, Page } from 'puppeteer';
import { Lead } from '../types/Lead';

/**
 * Google Maps Scraper
 * Responsável por buscar empresas e levantar falhas primárias (ex: falta de web site)
 */
export class GoogleMapsScraper {
  /**
   * Executa a busca baseada na keyword e localidade
   * PT-BR: Inicia a instância do Puppeteer e coleta os contatos
   */
  public async execute(nicho: string, localidade: string): Promise<Lead[]> {
    const query = `${nicho} em ${localidade}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    
    // Configurações ULTRA-LEVES para não explodir servidores Cloud Grátis (RAM 512MB) com Wpp Rodando junto
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process', // A mais importante para Nuvem Free
        '--disable-software-rasterizer',
        '--disable-extensions'
      ]
    });

    try {
      const page: Page = await browser.newPage();
      
      // Simula Header real para diminuir blocks
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

      console.log(`[GoogleMaps] Acessando URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Aguardar renderização das divs de resultado (waitForTimeout foi descontinuado no Puppeteer 22+)
      await new Promise(resolve => setTimeout(resolve, 3000));

      
      // Aqui faríamos o scroll se fosse produção longa, mas extrairemos o primeiro batch para a V1.0
      const leads = await page.evaluate((cidadeStr) => {
        const results = Array.from(document.querySelectorAll('div[role="article"]'));
        return results.map(node => {
          const textContent = node.textContent || '';
          
          // Extrai possível nome a partir do arial-label
          const label = node.getAttribute('aria-label') || '';
          
          // Extrai o Rating (Regex simples para Ex: 4,5 ou 4.5)
          const ratingMatch = textContent.match(/(\d[,.]\d)\s*\(/);
          let rating = 0;
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1].replace(',', '.'));
          }
          
          // Verifica se há o botão/texto "Website" (Se não tem, é uma grande falha digital)
          const hasWebsite = textContent.includes('Website') || textContent.includes('Site');
          
          // Tenta extrair telefone (Formato BR Genérico)
          const phoneMatch = textContent.match(/(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))/);
          
          return {
            nomeEmpresa: label || 'Desconhecido',
            cidade: cidadeStr,
            contato: phoneMatch ? phoneMatch[0] : 'Não informado',
            falhaDigitalDetectada: hasWebsite ? 'Pendente Checagem Avançada' : 'Nenhum Website (Possível amadorismo digital)',
            linkReferencia: window.location.href, // Simplificação V1
            rating
          };
        });
      }, localidade);

      // Filtra leads: Foco total na presença digital (removemos o bloqueio de Nota > 3.5)
      const qualifiedLeads = leads
        .filter(l => l.nomeEmpresa !== 'Desconhecido')
        .filter(l => l.rating >= 0) // Aceita clientes sem nota ou com nota baixa (que mais precisam de site)
        .slice(0, 5); // Limita a 5 retornos para este prompt

      return qualifiedLeads;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[GoogleMaps Error]: ${err.message}`);
      }
      throw err;
    } finally {
      await browser.close(); // Memory leak prevention
    }
  }
}
