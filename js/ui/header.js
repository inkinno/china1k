// ==========================================================================
// 상단 Sticky Header 및 Navigation 제어 모듈
// ==========================================================================
import stateManager from "../state.js";
import { showAlert } from "./modal.js";

class HeaderController {
  constructor() {
    this.pointsEl = document.getElementById("user-points");
    this.streakEl = document.getElementById("user-streak");
    this.badgesEl = document.getElementById("user-badges");
    this.syncStatusEl = document.getElementById("sync-status");
    this.manualSaveBtn = document.getElementById("manual-save-btn");
    this.authActionBtn = document.getElementById("auth-action-btn");
    this.userAvatar = document.getElementById("user-avatar");
    
    this.saveCooldownTimer = null;
    this.cooldownSeconds = 0;
    
    this.initEvents();
    this.listenToState();
  }

  // UI 이벤트 리스너 바인딩
  initEvents() {
    // 탭 버튼 클릭 이벤트 바인딩
    const tabs = document.querySelectorAll(".navigation-tabs .tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains("locked")) {
          const wrongCount = Object.keys(stateManager.get().wrongNote).length;
          showAlert(
            "<i class='fa-solid fa-lock modal-lock-icon'></i> 오답노트 잠금",
            `오답노트에 누적된 틀린 한자가 최소 <b>15개 이상</b>이어야 잠금이 해제됩니다.<br><br>현재 오답 한자 수: <b class='metric-txt'>${wrongCount}개 / 15개</b><br><br>진도 학습 탭에서 카드를 학습하고 시험을 쳐서 틀린 한자를 채워 보세요!`
          );
          return;
        }
        
        const tabName = tab.getAttribute("data-tab");
        stateManager.update({ currentView: tabName });
      });
    });

    // 로그인 / 로그아웃 액션
    this.authActionBtn.addEventListener("click", () => {
      const { user } = stateManager.get();
      if (user) {
        // 로그인된 상태일 때 -> 로그아웃
        document.dispatchEvent(new CustomEvent("firebase-logout-request"));
      } else {
        // 미인증 상태일 때 -> 로그인 게이트 띄우기 또는 로그인 시도
        document.dispatchEvent(new CustomEvent("firebase-login-request"));
      }
    });

    // 수동 저장 요청 액션
    this.manualSaveBtn.addEventListener("click", () => {
      if (this.cooldownSeconds > 0) return;
      document.dispatchEvent(new CustomEvent("firestore-manual-save-request"));
    });
  }

  // 전역 상태 변화 실시간 감지 및 렌더링
  listenToState() {
    stateManager.subscribe((oldState, newState) => {
      if (!newState) return;
      const old = oldState || {};

      // 1. 포인트, Streak, 배지 실시간 동기화
      const oldPoints = old.points !== undefined ? old.points : 0.0;
      const newPoints = newState.points !== undefined ? newState.points : 0.0;
      if (oldPoints !== newPoints) {
        this.pointsEl.textContent = typeof newPoints === 'number' ? newPoints.toFixed(1) : "0.0";
        this.animateIncrement(this.pointsEl);
      }

      const oldStreak = old.streak !== undefined ? old.streak : 0;
      const newStreak = newState.streak !== undefined ? newState.streak : 0;
      if (oldStreak !== newStreak) {
        this.streakEl.textContent = newStreak;
      }

      const oldBadgesLen = old.badges ? old.badges.length : 0;
      const newBadgesLen = newState.badges ? newState.badges.length : 0;
      if (oldBadgesLen !== newBadgesLen) {
        this.badgesEl.textContent = newBadgesLen;
      }

      // 2. 동기화 데이터 변경점 Dirty 여부 체크 배지 갱신
      const isDirty = this.checkIfDirty(newState);
      if (isDirty) {
        this.syncStatusEl.className = "sync-badge dirty";
        this.syncStatusEl.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> 저장 필요';
      } else {
        this.syncStatusEl.className = "sync-badge clean";
        this.syncStatusEl.innerHTML = '<i class="fa-solid fa-cloud-check"></i> 동기화됨';
      }

      // 3. 탭 버튼 Active 상태 동기화 및 오답노트 잠금 해제 제어
      if (old.currentView !== newState.currentView) {
        this.updateActiveTabUI(newState.currentView);
      }

      // 오답노트 해제 상태 상시 검사
      const wrongCount = newState.wrongNote ? Object.keys(newState.wrongNote).length : 0;
      const wrongnoteTab = document.getElementById("tab-wrongnote");
      if (wrongnoteTab) {
        if (wrongCount >= 15) {
          if (wrongnoteTab.classList.contains("locked")) {
            wrongnoteTab.classList.remove("locked");
            const lockInd = wrongnoteTab.querySelector(".lock-indicator");
            if (lockInd) lockInd.remove();
            wrongnoteTab.title = "오답노트 학습 가능";
          }
        } else {
          if (!wrongnoteTab.classList.contains("locked")) {
            wrongnoteTab.classList.add("locked");
            if (!wrongnoteTab.querySelector(".lock-indicator")) {
              const span = document.createElement("span");
              span.className = "lock-indicator";
              span.innerHTML = '<i class="fa-solid fa-lock"></i>';
              wrongnoteTab.appendChild(span);
            }
            wrongnoteTab.title = "오답 15개 이상 누적 시 잠금 해제";
          }
        }
      }

      // 4. 로그인 상태 렌더링
      if (old.user !== newState.user) {
        if (newState.user) {
          // 사용자 로그인 상태일 때 로그아웃 버튼 노출
          this.authActionBtn.className = "auth-btn logout";
          this.authActionBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> 로그아웃';
          this.userAvatar.src = newState.user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${newState.user.uid || 'china1k'}`;
        } else {
          // 로그아웃 상태일 때는 로그인 버튼 노출
          this.authActionBtn.className = "auth-btn login";
          this.authActionBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> 로그인';
          this.userAvatar.src = "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=china1k";
        }
      }
    });
  }

  // 수동 저장 성공 시 3분 쿨타임 타이머 구동
  startSaveCooldown() {
    this.cooldownSeconds = 180; // 3분 = 180초
    this.manualSaveBtn.disabled = true;
    
    if (this.saveCooldownTimer) clearInterval(this.saveCooldownTimer);
    
    this.saveCooldownTimer = setInterval(() => {
      this.cooldownSeconds -= 1;
      if (this.cooldownSeconds <= 0) {
        clearInterval(this.saveCooldownTimer);
        this.manualSaveBtn.disabled = false;
        this.manualSaveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 저장';
      } else {
        const min = Math.floor(this.cooldownSeconds / 60);
        const sec = this.cooldownSeconds % 60;
        this.manualSaveBtn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${min}:${sec.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  // 활성 탭 UI 갱신
  updateActiveTabUI(activeTabName) {
    const tabs = document.querySelectorAll(".navigation-tabs .tab-btn");
    tabs.forEach(tab => {
      const dataTab = tab.getAttribute("data-tab");
      if (dataTab === activeTabName) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  // 현재 로컬 데이터 상태가 DB 최종 상태와 다른지 단순 JSON 비교 검출 (Dirty Checking)
  checkIfDirty(state) {
    if (!state || !state.lastLoadedData) return false;
    
    const currentSnapshot = JSON.stringify({
      points: state.points !== undefined ? state.points : 0.0,
      streak: state.streak !== undefined ? state.streak : 0,
      badges: state.badges || [],
      progress: state.progress || {},
      wrongNote: state.wrongNote || {},
      shop: state.shop || { streakShields: 0, purchasedPetSlots: [] }
    });
    
    return currentSnapshot !== state.lastLoadedData;
  }

  // 포인트 증가 시 미세 버스트 스케일 마이크로 애니메이션
  animateIncrement(element) {
    element.style.transform = "scale(1.25)";
    element.style.color = "var(--gold)";
    element.style.transition = "transform 0.15s, color 0.15s";
    setTimeout(() => {
      element.style.transform = "scale(1.0)";
      element.style.color = "";
    }, 150);
  }
}

// 즉시 또는 돔 완성 시 헤더 컨트롤러 구동 (ESM 타이밍 버그 방지형 안전장치)
const initHeader = () => {
  if (!window.headerController) {
    window.headerController = new HeaderController();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}

export default HeaderController;
