import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwYY1CMyxQ3H7aMyFNbNxrIh6PB4KsJk0",
  authDomain: "gen-lang-client-0278855774.firebaseapp.com",
  projectId: "gen-lang-client-0278855774",
  storageBucket: "gen-lang-client-0278855774.firebasestorage.app",
  messagingSenderId: "401586248654",
  appId: "1:401586248654:web:e7a1435e83f9624402e99f",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, "ai-studio-978639ca-4f49-4962-9b26-6816a58500c4");
export const auth = getAuth(app);
export default app;
