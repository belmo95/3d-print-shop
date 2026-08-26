// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQ3hyYkKSI41KwrQojB3NqHc7s5dciVsA",
  authDomain: "d-print-shop-44b62.firebaseapp.com",
  projectId: "d-print-shop-44b62",
  storageBucket: "d-print-shop-44b62.firebasestorage.app",
  messagingSenderId: "694273190627",
  appId: "1:694273190627:web:be0969bf308fa6382df3d6",
  measurementId: "G-WYKED5ETMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);