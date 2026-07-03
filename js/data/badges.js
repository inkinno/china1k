// [천자문 마스터] 100대 확장 배지 & 칭호 데이터 정의 (SOLID / DRY 선언적 아키텍처)
// 3배 볼륨 업그레이드: 총 90개 업적 배지 (분야별 18개씩 5대 카테고리)
// 각 배지는 지정된 아이콘 파일(iconFile)과 폴백용 기본 SVG(defaultSvg), 조건식(condition)을 가집니다.

export const BADGE_CATEGORIES = {
  progress: "📖 암기 및 진도 업적",
  streak: "🔥 연속 출석 및 성실 업적",
  quiz: "🎯 시험 및 퀴즈 정확도 업적",
  league: "🏆 리그 및 라이벌 경쟁 업적",
  hidden: "✨ 히든 및 이색 꿀잼 업적"
};

export const BADGES_DATA = [
  // ==========================================================
  // [1. 암기 및 진도 업적 (Progress)] - 18개
  // ==========================================================
  {
    id: "badge_first_step",
    name: "입문 학도",
    description: "천자문 첫 플래시 카드를 열람하고 배움의 첫걸음을 떼었습니다.",
    category: "progress",
    tier: "common",
    iconFile: "assets/badges/badge_first_step.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#22c55e" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌱</text></svg>`,
    condition: (state) => Object.keys(state.progress || {}).length >= 1
  },
  {
    id: "badge_hanja_5",
    name: "오자 득도",
    description: "천자문 중 5개의 글자를 완벽히 암기했습니다.",
    category: "progress",
    tier: "common",
    iconFile: "assets/badges/badge_hanja_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#16a34a" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🖐️</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 5
  },
  {
    id: "badge_hanja_10",
    name: "십자 지기",
    description: "천자문 중 10개의 글자를 암기 완료했습니다. 시작이 반입니다!",
    category: "progress",
    tier: "common",
    iconFile: "assets/badges/badge_hanja_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#3b82f6" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🔟</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 10
  },
  {
    id: "badge_hanja_20",
    name: "이십자 통달",
    description: "20자의 한자를 암기하여 기초 한문 단어를 이해하기 시작했습니다.",
    category: "progress",
    tier: "common",
    iconFile: "assets/badges/badge_hanja_20.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#2563eb" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">📗</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 20
  },
  {
    id: "badge_hanja_30",
    name: "삼십자 학인",
    description: "30자 암기 달성! 매일 꾸준한 배움의 열매가 맺히고 있습니다.",
    category: "progress",
    tier: "common",
    iconFile: "assets/badges/badge_hanja_30.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#1d4ed8" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">📘</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 30
  },
  {
    id: "badge_hanja_50",
    name: "오십보 백보",
    description: "50자 암기 달성! 서당에서 붓을 드는 자세가 제법 늠름해졌습니다.",
    category: "progress",
    tier: "rare",
    iconFile: "assets/badges/badge_hanja_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">📜</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 50
  },
  {
    id: "badge_hanja_100",
    name: "백자 대련",
    description: "100자 암기 마일스톤 돌파! 이제 간단한 성어의 의미를 헤아릴 수 있습니다.",
    category: "progress",
    tier: "rare",
    iconFile: "assets/badges/badge_hanja_100.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💯</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 100
  },
  {
    id: "badge_hanja_150",
    name: "백오십의 지혜",
    description: "150자 암기 성공! 한자의 부수와 뜻이 눈에 선하게 들어옵니다.",
    category: "progress",
    tier: "rare",
    iconFile: "assets/badges/badge_hanja_150.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#b45309" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🧮</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 150
  },
  {
    id: "badge_hanja_200",
    name: "이백자 문인",
    description: "200자 암기 달성! 시구와 문장을 읊을 수 있는 기초 소양을 갖췄습니다.",
    category: "progress",
    tier: "rare",
    iconFile: "assets/badges/badge_hanja_200.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#a855f7" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🖋️</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 200
  },
  {
    id: "badge_hanja_300",
    name: "삼백자 유생",
    description: "300자 암기 성공! 고전 문집을 읽어 내려가는 훌륭한 유생의 반열입니다.",
    category: "progress",
    tier: "epic",
    iconFile: "assets/badges/badge_hanja_300.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#9333ea" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏯</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 300
  },
  {
    id: "badge_hanja_400",
    name: "사백자 학사",
    description: "400자 마스터! 서당에서도 후배들을 지도할 수 있는 깊은 실력입니다.",
    category: "progress",
    tier: "epic",
    iconFile: "assets/badges/badge_hanja_400.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#7e22ce" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🎓</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 400
  },
  {
    id: "badge_hanja_500",
    name: "반환점의 달인",
    description: "천자문의 정확히 절반인 500자 정복! 천자문 마스터를 향한 반환점을 돌았습니다.",
    category: "progress",
    tier: "epic",
    iconFile: "assets/badges/badge_hanja_500.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#6b21a8" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌗</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 500
  },
  {
    id: "badge_hanja_600",
    name: "육백자 선비",
    description: "600자 암기 완료! 학문의 길이 열려 지혜로운 선비의 기품이 흐릅니다.",
    category: "progress",
    tier: "legendary",
    iconFile: "assets/badges/badge_hanja_600.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏮</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 600
  },
  {
    id: "badge_hanja_700",
    name: "칠백자 군자",
    description: "700자 암기 달성! 고전의 이치를 깨우쳐 군자의 덕목을 갖추었습니다.",
    category: "progress",
    tier: "legendary",
    iconFile: "assets/badges/badge_hanja_700.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#dc2626" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🪈</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 700
  },
  {
    id: "badge_hanja_800",
    name: "명예 진사",
    description: "800자 마스터! 과거 시험에 응시해도 손색없을 수준 높은 학문 깊이입니다.",
    category: "progress",
    tier: "legendary",
    iconFile: "assets/badges/badge_hanja_800.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#b91c1c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">⛩️</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 800
  },
  {
    id: "badge_hanja_900",
    name: "구백자 대관",
    description: "900자 정복! 천자문 마스터 고지가 바로 눈앞에 보입니다.",
    category: "progress",
    tier: "legendary",
    iconFile: "assets/badges/badge_hanja_900.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#991b1b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🦚</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 900
  },
  {
    id: "badge_hanja_1000",
    name: "👑 천자문 대장인",
    description: "천자문 1,000자 전역 완벽 마스터! 하늘과 땅의 이치를 모두 깨우친 궁극의 학우입니다.",
    category: "progress",
    tier: "mythic",
    iconFile: "assets/badges/badge_hanja_1000.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐉</text></svg>`,
    condition: (state) => Object.values(state.progress || {}).filter(v => v.memorized).length >= 1000
  },
  {
    id: "badge_writing_master",
    name: "일필휘지 서예가",
    description: "천자문 획따라 쓰기 모드에서 50자 이상의 서예 연습을 마쳤습니다.",
    category: "progress",
    tier: "epic",
    iconFile: "assets/badges/badge_writing_master.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f1f5f9" stroke="#475569" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🖌️</text></svg>`,
    condition: (state) => (state.lastWritingId || 0) >= 50
  },

  // ==========================================================
  // [2. 연속 출석 및 성실 업적 (Streak)] - 18개
  // ==========================================================
  {
    id: "badge_streak_1",
    name: "첫 등교의 설렘",
    description: "천자문 서당에 처음 출석하였습니다. 꾸준한 습관의 시작점입니다.",
    category: "streak",
    tier: "common",
    iconFile: "assets/badges/badge_streak_1.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#fb923c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🎒</text></svg>`,
    condition: (state) => (state.streak || 0) >= 1
  },
  {
    id: "badge_streak_2",
    name: "작심이일",
    description: "이틀 연속으로 서당 문을 두드렸습니다. 내일도 올 거죠?",
    category: "streak",
    tier: "common",
    iconFile: "assets/badges/badge_streak_2.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#f97316" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">✌️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 2
  },
  {
    id: "badge_streak_3",
    name: "작심삼일 극복",
    description: "3일 연속으로 로그인하여 천자문을 학습했습니다. 굳건한 습관의 시작입니다.",
    category: "streak",
    tier: "common",
    iconFile: "assets/badges/badge_streak_3.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🕯️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 3
  },
  {
    id: "badge_streak_5",
    name: "오일 연속 출석",
    description: "5일 연속 출석! 주중 학습 루틴이 탄탄하게 자리잡았습니다.",
    category: "streak",
    tier: "common",
    iconFile: "assets/badges/badge_streak_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#c2410c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">✋</text></svg>`,
    condition: (state) => (state.streak || 0) >= 5
  },
  {
    id: "badge_streak_7",
    name: "일주일의 기적",
    description: "7일 연속 출석! 하루도 빠짐없이 서당에 출석한 성실함의 증표입니다.",
    category: "streak",
    tier: "rare",
    iconFile: "assets/badges/badge_streak_7.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#9a3412" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🔥</text></svg>`,
    condition: (state) => (state.streak || 0) >= 7
  },
  {
    id: "badge_streak_10",
    name: "십일 열공",
    description: "10일 연속 출석! 열흘 동안 변함없는 배움의 불꽃을 피웠습니다.",
    category: "streak",
    tier: "rare",
    iconFile: "assets/badges/badge_streak_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#eab308" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌟</text></svg>`,
    condition: (state) => (state.streak || 0) >= 10
  },
  {
    id: "badge_streak_14",
    name: "불굴의 학도",
    description: "14일(2주) 연속 학습! 비가 오나 눈이 오나 한자를 잊지 않았습니다.",
    category: "streak",
    tier: "rare",
    iconFile: "assets/badges/badge_streak_14.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛡️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 14
  },
  {
    id: "badge_streak_21",
    name: "습관의 완성",
    description: "21일 연속 출석! 행동심리학에서 말하는 완벽한 뇌 습관화가 달성되었습니다.",
    category: "streak",
    tier: "epic",
    iconFile: "assets/badges/badge_streak_21.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#a16207" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🧠</text></svg>`,
    condition: (state) => (state.streak || 0) >= 21
  },
  {
    id: "badge_streak_30",
    name: "월간 개근상",
    description: "30일 연속 출석 달성! 한 달 동안 흔들림 없는 배움의 열정을 증명했습니다.",
    category: "streak",
    tier: "epic",
    iconFile: "assets/badges/badge_streak_30.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🗓️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 30
  },
  {
    id: "badge_streak_50",
    name: "오십일의 집념",
    description: "50일 연속 개근! 쉼 없는 집념이 서당 전체의 귀감이 되고 있습니다.",
    category: "streak",
    tier: "epic",
    iconFile: "assets/badges/badge_streak_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#dc2626" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🎖️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 50
  },
  {
    id: "badge_streak_70",
    name: "칠십일의 끈기",
    description: "70일 연속 출석! 계절이 바뀌어도 배움을 향한 발걸음은 멈추지 않습니다.",
    category: "streak",
    tier: "legendary",
    iconFile: "assets/badges/badge_streak_70.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#b91c1c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🪨</text></svg>`,
    condition: (state) => (state.streak || 0) >= 70
  },
  {
    id: "badge_streak_100",
    name: "백일의 기도",
    description: "100일 연속 학습 대기록! 하늘도 감동시킬 위대한 노력입니다.",
    category: "streak",
    tier: "legendary",
    iconFile: "assets/badges/badge_streak_100.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#991b1b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🪷</text></svg>`,
    condition: (state) => (state.streak || 0) >= 100
  },
  {
    id: "badge_streak_150",
    name: "150일의 여정",
    description: "150일 연속 학습 달성! 반년 가까이 서당을 지킨 숭고한 끈기입니다.",
    category: "streak",
    tier: "legendary",
    iconFile: "assets/badges/badge_streak_150.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fae8ff" stroke="#c026d3" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">⛰️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 150
  },
  {
    id: "badge_streak_200",
    name: "이백일의 묵상",
    description: "200일 연속 출석! 깊이 있는 묵상과 함께 학문이 생활의 일부가 되었습니다.",
    category: "streak",
    tier: "legendary",
    iconFile: "assets/badges/badge_streak_200.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fae8ff" stroke="#a21caf" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🧘</text></svg>`,
    condition: (state) => (state.streak || 0) >= 200
  },
  {
    id: "badge_streak_300",
    name: "삼백일의 수행",
    description: "300일 연속 학습! 구도자의 마음으로 1년 개근의 턱밑까지 도달했습니다.",
    category: "streak",
    tier: "mythic",
    iconFile: "assets/badges/badge_streak_300.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#c2410c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛕</text></svg>`,
    condition: (state) => (state.streak || 0) >= 300
  },
  {
    id: "badge_streak_365",
    name: "🌟 전설의 학우",
    description: "365일(1년) 연속 개근! 천자문 마스터 역사에 길이 남을 불멸의 대기록입니다.",
    category: "streak",
    tier: "mythic",
    iconFile: "assets/badges/badge_streak_365.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#b45309" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">☀️</text></svg>`,
    condition: (state) => (state.streak || 0) >= 365
  },
  {
    id: "badge_night_owl",
    name: "새벽을 여는 자",
    description: "심야 시간(자정~오전 4시)에 학습을 완료한 고요하고 열정적인 야행성 학도입니다.",
    category: "streak",
    tier: "rare",
    iconFile: "assets/badges/badge_night_owl.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#6366f1" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🦉</text></svg>`,
    condition: () => {
      const h = new Date().getHours();
      return h >= 0 && h < 4;
    }
  },
  {
    id: "badge_early_bird",
    name: "아침을 깨우는 새",
    description: "이른 아침(오전 5시~8시)에 학습을 시작한 상쾌하고 부지런한 학도입니다.",
    category: "streak",
    tier: "rare",
    iconFile: "assets/badges/badge_early_bird.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#3b82f6" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐦</text></svg>`,
    condition: () => {
      const h = new Date().getHours();
      return h >= 5 && h <= 8;
    }
  },

  // ==========================================================
  // [3. 시험 및 퀴즈 정확도 업적 (Quiz)] - 18개
  // ==========================================================
  {
    id: "badge_quiz_first",
    name: "첫 시험 도전",
    description: "일반 시험 또는 오답 퀴즈에 처음으로 응시하여 실력을 점검했습니다.",
    category: "quiz",
    tier: "common",
    iconFile: "assets/badges/badge_quiz_first.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#16a34a" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">📝</text></svg>`,
    condition: (state) => (state.points || 0) >= 15
  },
  {
    id: "badge_combo_5",
    name: "오콤보 준비운동",
    description: "퀴즈에서 5연속 정답을 맞추며 가볍게 몸을 풀었습니다.",
    category: "quiz",
    tier: "common",
    iconFile: "assets/badges/badge_combo_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#60a5fa" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">✨</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 5
  },
  {
    id: "badge_combo_10",
    name: "집중의 콤보",
    description: "퀴즈에서 10문제 연속 정답 달성! 흔들림 없는 집중력을 보였습니다.",
    category: "quiz",
    tier: "common",
    iconFile: "assets/badges/badge_combo_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#2563eb" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">⚡</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 10
  },
  {
    id: "badge_combo_15",
    name: "날카로운 직감",
    description: "15연속 정답 달성! 한자의 뜻과 음을 꿰뚫어 보는 통찰력이 빛납니다.",
    category: "quiz",
    tier: "rare",
    iconFile: "assets/badges/badge_combo_15.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#1d4ed8" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏹</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 15
  },
  {
    id: "badge_combo_20",
    name: "거침없는 질주",
    description: "20연속 정답 돌파! 오답의 유혹에 굴하지 않는 훌륭한 실력입니다.",
    category: "quiz",
    tier: "rare",
    iconFile: "assets/badges/badge_combo_20.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#1e40af" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐎</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 20
  },
  {
    id: "badge_combo_30",
    name: "폭풍의 콤보",
    description: "30연속 정답 폭풍 콤보! 어떤 난이도의 한자도 거침없이 맞추는 실력자입니다.",
    category: "quiz",
    tier: "epic",
    iconFile: "assets/badges/badge_combo_30.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌩️</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 30
  },
  {
    id: "badge_combo_40",
    name: "신풍의 일격",
    description: "40연속 정답 달성! 서당을 휩쓰는 지식의 태풍과도 같습니다.",
    category: "quiz",
    tier: "epic",
    iconFile: "assets/badges/badge_combo_40.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#b45309" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌪️</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 40
  },
  {
    id: "badge_combo_50",
    name: "신출귀몰 시험관",
    description: "50연속 정답 무결점 대기록! 한자의 뜻과 음이 뇌리에 완벽히 박혔습니다.",
    category: "quiz",
    tier: "legendary",
    iconFile: "assets/badges/badge_combo_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#a16207" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🎯</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 50
  },
  {
    id: "badge_combo_70",
    name: "무적의 지성",
    description: "70연속 정답! 어떤 어려운 문제도 막아낼 수 없는 학문의 마스터입니다.",
    category: "quiz",
    tier: "legendary",
    iconFile: "assets/badges/badge_combo_70.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#dc2626" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🔥</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 70
  },
  {
    id: "badge_combo_100",
    name: "💯 콤보 마스터",
    description: "100연속 정답 신화 달성! 천자문 퀴즈계의 전설로 영원히 기록됩니다.",
    category: "quiz",
    tier: "mythic",
    iconFile: "assets/badges/badge_combo_100.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">👑</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 100
  },
  {
    id: "badge_perfect_quiz_1",
    name: "만점 천재",
    description: "시험 1회에서 100점 만점을 기록하여 천재성을 입증했습니다.",
    category: "quiz",
    tier: "rare",
    iconFile: "assets/badges/badge_perfect_quiz_1.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🥇</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 10 || (state.points || 0) >= 30
  },
  {
    id: "badge_perfect_quiz_5",
    name: "오연속 만점왕",
    description: "뛰어난 실력으로 퀴즈에서 여러 차례 만점을 휩쓸었습니다.",
    category: "quiz",
    tier: "epic",
    iconFile: "assets/badges/badge_perfect_quiz_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#9333ea" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏆</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 20 && (state.points || 0) >= 100
  },
  {
    id: "badge_perfect_quiz_10",
    name: "십전십승 장원급제",
    description: "과거 시험으로 치면 장원급제에 해당하는 완벽한 시험 성취도입니다.",
    category: "quiz",
    tier: "legendary",
    iconFile: "assets/badges/badge_perfect_quiz_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#c2410c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">📜</text></svg>`,
    condition: (state) => (state.maxCombo || 0) >= 30 && (state.points || 0) >= 300
  },
  {
    id: "badge_wrong_remedy_1",
    name: "오답 첫 치료",
    description: "오답노트에서 취약 한자 1개를 복습하고 완치시켜 목록에서 탈출시켰습니다.",
    category: "quiz",
    tier: "common",
    iconFile: "assets/badges/badge_wrong_remedy_1.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfdf5" stroke="#10b981" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💊</text></svg>`,
    condition: (state) => Object.keys(state.wrongNote || {}).length > 0
  },
  {
    id: "badge_wrong_remedy_5",
    name: "오답 청소부",
    description: "오답 한자 5개를 집중 학습하여 실력으로 승화시켰습니다.",
    category: "quiz",
    tier: "common",
    iconFile: "assets/badges/badge_wrong_remedy_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfdf5" stroke="#059669" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🧹</text></svg>`,
    condition: (state) => Object.keys(state.wrongNote || {}).length >= 5
  },
  {
    id: "badge_wrong_remedy_10",
    name: "오답 극복자",
    description: "오답노트에 등록되었던 취약 한자 10개를 반복 학습하여 완치시켰습니다.",
    category: "quiz",
    tier: "rare",
    iconFile: "assets/badges/badge_wrong_remedy_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfdf5" stroke="#047857" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🩹</text></svg>`,
    condition: (state) => Object.keys(state.wrongNote || {}).length >= 10 || (state.points || 0) >= 50
  },
  {
    id: "badge_wrong_remedy_30",
    name: "약점 제로",
    description: "취약 한자 30개를 완벽하게 암기하여 약점을 강점으로 바꾸었습니다.",
    category: "quiz",
    tier: "epic",
    iconFile: "assets/badges/badge_wrong_remedy_30.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#15803d" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛡️</text></svg>`,
    condition: (state) => Object.keys(state.wrongNote || {}).length >= 30 || (state.points || 0) >= 200
  },
  {
    id: "badge_wrong_remedy_50",
    name: "무결점 학사",
    description: "50개의 오답을 마스터! 틀린 문제에서 가장 많은 지식을 얻는 현자입니다.",
    category: "quiz",
    tier: "legendary",
    iconFile: "assets/badges/badge_wrong_remedy_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f0fdf4" stroke="#166534" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💎</text></svg>`,
    condition: (state) => Object.keys(state.wrongNote || {}).length >= 50 || (state.points || 0) >= 500
  },

  // ==========================================================
  // [4. 리그 및 라이벌 경쟁 업적 (League)] - 18개
  // ==========================================================
  {
    id: "badge_league_bronze",
    name: "브론즈 리거",
    description: "주간 경쟁 리그에 처음으로 진입하여 다른 학도들과 선의의 경쟁을 시작했습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_league_bronze.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#9a3412" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🥉</text></svg>`,
    condition: () => true // MVP 기본 달성
  },
  {
    id: "badge_league_silver",
    name: "실버 리거",
    description: "꾸준한 포인트 적립으로 주간 리그 실버 티어로 당당히 승급했습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_league_silver.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f1f5f9" stroke="#64748b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🥈</text></svg>`,
    condition: (state) => (state.points || 0) >= 100
  },
  {
    id: "badge_league_gold",
    name: "황금 리거",
    description: "치열한 경쟁을 뚫고 상위 30% 골드 리그 티어로 당당히 승급했습니다.",
    category: "league",
    tier: "rare",
    iconFile: "assets/badges/badge_league_gold.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#eab308" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🥇</text></svg>`,
    condition: (state) => (state.points || 0) >= 300
  },
  {
    id: "badge_league_platinum",
    name: "플래티넘 리거",
    description: "상위 15% 명문 플래티넘 리그에 입성한 엘리트 학우입니다.",
    category: "league",
    tier: "epic",
    iconFile: "assets/badges/badge_league_platinum.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfeff" stroke="#06b6d4" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💠</text></svg>`,
    condition: (state) => (state.points || 0) >= 600
  },
  {
    id: "badge_league_diamond",
    name: "다이아몬드 리거",
    description: "상위 8% 영예의 다이아몬드 티어! 그 누구도 무시할 수 없는 고수입니다.",
    category: "league",
    tier: "legendary",
    iconFile: "assets/badges/badge_league_diamond.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#3b82f6" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💎</text></svg>`,
    condition: (state) => (state.points || 0) >= 1000
  },
  {
    id: "badge_league_master",
    name: "🏆 천자문 마스터 리그",
    description: "최상위 3% 명예의 전당, 천자문 마스터 리그에 도달한 최강의 리거입니다.",
    category: "league",
    tier: "mythic",
    iconFile: "assets/badges/badge_league_master.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fae8ff" stroke="#a21caf" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">👑</text></svg>`,
    condition: (state) => (state.points || 0) >= 2000
  },
  {
    id: "badge_league_grandmaster",
    name: "👑 그랜드마스터",
    description: "전국 최강의 고수들만 모이는 그랜드마스터 정점에 섰습니다.",
    category: "league",
    tier: "mythic",
    iconFile: "assets/badges/badge_league_grandmaster.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#c2410c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐲</text></svg>`,
    condition: (state) => (state.points || 0) >= 3500
  },
  {
    id: "badge_pvp_first",
    name: "첫 한자 대결",
    description: "실시간 PvP 한자 대결에 처음 참가하여 짜릿한 명승부를 펼쳤습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_pvp_first.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">⚔️</text></svg>`,
    condition: (state) => (state.points || 0) >= 50
  },
  {
    id: "badge_pvp_win_1",
    name: "첫 승리의 월계관",
    description: "PvP 배틀에서 멋진 콤보로 상대방을 꺾고 첫 승리를 쟁취했습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_pvp_win_1.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏆</text></svg>`,
    condition: (state) => (state.points || 0) >= 80
  },
  {
    id: "badge_pvp_win_5",
    name: "5승 투사",
    description: "PvP 배틀 5승 달성! 실전에서 더욱 강해지는 승부사입니다.",
    category: "league",
    tier: "rare",
    iconFile: "assets/badges/badge_pvp_win_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🥊</text></svg>`,
    condition: (state) => (state.points || 0) >= 150
  },
  {
    id: "badge_pvp_win_10",
    name: "10승의 명장",
    description: "PvP 배틀 10승 달성! 학우들 사이에 이름이 알려진 백전노장입니다.",
    category: "league",
    tier: "epic",
    iconFile: "assets/badges/badge_pvp_win_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#dc2626" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🎖️</text></svg>`,
    condition: (state) => (state.points || 0) >= 300
  },
  {
    id: "badge_pvp_win_30",
    name: "백전불태 대장군",
    description: "PvP 30승 달성! 적수가 없는 천하무적 한자 대장군입니다.",
    category: "league",
    tier: "legendary",
    iconFile: "assets/badges/badge_pvp_win_30.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#b91c1c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🗡️</text></svg>`,
    condition: (state) => (state.points || 0) >= 800
  },
  {
    id: "badge_pvp_win_50",
    name: "전설의 무패 사신",
    description: "PvP 50승 대기록! 대결장에 나타나는 것만으로도 상대에게 경외감을 줍니다.",
    category: "league",
    tier: "mythic",
    iconFile: "assets/badges/badge_pvp_win_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#1e1b4b" stroke="#4338ca" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">⚡</text></svg>`,
    condition: (state) => (state.points || 0) >= 1500
  },
  {
    id: "badge_social_1",
    name: "서당 친구 1명",
    description: "서당에서 첫 친구를 사귀어 함께 배움의 길을 걷기 시작했습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_social_1.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fce7f3" stroke="#ec4899" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🤝</text></svg>`,
    condition: (state) => (state.friends || []).length >= 1
  },
  {
    id: "badge_social_3",
    name: "삼총사",
    description: "3명의 친구와 함께 리그에서 동반 성장하며 우정을 나누고 있습니다.",
    category: "league",
    tier: "common",
    iconFile: "assets/badges/badge_social_3.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fce7f3" stroke="#db2777" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🧑‍🤝‍🧑</text></svg>`,
    condition: (state) => (state.friends || []).length >= 3
  },
  {
    id: "badge_social_5",
    name: "서당 인맥왕",
    description: "친구 5명 이상을 등록하고 동반 경쟁 매칭을 설정하여 학우들과 어울리고 있습니다.",
    category: "league",
    tier: "rare",
    iconFile: "assets/badges/badge_social_5.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fce7f3" stroke="#be185d" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💖</text></svg>`,
    condition: (state) => (state.friends || []).length >= 5
  },
  {
    id: "badge_social_10",
    name: "마당발 학사",
    description: "10명의 친구들과 네트워크를 형성한 서당 제일의 인기인입니다.",
    category: "league",
    tier: "epic",
    iconFile: "assets/badges/badge_social_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#9333ea" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🌟</text></svg>`,
    condition: (state) => (state.friends || []).length >= 10
  },
  {
    id: "badge_social_20",
    name: "서당 인플루언서",
    description: "친구 20명 돌파! 온 서당의 학우들이 따르는 진정한 리더이자 인플루언서입니다.",
    category: "league",
    tier: "legendary",
    iconFile: "assets/badges/badge_social_20.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#c2410c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">👑</text></svg>`,
    condition: (state) => (state.friends || []).length >= 20
  },

  // ==========================================================
  // [5. 히든 및 이색 꿀잼 업적 (Hidden & Fun)] - 18개
  // ==========================================================
  {
    id: "badge_shop_first",
    name: "첫 소비의 맛",
    description: "상점에서 처음으로 포인트를 소모하여 아이템(수호권 등)을 구매했습니다. 투자하는 학도!",
    category: "hidden",
    tier: "common",
    iconFile: "assets/badges/badge_shop_first.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfeff" stroke="#06b6d4" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛍️</text></svg>`,
    condition: (state) => (state.shop?.streakShields || 0) > 0 || (state.shop?.purchasedPetSlots || []).length > 0
  },
  {
    id: "badge_shop_vip",
    name: "상점 단골 손님",
    description: "상점을 자주 이용하며 학업 환경을 쾌적하게 꾸미는 단골 고객입니다.",
    category: "hidden",
    tier: "rare",
    iconFile: "assets/badges/badge_shop_vip.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ecfeff" stroke="#0891b2" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💳</text></svg>`,
    condition: (state) => (state.shop?.streakShields || 0) >= 2 || (state.shop?.purchasedPetSlots || []).length >= 2
  },
  {
    id: "badge_shop_vvip",
    name: "천하제일 큰손",
    description: "상점의 희귀 아이템을 아낌없이 수집하는 서당 제일의 VVIP 큰손입니다.",
    category: "hidden",
    tier: "epic",
    iconFile: "assets/badges/badge_shop_vvip.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">👑</text></svg>`,
    condition: (state) => (state.shop?.streakShields || 0) >= 5 || (state.shop?.purchasedPetSlots || []).length >= 5
  },
  {
    id: "badge_point_100",
    name: "백원 예금주",
    description: "학습 노력으로 누적 100포인트를 모았습니다. 부자의 첫걸음!",
    category: "hidden",
    tier: "common",
    iconFile: "assets/badges/badge_point_100.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🪙</text></svg>`,
    condition: (state) => (state.points || 0) >= 100
  },
  {
    id: "badge_point_500",
    name: "오백원 부자",
    description: "누적 500포인트 달성! 여유로운 상점 쇼핑을 즐길 수 있는 자산입니다.",
    category: "hidden",
    tier: "rare",
    iconFile: "assets/badges/badge_point_500.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💰</text></svg>`,
    condition: (state) => (state.points || 0) >= 500
  },
  {
    id: "badge_point_1000",
    name: "천원 자산가",
    description: "1,000포인트 마일스톤 돌파! 배움이 곧 자산임을 증명했습니다.",
    category: "hidden",
    tier: "epic",
    iconFile: "assets/badges/badge_point_1000.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#b45309" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏦</text></svg>`,
    condition: (state) => (state.points || 0) >= 1000
  },
  {
    id: "badge_point_3000",
    name: "서당 만수르",
    description: "누적 3,000 포인트(P) 이상을 모은 천자문 학계의 엄청난 자산가입니다.",
    category: "hidden",
    tier: "legendary",
    iconFile: "assets/badges/badge_point_3000.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">💎</text></svg>`,
    condition: (state) => (state.points || 0) >= 3000
  },
  {
    id: "badge_point_5000",
    name: "황금 창고의 주인",
    description: "5,000포인트 보유! 황금이 넘쳐나는 보물 창고의 위풍당당한 주인입니다.",
    category: "hidden",
    tier: "legendary",
    iconFile: "assets/badges/badge_point_5000.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏰</text></svg>`,
    condition: (state) => (state.points || 0) >= 5000
  },
  {
    id: "badge_point_10000",
    name: "💎 천자문 재벌 1세",
    description: "누적 10,000포인트 신화! 천자문 마스터 세계관 최고의 재벌입니다.",
    category: "hidden",
    tier: "mythic",
    iconFile: "assets/badges/badge_point_10000.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fae8ff" stroke="#a21caf" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🪐</text></svg>`,
    condition: (state) => (state.points || 0) >= 10000
  },
  {
    id: "badge_seven_fall",
    name: "칠전팔기 불사조",
    description: "퀴즈나 오답노트에서 7번 이상 틀렸던 끈질긴 오답 한자를 마침내 완벽히 극복했습니다!",
    category: "hidden",
    tier: "epic",
    iconFile: "assets/badges/badge_seven_fall.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fff1f2" stroke="#e11d48" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🦅</text></svg>`,
    condition: (state) => Object.values(state.wrongNote || {}).some(v => (v.wrongCount || 0) >= 7) || (state.points || 0) >= 120
  },
  {
    id: "badge_ten_fall",
    name: "십전십기 철인",
    description: "10번 넘게 틀려도 절망하지 않고 오뚝이처럼 일어나 한자를 기어이 정복했습니다.",
    category: "hidden",
    tier: "legendary",
    iconFile: "assets/badges/badge_ten_fall.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fee2e2" stroke="#b91c1c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛡️</text></svg>`,
    condition: (state) => Object.values(state.wrongNote || {}).some(v => (v.wrongCount || 0) >= 10) || (state.points || 0) >= 400
  },
  {
    id: "badge_speed_racer",
    name: "광속 서책 열람",
    description: "플래시 카드를 빠른 속도로 열람하며 두뇌 회전의 극한을 보였습니다.",
    category: "hidden",
    tier: "rare",
    iconFile: "assets/badges/badge_speed_racer.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#854d0e" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏎️</text></svg>`,
    condition: (state) => (state.points || 0) >= 80
  },
  {
    id: "badge_pet_first",
    name: "첫 정령 펫 분양",
    description: "상점에서 귀여운 한자 정령 펫의 장비 슬롯을 처음으로 분양받았습니다.",
    category: "hidden",
    tier: "common",
    iconFile: "assets/badges/badge_pet_first.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f3e8ff" stroke="#9333ea" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐶</text></svg>`,
    condition: (state) => (state.shop?.purchasedPetSlots || []).length > 0
  },
  {
    id: "badge_pet_collector",
    name: "펫 컬렉터",
    description: "다양한 펫 꾸미기 아이템을 3개 이상 모은 사랑 넘치는 주인이 되었습니다.",
    category: "hidden",
    tier: "epic",
    iconFile: "assets/badges/badge_pet_collector.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fae8ff" stroke="#a21caf" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🐕</text></svg>`,
    condition: (state) => (state.shop?.purchasedPetSlots || []).length >= 3
  },
  {
    id: "badge_shield_master",
    name: "철통 방어",
    description: "출석 수호권을 3개 이상 동시에 보유하여 어떤 위기에도 불꽃이 꺼지지 않습니다.",
    category: "hidden",
    tier: "rare",
    iconFile: "assets/badges/badge_shield_master.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#eff6ff" stroke="#1d4ed8" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🛡️</text></svg>`,
    condition: (state) => (state.shop?.streakShields || 0) >= 3
  },
  {
    id: "badge_title_collector",
    name: "칭호 수집가",
    description: "학문적 성취를 인정받아 다양한 영광의 칭호를 5개 이상 획득했습니다.",
    category: "hidden",
    tier: "epic",
    iconFile: "assets/badges/badge_title_collector.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏷️</text></svg>`,
    condition: (state) => (state.points || 0) >= 250
  },
  {
    id: "badge_hall_of_fame_10",
    name: "배지 전당 입성",
    description: "업적 배지를 10개 이상 획득하여 영광의 배지 전당에 당당히 이름을 올렸습니다.",
    category: "hidden",
    tier: "rare",
    iconFile: "assets/badges/badge_hall_of_fame_10.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">🏛️</text></svg>`,
    condition: (state) => (state.badges || []).length >= 10
  },
  {
    id: "badge_hall_of_fame_50",
    name: "🌟 명예의 전당 지배자",
    description: "업적 배지 50개 이상을 수집한 최고의 수집왕이자 명예의 전당 지배자입니다.",
    category: "hidden",
    tier: "mythic",
    iconFile: "assets/badges/badge_hall_of_fame_50.png",
    defaultSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#ffedd5" stroke="#ea580c" stroke-width="4"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40">👑</text></svg>`,
    condition: (state) => (state.badges || []).length >= 50
  }
];

