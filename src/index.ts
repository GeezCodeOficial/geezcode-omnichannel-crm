import { program } from 'commander';
import { GoogleMapsScraper } from './scrapers/GoogleMapsScraper';
import { InstagramScraper } from './scrapers/InstagramScraper';
import { Copywriter } from './generators/Copywriter';
import { writeFile } from 'fs/promises';

program
  .name('b2b-lead-gen')
  .description('Robô em Puppeteer/TS para gerar tabelas de Leads B2B a frio')
  .version('1.0.0');

program
  .requiredOption('-n, --nicho <type>', 'O Nicho a ser buscado (ex: Dentistas)')
  .requiredOption('-l, --localidade <type>', 'A Localidade alvo (ex: Sao Paulo)');

program.action(async (options) => {
  const { nicho, localidade } = options;
  console.log(`\n🤖 [ENGINE INICIADO]: Buscando leads B2B preenchendo: ${nicho} em ${localidade}...\n`);

  try {
    // 1. Scraping no Maps
    const mapsScraper = new GoogleMapsScraper();
    const rawLeads = await mapsScraper.execute(nicho, localidade);

    if (rawLeads.length === 0) {
      console.log('Nenhum lead com nota >= 3.5 identificado nesta query. Tente outra!');
      return;
    }

    // 2. Análise do Instagra/Site (Detecção da Falha)
    const igScraper = new InstagramScraper();
    const finalLeads = await igScraper.analyzeLeads(rawLeads);

    // 3. Geração de Textos
    const copyEngine = new Copywriter();
    const mdTable = copyEngine.generateMarkdownTable(finalLeads);
    const bestLead = finalLeads[0];
    const bestLeadMsg = copyEngine.generateColdMessage(bestLead);

    // Exibição Final
    console.log(`\n=================== RELATÓRIO OBTIDO ===================\n`);
    console.log(mdTable);
    console.log(`\n================= COLD MESSAGE (MELHOR LEAD) =================\n`);
    console.log(bestLeadMsg);
    
    // Saving to output.md for user archival purposes
    await writeFile('output.md', mdTable + '\n\n## Mensagem\n\n```text\n' + bestLeadMsg + '\n```', 'utf-8');
    console.log(`\n📁 Arquivo salvo em 'output.md'.\n`);

  } catch (err) {
    console.error('Falha Global no CLI: ', err);
  }
});

program.parse();
