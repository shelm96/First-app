// Make plans for later, part three: friends reply, the best dates are ranked, and you pick one.

let viewingLater = null;      // the request shown on the results screen
let laterResultsBack = 'home'; // where the back arrow goes: 'home' or 'plans'

// ---------- Pretend availability ----------
// Friends are free for a given time about 5 times in 10. It's the same every run, so the demo is repeatable.
function hashText(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 1009;
  return hash;
}

function friendIsFree(friendId, key) {
  return hashText(friendId + key) % 100 < 50;
}

function parseShareKey(key) {
  const [datePart, slot] = key.split('|');
  const [year, month, day] = datePart.split('-').map(Number);
  return { date: new Date(year, month - 1, day), slot };
}

function shareKeyLabel(key) {
  const { date, slot } = parseShareKey(key);
  return `${shortDate(date)} · ${SLOT_LABELS[slot]}`;
}

function repliedIds(record) {
  return record.friendIds.filter((id) => record.replies[id] === 'replied');
}

// The best times so far. Matt is always free at the times he shared.
function rankedDates(record) {
  const replied = repliedIds(record);
  return record.shared
    .map((key) => {
      const free = replied.filter((id) => friendIsFree(id, key));
      return { key, free, count: free.length + 1, total: replied.length + 1 };
    })
    .sort((a, b) => b.count - a.count || parseShareKey(a.key).date - parseShareKey(b.key).date)
    .slice(0, 5);
}

// ---------- Replies arrive one by one ----------
function startLaterReplies(record) {
  record.friendIds.forEach((id, index) => {
    const friend = friends.find((f) => f.id === id);
    setTimeout(() => {
      record.replies[id] = 'replied';
      if (isScreenActive('later-results') && viewingLater === record) {
        if (record.pickedKey) renderPicked(); else renderLaterResults();
        return;
      }
      if (settings.notifyReplies) showToast(`${friend.name} replied`);
      if (isScreenActive('plans')) renderPlans();
    }, 2200 + index * 2300);
  });
}

// ---------- The results screen ----------
function avatarStack(ids) {
  return `<span class="mini-stack">${ids.map((id) => {
    const friend = friends.find((f) => f.id === id);
    return `<span class="avatar avatar-sm">${friend.name[0]}${avatarPhoto(friend)}</span>`;
  }).join('')}</span>`;
}

function laterStatusBanner(record) {
  const total = record.friendIds.length;
  const replied = repliedIds(record).length;
  if (record.pickedKey) {
    return `
      <div class="status-banner is-confirmed">
        <p class="status-title">Date picked</p>
        <p class="status-text">${escapeHtml(shareKeyLabel(record.pickedKey))}</p>
      </div>`;
  }
  if (replied === total) {
    return `
      <div class="status-banner is-confirmed">
        <p class="status-title">Everyone's replied</p>
        <p class="status-text">Pick the ${record.mode === 'date' ? 'time' : 'date'} that suits the most people.</p>
      </div>`;
  }
  return `
    <div class="status-banner is-held">
      <p class="status-title">${replied} of ${total} replied</p>
      <p class="status-text">Reply by ${escapeHtml(record.deadline)}. You can pick a date now or wait for everyone.</p>
    </div>`;
}

