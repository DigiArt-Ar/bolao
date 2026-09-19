// Módulo de integração com a API de Futebol via RapidAPI

const RAPIDAPI_KEY = "75f48d4153msh6c74d60722d4bd8p1ee381jsn97dc5f036584";
const RAPIDAPI_HOST = "free-api-live-football-data.p.rapidapi.com";

/**
 * Busca partidas ou estatísticas da API e prepara os dados para salvar no Firestore.
 */
export async function buscarPartidasAoVivo() {
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  };

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/football-get-popular-leagues`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API de Esportes: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados de ligas/partidas recebidos:", data);
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados de futebol:", error);
    return null;
  }
}
