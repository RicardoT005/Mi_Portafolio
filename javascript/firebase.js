/**
 * Firebase — MultiSoftCreations Portafolio
 * Config pública de la app web. Las reglas de Firestore protegen los datos.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  increment,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAg5KEvbbo6MFBQ2Kd46ujlZ6SxTROMm94",
  authDomain: "multisoft-portafolio.firebaseapp.com",
  projectId: "multisoft-portafolio",
  storageBucket: "multisoft-portafolio.firebasestorage.app",
  messagingSenderId: "1046337084057",
  appId: "1:1046337084057:web:1e870db225b70837943608",
  measurementId: "G-DPM2NK6RCN",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  increment,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
