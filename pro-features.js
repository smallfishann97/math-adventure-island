/**
 * 數學遊戲冒險島｜四大實用進階模組 (pro-features.js)
 * 1. ✏️ 電子計算草稿紙升級（直式格線＋上一步＋全站隨時彈出）
 * 2. 📝 線上模擬段考強化版（自選單元＋10/20題＋限時倒數＋內建計算紙＋錯題自動進錯題本）
 * 3. 🔄 學習進度一鍵備份／換機搬家（LINE 可傳搬家代碼＋JSON檔案＋登入頁直接還原）
 * 4. 🎟️ 家長真實獎勵兌換券（自訂生活獎勵＋專屬金券彈窗＋PNG下載＋家長核銷清單）
 */
(function () {
  let api = null;
  const REWARDS_STORAGE_KEY = "mai_parent_rewards_v1";
  const PARENT_PIN_KEY = "mai_parent_pin_v1";
  const DEFAULT_REWARDS = [
    { id: "rw_cartoon", icon: "📺", title: "看卡通／玩遊戲 20 分鐘", cost: 300 },
    { id: "rw_icecream", icon: "🍦", title: "吃一支冰淇淋／喜歡的小點心", cost: 400 },
    { id: "rw_park", icon: "🎡", title: "週末去公園或遊樂園玩", cost: 800 },
    { id: "rw_gift", icon: "🎁", title: "自選一份小文具／小禮物", cost: 1000 }
  ];

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normAns(s) {
    return String(s || "")
      .trim()
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/．/g, ".")
      .replace(/\s+/g, "");
  }

  function formatMMSS(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  // ==================== 1. ✏️ 電子計算草稿紙升級（直式格線＋上一步＋全站彈窗） ====================
  function initScratchpadEnhancements() {
    // A. 強化原本答題畫面裡的草稿紙（加入「直式格線」與「上一步」）
    const quizCanvas = document.getElementById("scratchpad-canvas");
    const btnGrid = document.getElementById("btn-scratchpad-grid");
    const btnUndo = document.getElementById("btn-scratchpad-undo");
    if (quizCanvas) {
      const qHistory = [];
      const ctx = quizCanvas.getContext("2d");
      quizCanvas.addEventListener("pointerdown", () => {
        try {
          if (qHistory.length >= 25) qHistory.shift();
          qHistory.push(quizCanvas.toDataURL());
        } catch (_) {}
      }, true);

      if (btnGrid) {
        btnGrid.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          const on = quizCanvas.classList.toggle("grid-on");
          btnGrid.classList.toggle("active", on);
          btnGrid.textContent = on ? "⊞ 格線：開" : "⊞ 格線：關";
        });
      }
      if (btnUndo) {
        btnUndo.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          if (!qHistory.length) return;
          const prev = qHistory.pop();
          const img = new Image();
          img.onload = () => {
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, quizCanvas.width, quizCanvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = prev;
        });
      }
    }

    // B. 全站通用「✏️ 隨身電子計算紙」彈窗（模擬考、每日一題、閃電賽皆可一鍵開啟）
    const modal = document.getElementById("global-scratchpad-modal");
    const canvas = document.getElementById("global-scratchpad-canvas");
    const btnClose = document.getElementById("btn-close-global-scratchpad");
    const btnClear = document.getElementById("btn-gpad-clear");
    const btnGpadUndo = document.getElementById("btn-gpad-undo");
    const btnGpadGrid = document.getElementById("btn-gpad-grid");
    const sizeRange = document.getElementById("gpad-size-range");
    const sizeVal = document.getElementById("gpad-size-val");

    if (!modal || !canvas) return;
    const ctx = canvas.getContext("2d");
    let drawing = false;
    let isEraser = false;
    let penColor = "#4a3320";
    let penWidth = 4;
    const undoStack = [];

    function pushUndo() {
      try {
        if (undoStack.length >= 25) undoStack.shift();
        undoStack.push(canvas.toDataURL());
      } catch (_) {}
    }

    function getPos(ev) {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((ev.clientX - r.left) / r.width) * canvas.width,
        y: ((ev.clientY - r.top) / r.height) * canvas.height
      };
    }

    canvas.addEventListener("pointerdown", (ev) => {
      pushUndo();
      drawing = true;
      canvas.setPointerCapture(ev.pointerId);
      const p = getPos(ev);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });

    canvas.addEventListener("pointermove", (ev) => {
      if (!drawing) return;
      const p = getPos(ev);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = Math.max(18, penWidth * 4);
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    const stopDraw = () => {
      drawing = false;
      ctx.globalCompositeOperation = "source-over";
    };
    canvas.addEventListener("pointerup", stopDraw);
    canvas.addEventListener("pointercancel", stopDraw);

    modal.querySelectorAll("[data-gpad-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        modal.querySelectorAll("[data-gpad-color]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const val = btn.dataset.gpadColor;
        if (val === "ERASER") {
          isEraser = true;
        } else {
          isEraser = false;
          penColor = val;
        }
      });
    });

    if (sizeRange) {
      sizeRange.addEventListener("input", () => {
        penWidth = Number(sizeRange.value) || 4;
        if (sizeVal) sizeVal.textContent = String(penWidth);
      });
    }

    if (btnGpadGrid) {
      btnGpadGrid.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const on = canvas.classList.toggle("grid-on");
        btnGpadGrid.classList.toggle("active", on);
        btnGpadGrid.textContent = on ? "⊞ 直式格線：開" : "⊞ 直式格線：關";
      });
    }

    if (btnGpadUndo) {
      btnGpadUndo.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        if (!undoStack.length) return;
        const prev = undoStack.pop();
        const img = new Image();
        img.onload = () => {
          ctx.globalCompositeOperation = "source-over";
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = prev;
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        pushUndo();
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        modal.classList.add("hidden");
      });
    }

    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) modal.classList.add("hidden");
    });

    // 綁定全站各區的 [data-open-scratchpad] 快速按鈕
    document.querySelectorAll("[data-open-scratchpad]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        openGlobalScratchpad();
      });
    });
  }

  function openGlobalScratchpad() {
    const modal = document.getElementById("global-scratchpad-modal");
    if (modal) modal.classList.remove("hidden");
  }

  // ==================== 2. 📝 線上模擬段考強化版（自選單元＋限時倒數＋錯題自動進錯題本） ====================
  let proExamState = null;
  let proExamTimerId = null;

  function stopProExamTimer() {
    if (proExamTimerId) {
      clearInterval(proExamTimerId);
      proExamTimerId = null;
    }
  }

  function initCustomMockExamUI() {
    const scopeSel = document.getElementById("mock-exam-scope");
    const customWrap = document.getElementById("custom-exam-units-wrap");
    const customGrid = document.getElementById("custom-exam-units-grid");
    if (!scopeSel || !customWrap || !customGrid) return;

    const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
    if (bank && Array.isArray(bank.units)) {
      customGrid.innerHTML = bank.units.map((u) => `
        <label class="custom-unit-chip">
          <input type="checkbox" value="${u.order}" ${u.order <= 4 ? "checked" : ""} />
          <span>${String(u.order).padStart(2, "0")} ${esc(u.title)}</span>
        </label>
      `).join("");
    }

    scopeSel.addEventListener("change", () => {
      customWrap.classList.toggle("hidden", scopeSel.value !== "custom");
    });

    customWrap.querySelectorAll("[data-exam-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const mode = btn.dataset.examPreset;
        customGrid.querySelectorAll("input[type='checkbox']").forEach((chk) => {
          const n = Number(chk.value);
          if (mode === "all") chk.checked = true;
          else if (mode === "none") chk.checked = false;
          else if (mode === "1-4") chk.checked = n >= 1 && n <= 4;
          else if (mode === "5-8") chk.checked = n >= 5 && n <= 8;
          else if (mode === "9-12") chk.checked = n >= 9 && n <= 12;
          else if (mode === "13-16") chk.checked = n >= 13 && n <= 16;
        });
      });
    });

    const btnClose = document.getElementById("btn-close-exam");
    if (btnClose) {
      btnClose.addEventListener("click", () => stopProExamTimer());
    }
  }

  function getSelectedUnitOrders(scope) {
    if (scope === "midterm") return [1, 2, 3, 4, 5, 6, 7, 8];
    if (scope === "final") return [9, 10, 11, 12, 13, 14, 15, 16];
    if (scope === "custom") {
      const checked = Array.from(document.querySelectorAll("#custom-exam-units-grid input:checked")).map((el) => Number(el.value));
      return checked;
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  }

  function pickProExamQuestions(scope, count) {
    const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
    if (!bank || !Array.isArray(bank.units)) return [];
    const orders = getSelectedUnitOrders(scope);
    if (!orders.length) return [];

    const units = bank.units.filter((u) => orders.includes(u.order));
    const pool = [];
    units.forEach((u) => {
      (u.questions || []).forEach((q) => {
        pool.push(Object.assign({}, q, { unitOrder: u.order, unitTitle: u.title, unitId: u.id }));
      });
    });

    // 均勻優先各單元抽題，再隨機補足
    const picked = [];
    const usedIds = new Set();
    const shuffledUnits = units.slice().sort(() => Math.random() - 0.5);
    shuffledUnits.forEach((u) => {
      if (picked.length >= count) return;
      const uq = (u.questions || []).slice().sort(() => Math.random() - 0.5);
      if (uq.length) {
        picked.push(Object.assign({}, uq[0], { unitOrder: u.order, unitTitle: u.title, unitId: u.id }));
        usedIds.add(uq[0].id);
      }
    });

    const rest = pool.filter((q) => !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
    while (picked.length < count && rest.length) {
      picked.push(rest.pop());
    }
    return picked.sort(() => Math.random() - 0.5);
  }

  function startProMockExam() {
    const scopeSel = document.getElementById("mock-exam-scope");
    const countSel = document.getElementById("mock-exam-count");
    const timeSel = document.getElementById("mock-exam-minutes");
    const scope = scopeSel ? scopeSel.value : "midterm";
    const count = countSel ? Number(countSel.value) || 20 : 20;
    const limitMin = timeSel ? Number(timeSel.value) : 15;

    const orders = getSelectedUnitOrders(scope);
    if (!orders.length) {
      alert("請先至少勾選 1 個單元再開始模擬考喔！");
      return;
    }

    const qs = pickProExamQuestions(scope, count);
    if (!qs.length) return;

    const scopeLabel = scope === "midterm"
      ? "📘 期中模擬考（單元 01～08）"
      : scope === "final"
      ? "📗 期末模擬考（單元 09～16）"
      : scope === "custom"
      ? `🎯 自選範圍模擬考（共 ${orders.length} 單元）`
      : "📕 全學年總複習模擬考（單元 01～16）";

    stopProExamTimer();
    proExamState = {
      scope,
      title: scopeLabel,
      questions: qs,
      answers: new Array(qs.length).fill(""),
      idx: 0,
      startedAt: Date.now(),
      limitSec: limitMin > 0 ? limitMin * 60 : 0,
      remainSec: limitMin > 0 ? limitMin * 60 : 0,
      submitted: false
    };

    const modal = document.getElementById("mock-exam-modal");
    if (modal) modal.classList.remove("hidden");

    if (proExamState.limitSec > 0) {
      proExamTimerId = setInterval(() => {
        if (!proExamState || proExamState.submitted) {
          stopProExamTimer();
          return;
        }
        proExamState.remainSec -= 1;
        const badge = document.getElementById("pro-exam-timer-badge");
        if (badge) {
          badge.textContent = `⏱️ 剩餘 ${formatMMSS(proExamState.remainSec)}`;
          badge.classList.toggle("timer-urgent", proExamState.remainSec <= 120);
        }
        if (proExamState.remainSec <= 0) {
          stopProExamTimer();
          submitProExam(true);
        }
      }, 1000);
    }

    renderProExamModal();
  }

  function submitProExam(autoTimeout) {
    if (!proExamState || proExamState.submitted) return;
    stopProExamTimer();
    proExamState.submitted = true;
    proExamState.autoTimeout = !!autoTimeout;
    proExamState.elapsedSec = Math.max(1, Math.round((Date.now() - proExamState.startedAt) / 1000));

    let correct = 0;
    const wrongIds = [];
    proExamState.questions.forEach((q, i) => {
      const ok = normAns(proExamState.answers[i]) === normAns(q.answer);
      if (ok) correct += 1;
      else if (q.id) wrongIds.push(q.id);
    });

    const perPts = Math.round(100 / proExamState.questions.length);
    const score = Math.min(100, correct * perPts);
    const coinReward = proExamState.questions.length >= 20 ? 100 : 60;
    proExamState.score = score;
    proExamState.correctCount = correct;
    proExamState.coinReward = coinReward;
    proExamState.addedMistakes = wrongIds.length;

    const user = api && api.getUser ? api.getUser() : null;
    if (user) {
      user.coins = (user.coins || 0) + coinReward;
      if (!user.mistakes || typeof user.mistakes !== "object") user.mistakes = {};
      wrongIds.forEach((qid) => {
        user.mistakes[qid] = (user.mistakes[qid] || 0) + 1;
      });
      if (!Array.isArray(user.mockExamHistory)) user.mockExamHistory = [];
      user.mockExamHistory.unshift({
        date: todayStr(),
        title: proExamState.title,
        score,
        correct,
        total: proExamState.questions.length,
        elapsedSec: proExamState.elapsedSec
      });
      if (user.mockExamHistory.length > 20) user.mockExamHistory.length = 20;
      api.saveStore && api.saveStore();
      api.refreshHome && api.refreshHome();
    }

    if (score >= 80) {
      window.SoundFX && window.SoundFX.playVictory && window.SoundFX.playVictory();
      window.SoundFX && window.SoundFX.launchConfetti && window.SoundFX.launchConfetti(window.innerWidth / 2, window.innerHeight / 3, 55);
    } else {
      window.SoundFX && window.SoundFX.playCorrect && window.SoundFX.playCorrect();
    }

    renderProExamModal();
  }

  function renderProExamModal() {
    if (!proExamState) return;
    const titleEl = document.getElementById("exam-modal-title");
    const bodyEl = document.getElementById("exam-modal-body");
    if (!bodyEl) return;

    const total = proExamState.questions.length;
    const perPts = Math.round(100 / total);
    if (titleEl) {
      titleEl.textContent = `📝 ${proExamState.title}（${total} 題・每題 ${perPts} 分・滿分 100 分）`;
    }

    if (proExamState.submitted) {
      const score = proExamState.score;
      const correct = proExamState.correctCount;
      const unitMap = new Map();
      const reviewRows = proExamState.questions.map((q, i) => {
        const ua = proExamState.answers[i] || "";
        const ok = normAns(ua) === normAns(q.answer);
        const uKey = `第 ${String(q.unitOrder).padStart(2, "0")} 單元 ${q.unitTitle}`;
        if (!unitMap.has(uKey)) unitMap.set(uKey, { ok: 0, total: 0 });
        const st = unitMap.get(uKey);
        st.total += 1;
        if (ok) st.ok += 1;
        return `
          <div class="exam-rev-row ${ok ? "ok" : "bad"}">
            <strong>第 ${i + 1} 題（${esc(q.unitTitle)}）</strong>
            <p>${esc(q.prompt)}</p>
            <div>你的答案：<b>${esc(ua || "未作答")}</b> ｜ 正確答案：<b style="color:var(--forest);">${esc(q.answer)}</b> ${ok ? "✅" : "❌"}</div>
            ${!ok && q.explanation ? `<div class="exam-exp-note">💡 解析：${esc(q.explanation)}</div>` : ""}
          </div>`;
      }).join("");

      const weakUnits = [];
      const strongUnits = [];
      unitMap.forEach((v, k) => {
        if (v.ok < v.total) weakUnits.push(`${k}（答對 ${v.ok}/${v.total}）`);
        else strongUnits.push(k);
      });

      const gradeBadge = score === 100
        ? "🏆 滿分特優神童！"
        : score >= 90
        ? "🌟 表現超級優異！"
        : score >= 75
        ? "👍 基礎穩固，繼續加油！"
        : "💪 考完複習錯題就會大進步！";

      bodyEl.innerHTML = `
        <div class="exam-score-hero">
          ${proExamState.autoTimeout ? `<div class="ver-tag" style="margin-bottom:6px;background:#fff0e6;color:#c94d2f;">⏰ 測驗時間到，系統已自動交卷！</div>` : ""}
          <div class="exam-score-num">${score} <span>分</span></div>
          <p style="font-weight:900;font-size:1.05rem;margin:4px 0;">${gradeBadge}</p>
          <p>共答對 <strong>${correct} / ${total}</strong> 題｜作答用時 <strong>${formatMMSS(proExamState.elapsedSec)}</strong>｜獲得完考獎勵 <strong>🪙 +${proExamState.coinReward} 金幣</strong>！</p>
          ${proExamState.addedMistakes > 0 ? `<p style="font-size:0.86rem;color:#b4492d;margin:4px 0 0;">🛠️ 本次答錯的 <strong>${proExamState.addedMistakes} 題</strong> 已自動收入「錯題特訓」方便加強複習！</p>` : ""}
        </div>
        <div class="exam-diag-grid">
          <div class="exam-diag-box good">
            <h4>🌟 滿分強項單元</h4>
            <p>${strongUnits.length ? strongUnits.slice(0, 5).join("、") : "下一回一定會有滿分單元！"}</p>
          </div>
          <div class="exam-diag-box warn">
            <h4>💡 建議優先複習</h4>
            <p>${weakUnits.length ? weakUnits.join("；") : "🎉 全部單元滿分通過，太厲害了！"}</p>
          </div>
        </div>
        <div class="exam-review-scroll">${reviewRows}</div>
        <div style="text-align:center;margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="btn btn-forest" id="btn-exam-retry-new">🔄 再考一份新考卷</button>
          <button type="button" class="btn btn-gold btn-lg" id="btn-exam-close-done">✨ 收下獎勵並關閉</button>
        </div>
      `;

      const doneBtn = bodyEl.querySelector("#btn-exam-close-done");
      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          document.getElementById("mock-exam-modal").classList.add("hidden");
        });
      }
      const retryBtn = bodyEl.querySelector("#btn-exam-retry-new");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          startProMockExam();
        });
      }
      return;
    }

    const q = proExamState.questions[proExamState.idx];
    const curAns = proExamState.answers[proExamState.idx];
    const answeredCount = proExamState.answers.filter((a) => a !== "").length;
    const navDots = proExamState.questions.map((_, i) => {
      const cls = i === proExamState.idx ? "active" : proExamState.answers[i] !== "" ? "done" : "";
      return `<button type="button" class="exam-dot ${cls}" data-exam-jump="${i}">${i + 1}</button>`;
    }).join("");

    let inputHtml = "";
    if (q.choices && q.choices.length) {
      inputHtml = `<div class="exam-choices">${q.choices.map((ch) => `
        <button type="button" class="exam-choice-btn ${curAns === ch ? "selected" : ""}" data-exam-choice="${esc(ch)}">${esc(ch)}</button>
      `).join("")}</div>`;
    } else {
      inputHtml = `
        <div class="exam-input-row">
          <input type="text" id="exam-text-input" class="luxury-input" inputmode="decimal" placeholder="請輸入答案…" value="${esc(curAns)}" />
          <button type="button" class="btn btn-forest" id="exam-save-input">儲存答案</button>
        </div>`;
    }

    const timerHtml = proExamState.limitSec > 0
      ? `<span id="pro-exam-timer-badge" class="exam-timer-pill ${proExamState.remainSec <= 120 ? "timer-urgent" : ""}">⏱️ 剩餘 ${formatMMSS(proExamState.remainSec)}</span>`
      : `<span class="exam-timer-pill">⏱️ 不限時練習</span>`;

    bodyEl.innerHTML = `
      <div class="exam-top-toolbar">
        ${timerHtml}
        <button type="button" class="fc-speak-btn" id="btn-exam-open-scratchpad">✏️ 打開電子計算紙</button>
      </div>
      <div class="exam-dots-bar">${navDots}</div>
      <div class="exam-q-card">
        <div class="exam-q-meta">第 ${proExamState.idx + 1} / ${total} 題（已作答 ${answeredCount} 題）｜ 第 ${String(q.unitOrder).padStart(2, "0")} 單元：${esc(q.unitTitle)}</div>
        <div class="exam-q-prompt">${esc(q.prompt)}</div>
        ${q.visualSvg ? `<div class="exam-q-svg">${q.visualSvg}</div>` : ""}
        ${inputHtml}
      </div>
      <div class="exam-footer-nav">
        <button type="button" class="btn btn-ghost" id="btn-exam-prev" ${proExamState.idx === 0 ? "disabled" : ""}>← 上一題</button>
        <button type="button" class="btn btn-burgundy" id="btn-exam-submit">📮 交卷批改（${answeredCount}/${total}）</button>
        <button type="button" class="btn btn-gold" id="btn-exam-next" ${proExamState.idx >= total - 1 ? "disabled" : ""}>下一題 →</button>
      </div>
    `;

    const padBtn = bodyEl.querySelector("#btn-exam-open-scratchpad");
    if (padBtn) {
      padBtn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        openGlobalScratchpad();
      });
    }

    bodyEl.querySelectorAll("button[data-exam-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        proExamState.idx = Number(b.dataset.examJump);
        renderProExamModal();
      });
    });

    bodyEl.querySelectorAll("button[data-exam-choice]").forEach((b) => {
      b.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        proExamState.answers[proExamState.idx] = b.dataset.examChoice;
        if (proExamState.idx < total - 1) proExamState.idx += 1;
        renderProExamModal();
      });
    });

    const txtIn = bodyEl.querySelector("#exam-text-input");
    const saveIn = bodyEl.querySelector("#exam-save-input");
    if (txtIn) {
      txtIn.addEventListener("input", () => {
        proExamState.answers[proExamState.idx] = txtIn.value.trim();
      });
      txtIn.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          proExamState.answers[proExamState.idx] = txtIn.value.trim();
          if (proExamState.idx < total - 1) proExamState.idx += 1;
          renderProExamModal();
        }
      });
    }
    if (saveIn) {
      saveIn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        if (txtIn) proExamState.answers[proExamState.idx] = txtIn.value.trim();
        if (proExamState.idx < total - 1) proExamState.idx += 1;
        renderProExamModal();
      });
    }

    const prevBtn = bodyEl.querySelector("#btn-exam-prev");
    const nextBtn = bodyEl.querySelector("#btn-exam-next");
    const subBtn = bodyEl.querySelector("#btn-exam-submit");
    if (prevBtn) prevBtn.addEventListener("click", () => { proExamState.idx = Math.max(0, proExamState.idx - 1); renderProExamModal(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { proExamState.idx = Math.min(total - 1, proExamState.idx + 1); renderProExamModal(); });
    if (subBtn) {
      subBtn.addEventListener("click", () => {
        const unans = total - proExamState.answers.filter((a) => a !== "").length;
        if (unans > 0 && !confirm(`還有 ${unans} 題尚未作答，確定要現在交卷批改嗎？`)) return;
        submitProExam(false);
      });
    }
  }

  // ==================== 3. 🔄 學習進度一鍵備份／換機搬家（搬家代碼＋JSON 雙模式） ====================
  function encodeTransferCode(payloadObj) {
    const json = JSON.stringify(payloadObj);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return "MAI-BACKUP-V1:" + btoa(bin);
  }

  function decodeTransferCode(rawStr) {
    const trimmed = String(rawStr || "").trim();
    if (!trimmed) throw new Error("請貼上搬家代碼或 JSON 備份內容！");
    if (trimmed.startsWith("MAI-BACKUP-V1:")) {
      const b64 = trimmed.slice("MAI-BACKUP-V1:".length).replace(/\s+/g, "");
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    }
    return JSON.parse(trimmed);
  }

  function buildFullBackupObject() {
    const store = api && api.getStore ? api.getStore() : JSON.parse(localStorage.getItem("grade3_math_atelier_accounts_v2") || '{"users":{}}');
    return {
      v: 2,
      exportedAt: todayStr(),
      users: store.users || {},
      activeUserId: store.activeUserId || null,
      parentRewards: loadParentRewards(),
      parentPin: getSavedParentPin() || ""
    };
  }

  function applyBackupObject(parsed) {
    if (!parsed || !parsed.users || typeof parsed.users !== "object") {
      throw new Error("格式不符，請確認是本網站匯出的備份檔或搬家代碼！");
    }
    const userCount = Object.keys(parsed.users).length;
    if (userCount === 0) throw new Error("備份檔內沒有冒險者資料喔！");

    if (Array.isArray(parsed.parentRewards) && parsed.parentRewards.length) {
      saveParentRewards(parsed.parentRewards);
    }
    if (typeof parsed.parentPin === "string" && /^\d{4}$/.test(parsed.parentPin)) {
      saveParentPin(parsed.parentPin);
    }
    const cleanStore = {
      users: parsed.users,
      activeUserId: parsed.activeUserId || Object.keys(parsed.users)[0] || null
    };
    if (api && api.setStore) {
      api.setStore(cleanStore);
    } else {
      localStorage.setItem("grade3_math_atelier_accounts_v2", JSON.stringify(cleanStore));
      location.reload();
    }
    return userCount;
  }

  function initTransferBackupTools() {
    const modal = document.getElementById("transfer-backup-modal");
    const btnClose = document.getElementById("btn-close-transfer-modal");
    const codeOutput = document.getElementById("transfer-code-output");
    const codeInput = document.getElementById("transfer-code-input");
    const btnGenCopy = document.getElementById("btn-gen-copy-transfer");
    const btnApplyCode = document.getElementById("btn-apply-transfer-code");
    const btnPickFile = document.getElementById("btn-transfer-pick-file");
    const fileInput = document.getElementById("input-transfer-file");
    const toast = document.getElementById("transfer-toast");

    function showToast(msg, isErr) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove("hidden");
      toast.style.background = isErr ? "#fff0ed" : "#e8f9ee";
      toast.style.borderColor = isErr ? "#e27d6b" : "#5bb876";
      toast.style.color = isErr ? "#b53c27" : "#276b3d";
    }

    function openModal(focusImport) {
      if (!modal) return;
      if (toast) toast.classList.add("hidden");
      if (codeOutput) {
        try {
          const obj = buildFullBackupObject();
          const hasUsers = Object.keys(obj.users || {}).length > 0;
          codeOutput.value = hasUsers ? encodeTransferCode(obj) : "（目前這台裝置尚未建立冒險者，可直接於下方貼上舊手機的搬家代碼還原喔！）";
        } catch (_) {
          codeOutput.value = "";
        }
      }
      if (codeInput) codeInput.value = "";
      modal.classList.remove("hidden");
      if (focusImport && codeInput) {
        setTimeout(() => codeInput.focus(), 120);
      }
    }

    document.querySelectorAll("[data-open-transfer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        openModal(btn.dataset.openTransfer === "import");
      });
    });

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        modal.classList.add("hidden");
      });
      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.classList.add("hidden");
      });
    }

    if (btnGenCopy && codeOutput) {
      btnGenCopy.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const obj = buildFullBackupObject();
        const count = Object.keys(obj.users || {}).length;
        if (!count) {
          showToast("⚠️ 目前還沒有建立冒險者角色，無法產生搬家代碼喔！", true);
          return;
        }
        const code = encodeTransferCode(obj);
        codeOutput.value = code;
        codeOutput.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(() => {
            showToast(`✅ 已複製搬家代碼（含 ${count} 位冒險者進度）！可直接貼到 LINE 傳給新手機或平板還原！`, false);
          }).catch(() => {
            showToast(`✅ 搬家代碼已產生（含 ${count} 位冒險者），請手動全選複製喔！`, false);
          });
        } else {
          try { document.execCommand("copy"); } catch (_) {}
          showToast(`✅ 已複製搬家代碼（含 ${count} 位冒險者進度）！可直接貼到 LINE 傳送！`, false);
        }
      });
    }

    if (btnApplyCode && codeInput) {
      btnApplyCode.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        try {
          const parsed = decodeTransferCode(codeInput.value);
          const names = Object.values(parsed.users || {}).map((u) => u.name || "冒險者").join("、");
          if (!confirm(`偵測到 ${Object.keys(parsed.users).length} 位冒險者（${names}）的學習備份！\n\n確定要還原到這台裝置嗎？`)) return;
          const cnt = applyBackupObject(parsed);
          showToast(`🎉 搬家還原成功！已同步還原 ${cnt} 位冒險者的星星、金幣與冒險島！`, false);
          renderParentRewardsPanel();
          setTimeout(() => { modal && modal.classList.add("hidden"); }, 1200);
        } catch (err) {
          showToast(`❌ 還原失敗：${err.message || "代碼格式不正確，請確認有完整複製喔！"}`, true);
        }
      });
    }

    if (btnPickFile && fileInput) {
      btnPickFile.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        fileInput.click();
      });
      fileInput.addEventListener("change", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            const cnt = applyBackupObject(parsed);
            showToast(`🎉 備份檔還原成功！已同步 ${cnt} 位冒險者進度！`, false);
            renderParentRewardsPanel();
            setTimeout(() => { modal && modal.classList.add("hidden"); }, 1200);
          } catch (_) {
            showToast("❌ 匯入失敗：請選擇本網站匯出的 .json 備份檔喔！", true);
          }
        };
        reader.readAsText(file, "utf-8");
        fileInput.value = "";
      });
    }
  }

  // ==================== 4. 🎟️ 家長真實獎勵兌換券（含 🔐 家長 4 位數 PIN 碼鎖） ====================
  function getSavedParentPin() {
    try {
      const p = localStorage.getItem(PARENT_PIN_KEY);
      return p && /^\d{4}$/.test(p) ? p : "";
    } catch (_) {
      return "";
    }
  }

  function saveParentPin(pin) {
    try {
      if (pin) localStorage.setItem(PARENT_PIN_KEY, pin);
      else localStorage.removeItem(PARENT_PIN_KEY);
    } catch (_) {}
  }

  let pinPendingCallback = null;
  let pinPendingLabel = "";
  let pinResetAnswer = 0;

  function showParentPinMode(mode) {
    const titleEl = document.getElementById("parent-pin-title");
    const descEl = document.getElementById("parent-pin-desc");
    const setupForm = document.getElementById("parent-pin-setup-form");
    const verifyForm = document.getElementById("parent-pin-verify-form");
    const resetForm = document.getElementById("parent-pin-reset-form");
    const setupErr = document.getElementById("parent-pin-setup-err");
    const verifyErr = document.getElementById("parent-pin-verify-err");
    const resetErr = document.getElementById("parent-pin-reset-err");

    [setupForm, verifyForm, resetForm].forEach((f) => f && f.classList.add("hidden"));
    [setupErr, verifyErr, resetErr].forEach((e) => e && e.classList.add("hidden"));

    if (mode === "setup") {
      if (titleEl) titleEl.textContent = "🔐 設定家長專屬 4 位數密碼";
      if (descEl) {
        descEl.textContent = pinPendingLabel
          ? `請先由爸爸媽媽設定一組 4 位數數字密碼（例：生日或手機末 4 碼），設定完成後將立即執行「${pinPendingLabel}」：`
          : "請設定一組新的 4 位數家長數字密碼，避免小朋友誤按核銷或自行修改獎勵金幣：";
      }
      const n1 = document.getElementById("parent-pin-new1");
      const n2 = document.getElementById("parent-pin-new2");
      if (n1) n1.value = "";
      if (n2) n2.value = "";
      if (setupForm) setupForm.classList.remove("hidden");
      setTimeout(() => n1 && n1.focus(), 80);
    } else if (mode === "verify") {
      if (titleEl) titleEl.textContent = "🔐 請輸入家長 4 位數密碼";
      if (descEl) {
        descEl.textContent = pinPendingLabel
          ? `為確認是爸爸媽媽本人操作，請輸入 4 位數家長密碼以執行「${pinPendingLabel}」：`
          : "請輸入 4 位數家長密碼以繼續：";
      }
      const inp = document.getElementById("parent-pin-input");
      if (inp) inp.value = "";
      if (verifyForm) verifyForm.classList.remove("hidden");
      setTimeout(() => inp && inp.focus(), 80);
    } else if (mode === "reset") {
      const a = 17 + Math.floor(Math.random() * 22);
      const b = 13 + Math.floor(Math.random() * 17);
      pinResetAnswer = a * b;
      if (titleEl) titleEl.textContent = "🧮 大人心算驗證・重設家長密碼";
      if (descEl) descEl.textContent = "請爸爸媽媽算出下方兩位數乘法答案，答對即可重新設定新的 4 位數密碼：";
      const qEl = document.getElementById("parent-pin-math-q");
      const aEl = document.getElementById("parent-pin-math-ans");
      if (qEl) qEl.textContent = `請計算：${a} × ${b} = ？`;
      if (aEl) aEl.value = "";
      if (resetForm) resetForm.classList.remove("hidden");
      setTimeout(() => aEl && aEl.focus(), 80);
    }
  }

  function requireParentPin(actionLabel, onAuthorized, forceSetup) {
    const modal = document.getElementById("parent-pin-modal");
    if (!modal) {
      onAuthorized && onAuthorized();
      return;
    }
    pinPendingLabel = actionLabel || "";
    pinPendingCallback = onAuthorized || null;
    const saved = getSavedParentPin();
    showParentPinMode(forceSetup || !saved ? "setup" : "verify");
    modal.classList.remove("hidden");
  }

  function initParentPinModal() {
    const modal = document.getElementById("parent-pin-modal");
    const btnClose = document.getElementById("btn-close-parent-pin");
    const setupForm = document.getElementById("parent-pin-setup-form");
    const verifyForm = document.getElementById("parent-pin-verify-form");
    const resetForm = document.getElementById("parent-pin-reset-form");
    const btnForgot = document.getElementById("btn-parent-pin-forgot");
    const btnBackVerify = document.getElementById("btn-parent-pin-back-verify");
    if (!modal) return;

    function closePinModal() {
      modal.classList.add("hidden");
      pinPendingCallback = null;
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        closePinModal();
      });
    }
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) closePinModal();
    });

    if (setupForm) {
      setupForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const n1 = (document.getElementById("parent-pin-new1")?.value || "").trim();
        const n2 = (document.getElementById("parent-pin-new2")?.value || "").trim();
        const err = document.getElementById("parent-pin-setup-err");
        if (!/^\d{4}$/.test(n1)) {
          if (err) { err.textContent = "❌ 請輸入剛好 4 位數的數字密碼（0～9）喔！"; err.classList.remove("hidden"); }
          return;
        }
        if (n1 !== n2) {
          if (err) { err.textContent = "❌ 兩次輸入的密碼不一致，請再確認一次！"; err.classList.remove("hidden"); }
          return;
        }
        saveParentPin(n1);
        window.SoundFX && window.SoundFX.playCorrect && window.SoundFX.playCorrect();
        const cb = pinPendingCallback;
        closePinModal();
        if (cb) cb();
      });
    }

    if (verifyForm) {
      verifyForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const val = (document.getElementById("parent-pin-input")?.value || "").trim();
        const err = document.getElementById("parent-pin-verify-err");
        if (val !== getSavedParentPin()) {
          window.SoundFX && window.SoundFX.playWrong && window.SoundFX.playWrong();
          if (err) { err.textContent = "❌ 家長密碼不正確，請由爸爸媽媽本人輸入喔！"; err.classList.remove("hidden"); }
          return;
        }
        window.SoundFX && window.SoundFX.playCorrect && window.SoundFX.playCorrect();
        const cb = pinPendingCallback;
        closePinModal();
        if (cb) cb();
      });
    }

    if (btnForgot) {
      btnForgot.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        showParentPinMode("reset");
      });
    }

    if (btnBackVerify) {
      btnBackVerify.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        showParentPinMode("verify");
      });
    }

    if (resetForm) {
      resetForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const ans = Number((document.getElementById("parent-pin-math-ans")?.value || "").trim());
        const err = document.getElementById("parent-pin-reset-err");
        if (ans !== pinResetAnswer) {
          window.SoundFX && window.SoundFX.playWrong && window.SoundFX.playWrong();
          if (err) { err.textContent = "❌ 答案不正確，請再算一次喔！"; err.classList.remove("hidden"); }
          return;
        }
        window.SoundFX && window.SoundFX.playCorrect && window.SoundFX.playCorrect();
        saveParentPin("");
        showParentPinMode("setup");
      });
    }
  }

  function loadParentRewards() {
    try {
      const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (_) {}
    return DEFAULT_REWARDS.map((r) => Object.assign({}, r));
  }

  function saveParentRewards(list) {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  let rewardManageOpen = false;
  let activeTicketData = null;

  function ensureUserVouchers(user) {
    if (!user) return [];
    if (!Array.isArray(user.parentVouchers)) user.parentVouchers = [];
    return user.parentVouchers;
  }

  function renderParentRewardsPanel() {
    const grid = document.getElementById("parent-rewards-grid");
    const vouchersWrap = document.getElementById("parent-vouchers-list");
    const managePanel = document.getElementById("parent-rewards-manage-panel");
    const coinsBadge = document.getElementById("parent-rewards-my-coins");
    if (!grid) return;

    const user = api && api.getUser ? api.getUser() : null;
    const coins = user ? (user.coins || 0) : 0;
    if (coinsBadge) coinsBadge.textContent = `🪙 目前持有：${coins.toLocaleString("zh-TW")} 金幣`;

    const rewards = loadParentRewards();
    if (managePanel) managePanel.classList.toggle("hidden", !rewardManageOpen);

    grid.innerHTML = rewards.map((rw) => {
      const canAfford = coins >= rw.cost;
      return `
        <div class="reward-ticket-card ${canAfford ? "" : "is-locked"}">
          <div class="rt-icon">${esc(rw.icon || "🎁")}</div>
          <div class="rt-body">
            <h4 class="rt-title">${esc(rw.title)}</h4>
            <div class="rt-cost">🪙 ${Number(rw.cost).toLocaleString("zh-TW")} 金幣</div>
          </div>
          <div class="rt-actions">
            <button type="button" class="btn ${canAfford ? "btn-gold" : "btn-ghost"} btn-sm" data-redeem-rw="${esc(rw.id)}" ${canAfford ? "" : "disabled"}>
              ${canAfford ? "🎟️ 立即兌換" : "金幣不足"}
            </button>
            ${rewardManageOpen ? `<button type="button" class="btn btn-ghost btn-sm" data-del-rw="${esc(rw.id)}" title="刪除此獎勵">🗑️</button>` : ""}
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll("[data-redeem-rw]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const u = api && api.getUser ? api.getUser() : null;
        if (!u) return;
        const rw = loadParentRewards().find((r) => r.id === btn.dataset.redeemRw);
        if (!rw) return;
        if ((u.coins || 0) < rw.cost) {
          alert(`金幣還差 ${rw.cost - (u.coins || 0)} 枚，再去闖關或玩小遊戲賺金幣吧！`);
          return;
        }
        if (!confirm(`確定要花費 🪙 ${rw.cost} 金幣，兌換「${rw.icon} ${rw.title}」專屬兌換券嗎？`)) return;

        window.SoundFX && window.SoundFX.playVictory && window.SoundFX.playVictory();
        window.SoundFX && window.SoundFX.launchConfetti && window.SoundFX.launchConfetti(window.innerWidth / 2, window.innerHeight / 3, 55);

        u.coins -= rw.cost;
        const vouchers = ensureUserVouchers(u);
        const serial = `MAI-${todayStr().replace(/-/g, "").slice(2)}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const ticket = {
          serial,
          icon: rw.icon || "🎁",
          title: rw.title,
          cost: rw.cost,
          date: todayStr(),
          ownerName: u.name || "冒險者",
          used: false,
          usedDate: ""
        };
        vouchers.unshift(ticket);
        if (vouchers.length > 40) vouchers.length = 40;
        api.saveStore && api.saveStore();
        api.refreshHome && api.refreshHome();
        renderParentRewardsPanel();
        openVoucherTicketModal(ticket);
      });
    });

    grid.querySelectorAll("[data-del-rw]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const list = loadParentRewards().filter((r) => r.id !== btn.dataset.delRw);
        if (!list.length) {
          alert("至少需保留 1 項獎勵喔！（或可按「恢復預設 4 項」）");
          return;
        }
        saveParentRewards(list);
        renderParentRewardsPanel();
      });
    });

    if (vouchersWrap) {
      const vouchers = ensureUserVouchers(user);
      if (!vouchers.length) {
        vouchersWrap.innerHTML = `<p class="vouchers-empty">目前還沒有兌換過獎勵券喔！存夠金幣就可以換一張拿給爸媽蓋章核銷 🎟️</p>`;
      } else {
        vouchersWrap.innerHTML = vouchers.map((v, idx) => `
          <div class="voucher-history-row ${v.used ? "is-used" : ""}">
            <div class="vh-left">
              <span class="vh-icon">${esc(v.icon)}</span>
              <div>
                <strong>${esc(v.title)}</strong>
                <div class="vh-meta">券號：${esc(v.serial)} ｜ 兌換日：${esc(v.date)} ｜ 花費 🪙 ${v.cost}</div>
              </div>
            </div>
            <div class="vh-right">
              <button type="button" class="btn btn-ghost btn-sm" data-view-voucher="${idx}">🎟️ 查看票券</button>
              ${v.used
                ? `<span class="ver-tag" style="background:#eef4ec;color:#3d7a4c;">✅ 已核銷（${esc(v.usedDate)}）</span>`
                : `<button type="button" class="btn btn-forest btn-sm" data-use-voucher="${idx}">✅ 家長核銷使用</button>`}
            </div>
          </div>
        `).join("");

        vouchersWrap.querySelectorAll("[data-view-voucher]").forEach((b) => {
          b.addEventListener("click", () => {
            window.SoundFX && window.SoundFX.playClick();
            const v = vouchers[Number(b.dataset.viewVoucher)];
            if (v) openVoucherTicketModal(v);
          });
        });

        vouchersWrap.querySelectorAll("[data-use-voucher]").forEach((b) => {
          b.addEventListener("click", () => {
            window.SoundFX && window.SoundFX.playClick();
            const v = vouchers[Number(b.dataset.useVoucher)];
            if (!v || v.used) return;
            requireParentPin(`核銷「${v.icon} ${v.title}」兌換券`, () => {
              v.used = true;
              v.usedDate = todayStr();
              api.saveStore && api.saveStore();
              renderParentRewardsPanel();
            });
          });
        });
      }
    }
  }

  function openVoucherTicketModal(ticket) {
    activeTicketData = ticket;
    const modal = document.getElementById("voucher-ticket-modal");
    const box = document.getElementById("voucher-ticket-preview");
    if (!modal || !box) return;

    box.innerHTML = `
      <div class="golden-voucher-card ${ticket.used ? "is-used" : ""}">
        <div class="gv-ribbon">✦ 數學遊戲冒險島・專屬生活獎勵兌換券 ✦</div>
        <div class="gv-icon">${esc(ticket.icon)}</div>
        <h3 class="gv-title">${esc(ticket.title)}</h3>
        <div class="gv-owner">持券小冒險者：<strong>${esc(ticket.ownerName)}</strong></div>
        <div class="gv-meta-row">
          <span>📅 兌換日期：${esc(ticket.date)}</span>
          <span>🪙 使用金幣：${ticket.cost}</span>
          <span>🔖 券號：${esc(ticket.serial)}</span>
        </div>
        ${ticket.used
          ? `<div class="gv-stamp-used">已核銷使用<br/><small>${esc(ticket.usedDate)}</small></div>`
          : `<div class="gv-hint">💡 請出示此畫面給爸爸媽媽看，即可兌現這份真實小獎勵喔！</div>`}
      </div>
    `;
    modal.classList.remove("hidden");
  }

  function downloadVoucherPng() {
    if (!activeTicketData) return;
    const t = activeTicketData;
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 460;
    const ctx = c.getContext("2d");

    // 暖奶油金底色（零藍色）
    const grad = ctx.createLinearGradient(0, 0, 900, 460);
    grad.addColorStop(0, "#fffdf4");
    grad.addColorStop(1, "#ffefc8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 460);

    // 外框金邊
    ctx.strokeStyle = "#e09b2d";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 860, 420);
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = "#c97d18";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 828, 388);
    ctx.setLineDash([]);

    // 頂部緞帶
    ctx.fillStyle = "#e68e2e";
    ctx.fillRect(150, 56, 600, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Noto Sans TC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ 數學遊戲冒險島・家長真實獎勵兌換券 ✦", 450, 86);

    // 圖示與標題
    ctx.font = "64px sans-serif";
    ctx.fillText(t.icon || "🎁", 450, 178);

    ctx.fillStyle = "#4a3320";
    ctx.font = "900 38px 'Noto Sans TC', sans-serif";
    ctx.fillText(t.title, 450, 240);

    ctx.fillStyle = "#7a5838";
    ctx.font = "bold 24px 'Noto Sans TC', sans-serif";
    ctx.fillText(`持券小冒險者：${t.ownerName}`, 450, 294);

    ctx.fillStyle = "#8c6d4e";
    ctx.font = "20px 'Noto Sans TC', sans-serif";
    ctx.fillText(`兌換日期：${t.date}   ｜   花費金幣：${t.cost}   ｜   券號：${t.serial}`, 450, 344);

    ctx.fillStyle = t.used ? "#388d5c" : "#c76c14";
    ctx.font = "bold 20px 'Noto Sans TC', sans-serif";
    ctx.fillText(t.used ? `✅ 已於 ${t.usedDate} 核銷完成` : "🌟 憑本券即可向爸爸媽媽兌換這份獎勵喔！", 450, 392);

    const a = document.createElement("a");
    a.download = `數學遊戲冒險島_獎勵兌換券_${t.serial}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }

  function initParentRewardsControls() {
    const btnToggleManage = document.getElementById("btn-toggle-manage-rewards");
    const btnChangePin = document.getElementById("btn-change-parent-pin");
    const addForm = document.getElementById("parent-reward-add-form");
    const btnReset = document.getElementById("btn-reset-default-rewards");
    const modal = document.getElementById("voucher-ticket-modal");
    const btnCloseModal = document.getElementById("btn-close-voucher-modal");
    const btnDlPng = document.getElementById("btn-download-voucher-png");

    initParentPinModal();

    if (btnToggleManage) {
      btnToggleManage.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        if (rewardManageOpen) {
          rewardManageOpen = false;
          btnToggleManage.textContent = "👨‍👩‍👧 家長自訂獎勵項目";
          renderParentRewardsPanel();
          return;
        }
        requireParentPin("開啟家長自訂獎勵管理", () => {
          rewardManageOpen = true;
          btnToggleManage.textContent = "✅ 完成家長管理";
          renderParentRewardsPanel();
        });
      });
    }

    if (btnChangePin) {
      btnChangePin.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        requireParentPin("重設家長 4 位數密碼", () => {
          alert("✅ 家長 4 位數密碼已更新完成！");
        }, true);
      });
    }

    if (addForm) {
      addForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        window.SoundFX && window.SoundFX.playClick();
        const iconEl = document.getElementById("rw-new-icon");
        const titleEl = document.getElementById("rw-new-title");
        const costEl = document.getElementById("rw-new-cost");
        const title = (titleEl && titleEl.value || "").trim();
        const cost = Math.max(50, Math.min(99999, Number(costEl && costEl.value) || 300));
        const icon = (iconEl && iconEl.value) || "🎁";
        if (!title) return;
        const list = loadParentRewards();
        list.push({ id: `rw_${Date.now()}`, icon, title, cost });
        saveParentRewards(list);
        if (titleEl) titleEl.value = "";
        renderParentRewardsPanel();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        if (!confirm("確定要恢復成預設的 4 項生活獎勵嗎？")) return;
        saveParentRewards(DEFAULT_REWARDS.map((r) => Object.assign({}, r)));
        renderParentRewardsPanel();
      });
    }

    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        modal.classList.add("hidden");
      });
      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.classList.add("hidden");
      });
    }

    if (btnDlPng) {
      btnDlPng.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        downloadVoucherPng();
      });
    }
  }

  // ==================== 統一初始化 ====================
  window.MathPro = {
    init(hooks) {
      api = hooks || {};
      initScratchpadEnhancements();
      initCustomMockExamUI();
      initTransferBackupTools();
      initParentRewardsControls();
      renderParentRewardsPanel();
    },
    refreshAll() {
      renderParentRewardsPanel();
    },
    openScratchpad: openGlobalScratchpad,
    startProMockExam
  };
})();
