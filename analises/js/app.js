import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet - Sistema Completo e Blindado Ativo.");

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

    recognition.onerror = (event) => {
      console.error("Erro no microfone:", event.error);
      btnMic.classList.remove('gravando');
    };
    
    recognition.onend = () => btnMic.classList.remove('gravando');
  } else if (btnMic) {
    btnMic.style.display = 'none';
  }

  // --- Função Central de Processamento de Envio ---
  async function executarEnvio() {
    const mensagemUsuario = chatInput.value.trim();
    if (!mensagemUsuario) return;

    // 1. Exibe a mensagem do usuário imediatamente
    adicionarMensagem(mensagemUsuario, 'usuario');
    chatInput.value = '';

    // 2. Balão temporário de carregamento
    const idTemp = 'temp-' + Date.now();
    const msgTemp = document.createElement('div');
    msgTemp.classList.add('mensagem', 'bot');
    msgTemp.id = idTemp;
    msgTemp.textContent = "Buscando dados na API...";
    chatMessages.appendChild(msgTemp);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let respostaFinal = "Não consegui processar a resposta.";

    try {
      // 3. Tenta buscar dados reais na API de futebol
      let dadosExtras = "";
      if (typeof buscarDadosFutebol === 'function') {
        try {
          dadosExtras = await buscarDadosFutebol(mensagemUsuario);
        } catch (err) {
          console.warn("Aviso na API de esportes:", err);
        }
      }

      // 4. Monta o prompt para o Gemini processar
      const promptFinal = dadosExtras ? `Contexto da API: ${dadosExtras}\n\nPergunta do usuário: ${mensagemUsuario}` : mensagemUsuario;
      
      if (typeof consultarCopilotoTatico === 'function') {
        respostaFinal = await consultarCopilotoTatico(promptFinal);
      } else {
        respostaFinal = "Erro: O serviço do Gemini não está carregado corretamente.";
      }

    } catch (error) {
      console.error("Erro no processamento:", error);
      respostaFinal = "Ocorreu um erro ao consultar os dados. Verifique a conexão.";
    } finally {
      // 5. Remove o balão de "Buscando..." e exibe a resposta final na tela
      const elementoTemp = document.getElementById(idTemp);
      if (elementoTemp) {
        elementoTemp.remove();
      }
      adicionarMensagem(respostaFinal, 'bot');
    }
  }

  // --- Evento de Envio por Formulário (Enter ou Botão Enviar) ---
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executarEnvio();
    });
  }
});
