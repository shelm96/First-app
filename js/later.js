// Make plans for later: choose who, then a window of dates and a reply deadline.

const SLOT_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };
const DAY_OPTIONS = [
  { value: 'weekends', label: 'Weekends', phrase: 'A weekend' },
  { value: 'weekdays', label: 'Weekdays', phrase: 'A weekday' },
  { value: 'any', label: 'Any day', phrase: 'A day' },
];
const MONTHS_TO_OFFER = 6;
const DEADLINE_DAYS_TO_OFFER = 6;

const later = {
  friendIds: [],
  months: [],        // the months you can choose from, starting next month
  fromMonth: 0,      // positions in the months list
  toMonth: 1,
  from: 'home',     // where it was started: 'home' (Make plans) or 'friends'
  mode: 'flexible', // 'flexible' (a vague plan) or 'date' (a specific date)
  days: 'weekends',
  slots: ['morning', 'afternoon', 'evening'],
  date: '',          // the specific date, as "2026-11-14"
  fineTune: false,   // whether the days and times chips are showing
  deadlineDays: 3,   // days from today
  shared: [],        // the free times you've chosen to share, as "date|slot"
};

const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4 8-9"/></svg>';

function monthLabel(date) {
  const name = date.toLocaleDateString('en-GB', { month: 'long' });
  return date.getFullYear() === new Date().getFullYear() ? name : `${name} ${date.getFullYear()}`;
}

function buildMonths() {
  const today = new Date();
  return Array.from({ length: MONTHS_TO_OFFER }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() + 1 + i, 1);
    return { label: monthLabel(date), start: date };
  });
}

function deadlineDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function joinWith(items, lastWord) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${lastWord} ${items[items.length - 1]}`;
}

function membersOf(group) {
  return friends.filter((friend) => friend.groups.includes(group));
}

function openLater() {
  later.friendIds = [];
  later.months = buildMonths();
  later.fromMonth = 0;
  later.toMonth = 1;
  later.from = 'home';
  later.mode = 'flexible';
  later.days = 'weekends';
  later.slots = ['morning', 'afternoon', 'evening'];
  later.date = '';
  later.fineTune = false;
  later.deadlineDays = 3;
  renderLaterWho();
  showScreen('later-who');
}

// ---------- Step 1: who ----------
function renderLaterWho() {
  const count = later.friendIds.length;

  document.getElementById('later-who-content').innerHTML = `
    <h2 class="booking-heading">Groups</h2>
    <div class="group-list">
      ${groups.map((group) => {
        const members = membersOf(group);
        const allIn = members.every((m) => later.friendIds.includes(m.id));
        return `
          <button class="group-card" data-group="${escapeHtml(group)}" aria-pressed="${allIn}">
            <span class="group-emoji" aria-hidden="true">${groupEmoji[group]}</span>
            <span class="group-text">
              <span class="group-name">${escapeHtml(group)}</span>
              <span class="group-members">${escapeHtml(joinNames(members.map((m) => m.name)))}</span>
            </span>
            <span class="person-check">${checkIcon}</span>
          </button>`;
      }).join('')}
    </div>

    <h2 class="booking-heading">Friends</h2>
    <div class="person-list">
      ${friends.map((friend) => `
        <button class="person-row" data-friend="${friend.id}" aria-pressed="${later.friendIds.includes(friend.id)}">
          <span class="avatar avatar-sm">${friend.name[0]}${avatarPhoto(friend)}</span>
          <span class="person-name">${escapeHtml(friend.name)}</span>
          <span class="person-check">${checkIcon}</span>
        </button>`).join('')}
    </div>

    ${count === 0 ? '' : `
      <div class="sticky-bar">
        <button class="btn-primary" id="later-who-next">Continue · ${pluralise(count, 'friend', 'friends')}</button>
      </div>`}
  `;
}

function toggleLaterGroup(group) {
  const memberIds = membersOf(group).map((m) => m.id);
  const allIn = memberIds.every((id) => later.friendIds.includes(id));
  later.friendIds = allIn
    ? later.friendIds.filter((id) => !memberIds.includes(id))
    : [...new Set([...later.friendIds, ...memberIds])];
}

document.getElementById('screen-later-who').addEventListener('click', (event) => {
  const group = event.target.closest('[data-group]');
  const person = event.target.closest('[data-friend]');
  if (group) {
    toggleLaterGroup(group.dataset.group);
    renderLaterWho();
  } else if (person) {
    const id = person.dataset.friend;
    later.friendIds = later.friendIds.includes(id) ? later.friendIds.filter((x) => x !== id) : [...later.friendIds, id];
    renderLaterWho();
  } else if (event.target.id === 'later-who-next') {
    renderLaterWhen();
    showScreen('later-when');
  }
});

document.getElementById('later-who-back').addEventListener('click', () => showScreen(later.from));

// ---------- Step 2: when ----------
const ALL_SLOTS = ['morning', 'afternoon', 'evening'];
const MIN_DAYS_AHEAD_FOR_DATE = 3; // so friends have time to reply before a specific date

// Ready-made vague plans. Each one sets the days and times.
const PLAN_PRESETS = [
  { label: 'A weekend', days: 'weekends', slots: ALL_SLOTS },
  { label: 'A weekend morning', days: 'weekends', slots: ['morning'] },
  { label: 'A weekend afternoon', days: 'weekends', slots: ['afternoon'] },
  { label: 'A weekend evening', days: 'weekends', slots: ['evening'] },
  { label: 'A weekday evening', days: 'weekdays', slots: ['evening'] },
  { label: 'Any evening', days: 'any', slots: ['evening'] },
  { label: 'Whenever', days: 'any', slots: ALL_SLOTS },
];

function sameSlots(a, b) {
  return a.length === b.length && a.every((slot) => b.includes(slot));
}

function presetIsSelected(preset) {
  return later.days === preset.days && sameSlots(later.slots, preset.slots);
}

function isoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateFromIso(iso) {
  return new Date(`${iso}T00:00:00`);
}

function earliestDate() {
  const date = new Date();
  date.setDate(date.getDate() + MIN_DAYS_AHEAD_FOR_DATE);
  return date;
}

function daysUntilDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((dateFromIso(later.date) - today) / 86400000);
}

function withArticle(phrase) {
  return /^[aeiou]/i.test(phrase) ? `an ${phrase}` : `a ${phrase}`;
}

// "morning", "afternoon or evening", or nothing if it could be any time
function timesText() {
  if (later.slots.length === ALL_SLOTS.length) return '';
  return joinWith(ALL_SLOTS.filter((slot) => later.slots.includes(slot)), 'or');
}

// "weekend morning", "weekday evening", "evening", "day"
function planNoun() {
  const dayWord = { weekends: 'weekend', weekdays: 'weekday', any: '' }[later.days];
  return [dayWord, timesText()].filter(Boolean).join(' ') || 'day';
}

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The plan in a sentence, for the summary and the request to friends
function windowSentence() {
  if (later.mode === 'date') {
    if (!later.date) return '';
    return `${shortDate(dateFromIso(later.date))}, ${timesText() || 'any time'}.`;
  }
  const from = later.months[later.fromMonth].label;
  const to = later.months[later.toMonth].label;
  const range = from === to ? `in ${from}` : `between ${from} and ${to}`;
  return `${sentenceCase(withArticle(planNoun()))} ${range}.`;
}

// Reply deadline options. For a specific date they stop before the date itself.
function deadlineOptions() {
  const max = later.mode === 'date' && later.date
    ? Math.max(1, Math.min(DEADLINE_DAYS_TO_OFFER, daysUntilDate() - 1))
    : DEADLINE_DAYS_TO_OFFER;
  return Array.from({ length: max }, (_, i) => i + 1);
}

function renderLaterWhen() {
  const names = friendNames(later.friendIds);
  document.getElementById('later-when-sub').textContent =
    names.length <= 3 ? `With ${joinNames(names)}` : `With ${names.length} friends`;

  const isDate = later.mode === 'date';
  const deadlines = deadlineOptions();
  if (later.deadlineDays > deadlines.length) later.deadlineDays = deadlines.length;
  const ready = later.slots.length > 0 && (!isDate || later.date !== '');

  const monthOptions = (selected) => later.months.map((month, i) =>
    `<option value="${i}" ${i === selected ? 'selected' : ''}>${escapeHtml(month.label)}</option>`).join('');

  const dayChips = `
    <h2 class="booking-heading">Days</h2>
    <div class="chip-row chip-wrap">
      ${DAY_OPTIONS.map((option) => `
        <button class="chip" data-days="${option.value}" aria-pressed="${later.days === option.value}">${option.label}</button>`).join('')}
    </div>`;

  const timeChips = `
    <h2 class="booking-heading">Time of day</h2>
    <div class="chip-row chip-wrap">
      ${Object.entries(SLOT_LABELS).map(([value, label]) => `
        <button class="chip" data-slot="${value}" aria-pressed="${later.slots.includes(value)}">${label}</button>`).join('')}
    </div>`;

  const flexible = `
    <h2 class="booking-heading">What kind of plan?</h2>
    <div class="chip-row chip-wrap">
      ${PLAN_PRESETS.map((preset, i) => `
        <button class="chip" data-preset="${i}" aria-pressed="${presetIsSelected(preset)}">${preset.label}</button>`).join('')}
    </div>
    <button class="text-btn fine-tune" id="fine-tune-toggle" aria-expanded="${later.fineTune}">
      ${later.fineTune ? 'Hide days and times' : 'Fine-tune days and times'}
    </button>
    ${later.fineTune ? dayChips + timeChips : ''}

    <h2 class="booking-heading">Between</h2>
    <div class="range-row">
      <select class="select-pill" id="later-from" aria-label="From month">${monthOptions(later.fromMonth)}</select>
      <span>and</span>
      <select class="select-pill" id="later-to" aria-label="To month">${monthOptions(later.toMonth)}</select>
    </div>`;

  const specific = `
    <h2 class="booking-heading">Which date?</h2>
    <input class="date-input" type="date" id="later-date" aria-label="Date" min="${isoDate(earliestDate())}" value="${later.date}">
    ${timeChips}`;

  const summaryText = isDate && !later.date ? 'Pick a date to continue.' : windowSentence();
  const note = later.slots.length === 0
    ? 'Choose at least one time of day to continue.'
    : isDate ? 'Friends will tell you if they\'re free that day.' : 'You can pick a date as friends reply, or wait for everyone.';

  document.getElementById('later-when-content').innerHTML = `
    <div class="segmented" role="group" aria-label="Plan type">
      <button class="segment" data-mode="flexible" aria-pressed="${!isDate}">Flexible</button>
      <button class="segment" data-mode="date" aria-pressed="${isDate}">Specific date</button>
    </div>

    ${isDate ? specific : flexible}

    <h2 class="booking-heading">Friends need to reply by</h2>
    <div class="chip-row chip-wrap">
      ${deadlines.map((days) => `
        <button class="chip" data-deadline="${days}" aria-pressed="${later.deadlineDays === days}">${deadlineDate(days)}</button>`).join('')}
    </div>

    <div class="summary-card">
      <p class="summary-title">Your plan</p>
      <p class="summary-text">${escapeHtml(summaryText)}</p>
      ${isDate && !later.date ? '' : `<p class="summary-text">Friends reply by ${deadlineDate(later.deadlineDays)}.</p>`}
      <p class="summary-note">${note}</p>
    </div>

    ${ready ? `
      <div class="sticky-bar">
        <button class="btn-primary" id="later-when-next">Continue</button>
      </div>` : ''}
  `;
}

document.getElementById('screen-later-when').addEventListener('change', (event) => {
  if (event.target.id === 'later-from') {
    later.fromMonth = Number(event.target.value);
    if (later.toMonth < later.fromMonth) later.toMonth = later.fromMonth; // the window can't end before it starts
  }
  if (event.target.id === 'later-to') {
    later.toMonth = Number(event.target.value);
    if (later.fromMonth > later.toMonth) later.fromMonth = later.toMonth;
  }
  if (event.target.id === 'later-date') {
    later.date = event.target.value;
  }
  renderLaterWhen();
});

document.getElementById('screen-later-when').addEventListener('click', (event) => {
  const mode = event.target.closest('[data-mode]');
  const preset = event.target.closest('[data-preset]');
  const days = event.target.closest('[data-days]');
  const slot = event.target.closest('[data-slot]');
  const deadline = event.target.closest('[data-deadline]');

  if (mode) later.mode = mode.dataset.mode;
  else if (preset) {
    const chosen = PLAN_PRESETS[Number(preset.dataset.preset)];
    later.days = chosen.days;
    later.slots = [...chosen.slots];
  } else if (event.target.id === 'fine-tune-toggle') later.fineTune = !later.fineTune;
  else if (days) later.days = days.dataset.days;
  else if (slot) {
    const value = slot.dataset.slot;
    later.slots = later.slots.includes(value) ? later.slots.filter((s) => s !== value) : [...later.slots, value];
  } else if (deadline) later.deadlineDays = Number(deadline.dataset.deadline);
  else if (event.target.id === 'later-when-next') {
    openAvailability();
    return;
  } else return;

  renderLaterWhen();
});

document.getElementById('later-when-back').addEventListener('click', () => showScreen('later-who'));
