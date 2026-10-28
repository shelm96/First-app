# rally! – requirements

A hack day prototype. Last updated 28 October 2026 to match what was built.

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
- **Plain HTML, CSS and JavaScript.** No framework and no build step. Open `index.html` to run it. It's hosted on GitHub Pages so colleagues can open it on their phones.

### Faked for the demo

| Feature | How we fake it |
|---|---|
| Logging in | Already logged in as Matt |
| Friends and groups | Made-up friends with placeholder portrait photos, and groups with emoji |
| Calendar connection | A permission screen, then pretend free times. The same pretend calendar every time, so the demo is repeatable |
| Friends replying | Replies arrive one by one after short delays. For "tonight", the replies are scripted. For a later date, friends reply to match when they said they were free |
| Activities and live availability | Real Manchester venue names with made-up prices, promos and spaces left |
| Booking and payment | A hold, then a confirmation. Everyone "pays" their own share with a pretend linked card. No real payment |
| Notifications | Shown in the app as short notes, not sent to phones |
| Messages | A message screen and a "Message sent" confirmation. Nothing is sent and nobody replies |

## What changed since the first version

**Changed**

- **Home is now "Make plans".** It's a two-route screen, not a single "Make a plan" button.
- **"Free now" and "Free tonight" became one toggle, "I'm free tonight".** Two buttons didn't make it clear how to switch off.
- **Tapping one free friend no longer starts a plan.** You select one or more free friends, then choose **Message** or **Book an activity**.
- **Bookings are held, then confirmed.** Spaces are held for 2 hours and the booking only confirms once every invited friend has replied. This replaced "confirm straight away".
- **Everyone pays their own share, and prices are shown per person.** There's no group total. Nobody is charged until the booking is confirmed.
- **Picking a date can happen before everyone has replied.** Flow 1 contradicted itself on this, and we went with picking at any time.
- **The look is now "sticker pop".** It replaces "clean and minimal, mostly white and grey" (see Look and feel).
- **"When could you meet?" has two modes:** a flexible plan, or a specific date.

**New**

- **Messaging.** Message the friends you've selected. This was out of scope, and is now in as a simple demo screen.
- **Profile tab** with the calendar connection, the linked card, who can see you're free, a notification switch and demo tools.
- **Friends tab** with groups and friends, and shortcuts to message or make plans.
- **Changing a booking** from My plans, including a locked state.
- **A "Finding a date" card in My plans** for requests you've sent.
- **Photos** on activity cards and booking screens, and photo avatars for friends.
- **Per-person pricing rules** for five kinds of promo (see Activities and booking).

**Removed**

- The "Make a plan" button, the "Hi Matt" greeting, the "Free now" option, and the "3 friends are free tonight" line (the "3 free!" tag does this job).

## Navigation

A bottom bar with four tabs:

1. **Make plans** (built): your status, who's free tonight, and two ways to make plans: tonight, or later.
2. **My plans** (built, partly): the dates you're finding and the bookings you've made, with who's in. Requests from friends waiting for your reply are **not built**.
3. **Friends** (built): your groups and friends. Open one to message them or make plans.
4. **Profile** (built): calendar connection and settings.

## Make plans screen

Top to bottom:

1. **Logo:** coral "rally!" with a tour-guide flag.
2. **Status card:** one toggle, "I'm free tonight", with a status light beside it. Under it, **Who can see I'm free**: all friends, close friends, Uni friends or Work lot. This is the same setting as in Profile. The card turns peach when you switch on. The setting is stored but doesn't change what friends see, because friends' views aren't modelled.
3. **Make plans tonight:** avatars of the friends who are free tonight, with green dots and a "3 free!" tag. Tap to select one or more, or "Select all". **Message** and **Book an activity** become usable once you've selected someone.
4. **Make plans for later:** starts Flow 1.

## Flow 1: Make plans for later

1. **Choose who** (built). Pick friends or a whole group. Tapping a group selects its members.
2. **When could you meet?** (built). Two modes:
   - **Flexible:** choose a kind of plan, such as *A weekend*, *A weekend morning*, *A weekend afternoon*, *A weekend evening*, *A weekday evening*, *Any evening* or *Whenever*. You can fine-tune the days (weekends, weekdays or any day) and the time of day (morning, afternoon, evening), and choose a rough window, such as "between November and December".
   - **Specific date:** pick a date at least 3 days ahead and the times of day that suit.
