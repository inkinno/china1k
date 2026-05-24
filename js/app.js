// ==========================================================================
// 통합 애플리케이션 진입점 및 SPA 라우팅 컨트롤러 (App Entrypoint & Router)
// ==========================================================================
import stateManager from "./state.js";
import dbManager from "./db.js"; // Firebase Auth 및 Firestore 모동화 구동

// 각 화면 뷰 컴포넌트 로드
import dashboardView from "./views/dashboard.js";
import flashcardView from "./views/flashcard.js";
import quizView from "./views/quiz.js";
import wrongnoteView from "./views/wrongnote.js";
import shopView from "./views/shop.js";

// UI 컨트롤러 (네비게이션 탭 등) 로드
import "./ui/header.js";

class AppRouter {
  constructor() {
    this.views = {
      dashboard: dashboardView,
      flashcard: flashcardView,
      quiz: quizView,
      wrongnote: wrongnoteView,
      shop: shopView
    };
    
    this.initRouter();
  }

  initRouter() {
    // 전역 상태의 currentView 변화를 구독하여 동적으로 뷰 체인지 및 렌더링 조율
    stateManager.subscribe((oldState, newState) => {
      if (oldState.currentView !== newState.currentView) {
        this.switchView(newState.currentView);
      }
    });

    // 초기 화면 마운트
    this.switchView(stateManager.get().currentView);
  }

  /**
   * 지정된 탭 뷰로 전환하고 화면을 다시 렌더링합니다.
   * @param {string} viewName - 전환할 대상 뷰 ID (dashboard, flashcard 등)
   */
  switchView(viewName) {
    const targetView = this.views[viewName];
    if (!targetView) {
      console.error(`Error: View '${viewName}' is not defined.`);
      return;
    }

    // 1. 모든 뷰 섹션 비활성화 처리
    const sections = document.querySelectorAll("#app-container .app-view");
    sections.forEach(sec => {
      sec.classList.remove("active-view");
      sec.setAttribute("aria-hidden", "true");
    });

    // 2. 대상 뷰 섹션 하이라이트 활성화
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add("active-view");
      targetSection.setAttribute("aria-hidden", "false");
    }

    // 3. 대상 뷰 동적 렌더링 수행
    try {
      targetView.render();
    } catch (err) {
      console.error(`Failed to render view '${viewName}':`, err);
    }
  }
}

// 즉시 또는 돔 완성 시 전역 App 구동 (ESM 타이밍 버그 방지형 안전장치)
const initApp = () => {
  if (!window.appRouter) {
    window.appRouter = new AppRouter();
    console.log("Chunja Master SPA initialized successfully.");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

export default AppRouter;
