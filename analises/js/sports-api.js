// analises/js/sports-api.js

const RAPIDAPI_KEY = "75f48d4153msh6c74d60722d4bd8p1ee381jsn97dc5f036584";
const RAPIDAPI_HOST = "free-api-live-football-data.p.rapidapi.com";

/**
 * Busca jogadores ou equipes na API de Futebol
 * @param {string} termoBusca - Nome do jogador ou time (ex: "Messi", "Flamengo")
 */
export async function buscarDadosFutebol(termoBusca = "m") {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  };

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/football-players-search?search=${encodeURIComponent(termoBusca)}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API de Futebol: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados recebidos da API de Esportes:", data);
    return data;
  } catch (error) {
    console.error("Falha ao consultar API de Esportes:", error);
    return null;
  }
}