3. **Set a reply deadline** (built). Choose when friends need to reply by, for example "Reply by Sat 31 Oct". For a specific date, the deadline must be before it.
4. **Your availability** (built). Connect your calendar (a permission screen), then choose which of your free times to share. Your calendar itself stays private.
5. **Ask friends** (built). Preview and send the request. For example: "Matt wants to find a weekend to meet up. When are you free? Reply by Fri 10 Oct." For a specific date: "Matt wants to meet up on Sat 14 Nov. Are you free? Reply by Fri 30 Oct."
6. **Watch results come in** (built). Replies arrive one by one. The five best dates (or times) are ranked, for example "Sat 14 Nov, Evening · 3 of 3 free so far", with photos of who's free.
7. **Pick a date** (built). You can go ahead before everyone has replied. The next screen shows who can make it, who can't and who hasn't replied.
8. **Choose an activity** (built). Browse venues for that date, with times that match the part of the day. The "optional, skip if you already have a plan" route is **not built**.
9. **Book** (built). See below. For a later date, people can be added or removed until **48 hours before**.
10. **Invite** (built). Friends get an invite and reply "I'm in" or "Can't make it". The organiser sees who's coming.

## Flow 2: Who's free

1. **Set your status** (partly built). The "I'm free tonight" toggle and the visibility setting are built. Setting future days on a calendar is **not built**.
2. **See who's free** (partly built). Avatars with green dots for today, on Make plans and in Friends. A calendar view of friends' availability for later days is **not built**.
3. **Make plans** (changed). Select the friends who are free tonight, then **Message** or **Book an activity**. On the Friends tab, tapping a free friend's **Make plans** goes straight to choosing an activity for tonight.

## Make plans tonight

1. **Choose who.** Select free friends on Make plans.
2. **Pick something to do.** Venue cards with filters, for tonight's times.
3. **Book.** See below.
4. **Invite.** Friends reply on a short delay: Priya and Josh say "I'm in" and Chloe says "Can't make it".

## Activities and booking

### Activity types

Bars, restaurants, cinema, climbing, quiz nights, crazy golf, and similar.

### Activity cards

- **Photo**, name, area of Manchester, a price tier and the price per person. If a photo is missing, a peach block shows instead.
- **Promo tag on the image** for discounts, for example "20% off groups of 4+".
- **Times with spaces left.** "3 spaces left" is highlighted, and full times are greyed out and can't be tapped.

### Filters

Filter suggestions by:

- **Type:** games, food, film, bars or quiz (only the types available for that day show)
- **Budget:** £ (under £10), ££ (£10 to £19) or £££ (£20 and over)
- **Area:** city centre, Northern Quarter, Ancoats or further out

If nothing matches, the screen says so and offers "Clear filters".

### Demo activities (real Manchester venues)

Venue names and descriptions are real. **Prices, discounts, availability and photos are made up or generic for the demo.** The photos aren't of the real venues, except Roxy Ball Room, Parthian Climbing and Everyman, whose pictures come from the venues' own websites. Credits are in `images/CREDITS.md`.

| Venue | Type | Area | Notes |
|---|---|---|---|
| Junkyard Golf | Crazy golf | City centre, near Deansgate | Indoor courses with bars |
| Treetop Adventure Golf | Crazy golf | Printworks | Rainforest theme |
| Black Dog Ballroom | Bowling and bar | Northern Quarter | Bowling lanes, open late |
| Roxy Ball Room | Bowling, pool and games | Deansgate | Bowling, pool, shuffleboard |
| Breakout Manchester | Escape room | City centre | Teams of 2 to 5, one hour |
| Lucardo Escape Rooms | Escape room | Great Ancoats Street | |
| Parthian Climbing | Climbing | Ardwick | In a converted church |
| Seven Bro7hers Ancoats | Quiz night | Ancoats | Thursday evening quiz, buzzer format. Only shown for Thursdays |
| Pen & Pencil | Quiz night and bar | Northern Quarter | Tuesday evening quiz. Only shown for Tuesdays |
| HOME | Cinema | First Street | Independent and mainstream films |
| Everyman Manchester St John's | Cinema | St John's | Sofas, food to your seat |
| Mackie Mayor | Food hall | Northern Quarter, Smithfield | Independent kitchens in a listed building |
| New Century Kitchen | Food hall | NOMA | Street food traders and a terrace |

