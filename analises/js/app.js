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

  // --- Função para Falar a Resposta ---
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

  // --- Respostas Diretas e Naturais ---
  function gerarRespostaDireta(pergunta) {
    const p = pergunta.toLowerCase();

    if (p.includes('boa tarde') || p.includes('olá') || p.includes('oi')) {
      return "Boa tarde! Tudo bem por aí? Como posso te ajudar com as análises hoje?";
    } 
    else if (p.includes('jogo') || p.includes('partida') || p.includes('hoje')) {
      return "Os principais jogos de hoje são:\n1. Flamengo x Palmeiras\n2. Real Madrid x Barcelona\n3. Manchester City x Liverpool\n\nQuer que eu analise o mercado de gols ou de vencedor para algum deles?";
    } 
    else if (p.includes('cartão') || p.includes('falta')) {
      return "Nas últimas partidas, a média está alta, girando em torno de 5.2 cartões por jogo. Quer ver o histórico de um juiz específico?";
    } 
    else {
      return "Entendido. Para essa situação, os indicadores apontam um cenário equilibrado, com leve favoritismo para o mandante. Quer focar em gols ou em resultado final?";
    }
  }

  // --- Envio de Mensagens Fluido ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Exibe a mensagem do usuário imediatamente
      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      // 2. Responde rápido e direto, sem enrolação
      setTimeout(() => {
        const resposta = gerarRespostaDireta(mensagemUsuario);
        adicionarMensagem(resposta, 'bot');
      }, 250);
    });
  }
});
