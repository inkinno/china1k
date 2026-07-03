// ==========================================================================
// 프로필 설정 및 친구 관리 UI 컨트롤러 (Profile & Friends Controller)
// ==========================================================================
import stateManager from "../state.js";
import { showSuccessToast, showErrorToast, showInfoToast } from "./toast.js";

class ProfileController {
  constructor() {
    this.profileBtn = document.getElementById("profile-summary-btn");
    this.modal = document.getElementById("profile-friends-modal");
    this.closeBtn = document.getElementById("close-profile-modal-btn");
    
    this.tabBtns = document.querySelectorAll(".profile-tab-btn");
    this.contentProfile = document.getElementById("ptab-content-profile");
    this.contentFriends = document.getElementById("ptab-content-friends");

    this.copyUidBtn = document.getElementById("copy-uid-btn");
    this.searchInput = document.getElementById("friend-search-input");
    this.sendReqBtn = document.getElementById("send-friend-req-btn");
    
    this.reqListEl = document.getElementById("friend-requests-list");
    this.friendsListEl = document.getElementById("friends-list");
    this.reqCountEl = document.getElementById("req-count");
    this.friendsCountEl = document.getElementById("friends-count");
    this.matchFriendsToggle = document.getElementById("profile-match-friends-toggle");

    this.initEvents();
  }

