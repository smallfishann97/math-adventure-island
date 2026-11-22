/**
 * 數學遊戲冒險島｜五大進階娛樂與學習模組
 * 1. 療癒八音盒背景音樂（Web Audio API 零外部音檔）
 * 2. 島嶼「白天／夕陽／星空夜景」氛圍切換
 * 3. 個人專屬「數學小博士獎狀」生成器（下載 PNG / 列印）
 * 4. 60 秒限時心算閃電賽（最高記錄存檔＋送金幣）
 * 5. 雙人同機 PK 搶答模式（10 回合對戰＋鍵盤/觸控搶答）
 */
(function () {
  // ==================== 1. 陽光小島輕快雙聲部八音盒 BGM（純 Web Audio API 原創編曲） ====================
  class MusicBoxBGM {
    constructor() {
      this.ctx = null;
      this.timer = null;
      this.playing = false;
      this.step = 0;

      // 輕快活潑的 32 拍陽光海島旋律（C 大調，單位 Hz，0 代表休止符）
      this.melody = [
        // A 段：陽光跳躍啟程（C -> G -> Am -> F）
        523.25, 659.25, 783.99, 0,      880.00, 783.99, 659.25, 0,
        587.33, 659.25, 783.99, 659.25, 587.33, 0,      523.25, 0,
        // B 段：輕快海風微揚（F -> C -> Dm -> G）
        698.46, 880.00, 1046.5, 0,      880.00, 783.99, 659.25, 523.25,
        587.33, 659.25, 783.99, 880.00, 783.99, 0,      0,      0,
        // C 段：開心探索島嶼（C -> Em -> F -> G）
        1046.5, 880.00, 783.99, 659.25, 783.99, 0,      659.25, 523.25,
        698.46, 783.99, 880.00, 698.46, 783.99, 0,      587.33, 0,
        // D 段：溫暖收尾再循環（Am -> F -> G -> C）
        659.25, 783.99, 880.00, 1046.5, 880.00, 698.46, 659.25, 587.33,
        523.25, 659.25, 783.99, 523.25, 523.25, 0,      0,      0
      ];

      // 對應的溫暖撥弦低音伴奏（每 2 拍輕撥一聲，與主旋律形成豐滿和聲）
      this.bass = [
        261.63, 0, 329.63, 0, 220.00, 0, 261.63, 0,
        196.00, 0, 246.94, 0, 261.63, 0, 196.00, 0,
        174.61, 0, 220.00, 0, 261.63, 0, 329.63, 0,
        293.66, 0, 220.00, 0, 196.00, 0, 246.94, 0,
        261.63, 0, 329.63, 0, 246.94, 0, 329.63, 0,
        174.61, 0, 220.00, 0, 196.00, 0, 246.94, 0,
        220.00, 0, 261.63, 0, 174.61, 0, 220.00, 0,
        196.00, 0, 246.94, 0, 261.63, 0, 0,      0
      ];
    }

    playPluck(freq, isBass = false) {
      if (!freq || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 主音色：清脆木琴/八音盒 triangle；低音用溫潤 sine
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isBass ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const peak = isBass ? 0.042 : 0.058;
      const decay = isBass ? 0.34 : 0.28;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + decay + 0.03);

      // 為主旋律疊加極輕柔的高八度水晶泛音，聽起來更像精緻八音盒
      if (!isBass) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = "sine";
        chime.frequency.setValueAtTime(freq * 2, now);
        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.016, now + 0.01);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chime.start(now);
        chime.stop(now + 0.18);
      }
    }

    tickBeat() {
      if (!this.playing) return;
      this.playPluck(this.melody[this.step], false);
      this.playPluck(this.bass[this.step], true);
      this.step = (this.step + 1) % this.melody.length;
    }

    start() {
      if (this.playing) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      this.playing = true;
      this.tickBeat();
      this.timer = setInterval(() => this.tickBeat(), 240);
    }

    stop() {
      this.playing = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    toggle() {
      if (this.playing) this.stop();
      else this.start();
      return this.playing;
    }
  }

  const bgm = new MusicBoxBGM();

  // ==================== 2. 島嶼白天／夕陽／星空夜景切換 ====================
  function initIslandAtmosphere() {
    const btns = document.querySelectorAll("[data-island-theme]");
    const container = document.getElementById("island-map-container");
    if (!container || !btns.length) return;

    function applyTheme(theme) {
      container.classList.remove("theme-day", "theme-cloudy", "theme-sunset", "theme-night");
      container.classList.add(`theme-${theme}`);
      btns.forEach((b) => b.classList.toggle("active", b.dataset.islandTheme === theme));
    }

    btns.forEach((b) => {
      b.addEventListener("click", () => {
        window.SoundFX.playClick();
        applyTheme(b.dataset.islandTheme);
      });
    });
    applyTheme("day");
  }

  // ==================== 3. 個人學習獎狀生成器（下載 PNG / 列印） ====================
  function initCertificateGenerator(getUserFn) {
    const canvas = document.getElementById("cert-canvas");
    const dlBtn = document.getElementById("btn-cert-download");
    const prBtn = document.getElementById("btn-cert-print");
    const titleSel = document.getElementById("cert-title-select");
    if (!canvas || !dlBtn || !prBtn) return;

    function drawCert() {
      const user = getUserFn();
      if (!user) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const awardTitle = titleSel ? titleSel.value : "國小三年級數學小博士";
      const totalStars = Object.values(user.stageStars || {}).reduce((a, b) => a + b, 0);
      const cleared = Object.values(user.stageStars || {}).filter((s) => s > 0).length;
      const today = new Date().toLocaleDateString("zh-TW");

      // 奶油象牙底色
      ctx.fillStyle = "#fffdf6";
      ctx.fillRect(0, 0, w, h);

      // 外金框＋內雙框
      ctx.strokeStyle = "#d4943a";
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.strokeStyle = "#f0c975";
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      // 四角裝飾星芒
      ctx.fillStyle = "#f2a43b";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      [[58, 66], [w - 58, 66], [58, h - 48], [w - 58, h - 48]].forEach(([x, y]) => ctx.fillText("✦", x, y));

      // 標題
      ctx.fillStyle = "#a66f22";
      ctx.font = "900 18px 'Noto Sans TC', sans-serif";
      ctx.fillText("MATH ADVENTURE ISLAND・榮譽證書", w / 2, 92);

      ctx.fillStyle = "#5a4031";
      ctx.font = "900 44px 'Noto Sans TC', sans-serif";
      ctx.fillText("榮 譽 獎 狀", w / 2, 152);

      // 頒發對象
      ctx.fillStyle = "#388d5c";
      ctx.font = "900 34px 'Noto Sans TC', sans-serif";
      ctx.fillText(`${user.name}  同學`, w / 2, 224);

      ctx.strokeStyle = "#f0c975";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 160, 238);
      ctx.lineTo(w / 2 + 160, 238);
      ctx.stroke();

      // 內文
      ctx.fillStyle = "#5a4031";
      ctx.font = "700 21px 'Noto Sans TC', sans-serif";
      ctx.fillText("於「數學遊戲冒險島」認真學習國小三年級數學，表現優異！", w / 2, 286);
      ctx.fillText(`累計通關 ${cleared} 關・收集 ${totalStars} 顆榮譽星星・擁有 ${user.coins || 0} 枚閃亮金幣`, w / 2, 326);

      // 頒發稱號徽章
      ctx.fillStyle = "#fff3d6";
      ctx.beginPath();
      ctx.roundRect(w / 2 - 210, 355, 420, 56, 28);
      ctx.fill();
      ctx.strokeStyle = "#f2a43b";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#c97b18";
      ctx.font = "900 24px 'Noto Sans TC', sans-serif";
      ctx.fillText(`🏆 特頒「${awardTitle}」`, w / 2, 392);

      // 底部日期與版權
      ctx.fillStyle = "#785946";
      ctx.font = "700 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(`頒發日期：${today}　　數學遊戲冒險島 敬頒`, w / 2, 466);

      ctx.fillStyle = "#9c7d67";
      ctx.font = "700 13px sans-serif";
      ctx.fillText("Copyright © 2026 Ann Lu. All Rights Reserved.", w / 2, 502);
    }

    if (titleSel) titleSel.addEventListener("change", drawCert);

    dlBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      drawCert();
      const user = getUserFn();
      const link = document.createElement("a");
      link.download = `數學遊戲冒險島_獎狀_${user ? user.name : "同學"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    prBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      drawCert();
      const dataUrl = canvas.toDataURL("image/png");
      const w = window.open("", "_blank");
      if (!w) return alert("請允許彈出視窗以列印獎狀！");
      w.document.write(`<!DOCTYPE html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;"><img src="${dataUrl}" style="max-width:96%;height:auto;" onload="window.print()" /></body></html>`);
      w.document.close();
    });

    window.MathDeluxeDrawCert = drawCert;
  }

  // ==================== 產生即時心算題（供閃電賽 & 雙人 PK 共用） ====================
  function makeSpeedQuestion(topic = "ALL") {
    const t = topic === "ALL" ? ["addsub", "mul", "unit"][Math.floor(Math.random() * 3)] : topic;
    let text = "";
    let ans = 0;

    if (t === "addsub") {
      if (Math.random() > 0.5) {
        const a = Math.floor(Math.random() * 75) + 18;
        const b = Math.floor(Math.random() * 65) + 15;
        ans = a + b;
        text = `${a} ＋ ${b} ＝ ？`;
      } else {
        const a = Math.floor(Math.random() * 70) + 35;
        const b = Math.floor(Math.random() * (a - 12)) + 8;
        ans = a - b;
        text = `${a} － ${b} ＝ ？`;
      }
    } else if (t === "mul") {
      if (Math.random() > 0.35) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        ans = a * b;
        text = `${a} × ${b} ＝ ？`;
      } else {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        ans = a;
        text = `${a * b} ÷ ${b} ＝ ？`;
      }
    } else {
      const sub = Math.floor(Math.random() * 3);
      if (sub === 0) {
        const cm = Math.floor(Math.random() * 9) + 1;
        const mm = Math.floor(Math.random() * 9) + 1;
        ans = cm * 10 + mm;
        text = `${cm} 公分 ${mm} 毫米 ＝ ？ 毫米`;
      } else if (sub === 1) {
        const m = Math.floor(Math.random() * 5) + 1;
        const s = [10, 15, 20, 25, 30, 40][Math.floor(Math.random() * 6)];
        ans = m * 60 + s;
        text = `${m} 分 ${s} 秒 ＝ ？ 秒`;
      } else {
        const kg = Math.floor(Math.random() * 6) + 1;
        const g = [50, 100, 200, 300, 500][Math.floor(Math.random() * 5)];
        ans = kg * 1000 + g;
        text = `${kg} 公斤 ${g} 公克 ＝ ？ 公克`;
      }
    }

    const set = new Set([ans]);
    const deltas = [-10, -2, -1, 1, 2, 10, 5, -5, 100];
    while (set.size < 4) {
      const cand = ans + deltas[Math.floor(Math.random() * deltas.length)];
      if (cand > 0) set.add(cand);
    }
    const options = Array.from(set).sort(() => Math.random() - 0.5).map(String);
    return { text, answer: String(ans), options };
  }

  // ==================== 4. 60 秒限時心算閃電賽 ====================
  function initBlitzGame(getUserFn, saveCb, refreshHomeCb) {
    const startBtn = document.getElementById("btn-blitz-start");
    const topicSel = document.getElementById("blitz-topic-select");
    const arena = document.getElementById("blitz-arena");
    const bestEl = document.getElementById("blitz-best-score");
    if (!startBtn || !arena) return;

    let timer = null;
    let timeLeft = 60;
    let score = 0;
    let combo = 0;
    let solved = 0;
    let curQ = null;

    function refreshBest() {
      const u = getUserFn();
      if (bestEl && u) bestEl.textContent = String(u.blitzBest || 0);
    }
    window.MathDeluxeRefreshBlitz = refreshBest;

    function stopBlitz() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function nextQ() {
      curQ = makeSpeedQuestion(topicSel ? topicSel.value : "ALL");
      arena.innerHTML = `
        <div class="blitz-hud">
          <span>⏱️ 剩餘 <strong id="bl-t">${timeLeft}</strong> 秒</span>
          <span>🏆 得分 <strong id="bl-s">${score}</strong></span>
          <span>🔥 連擊 <strong id="bl-c">${combo}</strong></span>
        </div>
        <div class="blitz-q">${curQ.text}</div>
        <div class="blitz-opts">
          ${curQ.options.map((o) => `<button type="button" class="btn btn-ghost btn-lg blitz-opt-btn" data-val="${o}">${o}</button>`).join("")}
        </div>
      `;
      arena.querySelectorAll(".blitz-opt-btn").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.val === curQ.answer) {
            combo += 1;
            solved += 1;
            score += 10 + Math.min(combo * 2, 20);
            window.SoundFX.playCorrect(combo);
          } else {
            combo = 0;
            score = Math.max(0, score - 5);
            window.SoundFX.playWrong();
          }
          nextQ();
        });
      });
    }

    startBtn.addEventListener("click", () => {
      stopBlitz();
      window.SoundFX.playCorrect(2);
      timeLeft = 60;
      score = 0;
      combo = 0;
      solved = 0;
      nextQ();
      timer = setInterval(() => {
        timeLeft -= 1;
        const tEl = document.getElementById("bl-t");
        if (tEl) tEl.textContent = String(Math.max(0, timeLeft));
        if (timeLeft <= 0) {
          stopBlitz();
          const u = getUserFn();
          const earnedCoins = Math.max(10, Math.round(score / 4));
          let isRecord = false;
          if (u) {
            if (score > (u.blitzBest || 0)) {
              u.blitzBest = score;
              isRecord = true;
            }
            u.coins = (u.coins || 0) + earnedCoins;
            saveCb();
            refreshHomeCb();
            refreshBest();
          }
          window.SoundFX.playFanfare(3);
          window.VisualFX.celebrationRain();
          arena.innerHTML = `
            <div class="blitz-finish">
              <h3>⚡ 60 秒閃電賽結束！${isRecord ? "🎉 刷新個人最高記錄！" : ""}</h3>
              <p>共答對 <strong>${solved} 題</strong>｜最終得分 <strong>${score} 分</strong>｜獲得 <strong>🪙 +${earnedCoins} 閃亮金幣</strong>！</p>
            </div>
          `;
        }
      }, 1000);
    });

    window.MathDeluxeStopGames = () => stopBlitz();
  }

  // ==================== 5. 雙人同機 PK 搶答模式 ====================
  function initPkMode() {
    const startBtn = document.getElementById("btn-pk-start");
    const arena = document.getElementById("pk-arena");
    if (!startBtn || !arena) return;

    let round = 0;
    const maxRounds = 10;
    let p1Score = 0;
    let p2Score = 0;
    let curQ = null;
    let roundLocked = false;
    let keyListener = null;

    function cleanupKeys() {
      if (keyListener) {
        window.removeEventListener("keydown", keyListener);
        keyListener = null;
      }
    }

    function renderRound() {
      if (round >= maxRounds) {
        cleanupKeys();
        window.SoundFX.playFanfare(3);
        window.VisualFX.celebrationRain();
        const winner = p1Score > p2Score ? "🏆 玩家 1（嫩葉隊）獲勝！" : p2Score > p1Score ? "🏆 玩家 2（蜜桃隊）獲勝！" : "🤝 勢均力敵・平手！";
        arena.innerHTML = `
          <div class="blitz-finish">
            <h3>${winner}</h3>
            <p>嫩葉隊 <strong>${p1Score} 分</strong>　VS　蜜桃隊 <strong>${p2Score} 分</strong></p>
          </div>
        `;
        return;
      }
      roundLocked = false;
      curQ = makeSpeedQuestion("ALL");
      const p1Keys = ["1", "2", "3", "4"];
      const p2Keys = ["7", "8", "9", "0"];

      arena.innerHTML = `
        <div class="pk-scoreboard">
          <div class="pk-side-score p1">🌿 玩家 1：<strong>${p1Score}</strong></div>
          <div class="pk-round-badge">第 ${round + 1} / ${maxRounds} 回合</div>
          <div class="pk-side-score p2">🍑 玩家 2：<strong>${p2Score}</strong></div>
        </div>
        <div class="blitz-q" style="margin:12px 0;">${curQ.text}</div>
        <div class="pk-split">
          <div class="pk-pad p1-pad">
            <div class="pk-pad-title">🌿 玩家 1 搶答區（鍵盤 1~4）</div>
            <div class="pk-opts">
              ${curQ.options.map((o, i) => `<button type="button" class="btn btn-forest pk-btn" data-player="1" data-val="${o}">[${p1Keys[i]}] ${o}</button>`).join("")}
            </div>
          </div>
          <div class="pk-pad p2-pad">
            <div class="pk-pad-title">🍑 玩家 2 搶答區（鍵盤 7~0）</div>
            <div class="pk-opts">
              ${curQ.options.map((o, i) => `<button type="button" class="btn btn-burgundy pk-btn" data-player="2" data-val="${o}">[${p2Keys[i]}] ${o}</button>`).join("")}
            </div>
          </div>
        </div>
        <div id="pk-msg" class="pk-msg">看準答案，先按先贏！</div>
      `;

      function handleBuzz(player, val) {
        if (roundLocked) return;
        roundLocked = true;
        const msgEl = document.getElementById("pk-msg");
        if (val === curQ.answer) {
          if (player === 1) p1Score += 10;
          else p2Score += 10;
          window.SoundFX.playCorrect(3);
          window.VisualFX.burstConfetti();
          if (msgEl) msgEl.textContent = `🎉 玩家 ${player} 搶答正確 +10 分！（答案：${curQ.answer}）`;
        } else {
          if (player === 1) p2Score += 5;
          else p1Score += 5;
          window.SoundFX.playWrong();
          if (msgEl) msgEl.textContent = `😅 玩家 ${player} 答錯了！對手 +5 分（正確答案：${curQ.answer}）`;
        }
        round += 1;
        setTimeout(renderRound, 950);
      }

      arena.querySelectorAll(".pk-btn").forEach((b) => {
        b.addEventListener("click", () => handleBuzz(Number(b.dataset.player), b.dataset.val));
      });

      cleanupKeys();
      keyListener = (ev) => {
        const i1 = p1Keys.indexOf(ev.key);
        if (i1 !== -1 && curQ.options[i1]) return handleBuzz(1, curQ.options[i1]);
        const i2 = p2Keys.indexOf(ev.key);
        if (i2 !== -1 && curQ.options[i2]) return handleBuzz(2, curQ.options[i2]);
      };
      window.addEventListener("keydown", keyListener);
    }

    startBtn.addEventListener("click", () => {
      window.SoundFX.playCorrect(2);
      round = 0;
      p1Score = 0;
      p2Score = 0;
      renderRound();
    });
  }

  // ==================== 6. 頂部即時日期、星期與時間顯示（原創可愛日曆＋小鬧鐘 SVG） ====================
  function initLiveClock() {
    const el = document.getElementById("live-clock-pill");
    if (!el) return;
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const calSvg = `
      <svg viewBox="0 0 26 26" class="clock-cute-icon" aria-hidden="true">
        <rect x="3" y="5" width="20" height="18" rx="5" fill="#FFFDF7" stroke="#D97268" stroke-width="1.8" />
        <path d="M 3 10 Q 3 5 8 5 H 18 Q 23 5 23 10 V 11 H 3 Z" fill="#F07470" />
        <line x1="8.5" y1="2.8" x2="8.5" y2="7" stroke="#8F5A3C" stroke-width="2.2" stroke-linecap="round" />
        <line x1="17.5" y1="2.8" x2="17.5" y2="7" stroke="#8F5A3C" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="9.8" cy="15.2" r="1.15" fill="#5A4031" />
        <circle cx="16.2" cy="15.2" r="1.15" fill="#5A4031" />
        <ellipse cx="7.6" cy="17.2" rx="1.5" ry="0.9" fill="#FF9AA2" opacity="0.8" />
        <ellipse cx="18.4" cy="17.2" rx="1.5" ry="0.9" fill="#FF9AA2" opacity="0.8" />
        <path d="M 10.8 18.2 Q 13 20.1 15.2 18.2" fill="none" stroke="#5A4031" stroke-width="1.3" stroke-linecap="round" />
      </svg>`;
    const clkSvg = `
      <svg viewBox="0 0 26 26" class="clock-cute-icon" aria-hidden="true">
        <circle cx="6.2" cy="6.2" r="3.2" fill="#F2A43B" stroke="#A66F22" stroke-width="1.4" />
        <circle cx="19.8" cy="6.2" r="3.2" fill="#F2A43B" stroke="#A66F22" stroke-width="1.4" />
        <circle cx="13" cy="14" r="9" fill="#FFF8E3" stroke="#E0942B" stroke-width="2" />
        <line x1="13" y1="14" x2="13" y2="9" stroke="#52B079" stroke-width="2" stroke-linecap="round" />
        <line x1="13" y1="14" x2="17" y2="15.2" stroke="#F07470" stroke-width="2" stroke-linecap="round" />
        <circle cx="13" cy="14" r="1.5" fill="#5A4031" />
      </svg>`;

    function update() {
      const now = new Date();
      const y = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const wd = weekdays[now.getDay()];
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      el.innerHTML = `${calSvg}<span>${y}/${mo}/${d} (星期${wd})</span>${clkSvg}<span class="clock-time-txt">${hh}:${mm}:${ss}</span>`;
    }
    update();
    setInterval(update, 1000);
  }

  // ==================== 7. 頁尾四大宣告彈窗與一鍵複製網址 ====================
  function initLegalModals() {
    const map = {
      privacy: document.getElementById("modal-legal-privacy"),
      terms: document.getElementById("modal-legal-terms"),
      changelog: document.getElementById("modal-legal-changelog"),
      qrcode: document.getElementById("modal-legal-qrcode")
    };

    function closeAll() {
      Object.values(map).forEach((m) => {
        if (m) m.classList.add("hidden");
      });
    }

    document.querySelectorAll("[data-open-legal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX.playClick();
        closeAll();
        const target = map[btn.dataset.openLegal];
        if (target) target.classList.remove("hidden");
      });
    });

    document.querySelectorAll("[data-close-legal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX.playClick();
        closeAll();
      });
    });

    Object.values(map).forEach((m) => {
      if (!m) return;
      m.addEventListener("click", (ev) => {
        if (ev.target === m) closeAll();
      });
    });

    const copyBtn = document.getElementById("btn-copy-site-url");
    if (copyBtn) {
      const siteUrl = "https://smallfishann97.github.io/math-adventure-island/";
      copyBtn.addEventListener("click", () => {
        window.SoundFX.playClick();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(siteUrl).then(() => {
            copyBtn.textContent = "✅ 已複製學習網址！快貼給親友一起玩吧！";
            setTimeout(() => {
              copyBtn.textContent = `📋 複製學習網址 (${siteUrl})`;
            }, 2200);
          }).catch(() => {
            prompt("請複製以下學習網址：", siteUrl);
          });
        } else {
          prompt("請複製以下學習網址：", siteUrl);
        }
      });
    }
  }

  window.MathDeluxe = {
    bgm,
    initLiveClock,
    initLegalModals,
    initIslandAtmosphere,
    initCertificateGenerator,
    initBlitzGame,
    initPkMode
  };
})();
