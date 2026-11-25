/**
 * 國小三年級數學「精品暖色調」SVG 圖形化說明引擎
 * 支援題目看圖作答（questionVisual）與解答圖形化說明（visual）
 */
(function () {
  // 精品高級色票（無俗氣亮藍）
  const PALETTE = {
    ink: "#2c241e",
    muted: "#78695c",
    gold: "#b8863b",
    goldSoft: "#f7efe0",
    forest: "#2d5a4c",
    forestSoft: "#e7f1ee",
    burgundy: "#a63a3a",
    burgundySoft: "#fbeded",
    amber: "#d97706",
    amberSoft: "#fef3db",
    sand: "#ebe3d5",
    ivory: "#fcfaf6"
  };

  function mapColor(c) {
    if (!c) return PALETTE.gold;
    const low = c.toLowerCase();
    if (low === "#3b82f6" || low === "#2563eb" || low === "#60a5fa") return PALETTE.forest;
    if (low === "#10b981" || low === "#16a34a") return "#3a7d5c";
    if (low === "#ef4444") return PALETTE.burgundy;
    if (low === "#f59e0b") return PALETTE.gold;
    return c;
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapSvg(svgBody, width, height, caption) {
    return `
      <figure class="math-visual-figure">
        <svg viewBox="0 0 ${width} ${height}" class="math-visual-svg" role="img" aria-label="${esc(caption || "數學圖解")}">
          ${svgBody}
        </svg>
        ${caption ? `<figcaption class="math-visual-caption">📌 ${esc(caption)}</figcaption>` : ""}
      </figure>
    `;
  }

  function renderPlaceValue(v, isQ) {
    const headers = ["萬位", "千位", "百位", "十位", "個位"];
    const digits = v.digits || [0, 0, 0, 0, 0];
    const hideVals = Boolean(isQ || v.hideDigits);
    const hl = new Set(v.highlight || []);
    const cellW = 86;
    const startX = 25;
    let body = "";
    headers.forEach((h, i) => {
      const x = startX + i * cellW;
      const isHl = hl.has(i);
      const fillTop = isHl ? PALETTE.gold : PALETTE.forest;
      const fillCell = isHl ? PALETTE.goldSoft : "#ffffff";
      const valText = hideVals ? (i === 0 ? "—" : "？") : digits[i];
      body += `
        <rect x="${x}" y="14" width="${cellW - 8}" height="32" rx="8" fill="${fillTop}" />
        <text x="${x + (cellW - 8) / 2}" y="35" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">${h}</text>
        <rect x="${x}" y="52" width="${cellW - 8}" height="52" rx="10" fill="${fillCell}" stroke="${isHl ? PALETTE.gold : PALETTE.sand}" stroke-width="2" />
        <text x="${x + (cellW - 8) / 2}" y="87" text-anchor="middle" fill="${hideVals ? PALETTE.muted : PALETTE.ink}" font-size="26" font-weight="900">${valText}</text>
      `;
    });
    const cap = hideVals ? "請把題目中的國字數字對應填入千位、百位、十位、個位！" : v.caption;
    return wrapSvg(body, 480, 118, cap);
  }

  function renderVerticalCalc(v) {
    const a = String(v.a);
    const b = String(v.b);
    const res = String(v.result);
    const body = `
      <rect x="95" y="10" width="290" height="136" rx="14" fill="${PALETTE.ivory}" stroke="${PALETTE.sand}" stroke-width="2" />
      <text x="330" y="48" text-anchor="end" fill="${PALETTE.ink}" font-size="28" font-weight="900" letter-spacing="6">${esc(a)}</text>
      <text x="145" y="88" text-anchor="middle" fill="${PALETTE.gold}" font-size="28" font-weight="900">${esc(v.op)}</text>
      <text x="330" y="88" text-anchor="end" fill="${PALETTE.ink}" font-size="28" font-weight="900" letter-spacing="6">${esc(b)}</text>
      <line x1="125" y1="100" x2="350" y2="100" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <text x="330" y="134" text-anchor="end" fill="${PALETTE.forest}" font-size="30" font-weight="900" letter-spacing="6">${esc(res)}</text>
    `;
    return wrapSvg(body, 480, 156, v.caption);
  }

  function renderNumberLine(v) {
    const pts = v.points || [];
    const n = pts.length;
    const padX = 48;
    const lineY = 76;
    const w = 500;
    const span = w - padX * 2;
    const xs = pts.map((_, i) => (n <= 1 ? w / 2 : padX + (span * i) / (n - 1)));

    let body = `
      <line x1="22" y1="${lineY}" x2="${w - 18}" y2="${lineY}" stroke="${PALETTE.ink}" stroke-width="3" />
      <polygon points="${w - 12},${lineY} ${w - 24},${lineY - 7} ${w - 24},${lineY + 7}" fill="${PALETTE.ink}" />
    `;

    (v.jumps || []).forEach((j) => {
      const x1 = xs[j.from];
      const x2 = xs[j.to];
      if (x1 == null || x2 == null) return;
      const mx = (x1 + x2) / 2;
      const cy = j.below ? lineY + 46 : lineY - 44;
      const color = j.below ? PALETTE.burgundy : PALETTE.gold;
      body += `
        <path d="M ${x1} ${lineY} Q ${mx} ${cy} ${x2} ${lineY}" fill="none" stroke="${color}" stroke-width="2.6" stroke-dasharray="5 3" />
        <text x="${mx}" y="${j.below ? lineY + 48 : lineY - 30}" text-anchor="middle" fill="${color}" font-size="13" font-weight="800">${esc(j.label)}</text>
      `;
    });

    pts.forEach((p, i) => {
      const x = xs[i];
      const isQ = String(p).includes("？");
      body += `
        <circle cx="${x}" cy="${lineY}" r="6" fill="${isQ ? PALETTE.burgundy : PALETTE.forest}" />
        <text x="${x}" y="${lineY + 26}" text-anchor="middle" fill="${isQ ? PALETTE.burgundy : PALETTE.ink}" font-size="15" font-weight="900">${esc(p)}</text>
      `;
    });

    return wrapSvg(body, w, 138, v.caption);
  }

  function renderBarCompare(v) {
    const items = v.items || [];
    const maxVal = Math.max(...items.map((it) => Number(it.value) || 1), 1);
    const rowH = 34;
    const h = items.length * rowH + 20;
    let body = "";
    items.forEach((it, i) => {
      const y = 14 + i * rowH;
      const bw = Math.max(24, ((Number(it.value) || 0) / maxVal) * 260);
      const col = mapColor(it.color);
      body += `
        <text x="155" y="${y + 18}" text-anchor="end" fill="${PALETTE.ink}" font-size="13" font-weight="800">${esc(it.label)}</text>
        <rect x="166" y="${y + 3}" width="${bw}" height="22" rx="8" fill="${col}" />
      `;
    });
    return wrapSvg(body, 480, h, v.caption);
  }

  function renderTwoStep(v) {
    const body = `
      <rect x="24" y="14" width="432" height="44" rx="12" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2" />
      <text x="40" y="41" fill="${PALETTE.ink}" font-size="15" font-weight="800">① ${esc(v.step1)}</text>
      <text x="240" y="76" text-anchor="middle" fill="${PALETTE.gold}" font-size="20" font-weight="900">▼</text>
      <rect x="24" y="84" width="432" height="44" rx="12" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="2" />
      <text x="40" y="111" fill="${PALETTE.forest}" font-size="15" font-weight="900">② ${esc(v.step2)}</text>
    `;
    return wrapSvg(body, 480, 140, v.caption);
  }

  function renderRuler(v, isQ) {
    const maxCm = Math.max(3, v.maxCm || 10);
    const totalMm = maxCm * 10;
    const padX = 28;
    const w = 500;
    const span = w - padX * 2;
    const mmW = span / totalMm;
    const rulerY = 66;

    const xStart = padX + (v.startMm || 0) * mmW;
    const xEnd = padX + (v.endMm || 0) * mmW;
    const lenMm = (v.endMm || 0) - (v.startMm || 0);

    let ticks = "";
    for (let m = 0; m <= totalMm; m++) {
      const x = padX + m * mmW;
      const isCm = m % 10 === 0;
      const isHalf = m % 5 === 0 && !isCm;
      const th = isCm ? 24 : isHalf ? 16 : 10;
      ticks += `<line x1="${x}" y1="${rulerY}" x2="${x}" y2="${rulerY + th}" stroke="${PALETTE.ink}" stroke-width="${isCm ? 2 : 1}" />`;
      if (isCm) {
        ticks += `<text x="${x}" y="${rulerY + 40}" text-anchor="middle" fill="${PALETTE.ink}" font-size="13" font-weight="800">${m / 10}</text>`;
      }
    }

    const hideLen = Boolean(isQ || v.hideLength);
    const labelText = hideLen ? "長度 ＝ ？ 毫米" : `${lenMm} 毫米 (${(lenMm / 10).toFixed(1)} cm)`;
    const cap = hideLen ? "請仔細觀察直尺上的公分大格與毫米小格刻度，算出紙條長度！" : v.caption;
    const body = `
      <rect x="${xStart}" y="22" width="${Math.max(4, xEnd - xStart)}" height="28" rx="6" fill="${PALETTE.burgundy}" opacity="0.88" />
      <text x="${(xStart + xEnd) / 2}" y="41" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">${esc(labelText)}</text>
      <line x1="${xStart}" y1="50" x2="${xStart}" y2="${rulerY}" stroke="${PALETTE.burgundy}" stroke-width="2" stroke-dasharray="3 2" />
      <line x1="${xEnd}" y1="50" x2="${xEnd}" y2="${rulerY}" stroke="${PALETTE.burgundy}" stroke-width="2" stroke-dasharray="3 2" />
      <rect x="${padX - 10}" y="${rulerY}" width="${span + 20}" height="52" rx="8" fill="#f3e9d2" stroke="${PALETTE.gold}" stroke-width="2" />
      ${ticks}
      <text x="${w - 20}" y="${rulerY + 46}" text-anchor="end" fill="${PALETTE.muted}" font-size="11" font-weight="700">單位: cm</text>
    `;
    return wrapSvg(body, w, 130, cap);
  }

  function renderOverlap(v) {
    const body = `
      <rect x="40" y="26" width="230" height="24" rx="6" fill="${PALETTE.forest}" opacity="0.85" />
      <text x="155" y="43" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">木棒 1：${esc(v.len1)}</text>
      <rect x="210" y="56" width="230" height="24" rx="6" fill="${PALETTE.gold}" opacity="0.9" />
      <text x="325" y="73" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">木棒 2：${esc(v.len2)}</text>
      <rect x="210" y="22" width="60" height="62" rx="4" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2.5" stroke-dasharray="4 3" />
      <text x="240" y="102" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="13" font-weight="900">重疊 ${esc(v.overlap)}</text>
      <line x1="40" y1="118" x2="440" y2="118" stroke="${PALETTE.ink}" stroke-width="2" />
      <text x="240" y="136" text-anchor="middle" fill="${PALETTE.ink}" font-size="14" font-weight="900">${esc(v.total)}</text>
    `;
    return wrapSvg(body, 480, 146, v.caption);
  }

  function renderDivisionGroup(v) {
    const body = `
      <rect x="24" y="14" width="432" height="108" rx="14" fill="${PALETTE.ivory}" stroke="${PALETTE.sand}" stroke-width="2" />
      <rect x="42" y="30" width="110" height="44" rx="10" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2" />
      <text x="97" y="48" text-anchor="middle" fill="${PALETTE.muted}" font-size="11" font-weight="700">全部 (被除數)</text>
      <text x="97" y="67" text-anchor="middle" fill="${PALETTE.ink}" font-size="18" font-weight="900">${esc(v.total)}</text>

      <text x="169" y="58" text-anchor="middle" fill="${PALETTE.gold}" font-size="22" font-weight="900">÷</text>

      <rect x="186" y="30" width="90" height="44" rx="10" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="2" />
      <text x="231" y="48" text-anchor="middle" fill="${PALETTE.muted}" font-size="11" font-weight="700">每組 (除數)</text>
      <text x="231" y="67" text-anchor="middle" fill="${PALETTE.forest}" font-size="18" font-weight="900">${esc(v.divisor)}</text>

      <text x="293" y="58" text-anchor="middle" fill="${PALETTE.gold}" font-size="22" font-weight="900">=</text>

      <rect x="310" y="30" width="130" height="44" rx="10" fill="${PALETTE.burgundySoft}" stroke="${PALETTE.burgundy}" stroke-width="2" />
      <text x="375" y="48" text-anchor="middle" fill="${PALETTE.muted}" font-size="11" font-weight="700">商 … 餘數</text>
      <text x="375" y="67" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="17" font-weight="900">${esc(v.quotient)} … 餘 ${esc(v.remainder)}</text>

      <text x="240" y="106" text-anchor="middle" fill="${PALETTE.ink}" font-size="13" font-weight="800">${esc(v.extraNote || `檢查規則：餘數 (${v.remainder}) 一定要小於 除數 (${v.divisor})！`)}</text>
    `;
    return wrapSvg(body, 480, 132, v.caption);
  }

  function renderInverseTriangle(v) {
    const body = `
      <polygon points="240,14 115,126 365,126" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2.5" stroke-linejoin="round" />
      <line x1="175" y1="72" x2="305" y2="72" stroke="${PALETTE.gold}" stroke-width="2" stroke-dasharray="4 3" />
      <text x="240" y="58" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="17" font-weight="900">${esc(v.top)}</text>
      <text x="175" y="110" text-anchor="middle" fill="${PALETTE.forest}" font-size="16" font-weight="900">${esc(v.left)}</text>
      <text x="240" y="110" text-anchor="middle" fill="${PALETTE.gold}" font-size="18" font-weight="900">×</text>
      <text x="305" y="110" text-anchor="middle" fill="${PALETTE.forest}" font-size="16" font-weight="900">${esc(v.right)}</text>
      <text x="240" y="148" text-anchor="middle" fill="${PALETTE.ink}" font-size="14" font-weight="900">${esc(v.formula || "")}</text>
    `;
    return wrapSvg(body, 480, 158, v.caption);
  }

  function renderFractionBar(v) {
    const den = Math.max(2, v.denom || 8);
    const barW = 420;
    const cellW = barW / den;
    const startX = 30;
    const y = 34;
    const h = 42;
    let body = "";

    let cursor = 0;
    let labels = "";
    (v.parts || []).forEach((pt) => {
      const col = mapColor(pt.color);
      const startPart = cursor;
      for (let i = 0; i < pt.count && cursor < den; i++) {
        body += `<rect x="${startX + cursor * cellW}" y="${y}" width="${cellW}" height="${h}" fill="${col}" opacity="0.88" />`;
        cursor++;
      }
      const midX = startX + ((startPart + cursor) / 2) * cellW;
      if (pt.label) {
        labels += `<text x="${midX}" y="24" text-anchor="middle" fill="${col}" font-size="13" font-weight="900">${esc(pt.label)}</text>`;
      }
    });

    for (let i = 0; i < den; i++) {
      body += `<rect x="${startX + i * cellW}" y="${y}" width="${cellW}" height="${h}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" />`;
    }

    body += `<text x="240" y="98" text-anchor="middle" fill="${PALETTE.muted}" font-size="13" font-weight="800">共平分成 ${den} 格（每 1 格 ＝ 1/${den}）</text>`;
    return wrapSvg(labels + body, 480, 110, v.caption);
  }

  function renderAngles(v, isQ) {
    const lbl1 = isQ ? "銳角" : "銳角 (比直角小)";
    const lbl2 = isQ ? "直角" : "直角 (90°)";
    const lbl3 = isQ ? "鈍角" : "鈍角 (比直角大)";
    const body = `
      <!-- 銳角 -->
      <line x1="40" y1="100" x2="135" y2="100" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <line x1="40" y1="100" x2="112" y2="42" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <path d="M 74 100 A 34 34 0 0 0 66 78" fill="none" stroke="${PALETTE.forest}" stroke-width="3" />
      <text x="85" y="124" text-anchor="middle" fill="${PALETTE.forest}" font-size="14" font-weight="900">${lbl1}</text>

      <!-- 直角 -->
      <line x1="195" y1="100" x2="290" y2="100" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <line x1="195" y1="100" x2="195" y2="26" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <polyline points="195,82 213,82 213,100" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2.6" />
      <text x="242" y="124" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="14" font-weight="900">${lbl2}</text>

      <!-- 鈍角 -->
      <line x1="375" y1="100" x2="455" y2="100" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <line x1="375" y1="100" x2="325" y2="38" stroke="${PALETTE.ink}" stroke-width="3" stroke-linecap="round" />
      <path d="M 407 100 A 32 32 0 0 0 354 75" fill="none" stroke="${PALETTE.gold}" stroke-width="3" />
      <text x="392" y="124" text-anchor="middle" fill="${PALETTE.gold}" font-size="14" font-weight="900">${lbl3}</text>
    `;
    return wrapSvg(body, 480, 138, v.caption);
  }

  function renderClockAngle(v) {
    const cx = 240, cy = 74, r = 58;
    const hr = v.hour || 3;
    const hrRad = ((hr % 12) * 30 - 90) * (Math.PI / 180);
    const hx = cx + Math.cos(hrRad) * 34;
    const hy = cy + Math.sin(hrRad) * 34;
    let nums = "";
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 - 90) * (Math.PI / 180);
      nums += `<text x="${cx + Math.cos(a) * 46}" y="${cy + Math.sin(a) * 46 + 4}" text-anchor="middle" fill="${PALETTE.ink}" font-size="11" font-weight="800">${i}</text>`;
    }
    const rightMark = (hr === 3 || hr === 9)
      ? `<rect x="${hr === 3 ? cx : cx - 12}" y="${cy - 12}" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />`
      : "";
    const body = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${PALETTE.ivory}" stroke="${PALETTE.gold}" stroke-width="3.5" />
      ${nums}
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 44}" stroke="${PALETTE.forest}" stroke-width="3" stroke-linecap="round" />
      <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${PALETTE.burgundy}" stroke-width="4.5" stroke-linecap="round" />
      ${rightMark}
      <circle cx="${cx}" cy="${cy}" r="4.5" fill="${PALETTE.ink}" />
    `;
    return wrapSvg(body, 480, 146, v.caption);
  }

  function renderTiltedSquare(v) {
    const body = `
      <g transform="translate(240,72) rotate(45)">
        <rect x="-42" y="-42" width="84" height="84" fill="${PALETTE.goldSoft}" stroke="${PALETTE.forest}" stroke-width="3" />
        <rect x="-42" y="-42" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
        <rect x="30" y="-42" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
        <rect x="-42" y="30" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
        <rect x="30" y="30" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
      </g>
      <text x="350" y="76" fill="${PALETTE.ink}" font-size="14" font-weight="900">4 條邊等長＋4 個直角</text>
    `;
    return wrapSvg(body, 480, 144, v.caption);
  }

  function renderRectangle(v) {
    const rw = v.isSquare ? 96 : 168;
    const rh = 96;
    const x = (480 - rw) / 2;
    const y = 26;
    const ra = v.showRightAngles
      ? `<rect x="${x}" y="${y}" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
         <rect x="${x + rw - 12}" y="${y}" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
         <rect x="${x}" y="${y + rh - 12}" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />
         <rect x="${x + rw - 12}" y="${y + rh - 12}" width="12" height="12" fill="none" stroke="${PALETTE.burgundy}" stroke-width="2" />`
      : "";
    const body = `
      <rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="3" />
      ${ra}
      <text x="240" y="${y - 8}" text-anchor="middle" fill="${PALETTE.ink}" font-size="14" font-weight="900">${esc(v.w)}</text>
      <text x="${x + rw + 14}" y="${y + rh / 2 + 5}" fill="${PALETTE.ink}" font-size="14" font-weight="900">${esc(v.h)}</text>
    `;
    return wrapSvg(body, 480, 140, v.caption);
  }

  function renderCircle(v) {
    const cx = 240, cy = 74, r = 54;
    const extra = v.multiDiameters
      ? `<line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${PALETTE.gold}" stroke-width="2" stroke-dasharray="4 3" />
         <line x1="${cx - 38}" y1="${cy - 38}" x2="${cx + 38}" y2="${cy + 38}" stroke="${PALETTE.gold}" stroke-width="2" stroke-dasharray="4 3" />`
      : "";
    const body = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${PALETTE.ivory}" stroke="${PALETTE.ink}" stroke-width="3" />
      ${extra}
      <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${PALETTE.burgundy}" stroke-width="3" />
      <line x1="${cx}" y1="${cy}" x2="${cx + r * 0.7}" y2="${cy - r * 0.7}" stroke="${PALETTE.forest}" stroke-width="3" />
      <circle cx="${cx}" cy="${cy}" r="5" fill="${PALETTE.ink}" />
      <text x="${cx + 68}" y="${cy - 28}" fill="${PALETTE.forest}" font-size="14" font-weight="900">半徑＝${esc(v.r)}</text>
      <text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="14" font-weight="900">直徑＝${esc(v.d)}</text>
    `;
    return wrapSvg(body, 480, 146, v.caption);
  }

  function renderCirclesRow(v) {
    const cnt = Math.min(5, v.count || 3);
    const r = 34;
    const totalW = cnt * r * 2;
    const startX = (480 - totalW) / 2 + r;
    let body = "";
    for (let i = 0; i < cnt; i++) {
      const cx = startX + i * r * 2;
      body += `
        <circle cx="${cx}" cy="60" r="${r}" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2.8" />
        <circle cx="${cx}" cy="60" r="3" fill="${PALETTE.ink}" />
        <line x1="${cx}" y1="60" x2="${cx + r}" y2="60" stroke="${PALETTE.forest}" stroke-width="2.5" />
        <text x="${cx + r / 2}" y="53" text-anchor="middle" fill="${PALETTE.forest}" font-size="12" font-weight="900">${esc(v.r)}</text>
      `;
    }
    const leftX = startX - r;
    const rightX = startX + (cnt - 1) * r * 2 + r;
    const totTxt = v.hideTotal ? "總長度 ＝ ？ 公分" : `總長度 ＝ ${cnt * v.r * 2} 公分`;
    body += `
      <line x1="${leftX}" y1="112" x2="${rightX}" y2="112" stroke="${PALETTE.burgundy}" stroke-width="2.5" />
      <text x="240" y="132" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="14" font-weight="900">${esc(totTxt)}</text>
    `;
    return wrapSvg(body, 480, 144, v.caption);
  }

  function renderCircleInSquare(v) {
    const s = 104;
    const x = (480 - s) / 2;
    const y = 20;
    const cx = 240, cy = y + s / 2;
    const rTxt = v.hideRadius ? "半徑＝？" : `半徑＝${v.side / 2}`;
    const body = `
      <rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${PALETTE.goldSoft}" stroke="${PALETTE.ink}" stroke-width="2.5" />
      <circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="3" />
      <line x1="${cx}" y1="${cy}" x2="${cx + s / 2}" y2="${cy}" stroke="${PALETTE.burgundy}" stroke-width="3" />
      <circle cx="${cx}" cy="${cy}" r="4" fill="${PALETTE.ink}" />
      <text x="${x - 14}" y="${cy + 5}" text-anchor="end" fill="${PALETTE.ink}" font-size="14" font-weight="900">邊長 ${esc(v.side)}cm</text>
      <text x="${x + s + 14}" y="${cy + 5}" fill="${PALETTE.burgundy}" font-size="14" font-weight="900">${esc(rTxt)}</text>
    `;
    return wrapSvg(body, 480, 142, v.caption);
  }

  function renderGridArea(v) {
    const cols = Math.min(10, v.cols || 5);
    const rows = Math.min(6, v.rows || 3);
    const cell = 24;
    const gw = cols * cell;
    const gh = rows * cell;
    const sx = (480 - gw) / 2;
    const sy = 22;
    let cells = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells += `<rect x="${sx + c * cell}" y="${sy + r * cell}" width="${cell}" height="${cell}" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="1.6" />`;
      }
    }
    const label = v.hideAns ? `每格 1 平方公分（橫 ${cols} 格 × 直 ${rows} 排）` : `${cols} × ${rows} = ${cols * rows} 平方公分`;
    const body = `
      ${cells}
      <text x="240" y="${sy + gh + 22}" text-anchor="middle" fill="${PALETTE.ink}" font-size="14" font-weight="900">${esc(label)}</text>
    `;
    return wrapSvg(body, 480, sy + gh + 32, v.caption);
  }

  function renderHalfGrid(v) {
    const full = v.full || 6;
    const half = v.half || 4;
    const cell = 26;
    let body = "";
    const totalCols = Math.min(10, full);
    for (let i = 0; i < totalCols; i++) {
      body += `<rect x="${30 + i * (cell + 4)}" y="24" width="${cell}" height="${cell}" fill="${PALETTE.forest}" opacity="0.85" rx="3" />`;
    }
    body += `<text x="30" y="18" fill="${PALETTE.forest}" font-size="12" font-weight="900">完整格：${full} 個</text>`;

    for (let i = 0; i < Math.min(10, half); i++) {
      const x = 30 + i * (cell + 6);
      const y = 78;
      body += `<polygon points="${x},${y + cell} ${x + cell},${y + cell} ${x},${y}" fill="${PALETTE.gold}" stroke="${PALETTE.ink}" stroke-width="1.2" />`;
    }
    body += `<text x="30" y="72" fill="${PALETTE.gold}" font-size="12" font-weight="900">半格：${half} 個（每 2 個半格 ＝ 1 個完整格）</text>`;
    return wrapSvg(body, 480, 120, v.caption);
  }

  function renderCutRearrange(v, isQ) {
    const rightText = isQ ? "重新拼裝：新面積 ＝ ？" : "重新拼裝：總面積不變！";
    const body = `
      <rect x="70" y="24" width="84" height="84" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2.5" />
      <line x1="70" y1="66" x2="154" y2="66" stroke="${PALETTE.burgundy}" stroke-width="2.5" stroke-dasharray="5 3" />
      <text x="112" y="128" text-anchor="middle" fill="${PALETTE.ink}" font-size="13" font-weight="800">剪成兩半</text>

      <text x="206" y="74" text-anchor="middle" fill="${PALETTE.forest}" font-size="24" font-weight="900">➜</text>

      <rect x="250" y="45" width="168" height="42" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="2.5" />
      <line x1="334" y1="45" x2="334" y2="87" stroke="${PALETTE.burgundy}" stroke-width="2" stroke-dasharray="4 3" />
      <text x="334" y="128" text-anchor="middle" fill="${PALETTE.forest}" font-size="13" font-weight="900">${rightText}</text>
    `;
    return wrapSvg(body, 480, 140, v.caption);
  }

  function renderBeaker(v) {
    const maxMl = v.maxMl || 1000;
    const lvl = Math.min(maxMl, Math.max(0, v.levelMl || 500));
    const bx = 185, by = 18, bw = 110, bh = 112;
    const waterH = (lvl / maxMl) * (bh - 12);
    let ticks = "";
    for (let ml = 100; ml <= maxMl; ml += 100) {
      const y = by + bh - (ml / maxMl) * (bh - 12);
      const isMajor = ml % 200 === 0;
      ticks += `<line x1="${bx}" y1="${y}" x2="${bx + (isMajor ? 18 : 10)}" y2="${y}" stroke="${PALETTE.ink}" stroke-width="1.5" />`;
      if (isMajor) {
        ticks += `<text x="${bx - 8}" y="${y + 4}" text-anchor="end" fill="${PALETTE.ink}" font-size="11" font-weight="800">${ml}</text>`;
      }
    }
    const body = `
      <rect x="${bx}" y="${by + bh - waterH}" width="${bw}" height="${waterH}" fill="${PALETTE.forest}" opacity="0.32" />
      <line x1="${bx}" y1="${by + bh - waterH}" x2="${bx + bw}" y2="${by + bh - waterH}" stroke="${PALETTE.forest}" stroke-width="3" />
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="none" stroke="${PALETTE.ink}" stroke-width="3" />
      ${ticks}
      <text x="${bx + bw + 16}" y="${by + bh - waterH + 5}" fill="${PALETTE.burgundy}" font-size="15" font-weight="900">◀ ${esc(v.label || `${lvl} mL`)}</text>
    `;
    return wrapSvg(body, 480, 146, v.caption);
  }

  function renderScale(v) {
    const body = `
      <polygon points="240,86 218,128 262,128" fill="${PALETTE.gold}" />
      <line x1="90" y1="86" x2="390" y2="86" stroke="${PALETTE.ink}" stroke-width="4" stroke-linecap="round" />
      <rect x="52" y="42" width="152" height="38" rx="10" fill="${PALETTE.goldSoft}" stroke="${PALETTE.gold}" stroke-width="2" />
      <text x="128" y="66" text-anchor="middle" fill="${PALETTE.ink}" font-size="13" font-weight="900">${esc(v.leftLabel)}</text>
      <rect x="276" y="42" width="152" height="38" rx="10" fill="${PALETTE.forestSoft}" stroke="${PALETTE.forest}" stroke-width="2" />
      <text x="352" y="66" text-anchor="middle" fill="${PALETTE.forest}" font-size="13" font-weight="900">${esc(v.rightLabel)}</text>
    `;
    return wrapSvg(body, 480, 138, v.caption);
  }

  function renderTimeLine(v) {
    const body = `
      <line x1="56" y1="74" x2="424" y2="74" stroke="${PALETTE.ink}" stroke-width="3" />
      <circle cx="72" cy="74" r="7" fill="${PALETTE.forest}" />
      <circle cx="408" cy="74" r="7" fill="${PALETTE.burgundy}" />
      <path d="M 76 62 Q 240 16 404 62" fill="none" stroke="${PALETTE.gold}" stroke-width="2.6" stroke-dasharray="5 3" />
      <text x="240" y="32" text-anchor="middle" fill="${PALETTE.gold}" font-size="14" font-weight="900">${esc(v.mid)}</text>
      <text x="72" y="102" text-anchor="middle" fill="${PALETTE.forest}" font-size="13" font-weight="900">${esc(v.start)}</text>
      <text x="408" y="102" text-anchor="middle" fill="${PALETTE.burgundy}" font-size="13" font-weight="900">${esc(v.end)}</text>
    `;
    return wrapSvg(body, 480, 118, v.caption);
  }

  function renderPatternCycle(v) {
    const items = v.items || ["紅", "黃", "藍", "綠"];
    const colors = (v.colors || []).map(mapColor);
    const n = items.length;
    const rem = v.remainder;
    const targetIdx = rem === null || rem === undefined ? -1 : rem === 0 ? n - 1 : rem - 1;
    const r = 24;
    const gap = 74;
    const startX = (480 - (n - 1) * gap) / 2;
    let body = `<rect x="${startX - 42}" y="20" width="${(n - 1) * gap + 84}" height="82" rx="16" fill="${PALETTE.ivory}" stroke="${PALETTE.gold}" stroke-width="2" stroke-dasharray="6 4" />`;
    items.forEach((it, i) => {
      const cx = startX + i * gap;
      const isHit = i === targetIdx;
      body += `
        <circle cx="${cx}" cy="58" r="${r}" fill="${colors[i] || PALETTE.gold}" stroke="${isHit ? PALETTE.burgundy : PALETTE.ink}" stroke-width="${isHit ? 4 : 1.5}" />
        <text x="${cx}" y="63" text-anchor="middle" fill="${colors[i] === "#cbd5e1" || colors[i] === "#e7e5e4" ? PALETTE.ink : "#fff"}" font-size="15" font-weight="900">${esc(it)}</text>
        <text x="${cx}" y="96" text-anchor="middle" fill="${isHit ? PALETTE.burgundy : PALETTE.muted}" font-size="12" font-weight="900">${i === n - 1 ? `第${i + 1}(餘0)` : `第${i + 1}(餘${i + 1})`}</text>
      `;
    });
    return wrapSvg(body, 480, 116, v.caption);
  }

  function renderTwoWayTable(v) {
    const rows = v.rows || [
      { name: "桌球", boy: 6, girl: 4 },
      { name: "繪畫", boy: 3, girl: 8 },
      { name: "合唱", boy: 2, girl: 5 }
    ];
    const hlCol = v.highlightCol || "";
    const hideTotals = Boolean(v.hideTotals);
    const sumBoy = rows.reduce((s, r) => s + r.boy, 0);
    const sumGirl = rows.reduce((s, r) => s + r.girl, 0);

    const rowHtml = rows
      .map(
        (r) => `
      <tr>
        <th>${esc(r.name)}</th>
        <td class="${hlCol === "男" ? "hl-cell" : ""}">${r.boy}</td>
        <td class="${hlCol === "女" ? "hl-cell" : ""}">${r.girl}</td>
        ${hideTotals ? "" : `<td class="${hlCol === "合計" ? "hl-cell" : ""}"><strong>${r.boy + r.girl}</strong></td>`}
      </tr>`
      )
      .join("");

    return `
      <figure class="math-visual-figure">
        <table class="mini-stat-table">
          <thead>
            <tr>
              <th>社團＼性別</th>
              <th class="${hlCol === "男" ? "hl-head" : ""}">男生</th>
              <th class="${hlCol === "女" ? "hl-head" : ""}">女生</th>
              ${hideTotals ? "" : `<th class="${hlCol === "合計" ? "hl-head" : ""}">社團合計</th>`}
            </tr>
          </thead>
          <tbody>
            ${rowHtml}
            ${
              hideTotals
                ? ""
                : `<tr class="total-row">
                    <th>合計</th>
                    <td class="${hlCol === "男" ? "hl-cell" : ""}"><strong>${sumBoy}</strong></td>
                    <td class="${hlCol === "女" ? "hl-cell" : ""}"><strong>${sumGirl}</strong></td>
                    <td><strong>${sumBoy + sumGirl}</strong></td>
                  </tr>`
            }
          </tbody>
        </table>
        ${v.caption ? `<figcaption class="math-visual-caption">📌 ${esc(v.caption)}</figcaption>` : ""}
      </figure>
    `;
  }

  function renderVisual(visualSpec, opts) {
    if (!visualSpec || !visualSpec.type) return "";
    const isQ = Boolean(opts && opts.isQuestion);
    const map = {
      placeValue: renderPlaceValue,
      verticalCalc: renderVerticalCalc,
      numberLine: renderNumberLine,
      barCompare: renderBarCompare,
      twoStep: renderTwoStep,
      ruler: renderRuler,
      overlap: renderOverlap,
      divisionGroup: renderDivisionGroup,
      inverseTriangle: renderInverseTriangle,
      fractionBar: renderFractionBar,
      angles: renderAngles,
      clockAngle: renderClockAngle,
      tiltedSquare: renderTiltedSquare,
      rectangle: renderRectangle,
      circle: renderCircle,
      circlesRow: renderCirclesRow,
      circleInSquare: renderCircleInSquare,
      gridArea: renderGridArea,
      halfGrid: renderHalfGrid,
      cutRearrange: renderCutRearrange,
      beaker: renderBeaker,
      scale: renderScale,
      timeLine: renderTimeLine,
      patternCycle: renderPatternCycle,
      twoWayTable: renderTwoWayTable
    };
    const fn = map[visualSpec.type];
    return fn ? fn(visualSpec, isQ) : "";
  }

  window.MathVisual = { render: renderVisual };
})();
