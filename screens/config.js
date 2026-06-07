// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRSUTf2mCRuAXV6mjqUk_5UWsql8Azr3g",
  authDomain: "storytelling-53b62.firebaseapp.com",
  databaseURL: "https://storytelling-53b62-default-rtdb.firebaseio.com",
  projectId: "volunteering-app-70788-vf3",
  storageBucket: "volunteering-app-70788.appspot.com",
  messagingSenderId: "94824584734",
  appId: "1:94824584734:ios:b7c7039bfd3a1e31b6000f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };