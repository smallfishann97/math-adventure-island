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

  window.MiniGames = {
    start(type, container, onFinish) {
      if (type === "catcher") return startCatcherGame(container, onFinish);
      if (type === "memory") return startMemoryGame(container, onFinish);
      if (type === "whack") return startWhackGame(container, onFinish);
      if (type === "wheel") return startWheelGame(container, onFinish);
      if (type === "bubble") return startBubbleGame(container, onFinish);
      if (type === "make10") return startMake10Game(container, onFinish);
      return startWhackGame(container, onFinish);
    },
    stop: stopCurrentGame
  };
})();
