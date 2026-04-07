# Architecture: Lead Generation Engine V1.0

## Visão Geral (Overview)
A arquitetura do motor de extração foca na automação de buscas via navegador utilizando o Puppeteer, que emula uma navegação real para superar desafios com endpoints que exigem autenticação ou reCAPTCHAs de forma moderada.

### O Fluxo (The Flow)
1. **Entrada CLI**: Parâmetros de `--nicho` e `--localidade` injetam o escopo de busca.
2. **Google Maps Scraper**: Extrai a lista do Gmaps avaliando:
   - Nota (Rating) >= 3.5.
   - Presença (ou ausência) de link/website.
3. **Instagram Scraper**: Para as empresas extraídas (seus nomes/links), busca identificar o perfil no Instagram para verificar se usam **Linktree** ou links diretos para WhatsApp (sintoma de falha digital/ausência de domínio próprio).
4. **Copywriting Engine**: Utiliza as falhas digitais detectadas e formula uma "Cold Message" focada na psicologia estruturada de 'Gain/Loss' em português do Brasil, estimulando a contratação imediata pelo B2B Lead.

## Justificativa Tecnológica (Tech Stack Rationalization)
- **TypeScript**: Abordagem `no-any` evita exceções não tratadas durante o scraping, onde seletores do DOM são imprevisíveis e frequentemente nulos.
- **Puppeteer-Core / Puppeteer**: Necessário para visualização em modo 'headless' das listagens dinâmicas do Google/React.
- **Node.js**: Plataforma agnóstica para rotinas de I/O bloqueantes e assíncronas de longa duração necessárias para manipulação de Headless Browser.
