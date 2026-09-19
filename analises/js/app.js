import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet - Inicializando sistema com blindagem máxima...");

  try {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const btnMic = document.getElementById('btn-mic');
    const btnConfig = document.getElementById('btn-config');
    const painelConfig = document.getElementById('painel-config');

    if (!chatForm || !chatInput || !chatMessages) {
      console.error("ERRO CRÍTICO: Elementos essenciais do chat (form, input ou messages) não foram encontrados no HTML!");
    }

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

    // --- Recurso do Microfone (Seguro para Mobile) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && btnMic) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;

        btnMic.addEventListener('click', () => {
          try {
            recognition.start();
            btnMic.classList.add('gravando');
            console.log("Microfone acionado.");
          } catch (e) {
            console.error("Erro ao iniciar reconhecimento de voz:", e);
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
          console.warn("Aviso do microfone:", event.error);
          btnMic.classList.remove('gravando');
        };
        
        recognition.onend = () => {
          btnMic.classList.remove('gravando');
        };
      } catch (micErr) {
        console.warn("SpeechRecognition não pôde ser configurado:", micErr);
      }
    } else if (btnMic) {
      btnMic.style.display = 'none';
    }

    // --- Função Central de Processamento de Envio ---
    async function executarEnvio() {
      if (!chatInput) return;
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // Limpa o input imediatamente e trava/exibe a mensagem
      chatInput.value = '';
      adicionarMensagem(mensagemUsuario, 'usuario');

      const idTemp = 'temp-' + Date.now();
      const msgTemp = document.createElement('div');
      msgTemp.classList.add('mensagem', 'bot');
      msgTemp.id = idTemp;
      msgTemp.textContent = "Buscando dados na API...";
      chatMessages.appendChild(msgTemp);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      let respostaFinal = "Não consegui processar a resposta.";

      try {
        let dadosExtras = "";
        if (typeof buscarDadosFutebol === 'function') {
          try {
            dadosExtras = await buscarDadosFutebol(mensagemUsuario);
          } catch (err) {
            console.warn("Aviso na API de esportes:", err);
          }
        }

        const promptFinal = dadosExtras ? `Contexto da API: ${dadosExtras}\n\nPergunta do usuário: ${mensagemUsuario}` : mensagemUsuario;
        
        if (typeof consultarCopilotoTatico === 'function') {
          respostaFinal = await consultarCopilotoTatico(promptFinal);
        } else {
          respostaFinal = "Erro: O serviço do Gemini não está carregado corretamente.";
        }

      } catch (error) {
        console.error("Erro no processamento da mensagem:", error);
        respostaFinal = "Ocorreu um erro ao consultar os dados. Verifique a conexão.";
      } finally {
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    }

    // --- Evento de Envio por Formulário ---
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        executarEnvio();
      });
    }

  } catch (initError) {
    console.error("Erro fatal ao carregar o script app.js:", initError);
  }
});
