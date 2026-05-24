// ==========================================================================
// 커스텀 대화형 모달 안내창 (Custom Inline Dialog Overlay)
// alert(), confirm() 브라우저 기본 팝업 대체 및 Promise 비동기 응답 지원
// ==========================================================================

class CustomModal {
  constructor() {
    this.overlay = document.getElementById("custom-modal-overlay");
    this.titleEl = document.getElementById("modal-title");
    this.messageEl = document.getElementById("modal-message");
    this.confirmBtn = document.getElementById("modal-confirm-btn");
    this.cancelBtn = document.getElementById("modal-cancel-btn");
    this.closeXBtn = document.getElementById("modal-close-x");
    
    this.resolveFn = null;
    this.initEvents();
  }

  initEvents() {
    // 확인 버튼 클릭
    this.confirmBtn.addEventListener("click", () => this.close(true));
    // 취소 버튼 클릭
    this.cancelBtn.addEventListener("click", () => this.close(false));
    // X 닫기 버튼 클릭
    this.closeXBtn.addEventListener("click", () => this.close(false));
    // 백드롭 오버레이 클릭 시 닫기
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close(false);
      }
    });
  }

  /**
   * 커스텀 대화 상자를 노출하고 비동기 응답을 반환합니다.
   * @param {string} title - 대화 상자 타이틀
   * @param {string} message - 대화 상자 메시지 (HTML 지원)
   * @param {boolean} showCancel - 취소 버튼 노출 여부 (confirm 모드)
   * @returns {Promise<boolean>} 사용자가 확인을 누르면 true, 취소/닫기 시 false 반환
   */
  show(title, message, showCancel = false) {
    this.titleEl.textContent = title;
    this.messageEl.innerHTML = message;
    
    if (showCancel) {
      this.cancelBtn.classList.remove("hidden");
    } else {
      this.cancelBtn.classList.add("hidden");
    }

    this.overlay.classList.remove("hidden");
    this.overlay.setAttribute("aria-hidden", "false");
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  // 모달 닫기 및 결과 반환
  close(result) {
    this.overlay.classList.add("hidden");
    this.overlay.setAttribute("aria-hidden", "true");
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
  }
}

const customModal = new CustomModal();

// 전역 헬퍼 함수로 사용하기 편하게 export
export const showAlert = (title, message) => customModal.show(title, message, false);
export const showConfirm = (title, message) => customModal.show(title, message, true);
export default customModal;
