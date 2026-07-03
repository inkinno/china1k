// ==========================================================================
// 전역 애플리케이션 상태 관리 (State Management)
// ==========================================================================
import { evaluateAllBadges } from "./data/badges.js";
import { showSuccessToast } from "./ui/toast.js";

class StateManager {
  constructor() {
    this.listeners = [];
    this.resetState();
  }

  // 상태 초기화
  resetState() {
    this.state = {
      user: null,                  // Firebase 사용자 정보
      points: 0.0,                 // 획득 포인트 (실수형)
      streak: 0,                   // 연속 출석 일수
      badges: [],                  // 획득한 배지 ID 목록 (예: ['first_card', 'streak_3', 'master_100'])
      progress: {},                // 학습 이력 { [hanjaId]: { memorized: boolean, viewCount: number } }
      wrongNote: {},               // 오답노트 { [hanjaId]: { wrongCount: number, correctStreak: number } }
      shop: {
        streakShields: 0,          // 보유 출석 수호권 개수
        purchasedPetSlots: []      // 선구매 소유 펫 꾸미기 아이템 목록
      },
      currentView: 'dashboard',    // 현재 활성화된 탭 ID
      combo: 0,                    // 실시간 퀴즈 정답 콤보 카운트
      maxCombo: 0,                 // 역대 최고 콤보 수
      lastWritingId: 1,            // 신설: 획따라 쓰기 연습 모드의 마지막 학습 완료 한자 ID (이어쓰기 기능 지원)
      friends: [                   // 신설: 친구 목록
        { uid: 'bot_master50', name: '정예 학도 봇', points: 120.5, streak: 7, league: '골드 리그' },
        { uid: 'bot_chunja1', name: '천자문 장인', points: 85.0, streak: 3, league: '실버 리그' }
      ],
      friendRequests: [            // 신설: 받은 친구 신청 목록
        { uid: 'user_novice99', name: '열정 신입 학도' }
      ],
      settings: {                  // 신설: 학습 설정 및 리그 매칭 환경설정 (영구 보존)
        ttsEnabled: false,
        ttsSpeed: 1.1,
        ttsGap: 600,
        lastOrderMode: 'sequential',
        lastSelectedLevel: 1,
        matchWithFriends: true     // 리그 매칭 시 내 친구와 같은 리그에 배정받기 여부
      },
      lastLoadedData: null         // Dirty Checking용 데이터베이스 최종 로드 스냅샷 (JSON)
    };
  }

  // 상태 조회
  get() {
    return this.state;
  }

  // 특정 키 상태 갱신 및 구독자 알림
  update(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // 90대 확장 배지 실시간 자동 평가 및 알림
    if (!updates._skipBadgeEval) {
      try {
        const newUnlocked = evaluateAllBadges(this.state);
        if (newUnlocked && newUnlocked.length > 0) {
          newUnlocked.forEach(b => {
            showSuccessToast(`🎉 새로운 업적 배지 [${b.name}] 획득!`);
          });
        }
      } catch (e) {
        console.error("Auto badge eval error:", e);
      }
    }

    this.notify(oldState, this.state);
  }

  // 오답노트 졸업 조건 체크 (정답 시 오답노트 상태 갱신)
  // '특정 한자 문제를 연속으로 2회 이상 정답을 맞춘 경우, 오답 체크 상태가 완전 해제되며 오답노트에서 영구 제외'
  answerCorrectInWrongNote(hanjaId) {
    const wrongNote = { ...this.state.wrongNote };
    if (wrongNote[hanjaId]) {
      const item = { ...wrongNote[hanjaId] };
      item.correctStreak = (item.correctStreak || 0) + 1;
      
      if (item.correctStreak >= 2) {
        // 졸업 조건 만족! 오답노트에서 영구 제거
        delete wrongNote[hanjaId];
      } else {
        wrongNote[hanjaId] = item;
      }
      this.update({ wrongNote });
    }
  }

  // 오답 발생 시 오답노트 등록/증가
  addWrongAnswer(hanjaId) {
    const wrongNote = { ...this.state.wrongNote };
    if (wrongNote[hanjaId]) {
      const item = { ...wrongNote[hanjaId] };
      item.wrongCount = (item.wrongCount || 0) + 1;
      item.correctStreak = 0; // 연속 정답 콤보 리셋
      wrongNote[hanjaId] = item;
    } else {
      wrongNote[hanjaId] = {
        wrongCount: 1,
        correctStreak: 0
      };
    }
    this.update({ wrongNote });
  }

  // 포인트 지급 및 콤보 보상 판단
  // 새로운 플래시 카드 1개 첫 오픈: +0.2
  // 일반 퀴즈 1문제 정답: +0.5
  // 오답노트 학습 퀴즈 1문제 정답: +1.0
  // 5콤보 달성 시: +2, 10콤보 달성 시: +5
  addPoints(amount, isCorrect = false) {
    let finalAmount = amount;
    let comboBonus = 0;
    let nextCombo = this.state.combo;

    if (isCorrect) {
      nextCombo += 1;
      if (nextCombo > this.state.maxCombo) {
        this.state.maxCombo = nextCombo;
      }

      // 콤보 보상 계산
      if (nextCombo === 5) {
        comboBonus = 2.0;
      } else if (nextCombo === 10) {
        comboBonus = 5.0;
      }
    } else if (amount === 0) {
      // 오답일 시 콤보 리셋
      nextCombo = 0;
    }

    const nextPoints = parseFloat((this.state.points + finalAmount + comboBonus).toFixed(2));
    this.update({ 
      points: nextPoints,
      combo: nextCombo
    });

    return {
      added: finalAmount,
      bonus: comboBonus,
      combo: nextCombo
    };
  }

  // 구독 추가
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // 구독 알림
  notify(oldState, newState) {
    this.listeners.forEach(callback => callback(oldState, newState));
  }
}

const stateManager = new StateManager();
export default stateManager;
