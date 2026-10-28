// Booking: pick a time, set the number of people, see the price, confirm.

const CHANGE_NOTICE_HOURS = 2;       // tonight's bookings can change until 2 hours before
const LATER_CHANGE_NOTICE_DAYS = 2;  // bookings for a later date can change until 48 hours before
const DEFAULT_MAX_PEOPLE = 12;
const HOLD_HOURS = 2; // how long spaces are held while friends reply

const booking = { activityId: null, time: null, people: 2 };
const bookings = []; // confirmed bookings, used later by My plans

function formatMoney(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? `£${rounded}` : `£${rounded.toFixed(2)}`;
}

function pluralise(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

// "7:30pm" becomes minutes after midnight, and back again
function parseTime(text) {
  const [, hours, minutes, meridiem] = text.match(/(\d+):(\d+)(am|pm)/);
  return ((Number(hours) % 12) + (meridiem === 'pm' ? 12 : 0)) * 60 + Number(minutes);
}

function formatTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours24 % 12 || 12}:${minutes}${hours24 >= 12 ? 'pm' : 'am'}`;
}

// When people can still be added or removed: 2 hours before for tonight, 48 hours before for a later date
function changeDeadline(time) {
  if (planContext.type === 'tonight') {
    return `${formatTime(parseTime(time) - CHANGE_NOTICE_HOURS * 60)} tonight`;
  }
  const deadline = new Date(parseShareKey(planContext.key).date);
  deadline.setDate(deadline.getDate() - LATER_CHANGE_NOTICE_DAYS);
  return `${shortDate(deadline)}, ${time}`;
}

function currentActivity() {
  return activities.find((a) => a.id === booking.activityId);
}

function currentSlot() {
  return activitySlots(currentActivity()).find((s) => s.time === booking.time);
}

function peopleLimits() {
  const activity = currentActivity();
  const max = Math.min(activity.maxPeople || DEFAULT_MAX_PEOPLE, currentSlot().left);
  // Everyone you've picked is already coming, so the group can't be smaller than that
  const min = Math.min(Math.max(activity.minPeople || 1, 1 + currentFriendIds.length), max);
  return { min, max };
}

// Works out the price for a group, including any discount
function priceFor(activity, people, maxPeople = DEFAULT_MAX_PEOPLE) {
  const subtotal = activity.price * people;
  const rule = activity.discount;
  const result = { subtotal, discount: 0, perk: null, label: activity.promo, applies: false, hint: '' };
  if (!rule) return { ...result, perPerson: activity.price, discountEach: 0 };

  if (rule.type === 'twoForOne') {
    result.applies = people >= 2;
    result.discount = result.applies ? Math.floor(people / 2) * activity.price : 0;
    result.hint = people < 2 && maxPeople >= 2 ? 'Add 1 more person for 2 for 1' : '';
  } else {
    result.applies = people >= rule.min;
    if (result.applies) {
      if (rule.type === 'percent') result.discount = (subtotal * rule.percent) / 100;
      if (rule.type === 'perPerson') result.discount = people * rule.amount;
      if (rule.type === 'perk') result.perk = rule.perk;
    } else if (rule.min <= maxPeople) {
      // Only suggest it if there's room for enough people at this time
      const needed = rule.min - people;
      const reward = rule.type === 'percent' ? `${rule.percent}% off`
        : rule.type === 'perPerson' ? `${formatMoney(rule.amount)} off each`
        : rule.perk.toLowerCase();
      result.hint = `Add ${pluralise(needed, 'more person', 'more people')} for ${reward}`;
    }
  }
  result.discount = Math.round(result.discount * 100) / 100;
  // Everyone pays their own share, so this is what each person is charged
  result.discountEach = Math.round((result.discount / people) * 100) / 100;
  result.perPerson = Math.round(((subtotal - result.discount) / people) * 100) / 100;
  return result;
}

// "You, Priya and Josh" or "You, Priya, Josh and 2 others"
function whoIsComing(people) {
  const names = friendNames(currentFriendIds);
  const extras = people - 1 - names.length;
  if (people === 1) return 'Just you';
  if (names.length === 0 || extras < 0) return `You and ${pluralise(people - 1, 'other', 'others')}`;
  const everyone = ['You', ...names];
  return extras === 0 ? joinNames(everyone) : `${everyone.join(', ')} and ${pluralise(extras, 'other', 'others')}`;
}

function renderBooking() {
  const activity = currentActivity();
  const { min, max } = peopleLimits();
  const price = priceFor(activity, booking.people, max);

  document.getElementById('booking-content').innerHTML = `
    <div class="card booking-venue">
      <div class="activity-image tone-${activity.tone}">
        <span class="activity-image-label">${escapeHtml(activity.categories[0])}</span>
        <img class="activity-photo" src="images/${activity.id}.jpg" alt="" onerror="this.remove()">
        ${activity.promo ? `<span class="promo-tag">${escapeHtml(activity.promo)}</span>` : ''}
      </div>
      <div class="booking-venue-text">
        <h2 class="activity-name">${escapeHtml(activity.name)}</h2>
        <p class="activity-meta">${escapeHtml(activity.area)}</p>
      </div>
    </div>

    <h2 class="booking-heading">Time</h2>
    <div class="slot-row">
      ${activitySlots(activity).filter((s) => s.left > 0).map((slot) => `
        <button class="chip" data-time="${slot.time}" aria-pressed="${slot.time === booking.time}">${slot.time}</button>
      `).join('')}
    </div>

    <h2 class="booking-heading">Number of people</h2>
    <div class="card stepper-card">
      <div>
        <p class="stepper-who">${escapeHtml(whoIsComing(booking.people))}</p>
        <p class="stepper-limit">${max === min ? 'Fixed at this time' : `Up to ${max} at this time`}</p>
      </div>
      <div class="stepper">
        <button class="stepper-btn" data-step="-1" aria-label="Remove a person" ${booking.people <= min ? 'disabled' : ''}>−</button>
        <span class="stepper-count" aria-live="polite">${booking.people}</span>
        <button class="stepper-btn" data-step="1" aria-label="Add a person" ${booking.people >= max ? 'disabled' : ''}>+</button>
      </div>
    </div>

    <h2 class="booking-heading">Price</h2>
    <div class="card price-card">
      <div class="price-row"><span>Price per person</span><span>${formatMoney(activity.price)}</span></div>
      ${price.discount > 0 ? `<div class="price-row price-saving"><span>${escapeHtml(price.label)}</span><span>−${formatMoney(price.discountEach)}</span></div>` : ''}
      ${price.perk ? `<div class="price-row price-saving"><span>${escapeHtml(price.perk)}</span><span>Included</span></div>` : ''}
      <div class="price-row price-total"><span>Each person pays</span><span>${formatMoney(price.perPerson)}</span></div>
      ${price.hint ? `<p class="price-hint">${escapeHtml(price.hint)}</p>` : ''}
    </div>

    <p class="hold-note">Everyone pays their own share, using the card linked to their rally! account. Nobody is charged until they've confirmed they're in.</p>
    <p class="hold-note">We'll hold your spaces for ${HOLD_HOURS} hours while your friends reply.</p>
    <p class="policy">You can add or remove people until ${changeDeadline(booking.time)}. After that, the booking is locked.</p>

    <div class="sticky-bar">
      <button class="btn-primary" id="hold-booking">Hold spaces · ${formatMoney(price.perPerson)} each</button>
    </div>
  `;
}

function openBooking(activityId, time) {
  booking.activityId = activityId;
  booking.time = time;
  const { min, max } = peopleLimits();
  booking.people = Math.min(Math.max(1 + currentFriendIds.length, min), max);
  document.getElementById('booking-sub').textContent = contextLabel();
  renderBooking();
  showScreen('booking');
}

// A booking starts as "held". It becomes "confirmed" once your friends have replied (see invites.js).
function bookingStatus(record) {
  if (record.status === 'held' && Date.now() > record.holdEndsAt) return 'released';
  return record.status;
}

function holdTimeLeft(record) {
  const minutes = Math.max(0, Math.ceil((record.holdEndsAt - Date.now()) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function holdBooking() {
  const activity = currentActivity();
  const price = priceFor(activity, booking.people);
  bookings.push({
    id: bookings.length,
    activityId: activity.id,
    friendIds: [...currentFriendIds],
    replies: Object.fromEntries(currentFriendIds.map((id) => [id, 'notInvited'])),
    time: booking.time,
    people: booking.people,
    guests: Math.max(0, booking.people - 1 - currentFriendIds.length), // extra people who aren't friends on rally!
    removed: [],                    // friends you've taken off the booking
    maxPeople: peopleLimits().max,  // the most people this time can fit
    locked: false,                  // true once the change deadline has passed
    perPerson: price.perPerson,
    changeBy: changeDeadline(booking.time),
    whenLabel: contextLabel(),
    whenPhrase: contextPhrase(),
    dateKey: planContext.type === 'later' ? planContext.key : null,
    status: 'held',
    holdEndsAt: Date.now() + HOLD_HOURS * 60 * 60 * 1000,
    notice: '',
  });
  // The booking now stands in for the "Finding a date" card in My plans
  if (planContext.type === 'later') planContext.laterRecord.hasBooking = true;

  document.getElementById('confirmed-content').innerHTML = `
    <div class="confirmed">
      <div class="confirmed-tick" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>
      </div>
      <h1 class="confirmed-title">Spaces held for ${HOLD_HOURS} hours</h1>
      <p class="confirmed-sub">${escapeHtml(activity.name)} · ${contextLabel()} at ${booking.time}</p>

      <div class="card price-card confirmed-card">
        <div class="price-row"><span>Where</span><span>${escapeHtml(activity.area)}</span></div>
        <div class="price-row"><span>Who</span><span>${escapeHtml(whoIsComing(booking.people))}</span></div>
        <div class="price-row"><span>People</span><span>${booking.people}</span></div>
        <div class="price-row price-total"><span>Each person pays</span><span>${formatMoney(price.perPerson)}</span></div>
      </div>

      <p class="policy">We'll confirm your booking once your friends have replied. Everyone is only charged once they've confirmed they're in.</p>
      <button class="btn-primary" id="send-invites">Send invites</button>
      <button class="btn-secondary btn-wide" id="confirmed-done">Back to Make plans</button>
    </div>
  `;
  showScreen('confirmed');
}

// Tap a time on an activity card
document.getElementById('activity-list').addEventListener('click', (event) => {
  const slot = event.target.closest('.slot');
  if (slot && !slot.disabled) openBooking(slot.dataset.activity, slot.dataset.time);
});

// Back to the activity list
document.getElementById('booking-back').addEventListener('click', () => showScreen('activities'));

// Time chips, stepper and confirm button
document.getElementById('screen-booking').addEventListener('click', (event) => {
  const timeChip = event.target.closest('.chip');
  if (timeChip) {
    booking.time = timeChip.dataset.time;
    const { min, max } = peopleLimits();
    booking.people = Math.min(Math.max(booking.people, min), max);
    renderBooking();
    return;
  }
  const step = event.target.closest('.stepper-btn');
  if (step) {
    const { min, max } = peopleLimits();
    booking.people = Math.min(Math.max(booking.people + Number(step.dataset.step), min), max);
    renderBooking();
    return;
  }
  if (event.target.id === 'hold-booking') holdBooking();
});

document.getElementById('screen-confirmed').addEventListener('click', (event) => {
  if (event.target.id === 'send-invites') openInvites(bookings[bookings.length - 1]);
  if (event.target.id === 'confirmed-done') goHome();
});
