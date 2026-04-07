FROM ghcr.io/puppeteer/puppeteer:latest

# Voltando p/ Administrador para Instalação de Ferramentas
USER root

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia do resto das pastas
COPY . .

# Docker precisa rodar o servidor em TypeScript
RUN npm install -g typescript ts-node

EXPOSE 3000

# Volta pro usuário de menor privilégio por exigência técnica do Chrome/Render
RUN chown -R pptruser:pptruser /app
USER pptruser

# Comando de Combate
CMD ["npx", "ts-node", "src/server.ts"]
