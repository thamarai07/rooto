// lib/firebase.ts
import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA-VPMtRXkKgl8tYIjbz-s6FRDdnII_Y8s",
  authDomain: "rootopro.firebaseapp.com",
  projectId: "rootopro",
  storageBucket: "rootopro.firebasestorage.app",
  messagingSenderId: "983339507616",
  appId: "1:983339507616:web:baa0855afb903ee2860ec5"
};

// Prevent duplicate app init in Next.js hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)