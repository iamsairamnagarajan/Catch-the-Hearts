const bubu = document.getElementById("bubu");
const dudu = document.getElementById("dudu");
const pipeTop1 = document.getElementById("pipeTop1");
const pipeBottom1 = document.getElementById("pipeBottom1");
const pipeTop2 = document.getElementById("pipeTop2");
const pipeBottom2 = document.getElementById("pipeBottom2");
const powerUp = document.getElementById("powerUp");
const bubuScoreDisplay = document.getElementById("bubuScore");
const duduScoreDisplay = document.getElementById("duduScore");
const timerDisplay = document.getElementById("timer");
const winScreen = document.getElementById("winScreen");
const winMessage = document.getElementById("winMessage");
const scoreList = document.getElementById("scoreList");

let bubuScore = 0;
let duduScore = 0;
let bubuVelocity = 0;
let duduVelocity = 0;
let gameActive = false;
let timeLeft = 60;
let bubuShield = false;
let duduShield = false;
let pipeSpeed = 3;
let pipes = [
  { top: pipeTop1, bottom: pipeBottom1, x: 600, passed: false },
  { top: pipeTop2, bottom: pipeTop2, x: 900, passed: false }
];
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

// Initialize game
function startGame() {
  bubuScore = 0;
  duduScore = 0;
  bubuScoreDisplay.textContent = bubuScore;
  duduScoreDisplay.textContent = duduScore;
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;
  bubu.style.top = "280px";
  dudu.style.top = "280px";
  bubuVelocity = 0;
  duduVelocity = 0;
  pipeSpeed = 3;
  bubuShield = false;
  duduShield = false;
  powerUp.style.display = "none";
  gameActive = true;
  winScreen.style.display = "none";
  pipes = [
    { top: pipeTop1, bottom: pipeBottom1, x: 600, passed: false },
    { top: pipeTop2, bottom: pipeBottom2, x: 900, passed: false }
  ];
  resetPipes();
  updateLeaderboard();
  gameLoop();
  timerInterval = setInterval(updateTimer, 1000);
}

// Reset pipe positions
function resetPipes() {
  pipes.forEach(pipe => {
    const gapHeight = 150;
    const minHeight = 100;
    const maxHeight = 350;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipe.top.style.height = `${topHeight}px`;
    pipe.bottom.style.height = `${600 - topHeight - gapHeight}px`;
    pipe.x = 600;
    pipe.top.style.right = "0px";
    pipe.bottom.style.right = "0px";
    pipe.passed = false;
  });
}

// Player input (spacebar to flap)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameActive) {
    bubuVelocity = -10; // Flap upward
  }
});

