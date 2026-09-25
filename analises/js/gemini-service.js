// Serviço de integração com a API do Gemini - Rota e Modelo Estável

const GEMINI_API_KEY = "AIzaSyAX-wW-Yabotsy5rZOdMom4Kj3jau8dAb0"; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (GEMINI_API_KEY === "SUA_CHAVE_GEMINI_AQUI" || !GEMINI_API_KEY) {
    return "⚠️ **Atenção:** Configure sua chave de API do Gemini no arquivo `js/gemini-service.js` para ativar as respostas inteligentes.";
  }

  const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

  const systemInstructionText = 
    "Você é o 'Copiloto Tático', uma Inteligência Artificial especializada em análise de apostas esportivas e bilhetes.\n" +
    "REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:\n" +
    "1. Responda à pergunta do usuário baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
    "2. NUNCA invente estatísticas, odds, bilhetes ou resultados que não estejam presentes no contexto fornecido.\n" +
    "3. Se os dados fornecidos no contexto não forem suficientes para responder à pergunta do usuário, diga claramente: 'Não encontrei dados suficientes no seu banco do Firestore para esta análise.'\n" +
    "4. Seja direto, tático, objetivo e preciso.\n\n" +
    "[DADOS PRIVADOS DO FIRESTORE]:\n" +
    contextoFormatado;

  const payload = {
    system_instruction: {
      parts: [
        { text: systemInstructionText }
      ]
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: perguntaUsuario }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Detalhes do erro da API:", errorData);
      throw new Error(`Erro na API do Gemini: Status ${response.status}`);
    }

    const data = await response.json();
    const respostaTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (respostaTexto) {
      return respostaTexto;
    } else {
      return "Não foi possível gerar a resposta no momento. Tente novamente.";
    }

  } catch (error) {
    console.error("Erro na comunicação com o Gemini:", error);
    throw error;
  }
}
