/**
 * 小三數學秘境島｜主互動引擎
 * 整合：多帳號登入存檔、2D冒險島地圖、16單元×10關闖關動畫、800題SVG圖形題、
 * 國小生對錯雙欄與圖形解析、過關小禮物迷你遊戲、歷史答題記錄館、3D數學名詞字卡、四段字體調整
 */
(function () {
  const STORE_KEY = "grade3_math_atelier_accounts_v2";
  const BANK = window.GRADE3_MATH_BANK;
  const ORIGINAL_STAGES = window.ORIGINAL_MATH_CHALLENGES || [];
  const GLOSSARY = window.GRADE3_MATH_GLOSSARY || [];

  if (!BANK || !Array.isArray(BANK.units)) {
    alert("題庫資料載入失敗，請確認 data/grade3-math-bank.js 是否存在。");
    return;
  }

  // 索引快取
  const unitMap = new Map();
  const questionMap = new Map();
  const sourceMap = new Map();
  BANK.sources.forEach((s) => sourceMap.set(s.id, s));
  BANK.units.forEach((u) => {
    unitMap.set(u.id, u);
    u.questions.forEach((q) => {
      questionMap.set(q.id, { ...q, unitId: u.id, unitTitle: u.title, unitOrder: u.order });
    });
  });
  ORIGINAL_STAGES.forEach((st) => {
    st.questions.forEach((q) => {
      questionMap.set(q.id, q);
    });
  });

  // 冒險島 16 座單元地標座標（分布於 920×500 立體島面上，預留上下邊距讓所有文字與頭頂完全露出）
  const ISLAND_COORDS = [
    { x: 118, y: 398 }, { x: 206, y: 344 }, { x: 162, y: 248 }, { x: 264, y: 178 },
    { x: 348, y: 246 }, { x: 326, y: 356 }, { x: 432, y: 406 }, { x: 500, y: 312 },
    { x: 458, y: 208 }, { x: 552, y: 156 }, { x: 648, y: 204 }, { x: 622, y: 304 },
    { x: 710, y: 386 }, { x: 818, y: 368 }, { x: 742, y: 274 }, { x: 824, y: 184 }
  ];

  let islandRotZ = -3;
  let islandRotX = 48;

  // 1~4 號島每座島均分 4 個數學單元，寬敞零重疊！
  const QUAD_COORDS = [
    { x: 185, y: 335 },
    { x: 370, y: 215 },
    { x: 565, y: 325 },
    { x: 755, y: 210 }
  ];

  // 6 座群島設定（1~4號島直接開放且各負責 4 個單元；5號島 30星解鎖、6號島 60星解鎖！6座島全數擁有 10 個可自由移動與一鍵還原的預設景觀！）
  const ISLANDS_CONFIG = {
    main: {
      id: "main",
      shortName: "1號島",
      title: "🌲 1號島・陽光森林島（單元 01～04）",
      unlockStars: 0,
      unitStart: 0,
      unitEnd: 4,
      grassA: "#9fd683",
      grassB: "#6db362",
      grassStroke: "#58974e",
      beachFill: "#f5e3b5",
      showUnitPins: true,
      fixedProps: [
        { x: 140, y: 185, svgId: "tree_round", cls: "" },
        { x: 265, y: 145, svgId: "tree_pine", cls: "" },
        { x: 478, y: 142, svgId: "windmill", cls: "prop-house" },
        { x: 645, y: 145, svgId: "house", cls: "prop-house" },
        { x: 118, y: 262, svgId: "tent", cls: "" },
        { x: 305, y: 372, svgId: "campfire", cls: "" },
        { x: 455, y: 388, svgId: "sunflower", cls: "" },
        { x: 690, y: 365, svgId: "mushroom", cls: "" },
        { x: 830, y: 300, svgId: "palm", cls: "" },
        { x: 472, y: 258, svgId: "clover", cls: "" }
      ],
      decorSvg: ""
    },
    garden: {
      id: "garden",
      shortName: "2號島",
      title: "🌸 2號島・花園動物島（單元 05～08）",
      unlockStars: 0,
      unitStart: 4,
      unitEnd: 8,
      grassA: "#ffd8e4",
      grassB: "#f2abc3",
      grassStroke: "#d884a2",
      beachFill: "#fff4dc",
      showUnitPins: true,
      fixedProps: [
        { x: 145, y: 185, svgId: "sakura", cls: "" },
        { x: 268, y: 142, svgId: "cottage", cls: "prop-house" },
        { x: 482, y: 145, svgId: "fountain", cls: "prop-house" },
        { x: 645, y: 148, svgId: "tree_round", cls: "" },
        { x: 122, y: 270, svgId: "butterfly", cls: "" },
        { x: 130, y: 378, svgId: "tulip", cls: "" },
        { x: 325, y: 372, svgId: "duck", cls: "" },
        { x: 472, y: 258, svgId: "rose", cls: "" },
        { x: 695, y: 365, svgId: "bee", cls: "" },
        { x: 822, y: 312, svgId: "plant_daisy", cls: "" }
      ],
      decorSvg: `
        <ellipse cx="465" cy="255" rx="95" ry="44" fill="#fff0c9" stroke="#fffdf7" stroke-width="5" opacity="0.9" />
        <ellipse cx="452" cy="248" rx="64" ry="24" fill="#fff8e3" opacity="0.8" />
      `
    },
    park: {
      id: "park",
      shortName: "3號島",
      title: "🎡 3號島・甜點遊樂園（單元 09～12）",
      unlockStars: 0,
      unitStart: 8,
      unitEnd: 12,
      grassA: "#ffe0c8",
      grassB: "#f6bc9a",
      grassStroke: "#df9a78",
      beachFill: "#fff2cc",
      showUnitPins: true,
      fixedProps: [
        { x: 145, y: 175, svgId: "lollipop", cls: "" },
        { x: 268, y: 142, svgId: "house_bakery", cls: "prop-house" },
        { x: 482, y: 142, svgId: "carousel", cls: "prop-house" },
        { x: 645, y: 148, svgId: "house_cafe", cls: "prop-house" },
        { x: 825, y: 172, svgId: "balloon", cls: "" },
        { x: 120, y: 268, svgId: "rainbow", cls: "" },
        { x: 315, y: 375, svgId: "cake", cls: "" },
        { x: 468, y: 262, svgId: "icecream", cls: "" },
        { x: 695, y: 368, svgId: "donut", cls: "" },
        { x: 825, y: 312, svgId: "fireworks", cls: "" }
      ],
      decorSvg: `
        <ellipse cx="468" cy="260" rx="185" ry="96" fill="#fff4df" stroke="#f2c48d" stroke-width="4" stroke-dasharray="10 8" opacity="0.82" />
      `
    },
    bay: {
      id: "bay",
      shortName: "4號島",
      title: "⛵ 4號島・星空海灣島（單元 13～16）",
      unlockStars: 0,
      unitStart: 12,
      unitEnd: 16,
      grassA: "#c9edd6",
      grassB: "#89d1b0",
      grassStroke: "#62ad8d",
      beachFill: "#fff3d1",
      showUnitPins: true,
      fixedProps: [
        { x: 148, y: 185, svgId: "lighthouse", cls: "prop-house" },
        { x: 272, y: 145, svgId: "shootingstar", cls: "" },
        { x: 482, y: 142, svgId: "lantern", cls: "" },
        { x: 645, y: 145, svgId: "palm", cls: "" },
        { x: 125, y: 362, svgId: "palm", cls: "" },
        { x: 318, y: 375, svgId: "sailboat", cls: "" },
        { x: 468, y: 262, svgId: "crystal", cls: "" },
        { x: 692, y: 365, svgId: "shell", cls: "" },
        { x: 825, y: 325, svgId: "campfire", cls: "" },
        { x: 818, y: 168, svgId: "duck", cls: "" }
      ],
      decorSvg: `
        <rect x="425" y="388" width="76" height="26" rx="6" fill="#c78d56" stroke="#7d5129" stroke-width="2.5" />
        <path d="M 442 388 V 414 M 462 388 V 414 M 482 388 V 414" stroke="#8c5c30" stroke-width="2" />
      `
    },
    town: {
      id: "town",
      shortName: "5號島",
      title: "🏘️ 5號島・職人小鎮島",
      unlockStars: 30,
      grassA: "#f6e7c4",
      grassB: "#e5cb98",
      grassStroke: "#c7a46b",
      beachFill: "#fff5df",
      showUnitPins: false,
      fixedProps: [
        { x: 150, y: 195, svgId: "house", cls: "prop-house" },
        { x: 270, y: 145, svgId: "house_cafe", cls: "prop-house" },
        { x: 675, y: 148, svgId: "house_bakery", cls: "prop-house" },
        { x: 790, y: 198, svgId: "cottage", cls: "prop-house" },
        { x: 465, y: 278, svgId: "fountain", cls: "prop-house" },
        { x: 120, y: 335, svgId: "plant_maple", cls: "" },
        { x: 820, y: 330, svgId: "plant_appletree", cls: "" },
        { x: 225, y: 375, svgId: "veh_bike", cls: "" },
        { x: 715, y: 375, svgId: "plant_daisy", cls: "" },
        { x: 560, y: 138, svgId: "lantern", cls: "" }
      ],
      decorSvg: `
        <path d="M 135 270 H 795 M 465 130 V 395" fill="none" stroke="#fff8e8" stroke-width="26" stroke-linecap="round" opacity="0.88" />
        <path d="M 135 270 H 795 M 465 130 V 395" fill="none" stroke="#dfb982" stroke-width="2.5" stroke-dasharray="8 8" />
        <circle cx="465" cy="270" r="64" fill="#fff3d6" stroke="#e5b869" stroke-width="4" />
        <circle cx="465" cy="270" r="32" fill="#ffe6a8" opacity="0.8" />
      `
    },
    kingdom: {
      id: "kingdom",
      shortName: "6號島",
      title: "👑 6號島・皇冠天空島",
      unlockStars: 60,
      grassA: "#ebd6f7",
      grassB: "#cdaae6",
      grassStroke: "#ad84cc",
      beachFill: "#fff4c7",
      showUnitPins: false,
      fixedProps: [
        { x: 468, y: 162, svgId: "castle", cls: "prop-house" },
        { x: 468, y: 278, svgId: "crown_monument", cls: "prop-house" },
        { x: 160, y: 185, svgId: "rainbow", cls: "" },
        { x: 780, y: 180, svgId: "shootingstar", cls: "" },
        { x: 275, y: 145, svgId: "balloon", cls: "" },
        { x: 665, y: 145, svgId: "fireworks", cls: "" },
        { x: 135, y: 340, svgId: "sakura", cls: "" },
        { x: 810, y: 335, svgId: "sakura", cls: "" },
        { x: 245, y: 365, svgId: "unicorn", cls: "" },
        { x: 695, y: 365, svgId: "crystal", cls: "" }
      ],
      decorSvg: `
        <ellipse cx="468" cy="262" rx="195" ry="102" fill="#fff6fb" stroke="#f2c46d" stroke-width="4" opacity="0.82" />
        <polygon points="468,184 486,232 536,236 497,268 510,316 468,288 426,316 439,268 400,236 450,232" fill="#ffe999" stroke="#e5a93c" stroke-width="3" opacity="0.9" />
      `
    }
  };

  // 帳號資料庫讀寫
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.users) return parsed;
      }
    } catch (_) {}
    return { activeUserId: null, users: {} };
  }

  let store = loadStore();

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  function createEmptyProfile(id, name, avatar) {
    return {
      id,
      name,
      avatar,
      fontSize: "md",
      coins: 0,
      freeUnlock: false,
      stageStars: {}, // { "u01-s1": 3 }
      mistakes: [],   // [qid, ...]
      masteredTerms: [], // [gid, ...]
      history: []     // [{ id, date, title, unitId, stage, score, correct, total, stars, elapsedSeconds, items: [{ qid, userAnswer, isCorrect }] }]
    };
  }

  function currentUser() {
    return store.activeUserId ? store.users[store.activeUserId] || null : null;
  }

  // 執行期狀態
  const state = {
    selectedAvatar: "shiba",
    activeDomain: "ALL",
    currentUnitId: "u01",
    quiz: null,
    reviewFilter: "ALL",
    decorateMode: false,
    pickedDecorId: null
  };

  function renderAvatarHtml(raw, sizeClass = "avatar-md") {
    return window.AvatarArt ? window.AvatarArt.render(raw, sizeClass) : esc(raw);
  }

  function initAvatarPicker() {
    const picker = document.getElementById("avatar-picker");
    if (!picker || !window.AvatarArt) return;
    picker.innerHTML = window.AvatarArt.list
      .map(
        (a, i) => `
      <button type="button" class="avatar-opt ${i === 0 ? "active" : ""}" data-avatar="${a.id}" title="${a.name}">
        ${window.AvatarArt.render(a.id, "avatar-lg")}
        <span class="avatar-opt-name">${a.name}</span>
      </button>`
      )
      .join("");
  }

  // DOM 參照
  const loginView = document.getElementById("view-login");
  const appShell = document.getElementById("app-shell");
  const views = {
    home: document.getElementById("view-home"),
    original: document.getElementById("view-original"),
    arcade: document.getElementById("view-arcade"),
    shop: document.getElementById("view-shop"),
    tools: document.getElementById("view-tools"),
    stages: document.getElementById("view-stages"),
    lesson: document.getElementById("view-lesson"),
    quiz: document.getElementById("view-quiz"),
    result: document.getElementById("view-result"),
    glossary: document.getElementById("view-glossary"),
    mistakesHub: document.getElementById("view-mistakes-hub"),
    history: document.getElementById("view-history"),
    pet: document.getElementById("view-pet"),
    daily: document.getElementById("view-daily"),
    sources: document.getElementById("view-sources")
  };
  const navBtns = {
    home: document.getElementById("nav-home"),
    pet: document.getElementById("nav-pet"),
    daily: document.getElementById("nav-daily"),
    original: document.getElementById("nav-original"),
    arcade: document.getElementById("nav-arcade"),
    shop: document.getElementById("nav-shop"),
    tools: document.getElementById("nav-tools"),
    glossary: document.getElementById("nav-glossary"),
    mistakes: document.getElementById("nav-mistakes"),
    history: document.getElementById("nav-history"),
    sources: document.getElementById("nav-sources")
  };

  // 工具函式
  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function normalizeInput(str) {
    return String(str || "")
      .trim()
      .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/．/g, ".")
      .replace(/\s+/g, "");
  }

  function renderStars(count) {
    return "⭐".repeat(count) + "☆".repeat(Math.max(0, 3 - count));
  }

  function showView(viewKey, navKey = null) {
    if (window.SpeechFX) window.SpeechFX.stop();
    Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === viewKey));
    Object.entries(navBtns).forEach(([k, el]) => el.classList.toggle("active", k === navKey));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyFontSize(fs) {
    const valid = ["sm", "md", "lg", "xl"].includes(fs) ? fs : "md";
    document.documentElement.setAttribute("data-font-size", valid);
    document.querySelectorAll(".fs-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.fs === valid);
    });
    const u = currentUser();
    if (u) {
      u.fontSize = valid;
      saveStore();
    }
  }

  function getUnitStats(user, unitId) {
    let stars = 0;
    let cleared = 0;
    for (let s = 1; s <= 10; s++) {
      const st = user.stageStars[`${unitId}-s${s}`] || 0;
      if (st > 0) {
        cleared += 1;
        stars += st;
      }
    }
    return { stars, cleared };
  }

  // ===========================================================================
  // 1. 登入頁與多帳號切換
  // ===========================================================================
  function renderLoginScreen() {
    loginView.classList.add("active");
    appShell.classList.add("hidden");
    const usersList = Object.values(store.users);
    const wrap = document.getElementById("existing-profiles-wrap");
    const listEl = document.getElementById("existing-profiles-list");

    if (usersList.length === 0) {
      wrap.classList.add("hidden");
      return;
    }
    wrap.classList.remove("hidden");
    listEl.innerHTML = usersList
      .map((u) => {
        const totalStars = Object.values(u.stageStars || {}).reduce((a, b) => a + b, 0);
        return `
          <div class="profile-card-wrap">
            <button type="button" class="profile-btn" data-login-uid="${esc(u.id)}">
              <span class="profile-avatar">${renderAvatarHtml(u.avatar, "avatar-md")}</span>
              <div class="profile-meta">
                <strong>${esc(u.name)}</strong>
                <span>⭐ ${totalStars} ｜ 🪙 ${u.coins || 0}</span>
              </div>
            </button>
            <button type="button" class="profile-del-btn" data-delete-uid="${esc(u.id)}" title="刪除此冒險者記錄" aria-label="刪除 ${esc(u.name)}">✕</button>
          </div>
        `;
      })
      .join("");
  }

  function loginAs(userId) {
    if (!store.users[userId]) return;
    store.activeUserId = userId;
    saveStore();
    const u = currentUser();
    loginView.classList.remove("active");
    appShell.classList.remove("hidden");
    document.getElementById("user-avatar").innerHTML = renderAvatarHtml(u.avatar, "avatar-xs");
    document.getElementById("user-name").textContent = u.name;
    document.getElementById("chk-free-unlock").checked = Boolean(u.freeUnlock);
    applyFontSize(u.fontSize || "md");
    refreshAllHomeUI();
    showView("home", "home");

    // 剛登島時若尚未開啟背景音樂，顯示 6 秒可愛指向提示氣泡
    const bgmBubble = document.getElementById("bgm-hint-bubble");
    const bgmBtnEl = document.getElementById("btn-bgm-toggle");
    if (bgmBubble && bgmBtnEl && bgmBtnEl.getAttribute("aria-pressed") !== "true") {
      bgmBubble.classList.remove("hidden");
      clearTimeout(window._bgmHintTimer);
      window._bgmHintTimer = setTimeout(() => bgmBubble.classList.add("hidden"), 6000);
    }
  }

  // ===========================================================================
  // 2. 首頁儀表板、2D 互動島嶼地圖與 16 單元卡片
  // ===========================================================================
  function refreshAllHomeUI() {
    const u = currentUser();
    if (!u) return;

    const totalClearedStages = Object.values(u.stageStars).filter((s) => s > 0).length;
    const totalStars = Object.values(u.stageStars).reduce((a, b) => a + b, 0);
    const mistakesCnt = u.mistakes.length;

    document.getElementById("stat-cleared-stages").textContent = `${totalClearedStages} / 160`;
    document.getElementById("stat-total-stars").textContent = `⭐ ${totalStars}`;
    document.getElementById("stat-coins").textContent = `🪙 ${u.coins || 0}`;
    document.getElementById("stat-mistake-count").textContent = `${mistakesCnt} 題`;
    document.getElementById("mistake-badge").textContent = String(mistakesCnt);

    refreshArchipelagoTickets(totalStars);
    renderIslandMap(u);
    renderUnitsGrid(u);
    if (window.MathSuper) window.MathSuper.refreshAll();
  }

  function refreshArchipelagoTickets(totalStars) {
    const bar = document.getElementById("archipelago-bar");
    if (!bar) return;
    const curCfg = ISLANDS_CONFIG[state.currentIsland || "main"] || ISLANDS_CONFIG.main;
    if (totalStars < (curCfg.unlockStars || 0)) {
      state.currentIsland = "main";
    }
    bar.querySelectorAll("button[data-island-tab]").forEach((b) => {
      const id = b.dataset.islandTab;
      const cfg = ISLANDS_CONFIG[id] || ISLANDS_CONFIG.main;
      const locked = totalStars < (cfg.unlockStars || 0);
      b.classList.toggle("is-locked", locked);
      const isAct = !locked && id === (state.currentIsland || "main");
      b.classList.toggle("active", isAct);
      b.setAttribute("aria-selected", isAct ? "true" : "false");
    });
  }

  function updateIslandStageTransform() {
    const container = document.getElementById("island-map-container");
    const stage = container ? container.querySelector(".island-stage") : null;
    if (!container || !stage) return;
    if (container.clientWidth < 120) {
      requestAnimationFrame(updateIslandStageTransform);
      return;
    }
    const scale = Math.min(1.06, Math.max(0.32, (container.clientWidth - 16) / 920));
    stage.style.setProperty("--rot-z", `${islandRotZ}deg`);
    stage.style.setProperty("--rot-x", `${islandRotX}deg`);
    stage.style.setProperty("--stage-scale", String(scale));
  }

  function renderIslandMap(user) {
    const container = document.getElementById("island-map-container");
    const pathD = ISLAND_COORDS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const islandShape = "M 54 415 C 34 306, 76 168, 202 112 C 296 70, 396 122, 466 86 C 574 38, 712 78, 838 72 C 902 70, 912 188, 884 294 C 860 388, 762 446, 650 432 C 530 416, 450 462, 338 444 C 228 426, 128 472, 54 415 Z";
    const grassShape = "M 78 396 C 64 304, 98 184, 212 134 C 300 96, 392 142, 466 108 C 566 64, 700 100, 816 96 C 872 94, 882 198, 858 288 C 836 370, 744 422, 646 408 C 530 394, 450 438, 346 420 C 244 404, 148 446, 78 396 Z";

    // 找出目前探險中的最新單元
    let shipIdx = 0;
    for (let i = 0; i < BANK.units.length; i++) {
      const st = getUnitStats(user, BANK.units[i].id);
      if (st.cleared < 10) {
        shipIdx = i;
        break;
      }
      shipIdx = i;
    }

    const activeIslandId = state.currentIsland || "main";
    const isl = ISLANDS_CONFIG[activeIslandId] || ISLANDS_CONFIG.main;

    // 可愛立體場景裝飾（全原創向量 SVG：跨電腦／手機完全一致）
    const props = isl.fixedProps;

    const customPropsHtml = window.MathExtras
      ? window.MathExtras.getPlacedIslandPropsHtml(user, state.decorateMode ? state.pickedDecorId : null, isl.id)
      : "";
    const isMovableFixedIsland = true;
    const propsHtml =
      props
        .map((p, idx) => {
          const iconHtml = window.MathIcons ? window.MathIcons.renderIcon(p.svgId, "svg-prop-icon") : "";
          if (isMovableFixedIsland) {
            const fixedKey = `fixed_${isl.id}_${idx}`;
            const saved = user.customPositions && user.customPositions[fixedKey];
            const px = saved ? saved.x : p.x;
            const py = saved ? saved.y : p.y;
            const selCls = state.decorateMode && state.pickedDecorId === fixedKey ? "is-picked" : "";
            return `<div class="island-prop custom-prop ${selCls}" data-custom-prop="${fixedKey}" style="left:${px}px;top:${py}px;" title="佈置模式可點我自由移動位置"><span class="prop-emoji ${p.cls}">${iconHtml}</span></div>`;
          }
          return `<div class="island-prop" style="left:${p.x}px;top:${p.y}px;"><span class="prop-emoji ${p.cls}">${iconHtml}</span></div>`;
        })
        .join("") + customPropsHtml;

    const quadPathD = QUAD_COORDS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const islandUnits = isl.showUnitPins ? BANK.units.slice(isl.unitStart || 0, isl.unitEnd || 4) : [];
    const pinsHtml = isl.showUnitPins
      ? islandUnits
          .map((unit, localIdx) => {
            const globalIdx = (isl.unitStart || 0) + localIdx;
            const pt = QUAD_COORDS[localIdx] || QUAD_COORDS[0];
            const st = getUnitStats(user, unit.id);
            const statusCls = st.cleared === 10 ? "done" : st.cleared > 0 ? "progress" : "new";
            const shortTitle = unit.title.length > 8 ? unit.title.slice(0, 8) + "…" : unit.title;
            return `
              <button type="button" class="island-pin" data-island-unit="${unit.id}" style="left:${pt.x}px;top:${pt.y}px;" title="第 ${unit.order} 單元：${esc(unit.title)}">
                ${globalIdx === shipIdx ? `<span class="pin-avatar-float">${renderAvatarHtml(user.avatar, "avatar-sm")}</span>` : ""}
                <span class="pin-orb ${statusCls}">${String(unit.order).padStart(2, "0")}</span>
                <span class="pin-label">
                  <strong>${esc(shortTitle)}</strong>
                  <span>★ ${st.stars}/30</span>
                </span>
              </button>
            `;
          })
          .join("")
      : `<div class="sub-island-badge">${isl.title}｜純淨超大空地・點上方「✨ 自由佈置小島」就能把裝飾與 Q 版小人物搬過來！</div>`;

    let rainDropsHtml = "";
    for (let r = 0; r < 28; r++) {
      const leftPct = ((r * 37) % 98) + 1;
      const delay = ((r * 0.17) % 1.4).toFixed(2);
      const dur = (0.75 + (r % 5) * 0.12).toFixed(2);
      rainDropsHtml += `<i class="rain-drop" style="left:${leftPct}%;animation-delay:-${delay}s;animation-duration:${dur}s;"></i>`;
    }

    function makeCuteBirdSvg(bodyColor, wingColor, bellyColor) {
      return `
        <svg viewBox="0 0 80 56" class="bird-svg" aria-hidden="true">
          <!-- 後側展開的羽毛翅膀 -->
          <path class="bird-wing-back" d="M 38 25 C 32 8, 18 4, 12 14 C 17 15, 19 19, 25 23 C 29 26, 34 27, 38 25 Z"
            fill="${wingColor}" stroke="#5A4031" stroke-width="2" stroke-linejoin="round" />
          <!-- 可愛收起的小腳爪 -->
          <path d="M 34 40 L 30 45 M 39 40 L 36 45" stroke="#E08A2B" stroke-width="2.2" stroke-linecap="round" />
          <!-- 一體成形的流線可愛鳥身＋微翹尾羽＋頭頂小呆毛 -->
          <path d="M 16 32 L 5 26 C 7 31, 10 35, 14 36 L 6 39 C 12 40, 17 39, 22 37 C 28 42, 42 43, 50 37 C 56 33, 59 26, 57 19 C 56 14, 52 11, 47 11 C 48 8, 45 6, 43 9 C 40 7, 38 9, 40 12 C 33 14, 29 21, 24 26 C 21 29, 18 31, 16 32 Z"
            fill="${bodyColor}" stroke="#5A4031" stroke-width="2.2" stroke-linejoin="round" />
          <!-- 軟綿綿奶油肚肚 -->
          <path d="M 28 36 C 35 40, 46 39, 52 33 C 49 36, 37 36, 28 36 Z" fill="${bellyColor}" />
          <!-- 前側圓弧羽毛大翅膀（自然上下拍動） -->
          <path class="bird-wing-front" d="M 32 29 C 24 14, 34 5, 43 13 C 45 16, 44 22, 40 27 C 37 30, 34 31, 32 29 Z"
            fill="${wingColor}" stroke="#5A4031" stroke-width="2" stroke-linejoin="round" />
          <!-- 微笑橘黃小嘴 -->
          <path d="M 56 19 L 67 21.5 L 56.5 25 Z" fill="#F2A43B" stroke="#7C4D12" stroke-width="1.8" stroke-linejoin="round" />
          <!-- 水汪汪大眼與高光 -->
          <circle cx="50.5" cy="19.5" r="2.7" fill="#3F2B1D" />
          <circle cx="51.3" cy="18.6" r="1" fill="#FFFFFF" />
          <!-- 粉嫩小腮紅 -->
          <ellipse cx="47.2" cy="24.2" rx="3.2" ry="1.9" fill="#FF8E9E" opacity="0.78" />
        </svg>`;
    }

    const birdYellow = makeCuteBirdSvg("#FFE07D", "#F4B441", "#FFF9E2");
    const birdGreen = makeCuteBirdSvg("#A8E6B8", "#5BB97E", "#EFFCF2");
    const birdPeach = makeCuteBirdSvg("#FFC4BA", "#F08378", "#FFF2EF");

    const skySunSvg = `
      <svg viewBox="0 0 90 90" class="sky-sun-svg" aria-hidden="true">
        <g class="sun-rays-spin" stroke="#FFB830" stroke-width="4" stroke-linecap="round">
          <line x1="45" y1="6" x2="45" y2="16" /><line x1="45" y1="74" x2="45" y2="84" />
          <line x1="6" y1="45" x2="16" y2="45" /><line x1="74" y1="45" x2="84" y2="45" />
          <line x1="17" y1="17" x2="24" y2="24" /><line x1="66" y1="66" x2="73" y2="73" />
          <line x1="73" y1="17" x2="66" y2="24" /><line x1="24" y1="66" x2="17" y2="73" />
        </g>
        <circle cx="45" cy="45" r="22" fill="#FFD55A" stroke="#E5951C" stroke-width="2.6" />
        <circle cx="38" cy="43" r="2.6" fill="#5A4031" /><circle cx="52" cy="43" r="2.6" fill="#5A4031" />
        <circle cx="38.8" cy="42" r="0.9" fill="#FFF" /><circle cx="52.8" cy="42" r="0.9" fill="#FFF" />
        <ellipse cx="33" cy="48" rx="3.4" ry="2" fill="#FF8E9E" opacity="0.72" />
        <ellipse cx="57" cy="48" rx="3.4" ry="2" fill="#FF8E9E" opacity="0.72" />
        <path d="M 38.5 50 Q 45 55.5 51.5 50" fill="none" stroke="#5A4031" stroke-width="2.2" stroke-linecap="round" />
      </svg>`;

    const skyMoonSvg = `
      <svg viewBox="0 0 90 90" class="sky-moon-svg" aria-hidden="true">
        <path d="M 52 16 A 28 28 0 1 0 70 60 A 22 22 0 1 1 52 16 Z" fill="#FFE680" stroke="#D99B26" stroke-width="2.4" stroke-linejoin="round" />
        <circle cx="62" cy="24" r="3" fill="#FFF5C2" />
        <circle cx="72" cy="36" r="2" fill="#FFF5C2" />
      </svg>`;

    const boltSvg = `
      <svg viewBox="0 0 46 84" class="bolt-svg" aria-hidden="true">
        <polygon points="26,2 8,44 22,44 14,82 40,34 25,34" fill="#FFE66D" stroke="#FFFDF5" stroke-width="2.5" stroke-linejoin="round" />
      </svg>`;

    container.innerHTML = `
      <div class="island-sky-sun" aria-hidden="true">${skySunSvg}</div>
      <div class="island-sky-moon" aria-hidden="true">${skyMoonSvg}</div>
      <div class="island-rain-layer" aria-hidden="true">${rainDropsHtml}</div>
      <div class="island-lightning-layer" aria-hidden="true">
        <div class="lightning-flash"></div>
        <span class="lightning-bolt lb1">${boltSvg}</span>
        <span class="lightning-bolt lb2">${boltSvg}</span>
      </div>
      <div class="island-birds-layer" aria-hidden="true">
        <span class="flying-bird b1">${birdYellow}</span>
        <span class="flying-bird b2">${birdGreen}</span>
        <span class="flying-bird b3">${birdPeach}</span>
      </div>
      <div class="island-cloud c1">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud c2">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud c3">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud c4">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud c5">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud c6">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>

      <div class="island-stage">
        <!-- 浮空深層投影（隨小島浮動柔和呼吸） -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-shadow">
          <path d="${islandShape}" fill="#174030" />
        </svg>
        <!-- 浮空島底部錐形岩尖（最深層） -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-cliff-tip">
          <path d="${islandShape}" fill="#4d311c" />
        </svg>
        <!-- 浮空島核心岩盤層（帶暖琥珀岩脈感） -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-cliff-core">
          <path d="${islandShape}" fill="#664428" stroke="#855a36" stroke-width="4" />
        </svg>
        <!-- 深層崖壁厚度 -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-cliff-deep">
          <path d="${islandShape}" fill="#825c3a" />
        </svg>
        <!-- 中層暖土崖壁 -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-cliff-mid">
          <path d="${islandShape}" fill="#ab8054" />
        </svg>
        <!-- 奶油金沙灘層 -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-beach">
          <path d="${islandShape}" fill="${isl.beachFill}" stroke="#fffdf7" stroke-width="5" />
        </svg>
        <!-- 島嶼草坪與主題地貌層 -->
        <svg viewBox="0 0 920 500" class="island-layer island-layer-grass">
          <defs>
            <linearGradient id="isoGrass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${isl.grassA}" />
              <stop offset="100%" stop-color="${isl.grassB}" />
            </linearGradient>
          </defs>
          <path d="${grassShape}" fill="url(#isoGrass)" stroke="${isl.grassStroke}" stroke-width="2.5" />
          ${isl.decorSvg || ""}
          ${
            isl.showUnitPins
              ? `<path d="${quadPathD}" fill="none" stroke="#ebd49f" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
                 <path d="${quadPathD}" fill="none" stroke="#c88934" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="island-path-flow" />`
              : ""
          }
        </svg>

        <!-- 浮空衛星小碎岩（增加浮空島懸浮立體層次） -->
        <span class="floating-pebble p1" aria-hidden="true"></span>
        <span class="floating-pebble p2" aria-hidden="true"></span>
        <span class="floating-pebble p3" aria-hidden="true"></span>

        <!-- 佈置模式點擊感應層（島面精準座標） -->
        <div class="island-drop-plane" title="點選這裡擺放已選擇的裝飾"></div>
        <!-- 立體站立於島上的可愛樹與小屋 -->
        ${propsHtml}
        <!-- 16 座立體單元地標 -->
        ${pinsHtml}
      </div>

      <!-- 前景柔和浮雲（從浮空島前緣輕柔飄過，大幅強化景深立體感） -->
      <div class="island-cloud-fg fg1" aria-hidden="true">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud-fg fg2" aria-hidden="true">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
      <div class="island-cloud-fg fg3" aria-hidden="true">${window.MathIcons ? window.MathIcons.renderIcon("cloud", "svg-cloud-icon") : ""}</div>
    `;

    updateIslandStageTransform();
  }

  function renderUnitsGrid(user) {
    const grid = document.getElementById("units-grid");
    grid.innerHTML = "";
    const filtered = BANK.units.filter((u) => state.activeDomain === "ALL" || u.domain.includes(state.activeDomain));

    filtered.forEach((u) => {
      const st = getUnitStats(user, u.id);
      const card = document.createElement("article");
      card.className = "unit-card";
      card.innerHTML = `
        <div class="unit-card-top">
          <span class="unit-order">第 ${String(u.order).padStart(2, "0")} 單元・50題</span>
          <span class="unit-stars">⭐ ${st.stars}/30 (${st.cleared}/10關)</span>
        </div>
        <h3 class="unit-title">${esc(u.title)}</h3>
        <p class="unit-summary">${esc(u.summary)}</p>
        <div class="unit-meta-row">
          <span class="domain-chip">${esc(u.domain)}</span>
          ${u.curriculumCodes.map((c) => `<span class="code-chip">${c}</span>`).join("")}
        </div>
        <div class="unit-actions">
          <button type="button" class="btn btn-ghost" data-action="lesson" data-unit="${u.id}">📘 看教學</button>
          <button type="button" class="btn btn-gold" data-action="stages" data-unit="${u.id}">🗺️ 10關闖關</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function populateQuickUnitSelect() {
    const sel = document.getElementById("quick-unit-select");
    sel.innerHTML = BANK.units
      .map((u) => `<option value="${u.id}">第 ${String(u.order).padStart(2, "0")} 單元：${u.title}（10關・50題）</option>`)
      .join("");
  }

  // ===========================================================================
  // 3. 單一單元 10 關闖關地圖（不混單元，循序解鎖＋動畫）
  // ===========================================================================
  function openUnitStages(unitId) {
    const u = unitMap.get(unitId);
    const user = currentUser();
    if (!u || !user) return;
    state.currentUnitId = unitId;

    const st = getUnitStats(user, unitId);
    document.getElementById("stages-badges").innerHTML = `
      <span class="unit-order">第 ${String(u.order).padStart(2, "0")} 單元</span>
      <span class="domain-chip">${esc(u.domain)}</span>
      ${u.curriculumCodes.map((c) => `<span class="code-chip">108課綱 ${c}</span>`).join("")}
    `;
    document.getElementById("stages-unit-title").textContent = u.title;
    document.getElementById("stages-unit-summary").textContent = u.summary;
    document.getElementById("stages-unit-stars").textContent = `⭐ ${st.stars} / 30（已通關 ${st.cleared} / 10 關）`;

    const grid = document.getElementById("stages-grid");
    grid.innerHTML = "";

    // 找出目前最高已解鎖關卡（第 1 關永遠解鎖；過第 k 關解鎖 k+1 關）
    let highestUnlocked = 1;
    for (let s = 1; s <= 10; s++) {
      if ((user.stageStars[`${unitId}-s${s}`] || 0) > 0) {
        highestUnlocked = Math.min(10, s + 1);
      }
    }

    for (let s = 1; s <= 10; s++) {
      const stars = user.stageStars[`${unitId}-s${s}`] || 0;
      const unlocked = user.freeUnlock || s <= highestUnlocked;
      const isCurrent = unlocked && stars === 0 && s === highestUnlocked;
      const diffLabel = s <= 4 ? "🌱 基礎關" : s <= 7 ? "🌿 進階關" : "🔥 挑戰關";

      const card = document.createElement("button");
      card.type = "button";
      card.className = `stage-card ${unlocked ? "unlocked" : "locked"} ${isCurrent ? "current-stage" : ""}`;
      card.disabled = !unlocked;
      card.innerHTML = `
        <span class="stage-num-badge">STAGE ${String(s).padStart(2, "0")}</span>
        <div class="stage-icon">${!unlocked ? "🔒" : stars === 3 ? "👑" : stars > 0 ? "🏅" : "🧭"}</div>
        <div class="stage-card-stars">${unlocked ? (stars > 0 ? renderStars(stars) : "☆☆☆") : "尚未解鎖"}</div>
        <span class="stage-diff-pill">${diffLabel}・5題</span>
      `;
      if (unlocked) {
        card.addEventListener("click", () => {
          window.SoundFX.playClick();
          launchStageWithIntro(unitId, s);
        });
      }
      grid.appendChild(card);
    }

    showView("stages", "home");
  }

  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function launchStageWithIntro(unitId, stageNum) {
    const u = unitMap.get(unitId);
    if (!u) return;
    // 依關卡難度分層，從本單元 50 題中隨機抽出 5 題，每次進關都不重複固定順序！
    const targetDiff = stageNum <= 4 ? "基礎" : stageNum <= 7 ? "進階" : "挑戰";
    const tierPool = shuffleArray(u.questions.filter((q) => q.difficulty === targetDiff));
    const otherPool = shuffleArray(u.questions.filter((q) => q.difficulty !== targetDiff));
    const picked = tierPool.concat(otherPool).slice(0, 5);
    const qs = picked.map((q) => ({ ...q, unitId: u.id, unitTitle: u.title, unitOrder: u.order }));

    // 播放精品關卡開場動畫遮罩
    const overlay = document.getElementById("stage-intro-overlay");
    document.getElementById("intro-stage-num").textContent = String(stageNum).padStart(2, "0");
    document.getElementById("intro-unit-title").textContent = `第 ${String(u.order).padStart(2, "0")} 單元：${u.title}`;
    document.getElementById("intro-subtitle").textContent = `第 ${stageNum} 關啟程出發！共 ${qs.length} 題，過關解鎖小禮物 🎁`;
    overlay.classList.remove("hidden");
    window.SoundFX.playCorrect(2);

    setTimeout(() => {
      overlay.classList.add("hidden");
      startQuiz({
        mode: "stage",
        title: `單元 ${String(u.order).padStart(2, "0")}・第 ${stageNum} 關`,
        unitId: u.id,
        stage: stageNum,
        questions: qs
      });
    }, 2880);
  }

  // ===========================================================================
  // 4. 單元教學講義
  // ===========================================================================
  function openLesson(unitId) {
    const u = unitMap.get(unitId);
    if (!u) return;
    state.currentUnitId = unitId;

    document.getElementById("lesson-badges").innerHTML = `
      <span class="unit-order">第 ${String(u.order).padStart(2, "0")} 單元</span>
      <span class="domain-chip">${esc(u.domain)}</span>
      ${u.curriculumCodes.map((c) => `<span class="code-chip">108課綱 ${c}</span>`).join("")}
    `;
    document.getElementById("lesson-title").textContent = u.title;
    document.getElementById("lesson-summary").textContent = u.summary;
    document.getElementById("lesson-keypoints").innerHTML = u.teaching.keyPoints.map((kp) => `<li>${esc(kp)}</li>`).join("");
    document.getElementById("lesson-formulas").innerHTML = u.teaching.formulas.map((fm) => `<div class="formula-item">${esc(fm)}</div>`).join("");
    document.getElementById("lesson-example-problem").textContent = u.teaching.example.problem;
    document.getElementById("lesson-example-steps").innerHTML = u.teaching.example.steps.map((st) => `<li>${esc(st)}</li>`).join("");
    document.getElementById("lesson-example-answer").textContent = u.teaching.example.answer;
    document.getElementById("lesson-mistakes").innerHTML = u.teaching.commonMistakes.map((m) => `<li>${esc(m)}</li>`).join("");
    document.getElementById("lesson-references").textContent = u.references.map((id) => (sourceMap.get(id) ? sourceMap.get(id).name : id)).join(" ／ ");
    showView("lesson", "home");
  }

  // ===========================================================================
  // 5. 互動答題引擎 + 對錯原因雙欄解析 + SVG 圖形化說明
  // ===========================================================================
  function stopQuizTimer() {
    if (state.quiz && state.quiz.timerId) {
      clearInterval(state.quiz.timerId);
      state.quiz.timerId = null;
    }
  }

  function startQuiz({ mode, title, unitId = null, stage = null, questions }) {
    stopQuizTimer();
    if (!questions || questions.length === 0) return;

    // 每次開局隨機打亂題目順序，並隨機打亂選擇題 4 個選項順序（不改動原題庫）
    const randomizedQs = shuffleArray(questions).map((q) => {
      if (q.type === "choice" && Array.isArray(q.options)) {
        return { ...q, options: shuffleArray(q.options) };
      }
      return { ...q };
    });

    state.quiz = {
      mode, title, unitId, stage, questions: randomizedQs,
      index: 0, score: 0, combo: 0, maxCombo: 0, elapsedSeconds: 0,
      timerId: null, answered: false, records: [], recordsByIndex: {}
    };

    document.getElementById("quiz-mode-title").textContent = title;
    document.getElementById("hud-score").textContent = "0";
    document.getElementById("hud-combo").textContent = "0";
    document.getElementById("hud-timer").textContent = "00:00";

    state.quiz.timerId = setInterval(() => {
      if (!state.quiz) return;
      state.quiz.elapsedSeconds += 1;
      document.getElementById("hud-timer").textContent = formatTime(state.quiz.elapsedSeconds);
    }, 1000);

    showView("quiz");
    renderCurrentQuestion();
  }

  function buildRichExplanationHtml(q, userAnswer, isCorrect) {
    const stepsHtml = Array.isArray(q.kidSteps) && q.kidSteps.length
      ? `<div class="explain-card steps-card">
           <h5>🪜 解題一步一步來</h5>
           <ol>${q.kidSteps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
         </div>`
      : "";

    const okHtml = `
      <div class="explain-card ok-card">
        <h5>✅ 為什麼「${esc(q.answer)}」是對的？</h5>
        <p style="margin:0;font-size:0.94rem;">${esc(q.whyCorrect || q.explanation)}</p>
      </div>
    `;

    let badItemsHtml = "";
    if (q.type === "choice" && q.whyWrong && typeof q.whyWrong === "object") {
      const entries = Object.entries(q.whyWrong);
      // 若學生選錯，把自己選的那個選項排在第一項並特別高亮！
      entries.sort((a, b) => (a[0] === userAnswer ? -1 : b[0] === userAnswer ? 1 : 0));
      badItemsHtml = `<ul>${entries
        .map(([opt, reason]) => {
          const pickedTag = !isCorrect && opt === userAnswer ? `<strong>【你選的】</strong> ` : "";
          return `<li>${pickedTag}<strong>「${esc(opt)}」為什麼不對：</strong>${esc(reason)}</li>`;
        })
        .join("")}</ul>`;
    } else if (Array.isArray(q.whyWrong) && q.whyWrong.length) {
      badItemsHtml = `<ul>${q.whyWrong.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>`;
    }

    const badHtml = badItemsHtml
      ? `<div class="explain-card bad-card">
           <h5>❌ 為什麼會算錯／其他選項為什麼不對？</h5>
           ${badItemsHtml}
         </div>`
      : "";

    const visualHtml = q.visual && window.MathVisual ? window.MathVisual.render(q.visual) : "";

    return `
      <div class="explain-blocks">
        ${stepsHtml}
        ${okHtml}
        ${badHtml}
      </div>
      ${visualHtml}
      <div class="explain-source">📚 題目出處：${esc(q.source)}</div>
    `;
  }

  // 產生「不爆雷」的解題思考方向提示（絕不洩漏答案）
  const CODE_HINTS = {
    "N-3-1": "先分辨「千位、百位、十位、個位」的位置！中間沒出現的位數要補 0，比較大小時先比位數、再從最高位比。",
    "N-3-2": "列直式時一定要把「個位對齊個位、十位對齊十位」，加法滿 10 要進位，減法不夠減記得往前一位借 1 當 10！",
    "N-3-3": "把多步驟問題拆成兩段：先找出「第一件事」要加還是減，算出中間結果後，再算第二步驟！",
    "N-3-4": "用直式乘法時，從個位開始依序乘上去，每次乘完記得加上前一位進上來的數字喔！",
    "N-3-5": "先想想「總數」要平分成幾份、或是每幾個裝成一袋，用九九乘法口訣找最接近但不超過的商，別忘了檢查餘數要比除數小！",
    "N-3-6": "利用「乘除互逆」：乘法算式可以反推成除法，除法算式可以用「商 × 除數＋餘數＝被除數」來驗算！",
    "N-3-7": "一步一步拆開算：先看清楚「每組有幾個、共有幾組」用乘法或除法，再決定最後要加還是減！",
    "N-3-8": "先讀清楚題目要「先加再算」還是「先算乘除」，記得把括號或先發生的步驟算完再往下一步！",
    "N-3-9": "看清楚分母（總共平分成幾等份）和分子（拿了幾份）；同分母加減時「分母不變，只把分子相加或相減」喔！",
    "N-3-10": "一位小數就是十分之幾！加減時記得「小數點要對齊小數點」，比大小先比整數部分，再比十分位！",
    "N-3-11": "數線往右邊變大、往左邊變小；先看相鄰兩格之間「每一小格代表多少」，再往目標方向數過去！",
    "N-3-12": "先統一單位再計算！牢記 1 公尺＝100 公分、1 公分＝10 毫米，看清楚題目最後問的是哪一種單位！",
    "N-3-13": "牢記長度換算 1 公里＝1000 公尺；比長短或加減前，先把公里和公尺換算成相同單位再算！",
    "N-3-14": "面積是「裡面有幾個 1 平方公分的小方格」，可以一格一格數，或是把兩個半格拼成 1 個完整方格喔！",
    "N-3-15": "牢記容量換算 1 公升＝1000 毫升；看量杯刻度時先確認「一小格代表多少毫升」再讀數！",
    "N-3-16": "牢記重量換算 1 公斤＝1000 公克；看秤面指針時先數清楚一大格分成幾小格，加減前先對齊單位！",
    "N-3-17": "時間是 60 進位！1 日＝24 小時、1 小時＝60 分鐘、1 分鐘＝60 秒，跨越整點時可以分段計算喔！",
    "S-3-1": "直角像書本的角一樣方方正正（90°）；比直角張得更小是銳角，張得更大是鈍角！",
    "S-3-2": "正方形 4 條邊一樣長、4 個角都是直角；長方形對邊一樣長、4 個角都是直角！",
    "S-3-3": "圓心到圓周的距離是「半徑」，通過圓心兩端在圓周上是「直徑」，牢記：直徑＝半徑 × 2！",
    "S-3-4": "仔細觀察圖形的邊長與頂點關係，可以在草稿紙上畫出草圖標上數字會更清楚喔！",
    "R-3-1": "先用「反推」想一想：原本的數經過加、減、乘或除之後變成現在的數，倒著算回去就能找到未知數！",
    "R-3-2": "找規律時，先看「相鄰兩個數相差多少」，或是數清楚「幾個一組不斷重複」，再用除法看餘數！",
    "D-3-1": "看統計表時，先用手指對準橫列（項目）和直欄（類別）交叉的那一格，再決定要相加還是相減！"
  };

  function buildSafeHint(q) {
    const ansRaw = String(q.answer || "").trim();
    const ansNorm = normalizeInput(ansRaw);
    const leaksAnswer = (text) => {
      if (!text) return true;
      if (ansRaw && ansRaw.length >= 2 && text.includes(ansRaw)) return true;
      if (ansNorm && ansNorm.length >= 2 && text.includes(ansNorm)) return true;
      if (/[=＝]\s*\d/.test(text) || /答案|所以是|就是|等於\s*\d/.test(text)) return true;
      return false;
    };

    if (Array.isArray(q.kidSteps) && q.kidSteps.length > 0) {
      const first = String(q.kidSteps[0]).trim();
      if (first && !leaksAnswer(first)) {
        return first + "（試著照這個方向自己算算看，也可以打開「✏️ 草稿紙」列直式喔！）";
      }
    }
    if (q.curriculumCode && CODE_HINTS[q.curriculumCode]) {
      return CODE_HINTS[q.curriculumCode];
    }
    return "先把題目裡的關鍵數字和單位圈起來，想想看這題要用加、減、乘還是除，打開「✏️ 草稿紙」畫圖或列直式會更好懂喔！";
  }

  function updateQuizNavRow() {
    const quiz = state.quiz;
    if (!quiz) return;
    const total = quiz.questions.length;
    const answeredCount = Object.keys(quiz.recordsByIndex || {}).length;
    const prevBtn = document.getElementById("btn-prev-question");
    const nextBtn = document.getElementById("btn-skip-next-question");
    const statusEl = document.getElementById("quiz-nav-status");
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.opacity = quiz.index === 0 ? "0.65" : "1";
    }
    if (statusEl) statusEl.textContent = `第 ${quiz.index + 1} / ${total} 題（已作答 ${answeredCount} / ${total} 題）`;
    if (nextBtn) {
      if (quiz.index === total - 1) {
        nextBtn.textContent = answeredCount === total ? "查看結算成績 🏆" : "檢查未作答題目 →";
      } else {
        nextBtn.textContent = "下一題 →";
      }
    }
  }

  function renderCurrentQuestion() {
    const quiz = state.quiz;
    const q = quiz.questions[quiz.index];
    const existingRec = quiz.recordsByIndex ? quiz.recordsByIndex[quiz.index] : null;
    quiz.answered = Boolean(existingRec);
    if (window.SpeechFX) window.SpeechFX.stop();
    if (window.MathExtrasClearPad) window.MathExtrasClearPad();

    const hintBox = document.getElementById("quiz-hint-box");
    const hintBtn = document.getElementById("btn-toggle-hint");
    if (hintBox) hintBox.classList.add("hidden");
    if (hintBtn) hintBtn.textContent = "💡 解題提示";

    const total = quiz.questions.length;
    const answeredCount = Object.keys(quiz.recordsByIndex || {}).length;
    document.getElementById("quiz-progress-text").textContent = `第 ${quiz.index + 1} / ${total} 題`;
    document.getElementById("quiz-progress-bar").style.width = `${(answeredCount / total) * 100}%`;

    const card = document.getElementById("quiz-card");
    card.classList.remove("fx-correct", "fx-wrong");
    // 重新觸發滑入動畫
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";

    document.getElementById("q-unit-tag").textContent = `單元 ${String(q.unitOrder).padStart(2, "0")}・${q.unitTitle}`;
    document.getElementById("q-diff-tag").textContent = `難度：${q.difficulty}`;
    document.getElementById("q-code-tag").textContent = `課綱 ${q.curriculumCode}`;
    document.getElementById("q-type-tag").textContent = q.questionVisual ? "🖼️ 圖形 SVG 題" : (q.type === "choice" ? "選擇題" : "填空／計算題");
    document.getElementById("q-text").textContent = q.question;

    // 題目 SVG 圖形區
    const qVisualSlot = document.getElementById("question-visual-slot");
    if (q.questionVisual && window.MathVisual) {
      qVisualSlot.innerHTML = window.MathVisual.render(q.questionVisual, { isQuestion: true });
      qVisualSlot.classList.remove("hidden");
    } else {
      qVisualSlot.innerHTML = "";
      qVisualSlot.classList.add("hidden");
    }

    const choiceArea = document.getElementById("choice-area");
    const inputArea = document.getElementById("input-area");
    const feedbackBox = document.getElementById("feedback-box");
    feedbackBox.classList.add("hidden");
    feedbackBox.classList.remove("correct", "wrong");

    if (q.type === "choice") {
      choiceArea.classList.remove("hidden");
      inputArea.classList.add("hidden");
      choiceArea.innerHTML = "";
      const letters = ["A", "B", "C", "D"];
      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.dataset.value = opt;
        btn.innerHTML = `<span class="choice-letter">${letters[i] || i + 1}</span><span>${esc(opt)}</span>`;
        btn.addEventListener("click", (ev) => handleAnswerSubmit(opt, ev.clientX, ev.clientY));
        choiceArea.appendChild(btn);
      });
    } else {
      choiceArea.classList.add("hidden");
      inputArea.classList.remove("hidden");
      const inputEl = document.getElementById("answer-input");
      inputEl.value = "";
      inputEl.disabled = false;
      document.getElementById("btn-submit-input").disabled = false;
      setTimeout(() => inputEl.focus(), 60);
    }

    document.getElementById("btn-next-question").textContent =
      quiz.index === total - 1 ? "查看結算成績與過關小禮物 🏆" : "下一題 →";

    // 若此題先前已作答，切回來時完整還原對錯標記與圖解解析
    if (existingRec) {
      if (q.type === "choice") {
        document.querySelectorAll("#choice-area .choice-btn").forEach((btn) => {
          btn.disabled = true;
          if (btn.dataset.value === q.answer) btn.classList.add("is-correct");
          else if (btn.dataset.value === existingRec.userAnswer && !existingRec.isCorrect) btn.classList.add("is-wrong");
        });
      } else {
        const inputEl = document.getElementById("answer-input");
        inputEl.value = existingRec.userAnswer;
        inputEl.disabled = true;
        document.getElementById("btn-submit-input").disabled = true;
      }
      feedbackBox.classList.remove("hidden");
      feedbackBox.classList.add(existingRec.isCorrect ? "correct" : "wrong");
      document.getElementById("feedback-icon").textContent = existingRec.isCorrect ? "🎉" : "💡";
      document.getElementById("feedback-title").textContent = existingRec.isCorrect
        ? "此題已答對！可以再複習一次圖解："
        : "此題先前答錯，可以再複習一次正確圖解：";
      document.getElementById("feedback-answer-line").textContent = existingRec.isCorrect
        ? `正確答案：${q.answer}（得分 +${existingRec.gained}）`
        : `你的答案：${existingRec.userAnswer}　｜　正確答案：${q.answer}`;
      document.getElementById("feedback-rich-body").innerHTML = buildRichExplanationHtml(q, existingRec.userAnswer, existingRec.isCorrect);
    }

    updateQuizNavRow();
  }

  function handleAnswerSubmit(rawAns, fxX = window.innerWidth / 2, fxY = window.innerHeight * 0.4) {
    const quiz = state.quiz;
    const user = currentUser();
    if (!quiz || quiz.answered || !user) return;

    const q = quiz.questions[quiz.index];
    const userAnswer = q.type === "input" ? normalizeInput(rawAns) : String(rawAns);
    if (!userAnswer) {
      document.getElementById("answer-input").focus();
      return;
    }

    quiz.answered = true;
    const expected = q.type === "input" ? normalizeInput(q.answer) : String(q.answer);
    const isCorrect = userAnswer === expected;

    // 錯題本更新
    const mIdx = user.mistakes.indexOf(q.id);
    if (!isCorrect && mIdx === -1) {
      user.mistakes.push(q.id);
      saveStore();
    } else if (isCorrect && mIdx !== -1 && quiz.mode === "mistakes") {
      user.mistakes.splice(mIdx, 1);
      saveStore();
    }

    let gained = 0;
    if (isCorrect) {
      quiz.combo += 1;
      quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo);
      gained = 100 + Math.min((quiz.combo - 1) * 20, 100);
      quiz.score += gained;
      if (window.MathSuper) window.MathSuper.recordEvent("correct", 1);
    } else {
      quiz.combo = 0;
    }

    const recObj = { question: q, userAnswer, isCorrect, gained };
    quiz.recordsByIndex[quiz.index] = recObj;
    quiz.records = quiz.questions.map((_, idx) => quiz.recordsByIndex[idx]).filter(Boolean);

    document.getElementById("hud-score").textContent = String(quiz.score);
    document.getElementById("hud-combo").textContent = String(quiz.combo);
    document.getElementById("quiz-progress-bar").style.width = `${(quiz.records.length / quiz.questions.length) * 100}%`;
    updateQuizNavRow();

    if (q.type === "choice") {
      document.querySelectorAll("#choice-area .choice-btn").forEach((btn) => {
        btn.disabled = true;
        if (btn.dataset.value === q.answer) btn.classList.add("is-correct");
        else if (btn.dataset.value === userAnswer && !isCorrect) btn.classList.add("is-wrong");
      });
    } else {
      document.getElementById("answer-input").disabled = true;
      document.getElementById("btn-submit-input").disabled = true;
    }

    const card = document.getElementById("quiz-card");
    if (isCorrect) {
      card.classList.add("fx-correct");
      window.SoundFX.playCorrect(quiz.combo);
      window.VisualFX.burstConfetti(fxX, fxY, quiz.combo >= 3 ? 58 : 36);
      if (window.MathPlus && typeof window.MathPlus.showStreakBanner === "function") {
        window.MathPlus.showStreakBanner(quiz.combo);
      }
      window.VisualFX.spawnFloatingText(
        quiz.combo >= 2 ? `答對！+${gained} 🔥${quiz.combo}連擊` : `答對！+${gained}`,
        "#2d5a4c", fxX, Math.max(110, fxY - 18)
      );
    } else {
      card.classList.add("fx-wrong");
      window.SoundFX.playWrong();
      window.VisualFX.spawnFloatingText("沒關係，\n看下面的圖解就懂了 💡", "#a63a3a", window.innerWidth / 2, Math.max(110, fxY - 18));
    }

    const feedbackBox = document.getElementById("feedback-box");
    feedbackBox.classList.remove("hidden");
    feedbackBox.classList.add(isCorrect ? "correct" : "wrong");
    document.getElementById("feedback-icon").textContent = isCorrect ? "🎉" : "💡";
    document.getElementById("feedback-title").textContent = isCorrect
      ? (quiz.combo >= 3 ? `太優秀了！連續答對 ${quiz.combo} 題！` : "答對了！來看看為什麼對與圖解：")
      : "差一點點！來看看為什麼錯和正確圖解：";
    document.getElementById("feedback-answer-line").textContent = isCorrect
      ? `正確答案：${q.answer}（得分 +${gained}）`
      : `你的答案：${userAnswer}　｜　正確答案：${q.answer}`;

    document.getElementById("feedback-rich-body").innerHTML = buildRichExplanationHtml(q, userAnswer, isCorrect);
  }

  function goToPrevQuestion() {
    const quiz = state.quiz;
    if (!quiz) return;
    if (quiz.index <= 0) {
      window.SoundFX.playClick();
      window.VisualFX.spawnFloatingText("已經是第 1 題囉！不能再往前了喔 😊", "#b86b18");
      return;
    }
    window.SoundFX.playClick();
    quiz.index -= 1;
    renderCurrentQuestion();
  }

  function goToNextOrFinish() {
    const quiz = state.quiz;
    if (!quiz) return;
    window.SoundFX.playClick();
    if (quiz.index < quiz.questions.length - 1) {
      quiz.index += 1;
      renderCurrentQuestion();
    } else {
      if (!quiz.recordsByIndex[quiz.index]) {
        window.VisualFX.spawnFloatingText("已經是最後一題囉！作答完就能看成績 🏆", "#b86b18");
        return;
      }
      const firstUnanswered = quiz.questions.findIndex((_, idx) => !quiz.recordsByIndex[idx]);
      if (firstUnanswered !== -1) {
        quiz.index = firstUnanswered;
        renderCurrentQuestion();
        window.VisualFX.spawnFloatingText(`已經是最後一題囉！先帶你補答第 ${firstUnanswered + 1} 題 😊`, "#b86b18");
        return;
      }
      quiz.records = quiz.questions.map((_, idx) => quiz.recordsByIndex[idx]).filter(Boolean);
      finishQuiz();
    }
  }

  // ===========================================================================
  // 6. 結算成績單、儲存歷史記錄與過關小禮物
  // ===========================================================================
  function finishQuiz() {
    stopQuizTimer();
    const quiz = state.quiz;
    const user = currentUser();
    const total = quiz.records.length;
    const correctCount = quiz.records.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);
    const passed = accuracy >= 60;

    let stars = 0;
    let headline = "再加把勁！看懂下面的圖解就能輕鬆過關！";
    if (accuracy === 100) {
      stars = 3;
      headline = "滿分通關！獲得三顆星皇冠榮耀！👑";
    } else if (accuracy >= 80) {
      stars = 3;
      headline = "表現超棒！榮獲三顆星通關！🌟";
    } else if (accuracy >= 60) {
      stars = 2;
      headline = "成功過關！解鎖過關小禮物！🎁";
    } else if (correctCount > 0) {
      stars = 1;
    }

    // 寫入單元關卡星等（需至少 60% 才算通關解鎖下一關）
    let triggeredGrandSlam = false;
    if (quiz.mode === "stage" && quiz.unitId && quiz.stage && passed) {
      const key = `${quiz.unitId}-s${quiz.stage}`;
      const prev = user.stageStars[key] || 0;
      if (stars > prev) user.stageStars[key] = stars;
      // 檢查是否剛達成「160 關全破隱藏大彩蛋」！
      const clearedAll = Object.values(user.stageStars).filter((s) => s > 0).length;
      if (clearedAll >= 160 && !user.grandSlamClaimed) {
        user.grandSlamClaimed = true;
        user.coins = (user.coins || 0) + 500;
        triggeredGrandSlam = true;
      }
    } else if (quiz.mode === "original" && quiz.unitId && passed) {
      if (!user.originalStars) user.originalStars = {};
      const prev = user.originalStars[quiz.unitId] || 0;
      if (stars > prev) user.originalStars[quiz.unitId] = stars;
    }

    // 存入「歷史答題記錄」（最多保留最近 60 筆）
    if (window.MathSuper) window.MathSuper.recordEvent("stage", 1);
    user.history.unshift({
      id: "h_" + Date.now(),
      date: new Date().toLocaleString("zh-TW", { hour12: false }),
      title: quiz.title,
      unitId: quiz.unitId,
      stage: quiz.stage,
      score: quiz.score,
      correct: correctCount,
      total,
      accuracy,
      stars: passed ? stars : 0,
      elapsedSeconds: quiz.elapsedSeconds,
      items: quiz.records.map((r) => ({
        qid: r.question.id,
        userAnswer: r.userAnswer,
        isCorrect: r.isCorrect
      }))
    });
    if (user.history.length > 60) user.history.length = 60;
    saveStore();
    refreshAllHomeUI();

    // 渲染結算畫面
    document.getElementById("result-stars").textContent = passed ? renderStars(stars) : "☆☆☆";
    document.getElementById("result-headline").textContent = headline;
    document.getElementById("res-score").textContent = String(quiz.score);
    document.getElementById("res-correct").textContent = `${correctCount} / ${total}`;
    document.getElementById("res-accuracy").textContent = `${accuracy}%`;
    document.getElementById("res-max-combo").textContent = `${quiz.maxCombo} 連擊`;
    document.getElementById("res-time").textContent = formatTime(quiz.elapsedSeconds);

    // 過關小禮物橫幅（每次過關重置為可選 1 款）
    quiz.giftUsed = false;
    document.getElementById("reward-gift-banner").classList.toggle("hidden", !passed);
    document.getElementById("gift-banner-title").textContent = "恭喜過關！獲得「過關小禮物」1 次！";
    document.getElementById("gift-banner-desc").textContent = "【規則】每次過關只能從以下 20 款小遊戲中「任選 1 款」玩一次，選好就出發賺金幣吧！";
    document.querySelectorAll("button[data-play-mg]").forEach((b) => {
      b.disabled = false;
      b.style.opacity = "";
    });

    // 下一關按鈕
    const nextStageBtn = document.getElementById("btn-next-stage");
    const hasNext = quiz.mode === "stage" && passed && quiz.stage < 10;
    nextStageBtn.classList.toggle("hidden", !hasNext);

    const wrongRecords = quiz.records.filter((r) => !r.isCorrect);
    document.getElementById("btn-retry-wrong").classList.toggle("hidden", wrongRecords.length === 0);

    state.reviewFilter = "ALL";
    document.getElementById("btn-filter-all").classList.add("active");
    document.getElementById("btn-filter-wrong").classList.remove("active");
    renderReviewList();

    showView("result");
    window.SoundFX.playFanfare(passed ? stars : 1);
    if (passed) window.VisualFX.celebrationRain();

    if (triggeredGrandSlam) {
      const gsModal = document.getElementById("grand-slam-modal");
      const gsSlot = document.getElementById("grand-slam-badge-slot");
      if (gsSlot && window.MathIcons) {
        gsSlot.innerHTML = window.MathIcons.renderIcon("badge_grand_slam", "");
      }
      if (gsModal) {
        gsModal.classList.remove("hidden");
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti(window.innerWidth * 0.25, window.innerHeight * 0.3, 85);
        setTimeout(() => window.VisualFX.burstConfetti(window.innerWidth * 0.75, window.innerHeight * 0.28, 85), 450);
        setTimeout(() => window.VisualFX.burstConfetti(window.innerWidth * 0.5, window.innerHeight * 0.22, 110), 900);
      }
    }
  }

  function renderReviewCardsHtml(records) {
    return records
      .map((rec, i) => {
        const q = rec.question;
        return `
          <article class="review-item ${rec.isCorrect ? "is-correct" : "is-wrong"}">
            <div class="review-item-top">
              <div class="question-meta" style="margin-bottom:0;">
                <span class="meta-tag tag-unit">第 ${i + 1} 題・${esc(q.unitTitle)}</span>
                <span class="meta-tag tag-diff">${esc(q.difficulty)}</span>
                <span class="meta-tag tag-code">${esc(q.curriculumCode)}</span>
              </div>
              <span class="review-status ${rec.isCorrect ? "ok" : "bad"}">${rec.isCorrect ? "✓ 答對" : "✕ 答錯"}</span>
            </div>
            <p class="review-question">${esc(q.question)}</p>
            <div class="review-answers">
              <span>你的作答：<strong style="color:${rec.isCorrect ? "var(--forest-dark)" : "var(--burgundy-dark)"}">${esc(rec.userAnswer)}</strong></span>
              <span>正確答案：<strong style="color:var(--forest-dark)">${esc(q.answer)}</strong></span>
            </div>
            ${buildRichExplanationHtml(q, rec.userAnswer, rec.isCorrect)}
          </article>
        `;
      })
      .join("");
  }

  function renderReviewList() {
    const container = document.getElementById("review-list");
    const quiz = state.quiz;
    if (!quiz) return;
    const list = state.reviewFilter === "WRONG" ? quiz.records.filter((r) => !r.isCorrect) : quiz.records;
    if (list.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--forest);font-weight:900;padding:18px;">🎉 太棒了！本次測驗全對，沒有錯題！</p>`;
      return;
    }
    container.innerHTML = renderReviewCardsHtml(list);
  }

  // ===========================================================================
  // 7. 3D 翻轉數學名詞字卡館
  // ===========================================================================
  function initGlossaryFilter() {
    const sel = document.getElementById("glossary-unit-filter");
    sel.innerHTML = `<option value="ALL">全部單元數學名詞（${GLOSSARY.length} 張）</option>` +
      BANK.units.map((u) => `<option value="${u.id}">第 ${String(u.order).padStart(2, "0")} 單元：${u.title}</option>`).join("");
  }

  function renderGlossary() {
    const user = currentUser();
    if (!user) return;
    const filterUnit = document.getElementById("glossary-unit-filter").value;
    const list = GLOSSARY.filter((g) => filterUnit === "ALL" || g.unitId === filterUnit);
    document.getElementById("glossary-mastered-count").textContent = `${user.masteredTerms.length} / ${GLOSSARY.length}`;

    const grid = document.getElementById("glossary-grid");
    grid.innerHTML = "";
    list.forEach((g) => {
      const mastered = user.masteredTerms.includes(g.id);
      const scene = document.createElement("div");
      scene.className = "flashcard-scene";
      scene.innerHTML = `
        <div class="flashcard" tabindex="0">
          <div class="flashcard-face flashcard-front">
            <div>
              <span class="fc-unit-tag">${esc(g.unitName)}</span>
              <h3 class="fc-term">${esc(g.term)}</h3>
              <p class="fc-short">${esc(g.shortDef)}</p>
              ${g.visual && window.MathVisual ? window.MathVisual.render(g.visual) : ""}
            </div>
            <div class="fc-actions-bar">
              <button type="button" class="fc-speak-btn" data-speak-side="front" data-idle-label="🔊 聽語音">🔊 聽語音</button>
              <div class="fc-hint">${mastered ? "✅ 已熟記 ｜ " : ""}點卡片翻面 ↻</div>
            </div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div>
              <span class="fc-unit-tag">${esc(g.term)}・詳細解說</span>
              <p class="fc-back-detail">${esc(g.detail)}</p>
              <div class="fc-back-box"><strong>💡 生活例子：</strong>${esc(g.example)}</div>
              <div class="fc-back-box" style="border-left-color:var(--forest);"><strong>🔑 老師口訣：</strong>${esc(g.tip)}</div>
            </div>
            <div class="fc-actions-bar">
              <button type="button" class="fc-speak-btn" data-speak-side="back" data-idle-label="🔊 聽詳細語音">🔊 聽詳細語音</button>
              <button type="button" class="btn btn-ghost btn-sm fc-master-btn ${mastered ? "mastered" : ""}" data-master-id="${g.id}">
                ${mastered ? "✓ 已熟記" : "☆ 標記已熟記"}
              </button>
            </div>
          </div>
        </div>
      `;
      const cardEl = scene.querySelector(".flashcard");
      cardEl.addEventListener("click", (ev) => {
        const sBtn = ev.target.closest("button[data-speak-side]");
        if (sBtn) {
          ev.stopPropagation();
          const side = sBtn.dataset.speakSide;
          const textToRead =
            side === "front"
              ? `${g.term}。${g.shortDef}`
              : `${g.term}。${g.detail} 生活例子：${g.example} 老師口訣：${g.tip}`;
          if (window.SpeechFX) window.SpeechFX.toggle(textToRead, sBtn);
          return;
        }
        const mBtn = ev.target.closest("button[data-master-id]");
        if (mBtn) {
          ev.stopPropagation();
          window.SoundFX.playClick();
          const idx = user.masteredTerms.indexOf(g.id);
          if (idx === -1) user.masteredTerms.push(g.id);
          else user.masteredTerms.splice(idx, 1);
          saveStore();
          renderGlossary();
          return;
        }
        window.SoundFX.playClick();
        cardEl.classList.toggle("flipped");
      });
      grid.appendChild(scene);
    });
  }

  function renderOriginalZone() {
    const user = currentUser();
    const grid = document.getElementById("original-stages-grid");
    if (!grid || !user) return;
    if (!user.originalStars) user.originalStars = {};

    grid.innerHTML = ORIGINAL_STAGES.map((st) => {
      const stars = user.originalStars[st.id] || 0;
      return `
        <article class="unit-card">
          <div class="unit-card-top">
            <span class="unit-order">原創第 ${String(st.order).padStart(2, "0")} 關・20 題</span>
            <span class="unit-stars">${stars > 0 ? renderStars(stars) : "☆☆☆"}</span>
          </div>
          <h3 class="unit-title">${esc(st.title)}</h3>
          <p class="unit-summary">${esc(st.summary)}</p>
          <div style="margin-top:6px;">
            <button type="button" class="btn btn-gold" style="width:100%;" data-start-orig="${st.id}">🚀 開始挑戰這 20 題</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function launchOriginalStage(origId) {
    const st = ORIGINAL_STAGES.find((x) => x.id === origId);
    if (!st) return;
    const overlay = document.getElementById("stage-intro-overlay");
    document.getElementById("intro-stage-num").textContent = String(st.order).padStart(2, "0");
    document.getElementById("intro-unit-title").textContent = st.title;
    document.getElementById("intro-subtitle").textContent = `原創素養挑戰！本關共 20 題，過關解鎖 6 款小遊戲 🎁`;
    overlay.classList.remove("hidden");
    window.SoundFX.playCorrect(2);
    setTimeout(() => {
      overlay.classList.add("hidden");
      startQuiz({
        mode: "original",
        title: `✨ 原創第 ${st.order} 關：${st.title}`,
        unitId: st.id,
        stage: st.order,
        questions: st.questions.slice()
      });
    }, 2880);
  }

  // ===========================================================================
  // 8. 分單元錯題特訓 & 歷史答題記錄館 & 課綱出處
  // ===========================================================================
  function renderMistakesHub() {
    const user = currentUser();
    const listEl = document.getElementById("mistakes-unit-list");
    listEl.innerHTML = "";
    const grouped = new Map();
    user.mistakes.forEach((qid) => {
      const q = questionMap.get(qid);
      if (!q) return;
      if (!grouped.has(q.unitId)) grouped.set(q.unitId, []);
      grouped.get(q.unitId).push(q);
    });

    if (grouped.size === 0) {
      listEl.innerHTML = `<div class="panel-card" style="grid-column:1/-1;text-align:center;box-shadow:none;background:var(--bg-ivory);"><p style="font-weight:900;color:var(--forest);">🎉 目前完全沒有錯題！你可以回到冒險島繼續冒險喔！</p></div>`;
      return;
    }

    BANK.units.forEach((u) => {
      const qs = grouped.get(u.id);
      if (!qs || qs.length === 0) return;
      const card = document.createElement("article");
      card.className = "unit-card";
      card.innerHTML = `
        <div class="unit-card-top">
          <span class="unit-order">第 ${String(u.order).padStart(2, "0")} 單元</span>
          <span class="review-status bad">待複習 ${qs.length} 題</span>
        </div>
        <h3 class="unit-title">${esc(u.title)}</h3>
        <p class="unit-summary">${esc(u.summary)}</p>
        <div class="unit-actions">
          <button type="button" class="btn btn-ghost" data-mistake-lesson="${u.id}">📘 複習教學</button>
          <button type="button" class="btn btn-burgundy" data-mistake-unit="${u.id}">🛠️ 練本單元錯題</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  function renderHistoryView() {
    const user = currentUser();
    const listEl = document.getElementById("history-list");
    if (!user.history || user.history.length === 0) {
      listEl.innerHTML = `<p style="text-align:center;color:var(--muted);padding:24px;font-weight:800;">尚無答題記錄，快去冒險島挑戰第一關吧！</p>`;
      return;
    }
    listEl.innerHTML = user.history
      .map(
        (h) => `
      <div class="history-row">
        <div class="history-meta">
          <h4>${esc(h.title)}</h4>
          <p>📅 ${esc(h.date)} ｜ 答對 ${h.correct}/${h.total} 題（${h.accuracy}%）｜ ⏱️ ${formatTime(h.elapsedSeconds || 0)}</p>
        </div>
        <div class="history-right">
          <span class="unit-stars">${h.stars > 0 ? renderStars(h.stars) : "未通關"}</span>
          <strong>🏆 ${h.score} 分</strong>
          <button type="button" class="btn btn-gold btn-sm" data-open-history="${esc(h.id)}">查看答過的題目 ↗</button>
        </div>
      </div>`
      )
      .join("");
  }

  function openHistoryDetailModal(histId) {
    const user = currentUser();
    const rec = user.history.find((h) => h.id === histId);
    if (!rec) return;
    document.getElementById("hist-modal-title").textContent = `📜 ${rec.title}（${rec.date}）`;
    const hydrated = rec.items
      .map((it) => {
        const q = questionMap.get(it.qid);
        return q ? { question: q, userAnswer: it.userAnswer, isCorrect: it.isCorrect } : null;
      })
      .filter(Boolean);
    document.getElementById("hist-modal-body").innerHTML = renderReviewCardsHtml(hydrated);
    document.getElementById("history-detail-modal").classList.remove("hidden");
  }

  function renderSourcesView() {
    document.getElementById("sources-list").innerHTML = BANK.sources
      .map(
        (s) => `
      <article class="source-card">
        <span class="code-chip" style="align-self:flex-start;">${s.id}</span>
        <h4>${esc(s.name)}</h4>
        <div class="source-org">${esc(s.organization)}</div>
        <p>${esc(s.description)}</p>
        <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">前往官方網站 ↗</a>
      </article>`
      )
      .join("");

    document.getElementById("curriculum-codes-wrap").innerHTML = BANK.metadata.coveredCurriculumCodes
      .map((code) => `<span class="code-badge-lg">${code}</span>`)
      .join("");
  }

  // ===========================================================================
  // 9. 事件綁定
  // ===========================================================================
  function bindEvents() {
    // 登入頁頭像選擇
    document.getElementById("avatar-picker").addEventListener("click", (ev) => {
      const btn = ev.target.closest(".avatar-opt");
      if (!btn) return;
      window.SoundFX.playClick();
      document.querySelectorAll(".avatar-opt").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedAvatar = btn.dataset.avatar;
    });

    // 點擊既有角色登入或刪除角色
    document.getElementById("existing-profiles-list").addEventListener("click", (ev) => {
      const delBtn = ev.target.closest("button[data-delete-uid]");
      if (delBtn) {
        const uid = delBtn.dataset.deleteUid;
        const target = store.users[uid];
        if (!target) return;
        window.SoundFX.playClick();
        if (confirm(`確定要刪除冒險者「${target.name}」的記錄嗎？刪除後將無法復原喔！`)) {
          delete store.users[uid];
          if (store.activeUserId === uid) store.activeUserId = null;
          saveStore();
          renderLoginScreen();
        }
        return;
      }
      const btn = ev.target.closest("button[data-login-uid]");
      if (!btn) return;
      window.SoundFX.playClick();
      loginAs(btn.dataset.loginUid);
    });

    // 建立新角色登入（單機最多 10 位冒險者上限保護）
    document.getElementById("login-form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nameInput = document.getElementById("login-name-input");
      const name = nameInput.value.trim();
      if (!name) return;
      if (Object.keys(store.users || {}).length >= 10) {
        window.SoundFX.playWrong();
        alert("⚠️ 本台裝置最多可建立 10 位冒險者（目前已滿 10 位）！\n請先點擊上方既有角色右上角的「✕」刪除不用的角色，就能建立新冒險者囉！");
        return;
      }
      window.SoundFX.playCorrect(2);
      const id = "u_" + Date.now();
      store.users[id] = createEmptyProfile(id, name, state.selectedAvatar);
      saveStore();
      nameInput.value = "";
      loginAs(id);
    });

    // 切換帳號
    document.getElementById("btn-switch-user").addEventListener("click", () => {
      window.SoundFX.playClick();
      stopQuizTimer();
      renderLoginScreen();
    });

    // 字體大小調節器
    document.querySelectorAll(".fs-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX.playClick();
        applyFontSize(btn.dataset.fs);
      });
    });

    // 背景音樂開關與曲風切換
    const bgmBtn = document.getElementById("btn-bgm-toggle");
    const bgmTrackSel = document.getElementById("bgm-track-select");
    function syncBgmBtnUI(on) {
      if (!bgmBtn) return;
      bgmBtn.setAttribute("aria-pressed", String(on));
      bgmBtn.classList.toggle("is-playing", on);
      const lbl = document.getElementById("bgm-label");
      if (lbl) lbl.textContent = on ? "音樂播放中" : "開啟音樂";
      const bubble = document.getElementById("bgm-hint-bubble");
      if (bubble) bubble.classList.add("hidden");
    }
    if (bgmBtn && window.MathDeluxe) {
      bgmBtn.addEventListener("click", () => {
        const on = window.MathDeluxe.bgm.toggle();
        syncBgmBtnUI(on);
      });
    }
    if (bgmTrackSel && window.MathDeluxe) {
      bgmTrackSel.addEventListener("change", () => {
        window.MathDeluxe.bgm.setTrack(bgmTrackSel.value);
        if (!window.MathDeluxe.bgm.playing) {
          window.MathDeluxe.bgm.start();
        }
        syncBgmBtnUI(true);
      });
    }

    // 音效開關
    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
      const next = soundBtn.getAttribute("aria-pressed") !== "true";
      soundBtn.setAttribute("aria-pressed", String(next));
      window.SoundFX.setEnabled(next);
      document.getElementById("sound-icon").textContent = next ? "🔊" : "🔇";
      const sLbl = document.getElementById("sound-label");
      if (sLbl) sLbl.textContent = next ? "音效開" : "音效關";
      if (next) window.SoundFX.playClick();
    });

    // 頂部導覽
    document.getElementById("btn-go-home").addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); showView("home", "home");
    });
    navBtns.home.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); refreshAllHomeUI(); showView("home", "home");
    });
    if (navBtns.pet) {
      navBtns.pet.addEventListener("click", () => {
        window.SoundFX.playClick(); stopQuizTimer();
        if (window.MathSuper) window.MathSuper.refreshAll();
        showView("pet", "pet");
      });
    }
    if (navBtns.daily) {
      navBtns.daily.addEventListener("click", () => {
        window.SoundFX.playClick(); stopQuizTimer();
        if (window.MathSuper) window.MathSuper.refreshAll();
        if (window.MathPlus) window.MathPlus.refreshAll();
        showView("daily", "daily");
      });
    }
    const petBackBtn = document.getElementById("btn-pet-back");
    if (petBackBtn) {
      petBackBtn.addEventListener("click", () => {
        window.SoundFX.playClick(); refreshAllHomeUI(); showView("home", "home");
      });
    }
    const dailyBackBtn = document.getElementById("btn-daily-back");
    if (dailyBackBtn) {
      dailyBackBtn.addEventListener("click", () => {
        window.SoundFX.playClick(); refreshAllHomeUI(); showView("home", "home");
      });
    }
    navBtns.original.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); renderOriginalZone(); showView("original", "original");
    });
    navBtns.arcade.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer();
      if (window.MathSuper) window.MathSuper.recordEvent("extra", 1);
      if (window.MathDeluxeRefreshBlitz) window.MathDeluxeRefreshBlitz();
      showView("arcade", "arcade");
    });
    navBtns.shop.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer();
      if (window.MathExtras) window.MathExtras.renderShopAndBadges(currentUser(), saveStore, refreshAllHomeUI);
      if (window.MathPro) window.MathPro.refreshAll();
      showView("shop", "shop");
    });
    navBtns.tools.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer();
      if (window.MathExtras) window.MathExtras.renderDiagnosisRadar(currentUser(), questionMap);
      if (window.MathDeluxeDrawCert) window.MathDeluxeDrawCert();
      showView("tools", "tools");
    });
    navBtns.glossary.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); renderGlossary(); showView("glossary", "glossary");
    });
    navBtns.mistakes.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); renderMistakesHub(); showView("mistakesHub", "mistakes");
    });
    navBtns.history.addEventListener("click", () => {
      window.SoundFX.playClick(); stopQuizTimer(); renderHistoryView(); showView("history", "history");
    });
    if (navBtns.sources) {
      navBtns.sources.addEventListener("click", () => {
        window.SoundFX.playClick(); stopQuizTimer(); showView("sources", "sources");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Hero 快速選擇
    document.getElementById("btn-quick-enter-stages").addEventListener("click", () => {
      window.SoundFX.playClick();
      openUnitStages(document.getElementById("quick-unit-select").value);
    });
    document.getElementById("btn-quick-lesson-unit").addEventListener("click", () => {
      window.SoundFX.playClick();
      openLesson(document.getElementById("quick-unit-select").value);
    });

    // 冒險島地圖點擊與滑鼠拖曳旋轉視角事件
    const islandContainer = document.getElementById("island-map-container");
    let isDraggingIsland = false;
    let dragStartX = 0;
    let dragStartRot = 0;
    let dragMoved = false;

    islandContainer.addEventListener("pointerdown", (ev) => {
      dragMoved = false;
      if (state.decorateMode) return;
      if (ev.target.closest(".pin-orb, .pin-label") || ev.target.closest('[data-custom-prop^="char_"]')) return;
      isDraggingIsland = true;
      dragStartX = ev.clientX;
      dragStartRot = islandRotZ;
      const st = islandContainer.querySelector(".island-stage");
      if (st) st.classList.add("dragging");
    });

    window.addEventListener("pointermove", (ev) => {
      if (!isDraggingIsland) return;
      const dx = ev.clientX - dragStartX;
      if (Math.abs(dx) > 5) dragMoved = true;
      islandRotZ = Math.max(-18, Math.min(18, dragStartRot + dx * 0.12));
      updateIslandStageTransform();
    });

    window.addEventListener("pointerup", () => {
      if (!isDraggingIsland) return;
      isDraggingIsland = false;
      const st = islandContainer.querySelector(".island-stage");
      if (st) st.classList.remove("dragging");
      setTimeout(() => { dragMoved = false; }, 0);
    });

    // 滑鼠微幅傾斜視差（桌機滑過浮空島時呈現絲滑景深感；佈置模式與手機不干擾操作）
    islandContainer.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse" || isDraggingIsland || state.decorateMode) return;
      const r = islandContainer.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (ev.clientX - r.left) / r.width - 0.5;
      const ny = (ev.clientY - r.top) / r.height - 0.5;
      islandRotX = Number((48 - ny * 10).toFixed(2));
      islandContainer.style.setProperty("--px", `${(nx * -18).toFixed(1)}px`);
      islandContainer.style.setProperty("--py", `${(ny * -10).toFixed(1)}px`);
      updateIslandStageTransform();
    });

    islandContainer.addEventListener("pointerleave", () => {
      if (isDraggingIsland) return;
      islandRotX = 48;
      islandContainer.style.setProperty("--px", "0px");
      islandContainer.style.setProperty("--py", "0px");
      updateIslandStageTransform();
    });

    islandContainer.addEventListener("click", (ev) => {
      // 自由佈置模式：點選裝飾拿起、點選島面任何位置放下！
      if (state.decorateMode) {
        const user = currentUser();
        if (!user || !window.MathExtras) return;
        window.MathExtras.ensureUserExtras(user);

        const propEl = ev.target.closest("[data-custom-prop]");
        if (propEl) {
          window.SoundFX.playClick();
          state.pickedDecorId = propEl.dataset.customProp;
          renderDecorateTray();
          renderIslandMap(user);
          return;
        }

        const plane = ev.target.closest(".island-drop-plane");
        if (plane && state.pickedDecorId) {
          const x = Math.max(60, Math.min(860, Math.round(ev.offsetX)));
          const y = Math.max(70, Math.min(445, Math.round(ev.offsetY)));
          if (!state.pickedDecorId.startsWith("fixed_") && !user.placedItems.includes(state.pickedDecorId)) {
            user.placedItems.push(state.pickedDecorId);
          }
          user.customPositions[state.pickedDecorId] = {
            island: state.currentIsland || "main",
            x,
            y
          };
          saveStore();
          window.SoundFX.playCorrect(1);
          renderDecorateTray();
          renderIslandMap(user);
          return;
        }
        return;
      }

      // 一般模式點擊 Q 版小人物：跳出對話泡泡並語音朗讀鼓勵話語！
      const charProp = ev.target.closest("[data-custom-prop]");
      if (charProp && !dragMoved && window.MathExtras && window.MathExtras.CHARACTER_QUOTES) {
        const cid = charProp.dataset.customProp;
        const quotes = window.MathExtras.CHARACTER_QUOTES[cid];
        if (quotes && quotes.length > 0) {
          const line = quotes[Math.floor(Math.random() * quotes.length)];
          window.SoundFX.playClick();
          const oldBubble = charProp.querySelector(".char-speech-bubble");
          if (oldBubble) oldBubble.remove();
          const bubble = document.createElement("div");
          bubble.className = "char-speech-bubble";
          bubble.textContent = line;
          charProp.appendChild(bubble);
          if (window.SpeechFX && window.SoundFX && window.SoundFX.enabled) {
            window.SpeechFX.speak(line);
          }
          setTimeout(() => bubble.remove(), 3800);
          return;
        }
      }

      // 嚴格檢查：只有真的點到數字圓球（.pin-orb）或單元名牌（.pin-label）才跳關，旁邊空地與雜物絕不誤觸！
      const hitTarget = ev.target.closest(".pin-orb, .pin-label");
      const node = hitTarget ? hitTarget.closest("[data-island-unit]") : null;
      if (!node || dragMoved) return;
      window.SoundFX.playClick();
      openUnitStages(node.getAttribute("data-island-unit"));
    });

    // 群島切換船票（1~4 號島直接開放；5號島 30星解鎖、6號島 80星解鎖）
    const archBar = document.getElementById("archipelago-bar");
    const unlockToast = document.getElementById("island-unlock-toast");
    let unlockToastTimer = null;
    if (archBar) {
      archBar.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-island-tab]");
        if (!btn) return;
        const u = currentUser();
        const totalStars = u ? Object.values(u.stageStars || {}).reduce((a, b) => a + b, 0) : 0;
        const targetId = btn.dataset.islandTab || "main";
        const cfg = ISLANDS_CONFIG[targetId] || ISLANDS_CONFIG.main;
        const req = cfg.unlockStars || 0;

        if (totalStars < req) {
          window.SoundFX.playWrong();
          if (unlockToast) {
            const need = req - totalStars;
            unlockToast.textContent = `🔒 「${cfg.title}」需要累計 ⭐ ${req} 顆星才能解鎖（目前 ⭐ ${totalStars} 顆，再集 ${need} 顆星就能登島探險囉！）`;
            unlockToast.classList.remove("hidden");
            clearTimeout(unlockToastTimer);
            unlockToastTimer = setTimeout(() => unlockToast.classList.add("hidden"), 4500);
          }
          return;
        }

        if (unlockToast) unlockToast.classList.add("hidden");
        window.SoundFX.playClick();
        state.currentIsland = targetId;
        refreshArchipelagoTickets(totalStars);
        if (state.decorateMode) renderDecorateTray();
        renderIslandMap(u);
      });
    }

    // 自由佈置小島托盤與控制
    function renderDecorateTray() {
      const user = currentUser();
      const tray = document.getElementById("decorate-tray");
      const hint = document.getElementById("decorate-hint");
      if (!tray || !user || !window.MathExtras) return;
      window.MathExtras.ensureUserExtras(user);
      const owned = user.ownedItems
        .map((id) => window.MathExtras.SHOP_ITEMS.find((it) => it.id === id))
        .filter(Boolean);

      const curIsl = ISLANDS_CONFIG[state.currentIsland || "main"] || ISLANDS_CONFIG.main;
      const isFixedPicked = state.pickedDecorId && state.pickedDecorId.startsWith("fixed_");

      if (owned.length === 0 && !isFixedPicked) {
        if (hint) hint.textContent = `✨ 在「${curIsl.title}」可以直接點選島上任何小屋、花草或景觀自由移動（點「↺ 恢復預設位置」可一鍵歸位）！`;
        tray.innerHTML = `<span style="font-size:0.86rem;color:var(--muted);font-weight:800;">點島上任意景觀就能拿起移動！也可以去「🛍️ 商店徽章」買更多裝飾與 Q 版小人物！</span>`;
        return;
      }
      if (!isFixedPicked && (!state.pickedDecorId || !user.ownedItems.includes(state.pickedDecorId))) {
        state.pickedDecorId = owned.length ? owned[0].id : null;
      }
      const pickedObj = owned.find((o) => o.id === state.pickedDecorId);
      if (hint) {
        if (isFixedPicked) {
          hint.textContent = `✨ 已拿起「${curIsl.title}」的島上景觀：請直接點擊島上任何你想搬過去的位置！（點「↺ 恢復預設位置」可一鍵歸位）`;
        } else if (pickedObj) {
          hint.textContent = `✨ 目前在「${curIsl.title}」・已拿起「${pickedObj.name}」：直接點擊島上任何空地即可放下！`;
        }
      }
      tray.innerHTML = owned
        .map((it) => {
          const placedIslId = window.MathExtras.getItemIsland(user, it.id);
          const islShort = (ISLANDS_CONFIG[placedIslId] || ISLANDS_CONFIG.main).shortName;
          return `<button type="button" class="deco-chip ${state.pickedDecorId === it.id ? "active" : ""}" data-pick-decor="${it.id}">${window.MathIcons ? window.MathIcons.renderIcon(it.id, "svg-chip-icon") : it.icon} ${it.name}<em class="deco-isl-tag">${islShort}</em></button>`;
        })
        .join("");
    }

    function setDecorateMode(on) {
      state.decorateMode = Boolean(on);
      const bar = document.getElementById("decorate-bar");
      const toggleBtn = document.getElementById("btn-toggle-decorate");
      islandContainer.classList.toggle("decorate-mode", state.decorateMode);
      bar.classList.toggle("hidden", !state.decorateMode);
      toggleBtn.textContent = state.decorateMode ? "✓ 結束佈置" : "✨ 自由佈置小島";
      if (state.decorateMode) renderDecorateTray();
      renderIslandMap(currentUser());
    }

    document.getElementById("btn-toggle-decorate").addEventListener("click", () => {
      window.SoundFX.playClick();
      setDecorateMode(!state.decorateMode);
    });
    document.getElementById("btn-decorate-done").addEventListener("click", () => {
      window.SoundFX.playClick();
      setDecorateMode(false);
    });
    document.getElementById("btn-decorate-reset").addEventListener("click", () => {
      const u = currentUser();
      if (!u) return;
      window.SoundFX.playClick();
      u.customPositions = {};
      saveStore();
      renderIslandMap(u);
    });
    document.getElementById("decorate-tray").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-pick-decor]");
      if (!btn) return;
      window.SoundFX.playClick();
      state.pickedDecorId = btn.dataset.pickDecor;
      renderDecorateTray();
      renderIslandMap(currentUser());
    });

    document.getElementById("btn-cam-left").addEventListener("click", () => {
      window.SoundFX.playClick();
      islandRotZ = Math.max(-18, islandRotZ - 8);
      updateIslandStageTransform();
    });
    document.getElementById("btn-cam-right").addEventListener("click", () => {
      window.SoundFX.playClick();
      islandRotZ = Math.min(18, islandRotZ + 8);
      updateIslandStageTransform();
    });
    document.getElementById("btn-cam-reset").addEventListener("click", () => {
      window.SoundFX.playClick();
      islandRotZ = -3;
      islandRotX = 48;
      updateIslandStageTransform();
    });
    window.addEventListener("resize", updateIslandStageTransform);

    // 領域篩選 & 單元卡片
    document.querySelectorAll(".filter-bar .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        window.SoundFX.playClick();
        document.querySelectorAll(".filter-bar .filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.activeDomain = chip.dataset.domain;
        renderUnitsGrid(currentUser());
      });
    });

    document.getElementById("units-grid").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-action]");
      if (!btn) return;
      window.SoundFX.playClick();
      if (btn.dataset.action === "lesson") openLesson(btn.dataset.unit);
      else if (btn.dataset.action === "stages") openUnitStages(btn.dataset.unit);
    });

    // 10 關地圖控制
    document.getElementById("btn-stages-back").addEventListener("click", () => {
      window.SoundFX.playClick(); refreshAllHomeUI(); showView("home", "home");
    });
    document.getElementById("btn-stages-to-lesson").addEventListener("click", () => {
      window.SoundFX.playClick(); openLesson(state.currentUnitId);
    });
    document.getElementById("chk-free-unlock").addEventListener("change", (ev) => {
      const u = currentUser();
      if (!u) return;
      u.freeUnlock = ev.target.checked;
      saveStore();
      openUnitStages(state.currentUnitId);
    });

    // 教學講義按鈕
    document.getElementById("btn-lesson-back").addEventListener("click", () => {
      window.SoundFX.playClick(); showView("home", "home");
    });
    const toStages = () => { window.SoundFX.playClick(); openUnitStages(state.currentUnitId); };
    document.getElementById("btn-lesson-start-stages").addEventListener("click", toStages);
    document.getElementById("btn-lesson-start-stages-bottom").addEventListener("click", toStages);

    // 測驗控制
    document.getElementById("btn-quiz-exit").addEventListener("click", () => {
      if (confirm("確定要離開本關卡嗎？")) {
        stopQuizTimer();
        openUnitStages(state.currentUnitId);
      }
    });

    const inputEl = document.getElementById("answer-input");
    document.getElementById("btn-submit-input").addEventListener("click", (ev) => {
      handleAnswerSubmit(inputEl.value, ev.clientX, ev.clientY);
    });
    inputEl.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        if (state.quiz && state.quiz.answered) goToNextOrFinish();
        else {
          const r = inputEl.getBoundingClientRect();
          handleAnswerSubmit(inputEl.value, r.left + r.width / 2, r.top);
        }
      }
    });

    document.getElementById("btn-next-question").addEventListener("click", goToNextOrFinish);
    document.getElementById("btn-prev-question").addEventListener("click", goToPrevQuestion);
    document.getElementById("btn-skip-next-question").addEventListener("click", goToNextOrFinish);
    document.getElementById("btn-toggle-hint").addEventListener("click", () => {
      const quiz = state.quiz;
      if (!quiz) return;
      window.SoundFX.playClick();
      const box = document.getElementById("quiz-hint-box");
      const txt = document.getElementById("quiz-hint-text");
      const btn = document.getElementById("btn-toggle-hint");
      if (!box || !txt) return;
      if (box.classList.contains("hidden")) {
        txt.textContent = buildSafeHint(quiz.questions[quiz.index]);
        box.classList.remove("hidden");
        if (btn) btn.textContent = "💡 收起提示";
      } else {
        box.classList.add("hidden");
        if (btn) btn.textContent = "💡 解題提示";
      }
    });

    // 結算按鈕 & 過關小禮物迷你遊戲
    document.getElementById("btn-next-stage").addEventListener("click", () => {
      window.SoundFX.playClick();
      if (state.quiz && state.quiz.unitId && state.quiz.stage < 10) {
        launchStageWithIntro(state.quiz.unitId, state.quiz.stage + 1);
      }
    });
    document.getElementById("btn-retry-quiz").addEventListener("click", () => {
      window.SoundFX.playClick();
      if (!state.quiz) return;
      if (state.quiz.mode === "stage") launchStageWithIntro(state.quiz.unitId, state.quiz.stage);
      else startQuiz({ ...state.quiz, questions: state.quiz.questions });
    });
    document.getElementById("btn-retry-wrong").addEventListener("click", () => {
      window.SoundFX.playClick();
      if (!state.quiz) return;
      const wrongQs = state.quiz.records.filter((r) => !r.isCorrect).map((r) => r.question);
      startQuiz({ mode: "mistakes", title: `🛠️ 錯題重練（${wrongQs.length} 題）`, unitId: state.quiz.unitId, questions: wrongQs });
    });
    document.getElementById("btn-result-stages").addEventListener("click", () => {
      window.SoundFX.playClick();
      openUnitStages(state.currentUnitId);
    });

    document.getElementById("btn-filter-all").addEventListener("click", () => {
      window.SoundFX.playClick(); state.reviewFilter = "ALL";
      document.getElementById("btn-filter-all").classList.add("active");
      document.getElementById("btn-filter-wrong").classList.remove("active");
      renderReviewList();
    });
    document.getElementById("btn-filter-wrong").addEventListener("click", () => {
      window.SoundFX.playClick(); state.reviewFilter = "WRONG";
      document.getElementById("btn-filter-wrong").classList.add("active");
      document.getElementById("btn-filter-all").classList.remove("active");
      renderReviewList();
    });

    // 過關小遊戲彈窗（每次過關僅限挑選 1 款遊玩一次）
    document.querySelectorAll("button[data-play-mg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.quiz && state.quiz.giftUsed) return;
        if (state.quiz) state.quiz.giftUsed = true;
        // 立刻鎖定全部 6 顆小遊戲按鈕，確保本次過關只能玩這 1 款
        document.querySelectorAll("button[data-play-mg]").forEach((b) => {
          b.disabled = true;
          b.style.opacity = b === btn ? "1" : "0.45";
        });
        document.getElementById("gift-banner-title").textContent = "✅ 本次過關小禮物已使用！";
        document.getElementById("gift-banner-desc").textContent = "每次過關限選 1 款小遊戲喔！再闖過下一關就能再挑 1 款來玩！";

        window.SoundFX.playClick();
        const modal = document.getElementById("minigame-modal");
        const stageEl = document.getElementById("minigame-stage");
        const resEl = document.getElementById("minigame-result");
        resEl.classList.add("hidden");
        modal.classList.remove("hidden");
        window.MiniGames.start(btn.dataset.playMg, stageEl, (earnedCoins, gameName) => {
          const u = currentUser();
          if (u) {
            u.coins = (u.coins || 0) + earnedCoins;
            saveStore();
            refreshAllHomeUI();
          }
          resEl.innerHTML = `🎉 太好玩了！你在「${gameName}」贏得了 <strong>🪙 +${earnedCoins} 閃亮金幣</strong>（已自動存入帳號）！`;
          resEl.classList.remove("hidden");
        });
      });
    });

    document.getElementById("btn-close-mg").addEventListener("click", () => {
      window.MiniGames.stop();
      document.getElementById("minigame-modal").classList.add("hidden");
    });

    // 字卡、錯題、歷史、出處返回與互動
    document.getElementById("btn-arcade-back").addEventListener("click", () => {
      window.SoundFX.playClick();
      if (window.MathDeluxeStopGames) window.MathDeluxeStopGames();
      refreshAllHomeUI();
      showView("home", "home");
    });
    document.getElementById("btn-original-back").addEventListener("click", () => { window.SoundFX.playClick(); refreshAllHomeUI(); showView("home", "home"); });
    document.getElementById("original-stages-grid").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-start-orig]");
      if (!btn) return;
      window.SoundFX.playClick();
      launchOriginalStage(btn.dataset.startOrig);
    });

    document.getElementById("btn-shop-back").addEventListener("click", () => { window.SoundFX.playClick(); refreshAllHomeUI(); showView("home", "home"); });
    document.getElementById("btn-tools-back").addEventListener("click", () => { window.SoundFX.playClick(); showView("home", "home"); });
    document.getElementById("btn-read-question").addEventListener("click", (ev) => {
      if (!state.quiz || !window.SpeechFX) return;
      const q = state.quiz.questions[state.quiz.index];
      let speechText = q.question;
      if (q.type === "choice" && Array.isArray(q.options)) {
        const letters = ["A", "B", "C", "D"];
        speechText += "。選項有：" + q.options.map((o, i) => `${letters[i]}，${o}`).join("；");
      }
      window.SpeechFX.toggle(speechText, ev.currentTarget);
    });

    document.getElementById("glossary-unit-filter").addEventListener("change", renderGlossary);
    document.getElementById("btn-glossary-back").addEventListener("click", () => { window.SoundFX.playClick(); showView("home", "home"); });
    document.getElementById("btn-mistakes-back").addEventListener("click", () => { window.SoundFX.playClick(); showView("home", "home"); });
    document.getElementById("btn-history-back").addEventListener("click", () => { window.SoundFX.playClick(); showView("home", "home"); });
    document.getElementById("btn-sources-back").addEventListener("click", () => { window.SoundFX.playClick(); showView("home", "home"); });

    document.getElementById("mistakes-unit-list").addEventListener("click", (ev) => {
      const lBtn = ev.target.closest("button[data-mistake-lesson]");
      if (lBtn) { window.SoundFX.playClick(); openLesson(lBtn.dataset.mistakeLesson); return; }
      const qBtn = ev.target.closest("button[data-mistake-unit]");
      if (qBtn) {
        window.SoundFX.playClick();
        const uid = qBtn.dataset.mistakeUnit;
        const u = unitMap.get(uid);
        const user = currentUser();
        const qs = user.mistakes.map((id) => questionMap.get(id)).filter((q) => q && q.unitId === uid);
        startQuiz({ mode: "mistakes", title: `🛠️ 錯題特訓｜${u.title}`, unitId: uid, questions: qs });
      }
    });

    document.getElementById("history-list").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-open-history]");
      if (!btn) return;
      window.SoundFX.playClick();
      openHistoryDetailModal(btn.dataset.openHistory);
    });
    const gsClose = document.getElementById("btn-close-grand-slam");
    const gsModalEl = document.getElementById("grand-slam-modal");
    if (gsClose && gsModalEl) {
      gsClose.addEventListener("click", () => {
        window.SoundFX.playClick();
        gsModalEl.classList.add("hidden");
      });
    }

    document.getElementById("btn-close-hist-modal").addEventListener("click", () => {
      document.getElementById("history-detail-modal").classList.add("hidden");
    });

    // 星星、金幣與闖關規則說明彈窗
    const rulesModal = document.getElementById("rules-modal");
    const openRulesBtn = document.getElementById("btn-open-rules");
    if (openRulesBtn && rulesModal) {
      openRulesBtn.addEventListener("click", () => {
        window.SoundFX.playClick();
        rulesModal.classList.remove("hidden");
      });
      document.getElementById("btn-close-rules").addEventListener("click", () => {
        window.SoundFX.playClick();
        rulesModal.classList.add("hidden");
      });
      document.getElementById("btn-rules-ok").addEventListener("click", () => {
        window.SoundFX.playClick();
        rulesModal.classList.add("hidden");
      });
    }
  }

  // 初始化
  initAvatarPicker();
  populateQuickUnitSelect();
  initGlossaryFilter();
  renderSourcesView();
  bindEvents();

  if (window.MathExtras) {
    window.MathExtras.initScratchpad();
    window.MathExtras.initInteractiveTools();
    window.MathExtras.initPrintWorksheet(currentUser, questionMap);
    window.MathExtras.initBackupControls(
      () => store,
      (importedStore) => {
        store = importedStore;
        saveStore();
        if (window.MathDeluxe) {
    window.MathDeluxe.initLiveClock();
    window.MathDeluxe.initLegalModals();
    window.MathDeluxe.initIslandAtmosphere();
    window.MathDeluxe.initCertificateGenerator(currentUser);
    window.MathDeluxe.initBlitzGame(currentUser, saveStore, refreshAllHomeUI);
    window.MathDeluxe.initPkMode();
  }

  if (store.activeUserId && store.users[store.activeUserId]) {
          loginAs(store.activeUserId);
        } else {
          renderLoginScreen();
        }
      }
    );
  }

  if (window.MathDeluxe) {
    window.MathDeluxe.initLiveClock();
    window.MathDeluxe.initLegalModals();
    window.MathDeluxe.initIslandAtmosphere();
    window.MathDeluxe.initCertificateGenerator(currentUser);
    window.MathDeluxe.initBlitzGame(currentUser, saveStore, refreshAllHomeUI);
    window.MathDeluxe.initPkMode();
  }

  if (window.MathSuper) {
    window.MathSuper.init({
      getUser: currentUser,
      saveStore,
      refreshHome: refreshAllHomeUI,
      getBank: () => BANK,
      getIslandsConfig: () => ISLANDS_CONFIG,
      getCurrentIsland: () => state.currentIsland || "main",
      getTheme: () => {
        const el = document.getElementById("island-map-container");
        if (!el) return "day";
        if (el.classList.contains("theme-night")) return "night";
        if (el.classList.contains("theme-sunset")) return "sunset";
        if (el.classList.contains("theme-cloudy")) return "cloudy";
        return "day";
      }
    });
  }

  if (window.MathPlus) {
    window.MathPlus.init({
      getUser: currentUser,
      saveStore,
      refreshHome: refreshAllHomeUI,
      getBank: () => BANK,
      openPetQuest: () => {
        stopQuizTimer();
        if (window.MathSuper) window.MathSuper.refreshAll();
        if (window.MathPlus) window.MathPlus.refreshAll();
        showView("daily", "daily");
      }
    });
  }

  if (window.MathPro) {
    window.MathPro.init({
      getUser: currentUser,
      getStore: () => store,
      setStore: (newStore) => {
        store = newStore;
        saveStore();
        if (store.activeUserId && store.users[store.activeUserId]) {
          loginAs(store.activeUserId);
        } else {
          renderLoginScreen();
        }
      },
      saveStore,
      refreshHome: refreshAllHomeUI,
      getBank: () => BANK
    });
  }

  if (store.activeUserId && store.users[store.activeUserId]) {
    loginAs(store.activeUserId);
    if (window.MathPlus) window.MathPlus.refreshAll();
    if (window.MathPro) window.MathPro.refreshAll();
  } else {
    renderLoginScreen();
  }
})();
