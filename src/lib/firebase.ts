// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKxDev7qpUOf8XdVrjWXVAgsZ38gRTS3U",
  authDomain: "laww-85aee.firebaseapp.com",
  projectId: "laww-85aee",
  storageBucket: "laww-85aee.firebasestorage.app",
  messagingSenderId: "567169480389",
  appId: "1:567169480389:web:b43abf1a451a03b2ab62ac",
  measurementId: "G-5XBYWVLES2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
