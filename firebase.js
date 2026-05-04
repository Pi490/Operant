import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbfK38PLVK9APVyEsxR_XWNZ7_Ef22qRQ",
  authDomain: "gestao-de-ferramentas-teste.firebaseapp.com",
  projectId: "gestao-de-ferramentas-teste",
  storageBucket: "gestao-de-ferramentas-teste.appspot.com",
  messagingSenderId: "279635050715",
  appId: "1:279635050715:web:93b490b68cf91ffaf10cfe"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Login persistente ativo:", user.email);
  }
});

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
};
