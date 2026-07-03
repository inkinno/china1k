// ==========================================================================
// 대시보드 뷰 컴포넌트 (Dashboard View - 90대 확장 배지 전당 연동)
// ==========================================================================
import stateManager from "../state.js";
import { ALL_CHUNJA_DATA } from "../data/index.js";
import { BADGES_DATA, BADGE_CATEGORIES, getBadgeIconHtml, evaluateAllBadges } from "../data/badges.js";

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

    // 실시간 90대 배지 조건 평가 및 획득 처리
    const newUnlocked = evaluateAllBadges(state);
    if (newUnlocked.length > 0) {
      stateManager.update({ badges: state.badges });
    }

    this.container.innerHTML = `
      <div class="dashboard-grid">
        
        <!-- 왼쪽: 통계 및 90대 확장 배지 전당 -->
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
                  <span class="stat-value" style="color: var(--gold);">${(state.points || 0).toFixed(1)} P</span>
                </div>
              </div>
              
              <!-- 3. 출석 Streak -->
              <div class="stat-box">
                <div class="stat-icon-wrapper"><i class="fa-solid fa-fire"></i></div>
                <div class="stat-info">
                  <span class="stat-label">연속 출석</span>
                  <span class="stat-value" style="color: #F97316;">${state.streak || 0}일</span>
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
          
          <!-- 카드 2: 90대 확장 훈장 및 배지 전당 (Gamification) -->
          <div class="dashboard-card">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
              <h3 style="margin: 0;"><i class="fa-solid fa-award" style="color: var(--gold);"></i> 명예의 배지 전당 (${state.badges.length}/${BADGES_DATA.length})</h3>
              <span style="font-size: 13px; font-weight: 800; color: var(--secondary); background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-glass);">
                달성율 ${((state.badges.length / BADGES_DATA.length) * 100).toFixed(0)}%
              </span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
              학습, 출석, 퀴즈, 리그 등 다양한 활동을 통해 90개의 영광스러운 훈장 아이콘을 수집해 보세요!
            </p>
            
            <div class="badges-hall-container">
              ${Object.entries(BADGE_CATEGORIES).map(([catKey, catTitle]) => {
                const catBadges = BADGES_DATA.filter(b => b.category === catKey);
                const unlockedCatCount = catBadges.filter(b => state.badges.includes(b.id)).length;
                return `
                  <div class="badge-category-section" style="margin-bottom: 28px; background: rgba(0,0,0,0.15); padding: 16px; border-radius: 16px; border: 1px solid var(--border-glass);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 14px;">
                      <h4 style="font-size: 15px; font-weight: 800; color: var(--gold); margin: 0; display: flex; align-items: center; gap: 8px;">
                        ${catTitle}
                      </h4>
                      <span style="font-size: 12px; font-weight: 700; color: ${unlockedCatCount > 0 ? 'var(--gold)' : 'var(--text-muted)'}; background: rgba(255,255,255,0.05); padding: 3px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                        ${unlockedCatCount} / ${catBadges.length} 획득
                      </span>
                    </div>
                    <div class="badges-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px;">
                      ${catBadges.map(badge => {
                        const isUnlocked = state.badges.includes(badge.id);
                        return `
                          <div class="badge-card ${isUnlocked ? 'unlocked tier-' + badge.tier : 'locked'}" title="[${badge.name}] ${badge.description}" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: ${isUnlocked ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.015)'}; border: 1px solid ${isUnlocked ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.04)'}; border-radius: 12px; transition: all 0.2s;">
                            <div class="badge-icon-wrap" style="flex-shrink: 0; filter: ${isUnlocked ? 'drop-shadow(0 0 8px rgba(255,215,0,0.4))' : 'grayscale(100%) opacity(0.25)'}; display: flex; align-items: center; justify-content: center;">
                              ${getBadgeIconHtml(badge.id, 46)}
                            </div>
                            <div style="min-width: 0; flex-grow: 1;">
                              <div style="font-weight: 800; font-size: 13px; color: ${isUnlocked ? 'var(--text-main)' : 'var(--text-muted)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
                                ${badge.name}
                              </div>
                              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35;">
                                ${badge.description}
                              </div>
                            </div>
                          </div>
                        `;
                      }).join('')}
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
              <h4 style="font-size: 18px; margin-top: 10px;">연속 <span style="color: #F97316; font-weight: 800;">${state.streak || 0}일</span> 등교 중</h4>
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
}

export default new DashboardView();