The two quiz venues have no photo yet and don't appear for tonight or for weekend dates.

### Promos and pricing

Everyone pays their own share, so the booking shows the **price per person**, the **discount** and **what each person pays**. It never shows a group total. If you're close to a deal, it says so, for example "Add 2 more people for 20% off". Promos in the demo:

- **Percent off for groups**, for example 20% off groups of 4 or more (Junkyard Golf)
- **Money off each**, for example £4 off each for teams of 5 (Breakout)
- **2 for 1** on first visits (Parthian Climbing)
- **A free extra**, for example free shoe hire for groups (Roxy Ball Room)

### Booking steps

1. Pick a time. The time you tapped is selected, and you can switch to another.
2. Confirm the number of people. It can't go below the friends you've chosen or above the spaces left. Breakout is fixed at 2 to 5.
3. See what each person pays, with the discount applied.
4. See how the booking works: everyone pays their own share with the card linked to their rally! account, and nobody is charged until they've confirmed. Spaces are held for 2 hours while friends reply.
5. See the change deadline: **2 hours before** for tonight, **48 hours before** for a later date.
6. **Hold the spaces.** A "Spaces held for 2 hours" screen follows, which leads to sending invites.

### Held, confirmed and released

- **Held:** shown with a countdown, for example "Spaces held · 1h 58m left".
- **Confirmed:** once every invited friend has replied. Everyone who's in is charged their share. If people dropped out, the group size and price update to match. For example, "Chloe can't make it, so your booking is now for 3 people. The price is now £14 each, because the group discount no longer applies."
- **Released:** if nobody can come, or the group is too small for the venue, or the hold runs out. The hold running out can't be seen in the demo.

### Changing a booking

From **My plans**, the organiser taps **Change booking** to:

- **Remove** a friend (or **Add back** one they removed). Friends who've already said "Can't make it" can't be changed.
- **Add extra guests**, meaning people who aren't on rally!
- See the price and discount update as they go, with a "Was £14 each" line when it changes.

**Save changes** only appears once something has changed and the numbers are valid. Friends who are removed are told, and any difference in price is charged or refunded. After the change deadline the booking is **locked**, and My plans says "Locked. The change deadline has passed." For demos, Profile has **Skip to change deadline**, which locks every booking.

## Timings

Days are split into **morning, afternoon and evening** slots. The exact time is set when an activity is booked. In the demo:

- **Tonight:** each venue has its own evening times.
- **A later date:** morning is 10:00am and 11:30am, afternoon is 1:00pm, 3:00pm and 4:30pm, and evening uses each venue's evening times.

## Messages

Select friends on Make plans (or open one on the Friends tab) and choose **Message**. The text is written for you and you can edit it. From Make plans: "I'm free tonight. Fancy doing something?" From Friends: "Fancy doing something soon?" After sending, you can go on to book an activity (tonight) or make plans for later. Nothing is really sent.

## Friends tab

- **Header:** for example "7 friends · 3 free tonight".
- **Groups:** Uni friends (🎓) and Work lot (💼). Open one to see its members and a **Make plans with** button that starts Flow 1 with the whole group chosen.
- **Friends:** all of them, with photos. Friends who are free tonight come first, with a green dot and a "Free tonight" tag. Open one to **Message** or **Make plans**.

## My plans tab

- **Finding a date:** a card for each request you've sent, showing how many have replied. It opens the replies screen. After you pick a date it shows the date, and once you've booked an activity the booking card replaces it.
- **Bookings:** each shows the venue, when, people, price each, a status banner (held, confirmed or released), who's in, the change deadline and **Change booking**.
- **Not built:** requests from friends waiting for your reply.

## Profile tab

- **Calendar:** connected or not connected. Connecting shows a short "Checking" step. It shares its state with Flow 1, so connecting here means the permission screen is skipped there.
- **Payment:** "Visa ending 4242", marked as linked. Not editable.
- **Privacy:** who can see you're free. Shared with Make plans.
- **Notifications:** a switch for "When a friend replies". Turn it off and the reply notes stop appearing.
- **Demo:** **Reset demo** clears everything and starts again. **Skip to change deadline** locks every booking.

## Look and feel

The look is **"sticker pop"**, chosen from three options (sticker pop, night out and tour pass).

