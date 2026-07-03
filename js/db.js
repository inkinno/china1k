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
        this.hideLoginGate();
        showInfoToast("학습 데이터를 불러오는 중... (자동로그인 유지 중)");
        
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
        
        // 비로그인 기능 파괴 - 무조건 로그인 후 사용 가능하게 로그인 게이트 오버레이 표시
        this.showLoginGate();
        
        if (!isInitialAuthChecked) {
          isInitialAuthChecked = true;
          const urlParams = new URLSearchParams(window.location.search);
          const customToken = urlParams.get("token");

          if (customToken) {
            signInWithCustomToken(auth, customToken)
              .then(() => {
                showSuccessToast("사용자 토큰으로 로그인 완료!");
                this.hideLoginGate();
              })
              .catch((err) => {
                console.warn("Custom token login failed:", err);
                this.showLoginGate();
              });
          }
        }
      }
    });
  }

  // 필수 로그인 게이트 표시 (비로그인 접근 차단)
  showLoginGate() {
    const gate = document.getElementById("login-gate-overlay");
    if (gate) {
      gate.classList.remove("hidden");
      gate.setAttribute("aria-hidden", "false");
    }
  }

  // 필수 로그인 게이트 숨기기
  hideLoginGate() {
    const gate = document.getElementById("login-gate-overlay");
    if (gate) {
      gate.classList.add("hidden");
      gate.setAttribute("aria-hidden", "true");
    }
  }

  // 원클릭 간편 로그인 (로컬 테스트 및 자동 로그인 지원)
  async signInWithOneClickDemo() {
    showInfoToast("원클릭 간편 로그인 세션을 생성하는 중...");
    try {
      // 로컬 테스트/배포 환경 호환을 위해 익명 세션 생성 후 displayName 프로필 매핑
      const result = await signInAnonymously(auth);
      showSuccessToast("원클릭 간편 로그인 완료! (자동로그인 지원)");
      this.hideLoginGate();
    } catch (err) {
      console.error("OneClick Login Failed:", err);
      // 오프라인 상태이거나 파이어베이스 연결 제한 시 로컬 오프라인 세션 생성 (완전 방어 코드)
      const mockUser = {
        uid: "local_scholar_" + Date.now().toString().slice(-4),
        displayName: "천자문 장학생",
        photoURL: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=chunja_master"
      };
      this.isAuthenticated = true;
      this.userId = mockUser.uid;
      stateManager.update({ user: mockUser });
      await this.loadUserData();
      this.startAutoSaveTimer();
      this.hideLoginGate();
      showSuccessToast("로컬 오프라인 세션으로 로그인 완료! (자동로그인 지원)");
    }
  }

  // 구글 팝업 로그인 시도
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    showInfoToast("구글 로그인 팝업을 여는 중...");
    try {
      const result = await signInWithPopup(auth, provider);
      showSuccessToast(`${result.user.displayName}님 환영합니다!`);
      this.hideLoginGate();
    } catch (err) {
      console.warn("Google Sign-In failed:", err);
      if (err.code === 'auth/popup-blocked') {
        showErrorToast("팝업 차단이 감지되었습니다. 원클릭 간편 로그인을 이용하시거나 팝업 차단을 해제해 주세요.");
      } else {
        showErrorToast("구글 로그인 실패 (환경 제한 등). 원클릭 간편 로그인을 이용해 주세요.");
      }
    }
  }

  // 전역 요청 이벤트 핸들링 (헤더 등과의 이벤트 핸드쉐이크)
  initGlobalEvents() {
    // 구글 로그인 요청
    document.addEventListener("firebase-login-request", async () => {
      this.showLoginGate();
    });

    // 구글 로그아웃 요청
    document.addEventListener("firebase-logout-request", () => {
      signOut(auth)
        .then(() => {
          showSuccessToast("성공적으로 로그아웃되었습니다.");
          this.showLoginGate();
        })
        .catch(err => {
          // 로컬 세션 로그아웃 강제 처리
          this.isAuthenticated = false;
          this.userId = null;
          stateManager.resetState();
          stateManager.update({ user: null });
          this.showLoginGate();
          showSuccessToast("로그아웃되었습니다.");
        });
    });

    // 로그인 게이트 버튼 이벤트 바인딩
    setTimeout(() => {
      const gateGoogleBtn = document.getElementById("gate-google-login-btn");
      const gateDemoBtn = document.getElementById("gate-demo-login-btn");
      if (gateGoogleBtn) {
        gateGoogleBtn.addEventListener("click", () => this.signInWithGoogle());
      }
      if (gateDemoBtn) {
        gateDemoBtn.addEventListener("click", () => this.signInWithOneClickDemo());
      }
    }, 100);

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
        
        // 전역 상태에 로드된 데이터 업데이트 (방어적 구조 안전장치)
        const loadedPoints = parseFloat(data.points !== undefined && data.points !== null ? data.points : 0.0);
        const loadedStreak = parseInt(data.streak !== undefined && data.streak !== null ? data.streak : 0);
        const loadedBadges = Array.isArray(data.badges) ? data.badges : [];
        const loadedProgress = data.progress || {};
        const loadedWrongNote = data.wrongNote || {};
        const loadedLastWritingId = parseInt(data.lastWritingId !== undefined && data.lastWritingId !== null ? data.lastWritingId : 1);
        const loadedShop = {
          streakShields: data.shop?.streakShields !== undefined && data.shop?.streakShields !== null ? data.shop.streakShields : 0,
          purchasedPetSlots: Array.isArray(data.shop?.purchasedPetSlots) ? data.shop.purchasedPetSlots : []
        };

        stateManager.update({
          points: loadedPoints,
          streak: loadedStreak,
          badges: loadedBadges,
          progress: loadedProgress,
          wrongNote: loadedWrongNote,
          lastWritingId: loadedLastWritingId,
          shop: loadedShop
        });

        // 로드 성공 시 스냅샷 문자열 백업 (Dirty Checking의 기준점)
        const snapshotStr = JSON.stringify({
          points: loadedPoints,
          streak: loadedStreak,
          badges: loadedBadges,
          progress: loadedProgress,
          wrongNote: loadedWrongNote,
          lastWritingId: loadedLastWritingId,
          shop: loadedShop
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
          lastWritingId: 1,
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
        lastWritingId: state.lastWritingId || 1,
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
        lastWritingId: state.lastWritingId || 1,
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
