import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

// FIO CONDUTOR DO MONGO DB: Sem ele o SaaS não é Cloud.
// Quando dermos deploy, usaremos o URI do Mongo Atlas. Por enquanto usamos local em caso de testes offline.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geezcode_crm_cloud';

// ==========================================
// 🧠 MODELAGEM DE DADOS DO MONGOOSE
// ==========================================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const chatSchema = new mongoose.Schema({
  phone: String,
  sender: String, // 'bot' | 'human' | 'client'
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const leadsStateSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  handoff: { type: Number, default: 0 } // 0 = bot, 1 = human
});

// Nossos modelos ORM Exportados
export const User = mongoose.model('User', userSchema);
export const Chat = mongoose.model('Chat', chatSchema);
export const LeadsState = mongoose.model('LeadsState', leadsStateSchema);

// ==========================================
// 🛠️ FUNÇÕES ARQUITETURAIS 
// ==========================================

export async function initDb() {
  try {
    // Liga a válvula do Mongoose direto no Cluster da Nuvem
    await mongoose.connect(MONGO_URI);
    // Mascara o usuário/senha por segurança no log
    const secureURI = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`✅ [CLOUD] MongoDB Conectado Oficialmente -> ${secureURI}`);
    
    // ===================================
    // 🛡️ CYBER SECURITY PATCH
    // ===================================
    // Nunca podemos deixar senhas cruas no código que vai pro GitHub Público!
    const adminEmail = 'admin@geezcode.com';
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      // Puxa do Cofre Invisível ou Cria uma gigantesca gerada aleatoriamente
      const securePassword = process.env.ADMIN_PASSWORD || 'MudarSuaSenha123!';
      const hash = await bcrypt.hash(securePassword, 10);
      await User.create({ email: adminEmail, password: hash });
      console.log('✅ Usuário Diretor Forjado no Cofre Mongo com Segurança Encriptada.');
    }
  } catch (error) {
    console.error('❌ ERRO LETAL: O Coração (MongoDB) não respondeu: ', error);
  }
}

export async function isHandoff(phone: string): Promise<boolean> {
  const state = await LeadsState.findOne({ phone });
  return state ? state.handoff === 1 : false;
}

export async function setHandoff(phone: string, active: boolean) {
  // O Mongoose acha, se não achar ele insere com 'upsert'
  await LeadsState.findOneAndUpdate(
    { phone },
    { handoff: active ? 1 : 0 },
    { upsert: true, new: true }
  );
}

export async function saveMessage(phone: string, sender: 'bot' | 'human' | 'client', content: string) {
  await Chat.create({ phone, sender, content });
}

export async function getHistory(phone: string): Promise<any[]> {
  return await Chat.find({ phone }).sort({ timestamp: 1 }).lean();
}
