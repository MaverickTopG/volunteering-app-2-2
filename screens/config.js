import { initializeApp } from '@react-native-firebase/app';

export const firebaseConfig = {
  apiKey: "AIzaSyAaOxt9Jz7VR1KHhZ_WWtGbSKBTSVXs8hY",
  authDomain: "volunteer-app-740ce.firebaseapp.com",
  projectId: "volunteer-app-740ce",
  storageBucket: "volunteer-app-740ce.appspot.com",
  messagingSenderId: "72621337040",
  appId: "1:72621337040:web:a6409ecb5817a2e806f1d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;