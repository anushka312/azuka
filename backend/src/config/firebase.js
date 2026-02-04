import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase credentials are provided in environment variables
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log("🔥 Firebase Admin Initialized Successfully");
  } catch (error) {
    console.error("❌ Firebase Initialization Error: Invalid JSON in FIREBASE_SERVICE_ACCOUNT", error);
  }
} else {
  console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not found in .env. Firebase features will be disabled.");
}

export const verifyIdToken = async (token) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw error;
  }
};

export default admin;
