// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS8GBXa0d2vvqaRHmt377DWMZ2HP0X9tQ",
  authDomain: "ai-schedular-5666f.firebaseapp.com",
  projectId: "ai-schedular-5666f",
  storageBucket: "ai-schedular-5666f.firebasestorage.app",
  messagingSenderId: "324250569907",
  appId: "1:324250569907:web:6af1e4b01714186a6e74c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;