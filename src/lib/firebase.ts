import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmKdDSTI-QFjs0-PNh2n9Rdk7YSbiLSrM",
  authDomain: "earning-wh.firebaseapp.com",
  databaseURL: "https://earning-wh-default-rtdb.firebaseio.com",
  projectId: "earning-wh",
  storageBucket: "earning-wh.firebasestorage.app",
  messagingSenderId: "250293182953",
  appId: "1:250293182953:web:8bf5f7840ff284c66c2b78"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
