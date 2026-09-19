// Serviço de integração com a API do Gemini com Trava Tática Anti-Alucinação

// Insira aqui sua chave de API da Gemini (ou gerencie via variável de ambiente/proxy se preferir)
const GEMINI_API_KEY = "SUA_CHAVE_GEMINI_AQUI"; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Envia a pergunta do usuário para o Gemini acompanhada do CONTEXTO ESTRITO vindo do Firestore.
 * @param {string} perguntaUsuario - A dúvida ou solicitação do usuário.
 * @param {Array} dadosFirestore - Lista de bilhetes e estatísticas reais buscadas no banco.
 */
export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (GEMINI_API_KEY === "SUA_CHAVE_GEMINI_AQUI" || !GEMINI_API_KEY) {
    return "⚠️ **Atenção:** Configure sua chave de API do Gemini no arquivo `js/gemini-service.js` para ativar as respostas inteligentes.";
  }

  // Montagem do Prompt de Sistema com Trava Estrita Anti-Alucinação
  const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

  const systemInstruction = `
Você é o "Copiloto Tático", uma Inteligência Artificial especializada em análise de apostas esportivas e bilhetes.
REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:
1. Responda à pergunta do usuário baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.
2. NUNCA invente estatísticas, odds, bilhetes ou resultados que não estejam presentes no contexto fornecido.
3. Se os dados fornecidos no contexto não forem suficientes para responder à pergunta do usuário, diga claramente: "Não encontrei dados suficientes no seu banco do Firestore para esta análise."
4. Seja direto, tático, objetivo e preciso.

[DADOS PRIVADOS DO FIRESTORE]:
${contextoFormatado}
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemInstruction },
          { text: `Pergunta do usuário: "${perguntaUsuario}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2, // Temperatura baixa para garantir máxima precisão e evitar alucinações
      maxOutputTokens: 800
    }
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: Status ${response.status}`);
    }

    const data = await response.json();
    
    // Extrai a resposta gerada
    const respostaTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (respostaTexto) {
      return respostaTexto;
    } else {
      return "Não foi possível gerar a resposta no momento. Tente novamente.";
    }

  } catch (error) {
    console.error("Erro na comunicação com o Gemini:", error);
    return "Erro de comunicação com a Inteligência Tática. Verifique a chave de API e a conexão com a internet.";
  }
}
