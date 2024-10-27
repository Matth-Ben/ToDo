import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Firestore SDK
import { getAuth } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcY8rDGGxKUwxRd58t7QJRWYJBf-R31l8",
  authDomain: "mytodolist-d0cfa.firebaseapp.com",
  projectId: "mytodolist-d0cfa",
  storageBucket: "mytodolist-d0cfa.appspot.com",
  messagingSenderId: "178847009221",
  appId: "1:178847009221:web:91ea9742ab464cb01823ac",
  measurementId: "G-1JJK0Q0S7N"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de Firestore
const db = getFirestore(app);

// Initialisation de Firebase Auth
const auth = getAuth(app);

// Exporter le plugin pour Nuxt 3
export default defineNuxtPlugin(() => {
  return {
    provide: {
      db,
      auth
    }
  };
});
