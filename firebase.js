// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔁 Sostituisci con i tuoi valori presi da Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDjfnl3g7eCO780nsDfHHuoC0-8L5z272k",
  authDomain: "staysafer-app.firebaseapp.com",
  projectId: "staysafer-app",
  storageBucket: "staysafer-app.firebasestorage.app",
  messagingSenderId: "1059783438756",
  appId: "1:1059783438756:android:da3641ae231df6389fd131",
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza Firestore
const db = getFirestore(app);

export { db };
