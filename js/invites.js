// Invites: friends get an invite for a held booking and reply one by one.
// Once everyone has replied, the booking is confirmed (or released if nobody can come).

const REPLY_LABELS = {
  notInvited: 'Not invited yet',
  waiting: 'Waiting for reply',
  in: 'I\'m in',
  out: 'Can\'t make it',
  removed: 'Removed',
};

let viewingInvitesFor = null; // the booking shown on the invites screen

function isScreenActive(name) {
  return document.getElementById(`screen-${name}`).classList.contains('is-active');
}

// Friends you've taken off the booking don't count for anything
function activeFriendIds(record) {
  return record.friendIds.filter((id) => !record.removed.includes(id));
}

// Everyone who'd be there: you, friends who haven't said no, and any extra guests
function headcount(record) {
  return 1 + activeFriendIds(record).filter((id) => record.replies[id] !== 'out').length + record.guests;
}

function inCount(record) {
  return 1 + activeFriendIds(record).filter((id) => record.replies[id] === 'in').length;
}

function repliesToCome(record) {
  return activeFriendIds(record).filter((id) => record.replies[id] === 'waiting' || record.replies[id] === 'notInvited').length;
}

// The "who's in" list, used on the invites screen and in My plans
function replyRows(record) {
  const friendRows = record.friendIds.map((id) => {
    const friend = friends.find((f) => f.id === id);
    const status = record.removed.includes(id) ? 'removed' : record.replies[id];
    return `
      <li class="reply-row">
        <span class="avatar avatar-sm">${friend.name[0]}${avatarPhoto(friend)}</span>
        <span class="reply-name">${escapeHtml(friend.name)}</span>
        <span class="reply-pill is-${status}">${REPLY_LABELS[status]}</span>
      </li>`;
  }).join('');

  return `
    <ul class="reply-list">
      <li class="reply-row">
        <span class="avatar avatar-sm avatar-you">M</span>
        <span class="reply-name">Matt (you)</span>
        <span class="reply-pill is-in">${REPLY_LABELS.in}</span>
      </li>
      ${friendRows}
    </ul>`;
}

// Says whether the booking is held, confirmed or released
function statusBanner(record) {
  const status = bookingStatus(record);

  if (status === 'confirmed') {
    return `
      <div class="status-banner is-confirmed">
        <p class="status-title">Booking confirmed</p>
        <p class="status-text">${escapeHtml(record.notice)}</p>
      </div>`;
  }

  if (status === 'released') {
    const reason = record.notice || 'Your friends didn\'t reply in time, so we\'ve released your spaces.';
    return `
      <div class="status-banner is-released">
        <p class="status-title">Spaces released</p>
        <p class="status-text">${escapeHtml(reason)}</p>
      </div>`;
  }

  const toCome = repliesToCome(record);
  const next = !record.invited
    ? 'Send invites so your friends can let you know.'
    : `We'll confirm once your friends have replied. ${pluralise(toCome, 'reply', 'replies')} to come.`;
  return `
    <div class="status-banner is-held">
      <p class="status-title">Spaces held · ${holdTimeLeft(record)} left</p>
      <p class="status-text">${next}</p>
    </div>`;
}

function renderInvites() {
  const record = viewingInvitesFor;
  const activity = activities.find((a) => a.id === record.activityId);
  const total = 1 + activeFriendIds(record).length;

  document.getElementById('invites-sub').textContent = `${activity.name} · ${record.whenLabel} at ${record.time}`;
  document.getElementById('invites-content').innerHTML = `
    ${statusBanner(record)}

    <h2 class="booking-heading">What ${escapeHtml(joinNames(friendNames(record.friendIds)))} will see</h2>
    <div class="card notification">
      <p class="notification-app">rally!</p>
      <p class="notification-text">Matt's rallying you for ${escapeHtml(record.whenPhrase)}. Let him know if you're in.</p>
      <p class="notification-detail">${escapeHtml(activity.name)} · ${record.time}</p>
    </div>

    <h2 class="booking-heading">Who's in <span class="in-count" aria-live="polite">${inCount(record)} of ${total}</span></h2>
    ${replyRows(record)}

    <p class="policy">You can add or remove people until ${record.changeBy}.</p>
    <button class="btn-primary" id="invites-plans">View plans</button>
    <button class="btn-secondary btn-wide" id="invites-done">Back to Make plans</button>
  `;
}

