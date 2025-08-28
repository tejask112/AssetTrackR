import { initializeApp, getApps, initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,

    apiKey: "AIzaSyCTHbUKYhQ0z7VCQomGj4x8PNMLjIlk3-Y",
    authDomain: "assettrackr-76d1d.firebaseapp.com",
    projectId: "assettrackr-76d1d",
    appId: "1:618780661855:web:efe3a4afc4cbeda49e63ea",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);