function renderLaterResults() {
  const record = viewingLater;
  const everyone = repliedIds(record).length === record.friendIds.length;
  const ranking = rankedDates(record);
  if (!ranking.some((row) => row.key === record.selectedKey)) record.selectedKey = null;

  document.getElementById('later-results-sub').textContent = `${joinNames(friendNames(record.friendIds))}`;

  const dates = repliedIds(record).length === 0
    ? `<div class="card empty-card"><p class="empty-title">Waiting for the first reply</p><p>The best ${record.mode === 'date' ? 'times' : 'dates'} will show up here as friends reply.</p></div>`
    : `<div class="date-list">${ranking.map((row, index) => `
        <button class="date-row" data-date="${row.key}" aria-pressed="${row.key === record.selectedKey}">
          <span class="rank">${index + 1}</span>
          <span class="date-text">
            <span class="date-title">${escapeHtml(shortDate(parseShareKey(row.key).date))}</span>
            <span class="date-sub">${SLOT_LABELS[parseShareKey(row.key).slot]} · ${row.count} of ${row.total} free${everyone ? '' : ' so far'}</span>
          </span>
          ${avatarStack(row.free)}
        </button>`).join('')}</div>`;

  const replyList = record.friendIds.map((id) => {
    const friend = friends.find((f) => f.id === id);
    const replied = record.replies[id] === 'replied';
    return `
      <li class="reply-row">
        <span class="avatar avatar-sm">${friend.name[0]}${avatarPhoto(friend)}</span>
        <span class="reply-name">${escapeHtml(friend.name)}</span>
        <span class="reply-pill ${replied ? 'is-in' : 'is-waiting'}">${replied ? 'Replied' : 'Waiting for reply'}</span>
      </li>`;
  }).join('');

  document.getElementById('later-results-content').innerHTML = `
    ${laterStatusBanner(record)}

    <h2 class="booking-heading">${record.mode === 'date' ? 'Best times' : 'Best dates'} so far</h2>
    ${dates}

    <h2 class="booking-heading">Replies</h2>
    <ul class="reply-list">${replyList}</ul>

    ${record.selectedKey ? `
      <div class="sticky-bar">
        <button class="btn-primary" id="pick-date">Pick ${escapeHtml(shareKeyLabel(record.selectedKey))}</button>
      </div>` : ''}
  `;
}

function openLaterResults(record, from = 'home') {
  viewingLater = record;
  laterResultsBack = from;
  document.getElementById('later-results-title').textContent = 'Finding a date';
  if (record.pickedKey) renderPicked(); else renderLaterResults();
  showScreen('later-results');
}

// ---------- Picking a date ----------
function renderPicked() {
  const record = viewingLater;
  const key = record.pickedKey;
  const replied = repliedIds(record);
  const free = replied.filter((id) => friendIsFree(id, key));
  const busy = replied.filter((id) => !friendIsFree(id, key));
  const waiting = record.friendIds.filter((id) => record.replies[id] === 'waiting');
  const names = (ids) => (ids.length ? joinNames(friendNames(ids)) : 'No one');

  document.getElementById('later-results-title').textContent = 'Date picked';
  document.getElementById('later-results-sub').textContent = shareKeyLabel(key);
  document.getElementById('later-results-content').innerHTML = `
    <div class="confirmed">
      <div class="confirmed-tick" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      </div>
      <h2 class="confirmed-title">${escapeHtml(shareKeyLabel(key))}</h2>
      <p class="confirmed-sub">${free.length + 1} of ${record.friendIds.length + 1} can make it${waiting.length ? ' so far' : ''}</p>

      <div class="card price-card confirmed-card">
        <div class="price-row"><span>Can make it</span><span>You${free.length ? `, ${escapeHtml(joinNames(friendNames(free)))}` : ''}</span></div>
        <div class="price-row"><span>Can't make it</span><span>${escapeHtml(names(busy))}</span></div>
        ${waiting.length ? `<div class="price-row"><span>Still to reply</span><span>${escapeHtml(names(waiting))}</span></div>` : ''}
      </div>

      <button class="btn-primary" id="later-choose-activity">Choose an activity</button>
      <button class="btn-secondary btn-wide" id="later-to-plans">Back to My plans</button>
    </div>`;
}

document.getElementById('screen-later-results').addEventListener('click', (event) => {
  const row = event.target.closest('[data-date]');
  if (row) {
    viewingLater.selectedKey = viewingLater.selectedKey === row.dataset.date ? null : row.dataset.date;
    renderLaterResults();
  } else if (event.target.id === 'pick-date') {
    viewingLater.pickedKey = viewingLater.selectedKey;
    renderPicked();
  } else if (event.target.id === 'later-choose-activity') {
    // Everyone who can make the date, plus anyone who hasn't replied yet, is part of the booking
    const record = viewingLater;
    const invitees = record.friendIds.filter((id) => record.replies[id] === 'waiting' || friendIsFree(id, record.pickedKey));
    openActivities(invitees, { type: 'later', key: record.pickedKey, laterRecord: record });
  } else if (event.target.id === 'later-to-plans') {
    showScreen('plans');
  }
});

document.getElementById('later-results-back').addEventListener('click', () => {
  if (laterResultsBack === 'plans') showScreen('plans'); else goHome();
});
