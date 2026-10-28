// Make plans for later, part two: share your free times, then ask your friends.

let calendarConnected = false;  // stays connected for the rest of the demo
const laterPlans = [];          // requests you've sent, used later by the results screen
let availabilityStep = 'permission'; // 'permission', 'loading' or 'slots'

const SLOT_ORDER = ['morning', 'afternoon', 'evening'];

function shortDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Every day in the window that matches Weekends, Weekdays or Any day
function daysInWindow() {
  if (later.mode === 'date') return [dateFromIso(later.date)];
  const start = later.months[later.fromMonth].start;
  const lastMonth = later.months[later.toMonth].start;
  const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  const days = [];
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const weekday = day.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    if (later.days === 'any' || (later.days === 'weekends' ? isWeekend : !isWeekend)) days.push(new Date(day));
  }
  return days;
}

// Pretend calendar: some slots are busy. It's the same every time, so the demo is repeatable.
function isBusy(date, slot) {
  return (date.getDate() * 3 + date.getMonth() * 5 + SLOT_ORDER.indexOf(slot) * 7) % 4 === 0;
}

function freeTimes() {
  return daysInWindow()
    .map((date) => ({
      date,
      key: dateKey(date),
      slots: SLOT_ORDER.filter((slot) => later.slots.includes(slot) && !isBusy(date, slot)),
    }))
    .filter((day) => day.slots.length > 0);
}

function allShareKeys() {
  return freeTimes().flatMap((day) => day.slots.map((slot) => `${day.key}|${slot}`));
}

// ---------- Your availability ----------
function openAvailability() {
  availabilityStep = calendarConnected ? 'slots' : 'permission';
  if (calendarConnected) later.shared = allShareKeys();
  renderAvailability();
  showScreen('later-availability');
}

function renderAvailability() {
  const content = document.getElementById('later-availability-content');

  if (availabilityStep === 'permission') {
    content.innerHTML = `
      <div class="confirmed permission">
        <div class="confirmed-tick" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>
        </div>
        <h2 class="confirmed-title">Connect your calendar</h2>
        <p class="confirmed-sub">We'll find the times you're free in your window, so you don't have to.</p>
        <p class="permission-note">Your calendar stays private. Friends only see the times you choose to share.</p>
        <button class="btn-primary" id="connect-calendar">Connect calendar</button>
      </div>`;
    return;
  }

  if (availabilityStep === 'loading') {
    content.innerHTML = `
      <div class="confirmed permission">
        <div class="spinner" aria-hidden="true"></div>
        <h2 class="confirmed-title">Checking your calendar</h2>
        <p class="confirmed-sub">${later.mode === 'date'
          ? `Looking for free times on ${escapeHtml(shortDate(dateFromIso(later.date)))}`
          : `Looking for free times between ${escapeHtml(later.months[later.fromMonth].label)} and ${escapeHtml(later.months[later.toMonth].label)}`}</p>
      </div>`;
    return;
  }

  const days = freeTimes();
  const shared = later.shared.length;
  const allShared = shared === allShareKeys().length;
  let currentMonth = '';

  content.innerHTML = `
    <p class="availability-intro">${escapeHtml(windowSentence())} Choose the times you want to share.</p>
    <div class="plan-card-sub share-header">
      <p aria-live="polite">${shared === 1 ? '1 time shared' : `${shared} times shared`}</p>
      <button class="text-btn" id="share-all">${allShared ? 'Clear' : 'Share all'}</button>
    </div>

    ${days.map((day) => {
      const month = day.date.toLocaleDateString('en-GB', { month: 'long' });
      const heading = month === currentMonth ? '' : `<h2 class="booking-heading month-heading">${month}</h2>`;
      currentMonth = month;
      return `
        ${heading}
        <div class="day-row">
          <p class="day-label">${shortDate(day.date)}</p>
          <div class="chip-row chip-wrap">
            ${day.slots.map((slot) => `
              <button class="chip" data-share="${day.key}|${slot}" aria-pressed="${later.shared.includes(`${day.key}|${slot}`)}">${SLOT_LABELS[slot]}</button>`).join('')}
          </div>
        </div>`;
    }).join('')}

    <p class="policy">Your calendar stays private. Friends only see the times you share.</p>

    ${shared === 0 ? '' : `
      <div class="sticky-bar">
        <button class="btn-primary" id="availability-next">Continue · ${shared === 1 ? '1 time' : `${shared} times`}</button>
      </div>`}
  `;
}

