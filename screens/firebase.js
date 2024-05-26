import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcdhH2J4NOblRPOXBCPk6wFJI_UtIlU80",
  authDomain: "storytelling-53b62.firebaseapp.com",
  databaseURL: "https://storytelling-53b62-default-rtdb.firebaseio.com",
  projectId: "storytelling-53b62",
  storageBucket: "storytelling-53b62.appspot.com",
  messagingSenderId: "301707833510",
  appId: "1:301707833510:web:40af73c184ff9b691cc467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
const firestore = getFirestore(app);
const database = getDatabase(app);

export { auth, firestore, database };
