document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("player");
  const gameArea = document.getElementById("gameArea");
  let gameInterval;
  let flavors = [];
  let score = 0;
  let timeRemaining = 30;
  let timeLimit = 30000;
  let playerPositionPercentage = 50;

  const modal = document.getElementById("myModal");
  const btn = document.getElementById("startBtn");
  const span = document.getElementsByClassName("close")[0];
  const endSpan = document
    .getElementById("endGameModal")
    .getElementsByClassName("close")[0];
  endSpan.onclick = function () {
    document.getElementById("endGameModal").style.display = "none";
  };

  const restartBtn = document.getElementById("restartBtn");
  restartBtn.onclick = function () {
    document.getElementById("endGameModal").style.display = "none";
    startGame();
  };

  window.onload = () => (modal.style.display = "block");
  span.onclick = () => (modal.style.display = "none");
  btn.onclick = () => {
    modal.style.display = "none";
    startGame();
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  document.addEventListener("keydown", (event) => {
    let playerWidth = player.offsetWidth; // 獲取 player 的寬度
    let gameAreaWidth = gameArea.offsetWidth; // 獲取 gameArea 的寬度
    let currentLeft = parseInt(window.getComputedStyle(player).left, 10);

    if (event.key === "ArrowLeft") {
      // 確保 player 不會超出遊戲區域左邊界
      let newLeft = Math.max(currentLeft - 5, 0);
      player.style.left = `${newLeft}px`;
    } else if (event.key === "ArrowRight") {
      // 確保 player 不會超出遊戲區域右邊界
      let newLeft = Math.min(currentLeft + 5, gameAreaWidth - playerWidth);
      player.style.left = `${newLeft}px`;
    }
  });

  function startGame() {
    flavors.forEach((flavor) => gameArea.removeChild(flavor)); // 清除現有的方塊
    flavors = []; // 重置方塊數組
    tasty = {};

    // 重置分數和時間
    score = 0;
    timeRemaining = 30;
    updateScoreAndTime();

    // 重新設定定時器
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      createFlavor();
      updateTime();
    }, 1000);
    setTimeout(endGame, timeLimit);
  }

  function updateTime() {
    timeRemaining -= 1;
    document.getElementById("timeLeft").textContent = timeRemaining;
    document.getElementById("timeBar").style.width = `${
      (timeRemaining / 30) * 100
    }%`;
    if (timeRemaining <= 0) endGame();
  }

  function updateScoreAndTime() {
    document.getElementById("score").textContent = score;
    document.getElementById("timeLeft").textContent = timeRemaining;
  }

  function endGame() {
    clearInterval(gameInterval);
    document.getElementById("finalScore").textContent = "總分：" + score;
    const endModal = document.getElementById("endGameModal");
    endModal.style.display = "block";
  }

  function isOverlapping(newFlavor) {
    return flavors.some((flavor) => {
      const existingRect = flavor.getBoundingClientRect();
      const newRect = newFlavor.getBoundingClientRect();
      return !(
        existingRect.right < newRect.left ||
        existingRect.left > newRect.right ||
        existingRect.bottom < newRect.top ||
        existingRect.top > newRect.bottom
      );
    });
  }

  function createFlavor() {
    let flavor;
    let attempt = 0; // 防止無窮迴圈
    do {
      if (flavor) {
        gameArea.removeChild(flavor); // 如果重疊就移除上一個嘗試
      }
      flavor = document.createElement("div");
      flavor.classList.add("flavor");
      flavor.style.left = Math.random() * (gameArea.offsetWidth - 20) + "px";
      flavor.style.top = "0px";

      // 隨機選擇顏色和類別
      const flavorType = Math.random();
      if (flavorType < 0.2) {
        flavor.classList.add("red-flavor");
        flavor.style.backgroundColor = "red";
      } else if (flavorType < 0.4) {
        flavor.classList.add("blue-flavor");
        flavor.style.backgroundColor = "blue";
      } else if (flavorType < 0.6) {
        flavor.classList.add("green-flavor");
        flavor.style.backgroundColor = "green";
      } else {
        flavor.classList.add("yellow-flavor");
        flavor.style.backgroundColor = "yellow";
      }

      gameArea.appendChild(flavor);
      attempt++;
    } while (isOverlapping(flavor) && attempt < 10); // 嘗試最多10次避免重疊

    if (attempt < 10) {
      flavors.push(flavor);
      moveFlavors();
    } else {
      gameArea.removeChild(flavor); // 如果超過嘗試次數，移除最後一個
    }
  }

  function moveFlavors() {
    flavors.forEach((fl, index) => {
      fl.style.top = `${parseInt(fl.style.top) + 15}px`;
      if (
        fl.getBoundingClientRect().bottom >=
          player.getBoundingClientRect().top &&
        fl.getBoundingClientRect().bottom <=
          player.getBoundingClientRect().bottom &&
        fl.getBoundingClientRect().left <
          player.getBoundingClientRect().right &&
        fl.getBoundingClientRect().right > player.getBoundingClientRect().left
      ) {
        if (fl.classList.contains("red-flavor")) {
          score -= 1;
        } else if (fl.classList.contains("blue-flavor")) {
          score += 1;
        } else if (fl.classList.contains("green-flavor")) {
          score += 2;
        } else if (fl.classList.contains("yellow-flavor")) {
          score -= 2;
        }
        updateScoreAndTime();
        gameArea.removeChild(fl);
        flavors.splice(index, 1);
      }
    });
  }

  document
    .getElementById("moveLeft")
    .addEventListener("click", () => adjustPosition(-5));
  document
    .getElementById("moveRight")
    .addEventListener("click", () => adjustPosition(5));
  document
    .getElementById("moveLeft")
    .addEventListener("touchstart", (e) => adjustPosition(-5, e));
  document
    .getElementById("moveRight")
    .addEventListener("touchstart", (e) => adjustPosition(5, e));

  function adjustPosition(change, e = null) {
    if (e) e.preventDefault();
    playerPositionPercentage = Math.min(
      Math.max(playerPositionPercentage + change, 0),
      100
    );
    player.style.left = `calc(${playerPositionPercentage}% - 15px)`;
  }
});
