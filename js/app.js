// Switches between the four main screens when you tap the bottom navigation.
const tabs = document.querySelectorAll('.tab');
const screens = document.querySelectorAll('.screen');

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle('is-active', screen.id === `screen-${name}`);
  });
  tabs.forEach((tab) => {
    const isActive = tab.dataset.target === name;
    tab.classList.toggle('is-active', isActive);
    if (isActive) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  // Flow screens (like picking an activity) hide the bottom bar so you stay focused
  const target = document.getElementById(`screen-${name}`);
  document.querySelector('.phone').classList.toggle('is-flow', target.hasAttribute('data-flow'));
  document.querySelector('.screens').scrollTop = 0;
  if (name === 'plans') renderPlans();
  if (name === 'friends') renderFriends();
  if (name === 'profile') renderProfile();
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => showScreen(tab.dataset.target));
});

// ---------- Shared helpers ----------
// "Priya", "Priya and Josh", "Priya, Josh and Chloe"
function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// The friend's photo, laid over their initial. If the file is missing it removes itself and the initial shows.
function avatarPhoto(friend) {
  return `<img class="avatar-photo" src="images/people/${friend.id}.jpg" alt="" onerror="this.remove()">`;
}

function friendNames(ids) {
  return ids.map((id) => friends.find((friend) => friend.id === id).name);
}

let toastTimer;
function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

// ---------- Make plans: tonight ----------
let selectedFriendIds = []; // the free friends you've tapped, in the order you tapped them

function renderFreeFriends() {
  const free = friends.filter((friend) => friend.freeTonight);
  const allSelected = free.length > 0 && selectedFriendIds.length === free.length;
  const count = selectedFriendIds.length;

  document.getElementById('select-all').textContent = allSelected ? 'Clear' : 'Select all';
  const sticker = document.getElementById('free-sticker');
  sticker.textContent = `${free.length} free!`;
  sticker.hidden = free.length === 0;

  document.getElementById('free-friends-row').innerHTML = free.map((friend, index) => `
    <li>
      <button class="friend" data-friend="${friend.id}" aria-pressed="${selectedFriendIds.includes(friend.id)}">
        <span class="avatar tone-${(index % 3) + 1}">
          ${friend.name[0]}
          ${avatarPhoto(friend)}
          <span class="avatar-dot" aria-hidden="true"></span>
          <span class="avatar-check" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m6 12.5 4 4 8-9"/></svg>
          </span>
        </span>
        <span>${friend.name}</span>
      </button>
    </li>
  `).join('');

  document.getElementById('select-hint').textContent =
    count === 0 ? 'Tap who you want to see' : `${joinNames(friendNames(selectedFriendIds))} selected`;
  document.getElementById('message-btn').disabled = count === 0;
  document.getElementById('book-btn').disabled = count === 0;
}

function toggleFriend(id) {
  selectedFriendIds = selectedFriendIds.includes(id)
    ? selectedFriendIds.filter((selectedId) => selectedId !== id)
    : [...selectedFriendIds, id];
  renderFreeFriends();
}

document.getElementById('free-friends-row').addEventListener('click', (event) => {
  const button = event.target.closest('[data-friend]');
  if (button) toggleFriend(button.dataset.friend);
});

document.getElementById('select-all').addEventListener('click', () => {
  const free = friends.filter((friend) => friend.freeTonight).map((friend) => friend.id);
  selectedFriendIds = selectedFriendIds.length === free.length ? [] : free;
  renderFreeFriends();
});

document.getElementById('message-btn').addEventListener('click', () => openMessage());
document.getElementById('book-btn').addEventListener('click', () => openActivities(selectedFriendIds));

document.getElementById('plan-later').addEventListener('click', () => openLater());

// Back to Make plans at the end of a flow, with nobody selected
function goHome() {
  selectedFriendIds = [];
  renderFreeFriends();
  showScreen('home');
}

renderFreeFriends();

// ---------- Make plans: your status ----------
const statusCard = document.getElementById('status-card');
const freeTonightSwitch = document.getElementById('free-tonight');

freeTonightSwitch.addEventListener('click', () => {
  const isOn = freeTonightSwitch.getAttribute('aria-checked') !== 'true';
  freeTonightSwitch.setAttribute('aria-checked', String(isOn));
  statusCard.classList.toggle('is-free', isOn);
});
