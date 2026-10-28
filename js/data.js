// Made-up demo data. Edit names, groups and who's free here and the app updates.
const friends = [
  { id: 'priya', name: 'Priya', groups: ['Uni friends'], freeTonight: true },
  { id: 'tom',   name: 'Tom',   groups: ['Uni friends', 'Work lot'], freeTonight: false },
  { id: 'aisha', name: 'Aisha', groups: ['Work lot'], freeTonight: false },
  { id: 'josh',  name: 'Josh',  groups: ['Uni friends'], freeTonight: true },
  { id: 'chloe', name: 'Chloe', groups: ['Work lot'], freeTonight: true },
  { id: 'danny', name: 'Danny', groups: ['Uni friends'], freeTonight: false },
  { id: 'mei',   name: 'Mei',   groups: ['Work lot'], freeTonight: false },
];

const groups = ['Uni friends', 'Work lot'];

// Emoji avatar for each group
const groupEmoji = { 'Uni friends': '🎓', 'Work lot': '💼' };

// How friends reply to an invite for tonight, and how many milliseconds after it's sent.
// Anyone not listed here replies "in" after 3 seconds.
const inviteReplies = {
  priya: { reply: 'in', after: 2000 },
  josh:  { reply: 'in', after: 4500 },
  chloe: { reply: 'out', after: 7000 },
};

// Real Manchester venues. Prices, promos and spaces are made up for the demo.
// price = per person in pounds. slots = tonight's times and spaces left.
// discount = how the promo changes the price. minPeople and maxPeople limit the group size.
// tonight: false hides a venue from "tonight" lists. quizDay is the one weekday a quiz runs (0 is Sunday).
const activities = [
  {
    id: 'junkyard-golf', name: 'Junkyard Golf', categories: ['Games'], area: 'City centre', areaGroup: 'City centre',
    description: 'Indoor crazy golf courses, with bars', price: 14, promo: '20% off groups of 4+', discount: { type: 'percent', min: 4, percent: 20 }, tone: 1, tonight: true,
    slots: [{ time: '6:30pm', left: 8 }, { time: '7:30pm', left: 3 }, { time: '8:30pm', left: 0 }],
  },
  {
    id: 'treetop-golf', name: 'Treetop Adventure Golf', categories: ['Games'], area: 'Printworks', areaGroup: 'City centre',
    description: 'Rainforest-themed crazy golf', price: 9, promo: null, tone: 2, tonight: true,
    slots: [{ time: '7:00pm', left: 10 }, { time: '8:00pm', left: 6 }],
  },
  {
    id: 'black-dog-ballroom', name: 'Black Dog Ballroom', categories: ['Games', 'Bars'], area: 'Northern Quarter', areaGroup: 'Northern Quarter',
    description: 'Bowling lanes and a bar, open late', price: 12, promo: null, tone: 3, tonight: true,
    slots: [{ time: '7:00pm', left: 4 }, { time: '8:30pm', left: 8 }, { time: '10:00pm', left: 12 }],
  },
  {
    id: 'roxy-ball-room', name: 'Roxy Ball Room', categories: ['Games', 'Bars'], area: 'Deansgate', areaGroup: 'City centre',
    description: 'Bowling, pool and shuffleboard', price: 13, promo: 'Free shoe hire for groups', discount: { type: 'perk', min: 4, perk: 'Free shoe hire' }, tone: 1, tonight: true,
    slots: [{ time: '7:00pm', left: 6 }, { time: '8:00pm', left: 2 }, { time: '9:00pm', left: 9 }],
  },
  {
    id: 'breakout-manchester', name: 'Breakout Manchester', categories: ['Games'], area: 'City centre', areaGroup: 'City centre',
    description: 'Escape rooms for teams of 2 to 5. Each game takes an hour', price: 24, promo: '£4 off each for teams of 5', discount: { type: 'perPerson', min: 5, amount: 4 }, minPeople: 2, maxPeople: 5, tone: 2, tonight: true,
    slots: [{ time: '6:00pm', left: 0 }, { time: '7:30pm', left: 5 }, { time: '9:00pm', left: 5 }],
  },
  {
    id: 'lucardo-escape-rooms', name: 'Lucardo Escape Rooms', categories: ['Games'], area: 'Great Ancoats Street', areaGroup: 'Ancoats',
    description: 'Escape rooms for friends and colleagues', price: 16, promo: null, tone: 3, tonight: true,
    slots: [{ time: '7:00pm', left: 4 }, { time: '8:30pm', left: 3 }],
  },
  {
    id: 'parthian-climbing', name: 'Parthian Climbing', categories: ['Games'], area: 'Ardwick', areaGroup: 'Further out',
    description: 'Climbing walls in a converted church', price: 11, promo: '2 for 1 on first visits', discount: { type: 'twoForOne' }, tone: 1, tonight: true,
    slots: [{ time: '6:30pm', left: 12 }, { time: '8:00pm', left: 7 }],
  },
  {
    id: 'seven-brothers-quiz', name: 'Seven Bro7hers Ancoats', categories: ['Quiz', 'Bars'], area: 'Ancoats', areaGroup: 'Ancoats',
    description: 'Thursday quiz night, buzzer format', price: 4, promo: null, tone: 2, tonight: false, quizDay: 4, slots: [],
  },
  {
    id: 'pen-and-pencil-quiz', name: 'Pen & Pencil', categories: ['Quiz', 'Bars'], area: 'Northern Quarter', areaGroup: 'Northern Quarter',
    description: 'Tuesday quiz night, plus a bar', price: 3, promo: null, tone: 3, tonight: false, quizDay: 2, slots: [],
  },
  {
    id: 'home-cinema', name: 'HOME', categories: ['Film'], area: 'First Street', areaGroup: 'City centre',
    description: 'Independent and mainstream films', price: 11, promo: null, tone: 1, tonight: true,
    slots: [{ time: '7:15pm', left: 40 }, { time: '8:30pm', left: 22 }, { time: '9:15pm', left: 3 }],
  },
  {
    id: 'everyman-st-johns', name: 'Everyman Manchester St John\'s', categories: ['Film', 'Food'], area: 'St John\'s', areaGroup: 'City centre',
    description: 'Films on sofas, with food brought to your seat', price: 22, promo: null, tone: 2, tonight: true,
    slots: [{ time: '7:00pm', left: 14 }, { time: '8:15pm', left: 9 }],
  },
  {
    id: 'mackie-mayor', name: 'Mackie Mayor', categories: ['Food', 'Bars'], area: 'Smithfield, Northern Quarter', areaGroup: 'Northern Quarter',
    description: 'Independent kitchens in a listed building', price: 15, promo: '10% off groups of 6+', discount: { type: 'percent', min: 6, percent: 10 }, tone: 3, tonight: true,
    slots: [{ time: '6:30pm', left: 20 }, { time: '7:30pm', left: 12 }, { time: '8:30pm', left: 16 }],
  },
  {
    id: 'new-century-kitchen', name: 'New Century Kitchen', categories: ['Food', 'Bars'], area: 'NOMA', areaGroup: 'Further out',
    description: 'Street food traders and a terrace', price: 14, promo: null, tone: 1, tonight: true,
    slots: [{ time: '6:30pm', left: 15 }, { time: '8:00pm', left: 6 }],
  },
];
