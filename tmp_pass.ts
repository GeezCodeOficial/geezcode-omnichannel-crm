import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://geezcodeoficial_db_user:cISWM2tMfI57Wupm@cluster0.zm8wfst.mongodb.net/geezcode_crm_cloud?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

// Avoid compiling models multiple times if we run this
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function fixPassword() {
  try {
    console.log("Conectando ao MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Conectado! Buscando admin...");
    
    const admin = await User.findOne({ email: "admin@geezcode.com" });
    if (!admin) {
      console.log("Admin não encontrado! Criando com Fred.1501...");
      const hash = await bcrypt.hash("Fred.1501", 10);
      await User.create({ email: "admin@geezcode.com", password: hash });
      console.log("Criado com sucesso!");
    } else {
      console.log("Admin encontrado. Forçando atualização para Fred.1501...");
      const hash = await bcrypt.hash("Fred.1501", 10);
      admin.password = hash;
      await admin.save();
      console.log("Senha atualizada com sucesso pelo Arquiteto!");
    }
  } catch (error) {
    console.error("Erro na operação:", error);
  } finally {
    mongoose.disconnect();
  }
}

fixPassword();
