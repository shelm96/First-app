# rally! – requirements

A hack day prototype. Last updated 28 October 2026.

## The idea

Rally helps friends make plans. It finds dates that work for everyone, suggests things to do in your area, and lets you book them. It also shows when friends are free, so people who'd both like company on a Friday night can find each other.

The demo uses Manchester as the example city.

### Problems it solves

- Finding a date in a group chat is messy, even with polls.
- People are often free with no plans and don't know their friends are free too.
- Once you've found a date, you still have to find somewhere to go, check it has space and book it, usually on a different website.

## What we're building

- A **mobile-first website** that looks and feels like an app: a phone-sized layout, a bottom navigation bar and large tappable buttons.
- A **clickable prototype** for a hack day demo. Everything should *feel* real, but there's no real backend.

### Faked for the demo

| Feature | How we fake it |
|---|---|
| Logging in | Already logged in as Matt |
| Friends and groups | Made-up friends with avatars |
| Calendar connection | A permission screen, then pretend free slots |
| Friends replying | Replies arrive one by one after short delays |
| Activities and live availability | Made-up Manchester venues and time slots |
| Booking and payment | A booking screen and a confirmation, with no real payment |
| Notifications | Shown in the app, not sent to phones |

## Navigation

A bottom bar with four tabs:

1. **Make plans**: your status, who's free tonight, and two ways to make plans: tonight, or later
2. **My plans**: upcoming plans, plus requests waiting for your reply
3. **Friends**: friends and groups
4. **Profile**: calendar connection and settings

## Flow 1: Make a plan

1. **Choose who.** Tap "Make a plan", then pick friends or a group.
2. **Set a window.** For example "A weekend between September and December". Choose the days and slots that suit (morning, afternoon or evening).
3. **Set a reply deadline.** Choose when friends need to reply by, for example "Reply by Friday 10 October". Friends see the deadline in their request. The organiser can pick a date as soon as the deadline passes, or earlier if everyone has replied.
4. **Your availability.** Your connected calendar suggests your free slots. You choose which to share. Your calendar itself stays private.
5. **Ask friends.** Friends who haven't shared their availability get a request. For example: "Matt wants to find a weekend to meet up. When are you free? Reply by Fri 10 Oct."
6. **Watch results come in.** For example "3 of 5 replied", with the best dates ranked, like "Sat 18 Oct: 3 of 3 free so far".
7. **Pick a date.** You can go ahead before everyone has replied.
8. **Choose an activity (optional).** Skip this if you already have a plan, or browse suggestions.
9. **Book.** See below. Make it clear that **the booking can be changed until a set date**, for example "You can add or remove people until 48 hours before". This means the organiser can book before everyone has confirmed.
10. **Invite.** Friends get an invite and reply "I'm in" or "Can't make it". The organiser can see who's coming and change the number of people until the change deadline.

## Flow 2: Who's free

1. **Set your status.** A "Free now" or "Free tonight" quick option, or set future days on a calendar. Choose who can see it: all friends, or specific groups only (for example "Close friends").
2. **See who's free.** Avatars with green dots for today, and a calendar view of friends' availability for later days.
3. **Make plans.** Tap a free friend to start Flow 1 with them already selected. This skips straight to choosing an activity if you're both free tonight.

## Activities and booking

### Activity types

Bars, restaurants, cinema, climbing, quiz nights, crazy golf, and similar.

### Activity cards

- Image, name, area of Manchester (for example Ancoats or the Northern Quarter), and price
- **Promo tag on the image** for discounts, for example "20% off groups of 4+"
- Times with live availability

### Filters

Filter suggestions by:

- **Type**: for example bars, food, games or film
- **Budget**: for example £, ££ or £££
- **Area**: for example Northern Quarter, Ancoats or city centre

### Demo activities (real Manchester venues)

Venue names and descriptions are real. **Prices, discounts and availability are made up for the demo.**

| Venue | Type | Area | Notes |
|---|---|---|---|
| Junkyard Golf | Crazy golf | City centre, near Deansgate | Indoor courses with bars |
| Treetop Adventure Golf | Crazy golf | Printworks | Rainforest theme |
| Black Dog Ballroom | Bowling and bar | Northern Quarter | Bowling lanes, open late |
| Roxy Ball Room | Bowling, pool and games | Deansgate | Bowling, pool, shuffleboard |
| Breakout Manchester | Escape room | City centre | Teams of 2 to 5, one hour |
| Lucardo Escape Rooms | Escape room | Great Ancoats Street | |
| Parthian Climbing | Climbing | Ardwick | In a converted church |
| Seven Bro7hers Ancoats | Quiz night | Ancoats | Thursday quiz, buzzer format |
| Pen & Pencil | Quiz night and bar | Northern Quarter | Tuesday quiz |
| HOME | Cinema | First Street | Independent and mainstream films |
| Everyman Manchester St John's | Cinema | St John's | Sofas, food to your seat |
| Mackie Mayor | Food hall | Northern Quarter, Smithfield | Independent kitchens in a listed building |
| New Century Kitchen | Food hall | NOMA | Street food traders and a terrace |

### Booking steps

1. Pick a time slot
2. Confirm the number of people
3. See the price per person, the discount applied and the total
4. See the change policy, for example "Add or remove people until 48 hours before"
5. Confirm the booking
6. Confirmation screen, which then leads to the invite step in Flow 1

### Changing a booking

From **My plans**, the organiser can add or remove people until the change deadline. The price and discount update to match. After the deadline, the booking is locked.

## Timings

Days are split into **morning, afternoon and evening** slots. The exact time is set when an activity is booked, for example a 7:30pm table.

## Look and feel

- **Logo:** lowercase coral "rally!"
- **Layout:** clean and minimal, with lots of white space
- **Colour:** mostly white and grey, with **coral (#D85A30) as the only accent**. A pale coral tint (#FAECE7) for soft backgrounds.
- **Free status:** green dot (#1D9E75)
- **Rounded shapes:** pill-shaped buttons and rounded cards
- Colours are defined in one place so they're easy to change later

## Content and voice

- **Interface:** plain, clear and factual. For example "3 friends are free" and "Free tonight".
- **Invites and notifications:** warmer and cheekier. For example "Matt's rallying the troops for Saturday. Up for it?"
- Use sentence case and British English.

## Demo data

- **You:** Matt
- **Friends:** around 6 to 8, with names and avatars
- **Groups:** for example "Uni friends" and "Work lot"
- **Location:** Manchester

## The demo story (suggested)

1. Open Make plans: "3 free!" on the tonight card.
2. Switch on "Free tonight", tap a friend, book crazy golf with a group discount.
3. Make a plan with "Uni friends" for a weekend before Christmas. Watch the replies come in, pick the best date and book dinner.
4. Show the plan in My plans, with who's in.

## Out of scope for today

- Real accounts, sign-up and log-in
- Real calendar integration
- Real bookings, payments or venue data
- Real push notifications
- Messaging or chat between friends
- Friends suggesting activities. Only the organiser chooses for now. This could be a future feature.

## Decisions

- **Filters:** yes, by type, budget and area.
- **Who chooses the activity:** the organiser only, to keep it buildable today.
- **Status visibility:** yes, you can choose which friends or groups see that you're free.
