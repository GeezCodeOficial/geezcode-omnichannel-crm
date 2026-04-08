let API_TOKEN = localStorage.getItem('gz_crm_token');
let socket = null;
let currentChatPhone = null;

// ==========================================
// 🛡️ SISTEMA DE LOGIN E SESSÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (API_TOKEN) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('app-screen').style.display = 'flex';
        initSocket();
    }
});

async function doLogin() {
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('pwd').value;
    
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
    });

    if (res.ok) {
        const data = await res.json();
        API_TOKEN = data.token;
        localStorage.setItem('gz_crm_token', API_TOKEN);
        
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('app-screen').style.display = 'flex';
        initSocket();
    } else {
        alert('❌ Acesso Negado. Credenciais inválidas.');
    }
}

function logout() {
    localStorage.removeItem('gz_crm_token');
    window.location.reload();
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
        el.classList.add('hidden');
    });
    const target = document.getElementById(tabId);
    target.classList.remove('hidden');
    target.style.display = tabId === 'inbox-tab' ? 'flex' : 'block';
}

// ==========================================
// 🚀 INBOX & CHAT EM TEMPO REAL (WEBSOCKETS)
// ==========================================
function initSocket() {
    socket = io();
    
    // Captura o QR Code da Nuvem e joga na tela
    socket.on('qr_code', (data) => {
        document.getElementById('qr-modal').classList.remove('hidden');
        document.getElementById('qr-spinner').classList.add('hidden');
        document.getElementById('qr-status-text').innerText = 'Aponte o WhatsApp do celular (Aparelhos Conectados) para parear o Robô.';
        const qrImage = document.getElementById('qr-image');
        qrImage.src = data.qrUrl;
        qrImage.classList.remove('hidden');
    });

    socket.on('whatsapp_ready', () => {
        document.getElementById('qr-modal').classList.add('hidden');
        // Toast ou aviso
        console.log('✅ WhatsApp Sincronizado com a Nuvem!');
    });

    socket.on('new_message', (data) => {
        console.log('Nova Mensagem:', data);
        if (currentChatPhone === data.phone) {
            appendMessage(data.body, 'client');
        }
    });
}

function openChat(phone) {
    openTab('inbox-tab');
    currentChatPhone = phone;
    document.getElementById('chat-title').innerText = "📱 " + phone;
    document.getElementById('btn-takeover').classList.remove('hidden');
    document.getElementById('chat-messages').innerHTML = ''; // Clear
    document.getElementById('chat-input').disabled = true;
    document.getElementById('btn-send-chat').disabled = true;

    // Load History
    fetch(`/api/history/${phone}`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    .then(r => r.json())
    .then(history => {
        history.forEach(msg => appendMessage(msg.content, msg.sender));
    });
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('chat-bubble');

    if (sender === 'client') {
        div.classList.add('bubble-client');
    } else if (sender === 'bot') {
        div.classList.add('bubble-bot');
    } else {
        // human
        div.classList.add('bubble-human');
    }

    div.innerText = text;
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function assumeControl() {
    if (!currentChatPhone) return;
    const res = await fetch('/api/takeover', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({ phone: currentChatPhone, active: true })
    });
    
    if (res.ok) {
        document.getElementById('chat-input').disabled = false;
        document.getElementById('btn-send-chat').disabled = false;
        document.getElementById('btn-takeover').innerText = "✅ Controle Humano Ativo";
        document.getElementById('btn-takeover').style.background = '#48bb78';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !currentChatPhone) return;

    appendMessage(text, 'human');
    socket.emit('admin_send_message', { phone: currentChatPhone, text: text });
    input.value = '';
}

// ==========================================
// 🏭 MOTOR DE LEADS ORIGINAL
// ==========================================
document.getElementById('btn-generate').addEventListener('click', async () => {
    if (!API_TOKEN) {
        alert("Sua sessão expirou!");
        logout();
        return;
    }

    const nicho = document.getElementById('nicho').value;
    const localidade = document.getElementById('localidade').value;
    
    if(!nicho || !localidade) {
      alert("Preencha o nicho e a localidade!");
      return;
    }
  
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
  
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({ nicho, localidade })
      });
  
      const data = await response.json();
      document.getElementById('loader').classList.add('hidden');
  
      if (data.error || data.message) {
        alert(data.error || data.message);
        if (data.error && data.error.toLowerCase().includes('token')) {
            logout();
        }
        return;
      }
  
      const tbody = document.querySelector('#leads-table tbody');
      tbody.innerHTML = '';
  
      data.leads.forEach(lead => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
          <td><strong>${lead.nome}</strong><br><small>⭐ ${lead.nota}</small></td>
          <td>${lead.cidade || localidade}</td>
          <td>${lead.contato}</td>
          <td><span style="color: #e53e3e; font-weight: bold;">${lead.falhaPrimaria}</span></td>
          <td>
            <button class="btn-whatsapp" onclick="enviarProposta('${lead.whatsappLimpo}', '${encodeURIComponent(lead.copyExclusiva)}')">
                🤖 IA: Disparar Proposta
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
  
      document.getElementById('results').classList.remove('hidden');
  
    } catch (err) {
      console.error(err);
      document.getElementById('loader').classList.add('hidden');
      alert("Erro ao conectar com o motor de scraping.");
    }
});

function enviarProposta(whatsUrl, copyUrl) {
    const decoded = decodeURIComponent(copyUrl);
    // Dispara via Endpoint (nossa arquitetura original mandaria via client. Porém como o robô tá logado no backend, mandamos pro Backend assumir)
    // Para simplificar, abrimos o Whatsapp do Admin ou mandamos via Socket
    // Como a requisição pede que a IA mande:
    if(confirm('Tem certeza que quer ativar a IA para este Lead?')) {
        openChat(whatsUrl);
        // O administrador cola a mensagem proposta e inicia a venda ou a própria IA puxa
        document.getElementById('chat-input').disabled = false;
        document.getElementById('chat-input').value = decoded;
        document.getElementById('btn-send-chat').disabled = false;
    }
}
