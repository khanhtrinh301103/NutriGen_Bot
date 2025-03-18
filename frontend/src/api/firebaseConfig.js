// frontend/src/api/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDqw21EVpn50Zat-m2GZwU-b8-3skl4dOE",
    authDomain: "nutrigen-bot-dd79d.firebaseapp.com",
    projectId: "nutrigen-bot-dd79d",
    storageBucket: "nutrigen-bot-dd79d.appspot.com",
    messagingSenderId: "159253848647",
    appId: "1:159253848647:web:03153e86e4744253078762",
    measurementId: "G-4ZHJC8C4S4"
};
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };