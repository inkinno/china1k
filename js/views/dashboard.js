// ==========================================================================
// 대시보드 뷰 컴포넌트 (Dashboard View)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA } from "../data/index.js";

class DashboardView {
  constructor() {
    this.container = document.getElementById("view-dashboard");
  }

  // 화면 렌더링
  render() {
    const state = stateManager.get();
    
    // 비즈니스 통계 데이터 가공
    const totalHanja = ALL_CHUNJA_DATA.length;
    const memorizedCount = Object.values(state.progress || {}).filter(p => p && p.memorized).length;
    const progressRate = totalHanja > 0 ? ((memorizedCount / totalHanja) * 100).toFixed(1) : 0;
    
    const wrongCount = Object.keys(state.wrongNote || {}).length;
    const streakShields = state.shop?.streakShields || 0;

    // 배지 데이터 정의 (게이미피케이션)
    const BADGES = [
      { id: 'first_card', name: '첫 걸음', desc: '카드 1개 암기 완료', icon: 'fa-shoe-prints' },
      { id: 'streak_3', name: '삼일천하', desc: '연속 출석 3일 달성', icon: 'fa-calendar-check' },
      { id: 'master_50', name: '정예 학도', desc: '50자 이상 암기', icon: 'fa-shield-halved' },
      { id: 'quiz_master', name: '만점 천재', desc: '시험 1회 100점 달성', icon: 'fa-crown' },
      { id: 'combo_10', name: '신들린 콤보', desc: '10콤보 이상 달성', icon: 'fa-bolt-lightning' },
      { id: 'rich_boy', name: '자산가', desc: '100포인트 보유', icon: 'fa-piggy-bank' }
    ];

    // 실시간 유저 획득 배지 감지 및 자동 지급 로직
    this.evaluateAutoBadges(state, memorizedCount, BADGES);

    this.container.innerHTML = `
      <div class="dashboard-grid">
        
        <!-- 왼쪽: 통계 및 배지 카드 -->
        <div class="dashboard-main-area">
          
          <!-- 카드 1: 나의 학습 통계 -->
          <div class="dashboard-card" style="margin-bottom: 24px;">
            <h3><i class="fa-solid fa-square-poll-vertical"></i> 천자문 학습 발전소</h3>
            
            <div class="stats-container">
              
              <!-- 1. 진도율 -->
              <div class="stat-box">
                <div class="stat-icon-wrapper"><i class="fa-solid fa-chart-line"></i></div>
                <div class="stat-info">
                  <span class="stat-label">천자문 완독율</span>
                  <span class="stat-value">${progressRate}% <span style="font-size: 13px; color: var(--text-muted); font-weight: 500;">(${memorizedCount}/${totalHanja}자)</span></span>
                </div>
              </div>
              
              <!-- 2. 보유 포인트 -->
              <div class="stat-box">
                <div class="stat-icon-wrapper"><i class="fa-solid fa-coins"></i></div>
                <div class="stat-info">
                  <span class="stat-label">보유 포인트</span>
                  <span class="stat-value" style="color: var(--gold);">${state.points.toFixed(1)} P</span>
                </div>
              </div>
              
              <!-- 3. 출석 Streak -->
              <div class="stat-box">
                <div class="stat-icon-wrapper"><i class="fa-solid fa-fire"></i></div>
                <div class="stat-info">
                  <span class="stat-label">연속 출석</span>
                  <span class="stat-value" style="color: #F97316;">${state.streak}일</span>
                </div>
              </div>
              
              <!-- 4. 오답노트 현황 -->
              <div class="stat-box">
                <div class="stat-icon-wrapper"><i class="fa-solid fa-book-bookmark"></i></div>
                <div class="stat-info">
                  <span class="stat-label">취약 오답 한자</span>
                  <span class="stat-value" style="color: var(--error);">${wrongCount}개</span>
                </div>
              </div>
              
            </div>
            
            <!-- 진행 률 그래프 바 -->
            <div class="progress-bar-bg" style="margin-top: 24px; height: 10px;">
              <div class="progress-bar-fill" style="width: ${progressRate}%;"></div>
            </div>
          </div>
          
          <!-- 카드 2: 훈장 및 배지 (Gamification) -->
          <div class="dashboard-card">
            <h3><i class="fa-solid fa-award"></i> 획득한 배지 전당 (${state.badges.length}/${BADGES.length})</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">학습을 진행하며 영광스러운 한자 훈장 배지를 획득해 보세요!</p>
            
            <div class="badges-container">
              ${BADGES.map(badge => {
                const isUnlocked = state.badges.includes(badge.id);
                return `
                  <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${badge.desc}">
                    <i class="fa-solid ${badge.icon}"></i>
                    <div>
                      <div style="font-weight: 800;">${badge.name}</div>
                      <div style="font-size: 10px; color: var(--text-muted); font-weight: 500;">${badge.desc}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
        </div>
        
        <!-- 오른쪽: 출석 및 펫 프리뷰 -->
        <div class="dashboard-side-area">
          
          <!-- 출석 캘린더 요약 -->
          <div class="dashboard-card" style="margin-bottom: 24px;">
            <h3><i class="fa-solid fa-calendar-days" style="color: var(--secondary);"></i> 연속 출석 불꽃</h3>
            
            <div style="text-align: center; padding: 14px 0;">
              <i class="fa-solid fa-fire" style="font-size: 56px; color: #F97316; filter: drop-shadow(0 0 10px rgba(249,115,22,0.4));"></i>
              <h4 style="font-size: 18px; margin-top: 10px;">연속 <span style="color: #F97316; font-weight: 800;">${state.streak}일</span> 등교 중</h4>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">출석을 걸러 불꽃이 꺼지지 않도록 수호권을 구매해 보세요!</p>
            </div>
            
            <div style="background: rgba(0,0,0,0.15); border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; border: 1px solid var(--border-glass);">
              <span style="font-weight: 700; color: var(--text-muted);"><i class="fa-solid fa-shield"></i> 보유 출석 수호권</span>
              <span style="font-weight: 900; color: var(--success);">${streakShields}개</span>
            </div>
          </div>
          
          <!-- 펫 꾸미기 선구매 슬롯 프리뷰 -->
          <div class="dashboard-card">
            <h3><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i> 소유한 펫 장비</h3>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              상점에서 미리 선구매한 귀여운 한자 정령 펫의 꾸미기 데코레이션 아이템 목록입니다.
            </p>
            
            ${(!state.shop?.purchasedPetSlots || state.shop.purchasedPetSlots.length === 0) ? `
              <div style="text-align: center; padding: 24px 0; color: var(--text-muted); border: 1px dashed var(--border-glass); border-radius: 12px; font-size: 12px;">
                <i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5;"></i>
                <div>아직 구매한 펫 장비가 없습니다.</div>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(state.shop?.purchasedPetSlots || []).map(item => `
                  <div style="background: rgba(138,43,226,0.05); border: 1px solid rgba(138,43,226,0.15); border-radius: 10px; padding: 8px 12px; font-size: 12px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                    <i class="fa-solid fa-shirt" style="color: var(--primary);"></i>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          
        </div>
        
      </div>
    `;
  }

  // 비즈니스 룰 기반 배지 자동 지급 연산
  evaluateAutoBadges(state, memorizedCount, BADGES) {
    const earnedBadges = [...state.badges];
    let updated = false;

    const tryUnlock = (badgeId) => {
      if (!earnedBadges.includes(badgeId)) {
        earnedBadges.push(badgeId);
        updated = true;
      }
    };

    // 1. 카드 1개 암기
    if (memorizedCount >= 1) tryUnlock('first_card');
    
    // 2. 연속 출석 3일
    if (state.streak >= 3) tryUnlock('streak_3');
    
    // 3. 50자 이상 암기
    if (memorizedCount >= 50) tryUnlock('master_50');
    
    // 4. 역대 최고 콤보 10콤보 이상
    if (state.maxCombo >= 10) tryUnlock('combo_10');
    
    // 5. 100포인트 돌파
    if (state.points >= 100.0) tryUnlock('rich_boy');

    if (updated) {
      // 갱신 시 상태 변경
      stateManager.update({ badges: earnedBadges });
    }
  }
}

export default new DashboardView();
