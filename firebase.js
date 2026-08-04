
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
  getDocs,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDrVJWdFnAljROeBYQEWcyAwxpLUI7TPDw",
    authDomain: "gestao-ferramentas-fd5b7.firebaseapp.com",
    projectId: "gestao-ferramentas-fd5b7",
    storageBucket: "gestao-ferramentas-fd5b7.firebasestorage.app",
    messagingSenderId: "953729249758",
    appId: "1:953729249758:web:2f820c75e0a08d24ea2d4f",
    measurementId: "G-1JEQ3DM0HL"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
  getDocs,
  addDoc, 
  deleteDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};

export const storage = getStorage(app);
