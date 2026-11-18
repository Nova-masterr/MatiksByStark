let score = 0;
let currentQ = 1;
let totalQuestions = 10;
let timePerQuestion = 10;
let timeLeft = 10;
let maxLives = 3;
let lives = 3;
let rowCount = 3;
let currentAnswer = 0;
let timerId = null;
let gameStartTime = 0;

const setupCard = document.getElementById("setup-card");
const hud = document.getElementById("hud");
const gameCard = document.getElementById("game-card");
const gameOverCard = document.getElementById("game-over");
const bottomControls = document.getElementById("bottom-controls");
const problemContainer = document.getElementById("problem-container");
const answerInput = document.getElementById("answer-input");

function randTwoDigit() {
  return Math.floor(Math.random() * 90) + 10;
}

function showSetup() {
  clearInterval(timerId);
  setupCard.style.display = "flex";
  hud.style.display = "none";
  gameCard.style.display = "none";
  bottomControls.style.display = "none";
  gameOverCard.style.display = "none";
}

function flashCard(className) {
  gameCard.classList.remove("flash-ok", "flash-bad");
  void gameCard.offsetWidth;
  gameCard.classList.add(className);
  setTimeout(function () {
    gameCard.classList.remove(className);
  }, 180);
}

function loseLife() {
  lives--;
  flashCard("flash-bad");
  updateHud();

  if (lives <= 0) {
    endGame("Out of Lives!");
    return;
  }

  currentQ++;
  nextProblem();
}

function startQuestionTimer() {
  clearInterval(timerId);
  timeLeft = timePerQuestion;
  updateHud();

  timerId = setInterval(function () {
    timeLeft--;
    updateHud();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      loseLife();
    }
  }, 1000);
}

function nextProblem() {
  if (currentQ > totalQuestions) {
    endGame("All Questions Completed!");
    return;
  }

  document.getElementById("q-label").textContent =
    "Question " + currentQ + " of " + totalQuestions;

  const nums = [];
  for (let i = 0; i < rowCount; i++) {
    nums.push(randTwoDigit());
  }
  currentAnswer = nums.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  problemContainer.innerHTML = "";
  nums.forEach(function (num, idx) {
    const row = document.createElement("div");
    row.className = "num-row";
    if (idx === nums.length - 1) {
      row.classList.add("op-row");
      row.innerHTML =
        '<span class="op-symbol">+</span><span>' + num + "</span>";
    } else {
      row.textContent = num;
    }
    problemContainer.appendChild(row);
  });

  answerInput.value = "";
  answerInput.focus();
  startQuestionTimer();
}

function skipProblem() {
  clearInterval(timerId);
  loseLife();
}

function updateHud() {
  document.getElementById("score-display").textContent = score;
  document.getElementById("progress-display").textContent =
    Math.min(currentQ, totalQuestions) + "/" + totalQuestions;
  document.getElementById("time-display").textContent = timeLeft;

  let hearts = "";
  for (let i = 0; i < maxLives; i++) {
    hearts += i < lives ? "❤️" : "🖤";
  }
  document.getElementById("lives-display").textContent = hearts;
}

function startGame() {
  clearInterval(timerId);

  timePerQuestion = Math.max(
    2,
    Math.min(
      120,
      parseInt(document.getElementById("cfg-time").value, 10) || 10,
    ),
  );
  maxLives = Math.max(
    1,
    Math.min(3, parseInt(document.getElementById("cfg-lives").value, 10) || 3),
  );
  rowCount = Math.max(
    2,
    Math.min(8, parseInt(document.getElementById("cfg-rows").value, 10) || 3),
  );
  totalQuestions = Math.max(
    1,
    Math.min(
      100,
      parseInt(document.getElementById("cfg-questions").value, 10) || 10,
    ),
  );

  score = 0;
  currentQ = 1;
  lives = maxLives;
  gameStartTime = Date.now();

  setupCard.style.display = "none";
  gameOverCard.style.display = "none";
  hud.style.display = "flex";
  gameCard.style.display = "flex";
  bottomControls.style.display = "flex";

  nextProblem();
}

function endGame(reason) {
  clearInterval(timerId);
  hud.style.display = "none";
  gameCard.style.display = "none";
  bottomControls.style.display = "none";
  gameOverCard.style.display = "flex";

  const totalSeconds = Math.round((Date.now() - gameStartTime) / 1000);
  document.getElementById("end-title").textContent = reason;
  document.getElementById("final-score").textContent =
    score + " / " + totalQuestions;
  document.getElementById("final-lives").textContent = lives + " / " + maxLives;
  document.getElementById("final-time").textContent = totalSeconds + "s";
}

answerInput.addEventListener("input", function () {
  const val = parseInt(answerInput.value, 10);
  if (val === currentAnswer) {
    clearInterval(timerId);
    score++;
    currentQ++;
    flashCard("flash-ok");
    nextProblem();
  }
});

setupCard.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    startGame();
  }
});
