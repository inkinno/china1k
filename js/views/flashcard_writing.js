// ==========================================================================
// 획따라 쓰기 연습장 제어 모듈 (Canvas Drawing Writing Practice View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA } from "../data/index.js";
import { showSuccessToast, showInfoToast } from "../ui/toast.js";

class FlashcardWritingView {
  constructor() {
    this.container = null;
    this.onExit = null;

    // 로컬 상태 관리
    this.isRandom = false;
    this.startId = 1;
    
    this.currentIndex = 0;
    this.writingCards = [];
    
    // 캔버스 드로잉 상태 제어
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // 모바일 터치 중복 방지 타임아웃
    this.drawTimeout = null;
  }

  // 대기실에서 받아온 모드 및 필터 바인딩
  setupMode(isRandom, startId) {
    this.isRandom = isRandom;
    this.startId = startId;
    this.currentIndex = 0;

    // 1. 천자문 데이터 필터링 및 배열 정렬
    if (this.isRandom) {
      // 무작위 셔플링 알고리즘 (Fisher-Yates Shuffle)
      this.writingCards = [...ALL_CHUNJA_DATA];
      for (let i = this.writingCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.writingCards[i], this.writingCards[j]] = [this.writingCards[j], this.writingCards[i]];
      }
    } else {
      // 지정한 ID 번호부터 순차 정렬
      const sorted = [...ALL_CHUNJA_DATA].sort((a, b) => a.id - b.id);
      const startIndex = sorted.findIndex(c => c.id === this.startId);
      if (startIndex !== -1) {
        // 시작 인덱스부터 끝까지 잘라 붙여서 루프 회전
        this.writingCards = sorted.slice(startIndex).concat(sorted.slice(0, startIndex));
      } else {
        this.writingCards = sorted;
      }
    }
  }

  // 캔버스 학습 뷰 전체 렌더링
  render(container, onExitCallback) {
    this.container = container;
    this.onExit = onExitCallback;

    if (this.writingCards.length === 0) {
      this.writingCards = [...ALL_CHUNJA_DATA];
    }

    const card = this.writingCards[this.currentIndex];

    // 드로잉 전용 미려한 획쓰기 레이아웃 렌더링
    this.container.innerHTML = `
      <div class="flashcard-layout writing-layout" style="max-width: 600px; margin: 0 auto; width: 100%;">
        
        <!-- 상단 내비게이션 바 -->
        <div class="learning-controls" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom: 16px;">
          <div class="selector-group">
            <span style="font-weight: 800; color: #A78BFA;"><i class="fa-solid fa-file-signature"></i> 획따라 쓰기</span>
          </div>
          
          <div style="display:flex; align-items:center; gap: 12px;">
            <div class="card-id" style="font-size: 13px;">
              진행: <span style="color: var(--secondary); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.writingCards.length}
            </div>
            <button class="save-btn" id="fc-write-exit-btn" style="background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); color: var(--error); padding: 5px 12px; font-weight:700;">
              퇴실 <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <!-- 캔버스 글자 연습장 영역 카드 -->
        <div class="writing-card-panel" style="background: var(--bg-surface-glass); border: 1px solid var(--border-glass); border-radius: 24px; padding: 24px; box-shadow: var(--shadow-lg); text-align: center; backdrop-filter: blur(12px); position: relative; margin-bottom: 20px;">
          <!-- 훈음 헤더 -->
          <div class="writing-card-header" style="margin-bottom: 16px; border-bottom: 1px dashed var(--border-glass); padding-bottom: 12px;">
            <div style="font-size: 13px; color: var(--text-muted); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              <span>ID #${card.id.toString().padStart(4, '0')}</span>
              <span class="level-tag lv${card.tag}">${card.tag}단계 난이도 (${card.stroke}획)</span>
            </div>
            <h2 style="font-size: 28px; font-weight: 900; color: var(--gold); margin-top: 6px; text-shadow: 0 0 10px var(--gold-glow);">
              ${card.meaning} ${card.sound}
            </h2>
          </div>

          <!-- HTML5 드로잉 캔버스 스테이지 -->
          <div class="canvas-stage-wrapper" style="position: relative; width: 100%; aspect-ratio: 1 / 1; max-width: 320px; margin: 0 auto; background: rgba(0,0,0,0.4); border: 2px dashed rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; touch-action: none;">
            <!-- 뒷배경 반투명 큰 글자 가이드 -->
            <div class="canvas-guide-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 160px; font-family: 'Noto Sans KR', sans-serif; font-weight: 900; color: rgba(255,255,255,0.06); user-select: none; pointer-events: none; z-index: 1;">
              ${card.hanja}
            </div>

            <!-- 격자 보조선 (눈금선) -->
            <svg style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0; opacity:0.15;" viewBox="0 0 100 100">
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" stroke-width="0.5" stroke-dasharray="2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="white" stroke-width="0.5" stroke-dasharray="2" />
            </svg>

            <!-- 실제 브러시 드로잉이 입혀지는 캔버스 -->
            <canvas id="writing-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; cursor: crosshair; touch-action: none;"></canvas>
          </div>

          <!-- 캔버스 미세 프롬프트 -->
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 10px;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> 반투명 회색 글자 가이드를 따라 획순에 맞게 그려 보세요.
          </div>
        </div>

        <!-- 캔버스 드로잉 조작 바 -->
        <div class="writing-action-bar" style="display: flex; gap: 12px; max-width: 480px; margin: 0 auto; width: 100%;">
          <button class="action-btn" id="fc-write-clear-btn" style="flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 16px; color: var(--text-main); font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: var(--transition-smooth);">
            <i class="fa-solid fa-eraser"></i> 싹 지우기
          </button>
          
          <button class="action-btn confirm" id="fc-write-confirm-btn" style="flex: 2; padding: 14px; border: none; border-radius: 16px; background: linear-gradient(135deg, #10B981, #059669); color: white; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: var(--transition-smooth); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
            정성껏 씀! 다음 한자 <i class="fa-solid fa-circle-chevron-right"></i>
          </button>
        </div>

      </div>
    `;

    this.initCanvas();
    this.bindEvents();
  }

  // 드로잉 캔버스 초기 설정 및 컨텍스트 바인딩
  initCanvas() {
    this.canvas = document.getElementById("writing-canvas");
    this.ctx = this.canvas.getContext("2d");

    // 디바이스별 고해상도(Retina 대응) 스케일링 설정
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // 브러시 스타일 설정 (부드러운 필기 연출)
    this.ctx.strokeStyle = "#60A5FA"; // 세련된 스카이블루 브러시
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 6; // 선명한 굵기
    
    // 미세 브러시 글로우(Glow) 효과 추가 (프리미엄 사이버 효과)
    this.ctx.shadowBlur = 4;
    this.ctx.shadowColor = "rgba(96, 165, 250, 0.4)";
  }

  // 캔버스 드로잉 이벤트 리스너 탑재
  bindEvents() {
    const exitBtn = document.getElementById("fc-write-exit-btn");
    const clearBtn = document.getElementById("fc-write-clear-btn");
    const confirmBtn = document.getElementById("fc-write-confirm-btn");

    // 1. 퇴실
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        if (this.onExit) this.onExit();
      });
    }

    // 2. 지우기
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearCanvas();
      });
    }

    // 3. 확인 (완료 및 포인트 획득)
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        this.handleHanjaWritten();
      });
    }

    // 4. 드로잉 이벤트 리스너 (마우스용)
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDrawing = true;
      const { x, y } = this.getCanvasCoords(e.clientX, e.clientY);
      this.lastX = x;
      this.lastY = y;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDrawing) return;
      const { x, y } = this.getCanvasCoords(e.clientX, e.clientY);
      this.draw(x, y);
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener("mouseout", () => {
      this.isDrawing = false;
    });

    // 5. 드로잉 이벤트 리스너 (모바일 터치용 - 캔버스 스크롤 차단 필수)
    this.canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      this.isDrawing = true;
      const { x, y } = this.getCanvasCoords(touch.clientX, touch.clientY);
      this.lastX = x;
      this.lastY = y;
      e.preventDefault(); // 모바일 오동작 방지
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      if (!this.isDrawing) return;
      const touch = e.touches[0];
      const { x, y } = this.getCanvasCoords(touch.clientX, touch.clientY);
      this.draw(x, y);
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener("touchend", (e) => {
      this.isDrawing = false;
      e.preventDefault();
    }, { passive: false });
  }

  // 캔버스 상의 상대좌표 계산기 (F12 기기 모사 등 어떠한 스케일에서도 한 치의 오차도 없음)
  getCanvasCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    // 캔버스 실제 width/height 대비 드로잉 공간의 스케일 차이를 완벽히 보정
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // 캔버스 드로우 처리
  draw(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    this.lastX = x;
    this.lastY = y;
  }

  // 캔버스 초기화
  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // 한자 필기 완료 승인 처리
  handleHanjaWritten() {
    const card = this.writingCards[this.currentIndex];
    
    // 1. 포인트 적립 (+0.2P)
    stateManager.addPoints(0.2, false);
    showSuccessToast(`필기 정성 완료! +0.2P 적립 (현재: ${stateManager.get().points.toFixed(1)}P)`);

    // 2. 순차 정렬 모드일 때에만 이어쓰기 진행 ID를 현재 완료 ID 다음(ID + 1)으로 보존
    if (!this.isRandom) {
      let nextLastWritingId = card.id + 1;
      if (nextLastWritingId > 1000) {
        nextLastWritingId = 1; // 1000번 완필 시 1번으로 로테이션
      }
      
      stateManager.update({ lastWritingId: nextLastWritingId });
      
      // [동기화 마스터피스] 즉각적인 클라우드 Firestore 강제 저장 지시
      document.dispatchEvent(new CustomEvent("firestore-immediate-save-request"));
    }

    // 3. 카드 전환
    if (this.currentIndex < this.writingCards.length - 1) {
      this.currentIndex += 1;
      this.render(this.container, this.onExit);
    } else {
      showInfoToast("축하합니다! 설정된 획쓰기 리스트 완독 완료! 처음부터 회전합니다.");
      this.currentIndex = 0;
      this.render(this.container, this.onExit);
    }
  }
}

export default new FlashcardWritingView();
