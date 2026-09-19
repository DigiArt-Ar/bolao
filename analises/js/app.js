import { salvarBilhete, buscarBilhetes, salvarEstatisticaTime, buscarEstatisticaTime } from './firebase-service.js';
import { consultarCopilotoTatico } from './gemini-service.js';
import { buscarDadosFutebol } from './sports-api.js';

// Inicialização da interface e eventos
document.addEventListener('DOMContentLoaded', () => {
  console.log("Sistema Tático e Inteligência Conectados.");

  // Exemplo de integração: Botão/Ação de busca de dados de futebol
  const btnBuscarDados = document.getElementById('btn-buscar-dados');
  if (btnBuscarDados) {
    btnBuscarDados.addEventListener('click', async () => {
      const termo = document.getElementById('input-busca-time')?.value || "Fluminense";
      console.log(`Buscando estatísticas para: ${termo}...`);
      
      const dados = await buscarDadosFutebol(termo);
      if (dados) {
        // Grava no Firestore para servir de base estrita para o Gemini
        await salvarEstatisticaTime(termo, dados);
        alert(`Dados táticos de "${termo}" atualizados no Firestore com sucesso!`);
      }
    });
  }
});
