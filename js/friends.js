// Friends tab: your groups and friends. Open one to message them or make plans.

let expandedGroup = null;
let expandedFriendId = null;

// Starts "Make plans for later" with these friends already chosen
function openLaterWith(friendIds) {
  openLater();
  later.friendIds = [...friendIds];
  later.from = 'friends';
  renderLaterWho();
}

function avatarWithPhoto(friend, extraClass = '') {
  return `<span class="avatar ${extraClass}">${friend.name[0]}${avatarPhoto(friend)}${friend.freeTonight && extraClass.includes('avatar-md') ? '<span class="avatar-dot" aria-hidden="true"></span>' : ''}</span>`;
}

function renderFriends() {
  const freeCount = friends.filter((friend) => friend.freeTonight).length;

  const groupCards = groups.map((group) => {
    const members = membersOf(group);
    const freeMembers = members.filter((member) => member.freeTonight).length;
    const open = expandedGroup === group;
    return `
      <article class="card friend-group">
        <button class="friend-group-head" data-group-toggle="${escapeHtml(group)}" aria-expanded="${open}">
          <span class="group-emoji" aria-hidden="true">${groupEmoji[group]}</span>
          <span class="group-text">
            <span class="group-name">${escapeHtml(group)}</span>
            <span class="group-members">${members.length} friends${freeMembers ? ` · ${freeMembers} free tonight` : ''}</span>
          </span>
          <span class="chevron" aria-hidden="true"></span>
        </button>
        ${open ? `
          <ul class="member-list">
            ${members.map((member) => `
              <li class="member">
                ${avatarWithPhoto(member, 'avatar-sm')}
                <span class="member-name">${escapeHtml(member.name)}</span>
                ${member.freeTonight ? '<span class="free-tag">Free tonight</span>' : ''}
              </li>`).join('')}
          </ul>
          <button class="btn-primary btn-wide" data-group-plan="${escapeHtml(group)}">Make plans with ${escapeHtml(group)}</button>` : ''}
      </article>`;
  }).join('');

  // Friends who are free tonight come first
  const ordered = [...friends].sort((a, b) => Number(b.freeTonight) - Number(a.freeTonight));
  const friendRows = ordered.map((friend) => {
    const open = expandedFriendId === friend.id;
    return `
      <div class="friend-item">
        <button class="friend-row" data-friend-toggle="${friend.id}" aria-expanded="${open}">
          ${avatarWithPhoto(friend, 'avatar-md')}
          <span class="friend-text">
            <span class="friend-name">${escapeHtml(friend.name)}</span>
            <span class="friend-sub">${friend.freeTonight ? '<span class="free-tag">Free tonight</span>' : escapeHtml(friend.groups.join(', '))}</span>
          </span>
          <span class="chevron" aria-hidden="true"></span>
        </button>
        ${open ? `
          <div class="friend-actions">
            <button class="btn-secondary" data-friend-message="${friend.id}">Message</button>
            <button class="btn-primary" data-friend-plan="${friend.id}">Make plans</button>
          </div>` : ''}
      </div>`;
  }).join('');

  document.getElementById('friends-content').innerHTML = `
    <p class="friends-sub">${friends.length} friends · ${freeCount} free tonight</p>

    <h2 class="booking-heading">Groups</h2>
    <div class="friend-groups">${groupCards}</div>

    <h2 class="booking-heading">Friends</h2>
    <div class="friend-list">${friendRows}</div>
  `;
}

document.getElementById('friends-content').addEventListener('click', (event) => {
  const groupToggle = event.target.closest('[data-group-toggle]');
  const groupPlan = event.target.closest('[data-group-plan]');
  const friendToggle = event.target.closest('[data-friend-toggle]');
  const friendMessage = event.target.closest('[data-friend-message]');
  const friendPlan = event.target.closest('[data-friend-plan]');

  if (groupToggle) {
    expandedGroup = expandedGroup === groupToggle.dataset.groupToggle ? null : groupToggle.dataset.groupToggle;
    renderFriends();
  } else if (groupPlan) {
    openLaterWith(membersOf(groupPlan.dataset.groupPlan).map((member) => member.id));
  } else if (friendToggle) {
    expandedFriendId = expandedFriendId === friendToggle.dataset.friendToggle ? null : friendToggle.dataset.friendToggle;
    renderFriends();
  } else if (friendMessage) {
    selectedFriendIds = [friendMessage.dataset.friendMessage];
    renderFreeFriends();
    openMessage('friends');
  } else if (friendPlan) {
    const friend = friends.find((f) => f.id === friendPlan.dataset.friendPlan);
    if (friend.freeTonight) {
      // They're free tonight, so go straight to choosing an activity
      selectedFriendIds = [friend.id];
      renderFreeFriends();
      openActivities([friend.id], { type: 'tonight', from: 'friends' });
    } else {
      openLaterWith([friend.id]);
    }
  }
});
