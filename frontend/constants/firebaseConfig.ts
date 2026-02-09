import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Custom implementation of getReactNativePersistence to avoid import issues
const getReactNativePersistence = (storage: any) => {
  const STORAGE_AVAILABLE_KEY = '__sak';
  
  class ReactNativePersistence {
    static type = 'LOCAL';
    type = 'LOCAL';

    async _isAvailable() {
      try {
        if (!storage) {
          return false;
        }
        await storage.setItem(STORAGE_AVAILABLE_KEY, '1');
        await storage.removeItem(STORAGE_AVAILABLE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    _set(key: string, value: any) {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get(key: string) {
      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }

    _remove(key: string) {
      return storage.removeItem(key);
    }

    _addListener(_key: string, _listener: any) {
      return;
    }

    _removeListener(_key: string, _listener: any) {
      return;
    }
  }

  return ReactNativePersistence;
};


// TODO: Replace with your Firebase Client SDK Config
// You can find this in Firebase Console > Project Settings > General > Your Apps > Web App
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

let app;
let auth: any;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Initialize Auth with AsyncStorage persistence for React Native
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as any
    });
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
