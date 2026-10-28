// Change a booking: add or remove people until the change deadline. The price and discount update to match.

let changing = null; // { record, removed: [friend ids], guests: number } while the screen is open

function openChange(record) {
  changing = { record, removed: [...record.removed], guests: record.guests };
  const activity = activities.find((a) => a.id === record.activityId);
  document.getElementById('change-sub').textContent = `${activity.name} · ${record.whenLabel} at ${record.time}`;
  renderChange();
  showScreen('change');
}

// How many people there'd be with the changes you've made so far
function draftHeadcount() {
  const { record } = changing;
  const staying = record.friendIds.filter((id) => !changing.removed.includes(id) && record.replies[id] !== 'out');
  return 1 + staying.length + changing.guests;
}

function renderChange() {
  const { record } = changing;
  const activity = activities.find((a) => a.id === record.activityId);
  const min = activity.minPeople || 1;
  const max = record.maxPeople;
  const people = draftHeadcount();
  const price = priceFor(activity, people, max);

  const hasChanged = changing.guests !== record.guests || !sameSlots(changing.removed, record.removed);
  const problem = people < min ? `${activity.name} needs at least ${min} people.`
    : people > max ? `There's only space for ${max} people at this time.` : '';

  const friendRows = record.friendIds.map((id) => {
    const friend = friends.find((f) => f.id === id);
    const removed = changing.removed.includes(id);
    const declined = record.replies[id] === 'out';
    const status = removed ? 'removed' : record.replies[id];
    return `
      <li class="reply-row">
        <span class="avatar avatar-sm">${friend.name[0]}${avatarPhoto(friend)}</span>
        <span class="reply-name">${escapeHtml(friend.name)}</span>
        <span class="reply-pill is-${status}">${REPLY_LABELS[status]}</span>
        ${declined ? '' : `<button class="mini-btn" data-toggle-friend="${id}">${removed ? 'Add back' : 'Remove'}</button>`}
      </li>`;
  }).join('');

  document.getElementById('change-content').innerHTML = `
    <div class="status-banner is-held">
      <p class="status-title">${pluralise(people, 'person', 'people')} · ${formatMoney(price.perPerson)} each</p>
      <p class="status-text">You can change this until ${escapeHtml(record.changeBy)}. After that, the booking is locked.</p>
    </div>

    <h2 class="booking-heading">Friends</h2>
    <ul class="reply-list">
      <li class="reply-row">
        <span class="avatar avatar-sm avatar-you">M</span>
        <span class="reply-name">Matt (you)</span>
        <span class="reply-pill is-in">${REPLY_LABELS.in}</span>
      </li>
      ${friendRows}
    </ul>

    <h2 class="booking-heading">Extra guests</h2>
    <div class="card stepper-card">
      <div>
        <p class="stepper-who">Guests</p>
        <p class="stepper-limit">People who aren't on rally!</p>
      </div>
      <div class="stepper">
        <button class="stepper-btn" data-guests="-1" aria-label="Remove a guest" ${changing.guests <= 0 ? 'disabled' : ''}>−</button>
        <span class="stepper-count" aria-live="polite">${changing.guests}</span>
        <button class="stepper-btn" data-guests="1" aria-label="Add a guest" ${people >= max ? 'disabled' : ''}>+</button>
      </div>
    </div>

    <h2 class="booking-heading">Price</h2>
    <div class="card price-card">
      <div class="price-row"><span>Price per person</span><span>${formatMoney(activity.price)}</span></div>
      ${price.discount > 0 ? `<div class="price-row price-saving"><span>${escapeHtml(price.label)}</span><span>−${formatMoney(price.discountEach)}</span></div>` : ''}
      ${price.perk ? `<div class="price-row price-saving"><span>${escapeHtml(price.perk)}</span><span>Included</span></div>` : ''}
      <div class="price-row price-total"><span>Each person pays</span><span>${formatMoney(price.perPerson)}</span></div>
      ${price.perPerson !== record.perPerson ? `<p class="price-hint">Was ${formatMoney(record.perPerson)} each</p>` : ''}
      ${price.hint ? `<p class="price-hint">${escapeHtml(price.hint)}</p>` : ''}
    </div>
    ${problem ? `<p class="price-hint problem">${escapeHtml(problem)}</p>` : ''}
    <p class="policy">Friends you remove will be told. Any difference in price is charged or refunded.</p>

    ${hasChanged && !problem ? `
      <div class="sticky-bar">
        <button class="btn-primary" id="save-changes">Save changes</button>
      </div>` : ''}
  `;
}

function saveChanges() {
  const { record } = changing;
  const activity = activities.find((a) => a.id === record.activityId);

  record.removed = [...changing.removed];
  record.guests = changing.guests;
  record.people = headcount(record);
  record.perPerson = priceFor(activity, record.people).perPerson;

  if (record.status === 'confirmed') {
    record.notice = `Updated: now for ${record.people} people at ${formatMoney(record.perPerson)} each. Any difference is charged or refunded.`;
  } else if (record.status === 'held' && record.invited) {
    settleBooking(record); // if nobody is left to reply, the booking can confirm now
  }

  showScreen('plans');
  showToast('Booking updated');
}

document.getElementById('screen-change').addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-toggle-friend]');
  const guests = event.target.closest('[data-guests]');

  if (toggle) {
    const id = toggle.dataset.toggleFriend;
    changing.removed = changing.removed.includes(id) ? changing.removed.filter((x) => x !== id) : [...changing.removed, id];
    renderChange();
  } else if (guests) {
    changing.guests = Math.max(0, changing.guests + Number(guests.dataset.guests));
    renderChange();
  } else if (event.target.id === 'save-changes') {
    saveChanges();
  }
});

document.getElementById('change-back').addEventListener('click', () => showScreen('plans'));