  initEvents() {
    if (this.profileBtn) {
      this.profileBtn.style.cursor = "pointer";
      this.profileBtn.title = "클릭하여 프로필 및 친구 관리 열기";
      this.profileBtn.addEventListener("click", () => this.openModal());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeModal());
    }

    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // 탭 전환
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-ptab");
        this.switchTab(tab);
      });
    });

    // ID 복사
    if (this.copyUidBtn) {
      this.copyUidBtn.addEventListener("click", () => {
        const uidEl = document.getElementById("modal-user-uid");
        if (uidEl && navigator.clipboard) {
          navigator.clipboard.writeText(uidEl.textContent).then(() => {
            showSuccessToast("내 ID가 클립보드에 복사되었습니다!");
          });
        }
      });
    }

    // 친구 신청 발송
    if (this.sendReqBtn && this.searchInput) {
      this.sendReqBtn.addEventListener("click", () => this.sendFriendRequest());
      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendFriendRequest();
      });
    }

    // 리그 매칭 친구 동반 여부 설정 토글
    if (this.matchFriendsToggle) {
      this.matchFriendsToggle.addEventListener("change", (e) => {
        const state = stateManager.get();
        const settings = { ...(state.settings || {}) };
        settings.matchWithFriends = e.target.checked;
        stateManager.update({ settings });
        showInfoToast(`리그 매칭 시 내 친구 방 배정 설정이 [${e.target.checked ? 'ON(동반 경쟁)' : 'OFF(독립 방 매칭)'}]로 변경되었습니다.`);
      });
    }
  }

  openModal() {
    if (!this.modal) return;
    this.updateProfileData();
    this.renderFriends();
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
  }

  switchTab(tabName) {
    this.tabBtns.forEach(btn => {
      if (btn.getAttribute("data-ptab") === tabName) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    if (tabName === "profile") {
      this.contentProfile.classList.remove("hidden");
      this.contentFriends.classList.add("hidden");
    } else {
      this.contentProfile.classList.add("hidden");
      this.contentFriends.classList.remove("hidden");
      this.renderFriends();
    }
  }

  updateProfileData() {
    const state = stateManager.get();
    const user = state.user;

    const avatarEl = document.getElementById("modal-user-avatar");
    const nameEl = document.getElementById("modal-user-name");
    const uidEl = document.getElementById("modal-user-uid");
    const pointsEl = document.getElementById("modal-stat-points");
    const streakEl = document.getElementById("modal-stat-streak");
    const badgesEl = document.getElementById("modal-stat-badges");

    if (avatarEl) {
      avatarEl.src = user?.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user?.uid || 'china1k'}`;
    }
    if (nameEl) {
      nameEl.textContent = user?.displayName || "천자문 학도";
    }
    if (uidEl) {
      uidEl.textContent = user?.uid || "LOCAL_USER_" + Math.floor(Math.random() * 8999 + 1000);
    }
    if (pointsEl) pointsEl.textContent = `${(state.points || 0).toFixed(1)} P`;
    if (streakEl) streakEl.textContent = `${state.streak || 0}일`;
    if (badgesEl) badgesEl.textContent = `${state.badges?.length || 0}개`;

    if (this.matchFriendsToggle) {
      const matchSetting = state.settings?.matchWithFriends !== undefined ? state.settings.matchWithFriends : true;
      this.matchFriendsToggle.checked = matchSetting;
    }
  }

  sendFriendRequest() {
    const query = this.searchInput.value.trim();
    if (!query) {
      showErrorToast("친구의 ID 또는 닉네임을 입력해주세요!");
      this.searchInput.focus();
      return;
    }

    const state = stateManager.get();
    const myUid = document.getElementById("modal-user-uid")?.textContent || "LOCAL_USER";

    if (query === myUid) {
      showErrorToast("자기 자신에게는 친구 신청을 보낼 수 없습니다.");
      return;
    }

    const friends = state.friends || [];
    if (friends.some(f => f.uid === query || f.name === query)) {
      showErrorToast("이미 친구로 등록된 학도입니다.");
      return;
    }

    // 모의 친구 신청 승인 처리 (데모/테스트 환경에서 실시간 반응 제공)
    const newFriend = {
      uid: query.startsWith("user_") || query.length > 8 ? query : `user_${Math.floor(Math.random()*89999+10000)}`,
      name: query,
      points: parseFloat((Math.random() * 150 + 10).toFixed(1)),
      streak: Math.floor(Math.random() * 14 + 1),
      league: Math.random() > 0.5 ? "실버 리그" : "골드 리그"
    };

    const updatedFriends = [...friends, newFriend];
    stateManager.update({ friends: updatedFriends });
    
    this.searchInput.value = "";
    showSuccessToast(`'${query}' 학도님과 성공적으로 친구를 맺었습니다!`);
    this.renderFriends();
  }

  acceptRequest(index) {
    const state = stateManager.get();
    const reqs = [...(state.friendRequests || [])];
    const friends = [...(state.friends || [])];

    if (!reqs[index]) return;
    const accepted = reqs.splice(index, 1)[0];

    const newFriend = {
      uid: accepted.uid || `user_${Math.floor(Math.random()*89999+10000)}`,
      name: accepted.name || "신입 학도",
      points: 50.0,
      streak: 3,
      league: "브론즈 리그"
    };

    stateManager.update({
      friendRequests: reqs,
      friends: [...friends, newFriend]
    });

    showSuccessToast(`'${newFriend.name}' 학도의 친구 신청을 수락했습니다!`);
    this.renderFriends();
  }

  rejectRequest(index) {
    const state = stateManager.get();
    const reqs = [...(state.friendRequests || [])];
    if (!reqs[index]) return;

    const rejected = reqs.splice(index, 1)[0];
    stateManager.update({ friendRequests: reqs });
    showInfoToast(`'${rejected.name}' 학도의 신청을 거절했습니다.`);
    this.renderFriends();
  }

  removeFriend(index) {
    const state = stateManager.get();
    const friends = [...(state.friends || [])];
    if (!friends[index]) return;

    const target = friends[index];
    if (confirm(`'${target.name}' 학도를 친구 목록에서 삭제하시겠습니까?`)) {
      friends.splice(index, 1);
      stateManager.update({ friends });
      showInfoToast("친구 삭제가 완료되었습니다.");
      this.renderFriends();
    }
  }

  renderFriends() {
    const state = stateManager.get();
    const reqs = state.friendRequests || [];
    const friends = state.friends || [];

    if (this.reqCountEl) this.reqCountEl.textContent = reqs.length;
    if (this.friendsCountEl) this.friendsCountEl.textContent = friends.length;

    // 받은 신청 목록 렌더링
    if (this.reqListEl) {
      if (reqs.length === 0) {
        this.reqListEl.innerHTML = `<div style="text-align:center; padding: 14px; color: var(--text-muted); font-size: 12px; background: rgba(0,0,0,0.2); border-radius: 10px;">받은 친구 신청이 없습니다.</div>`;
      } else {
        this.reqListEl.innerHTML = reqs.map((req, idx) => `
          <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); padding: 10px 14px; border-radius: 12px;">
            <div style="display:flex; align-items:center; gap: 10px;">
              <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${req.uid || req.name}" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--gold);">
              <div>
                <div style="font-size: 13.5px; font-weight: 800; color: #FFF;">${req.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">ID: ${req.uid || 'N/A'}</div>
              </div>
            </div>
            <div style="display:flex; gap: 6px;">
              <button class="accept-btn" data-idx="${idx}" style="padding: 6px 12px; border-radius: 8px; background: var(--success); color: #FFF; font-size: 12px; font-weight: 800; border: none; cursor: pointer;"><i class="fa-solid fa-check"></i> 수락</button>
              <button class="reject-btn" data-idx="${idx}" style="padding: 6px 10px; border-radius: 8px; background: rgba(239,68,68,0.2); color: var(--error); font-size: 12px; font-weight: 700; border: 1px solid var(--error); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
        `).join("");

        this.reqListEl.querySelectorAll(".accept-btn").forEach(btn => {
          btn.addEventListener("click", () => this.acceptRequest(parseInt(btn.getAttribute("data-idx"))));
        });
        this.reqListEl.querySelectorAll(".reject-btn").forEach(btn => {
          btn.addEventListener("click", () => this.rejectRequest(parseInt(btn.getAttribute("data-idx"))));
        });
      }
    }

    // 내 친구 목록 렌더링
    if (this.friendsListEl) {
      if (friends.length === 0) {
        this.friendsListEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 12.5px; background: rgba(0,0,0,0.2); border-radius: 10px;">등록된 친구가 없습니다. 위 검색창에서 친구를 추가해 보세요!</div>`;
      } else {
        this.friendsListEl.innerHTML = friends.map((f, idx) => `
          <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(15,23,42,0.6); border: 1px solid var(--border-glass); padding: 12px 14px; border-radius: 14px; transition: var(--transition-smooth);">
            <div style="display:flex; align-items:center; gap: 12px;">
              <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${f.uid || f.name}" style="width: 42px; height: 42px; border-radius: 50%; border: 2px solid var(--secondary); background: rgba(0,0,0,0.3);">
              <div>
                <div style="display:flex; align-items:center; gap: 6px;">
                  <span style="font-size: 14px; font-weight: 800; color: #FFF;">${f.name}</span>
                  <span style="font-size: 10.5px; background: rgba(0,242,254,0.15); color: var(--primary); padding: 2px 6px; border-radius: 6px; font-weight: 700;">${f.league || '브론즈 리그'}</span>
                </div>
                <div style="display:flex; align-items:center; gap: 10px; font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
                  <span><i class="fa-solid fa-coins" style="color: var(--gold);"></i> ${f.points || 0} P</span>
                  <span><i class="fa-solid fa-fire" style="color: #F97316;"></i> ${f.streak || 0}일</span>
                </div>
              </div>
            </div>
            <button class="remove-friend-btn" data-idx="${idx}" title="친구 삭제" style="background: none; border: none; color: var(--text-muted); font-size: 14px; cursor: pointer; padding: 6px; transition: var(--transition-smooth);"><i class="fa-solid fa-user-xmark"></i></button>
          </div>
        `).join("");

        this.friendsListEl.querySelectorAll(".remove-friend-btn").forEach(btn => {
          btn.addEventListener("click", () => this.removeFriend(parseInt(btn.getAttribute("data-idx"))));
        });
      }
    }
  }
}

const profileController = new ProfileController();
export default profileController;
