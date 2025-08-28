// This file is intended for client-side use only.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseApp() {
    // This function should only be called on the client side.
    if (typeof window === 'undefined') {
        return null;
    }

    if (getApps().length === 0) {
        if (
            !firebaseConfig.apiKey ||
            !firebaseConfig.authDomain ||
            !firebaseConfig.projectId
        ) {
            console.warn(
            'Firebase config is not set. Make sure you have a .env.local file with all the required NEXT_PUBLIC_FIREBASE_ variables.'
            );
            return null;
        }
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }

    if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
    }

    return app;
}


export { getFirebaseApp, app, auth, db };
