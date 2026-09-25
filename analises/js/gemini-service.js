// Servico de integracao com o Gemini para chaves no novo formato AQ...
import { GoogleGenAI } from "https://esm.run/@google/genai";

const GEMINI_API_KEY = "AQ.Ab8RN6J2aebZYjTh8_GhIlU2tdqKT3Pbm4I_WAQjArt3OvjoCA";

export async function consultarCopilotoTatico(perguntaUsuario, dadosFirestore = []) {
  if (!GEMINI_API_KEY) {
    return "⚠️ Atencao: Configure sua chave de API.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const contextoFormatado = JSON.stringify(dadosFirestore, null, 2);

    const systemInstructionText = 
      "Voce e o 'Copiloto Tatico', uma Inteligencia Artificial especializada em analise de apostas esportivas e bilhetes.\n" +
      "REGRAS OBRIGATÓRIAS E INVIOLÁVEIS:\n" +
      "1. Responda a pergunta do usuario baseando-se ESTRITAMENTE nos dados do banco privado fornecidos abaixo.\n" +
      "2. NUNCA invente estatisticas, odds, bilhetes ou resultados que nao estejam presentes no contexto fornecido.\n" +
      "3. Se os dados fornecidos no contexto nao forem suficientes para responder a pergunta do usuario, diga claramente: 'Nao encontrei dados suficientes no seu banco do Firestore para esta analise.'\n" +
      "4. Seja direto, tatico, objetivo e preciso.\n\n" +
      "[DADOS PRIVADOS DO FIRESTORE]:\n" +
      contextoFormatado;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: perguntaUsuario }] }
      ],
      config: {
        systemInstruction: systemInstructionText,
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
    return `❌ ERRO TECNICO DETALHADO: ${error.message || JSON.stringify(error)}`;
  }
}
