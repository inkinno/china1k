// ==========================================================================
// 토스트 메시지 피드백 시스템 (Toast Alert Feedback System)
// ==========================================================================

class ToastController {
  constructor() {
    this.container = document.getElementById("toast-container");
  }

  /**
   * 알림 토스트를 생성하여 표시합니다.
   * @param {string} message - 표시할 알림 문구
   * @param {'success' | 'error' | 'info'} type - 알림 타입 (성공, 실패, 일반정보)
   * @param {number} duration - 표시 유지 시간 (ms, 기본값 3500)
   */
  show(message, type = "info", duration = 3500) {
    const card = document.createElement("div");
    card.className = `toast-card ${type}`;
    
    // 타입별 아이콘 설정
    let iconHTML = '<i class="fa-solid fa-circle-info"></i>';
    if (type === "success") {
      iconHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else if (type === "error") {
      iconHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    }
    
    card.innerHTML = `${iconHTML} <span>${message}</span>`;
    
    this.container.appendChild(card);
    
    // 지속 시간 완료 후 카드 페이드 아웃 및 제거
    setTimeout(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(10px)";
      card.style.transition = "opacity 0.3s, transform 0.3s";
      
      setTimeout(() => {
        if (card.parentNode === this.container) {
          this.container.removeChild(card);
        }
      }, 300);
    }, duration);
  }
}

const toast = new ToastController();

export const showSuccessToast = (msg) => toast.show(msg, "success");
export const showErrorToast = (msg) => toast.show(msg, "error");
export const showInfoToast = (msg) => toast.show(msg, "info");
export default toast;
