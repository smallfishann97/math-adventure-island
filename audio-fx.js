/**
 * 互動音效引擎（Web Audio API）與答題粒子特效引擎（HTML5 Canvas）
 * 零外部依賴，離線雙擊 index.html 即可完整運作。
 */
(function () {
  class SoundEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    ensureContext() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    setEnabled(val) {
      this.enabled = Boolean(val);
    }

    playTone(freq, startOffset, duration, type = "triangle", gainPeak = 0.16) {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + startOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    playClick() {
      this.playTone(640, 0, 0.06, "sine", 0.09);
    }

    playCorrect(combo = 1) {
      // 連擊越高，音高微微上升（最多升 6 個半音）
      const semitoneBoost = Math.min(combo - 1, 6);
      const ratio = Math.pow(2, semitoneBoost / 12);
      this.playTone(523.25 * ratio, 0.0, 0.14, "triangle", 0.18); // C5
      this.playTone(659.25 * ratio, 0.08, 0.16, "triangle", 0.18); // E5
      this.playTone(783.99 * ratio, 0.16, 0.24, "sine", 0.2); // G5
      if (combo >= 3) {
        this.playTone(1046.5 * ratio, 0.24, 0.28, "sine", 0.16); // C6 連擊獎勵音
      }
    }

    playWrong() {
      // 溫和提醒音，不刺耳
      this.playTone(311.13, 0.0, 0.16, "sine", 0.15); // Eb4
      this.playTone(261.63, 0.14, 0.24, "sine", 0.14); // C4
    }

    playFanfare(stars = 3) {
      if (stars >= 3) {
        // 勝利號角 C5-E5-G5-C6
        const notes = [
          [523.25, 0.0, 0.15],
          [659.25, 0.13, 0.15],
          [783.99, 0.26, 0.15],
          [1046.5, 0.4, 0.45],
          [783.99, 0.56, 0.14],
          [1046.5, 0.7, 0.55]
        ];
        notes.forEach(([f, t, d]) => this.playTone(f, t, d, "triangle", 0.18));
      } else if (stars === 2) {
        const notes = [
          [523.25, 0.0, 0.16],
          [659.25, 0.15, 0.16],
          [783.99, 0.3, 0.35]
        ];
        notes.forEach(([f, t, d]) => this.playTone(f, t, d, "triangle", 0.16));
      } else {
        const notes = [
          [440.0, 0.0, 0.18],
          [523.25, 0.18, 0.32]
        ];
        notes.forEach(([f, t, d]) => this.playTone(f, t, d, "sine", 0.14));
      }
    }
  }

  class EffectsEngine {
    constructor(canvasId, floatLayerId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
      this.floatLayer = document.getElementById(floatLayerId);
      this.particles = [];
      this.rafId = null;
      this.colors = ["#b8863b", "#d9b675", "#2d5a4c", "#a63a3a", "#d97706", "#785a3a"];

      if (this.canvas) {
        this.resize();
        window.addEventListener("resize", () => this.resize());
      }
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burstConfetti(x = window.innerWidth / 2, y = window.innerHeight * 0.42, count = 42) {
      if (!this.ctx) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5,
          gravity: 0.24,
          size: 6 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          shape: Math.random() > 0.35 ? "rect" : "circle",
          life: 1.0,
          decay: 0.014 + Math.random() * 0.01
        });
      }
      this.startLoop();
    }

    celebrationRain() {
      const w = window.innerWidth;
      this.burstConfetti(w * 0.25, window.innerHeight * 0.3, 45);
      setTimeout(() => this.burstConfetti(w * 0.75, window.innerHeight * 0.3, 45), 180);
      setTimeout(() => this.burstConfetti(w * 0.5, window.innerHeight * 0.22, 60), 360);
    }

    startLoop() {
      if (this.rafId !== null) return;
      const tick = () => {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vRot;
          p.life -= p.decay;

          if (p.life <= 0 || p.y > this.canvas.height + 30) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.life);
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size / 2.2, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
        }

        if (this.particles.length > 0) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.rafId = null;
        }
      };
      this.rafId = requestAnimationFrame(tick);
    }

    spawnFloatingText(text, color = "#16a34a", x = window.innerWidth / 2, y = window.innerHeight * 0.38) {
      if (!this.floatLayer) return;
      const el = document.createElement("div");
      el.className = "floating-text";
      el.textContent = text;
      el.style.color = color;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      this.floatLayer.appendChild(el);
      setTimeout(() => el.remove(), 2900);
    }
  }

  class SpeechEngine {
    constructor() {
      this.synth = window.speechSynthesis || null;
      this.activeBtn = null;
    }

    formatForSpeech(rawText) {
      return String(rawText || "")
        // 分數轉換（如 4/9 -> 9 分之 4）
        .replace(/(\d+)\s*\/\s*(\d+)/g, "$2分之$1")
        .replace(/cm²/gi, "平方公分")
        .replace(/\bmm\b/gi, "毫米")
        .replace(/\bcm\b/gi, "公分")
        .replace(/\bmL\b/g, "毫升")
        .replace(/\bL\b/g, "公升")
        .replace(/\bkg\b/gi, "公斤")
        .replace(/\bg\b/gi, "公克")
        .replace(/×/g, "乘以")
        .replace(/÷/g, "除以")
        .replace(/＝|=/g, "等於")
        .replace(/＋|\+/g, "加")
        .replace(/－/g, "減")
        .replace(/＜|</g, "小於")
        .replace(/＞|>/g, "大於")
        .replace(/⇔/g, "可以互相換算成")
        .replace(/→|➜/g, "，變成")
        .replace(/[①②③④💡🔑📘⚠️🍃✦]/g, "");
    }

    pickVoice() {
      if (!this.synth) return null;
      const voices = this.synth.getVoices() || [];
      const norm = (v) => String(v.lang || "").replace("_", "-").toLowerCase();
      return (
        voices.find((v) => norm(v) === "zh-tw") ||
        voices.find((v) => norm(v).includes("zh-hant") || norm(v).includes("cmn-hant")) ||
        voices.find((v) => norm(v).startsWith("zh")) ||
        null
      );
    }

    resetBtn() {
      if (this.activeBtn) {
        this.activeBtn.classList.remove("speaking");
        this.activeBtn.textContent = this.activeBtn.dataset.idleLabel || "🔊 聽語音";
        this.activeBtn = null;
      }
    }

    stop() {
      if (this.synth && (this.synth.speaking || this.synth.pending)) {
        try { this.synth.cancel(); } catch (_) {}
      }
      this.currentUtter = null;
      this.resetBtn();
    }

    toggle(text, btnEl) {
      if (!this.synth) {
        alert("目前的瀏覽器不支援語音朗讀功能喔！請改用手機的 Safari 或 Chrome 開啟。");
        return;
      }
      const isSame = this.activeBtn === btnEl;
      const wasSpeaking = this.synth.speaking || this.synth.pending;
      this.stop();
      if (isSame) return;

      const utter = new SpeechSynthesisUtterance(this.formatForSpeech(text));
      utter.lang = "zh-TW";
      utter.rate = 0.9;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      const v = this.pickVoice();
      if (v) utter.voice = v;
      this.currentUtter = utter;

      if (btnEl) {
        this.activeBtn = btnEl;
        btnEl.classList.add("speaking");
        btnEl.textContent = "⏹️ 停止朗讀";
      }

      utter.onend = () => {
        if (this.currentUtter === utter) this.resetBtn();
      };
      utter.onerror = () => {
        if (this.currentUtter === utter) this.resetBtn();
      };

      try { if (this.synth.paused) this.synth.resume(); } catch (_) {}
      if (wasSpeaking) {
        setTimeout(() => {
          try { this.synth.speak(utter); } catch (_) { this.resetBtn(); }
        }, 60);
      } else {
        try { this.synth.speak(utter); } catch (_) { this.resetBtn(); }
      }
    }

    // 單次語音說話（給 Q 版小人物與互動提示用）
    speak(text, pitch = 1.12, rate = 0.96) {
      if (!this.synth || !text) return;
      const wasSpeaking = this.synth.speaking || this.synth.pending;
      this.stop();
      const utter = new SpeechSynthesisUtterance(this.formatForSpeech(text));
      utter.lang = "zh-TW";
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = 1.0;
      const v = this.pickVoice();
      if (v) utter.voice = v;
      this.currentUtter = utter;
      try { if (this.synth.paused) this.synth.resume(); } catch (_) {}
      if (wasSpeaking) {
        setTimeout(() => { try { this.synth.speak(utter); } catch (_) {} }, 60);
      } else {
        try { this.synth.speak(utter); } catch (_) {}
      }
    }
  }

  window.SoundFX = new SoundEngine();
  window.VisualFX = new EffectsEngine("fx-canvas", "floating-fx-layer");
  window.SpeechFX = new SpeechEngine();
})();
