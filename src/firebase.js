import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "lolacine-3d94c.firebaseapp.com",
    projectId: "lolacine-3d94c",
    storageBucket: "lolacine-3d94c.appspot.com",
    messagingSenderId: "579960712111",
    appId: "1:579960712111:web:93a6b96356483e5b891d5a",
    measurementId: "G-BZYPSPLGF9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);