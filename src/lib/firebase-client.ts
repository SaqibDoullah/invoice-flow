
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, memoryLocalCache } from 'firebase/firestore';
import { firebaseConfig } from './firebase';

// Ensure all config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  throw new Error(
    'Firebase config is not set. Make sure you have a .env.local file with all the required NEXT_PUBLIC_FIREBASE_ variables.'
  );
}

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
  localCache:
    typeof window !== 'undefined'
      ? persistentLocalCache()
      : memoryLocalCache(),
});

export { app, auth, db };
