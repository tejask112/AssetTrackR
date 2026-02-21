import { initializeApp, getApps, initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyCTHbUKYhQ0z7VCQomGj4x8PNMLjIlk3-Y",
  authDomain: "assettrackr-76d1d.firebaseapp.com",
  projectId: "assettrackr-76d1d",
  storageBucket: "assettrackr-76d1d.firebasestorage.app",
  messagingSenderId: "618780661855",
  appId: "1:618780661855:web:efe3a4afc4cbeda49e63ea",
  measurementId: "G-4K9ETC2YCM"
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);