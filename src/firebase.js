// ============================================================
// 🔥 Firebase 설정 파일
// 아래 값들을 Firebase 콘솔에서 발급받은 실제 키로 교체해 주세요.
// Firebase Console: https://console.firebase.google.com/
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAorf4Hoh3C5z0cCOJ1sNiL1drg0zsg7bA",
  authDomain: "doran-doran-2031e.firebaseapp.com",
  projectId: "doran-doran-2031e",
  storageBucket: "doran-doran-2031e.firebasestorage.app",
  messagingSenderId: "776310190319",
  appId: "1:776310190319:web:6673b359d1534cac6a2b1a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
