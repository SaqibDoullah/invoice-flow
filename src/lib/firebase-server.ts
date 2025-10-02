import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // This is for local development without service account
    // It will use Application Default Credentials
    // `gcloud auth application-default login`
    initializeApp();
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
