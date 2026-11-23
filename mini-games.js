/**
 * 過關小禮物：3 款精品風格迷你獎勵小遊戲
 * 1. 金幣星光接接樂 (catcher)
 * 2. 精品記憶翻牌 (memory)
 * 3. 秘境寶箱敲敲樂 (whack)
 */
(function () {
  let activeCleanup = null;

  function stopCurrentGame() {
    if (typeof activeCleanup === "function") {
      activeCleanup();
      activeCleanup = null;
    }
  }

  // ==================== 遊戲 1：金幣星光接接樂（60FPS 純向量極速版，零卡頓！） ====================
  function startCatcherGame(container, onFinish) {
    stopCurrentGame();
    container.innerHTML = `
      <div class="mg-header">
        <span>🌟 金幣星光接接樂（左右滑動或用方向鍵接金星與寶石，躲開灰雲！）</span>
        <span class="mg-hud">得分：<strong id="mg-score">0</strong>　｜　剩餘：<strong id="mg-time">15</strong> 秒</span>
      </div>
      <canvas id="mg-canvas" width="520" height="300" class="mg-canvas"></canvas>
    `;
    const canvas = container.querySelector("#mg-canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    const scoreEl = container.querySelector("#mg-score");
    const timeEl = container.querySelector("#mg-time");

    // 快取背景漸層與矩形尺寸（避免每幀/每次滑動觸發重排與重建）
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#3a2d24");
    bgGrad.addColorStop(1, "#5c4636");

    let cachedRect = canvas.getBoundingClientRect();
    const updateRect = () => { cachedRect = canvas.getBoundingClientRect(); };

    let basketX = 260;
    let targetX = 260;
    const basketW = 90;
    let score = 0;
    let timeLeft = 15;
    let items = [];
    let rafId = null;
    let running = true;
    let lastTs = performance.now();
    const keys = { left: false, right: false };

    function drawStar(x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        const a2 = ((i * 72) + 36 - 90) * Math.PI / 180;
        if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x + Math.cos(a2) * (r * 0.48), y + Math.sin(a2) * (r * 0.48));
      }
      ctx.closePath();
      ctx.fillStyle = "#ffd55a";
      ctx.fill();
      ctx.strokeStyle = "#d9891c";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawGem(x, y, r) {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.85, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.85, y);
      ctx.closePath();
      ctx.fillStyle = "#ff8b85";
      ctx.fill();
      ctx.strokeStyle = "#fff5f4";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawCloud(x, y, r) {
      ctx.fillStyle = "#9aa5a0";
      ctx.beginPath();
      ctx.arc(x - r * 0.45, y + 2, r * 0.55, 0, Math.PI * 2);
      ctx.arc(x + r * 0.45, y + 2, r * 0.52, 0, Math.PI * 2);
      ctx.arc(x, y - r * 0.25, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    function spawnItem() {
      const rnd = Math.random();
      const kind = rnd < 0.2 ? "bad" : rnd < 0.44 ? "gem" : "star";
      items.push({
        x: 28 + Math.random() * (canvas.width - 56),
        y: -18,
        vy: 150 + Math.random() * 125, // px per second
        kind,
        pts: kind === "bad" ? -10 : kind === "gem" ? 30 : 10
      });
    }

    const spawnTimer = setInterval(spawnItem, 440);
    const countdown = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) finish();
    }, 1000);

    function movePointer(clientX) {
      if (!cachedRect.width) updateRect();
      const relX = ((clientX - cachedRect.left) / cachedRect.width) * canvas.width;
      targetX = Math.max(basketW / 2, Math.min(canvas.width - basketW / 2, relX));
    }

    const onPointerMove = (e) => {
      movePointer(e.clientX);
    };
    const onPointerDown = (e) => {
      updateRect();
      movePointer(e.clientX);
    };
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", updateRect);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function loop(ts) {
      if (!running) return;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (keys.left) targetX = Math.max(basketW / 2, targetX - 420 * dt);
      if (keys.right) targetX = Math.min(canvas.width - basketW / 2, targetX + 420 * dt);
      // 絲滑跟隨游標
      basketX += (targetX - basketX) * Math.min(1, dt * 24);

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 畫金邊禮物寶箱（純向量極速）
      const bx = basketX - basketW / 2;
      const by = canvas.height - 40;
      ctx.fillStyle = "#f2a43b";
      ctx.beginPath();
      ctx.roundRect(bx, by, basketW, 26, 9);
      ctx.fill();
      ctx.strokeStyle = "#fff4dc";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // 寶箱蝴蝶結緞帶
      ctx.fillStyle = "#f07470";
      ctx.fillRect(basketX - 6, by + 1, 12, 24);
      ctx.fillRect(bx + 2, by + 10, basketW - 4, 6);

      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy * dt;

        if (it.kind === "star") drawStar(it.x, it.y, 14);
        else if (it.kind === "gem") drawGem(it.x, it.y, 14);
        else drawCloud(it.x, it.y, 15);

        if (it.y >= by - 8 && it.y <= by + 26 && Math.abs(it.x - basketX) <= basketW / 2 + 12) {
          score = Math.max(0, score + it.pts);
          scoreEl.textContent = String(score);
          if (it.pts > 0) window.SoundFX.playClick();
          else window.SoundFX.playWrong();
          items.splice(i, 1);
          continue;
        }
        if (it.y > canvas.height + 24) items.splice(i, 1);
      }
      rafId = requestAnimationFrame(loop);
    }
    spawnItem();
    rafId = requestAnimationFrame(loop);

    function cleanup() {
      running = false;
      clearInterval(spawnTimer);
      clearInterval(countdown);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }

    function finish() {
      cleanup();
      window.SoundFX.playFanfare(3);
      window.VisualFX.burstConfetti();
      if (onFinish) onFinish(score, "金幣星光接接樂");
    }

    activeCleanup = cleanup;
  }

  // ==================== 遊戲 2：精品記憶翻牌 ====================
  function startMemoryGame(container, onFinish) {
    stopCurrentGame();
    const icons = ["👑", "💎", "🧭", "🏆"];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    container.innerHTML = `
      <div class="mg-header">
        <span>🃏 寶藏記憶翻牌（找出 4 對相同的寶藏牌！）</span>
        <span class="mg-hud">已配對：<strong id="mg-match">0 / 4</strong>　｜　步數：<strong id="mg-moves">0</strong></span>
      </div>
      <div class="mg-memory-grid" id="mg-mem-grid"></div>
    `;
    const grid = container.querySelector("#mg-mem-grid");
    const matchEl = container.querySelector("#mg-match");
    const movesEl = container.querySelector("#mg-moves");

    deck.forEach((icon, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-mem-card";
      btn.dataset.icon = icon;
      btn.dataset.idx = String(idx);
      btn.innerHTML = `<span class="mg-mem-front">✦</span><span class="mg-mem-back">${icon}</span>`;
      btn.addEventListener("click", () => {
        if (locked || btn.classList.contains("open") || btn.classList.contains("matched")) return;
        window.SoundFX.playClick();
        btn.classList.add("open");
        flipped.push(btn);
        if (flipped.length === 2) {
          moves += 1;
          movesEl.textContent = String(moves);
          locked = true;
          const [a, b] = flipped;
          if (a.dataset.icon === b.dataset.icon) {
            a.classList.add("matched");
            b.classList.add("matched");
            matched += 1;
            matchEl.textContent = `${matched} / 4`;
            window.SoundFX.playCorrect(matched);
            flipped = [];
            locked = false;
            if (matched === 4) {
              const score = Math.max(60, 180 - moves * 10);
              setTimeout(() => {
                window.SoundFX.playFanfare(3);
                window.VisualFX.burstConfetti();
                if (onFinish) onFinish(score, "寶藏記憶翻牌");
              }, 350);
            }
          } else {
            setTimeout(() => {
              a.classList.remove("open");
              b.classList.remove("open");
              flipped = [];
              locked = false;
            }, 620);
          }
        }
      });
      grid.appendChild(btn);
    });

    activeCleanup = () => {};
  }

  // ==================== 遊戲 3：秘境寶箱敲敲樂 ====================
  function startWhackGame(container, onFinish) {
    stopCurrentGame();
    let score = 0;
    let timeLeft = 12;
    let activeIdx = -1;

    container.innerHTML = `
      <div class="mg-header">
        <span>🎯 秘境寶箱敲敲樂（快點擊冒出來的發光金寶箱！）</span>
        <span class="mg-hud">得分：<strong id="mg-w-score">0</strong>　｜　剩餘：<strong id="mg-w-time">12</strong> 秒</span>
      </div>
      <div class="mg-whack-grid" id="mg-whack-grid"></div>
    `;
    const grid = container.querySelector("#mg-whack-grid");
    const scoreEl = container.querySelector("#mg-w-score");
    const timeEl = container.querySelector("#mg-w-time");

    const holes = [];
    for (let i = 0; i < 9; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-hole";
      btn.innerHTML = `<span class="mg-mole"></span>`;
      btn.addEventListener("click", () => {
        if (i !== activeIdx) return;
        const isGold = btn.dataset.gold === "1";
        score += isGold ? 25 : 15;
        scoreEl.textContent = String(score);
        window.SoundFX.playCorrect(isGold ? 3 : 1);
        btn.classList.remove("up");
        btn.querySelector(".mg-mole").textContent = "✨";
        activeIdx = -1;
      });
      grid.appendChild(btn);
      holes.push(btn);
    }

    function popOne() {
      holes.forEach((h) => {
        h.classList.remove("up");
        h.querySelector(".mg-mole").textContent = "";
      });
      activeIdx = Math.floor(Math.random() * 9);
      const isGold = Math.random() < 0.3;
      holes[activeIdx].dataset.gold = isGold ? "1" : "0";
      holes[activeIdx].querySelector(".mg-mole").textContent = isGold ? "👑" : "🎁";
      holes[activeIdx].classList.add("up");
    }

    popOne();
    const popTimer = setInterval(popOne, 720);
    const countdown = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        cleanup();
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti();
        if (onFinish) onFinish(score, "秘境寶箱敲敲樂");
      }
    }, 1000);

    function cleanup() {
      clearInterval(popTimer);
      clearInterval(countdown);
    }
    activeCleanup = cleanup;
  }

  // ==================== 遊戲 4：幸運金幣大轉盤 ====================
  function startWheelGame(container, onFinish) {
    stopCurrentGame();
    const prizes = [
      { label: "🪙 30", val: 30, color: "#ffe5b4" },
      { label: "🪙 80", val: 80, color: "#c9eadc" },
      { label: "🪙 50", val: 50, color: "#ffd3cf" },
      { label: "👑 200", val: 200, color: "#ffd57e" },
      { label: "🪙 40", val: 40, color: "#e6faee" },
      { label: "💎 120", val: 120, color: "#ffb8b1" }
    ];
    let angle = 0;
    let spinning = false;
    let rafId = null;

    container.innerHTML = `
      <div class="mg-header">
        <span>🎡 幸運金幣大轉盤（按下按鈕試試手氣，最高抽 200 金幣！）</span>
      </div>
      <div class="mg-wheel-wrap">
        <div class="mg-wheel-pointer">▼</div>
        <canvas id="mg-wheel-canvas" width="280" height="280" class="mg-wheel-canvas"></canvas>
        <button type="button" class="btn btn-gold btn-lg" id="btn-spin-wheel">🎯 轉動幸運轉盤！</button>
      </div>
    `;

    const canvas = container.querySelector("#mg-wheel-canvas");
    const ctx = canvas.getContext("2d");
    const spinBtn = container.querySelector("#btn-spin-wheel");

    function drawWheel(rot) {
      const cx = 140, cy = 140, r = 128;
      const slice = (Math.PI * 2) / prizes.length;
      ctx.clearRect(0, 0, 280, 280);
      prizes.forEach((p, i) => {
        const a1 = rot + i * slice;
        const a2 = a1 + slice;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a1, a2);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = "#fffdf7";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a1 + slice / 2);
        ctx.fillStyle = "#5a4031";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(p.label, r - 18, 6);
        ctx.restore();
      });
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#f2a43b";
      ctx.fill();
      ctx.strokeStyle = "#fffdf7";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    drawWheel(angle);

    spinBtn.addEventListener("click", () => {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      spinBtn.textContent = "旋轉中… 🍀";
      let velocity = 0.34 + Math.random() * 0.16;

      function tick() {
        angle += velocity;
        velocity *= 0.978;
        drawWheel(angle);
        if (velocity > 0.004) {
          rafId = requestAnimationFrame(tick);
        } else {
          // 指標在正上方 (-PI/2)
          const slice = (Math.PI * 2) / prizes.length;
          const norm = ((-Math.PI / 2 - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const idx = Math.floor(norm / slice) % prizes.length;
          const won = prizes[idx];
          window.SoundFX.playFanfare(3);
          window.VisualFX.burstConfetti();
          spinBtn.textContent = `🎉 抽中 ${won.label} 金幣！`;
          if (onFinish) onFinish(won.val, "幸運金幣大轉盤");
        }
      }
      window.SoundFX.playClick();
      rafId = requestAnimationFrame(tick);
    });

    activeCleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  // ==================== 遊戲 5：數字彩虹戳泡泡 ====================
  function startBubbleGame(container, onFinish) {
    stopCurrentGame();
    const wantEven = Math.random() > 0.5;
    const ruleText = wantEven ? "只戳破「偶數（2、4、6、8…）」泡泡！" : "只戳破「奇數（1、3、5、7…）」泡泡！";
    let score = 0;
    let timeLeft = 15;
    let bubbles = [];
    let running = true;
    let rafId = null;

    container.innerHTML = `
      <div class="mg-header">
        <span>🫧 ${ruleText}</span>
        <span class="mg-hud">得分：<strong id="mg-b-score">0</strong>　｜　剩餘：<strong id="mg-b-time">15</strong> 秒</span>
      </div>
      <canvas id="mg-bubble-canvas" width="520" height="300" class="mg-canvas"></canvas>
    `;
    const canvas = container.querySelector("#mg-bubble-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = container.querySelector("#mg-b-score");
    const timeEl = container.querySelector("#mg-b-time");
    const colors = ["#ff9a9e", "#f6b93b", "#64c48a", "#f0897c", "#d4943a"];

    function spawnBubble() {
      const n = Math.floor(Math.random() * 49) + 1;
      bubbles.push({
        x: 40 + Math.random() * (canvas.width - 80),
        y: canvas.height + 28,
        r: 26,
        vy: 1.4 + Math.random() * 1.4,
        num: n,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const spawnTimer = setInterval(spawnBubble, 520);
    const countdown = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) finish();
    }, 1000);

    function onClick(ev) {
      const rect = canvas.getBoundingClientRect();
      const px = ((ev.clientX - rect.left) / rect.width) * canvas.width;
      const py = ((ev.clientY - rect.top) / rect.height) * canvas.height;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (Math.hypot(px - b.x, py - b.y) <= b.r + 6) {
          const isMatch = wantEven ? b.num % 2 === 0 : b.num % 2 === 1;
          if (isMatch) {
            score += 20;
            window.SoundFX.playCorrect(2);
          } else {
            score = Math.max(0, score - 10);
            window.SoundFX.playWrong();
          }
          scoreEl.textContent = String(score);
          bubbles.splice(i, 1);
          break;
        }
      }
    }
    canvas.addEventListener("pointerdown", onClick);

    function loop() {
      if (!running) return;
      ctx.fillStyle = "#fff8ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.vy;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "900 19px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(b.num), b.x, b.y + 7);

        if (b.y < -32) bubbles.splice(i, 1);
      }
      rafId = requestAnimationFrame(loop);
    }
    spawnBubble();
    rafId = requestAnimationFrame(loop);

    function cleanup() {
      running = false;
      clearInterval(spawnTimer);
      clearInterval(countdown);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", onClick);
    }

    function finish() {
      cleanup();
      window.SoundFX.playFanfare(3);
      window.VisualFX.burstConfetti();
      if (onFinish) onFinish(Math.max(20, score), "數字彩虹戳泡泡");
    }
    activeCleanup = cleanup;
  }

  // ==================== 遊戲 6：湊 10 糖果消消樂 ====================
  function startMake10Game(container, onFinish) {
    stopCurrentGame();
    const pairs = [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [2, 8]];
    const nums = pairs.flat().sort(() => Math.random() - 0.5);
    let selectedBtn = null;
    let cleared = 0;
    let score = 0;

    container.innerHTML = `
      <div class="mg-header">
        <span>🍬 湊 10 糖果消消樂（點兩顆加起來等於 10 的糖果消除！）</span>
        <span class="mg-hud">已消除：<strong id="mg-10-cnt">0 / 6 對</strong></span>
      </div>
      <div class="mg-candy-grid" id="mg-candy-grid"></div>
    `;
    const grid = container.querySelector("#mg-candy-grid");
    const cntEl = container.querySelector("#mg-10-cnt");

    nums.forEach((n) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-candy-btn";
      btn.dataset.val = String(n);
      btn.textContent = String(n);
      btn.addEventListener("click", () => {
        if (btn.classList.contains("cleared")) return;
        window.SoundFX.playClick();
        if (!selectedBtn) {
          selectedBtn = btn;
          btn.classList.add("selected");
          return;
        }
        if (selectedBtn === btn) {
          btn.classList.remove("selected");
          selectedBtn = null;
          return;
        }
        const sum = Number(selectedBtn.dataset.val) + Number(btn.dataset.val);
        if (sum === 10) {
          selectedBtn.classList.remove("selected");
          selectedBtn.classList.add("cleared");
          btn.classList.add("cleared");
          selectedBtn = null;
          cleared += 1;
          score += 25;
          cntEl.textContent = `${cleared} / 6 對`;
          window.SoundFX.playCorrect(cleared);
          if (cleared === 6) {
            setTimeout(() => {
              window.SoundFX.playFanfare(3);
              window.VisualFX.burstConfetti();
              if (onFinish) onFinish(score, "湊 10 糖果消消樂");
            }, 300);
          }
        } else {
          window.SoundFX.playWrong();
          const prev = selectedBtn;
          selectedBtn = null;
          btn.classList.add("wrong-flash");
          prev.classList.add("wrong-flash");
          setTimeout(() => {
            prev.classList.remove("selected", "wrong-flash");
            btn.classList.remove("wrong-flash");
          }, 360);
        }
      });
      grid.appendChild(btn);
    });

    activeCleanup = () => {};
  }

  // ==================== 遊戲 7：🎲 骰子比大小 ====================
  function startDiceGame(container, onFinish) {
    stopCurrentGame();
    const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    let round = 1;
    const totalRounds = 3;
    let coins = 0;
    let rolling = false;
    let rollTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎲 骰子比大小（共 3 回合）</span>
        <span id="mg-dice-round">第 1 / 3 回合</span>
        <span id="mg-dice-coins">金幣：0</span>
      </div>
      <div class="mg-dice-arena">
        <div class="mg-dice-side">
          <div class="mg-dice-who">🧑 你的骰子</div>
          <div class="mg-dice-pair" id="mg-dice-you"><span>🎲</span><span>🎲</span></div>
          <div class="mg-dice-sum" id="mg-dice-you-sum">等待擲骰</div>
        </div>
        <div class="mg-dice-vs">VS</div>
        <div class="mg-dice-side">
          <div class="mg-dice-who">🐶 柴柴島主</div>
          <div class="mg-dice-pair" id="mg-dice-cpu"><span>🎲</span><span>🎲</span></div>
          <div class="mg-dice-sum" id="mg-dice-cpu-sum">準備好了</div>
        </div>
      </div>
      <div id="mg-dice-msg" class="mg-status-line">按下「擲骰子」，點數總和比柴柴大就贏得 +40 金幣！</div>
      <div style="text-align:center;margin-top:12px;">
        <button type="button" class="btn btn-gold btn-lg" id="mg-dice-roll-btn">🎲 擲骰子！</button>
      </div>
    `;

    const youEl = container.querySelector("#mg-dice-you");
    const cpuEl = container.querySelector("#mg-dice-cpu");
    const youSumEl = container.querySelector("#mg-dice-you-sum");
    const cpuSumEl = container.querySelector("#mg-dice-cpu-sum");
    const msgEl = container.querySelector("#mg-dice-msg");
    const roundEl = container.querySelector("#mg-dice-round");
    const coinsEl = container.querySelector("#mg-dice-coins");
    const rollBtn = container.querySelector("#mg-dice-roll-btn");

    rollBtn.addEventListener("click", () => {
      if (rolling || round > totalRounds) return;
      rolling = true;
      rollBtn.disabled = true;
      window.SoundFX.playClick();
      let ticks = 0;
      rollTimer = setInterval(() => {
        ticks += 1;
        const a = 1 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * 6);
        const c = 1 + Math.floor(Math.random() * 6);
        const d = 1 + Math.floor(Math.random() * 6);
        youEl.innerHTML = `<span class="mg-die-face">${FACES[a]}</span><span class="mg-die-face">${FACES[b]}</span>`;
        cpuEl.innerHTML = `<span class="mg-die-face">${FACES[c]}</span><span class="mg-die-face">${FACES[d]}</span>`;
        if (ticks >= 9) {
          clearInterval(rollTimer);
          rollTimer = null;
          const mySum = a + b;
          const cpuSum = c + d;
          youSumEl.textContent = `總和 ${mySum} 點`;
          cpuSumEl.textContent = `總和 ${cpuSum} 點`;
          if (mySum > cpuSum) {
            coins += 40;
            msgEl.textContent = `🎉 太棒了！${mySum} 點贏過 ${cpuSum} 點，獲得 +40 金幣！`;
            window.SoundFX.playCorrect(round);
          } else if (mySum === cpuSum) {
            coins += 25;
            msgEl.textContent = `🤝 平手默契獎！雙方都是 ${mySum} 點，獲得 +25 金幣！`;
            window.SoundFX.playCorrect(1);
          } else {
            coins += 15;
            msgEl.textContent = `🐶 柴柴險勝一點點，送你參加鼓勵獎 +15 金幣！`;
            window.SoundFX.playClick();
          }
          coinsEl.textContent = `金幣：${coins}`;
          round += 1;
          if (round > totalRounds) {
            rollBtn.textContent = "結算金幣中…";
            setTimeout(() => {
              window.SoundFX.playFanfare(3);
              window.VisualFX.burstConfetti();
              if (onFinish) onFinish(coins, "骰子比大小");
            }, 900);
          } else {
            roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
            rolling = false;
            rollBtn.disabled = false;
          }
        }
      }, 70);
    });

    activeCleanup = () => {
      if (rollTimer) clearInterval(rollTimer);
    };
  }

  // ==================== 遊戲 8：🗝️ 寶箱三選一 ====================
  function startChestGame(container, onFinish) {
    stopCurrentGame();
    let round = 1;
    const totalRounds = 2;
    let totalCoins = 0;
    let picked = false;
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🗝️ 寶箱三選一（共 2 回合）</span>
        <span id="mg-chest-round">第 1 / 2 回合</span>
        <span id="mg-chest-coins">金幣：0</span>
      </div>
      <div id="mg-chest-msg" class="mg-status-line">三個神祕寶箱裡藏著 25、45、80 金幣，憑直覺點開一個吧！</div>
      <div class="mg-chest-grid" id="mg-chest-grid"></div>
    `;

    const grid = container.querySelector("#mg-chest-grid");
    const msgEl = container.querySelector("#mg-chest-msg");
    const roundEl = container.querySelector("#mg-chest-round");
    const coinsEl = container.querySelector("#mg-chest-coins");

    function renderRound() {
      picked = false;
      roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
      const prizes = [80, 45, 25].sort(() => Math.random() - 0.5);
      const labels = ["左邊寶箱", "中間寶箱", "右邊寶箱"];
      grid.innerHTML = "";
      prizes.forEach((val, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mg-chest-card";
        btn.innerHTML = `<span class="mg-chest-emoji">🧰</span><strong>${labels[idx]}</strong><span class="mg-chest-prize">點我開啟</span>`;
        btn.addEventListener("click", () => {
          if (picked) return;
          picked = true;
          totalCoins += val;
          coinsEl.textContent = `金幣：${totalCoins}`;
          if (val === 80) window.SoundFX.playFanfare(3);
          else window.SoundFX.playCorrect(2);
          msgEl.textContent = val === 80
            ? `✨ 超級好運！開出最大獎 +80 金幣！`
            : `🎉 打開「${labels[idx]}」，獲得 +${val} 金幣！`;

          Array.from(grid.children).forEach((card, i) => {
            card.disabled = true;
            const p = prizes[i];
            card.classList.add(i === idx ? "picked" : "revealed");
            card.querySelector(".mg-chest-emoji").textContent = p === 80 ? "👑" : p === 45 ? "💰" : "🪙";
            card.querySelector(".mg-chest-prize").textContent = `+${p} 金幣`;
          });

          nextTimer = setTimeout(() => {
            round += 1;
            if (round > totalRounds) {
              window.VisualFX.burstConfetti();
              if (onFinish) onFinish(totalCoins, "寶箱三選一");
            } else {
              msgEl.textContent = "第 2 回合！三個寶箱重新洗牌完畢，再挑一個吧！";
              renderRound();
            }
          }, 1150);
        });
        grid.appendChild(btn);
      });
    }

    renderRound();
    activeCleanup = () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 9：🎣 海岸釣金魚 ====================
  function startFishingGame(container, onFinish) {
    stopCurrentGame();
    let timeLeft = 16;
    let coins = 0;
    let finished = false;
    let spawnTimer = null;
    let countTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎣 海岸釣金魚（點金魚、海星、珍珠，避開舊靴子！）</span>
        <span id="mg-fish-time">剩餘 16 秒</span>
        <span id="mg-fish-coins">金幣：0</span>
      </div>
      <div id="mg-pond" class="mg-pond"></div>
    `;

    const pond = container.querySelector("#mg-pond");
    const timeEl = container.querySelector("#mg-fish-time");
    const coinsEl = container.querySelector("#mg-fish-coins");

    const ITEMS = [
      { icon: "🐠", val: 15, label: "+15" },
      { icon: "🐡", val: 20, label: "+20" },
      { icon: "🌟", val: 25, label: "+25" },
      { icon: "🦪", val: 40, label: "+40" },
      { icon: "🥾", val: -10, label: "-10" },
    ];

    function spawnFish() {
      if (finished) return;
      const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const el = document.createElement("button");
      el.type = "button";
      el.className = "mg-fish-item";
      el.textContent = pick.icon;
      const topPct = 10 + Math.random() * 72;
      const fromLeft = Math.random() > 0.5;
      el.style.top = `${topPct}%`;
      el.style.left = fromLeft ? "-12%" : "104%";
      el.style.transition = `left ${2.2 + Math.random() * 1.4}s linear`;
      pond.appendChild(el);

      requestAnimationFrame(() => {
        el.style.left = fromLeft ? "106%" : "-14%";
      });

      el.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        if (finished || el.dataset.caught) return;
        el.dataset.caught = "1";
        coins = Math.max(0, coins + pick.val);
        coinsEl.textContent = `金幣：${coins}`;
        if (pick.val > 0) window.SoundFX.playCorrect(1);
        else window.SoundFX.playWrong();

        const pop = document.createElement("span");
        pop.className = `mg-fish-pop ${pick.val > 0 ? "good" : "bad"}`;
        pop.textContent = pick.label;
        pop.style.left = el.offsetLeft + "px";
        pop.style.top = el.offsetTop + "px";
        pond.appendChild(pop);
        el.remove();
        setTimeout(() => pop.remove(), 650);
      });

      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 3900);
    }

    spawnFish();
    spawnFish();
    spawnTimer = setInterval(spawnFish, 650);

    countTimer = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = `剩餘 ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        finished = true;
        clearInterval(spawnTimer);
        clearInterval(countTimer);
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti();
        if (onFinish) onFinish(Math.max(20, coins), "海岸釣金魚");
      }
    }, 1000);

    activeCleanup = () => {
      finished = true;
      clearInterval(spawnTimer);
      clearInterval(countTimer);
    };
  }

  // ==================== 遊戲 10：🎨 找不同色塊 ====================
  function startColorGame(container, onFinish) {
    stopCurrentGame();
    let timeLeft = 18;
    let found = 0;
    let coins = 0;
    let finished = false;
    let countTimer = null;

    // 暖色系馬卡龍配色（完全避開亮藍色）
    const PALETTES = [
      { base: "#F6B89E", odd: "#E88B68" },
      { base: "#F5D782", odd: "#E5B43C" },
      { base: "#A9D9B4", odd: "#6FBF82" },
      { base: "#E7B7D2", odd: "#D484B0" },
      { base: "#E8C5A0", odd: "#D29B63" },
      { base: "#B8DEC9", odd: "#7DC49D" },
      { base: "#F2C0B3", odd: "#E28E7A" },
    ];

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎨 找不同色塊（點出顏色不一樣的那一格！）</span>
        <span id="mg-col-time">剩餘 18 秒</span>
        <span id="mg-col-coins">找到 0 題・0 金幣</span>
      </div>
      <div id="mg-color-grid" class="mg-color-grid"></div>
    `;

    const grid = container.querySelector("#mg-color-grid");
    const timeEl = container.querySelector("#mg-col-time");
    const coinsEl = container.querySelector("#mg-col-coins");

    function renderBoard() {
      const size = found >= 3 ? 4 : 3;
      const total = size * size;
      const oddIdx = Math.floor(Math.random() * total);
      const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      grid.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "mg-color-cell";
        cell.style.background = i === oddIdx ? pal.odd : pal.base;
        cell.setAttribute("aria-label", `色塊 ${i + 1}`);
        cell.addEventListener("click", () => {
          if (finished) return;
          if (i === oddIdx) {
            found += 1;
            coins += 20;
            coinsEl.textContent = `找到 ${found} 題・${coins} 金幣`;
            window.SoundFX.playCorrect(found);
            renderBoard();
          } else {
            window.SoundFX.playWrong();
            cell.classList.add("wrong-flash");
            setTimeout(() => cell.classList.remove("wrong-flash"), 300);
          }
        });
        grid.appendChild(cell);
      }
    }

    renderBoard();
    countTimer = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = `剩餘 ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        finished = true;
        clearInterval(countTimer);
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti();
        if (onFinish) onFinish(Math.max(20, coins), "找不同色塊");
      }
    }, 1000);

    activeCleanup = () => {
      finished = true;
      clearInterval(countTimer);
    };
  }

  // ==================== 遊戲 11：🎹 記憶小鋼琴 ====================
  function startSimonGame(container, onFinish) {
    stopCurrentGame();
    const KEYS = [
      { id: 0, name: "Do", freq: 261.63, color: "#FF9F87" },
      { id: 1, name: "Re", freq: 293.66, color: "#FFD66B" },
      { id: 2, name: "Mi", freq: 329.63, color: "#8ED1A2" },
      { id: 3, name: "Sol", freq: 392.00, color: "#D9A7E0" },
    ];
    let round = 1;
    const maxRounds = 4;
    let seq = [];
    let inputIdx = 0;
    let coins = 0;
    let accepting = false;
    let timers = [];
    let audioCtx = null;

    function playNote(freq) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } catch (_) {}
    }

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎹 記憶小鋼琴（聽旋律照順序彈出來！）</span>
        <span id="mg-simon-round">第 1 / 4 關</span>
        <span id="mg-simon-coins">金幣：0</span>
      </div>
      <div id="mg-simon-msg" class="mg-status-line">仔細聽，小鋼琴要開始示範囉…</div>
      <div class="mg-piano-grid" id="mg-piano-grid"></div>
    `;

    const grid = container.querySelector("#mg-piano-grid");
    const msgEl = container.querySelector("#mg-simon-msg");
    const roundEl = container.querySelector("#mg-simon-round");
    const coinsEl = container.querySelector("#mg-simon-coins");

    const keyBtns = KEYS.map((k) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-piano-key";
      btn.style.background = k.color;
      btn.innerHTML = `<strong>${k.name}</strong><span>🎵</span>`;
      btn.addEventListener("click", () => {
        if (!accepting) return;
        flashKey(k.id);
        if (k.id === seq[inputIdx]) {
          inputIdx += 1;
          if (inputIdx >= seq.length) {
            accepting = false;
            coins += 35;
            coinsEl.textContent = `金幣：${coins}`;
            msgEl.textContent = `✨ 第 ${round} 關彈對了！+35 金幣！`;
            window.SoundFX.playCorrect(round);
            if (round >= maxRounds) {
              timers.push(setTimeout(() => {
                window.SoundFX.playFanfare(3);
                window.VisualFX.burstConfetti();
                if (onFinish) onFinish(coins, "記憶小鋼琴");
              }, 700));
            } else {
              round += 1;
              timers.push(setTimeout(startRound, 900));
            }
          }
        } else {
          accepting = false;
          window.SoundFX.playWrong();
          msgEl.textContent = "哎呀差一點點！幫你把剛剛賺到的金幣都收進口袋囉！";
          timers.push(setTimeout(() => {
            if (onFinish) onFinish(Math.max(20, coins), "記憶小鋼琴");
          }, 950));
        }
      });
      grid.appendChild(btn);
      return btn;
    });

    function flashKey(idx) {
      const btn = keyBtns[idx];
      if (!btn) return;
      playNote(KEYS[idx].freq);
      btn.classList.add("lit");
      timers.push(setTimeout(() => btn.classList.remove("lit"), 320));
    }

    function startRound() {
      accepting = false;
      inputIdx = 0;
      roundEl.textContent = `第 ${round} / ${maxRounds} 關`;
      msgEl.textContent = "👀 請專心看發光的琴鍵順序…";
      const len = round + 1;
      seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
      seq.forEach((keyId, i) => {
        timers.push(setTimeout(() => flashKey(keyId), 450 + i * 520));
      });
      timers.push(setTimeout(() => {
        accepting = true;
        msgEl.textContent = "🎹 換你了！照剛剛的順序按出來吧！";
      }, 450 + seq.length * 520 + 120));
    }

    timers.push(setTimeout(startRound, 350));

    activeCleanup = () => {
      accepting = false;
      timers.forEach((t) => clearTimeout(t));
      timers = [];
    };
  }

  // ==================== 遊戲 12：🃏 猜大小撲克 ====================
  function startHigherGame(container, onFinish) {
    stopCurrentGame();
    const SUITS = ["♥", "♦", "♣", "♠"];
    const LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let round = 1;
    const totalRounds = 5;
    let coins = 0;
    let locked = false;
    let curVal = 1 + Math.floor(Math.random() * 13);
    let curSuit = SUITS[Math.floor(Math.random() * 4)];
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🃏 猜大小撲克（共 5 回合・A最小 K最大）</span>
        <span id="mg-hi-round">第 1 / 5 回合</span>
        <span id="mg-hi-coins">金幣：0</span>
      </div>
      <div class="mg-card-arena">
        <div class="mg-poker-card" id="mg-hi-card">
          <span class="mg-poker-suit">${curSuit}</span>
          <strong class="mg-poker-num">${LABELS[curVal]}</strong>
          <span class="mg-poker-sub">點數 ${curVal}</span>
        </div>
        <div class="mg-hi-controls">
          <div id="mg-hi-msg" class="mg-status-line">猜猜看：下一張牌比 ${curVal} 大還是小？</div>
          <div class="mg-hi-btns">
            <button type="button" class="btn btn-gold btn-lg" id="mg-btn-higher">⬆️ 比較大</button>
            <button type="button" class="btn btn-forest btn-lg" id="mg-btn-lower">⬇️ 比較小</button>
          </div>
        </div>
      </div>
    `;

    const cardEl = container.querySelector("#mg-hi-card");
    const msgEl = container.querySelector("#mg-hi-msg");
    const roundEl = container.querySelector("#mg-hi-round");
    const coinsEl = container.querySelector("#mg-hi-coins");
    const btnHi = container.querySelector("#mg-btn-higher");
    const btnLo = container.querySelector("#mg-btn-lower");

    function guess(dir) {
      if (locked || round > totalRounds) return;
      locked = true;
      btnHi.disabled = true;
      btnLo.disabled = true;
      const nextVal = 1 + Math.floor(Math.random() * 13);
      const nextSuit = SUITS[Math.floor(Math.random() * 4)];

      let won = false;
      if (nextVal === curVal) {
        coins += 25;
        msgEl.textContent = `🤝 竟然同點數 ${LABELS[nextVal]}！幸運加贈 +25 金幣！`;
        window.SoundFX.playCorrect(1);
      } else if ((dir === "hi" && nextVal > curVal) || (dir === "lo" && nextVal < curVal)) {
        won = true;
        coins += 30;
        msgEl.textContent = `🎉 猜中了！下一張是 ${nextSuit}${LABELS[nextVal]}（${nextVal}點），+30 金幣！`;
        window.SoundFX.playCorrect(round);
      } else {
        coins += 10;
        msgEl.textContent = `😅 下一張是 ${nextSuit}${LABELS[nextVal]}（${nextVal}點），送你鼓勵獎 +10 金幣！`;
        window.SoundFX.playWrong();
      }

      curVal = nextVal;
      curSuit = nextSuit;
      cardEl.innerHTML = `<span class="mg-poker-suit">${curSuit}</span><strong class="mg-poker-num">${LABELS[curVal]}</strong><span class="mg-poker-sub">點數 ${curVal}</span>`;
      cardEl.classList.toggle("is-red", curSuit === "♥" || curSuit === "♦");
      coinsEl.textContent = `金幣：${coins}`;

      round += 1;
      if (round > totalRounds) {
        nextTimer = setTimeout(() => {
          window.SoundFX.playFanfare(3);
          window.VisualFX.burstConfetti();
          if (onFinish) onFinish(coins, "猜大小撲克");
        }, 900);
      } else {
        nextTimer = setTimeout(() => {
          roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
          msgEl.textContent = `下一張牌會比 ${curVal} 大還是小呢？`;
          locked = false;
          btnHi.disabled = false;
          btnLo.disabled = false;
        }, 850);
      }
    }

    cardEl.classList.toggle("is-red", curSuit === "♥" || curSuit === "♦");
    btnHi.addEventListener("click", () => guess("hi"));
    btnLo.addEventListener("click", () => guess("lo"));

    activeCleanup = () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 13：✊ 猜拳大挑戰 ====================
  function startRpsGame(container, onFinish) {
    stopCurrentGame();
    const MOVES = [
      { id: "rock", label: "✊ 石頭", icon: "✊", beats: "scissors" },
      { id: "scissors", label: "✌️ 剪刀", icon: "✌️", beats: "paper" },
      { id: "paper", label: "🖐️ 布", icon: "🖐️", beats: "rock" },
    ];
    let round = 1;
    const totalRounds = 3;
    let coins = 0;
    let locked = false;
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>✊ 猜拳大挑戰（共 3 回合）</span>
        <span id="mg-rps-round">第 1 / 3 回合</span>
        <span id="mg-rps-coins">金幣：0</span>
      </div>
      <div class="mg-dice-arena">
        <div class="mg-dice-side">
          <div class="mg-dice-who">🧑 你出拳</div>
          <div class="mg-rps-big" id="mg-rps-you">❔</div>
        </div>
        <div class="mg-dice-vs">VS</div>
        <div class="mg-dice-side">
          <div class="mg-dice-who">🐶 柴柴島主</div>
          <div class="mg-rps-big" id="mg-rps-cpu">❔</div>
        </div>
      </div>
      <div id="mg-rps-msg" class="mg-status-line">選一個出拳！贏了 +40、平手 +25、輸了也有 +15 鼓勵金幣！</div>
      <div class="mg-hi-btns" id="mg-rps-btns">
        <button type="button" class="btn btn-gold btn-lg" data-rps="rock">✊ 石頭</button>
        <button type="button" class="btn btn-forest btn-lg" data-rps="scissors">✌️ 剪刀</button>
        <button type="button" class="btn btn-burgundy btn-lg" data-rps="paper">🖐️ 布</button>
      </div>
    `;

    const youEl = container.querySelector("#mg-rps-you");
    const cpuEl = container.querySelector("#mg-rps-cpu");
    const msgEl = container.querySelector("#mg-rps-msg");
    const roundEl = container.querySelector("#mg-rps-round");
    const coinsEl = container.querySelector("#mg-rps-coins");
    const btns = Array.from(container.querySelectorAll("button[data-rps]"));

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (locked || round > totalRounds) return;
        locked = true;
        const myMove = MOVES.find((m) => m.id === btn.dataset.rps);
        const cpuMove = MOVES[Math.floor(Math.random() * 3)];
        youEl.textContent = myMove.icon;
        cpuEl.textContent = cpuMove.icon;

        if (myMove.id === cpuMove.id) {
          coins += 25;
          msgEl.textContent = "🤝 平手！默契十足 +25 金幣！";
          window.SoundFX.playCorrect(1);
        } else if (myMove.beats === cpuMove.id) {
          coins += 40;
          msgEl.textContent = "🎉 你贏了柴柴島主！+40 金幣！";
          window.SoundFX.playCorrect(round);
        } else {
          coins += 15;
          msgEl.textContent = "🐶 柴柴贏了一點點，送你勇氣鼓勵 +15 金幣！";
          window.SoundFX.playClick();
        }
        coinsEl.textContent = `金幣：${coins}`;
        round += 1;
        if (round > totalRounds) {
          nextTimer = setTimeout(() => {
            window.SoundFX.playFanfare(3);
            window.VisualFX.burstConfetti();
            if (onFinish) onFinish(coins, "猜拳大挑戰");
          }, 850);
        } else {
          nextTimer = setTimeout(() => {
            roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
            youEl.textContent = "❔";
            cpuEl.textContent = "❔";
            msgEl.textContent = `第 ${round} 回合！準備好就出拳吧！`;
            locked = false;
          }, 850);
        }
      });
    });

    activeCleanup = () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 14：🎫 幸運刮刮樂 ====================
  function startScratchGame(container, onFinish) {
    stopCurrentGame();
    const prizes = [15, 25, 35, 50, 70, 100].sort(() => Math.random() - 0.5);
    let picksLeft = 3;
    let total = 0;
    let done = false;
    let endTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎫 幸運刮刮樂（6 格中任刮 3 格！）</span>
        <span id="mg-scr-left">還可刮 3 格</span>
        <span id="mg-scr-coins">金幣：0</span>
      </div>
      <div id="mg-scr-msg" class="mg-status-line">最高獎金 +100 金幣藏在裡面，快點 3 張金色刮刮卡！</div>
      <div class="mg-scratch-grid" id="mg-scratch-grid"></div>
    `;

    const grid = container.querySelector("#mg-scratch-grid");
    const leftEl = container.querySelector("#mg-scr-left");
    const coinsEl = container.querySelector("#mg-scr-coins");
    const msgEl = container.querySelector("#mg-scr-msg");

    prizes.forEach((val, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "mg-scratch-card";
      card.innerHTML = `<span class="mg-scr-cover">✨ 刮開我 ✨</span>`;
      card.addEventListener("click", () => {
        if (done || card.classList.contains("scratched") || picksLeft <= 0) return;
        card.classList.add("scratched");
        card.innerHTML = `<strong>${val >= 70 ? "👑" : "🪙"} +${val}</strong><span>金幣</span>`;
        total += val;
        picksLeft -= 1;
        leftEl.textContent = `還可刮 ${picksLeft} 格`;
        coinsEl.textContent = `金幣：${total}`;
        if (val >= 70) window.SoundFX.playFanfare(3);
        else window.SoundFX.playCorrect(3 - picksLeft);
        msgEl.textContent = val === 100 ? "🎉 刮中頭獎 +100 金幣！！" : `✨ 刮出了 +${val} 金幣！`;

        if (picksLeft === 0) {
          done = true;
          Array.from(grid.children).forEach((el, i) => {
            if (!el.classList.contains("scratched")) {
              el.classList.add("unpicked");
              el.innerHTML = `<span>+${prizes[i]}</span>`;
            }
          });
          endTimer = setTimeout(() => {
            window.SoundFX.playFanfare(3);
            window.VisualFX.burstConfetti();
            if (onFinish) onFinish(total, "幸運刮刮樂");
          }, 950);
        }
      });
      grid.appendChild(card);
    });

    activeCleanup = () => {
      if (endTimer) clearTimeout(endTimer);
    };
  }

  // ==================== 遊戲 15：🎰 水果拉霸機 ====================
  function startSlotGame(container, onFinish) {
    stopCurrentGame();
    const SYMS = ["🍓", "🍊", "🍋", "🍑", "⭐", "👑"];
    let spinsLeft = 3;
    let total = 0;
    let spinning = false;
    let spinTimer = null;
    let endTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎰 水果拉霸機（共拉 3 次！）</span>
        <span id="mg-slot-left">剩餘 3 次</span>
        <span id="mg-slot-coins">金幣：0</span>
      </div>
      <div class="mg-slot-machine">
        <div class="mg-slot-reel" id="mg-reel-0">🍓</div>
        <div class="mg-slot-reel" id="mg-reel-1">⭐</div>
        <div class="mg-slot-reel" id="mg-reel-2">🍑</div>
      </div>
      <div id="mg-slot-msg" class="mg-status-line">三個相同 +90 金幣、兩個相同 +40 金幣、全不同 +20 金幣！</div>
      <div style="text-align:center;margin-top:10px;">
        <button type="button" class="btn btn-gold btn-lg" id="mg-slot-btn">🎰 拉下把手！</button>
      </div>
    `;

    const reels = [0, 1, 2].map((i) => container.querySelector(`#mg-reel-${i}`));
    const leftEl = container.querySelector("#mg-slot-left");
    const coinsEl = container.querySelector("#mg-slot-coins");
    const msgEl = container.querySelector("#mg-slot-msg");
    const spinBtn = container.querySelector("#mg-slot-btn");

    spinBtn.addEventListener("click", () => {
      if (spinning || spinsLeft <= 0) return;
      spinning = true;
      spinBtn.disabled = true;
      window.SoundFX.playClick();
      let ticks = 0;
      spinTimer = setInterval(() => {
        ticks += 1;
        const vals = [0, 1, 2].map(() => SYMS[Math.floor(Math.random() * SYMS.length)]);
        reels.forEach((r, i) => (r.textContent = vals[i]));
        if (ticks >= 12) {
          clearInterval(spinTimer);
          spinTimer = null;
          spinsLeft -= 1;
          leftEl.textContent = `剩餘 ${spinsLeft} 次`;

          let prize = 20;
          if (vals[0] === vals[1] && vals[1] === vals[2]) {
            prize = 90;
            msgEl.textContent = `🎊 超級大獎！三個 ${vals[0]} 連線 +90 金幣！`;
            window.SoundFX.playFanfare(3);
          } else if (vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2]) {
            prize = 40;
            msgEl.textContent = "✨ 兩個相同連線！獲得 +40 金幣！";
            window.SoundFX.playCorrect(2);
          } else {
            prize = 20;
            msgEl.textContent = "🍬 可愛水果大集合！獲得 +20 金幣！";
            window.SoundFX.playCorrect(1);
          }
          total += prize;
          coinsEl.textContent = `金幣：${total}`;

          if (spinsLeft <= 0) {
            spinBtn.textContent = "結算金幣中…";
            endTimer = setTimeout(() => {
              window.VisualFX.burstConfetti();
              if (onFinish) onFinish(total, "水果拉霸機");
            }, 850);
          } else {
            spinning = false;
            spinBtn.disabled = false;
          }
        }
      }, 65);
    });

    activeCleanup = () => {
      if (spinTimer) clearInterval(spinTimer);
      if (endTimer) clearTimeout(endTimer);
    };
  }

  // ==================== 遊戲 16：🔢 數字排排隊 ====================
  function startOrderGame(container, onFinish) {
    stopCurrentGame();
    let round = 1;
    const totalRounds = 2;
    let totalCoins = 0;
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🔢 數字排排隊（從「最小」點到「最大」！）</span>
        <span id="mg-ord-round">第 1 / 2 回合</span>
        <span id="mg-ord-coins">金幣：0</span>
      </div>
      <div id="mg-ord-msg" class="mg-status-line">請由小到大依序點完 6 個數字！</div>
      <div class="mg-candy-grid" id="mg-ord-grid"></div>
    `;

    const grid = container.querySelector("#mg-ord-grid");
    const roundEl = container.querySelector("#mg-ord-round");
    const coinsEl = container.querySelector("#mg-ord-coins");
    const msgEl = container.querySelector("#mg-ord-msg");

    function setupRound() {
      roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
      const set = new Set();
      while (set.size < 6) set.add(1 + Math.floor(Math.random() * 99));
      const sorted = Array.from(set).sort((a, b) => a - b);
      const shuffled = [...sorted].sort(() => Math.random() - 0.5);
      let nextIdx = 0;
      grid.innerHTML = "";
      shuffled.forEach((num) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mg-candy-btn";
        btn.textContent = String(num);
        btn.addEventListener("click", () => {
          if (btn.classList.contains("cleared")) return;
          if (num === sorted[nextIdx]) {
            btn.classList.add("cleared");
            nextIdx += 1;
            totalCoins += 10;
            coinsEl.textContent = `金幣：${totalCoins}`;
            window.SoundFX.playCorrect(nextIdx);
            if (nextIdx >= sorted.length) {
              msgEl.textContent = `🎉 第 ${round} 回合完美排序！`;
              round += 1;
              if (round > totalRounds) {
                nextTimer = setTimeout(() => {
                  window.SoundFX.playFanfare(3);
                  window.VisualFX.burstConfetti();
                  if (onFinish) onFinish(totalCoins, "數字排排隊");
                }, 650);
              } else {
                nextTimer = setTimeout(() => {
                  msgEl.textContent = "第 2 回合！再從最小點到最大吧！";
                  setupRound();
                }, 650);
              }
            }
          } else {
            window.SoundFX.playWrong();
            btn.classList.add("wrong-flash");
            setTimeout(() => btn.classList.remove("wrong-flash"), 320);
          }
        });
        grid.appendChild(btn);
      });
    }

    setupRound();
    activeCleanup = () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 17：⚡ 閃電反應王 ====================
  function startReactionGame(container, onFinish) {
    stopCurrentGame();
    let round = 1;
    const totalRounds = 3;
    let totalCoins = 0;
    let stateMode = "waiting"; // waiting | ready | cool
    let readyAt = 0;
    let waitTimer = null;
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>⚡ 閃電反應王（共 3 回合）</span>
        <span id="mg-re-round">第 1 / 3 回合</span>
        <span id="mg-re-coins">金幣：0</span>
      </div>
      <button type="button" id="mg-re-pad" class="mg-react-pad is-wait">
        ⏳ 等待變綠色…不要偷跑喔！
      </button>
      <div id="mg-re-msg" class="mg-status-line">畫面一變成綠色就立刻點下去！越快金幣越多！</div>
    `;

    const pad = container.querySelector("#mg-re-pad");
    const roundEl = container.querySelector("#mg-re-round");
    const coinsEl = container.querySelector("#mg-re-coins");
    const msgEl = container.querySelector("#mg-re-msg");

    function armRound() {
      stateMode = "waiting";
      roundEl.textContent = `第 ${round} / ${totalRounds} 回合`;
      pad.className = "mg-react-pad is-wait";
      pad.textContent = "⏳ 專心準備…等變成抹茶綠再點！";
      const delay = 1100 + Math.floor(Math.random() * 1700);
      waitTimer = setTimeout(() => {
        stateMode = "ready";
        readyAt = performance.now();
        pad.className = "mg-react-pad is-go";
        pad.textContent = "⚡ 就是現在！快點我！";
      }, delay);
    }

    pad.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      if (stateMode === "cool") return;
      if (stateMode === "waiting") {
        clearTimeout(waitTimer);
        window.SoundFX.playWrong();
        msgEl.textContent = "😅 太早點囉！重新等一次變綠色吧～";
        armRound();
        return;
      }
      if (stateMode === "ready") {
        stateMode = "cool";
        const ms = Math.round(performance.now() - readyAt);
        const gain = ms <= 360 ? 50 : ms <= 580 ? 35 : 20;
        totalCoins += gain;
        coinsEl.textContent = `金幣：${totalCoins}`;
        pad.className = "mg-react-pad is-done";
        pad.textContent = `⚡ ${ms} 毫秒！獲得 +${gain} 金幣！`;
        msgEl.textContent = ms <= 360 ? "🚀 閃電神速！拿滿 +50 金幣！" : `👍 反應時間 ${ms} 毫秒，+ ${gain} 金幣！`;
        window.SoundFX.playCorrect(round);

        round += 1;
        if (round > totalRounds) {
          nextTimer = setTimeout(() => {
            window.SoundFX.playFanfare(3);
            window.VisualFX.burstConfetti();
            if (onFinish) onFinish(totalCoins, "閃電反應王");
          }, 850);
        } else {
          nextTimer = setTimeout(armRound, 900);
        }
      }
    });

    armRound();
    activeCleanup = () => {
      clearTimeout(waitTimer);
      clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 18：🍎 果園採蘋果 ====================
  function startAppleGame(container, onFinish) {
    stopCurrentGame();
    let timeLeft = 15;
    let coins = 0;
    let finished = false;
    let popTimer = null;
    let countTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🍎 果園採蘋果（採紅蘋果 +15、金星果 +35，避開毛毛蟲！）</span>
        <span id="mg-app-time">剩餘 15 秒</span>
        <span id="mg-app-coins">金幣：0</span>
      </div>
      <div class="mg-orchard-grid" id="mg-orchard-grid"></div>
    `;

    const grid = container.querySelector("#mg-orchard-grid");
    const timeEl = container.querySelector("#mg-app-time");
    const coinsEl = container.querySelector("#mg-app-coins");

    const spots = [];
    for (let i = 0; i < 9; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-orchard-spot";
      btn.textContent = "🌿";
      btn.dataset.val = "0";
      btn.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        if (finished) return;
        const v = Number(btn.dataset.val || 0);
        if (v === 0) return;
        coins = Math.max(0, coins + v);
        coinsEl.textContent = `金幣：${coins}`;
        if (v > 0) window.SoundFX.playCorrect(1);
        else window.SoundFX.playWrong();
        btn.dataset.val = "0";
        btn.textContent = v > 0 ? "✨" : "💥";
        btn.classList.remove("has-fruit");
      });
      grid.appendChild(btn);
      spots.push(btn);
    }

    function refreshOrchard() {
      if (finished) return;
      spots.forEach((s) => {
        s.dataset.val = "0";
        s.textContent = "🌿";
        s.classList.remove("has-fruit");
      });
      const count = 2 + Math.floor(Math.random() * 2);
      const idxs = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, count);
      idxs.forEach((idx) => {
        const r = Math.random();
        const spot = spots[idx];
        spot.classList.add("has-fruit");
        if (r < 0.58) {
          spot.textContent = "🍎";
          spot.dataset.val = "15";
        } else if (r < 0.80) {
          spot.textContent = "🌟";
          spot.dataset.val = "35";
        } else {
          spot.textContent = "🐛";
          spot.dataset.val = "-10";
        }
      });
    }

    refreshOrchard();
    popTimer = setInterval(refreshOrchard, 950);
    countTimer = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = `剩餘 ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        finished = true;
        clearInterval(popTimer);
        clearInterval(countTimer);
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti();
        if (onFinish) onFinish(Math.max(25, coins), "果園採蘋果");
      }
    }, 1000);

    activeCleanup = () => {
      finished = true;
      clearInterval(popTimer);
      clearInterval(countTimer);
    };
  }

  // ==================== 遊戲 19：🔍 找找小動物 ====================
  function startEmojiGame(container, onFinish) {
    stopCurrentGame();
    const PAIRS = [
      ["🐱", "🦊"],
      ["🐻", "🐼"],
      ["🐸", "🐢"],
      ["🐰", "🐹"],
      ["🐶", "🐺"],
      ["🐥", "🦆"],
    ].sort(() => Math.random() - 0.5);
    let round = 1;
    const totalRounds = 3;
    let totalCoins = 0;
    let locked = false;
    let nextTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🔍 找找小動物（共 3 題・找出唯一不一樣的動物！）</span>
        <span id="mg-em-round">第 1 / 3 題</span>
        <span id="mg-em-coins">金幣：0</span>
      </div>
      <div id="mg-em-msg" class="mg-status-line">裡面藏了 1 隻不一樣的小動物，快把牠點出來！</div>
      <div class="mg-emoji-grid" id="mg-emoji-grid"></div>
    `;

    const grid = container.querySelector("#mg-emoji-grid");
    const roundEl = container.querySelector("#mg-em-round");
    const coinsEl = container.querySelector("#mg-em-coins");
    const msgEl = container.querySelector("#mg-em-msg");

    function renderRound() {
      locked = false;
      roundEl.textContent = `第 ${round} / ${totalRounds} 題`;
      const [mainIcon, oddIcon] = PAIRS[(round - 1) % PAIRS.length];
      const oddIdx = Math.floor(Math.random() * 16);
      grid.innerHTML = "";
      for (let i = 0; i < 16; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mg-emoji-cell";
        btn.textContent = i === oddIdx ? oddIcon : mainIcon;
        btn.addEventListener("click", () => {
          if (locked) return;
          if (i === oddIdx) {
            locked = true;
            btn.classList.add("found");
            totalCoins += 45;
            coinsEl.textContent = `金幣：${totalCoins}`;
            msgEl.textContent = `🎉 眼力超強！找到小 ${oddIcon}，+45 金幣！`;
            window.SoundFX.playCorrect(round);
            round += 1;
            if (round > totalRounds) {
              nextTimer = setTimeout(() => {
                window.SoundFX.playFanfare(3);
                window.VisualFX.burstConfetti();
                if (onFinish) onFinish(totalCoins, "找找小動物");
              }, 700);
            } else {
              nextTimer = setTimeout(() => {
                msgEl.textContent = `第 ${round} 題！哪一隻跟大家不一樣呢？`;
                renderRound();
              }, 700);
            }
          } else {
            window.SoundFX.playWrong();
            btn.classList.add("wrong-flash");
            setTimeout(() => btn.classList.remove("wrong-flash"), 280);
          }
        });
        grid.appendChild(btn);
      }
    }

    renderRound();
    activeCleanup = () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }

  // ==================== 遊戲 20：🎈 氣球打氣王 ====================
  function startBalloonGame(container, onFinish) {
    stopCurrentGame();
    let timeLeft = 10;
    let pumps = 0;
    const goal = 32;
    let finished = false;
    let countTimer = null;

    container.innerHTML = `
      <div class="mg-header-bar">
        <span>🎈 氣球打氣王（10 秒內狂點打氣！）</span>
        <span id="mg-bal-time">剩餘 10 秒</span>
        <span id="mg-bal-cnt">打氣 0 / ${goal} 下</span>
      </div>
      <div class="mg-balloon-stage">
        <div id="mg-balloon-orb" class="mg-balloon-orb">🎈</div>
      </div>
      <div style="text-align:center;">
        <button type="button" class="btn btn-gold btn-lg" id="mg-pump-btn" style="min-width:210px;">💨 用力打氣！</button>
      </div>
    `;

    const orb = container.querySelector("#mg-balloon-orb");
    const timeEl = container.querySelector("#mg-bal-time");
    const cntEl = container.querySelector("#mg-bal-cnt");
    const pumpBtn = container.querySelector("#mg-pump-btn");

    function finishBalloon(jackpot) {
      if (finished) return;
      finished = true;
      clearInterval(countTimer);
      const reward = jackpot ? 140 : Math.max(25, Math.round(pumps * 3.5));
      orb.textContent = jackpot ? "🎊" : "🎈";
      window.SoundFX.playFanfare(3);
      window.VisualFX.burstConfetti();
      setTimeout(() => {
        if (onFinish) onFinish(reward, "氣球打氣王");
      }, 450);
    }

    pumpBtn.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      if (finished) return;
      pumps += 1;
      cntEl.textContent = `打氣 ${pumps} / ${goal} 下`;
      const scale = 1 + (pumps / goal) * 1.45;
      orb.style.transform = `scale(${scale.toFixed(2)})`;
      window.SoundFX.playClick();
      if (pumps >= goal) {
        finishBalloon(true);
      }
    });

    countTimer = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = `剩餘 ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        finishBalloon(false);
      }
    }, 1000);

    activeCleanup = () => {
      finished = true;
      clearInterval(countTimer);
    };
  }

  window.MiniGames = {
    start(type, container, onFinish) {
      if (type === "catcher") return startCatcherGame(container, onFinish);
      if (type === "memory") return startMemoryGame(container, onFinish);
      if (type === "whack") return startWhackGame(container, onFinish);
      if (type === "wheel") return startWheelGame(container, onFinish);
      if (type === "bubble") return startBubbleGame(container, onFinish);
      if (type === "make10") return startMake10Game(container, onFinish);
      if (type === "dice") return startDiceGame(container, onFinish);
      if (type === "chest") return startChestGame(container, onFinish);
      if (type === "fishing") return startFishingGame(container, onFinish);
      if (type === "color") return startColorGame(container, onFinish);
      if (type === "simon") return startSimonGame(container, onFinish);
      if (type === "higher") return startHigherGame(container, onFinish);
      if (type === "rps") return startRpsGame(container, onFinish);
      if (type === "scratch") return startScratchGame(container, onFinish);
      if (type === "slot") return startSlotGame(container, onFinish);
      if (type === "order") return startOrderGame(container, onFinish);
      if (type === "reaction") return startReactionGame(container, onFinish);
      if (type === "apple") return startAppleGame(container, onFinish);
      if (type === "emoji") return startEmojiGame(container, onFinish);
      if (type === "balloon") return startBalloonGame(container, onFinish);
      return startWhackGame(container, onFinish);
    },
    stop: stopCurrentGame
  };
})();
