import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet - Sistema de Diagnóstico de Resposta Ativo.");

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

  // --- Configuração do Microfone (já validada e funcionando) ---
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

  // --- Processo de Envio com Rastreio Real ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Fixa a mensagem do usuário na tela
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

      let respostaFinal = "";

      try {
        // Tenta buscar dados da API de esportes (se houver)
        let dadosExtras = "";
        if (typeof buscarDadosFutebol === 'function') {
          try {
            dadosExtras = await buscarDadosFutebol(mensagemUsuario);
          } catch (err) {
            console.warn("Aviso na API de esportes:", err);
          }
        }

        const promptFinal = dadosExtras ? `Contexto da API: ${dadosExtras}\n\nPergunta do usuário: ${mensagemUsuario}` : mensagemUsuario;
        
        // Chama o serviço do Gemini
        if (typeof consultarCopilotoTatico === 'function') {
          console.log("Enviando prompt para o Gemini:", promptFinal);
          respostaFinal = await consultarCopilotoTatico(promptFinal);
          console.log("Resposta recebida do Gemini:", respostaFinal);
        } else {
          respostaFinal = "Erro: A função consultarCopilotoTatico não foi encontrada no gemini-service.js.";
        }

        // Se por acaso a resposta vier vazia, avisa claramente
        if (!respostaFinal || respostaFinal.trim() === "") {
          respostaFinal = "O Gemini retornou uma resposta vazia. Verifique a chave de API ou o modelo.";
        }

      } catch (error) {
        console.error("Erro detalhado na consulta:", error);
        respostaFinal = "Erro técnico ao consultar a IA: " + (error.message || error);
      } finally {
        // 3. Remove o balão temporário e exibe o resultado real (sem mensagens fingidas)
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    });
  }
});
