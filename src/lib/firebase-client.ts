// This file is intended for client-side use only.
'use client';

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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This function is the key to making sure that Firebase is initialized only on the client side.
function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            if (
                !firebaseConfig.apiKey ||
                !firebaseConfig.authDomain ||
                !firebaseConfig.projectId
            ) {
                 console.error(
                    'Firebase config is not set. Make sure you have a .env.local file with all the required NEXT_PUBLIC_FIREBASE_ variables.'
                );
                return;
            }
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
        } else {
            app = getApp();
            auth = getAuth(app);
            db = getFirestore(app);
        }
    }
}

// We call the function to ensure Firebase is initialized on the client
initializeFirebase();

// We export the instances directly for use in other client components.
export { app, auth, db };
