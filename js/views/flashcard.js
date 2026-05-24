// ==========================================================================
// 진도 학습 플래시 카드 뷰 컴포넌트 (Flashcard View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA, ALL_WORD_DATA } from "../data/index.js";
import { showSuccessToast, showInfoToast } from "../ui/toast.js";

class FlashcardView {
  constructor() {
    this.container = document.getElementById("view-flashcard");
    
    // 로컬 상태 관리
    this.currentIndex = 0;
    this.filteredCards = [];
    this.orderMode = 'sequential';  // 'sequential'(ID순) 또는 'level'(수준별)
    this.selectedLevel = 1;         // 수준 1~5
  }

  // 필터링 및 정렬 수행 (단순 쿼리 원칙 준수 - JS 메모리 필터)
  applyFilters() {
    if (this.orderMode === 'sequential') {
      this.filteredCards = [...ALL_CHUNJA_DATA].sort((a, b) => a.id - b.id);
    } else {
      // 획수 기준 난이도 레벨 필터링 (tag가 level과 일치하는 것들만 모음)
      this.filteredCards = [...ALL_CHUNJA_DATA]
        .filter(c => c.tag === this.selectedLevel)
        .sort((a, b) => a.stroke - b.stroke || a.id - b.id); // 획수 오름차순 정렬
    }
    
    // 현재 인덱스 유효범위 체크
    if (this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = 0;
    }
  }

  // 화면 렌더링
  render() {
    this.applyFilters();
    
    if (this.filteredCards.length === 0) {
      this.container.innerHTML = `
        <div class="learning-controls" style="margin-bottom: 24px;">
          <div class="selector-group">
            <span class="selector-label"><i class="fa-solid fa-filter"></i> 학습 모드</span>
            <select id="fc-order-select" class="custom-select">
              <option value="sequential" ${this.orderMode === 'sequential' ? 'selected' : ''}>ID 순차적 학습</option>
              <option value="level" ${this.orderMode === 'level' ? 'selected' : ''}>획수 난이도별 학습</option>
            </select>
            
            ${this.orderMode === 'level' ? `
              <select id="fc-level-select" class="custom-select">
                <option value="1" ${this.selectedLevel === 1 ? 'selected' : ''}>1단계 (아주 쉬움: 1~4획)</option>
                <option value="2" ${this.selectedLevel === 2 ? 'selected' : ''}>2단계 (쉬움: 5~8획)</option>
                <option value="3" ${this.selectedLevel === 3 ? 'selected' : ''}>3단계 (보통: 9~12획)</option>
                <option value="4" ${this.selectedLevel === 4 ? 'selected' : ''}>4단계 (어려움: 13~16획)</option>
                <option value="5" ${this.selectedLevel === 5 ? 'selected' : ''}>5단계 (매우 어려움: 17획 이상)</option>
              </select>
            ` : ''}
          </div>
        </div>
        <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
          조건에 부합하는 카드가 없습니다.
        </div>
      `;
      this.bindEvents();
      return;
    }

    const card = this.filteredCards[this.currentIndex];
    const state = stateManager.get();
    
    // 카드 암기 완료 여부
    const isMemorized = state.progress[card.id]?.memorized || false;
    
    // 실생활 단어 매칭 데이터 가져오기
    const wordData = ALL_WORD_DATA.find(w => w.id === card.id) || {
      wordHanja: card.hanja + '物',
      wordHangul: card.sound + '물',
      meaning: `${card.sound}와 연동된 실생활 한자 단어`
    };

    this.container.innerHTML = `
      <div class="flashcard-layout">
        
        <!-- 상단 제어 바 -->
        <div class="learning-controls">
          <div class="selector-group">
            <span class="selector-label"><i class="fa-solid fa-filter"></i> 학습 모드</span>
            <select id="fc-order-select" class="custom-select">
              <option value="sequential" ${this.orderMode === 'sequential' ? 'selected' : ''}>ID 순차적 학습</option>
              <option value="level" ${this.orderMode === 'level' ? 'selected' : ''}>획수 난이도별 학습</option>
            </select>
            
            ${this.orderMode === 'level' ? `
              <select id="fc-level-select" class="custom-select">
                <option value="1" ${this.selectedLevel === 1 ? 'selected' : ''}>1단계 (아주 쉬움: 1~4획)</option>
                <option value="2" ${this.selectedLevel === 2 ? 'selected' : ''}>2단계 (쉬움: 5~8획)</option>
                <option value="3" ${this.selectedLevel === 3 ? 'selected' : ''}>3단계 (보통: 9~12획)</option>
                <option value="4" ${this.selectedLevel === 4 ? 'selected' : ''}>4단계 (어려움: 13~16획)</option>
                <option value="5" ${this.selectedLevel === 5 ? 'selected' : ''}>5단계 (매우 어려움: 17획 이상)</option>
              </select>
            ` : ''}
          </div>
          <div class="card-id" style="font-size: 13px;">
            현재 카드: <span style="color: var(--secondary); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.filteredCards.length}
          </div>
        </div>
        
        <!-- 3D 회전 카드 씬 -->
        <div class="card-scene" id="card-scene-btn">
          <div class="flip-card" id="flip-card-body">
            
            <!-- 카드 앞면 (한자만 노출) -->
            <div class="card-face front">
              <div class="card-header-badge">
                <span class="card-id">ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag lv${card.tag}">${card.tag}단계 난이도</span>
              </div>
              
              <div class="hanja-container">
                <span class="giant-hanja">${card.hanja}</span>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 카드를 터치하면 해설을 봅니다
              </div>
            </div>
            
            <!-- 카드 뒷면 (해설 및 실생활 단어 노출) -->
            <div class="card-face back">
              <div class="card-header-badge">
                <span class="card-id">ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag lv${card.tag}">${card.tag}단계 난이도</span>
              </div>
              
              <div class="back-info-body">
                <div class="korean-sound">${card.sound} <span style="font-size: 20px; font-weight: 500; color: var(--text-main);">[ ${card.meaning} ]</span></div>
                <div class="hanja-stroke-info"><i class="fa-solid fa-pen-nib"></i> 획수: <b>${card.stroke}획</b></div>
                
                <!-- 실생활 연동 단어 -->
                <div class="associated-word-box">
                  <div class="word-box-title"><i class="fa-solid fa-language"></i> 실생활 단어 매핑</div>
                  <div class="word-hanja-val">${wordData.wordHanja} <span style="font-size: 15px; font-weight: 500; color: var(--gold);">(${wordData.wordHangul})</span></div>
                  <div class="word-hangul-meaning">${wordData.meaning}</div>
                </div>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 카드를 터치하면 한자를 다시 봅니다
              </div>
            </div>
            
          </div>
        </div>
        
        <!-- 하단 조작 액션 바 -->
        <div class="card-action-bar" style="max-width: 360px; width: 100%;">
          <button class="action-btn prev" id="fc-prev-btn" ${this.currentIndex === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            <i class="fa-solid fa-chevron-left"></i> 이전
          </button>
          
          <button class="action-btn memorized" id="fc-memorized-btn" style="${isMemorized ? 'background:rgba(16,185,129,0.3);box-shadow:none;' : ''}">
            <i class="fa-solid ${isMemorized ? 'fa-circle-check' : 'fa-check'}"></i> 
            ${isMemorized ? '암기됨 (+0.2P)' : '암기 완료 (+0.2P)'}
          </button>
          
          <button class="action-btn prev" id="fc-next-btn" ${this.currentIndex === this.filteredCards.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            다음 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        
      </div>
    `;

    this.bindEvents();
  }

