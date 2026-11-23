/**
 * 數學遊戲冒險島｜五大進階娛樂與學習模組
 * 1. 療癒八音盒背景音樂（Web Audio API 零外部音檔）
 * 2. 島嶼「白天／夕陽／星空夜景」氛圍切換
 * 3. 個人專屬「數學小博士獎狀」生成器（下載 PNG / 列印）
 * 4. 60 秒限時心算閃電賽（最高記錄存檔＋送金幣）
 * 5. 雙人同機 PK 搶答模式（10 回合對戰＋鍵盤/觸控搶答）
 */
(function () {
  // ==================== 1. 多曲風原創背景音樂 BGM（純 Web Audio API 零外部音檔） ====================
  class MusicBoxBGM {
    constructor() {
      this.ctx = null;
      this.timer = null;
      this.playing = false;
      this.step = 0;
      this.trackId = "musicbox";

      // 4 首 100% 原創編曲（單位 Hz，0 代表休止符）
      this.tracks = {
        // 1. 島嶼八音盒（輕快療癒雙聲部 C 大調）
        musicbox: {
          name: "🎵 島嶼八音盒",
          tempoMs: 240,
          leadWave: "triangle",
          bassWave: "sine",
          leadGain: 0.058,
          bassGain: 0.042,
          leadDecay: 0.28,
          bassDecay: 0.34,
          chime: true,
          melody: [
            523.25, 659.25, 783.99, 0,      880.00, 783.99, 659.25, 0,
            587.33, 659.25, 783.99, 659.25, 587.33, 0,      523.25, 0,
            698.46, 880.00, 1046.5, 0,      880.00, 783.99, 659.25, 523.25,
            587.33, 659.25, 783.99, 880.00, 783.99, 0,      0,      0,
            1046.5, 880.00, 783.99, 659.25, 783.99, 0,      659.25, 523.25,
            698.46, 783.99, 880.00, 698.46, 783.99, 0,      587.33, 0,
            659.25, 783.99, 880.00, 1046.5, 880.00, 698.46, 659.25, 587.33,
            523.25, 659.25, 783.99, 523.25, 523.25, 0,      0,      0
          ],
          bass: [
            261.63, 0, 329.63, 0, 220.00, 0, 261.63, 0,
            196.00, 0, 246.94, 0, 261.63, 0, 196.00, 0,
            174.61, 0, 220.00, 0, 261.63, 0, 329.63, 0,
            293.66, 0, 220.00, 0, 196.00, 0, 246.94, 0,
            261.63, 0, 329.63, 0, 246.94, 0, 329.63, 0,
            174.61, 0, 220.00, 0, 196.00, 0, 246.94, 0,
            220.00, 0, 261.63, 0, 174.61, 0, 220.00, 0,
            196.00, 0, 246.94, 0, 261.63, 0, 0,      0
          ]
        },

        // 2. 勇敢冒險曲（熱血 RPG 進行曲風格・勇者出征感）
        adventure: {
          name: "⚔️ 勇敢冒險曲",
          tempoMs: 185,
          leadWave: "square",
          bassWave: "triangle",
          leadGain: 0.032,
          bassGain: 0.062,
          leadDecay: 0.21,
          bassDecay: 0.22,
          chime: false,
          melody: [
            // A 段：號角吹響啟程
            523.25, 0, 523.25, 659.25, 783.99, 0, 783.99, 880.00,
            783.99, 659.25, 587.33, 659.25, 783.99, 0, 0, 0,
            // B 段：翻山越嶺衝刺
            880.00, 0, 880.00, 1046.5, 987.77, 880.00, 783.99, 659.25,
            698.46, 783.99, 880.00, 698.46, 783.99, 0, 587.33, 0,
            // C 段：發現神祕寶藏
            659.25, 783.99, 1046.5, 0, 987.77, 880.00, 783.99, 0,
            698.46, 659.25, 587.33, 659.25, 783.99, 880.00, 987.77, 0,
            // D 段：凱旋勝利回歸
            1046.5, 0, 783.99, 0, 880.00, 987.77, 1046.5, 0,
            880.00, 783.99, 659.25, 587.33, 523.25, 0, 523.25, 0
          ],
          bass: [
            261.63, 261.63, 196.00, 261.63, 261.63, 0, 196.00, 0,
            196.00, 196.00, 246.94, 293.66, 196.00, 0, 196.00, 0,
            220.00, 220.00, 261.63, 220.00, 196.00, 0, 164.81, 0,
            174.61, 174.61, 220.00, 174.61, 196.00, 0, 246.94, 0,
            261.63, 0, 329.63, 0, 246.94, 0, 196.00, 0,
            174.61, 0, 220.00, 0, 196.00, 246.94, 293.66, 0,
            261.63, 0, 196.00, 0, 174.61, 0, 196.00, 0,
            220.00, 196.00, 174.61, 196.00, 261.63, 0, 130.81, 0
          ]
        },

        // 3. 星空晚安曲（溫柔專注慢板，適合靜心算數學）
        lullaby: {
          name: "🌙 星空晚安曲",
          tempoMs: 340,
          leadWave: "sine",
          bassWave: "sine",
          leadGain: 0.052,
          bassGain: 0.036,
          leadDecay: 0.52,
          bassDecay: 0.62,
          chime: true,
          melody: [
            523.25, 0, 659.25, 783.99, 659.25, 0, 523.25, 0,
            587.33, 0, 698.46, 880.00, 783.99, 0, 0,      0,
            659.25, 0, 783.99, 1046.5, 880.00, 0, 698.46, 0,
            659.25, 587.33, 523.25, 0, 523.25, 0, 0,      0
          ],
          bass: [
            261.63, 0, 0, 0, 196.00, 0, 0, 0,
            174.61, 0, 0, 0, 196.00, 0, 0, 0,
            220.00, 0, 0, 0, 174.61, 0, 0, 0,
            196.00, 0, 246.94, 0, 261.63, 0, 0, 0
          ]
        },

        // 4. 甜點遊樂園（蹦蹦跳跳活潑嘉年華風格）
        carnival: {
          name: "🎡 甜點遊樂園",
          tempoMs: 205,
          leadWave: "triangle",
          bassWave: "triangle",
          leadGain: 0.062,
          bassGain: 0.048,
          leadDecay: 0.19,
          bassDecay: 0.20,
          chime: true,
          melody: [
            783.99, 659.25, 783.99, 1046.5, 880.00, 783.99, 659.25, 0,
            698.46, 587.33, 698.46, 880.00, 783.99, 0,      587.33, 0,
            523.25, 659.25, 783.99, 880.00, 1046.5, 880.00, 783.99, 659.25,
            587.33, 698.46, 783.99, 587.33, 523.25, 0,      523.25, 0
          ],
          bass: [
            261.63, 329.63, 392.00, 329.63, 220.00, 261.63, 329.63, 0,
            174.61, 220.00, 261.63, 220.00, 196.00, 246.94, 293.66, 0,
            261.63, 329.63, 392.00, 329.63, 174.61, 220.00, 261.63, 220.00,
            196.00, 246.94, 293.66, 246.94, 261.63, 0,      196.00, 0
          ]
        }
      };
    }

    currentTrack() {
      return this.tracks[this.trackId] || this.tracks.musicbox;
    }

    getTrack() {
      return this.trackId;
    }

    setTrack(id) {
      if (!this.tracks[id]) return this.trackId;
      this.trackId = id;
      this.step = 0;
      if (this.playing) {
        if (this.timer) clearInterval(this.timer);
        const tr = this.currentTrack();
        this.tickBeat();
        this.timer = setInterval(() => this.tickBeat(), tr.tempoMs);
      }
      return this.trackId;
    }

    playPluck(freq, isBass = false) {
      if (!freq || !this.ctx) return;
      const tr = this.currentTrack();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isBass ? tr.bassWave : tr.leadWave;
      osc.frequency.setValueAtTime(freq, now);

      const peak = isBass ? tr.bassGain : tr.leadGain;
      const decay = isBass ? tr.bassDecay : tr.leadDecay;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + decay + 0.03);

      // 八音盒／晚安曲／遊樂園疊加輕柔高八度水晶泛音
      if (!isBass && tr.chime) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = "sine";
        chime.frequency.setValueAtTime(freq * 2, now);
        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.015, now + 0.01);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chime.start(now);
        chime.stop(now + 0.18);
      }
    }

    tickBeat() {
      if (!this.playing) return;
      const tr = this.currentTrack();
      this.playPluck(tr.melody[this.step % tr.melody.length], false);
      this.playPluck(tr.bass[this.step % tr.bass.length], true);
      this.step = (this.step + 1) % tr.melody.length;
    }

    start() {
      if (this.playing) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      this.playing = true;
      const tr = this.currentTrack();
      this.tickBeat();
      this.timer = setInterval(() => this.tickBeat(), tr.tempoMs);
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

      // 依不同獎狀自動切換 5 款專屬馬卡龍繪本風主題（完全無藍色）
      let theme = {
        bgA: "#fffdf6", bgB: "#fff5dc", outer: "#d4943a", inner: "#f0c975",
        accent: "#f2a43b", nameColor: "#388d5c", pillBg: "#fff3d6",
        corner: "✦", sealEmoji: "🏆", subtitle: "MATH ADVENTURE ISLAND・金獎證書"
      };
      if (awardTitle.includes("閃電")) {
        theme = {
          bgA: "#fff9f3", bgB: "#ffe9d6", outer: "#e66b58", inner: "#f7b267",
          accent: "#e86a5a", nameColor: "#c8523d", pillBg: "#ffece3",
          corner: "⚡", sealEmoji: "⚡", subtitle: "SPEED MATH MASTER・閃電神算證書"
        };
      } else if (awardTitle.includes("全勤")) {
        theme = {
          bgA: "#f6fdf7", bgB: "#e3f7e8", outer: "#4aa36c", inner: "#8fd4a4",
          accent: "#3f9660", nameColor: "#2d7a4c", pillBg: "#e6f8ec",
          corner: "🍃", sealEmoji: "🌟", subtitle: "DAILY CHECK-IN STAR・勤學模範證書"
        };
      } else if (awardTitle.includes("單元全破")) {
        theme = {
          bgA: "#fdf7ff", bgB: "#f3e3fa", outer: "#b076cf", inner: "#e6b873",
          accent: "#a564c7", nameColor: "#7e469e", pillBg: "#f6e8fc",
          corner: "👑", sealEmoji: "👑", subtitle: "UNIT CHAMPION・單元制霸冠軍證書"
        };
      } else if (awardTitle.includes("大滿貫")) {
        theme = {
          bgA: "#fffaf0", bgB: "#ffe6c4", outer: "#d64e52", inner: "#f4bd46",
          accent: "#d64e52", nameColor: "#b83539", pillBg: "#fff0cc",
          corner: "🎆", sealEmoji: "👑", subtitle: "LEGENDARY 160 STAGES・傳說大滿貫證書"
        };
      }

      // 漸層暖色紙張底色
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, theme.bgA);
      bgGrad.addColorStop(1, theme.bgB);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 柔和圓點花紋背景
      ctx.fillStyle = "rgba(212, 148, 58, 0.08)";
      for (let gx = 70; gx < w - 50; gx += 52) {
        for (let gy = 70; gy < h - 50; gy += 52) {
          ctx.beginPath();
          ctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 外框＋內雙花邊框
      ctx.strokeStyle = theme.outer;
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.strokeStyle = theme.inner;
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      // 四角專屬主題飾紋
      ctx.fillStyle = theme.accent;
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      [[60, 68], [w - 60, 68], [60, h - 46], [w - 60, h - 46]].forEach(([x, y]) => ctx.fillText(theme.corner, x, y));

      // 右下角專屬金色圓形印章
      ctx.save();
      ctx.translate(w - 115, h - 108);
      ctx.fillStyle = theme.pillBg;
      ctx.strokeStyle = theme.outer;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = theme.inner;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 31, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "28px sans-serif";
      ctx.fillText(theme.sealEmoji, 0, 9);
      ctx.restore();

      // 標題
      ctx.fillStyle = theme.outer;
      ctx.font = "900 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(theme.subtitle, w / 2, 92);

      ctx.fillStyle = "#5a4031";
      ctx.font = "900 44px 'Noto Sans TC', sans-serif";
      ctx.fillText("榮 譽 獎 狀", w / 2, 152);

      // 頒發對象
      ctx.fillStyle = theme.nameColor;
      ctx.font = "900 34px 'Noto Sans TC', sans-serif";
      ctx.fillText(`${user.name}  同學`, w / 2, 224);

      ctx.strokeStyle = theme.inner;
      ctx.lineWidth = 2.5;
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
      ctx.fillStyle = theme.pillBg;
      ctx.beginPath();
      ctx.roundRect(w / 2 - 220, 355, 440, 56, 28);
      ctx.fill();
      ctx.strokeStyle = theme.outer;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = theme.outer;
      ctx.font = "900 24px 'Noto Sans TC', sans-serif";
      ctx.fillText(`${theme.sealEmoji} 特頒「${awardTitle}」`, w / 2, 392);

      // 底部日期
      ctx.fillStyle = "#785946";
      ctx.font = "700 18px 'Noto Sans TC', sans-serif";
      ctx.fillText(`頒發日期：${today}　　數學遊戲冒險島 敬頒`, w / 2, 468);

      // 未達標時於預覽圖加上浮水印提醒
      const gate = getCertGate(user, awardTitle);
      if (!gate.unlocked) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-0.22);
        ctx.fillStyle = "rgba(184, 107, 24, 0.16)";
        ctx.font = "900 34px 'Noto Sans TC', sans-serif";
        ctx.fillText(`🔒 ${gate.watermark}`, 0, 0);
        ctx.restore();
      }
    }

    const statusEl = document.getElementById("cert-unlock-status");

    function getMaxUnitCleared(user) {
      const counts = {};
      Object.entries((user && user.stageStars) || {}).forEach(([k, v]) => {
        if (v > 0) {
          const uid = k.split("-")[0];
          counts[uid] = (counts[uid] || 0) + 1;
        }
      });
      const vals = Object.values(counts);
      return vals.length ? Math.max(...vals) : 0;
    }

    // 四張專屬獎狀各自的達標標準
    function getCertGate(user, awardTitle) {
      const totalStars = user ? Object.values(user.stageStars || {}).reduce((a, b) => a + b, 0) : 0;
      const blitzBest = (user && user.blitzBest) || 0;
      const checkinDays = (user && user.checkinDays) || 0;
      const maxUnitCleared = getMaxUnitCleared(user);

      if (awardTitle.includes("閃電")) {
        const req = 10;
        const ok = blitzBest >= req;
        return {
          unlocked: ok,
          watermark: `閃電賽達 ${req} 題解鎖領取`,
          statusText: ok
            ? `🎉 已達標（閃電賽最佳 ${blitzBest} 題）！可以下載或列印「${awardTitle}」獎狀囉！`
            : `🔒 「${awardTitle}」門檻：60 秒閃電賽最佳紀錄達 ${req} 題（目前 ${blitzBest} 題，還差 ${req - blitzBest} 題！）`,
          toastText: `🔒 還差 ${req - blitzBest} 題就能領取「${awardTitle}」喔！\n快去「⚡ 閃電與PK」挑戰 60 秒達 ${req} 題吧！`
        };
      }
      if (awardTitle.includes("全勤")) {
        const req = 3;
        const ok = checkinDays >= req;
        return {
          unlocked: ok,
          watermark: `累計簽到 ${req} 天解鎖領取`,
          statusText: ok
            ? `🎉 已達標（累計簽到 ${checkinDays} 天）！可以下載或列印「${awardTitle}」獎狀囉！`
            : `🔒 「${awardTitle}」門檻：每日登島簽到累計達 ${req} 天（目前 ${checkinDays} 天，還差 ${req - checkinDays} 天！）`,
          toastText: `🔒 還差 ${req - checkinDays} 天簽到就能領取「${awardTitle}」喔！\n記得每天到「🛍️ 商店徽章」簽到打卡！`
        };
      }
      if (awardTitle.includes("大滿貫")) {
        const clearedAll = user ? Object.values(user.stageStars || {}).filter((s) => s > 0).length : 0;
        const req = 160;
        const ok = clearedAll >= req;
        return {
          unlocked: ok,
          watermark: `全破 160 關解鎖傳說獎狀`,
          statusText: ok
            ? `🎉 傳說達成（160 關全破）！可以下載或列印「${awardTitle}」典藏獎狀囉！`
            : `🔒 「${awardTitle}」門檻：完成全部 16 單元共 ${req} 關（目前 ${clearedAll} / ${req} 關！）`,
          toastText: `🔒 還差 ${req - clearedAll} 關就能解鎖「${awardTitle}」典藏獎狀喔！\n一起朝 160 關大滿貫邁進！`
        };
      }
      if (awardTitle.includes("單元全破")) {
        const req = 10;
        const ok = maxUnitCleared >= req;
        return {
          unlocked: ok,
          watermark: `任一單元 10 關全破解鎖`,
          statusText: ok
            ? `🎉 已達標（已全破單一單元 10 關）！可以下載或列印「${awardTitle}」獎狀囉！`
            : `🔒 「${awardTitle}」門檻：任一數學單元 10 關全部過關（目前單一單元最高 ${maxUnitCleared} / 10 關！）`,
          toastText: `🔒 還差 ${req - maxUnitCleared} 關就能領取「${awardTitle}」喔！\n把任一個單元的 10 關全破就達標了！`
        };
      }
      // 預設：國小三年級數學小博士
      const req = 30;
      const ok = totalStars >= req;
      return {
        unlocked: ok,
        watermark: `累計滿 ${req} 顆星解鎖領取`,
        statusText: ok
          ? `🎉 已達標（累計 ⭐ ${totalStars} 顆星）！可以下載或列印「${awardTitle}」獎狀囉！`
          : `🔒 「${awardTitle}」門檻：累計收集 ⭐ ${req} 顆星星（目前 ⭐ ${totalStars} 顆，再集 ${req - totalStars} 顆星就能領取！）`,
        toastText: `🔒 還差 ${req - totalStars} 顆星就能領取「${awardTitle}」喔！\n快去闖關收集 ⭐ ${req} 顆星吧！`
      };
    }

    function updateCertGateUI() {
      const user = getUserFn();
      const awardTitle = titleSel ? titleSel.value : "國小三年級數學小博士";
      const gate = getCertGate(user, awardTitle);
      if (statusEl) {
        statusEl.textContent = gate.statusText;
        if (gate.unlocked) {
          statusEl.style.background = "linear-gradient(135deg, #e9f9ee, #d6f3df)";
          statusEl.style.borderColor = "rgba(82, 176, 121, 0.5)";
        } else {
          statusEl.style.background = "";
          statusEl.style.borderColor = "";
        }
      }
      dlBtn.style.opacity = gate.unlocked ? "1" : "0.65";
      prBtn.style.opacity = gate.unlocked ? "1" : "0.65";
    }

    function checkCertUnlocked() {
      const user = getUserFn();
      const awardTitle = titleSel ? titleSel.value : "國小三年級數學小博士";
      const gate = getCertGate(user, awardTitle);
      if (!gate.unlocked) {
        window.SoundFX.playWrong();
        if (window.VisualFX) {
          window.VisualFX.spawnFloatingText(
            gate.toastText,
            "#b86b18",
            window.innerWidth / 2,
            window.innerHeight * 0.36
          );
        }
        return false;
      }
      return true;
    }

    if (titleSel) {
      titleSel.addEventListener("change", () => {
        drawCert();
        updateCertGateUI();
      });
    }

    dlBtn.addEventListener("click", () => {
      if (!checkCertUnlocked()) return;
      window.SoundFX.playClick();
      drawCert();
      const user = getUserFn();
      const link = document.createElement("a");
      link.download = `數學遊戲冒險島_獎狀_${user ? user.name : "同學"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });

    prBtn.addEventListener("click", () => {
      if (!checkCertUnlocked()) return;
      window.SoundFX.playClick();
      drawCert();
      const dataUrl = canvas.toDataURL("image/png");
      const w = window.open("", "_blank");
      if (!w) return alert("請允許彈出視窗以列印獎狀！");
      w.document.write(`<!DOCTYPE html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;"><img src="${dataUrl}" style="max-width:96%;height:auto;" onload="window.print()" /></body></html>`);
      w.document.close();
    });

    window.MathDeluxeDrawCert = () => {
      drawCert();
      updateCertGateUI();
    };
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
      const siteUrl = "https://smallfishann97.github.io/math-adventure-island/?openExternalBrowser=1";
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
    // 偵測 LINE / FB / IG 等 App 內建瀏覽器，顯示改用 Chrome / Safari 開啟提示
    const ua = navigator.userAgent || "";
    const isInApp = /Line\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua);
    const inappBanner = document.getElementById("inapp-browser-banner");
    const closeInapp = document.getElementById("btn-close-inapp-banner");
    if (isInApp && inappBanner) {
      inappBanner.classList.remove("hidden");
    }
    if (closeInapp && inappBanner) {
      closeInapp.addEventListener("click", () => inappBanner.classList.add("hidden"));
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
