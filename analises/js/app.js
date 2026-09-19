import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet - Conexão Real com API e Gemini Ativa.");

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

  // --- Função para adicionar mensagem na tela ---
  function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mensagem', remetente);
    msgDiv.textContent = texto;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- Configuração do Microfone ---
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

  // --- Processo de Envio Real Integrado com API e Gemini ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Fixa a mensagem do usuário na tela imediatamente
      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      // 2. Cria o balão temporário de carregamento da API
      const idTemp = 'temp-' + Date.now();
      const msgTemp = document.createElement('div');
      msgTemp.classList.add('mensagem', 'bot');
      msgTemp.id = idTemp;
      msgTemp.textContent = "Buscando dados na API de esportes...";
      chatMessages.appendChild(msgTemp);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      let respostaFinal = "Não consegui processar a resposta no momento.";

      try {
        // 3. Tenta buscar os dados reais na RapidAPI
        let dadosExtras = "";
        if (typeof buscarDadosFutebol === 'function') {
          try {
            dadosExtras = await buscarDadosFutebol(mensagemUsuario);
          } catch (err) {
            console.warn("Aviso na API de esportes:", err);
          }
        }

        // 4. Envia o contexto obtido para o Gemini processar a análise tática
        const promptFinal = dadosExtras ? `Contexto da API de Futebol: ${dadosExtras}\n\nPergunta do usuário: ${mensagemUsuario}` : mensagemUsuario;
        
        if (typeof consultarCopilotoTatico === 'function') {
          respostaFinal = await consultarCopilotoTatico(promptFinal);
        } else {
          respostaFinal = "Erro: O serviço do Copiloto Tático (Gemini) não está carregado corretamente.";
        }

      } catch (error) {
        console.error("Erro no processamento:", error);
        respostaFinal = "Ocorreu um erro ao consultar os dados na API. Verifique a conexão.";
      } finally {
        // 5. Remove o balão de carregamento e insere a resposta real da API/Gemini
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    });
  }
});
