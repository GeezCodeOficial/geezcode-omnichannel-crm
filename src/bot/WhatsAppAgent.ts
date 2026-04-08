import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { AIResponder } from './AIResponder';

export class WhatsAppAgent {
  private client: Client;
  private aiResponder: AIResponder;
  private lastQrUrl: string | null = null;
  private isReady: boolean = false;

  constructor() {
    this.aiResponder = new AIResponder();
    
    const execPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN;
    // Instancia o Client do WhatsApp com persistência de sessão para não pedir QR todo dia
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'geezcode-bot' }),
      puppeteer: {
        headless: true, // Aqui precisa rodar invisível no backend
        ...(execPath ? { executablePath: execPath } : {}),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      }
    });

    this.initializeEvents();
  }

  private initializeEvents() {
    this.client.on('qr', (qr) => {
      console.log('\n=============================================');
      console.log('🤖 AGENTE WHATSAPP REQUER LOGIN');
      console.log('Abra o seu WhatsApp no celular > Dispositivos Conectados > E escaneie este QR:');
      qrcode.generate(qr, { small: true });
      console.log('=============================================\n');
    });

    this.client.on('ready', () => {
      console.log('✅ O Agente Vendedor de WhatsApp da GeezCode está ONLINE e monitorando!');
    });

    this.client.on('message', async (message) => {
      // Evitar responder a si mesmo, postagens de status ou grupos
      if (message.isStatus || message.from === 'status@broadcast') return;

      const chat = await message.getChat();
      // Somente privado
      if (chat.isGroup) return;

      // 1. CHECAGEM BLINDADA: Verificar se este lead já está com o "Humano"
      const { isHandoff, setHandoff, saveMessage } = require('../db/database');
      const travaDeSeguranca = await isHandoff(message.from);

      // Salva a mensagem recebida no Banco SQlite
      await saveMessage(message.from, 'client', message.body);

      if (travaDeSeguranca) {
         // O Vendedor Humano está no controle pelo Inbox Dash. A IA Cale-se.
         return;
      }

      console.log(`\n💬 [ZAP] Cliente ${message.from} perguntou: ${message.body}`);

      // IA "Lendo..."
      await chat.sendStateTyping();

      try {
        let respostaDaIA: string = await this.aiResponder.handleMessage(message.from, message.body);
        
        // Verifica se a Inteligência sentiu necessidade de CHAMAR O DONO
        let modoEspera = false;
        if (respostaDaIA.includes('[HANDOFF]')) {
             respostaDaIA = respostaDaIA.replace('[HANDOFF]', '').trim();
             modoEspera = true;
        }

        setTimeout(async () => {
          await chat.clearState();
          await message.reply(respostaDaIA);
          
          await saveMessage(message.from, 'bot', respostaDaIA);

          // Se ativou o Handoff, TRAVA O ROBÔ PERMANENTEMENTE AQUI
          if (modoEspera) {
             console.log(`🚨 [HANDOFF ACIONADO] O Lead ${message.from} estourou o limite da IA. Assuma o Controle no Painel!`);
             await setHandoff(message.from, true);
          }

        }, 1500);

      } catch (err) {
         console.error('Falha ao processar AI e responder: ', err);
      }
    });
  }

  public async sendHumanMessage(phone: string, text: string) {
    const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    await this.client.sendMessage(chatId, text);
    const { saveMessage } = require('../db/database');
    await saveMessage(phone, 'human', text);
  }

  public boot(ioServer: any) {
    console.log('Iniciando pareamento com as torres do WhatsApp...');
    const { initDb } = require('../db/database');
    initDb().then(() => {
        this.client.initialize();
    });

    // Injeta envio de QR Code direto para o navegador de quem está locado no dashboard
    this.client.on('qr', async (qrRaw) => {
      try {
         const qrcode = require('qrcode');
         const url = await qrcode.toDataURL(qrRaw);
         this.lastQrUrl = url; // Guarda na memória pra quem entrar atrasado
         ioServer.emit('qr_code', { qrUrl: url });
      } catch (e) {
         console.error('Falha ao gerar DataURL do QR', e);
      }
    });

    this.client.on('ready', () => {
         this.isReady = true;
         this.lastQrUrl = null;
         ioServer.emit('whatsapp_ready', { status: 'online' });
    });

    // Quando o administrador abre a tela, enviamos o status atual imediatamente
    ioServer.on('connection', (socket: any) => {
        if (this.lastQrUrl) {
            socket.emit('qr_code', { qrUrl: this.lastQrUrl });
        }
        if (this.isReady) {
            socket.emit('whatsapp_ready', { status: 'online' });
        }
    });

    // Emite mensagens recebidas para a tela do Dashboard ao vivo
    this.client.on('message', async (msg) => {
       ioServer.emit('new_message', { phone: msg.from, body: msg.body, sender: 'client' });
    });
  }
}
