import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Nome das coleções no Firestore
const COLECAO_BILHETES = "bilhetes";
const COLECAO_ANALISES = "analises_times";

/**
 * Salva um novo bilhete ou aposta no banco privado.
 */
export async function salvarBilhete(dadosBilhete) {
  try {
    const docRef = await addDoc(collection(db, COLECAO_BILHETES), {
      ...dadosBilhete,
      criadoEm: serverTimestamp()
    });
    console.log("Bilhete salvo com ID: ", docRef.id);
    return { sucesso: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao salvar bilhete:", error);
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Busca bilhetes filtrados por time ou retorna os últimos cadastrados.
 */
export async function buscarBilhetesPorTime(nomeTime = '') {
  try {
    const colecaoRef = collection(db, COLECAO_BILHETES);
    let q;

    if (nomeTime) {
      // Busca específica por time (ex: "Barcelona", "Man City")
      q = query(colecaoRef, where("time", "==", nomeTime));
    } else {
      // Retorna todos os bilhetes recentes se não houver filtro
      q = query(colecaoRef);
    }

    const querySnapshot = await getDocs(q);
    const resultados = [];
    querySnapshot.forEach((doc) => {
      resultados.push({ id: doc.id, ...doc.data() });
    });

    return resultados;
  } catch (error) {
    console.error("Erro ao buscar bilhetes:", error);
    return [];
  }
}

/**
 * Busca todos os dados privados para enviar de contexto para o Gemini
 */
export async function obterContextoPrivadoCompleto() {
  try {
    const snapshot = await getDocs(collection(db, COLECAO_BILHETES));
    const bilhetes = [];
    snapshot.forEach((doc) => {
      bilhetes.push(doc.data());
    });
    return bilhetes;
  } catch (error) {
    console.error("Erro ao carregar contexto do banco:", error);
    return [];
  }
}
