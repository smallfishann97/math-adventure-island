/**
 * 數學遊戲冒險島｜五大進階互動模組 (super-features.js)
 * 1. 🐾 每日任務＋7天連續簽到寶箱
 * 2. 🥚 島嶼電子寵物養成（柴犬麻糬／焦糖小狐狸／抹茶小恐龍・4 階段進化）
 * 3. 📝 期中／期末模擬考卷模式（20 題滿分 100 分線上考＋一鍵列印 A4 考卷）
 * 4. 📷 我的夢幻小島「一鍵拍美照」明信片（PNG 下載）
 * 5. 👨‍👩‍👧 家長／老師學習週報卡片（一頁式摘要＋PNG 下載）
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

  function yesterdayStr() {
    const d = new Date(Date.now() - 86400000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureSuperState(user) {
    if (!user) return null;
    const today = todayStr();
    if (!user.daily || user.daily.date !== today) {
      user.daily = {
        date: today,
        stages: 0,
        correct: 0,
        extras: 0,
        claimed: {},
      };
    }
    if (!user.checkin) {
      user.checkin = { streak: 0, lastDate: "" };
    }
    if (!user.pet) {
      user.pet = {
        species: "shiba",
        name: "柴犬麻糬",
        xp: 0,
        cookies: 3,
        mood: 100,
      };
    }
    return user;
  }

  // ==================== 1. 每日任務＋連續簽到寶箱 ====================
  const CHECKIN_REWARDS = [
    { day: 1, coins: 20, icon: "🪙", label: "+20" },
    { day: 2, coins: 30, icon: "🪙", label: "+30" },
    { day: 3, coins: 60, icon: "🎁", label: "小寶箱 +60" },
    { day: 4, coins: 35, icon: "🪙", label: "+35" },
    { day: 5, coins: 45, icon: "🪙", label: "+45" },
    { day: 6, coins: 55, icon: "🪙", label: "+55" },
    { day: 7, coins: 160, icon: "👑", label: "大寶箱 +160" },
  ];

  const DAILY_QUESTS = [
    { id: "q_stage", title: "🎯 今日完成 1 次闖關或模擬考", field: "stages", target: 1, coins: 40, cookies: 2 },
    { id: "q_correct", title: "✅ 今日累計答對 5 題數學", field: "correct", target: 5, coins: 45, cookies: 3 },
    { id: "q_extra", title: "⚡ 今日練習字卡／閃電賽／雙人 PK 任 1 次", field: "extras", target: 1, coins: 35, cookies: 2 },
  ];

  function recordEvent(type, amount = 1) {
    if (!api) return;
    const user = ensureSuperState(api.getUser());
    if (!user) return;
    if (type === "correct") {
      user.daily.correct += amount;
      user.pet.cookies = (user.pet.cookies || 0) + amount;
    } else if (type === "stage") {
      user.daily.stages += amount;
      user.pet.cookies = (user.pet.cookies || 0) + 3;
    } else if (type === "extra") {
      user.daily.extras += amount;
    }
    api.saveStore();
    updateNavBadge();
    renderPetQuizCheer();
  }

  function countClaimable(user) {
    if (!user) return 0;
    ensureSuperState(user);
    let cnt = 0;
    if (user.checkin.lastDate !== todayStr()) cnt += 1;
    DAILY_QUESTS.forEach((q) => {
      if ((user.daily[q.field] || 0) >= q.target && !user.daily.claimed[q.id]) cnt += 1;
    });
    return cnt;
  }

  function updateNavBadge() {
    if (!api) return;
    const user = api.getUser();
    const badge = document.getElementById("pet-quest-badge");
    if (!badge || !user) return;
    const n = countClaimable(user);
    badge.textContent = String(n);
    badge.classList.toggle("hidden", n <= 0);
  }

  function renderDailyPanel() {
    if (!api) return;
    const user = ensureSuperState(api.getUser());
    if (!user) return;
    const strip = document.getElementById("checkin-strip");
    const btnCheckin = document.getElementById("btn-daily-checkin");
    const statusEl = document.getElementById("checkin-status-text");
    const questList = document.getElementById("daily-quest-list");
    if (!strip || !questList) return;

    const today = todayStr();
    const yest = yesterdayStr();
    const checkedToday = user.checkin.lastDate === today;
    const effectiveStreak = checkedToday
      ? user.checkin.streak
      : user.checkin.lastDate === yest
      ? user.checkin.streak
      : 0;
    const cycleDay = checkedToday ? ((effectiveStreak - 1) % 7) + 1 : (effectiveStreak % 7) + 1;

    if (statusEl) {
      statusEl.textContent = checkedToday
        ? `🎉 今日已完成簽到！目前連續簽到 ${user.checkin.streak} 天`
        : `🔥 目前連續簽到 ${effectiveStreak} 天，快領取今日第 ${cycleDay} 天簽到獎勵！`;
    }
    if (btnCheckin) {
      btnCheckin.disabled = checkedToday;
      btnCheckin.textContent = checkedToday ? "✓ 今日已簽到" : `🎁 領取第 ${cycleDay} 天簽到獎勵`;
    }

    strip.innerHTML = CHECKIN_REWARDS.map((r) => {
      const done = checkedToday ? r.day <= cycleDay : r.day < cycleDay;
      const isNow = !checkedToday && r.day === cycleDay;
      return `
        <div class="checkin-day-card ${done ? "is-done" : ""} ${isNow ? "is-today" : ""}">
          <span class="ck-day">第 ${r.day} 天</span>
          <span class="ck-icon">${done ? "✅" : r.icon}</span>
          <strong class="ck-reward">${r.label}</strong>
        </div>
      `;
    }).join("");

    questList.innerHTML = DAILY_QUESTS.map((q) => {
      const val = Math.min(q.target, user.daily[q.field] || 0);
      const pct = Math.round((val / q.target) * 100);
      const ready = val >= q.target;
      const claimed = Boolean(user.daily.claimed[q.id]);
      return `
        <div class="daily-quest-row ${claimed ? "is-claimed" : ready ? "is-ready" : ""}">
          <div class="dq-main">
            <div class="dq-title">${q.title}</div>
            <div class="dq-bar-wrap"><div class="dq-bar-fill" style="width:${pct}%"></div></div>
            <div class="dq-meta">進度：${val} / ${q.target} ｜ 獎勵：🪙 +${q.coins} ＋ 🍪 +${q.cookies} 餅乾</div>
          </div>
          <button type="button" class="btn ${claimed ? "btn-ghost" : ready ? "btn-gold" : "btn-ghost"} btn-sm" data-claim-quest="${q.id}" ${!ready || claimed ? "disabled" : ""}>
            ${claimed ? "已領取 ✓" : ready ? "🎁 領取" : "進行中"}
          </button>
        </div>
      `;
    }).join("");
  }

  // ==================== 2. 島嶼電子寵物養成 ====================
  const PET_SPECIES = {
    shiba: {
      name: "柴犬麻糬",
      body: "#F4B974",
      belly: "#FFF5DF",
      ear: "#C87D3A",
      quotes: ["汪汪！你算得越來越快了喔！", "再答對幾題就有香噴噴餅乾吃囉！", "今天也在冒險島一起加油吧！"],
    },
    fox: {
      name: "焦糖小狐狸",
      body: "#F08C5B",
      belly: "#FFF3E0",
      ear: "#8C4A27",
      quotes: ["呼呼～小狐狸最佩服會算數學的你！", "這題難不倒我們兩個聰明搭檔！", "陪我玩一下再繼續闖關吧！"],
    },
    dino: {
      name: "抹茶小恐龍",
      body: "#8ED194",
      belly: "#F2FCEB",
      ear: "#4C9A5E",
      quotes: ["吼嗚～小恐龍幫你把錯題都吃光光！", "餅乾好好吃，我的力量滿格了！", "你是最棒的冒險島小博士！"],
    },
  };

  function getPetStage(xp) {
    if (xp >= 70) return { lv: 4, title: "👑 皇冠傳說大明星", nextXp: 100 };
    if (xp >= 30) return { lv: 3, title: "🌟 活潑冒險小夥伴", nextXp: 70 };
    if (xp >= 10) return { lv: 2, title: "🐣 剛破殼小寶寶", nextXp: 30 };
    return { lv: 1, title: "🥚 暖暖神秘蛋", nextXp: 10 };
  }

  function renderPetSvg(speciesId, lv) {
    const sp = PET_SPECIES[speciesId] || PET_SPECIES.shiba;
    if (lv === 1) {
      return `
        <svg viewBox="0 0 120 120" class="pet-stage-svg" aria-hidden="true">
          <ellipse cx="60" cy="102" rx="34" ry="9" fill="#EBD8BA"/>
          <path d="M60 18 C84 18 94 52 92 78 C90 96 76 104 60 104 C44 104 30 96 28 78 C26 52 36 18 60 18 Z" fill="#FFF8E8" stroke="#5A4031" stroke-width="3.2"/>
          <circle cx="46" cy="54" r="7" fill="${sp.body}" opacity="0.75"/>
          <circle cx="74" cy="68" r="9" fill="${sp.body}" opacity="0.65"/>
          <circle cx="52" cy="82" r="5" fill="${sp.ear}" opacity="0.5"/>
          <path d="M44 42 L53 49 L62 41 L71 48" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
    const crown = lv >= 4
      ? `<path d="M44 26 L48 12 L56 20 L60 10 L64 20 L72 12 L76 26 Z" fill="#FFD447" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round"/>`
      : lv >= 3
      ? `<path d="M88 22 L91 28 L97 29 L92 33 L94 39 L88 36 L82 39 L84 33 L79 29 L85 28 Z" fill="#FFD447" stroke="#B6721A" stroke-width="1.4"/>`
      : "";
    const shell = lv === 2
      ? `<path d="M30 82 L40 90 L50 82 L60 90 L70 82 L80 90 L90 82 C88 100 76 106 60 106 C44 106 32 100 30 82 Z" fill="#FFF8E8" stroke="#5A4031" stroke-width="2.6" stroke-linejoin="round"/>`
      : "";
    const scarf = lv >= 3
      ? `<path d="M38 78 Q60 88 82 78 L80 86 Q60 94 40 86 Z" fill="#F27966" stroke="#5A4031" stroke-width="2"/>`
      : "";
    return `
      <svg viewBox="0 0 120 120" class="pet-stage-svg" aria-hidden="true">
        <ellipse cx="60" cy="106" rx="36" ry="8" fill="#EBD8BA"/>
        ${crown}
        <path d="M34 46 L26 22 L48 34 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M86 46 L94 22 L72 34 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <ellipse cx="60" cy="70" rx="32" ry="30" fill="${sp.body}" stroke="#5A4031" stroke-width="3.2"/>
        <ellipse cx="60" cy="78" rx="21" ry="18" fill="${sp.belly}"/>
        <circle cx="48" cy="60" r="4.2" fill="#5A4031"/>
        <circle cx="72" cy="60" r="4.2" fill="#5A4031"/>
        <circle cx="46.5" cy="58.5" r="1.4" fill="#FFF"/>
        <circle cx="70.5" cy="58.5" r="1.4" fill="#FFF"/>
        <ellipse cx="40" cy="67" rx="4.5" ry="2.6" fill="#FF9E94" opacity="0.7"/>
        <ellipse cx="80" cy="67" rx="4.5" ry="2.6" fill="#FF9E94" opacity="0.7"/>
        <ellipse cx="60" cy="67" rx="3.4" ry="2.4" fill="#5A4031"/>
        <path d="M54 72 Q60 77 66 72" fill="none" stroke="#5A4031" stroke-width="2.4" stroke-linecap="round"/>
        ${scarf}
        ${shell}
      </svg>`;
  }

  function renderPetPanel() {
    if (!api) return;
    const user = ensureSuperState(api.getUser());
    if (!user) return;
    const stageEl = document.getElementById("pet-avatar-stage");
    const nameEl = document.getElementById("pet-name-badge");
    const levelEl = document.getElementById("pet-level-text");
    const xpBar = document.getElementById("pet-xp-fill");
    const cookieEl = document.getElementById("pet-cookie-count");
    const speechEl = document.getElementById("pet-speech-bubble");
    if (!stageEl) return;

    const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
    const st = getPetStage(user.pet.xp || 0);
    stageEl.innerHTML = renderPetSvg(user.pet.species, st.lv);
    if (nameEl) nameEl.textContent = sp.name;
    if (levelEl) levelEl.textContent = `Lv.${st.lv} ${st.title}（成長值 ${user.pet.xp} / ${st.nextXp}）`;
    if (xpBar) xpBar.style.width = `${Math.min(100, Math.round(((user.pet.xp || 0) / st.nextXp) * 100))}%`;
    if (cookieEl) cookieEl.textContent = String(user.pet.cookies || 0);
    if (speechEl && !speechEl.dataset.custom) {
      speechEl.textContent = sp.quotes[0];
    }

    document.querySelectorAll("button[data-pet-species]").forEach((b) => {
      b.classList.toggle("active", b.dataset.petSpecies === user.pet.species);
    });
  }

  function renderPetQuizCheer() {
    if (!api) return;
    const el = document.getElementById("quiz-pet-cheer");
    const user = ensureSuperState(api.getUser());
    if (!el || !user) return;
    const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
    const st = getPetStage(user.pet.xp || 0);
    el.innerHTML = `<span class="quiz-pet-mini">${renderPetSvg(user.pet.species, st.lv)}</span><span>${sp.name}陪你闖關中（🍪 ${user.pet.cookies || 0}）</span>`;
  }

  // ==================== 3. 期中／期末模擬考卷模式 ====================
  let examState = null;

  function pickExamQuestions(scope) {
    const bank = api ? api.getBank() : window.GRADE3_MATH_BANK;
    if (!bank || !bank.units) return [];
    const units = scope === "midterm"
      ? bank.units.slice(0, 8)
      : scope === "final"
      ? bank.units.slice(8, 16)
      : bank.units.slice(0, 16);

    const pool = [];
    units.forEach((u) => {
      const shuffled = [...u.questions].sort(() => Math.random() - 0.5);
      const take = scope === "full" ? 2 : 3;
      shuffled.slice(0, take).forEach((q) => pool.push({ ...q, unitTitle: u.title, unitOrder: u.order }));
    });
    return pool.sort(() => Math.random() - 0.5).slice(0, 20);
  }

  function startOnlineExam(scope) {
    const qs = pickExamQuestions(scope);
    if (!qs.length) return;
    const scopeLabel = scope === "midterm"
      ? "📘 期中模擬考（單元 01～08）"
      : scope === "final"
      ? "📗 期末模擬考（單元 09～16）"
      : "📕 全學年總複習模擬考（單元 01～16）";

    examState = {
      scope,
      title: scopeLabel,
      questions: qs,
      answers: new Array(qs.length).fill(""),
      idx: 0,
      startedAt: Date.now(),
      submitted: false,
    };

    const modal = document.getElementById("mock-exam-modal");
    if (modal) modal.classList.remove("hidden");
    renderExamModal();
  }

  function normAns(s) {
    return String(s || "").trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/．/g, ".").replace(/\s+/g, "");
  }

  function renderExamModal() {
    if (!examState) return;
    const titleEl = document.getElementById("exam-modal-title");
    const bodyEl = document.getElementById("exam-modal-body");
    if (!bodyEl) return;
    if (titleEl) titleEl.textContent = `📝 ${examState.title}（每題 5 分・滿分 100 分）`;

    if (examState.submitted) {
      let correct = 0;
      const unitMap = new Map();
      const reviewRows = examState.questions.map((q, i) => {
        const ua = examState.answers[i] || "";
        const ok = normAns(ua) === normAns(q.answer);
        if (ok) correct += 1;
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
          </div>`;
      }).join("");

      const score = correct * 5;
      const weakUnits = [];
      const strongUnits = [];
      unitMap.forEach((v, k) => {
        if (v.ok < v.total) weakUnits.push(`${k}（答對 ${v.ok}/${v.total}）`);
        else strongUnits.push(k);
      });

      bodyEl.innerHTML = `
        <div class="exam-score-hero">
          <div class="exam-score-num">${score} <span>分</span></div>
          <p>共答對 <strong>${correct} / ${examState.questions.length}</strong> 題！獲得完考獎勵 <strong>🪙 +100 金幣</strong>！</p>
        </div>
        <div class="exam-diag-grid">
          <div class="exam-diag-box good">
            <h4>🌟 滿分強項單元</h4>
            <p>${strongUnits.length ? strongUnits.slice(0, 4).join("、") : "繼續加油，下一回一定有滿分單元！"}</p>
          </div>
          <div class="exam-diag-box warn">
            <h4>💡 建議優先複習</h4>
            <p>${weakUnits.length ? weakUnits.join("；") : "🎉 全部單元滿分通過，太厲害了！"}</p>
          </div>
        </div>
        <div class="exam-review-scroll">${reviewRows}</div>
        <div style="text-align:center;margin-top:14px;">
          <button type="button" class="btn btn-gold btn-lg" id="btn-exam-close-done">✨ 收下獎勵並關閉</button>
        </div>
      `;
      const doneBtn = bodyEl.querySelector("#btn-exam-close-done");
      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          document.getElementById("mock-exam-modal").classList.add("hidden");
        });
      }
      return;
    }

    const q = examState.questions[examState.idx];
    const curAns = examState.answers[examState.idx];
    const answeredCount = examState.answers.filter((a) => a !== "").length;
    const navDots = examState.questions.map((_, i) => {
      const cls = i === examState.idx ? "active" : examState.answers[i] !== "" ? "done" : "";
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

    bodyEl.innerHTML = `
      <div class="exam-dots-bar">${navDots}</div>
      <div class="exam-q-card">
        <div class="exam-q-meta">第 ${examState.idx + 1} / ${examState.questions.length} 題（已作答 ${answeredCount} 題）｜ 第 ${String(q.unitOrder).padStart(2, "0")} 單元：${esc(q.unitTitle)}</div>
        <div class="exam-q-prompt">${esc(q.prompt)}</div>
        ${q.visualSvg ? `<div class="exam-q-svg">${q.visualSvg}</div>` : ""}
        ${inputHtml}
      </div>
      <div class="exam-footer-nav">
        <button type="button" class="btn btn-ghost" id="btn-exam-prev" ${examState.idx === 0 ? "disabled" : ""}>← 上一題</button>
        <button type="button" class="btn btn-burgundy" id="btn-exam-submit">📮 交卷評分（${answeredCount}/20）</button>
        <button type="button" class="btn btn-gold" id="btn-exam-next" ${examState.idx >= examState.questions.length - 1 ? "disabled" : ""}>下一題 →</button>
      </div>
    `;

    bodyEl.querySelectorAll("button[data-exam-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        examState.idx = Number(b.dataset.examJump);
        renderExamModal();
      });
    });
    bodyEl.querySelectorAll("button[data-exam-choice]").forEach((b) => {
      b.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        examState.answers[examState.idx] = b.dataset.examChoice;
        if (examState.idx < examState.questions.length - 1) examState.idx += 1;
        renderExamModal();
      });
    });
    const txtIn = bodyEl.querySelector("#exam-text-input");
    const saveIn = bodyEl.querySelector("#exam-save-input");
    if (txtIn) {
      txtIn.addEventListener("input", () => {
        examState.answers[examState.idx] = txtIn.value.trim();
      });
    }
    if (saveIn && txtIn) {
      saveIn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        examState.answers[examState.idx] = txtIn.value.trim();
        if (examState.idx < examState.questions.length - 1) examState.idx += 1;
        renderExamModal();
      });
    }
    const prevBtn = bodyEl.querySelector("#btn-exam-prev");
    const nextBtn = bodyEl.querySelector("#btn-exam-next");
    const subBtn = bodyEl.querySelector("#btn-exam-submit");
    if (prevBtn) prevBtn.addEventListener("click", () => { examState.idx -= 1; renderExamModal(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { examState.idx += 1; renderExamModal(); });
    if (subBtn) {
      subBtn.addEventListener("click", () => {
        examState.submitted = true;
        let okCnt = 0;
        const histItems = examState.questions.map((qq, idx) => {
          const ua = examState.answers[idx] || "";
          const ok = normAns(ua) === normAns(qq.answer);
          if (ok) okCnt += 1;
          return { qid: qq.id, userAnswer: ua || "未作答", isCorrect: ok };
        });
        const user = api ? ensureSuperState(api.getUser()) : null;
        if (user) {
          user.coins = (user.coins || 0) + 100;
          const acc = Math.round((okCnt / examState.questions.length) * 100);
          user.history.unshift({
            id: "exam_" + Date.now(),
            date: new Date().toLocaleString("zh-TW", { hour12: false }),
            title: examState.title,
            unitId: "exam",
            stage: 0,
            score: okCnt * 5,
            correct: okCnt,
            total: examState.questions.length,
            accuracy: acc,
            stars: acc >= 80 ? 3 : acc >= 60 ? 2 : 1,
            elapsedSeconds: Math.round((Date.now() - examState.startedAt) / 1000),
            items: histItems,
          });
          user.history = user.history.slice(0, 60);
          recordEvent("stage", 1);
          if (okCnt > 0) recordEvent("correct", okCnt);
          api.saveStore();
          api.refreshHome();
        }
        window.SoundFX && window.SoundFX.playFanfare(3);
        window.VisualFX && window.VisualFX.burstConfetti();
        renderExamModal();
      });
    }
  }

  function printMockExam(scope) {
    const qs = pickExamQuestions(scope);
    if (!qs.length) return;
    const scopeLabel = scope === "midterm"
      ? "期中綜合模擬考卷（第 01～08 單元）"
      : scope === "final"
      ? "期末綜合模擬考卷（第 09～16 單元）"
      : "全學年總複習模擬考卷（第 01～16 單元）";
    const win = window.open("", "_blank");
    if (!win) return;
    const qHtml = qs.map((q, i) => `
      <div class="q-item">
        <div class="q-num">${i + 1}. [${esc(q.unitTitle)}] ${esc(q.prompt)}</div>
        ${q.choices && q.choices.length ? `<div class="q-ch">${q.choices.map((c, idx) => `<span>(${idx + 1}) ${esc(c)}</span>`).join("　")}</div>` : `<div class="q-line">答：____________________</div>`}
      </div>
    `).join("");
    const aHtml = qs.map((q, i) => `<span>第 ${i + 1} 題：<b>${esc(q.answer)}</b></span>`).join("　｜　");
    win.document.write(`<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><title>${scopeLabel}</title>
      <style>
        body{font-family:"Microsoft JhengHei",sans-serif;color:#2c221b;padding:24px;line-height:1.65;}
        h1{text-align:center;margin:0 0 6px;font-size:22px;}
        .meta{text-align:center;border-bottom:2px solid #5a4031;padding-bottom:10px;margin-bottom:16px;font-size:14px;}
        .q-item{margin-bottom:12px;page-break-inside:avoid;}
        .q-num{font-weight:700;}
        .q-ch{margin-left:22px;color:#444;}
        .q-line{margin-left:22px;margin-top:4px;}
        .ans{margin-top:26px;padding-top:12px;border-top:2px dashed #999;font-size:13px;page-break-before:always;}
        @media print {.no-print{display:none;}}
      </style></head><body>
      <div class="no-print" style="text-align:right;margin-bottom:10px;"><button onclick="window.print()" style="padding:8px 18px;font-size:15px;cursor:pointer;">🖨️ 立即列印 A4 考卷</button></div>
      <h1>數學遊戲冒險島・${scopeLabel}</h1>
      <div class="meta">班級：________　座號：______　姓名：____________　得分：________ / 100（每題 5 分）</div>
      ${qHtml}
      <div class="ans"><h3>📋 教師／家長參考解答卷</h3><p>${aHtml}</p></div>
      </body></html>`);
    win.document.close();
  }

  // ==================== 4. 我的夢幻小島「一鍵拍美照」明信片 ====================
  function svgToImage(svgHtml) {
    return new Promise((resolve) => {
      if (!svgHtml) return resolve(null);
      const clean = svgHtml.includes("xmlns=")
        ? svgHtml
        : svgHtml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      const img = new Image();
      const blob = new Blob([clean], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  async function openIslandPostcard() {
    if (!api) return;
    const user = ensureSuperState(api.getUser());
    if (!user) return;
    const islands = api.getIslandsConfig();
    const curId = api.getCurrentIsland() || "main";
    const isl = islands[curId] || islands.main;
    const theme = api.getTheme ? api.getTheme() : "day";

    const modal = document.getElementById("postcard-modal");
    const canvas = document.getElementById("postcard-canvas");
    if (!modal || !canvas) return;
    modal.classList.remove("hidden");

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // 明信片暖金外框與天空背景
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    if (theme === "night") {
      sky.addColorStop(0, "#2b2848");
      sky.addColorStop(0.65, "#47426f");
      sky.addColorStop(1, "#3a5a60");
    } else if (theme === "sunset") {
      sky.addColorStop(0, "#ffd4a8");
      sky.addColorStop(0.55, "#ffb899");
      sky.addColorStop(1, "#a9d9c8");
    } else if (theme === "cloudy") {
      sky.addColorStop(0, "#e6efe9");
      sky.addColorStop(0.65, "#cde2d8");
      sky.addColorStop(1, "#9acbb8");
    } else {
      sky.addColorStop(0, "#fff8e2");
      sky.addColorStop(0.52, "#e1f6ec");
      sky.addColorStop(1, "#9fd8c2");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 太陽或月亮
    if (theme === "night") {
      ctx.fillStyle = "#ffe58a";
      ctx.beginPath();
      ctx.arc(92, 86, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b2848";
      ctx.beginPath();
      ctx.arc(106, 78, 26, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = theme === "sunset" ? "#ff9266" : "#ffd65c";
      ctx.beginPath();
      ctx.arc(92, 86, 34, 0, Math.PI * 2);
      ctx.fill();
    }

    // 漂浮白雲
    [[240, 74, 24], [520, 62, 28], [790, 82, 22]].forEach(([cx, cy, r]) => {
      ctx.fillStyle = "rgba(255,253,248,0.82)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.9, cy - 6, r * 1.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 1.8, cy, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    });

    // 海浪波紋
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    for (let y = 485; y < 600; y += 34) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.quadraticCurveTo(220, y - 10, 380, y);
      ctx.quadraticCurveTo(560, y + 10, 740, y);
      ctx.stroke();
    }

    // 浮空島嶼底座（沙灘＋草地）
    ctx.fillStyle = "rgba(70,115,96,0.22)";
    ctx.beginPath();
    ctx.ellipse(W / 2, 468, 395, 118, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isl.beachFill || "#f5e3b5";
    ctx.strokeStyle = "#8a6744";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(W / 2, 378, 415, 152, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const gGrad = ctx.createLinearGradient(0, 220, 0, 500);
    gGrad.addColorStop(0, isl.grassA || "#9fd683");
    gGrad.addColorStop(1, isl.grassB || "#6db362");
    ctx.fillStyle = gGrad;
    ctx.strokeStyle = isl.grassStroke || "#58974e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(W / 2, 362, 385, 134, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 繪製本島所有預設景觀（含使用者移動後座標）與已擺放商店道具
    const toDraw = [];
    (isl.fixedProps || []).forEach((p, idx) => {
      const key = `fixed_${isl.id}_${idx}`;
      const saved = user.customPositions && user.customPositions[key];
      const px = saved ? saved.x : p.x;
      const py = saved ? saved.y : p.y;
      toDraw.push({ svgId: p.svgId, x: px, y: py, size: p.cls === "prop-house" ? 86 : 66 });
    });
    if (window.MathExtras && user.placedItems) {
      user.placedItems.forEach((id) => {
        const placedIsl = window.MathExtras.getItemIsland(user, id);
        if (placedIsl !== isl.id) return;
        const item = window.MathExtras.SHOP_ITEMS.find((it) => it.id === id);
        if (!item) return;
        const saved = user.customPositions && user.customPositions[id];
        const px = saved ? saved.x : item.x;
        const py = saved ? saved.y : item.y;
        toDraw.push({ svgId: id, x: px, y: py, size: 70 });
      });
    }
    toDraw.sort((a, b) => a.y - b.y);

    for (const item of toDraw) {
      const svgStr = window.MathIcons ? window.MathIcons.renderIcon(item.svgId, "") : "";
      const img = await svgToImage(svgStr);
      if (img) {
        const cx = 80 + (item.x / 920) * 840;
        const cy = 178 + (item.y / 500) * 320;
        ctx.drawImage(img, cx - item.size / 2, cy - item.size * 0.72, item.size, item.size);
      }
    }

    // 底部明信片白色資訊條
    ctx.fillStyle = "rgba(255,253,247,0.94)";
    ctx.strokeStyle = "#e2b25c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(26, H - 92, W - 52, 68, 18);
    ctx.fill();
    ctx.stroke();

    const totalStars = Object.values(user.stageStars || {}).reduce((a, b) => a + b, 0);
    ctx.fillStyle = "#4d382a";
    ctx.font = "900 22px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(`🏝️ ${isl.title}`, 48, H - 56);
    ctx.fillStyle = "#8a684a";
    ctx.font = "700 16px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(`島主：${user.name} ｜ ⭐ ${totalStars} 顆星 ｜ 🪙 ${user.coins || 0} 金幣 ｜ 📅 ${todayStr()}`, 48, H - 34);

    // 郵戳印章
    ctx.save();
    ctx.translate(W - 108, H - 58);
    ctx.rotate(-0.12);
    ctx.strokeStyle = "#d96552";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#d96552";
    ctx.font = "900 12px 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("冒險島", 0, -2);
    ctx.fillText("紀念章", 0, 13);
    ctx.restore();

    // 暖金明信片外框
    ctx.strokeStyle = "#e3a948";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
  }

  // ==================== 5. 家長／老師學習週報卡片 ====================
  function computeWeeklyStats(user) {
    const bank = api ? api.getBank() : window.GRADE3_MATH_BANK;
    const hist = user.history || [];
    const weekAgo = Date.now() - 7 * 86400000;
    let totalQ = 0;
    let totalOk = 0;
    let sessions = 0;

    hist.forEach((h) => {
      const ts = Number(String(h.id || "").replace(/^\D+/, "")) || 0;
      if (ts === 0 || ts >= weekAgo) {
        sessions += 1;
        totalQ += h.total || 0;
        totalOk += h.correct || 0;
      }
    });
    const avgAcc = totalQ > 0 ? Math.round((totalOk / totalQ) * 100) : 0;
    const totalStars = Object.values(user.stageStars || {}).reduce((a, b) => a + b, 0);
    const mistakeCnt = (user.mistakes || []).length;

    const unitScores = (bank && bank.units ? bank.units : []).map((u) => {
      let stars = 0;
      for (let s = 1; s <= 10; s++) stars += (user.stageStars && user.stageStars[`${u.id}-s${s}`]) || 0;
      return { title: u.title, stars };
    });
    const strongest = unitScores.filter((u) => u.stars > 0).sort((a, b) => b.stars - a.stars).slice(0, 2);
    const weakest = unitScores.sort((a, b) => a.stars - b.stars).slice(0, 2);

    let comment = "剛啟程的小冒險家！每天練 1 關（只要 3 分鐘），數學實力就會大躍進喔！";
    if (totalQ >= 30 && avgAcc >= 85) comment = "本週表現超級優秀！作答量充足且正確率超高，繼續保持這份好手感！";
    else if (totalQ >= 10 && avgAcc >= 70) comment = "穩定進步中！建議搭配「🛠️ 錯題特訓」把少數錯題清零，會更穩固喔！";
    else if (totalQ > 0) comment = "已經踏出練習的第一步！多看答題後的圖形化解析，觀念會越來越清楚！";

    return { sessions, totalQ, totalOk, avgAcc, totalStars, mistakeCnt, strongest, weakest, comment };
  }

  function renderWeeklyReport() {
    if (!api) return;
    const box = document.getElementById("weekly-report-box");
    const user = ensureSuperState(api.getUser());
    if (!box || !user) return;
    const st = computeWeeklyStats(user);
    box.innerHTML = `
      <div class="weekly-report-head">
        <div>
          <h3>👨‍👩‍👧 家長／老師學習週報小卡</h3>
          <p>學生：<strong>${esc(user.name)}</strong> ｜ 統計區間：近 7 天學習成果（${todayStr()}）</p>
        </div>
        <button type="button" class="btn btn-gold btn-sm" id="btn-download-weekly">⬇️ 下載週報圖片 (PNG)</button>
      </div>
      <div class="weekly-kpi-grid">
        <div class="wk-kpi"><span>本週練習次數</span><strong>${st.sessions} 次</strong></div>
        <div class="wk-kpi"><span>本週作答題數</span><strong>${st.totalQ} 題</strong></div>
        <div class="wk-kpi"><span>本週平均正確率</span><strong>${st.avgAcc}%</strong></div>
        <div class="wk-kpi"><span>累計星星／待複習錯題</span><strong>⭐ ${st.totalStars} ／ ${st.mistakeCnt} 題</strong></div>
      </div>
      <div class="weekly-units-row">
        <div><strong>🏆 目前最擅長：</strong>${st.strongest.length ? st.strongest.map((u) => `${u.title}（★${u.stars}）`).join("、") : "尚待累積闖關星等"}</div>
        <div><strong>💡 建議加強單元：</strong>${st.weakest.map((u) => u.title).join("、")}</div>
      </div>
      <div class="weekly-comment">💬 學習小評語：${st.comment}</div>
    `;

    const dlBtn = box.querySelector("#btn-download-weekly");
    if (dlBtn) {
      dlBtn.addEventListener("click", () => downloadWeeklyReportPng(user, st));
    }
  }

  function downloadWeeklyReportPng(user, st) {
    const c = document.createElement("canvas");
    c.width = 860;
    c.height = 500;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, 860, 500);
    ctx.strokeStyle = "#e3a948";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 840, 480);

    ctx.fillStyle = "#fff1cc";
    ctx.fillRect(24, 24, 812, 86);
    ctx.fillStyle = "#5a4031";
    ctx.font = "900 28px 'Microsoft JhengHei', sans-serif";
    ctx.fillText("👨‍👩‍👧 數學遊戲冒險島・本週學習週報", 46, 68);
    ctx.font = "700 16px 'Microsoft JhengHei', sans-serif";
    ctx.fillStyle = "#7e6149";
    ctx.fillText(`小冒險家：${user.name} ｜ 日期：${todayStr()}`, 46, 96);

    const kpis = [
      ["本週練習", `${st.sessions} 次`],
      ["本週作答", `${st.totalQ} 題`],
      ["平均正確率", `${st.avgAcc}%`],
      ["累計星等", `★ ${st.totalStars}`],
    ];
    kpis.forEach(([lbl, val], i) => {
      const x = 36 + i * 200;
      ctx.fillStyle = "#fff7e2";
      ctx.strokeStyle = "#e6c27c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, 134, 184, 96, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#8a6a4d";
      ctx.font = "700 15px 'Microsoft JhengHei', sans-serif";
      ctx.fillText(lbl, x + 20, 168);
      ctx.fillStyle = "#4d382a";
      ctx.font = "900 30px 'Microsoft JhengHei', sans-serif";
      ctx.fillText(val, x + 20, 210);
    });

    ctx.fillStyle = "#4d382a";
    ctx.font = "800 18px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(`🏆 目前最擅長：${st.strongest.length ? st.strongest.map((u) => `${u.title}(★${u.stars})`).join("、") : "持續累積中"}`, 40, 282);
    ctx.fillText(`💡 建議優先複習：${st.weakest.map((u) => u.title).join("、")}`, 40, 320);
    ctx.fillText(`🛠️ 待清零錯題數：${st.mistakeCnt} 題`, 40, 358);

    ctx.fillStyle = "#eaf8ee";
    ctx.strokeStyle = "#79be8d";
    ctx.beginPath();
    ctx.roundRect(36, 386, 788, 72, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2f6e44";
    ctx.font = "800 17px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(`💬 學習評語：${st.comment}`, 54, 428);

    const a = document.createElement("a");
    a.download = `數學遊戲冒險島-學習週報-${user.name}-${todayStr()}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }

  // ==================== 事件綁定與初始化 ====================
  function bindEvents() {
    // 每日簽到按鈕
    const btnCheckin = document.getElementById("btn-daily-checkin");
    if (btnCheckin) {
      btnCheckin.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user || user.checkin.lastDate === todayStr()) return;
        const yest = yesterdayStr();
        user.checkin.streak = user.checkin.lastDate === yest ? user.checkin.streak + 1 : 1;
        user.checkin.lastDate = todayStr();
        const cycleDay = ((user.checkin.streak - 1) % 7) + 1;
        const reward = CHECKIN_REWARDS[cycleDay - 1] || CHECKIN_REWARDS[0];
        user.coins = (user.coins || 0) + reward.coins;
        user.pet.cookies = (user.pet.cookies || 0) + (cycleDay === 7 ? 5 : 2);
        api.saveStore();
        api.refreshHome();
        window.SoundFX && window.SoundFX.playFanfare(3);
        window.VisualFX && window.VisualFX.burstConfetti();
        renderDailyPanel();
        renderPetPanel();
        updateNavBadge();
      });
    }

    // 領取每日任務
    const questList = document.getElementById("daily-quest-list");
    if (questList) {
      questList.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-claim-quest]");
        if (!btn || btn.disabled) return;
        const user = ensureSuperState(api.getUser());
        const q = DAILY_QUESTS.find((x) => x.id === btn.dataset.claimQuest);
        if (!user || !q || user.daily.claimed[q.id]) return;
        user.daily.claimed[q.id] = true;
        user.coins = (user.coins || 0) + q.coins;
        user.pet.cookies = (user.pet.cookies || 0) + q.cookies;
        api.saveStore();
        api.refreshHome();
        window.SoundFX && window.SoundFX.playFanfare(3);
        window.VisualFX && window.VisualFX.burstConfetti();
        renderDailyPanel();
        renderPetPanel();
        updateNavBadge();
      });
    }

    // 電子寵物切換、餵食、玩耍、買餅乾
    document.querySelectorAll("button[data-pet-species]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        user.pet.species = btn.dataset.petSpecies;
        api.saveStore();
        window.SoundFX && window.SoundFX.playClick();
        const speech = document.getElementById("pet-speech-bubble");
        if (speech) delete speech.dataset.custom;
        renderPetPanel();
        renderPetQuizCheer();
      });
    });

    const btnFeed = document.getElementById("btn-pet-feed");
    if (btnFeed) {
      btnFeed.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        const speech = document.getElementById("pet-speech-bubble");
        if ((user.pet.cookies || 0) <= 0) {
          window.SoundFX && window.SoundFX.playWrong();
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = "🍪 餅乾吃光囉！去答對題目或用金幣買餅乾吧！";
          }
          return;
        }
        const prevLv = getPetStage(user.pet.xp || 0).lv;
        user.pet.cookies -= 1;
        user.pet.xp = (user.pet.xp || 0) + 6;
        const nextLv = getPetStage(user.pet.xp).lv;
        api.saveStore();
        if (nextLv > prevLv) {
          window.SoundFX && window.SoundFX.playFanfare(3);
          window.VisualFX && window.VisualFX.burstConfetti();
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = `🎉 哇！我進化成 Lv.${nextLv} 了！謝謝你！`;
          }
        } else {
          window.SoundFX && window.SoundFX.playCorrect(2);
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = "😋 餅乾好好吃！成長值 +6，充滿能量！";
          }
        }
        renderPetPanel();
        renderPetQuizCheer();
      });
    }

    const btnPlay = document.getElementById("btn-pet-play");
    if (btnPlay) {
      btnPlay.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
        const line = sp.quotes[Math.floor(Math.random() * sp.quotes.length)];
        user.pet.xp = (user.pet.xp || 0) + 2;
        api.saveStore();
        window.SoundFX && window.SoundFX.playCorrect(1);
        const speech = document.getElementById("pet-speech-bubble");
        if (speech) {
          speech.dataset.custom = "1";
          speech.textContent = line;
        }
        if (window.SpeechFX && window.SoundFX && window.SoundFX.enabled) {
          window.SpeechFX.speak(line);
        }
        renderPetPanel();
      });
    }

    const btnBuyCookie = document.getElementById("btn-pet-buy-cookie");
    if (btnBuyCookie) {
      btnBuyCookie.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        const speech = document.getElementById("pet-speech-bubble");
        if ((user.coins || 0) < 15) {
          window.SoundFX && window.SoundFX.playWrong();
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = "🪙 需要 15 金幣才能買 3 塊餅乾喔！";
          }
          return;
        }
        user.coins -= 15;
        user.pet.cookies = (user.pet.cookies || 0) + 3;
        api.saveStore();
        api.refreshHome();
        window.SoundFX && window.SoundFX.playCorrect(2);
        if (speech) {
          speech.dataset.custom = "1";
          speech.textContent = "🍪 買到 3 塊香噴噴餅乾囉！快餵我吃吧！";
        }
        renderPetPanel();
        renderPetQuizCheer();
      });
    }

    // 期中／期末模擬考按鈕
    const btnStartExam = document.getElementById("btn-start-mock-exam");
    const btnPrintExam = document.getElementById("btn-print-mock-exam");
    const examScopeSel = document.getElementById("mock-exam-scope");
    if (btnStartExam && examScopeSel) {
      btnStartExam.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        startOnlineExam(examScopeSel.value);
      });
    }
    if (btnPrintExam && examScopeSel) {
      btnPrintExam.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        printMockExam(examScopeSel.value);
      });
    }
    const btnCloseExam = document.getElementById("btn-close-exam");
    if (btnCloseExam) {
      btnCloseExam.addEventListener("click", () => {
        document.getElementById("mock-exam-modal").classList.add("hidden");
      });
    }

    // 小島明信片拍照＆下載
    const btnPostcard = document.getElementById("btn-island-postcard");
    if (btnPostcard) {
      btnPostcard.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        openIslandPostcard();
      });
    }
    const btnClosePostcard = document.getElementById("btn-close-postcard");
    if (btnClosePostcard) {
      btnClosePostcard.addEventListener("click", () => {
        document.getElementById("postcard-modal").classList.add("hidden");
      });
    }
    const btnDlPostcard = document.getElementById("btn-download-postcard");
    if (btnDlPostcard) {
      btnDlPostcard.addEventListener("click", () => {
        const canvas = document.getElementById("postcard-canvas");
        const user = api ? api.getUser() : null;
        if (!canvas) return;
        const a = document.createElement("a");
        a.download = `數學遊戲冒險島-我的小島明信片-${user ? user.name : "島主"}-${todayStr()}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      });
    }
  }

  window.MathSuper = {
    init(hooks) {
      api = hooks;
      bindEvents();
      this.refreshAll();
    },
    refreshAll() {
      renderDailyPanel();
      renderPetPanel();
      renderWeeklyReport();
      renderPetQuizCheer();
      updateNavBadge();
    },
    recordEvent,
    renderWeeklyReport,
    renderPetQuizCheer,
  };
})();
