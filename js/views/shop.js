// ==========================================================================
// 상점 MVP 뷰 컴포넌트 (Shop View)
// ==========================================================================
import stateManager from "../state.js";
import { showSuccessToast, showErrorToast } from "../ui/toast.js";
import { showAlert, showConfirm } from "../ui/modal.js";

class ShopView {
  constructor() {
    this.container = document.getElementById("view-shop");
  }

  // 화면 렌더링
  render() {
    const state = stateManager.get();
    
    // 펫 꾸미기 선구매 상품 리스트 정의
    const PET_GEARS = [
      { id: 'pet_hat_gold', name: '영롱한 어사화 모자', desc: '장원급제한 선비들이 쓰는 신비로운 금빛 모자', price: 100 },
      { id: 'pet_glass_retro', name: '레트로 둥근 안경', desc: '훈장선생님 느낌을 물씬 풍기는 클래식한 둥근 안경', price: 100 },
      { id: 'pet_ribbon_aurora', name: '오로라 실크 리본', desc: '한자 정령 펫의 몸을 은은하게 감싸 안는 신비로운 리본', price: 100 }
    ];

    this.container.innerHTML = `
      <div class="shop-layout">
        
        <!-- 상점 배너 -->
        <div class="shop-banner">
          <div class="shop-banner-info">
            <h2>천자문 마스터 포인트 상점</h2>
            <p>열심히 학습하여 획득한 포인트로 유용한 아이템과 펫 장비를 구매하세요!</p>
          </div>
          <div class="item-price" style="font-size: 20px; background: rgba(0,0,0,0.2); padding: 8px 20px; border-radius: 15px; border: 1px solid var(--border-glass);">
            <i class="fa-solid fa-coins"></i> <span id="shop-user-points">${state.points.toFixed(1)}</span> P
          </div>
        </div>
        
        <!-- 상점 아이템 그리드 -->
        <div class="shop-items-grid">
          
          <!-- 1. 출석 수호권 (Streak Shield) -->
          <div class="shop-item-card">
            <div class="item-icon-container">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div class="item-details">
              <div>
                <div class="item-name">연속 출석 보호권</div>
                <div class="item-desc">하루 접속을 깜빡하더라도 연속 출석 기록(Streak)이 초기화되는 것을 막아주는 소모성 안심 아이템.</div>
              </div>
              <div class="item-action-row">
                <div class="item-price"><i class="fa-solid fa-coins"></i> 30P</div>
                <button class="buy-btn" id="buy-shield-btn" ${state.points < 30 ? 'disabled' : ''}>
                  구매하기
                </button>
              </div>
            </div>
          </div>
          
          <!-- 2. 펫 꾸미기 슬롯 선구매 리스트 -->
          ${PET_GEARS.map(gear => {
            const alreadyOwned = state.shop.purchasedPetSlots.includes(gear.name);
            const canAfford = state.points >= gear.price;
            
            return `
              <div class="shop-item-card">
                <div class="item-icon-container">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div class="item-details">
                  <div>
                    <div class="item-name">${gear.name}</div>
                    <div class="item-desc">${gear.desc}</div>
                  </div>
                  <div class="item-action-row">
                    <div class="item-price"><i class="fa-solid fa-coins"></i> ${gear.price}P</div>
                    <button class="buy-btn" data-gear-name="${gear.name}" data-gear-price="${gear.price}" 
                      ${alreadyOwned ? 'disabled style="background:#1e293b;color:var(--text-muted);"' : (!canAfford ? 'disabled' : '')}>
                      ${alreadyOwned ? '소유함' : '선구매하기'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          
        </div>
        
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const buyShieldBtn = document.getElementById("buy-shield-btn");
    const buyGearButtons = document.querySelectorAll(".shop-items-grid button[data-gear-name]");

    // 1. 출석 수호권 구매
    if (buyShieldBtn) {
      buyShieldBtn.addEventListener("click", async () => {
        const state = stateManager.get();
        if (state.points < 30) {
          showAlert("포인트 부족", "출석 수호권을 구매하기 위한 포인트(30P)가 부족합니다.");
          return;
        }

        const confirmPurchase = await showConfirm(
          "<i class='fa-solid fa-cart-shopping'></i> 아이템 구매 확인",
          "연속 출석 보호권 1개를 구매하시겠습니까?<br><br><b>소모 포인트: 30 P</b>"
        );

        if (confirmPurchase) {
          const nextPoints = parseFloat((state.points - 30.0).toFixed(2));
          const newShop = {
            ...state.shop,
            streakShields: (state.shop.streakShields || 0) + 1
          };
          
          stateManager.update({
            points: nextPoints,
            shop: newShop
          });

          showSuccessToast("출석 보호권이 구매 완료되었습니다! 소지품에 보관 중입니다.");
          this.render();
        }
      });
    }

    // 2. 펫 꾸미기 선구매 슬롯 아이템 구매
    buyGearButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const state = stateManager.get();
        const gearName = btn.getAttribute("data-gear-name");
        const gearPrice = parseFloat(btn.getAttribute("data-gear-price"));

        if (state.points < gearPrice) {
          showAlert("포인트 부족", `${gearName} 장비를 구매하기 위한 포인트가 부족합니다.`);
          return;
        }

        const confirmPurchase = await showConfirm(
          "<i class='fa-solid fa-gift'></i> 펫 데코 장비 구매 확인",
          `정말로 <b>[${gearName}]</b>을 선구매하여 펫 보관함에 컬렉션으로 소장하시겠습니까?<br><br><b>소모 포인트: ${gearPrice} P</b>`
        );

        if (confirmPurchase) {
          const nextPoints = parseFloat((state.points - gearPrice).toFixed(2));
          const newSlots = [...state.shop.purchasedPetSlots, gearName];
          const newShop = {
            ...state.shop,
            purchasedPetSlots: newSlots
          };

          stateManager.update({
            points: nextPoints,
            shop: newShop
          });

          showSuccessToast(`펫 장비 [${gearName}] 소유권이 구매 등록되었습니다!`);
          this.render();
        }
      });
    });
  }
}

export default new ShopView();
