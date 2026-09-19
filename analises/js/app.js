import { obterContextoPrivadoCompleto } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';

// Elementos da Interface
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const btnMic = document.getElementById('btnMic');
const micIcon = document.getElementById('micIcon');

// Adiciona mensagens no feed do chat
function appendMessage(text, sender = 'bot') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
  
  const p = document.createElement('p');
  p.textContent = text;
  msgDiv.appendChild(p);
  
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msgDiv;
}

// Processa a pergunta do usuário integrando Firestore + Gemini
async function handleUserMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // 1. Mostra a pergunta do usuário na tela
  appendMessage(text, 'user');
  userInput.value = '';

  // 2. Cria mensagem de status "pensando"
  const loadingMsg = appendMessage('Consultando banco de dados privado e analisando com o Gemini...', 'bot');

  try {
    // 3. Busca o contexto privado no Firestore
    const dadosPrivados = await obterContextoPrivadoCompleto();

    // 4. Envia a pergunta + contexto privado para a IA
    const respostaIA = await consultarCopilotoTatico(text, dadosPrivados);

    // 5. Remove a mensagem de carregamento e exibe a análise tática real
    chatContainer.removeChild(loadingMsg);
    appendMessage(respostaIA, 'bot');

  } catch (error) {
    console.error("Erro no processamento:", error);
    chatContainer.removeChild(loadingMsg);
    appendMessage("Desculpe, ocorreu um erro ao consultar as informações táticas.", 'bot');
  }
}

// Eventos de Envio
btnSend.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserMessage();
});

// Suporte a Voz (Microfone)
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

  recognition.onerror = () => {
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
    alert("Reconhecimento de voz não suportado neste navegador. Utilize a digitação.");
  });
}
