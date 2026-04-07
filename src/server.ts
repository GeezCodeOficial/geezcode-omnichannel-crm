import express from 'express';
import cors from 'cors';
import open from 'open';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server } from 'socket.io';

import { GoogleMapsScraper } from './scrapers/GoogleMapsScraper';
import { InstagramScraper } from './scrapers/InstagramScraper';
import { Copywriter } from './generators/Copywriter';
import { WhatsAppAgent } from './bot/WhatsAppAgent';
import { User, setHandoff, getHistory } from './db/database';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'geezcode-super-secret-key-2026';

// ==========================================
// 🛡️ MIDDLEWARES DE SEGURANÇA (ANTI-HACKER)
// ==========================================
app.use(helmet({ contentSecurityPolicy: false })); // Protege os headers
app.use(cors());
app.use(express.json());

// Limite rigoroso contra DDOS (100 requisições a cada 15 min)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

app.use(express.static(path.join(__dirname, '../public')));

// Middleware de Token Seguro JWT para blindar Rotas
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso Negado. Faça Login.' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token Inválido ou Expirado.' });
    req.user = user;
    next();
  });
};

// ==========================================
// 🔑 ROTAS DE AUTENTICAÇÃO E DASHBOARD
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, message: 'Autenticado' });
  } catch(e) { res.status(500).json({ error: 'Erro de Autenticação' }) }
});

app.get('/api/history/:phone', authenticateToken, async (req, res) => {
  const history = await getHistory(req.params.phone);
  res.json(history);
});

app.post('/api/takeover', authenticateToken, async (req, res) => {
  const { phone, active } = req.body;
  await setHandoff(phone, active);
  res.json({ success: true, handoff: active });
});

// Nossa API Bridge para o Scraping (Agora Protegida por Senha!)
app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { nicho, localidade } = req.body;
    
    if (!nicho || !localidade) return res.status(400).json({ error: 'Nicho/Localidade obrigatórios.' });

    const mapsScraper = new GoogleMapsScraper();
    const rawLeads = await mapsScraper.execute(nicho, localidade);

    if (rawLeads.length === 0) return res.status(404).json({ message: 'Nenhum lead encontrado.' });

    const igScraper = new InstagramScraper();
    const finalLeads = await igScraper.analyzeLeads(rawLeads);
    const copyEngine = new Copywriter();
    
    const enrichedLeads = finalLeads.map(l => {
      let whatsClean = l.contato.replace(/\\D/g, '');
      if (whatsClean.length >= 10 && !whatsClean.startsWith('55')) whatsClean = '55' + whatsClean;
      return { ...l, whatsappLimpo: whatsClean, copyExclusiva: copyEngine.generateColdMessage(l) };
    });

    return res.json({ leads: enrichedLeads });
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Falha no Scraping Engine.' });
  }
});

// ==========================================
// 🚀 INICIALIZAÇÃO OMNICHANNEL
// ==========================================
server.listen(port, async () => {
  console.log(`\n==========================================`);
  console.log(`🛡️ GEEZCODE SHIELD CRM Rodando na porta ${port}`)
  console.log(`==========================================\n`);
  
  const botZapi = new WhatsAppAgent();
  botZapi.boot(io);

  // Sockets WSS para tempo real do Inbox
  io.on('connection', (socket) => {
    console.log('🔗 WSS: Painel Seguro conectado em tempo real.');
    socket.on('admin_send_message', async (data) => {
      const { phone, text } = data;
      await botZapi.sendHumanMessage(phone, text);
    });
  });

  await open(`http://localhost:${port}`);
});
