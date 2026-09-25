// Servico de integracao com o Gemini para a chave do projeto
const GEMINI_API_KEY = "AQ.Ab8RN6KAN3gJP5QCPqPI4YgpkQiMmQweZQjMc6Fpr_urOkw9qw"; 

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (!GEMINI_API_KEY) {
    return "⚠️ Atencao: Configure sua chave de API.";
  }

  try {
    const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

    const systemInstructionText = 
      "Voce e o 'Copiloto Tatico', uma Inteligencia Artificial especializada em analise de apostas esportivas e bilhetes.\n" +
      "REGRAS OBRIGATORIAS E INVIOLAVEIS:\n" +
      "1. Responda a pergunta do usuario baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
      "2. NUNCA invente estatisticas, odds, bilhetes ou resultados que nao estejam presentes no contexto fornecido.\n" +
      "3. Se os dados fornecidos no contexto nao forem suficientes para responder a pergunta do usuario, diga claramente: 'Nao encontrei dados suficientes no seu banco do Firestore para esta analise.'\n" +
      "4. Seja direto, tatico, objetivo e preciso.\n\n" +
      "[DADOS PRIVADOS DO FIRESTORE]:\n" +
      contextoFormatado + "\n\n" +
      "Pergunta do Usuário: " + perguntaUsuario;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
