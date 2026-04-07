# 🛡️ GeezCode Omnichannel CRM & AI B2B Prospector

![Status](https://img.shields.io/badge/Status-Produ%C3%A7%C3%A3o-success)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

Este é um Produto SaaS desenvolvido por **José Frederico da Costa Silva** sob a idealização de sua futura startup de tecnologia, a **GeezCode**. A missão da plataforma é automatizar a prospecção B2B (Business-to-Business) utilizando Inteligência Artificial (Google Gemini) e integração Headless com WhatsApp Web.

Diferente de geradores de leads comuns, esta arquitetura atua como um Zendesk privado: ela minera os contatos, inicia a venda e, se a negociação atingir alta complexidade técnica, o robô faz o **"Handoff"** (Transbordo), calando o agente de IA e transferindo o controle do Socket Web para o painel de atendimento humano.

---

## 🚀 Arquitetural Preview (Visão Geral)

A arquitetura foi pensada em escalabilidade e segurança:
- **Backend Core**: Node.js com TypeScript (Strict Mode).
- **Banco de Dados**: Cluster MongoDB Atlas Nuvem (Mongoose ORM).
- **Segurança Borda**: JWT (JSON Web Tokens), `bcrypt` para hashes, `helmet` (segurança de cabeçalhos) e `express-rate-limit` (Firewall anti DDOS).
- **Rede Contínua**: WebSocket (Socket.io) para chat em tempo real sem F5.
- **Micro-WebScraping**: `Puppeteer` agindo sob o capô bypassando limitações de API.

---

## 🛠️ Tecnologias e Pré-Requisitos

Para rodar este projeto, a sua máquina (ou nuvem VPS) deve conter:
- Node.js `v18+`
- Docker & Docker Compose (Recomendado para Deploy)
- Chave de API do Google Gemini
- Conta Ativa no MongoDB Atlas

### 🔑 Arquivo `.env.example`
Para configurar seu ambiente, crie um `.env` puro na raiz do projeto com estas travas:
```env
GEMINI_API_KEY=AIzaSySuaChaveMestreAqui
MONGO_URI=mongodb+srv://user:senha@cluster0.exemplo.mongodb.net/geezcode_crm
JWT_SECRET=super-senha-segura-geezcode-2026
PORT=3000
```

---

## 🖥️ Guia de Deploy e Uso

### Instalação e Execução Local
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Inicie o sistema no modo Dev: `npm run dev` ou Execute o arquivo `AbrirGeradorB2B.bat` (Ambiente Windows).

### Execução Nuvem (Docker)
Este projeto foi embrulhado para a nuvem. Basta plugar o Dockerfile.
```bash
docker build -t geezcode-crm .
docker run -p 3000:3000 --env-file .env geezcode-crm
```

---

## 🧯 Troubleshooting e Erros Comuns

- **Bloqueio de IP no Mongo**: Se o seu sistema der erro `MongooseServerSelectionError`, significa que o firewall do MongoDB Cloud não autorizou o IP da sua máquina. Vá no painel do Mongo Atlas > Network Access e libere `0.0.0.0/0`.
- **Banimento / Queda do Puppeteer**: Em máquinas Linux limpas (Nuvem), certifique-se de que a biblioteca base de `libnss3` ou o pacote de browser headless foi instalado, fato já contornado usando nossa imagem `ghcr.io/puppeteer/puppeteer` no `Dockerfile`.

---
*Construído com sangue, suor, café e Engenharia Sênior.*
*Direitos Reservados - GeezCode Oficial 🛡️*