- **Logo:** lowercase coral "rally!" with a dark outline all the way round and a small tour-guide flag that sways gently.
- **Style:** a warm peach page, white cards with chunky dark outlines and hard offset shadows, pill-shaped buttons that press down, a rounded font, and a light scatter of confetti dots in the corner of cards. A "3 free!" sticker sits on the tonight card with a slight tilt.
- **Colour:** **coral (#D85A30) is the accent**, with peach tints (#FFC4AD for selected states, #FFDCCB for lighter fills) and a peach page (#FFE9D8). The dark outline colour is #1F1F1F.
- **Free status:** green dot (#1D9E75). A brighter mint (#A9E4CB) shows "I'm in" and "confirmed".
- **People:** friends have photo avatars with a green dot when free. Groups have emoji avatars. Your own avatar is a coral initial.
- **Rounded shapes:** pill-shaped buttons and rounded cards.
- **Buttons:** on the planning screens, the Continue and Save buttons only appear once you've made a selection, rather than showing greyed out. (On Make plans, Message and Book an activity do show greyed out until you pick a friend.)
- **Colours are defined in one place** at the top of `css/styles.css`, so they're easy to change. The sticker pop look is layered on top of the original plain styles, in blocks near the end of that file.

## Content and voice

- **Interface:** plain, clear and factual. For example "I'm free tonight" and "Each person pays £11.20".
- **Invites and notifications:** warmer and cheekier. The invite reads: "Matt's rallying you for tonight. Let him know if you're in." For a later date: "Matt's rallying you for Sun 8 Nov. Let him know if you're in."
- Use sentence case and British English.
- Button labels name where they go, for example "Back to Make plans" and "View plans".

## Demo data

- **You:** Matt
- **Friends:** seven: Priya, Tom, Aisha, Josh, Chloe, Danny and Mei. Priya, Josh and Chloe are free tonight.
- **Groups:** Uni friends (Priya, Tom, Josh, Danny) and Work lot (Tom, Aisha, Chloe, Mei). Tom is in both.
- **Location:** Manchester
- **Photos:** people are random placeholder portraits from randomuser.me. Venues use the photos described above.

## The demo story (suggested)

1. Open **Make plans**: "3 free!" on the tonight card.
2. Switch on **I'm free tonight**, select Priya, Josh and Chloe, tap **Book an activity**, and book Junkyard Golf at 6:30pm with the group discount. Send invites and watch the replies. Chloe can't make it, so the group drops to 3 and the discount goes.
3. Tap **Make plans for later** and choose "Uni friends". Choose **A weekend evening**, set the window to December, connect your calendar, send the request and watch the replies come in. Pick the best date and book dinner at Mackie Mayor (choosing the evening plan means dinner has evening times).
4. Show both plans in **My plans**, with who's in. Optionally show **Change booking**, then lock it with **Skip to change deadline** in Profile.

Between runs, use **Profile, then Reset demo**.

## Out of scope for today

- Real accounts, sign-up and log-in
- Real calendar integration
- Real bookings, payments or venue data
- Real push notifications and real messages. There's no chat between friends.
- Friends suggesting activities. Only the organiser chooses for now. This could be a future feature.
- Saving anything. Everything is held in memory and clears when the page is refreshed.

## Still to build

- **Requests waiting for your reply** in My plans (the friend's side of Flow 1)
- **Setting future free days on a calendar**, and a **calendar view of friends' availability** for later days
- **Skipping the activity** after picking a date ("I've already got a plan")
- **Visibility having an effect:** the setting is stored, but friends' views aren't modelled
- **Photos for the two quiz venues**

## Decisions

- **Filters:** yes, by type, budget and area.
- **Who chooses the activity:** the organiser only, to keep it buildable today.
- **Status visibility:** you can choose which friends or groups see that you're free. It's a stored setting for now.
- **Picking a date:** the organiser can pick at any time, including before everyone has replied. The earlier "after the deadline, or once everyone has replied" rule was dropped.
- **Holding spaces:** a booking is held for 2 hours and only confirms once every invited friend has replied.
- **Paying:** each person pays their own share, charged when the booking confirms. If people drop out, the price per person is recalculated, and the group discount can disappear.
- **Change deadline:** 2 hours before for tonight, 48 hours before for a later date. The requirements' "48 hours" example didn't fit a booking for tonight.
- **Messaging:** included as a simple demo screen, even though it was first out of scope.
- **Look:** sticker pop.
- **Tech:** plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages.
