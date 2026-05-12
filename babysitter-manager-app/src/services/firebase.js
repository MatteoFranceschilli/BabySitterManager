import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let savedConfig = null;
try {
  savedConfig = JSON.parse(localStorage.getItem('bm_fb_config'));
} catch (e) {}

let app = null;
let db_fs = null;
let auth_fb = null;

if (savedConfig && savedConfig.apiKey) {
  try {
    app = initializeApp(savedConfig);
    db_fs = getFirestore(app);
    auth_fb = getAuth(app);
  } catch (error) {
    console.error("Firebase init failed:", error);
  }
}

export { app, db_fs, auth_fb };
