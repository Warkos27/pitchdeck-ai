// Importa las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Tu configuración web de Firebase obtenida de la consola
const firebaseConfig = {
  apiKey: "AIzaSyB6c0NaCou1_oMnItNobRPIBt3IbH1ZC7I",
  authDomain: "pitchdeck-ai-d8af9.firebaseapp.com",
  projectId: "pitchdeck-ai-d8af9",
  storageBucket: "pitchdeck-ai-d8af9.firebasestorage.app",
  messagingSenderId: "442015824725",
  appId: "1:442015824725:web:851866105cb8dcec300ddc",
  measurementId: "G-RXEHNTKYW9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los módulos de autenticación para usarlos en el proyecto
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut };