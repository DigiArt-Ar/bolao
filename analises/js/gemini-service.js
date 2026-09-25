// Servico de integracao direta via Fetch para o Copiloto Tatico
// (Contorna a exigencia de OAuth do SDK para contas de servico)

const GEMINI_API_KEY = "AQ.Ab8RN6J2aebZYjTh8_GhIlU2tdqKT3Pbm4I_WAQjArt3OvjoCA"; 

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("SUA_CHAVE")) {
    return "⚠️ Atencao: Configure sua chave de API.";
  }

  try {
    const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

    const systemInstructionText = 
      "Você é o 'Copiloto Tático', uma Inteligência Artificial especializada em análise de apostas esportivas e bilhetes.\n" +
      "REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:\n" +
      "1. Responda à pergunta do usuário baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
      "2. NUNCA invente estatísticas, odds, bilhetes ou resultados que não estejam presentes no contexto fornecido.\n" +
      "3. Se os dados fornecidos no contexto não forem suficientes para responder à pergunta do usuário, diga claramente: 'Não encontrei dados suficientes no seu banco do Firestore para esta análise.'\n" +
      "4. Seja direto, tático, objetivo e preciso.\n\n" +
      "[DADOS PRIVADOS DO FIRESTORE]:\n" +
      contextoFormatado + "\n\n" +
      "Pergunta do Usuário: " + perguntaUsuario;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemInstructionText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      })
    });

    const resultadoJson = await resposta.json();

    if (resultadoJson.candidates && resultadoJson.candidates[0].content.parts[0].text) {
      return resultadoJson.candidates[0].content.parts[0].text;
    } else if (resultadoJson.error) {
      return `❌ ERRO DA API: ${resultadoJson.error.message}`;
    } else {
      return "A API retornou uma resposta vazia.";
    }

  } catch (error) {
    console.error("Erro detalhado:", error);
    return `❌ ERRO TECNICO DETALHADO: ${error.message || JSON.stringify(error)}`;
  }
}
