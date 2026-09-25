// Serviço de integração com o modelo correto indicado pela API
import { GoogleGenAI } from "https://esm.run/@google/genai";

const GEMINI_API_KEY = "AIzaSyAX-wW-Yabotsy5rZOdMom4Kj3jau8dAb0"; 

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("SUA_CHAVE")) {
    return "⚠️ Atenção: Configure sua chave de API do Gemini.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

    const systemInstruction = 
      "Você é o 'Copiloto Tático', uma Inteligência Artificial especializada em análise de apostas esportivas e bilhetes.\n" +
      "REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:\n" +
      "1. Responda à pergunta do usuário baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
      "2. NUNCA invente estatísticas, odds, bilhetes ou resultados que não estejam presentes no contexto fornecido.\n" +
      "3. Se os dados fornecidos no contexto não forem suficientes para responder à pergunta do usuário, diga claramente: 'Não encontrei dados suficientes no seu banco do Firestore para esta análise.'\n" +
      "4. Seja direto, tático, objetivo e preciso.\n\n" +
      "[DADOS PRIVADOS DO FIRESTORE]:\n" +
      contextoFormatado;

    // Atualizado para o modelo exigido pela API do Google
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
      return "A API retornou uma resposta vazia.";
    }

  } catch (error) {
    console.error("Erro detalhado do Gemini:", error);
    return `❌ ERRO TÉCNICO DETALHADO: ${error.message || JSON.stringify(error)}`;
  }
}
