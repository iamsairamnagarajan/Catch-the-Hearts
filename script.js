const bubu = document.getElementById("bubu");
const dudu = document.getElementById("dudu");
const heart = document.getElementById("heart");
const bubuScoreDisplay = document.getElementById("bubuScore");
const duduScoreDisplay = document.getElementById("duduScore");
const winScreen = document.getElementById("winScreen");
const winMessage = document.getElementById("winMessage");
let bubuScore = 0;
let duduScore = 0;
let heartSpeed = 5;
let gameActive = true;

// Move Bubu (Keyboard)
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  let bubuLeft = parseInt(window.getComputedStyle(bubu).getPropertyValue("left"));
  if (e.key === "ArrowLeft" && bubuLeft > 0) {
    bubu.style.left = bubuLeft - 15 + "px";
  } else if (e.key === "ArrowRight" && bubuLeft < 350) {
    bubu.style.left = bubuLeft + 15 + "px";
  }
});

// Drop Heart and Move Dudu (AI)
function dropHeart() {
  if (!gameActive) return;
  let heartTop = 0;
  let heartLeft = Math.floor(Math.random() * 370);
  heart.style.left = heartLeft + "px";

  let fall = setInterval(() => {
    if (!gameActive) {
      clearInterval(fall);
      return;
    }
    heartTop += heartSpeed;
    heart.style.top = heartTop + "px";

    // Move Dudu (AI follows heart)
    let duduLeft = parseInt(window.getComputedStyle(dudu).getPropertyValue("left"));
    let heartLeftNow = parseInt(window.getComputedStyle(heart).getPropertyValue("left"));
    if (duduLeft < heartLeftNow && duduLeft < 350) {
      dudu.style.left = duduLeft + 10 + "px";
    } else if (duduLeft > heartLeftNow && duduLeft > 0) {
      dudu.style.left = duduLeft - 10 + "px";
    }

    // Check collision
    let bubuLeft = parseInt(window.getComputedStyle(bubu).getPropertyValue("left"));
    if (heartTop > 450) {
      if (Math.abs(bubuLeft - heartLeftNow) < 40) {
        bubuScore++;
        bubuScoreDisplay.textContent = bubuScore;
      } else if (Math.abs(duduLeft - heartLeftNow) < 40) {
        duduScore++;
        duduScoreDisplay.textContent = duduScore;
      }
      // Reset heart
      heartTop = 0;
      heart.style.top = heartTop + "px";
      heart.style.left = Math.floor(Math.random() * 370) + "px";
      // Increase difficulty
      heartSpeed += 0.2;
      // Check win condition
      if (bubuScore >= 20 || duduScore >= 20) {
        gameActive = false;
        clearInterval(fall);
        winScreen.style.display = "block";
        winMessage.textContent = bubuScore >= 20 ? "Bubu Wins! ❤️" : "Dudu Wins! 💜";
      }
    }
  }, 30);
}

dropHeart();
