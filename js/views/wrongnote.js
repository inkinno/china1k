// ==========================================================================
// 오답노트 복습 뷰 컴포넌트 (Wrongnote View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA } from "../data/index.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "../ui/toast.js";
import { showAlert } from "../ui/modal.js";

class WrongnoteView {
  constructor() {
    this.container = document.getElementById("view-wrongnote");
    
    // 복습 시험 진행 상태
    this.isPlaying = false;
    this.questions = [];
    this.currentIdx = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.sessionEarnedPoints = 0.0;
  }

  // 화면 렌더링
  render() {
    const state = stateManager.get();
    const wrongIds = Object.keys(state.wrongNote || {}).map(id => parseInt(id));
    
    // 15개 미만 여부 더블 체크 잠금 화면
    if (wrongIds.length < 15 && !this.isPlaying) {
      this.renderLockScreen(wrongIds.length);
      return;
    }

    if (this.isPlaying) {
      this.renderWrongQuizLoop();
    } else {
      this.renderWrongListScreen(wrongIds);
    }
  }

  // 1. 잠금 화면 (Lock Screen)
  renderLockScreen(count) {
    this.container.innerHTML = `
      <div class="wrongnote-lock-screen">
        <i class="fa-solid fa-lock lock-icon-giant"></i>
        <h2 class="lock-title">오답노트 학습 잠금 상태</h2>
        <p class="lock-desc">
          오답노트는 틀린 한자가 최소 <b>15개 이상</b> 누적되었을 때 열리는 취약점 보완 탭입니다.<br><br>
          열심히 진도 학습을 하고 퀴즈를 쳐서 오답 한자가 차오를 때까지 더 공부해보세요!<br><br>
          현재 누적 오답 수: <span style="color:var(--error); font-weight:800; font-size: 16px;">${count}개 / 15개</span>
        </p>
      </div>
    `;
  }

