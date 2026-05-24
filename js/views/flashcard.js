// ==========================================================================
// 진도 학습 플래시 카드 및 학습실 제어 컴포넌트 (Flashcard & Review Room View)
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
    this.orderMode = 'sequential';  // 'sequential'(순차), 'level'(단계별), 'review_completed'(완료복습), 'review_incomplete'(미흡복습), 'word'(실생활단어)
    this.selectedLevel = 1;         // 수준 1~5
    
    // 학습실 입장 제어 상태
    this.isStarted = false;

    // 제스처 트랙킹 좌표
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;

    // 신설: TTS 중복 자동 낭독 방지용 인덱스 락커 (1회 재생 통제)
    this.lastPlayedIndex = -1;
  }

  // 브라우저 내장 오프라인 Web Speech TTS 재생 기능
  speakKorean(text) {
    if ('speechSynthesis' in window) {
      // 재생 중이던 모든 음성 즉시 취소 (중첩 및 꼬임 현상 완전 배제)
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // 모바일 기기별 비동기 음성 검색에 대응하여 안전하게 voice 설정
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang.startsWith('ko'));
      if (koVoice) {
        utterance.voice = koVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }

  // 필터링 및 정렬 수행
  applyFilters() {
    const state = stateManager.get();
    const progress = state.progress || {};

    if (this.orderMode === 'sequential') {
      this.filteredCards = [...ALL_CHUNJA_DATA].sort((a, b) => a.id - b.id);
    } else if (this.orderMode === 'level') {
      this.filteredCards = [...ALL_CHUNJA_DATA]
        .filter(c => c.tag === this.selectedLevel)
        .sort((a, b) => a.stroke - b.stroke || a.id - b.id);
    } else if (this.orderMode === 'review_completed') {
      this.filteredCards = [...ALL_CHUNJA_DATA]
        .filter(c => progress[c.id]?.memorized === true)
        .sort((a, b) => a.id - b.id);
    } else if (this.orderMode === 'review_incomplete') {
      this.filteredCards = [...ALL_CHUNJA_DATA]
        .filter(c => !progress[c.id] || progress[c.id]?.memorized === false)
        .sort((a, b) => a.id - b.id);
    } else if (this.orderMode === 'word') {
      this.filteredCards = [...ALL_CHUNJA_DATA].sort((a, b) => a.id - b.id);
    }
    
    // 현재 인덱스 유효범위 체크
    if (this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = 0;
    }
  }

  // 화면 메인 렌더링 진입점
  render() {
    if (!this.isStarted) {
      this.renderStartRoom();
    } else {
      this.renderLearningRoom();
    }
  }

  // 1. 학습 대기실 화면 (Start Room)
  renderStartRoom() {
    const state = stateManager.get();
    const progress = state.progress || {};

    // 복습용 필터 데이터 수집
    const completedCards = ALL_CHUNJA_DATA.filter(c => progress[c.id]?.memorized === true);
    const incompleteCards = ALL_CHUNJA_DATA.filter(c => !progress[c.id] || progress[c.id]?.memorized === false);

    this.container.innerHTML = `
      <div class="quiz-starter-card" style="max-width: 720px; width: 100%; margin: 30px auto; text-align: left;">
        <div style="text-align: center; margin-bottom: 24px;">
          <i class="fa-solid fa-door-open starter-icon" style="color: var(--secondary);"></i>
          <h2 style="font-size: 24px; font-weight: 850;">천자문 마스터 학습 대기실</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">나에게 맞는 스마트 학습 모드를 선택하고 입장하세요.</p>
        </div>

        <div class="selector-group" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 30px;">
          
          <!-- 모드 1: ID 순차 학습 -->
          <label class="quiz-option-row" style="cursor: pointer; display: flex; align-items: flex-start; gap: 14px;">
            <input type="radio" name="learning-mode-select" value="sequential" ${this.orderMode === 'sequential' ? 'checked' : ''} style="margin-top: 5px; scale: 1.2; accent-color: var(--primary);">
            <div style="flex: 1;">
              <span class="option-row-label" style="font-size: 15px; font-weight: 800; display: block;"><i class="fa-solid fa-arrow-down-1-9"></i> ID 순차적 기본 학습</span>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">하늘 천(天)부터 1번부터 1000번까지 차례대로 깊이 있게 정독 학습합니다.</span>
            </div>
          </label>

          <!-- 모드 2: 난이도별 획수 학습 -->
          <label class="quiz-option-row" style="cursor: pointer; display: flex; align-items: flex-start; gap: 14px;">
            <input type="radio" name="learning-mode-select" value="level" ${this.orderMode === 'level' ? 'checked' : ''} style="margin-top: 5px; scale: 1.2; accent-color: var(--primary);">
            <div style="flex: 1;">
              <span class="option-row-label" style="font-size: 15px; font-weight: 800; display: block;"><i class="fa-solid fa-filter"></i> 획수 난이도별 맞춤 학습</span>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; margin-bottom: 6px;">한자의 획수가 적은 순(쉬운 순)부터 단계를 나눠 효율적으로 학습합니다.</span>
              
              <select id="room-level-select" class="custom-select" style="margin-top: 4px; padding: 6px 10px;">
                <option value="1" ${this.selectedLevel === 1 ? 'selected' : ''}>1단계 (아주 쉬움: 1~4획)</option>
                <option value="2" ${this.selectedLevel === 2 ? 'selected' : ''}>2단계 (쉬움: 5~8획)</option>
                <option value="3" ${this.selectedLevel === 3 ? 'selected' : ''}>3단계 (보통: 9~12획)</option>
                <option value="4" ${this.selectedLevel === 4 ? 'selected' : ''}>4단계 (어려움: 13~16획)</option>
                <option value="5" ${this.selectedLevel === 5 ? 'selected' : ''}>5단계 (매우 어려움: 17획 이상)</option>
              </select>
            </div>
          </label>

          <!-- 모드 3: 완료 복습 모드 -->
          <label class="quiz-option-row" style="cursor: pointer; display: flex; align-items: flex-start; gap: 14px; border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.02);">
            <input type="radio" name="learning-mode-select" value="review_completed" ${this.orderMode === 'review_completed' ? 'checked' : ''} style="margin-top: 5px; scale: 1.2; accent-color: var(--success);" ${completedCards.length === 0 ? 'disabled' : ''}>
            <div style="flex: 1;">
              <span class="option-row-label" style="font-size: 15px; font-weight: 800; display: block; color: var(--success);"><i class="fa-solid fa-circle-check"></i> 암기 완료 복습실 (총 ${completedCards.length}자)</span>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">이미 암기 처리 완료된 천자문 카드들만 모아 잊지 않게 다지기 학습을 합니다.</span>
              
              ${completedCards.length > 0 ? `
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; max-height: 56px; overflow-y: auto; padding: 6px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid var(--border-glass);">
                  ${completedCards.slice(0, 40).map(c => `<span style="font-size: 11px; padding: 2px 5px; background: rgba(16,185,129,0.15); color: var(--success); font-weight:700; border-radius:4px;">${c.hanja}</span>`).join('')}
                  ${completedCards.length > 40 ? `<span style="font-size: 10px; color: var(--text-muted); padding: 2px;">...외 ${completedCards.length - 40}자</span>` : ''}
                </div>
              ` : `
                <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px; font-style: italic;">* 아직 암기 완료 처리한 한자가 없습니다. 카드를 학습해 보세요!</span>
              `}
            </div>
          </label>

          <!-- 모드 4: 미흡 복습 모드 -->
          <label class="quiz-option-row" style="cursor: pointer; display: flex; align-items: flex-start; gap: 14px; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.02);">
            <input type="radio" name="learning-mode-select" value="review_incomplete" ${this.orderMode === 'review_incomplete' ? 'checked' : ''} style="margin-top: 5px; scale: 1.2; accent-color: var(--error);" ${incompleteCards.length === 0 ? 'disabled' : ''}>
            <div style="flex: 1;">
              <span class="option-row-label" style="font-size: 15px; font-weight: 800; display: block; color: var(--error);"><i class="fa-solid fa-circle-exclamation"></i> 암기 미흡 복습실 (총 ${incompleteCards.length}자)</span>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">아직 외우지 못했거나 미완료된 한자 카드만 추려서 완독 포인트 적립을 도전합니다.</span>
              
              ${incompleteCards.length > 0 ? `
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; max-height: 56px; overflow-y: auto; padding: 6px; background: rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid var(--border-glass);">
                  ${incompleteCards.slice(0, 40).map(c => `<span style="font-size: 11px; padding: 2px 5px; background: rgba(239,68,68,0.15); color: var(--error); font-weight:700; border-radius:4px;">${c.hanja}</span>`).join('')}
                  ${incompleteCards.length > 40 ? `<span style="font-size: 10px; color: var(--text-muted); padding: 2px;">...외 ${incompleteCards.length - 40}자</span>` : ''}
                </div>
              ` : `
                <span style="font-size: 11px; color: var(--success); display: block; margin-top: 4px; font-weight: 800;"><i class="fa-solid fa-circle-check"></i> 축하합니다! 1000자 완독 및 올 클리어를 달성하셨습니다!</span>
              `}
            </div>
          </label>

          <!-- 모드 5: 실생활 단어 학습 모드 -->
          <label class="quiz-option-row" style="cursor: pointer; display: flex; align-items: flex-start; gap: 14px; border-color: rgba(251, 191, 36, 0.2); background: rgba(251, 191, Yellow, 0.02);">
            <input type="radio" name="learning-mode-select" value="word" ${this.orderMode === 'word' ? 'checked' : ''} style="margin-top: 5px; scale: 1.2; accent-color: var(--gold);">
            <div style="flex: 1;">
              <span class="option-row-label" style="font-size: 15px; font-weight: 800; display: block; color: var(--gold);"><i class="fa-solid fa-language"></i> 실생활 단어 전용 학습 모드 (총 1000단어)</span>
              <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">천자문 글자와 연동된 실생활 다빈도 어휘 한자 단어들만 모아 입체적으로 암기합니다.</span>
            </div>
          </label>

        </div>

        <button class="start-quiz-btn" id="fc-start-action-btn">
          선택한 모드로 학습 시작 <i class="fa-solid fa-arrow-right-to-bracket"></i>
        </button>
      </div>
    `;

    this.bindStartRoomEvents();
  }

  // 학습 대기실의 이벤트 리스너 바인딩
  bindStartRoomEvents() {
    const startBtn = document.getElementById("fc-start-action-btn");
    const levelSelect = document.getElementById("room-level-select");
    const radioButtons = document.querySelectorAll('input[name="learning-mode-select"]');

    if (levelSelect) {
      levelSelect.addEventListener("change", (e) => {
        this.selectedLevel = parseInt(e.target.value);
        const levelRadio = document.querySelector('input[value="level"]');
        if (levelRadio) levelRadio.checked = true;
        this.orderMode = 'level';
      });
    }

    radioButtons.forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.orderMode = e.target.value;
      });
    });

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.isStarted = true;
        this.currentIndex = 0;
        this.lastPlayedIndex = -1; // 진입 시 음성 락 해제
        this.render();
      });
    }
  }

  // 2. 실제 플래시 카드 학습실 구동 화면 (Learning Room)
  renderLearningRoom() {
    this.applyFilters();
    
    // 퇴실 헤더 공통 영역
    const headerTitleHTML = () => {
      let title = '';
      if (this.orderMode === 'sequential') title = '<i class="fa-solid fa-arrow-down-1-9"></i> 순차 학습';
      else if (this.orderMode === 'level') title = `<i class="fa-solid fa-filter"></i> ${this.selectedLevel}단계 학습`;
      else if (this.orderMode === 'review_completed') title = '<i class="fa-solid fa-circle-check" style="color:var(--success);"></i> 완료 복습';
      else if (this.orderMode === 'review_incomplete') title = '<i class="fa-solid fa-circle-exclamation" style="color:var(--error);"></i> 미흡 복습';
      else if (this.orderMode === 'word') title = '<i class="fa-solid fa-language" style="color:var(--gold);"></i> 단어 학습';
      return `<span style="font-weight: 800;">${title}</span>`;
    };

    if (this.filteredCards.length === 0) {
      this.container.innerHTML = `
        <div class="learning-controls" style="margin-bottom: 24px;">
          <div class="selector-group">
            ${headerTitleHTML()}
          </div>
          <button class="save-btn" id="fc-exit-btn" style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: var(--error);">
            대기실 퇴실 <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
        <div style="text-align: center; padding: 100px 0; color: var(--text-muted); background: var(--bg-surface-glass); border-radius: 20px; border:1px solid var(--border-glass);">
          <i class="fa-solid fa-box-open" style="font-size: 40px; margin-bottom: 12px; opacity:0.5;"></i>
          <div>이 학습 조건(필터)에 해당하는 카드가 없습니다.</div>
        </div>
      `;
      
      const exitBtn = document.getElementById("fc-exit-btn");
      if (exitBtn) {
        exitBtn.addEventListener("click", () => {
          this.isStarted = false;
          this.render();
        });
      }
      return;
    }

    const card = this.filteredCards[this.currentIndex];
    const state = stateManager.get();
    const isMemorized = state.progress[card.id]?.memorized || false;
    
    // 만약 실생활 단어 모드인 경우
    if (this.orderMode === 'word') {
      this.renderWordModeRoom(card, isMemorized, headerTitleHTML);
      return;
    }

    // 일반 천자문 글자 카드 렌더링 (중앙에 스피커 버튼 신설 및 헤더 줄바꿈 완비)
    this.container.innerHTML = `
      <div class="flashcard-layout">
        
        <!-- 상단 제어 바 (좌: 모드선택, 중: 스피커 버튼, 우: 카드정보 & 퇴실) -->
        <div class="learning-controls" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div class="selector-group">
            ${headerTitleHTML()}
          </div>
          
          <!-- 신설: 오프라인 한국어 TTS 재생 스피커 버튼 -->
          <button class="speaker-btn" id="fc-speaker-btn" title="한국어 TTS 음성 듣기">
            <i class="fa-solid fa-volume-high"></i> TTS 듣기
          </button>
          
          <div style="display:flex; align-items:center; gap: 12px;">
            <div class="card-id" style="font-size: 13px;">
              카드: <span style="color: var(--secondary); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.filteredCards.length}
            </div>
            <button class="save-btn" id="fc-exit-btn" style="background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); color: var(--error); padding: 5px 10px;">
              퇴실 <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
        
        <!-- 3D 회전 카드 씬 -->
        <div class="card-scene" id="card-scene-btn" style="touch-action: pan-y;">
          <div class="flip-card" id="flip-card-body">
            
            <!-- 카드 앞면 (한자만 노출 - 터치/스와이프 시 1회 자동 음성 독송) -->
            <div class="card-face front">
              <div class="card-header-badge">
                <span class="card-id">ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag lv${card.tag}">${card.tag}단계 난이도</span>
              </div>
              
              <div class="hanja-container">
                <span class="giant-hanja">${card.hanja}</span>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 화면을 터치하여 뒤집어 보세요
              </div>
            </div>
            
            <!-- 카드 뒷면 (해설 정보만 노출 - 음, 뜻, 획수) -->
            <div class="card-face back">
              <div class="card-header-badge">
                <span class="card-id">ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag lv${card.tag}">${card.tag}단계 난이도</span>
              </div>
              
              <div class="back-info-body" style="height: 100%; justify-content: center; gap: 20px;">
                <div class="korean-sound" style="font-size: 32px; font-weight: 900;">${card.sound}</div>
                <div style="font-size: 22px; font-weight: 700; color: var(--text-main); margin-top: -6px;">[ ${card.meaning} ]</div>
                <div class="hanja-stroke-info" style="font-size: 15px; background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 12px; border: 1px solid var(--border-glass);">
                  <i class="fa-solid fa-pen-nib" style="color:var(--primary);"></i> 획수: <b>${card.stroke}획</b>
                </div>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 화면을 터치하여 한자를 다시 봅니다
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
            ${isMemorized ? '암기 완료 (+0.2P)' : '암기 완료 (+0.2P)'}
          </button>
          
          <button class="action-btn prev" id="fc-next-btn" ${this.currentIndex === this.filteredCards.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            다음 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        
      </div>
    `;

    this.bindEvents();
    this.bindGestureEvents();
    
    // [1회 자동 재생 작동] 한자 카드 앞면 활성화 시점에 훈음 즉시 재생 (1회 제한)
    if (this.currentIndex !== this.lastPlayedIndex) {
      this.lastPlayedIndex = this.currentIndex;
      const speakText = `${card.meaning} ${card.sound}`;
      this.speakKorean(speakText);
    }
  }

  // 3. 실생활 단어 모드 렌더링 (Word Mode Room)
  renderWordModeRoom(card, isMemorized, headerTitleHTML) {
    const wordData = ALL_WORD_DATA.find(w => w.id === card.id) || {
      wordHanja: card.hanja + '物',
      wordHangul: card.sound + '물',
      meaning: `${card.sound}와 연동된 실생활 한자 단어`
    };

    this.container.innerHTML = `
      <div class="flashcard-layout">
        
        <!-- 상단 제어 바 (스피커 정중앙 신설 및 반응형) -->
        <div class="learning-controls" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div class="selector-group">
            ${headerTitleHTML()}
          </div>
          
          <!-- 신설: 오프라인 한국어 TTS 재생 스피커 버튼 -->
          <button class="speaker-btn" id="fc-speaker-btn" title="한국어 TTS 음성 듣기">
            <i class="fa-solid fa-volume-high"></i> TTS 듣기
          </button>
          
          <div style="display:flex; align-items:center; gap: 12px;">
            <div class="card-id" style="font-size: 13px;">
              단어: <span style="color: var(--gold); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.filteredCards.length}
            </div>
            <button class="save-btn" id="fc-exit-btn" style="background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); color: var(--error); padding: 5px 10px;">
              퇴실 <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
        
        <!-- 3D 회전 카드 씬 -->
        <div class="card-scene" id="card-scene-btn" style="touch-action: pan-y;">
          <div class="flip-card" id="flip-card-body">
            
            <!-- 카드 앞면 (단어 한자 노출 - 즉시 1회 단어 한글 소리 낭독) -->
            <div class="card-face front" style="background: linear-gradient(145deg, #1C1938, #0D0F1F); border-color: rgba(251, 191, 36, 0.15);">
              <div class="card-header-badge">
                <span class="card-id">WORD ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag" style="background:rgba(251,191,36,0.15); color:var(--gold); font-weight:700;">실생활 단어</span>
              </div>
              
              <div class="hanja-container">
                <span class="giant-hanja" style="font-size: 80px; letter-spacing: 4px; background: linear-gradient(to bottom, #FFF, #FCD34D); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${wordData.wordHanja}</span>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 화면을 터치하여 단어 해설을 보세요
              </div>
            </div>
            
            <!-- 카드 뒷면 (단어 풀이 노출) -->
            <div class="card-face back" style="background: linear-gradient(145deg, #1A1A2E, #16213E);">
              <div class="card-header-badge">
                <span class="card-id">WORD ID #${card.id.toString().padStart(4, '0')}</span>
                <span class="level-tag" style="background:rgba(251,191,36,0.15); color:var(--gold); font-weight:700;">실생활 단어</span>
              </div>
              
              <div class="back-info-body" style="height: 100%; justify-content: center; gap: 16px;">
                <div class="korean-sound" style="font-size: 30px; color: var(--gold); font-weight: 800;">${wordData.wordHangul}</div>
                <div style="font-size: 16px; font-weight: 500; color: var(--text-main); padding: 0 16px; line-height:1.5;">${wordData.meaning}</div>
                
                <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items:center; gap:6px;">
                  <i class="fa-solid fa-seedling" style="color:var(--gold);"></i> 연동 천자문: <b style="color:var(--text-main);">${card.hanja}</b> [${card.sound} : ${card.meaning}]
                </div>
              </div>
              
              <div class="hint-prompt">
                <i class="fa-solid fa-arrows-rotate"></i> 화면을 터치하여 한자를 다시 봅니다
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
            ${isMemorized ? '암기 완료 (+0.2P)' : '암기 완료 (+0.2P)'}
          </button>
          
          <button class="action-btn prev" id="fc-next-btn" ${this.currentIndex === this.filteredCards.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            다음 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        
      </div>
    `;

    this.bindEvents();
    this.bindGestureEvents();
    
    // [1회 자동 재생 작동] 단어 카드 앞면 활성화 시점에 단어 낭독 (1회 제한)
    if (this.currentIndex !== this.lastPlayedIndex) {
      this.lastPlayedIndex = this.currentIndex;
      this.speakKorean(wordData.wordHangul);
    }
  }

  // UI 조작 이벤트 바인딩
  bindEvents() {
    const cardScene = document.getElementById("card-scene-btn");
    const flipCard = document.getElementById("flip-card-body");
    const prevBtn = document.getElementById("fc-prev-btn");
    const nextBtn = document.getElementById("fc-next-btn");
    const memorizedBtn = document.getElementById("fc-memorized-btn");
    const exitBtn = document.getElementById("fc-exit-btn");
    
    // 신설: 수동 스피커 재생 버튼
    const speakerBtn = document.getElementById("fc-speaker-btn");

    if (speakerBtn) {
      speakerBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 카드 플립 간섭 방지
        const card = this.filteredCards[this.currentIndex];
        if (!card) return;
        
        if (this.orderMode === 'word') {
          const wordData = ALL_WORD_DATA.find(w => w.id === card.id) || { wordHangul: card.sound + '물' };
          this.speakKorean(wordData.wordHangul);
        } else {
          const speakText = `${card.meaning} ${card.sound}`;
          this.speakKorean(speakText);
        }
      });
    }

    // 퇴실 버튼
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        this.isStarted = false;
        this.render();
      });
    }

    // 카드 플립 터치 토글
    if (cardScene && flipCard) {
      cardScene.addEventListener("click", (e) => {
        if (this.isDragging) return;
        
        // 카드 뒤집기 (앞면 -> 뒷면 / 뒷면 -> 앞면)
        flipCard.classList.toggle("flipped");
      });
    }

    // 이전 버튼
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.navigateCard(-1);
      });
    }

    // 다음 버튼
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.navigateCard(1);
      });
    }

    // 암기 완료 버튼 클릭 액션
    if (memorizedBtn) {
      memorizedBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 카드 뒤집힘 간섭 차단
        const card = this.filteredCards[this.currentIndex];
        const state = stateManager.get();
        
        const alreadyMemorized = state.progress[card.id]?.memorized || false;
        
        const newProgress = { ...state.progress };
        newProgress[card.id] = {
          memorized: true,
          viewCount: (newProgress[card.id]?.viewCount || 0) + 1
        };
        
        stateManager.update({ progress: newProgress });

        if (!alreadyMemorized) {
          stateManager.addPoints(0.2, false);
          showSuccessToast(`암기 완료! +0.2P 적립 (현재: ${stateManager.get().points.toFixed(1)}P)`);
        } else {
          showInfoToast("이미 암기 완료 처리된 천자문 카드입니다.");
        }

        setTimeout(() => {
          if (this.orderMode === 'review_incomplete') {
            this.render();
          } else {
            if (this.currentIndex < this.filteredCards.length - 1) {
              this.currentIndex += 1;
              this.render();
            }
          }
        }, 500);
      });
    }
  }

  // 모바일 스와이프 및 PC 드래그 제스처 이벤트 리스너 탑재
  bindGestureEvents() {
    const cardScene = document.getElementById("card-scene-btn");
    const flipCard = document.getElementById("flip-card-body");
    if (!cardScene || !flipCard) return;

    // 공통 드래그 탐지 개시
    const dragStart = (x, y) => {
      this.startX = x;
      this.startY = y;
      this.isDragging = false;
    };

    // 공통 드래그 무브 변위 계산
    const dragMove = (x, y) => {
      const deltaX = x - this.startX;
      const deltaY = y - this.startY;
      
      if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
        this.isDragging = true;
        flipCard.style.transform = `translateX(${deltaX * 0.35}px) rotateY(${flipCard.classList.contains("flipped") ? '180deg' : '0deg'})`;
        flipCard.classList.add("dragging");
      }
    };

    // 공통 드래그 해제에 따른 액션 바인딩
    const dragEnd = (x) => {
      flipCard.classList.remove("dragging");
      flipCard.style.transform = ''; 

      const deltaX = x - this.startX;
      const swipeThreshold = 65; 

      if (this.isDragging && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          // 오른쪽 스와이프 -> 이전 카드
          if (this.currentIndex > 0) {
            flipCard.classList.add("swipe-right-anim");
            setTimeout(() => {
              this.navigateCard(-1);
            }, 250);
          } else {
            showInfoToast("첫 번째 카드입니다.");
          }
        } else {
          // 왼쪽 스와이프 -> 다음 카드
          if (this.currentIndex < this.filteredCards.length - 1) {
            flipCard.classList.add("swipe-left-anim");
            setTimeout(() => {
              this.navigateCard(1);
            }, 250);
          } else {
            showInfoToast("마지막 카드입니다.");
          }
        }
      }
      
      setTimeout(() => {
        this.isDragging = false;
      }, 50);
    };

    // PC 마우스 리스너 바인딩
    cardScene.addEventListener("mousedown", (e) => {
      dragStart(e.clientX, e.clientY);
      
      const mouseMoveHandler = (ev) => {
        dragMove(ev.clientX, ev.clientY);
      };
      
      const mouseUpHandler = (ev) => {
        dragEnd(ev.clientX);
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };
      
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });

    // 모바일 터치 리스너 바인딩
    cardScene.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      dragStart(touch.clientX, touch.clientY);
    }, { passive: true });

    cardScene.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      dragMove(touch.clientX, touch.clientY);
    }, { passive: true });

    cardScene.addEventListener("touchend", (e) => {
      const touch = e.changedTouches[0];
      dragEnd(touch.clientX);
    }, { passive: true });
  }

  // 카드 슬라이딩 제어
  navigateCard(direction) {
    if (direction === -1 && this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.render();
    } else if (direction === 1 && this.currentIndex < this.filteredCards.length - 1) {
      this.currentIndex += 1;
      this.render();
    }
  }
}

export default new FlashcardView();
