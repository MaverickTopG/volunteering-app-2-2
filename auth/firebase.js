import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1kY4dlbg9v38ZkuYVPJGnSulMEouvw58",
  authDomain: "nexolink-b8eb5.firebaseapp.com",
  projectId: "nexolink-b8eb5",
  storageBucket: "nexolink-b8eb5.appspot.com",
  messagingSenderId: "247675121621",
  appId: "1:247675121621:web:98772b2e0cfbe8a381175c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };