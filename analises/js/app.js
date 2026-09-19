document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet Core Conectado.");

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const btnMic = document.getElementById('btn-mic');
  const btnConfig = document.getElementById('btn-config');
  const painelConfig = document.getElementById('painel-config');
  const seletorVoz = document.getElementById('seletor-voz');

  // Alternar painel de configurações
  if (btnConfig && painelConfig) {
    btnConfig.addEventListener('click', () => {
      painelConfig.classList.toggle('escondido');
    });
  }

  // --- Função para Falar a Resposta (Voz do Assistente) ---
  function falarTexto(texto) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';

    const voces = window.speechSynthesis.getVoices();
    const generoDesejado = seletorVoz ? seletorVoz.value : 'feminina';

    const vozEncontrada = voces.find(v => {
      if (!v.lang.includes('pt')) return false;
      const nomeLower = v.name.toLowerCase();
      if (generoDesejado === 'feminina') {
        return nomeLower.includes('female') || nomeLower.includes('luciana') || nomeLower.includes('helena') || nomeLower.includes('maria');
      } else {
        return nomeLower.includes('male') || nomeLower.includes('daniel') || nomeLower.includes('ricardo');
      }
    });

    if (vozEncontrada) {
      utterance.voice = vozEncontrada;
    }

    window.speechSynthesis.speak(utterance);
  }

  // --- Adicionar Mensagem ao Chat ---
  function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mensagem', remetente);
    msgDiv.textContent = texto;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (remetente === 'bot') {
      falarTexto(texto);
    }
  }

  // --- Recurso do Microfone (Voz para Texto) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && btnMic) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    btnMic.addEventListener('click', () => {
      try {
        recognition.start();
        btnMic.classList.add('gravando');
      } catch (e) {
        console.error("Erro ao iniciar microfone:", e);
      }
    });

    recognition.onresult = (event) => {
      const textoGravado = event.results[0][0].transcript;
      if (chatInput) {
        chatInput.value = textoGravado;
        chatInput.focus();
      }
      btnMic.classList.remove('gravando');
    };

    recognition.onerror = () => btnMic.classList.remove('gravando');
    recognition.onend = () => btnMic.classList.remove('gravando');
  } else if (btnMic) {
    btnMic.style.display = 'none';
  }

  // --- Envio de Mensagens Funcional ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Exibe a mensagem do usuário imediatamente
      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      // 2. Simula resposta tática do assistente MauBet
      setTimeout(() => {
        const respostaTatica = `Análise para: "${mensagemUsuario}". Conexão com os dados táticos ativa no MauBet!`;
        adicionarMensagem(respostaTatica, 'bot');
      }, 800);
    });
  }
});