// Once every friend has replied, confirm the booking for whoever is in.
// If people dropped out, the group size and price update to match.
function settleBooking(record) {
  if (record.status !== 'held' || repliesToCome(record) > 0) return;

  const activity = activities.find((a) => a.id === record.activityId);
  const active = activeFriendIds(record);
  const outIds = active.filter((id) => record.replies[id] === 'out');
  const outNames = joinNames(friendNames(outIds));
  const outCount = outIds.length;
  const people = headcount(record);

  if (active.length > 0 && outCount === active.length && record.guests === 0) {
    record.status = 'released';
    record.notice = `${outNames} can't make it, so we've released your spaces.`;
    return;
  }
  if (people < (activity.minPeople || 1)) {
    record.status = 'released';
    record.notice = 'There aren\'t enough people left for this booking, so we\'ve released your spaces.';
    return;
  }

  const before = priceFor(activity, record.people);
  const after = priceFor(activity, people);
  record.people = people;
  record.perPerson = after.perPerson;
  record.status = 'confirmed';

  // Everyone who's in is charged their share now that the booking is confirmed
  const charged = `Everyone who's in has been charged ${formatMoney(record.perPerson)}.`;
  if (outCount === 0) {
    record.notice = `Everyone's in. ${charged}`;
  } else {
    const priceChange = after.perPerson !== before.perPerson
      ? ` The price is now ${formatMoney(after.perPerson)} each${before.discount > 0 && after.discount === 0 ? ', because the group discount no longer applies' : ''}.`
      : '';
    record.notice = `${outNames} can't make it, so your booking is now for ${people} people.${priceChange} ${charged}`;
  }
}

// Sends the invites, then friends reply one by one after short delays
function sendInvites(record) {
  if (record.invited) return;
  record.invited = true;

  record.friendIds.forEach((id, index) => {
    record.replies[id] = 'waiting';
    const friend = friends.find((f) => f.id === id);
    // Tonight uses the scripted replies. For a picked date, friends reply to match when they said they're free.
    const script = record.dateKey
      ? { reply: friendIsFree(id, record.dateKey) ? 'in' : 'out', after: 2200 + index * 2300 }
      : inviteReplies[id] || { reply: 'in', after: 3000 };

    setTimeout(() => {
      const statusBefore = record.status;
      record.replies[id] = script.reply;
      settleBooking(record);

      if (isScreenActive('invites') && viewingInvitesFor === record) {
        renderInvites();
        return;
      }
      const activity = activities.find((a) => a.id === record.activityId);
      let message = script.reply === 'in' ? `${friend.name} is in` : `${friend.name} can't make it`;
      if (record.status !== statusBefore) {
        message = record.status === 'confirmed' ? `${activity.name} is confirmed` : `Spaces released at ${activity.name}`;
      }
      if (settings.notifyReplies) showToast(message);
      if (isScreenActive('plans')) renderPlans();
    }, script.after);
  });
}

function openInvites(record) {
  viewingInvitesFor = record;
  sendInvites(record);
  renderInvites();
  showScreen('invites');
}

document.getElementById('invites-back').addEventListener('click', () => goHome());

document.getElementById('screen-invites').addEventListener('click', (event) => {
  if (event.target.id === 'invites-plans') {
    selectedFriendIds = [];
    renderFreeFriends();
    showScreen('plans');
  }
  if (event.target.id === 'invites-done') goHome();
});

// Keep the "time left" on a hold fresh
setInterval(() => {
  if (isScreenActive('invites') && viewingInvitesFor) renderInvites();
  if (isScreenActive('plans')) renderPlans();
}, 30000);
