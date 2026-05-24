// ==========================================================================
// Firebase 모듈러 SDK ESM 설정 및 초기화
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// MVP 데모용 기본 Firebase Configuration
// 실운영 환경 시 github secrets 또는 배포 플랫폼 환경변수 설정과 연계 가능
const firebaseConfig = {
  apiKey: "AIzaSyB302rzFrFuCbX7hN_yc6W_H6YLMXlURmw",
  authDomain: "chinese1k-bc951.firebaseapp.com",
  projectId: "chinese1k-bc951",
  storageBucket: "chinese1k-bc951.firebasestorage.app",
  messagingSenderId: "247252817642",
  appId: "1:247252817642:web:87622c981837428e6be993",
  measurementId: "G-KY2JSXC9F8"
};

// Firebase 앱 및 서비스 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 애플리케이션 ID 정의 (Firestore 경로 설계용)
const appId = "china1k";

export { app, auth, db, appId };
