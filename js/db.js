// ==========================================================================
// Firestore 데이터베이스 연동 & 동기화 아키텍처 (Save / Load / Auth Logic)
// ==========================================================================
import { 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { auth, db, appId } from "./config.js";
import stateManager from "./state.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "./ui/toast.js";
import { showAlert } from "./ui/modal.js";

class DatabaseManager {
  constructor() {
    this.isAuthenticated = false;
    this.userId = null;
    this.lastSavedTime = 0; // 마지막 저장 타임스탬프 (쿨타임 제어용)
    this.autoSaveInterval = null;
    
    this.initAuth();
    this.initGlobalEvents();
  }

  // 1. Firebase 인증 프로세스 초기화
  initAuth() {
    let isInitialAuthChecked = false;

    // Auth 상태 상시 감시 리스너
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        isInitialAuthChecked = true;
        this.isAuthenticated = true;
        this.userId = user.uid;
        stateManager.update({ user });
        showInfoToast("학습 데이터를 Firestore로부터 불러오는 중...");
        
        // 인증 즉시 클라이언트 데이터 로드 트리거
        await this.loadUserData();
        
        // 10분 주기 자동 저장 백그라운드 타이머 시작
        this.startAutoSaveTimer();
      } else {
        this.isAuthenticated = false;
        this.userId = null;
        this.stopAutoSaveTimer();
        stateManager.resetState();
        stateManager.update({ user: null });
        
        // 최초 상태 감지 시 기존에 아무 세션이 없었던 경우에만 신규 로그인/익명 폴백 시도
        if (!isInitialAuthChecked) {
          isInitialAuthChecked = true;
          
          const urlParams = new URLSearchParams(window.location.search);
          const customToken = urlParams.get("token");

          if (customToken) {
            signInWithCustomToken(auth, customToken)
              .then((userCredential) => {
                showSuccessToast("사용자 토큰으로 로그인 완료!");
              })
              .catch((err) => {
                console.warn("Custom token login failed, falling back to Anonymous:", err);
                this.fallbackToAnonymous();
              });
          } else {
            this.fallbackToAnonymous();
          }
        }
      }
    });
  }

  // 익명 로그인 폴백
  fallbackToAnonymous() {
    // 이미 로그인된 상태가 아닐 때만 익명 로그인 시도
    if (auth.currentUser) return;
    
    signInAnonymously(auth)
      .then(() => {
        showInfoToast("익명 세션으로 천자문 학습을 시작합니다.");
      })
      .catch((err) => {
        showErrorToast("인증 세션 생성 실패. 오프라인 모드로 진입합니다.");
        console.error("Auth Failure:", err);
      });
  }

  // 구글 팝업 로그인 시도
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    showInfoToast("구글 로그인 팝업을 여는 중...");
    try {
      const result = await signInWithPopup(auth, provider);
      showSuccessToast(`${result.user.displayName}님 환영합니다!`);
    } catch (err) {
      console.warn("Google Sign-In failed, falling back to Anonymous:", err);
      // 구글 로그인 취소 또는 에러 시 익명 로그인 폴백
      this.fallbackToAnonymous();
    }
  }

  // 전역 요청 이벤트 핸들링 (헤더 등과의 이벤트 핸드쉐이크)
  initGlobalEvents() {
    // 구글 로그인 요청
    document.addEventListener("firebase-login-request", async () => {
      await this.signInWithGoogle();
    });

    // 구글 로그아웃 요청
    document.addEventListener("firebase-logout-request", () => {
      signOut(auth)
        .then(() => showSuccessToast("성공적으로 로그아웃되었습니다."))
        .catch(err => showErrorToast("로그아웃 실패"));
    });

    // 수동 저장 요청 이벤트
    document.addEventListener("firestore-manual-save-request", async () => {
      await this.handleManualSave();
    });

    // 시험/오답노트 완료 시 즉시 저장 요청 (3분 쿨타임 우회 강제 저장)
    document.addEventListener("firestore-immediate-save-request", async () => {
      await this.saveUserData(true);
    });
  }

  // 2. 수동 저장 제어 및 3분 쿨타임 검사
  async handleManualSave() {
    const now = Date.now();
    const elapsedTime = now - this.lastSavedTime;
    const cooldownPeriod = 3 * 60 * 1000; // 3분 = 180,000ms

    if (elapsedTime < cooldownPeriod) {
      const remainingSeconds = Math.ceil((cooldownPeriod - elapsedTime) / 1000);
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      
      showAlert(
        "<i class='fa-solid fa-hourglass-half modal-wait-icon'></i> 저장 대기 중",
        `데이터 동기화 과부하 방지를 위해 수동 저장 버튼은 3분에 한 번만 활성화됩니다.<br><br><b>재시도 가능 시간: ${min}분 ${sec}초 후</b>`
      );
      return;
    }

    const saved = await this.saveUserData(false);
    if (saved) {
      this.lastSavedTime = now;
      // 헤더 컴포넌트에 수동 저장 쿨타임 가동 지시
      if (window.headerController) {
        window.headerController.startSaveCooldown();
      }
    }
  }

  // 3. 10분 주기 자동 저장 타이머 제어
  startAutoSaveTimer() {
    this.stopAutoSaveTimer();
    const intervalTime = 10 * 60 * 1000; // 10분 = 600,000ms
    
    this.autoSaveInterval = setInterval(async () => {
      if (this.isAuthenticated) {
        console.log("10-minute Auto Saving Triggered in background...");
        await this.saveUserData(true); // 자동 저장은 백그라운드이므로 쿨타임 검사를 우회해 조용히 저장함
      }
    }, intervalTime);
  }

  stopAutoSaveTimer() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // 4. Firestore 개인 학습 데이터 로드 (LOAD)
  async loadUserData() {
    if (!this.isAuthenticated || !this.userId) return;

    try {
      // 엄격한 Firestore 경로 규칙 준수
      // doc(db, 'artifacts', appId, 'users', userId, 'progress', 'status')
      const docRef = doc(db, "artifacts", appId, "users", this.userId, "progress", "status");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 전역 상태에 로드된 데이터 업데이트
        stateManager.update({
          points: parseFloat(data.points || 0.0),
          streak: parseInt(data.streak || 0),
          badges: data.badges || [],
          progress: data.progress || {},
          wrongNote: data.wrongNote || {},
          shop: data.shop || { streakShields: 0, purchasedPetSlots: [] }
        });

        // 로드 성공 시 스냅샷 문자열 백업 (Dirty Checking의 기준점)
        const snapshotStr = JSON.stringify({
          points: stateManager.state.points,
          streak: stateManager.state.streak,
          badges: stateManager.state.badges,
          progress: stateManager.state.progress,
          wrongNote: stateManager.state.wrongNote,
          shop: stateManager.state.shop
        });
        stateManager.update({ lastLoadedData: snapshotStr });
        
        showSuccessToast("Firestore로부터 클라우드 데이터를 안전하게 불러왔습니다.");
      } else {
        // 데이터가 없는 최초 로그인 유저의 경우 로컬 상태를 기준으로 초기 스냅샷 생성
        const snapshotStr = JSON.stringify({
          points: 0.0,
          streak: 0,
          badges: [],
          progress: {},
          wrongNote: {},
          shop: { streakShields: 0, purchasedPetSlots: [] }
        });
        stateManager.update({ lastLoadedData: snapshotStr });
        showInfoToast("새로운 학습 세션이 생성되었습니다. 환영합니다!");
      }
    } catch (err) {
      console.error("Firestore Load Failed:", err);
      showErrorToast("클라우드 데이터를 불러오는데 실패하여 로컬 모드로 동작합니다.");
    }
  }

  // 5. Firestore 개인 학습 데이터 저장 (SAVE & Dirty Checking)
  /**
   * 클라이언트 데이터를 Firestore에 저장합니다. (Dirty Checking 적용)
   * @param {boolean} bypassCooldown - 3분 쿨타임을 무시하고 즉시 강제 저장할지 여부 (백그라운드 자동 저장, 시험 완료 시)
   * @returns {Promise<boolean>} 저장 시도 성공 여부
   */
  async saveUserData(bypassCooldown = false) {
    if (!this.isAuthenticated || !this.userId) {
      showErrorToast("저장 실패: 로그인이 완료되지 않은 비인증 상태입니다.");
      return false;
    }

    try {
      const state = stateManager.get();
      
      // 현재의 로컬 상태 데이터를 JSON 문자열화
      const currentSnapshot = JSON.stringify({
        points: state.points,
        streak: state.streak,
        badges: state.badges,
        progress: state.progress,
        wrongNote: state.wrongNote,
        shop: state.shop
      });

      // [Dirty Checking]
      // 마지막 저장/로드 스냅샷과 현재의 데이터가 완벽하게 일치하는지 비교 연산 수행
      if (currentSnapshot === state.lastLoadedData) {
        // 일치한다면 불필요한 네트워크 트래픽 및 Firestore 쓰기 비용 낭비를 절약하기 위해 API 호출 생략!
        showSuccessToast("저장 완료: 변경점이 없어 네트워크 트래픽을 절약했습니다.");
        return true;
      }

      // 일치하지 않을 때(Dirty)에만 Firestore에 쓰기 요청 트리거
      const docRef = doc(db, "artifacts", appId, "users", this.userId, "progress", "status");
      
      const payload = {
        points: state.points,
        streak: state.streak,
        badges: state.badges,
        progress: state.progress,
        wrongNote: state.wrongNote,
        shop: state.shop,
        lastSavedAt: new Date().toISOString()
      };

      await setDoc(docRef, payload);

      // 저장 성공 후 현재 스냅샷을 새로운 기준으로 갱신
      stateManager.update({ lastLoadedData: currentSnapshot });
      showSuccessToast("Firestore 클라우드에 학습 이력을 완벽히 저장했습니다!");
      return true;

    } catch (err) {
      console.error("Firestore Save Failed:", err);
      showErrorToast("클라우드 서버에 저장 실패: 무선 네트워크 상태를 확인하세요.");
      return false;
    }
  }
}

// DatabaseManager 인스턴스 전역 생성 및 외부 제공
const dbManager = new DatabaseManager();
export default dbManager;