  // 2. 오답 목록 및 복습 시작 화면 (List)
  renderWrongListScreen(wrongIds) {
    const state = stateManager.get();
    
    // 오답노트에 담긴 한자 데이터 파싱
    const wrongHanjas = ALL_CHUNJA_DATA.filter(c => wrongIds.includes(c.id));

    this.container.innerHTML = `
      <div class="wrongnote-layout">
        
        <!-- 오답노트 요약 정보 바 -->
        <div class="wrongnote-header">
          <div class="wrongnote-title-area">
            <h2>오답노트 오답 해제실 (${wrongIds.length}자 보관 중)</h2>
            <p>문제를 <b>연속 2회 정답</b> 맞추면 오답노트에서 영구 졸업 및 해제됩니다!</p>
          </div>
          <button class="start-quiz-btn" id="start-wrong-quiz-btn" style="width: auto; padding: 10px 24px;">
            오답 복습 시험 시작 <i class="fa-solid fa-graduation-cap"></i>
          </button>
        </div>
        
        <!-- 오답 목록 카드 그리드 -->
        <div class="wrong-list-grid">
          ${wrongHanjas.map(card => {
            const noteItem = state.wrongNote[card.id] || { wrongCount: 0, correctStreak: 0 };
            return `
              <div class="wrong-item-card">
                <span class="wrong-count-badge"><i class="fa-solid fa-triangle-exclamation"></i> 틀린 횟수: ${noteItem.wrongCount}</span>
                <div class="wrong-hanja">${card.hanja}</div>
                <div class="wrong-sound">${card.sound} <span style="font-size: 11px; font-weight: 500; color: var(--text-main);">[${card.meaning}]</span></div>
                
                <!-- 졸업 진행 게이지 -->
                <div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
                  <span>졸업 진행률</span>
                  <span style="font-weight:800; color:var(--success);">${noteItem.correctStreak || 0}/2회</span>
                </div>
                <div class="progress-bar-bg" style="height: 4px; margin-top: 4px; margin-bottom: 0;">
                  <div class="progress-bar-fill" style="width: ${((noteItem.correctStreak || 0) / 2) * 100}%; background: var(--success);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
      </div>
    `;

    const startBtn = document.getElementById("start-wrong-quiz-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startWrongQuiz(wrongHanjas);
      });
    }
  }

  // 3. 복습 시험 시작
  startWrongQuiz(wrongHanjas) {
    this.isPlaying = true;
    this.currentIdx = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.sessionEarnedPoints = 0.0;
    stateManager.update({ combo: 0 }); // 콤보 리셋

    // 오답노트에 있는 한자들 전부 출제 (최대 15~20문제 가량 출제)
    const count = Math.min(20, wrongHanjas.length);
    const selectedHanjas = [...wrongHanjas].sort(() => 0.5 - Math.random()).slice(0, count);

    this.questions = selectedHanjas.map(hanja => {
      const distractors = ALL_CHUNJA_DATA
        .filter(c => c.id !== hanja.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(d => `${d.sound} [${d.meaning}]`);

      const answerText = `${hanja.sound} [${hanja.meaning}]`;
      const choices = [answerText, ...distractors].sort(() => 0.5 - Math.random());

      return {
        hanjaObj: hanja,
        questionText: hanja.hanja,
        correctAnswer: answerText,
        choices: choices
      };
    });

    this.render();
  }

  // 4. 복습 시험 진행 중 렌더링 (Runtime Loop)
  renderWrongQuizLoop() {
    const q = this.questions[this.currentIdx];
    const totalQ = this.questions.length;
    const progressPercent = (this.currentIdx / totalQ) * 100;
    const state = stateManager.get();
    const noteItem = state.wrongNote[q.hanjaObj.id] || { correctStreak: 0 };

    this.container.innerHTML = `
      <div class="quiz-runtime-container">
        
        <div class="quiz-header-bar" style="border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.03);">
          <div class="quiz-progress-num">
            오답 극복 시험 <span style="color: var(--success); font-weight: 800;">${this.currentIdx + 1}</span> / ${totalQ}
          </div>
          
          <div style="background: rgba(16,185,129,0.15); color: var(--success); font-size:10px; font-weight:800; padding:4px 10px; border-radius: 20px;">
            <i class="fa-solid fa-graduation-cap"></i> 이 한자 현재 졸업 현황: ${noteItem.correctStreak || 0}/2회 정답 중
          </div>
          
          <div style="font-size:12px; font-weight:700; color:var(--text-muted);">
            실시간 포인트: <span style="color: var(--gold);">${state.points.toFixed(1)}P</span>
          </div>
        </div>
        
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%; background: var(--success);"></div>
        </div>
        
        <div class="quiz-question-card" style="border-color: rgba(16, 185, 129, 0.25);">
          <div class="question-title" style="color: var(--success);"><i class="fa-solid fa-graduation-cap"></i> 오답 특별 강화 복습 문제 (정답 시 2배 보상!)</div>
          <div class="question-content" style="text-shadow: 0 0 15px rgba(16, 185, 129, 0.2);">${q.questionText}</div>
          <div class="question-sub-hint">ID #${q.hanjaObj.id.toString().padStart(4, '0')}</div>
        </div>
        
        <div class="quiz-choices-list">
          ${q.choices.map((choice, i) => `
            <button class="choice-btn" data-choice="${choice}">
              <span class="choice-num" style="color: var(--success);">${i + 1}</span>
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
        choiceButtons.forEach(b => b.classList.add("disabled"));
        
        const selectedVal = btn.getAttribute("data-choice");
        const isCorrect = (selectedVal === q.correctAnswer);

        if (isCorrect) {
          btn.classList.add("correct");
          this.correctCount += 1;
          
          // [비즈니스 룰] 오답노트 복습 퀴즈 1문제 정답 시: +1.0 포인트 특별 보상 적립!
          const res = stateManager.addPoints(1.0, true);
          this.sessionEarnedPoints += 1.0 + res.bonus;
          
          // 졸업 조건 정답 스트릭 갱신 처리
          stateManager.answerCorrectInWrongNote(q.hanjaObj.id);

          const isGraduated = !stateManager.get().wrongNote[q.hanjaObj.id];
          if (isGraduated) {
            showSuccessToast(`🎉 정답! 졸업 조건 만족! '${q.hanjaObj.hanja}' 한자가 오답노트에서 해제 졸업되었습니다! +1.0P 적립`);
          } else {
            showSuccessToast(`정답! 졸업 1단계 통과 (+1/2회)! 특별 보상 +1.0P 적립`);
          }
        } else {
          btn.classList.add("wrong");
          this.wrongCount += 1;
          
          choiceButtons.forEach(b => {
            if (b.getAttribute("data-choice") === q.correctAnswer) {
              b.classList.add("correct");
            }
          });
          
          // 오답 시 콤보 리셋 및 correctStreak 리셋 (wrongNote 누적 증가)
          stateManager.addPoints(0.0, false);
          stateManager.addWrongAnswer(q.hanjaObj.id);
          
          showErrorToast(`오답입니다! 이 글자의 졸업 정답 스트릭이 초기화됩니다.`);
        }

        setTimeout(() => {
          if (this.currentIdx < this.questions.length - 1) {
            this.currentIdx += 1;
            this.render();
          } else {
            this.endWrongQuizSession();
          }
        }, 1400);
      });
    });
  }

  // 5. 복습 세션 종료
  endWrongQuizSession() {
    this.isPlaying = false;
    
    // 백분율 점수
    const totalQ = this.questions.length;
    const score = Math.round((this.correctCount / totalQ) * 100);

    this.container.innerHTML = `
      <div class="quiz-report-card" style="border-color: rgba(16, 185, 129, 0.25);">
        <i class="fa-solid fa-graduation-cap report-medal-icon" style="color: var(--success); filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.3));"></i>
        <h2 class="report-title" style="color: var(--success);">오답 복습 평가 완료</h2>
        <p style="color:var(--text-muted); font-size: 14px;">틀린 한자를 극복하고 훌륭한 학업 성취를 이루고 있습니다!</p>
        
        <div class="report-score" style="color: var(--success);">${score}점</div>
        
        <div class="report-metrics-grid">
          <div class="report-metric-box">
            <div class="report-metric-lbl">도전 문항</div>
            <div class="report-metric-val" style="color: var(--text-main); font-family: 'Outfit';">${totalQ}개</div>
          </div>
          <div class="report-metric-box">
            <div class="report-metric-lbl">극복 성공</div>
            <div class="report-metric-val" style="color: var(--success); font-family: 'Outfit';">${this.correctCount}개</div>
          </div>
          <div class="report-metric-box">
            <div class="report-metric-lbl">보완 필요</div>
            <div class="report-metric-val" style="color: var(--error); font-family: 'Outfit';">${this.wrongCount}개</div>
          </div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 14px; padding: 14px; font-size: 13px; text-align: left; margin-bottom: 30px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span style="color:var(--text-muted);"><i class="fa-solid fa-coins" style="color:var(--gold);"></i> 획득한 오답 특별 포인트</span>
            <span style="font-weight:800; color:var(--gold);">+${this.sessionEarnedPoints.toFixed(1)} P</span>
          </div>
          <div style="font-size:11px; color:var(--text-muted); line-height: 1.4;">
            * 오답노트 전용 퀴즈는 극복 특별 보상으로 2배의 정답 포인트(+1.0P)가 제공되어 포인트를 빠르게 불릴 수 있는 좋은 방법입니다!
          </div>
        </div>
        
        <button class="start-quiz-btn" id="wrong-finish-ok-btn" style="background: var(--success);">
          복습 완료 및 복귀 <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    const okBtn = document.getElementById("wrong-finish-ok-btn");
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        stateManager.update({ currentView: 'dashboard' });
      });
    }

    // [비즈니스 룰] 복습 평가가 끝난 시점에도 즉시 데이터베이스에 변경 상태 자동 동기화 (우회 즉시 저장)
    showInfoToast("오답 극복 결과 클라우드 동기화 중...");
    document.dispatchEvent(new CustomEvent("firestore-immediate-save-request"));
  }
}

export default new WrongnoteView();
