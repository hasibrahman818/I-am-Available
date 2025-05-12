// config.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD68CsRSsk_A1YfXE6hn5DLwLqlS_NsgEE",
  authDomain: "schedule-app-11944.firebaseapp.com",
  projectId: "schedule-app-11944",
  storageBucket: "schedule-app-11944.firebasestorage.app",
  messagingSenderId: "86528850906",
  appId: "1:86528850906:web:245cbe9475cfb8275a9ee3",
  measurementId: "G-RPZ8P7ZKZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);