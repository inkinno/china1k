// ==========================================================================
// 진도 학습 플래시 카드 및 학습실 제어 컴포넌트 (Flashcard & Review Room View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA, ALL_WORD_DATA } from "../data/index.js";
import { showSuccessToast, showInfoToast } from "../ui/toast.js";
import flashcardWritingView from "./flashcard_writing.js"; // 신설: 획따라 쓰기 연습장 모듈 위임용

class FlashcardView {
  constructor() {
    this.container = document.getElementById("view-flashcard");
    
    // 로컬 상태 관리
    this.currentIndex = 0;
    this.filteredCards = [];
    this.orderMode = 'sequential';  // 'sequential'(순차), 'level'(단계별), 'review_completed'(완료복습), 'review_incomplete'(미흡복습), 'word'(실생활단어), 'writing'(획따라쓰기)
    this.selectedLevel = 1;         // 수준 1~5
    
    // 학습실 입장 제어 상태
    this.isStarted = false;

    // 제스처 트랙킹 좌표
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;

    // 신설: TTS 중복 자동 낭독 방지용 인덱스 락커 (1회 재생 통제)
    this.lastPlayedIndex = -1;

    // 유저 요구사항 반영: TTS 기본 OFF, 한국어처럼 자연스러운 속도 및 음뜻 사이 간격 설정
    this.ttsEnabled = false;
    this.ttsSpeed = 1.1;
    this.ttsGap = 600;
    this.ttsTimeoutId = null; // 신설: 음뜻 간격 비동기 타이머 식별자 (빠른 카드 전환 시 꼬임 방지)

    // Firestore 동기화나 설정 변경 시 학습실 설정(TTS, 마지막 모드 등) 복원
    stateManager.subscribe((oldState, newState) => {
      if (oldState.settings !== newState.settings && newState.settings) {
        this.loadSetupFromSettings();
      }
    });
    this.loadSetupFromSettings();
  }

  // 전역 환경설정에서 학습실 셋업 불러오기
  loadSetupFromSettings() {
    const settings = stateManager.get().settings || {};
    if (settings.ttsEnabled !== undefined) this.ttsEnabled = settings.ttsEnabled;
    if (settings.ttsSpeed !== undefined) this.ttsSpeed = settings.ttsSpeed;
    if (settings.ttsGap !== undefined) this.ttsGap = settings.ttsGap;
    if (settings.lastOrderMode !== undefined) this.orderMode = settings.lastOrderMode;
    if (settings.lastSelectedLevel !== undefined) this.selectedLevel = settings.lastSelectedLevel;
  }

  // 변경된 학습실 셋업을 전역 환경설정에 영구 보존
  saveSetupToSettings() {
    const state = stateManager.get();
    const settings = { ...(state.settings || {}) };
    settings.ttsEnabled = this.ttsEnabled;
    settings.ttsSpeed = this.ttsSpeed;
    settings.ttsGap = this.ttsGap;
    settings.lastOrderMode = this.orderMode;
    settings.lastSelectedLevel = this.selectedLevel;
    stateManager.update({ settings });
  }

