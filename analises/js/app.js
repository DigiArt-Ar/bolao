// --- Envio de Mensagens Integrado com API e Gemini (Com Proteção contra Sumiço) ---
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
      msgTemp.textContent = "Buscando dados...";
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
        respostaFinal = "Ocorreu um erro ao consultar os dados. Verifique o console.";
      } finally {
        // Garante SEMPRE a remoção do temporário e a exibição da resposta (mesmo se der erro)
        const elementoTemp = document.getElementById(idTemp);
        if (elementoTemp) {
          elementoTemp.remove();
        }
        adicionarMensagem(respostaFinal, 'bot');
      }
    });
  }
