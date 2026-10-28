// Message the friends you've selected, from Make plans or from the Friends tab. Nothing is really sent in the demo.

const DEFAULT_MESSAGE = 'I\'m free tonight. Fancy doing something?';
const SOON_MESSAGE = 'Fancy doing something soon?';

let messageReturnTo = 'home'; // where this screen was opened from: 'home' (Make plans) or 'friends'

function openMessage(returnTo = 'home') {
  messageReturnTo = returnTo;
  const names = friendNames(selectedFriendIds);
  document.getElementById('message-sub').textContent = `To ${joinNames(names)}`;

  document.getElementById('message-content').innerHTML = `
    <label class="booking-heading message-label" for="message-text">Your message</label>
    <textarea class="message-box" id="message-text" rows="4" maxlength="280"></textarea>
    <p class="policy">They'll get a notification in rally!</p>
    <div class="sticky-bar">
      <button class="btn-primary" id="send-message">Send message</button>
    </div>
  `;
  document.getElementById('message-text').value = returnTo === 'home' ? DEFAULT_MESSAGE : SOON_MESSAGE;
  showScreen('message');
}

function sendMessage() {
  const text = document.getElementById('message-text').value.trim();
  if (!text) return;
  const names = joinNames(friendNames(selectedFriendIds));
  const fromFriends = messageReturnTo === 'friends';

  document.getElementById('message-content').innerHTML = `
    <div class="confirmed">
      <div class="confirmed-tick" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      </div>
      <h2 class="confirmed-title">Message sent</h2>
      <p class="confirmed-sub">${escapeHtml(names)} will get it as a notification</p>
      <div class="bubble"></div>
      ${fromFriends
        ? '<button class="btn-primary" id="message-later">Make plans for later</button>'
        : '<button class="btn-primary" id="message-book">Book an activity</button>'}
      <button class="btn-secondary btn-wide" id="message-done">${fromFriends ? 'Back to Friends' : 'Back to Make plans'}</button>
    </div>
  `;
  document.querySelector('#message-content .bubble').textContent = text;
}

// Leave the message screen and clear who was selected
function leaveMessage() {
  if (messageReturnTo === 'friends') {
    selectedFriendIds = [];
    renderFreeFriends();
    showScreen('friends');
  } else {
    goHome();
  }
}

document.getElementById('message-back').addEventListener('click', () => {
  if (messageReturnTo === 'friends') leaveMessage(); else showScreen('home');
});

document.getElementById('screen-message').addEventListener('click', (event) => {
  if (event.target.id === 'send-message') sendMessage();
  if (event.target.id === 'message-book') openActivities(selectedFriendIds);
  if (event.target.id === 'message-later') openLaterWith(selectedFriendIds);
  if (event.target.id === 'message-done') leaveMessage();
});
