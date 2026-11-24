/**
 * 數學遊戲冒險島｜四大進階學習與教學互動模組 (plus-features.js)
 * 1. 👀 護眼小鬧鐘・電子寵物定時休息提醒（15/20/30 分鐘可調＋20 秒護眼倒數拿金幣）
 * 2. 🗓️ 「每日一題」頭腦體操・月曆蓋章打卡牆（全站同日同題＋雙倍獎勵＋月度里程碑）
 * 3. 🏫 老師／家長「一鍵派發指定作業連結」（免伺服器 URL 編碼＋QR 碼＋學生作答評分）
 * 4. ⚖️ 生活單位實作小實驗台（找錢機／公斤公克電子秤／公升毫升量杯倒水）
 */
(function () {
  let api = null;

  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensurePlusState(user) {
    if (!user) return null;
    if (!Array.isArray(user.dailyQStamps)) user.dailyQStamps = [];
    if (!user.dailyQMilestones || typeof user.dailyQMilestones !== "object") user.dailyQMilestones = {};
    if (typeof user.eyeCareRestCount !== "number") user.eyeCareRestCount = 0;
    return user;
  }

  function getAllQuestionsPool() {
    const pool = [];
    const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
    if (bank && Array.isArray(bank.units)) {
      bank.units.forEach((u) => {
        (u.questions || []).forEach((q) => {
          pool.push(Object.assign({}, q, { _unitTitle: `第 ${String(u.order).padStart(2, "0")} 單元：${u.title}` }));
        });
      });
    }
    const orig = window.ORIGINAL_MATH_CHALLENGES;
    if (Array.isArray(orig)) {
      orig.forEach((t) => {
        (t.questions || []).forEach((q) => {
          pool.push(Object.assign({}, q, { _unitTitle: `原創挑戰：${t.title}` }));
        });
      });
    }
    return pool;
  }

  // ==================== 1. 👀 護眼小鬧鐘・電子寵物定時休息提醒 ====================
  function initEyeCareAlarm() {
    const sel = document.getElementById("eyecare-interval-select");
    const badge = document.getElementById("eyecare-timer-badge");
    const modal = document.getElementById("eye-care-modal");
    const petWrap = document.getElementById("eyecare-pet-wrap");
    const petMsg = document.getElementById("eyecare-pet-msg");
    const cdEl = document.getElementById("eyecare-rest-countdown");
    const btnStartRest = document.getElementById("btn-eyecare-start-rest");
    const btnDismiss = document.getElementById("btn-eyecare-dismiss");
    if (!sel || !badge || !modal) return;

    let intervalMin = Number(localStorage.getItem("mai_eyecare_min") ?? 20);
    if (![0, 15, 20, 30].includes(intervalMin)) intervalMin = 20;
    sel.value = String(intervalMin);

    let remainSec = intervalMin * 60;
    let restTimer = null;

    function formatMMSS(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    function updateBadge() {
      if (intervalMin <= 0) {
        badge.textContent = "已關";
      } else {
        badge.textContent = formatMMSS(Math.max(0, remainSec));
      }
    }

    function showEyeCareModal() {
      const user = api ? ensurePlusState(api.getUser()) : null;
      const petNames = {
        shiba: "🐶 柴犬麻糬",
        fox: "🦊 焦糖小狐狸",
        dino: "🦖 抹茶小恐龍",
        bunny: "🐰 草莓垂耳兔",
        panda: "🐼 奶茶小熊貓",
        unicorn: "🦄 夢幻獨角獸",
        cat: "🐱 奶油小橘貓",
        penguin: "🐧 企鵝小圓滾",
      };
      const sp = (user && user.pet && user.pet.species) || "shiba";
      const pName = petNames[sp] || "🐶 島嶼小夥伴";
      if (petWrap) {
        const avHtml = window.AvatarArt && user ? window.AvatarArt.render(user.avatar || "shiba", "avatar-lg") : "🐾";
        petWrap.innerHTML = `<div class="eyecare-pet-badge">${avHtml}<span>${pName} 貼心提醒</span></div>`;
      }
      const line = `已經專心學習 ${intervalMin} 分鐘囉！站起來喝口水、看看遠方綠色植物，讓眼睛休息一下吧！`;
      if (petMsg) petMsg.textContent = line;
      if (cdEl) {
        cdEl.classList.add("hidden");
        cdEl.textContent = "20";
      }
      if (btnStartRest) {
        btnStartRest.disabled = false;
        btnStartRest.textContent = "🌿 開始 20 秒護眼休息（+10金幣）";
      }
      modal.classList.remove("hidden");
      window.SoundFX && window.SoundFX.playFanfare(2);
      if (window.SpeechFX && window.SoundFX && window.SoundFX.enabled) {
        window.SpeechFX.speak(line);
      }
    }

    sel.addEventListener("change", () => {
      intervalMin = Number(sel.value) || 0;
      localStorage.setItem("mai_eyecare_min", String(intervalMin));
      remainSec = intervalMin * 60;
      updateBadge();
      window.SoundFX && window.SoundFX.playClick();
    });

    if (btnStartRest) {
      btnStartRest.addEventListener("click", () => {
        if (restTimer) return;
        let sec = 20;
        btnStartRest.disabled = true;
        btnStartRest.textContent = "👀 閉眼或看遠方休息中…";
        if (cdEl) {
          cdEl.textContent = String(sec);
          cdEl.classList.remove("hidden");
        }
        window.SoundFX && window.SoundFX.playClick();
        restTimer = setInterval(() => {
          sec -= 1;
          if (cdEl) cdEl.textContent = String(Math.max(0, sec));
          if (sec <= 0) {
            clearInterval(restTimer);
            restTimer = null;
            const u = api ? ensurePlusState(api.getUser()) : null;
            if (u) {
              u.coins = (u.coins || 0) + 10;
              u.eyeCareRestCount = (u.eyeCareRestCount || 0) + 1;
              api.saveStore();
              api.refreshHome();
            }
            window.SoundFX && window.SoundFX.playFanfare(3);
            window.VisualFX && window.VisualFX.burstConfetti();
            if (petMsg) {
              petMsg.textContent = "🎉 太棒了！護眼休息 20 秒完成，獲得 🪙 +10 護眼好寶寶金幣！";
            }
            btnStartRest.textContent = "✅ 已完成休息！繼續冒險";
            btnStartRest.disabled = false;
            setTimeout(() => {
              modal.classList.add("hidden");
              remainSec = intervalMin * 60;
              updateBadge();
            }, 1800);
          }
        }, 1000);
      });
    }

    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => {
        if (restTimer) {
          clearInterval(restTimer);
          restTimer = null;
        }
        modal.classList.add("hidden");
        remainSec = intervalMin * 60;
        updateBadge();
      });
    }

    updateBadge();
    setInterval(() => {
      if (intervalMin <= 0) return;
      const appShell = document.getElementById("app-shell");
      if (!appShell || appShell.classList.contains("hidden")) return;
      if (!modal.classList.contains("hidden")) return;
      remainSec -= 1;
      if (remainSec <= 0) {
        remainSec = 0;
        updateBadge();
        showEyeCareModal();
      } else {
        updateBadge();
      }
    }, 1000);
  }

  // ==================== 2. 🗓️ 「每日一題」月曆蓋章打卡牆 ====================
  function hashDateSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function renderDailyQuestionWall() {
    const qBox = document.getElementById("dq-question-box");
    const calTitle = document.getElementById("dq-cal-month-title");
    const calCount = document.getElementById("dq-cal-count-badge");
    const calDays = document.getElementById("dq-cal-days");
    const msBox = document.getElementById("dq-milestones");
    if (!qBox || !calDays || !api) return;

    const user = ensurePlusState(api.getUser());
    if (!user) return;

    const today = todayStr();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const ymPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const stampedSet = new Set(user.dailyQStamps || []);
    const monthStamped = (user.dailyQStamps || []).filter((d) => d.startsWith(ymPrefix)).length;

    if (calTitle) calTitle.textContent = `${year} 年 ${month + 1} 月打卡月曆`;
    if (calCount) calCount.textContent = `本月已蓋章 ${monthStamped} 天`;

    // 月度里程碑顯示
    if (msBox) {
      const goals = [
        { days: 7, bonus: 80, label: "7天勤學章" },
        { days: 15, bonus: 150, label: "15天學霸章" },
        { days: 25, bonus: 300, label: "25天全勤王" },
      ];
      msBox.innerHTML = goals
        .map((g) => {
          const hit = monthStamped >= g.days;
          return `<span class="dq-ms-pill ${hit ? "done" : ""}">${hit ? "✅" : "🎯"} ${g.label} (+${g.bonus}🪙)</span>`;
        })
        .join("");
    }

    // 繪製月曆格子
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let cells = "";
    for (let i = 0; i < firstWeekday; i++) {
      cells += `<div class="dq-day empty"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${ymPrefix}-${String(d).padStart(2, "0")}`;
      const isToday = dStr === today;
      const isStamped = stampedSet.has(dStr);
      cells += `
        <div class="dq-day ${isToday ? "is-today" : ""} ${isStamped ? "is-stamped" : ""}" title="${dStr}${isStamped ? "（已完成每日一題蓋章！）" : ""}">
          <span class="dq-day-num">${d}</span>
          ${isStamped ? `<span class="dq-stamp-mark">🐾</span>` : ""}
        </div>`;
    }
    calDays.innerHTML = cells;

    // 取得今日限定題目（全站同一天抽到同一題）
    const pool = getAllQuestionsPool();
    if (!pool.length) return;
    const q = pool[hashDateSeed(today) % pool.length];
    const doneToday = stampedSet.has(today);

    if (doneToday) {
      qBox.innerHTML = `
        <div class="dq-done-banner">🎉 太棒了！你已完成今日（${today}）每日一題蓋章打卡，領取雙倍金幣與餅乾囉！</div>
        <div class="dq-meta"><span>📅 今日限定題</span><span>${esc(q._unitTitle || "")}</span></div>
        <div class="dq-q-text">${esc(q.question)}</div>
        <div class="dq-exp-box">
          <strong>✅ 標準答案：${esc(q.answer)}</strong>
          <p style="margin:6px 0 0;">💡 解析：${esc(q.explanation || "")}</p>
        </div>
      `;
      return;
    }

    const answerArea =
      q.type === "choice" && Array.isArray(q.options)
        ? `<div class="dq-options">
            ${q.options
              .map(
                (opt, i) =>
                  `<button type="button" class="btn btn-ghost dq-opt-btn" data-dq-opt="${esc(opt)}">(${String.fromCharCode(65 + i)}) ${esc(opt)}</button>`
              )
              .join("")}
          </div>`
        : `<form id="dq-input-form" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <input type="text" id="dq-ans-input" class="luxury-input" placeholder="請輸入你的答案…" style="flex:1;min-width:160px;" required />
            <button type="submit" class="btn btn-gold">✅ 送出蓋章</button>
          </form>`;

    qBox.innerHTML = `
      <div class="dq-meta">
        <span>📅 ${today} 今日限定題</span>
        <span>${esc(q._unitTitle || "")}</span>
      </div>
      <div class="dq-q-text">${esc(q.question)}</div>
      ${answerArea}
      <div id="dq-feedback" class="dq-feedback hidden"></div>
    `;

    function handleAnswer(val) {
      const norm = (s) => String(s ?? "").trim().replace(/\s+/g, "").toLowerCase();
      const fb = document.getElementById("dq-feedback");
      if (norm(val) === norm(q.answer)) {
        if (!user.dailyQStamps.includes(today)) {
          user.dailyQStamps.push(today);
          user.coins = (user.coins || 0) + 40;
          if (user.pet) user.pet.cookies = (user.pet.cookies || 0) + 2;
          const newMonthCnt = user.dailyQStamps.filter((d) => d.startsWith(ymPrefix)).length;
          [
            { days: 7, bonus: 80 },
            { days: 15, bonus: 150 },
            { days: 25, bonus: 300 },
          ].forEach((m) => {
            const mk = `${ymPrefix}_${m.days}`;
            if (newMonthCnt >= m.days && !user.dailyQMilestones[mk]) {
              user.dailyQMilestones[mk] = true;
              user.coins += m.bonus;
            }
          });
          api.saveStore();
          api.refreshHome();
          if (window.MathSuper) window.MathSuper.refreshAll();
        }
        window.SoundFX && window.SoundFX.playFanfare(3);
        window.VisualFX && window.VisualFX.celebrationRain();
        renderDailyQuestionWall();
      } else {
        window.SoundFX && window.SoundFX.playWrong();
        if (fb) {
          fb.textContent = "💡 差一點點喔！再仔細算一次，答對就能在月曆蓋上 🐾 小印章！";
          fb.classList.remove("hidden");
        }
      }
    }

    qBox.querySelectorAll(".dq-opt-btn").forEach((b) => {
      b.addEventListener("click", () => handleAnswer(b.dataset.dqOpt));
    });
    const inpForm = document.getElementById("dq-input-form");
    if (inpForm) {
      inpForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const inp = document.getElementById("dq-ans-input");
        if (inp) handleAnswer(inp.value);
      });
    }
  }

  // ==================== 3. 🏫 老師／家長「一鍵派發指定作業連結」 ====================
  function encodeHwConfig(cfg) {
    const json = JSON.stringify(cfg);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodeHwConfig(token) {
    try {
      let b64 = String(token || "").replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const json = decodeURIComponent(escape(atob(b64)));
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.u) || !parsed.u.length) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function seededShuffle(arr, seed) {
    const a = arr.slice();
    let s = seed || 12345;
    for (let i = a.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const j = s % (i + 1);
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function openHomeworkRunner(cfg) {
    const modal = document.getElementById("homework-runner-modal");
    const titleEl = document.getElementById("hw-runner-title");
    const subEl = document.getElementById("hw-runner-sub");
    const bodyEl = document.getElementById("hw-runner-body");
    if (!modal || !bodyEl) return;

    const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
    if (!bank || !Array.isArray(bank.units)) return;

    const selectedUnits = bank.units.filter((u) => cfg.u.includes(u.order));
    let pool = [];
    selectedUnits.forEach((u) => {
      (u.questions || []).forEach((q) => {
        pool.push(Object.assign({}, q, { _unitTitle: `第 ${String(u.order).padStart(2, "0")} 單元：${u.title}` }));
      });
    });
    if (!pool.length) return;

    const count = Math.min(Math.max(1, Number(cfg.n) || 10), pool.length);
    const questions = seededShuffle(pool, Number(cfg.s) || 2026).slice(0, count);
    const hwTitle = cfg.t || "數學遊戲冒險島・指定數學作業";

    if (titleEl) titleEl.textContent = `🏫 ${hwTitle}`;
    if (subEl) {
      subEl.textContent = `涵蓋 ${selectedUnits.map((u) => `第${u.order}單元`).join("、")} ｜ 共 ${questions.length} 題（每答對 1 題贈 🪙 +10 金幣）`;
    }

    let idx = 0;
    const answers = new Array(questions.length).fill("");

    function renderQ() {
      const q = questions[idx];
      const pct = Math.round(((idx + 1) / questions.length) * 100);
      const optsHtml =
        q.type === "choice" && Array.isArray(q.options)
          ? `<div class="dq-options" style="margin-top:12px;">
              ${q.options
                .map((opt, i) => {
                  const chosen = answers[idx] === opt;
                  return `<button type="button" class="btn ${chosen ? "btn-gold" : "btn-ghost"} hw-opt-btn" data-hw-opt="${esc(opt)}">(${String.fromCharCode(65 + i)}) ${esc(opt)}</button>`;
                })
                .join("")}
            </div>`
          : `<div style="margin-top:12px;">
              <input type="text" id="hw-ans-input" class="luxury-input" value="${esc(answers[idx])}" placeholder="請輸入你的答案…" style="width:100%;" />
            </div>`;

      bodyEl.innerHTML = `
        <div class="pet-xp-wrap" style="margin:8px 0 12px;"><div class="pet-xp-fill" style="width:${pct}%"></div></div>
        <div class="dq-meta">
          <span>第 ${idx + 1} / ${questions.length} 題</span>
          <span>${esc(q._unitTitle)}</span>
        </div>
        <div class="dq-q-text" style="margin:10px 0;">${esc(q.question)}</div>
        ${optsHtml}
        <div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button type="button" class="btn btn-ghost" id="btn-hw-prev" ${idx === 0 ? "disabled" : ""}>← 上一題</button>
          ${
            idx < questions.length - 1
              ? `<button type="button" class="btn btn-gold" id="btn-hw-next">下一題 →</button>`
              : `<button type="button" class="btn btn-forest btn-lg" id="btn-hw-submit">📨 交卷批改評分！</button>`
          }
        </div>
      `;

      bodyEl.querySelectorAll(".hw-opt-btn").forEach((b) => {
        b.addEventListener("click", () => {
          answers[idx] = b.dataset.hwOpt;
          window.SoundFX && window.SoundFX.playClick();
          renderQ();
        });
      });

      const inp = document.getElementById("hw-ans-input");
      if (inp) {
        inp.addEventListener("input", () => {
          answers[idx] = inp.value;
        });
      }

      const prevBtn = document.getElementById("btn-hw-prev");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (idx > 0) {
            idx -= 1;
            renderQ();
          }
        });
      }
      const nextBtn = document.getElementById("btn-hw-next");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          idx += 1;
          renderQ();
        });
      }
      const subBtn = document.getElementById("btn-hw-submit");
      if (subBtn) {
        subBtn.addEventListener("click", () => {
          const norm = (s) => String(s ?? "").trim().replace(/\s+/g, "").toLowerCase();
          let correctCnt = 0;
          const reviewHtml = questions
            .map((qq, i) => {
              const ok = norm(answers[i]) === norm(qq.answer);
              if (ok) correctCnt += 1;
              return `
                <div class="exam-review-row ${ok ? "ok" : "bad"}" style="flex-direction:column;align-items:flex-start;gap:4px;">
                  <strong>${ok ? "✅" : "❌"} 第 ${i + 1} 題：${esc(qq.question)}</strong>
                  <div style="font-size:0.84rem;">你的答案：<b>${esc(answers[i] || "未作答")}</b> ｜ 標準答案：<b style="color:#2b7a48;">${esc(qq.answer)}</b></div>
                  <div style="font-size:0.82rem;color:var(--muted);">💡 ${esc(qq.explanation || "")}</div>
                </div>`;
            })
            .join("");

          const score = Math.round((correctCnt / questions.length) * 100);
          const rewardCoins = correctCnt * 10;
          const u = api ? api.getUser() : null;
          if (u && rewardCoins > 0) {
            u.coins = (u.coins || 0) + rewardCoins;
            api.saveStore();
            api.refreshHome();
          }
          window.SoundFX && window.SoundFX.playFanfare(3);
          if (score >= 80 && window.VisualFX) window.VisualFX.celebrationRain();

          bodyEl.innerHTML = `
            <div style="text-align:center;background:#fff8e6;border:2px solid #e4b660;border-radius:18px;padding:16px;margin-bottom:14px;">
              <div style="font-size:2rem;font-weight:900;color:#b85d19;">🏆 得分：${score} 分</div>
              <p style="margin:6px 0 0;font-weight:800;color:var(--ink);">
                共答對 <strong>${correctCnt} / ${questions.length} 題</strong>${rewardCoins > 0 ? `・獲得獎勵 <strong>🪙 +${rewardCoins} 金幣</strong>！` : ""}
              </p>
            </div>
            <div class="exam-review-scroll" style="max-height:300px;">${reviewHtml}</div>
          `;
        });
      }
    }

    renderQ();
    modal.classList.remove("hidden");
  }

  function initHomeworkBuilderAndRunner() {
    const grid = document.getElementById("hw-unit-checkboxes");
    const btnGen = document.getElementById("btn-hw-generate");
    const btnAll = document.getElementById("btn-hw-select-all");
    const btnNone = document.getElementById("btn-hw-select-none");
    const resBox = document.getElementById("hw-result-box");
    const linkOut = document.getElementById("hw-link-output");
    const qrImg = document.getElementById("hw-qr-img");
    const btnCopy = document.getElementById("btn-hw-copy");
    const btnPreview = document.getElementById("btn-hw-preview");
    const btnCloseRunner = document.getElementById("btn-hw-runner-close");
    const runnerModal = document.getElementById("homework-runner-modal");

    const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
    if (grid && bank && Array.isArray(bank.units) && !grid.dataset.populated) {
      grid.innerHTML = bank.units
        .map(
          (u) => `
          <label class="hw-unit-chip">
            <input type="checkbox" value="${u.order}" ${u.order <= 2 ? "checked" : ""} />
            <span>第 ${String(u.order).padStart(2, "0")} 單元：${esc(u.title)}</span>
          </label>`
        )
        .join("");
      grid.dataset.populated = "1";
    }

    if (btnAll && grid) {
      btnAll.addEventListener("click", () => {
        grid.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = true));
      });
    }
    if (btnNone && grid) {
      btnNone.addEventListener("click", () => {
        grid.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
      });
    }

    let lastGeneratedCfg = null;
    if (btnGen && grid) {
      btnGen.addEventListener("click", () => {
        const picked = Array.from(grid.querySelectorAll('input[type="checkbox"]:checked')).map((c) => Number(c.value));
        if (!picked.length) {
          alert("請至少勾選 1 個單元喔！");
          return;
        }
        const titleVal = (document.getElementById("hw-title-input")?.value || "").trim() || "三年級數學指定作業";
        const countVal = Number(document.getElementById("hw-count-select")?.value || 10);
        const cfg = { t: titleVal, u: picked, n: countVal, s: Math.floor(Date.now() / 1000) % 99999 };
        lastGeneratedCfg = cfg;
        const token = encodeHwConfig(cfg);
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?hw=${token}`;

        if (linkOut) linkOut.value = shareUrl;
        if (qrImg) {
          qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;
        }
        if (resBox) resBox.classList.remove("hidden");
        window.SoundFX && window.SoundFX.playCorrect(2);
      });
    }

    if (btnCopy && linkOut) {
      btnCopy.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const url = linkOut.value;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(() => {
            btnCopy.textContent = "✅ 已複製！快貼到班級群組吧！";
            setTimeout(() => (btnCopy.textContent = "📋 一鍵複製作業連結"), 2200);
          });
        } else {
          linkOut.select();
          document.execCommand("copy");
        }
      });
    }

    if (btnPreview) {
      btnPreview.addEventListener("click", () => {
        if (lastGeneratedCfg) openHomeworkRunner(lastGeneratedCfg);
      });
    }

    if (btnCloseRunner && runnerModal) {
      btnCloseRunner.addEventListener("click", () => runnerModal.classList.add("hidden"));
    }

    // 偵測網址參數 ?hw=... 自動開啟老師指定作業！
    try {
      const params = new URLSearchParams(window.location.search);
      const hwToken = params.get("hw");
      if (hwToken) {
        const cfg = decodeHwConfig(hwToken);
        if (cfg) {
          setTimeout(() => openHomeworkRunner(cfg), 650);
        }
      }
    } catch (_) {}
  }

  // ==================== 4. ⚖️ 生活單位實作小實驗台（找錢機／電子秤／量杯倒水） ====================
  function initLifeUnitsLab() {
    const tabsWrap = document.getElementById("life-lab-tabs");
    const stage = document.getElementById("life-lab-stage");
    if (!tabsWrap || !stage) return;

    let currentTab = "change";

    function awardLabCoins(msgEl, text) {
      const u = api ? api.getUser() : null;
      if (u) {
        u.coins = (u.coins || 0) + 15;
        api.saveStore();
        api.refreshHome();
      }
      window.SoundFX && window.SoundFX.playFanfare(3);
      window.VisualFX && window.VisualFX.burstConfetti();
      if (msgEl) {
        msgEl.className = "lab-msg ok";
        msgEl.textContent = `🎉 ${text}（獎勵 🪙 +15 金幣！）`;
      }
    }

    // Lab A: 💵 商店找零機
    function renderChangeLab() {
      const items = [
        { name: "🍓 草莓鮮奶油蛋糕", pay: 500, price: 375 },
        { name: "🧁 馬卡龍綜合禮盒", pay: 500, price: 268 },
        { name: "🧸 絨毛小柴犬玩偶", pay: 1000, price: 645 },
        { name: "📚 數學冒險繪本組", pay: 500, price: 329 },
        { name: "🍱 豪華野餐便當盒", pay: 1000, price: 785 },
        { name: "🎨 24色水彩畫具組", pay: 500, price: 186 },
        { name: "🎒 冒險島雙肩書包", pay: 1000, price: 832 },
      ];
      const task = items[Math.floor(Math.random() * items.length)];
      const targetChange = task.pay - task.price;
      let tray = [];
      let solved = false;

      const denoms = [
        { val: 500, label: "500元鈔", cls: "bill-500" },
        { val: 100, label: "100元鈔", cls: "bill-100" },
        { val: 50, label: "50元硬幣", cls: "coin-50" },
        { val: 10, label: "10元硬幣", cls: "coin-10" },
        { val: 5, label: "5元硬幣", cls: "coin-5" },
        { val: 1, label: "1元硬幣", cls: "coin-1" },
      ];

      function draw() {
        const sum = tray.reduce((a, b) => a + b, 0);
        stage.innerHTML = `
          <div class="lab-task-banner">
            🛍️ 客人買了 <strong>${task.name}（${task.price} 元）</strong>，付給你 <strong>${task.pay} 元</strong>，請點選下方鈔票與硬幣<strong>找零</strong>！
          </div>
          <div class="lab-money-palette">
            ${denoms.map((d) => `<button type="button" class="lab-money-btn ${d.cls}" data-add-money="${d.val}">+${d.label}</button>`).join("")}
          </div>
          <div class="lab-tray-box">
            <div class="lab-tray-head">
              <span>💰 找零托盤目前金額：<strong>${sum} 元</strong></span>
              <div style="display:flex;gap:6px;">
                <button type="button" class="btn btn-ghost btn-sm" id="btn-lab-undo">↩ 退回一張</button>
                <button type="button" class="btn btn-ghost btn-sm" id="btn-lab-clear">🗑️ 清空</button>
              </div>
            </div>
            <div class="lab-tray-items">
              ${tray.length ? tray.map((v) => `<span class="lab-chip">$${v}</span>`).join("") : `<span style="color:var(--muted);font-size:0.86rem;">請點選上方鈔票或硬幣放進托盤…</span>`}
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <button type="button" class="btn btn-forest btn-lg" id="btn-lab-check">✅ 確認找零！</button>
            <button type="button" class="btn btn-gold" id="btn-lab-next">🔄 換下一位客人</button>
          </div>
          <div id="lab-msg" class="lab-msg hidden"></div>
        `;

        stage.querySelectorAll("[data-add-money]").forEach((b) => {
          b.addEventListener("click", () => {
            if (solved) return;
            tray.push(Number(b.dataset.addMoney));
            window.SoundFX && window.SoundFX.playClick();
            draw();
          });
        });
        document.getElementById("btn-lab-undo")?.addEventListener("click", () => {
          if (solved || !tray.length) return;
          tray.pop();
          draw();
        });
        document.getElementById("btn-lab-clear")?.addEventListener("click", () => {
          if (solved) return;
          tray = [];
          draw();
        });
        document.getElementById("btn-lab-next")?.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          renderChangeLab();
        });
        document.getElementById("btn-lab-check")?.addEventListener("click", () => {
          const msgEl = document.getElementById("lab-msg");
          if (sum === targetChange) {
            if (!solved) {
              solved = true;
              awardLabCoins(msgEl, `答對了！${task.pay} − ${task.price} = ${targetChange} 元，找零分毫不差！`);
            }
          } else {
            window.SoundFX && window.SoundFX.playWrong();
            if (msgEl) {
              msgEl.className = "lab-msg bad";
              msgEl.textContent = sum > targetChange ? `😅 多找了一點喔（目前 ${sum} 元），再算算 ${task.pay} − ${task.price}！` : `😅 還差一點喔（目前 ${sum} 元），再算算 ${task.pay} − ${task.price}！`;
            }
          }
        });
      }
      draw();
    }

    // Lab B: ⚖️ 公斤公克電子秤
    function renderScaleLab() {
      const targets = [1250, 1350, 1600, 1850, 2150, 2400, 1460, 2720];
      const targetG = targets[Math.floor(Math.random() * targets.length)];
      const tKg = Math.floor(targetG / 1000);
      const tRem = targetG % 1000;
      let weights = [];
      let solved = false;

      const palette = [
        { g: 1000, label: "🍉 1 公斤 (1000g)" },
        { g: 500, label: "🍍 500 公克" },
        { g: 200, label: "🍎 200 公克" },
        { g: 100, label: "🍊 100 公克" },
        { g: 50, label: "🥝 50 公克" },
        { g: 10, label: "🍓 10 公克" },
      ];

      function draw() {
        const sumG = weights.reduce((a, b) => a + b, 0);
        const curKg = Math.floor(sumG / 1000);
        const curRem = sumG % 1000;
        const angle = Math.min(340, (sumG / 3000) * 360);

        stage.innerHTML = `
          <div class="lab-task-banner">
            ⚖️ 請放上水果與砝碼，秤出剛好 <strong>${tKg} 公斤 ${tRem} 公克（共 ${targetG} 公克）</strong>！
          </div>
          <div class="lab-visual-split">
            <div class="lab-svg-box">
              <svg viewBox="0 0 220 200" width="210" height="190" aria-label="電子指針秤">
                <rect x="45" y="18" width="130" height="14" rx="7" fill="#e5a94c" stroke="#7c4d12" stroke-width="2.5"/>
                <rect x="102" y="32" width="16" height="24" fill="#c28c42" stroke="#7c4d12" stroke-width="2"/>
                <circle cx="110" cy="118" r="64" fill="#fffdf7" stroke="#d9942a" stroke-width="6"/>
                <circle cx="110" cy="118" r="54" fill="#fff8e6" stroke="#ead3a7" stroke-width="2"/>
                <text x="110" y="78" text-anchor="middle" font-size="11" font-weight="900" fill="#7c5634">0 / 3kg</text>
                <text x="154" y="122" text-anchor="middle" font-size="11" font-weight="900" fill="#7c5634">1kg</text>
                <text x="110" y="164" text-anchor="middle" font-size="11" font-weight="900" fill="#7c5634">1.5kg</text>
                <text x="66" y="122" text-anchor="middle" font-size="11" font-weight="900" fill="#7c5634">2kg</text>
                <g transform="rotate(${angle} 110 118)">
                  <line x1="110" y1="118" x2="110" y2="70" stroke="#e05a47" stroke-width="4" stroke-linecap="round"/>
                </g>
                <circle cx="110" cy="118" r="7" fill="#5a4031"/>
                <rect x="48" y="176" width="124" height="20" rx="8" fill="#5a4031"/>
                <text x="110" y="190" text-anchor="middle" font-size="12" font-weight="900" fill="#ffe17d">${sumG} g</text>
              </svg>
              <div class="lab-readout">目前重量：<strong>${curKg} 公斤 ${curRem} 公克</strong>（${sumG} g）</div>
            </div>
            <div style="flex:1;min-width:230px;">
              <div class="lab-money-palette">
                ${palette.map((p) => `<button type="button" class="btn btn-ghost btn-sm" data-add-g="${p.g}">+${p.label}</button>`).join("")}
              </div>
              <div class="lab-tray-box" style="margin-top:10px;">
                <div class="lab-tray-head">
                  <span>已放上的物品（${weights.length} 個）</span>
                  <button type="button" class="btn btn-ghost btn-sm" id="btn-scale-clear">🗑️ 全部拿下來</button>
                </div>
                <div class="lab-tray-items">
                  ${weights.length ? weights.map((g) => `<span class="lab-chip">${g >= 1000 ? "1kg" : g + "g"}</span>`).join("") : `<span style="color:var(--muted);font-size:0.84rem;">點選上方按鈕放上秤盤…</span>`}
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <button type="button" class="btn btn-forest btn-lg" id="btn-scale-check">✅ 確認重量！</button>
            <button type="button" class="btn btn-gold" id="btn-scale-next">🔄 換下一題秤重</button>
          </div>
          <div id="lab-msg" class="lab-msg hidden"></div>
        `;

        stage.querySelectorAll("[data-add-g]").forEach((b) => {
          b.addEventListener("click", () => {
            if (solved) return;
            weights.push(Number(b.dataset.addG));
            window.SoundFX && window.SoundFX.playClick();
            draw();
          });
        });
        document.getElementById("btn-scale-clear")?.addEventListener("click", () => {
          if (solved) return;
          weights = [];
          draw();
        });
        document.getElementById("btn-scale-next")?.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          renderScaleLab();
        });
        document.getElementById("btn-scale-check")?.addEventListener("click", () => {
          const msgEl = document.getElementById("lab-msg");
          if (sumG === targetG) {
            if (!solved) {
              solved = true;
              awardLabCoins(msgEl, `完全正確！${tKg} 公斤 ${tRem} 公克 ＝ ${targetG} 公克！`);
            }
          } else {
            window.SoundFX && window.SoundFX.playWrong();
            if (msgEl) {
              msgEl.className = "lab-msg bad";
              msgEl.textContent = sumG > targetG ? `😅 太重了一點（目前 ${sumG} g），目標是 ${targetG} g 喔！` : `😅 還不夠重（目前 ${sumG} g），目標是 ${targetG} g 喔！`;
            }
          }
        });
      }
      draw();
    }

    // Lab C: 🧪 公升毫升量杯倒水（溫暖蜂蜜檸檬汁配色，零藍色！）
    function renderBeakerLab() {
      const targets = [1200, 1350, 1450, 1650, 1750, 1850, 950, 1550];
      const targetMl = targets[Math.floor(Math.random() * targets.length)];
      const tL = Math.floor(targetMl / 1000);
      const tRem = targetMl % 1000;
      let pours = [];
      let solved = false;

      const jugs = [
        { ml: 1000, label: "🍯 倒 1 公升 (1000mL)" },
        { ml: 500, label: "🧃 倒 500 毫升" },
        { ml: 200, label: "🥤 倒 200 毫升" },
        { ml: 100, label: "🍵 倒 100 毫升" },
        { ml: 50, label: "🥄 倒 50 毫升" },
      ];

      function draw() {
        const sumMl = pours.reduce((a, b) => a + b, 0);
        const curL = Math.floor(sumMl / 1000);
        const curRem = sumMl % 1000;
        const fillRatio = Math.min(1, sumMl / 2000);
        const fillH = Math.round(fillRatio * 140);
        const fillY = 170 - fillH;

        stage.innerHTML = `
          <div class="lab-task-banner">
            🧪 請倒出剛好 <strong>${tL > 0 ? `${tL} 公升 ` : ""}${tRem} 毫升（共 ${targetMl} mL）</strong> 的蜂蜜檸檬汁！
          </div>
          <div class="lab-visual-split">
            <div class="lab-svg-box">
              <svg viewBox="0 0 180 200" width="170" height="190" aria-label="2公升刻度量杯">
                <rect x="42" y="26" width="96" height="146" rx="10" fill="#fffdf7" stroke="#b5834b" stroke-width="4"/>
                <rect x="45" y="${fillY}" width="90" height="${fillH}" rx="6" fill="#f7be4f" opacity="0.88"/>
                ${fillH > 4 ? `<ellipse cx="90" cy="${fillY}" rx="45" ry="5" fill="#ffe082"/>` : ""}
                <line x1="42" y1="135" x2="62" y2="135" stroke="#8a5a2b" stroke-width="2"/>
                <text x="68" y="139" font-size="10" font-weight="800" fill="#6b4423">500mL</text>
                <line x1="42" y1="100" x2="68" y2="100" stroke="#8a5a2b" stroke-width="2.4"/>
                <text x="72" y="104" font-size="11" font-weight="900" fill="#6b4423">1L (1000)</text>
                <line x1="42" y1="65" x2="62" y2="65" stroke="#8a5a2b" stroke-width="2"/>
                <text x="68" y="69" font-size="10" font-weight="800" fill="#6b4423">1500mL</text>
                <line x1="42" y1="30" x2="68" y2="30" stroke="#8a5a2b" stroke-width="2.4"/>
                <text x="72" y="34" font-size="11" font-weight="900" fill="#6b4423">2L (2000)</text>
              </svg>
              <div class="lab-readout">目前容量：<strong>${curL} 公升 ${curRem} 毫升</strong>（${sumMl} mL）</div>
            </div>
            <div style="flex:1;min-width:230px;">
              <div class="lab-money-palette">
                ${jugs.map((j) => `<button type="button" class="btn btn-ghost btn-sm" data-add-ml="${j.ml}">+${j.label}</button>`).join("")}
              </div>
              <div class="lab-tray-box" style="margin-top:10px;">
                <div class="lab-tray-head">
                  <span>倒水記錄（共 ${pours.length} 次）</span>
                  <button type="button" class="btn btn-ghost btn-sm" id="btn-beaker-clear">🗑️ 倒掉重來</button>
                </div>
                <div class="lab-tray-items">
                  ${pours.length ? pours.map((ml) => `<span class="lab-chip">${ml >= 1000 ? "1L" : ml + "mL"}</span>`).join("") : `<span style="color:var(--muted);font-size:0.84rem;">點選上方按鈕把果汁倒進量杯…</span>`}
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <button type="button" class="btn btn-forest btn-lg" id="btn-beaker-check">✅ 確認容量！</button>
            <button type="button" class="btn btn-gold" id="btn-beaker-next">🔄 換下一杯調飲</button>
          </div>
          <div id="lab-msg" class="lab-msg hidden"></div>
        `;

        stage.querySelectorAll("[data-add-ml]").forEach((b) => {
          b.addEventListener("click", () => {
            if (solved) return;
            pours.push(Number(b.dataset.addMl));
            window.SoundFX && window.SoundFX.playClick();
            draw();
          });
        });
        document.getElementById("btn-beaker-clear")?.addEventListener("click", () => {
          if (solved) return;
          pours = [];
          draw();
        });
        document.getElementById("btn-beaker-next")?.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          renderBeakerLab();
        });
        document.getElementById("btn-beaker-check")?.addEventListener("click", () => {
          const msgEl = document.getElementById("lab-msg");
          if (sumMl === targetMl) {
            if (!solved) {
              solved = true;
              awardLabCoins(msgEl, `太厲害了！剛好倒出 ${tL > 0 ? `${tL} 公升 ` : ""}${tRem} 毫升（${targetMl} mL）！`);
            }
          } else {
            window.SoundFX && window.SoundFX.playWrong();
            if (msgEl) {
              msgEl.className = "lab-msg bad";
              msgEl.textContent = sumMl > targetMl ? `😅 倒太多囉（目前 ${sumMl} mL），目標是 ${targetMl} mL！` : `😅 還差一點點（目前 ${sumMl} mL），目標是 ${targetMl} mL！`;
            }
          }
        });
      }
      draw();
    }

    function renderActiveLab() {
      if (currentTab === "scale") return renderScaleLab();
      if (currentTab === "beaker") return renderBeakerLab();
      return renderChangeLab();
    }

    tabsWrap.addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-lab-tab]");
      if (!b) return;
      window.SoundFX && window.SoundFX.playClick();
      currentTab = b.dataset.labTab;
      tabsWrap.querySelectorAll("button[data-lab-tab]").forEach((el) => el.classList.toggle("active", el === b));
      renderActiveLab();
    });

    renderActiveLab();
  }

  // ==================== 5. 🧮 三年級核心「九九乘法＆有餘數除法」互動練功房 ====================
  function initMulDivDojo() {
    const tabsWrap = document.getElementById("dojo-mode-tabs");
    const stage = document.getElementById("dojo-stage");
    if (!tabsWrap || !stage) return;

    const zhDigits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    function toMulChant(a, b) {
      const p = a * b;
      const aZh = zhDigits[a] || String(a);
      const bZh = zhDigits[b] || String(b);
      if (p < 10) return `${aZh}${bZh}得${zhDigits[p]}`;
      const tens = Math.floor(p / 10);
      const ones = p % 10;
      const tensStr = tens === 1 ? "十" : `${zhDigits[tens]}十`;
      const onesStr = ones === 0 ? "" : zhDigits[ones];
      return `${aZh}${bZh}${tensStr}${onesStr}`;
    }

    let currentTab = "table";
    let selR = 7;
    let selC = 8;
    let dojoTimer = null;

    function stopDojoTimer() {
      if (dojoTimer) {
        clearInterval(dojoTimer);
        dojoTimer = null;
      }
    }

    function speakText(txt) {
      if (window.SpeechFX && window.SoundFX && window.SoundFX.enabled) {
        window.SpeechFX.speak(txt);
      }
    }

    function renderDotArray(r, c) {
      const rowColors = ["#e87a64", "#f0a03e", "#e2b832", "#68b878", "#4da684", "#d98296", "#c28666", "#d99a4e", "#76a85c"];
      let rowsHtml = "";
      for (let i = 0; i < r; i++) {
        const col = rowColors[i % rowColors.length];
        let dots = "";
        for (let j = 0; j < c; j++) {
          dots += `<span class="dojo-dot" style="background:${col};"></span>`;
        }
        rowsHtml += `<div class="dojo-dot-row"><span class="dojo-row-idx">${i + 1}</span>${dots}</div>`;
      }
      return rowsHtml;
    }

    function renderTableTab() {
      stopDojoTimer();
      const prod = selR * selC;
      const chant = toMulChant(selR, selC);

      let headerCells = `<div class="dojo-cell dojo-head">×</div>`;
      for (let c = 1; c <= 9; c++) {
        headerCells += `<div class="dojo-cell dojo-head ${c === selC ? "hi-axis" : ""}">${c}</div>`;
      }
      let bodyCells = "";
      for (let r = 1; r <= 9; r++) {
        bodyCells += `<div class="dojo-cell dojo-head ${r === selR ? "hi-axis" : ""}">${r}</div>`;
        for (let c = 1; c <= 9; c++) {
          const isSel = r === selR && c === selC;
          const inRect = r <= selR && c <= selC;
          bodyCells += `<button type="button" class="dojo-cell dojo-num ${inRect ? "in-rect" : ""} ${isSel ? "is-sel" : ""}" data-r="${r}" data-c="${c}" title="${r} × ${c} = ${r * c}">${r * c}</button>`;
        }
      }

      stage.innerHTML = `
        <div class="dojo-table-layout">
          <div class="dojo-matrix" role="grid" aria-label="互動九九乘法表">
            ${headerCells}
            ${bodyCells}
          </div>
          <div class="dojo-inspect-panel">
            <div class="dojo-formula-big">${selR} × ${selC} = <span>${prod}</span></div>
            <div class="dojo-chant-pill">🎵 口訣：<strong>${chant}</strong>
              <button type="button" class="btn btn-gold btn-sm" id="btn-dojo-speak" style="margin-left:8px;">🔊 再唸一次</button>
            </div>
            <div class="dojo-related-div">
              ➗ 延伸除法思考：<strong>${prod} ÷ ${selR} = ${selC}</strong>　｜　<strong>${prod} ÷ ${selC} = ${selR}</strong>
            </div>
            <div class="dojo-dots-card">
              <div style="font-size:0.82rem;font-weight:800;color:var(--muted);margin-bottom:6px;">
                ✨ 格點陣列圖：<strong>${selR} 排 × 每排 ${selC} 顆 ＝ 共 ${prod} 顆</strong>
              </div>
              <div class="dojo-dots-grid">${renderDotArray(selR, selC)}</div>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll(".dojo-num").forEach((b) => {
        b.addEventListener("click", () => {
          selR = Number(b.dataset.r);
          selC = Number(b.dataset.c);
          window.SoundFX && window.SoundFX.playClick();
          renderTableTab();
          speakText(`${selR}乘以${selC}等於${selR * selC}，${toMulChant(selR, selC)}`);
        });
      });

      document.getElementById("btn-dojo-speak")?.addEventListener("click", () => {
        speakText(`${selR}乘以${selC}等於${prod}，${chant}`);
      });
    }

    function makeDrillQuestion(mode) {
      if (mode === "mul30") {
        const a = 2 + Math.floor(Math.random() * 8);
        const b = 2 + Math.floor(Math.random() * 8);
        const ans = a * b;
        const set = new Set([ans]);
        const offsets = [-a, a, -b, b, -2, 2, -1, 1, 3, -3];
        while (set.size < 4) {
          const cand = ans + offsets[Math.floor(Math.random() * offsets.length)];
          if (cand > 0) set.add(cand);
        }
        return {
          text: `${a} × ${b} = ？`,
          answer: String(ans),
          options: Array.from(set).sort(() => Math.random() - 0.5).map(String),
          hint: `${toMulChant(a, b)}，答案是 ${ans}！`,
        };
      } else {
        // 有餘數除法特訓（除數 3~9，商 2~9，餘數 1 ~ divisor-1）
        const divisor = 3 + Math.floor(Math.random() * 7);
        const quotient = 2 + Math.floor(Math.random() * 8);
        const rem = 1 + Math.floor(Math.random() * (divisor - 1));
        const dividend = divisor * quotient + rem;
        const ansLabel = `${quotient} 餘 ${rem}`;
        const set = new Set([ansLabel]);
        let guard = 0;
        while (set.size < 4 && guard < 30) {
          guard += 1;
          const dq = Math.max(1, quotient + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.6 ? 0 : 1));
          const dr = 1 + Math.floor(Math.random() * (divisor + 1));
          const cand = `${dq} 餘 ${dr}`;
          if (cand !== ansLabel) set.add(cand);
        }
        return {
          text: `${dividend} ÷ ${divisor} = ？`,
          answer: ansLabel,
          options: Array.from(set).sort(() => Math.random() - 0.5),
          hint: `${divisor} × ${quotient} = ${divisor * quotient}，${dividend} − ${divisor * quotient} = ${rem}（餘數 ${rem} < 除數 ${divisor}）！`,
        };
      }
    }

    function renderDrillTab(mode) {
      stopDojoTimer();
      const isMul = mode === "mul30";
      stage.innerHTML = `
        <div style="text-align:center;padding:14px 8px;">
          <h4 style="margin:0 0 8px;font-size:1.15rem;color:var(--ink);">
            ${isMul ? "⚡ 30 秒九九乘法倍數反射特訓" : "➗ 30 秒有餘數除法特訓（小心餘數要小於除數！）"}
          </h4>
          <p style="margin:0 0 14px;color:var(--muted);font-weight:700;">
            限時 30 秒連續搶答，每答對 1 題加分＋連擊獎勵，結束即贈送 <strong>🪙 閃亮金幣</strong>！
          </p>
          <button type="button" class="btn btn-gold btn-lg" id="btn-dojo-start-drill">🚀 開始 30 秒計時特訓！</button>
        </div>
      `;

      document.getElementById("btn-dojo-start-drill")?.addEventListener("click", () => {
        let timeLeft = 30;
        let score = 0;
        let combo = 0;
        let maxCombo = 0;
        let solved = 0;
        let curQ = null;
        let lastHint = "";

        function showNext() {
          curQ = makeDrillQuestion(mode);
          stage.innerHTML = `
            <div class="blitz-hud">
              <span>⏱️ 剩餘 <strong id="dojo-t">${timeLeft}</strong> 秒</span>
              <span>🏆 得分 <strong>${score}</strong></span>
              <span>🔥 連擊 <strong>${combo}</strong></span>
            </div>
            <div class="blitz-q" style="margin:12px 0;">${curQ.text}</div>
            <div class="dq-options">
              ${curQ.options.map((o) => `<button type="button" class="btn btn-ghost btn-lg dojo-drill-opt" data-val="${esc(o)}" style="justify-content:center;font-weight:900;">${esc(o)}</button>`).join("")}
            </div>
            ${lastHint ? `<div class="lab-msg bad" style="margin-top:10px;">💡 上題提醒：${esc(lastHint)}</div>` : ""}
          `;

          stage.querySelectorAll(".dojo-drill-opt").forEach((b) => {
            b.addEventListener("click", () => {
              if (b.dataset.val === curQ.answer) {
                combo += 1;
                if (combo > maxCombo) maxCombo = combo;
                solved += 1;
                score += 10 + Math.min(combo * 2, 16);
                lastHint = "";
                window.SoundFX && window.SoundFX.playCorrect(combo);
              } else {
                combo = 0;
                score = Math.max(0, score - 5);
                lastHint = curQ.hint;
                window.SoundFX && window.SoundFX.playWrong();
              }
              showNext();
            });
          });
        }

        window.SoundFX && window.SoundFX.playCorrect(2);
        showNext();
        dojoTimer = setInterval(() => {
          timeLeft -= 1;
          const tEl = document.getElementById("dojo-t");
          if (tEl) tEl.textContent = String(Math.max(0, timeLeft));
          if (timeLeft <= 0) {
            stopDojoTimer();
            const earnedCoins = Math.max(10, Math.round(score / 4));
            const u = api ? api.getUser() : null;
            if (u) {
              u.coins = (u.coins || 0) + earnedCoins;
              api.saveStore();
              api.refreshHome();
            }
            window.SoundFX && window.SoundFX.playFanfare(3);
            window.VisualFX && window.VisualFX.celebrationRain();
            stage.innerHTML = `
              <div style="text-align:center;padding:16px 8px;">
                <h3 style="margin:0 0 8px;color:var(--ink);">🎉 30 秒特訓完成！</h3>
                <p style="font-size:1.02rem;font-weight:800;color:var(--ink-soft);margin:0 0 14px;">
                  共答對 <strong>${solved} 題</strong> ｜ 最高連擊 <strong>🔥 ${maxCombo}</strong> ｜ 最終得分 <strong>${score} 分</strong> ｜ 獲得 <strong>🪙 +${earnedCoins} 金幣</strong>！
                </p>
                <button type="button" class="btn btn-gold btn-lg" id="btn-dojo-retry">🔄 再挑戰一次 30 秒！</button>
              </div>
            `;
            document.getElementById("btn-dojo-retry")?.addEventListener("click", () => renderDrillTab(mode));
          }
        }, 1000);
      });
    }

    function renderActiveDojo() {
      if (currentTab === "mul30" || currentTab === "div30") return renderDrillTab(currentTab);
      return renderTableTab();
    }

    tabsWrap.addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-dojo-tab]");
      if (!b) return;
      window.SoundFX && window.SoundFX.playClick();
      currentTab = b.dataset.dojoTab;
      tabsWrap.querySelectorAll("button[data-dojo-tab]").forEach((el) => el.classList.toggle("active", el === b));
      renderActiveDojo();
    });

    renderActiveDojo();
  }

  // ==================== 初始化入口 ====================
  window.MathPlus = {
    init(hooks) {
      api = hooks;
      initEyeCareAlarm();
      initLifeUnitsLab();
      initMulDivDojo();

      const heroDailyBtn = document.getElementById("btn-hero-daily-q");
      if (heroDailyBtn) {
        heroDailyBtn.addEventListener("click", () => {
          window.SoundFX && window.SoundFX.playClick();
          if (api && typeof api.openPetQuest === "function") {
            api.openPetQuest();
          }
          renderDailyQuestionWall();
          setTimeout(() => {
            document.getElementById("daily-q-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        });
      }

      renderDailyQuestionWall();
    },
    refreshAll() {
      renderDailyQuestionWall();
    },
  };
})();
