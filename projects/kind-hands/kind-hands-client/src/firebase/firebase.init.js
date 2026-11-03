import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getEnvValue = (...keys) => {
  for (const key of keys) {
    const value = import.meta.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const firebaseConfig = {
  apiKey: getEnvValue("VITE_FIREBASE_API_KEY", "VITE_apiKey"),
  authDomain: getEnvValue("VITE_FIREBASE_AUTH_DOMAIN", "VITE_authDomain"),
  projectId: getEnvValue("VITE_FIREBASE_PROJECT_ID", "VITE_projectId"),
  storageBucket: getEnvValue("VITE_FIREBASE_STORAGE_BUCKET", "VITE_storageBucket"),
  messagingSenderId: getEnvValue(
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_messagingSenderId"
  ),
  appId: getEnvValue("VITE_FIREBASE_APP_ID", "VITE_appId"),
};

const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseKeys.length > 0) {
  throw new Error(
    `Missing Firebase config values: ${missingFirebaseKeys.join(
      ", "
    )}. Add them to your .env.local file.`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 