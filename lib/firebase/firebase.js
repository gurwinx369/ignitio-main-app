// app/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDIEt3oa0WdFy5YQyTC-Uf-cgTSHCIGVPc",
    authDomain: "ignitio-7e45a.firebaseapp.com",
    projectId: "ignitio-7e45a",
    storageBucket: "ignitio-7e45a.firebasestorage.app",
    messagingSenderId: "309371567173",
    appId: "1:309371567173:web:543ba289b46646bc86772c",
    measurementId: "G-3FWXQWYZRC"
};

// Initialize Firebase only if it hasn't been initialized
const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];


// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: "select_account",
});

export default app;