document.getElementById('screen-later-availability').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-share]');
  if (chip) {
    const key = chip.dataset.share;
    later.shared = later.shared.includes(key) ? later.shared.filter((k) => k !== key) : [...later.shared, key];
    renderAvailability();
  } else if (event.target.id === 'share-all') {
    later.shared = later.shared.length === allShareKeys().length ? [] : allShareKeys();
    renderAvailability();
  } else if (event.target.id === 'connect-calendar') {
    availabilityStep = 'loading';
    renderAvailability();
    setTimeout(() => {
      calendarConnected = true;
      later.shared = allShareKeys();
      availabilityStep = 'slots';
      if (isScreenActive('later-availability')) renderAvailability();
    }, 1500);
  } else if (event.target.id === 'availability-next') {
    openAsk();
  }
});

document.getElementById('later-availability-back').addEventListener('click', () => showScreen('later-when'));

// ---------- Ask friends ----------
function requestText() {
  const replyBy = `Reply by ${deadlineDate(later.deadlineDays)}.`;
  if (later.mode === 'date') {
    const times = timesText();
    return `Matt wants to meet up on ${shortDate(dateFromIso(later.date))}${times ? `, ${times}` : ''}. Are you free? ${replyBy}`;
  }
  return `Matt wants to find ${withArticle(planNoun())} to meet up. When are you free? ${replyBy}`;
}

function openAsk() {
  const names = friendNames(later.friendIds);
  document.getElementById('later-ask-sub').textContent =
    names.length <= 3 ? `With ${joinNames(names)}` : `With ${names.length} friends`;

  document.getElementById('later-ask-content').innerHTML = `
    <h2 class="booking-heading">What ${names.length <= 3 ? escapeHtml(joinNames(names)) : 'they'} will see</h2>
    <div class="card notification">
      <p class="notification-app">rally!</p>
      <p class="notification-text">${escapeHtml(requestText())}</p>
      <p class="notification-detail">${escapeHtml(windowSentence())}</p>
    </div>

    <p class="policy">You're sharing ${later.shared.length === 1 ? '1 time' : `${later.shared.length} times`}. Your calendar stays private.</p>

    <div class="sticky-bar">
      <button class="btn-primary" id="send-request">Send request</button>
    </div>
  `;
  showScreen('later-ask');
}

function sendRequest() {
  const names = joinNames(friendNames(later.friendIds));
  const record = {
    id: laterPlans.length,
    friendIds: [...later.friendIds],
    window: windowSentence(),
    mode: later.mode,
    days: later.days,
    slots: [...later.slots],
    deadline: deadlineDate(later.deadlineDays),
    shared: [...later.shared],
    replies: Object.fromEntries(later.friendIds.map((id) => [id, 'waiting'])),
    selectedKey: null,
    pickedKey: null,
  };
  laterPlans.push(record);
  startLaterReplies(record);

  document.getElementById('later-ask-sub').textContent = '';
  document.getElementById('later-ask-content').innerHTML = `
    <div class="confirmed">
      <div class="confirmed-tick" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      </div>
      <h2 class="confirmed-title">Request sent</h2>
      <p class="confirmed-sub">${escapeHtml(names)} will get it as a notification</p>
      <p class="policy">They have until ${escapeHtml(deadlineDate(later.deadlineDays))} to reply.</p>
      <button class="btn-primary" id="later-sent-replies">See replies</button>
      <button class="btn-secondary btn-wide" id="later-sent-done">Back to Make plans</button>
    </div>`;
}

document.getElementById('screen-later-ask').addEventListener('click', (event) => {
  if (event.target.id === 'send-request') sendRequest();
  if (event.target.id === 'later-sent-replies') openLaterResults(laterPlans[laterPlans.length - 1]);
  if (event.target.id === 'later-sent-done') goHome();
});

document.getElementById('later-ask-back').addEventListener('click', () => showScreen('later-availability'));
