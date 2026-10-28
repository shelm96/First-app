// My plans: dates you're still finding, and the bookings you've made.

function renderLaterPlanCard(record) {
  const names = joinNames(friendNames(record.friendIds));
  return `
    <article class="card plan-item">
      <h2 class="activity-name">${record.pickedKey ? escapeHtml(shareKeyLabel(record.pickedKey)) : 'Finding a date'}</h2>
      <p class="activity-meta">With ${escapeHtml(names)}</p>
      <div class="plan-summary-gap"></div>
      ${laterStatusBanner(record)}
      <button class="btn-secondary btn-wide" data-open-later="${record.id}">${record.pickedKey ? 'View details' : 'See replies'}</button>
    </article>`;
}

function renderPlans() {
  const container = document.getElementById('plans-content');

  if (bookings.length === 0 && laterPlans.every((record) => record.hasBooking) ) {
    container.innerHTML = `
      <div class="empty">
        <p class="empty-title">No plans yet</p>
        <p>When you book something, it will show up here.</p>
      </div>`;
    return;
  }

  // Once a date has an activity booked, the booking card takes over from the "Finding a date" card
  const findingDates = [...laterPlans].reverse().filter((record) => !record.hasBooking).map(renderLaterPlanCard).join('');

  // Newest first
  const bookedPlans = [...bookings].reverse().map((record) => {
    const activity = activities.find((a) => a.id === record.activityId);
    const status = bookingStatus(record);
    const price = status === 'confirmed' ? `${formatMoney(record.perPerson)} each` : `${formatMoney(record.perPerson)} each if confirmed`;
    return `
      <article class="card plan-item">
        <h2 class="activity-name">${escapeHtml(activity.name)}</h2>
        <p class="activity-meta">${record.whenLabel} at ${record.time} · ${escapeHtml(activity.area)}</p>
        <p class="plan-summary">${pluralise(record.people, 'person', 'people')} · ${price}
          ${record.invited && status !== 'confirmed' ? `· <strong>${inCount(record)} of ${1 + activeFriendIds(record).length} in</strong>` : ''}</p>
        ${statusBanner(record)}
        ${replyRows(record)}
        <p class="policy">${record.locked
          ? 'Locked. The change deadline has passed.'
          : `You can add or remove people until ${record.changeBy}.`}</p>
        ${record.locked || status === 'released' ? '' : `<button class="btn-secondary btn-wide" data-change-booking="${record.id}">Change booking</button>`}
      </article>`;
  }).join('');

  container.innerHTML = findingDates + bookedPlans;
}

document.getElementById('plans-content').addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-later]');
  if (button) openLaterResults(laterPlans[Number(button.dataset.openLater)], 'plans');

  const change = event.target.closest('[data-change-booking]');
  if (change) openChange(bookings.find((record) => record.id === Number(change.dataset.changeBooking)));
});
