document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("player");
  const gameArea = document.getElementById("gameArea");
  let gameInterval;
  let flavors = [];
  let score = 0;
  let timeRemaining = 25;
  let timeLimit = 25000;
  let playerPositionPercentage = 50;
  let flavorCounts = { apple: 0, banana: 0, lemon: 0, orange: 0 };
  let lastTime = 0;

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
    let playerWidth = player.offsetWidth;
    let gameAreaWidth = gameArea.offsetWidth;
    let currentLeft = parseInt(window.getComputedStyle(player).left, 10);
    if (event.key === "ArrowLeft") {
      let newLeft = Math.max(currentLeft - 5, 0);
      player.style.left = `${newLeft}px`;
    } else if (event.key === "ArrowRight") {
      let newLeft = Math.min(currentLeft + 5, gameAreaWidth - playerWidth);
      player.style.left = `${newLeft}px`;
    }
  });

  function animate(currentTime) {
    let delta = currentTime - lastTime; // 計算時間差
    lastTime = currentTime;

    moveFlavors(delta); // 呼叫更新函數並傳遞時間差
    if (timeRemaining > 0) {
      requestAnimationFrame(animate);
    }
  }

  function startGame() {
    flavors.forEach((flavor) => gameArea.removeChild(flavor));
    flavors = [];
    score = 0;
    timeRemaining = 25;
    updateScoreAndTime();
    player.style.left = "45%";

    // 重新設定定時器
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      createFlavor();
      updateTime();
    }, 1000);
    setTimeout(endGame, timeLimit);
    requestAnimationFrame(animate);
  }
  function updateTime() {
    timeRemaining -= 1;
    document.getElementById("timeLeft").textContent = timeRemaining;
    document.getElementById("timeBar").style.width = `${
      (timeRemaining / 25) * 100
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

    let modalContent = document.querySelector("#endGameModal .modal-content");

    // 移除先前存在的圖片
    let existingImages = modalContent.querySelectorAll("img");
    existingImages.forEach((img) => img.remove());

    // 確定最多接到的風味
    let maxFlavor = Object.keys(flavorCounts).reduce((a, b) =>
      flavorCounts[a] > flavorCounts[b] ? a : b
    );
    let imagePath = `images/${maxFlavor}.jpg`;

    // 創建新圖片元素並設置其屬性
    let flavorImage = document.createElement("img");
    flavorImage.src = imagePath;
    flavorImage.style.width = "150px";
    flavorImage.style.height = "auto";

    // 插入圖片到按鈕之前
    let restartButton = document.getElementById("restartBtn");
    modalContent.insertBefore(flavorImage, restartButton);

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
    let attempt = 0;
    do {
      if (flavor) {
        gameArea.removeChild(flavor);
      }
      flavor = document.createElement("div");
      flavor.classList.add("flavor");
      flavor.style.left = `${
        Math.random() * (gameArea.offsetWidth - flavor.offsetWidth)
      }px`;
      flavor.style.top = "0px";

      const flavorType = Math.random();
      if (flavorType < 0.25) {
        flavor.classList.add("apple-flavor");
        flavor.style.backgroundImage = "url('images/apple.jpg')";
      } else if (flavorType < 0.5) {
        flavor.classList.add("banana-flavor");
        flavor.style.backgroundImage = "url('images/banana.jpg')";
      } else if (flavorType < 0.75) {
        flavor.classList.add("lemon-flavor");
        flavor.style.backgroundImage = "url('images/lemon.jpg')";
      } else {
        flavor.classList.add("orange-flavor");
        flavor.style.backgroundImage = "url('images/orange.jpg')";
      }

      gameArea.appendChild(flavor);
      attempt++;
    } while (isOverlapping(flavor) && attempt < 10);

    if (attempt < 10) {
      flavors.push(flavor);
      moveFlavors();
    } else {
      gameArea.removeChild(flavor); // 如果超過嘗試次數，移除
    }
  }

  function moveFlavors(delta) {
    flavors.forEach((fl, index) => {
      let top = parseInt(fl.style.top, 10) + 0.1 * delta; // 控制掉落物速度
      fl.style.top = `${top}px`;

      // 檢查是否與玩家發生碰撞
      if (
        fl.getBoundingClientRect().bottom >=
          player.getBoundingClientRect().top &&
        fl.getBoundingClientRect().bottom <=
          player.getBoundingClientRect().bottom &&
        fl.getBoundingClientRect().left <
          player.getBoundingClientRect().right &&
        fl.getBoundingClientRect().right > player.getBoundingClientRect().left
      ) {
        if (fl.classList.contains("apple-flavor")) {
          score -= 1;
          flavorCounts.apple++;
        } else if (fl.classList.contains("banana-flavor")) {
          score += 1;
          flavorCounts.banana++;
        } else if (fl.classList.contains("lemon-flavor")) {
          score += 2;
          flavorCounts.lemon++;
        } else if (fl.classList.contains("orange-flavor")) {
          score -= 2;
          flavorCounts.orange++;
        }

        updateScoreAndTime();
        gameArea.removeChild(fl);
        flavors.splice(index, 1);
      } else if (top > gameArea.offsetHeight) {
        // 掉落物掉出遊戲區域，需移除
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

    let newLeft =
      (gameArea.offsetWidth * playerPositionPercentage) / 100 -
      player.offsetWidth / 2;

    newLeft = Math.max(
      0,
      Math.min(newLeft, gameArea.offsetWidth - player.offsetWidth)
    );
    player.style.left = `${newLeft}px`;
  }
});
