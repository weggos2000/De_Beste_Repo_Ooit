(function () {
  "use strict";

  var canvas = document.getElementById("snake-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var GRID = 20;
  var CELL = canvas.width / GRID;

  var COLORS = {
    bg: "#c8d6a0",
    grid: "#bcc994",
    snakeHead: "#243016",
    snakeBody: "#33421f",
    food: "#7a3b1e"
  };

  var scoreEl = document.getElementById("snake-score");
  var bestEl = document.getElementById("snake-best");
  var overlay = document.getElementById("snake-overlay");
  var overlayText = document.getElementById("snake-overlay-text");
  var startBtn = document.getElementById("snake-start");
  var keyButtons = document.querySelectorAll(".key-btn");

  var STORAGE_KEY = "icw-nokia-snake-best";
  var best = 0;
  try {
    best = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
  } catch (e) {
    best = 0;
  }
  if (bestEl) bestEl.textContent = best;

  var BASE_SPEED = 150;
  var MIN_SPEED = 70;

  var snake, direction, nextDirection, food, score, speed, timer, running, gameOver;

  function resetState() {
    var mid = Math.floor(GRID / 2);
    snake = [
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = BASE_SPEED;
    running = false;
    gameOver = false;
    placeFood();
    updateScore();
    render();
  }

  function placeFood() {
    var options = [];
    for (var x = 0; x < GRID; x++) {
      for (var y = 0; y < GRID; y++) {
        var occupied = snake.some(function (seg) {
          return seg.x === x && seg.y === y;
        });
        if (!occupied) options.push({ x: x, y: y });
      }
    }
    food = options[Math.floor(Math.random() * options.length)];
  }

  function updateScore() {
    if (scoreEl) scoreEl.textContent = score;
  }

  function render() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (var i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL + 0.5);
      ctx.lineTo(canvas.width, i * CELL + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = COLORS.food;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

    snake.forEach(function (seg, i) {
      ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

  function step() {
    direction = nextDirection;
    var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    var hitsWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    var hitsSelf = snake.some(function (seg) {
      return seg.x === head.x && seg.y === head.y;
    });

    if (hitsWall || hitsSelf) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      updateScore();
      placeFood();
      speed = Math.max(MIN_SPEED, BASE_SPEED - score * 4);
      restartTimer();
    } else {
      snake.pop();
    }

    render();
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(step, speed);
  }

  function startGame() {
    if (gameOver) resetState();
    running = true;
    gameOver = false;
    overlay.hidden = true;
    restartTimer();
    canvas.focus();
  }

  function pauseGame() {
    if (!running) return;
    running = false;
    clearInterval(timer);
    showOverlay("Gepauzeerd", "Verder spelen");
  }

  function resumeGame() {
    if (running || gameOver) return;
    running = true;
    overlay.hidden = true;
    restartTimer();
    canvas.focus();
  }

  function endGame() {
    running = false;
    gameOver = true;
    clearInterval(timer);
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(STORAGE_KEY, String(best));
      } catch (e) {
        /* opslag niet beschikbaar, score wordt niet bewaard */
      }
      if (bestEl) bestEl.textContent = best;
    }
    showOverlay("Game over — score " + score, "Opnieuw spelen");
  }

  function showOverlay(text, btnLabel) {
    if (overlayText) overlayText.textContent = text;
    if (startBtn) startBtn.textContent = btnLabel;
    overlay.hidden = false;
  }

  function setDirection(dx, dy) {
    if (direction.x === -dx && direction.y === -dy) return;
    nextDirection = { x: dx, y: dy };
  }

  function handleControl(action) {
    if (action === "pause") {
      if (gameOver) return;
      if (running) pauseGame();
      else resumeGame();
      return;
    }
    if (!running && !gameOver) {
      startGame();
    } else if (!running && gameOver) {
      return;
    }
    var map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    if (map[action]) setDirection(map[action].x, map[action].y);
  }

  var KEY_MAP = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
    " ": "pause"
  };

  canvas.addEventListener("keydown", function (e) {
    var action = KEY_MAP[e.key];
    if (!action) return;
    e.preventDefault();
    handleControl(action);
  });

  canvas.addEventListener("click", function () {
    if (!running) startGame();
    canvas.focus();
  });

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      startGame();
    });
  }

  keyButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleControl(btn.dataset.dir);
      canvas.focus();
    });
  });

  var touchStart = null;
  canvas.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", function (e) {
    if (!touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x;
    var dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      if (!running) startGame();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      handleControl(dx > 0 ? "right" : "left");
    } else {
      handleControl(dy > 0 ? "down" : "up");
    }
  }, { passive: true });

  resetState();
  showOverlay("Klik of druk op een pijltje om te starten", "Start spel");
})();
