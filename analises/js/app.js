import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet Conectado.");

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const btnMic = document.getElementById('btn-mic');

  function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mensagem', remetente);
    msgDiv.textContent = texto;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- Recurso do Microfone (Voz para Texto) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && btnMic) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    btnMic.addEventListener('click', () => {
      recognition.start();
      btnMic.classList.add('gravando');
    });

    recognition.onresult = (event) => {
      const textoGravado = event.results[0][0].transcript;
      chatInput.value = textoGravado;
      btnMic.classList.remove('gravando');
    };

    recognition.onerror = () => {
      btnMic.classList.remove('gravando');
    };

    recognition.onend = () => {
      btnMic.classList.remove('gravando');
    };
  } else if (btnMic) {
    btnMic.style.display = 'none'; // Esconde se o navegador não suportar
  }

  // --- Envio de Mensagens ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      adicionarMensagem("Analisando dados táticos...", 'bot');

      try {
        const respostaGemini = await consultarCopilotoTatico(mensagemUsuario);
        if (chatMessages.lastChild) {
          chatMessages.lastChild.remove();
        }
        adicionarMensagem(respostaGemini, 'bot');
      } catch (error) {
        console.error("Erro na consulta:", error);
        if (chatMessages.lastChild) {
          chatMessages.lastChild.remove();
        }
        adicionarMensagem("Erro ao processar consulta tática.", 'bot');
      }
    });
  }
});
