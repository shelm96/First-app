# Project brief: German noun gender game

## Problem
It's hard to learn and remember the genders of German nouns (der, die, das).

## User
Just me, for now.

## Core features
1. Show one German noun at a time and let the user choose **der**, **die** or **das**.
2. Highlight the correct answer and, if the user picked something else, their wrong answer.
3. Keep score and show it at the end of the game.

## Out of scope (for now)
- Logins or accounts
- Saving progress between visits
- Sharing scores with other people

## Content and tone
To follow. The current copy is placeholder.

## Look and feel
- Modern and easy to read
- Big, rounded answer buttons, in the style of Duolingo
- Modern, friendly copy
- Works well on a phone

## Done means
I can open it on my phone, answer a series of questions, see my score at the end, and choose to play again.

## Decisions
- **Words:** a library of about 430 common nouns, tagged by level (A1 to B2). Claude compiled the list; the levels are approximate.
- **Round length:** 10 words per game, picked at random with no repeats.
- **English meaning:** shown only after the user answers.
- **After answering:** the user taps a "Next" button to continue.
- **Scoring:** 1 point per correct answer. No streaks for now.
- **End screen:** the score, plus a list of the words the user got wrong.
- **Name:** "Der Die Das" as a placeholder.

## Ideas for later
- Let the user choose a level (A1, A2, B1, B2) before playing.
- Colour-code the genders (blue for der, red for die, green for das).
