import { salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("MauBet com Conexão Real, Voz Fixa e Blindagem de Tela Ativos.");

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const btnMic = document.getElementById('btn-mic');
  const btnConfig = document.getElementById('btn-config');
  const painelConfig = document.getElementById('painel-config');

  let vozSelecionadaCache = null;

  // Alternar painel de configurações
  if (btnConfig && painelConfig) {
    btnConfig.addEventListener('click', () => {
      painelConfig.classList.toggle('escondido');
    });
  }

  // --- Função Definitiva para Selecionar a Melhor Voz do Google ---
  function obterMelhorVoz() {
    if (!('speechSynthesis' in window)) return null;
    if (vozSelecionadaCache) return vozSelecionadaCache;

    const voces = window.speechSynthesis.getVoices();
    if (!voces || voces.length === 0) return null;

    // Filtra prioritariamente por vozes do Google em Português do Brasil (naturalidade alta)
    let voz = voces.find(v => v.lang === 'pt-BR' && v.name.includes('Google'));

    // Segunda opção: Qualquer voz em pt-BR disponível
    if (!voz) {
      voz = voces.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
    }

    // Fallback absoluto se não achar pt-BR
    if (!voz && voces.length > 0) {
      voz = voces[0];
    }

    vozSelecionadaCache = voz;
    return voz;
  }

  // Garante o carregamento das vozes assíncronas do navegador
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      vozSelecionadaCache = null;
      obterMelhorVoz();
    };
  }

  // --- Função para Falar com Voz Fixa e Natural ---
  function falarTexto(texto) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 

    const melhorVoz = obterMelhorVoz();
    if (melhorVoz) {
      utterance.voice = melhorVoz;
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

  // --- Envio de Mensagens Integrado (Com Proteção contra Travamentos) ---
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemUsuario = chatInput.value.trim();
      if (!mensagemUsuario) return;

      adicionarMensagem(mensagemUsuario, 'usuario');
      chatInput.value = '';

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
        console.error("Erro no processamento:", error);
        respostaFinal = "Ocorreu um erro ao consultar os dados. Verifique a conexão.";
      } finally {
        // Bloco de segurança: remove o "Buscando..." e garante que a resposta aparece na tela
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    });
  }
});
