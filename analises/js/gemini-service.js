// Serviço de integração com o SDK Oficial do Gemini

import { GoogleGenAI } from "https://esm.run/@google/genai";

// Chave de API configurada
const GEMINI_API_KEY = "AIzaSyAX-wW-Yabotsy5rZOdMom4Kj3jau8dAb0";

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("SUA_CHAVE")) {
    return "⚠️ **Atenção:** Configure sua chave de API válida do Gemini no arquivo `js/gemini-service.js`.";
  }

  try {
    // Inicializa o SDK oficial do Google Gen AI
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

    const systemInstruction = 
      "Você é o 'Copiloto Tático', uma Inteligência Artificial especializada em análise de apostas esportivas e bilhetes.\n" +
      "REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:\n" +
      "1. Responda à pergunta do usuário baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
      "2. NUNCA invente estatísticas, odds, bilhetes ou resultados que não estejam presentes no contexto fornecido.\n" +
      "3. Se os dados fornecidos não forem suficientes para responder à pergunta do usuário, diga claramente: 'Não encontrei dados suficientes no seu banco do Firestore para esta análise.'\n" +
      "4. Seja direto, tático, objetivo e preciso.\n\n" +
      "[DADOS PRIVADOS DO FIRESTORE]:\n" +
      contextoFormatado;

    // Chamada correta utilizando o modelo gemini-2.5-flash recomendada pelo SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: perguntaUsuario,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 800
      }
    });

    if (response && response.text) {
      return response.text;
    } else {
      return "Não foi possível gerar a resposta no momento. Tente novamente.";
    }

  } chipt (error) { // Nota: mantenha catch (error) normalmente
    console.error("Erro na comunicação com o Gemini via SDK:", error);
    return "Erro de comunicação com a Inteligência Tática. Verifique a chave de API e a conexão com a internet.";
  }
}
