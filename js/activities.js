// Activities screen: filters and venue cards.

const filterState = { type: 'All', budget: 'All', area: 'All' };

// £ under £10, ££ £10 to £19, £££ £20 and over
function budgetTier(price) {
  if (price < 10) return '£';
  if (price < 20) return '££';
  return '£££';
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// What the plan is for: tonight, or a date picked in "Make plans for later"
// For a date: { type: 'later', key: '2026-11-8|afternoon', laterRecord }
let planContext = { type: 'tonight' };

const PERIOD_TIMES = { morning: ['10:00am', '11:30am'], afternoon: ['1:00pm', '3:00pm', '4:30pm'] };

function contextLabel() {
  return planContext.type === 'tonight' ? 'Tonight' : shortDate(parseShareKey(planContext.key).date);
}

// For sentences like "Matt's rallying you for tonight"
function contextPhrase() {
  return planContext.type === 'tonight' ? 'tonight' : contextLabel();
}

// Made-up spaces left for a venue at a time on a date. Same every run, so the demo is repeatable.
function spacesFor(activityId, key, time) {
  const value = hashText(activityId + key + time) % 100;
  return value < 12 ? 0 : 2 + (value % 11);
}

// The times a venue has for the plan: tonight's times, or times in the picked part of the day
function activitySlots(activity) {
  if (planContext.type === 'tonight') return activity.tonight ? activity.slots : [];

  const { date, slot: period } = parseShareKey(planContext.key);
  if (activity.quizDay !== undefined) {
    const runsThatDay = date.getDay() === activity.quizDay && period === 'evening';
    return runsThatDay ? [{ time: '8:00pm', left: spacesFor(activity.id, planContext.key, '8:00pm') }] : [];
  }
  const times = period === 'evening'
    ? (activity.slots.length ? activity.slots.map((s) => s.time) : ['7:00pm', '8:30pm'])
    : PERIOD_TIMES[period];
  return times.map((time) => ({ time, left: spacesFor(activity.id, planContext.key, time) }));
}

function availableActivities() {
  return activities.filter((activity) => activitySlots(activity).length > 0);
}

function uniqueOptions(values, preferredOrder) {
  const found = [...new Set(values)];
  return preferredOrder.filter((option) => found.includes(option));
}

function renderFilters() {
  const list = availableActivities();
  const filterGroups = [
    { key: 'type', label: 'Type', options: uniqueOptions(list.flatMap((a) => a.categories), ['Games', 'Food', 'Film', 'Bars', 'Quiz']) },
    { key: 'budget', label: 'Budget', options: ['£', '££', '£££'] },
    { key: 'area', label: 'Area', options: uniqueOptions(list.map((a) => a.areaGroup), ['City centre', 'Northern Quarter', 'Ancoats', 'Further out']) },
  ];

  document.getElementById('filters').innerHTML = filterGroups.map((group) => `
    <div class="filter-group">
      <p class="filter-label" id="filter-${group.key}">${group.label}</p>
      <div class="chip-row" role="group" aria-labelledby="filter-${group.key}">
        ${['All', ...group.options].map((option) => `
          <button class="chip" data-filter="${group.key}" data-value="${option}"
            aria-pressed="${filterState[group.key] === option}">${option}</button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function matchesFilters(activity) {
  return (filterState.type === 'All' || activity.categories.includes(filterState.type))
    && (filterState.budget === 'All' || budgetTier(activity.price) === filterState.budget)
    && (filterState.area === 'All' || activity.areaGroup === filterState.area);
}

function spacesLabel(slot) {
  if (slot.left === 0) return 'Full';
  if (slot.left <= 3) return `${slot.left} ${slot.left === 1 ? 'space' : 'spaces'} left`;
  return 'Spaces available';
}

function renderCards() {
  const matches = availableActivities().filter(matchesFilters);
  const list = document.getElementById('activity-list');
  const count = document.getElementById('result-count');

  count.textContent = matches.length === 1 ? '1 place' : `${matches.length} places`;

  if (matches.length === 0) {
    list.innerHTML = `
      <li class="empty">
        <p class="empty-title">Nothing matches those filters</p>
        <p>Try a different budget or area.</p>
        <button class="btn-secondary" id="clear-filters">Clear filters</button>
      </li>`;
    return;
  }

  list.innerHTML = matches.map((activity) => `
    <li class="activity-card">
      <div class="activity-image tone-${activity.tone}">
        <span class="activity-image-label">${escapeHtml(activity.categories[0])}</span>
        <img class="activity-photo" src="images/${activity.id}.jpg" alt="" loading="lazy" onerror="this.remove()">
        ${activity.promo ? `<span class="promo-tag">${escapeHtml(activity.promo)}</span>` : ''}
      </div>
      <div class="activity-body">
        <h2 class="activity-name">${escapeHtml(activity.name)}</h2>
        <p class="activity-meta">${escapeHtml(activity.area)} · ${budgetTier(activity.price)} · £${activity.price} per person</p>
        <p class="activity-desc">${escapeHtml(activity.description)}</p>
        <p class="slots-label">${contextLabel()}</p>
        <div class="slot-row">
          ${activitySlots(activity).map((slot) => `
            <button class="slot" data-activity="${activity.id}" data-time="${slot.time}" ${slot.left === 0 ? 'disabled' : ''}>
              <span class="slot-time">${slot.time}</span>
              <span class="slot-spaces ${slot.left > 0 && slot.left <= 3 ? 'is-low' : ''}">${spacesLabel(slot)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </li>
  `).join('');
}

// Who the plan is with. Booking reads this.
let currentFriendIds = [];

function openActivities(friendIds, context = { type: 'tonight' }) {
  currentFriendIds = [...friendIds];
  planContext = context; // context.from is 'friends' when started from the Friends tab
  const when = context.type === 'tonight'
    ? 'Tonight'
    : `${shortDate(parseShareKey(context.key).date)}, ${SLOT_LABELS[parseShareKey(context.key).slot].toLowerCase()}`;
  document.getElementById('activities-sub').textContent =
    currentFriendIds.length ? `With ${joinNames(friendNames(currentFriendIds))} · ${when}` : when;
  filterState.type = filterState.budget = filterState.area = 'All';
  renderFilters();
  renderCards();
  showScreen('activities');
}

// Back to where you came from: the picked date, or Make plans
document.getElementById('activities-back').addEventListener('click', () => {
  if (planContext.type === 'later') {
    showScreen('later-results');
  } else if (planContext.from === 'friends') {
    selectedFriendIds = [];
    renderFreeFriends();
    showScreen('friends');
  } else {
    showScreen('home');
  }
});

// Filter chips and the clear button
document.getElementById('screen-activities').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (chip) {
    filterState[chip.dataset.filter] = chip.dataset.value;
    renderFilters();
    renderCards();
  }
  if (event.target.id === 'clear-filters') {
    filterState.type = filterState.budget = filterState.area = 'All';
    renderFilters();
    renderCards();
  }
});