// 배지 ID로 즉시 객체를 조회할 수 있는 맵 구성
export const BADGES_MAP = BADGES_DATA.reduce((acc, b) => {
  acc[b.id] = b;
  return acc;
}, {});

/**
 * 특정 배지의 아이콘 HTML 태그를 생성하여 반환합니다.
 * PNG 이미지 파일이 존재하면 렌더링하고, 없을 시 기본 SVG(defaultSvg)로 자동 폴백(Fallback)됩니다.
 * @param {string} badgeId - 배지 고유 식별자
 * @param {number} size - 픽셀 크기 (기본: 48px)
 * @returns {string} <img> HTML 태그 문자열
 */
export function getBadgeIconHtml(badgeId, size = 48) {
  const badge = BADGES_MAP[badgeId];
  if (!badge) return "";
  
  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(badge.defaultSvg)}`;
  
  return `<img src="${badge.iconFile}" alt="${badge.name}" title="[${badge.name}] ${badge.description}" class="badge-icon-img tier-${badge.tier}" style="width:${size}px; height:${size}px; object-fit:contain; border-radius:12px; transition: transform 0.2s;" onerror="this.onerror=null; this.src='${svgDataUri}';">`;
}

/**
 * 비즈니스 상태(state)를 기반으로 90대 전체 배지의 달성 조건을 실시간 검사하고 새로 획득한 배지를 등록합니다.
 * @param {object} state - 앱 상태 객체
 * @returns {Array} 새로 획득한 배지 객체 배열
 */
export function evaluateAllBadges(state) {
  if (!state) return [];
  if (!Array.isArray(state.badges)) state.badges = [];
  
  const earned = new Set(state.badges);
  const newUnlocked = [];

  for (const badge of BADGES_DATA) {
    if (!earned.has(badge.id)) {
      try {
        if (badge.condition && badge.condition(state)) {
          earned.add(badge.id);
          newUnlocked.push(badge);
        }
      } catch (e) {
        console.error(`Badge eval error (${badge.id}):`, e);
      }
    }
  }

  if (newUnlocked.length > 0) {
    state.badges = Array.from(earned);
  }
  return newUnlocked;
}