  // UI 조작 이벤트 바인딩
  bindEvents() {
    const orderSelect = document.getElementById("fc-order-select");
    const levelSelect = document.getElementById("fc-level-select");
    const cardScene = document.getElementById("card-scene-btn");
    const flipCard = document.getElementById("flip-card-body");
    const prevBtn = document.getElementById("fc-prev-btn");
    const nextBtn = document.getElementById("fc-next-btn");
    const memorizedBtn = document.getElementById("fc-memorized-btn");

    if (orderSelect) {
      orderSelect.addEventListener("change", (e) => {
        this.orderMode = e.target.value;
        this.currentIndex = 0;
        this.render();
      });
    }

    if (levelSelect) {
      levelSelect.addEventListener("change", (e) => {
        this.selectedLevel = parseInt(e.target.value);
        this.currentIndex = 0;
        this.render();
      });
    }

    // 카드 플립 터치 토글
    if (cardScene && flipCard) {
      cardScene.addEventListener("click", () => {
        flipCard.classList.toggle("flipped");
      });
    }

    // 이전 버튼
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentIndex > 0) {
          this.currentIndex -= 1;
          this.render();
        }
      });
    }

    // 다음 버튼
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentIndex < this.filteredCards.length - 1) {
          this.currentIndex += 1;
          this.render();
        }
      });
    }

    // 암기 완료 버튼 클릭 액션
    if (memorizedBtn) {
      memorizedBtn.addEventListener("click", () => {
        const card = this.filteredCards[this.currentIndex];
        const state = stateManager.get();
        
        // 1. 이미 암기 완료된 것인지 검사
        const alreadyMemorized = state.progress[card.id]?.memorized || false;
        
        // 2. 학습 진행 상태 기록
        const newProgress = { ...state.progress };
        newProgress[card.id] = {
          memorized: true,
          viewCount: (newProgress[card.id]?.viewCount || 0) + 1
        };
        
        stateManager.update({ progress: newProgress });

        // 3. 최초 1회 첫 암기 시에만 포인트 지급 (+0.2P)
        if (!alreadyMemorized) {
          const res = stateManager.addPoints(0.2, false);
          showSuccessToast(`암기 완료! +0.2P 적립 (현재: ${stateManager.get().points.toFixed(1)}P)`);
        } else {
          showInfoToast("이미 암기 완료 처리된 천자문 카드입니다.");
        }

        // 4. 자동 다음 카드로 슬라이딩 이행 (마지막 카드 제외)
        setTimeout(() => {
          if (this.currentIndex < this.filteredCards.length - 1) {
            this.currentIndex += 1;
            this.render();
          }
        }, 600);
      });
    }
  }
}

export default new FlashcardView();
