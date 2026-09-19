// Importação dos módulos oficiais do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração do projeto "análises"
const firebaseConfig = {
  apiKey: "AIzaSyBbbSI4RheLbZoSN9nntbq7gbNe-M-hQg8",
  authDomain: "analises-c6df1.firebaseapp.com",
  projectId: "analises-c6df1",
  storageBucket: "analises-c6df1.firebasestorage.app",
  messagingSenderId: "81497183341",
  appId: "1:81497183341:web:1d708d6692f64348df5b64"
};

// Inicialização do app
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados (db) e a autenticação (auth)
export const db = getFirestore(app);
export const auth = getAuth(app);
