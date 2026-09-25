document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet - Sistema Blindado Inicializado.");

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const btnMic = document.getElementById('btn-mic');
  const btnConfig = document.getElementById('btn-config');
  const painelConfig = document.getElementById('painel-config');

  // Alternar painel de configurações
  if (btnConfig && painelConfig) {
    btnConfig.addEventListener('click', () => {
      painelConfig.classList.toggle('escondido');
    });
  }

  // --- Adicionar Mensagem ao Chat ---
  function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mensagem', remetente);
    msgDiv.textContent = texto;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- Configuração do Microfone (Segura e isolada) ---
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

  // --- Envio de Mensagem Integrado com Gemini e Firestore ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Exibe a mensagem do usuário imediatamente
      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      // 2. Balão de carregamento
      const idTemp = 'temp-' + Date.now();
      const msgTemp = document.createElement('div');
      msgTemp.classList.add('mensagem', 'bot');
      msgTemp.id = idTemp;
      msgTemp.textContent = "Consultando Copiloto Tático...";
      chatMessages.appendChild(msgTemp);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      let respostaFinal = "Não consegui processar a resposta no momento.";

      try {
        // Tenta buscar dados do Firestore se o serviço estiver disponível
        let dadosFirestore = [];
        try {
          const firebaseService = await import('./firebase-service.js');
          if (firebaseService && typeof firebaseService.buscarDadosHistorico === 'function') {
            dadosFirestore = await firebaseService.buscarDadosHistorico();
          }
        } catch (fbErr) {
          console.warn("Aviso: Histórico do Firestore não carregado nesta sessão.", fbErr);
        }

        // Importa e chama o serviço do Gemini diretamente
        const geminiService = await import('./gemini-service.js');
        if (geminiService && typeof geminiService.consultarCopilotoTatico === 'function') {
          respostaFinal = await geminiService.consultarCopilotoTatico(mensagemUsuario, dadosFirestore);
        } else {
          respostaFinal = "Erro: Função consultarCopilotoTatico não encontrada.";
        }

      } catch (error) {
        console.error("Erro geral no envio:", error);
        respostaFinal = "Erro de comunicação com a Inteligência Tática. Verifique a chave de API e a conexão com a internet.";
      } finally {
        // 3. Remove o balão temporário e exibe a resposta final
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    });
  }
});
