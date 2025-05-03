import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Verificar que las variables de entorno estén disponibles
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

// Verificar que todas las variables requeridas estén presentes
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error('Missing required environment variables. Please check your .env file.');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDmktH8xjHMVDUicz9nvVvs2obzrQcHMbs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mushroom-62e3c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mushroom-62e3c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mushroom-62e3c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "779002576435",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:779002576435:web:055b0e61ce9d4dc96e6d46",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LPN1ZZZ945"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Enable persistence with multi-tab support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support persistence
    console.log('Persistence not supported by browser');
  }
});

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Error initializing analytics:', error);
  }
}

export { auth, db, analytics, googleProvider };
export default app; 