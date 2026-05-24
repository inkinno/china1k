// ==========================================================================
// 퀴즈 테스트 & 평가 뷰 컴포넌트 (Quiz View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA, ALL_WORD_DATA } from "../data/index.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "../ui/toast.js";

class QuizView {
  constructor() {
    this.container = document.getElementById("view-quiz");
    
    // 퀴즈 진행 상태
    this.isPlaying = false;
    this.questions = [];
    this.currentIdx = 0;
    this.selectedCount = 15; // 15문항 또는 30문항
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.sessionEarnedPoints = 0.0;
  }

  // 화면 렌더링
  render() {
    if (this.isPlaying) {
      this.renderQuizLoop();
    } else {
      this.renderStarterScreen();
    }
  }

  // 1. 퀴즈 시작 대기 화면 (Starter)
  renderStarterScreen() {
    const state = stateManager.get();
    
    // 비즈니스 룰: 한 번이라도 열람/학습하여 '학습 이력'이 생긴 한자들만 시험 범위로 구성
    const learnedIds = Object.keys(state.progress).map(id => parseInt(id));
    const pool = ALL_CHUNJA_DATA.filter(c => learnedIds.includes(c.id));

    if (pool.length < 5) {
      // 학습 이력이 극히 부족한 경우 시험 진입 제한
      this.container.innerHTML = `
        <div class="quiz-starter-card">
          <i class="fa-solid fa-graduation-cap starter-icon" style="color: var(--primary);"></i>
          <h2>준비운동이 더 필요합니다!</h2>
          <p style="margin-top: 14px; line-height: 1.6;">
            시험(퀴즈)은 최소 <b>5글자 이상</b>의 한자 카드를 학습한 후에 도전하실 수 있습니다.<br><br>
            현재 학습 완료 한자: <b style="color:var(--secondary); font-size: 16px;">${pool.length}개 / 5개</b>
          </p>
          <button class="start-quiz-btn" style="background:#334155;cursor:not-allowed;" disabled>
            카드를 먼저 공부해 보세요!
          </button>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="quiz-starter-card">
        <i class="fa-solid fa-circle-question starter-icon"></i>
        <h2>천자문 실력 평가 시험</h2>
        <p>지금까지 공부한 한자 카드를 바탕으로 학습 성과를 테스트합니다.</p>
        
        <div class="quiz-option-selector">
          <div class="quiz-option-row">
            <span class="option-row-label"><i class="fa-solid fa-list-ol"></i> 출제 문항 수</span>
            <div class="btn-toggle-group">
              <button class="toggle-btn ${this.selectedCount === 15 ? 'active' : ''}" id="btn-count-15">15문제</button>
              <button class="toggle-btn ${this.selectedCount === 30 ? 'active' : ''}" id="btn-count-30">30문제</button>
            </div>
          </div>
          <div class="quiz-option-row">
            <span class="option-row-label"><i class="fa-solid fa-book-open"></i> 시험 범위</span>
            <span style="font-size: 12px; font-weight: 800; color: var(--success);">공부한 ${pool.length}글자 연동</span>
          </div>
        </div>
        
        <button class="start-quiz-btn" id="start-quiz-action">
          평가 시험 시작 <i class="fa-solid fa-play"></i>
        </button>
      </div>
    `;

    this.bindStarterEvents(pool);
  }

  bindStarterEvents(pool) {
    const btn15 = document.getElementById("btn-count-15");
    const btn30 = document.getElementById("btn-count-30");
    const startBtn = document.getElementById("start-quiz-action");

    if (btn15) {
      btn15.addEventListener("click", () => {
        this.selectedCount = 15;
        this.render();
      });
    }

    if (btn30) {
      btn30.addEventListener("click", () => {
        this.selectedCount = 30;
        this.render();
      });
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startQuiz(pool);
      });
    }
  }

  // 2. 퀴즈 세션 빌드 및 초기화
  startQuiz(pool) {
    this.isPlaying = true;
    this.currentIdx = 0;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.sessionEarnedPoints = 0.0;
    stateManager.update({ combo: 0 }); // 실시간 퀴즈용 정답 콤보 리셋

    // 문제 대상 한자 셔플 후 필요한 개수만큼 슬라이싱
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(this.selectedCount, shuffledPool.length);
    const selectedHanjas = shuffledPool.slice(0, count);

    this.questions = selectedHanjas.map(hanja => {
      // 오답 보기(Distractors) 3개 생성 (전체 1000자 중 겹치지 않는 것으로 수집)
      const distractors = ALL_CHUNJA_DATA
        .filter(c => c.id !== hanja.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(d => `${d.sound} [${d.meaning}]`);

      const answerText = `${hanja.sound} [${hanja.meaning}]`;
      const choices = [answerText, ...distractors].sort(() => 0.5 - Math.random());

      return {
        hanjaObj: hanja,
        questionText: hanja.hanja, // 거대 문제 한자
        correctAnswer: answerText,
        choices: choices
      };
    });

    this.render();
  }

  // 3. 퀴즈 진행 루프 화면 (Runtime)
  renderQuizLoop() {
    const q = this.questions[this.currentIdx];
    const totalQ = this.questions.length;
    const progressPercent = ((this.currentIdx) / totalQ) * 100;
    const state = stateManager.get();

    this.container.innerHTML = `
      <div class="quiz-runtime-container">
        
        <!-- 상단 퀴즈 진행 정보 바 -->
        <div class="quiz-header-bar">
          <div class="quiz-progress-num">
            문제 <span style="color: var(--secondary); font-weight: 800;">${this.currentIdx + 1}</span> / ${totalQ}
          </div>
          
          ${state.combo > 0 ? `
            <div class="combo-badge-slot">
              <i class="fa-solid fa-fire"></i> ${state.combo} 연속 정답!
            </div>
          ` : ''}
          
          <div style="font-size:12px; font-weight:700; color:var(--text-muted);">
            실시간 포인트: <span style="color: var(--gold);">${state.points.toFixed(1)}P</span>
          </div>
        </div>
        
        <!-- 진행률 게이지 바 -->
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
        
        <!-- 문제 카드 -->
        <div class="quiz-question-card">
          <div class="question-title">다음 한자의 올바른 음과 뜻을 고르시오.</div>
          <div class="question-content">${q.questionText}</div>
          <div class="question-sub-hint">ID #${q.hanjaObj.id.toString().padStart(4, '0')}</div>
        </div>
        
        <!-- 사지선다형 보기 버튼 목록 -->
        <div class="quiz-choices-list">
          ${q.choices.map((choice, i) => `
            <button class="choice-btn" data-choice="${choice}">
              <span class="choice-num">${i + 1}</span>
              <span class="choice-text">${choice}</span>
            </button>
          `).join('')}
        </div>
        
      </div>
    `;

    this.bindRuntimeEvents(q);
  }

  bindRuntimeEvents(q) {
    const choiceButtons = document.querySelectorAll(".quiz-choices-list .choice-btn");
    
    choiceButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        // 중복 클릭 완전 방지
        choiceButtons.forEach(b => b.classList.add("disabled"));
        
        const selectedVal = btn.getAttribute("data-choice");
        const isCorrect = (selectedVal === q.correctAnswer);

        if (isCorrect) {
          // 1. 정답 시 피드백 적용
          btn.classList.add("correct");
          this.correctCount += 1;
          
          // 2. 포인트 정산 (+0.5P) 및 실시간 정답 콤보 처리
          const res = stateManager.addPoints(0.5, true);
          this.sessionEarnedPoints += 0.5 + res.bonus;
          
          if (res.bonus > 0) {
            showSuccessToast(`정답! +0.5P 적립 & ${res.combo}콤보 스페셜 보상 +${res.bonus}P 추가 적립!`);
          } else {
            showSuccessToast(`정답입니다! +0.5P 적립`);
          }
        } else {
          // 1. 오답 시 피드백 적용
          btn.classList.add("wrong");
          this.wrongCount += 1;
          
          // 정답 보기 버튼에 초록색 테두리 하이라이팅
          choiceButtons.forEach(b => {
            if (b.getAttribute("data-choice") === q.correctAnswer) {
              b.classList.add("correct");
            }
          });
          
          // 2. 오답 콤보 리셋 처리
          stateManager.addPoints(0.0, false);
          
          // 3. 비즈니스 룰: 오답 발생 시 즉각 wrongNote 오답노트 리스트 등록/증가
          stateManager.addWrongAnswer(q.hanjaObj.id);
          showErrorToast(`오답! '${q.hanjaObj.hanja}'가 오답노트에 등록되었습니다.`);
        }

        // 짧은 대기 후 다음 문제 또는 시험 종료 리포트로 이행
        setTimeout(() => {
          if (this.currentIdx < this.questions.length - 1) {
            this.currentIdx += 1;
            this.render();
          } else {
            this.endQuizSession();
          }
        }, 1400);
      });
    });
  }

  // 4. 퀴즈 세션 종료 (최종 완료 리포트 및 즉시 강제 동기화)
  async endQuizSession() {
    this.isPlaying = false;
    
    // 점수 계산 (백분율)
    const totalQ = this.questions.length;
    this.score = Math.round((this.correctCount / totalQ) * 100);

    // 퀴즈 완료 시 배지 조건 실시간 평가 검사
    if (this.score === 100) {
      const state = stateManager.get();
      if (!state.badges.includes("quiz_master")) {
        const newBadges = [...state.badges, "quiz_master"];
        stateManager.update({ badges: newBadges });
        showSuccessToast("🎉 만점 천재 배지를 획득하셨습니다!");
      }
    }

    // 렌더링 수행
    this.renderReportScreen();

    // [비즈니스 룰] 시험이 끝난 시점에는 3분 쿨타임을 우회하여 예외적으로 즉시 데이터베이스에 변경 상태 자동 동기화
    showInfoToast("퀴즈 기록 완료. 클라우드 백업을 즉시 시작합니다...");
    document.dispatchEvent(new CustomEvent("firestore-immediate-save-request"));
  }

  // 5. 퀴즈 최종 성적표 화면 (Report)
  renderReportScreen() {
    const totalQ = this.questions.length;
    
    // 성적에 따른 메달 아이콘 결정
    let medalIcon = 'fa-medal';
    let medalColor = 'var(--gold)';
    let msg = '참 잘했습니다!';
    
    if (this.score === 100) {
      medalIcon = 'fa-crown';
      msg = '완벽합니다! 천자문 신동의 탄생!';
    } else if (this.score < 60) {
      medalIcon = 'fa-face-frown-open';
      medalColor = 'var(--error)';
      msg = '조금 더 카드를 열독하고 재도전하세요!';
    }

    this.container.innerHTML = `
      <div class="quiz-report-card">
        <i class="fa-solid ${medalIcon} report-medal-icon" style="color: ${medalColor};"></i>
        <h2 class="report-title">평가 시험 종료</h2>
        <p style="color:var(--text-muted); font-size: 14px;">${msg}</p>
        
        <div class="report-score">${this.score}점</div>
        
        <div class="report-metrics-grid">
          <div class="report-metric-box">
            <div class="report-metric-lbl">출제 문항</div>
            <div class="report-metric-val" style="color: var(--text-main); font-family: 'Outfit';">${totalQ}개</div>
          </div>
          <div class="report-metric-box">
            <div class="report-metric-lbl">맞은 개수</div>
            <div class="report-metric-val" style="color: var(--success); font-family: 'Outfit';">${this.correctCount}개</div>
          </div>
          <div class="report-metric-box">
            <div class="report-metric-lbl">틀린 개수</div>
            <div class="report-metric-val" style="color: var(--error); font-family: 'Outfit';">${this.wrongCount}개</div>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 14px; padding: 14px; font-size: 13px; text-align: left; margin-bottom: 30px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span style="color:var(--text-muted);"><i class="fa-solid fa-coins" style="color:var(--gold);"></i> 획득한 포인트</span>
            <span style="font-weight:800; color:var(--gold);">+${this.sessionEarnedPoints.toFixed(1)} P</span>
          </div>
          <div style="font-size:11px; color:var(--text-muted); line-height: 1.4;">
            * 오답이 발생한 한자는 오답노트에 자동 백업되어 더 높은 정답 포인트(+1.0P)로 재학습하실 수 있습니다.
          </div>
        </div>
        
        <button class="start-quiz-btn" id="fc-finish-ok-btn">
          성적표 확인 완료 <i class="fa-solid fa-check"></i>
        </button>
      </div>
    `;

    const okBtn = document.getElementById("fc-finish-ok-btn");
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        // 대시보드로 복귀
        stateManager.update({ currentView: 'dashboard' });
      });
    }
  }
}

export default new QuizView();