  // 브라우저 내장 오프라인 Web Speech TTS 단일 텍스트 재생 기능
  speakKorean(text, force = false) {
    if (!force && !this.ttsEnabled) return;
    if ('speechSynthesis' in window) {
      if (this.ttsTimeoutId) {
        clearTimeout(this.ttsTimeoutId);
        this.ttsTimeoutId = null;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = this.ttsSpeed || 0.8;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang.startsWith('ko'));
      if (koVoice) utterance.voice = koVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  }

  // 한자 카드 전용 2단계 발화 (훈 -> 간격 -> 음 순서로 천천히 낭독)
  speakCard(soundText, meaningText, force = false) {
    if (!force && !this.ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;
    
    if (this.ttsTimeoutId) {
      clearTimeout(this.ttsTimeoutId);
      this.ttsTimeoutId = null;
    }
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.startsWith('ko'));

    // 1번째 발화: 훈 (뜻 - 예: 하늘)
    const utterance1 = new SpeechSynthesisUtterance(soundText);
    utterance1.lang = 'ko-KR';
    utterance1.rate = this.ttsSpeed || 0.8;
    if (koVoice) utterance1.voice = koVoice;

    // 2번째 발화: 음 (소리 - 예: 천)
    const utterance2 = new SpeechSynthesisUtterance(meaningText);
    utterance2.lang = 'ko-KR';
    utterance2.rate = this.ttsSpeed || 0.8;
    if (koVoice) utterance2.voice = koVoice;

    // 1번째 낭독 완료 후 지정된 시간(600ms)만큼 쉰 뒤 2번째 낭독 실행
    utterance1.onend = () => {
      this.ttsTimeoutId = setTimeout(() => {
        if (force || this.ttsEnabled) {
          window.speechSynthesis.speak(utterance2);
        }
        this.ttsTimeoutId = null;
      }, this.ttsGap || 600);
    };

    window.speechSynthesis.speak(utterance1);
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
    const mainHeader = document.getElementById("main-header");
    if (!this.isStarted) {
      if (mainHeader) mainHeader.style.display = "";
      this.renderStartRoom();
    } else {
      if (mainHeader) mainHeader.style.display = "none";
      if (this.orderMode === 'writing') {
        flashcardWritingView.render(this.container, () => {
          this.isStarted = false;
          this.render();
        });
      } else {
        this.renderLearningRoom();
      }
    }
  }

  // TTS 제어 바 HTML 생성
  getTTSControlBarHTML() {
    return `
      <div class="tts-control-bar">
        <label class="tts-toggle-group" title="TTS 자동 낭독 켜기/끄기">
          <input type="checkbox" id="tts-auto-toggle" ${this.ttsEnabled ? 'checked' : ''}>
          <i class="fa-solid fa-volume-high" style="color: ${this.ttsEnabled ? 'var(--secondary)' : 'var(--text-muted)'};"></i>
          <span>TTS 자동 낭독 ${this.ttsEnabled ? 'ON' : 'OFF'}</span>
        </label>
        <div class="tts-settings-group">
          <label class="tts-select-label">
            <span>속도:</span>
            <select id="tts-speed-select" class="tts-select">
              <option value="0.8" ${this.ttsSpeed === 0.8 ? 'selected' : ''}>0.8x (느림)</option>
              <option value="1.0" ${this.ttsSpeed === 1.0 ? 'selected' : ''}>1.0x (보통)</option>
              <option value="1.1" ${this.ttsSpeed === 1.1 ? 'selected' : ''}>1.1x (권장-빠르고 자연스러움)</option>
              <option value="1.2" ${this.ttsSpeed === 1.2 ? 'selected' : ''}>1.2x (빠름)</option>
              <option value="1.4" ${this.ttsSpeed === 1.4 ? 'selected' : ''}>1.4x (매우 빠름)</option>
            </select>
          </label>
          <label class="tts-select-label">
            <span>음뜻 간격:</span>
            <select id="tts-gap-select" class="tts-select">
              <option value="400" ${this.ttsGap === 400 ? 'selected' : ''}>0.4초 (짧게)</option>
              <option value="600" ${this.ttsGap === 600 ? 'selected' : ''}>0.6초 (권장-자연스러움)</option>
              <option value="800" ${this.ttsGap === 800 ? 'selected' : ''}>0.8초 (길게)</option>
            </select>
          </label>
        </div>
      </div>
    `;
  }

  // 1. 학습 대기실 화면 (Start Room) - 아코디언 드로어 UI 적용
  renderStartRoom() {
    const state = stateManager.get();
    const progress = state.progress || {};

    // 복습용 필터 데이터 수집
    const completedCards = ALL_CHUNJA_DATA.filter(c => progress[c.id]?.memorized === true);
    const incompleteCards = ALL_CHUNJA_DATA.filter(c => !progress[c.id] || progress[c.id]?.memorized === false);

    this.container.innerHTML = `
      <div class="quiz-starter-card" style="max-width: 720px; width: 100%; margin: 30px auto; text-align: left; background: var(--bg-surface-glass); border: 1px solid var(--border-glass); border-radius: 24px; padding: 30px; box-shadow: var(--shadow-lg);">
        <div style="text-align: center; margin-bottom: 28px;">
          <i class="fa-solid fa-door-open starter-icon" style="color: var(--secondary); font-size: 48px; margin-bottom: 12px; filter: drop-shadow(0 4px 12px rgba(0,242,254,0.3));"></i>
          <h2 style="font-size: 26px; font-weight: 850; letter-spacing: -0.5px; background: linear-gradient(135deg, #FFF, #E2E8F0); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">천자문 마스터 학습 대기실</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 6px;">터치 전에는 깔끔하게! 터치 시 부드럽게 열리는 스마트 학습 모드를 선택하세요.</p>
        </div>

        <div class="selector-group" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 30px;">
          
          <!-- 모드 1: ID 순차 학습 -->
          <div class="drawer-item ${this.orderMode === 'sequential' ? 'expanded' : ''}" data-mode="sequential">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="sequential" ${this.orderMode === 'sequential' ? 'checked' : ''}>
              <div class="drawer-title"><i class="fa-solid fa-arrow-down-1-9" style="color: var(--primary);"></i> ID 순차적 기본 학습</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4;">하늘 천(天)부터 1번부터 1000번까지 차례대로 깊이 있게 정독 학습합니다. 이전에 학습한 진도가 있다면 자동으로 저장되어 이어보기가 지원됩니다.</span>
              <button class="drawer-start-btn" data-action-mode="sequential" style="margin-top: 14px; width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
            </div>
          </div>

          <!-- 모드 2: 난이도별 획수 학습 -->
          <div class="drawer-item ${this.orderMode === 'level' ? 'expanded' : ''}" data-mode="level">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="level" ${this.orderMode === 'level' ? 'checked' : ''}>
              <div class="drawer-title"><i class="fa-solid fa-filter" style="color: var(--primary);"></i> 획수 난이도별 맞춤 학습</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4; margin-bottom: 10px;">한자의 획수가 적은 순(쉬운 순)부터 단계를 나눠 효율적으로 학습합니다. 원하는 단계를 선택하세요.</span>
              <select id="room-level-select" class="custom-select" style="padding: 8px 12px; background: rgba(15,23,42,0.8); border: 1px solid var(--border-glass); border-radius: 10px; color: var(--text-main); font-size: 12.5px; font-weight: 700; width: 100%; max-width: 280px; cursor: pointer; outline: none; margin-bottom: 14px;">
                <option value="1" ${this.selectedLevel === 1 ? 'selected' : ''}>1단계 (아주 쉬움: 1~4획)</option>
                <option value="2" ${this.selectedLevel === 2 ? 'selected' : ''}>2단계 (쉬움: 5~8획)</option>
                <option value="3" ${this.selectedLevel === 3 ? 'selected' : ''}>3단계 (보통: 9~12획)</option>
                <option value="4" ${this.selectedLevel === 4 ? 'selected' : ''}>4단계 (어려움: 13~16획)</option>
                <option value="5" ${this.selectedLevel === 5 ? 'selected' : ''}>5단계 (매우 어려움: 17획 이상)</option>
              </select>
              <button class="drawer-start-btn" data-action-mode="level" style="width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
            </div>
          </div>

          <!-- 모드 3: 완료 복습 모드 -->
          <div class="drawer-item ${this.orderMode === 'review_completed' ? 'expanded' : ''}" data-mode="review_completed" style="${completedCards.length === 0 ? 'opacity:0.6;' : ''}">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="review_completed" ${this.orderMode === 'review_completed' ? 'checked' : ''} ${completedCards.length === 0 ? 'disabled' : ''}>
              <div class="drawer-title" style="color: var(--success);"><i class="fa-solid fa-circle-check"></i> 암기 완료 복습실 (총 ${completedCards.length}자)</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4;">이미 암기 처리 완료된 천자문 카드들만 모아 잊지 않게 다지기 학습을 합니다.</span>
              ${completedCards.length > 0 ? `
                <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 6px; max-height: 100px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid var(--border-glass); margin-bottom: 14px;">
                  ${completedCards.slice(0, 40).map(c => `<span style="font-size: 12px; display: flex; align-items: center; justify-content: center; height: 28px; background: rgba(16,185,129,0.15); color: var(--success); font-weight:800; border-radius:6px; border: 1px solid rgba(16,185,129,0.2);">${c.hanja}</span>`).join('')}
                  ${completedCards.length > 40 ? `<span style="font-size: 10px; display: flex; align-items: center; justify-content: center; height: 28px; color: var(--text-muted); font-weight: 700; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid var(--border-glass);">+${completedCards.length - 40}</span>` : ''}
                </div>
                <button class="drawer-start-btn" data-action-mode="review_completed" style="width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
              ` : `
                <span style="font-size: 11.5px; color: var(--text-muted); display: block; margin-top: 6px; font-style: italic;">* 아직 암기 완료 처리한 한자가 없습니다. 카드를 학습해 보세요!</span>
              `}
            </div>
          </div>

          <!-- 모드 4: 미흡 복습 모드 -->
          <div class="drawer-item ${this.orderMode === 'review_incomplete' ? 'expanded' : ''}" data-mode="review_incomplete" style="${incompleteCards.length === 0 ? 'opacity:0.6;' : ''}">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="review_incomplete" ${this.orderMode === 'review_incomplete' ? 'checked' : ''} ${incompleteCards.length === 0 ? 'disabled' : ''}>
              <div class="drawer-title" style="color: var(--error);"><i class="fa-solid fa-circle-exclamation"></i> 암기 미흡 복습실 (총 ${incompleteCards.length}자)</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4;">아직 외우지 못했거나 미완료된 한자 카드만 추려서 완독 포인트 적립을 도전합니다.</span>
              ${incompleteCards.length > 0 ? `
                <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 6px; max-height: 100px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid var(--border-glass); margin-bottom: 14px;">
                  ${incompleteCards.slice(0, 40).map(c => `<span style="font-size: 12px; display: flex; align-items: center; justify-content: center; height: 28px; background: rgba(239,68,68,0.15); color: var(--error); font-weight:800; border-radius:6px; border: 1px solid rgba(239,68,68,0.2);">${c.hanja}</span>`).join('')}
                  ${incompleteCards.length > 40 ? `<span style="font-size: 10px; display: flex; align-items: center; justify-content: center; height: 28px; color: var(--text-muted); font-weight: 700; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid var(--border-glass);">+${incompleteCards.length - 40}</span>` : ''}
                </div>
                <button class="drawer-start-btn" data-action-mode="review_incomplete" style="width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
              ` : `
                <span style="font-size: 11.5px; color: var(--success); display: block; margin-top: 6px; font-weight: 800;"><i class="fa-solid fa-circle-check"></i> 축하합니다! 1000자 완독 및 올 클리어를 달성하셨습니다!</span>
              `}
            </div>
          </div>

          <!-- 모드 5: 실생활 단어 학습 모드 -->
          <div class="drawer-item ${this.orderMode === 'word' ? 'expanded' : ''}" data-mode="word">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="word" ${this.orderMode === 'word' ? 'checked' : ''}>
              <div class="drawer-title" style="color: var(--gold);"><i class="fa-solid fa-language"></i> 실생활 단어 전용 학습 모드 (총 1000단어)</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4;">천자문 글자와 연동된 실생활 다빈도 어휘 한자 단어들만 모아 입체적으로 암기합니다.</span>
              <button class="drawer-start-btn" data-action-mode="word" style="margin-top: 14px; width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
            </div>
          </div>

          <!-- 모드 6: 천자문 획따라 쓰기 연습 모드 -->
          <div class="drawer-item ${this.orderMode === 'writing' ? 'expanded' : ''}" data-mode="writing">
            <div class="drawer-header">
              <input type="radio" name="learning-mode-select" value="writing" ${this.orderMode === 'writing' ? 'checked' : ''}>
              <div class="drawer-title" style="color: #A78BFA;"><i class="fa-solid fa-file-signature"></i> 천자문 획따라 쓰기 연습 모드</div>
              <i class="fa-solid fa-chevron-down drawer-arrow"></i>
            </div>
            <div class="drawer-content">
              <span style="font-size: 12.5px; color: var(--text-muted); display: block; line-height: 1.4; margin-bottom: 12px;">반투명 글자 가이드를 터치/드래그하여 획순을 익히는 강력한 필기 연습실입니다.</span>
              
              <div id="writing-sub-options" style="padding: 14px; background: rgba(0,0,0,0.35); border: 1px solid var(--border-glass); border-radius: 12px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px;">
                <div style="display: flex; gap: 16px; border-bottom: 1px dashed var(--border-glass); padding-bottom: 10px;">
                  <label style="cursor: pointer; font-size: 12.5px; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                    <input type="radio" name="writing-order-select" value="sequential" checked style="accent-color: var(--primary);"> 천자문 순서대로
                  </label>
                  <label style="cursor: pointer; font-size: 12.5px; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                    <input type="radio" name="writing-order-select" value="random" style="accent-color: var(--primary);"> 무작위 랜덤
                  </label>
                </div>
                
                <div id="writing-start-branch" style="display: flex; flex-direction: column; gap: 8px;">
                  <label style="cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-main);">
                    <input type="radio" name="writing-start-mode" value="continue" checked style="accent-color: var(--primary);">
                    <span>기존 마지막 번호부터 이어 쓰기 (<b style="color: var(--secondary);">ID #${state.lastWritingId || 1}</b>)</span>
                  </label>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                    <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: var(--text-main); flex-shrink:0;">
                      <input type="radio" name="writing-start-mode" value="custom" style="accent-color: var(--primary);">
                      <span>원하는 시작 번호 입력:</span>
                    </label>
                    <input type="number" id="writing-start-number" min="1" max="1000" value="${state.lastWritingId || 1}" style="width: 70px; padding: 4px 6px; background: rgba(15,23,42,0.8); border: 1px solid var(--border-glass); border-radius: 6px; color: var(--text-main); font-size: 12px; font-weight: 700; text-align: center; outline: none;" disabled>
                    <span style="color: var(--text-muted); font-size: 11px;">(1~1000)</span>
                  </div>
                </div>
              </div>
              <button class="drawer-start-btn" data-action-mode="writing" style="width: 100%; padding: 13px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,242,254,0.3); transition: var(--transition-smooth);"><i class="fa-solid fa-play"></i> 이 모드로 학습 시작</button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindStartRoomEvents();
  }

  // 학습 대기실의 이벤트 리스너 바인딩
  bindStartRoomEvents() {
    const levelSelect = document.getElementById("room-level-select");
    const drawerItems = document.querySelectorAll('.drawer-item');

    // 획쓰기 관련 엘리먼트 수집 (Writing Options Interaction)
    const writingOrderRadios = document.querySelectorAll('input[name="writing-order-select"]');
    const writingStartRadios = document.querySelectorAll('input[name="writing-start-mode"]');
    const writingStartNumInput = document.getElementById("writing-start-number");
    const writingStartBranch = document.getElementById("writing-start-branch");

    // 드로어 아코디언 열기/닫기 및 모드 선택 연동
    drawerItems.forEach(item => {
      item.addEventListener("click", (e) => {
        const radio = item.querySelector('input[name="learning-mode-select"]');
        if (radio && radio.disabled) return;
        
        // select, number, text input 내부 클릭 시 폴딩 중지 방지
        if (e.target.tagName === 'SELECT' || (e.target.tagName === 'INPUT' && e.target.type !== 'radio')) {
          return;
        }
        
        drawerItems.forEach(d => d.classList.remove("expanded"));
        item.classList.add("expanded");
        if (radio) {
          radio.checked = true;
          this.orderMode = radio.value;
        }
      });
    });

    // 1. 획쓰기 순차 vs 랜덤 배열 제어 연동
    writingOrderRadios.forEach(r => {
      r.addEventListener("change", (e) => {
        if (e.target.value === 'random') {
          writingStartBranch.style.opacity = '0.4';
          writingStartBranch.style.pointerEvents = 'none';
        } else {
          writingStartBranch.style.opacity = '1';
          writingStartBranch.style.pointerEvents = 'auto';
        }
      });
    });

    // 2. 순차 모드 시 이어쓰기 vs 지정 번호 연동
    writingStartRadios.forEach(r => {
      r.addEventListener("change", (e) => {
        if (e.target.value === 'custom') {
          writingStartNumInput.disabled = false;
          writingStartNumInput.focus();
        } else {
          writingStartNumInput.disabled = true;
        }
      });
    });

    if (levelSelect) {
      levelSelect.addEventListener("change", (e) => {
        this.selectedLevel = parseInt(e.target.value);
        this.orderMode = 'level';
        this.saveSetupToSettings();
        const levelRadio = document.querySelector('input[value="level"]');
        if (levelRadio) levelRadio.checked = true;
        drawerItems.forEach(d => d.classList.remove("expanded"));
        const levelDrawer = document.querySelector('.drawer-item[data-mode="level"]');
        if (levelDrawer) levelDrawer.classList.add("expanded");
      });
    }

    const drawerStartBtns = document.querySelectorAll(".drawer-start-btn");
    drawerStartBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const mode = btn.getAttribute("data-action-mode");
        if (mode) {
          const radio = document.querySelector(`input[name="learning-mode-select"][value="${mode}"]`);
          if (radio && radio.disabled) return;
          if (radio) radio.checked = true;
          this.orderMode = mode;
        }

        // 획따라 쓰기 모드 진입 분기 제어
        if (this.orderMode === 'writing') {
          const isRandom = document.querySelector('input[name="writing-order-select"]:checked').value === 'random';
          let startId = 1;
          
          if (!isRandom) {
            const startMode = document.querySelector('input[name="writing-start-mode"]:checked').value;
            if (startMode === 'custom') {
              const val = parseInt(writingStartNumInput.value);
              if (isNaN(val) || val < 1 || val > 1000) {
                alert("시작 번호는 1부터 1000 사이의 숫자여야 합니다!");
                writingStartNumInput.focus();
                return;
              }
              startId = val;
            } else {
              startId = stateManager.get().lastWritingId || 1;
            }
          }
          
          flashcardWritingView.setupMode(isRandom, startId);
        }

        const state = stateManager.get();
        const savedProgress = state.progress?.[`lastSeen_${this.orderMode}`];
        this.isStarted = true;
        this.saveSetupToSettings();
        if (savedProgress && typeof savedProgress.index === 'number' && this.orderMode !== 'writing') {
          this.currentIndex = savedProgress.index;
          showInfoToast(`이전 학습 진도(ID #${this.currentIndex + 1})부터 이어합니다.`);
        } else {
          this.currentIndex = 0;
        }
        this.lastPlayedIndex = -1;
        this.render();
      });
    });
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
          <button class="save-btn" id="fc-exit-btn" style="background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.4)); border: 1px solid var(--success); color: #FFF; font-weight: 800; padding: 6px 14px; border-radius: 12px;">
            <i class="fa-solid fa-floppy-disk"></i> 저장 및 종료
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

    // 일반 천자문 글자 카드 렌더링
    this.container.innerHTML = `
      <div class="flashcard-layout">
        
        <!-- 상단 최소화 정보 바 -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; padding: 0 4px; max-width: 360px; width: 100%;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-main); display:flex; align-items:center; gap: 6px;">
            ${headerTitleHTML()}
          </div>
          <div style="font-size: 13px; color: var(--text-muted);">
            카드: <span style="color: var(--secondary); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.filteredCards.length}
          </div>
        </div>
        
        <!-- 3D 회전 카드 씬 (가장 먼저 눈에 띄도록 최상단 배치) -->
        <div class="card-scene" id="card-scene-btn" style="touch-action: pan-y;">
          <div class="flip-card" id="flip-card-body">
            
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
            암기 완료 (+0.2P)
          </button>
          
          <button class="action-btn prev" id="fc-next-btn" ${this.currentIndex === this.filteredCards.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            다음 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        
        <!-- 추가 버튼 (처음부터 다시하기 & 저장 및 종료) -->
        <div style="display:flex; gap: 10px; max-width: 360px; width: 100%; margin-top: 10px;">
          <button class="action-sub-btn" id="fc-reset-btn" style="flex: 1; padding: 12px; border-radius: 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #FCA5A5; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: var(--transition-smooth);">
            <i class="fa-solid fa-rotate-left"></i> 처음부터 다시하기
          </button>
          <button class="action-sub-btn" id="fc-exit-btn" style="flex: 1; padding: 12px; border-radius: 14px; background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.5)); border: 1px solid var(--success); color: #FFF; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: var(--transition-smooth); box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
            <i class="fa-solid fa-floppy-disk"></i> 저장 및 종료
          </button>
        </div>

        <button class="speaker-btn" id="fc-speaker-btn" title="한국어 TTS 음성 1회 듣기" style="width: 100%; max-width: 360px; margin-top: 10px; padding: 12px; border-radius: 14px; background: rgba(0, 242, 254, 0.15); border: 1px solid var(--primary); color: var(--primary); font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: var(--transition-smooth);">
          <i class="fa-solid fa-volume-high"></i> 현재 카드 TTS 1회 듣기
        </button>

        ${this.getTTSControlBarHTML()}
        
      </div>
    `;

    this.bindEvents();
    this.bindGestureEvents();
    
    if (this.currentIndex !== this.lastPlayedIndex) {
      this.lastPlayedIndex = this.currentIndex;
      this.speakCard(card.sound, card.meaning, false);
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
        
        <!-- 상단 최소화 정보 바 -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; padding: 0 4px; max-width: 360px; width: 100%;">
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-main); display:flex; align-items:center; gap: 6px;">
            ${headerTitleHTML()}
          </div>
          <div style="font-size: 13px; color: var(--text-muted);">
            단어: <span style="color: var(--gold); font-weight: 800;">${this.currentIndex + 1}</span> / ${this.filteredCards.length}
          </div>
        </div>
        
        <div class="card-scene" id="card-scene-btn" style="touch-action: pan-y;">
          <div class="flip-card" id="flip-card-body">
            
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
        
        <!-- 추가 버튼 (처음부터 다시하기 & 저장 및 종료) -->
        <div style="display:flex; gap: 10px; max-width: 360px; width: 100%; margin-top: 10px;">
          <button class="action-sub-btn" id="fc-reset-btn" style="flex: 1; padding: 12px; border-radius: 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #FCA5A5; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: var(--transition-smooth);">
            <i class="fa-solid fa-rotate-left"></i> 처음부터 다시하기
          </button>
          <button class="action-sub-btn" id="fc-exit-btn" style="flex: 1; padding: 12px; border-radius: 14px; background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.5)); border: 1px solid var(--success); color: #FFF; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: var(--transition-smooth); box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
            <i class="fa-solid fa-floppy-disk"></i> 저장 및 종료
          </button>
        </div>

        <button class="speaker-btn" id="fc-speaker-btn" title="한국어 TTS 음성 1회 듣기" style="width: 100%; max-width: 360px; margin-top: 10px; padding: 12px; border-radius: 14px; background: rgba(0, 242, 254, 0.15); border: 1px solid var(--primary); color: var(--primary); font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: var(--transition-smooth);">
          <i class="fa-solid fa-volume-high"></i> 현재 카드 TTS 1회 듣기
        </button>

        ${this.getTTSControlBarHTML()}
        
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
    const speakerBtn = document.getElementById("fc-speaker-btn");

    // TTS 맞춤 설정 컨트롤 바인딩
    const ttsToggle = document.getElementById("tts-auto-toggle");
    const ttsSpeedSelect = document.getElementById("tts-speed-select");
    const ttsGapSelect = document.getElementById("tts-gap-select");

    if (ttsToggle) {
      ttsToggle.addEventListener("change", (e) => {
        this.ttsEnabled = e.target.checked;
        this.saveSetupToSettings();
        const icon = e.target.parentElement.querySelector("i");
        const span = e.target.parentElement.querySelector("span");
        if (icon) icon.style.color = this.ttsEnabled ? "var(--secondary)" : "var(--text-muted)";
        if (span) span.textContent = `TTS 자동 낭독 ${this.ttsEnabled ? 'ON' : 'OFF'}`;
        if (this.ttsEnabled) {
          const card = this.filteredCards[this.currentIndex];
          if (card) {
            if (this.orderMode === 'word') {
              const wordData = ALL_WORD_DATA.find(w => w.id === card.id) || { wordHangul: card.sound + '물' };
              this.speakKorean(wordData.wordHangul, true);
            } else {
              this.speakCard(card.sound, card.meaning, true);
            }
          }
        } else {
          if (this.ttsTimeoutId) {
            clearTimeout(this.ttsTimeoutId);
            this.ttsTimeoutId = null;
          }
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
      });
    }
    if (ttsSpeedSelect) {
      ttsSpeedSelect.addEventListener("change", (e) => {
        this.ttsSpeed = parseFloat(e.target.value);
        this.saveSetupToSettings();
      });
    }
    if (ttsGapSelect) {
      ttsGapSelect.addEventListener("change", (e) => {
        this.ttsGap = parseInt(e.target.value);
        this.saveSetupToSettings();
      });
    }

    if (speakerBtn) {
      speakerBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 카드 플립 간섭 방지
        const card = this.filteredCards[this.currentIndex];
        if (!card) return;
        
        if (this.orderMode === 'word') {
          const wordData = ALL_WORD_DATA.find(w => w.id === card.id) || { wordHangul: card.sound + '물' };
          this.speakKorean(wordData.wordHangul, true);
        } else {
          this.speakCard(card.sound, card.meaning, true);
        }
      });
    }

    // 저장 및 종료 버튼 (학습 진도 연동 및 즉시 클라우드 동기화)
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        const state = stateManager.get();
        const progress = { ...(state.progress || {}) };
        progress[`lastSeen_${this.orderMode}`] = { index: this.currentIndex, timestamp: Date.now() };
        stateManager.update({ progress });

        showInfoToast("학습 기록 및 진도를 클라우드에 저장하는 중...");
        document.dispatchEvent(new CustomEvent("firestore-immediate-save-request"));
        
        setTimeout(() => {
          this.isStarted = false;
          this.render();
          showSuccessToast("학습 기록이 안전하게 저장되었습니다! 대기실로 복귀합니다.");
        }, 300);
      });
    }

    const resetBtn = document.getElementById("fc-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (!confirm("현재 학습 모드의 진도를 1번 카드(처음)부터 다시 시작하시겠습니까?")) return;
        this.currentIndex = 0;
        const state = stateManager.get();
        const progress = { ...(state.progress || {}) };
        progress[`lastSeen_${this.orderMode}`] = { index: 0, timestamp: Date.now() };
        stateManager.update({ progress });
        showInfoToast("진도를 처음부터 다시 시작합니다.");
        this.lastPlayedIndex = -1;
        this.render();
      });
    }

    // 카드 플립 터치 토글
    if (cardScene && flipCard) {
      cardScene.addEventListener("click", (e) => {
        if (this.isDragging) return;
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
