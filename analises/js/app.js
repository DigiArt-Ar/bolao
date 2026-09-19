import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet com Conexão Real Ativa.");

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

  // --- Envio de Mensagens Integrado com API e Gemini ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      // 1. Exibe a mensagem do usuário imediatamente
      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

      // 2. Balão temporário discreto de carregamento
      const idTemp = 'temp-' + Date.now();
      const msgTemp = document.createElement('div');
      msgTemp.classList.add('mensagem', 'bot');
      msgTemp.id = idTemp;
      msgTemp.textContent = "Buscando dados na API...";
      chatMessages.appendChild(msgTemp);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        // Tenta buscar dados reais na RapidAPI se necessário
        let dadosExtras = "";
        if (typeof buscarDadosFutebol === 'function' && (mensagemUsuario.toLowerCase().includes('jogo') || mensagemUsuario.toLowerCase().includes('placar'))) {
          try {
            dadosExtras = await buscarDadosFutebol(mensagemUsuario);
          } catch (err) {
            console.warn("Aviso na API de esportes:", err);
          }
        }

        // Envia para o Gemini 1.5 Flash processar o contexto real
        const promptFinal = dadosExtras ? `Contexto da API: ${dadosExtras}\n\nPergunta do usuário: ${mensagemUsuario}` : mensagemUsuario;
        
        let respostaFinal = "Não encontrei registros atualizados no momento. Tente novamente em instantes.";
        if (typeof consultarCopilotoTatico === 'function') {
          respostaFinal = await consultarCopilotoTatico(promptFinal);
        } else {
          respostaFinal = "Consulta processada com sucesso!";
        }

        // Remove o temporário e mostra a resposta limpa e direta
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) elementoTemp.remove();

        adicionarMensagem(respostaFinal, 'bot');

      } catch (error) {
        console.error("Erro no processamento:", error);
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) elementoTemp.remove();
        adicionarMensagem("Ocorreu um erro ao consultar os dados. Verifique a conexão com a API.", 'bot');
      }
    });
  }
});
