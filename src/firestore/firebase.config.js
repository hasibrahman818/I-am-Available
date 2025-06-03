// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const db = getFirestore(app);

export const auth = getAuth(app);

