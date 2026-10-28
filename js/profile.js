// Profile: your calendar, your linked card, who can see you're free, and notifications.

const VISIBILITY_OPTIONS = ['👥 All friends', '⭐ Close friends', '🎓 Uni friends', '💼 Work lot'];

const settings = {
  visibility: VISIBILITY_OPTIONS[0], // who can see that you're free
  notifyReplies: true,               // show a note when a friend replies
};

let calendarConnecting = false;

// ---------- Who can see I'm free: shared with the dropdown on Make plans ----------
const homeVisibility = document.getElementById('visibility');
homeVisibility.innerHTML = VISIBILITY_OPTIONS.map((option) => `<option>${option}</option>`).join('');
homeVisibility.value = settings.visibility;
homeVisibility.addEventListener('change', () => {
  settings.visibility = homeVisibility.value;
});

// ---------- The Profile screen ----------
function renderProfile() {
  const connected = calendarConnected;

  const calendarCard = calendarConnecting ? `
    <div class="card profile-card">
      <div class="calendar-status"><span class="spinner spinner-sm" aria-hidden="true"></span><h2 class="setting-title">Connecting your calendar</h2></div>
      <p class="setting-note">This only takes a moment.</p>
    </div>` : `
    <div class="card profile-card">
      <div class="calendar-status">
        <span class="status-dot ${connected ? 'is-on' : ''}" aria-hidden="true"></span>
        <h2 class="setting-title">${connected ? 'Calendar connected' : 'Calendar not connected'}</h2>
      </div>
      <p class="setting-note">${connected
        ? 'We use it to suggest the times you\'re free. Friends only see the times you choose to share. Your calendar stays private.'
        : 'Connect it and we\'ll suggest the times you\'re free when you make plans.'}</p>
      ${connected
        ? '<button class="btn-secondary btn-wide" id="disconnect-calendar">Disconnect calendar</button>'
        : '<button class="btn-primary btn-wide" id="connect-calendar-profile">Connect calendar</button>'}
    </div>`;

  document.getElementById('profile-content').innerHTML = `
    <div class="profile-head">
      <span class="avatar avatar-lg avatar-you" aria-hidden="true">M</span>
      <div>
        <h2 class="profile-name">Matt</h2>
        <p class="profile-place">Manchester</p>
      </div>
    </div>

    <h2 class="booking-heading">Calendar</h2>
    ${calendarCard}

    <h2 class="booking-heading">Payment</h2>
    <div class="card profile-card">
      <div class="setting-row">
        <span class="setting-title">Visa ending 4242</span>
        <span class="reply-pill is-in">Linked</span>
      </div>
      <p class="setting-note">You and your friends each pay your own share with the card linked to your account.</p>
    </div>

    <h2 class="booking-heading">Privacy</h2>
    <div class="card profile-card">
      <label class="setting-row" for="profile-visibility">
        <span class="setting-title">Who can see I'm free</span>
      </label>
      <select class="select-pill setting-select" id="profile-visibility">
        ${VISIBILITY_OPTIONS.map((option) => `<option ${option === settings.visibility ? 'selected' : ''}>${option}</option>`).join('')}
      </select>
    </div>

    <h2 class="booking-heading">Notifications</h2>
    <div class="card profile-card">
      <div class="setting-row">
        <span class="setting-title" id="notify-label">When a friend replies</span>
        <button class="switch" id="notify-replies" role="switch" aria-checked="${settings.notifyReplies}" aria-labelledby="notify-label">
          <span class="switch-knob"></span>
        </button>
      </div>
    </div>

    <h2 class="booking-heading">Demo</h2>
    <div class="card profile-card">
      <p class="setting-note setting-note-first">Prices, bookings and availability in this prototype are made up. Reset clears your plans and starts again.</p>
      <button class="btn-secondary btn-wide" id="reset-demo">Reset demo</button>
      <p class="setting-note">To show what happens once the deadline for changing a booking has passed, you can skip ahead to it.</p>
      <button class="btn-secondary btn-wide" id="skip-deadline">Skip to change deadline</button>
    </div>
  `;
}

document.getElementById('profile-content').addEventListener('click', (event) => {
  const id = event.target.closest('[id]')?.id;

  if (id === 'connect-calendar-profile') {
    calendarConnecting = true;
    renderProfile();
    setTimeout(() => {
      calendarConnecting = false;
      calendarConnected = true;
      if (isScreenActive('profile')) renderProfile();
      showToast('Calendar connected');
    }, 1500);
  } else if (id === 'disconnect-calendar') {
    calendarConnected = false;
    renderProfile();
  } else if (id === 'notify-replies') {
    settings.notifyReplies = !settings.notifyReplies;
    renderProfile();
  } else if (id === 'skip-deadline') {
    bookings.forEach((record) => { record.locked = true; });
    showToast(bookings.length ? 'Change deadline passed. Bookings are locked' : 'No bookings to lock yet');
  } else if (id === 'reset-demo') {
    location.reload(); // everything lives in memory, so a reload is a clean start
  }
});

document.getElementById('profile-content').addEventListener('change', (event) => {
  if (event.target.id === 'profile-visibility') {
    settings.visibility = event.target.value;
    homeVisibility.value = settings.visibility;
  }
});
