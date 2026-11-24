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
        xpMap: { shiba: 0 },
        cookies: 3,
        mood: 100,
      };
    }
    if (!user.pet.xpMap || typeof user.pet.xpMap !== "object") {
      user.pet.xpMap = {};
      if ((user.pet.xp || 0) > 0) {
        user.pet.xpMap[user.pet.species || "shiba"] = Math.min(100, user.pet.xp);
      }
    }
    const curSp = user.pet.species || "shiba";
    user.pet.xp = Math.min(100, user.pet.xpMap[curSp] || 0);
    user.pet.xpMap[curSp] = user.pet.xp;
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

  // ==================== 2. 島嶼電子寵物養成（6 種高顏值 Q 版小夥伴） ====================
  const PET_SPECIES = {
    shiba: {
      name: "柴犬麻糬",
      body: "#F5B86E",
      belly: "#FFF7E6",
      ear: "#C87B36",
      quotes: ["汪汪！你算得越來越快了喔！", "再答對幾題就有香噴噴餅乾吃囉！", "今天也在冒險島一起加油吧！"],
    },
    fox: {
      name: "焦糖小狐狸",
      body: "#F28B59",
      belly: "#FFF4E4",
      ear: "#7D3F20",
      quotes: ["呼呼～小狐狸最佩服會算數學的你！", "這題難不倒我們兩個聰明搭檔！", "答對題目拿餅乾餵我，我會變超帥喔！"],
    },
    dino: {
      name: "抹茶小恐龍",
      body: "#88D18E",
      belly: "#F3FCEB",
      ear: "#F4B956",
      quotes: ["吼嗚～小恐龍幫你把錯題都吃光光！", "餅乾好好吃，我的力量滿格了！", "你是最棒的冒險島小博士！"],
    },
    bunny: {
      name: "草莓垂耳兔",
      body: "#FAD2DC",
      belly: "#FFF9FB",
      ear: "#F299B1",
      quotes: ["蹦蹦跳跳！你今天算數學超認真耶！", "最喜歡吃甜甜的數學餅乾了～", "我們一起把星星全部收集起來吧！"],
    },
    panda: {
      name: "奶茶小熊貓",
      body: "#FFF9EE",
      belly: "#EAD8BE",
      ear: "#6A4E3B",
      quotes: ["嚼嚼～算完這關再餵我吃塊小餅乾吧！", "一步一步慢慢算，一定能全對喔！", "你今天表現超級棒，給你拍拍手！"],
    },
    unicorn: {
      name: "夢幻獨角獸",
      body: "#EFE2FA",
      belly: "#FFF7FC",
      ear: "#E5A4CB",
      quotes: ["閃亮亮魔法加持！每題都能看懂算對！", "吃到好吃的餅乾，頭上的金色角更亮了！", "帶著勇氣往下一關出發吧！"],
    },
    cat: {
      name: "奶油小橘貓",
      body: "#FAD089",
      belly: "#FFFBF0",
      ear: "#E89B48",
      quotes: ["喵嗚～你算數學的樣子超帥氣喵！", "餅乾香香脆脆，喵喵最喜歡你了！", "呼嚕呼嚕～我們再去多拿幾顆星星吧！"],
    },
    penguin: {
      name: "企鵝小圓滾",
      body: "#6E655F",
      belly: "#FFFDF9",
      ear: "#F5B841",
      quotes: ["噗通噗通！小企鵝陪你一起開心闖關！", "搖搖擺擺跳個舞，恭喜你越來越厲害！", "吃到美味餅乾，全身都暖呼呼的喔！"],
    },
  };

  function getPetStage(xp) {
    if (xp >= 70) return { lv: 4, title: "👑 皇冠傳說大明星", nextXp: 100 };
    if (xp >= 30) return { lv: 3, title: "🌟 活潑冒險小夥伴", nextXp: 70 };
    if (xp >= 10) return { lv: 2, title: "🐣 剛破殼小寶寶", nextXp: 30 };
    return { lv: 1, title: "🥚 暖暖神秘蛋", nextXp: 10 };
  }

  function renderPetSvg(speciesId, lv, isSleeping = false) {
    const sp = PET_SPECIES[speciesId] || PET_SPECIES.shiba;
    const zzzOverlay = isSleeping
      ? `<text x="98" y="34" font-size="14" font-weight="900" fill="#B5753C">Z</text>
         <text x="110" y="22" font-size="17" font-weight="900" fill="#B5753C">z</text>
         <text x="122" y="12" font-size="12" font-weight="900" fill="#B5753C">z</text>
         <circle cx="80" cy="65" r="7" fill="#FFE6F2" stroke="#D484B0" stroke-width="1.6" opacity="0.88"/>
         <circle cx="78" cy="63" r="2" fill="#FFFFFF"/>`
      : "";
    // Lv.1：綁著蝴蝶結的 Q 版斑點神秘蛋
    if (lv === 1) {
      return `
        <svg viewBox="0 0 140 140" class="pet-stage-svg" aria-hidden="true">
          <ellipse cx="70" cy="118" rx="38" ry="9" fill="#EBD8BA"/>
          <path d="M70 22 C98 22 108 60 105 90 C102 110 88 120 70 120 C52 120 38 110 35 90 C32 60 42 22 70 22 Z" fill="#FFFDF7" stroke="#5A4031" stroke-width="3.2"/>
          <circle cx="53" cy="64" r="8" fill="${sp.body}" opacity="0.85"/>
          <circle cx="86" cy="78" r="10" fill="${sp.body}" opacity="0.75"/>
          <circle cx="62" cy="96" r="6" fill="${sp.ear}" opacity="0.65"/>
          <!-- 可愛紅粉蝴蝶結 -->
          <path d="M70 35 C58 25 50 35 60 42 C50 47 58 55 70 43 C82 55 90 47 80 42 C90 35 82 25 70 35 Z" fill="#FF857A" stroke="#5A4031" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="70" cy="39" r="4" fill="#FFD966" stroke="#5A4031" stroke-width="1.8"/>
          <!-- 害羞小腮紅與微笑 -->
          <ellipse cx="52" cy="78" rx="5" ry="2.8" fill="#FF9E94" opacity="0.75"/>
          <ellipse cx="88" cy="78" rx="5" ry="2.8" fill="#FF9E94" opacity="0.75"/>
          ${zzzOverlay}
        </svg>`;
    }

    // 各物種專屬 Q 版耳朵／角／尾巴／花紋
    let backParts = "";
    let headExtras = "";
    let faceMarkings = "";

    if (speciesId === "shiba") {
      // 柴犬捲尾巴＋尖立耳＋白眉豆豆
      backParts = `<path d="M95 92 C116 88 118 66 102 66 C94 66 95 78 102 78" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linecap="round"/>`;
      headExtras = `
        <path d="M40 44 L26 16 L56 30 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M38 39 L31 23 L50 31 Z" fill="#FFF5DF"/>
        <path d="M100 44 L114 16 L84 30 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M102 39 L109 23 L90 31 Z" fill="#FFF5DF"/>`;
      faceMarkings = `
        <path d="M36 68 Q52 54 70 68 Q88 54 104 68 C102 86 88 94 70 94 C52 94 38 86 36 68 Z" fill="#FFFDF8"/>
        <ellipse cx="56" cy="48" rx="4.2" ry="2.6" fill="#FFFDF8"/>
        <ellipse cx="84" cy="48" rx="4.2" ry="2.6" fill="#FFFDF8"/>`;
    } else if (speciesId === "fox") {
      // 小狐狸蓬鬆白尾尖大尾巴＋大尖耳＋臉頰絨毛
      backParts = `
        <path d="M94 96 C124 94 130 62 110 56 C98 53 92 70 94 84 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M110 56 C122 59 124 72 112 75 C106 68 106 61 110 56 Z" fill="#FFFDF7"/>`;
      headExtras = `
        <path d="M38 44 L20 12 L56 28 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M34 36 L26 19 L48 29 Z" fill="#7D3F20"/>
        <path d="M102 44 L120 12 L84 28 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M106 36 L114 19 L92 29 Z" fill="#7D3F20"/>`;
      faceMarkings = `
        <path d="M33 66 L24 72 L36 78 Q54 60 70 72 Q86 60 104 78 L116 72 L107 66 C103 86 88 94 70 94 C52 94 37 86 33 66 Z" fill="#FFF8EE"/>`;
    } else if (speciesId === "dino") {
      // 小恐龍金色背棘＋粗萌小尾巴＋肚皮橫紋
      backParts = `
        <path d="M94 96 C118 98 124 82 116 74 C108 78 102 82 94 84 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M104 42 L116 46 L105 54 Z M107 58 L120 62 L107 70 Z" fill="#FFD35C" stroke="#5A4031" stroke-width="2" stroke-linejoin="round"/>`;
      headExtras = `
        <path d="M62 24 L70 11 L78 24 Z" fill="#FFD35C" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M46 28 L50 17 L58 25 Z" fill="#FFA45B" stroke="#5A4031" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M82 25 L90 17 L94 28 Z" fill="#FFA45B" stroke="#5A4031" stroke-width="2.2" stroke-linejoin="round"/>`;
      faceMarkings = `
        <ellipse cx="48" cy="48" rx="4" ry="3" fill="#5CB868" opacity="0.6"/>
        <ellipse cx="92" cy="50" rx="5" ry="3.5" fill="#5CB868" opacity="0.6"/>`;
    } else if (speciesId === "bunny") {
      // 草莓垂耳兔長長軟垂耳＋圓球白尾巴＋頭頂小草莓
      backParts = `<circle cx="102" cy="96" r="10" fill="#FFFDF9" stroke="#5A4031" stroke-width="2.6"/>`;
      headExtras = `
        <path d="M42 36 C20 34 14 68 24 84 C32 92 42 76 40 54 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M36 46 C24 48 20 68 27 78 C32 82 36 70 36 54 Z" fill="#F49CB5"/>
        <path d="M98 36 C120 34 126 68 116 84 C108 92 98 76 100 54 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M104 46 C116 48 120 68 113 78 C108 82 104 70 104 54 Z" fill="#F49CB5"/>`;
    } else if (speciesId === "panda") {
      // 奶茶小熊貓圓圓深棕耳＋可愛八字黑眼圈＋小竹葉
      headExtras = `
        <circle cx="38" cy="30" r="13" fill="#6A4E3B" stroke="#5A4031" stroke-width="3"/>
        <circle cx="38" cy="30" r="6" fill="#D9A88F"/>
        <circle cx="102" cy="30" r="13" fill="#6A4E3B" stroke="#5A4031" stroke-width="3"/>
        <circle cx="102" cy="30" r="6" fill="#D9A88F"/>`;
      faceMarkings = `
        <ellipse cx="52" cy="58" rx="11" ry="9" transform="rotate(-18 52 58)" fill="#6A4E3B"/>
        <ellipse cx="88" cy="58" rx="11" ry="9" transform="rotate(18 88 58)" fill="#6A4E3B"/>`;
    } else if (speciesId === "unicorn") {
      // 夢幻獨角獸金色螺旋角＋粉彩鬃毛＋小翅膀
      backParts = `
        <path d="M32 82 C12 72 12 96 34 98 Z" fill="#FFFDF9" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M108 82 C128 72 128 96 106 98 Z" fill="#FFFDF9" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round"/>`;
      headExtras = `
        <path d="M38 40 L26 20 L50 30 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M102 40 L114 20 L90 30 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="56" cy="27" r="8" fill="#FFB5D0" stroke="#5A4031" stroke-width="2"/>
        <circle cx="84" cy="27" r="8" fill="#FFE07D" stroke="#5A4031" stroke-width="2"/>
        <path d="M63 28 L70 5 L77 28 Z" fill="#FFD859" stroke="#5A4031" stroke-width="2.6" stroke-linejoin="round"/>
        <line x1="65" y1="21" x2="75" y2="18" stroke="#C98219" stroke-width="2"/>`;
    } else if (speciesId === "cat") {
      // 奶油小橘貓：俏皮彎貓尾＋虎斑額頭三條紋＋可愛貓鬍鬚
      backParts = `<path d="M96 98 C122 96 126 62 112 58 C105 56 105 68 112 72" fill="none" stroke="${sp.ear}" stroke-width="8" stroke-linecap="round"/>`;
      headExtras = `
        <path d="M36 44 L24 14 L56 28 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M35 38 L29 21 L49 30 Z" fill="#F7A399"/>
        <path d="M104 44 L116 14 L84 28 Z" fill="${sp.body}" stroke="#5A4031" stroke-width="3" stroke-linejoin="round"/>
        <path d="M105 38 L111 21 L91 30 Z" fill="#F7A399"/>`;
      faceMarkings = `
        <path d="M70 30 V40 M63 32 L65 40 M77 32 L75 40" stroke="#D9822B" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M28 62 L38 64 M27 68 L38 68 M112 62 L102 64 M113 68 L102 68" stroke="#5A4031" stroke-width="2" stroke-linecap="round"/>`;
    } else if (speciesId === "penguin") {
      // 企鵝小圓滾：暖黃耳罩＋雪白愛心臉龐＋橘黃小扁嘴
      headExtras = `
        <path d="M34 52 C34 24 106 24 106 52" fill="none" stroke="#E86A58" stroke-width="4"/>
        <circle cx="33" cy="54" r="9" fill="#FFD35C" stroke="#5A4031" stroke-width="2.4"/>
        <circle cx="107" cy="54" r="9" fill="#FFD35C" stroke="#5A4031" stroke-width="2.4"/>`;
      faceMarkings = `
        <path d="M40 58 C40 42 58 40 70 50 C82 40 100 42 100 58 C100 76 88 86 70 86 C52 86 40 76 40 58 Z" fill="#FFFDF9"/>
        <ellipse cx="70" cy="65" rx="7" ry="4.2" fill="#FFA43B" stroke="#5A4031" stroke-width="1.8"/>`;
    }

    // 進化配件：Lv.2 破殼蛋殼、Lv.3 冒險領巾與星星、Lv.4 皇家大皇冠與披風
    const cape = lv >= 4
      ? `<path d="M34 80 C20 96 22 114 38 114 L102 114 C118 114 120 96 106 80 Z" fill="#E86452" stroke="#5A4031" stroke-width="2.6"/>`
      : "";
    const crown = lv >= 4
      ? `<path d="M52 24 L55 8 L64 17 L70 6 L76 17 L85 8 L88 24 Z" fill="#FFD447" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round"/>
         <circle cx="70" cy="17" r="2.4" fill="#E85D4A"/>`
      : lv >= 3
      ? `<path d="M108 18 L111 25 L118 26 L113 31 L114 38 L108 34 L102 38 L103 31 L98 26 L105 25 Z" fill="#FFD447" stroke="#B6721A" stroke-width="1.5"/>`
      : "";
    const shell = lv === 2
      ? `<path d="M34 92 L44 100 L54 91 L65 100 L75 91 L86 100 L96 91 L106 92 C104 112 90 120 70 120 C50 120 36 112 34 92 Z" fill="#FFFDF6" stroke="#5A4031" stroke-width="2.8" stroke-linejoin="round"/>`
      : "";
    const scarf = lv >= 3
      ? `<path d="M42 84 Q70 95 98 84 L95 93 Q70 102 45 93 Z" fill="#F26D5B" stroke="#5A4031" stroke-width="2.2"/>
         <circle cx="70" cy="94" r="5.5" fill="#FFD447" stroke="#5A4031" stroke-width="2"/>`
      : "";

    return `
      <svg viewBox="0 0 140 140" class="pet-stage-svg" aria-hidden="true">
        <ellipse cx="70" cy="122" rx="42" ry="8" fill="#EBD8BA"/>
        ${cape}
        ${backParts}
        <!-- 圓滾滾 Q 版小身體與小肚肚 -->
        <ellipse cx="70" cy="96" rx="30" ry="24" fill="${sp.body}" stroke="#5A4031" stroke-width="3"/>
        <ellipse cx="70" cy="99" rx="19" ry="15" fill="${sp.belly}"/>
        ${headExtras}
        <!-- 大頭 Q 版臉龐 -->
        <ellipse cx="70" cy="58" rx="36" ry="31" fill="${sp.body}" stroke="#5A4031" stroke-width="3.2"/>
        ${faceMarkings}
        <!-- 水汪汪雙高光大眼睛 或 安心閉眼睡覺 -->
        ${
          isSleeping
            ? `<path d="M46 58 Q53 64 60 58" fill="none" stroke="#432D20" stroke-width="3" stroke-linecap="round"/>
               <path d="M80 58 Q87 64 94 58" fill="none" stroke="#432D20" stroke-width="3" stroke-linecap="round"/>`
            : `<circle cx="53" cy="58" r="6" fill="#432D20"/>
               <circle cx="87" cy="58" r="6" fill="#432D20"/>
               <circle cx="51" cy="55.8" r="2.3" fill="#FFFFFF"/>
               <circle cx="85" cy="55.8" r="2.3" fill="#FFFFFF"/>
               <circle cx="55" cy="60.2" r="1.1" fill="#FFFFFF"/>
               <circle cx="89" cy="60.2" r="1.1" fill="#FFFFFF"/>`
        }
        <!-- 粉嫩蘋果肌腮紅 -->
        <ellipse cx="42" cy="66" rx="6" ry="3.4" fill="#FF928B" opacity="0.78"/>
        <ellipse cx="98" cy="66" rx="6" ry="3.4" fill="#FF928B" opacity="0.78"/>
        <!-- Q 版小鼻頭與立體 W 貓咪微笑嘴 -->
        <ellipse cx="70" cy="64" rx="3.5" ry="2.4" fill="#5A4031"/>
        <path d="M63 69 Q66.5 73.5 70 69 Q73.5 73.5 77 69" fill="none" stroke="#5A4031" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- 圓圓小手手與小腳丫 -->
        <ellipse cx="45" cy="93" rx="6.5" ry="5" fill="${sp.body}" stroke="#5A4031" stroke-width="2.5"/>
        <ellipse cx="95" cy="93" rx="6.5" ry="5" fill="${sp.body}" stroke="#5A4031" stroke-width="2.5"/>
        <ellipse cx="54" cy="116" rx="8" ry="5.5" fill="${sp.belly}" stroke="#5A4031" stroke-width="2.5"/>
        <ellipse cx="86" cy="116" rx="8" ry="5.5" fill="${sp.belly}" stroke="#5A4031" stroke-width="2.5"/>
        ${scarf}
        ${shell}
        ${crown}
        ${zzzOverlay}
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
    const sleepBtn = document.getElementById("btn-pet-sleep");
    if (!stageEl) return;

    const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
    if ((user.pet.xp || 0) > 100) user.pet.xp = 100;
    const st = getPetStage(user.pet.xp || 0);
    const sleeping = Boolean(user.pet.sleeping);
    const isMax = (user.pet.xp || 0) >= 100;
    stageEl.innerHTML = renderPetSvg(user.pet.species, st.lv, sleeping);
    if (nameEl) nameEl.textContent = `${sp.name}${sleeping ? "（💤 熟睡中）" : ""}`;
    if (levelEl) {
      levelEl.textContent = isMax
        ? `Lv.${st.lv} ${st.title}（成長值 100 / 100・MAX 滿級！）`
        : `Lv.${st.lv} ${st.title}（成長值 ${user.pet.xp || 0} / ${st.nextXp}）`;
    }
    if (xpBar) xpBar.style.width = `${Math.min(100, Math.round(((user.pet.xp || 0) / st.nextXp) * 100))}%`;
    if (cookieEl) cookieEl.textContent = String(user.pet.cookies || 0);
    if (sleepBtn) sleepBtn.textContent = sleeping ? "☀️ 叫醒小夥伴" : "😴 哄牠睡覺";
    if (speechEl && !speechEl.dataset.custom) {
      speechEl.textContent = sleeping
        ? `呼嚕呼嚕…Zzz…${sp.name}正在做甜甜的夢呢🌙`
        : sp.quotes[0];
    }

    document.querySelectorAll("button[data-pet-species]").forEach((b) => {
      const spId = b.dataset.petSpecies;
      b.classList.toggle("active", spId === user.pet.species);
      if (!b.dataset.baseLabel) b.dataset.baseLabel = b.textContent;
      const spXp = Math.min(100, (user.pet.xpMap && user.pet.xpMap[spId]) || 0);
      b.textContent = spXp >= 100 ? `${b.dataset.baseLabel} 👑` : spXp > 0 ? `${b.dataset.baseLabel} (${spXp})` : b.dataset.baseLabel;
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
        <div><strong>💡 建議加強單元：</strong>${st.weakest.map((u) => u.title).join("、")} ｜ <strong>👀 護眼休息達成：</strong>${user.eyeCareRestCount || 0} 次</div>
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
    ctx.fillText(`🛠️ 待清零錯題數：${st.mistakeCnt} 題　｜　👀 護眼休息達成：${user.eyeCareRestCount || 0} 次`, 40, 358);

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

    // 電子寵物切換、餵食、玩耍、買餅乾（8 隻小夥伴各自獨立計算成長值 0~100）
    document.querySelectorAll("button[data-pet-species]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        user.pet.species = btn.dataset.petSpecies;
        user.pet.xp = Math.min(100, user.pet.xpMap[user.pet.species] || 0);
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
        const spId = user.pet.species || "shiba";
        const curXp = Math.min(100, user.pet.xpMap[spId] || 0);
        const speech = document.getElementById("pet-speech-bubble");
        if (curXp >= 100) {
          user.pet.xpMap[spId] = 100;
          user.pet.xp = 100;
          window.SoundFX && window.SoundFX.playFanfare(2);
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = "👑 這隻小夥伴已經養到最高滿級 100 / 100 (MAX) 囉！快點下方切換另一隻小夥伴，把 8 隻都養大吧！";
          }
          renderPetPanel();
          return;
        }
        if ((user.pet.cookies || 0) <= 0) {
          window.SoundFX && window.SoundFX.playWrong();
          if (speech) {
            speech.dataset.custom = "1";
            speech.textContent = "🍪 餅乾吃光囉！去答對題目或用金幣買餅乾吧！";
          }
          return;
        }
        const prevLv = getPetStage(curXp).lv;
        user.pet.sleeping = false;
        user.pet.cookies -= 1;
        const nextXp = Math.min(100, curXp + 6);
        user.pet.xpMap[spId] = nextXp;
        user.pet.xp = nextXp;
        const nextLv = getPetStage(nextXp).lv;
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

    const PLAY_ACTIVITIES = [
      { anim: "play-ball", icons: ["⚽", "✨", "🎵"], actionText: "⚽ 丟出彩色小皮球！跳起來用頭頂球囉！" },
      { anim: "play-frisbee", icons: ["🥏", "💨", "🌟"], actionText: "🥏 咻～飛盤飛出去，一個華麗翻身接住！" },
      { anim: "play-butterfly", icons: ["🦋", "🌸", "✨"], actionText: "🦋 追著花園小蝴蝶開心地轉圈圈跳舞！" },
      { anim: "play-bubbles", icons: ["🫧", "🫧", "✨"], actionText: "🫧 噗嚕噗嚕吹出好多七彩泡泡！" },
      { anim: "play-pat", icons: ["🤚", "💕", "💖"], actionText: "💕 摸摸頭撒嬌中，開心到尾巴搖個不停！" },
    ];
    let playActIdx = 0;

    const btnPlay = document.getElementById("btn-pet-play");
    if (btnPlay) {
      btnPlay.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        if (user.pet.sleeping) {
          user.pet.sleeping = false;
          api.saveStore();
          renderPetPanel();
        }
        const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
        const act = PLAY_ACTIVITIES[playActIdx % PLAY_ACTIVITIES.length];
        playActIdx += 1;
        const line = sp.quotes[Math.floor(Math.random() * sp.quotes.length)];
        window.SoundFX && window.SoundFX.playCorrect(2);
        const speech = document.getElementById("pet-speech-bubble");
        if (speech) {
          speech.dataset.custom = "1";
          speech.textContent = `${act.actionText}「${line}」`;
        }
        const stageEl = document.getElementById("pet-avatar-stage");
        if (stageEl) {
          stageEl.classList.remove("play-ball", "play-frisbee", "play-butterfly", "play-bubbles", "play-pat");
          void stageEl.offsetWidth;
          stageEl.classList.add(act.anim);
          stageEl.querySelectorAll(".pet-play-prop").forEach((n) => n.remove());
          act.icons.forEach((ic, idx) => {
            const prop = document.createElement("span");
            prop.className = `pet-play-prop p-${idx}`;
            prop.textContent = ic;
            stageEl.appendChild(prop);
            setTimeout(() => prop.remove(), 1200);
          });
          setTimeout(() => stageEl.classList.remove(act.anim), 1200);
        }
        if (window.SpeechFX && window.SoundFX && window.SoundFX.enabled) {
          window.SpeechFX.speak(line);
        }
      });
    }

    const btnSleep = document.getElementById("btn-pet-sleep");
    if (btnSleep) {
      btnSleep.addEventListener("click", () => {
        const user = ensureSuperState(api.getUser());
        if (!user) return;
        user.pet.sleeping = !user.pet.sleeping;
        api.saveStore();
        window.SoundFX && window.SoundFX.playClick();
        const sp = PET_SPECIES[user.pet.species] || PET_SPECIES.shiba;
        const speech = document.getElementById("pet-speech-bubble");
        if (speech) {
          speech.dataset.custom = "1";
          speech.textContent = user.pet.sleeping
            ? `💤 呼嚕呼嚕…${sp.name}蓋好小被子睡著囉！晚安～🌙`
            : `☀️ 伸個大懶腰！${sp.name}睡飽飽精神百倍，繼續去算數學吧！`;
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

    initSiteCounters();
  }

  // ==================== 6. 公開線上人數 & 版主專屬隱藏後台（訪客／會員／停留時間） & 站內聯絡我們 ====================
  const COUNTER_NS = "smallfishann97-math-adventure-island";
  let cachedVisits = Number(localStorage.getItem("mai_cached_visits") || 0);
  let cachedTodayDate = localStorage.getItem("mai_cached_today_date") || "";
  let cachedTodayVisits = cachedTodayDate === todayStr() ? Number(localStorage.getItem("mai_cached_today_visits") || 0) : 0;
  let cachedMembers = Number(localStorage.getItem("mai_cached_members") || 0);
  let sessionStartMs = Date.now();
  let priorTotalStaySec = Number(localStorage.getItem("mai_total_stay_sec") || 0);
  let onlineCount = 1;

  function getLocalMemberIds() {
    try {
      const raw = localStorage.getItem("grade3_math_luxury_store_v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Object.keys((parsed && parsed.users) || {});
    } catch (_) {
      return [];
    }
  }

  function formatStayMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderCounterDOM() {
    const localIds = getLocalMemberIds();
    const tv = Math.max(1, cachedTodayVisits);
    const v = Math.max(1, cachedVisits, tv, localIds.length);
    const m = Math.max(localIds.length, cachedMembers, 1);
    const curSec = Math.max(1, Math.floor((Date.now() - sessionStartMs) / 1000));
    const totalSec = priorTotalStaySec + curSec;
    const totalMin = Math.max(1, Math.round(totalSec / 60));
    const avgMin = Math.max(1, Math.round(totalSec / 60 / Math.max(1, localIds.length || 1)));

    document.querySelectorAll("[data-site-today-visits]").forEach((el) => {
      el.textContent = tv.toLocaleString("zh-TW");
    });
    document.querySelectorAll("[data-site-online]").forEach((el) => {
      el.textContent = onlineCount.toLocaleString("zh-TW");
    });
    document.querySelectorAll("[data-site-visits]").forEach((el) => {
      el.textContent = v.toLocaleString("zh-TW");
    });
    document.querySelectorAll("[data-site-members]").forEach((el) => {
      el.textContent = m.toLocaleString("zh-TW");
    });
    document.querySelectorAll("[data-stay-current]").forEach((el) => {
      el.textContent = formatStayMMSS(curSec);
    });
    document.querySelectorAll("[data-stay-total]").forEach((el) => {
      el.textContent = `${totalMin} 分鐘`;
    });
    document.querySelectorAll("[data-stay-avg]").forEach((el) => {
      el.textContent = `約 ${avgMin} 分鐘`;
    });
  }

  function renderAdminExtraAnalytics() {
    const profBox = document.getElementById("admin-profiles-table");
    const unitBox = document.getElementById("admin-unit-analytics");
    const bank = api ? api.getBank() : window.GRADE3_MATH_BANK;
    let usersMap = {};
    try {
      const raw = localStorage.getItem("grade3_math_luxury_store_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        usersMap = (parsed && parsed.users) || {};
      }
    } catch (_) {}
    const users = Object.values(usersMap);

    if (profBox) {
      if (!users.length) {
        profBox.innerHTML = `<p style="text-align:center;color:var(--muted);font-weight:800;padding:10px;">目前尚未建立任何冒險者角色。</p>`;
      } else {
        const curUser = api ? api.getUser() : null;
        const curId = curUser ? curUser.id : null;
        const sortedUsers = [...users].sort((a, b) => (a.id === curId ? -1 : b.id === curId ? 1 : 0));
        profBox.innerHTML = sortedUsers
          .map((u) => {
            const isOnlineNow = curId && u.id === curId;
            const onlineBadge = isOnlineNow
              ? `<span class="ver-tag" style="background:#d8f5e2;border:1.5px solid #48a363;color:#1e6b36;margin-left:6px;padding:2px 9px;font-size:0.76rem;">🟢 目前在線中</span>`
              : "";
            const cleared = Object.values(u.stageStars || {}).filter((s) => s > 0).length;
            const stars = Object.values(u.stageStars || {}).reduce((a, b) => a + b, 0);
            const hist = u.history || [];
            const totalQ = hist.reduce((s, h) => s + (h.total || 0), 0);
            const okQ = hist.reduce((s, h) => s + (h.correct || 0), 0);
            const acc = totalQ > 0 ? Math.round((okQ / totalQ) * 100) : 0;
            const petXp = (u.pet && u.pet.xp) || 0;
            const petLv = getPetStage(petXp).lv;
            return `
              <div class="exam-rev-row ok" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;${isOnlineNow ? "background:#f2fcf5;border-color:#5bb876;" : ""}">
                <strong>🧑‍🎓 ${esc(u.name)}${onlineBadge}</strong>
                <span>通關：<b>${cleared}/160</b> ｜ ⭐ <b>${stars}</b> ｜ 🪙 <b>${u.coins || 0}</b> ｜ 作答：<b>${totalQ}題 (${acc}%)</b> ｜ 錯題：<b>${(u.mistakes || []).length}</b> ｜ 寵物：<b>Lv.${petLv}</b></span>
              </div>`;
          })
          .join("");
      }
    }

    if (unitBox && bank && bank.units) {
      const qUnitMap = new Map();
      const unitStats = new Map();
      bank.units.forEach((u) => {
        unitStats.set(u.id, { title: `第${String(u.order).padStart(2, "0")}單元 ${u.title}`, played: 0, mistakes: 0 });
        (u.questions || []).forEach((q) => qUnitMap.set(q.id, u.id));
      });

      users.forEach((u) => {
        Object.entries(u.stageStars || {}).forEach(([k, st]) => {
          if (st > 0) {
            const uid = k.split("-s")[0];
            if (unitStats.has(uid)) unitStats.get(uid).played += 1;
          }
        });
        (u.mistakes || []).forEach((qid) => {
          const uid = qUnitMap.get(qid);
          if (uid && unitStats.has(uid)) unitStats.get(uid).mistakes += 1;
        });
        (u.history || []).forEach((h) => {
          (h.items || []).forEach((it) => {
            const uid = qUnitMap.get(it.qid);
            if (uid && unitStats.has(uid)) {
              unitStats.get(uid).played += 1;
              if (!it.isCorrect) unitStats.get(uid).mistakes += 1;
            }
          });
        });
      });

      const arr = Array.from(unitStats.values());
      const topPlayed = [...arr].filter((x) => x.played > 0).sort((a, b) => b.played - a.played).slice(0, 3);
      const topMistakes = [...arr].filter((x) => x.mistakes > 0).sort((a, b) => b.mistakes - a.mistakes).slice(0, 3);

      unitBox.innerHTML = `
        <div class="exam-diag-box good">
          <h4>🔥 最熱門練習單元 Top 3</h4>
          <p>${topPlayed.length ? topPlayed.map((x, i) => `${i + 1}. ${x.title}（熱度 ${x.played}）`).join("<br/>") : "尚無單元練習記錄"}</p>
        </div>
        <div class="exam-diag-box warn">
          <h4>😈 最常答錯大魔王單元 Top 3</h4>
          <p>${topMistakes.length ? topMistakes.map((x, i) => `${i + 1}. ${x.title}（累計錯 ${x.mistakes} 次）`).join("<br/>") : "目前零錯題！表現超棒！"}</p>
        </div>
      `;
    }
  }

  function renderAdminFeedbackList() {
    renderAdminExtraAnalytics();
    const listEl = document.getElementById("admin-feedback-list");
    if (!listEl) return;
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem("mai_site_feedback_inbox") || "[]");
    } catch (_) {}
    if (!items.length) {
      listEl.innerHTML = `<p style="text-align:center;color:var(--muted);font-weight:800;padding:12px;">目前尚無新的意見回饋留言。</p>`;
      return;
    }
    listEl.innerHTML = items.map((it, idx) => `
      <div class="exam-rev-row ok" style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <div>
          <strong>【${esc(it.category)}】來自：${esc(it.sender)} <span style="font-weight:700;color:var(--muted);font-size:0.78rem;">（${esc(it.date)}${it.replyTo ? ` ｜ 回覆方式：${esc(it.replyTo)}` : ""}）</span></strong>
          <p style="margin:6px 0 0;white-space:pre-wrap;">${esc(it.message)}</p>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-del-fb="${idx}" title="刪除此則留言">✕</button>
      </div>
    `).join("");

    listEl.querySelectorAll("button[data-del-fb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.delFb);
        items.splice(i, 1);
        localStorage.setItem("mai_site_feedback_inbox", JSON.stringify(items));
        renderAdminFeedbackList();
      });
    });
  }

  // 幫免費雲端計數器 API 加上 4 秒超時保護，並同時支援主備雙雲端節點
  async function fetchCounterJson(url, timeoutMs = 4200) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const res = await fetch(url, ctrl ? { signal: ctrl.signal, cache: "no-store" } : { cache: "no-store" });
      if (t) clearTimeout(t);
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      if (t) clearTimeout(t);
      return null;
    }
  }

  async function bumpGlobalMemberCount(times = 1) {
    for (let i = 0; i < times; i++) {
      const data = await fetchCounterJson(`https://api.counterapi.dev/v1/${COUNTER_NS}/members/up`);
      if (data && typeof data.count === "number") {
        cachedMembers = Math.max(cachedMembers, data.count);
        localStorage.setItem("mai_cached_members", String(cachedMembers));
      }
    }
    renderCounterDOM();
  }

  async function initSiteCounters() {
    // 0. 📅 今日來訪人次（依當日日期獨立累計，每天 00:00 自動歸零重算，每 30 秒同步雲端最新數字）
    async function syncTodayVisits(allowBump) {
      const todayKey = todayStr();
      const compactDate = todayKey.replace(/-/g, "");
      if (cachedTodayDate !== todayKey) {
        cachedTodayDate = todayKey;
        cachedTodayVisits = 0;
        localStorage.setItem("mai_cached_today_date", todayKey);
        localStorage.setItem("mai_cached_today_visits", "0");
      }
      const bumpFlagKey = `mai_today_visit_bumped_${compactDate}`;
      const shouldBump = allowBump && !sessionStorage.getItem(bumpFlagKey);
      if (shouldBump) {
        sessionStorage.setItem(bumpFlagKey, "1");
        cachedTodayVisits = Math.max(1, cachedTodayVisits + 1);
        localStorage.setItem("mai_cached_today_date", todayKey);
        localStorage.setItem("mai_cached_today_visits", String(cachedTodayVisits));
        renderCounterDOM();
      } else if (cachedTodayVisits < 1) {
        cachedTodayVisits = 1;
        renderCounterDOM();
      }
      const url = shouldBump
        ? `https://api.counterapi.dev/v1/${COUNTER_NS}/visits_${compactDate}/up?t=${Date.now()}`
        : `https://api.counterapi.dev/v1/${COUNTER_NS}/visits_${compactDate}/?t=${Date.now()}`;
      const data = await fetchCounterJson(url, 4000);
      if (data && typeof data.count === "number") {
        cachedTodayVisits = Math.max(1, cachedTodayVisits, data.count);
        localStorage.setItem("mai_cached_today_date", todayKey);
        localStorage.setItem("mai_cached_today_visits", String(cachedTodayVisits));
        if (cachedTodayVisits > cachedVisits) {
          cachedVisits = cachedTodayVisits;
          localStorage.setItem("mai_cached_visits", String(cachedVisits));
        }
        renderCounterDOM();
      }
    }
    syncTodayVisits(true);
    setInterval(() => syncTodayVisits(false), 30000);

    // 每秒更新停留時間並定期寫回本機累計停留秒數
    setInterval(() => {
      const curSec = Math.max(1, Math.floor((Date.now() - sessionStartMs) / 1000));
      localStorage.setItem("mai_total_stay_sec", String(priorTotalStaySec + curSec));
      renderCounterDOM();
    }, 1000);

    // 1. 累計拜訪人次（背景非阻塞更新）
    (async () => {
      if (!sessionStorage.getItem("mai_visit_bumped")) {
        sessionStorage.setItem("mai_visit_bumped", "1");
        cachedVisits = Math.max(1, cachedVisits + 1);
        localStorage.setItem("mai_cached_visits", String(cachedVisits));
        renderCounterDOM();
        const data = await fetchCounterJson(`https://api.counterapi.dev/v1/${COUNTER_NS}/visits/up?t=${Date.now()}`);
        if (data && typeof data.count === "number") {
          cachedVisits = Math.max(cachedVisits, data.count);
          localStorage.setItem("mai_cached_visits", String(cachedVisits));
          renderCounterDOM();
        }
      } else {
        const data = await fetchCounterJson(`https://api.counterapi.dev/v1/${COUNTER_NS}/visits/?t=${Date.now()}`);
        if (data && typeof data.count === "number") {
          cachedVisits = Math.max(cachedVisits, data.count);
          localStorage.setItem("mai_cached_visits", String(cachedVisits));
          renderCounterDOM();
        }
      }
    })();

    // 2. 已建立冒險者人數（背景非阻塞更新）
    (async () => {
      const localIds = getLocalMemberIds();
      let syncedIds = [];
      try {
        syncedIds = JSON.parse(localStorage.getItem("mai_synced_member_ids") || "[]");
      } catch (_) {}
      const unsynced = localIds.filter((id) => !syncedIds.includes(id));
      if (unsynced.length > 0) {
        localStorage.setItem("mai_synced_member_ids", JSON.stringify([...syncedIds, ...unsynced]));
        await bumpGlobalMemberCount(unsynced.length);
      } else {
        const data = await fetchCounterJson(`https://api.counterapi.dev/v1/${COUNTER_NS}/members/`);
        if (data && typeof data.count === "number") {
          cachedMembers = Math.max(cachedMembers, data.count);
          localStorage.setItem("mai_cached_members", String(cachedMembers));
          renderCounterDOM();
        }
      }
    })();

    renderCounterDOM();

    // 3. 監聽建立新冒險者表單送出
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", () => {
        setTimeout(async () => {
          const nowIds = getLocalMemberIds();
          let curSynced = [];
          try {
            curSynced = JSON.parse(localStorage.getItem("mai_synced_member_ids") || "[]");
          } catch (_) {}
          const newOnes = nowIds.filter((id) => !curSynced.includes(id));
          if (newOnes.length > 0) {
            localStorage.setItem("mai_synced_member_ids", JSON.stringify([...curSynced, ...newOnes]));
            cachedMembers = Math.max(cachedMembers + newOnes.length, nowIds.length);
            localStorage.setItem("mai_cached_members", String(cachedMembers));
            renderCounterDOM();
            await bumpGlobalMemberCount(newOnes.length);
          } else {
            renderCounterDOM();
          }
        }, 120);
      });
    }

    // 4. 站內「✉️ 聯絡我們」表單彈窗（完全不外露私人信箱）
    const contactModal = document.getElementById("modal-contact-form");
    const btnOpenContact = document.getElementById("btn-open-contact");
    const btnCloseContact = document.getElementById("btn-close-contact");
    const contactForm = document.getElementById("site-contact-form");
    const contactToast = document.getElementById("contact-submit-toast");

    if (btnOpenContact && contactModal) {
      btnOpenContact.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        if (contactToast) contactToast.classList.add("hidden");
        contactModal.classList.remove("hidden");
      });
    }
    if (btnCloseContact && contactModal) {
      btnCloseContact.addEventListener("click", () => {
        contactModal.classList.add("hidden");
      });
    }
    if (contactForm) {
      contactForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const cat = document.getElementById("contact-category").value;
        const sender = document.getElementById("contact-sender").value.trim();
        const replyTo = document.getElementById("contact-reply-to").value.trim();
        const msg = document.getElementById("contact-message").value.trim();
        if (!sender || !msg) return;

        const record = {
          id: "fb_" + Date.now(),
          date: new Date().toLocaleString("zh-TW", { hour12: false }),
          category: cat,
          sender,
          replyTo,
          message: msg,
        };
        let inbox = [];
        try {
          inbox = JSON.parse(localStorage.getItem("mai_site_feedback_inbox") || "[]");
        } catch (_) {}
        inbox.unshift(record);
        localStorage.setItem("mai_site_feedback_inbox", JSON.stringify(inbox.slice(0, 50)));

        // 同步背景轉寄通知（Base64 隱藏端點，網頁原始碼完全不出現明碼信箱）
        try {
          const target = atob("c21hbGxmaXNoYW5uOTdAZ21haWwuY29t");
          fetch(`https://formsubmit.co/ajax/${target}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              _subject: `[數學遊戲冒險島回饋] ${cat} - ${sender}`,
              回饋類別: cat,
              稱呼: sender,
              回覆聯絡方式: replyTo || "未提供",
              留言內容: msg,
            }),
          }).catch(() => {});
        } catch (_) {}

        window.SoundFX && window.SoundFX.playFanfare(3);
        if (contactToast) contactToast.classList.remove("hidden");
        contactForm.reset();
        renderAdminFeedbackList();
        setTimeout(() => {
          if (contactModal) contactModal.classList.add("hidden");
        }, 1600);
      });
    }

    // 5. 👑 版主專屬數據後台（點頁尾「👑 版主專屬」並輸入版主高強度密碼解鎖）
    const ADMIN_KEY_B64 = "YW5uOTcwOThwb2lsa2ptbmIxMjNxd2Vhc2R6eGM=";
    function checkAdminPwd(str) {
      try {
        return btoa(String(str || "").trim()) === ADMIN_KEY_B64;
      } catch (_) {
        return false;
      }
    }
    const adminModal = document.getElementById("admin-stats-modal");
    const btnOpenAdmin = document.getElementById("btn-open-admin");
    const btnCloseAdmin = document.getElementById("btn-close-admin");
    const authGate = document.getElementById("admin-auth-gate");
    const dashContent = document.getElementById("admin-dashboard-content");
    const pwdInput = document.getElementById("admin-pwd-input");
    const pwdErr = document.getElementById("admin-pwd-err");
    const clGate = document.getElementById("changelog-auth-gate");
    const clContent = document.getElementById("changelog-locked-content");
    const clPwdInput = document.getElementById("changelog-pwd-input");
    const clPwdErr = document.getElementById("changelog-pwd-err");
    let adminUnlocked = false;

    function syncAdminLockUI() {
      if (authGate) authGate.classList.toggle("hidden", adminUnlocked);
      if (dashContent) dashContent.classList.toggle("hidden", !adminUnlocked);
      if (clGate) clGate.classList.toggle("hidden", adminUnlocked);
      if (clContent) clContent.classList.toggle("hidden", !adminUnlocked);
      if (pwdErr) pwdErr.classList.add("hidden");
      if (clPwdErr) clPwdErr.classList.add("hidden");
    }

    function openAdminModal(forceUnlock = false) {
      if (!adminModal) return;
      if (forceUnlock) adminUnlocked = true;
      renderCounterDOM();
      renderAdminFeedbackList();
      if (typeof renderAdminPowerTools === "function") renderAdminPowerTools();
      syncAdminLockUI();
      if (pwdInput) pwdInput.value = "";
      adminModal.classList.remove("hidden");
      if (!adminUnlocked && pwdInput) setTimeout(() => pwdInput.focus(), 60);
    }

    document.querySelectorAll('[data-open-legal="changelog"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        syncAdminLockUI();
        if (clPwdInput) clPwdInput.value = "";
        if (!adminUnlocked && clPwdInput) setTimeout(() => clPwdInput.focus(), 60);
      });
    });

    if (clGate) {
      clGate.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const val = (clPwdInput ? clPwdInput.value : "").trim();
        if (checkAdminPwd(val)) {
          adminUnlocked = true;
          window.SoundFX && window.SoundFX.playCorrect(2);
          syncAdminLockUI();
        } else {
          window.SoundFX && window.SoundFX.playWrong();
          if (clPwdErr) clPwdErr.classList.remove("hidden");
        }
      });
    }

    if (btnOpenAdmin) {
      btnOpenAdmin.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        openAdminModal(false);
      });
    }

    if (authGate) {
      authGate.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const val = (pwdInput ? pwdInput.value : "").trim();
        if (checkAdminPwd(val)) {
          adminUnlocked = true;
          window.SoundFX && window.SoundFX.playCorrect(2);
          syncAdminLockUI();
          renderCounterDOM();
          renderAdminFeedbackList();
          if (typeof renderAdminPowerTools === "function") renderAdminPowerTools();
        } else {
          window.SoundFX && window.SoundFX.playWrong();
          if (pwdErr) pwdErr.classList.remove("hidden");
        }
      });
    }

    if (btnCloseAdmin && adminModal) {
      btnCloseAdmin.addEventListener("click", () => {
        if (window.MiniGames && typeof window.MiniGames.stop === "function") window.MiniGames.stop();
        adminModal.classList.add("hidden");
      });
    }

    // 版主一鍵測試／教學展示工具按鈕
    function showAdminToolToast(msg) {
      const t = document.getElementById("admin-tool-toast");
      if (!t) return;
      t.textContent = msg;
      t.classList.remove("hidden");
    }
    const btnAddCoins = document.getElementById("admin-btn-add-coins");
    if (btnAddCoins) {
      btnAddCoins.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        if (!u) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        u.coins = (u.coins || 0) + 1000;
        api.saveStore();
        api.refreshHome();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playFanfare(3);
        showAdminToolToast(`✅ 已為「${u.name}」增加 +1,000 金幣（目前共 ${u.coins} 金幣）！`);
      });
    }
    const btnAddCookies = document.getElementById("admin-btn-add-cookies");
    if (btnAddCookies) {
      btnAddCookies.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        if (!u) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        u.pet.cookies = (u.pet.cookies || 0) + 50;
        api.saveStore();
        api.refreshHome();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playFanfare(3);
        showAdminToolToast(`✅ 已為「${u.name}」增加 +50 塊寵物餅乾（目前共 ${u.pet.cookies} 塊）！`);
      });
    }
    const btnAddStars = document.getElementById("admin-btn-add-stars");
    if (btnAddStars) {
      btnAddStars.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        const bank = api ? api.getBank() : window.GRADE3_MATH_BANK;
        if (!u || !bank) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        if (!u.stageStars) u.stageStars = {};
        bank.units.slice(0, 3).forEach((unit) => {
          for (let s = 1; s <= 10; s++) u.stageStars[`${unit.id}-s${s}`] = 3;
        });
        api.saveStore();
        api.refreshHome();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playFanfare(3);
        showAdminToolToast(`✅ 已為「${u.name}」補滿前 3 單元共 90 顆星（5 號島、6 號島皆已解鎖）！`);
      });
    }
    const btnFullClear = document.getElementById("admin-btn-full-clear");
    if (btnFullClear) {
      btnFullClear.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        const bank = api ? api.getBank() : window.GRADE3_MATH_BANK;
        if (!u || !bank) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        if (!u.stageStars) u.stageStars = {};
        bank.units.forEach((unit) => {
          for (let s = 1; s <= 10; s++) u.stageStars[`${unit.id}-s${s}`] = 3;
        });
        api.saveStore();
        api.refreshHome();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playFanfare(3);
        showAdminToolToast(`👑 已為「${u.name}」開啟 160 關全破滿星（共 480 顆星，所有島嶼與大滿貫獎狀全解鎖）！`);
      });
    }

    // 3. 🛍️ 112 款商店裝飾＋9 枚徽章＋8 隻滿級寵物「版主一鍵全解鎖」
    const btnUnlockAllItems = document.getElementById("admin-btn-unlock-all-items");
    if (btnUnlockAllItems) {
      btnUnlockAllItems.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        if (!u) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        const shopList = (window.MathExtras && window.MathExtras.SHOP_ITEMS) || [];
        const badgeList = (window.MathExtras && window.MathExtras.BADGES) || [];
        u.ownedItems = shopList.map((it) => it.id);
        u.unlockedBadges = badgeList.map((b) => b.id);
        u.pet.xpMap = {};
        Object.keys(PET_SPECIES).forEach((spId) => {
          u.pet.xpMap[spId] = 100;
        });
        u.pet.xp = 100;
        u.pet.cookies = Math.max(99, u.pet.cookies || 0);
        if ((u.blitzBest || 0) < 350) u.blitzBest = 350;
        if (!u.checkin) u.checkin = { streak: 7, lastDate: todayStr() };
        else u.checkin.streak = Math.max(7, u.checkin.streak || 0);
        api.saveStore();
        api.refreshHome();
        renderPetPanel();
        renderPetQuizCheer();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playFanfare(3);
        showAdminToolToast(`🛍️ 已為「${u.name}」一鍵全解鎖：${u.ownedItems.length} 款商店裝飾（含 20 位說話 Q 版人物）＋ 9 枚榮譽徽章 ＋ 8 隻 100 滿級皇冠電子寵物！`);
      });
    }

    const btnResetUser = document.getElementById("admin-btn-reset-user");
    if (btnResetUser) {
      btnResetUser.addEventListener("click", () => {
        const u = api ? ensureSuperState(api.getUser()) : null;
        if (!u) return showAdminToolToast("⚠️ 請先登入一位冒險者角色再使用喔！");
        u.stageStars = {};
        u.originalStars = {};
        u.ownedItems = [];
        u.placedItems = [];
        u.customPositions = {};
        u.unlockedBadges = [];
        u.coins = 0;
        u.grandSlamClaimed = false;
        u.pet = { species: u.pet ? u.pet.species : "shiba", name: "柴犬麻糬", xp: 0, xpMap: { shiba: 0 }, cookies: 3, mood: 100, sleeping: false };
        api.saveStore();
        api.refreshHome();
        renderPetPanel();
        renderPetQuizCheer();
        renderAdminExtraAnalytics();
        window.SoundFX && window.SoundFX.playClick();
        showAdminToolToast(`↺ 已將「${u.name}」的星星、金幣、商店裝飾與寵物進度恢復為初始歸零狀態！`);
      });
    }

    // 原生 OpenXML .xlsx 產生器（支援自訂工作表名稱與欄寬陣列，Excel 直接開啟零警告彈窗、預設超寬欄寬不出現 ########）
    function buildTrueXlsxBlob(rows, customWidths, sheetTitle) {
      const enc = new TextEncoder();
      const crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        crcTable[n] = c >>> 0;
      }
      function crc32(bytes) {
        let c = 0xffffffff;
        for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
        return (c ^ 0xffffffff) >>> 0;
      }
      function xmlEsc(s) {
        return String(s ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      }
      const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      const widths = Array.isArray(customWidths) && customWidths.length
        ? customWidths
        : [10, 24, 22, 20, 26, 54];
      const colsXml = widths
        .map((w, idx) => `    <col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`)
        .join("\n");
      const safeSheetName = xmlEsc(sheetTitle || "意見回饋留言");
      const sheetRowsXml = rows
        .map((r, rIdx) => {
          const rowNum = rIdx + 1;
          const styleId = rIdx === 0 ? 1 : 2;
          const cells = r
            .map((val, cIdx) => `<c r="${colLetters[cIdx] || "A"}${rowNum}" s="${styleId}" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`)
            .join("");
          return `<row r="${rowNum}" ht="${rIdx === 0 ? 24 : 20}" customHeight="1">${cells}</row>`;
        })
        .join("");

      const files = [
        {
          name: "[Content_Types].xml",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
        },
        {
          name: "_rels/.rels",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
        },
        {
          name: "xl/workbook.xml",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
        },
        {
          name: "xl/_rels/workbook.xml.rels",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
        },
        {
          name: "xl/styles.xml",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Microsoft JhengHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF4A3525"/><name val="Microsoft JhengHei"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFCE8B2"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD0BC98"/></left>
      <right style="thin"><color rgb="FFD0BC98"/></right>
      <top style="thin"><color rgb="FFD0BC98"/></top>
      <bottom style="thin"><color rgb="FFD0BC98"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="49" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`,
        },
        {
          name: "xl/worksheets/sheet1.xml",
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
${colsXml}
  </cols>
  <sheetData>${sheetRowsXml}</sheetData>
</worksheet>`,
        },
      ];

      // 組裝 Store-only (無壓縮 Method 0) 標準 ZIP 二進位封包
      const localParts = [];
      const centralParts = [];
      let offset = 0;

      files.forEach((f) => {
        const nameBytes = enc.encode(f.name);
        const dataBytes = enc.encode(f.content);
        const crc = crc32(dataBytes);
        const size = dataBytes.length;

        const lh = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(lh.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0x0800, true);
        lv.setUint16(8, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lh.set(nameBytes, 30);
        localParts.push(lh, dataBytes);

        const ch = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(ch.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(42, offset, true);
        ch.set(nameBytes, 46);
        centralParts.push(ch);

        offset += lh.length + size;
      });

      const centralSize = centralParts.reduce((s, p) => s + p.length, 0);
      const eocd = new Uint8Array(22);
      const ev = new DataView(eocd.buffer);
      ev.setUint32(0, 0x06054b50, true);
      ev.setUint16(8, files.length, true);
      ev.setUint16(10, files.length, true);
      ev.setUint32(12, centralSize, true);
      ev.setUint32(16, offset, true);

      return new Blob([...localParts, ...centralParts, eocd], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    const btnExportCsv = document.getElementById("admin-btn-export-csv");
    if (btnExportCsv) {
      btnExportCsv.addEventListener("click", () => {
        let fbs = [];
        try {
          fbs = JSON.parse(localStorage.getItem("mai_site_feedback_inbox") || "[]");
        } catch (_) {}

        const rows = [["編號", "留言時間", "回饋類別", "您的稱呼", "回覆聯絡方式", "留言內容"]];
        if (!fbs.length) {
          rows.push(["-", "-", "-", "-", "-", "目前尚無收到的意見回饋留言"]);
        } else {
          fbs.forEach((f, i) => {
            rows.push([
              String(i + 1),
              String(f.date || ""),
              String(f.category || ""),
              String(f.sender || ""),
              String(f.replyTo || "未提供"),
              String(f.message || ""),
            ]);
          });
        }

        const blob = buildTrueXlsxBlob(rows);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `數學遊戲冒險島-意見回饋留言-${todayStr()}.xlsx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }

    const btnClearFb = document.getElementById("admin-btn-clear-feedback");
    if (btnClearFb) {
      btnClearFb.addEventListener("click", () => {
        localStorage.setItem("mai_site_feedback_inbox", "[]");
        renderAdminFeedbackList();
      });
    }

    // ==================== 版主專屬 4 大私密神器（20款小遊戲直通試玩、960題查題＆匯出Excel、系統空間與語音檢測） ====================
    const ADMIN_MINIGAMES_LIST = [
      { id: "catcher", label: "🌟 金幣接接樂" },
      { id: "memory", label: "🃏 甜點記憶翻牌" },
      { id: "whack", label: "🔨 寶箱敲敲樂" },
      { id: "wheel", label: "🎡 幸運大轉盤" },
      { id: "bubble", label: "🫧 泡泡戳戳樂" },
      { id: "make10", label: "🔟 湊十消消樂" },
      { id: "dice", label: "🎲 骰子比大小" },
      { id: "chest", label: "🗝️ 神秘寶箱三選一" },
      { id: "fishing", label: "🎣 池塘釣金魚" },
      { id: "color", label: "🎨 色彩快手王" },
      { id: "simon", label: "🎹 旋律記憶燈" },
      { id: "racing", label: "🏎️ 冒險島賽車" },
      { id: "plane", label: "✈️ 雲端開飛機" },
      { id: "scratch", label: "🎫 幸運刮刮樂" },
      { id: "slot", label: "🎰 水果拉霸機" },
      { id: "order", label: "🔢 數字點點看" },
      { id: "reaction", label: "⚡ 閃電反應王" },
      { id: "apple", label: "🍎 蘋果神射手" },
      { id: "emoji", label: "🔍 眼力找不同" },
      { id: "balloon", label: "🎈 充氣大氣球" },
    ];

    let all960QuestionsCache = null;
    function getAll960Questions() {
      if (all960QuestionsCache) return all960QuestionsCache;
      const list = [];
      const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
      if (bank && Array.isArray(bank.units)) {
        bank.units.forEach((u) => {
          (u.questions || []).forEach((q, idx) => {
            list.push({
              seq: list.length + 1,
              groupId: u.id,
              groupTitle: `第 ${String(u.order).padStart(2, "0")} 單元：${u.title}`,
              id: q.id || `${u.id}-q${idx + 1}`,
              stage: q.stage ? `第 ${q.stage} 關` : "-",
              difficulty: q.difficulty || "基礎",
              code: q.curriculumCode || (u.curriculumCodes && u.curriculumCodes[0]) || "108課綱",
              type: q.type === "choice" ? "選擇題" : "填充題",
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options.join(" ／ ") : "（填充題直接輸入答案）",
              answer: String(q.answer ?? ""),
              explanation: q.explanation || (Array.isArray(q.kidSteps) ? q.kidSteps.join(" ") : ""),
            });
          });
        });
      }
      const orig = window.ORIGINAL_MATH_CHALLENGES;
      if (Array.isArray(orig)) {
        orig.forEach((theme) => {
          (theme.questions || []).forEach((q, idx) => {
            list.push({
              seq: list.length + 1,
              groupId: theme.id,
              groupTitle: `原創主題 ${String(theme.order).padStart(2, "0")}：${theme.title}`,
              id: q.id || `${theme.id}-q${idx + 1}`,
              stage: `主題第 ${idx + 1} 題`,
              difficulty: q.difficulty || "基礎",
              code: q.curriculumCode || "素養挑戰",
              type: q.type === "choice" ? "選擇題" : "填充題",
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options.join(" ／ ") : "（填充題直接輸入答案）",
              answer: String(q.answer ?? ""),
              explanation: q.explanation || (Array.isArray(q.kidSteps) ? q.kidSteps.join(" ") : ""),
            });
          });
        });
      }
      all960QuestionsCache = list;
      return list;
    }

    function renderAdminQuestionBrowser() {
      const unitSel = document.getElementById("admin-qbank-unit");
      const searchIn = document.getElementById("admin-qbank-search");
      const countEl = document.getElementById("admin-qbank-count");
      const listEl = document.getElementById("admin-qbank-list");
      if (!unitSel || !listEl) return;

      const allQs = getAll960Questions();
      if (!unitSel.dataset.populated) {
        const bank = (api && api.getBank && api.getBank()) || window.GRADE3_MATH_BANK;
        const orig = window.ORIGINAL_MATH_CHALLENGES || [];
        let optsHtml = `<option value="ALL">📚 全部 960 題（16 個課綱單元 800 題 ＋ 8 大原創挑戰 160 題）</option>`;
        if (bank && Array.isArray(bank.units)) {
          bank.units.forEach((u) => {
            optsHtml += `<option value="${esc(u.id)}">📘 第 ${String(u.order).padStart(2, "0")} 單元：${esc(u.title)}（50 題）</option>`;
          });
        }
        orig.forEach((t) => {
          optsHtml += `<option value="${esc(t.id)}">✨ 原創主題 ${String(t.order).padStart(2, "0")}：${esc(t.title)}（20 題）</option>`;
        });
        unitSel.innerHTML = optsHtml;
        unitSel.dataset.populated = "1";
      }

      const selUnit = unitSel.value || "ALL";
      const kw = (searchIn ? searchIn.value : "").trim().toLowerCase();
      const filtered = allQs.filter((q) => {
        if (selUnit !== "ALL" && q.groupId !== selUnit) return false;
        if (!kw) return true;
        return (
          q.id.toLowerCase().includes(kw) ||
          q.question.toLowerCase().includes(kw) ||
          q.answer.toLowerCase().includes(kw) ||
          q.explanation.toLowerCase().includes(kw) ||
          q.code.toLowerCase().includes(kw) ||
          q.groupTitle.toLowerCase().includes(kw)
        );
      });

      const displaySlice = filtered.slice(0, 120);
      if (countEl) {
        countEl.textContent = `📊 符合條件共 ${filtered.length} 題（總題庫 ${allQs.length} 題${filtered.length > 120 ? "・畫面預覽前 120 題，選取特定單元或匯出 Excel 可查看全部" : ""}）`;
      }

      if (!displaySlice.length) {
        listEl.innerHTML = `<div style="padding:14px;text-align:center;color:var(--muted);font-weight:800;">找不到符合關鍵字「${esc(kw)}」的題目喔！</div>`;
        return;
      }

      listEl.innerHTML = displaySlice
        .map(
          (q) => `
          <div class="exam-review-row ok" style="flex-direction:column;align-items:flex-start;gap:4px;">
            <div style="display:flex;justify-content:space-between;width:100%;gap:8px;flex-wrap:wrap;font-size:0.79rem;color:var(--muted);font-weight:800;">
              <span>#${q.seq}｜<code>${esc(q.id)}</code>｜${esc(q.groupTitle)}（${esc(q.stage)}）</span>
              <span>[${esc(q.difficulty)}] [${esc(q.type)}] 課綱：${esc(q.code)}</span>
            </div>
            <div style="font-weight:900;color:var(--ink);font-size:0.92rem;">Q：${esc(q.question)}</div>
            ${q.type === "選擇題" ? `<div style="font-size:0.82rem;color:var(--ink-soft);">選項：${esc(q.options)}</div>` : ""}
            <div style="font-size:0.84rem;color:#2b7a48;font-weight:900;">✅ 標準答案：${esc(q.answer)}　<span style="color:var(--muted);font-weight:700;">｜💡 詳解：${esc(q.explanation)}</span></div>
          </div>`
        )
        .join("");
    }

    function renderAdminSystemDiagnostics() {
      const diagEl = document.getElementById("admin-system-diagnostics");
      if (!diagEl) return;

      let usedBytes = 0;
      let keyCount = 0;
      try {
        keyCount = localStorage.length;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || "";
          const v = localStorage.getItem(k) || "";
          usedBytes += (k.length + v.length) * 2;
        }
      } catch (_) {}
      const usedKb = (usedBytes / 1024).toFixed(1);
      const pct = Math.min(100, ((usedBytes / (5 * 1024 * 1024)) * 100)).toFixed(1);

      let voiceStatus = "🔇 瀏覽器不支援";
      try {
        if ("speechSynthesis" in window) {
          const voices = window.speechSynthesis.getVoices() || [];
          const zhVoice = voices.find((v) => /zh[-_]?TW/i.test(v.lang)) || voices.find((v) => /zh/i.test(v.lang));
          voiceStatus = zhVoice
            ? `🟢 就緒（${zhVoice.name.slice(0, 18)}）`
            : voices.length > 0
            ? `🟢 就緒（共 ${voices.length} 組語音）`
            : "🟢 語音引擎待機中";
        }
      } catch (_) {}

      const audioState = window.MathDeluxe && window.MathDeluxe.bgm && window.MathDeluxe.bgm.playing
        ? "🎵 BGM 播放中"
        : "⏸️ BGM 待命中";
      const netState = navigator.onLine ? "🟢 雲端連線正常" : "🟠 離線單機模式";

      diagEl.innerHTML = `
        <div class="wk-kpi"><span>💾 存檔空間使用量</span><strong>${usedKb} KB / 5,120 KB (${pct}%)</strong></div>
        <div class="wk-kpi"><span>🗂️ 本機資料表鍵數</span><strong>${keyCount} 組存檔區塊</strong></div>
        <div class="wk-kpi"><span>🗣️ 中文語音朗讀引擎</span><strong style="font-size:0.88rem;">${esc(voiceStatus)}</strong></div>
        <div class="wk-kpi"><span>🌐 網路與音效引擎</span><strong style="font-size:0.88rem;">${netState}｜${audioState}</strong></div>
      `;
    }

    function renderAdminPowerTools() {
      // 1. 初始化 20 款過關小遊戲免過關試玩按鈕
      const mgBtnsWrap = document.getElementById("admin-minigame-buttons");
      const mgStageWrap = document.getElementById("admin-minigame-stage-wrap");
      const mgStage = document.getElementById("admin-minigame-stage");
      const mgTitle = document.getElementById("admin-minigame-playing-title");
      if (mgBtnsWrap && !mgBtnsWrap.dataset.populated) {
        mgBtnsWrap.innerHTML = ADMIN_MINIGAMES_LIST.map(
          (g) => `<button type="button" class="btn btn-ghost btn-sm" data-admin-play-mg="${g.id}" data-admin-mg-label="${esc(g.label)}">${esc(g.label)}</button>`
        ).join("");
        mgBtnsWrap.dataset.populated = "1";

        mgBtnsWrap.addEventListener("click", (ev) => {
          const btn = ev.target.closest("[data-admin-play-mg]");
          if (!btn || !mgStage || !mgStageWrap) return;
          const gameId = btn.dataset.adminPlayMg;
          const gameLabel = btn.dataset.adminMgLabel || gameId;
          window.SoundFX && window.SoundFX.playClick();
          mgStageWrap.classList.remove("hidden");
          if (mgTitle) mgTitle.textContent = `🎮 正在試玩：${gameLabel}（版主免過關直通模式）`;
          if (window.MiniGames && typeof window.MiniGames.start === "function") {
            window.MiniGames.start(gameId, mgStage, (bonusCoins) => {
              const u = api ? ensureSuperState(api.getUser()) : null;
              if (u && bonusCoins > 0) {
                u.coins = (u.coins || 0) + bonusCoins;
                api.saveStore();
                api.refreshHome();
              }
              showAdminToolToast(`🎉 小遊戲「${gameLabel}」試玩完成！獲得獎勵 +${bonusCoins || 0} 金幣！`);
            });
          }
        });
      }

      renderAdminQuestionBrowser();
      renderAdminSystemDiagnostics();
    }

    const btnStopAdminMg = document.getElementById("admin-btn-stop-minigame");
    if (btnStopAdminMg) {
      btnStopAdminMg.addEventListener("click", () => {
        if (window.MiniGames && typeof window.MiniGames.stop === "function") window.MiniGames.stop();
        const wrap = document.getElementById("admin-minigame-stage-wrap");
        const stage = document.getElementById("admin-minigame-stage");
        if (stage) stage.innerHTML = "";
        if (wrap) wrap.classList.add("hidden");
      });
    }

    const qbankUnitSel = document.getElementById("admin-qbank-unit");
    const qbankSearchIn = document.getElementById("admin-qbank-search");
    if (qbankUnitSel) qbankUnitSel.addEventListener("change", renderAdminQuestionBrowser);
    if (qbankSearchIn) qbankSearchIn.addEventListener("input", renderAdminQuestionBrowser);

    const btnExport960 = document.getElementById("admin-btn-export-960-xlsx");
    if (btnExport960) {
      btnExport960.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        const allQs = getAll960Questions();
        const rows = [["總題號", "題目代碼", "所屬單元／主題", "關卡", "難度", "題型", "108課綱條目", "題目內容", "選項內容", "標準答案", "詳細解析"]];
        allQs.forEach((q) => {
          rows.push([
            String(q.seq),
            q.id,
            q.groupTitle,
            q.stage,
            q.difficulty,
            q.type,
            q.code,
            q.question,
            q.options,
            q.answer,
            q.explanation,
          ]);
        });
        const colWidths = [10, 14, 28, 12, 10, 10, 14, 52, 38, 18, 56];
        const blob = buildTrueXlsxBlob(rows, colWidths, "960題完整題庫與詳解");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `數學遊戲冒險島-960題完整題庫與詳解-${todayStr()}.xlsx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
        showAdminToolToast(`📚 已成功匯出全站 ${allQs.length} 題完整題庫與詳解 Excel (.xlsx) 檔案！`);
      });
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        if (adminUnlocked) renderAdminSystemDiagnostics();
      };
    }

    // 6. 📢 更版日誌「進版自動偵測與版本號自動更新」機制（連線 GitHub Repo 自動抓取最新進版次數與日期）
    async function syncAutoChangelogVersion() {
      const today = todayStr();
      document.querySelectorAll("[data-auto-date]").forEach((el) => {
        el.textContent = today;
      });
      try {
        const res = await fetch("https://api.github.com/repos/smallfishann97/math-adventure-island/commits?per_page=1");
        if (!res.ok) return;
        const link = res.headers.get("Link") || "";
        const m = link.match(/[&?]page=(\d+)>;\s*rel="last"/);
        const totalCommits = m ? Number(m[1]) : 45;
        const data = await res.json();
        const latestCommit = Array.isArray(data) && data[0] ? data[0] : null;
        const commitDate = latestCommit && latestCommit.commit && latestCommit.commit.committer
          ? latestCommit.commit.committer.date.slice(0, 10)
          : today;
        const patchNum = Math.max(0, totalCommits - 44);
        const autoVer = `v2.2.${patchNum}`;
        document.querySelectorAll("[data-auto-ver]").forEach((el) => {
          el.textContent = autoVer;
        });
        document.querySelectorAll("[data-auto-date]").forEach((el) => {
          el.textContent = `${commitDate}・Build #${totalCommits}`;
        });
      } catch (_) {}
    }
    syncAutoChangelogVersion();

    try {
      const params = new URLSearchParams(window.location.search);
      if (checkAdminPwd(params.get("admin"))) {
        setTimeout(() => openAdminModal(true), 500);
      }
    } catch (_) {}

    // 7. 🏆 公開冒險者榮譽排行榜（登入頁、頂部導覽列與頁尾皆可公開開啟）
    const lbModal = document.getElementById("leaderboard-modal");
    const btnCloseLb = document.getElementById("btn-close-leaderboard");
    const lbTabs = document.getElementById("lb-sort-tabs");
    let currentLbSort = "stars";

    function getTitleByStars(stars, cleared) {
      if (cleared >= 160) return "👑 傳說大滿貫島主";
      if (stars >= 120) return "🎓 冒險島數學大博士";
      if (stars >= 60) return "🌟 皇冠天空探險王";
      if (stars >= 30) return "🏘️ 職人小鎮開拓者";
      if (stars >= 10) return "🧭 勇敢航海小達人";
      return "🌱 新星見習冒險家";
    }

    function renderPublicLeaderboard() {
      const podiumEl = document.getElementById("leaderboard-podium");
      const listEl = document.getElementById("leaderboard-list");
      if (!podiumEl || !listEl) return;

      let usersMap = {};
      let activeUid = null;
      try {
        const raw = localStorage.getItem("grade3_math_luxury_store_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          usersMap = (parsed && parsed.users) || {};
          activeUid = parsed && parsed.activeUserId;
        }
      } catch (_) {}

      const entries = Object.values(usersMap).map((u) => {
        const cleared = Object.values(u.stageStars || {}).filter((s) => s > 0).length;
        const stars = Object.values(u.stageStars || {}).reduce((a, b) => a + b, 0);
        const coins = u.coins || 0;
        const ownedCnt = (u.ownedItems || []).length;
        const hist = u.history || [];
        const totalQ = hist.reduce((s, h) => s + (h.total || 0), 0);
        const okQ = hist.reduce((s, h) => s + (h.correct || 0), 0);
        const acc = totalQ > 0 ? Math.round((okQ / totalQ) * 100) : 0;
        let petTotalXp = 0;
        if (u.pet && u.pet.xpMap) {
          petTotalXp = Object.values(u.pet.xpMap).reduce((a, b) => a + Math.min(100, Number(b) || 0), 0);
        } else if (u.pet && u.pet.xp) {
          petTotalXp = Math.min(100, Number(u.pet.xp) || 0);
        }
        return {
          id: u.id,
          name: u.name || "冒險者",
          avatar: u.avatar || "shiba",
          cleared,
          stars,
          coins,
          ownedCnt,
          totalQ,
          okQ,
          acc,
          petTotalXp,
          title: getTitleByStars(stars, cleared),
          isMe: Boolean(activeUid && u.id === activeUid),
        };
      });

      if (!entries.length) {
        podiumEl.innerHTML = "";
        listEl.innerHTML = `<p style="text-align:center;color:var(--muted);font-weight:800;padding:24px;">目前尚未建立冒險者身分，快回登入頁建立第一個冒險者搶下冠軍寶座吧！</p>`;
        return;
      }

      entries.sort((a, b) => {
        if (currentLbSort === "coins") return b.coins - a.coins || b.ownedCnt - a.ownedCnt || b.stars - a.stars;
        if (currentLbSort === "accuracy") return b.okQ - a.okQ || b.acc - a.acc || b.stars - a.stars;
        if (currentLbSort === "pets") return b.petTotalXp - a.petTotalXp || b.stars - a.stars;
        return b.stars - a.stars || b.cleared - a.cleared || b.coins - a.coins;
      });

      const medals = ["🥇 冠軍", "🥈 亞軍", "🥉 季軍"];
      const top3 = entries.slice(0, 3);
      podiumEl.innerHTML = top3
        .map((e, i) => {
          const avHtml = window.AvatarArt ? window.AvatarArt.render(e.avatar, "avatar-md") : "🦊";
          const mainMetric =
            currentLbSort === "coins"
              ? `🪙 ${e.coins.toLocaleString()} 金幣（收藏 ${e.ownedCnt} 件）`
              : currentLbSort === "accuracy"
              ? `🎯 答對 ${e.okQ} 題（正確率 ${e.acc}%）`
              : currentLbSort === "pets"
              ? `🐾 寵物總成長 ${e.petTotalXp} 點`
              : `⭐ ${e.stars} 顆星（通關 ${e.cleared}/160）`;
          return `
            <div class="lb-podium-card rank-${i + 1} ${e.isMe ? "is-me" : ""}">
              <div class="lb-medal-tag">${medals[i]}</div>
              <div class="lb-podium-avatar">${avHtml}</div>
              <strong class="lb-podium-name">${esc(e.name)}${e.isMe ? ` <span class="lb-me-tag">目前登入</span>` : ""}</strong>
              <span class="lb-title-badge">${e.title}</span>
              <div class="lb-podium-metric">${mainMetric}</div>
            </div>`;
        })
        .join("");

      listEl.innerHTML = entries
        .map((e, i) => {
          const avHtml = window.AvatarArt ? window.AvatarArt.render(e.avatar, "avatar-sm") : "🦊";
          const rankBadge = i === 0 ? "🥇 1" : i === 1 ? "🥈 2" : i === 2 ? "🥉 3" : `第 ${i + 1} 名`;
          return `
            <div class="lb-row ${e.isMe ? "is-me" : ""}">
              <div class="lb-row-left">
                <span class="lb-rank-num">${rankBadge}</span>
                ${avHtml}
                <div>
                  <strong>${esc(e.name)}${e.isMe ? ` <span class="lb-me-tag">目前登入</span>` : ""}</strong>
                  <span class="lb-title-inline">${e.title}</span>
                </div>
              </div>
              <div class="lb-row-stats">
                <span>⭐ <b>${e.stars}</b> 星 (${e.cleared}/160關)</span>
                <span>🪙 <b>${e.coins}</b> 金幣</span>
                <span>🎯 答對 <b>${e.okQ}</b> 題 (${e.acc}%)</span>
                <span>🐾 寵物 <b>${e.petTotalXp}</b> 點</span>
              </div>
            </div>`;
        })
        .join("");
    }

    document.querySelectorAll("[data-open-leaderboard]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        renderPublicLeaderboard();
        if (lbModal) lbModal.classList.remove("hidden");
      });
    });

    if (lbTabs) {
      lbTabs.addEventListener("click", (ev) => {
        const b = ev.target.closest("button[data-lb-sort]");
        if (!b) return;
        window.SoundFX && window.SoundFX.playClick();
        currentLbSort = b.dataset.lbSort;
        lbTabs.querySelectorAll("button[data-lb-sort]").forEach((el) => {
          el.classList.toggle("active", el === b);
        });
        renderPublicLeaderboard();
      });
    }

    if (btnCloseLb && lbModal) {
      btnCloseLb.addEventListener("click", () => lbModal.classList.add("hidden"));
    }

    // 8. ↑ 返回頂部按鈕（頁尾膠囊＋往下捲動時右下角自動浮現）
    const floatingTopBtn = document.getElementById("floating-back-to-top");
    document.querySelectorAll("[data-back-to-top]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX && window.SoundFX.playClick();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    if (floatingTopBtn) {
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          floatingTopBtn.classList.toggle("hidden", y < 260);
        },
        { passive: true }
      );
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
      renderCounterDOM();
    },
    recordEvent,
    renderWeeklyReport,
    renderPetQuizCheer,
  };
})();
