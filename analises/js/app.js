import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Elementos da Interface
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const btnMic = document.getElementById('btnMic');
const micIcon = document.getElementById('micIcon');
const statusBadge = document.getElementById('statusBadge');

// Função auxiliar para adicionar mensagem na tela
function appendMessage(text, sender = 'bot') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
  
  const p = document.createElement('p');
  p.textContent = text;
  msgDiv.appendChild(p);
  
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Processa a mensagem do usuário consultando o Firestore
async function handleUserMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Mostra mensagem do usuário
  appendMessage(text, 'user');
  userInput.value = '';

  // Mensagem temporária de processamento
  appendMessage('Consultando dados do banco privado...', 'bot');

  try {
    // Exemplo de consulta simples ao Firestore (Coleção: "bilhetes")
    const q = query(collection(db, "bilhetes"), limit(5));
    const querySnapshot = await getDocs(q);
    
    let responseText = "";
    
    if (querySnapshot.empty) {
      responseText = `Entendido: "${text}". No momento, não há bilhetes cadastrados no Firestore para cruzamento exato. Cadastre novos palpites/bilhetes no banco para gerar análises táticas sem alucinações.`;
    } else {
      let tickets = [];
      querySnapshot.forEach((doc) => {
        tickets.push(doc.data());
      });
      responseText = `Consultei seus dados privados! Encontrei ${tickets.length} registro(s) relevante(s) no Firestore para analisar sua solicitação: "${text}".`;
    }

    // Remove a mensagem temporária de carregamento e insere a resposta
    const lastMsg = chatContainer.lastElementChild;
    if (lastMsg && lastMsg.textContent.includes('Consultando dados')) {
      chatContainer.removeChild(lastMsg);
    }
    
    appendMessage(responseText, 'bot');

  } catch (error) {
    console.error("Erro ao conectar no Firestore:", error);
    appendMessage("Erro ao acessar a base de dados privada. Verifique as regras do Firestore.", 'bot');
  }
}

// Eventos de envio por botão ou ENTER
btnSend.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleUserMessage();
  }
});

// Suporte Inicial a Reconhecimento de Voz (Microfone)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  recognition.onstart = () => {
    btnMic.classList.add('recording');
    micIcon.textContent = 'mic_active';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    handleUserMessage();
  };

  recognition.onerror = (event) => {
    console.error("Erro de voz:", event.error);
    btnMic.classList.remove('recording');
    micIcon.textContent = 'mic';
  };

  recognition.onend = () => {
    btnMic.classList.remove('recording');
    micIcon.textContent = 'mic';
  };

  btnMic.addEventListener('click', () => {
    recognition.start();
  });
} else {
  btnMic.addEventListener('click', () => {
    alert("Seu navegador não suporta a API de voz diretamente. Digite sua mensagem no campo de texto.");
  });
}
