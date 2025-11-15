import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkL3WevyRmx9qmTTFAeSpRgHnQeKiBGEw",
  authDomain: "test-app-e74a3.firebaseapp.com",
  projectId: "test-app-e74a3",
  storageBucket: "test-app-e74a3.firebasestorage.app",
  messagingSenderId: "357137629784",
  appId: "1:357137629784:web:265c65790fa73ea8b4402d",
  measurementId: "G-YFS9TR5CZS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
