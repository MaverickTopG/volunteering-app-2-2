// screens/firebase.js
import firebase from 'firebase/app';
import 'firebase/auth'; // If you need authentication
import 'firebase/firestore'; // If you need Firestore database
import 'firebase/database'; // If you need Realtime Database

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAaOxt9Jz7VR1KHhZ_WWtGbSKBTSVXs8hY",
  authDomain: "volunteer-app-740ce.firebaseapp.com",
  projectId: "volunteer-app-740ce",
  storageBucket: "volunteer-app-740ce.appspot.com",
  messagingSenderId: "72621337040",
  appId: "1:72621337040:web:a6409ecb5817a2e806f1d5"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
