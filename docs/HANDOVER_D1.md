# 🛡️ GEEZCODE CRM OMNICHANNEL - Documentação Sênior de Construção (Handover D1)
**Autor:** José Frederico da Costa Silva (Fundador) & Engenheiro IA Avançado
**Data Base:** Abril de 2026
**Framework de Trabalho:** Produto SaaS B2B Escalável.

Esta documentação serve como o "Cérebro Matriz" para continuar o projeto amanhã sem perder nenhum contexto técnico. Apenas entregue este documento para a Inteligência Artificial na próxima sessão e use a frase: *"Leia este documento de Handover e continue os trabalhos"*.

---

## 1. A Torre de Comando (Arquitetura)
Saímos de um rascunho em SQLite local e construímos uma verdadeira **Máquina Cloud**.
- **Backend/API:** Node.js + Express (em TypeScript puro rodando via `tsx`).
- **Comunicação Real-Time:** WebSockets (`socket.io`) para o chat do Inbox.
- **Banco de Dados (Físico):** MongoDB Atlas Cloud (Onde dados nunca morrem caso o Render reinicie).
- **Robô WhatsApp:** `whatsapp-web.js` + `Puppeteer` (Rodando modo fantasma / headless verdadeiro para sanar a ausência de monitor na nuvem).
- **Hospedagem:** Render Cloud (Free Tier - 512MB RAM).

## 2. Injeções de Segurança Aplicadas (Hotfixes Críticos)
Durante a subida do foguete à nuvem, quatro barreiras de Nível Sênior foram vencidas:

1. **Combate ao OOM (Out Of Memory):** O Render cortou a energia da máquina porque o motor `ts-node` associado ao WhatsApp estourou o limite de 512MB RAM. Fizemos uma *Cirurgia de Motor*, substituindo o compilador TS nativo pelo **TSX (Esbuild)**, salvando a máquina para rodar no plano Free sem engasgar.
2. **Escudo do MongoDB Destravado:** O cluster "geezcode_crm_cloud" no MongoDB Atlas inicialmente bloqueou o servidor do Render. Fizemos a injeção da Regra Universal (`0.0.0.0/0`) no "Network Access" do Atlas, conectando o banco à rede mundial livre.
3. **Persistência Volátil do QR Code:** No começo, se o administrador abrisse a aba tarde demais, o QR Code de escaneamento desaparecia. Foi injetado um Padrão Gof (Cache) no `WhatsAppAgent.ts` para guardar a "foto" (`lastQrUrl`) do QR e cuspi-la automaticamente para os retardatários do Socket.io.
4. **Scraping Fantasma:** O extrator GoogleMaps tentou abrir uma janela e crashou a Matrix na nuvem porque estava como `headless: false`. Aplicamos `= true` garantindo a raspagem 100% invisível acoplada.

---

## 3. Chaves de Lançamento (Variáveis de Ambiente / .env)
Essas chaves devem VIVER NO RENDER E NO ARQUIVO LOCAL. **Nunca** suba isso em texto claro no Github. Ficam guardadas nos *Environment Variables* do Render:

- `MONGO_URI`: mongodb+srv://geezcodeoficial_db_user:cISWM2tMfI57Wupm@...
- `JWT_SECRET`: master-geezcode-omni-2026
- `ADMIN_PASSWORD`: Fred.1501
- `GEMINI_API_KEY`: AIzaSy...

**Acesso Blindado Oficial do Sistema V1:**
- **URL Base:** `https://geezcode-crm.onrender.com`
- **Login Inicial:** `admin@geezcode.com`
- **Senha:** `Fred.1501` ou `MudarSuaSenha123!` (dependendo do cache da máquina geradora).

---

## 4. O Sistema "Handoff" (Transbordo Lógico)
Essa é a funcionalidade Core Tech do projeto:
O WhatsApp lê as mensagens em uma fila. Ao entregar para o Google Gemini processar, se o cliente apresentar um cenário fora das diretrizes iniciais ou uma objeção complexa de venda de tráfego, a IA emite a Tag Secreta `[HANDOFF]`. O Robô detecta, cala a boca eternamente para aquele usuário específico e dispara um alarme no Dashboard. O Senhor José Frederico assume o painel manualmente pelo "Inbox".

---

## 5. Próximos Passos Imediatos (Para o Amanhã)
1. **Refino do Prompt Hacker do Gemini:** Mudar a mentalidade da IA para "Especialista em Venda de Sites/Tráfego para B2B".
2. **Estilização UI/UX:** Reforçar a tela do Inbox com Tailwind ou CSS avançado.
3. **Escalonamento:** Testar limites do Rate Limit e das Conexões WSS com 10+ usuários no frontend.
