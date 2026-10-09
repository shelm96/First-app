// How many words in each game
const QUESTIONS_PER_GAME = 10;

// The game's current state
let questions = [];   // the 10 words for this game
let current = 0;      // which question we're on (0 = first)
let score = 0;
let mistakes = [];    // words answered wrongly, with what the player chose

// Find the parts of the page we need to change
const startScreen = document.getElementById("start-screen");
const questionScreen = document.getElementById("question-screen");
const resultsScreen = document.getElementById("results-screen");
const wordText = document.getElementById("word");
const questionNumber = document.getElementById("question-number");
const questionTotal = document.getElementById("question-total");
const scoreText = document.getElementById("score");
const answerButtons = document.querySelectorAll(".answer");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const finalScore = document.getElementById("final-score");
const mistakesList = document.getElementById("mistakes-list");

// Show one screen and hide the others
function showScreen(screen) {
  startScreen.hidden = screen !== startScreen;
  questionScreen.hidden = screen !== questionScreen;
  resultsScreen.hidden = screen !== resultsScreen;
}

// Pick a random set of words, with no repeats
function pickWords(count) {
  const shuffled = [...WORDS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function startGame() {
  questions = pickWords(QUESTIONS_PER_GAME);
  current = 0;
  score = 0;
  mistakes = [];
  questionTotal.textContent = questions.length;
  showScreen(questionScreen);
  showQuestion();
}

function showQuestion() {
  const word = questions[current];
  wordText.textContent = word.de;
  questionNumber.textContent = current + 1;
  scoreText.textContent = score;

  // Reset the buttons from the last question
  answerButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("correct", "wrong");
  });
  feedback.hidden = true;
  nextButton.hidden = true;
}

function checkAnswer(chosenButton) {
  const word = questions[current];
  const chosen = chosenButton.dataset.gender;

  // Stop the player changing their answer
  answerButtons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.gender === word.gender) {
      button.classList.add("correct");
    }
  });

  if (chosen === word.gender) {
    score++;
    scoreText.textContent = score;
  } else {
    chosenButton.classList.add("wrong");
    mistakes.push({ word: word, chosen: chosen });
  }

  // Show the full answer and English meaning
  feedback.textContent = `${word.gender} ${word.de} – ${word.en}`;
  feedback.hidden = false;

  const isLastQuestion = current === questions.length - 1;
  nextButton.textContent = isLastQuestion ? "See your score" : "Next";
  nextButton.hidden = false;
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  finalScore.textContent = `${score} out of ${questions.length}`;

  mistakesList.innerHTML = "";
  if (mistakes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "None – you got them all right!";
    mistakesList.appendChild(item);
  } else {
    mistakes.forEach(({ word, chosen }) => {
      const item = document.createElement("li");
      item.textContent = `${word.gender} ${word.de} – ${word.en} (you chose ${chosen})`;
      mistakesList.appendChild(item);
    });
  }

  showScreen(resultsScreen);
}

// Connect the buttons to the functions above
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("replay-button").addEventListener("click", startGame);
nextButton.addEventListener("click", nextQuestion);
answerButtons.forEach((button) => {
  button.addEventListener("click", () => checkAnswer(button));
});