// Game loop
function gameLoop() {
  if (!gameActive) return;

  // Update Bubu
  let bubuTop = parseInt(window.getComputedStyle(bubu).getPropertyValue("top"));
  bubuVelocity += 0.5; // Gravity
  bubuTop += bubuVelocity;
  if (bubuTop < 0) bubuTop = 0;
  if (bubuTop > 560) bubuTop = 560;
  bubu.style.top = bubuTop + "px";

  // Update Dudu (AI)
  let duduTop = parseInt(window.getComputedStyle(dudu).getPropertyValue("top"));
  duduVelocity += 0.5; // Gravity
  const targetPipe = pipes.find(pipe => pipe.x > 100 && pipe.x < 300) || pipes[0];
  const gapCenter = parseInt(targetPipe.top.style.height) + 75;
  const aiSkill = Math.min(0.9 + bubuScore * 0.02, 1.5); // Adaptive difficulty
  if (duduTop > gapCenter + 20) {
    duduVelocity = -10 * aiSkill; // Flap if too low
  } else if (duduTop < gapCenter - 20) {
    duduVelocity = 2; // Fall if too high
  }
  duduTop += duduVelocity;
  if (duduTop < 0) duduTop = 0;
  if (duduTop > 560) duduTop = 560;
  dudu.style.top = duduTop + "px";

  // Move pipes
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;
    pipe.top.style.right = `${600 - pipe.x}px`;
    pipe.bottom.style.right = `${600 - pipe.x}px`;
    if (pipe.x < -60) {
      pipe.x = 600;
      const gapHeight = 150;
      const minHeight = 100;
      const maxHeight = 350;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      pipe.top.style.height = `${topHeight}px`;
      pipe.bottom.style.height = `${600 - topHeight - gapHeight}px`;
      pipe.passed = false;
    }
    // Score points
    if (!pipe.passed && pipe.x < 100) {
      if (bubuTop > parseInt(pipe.top.style.height) && bubuTop < 600 - parseInt(pipe.bottom.style.height)) {
        bubuScore++;
        bubuScoreDisplay.textContent = bubuScore;
      }
      if (duduTop > parseInt(pipe.top.style.height) && duduTop < 600 - parseInt(pipe.bottom.style.height)) {
        duduScore++;
        duduScoreDisplay.textContent = duduScore;
      }
      pipe.passed = true;
      pipeSpeed += 0.1; // Increase difficulty
    }
  });

  // Power-up logic
  let powerUpLeft = parseInt(window.getComputedStyle(powerUp).getPropertyValue("left"));
  let powerUpTop = parseInt(window.getComputedStyle(powerUp).getPropertyValue("top"));
  if (powerUpLeft < -30) {
    if (Math.random() < 0.01) {
      powerUp.style.display = "block";
      powerUp.style.left = "600px";
      powerUp.style.top = `${Math.floor(Math.random() * 400) + 100}px`;
    }
  } else {
    powerUpLeft -= pipeSpeed;
    powerUp.style.left = powerUpLeft + "px";
  }

  // Check collisions
  pipes.forEach(pipe => {
    const pipeX = pipe.x;
    const topHeight = parseInt(pipe.top.style.height);
    const bottomHeight = parseInt(pipe.bottom.style.height);
    if (bubuTop < topHeight || bubuTop > 600 - bottomHeight) {
      if (pipeX > 60 && pipeX < 140 && !bubuShield) {
        endGame("Dudu Wins! 💜");
        return;
      }
    }
    if (duduTop < topHeight || duduTop > 600 - bottomHeight) {
      if (pipeX > 110 && pipeX < 190 && !duduShield) {
        endGame("Bubu Wins! ❤️");
        return;
      }
    }
  });

  // Power-up collision
  if (powerUpLeft > 60 && powerUpLeft < 140 && Math.abs(bubuTop - powerUpTop) < 40) {
    bubuShield = true;
    powerUp.style.display = "none";
    setTimeout(() => bubuShield = false, 5000);
  }
  if (powerUpLeft > 110 && powerUpLeft < 190 && Math.abs(duduTop - powerUpTop) < 40) {
    duduShield = true;
    powerUp.style.display = "none";
    setTimeout(() => duduShield = false, 5000);
  }

  // Win condition
  if (bubuScore >= 30) {
    endGame("Bubu Wins! ❤️");
    return;
  }
  if (duduScore >= 30) {
    endGame("Dudu Wins! 💜");
    return;
  }

  requestAnimationFrame(gameLoop);
}

// Timer
let timerInterval;
function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    const winner = bubuScore > duduScore ? "Bubu Wins! ❤️" : bubuScore < duduScore ? "Dudu Wins! 💜" : "It's a Tie!";
    endGame(winner);
  }
}

// End game
function endGame(message) {
  gameActive = false;
  clearInterval(timerInterval);
  winScreen.style.display = "block";
  winMessage.textContent = message;
  highScores.push({ player: message.includes("Bubu") ? "Bubu" : "Dudu", score: Math.max(bubuScore, duduScore) });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(highScores));
  updateLeaderboard();
}

// Update leaderboard
function updateLeaderboard() {
  scoreList.innerHTML = "";
  highScores.forEach(score => {
    const li = document.createElement("li");
    li.textContent = `${score.player}: ${score.score}`;
    scoreList.appendChild(li);
  });
}

// Start game
startGame();
