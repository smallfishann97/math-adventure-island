/**
 * 數學遊戲冒險島｜專屬原創可愛小動物角色 SVG 圖庫
 * 100% 原創向量繪製，跨平台（Windows / Mac / iOS / Android）顯示完全一致且無版權疑慮。
 */
(function () {
  const LEGACY_MAP = {
    "🦊": "shiba",
    "🐻": "bear",
    "🐰": "bunny",
    "🦁": "cat",
    "🦉": "owl",
    "🐼": "panda"
  };

  const AVATARS = [
    {
      id: "shiba",
      name: "小柴犬",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創小柴犬頭像">
          <circle cx="50" cy="50" r="48" fill="#FFF3D6" />
          <!-- 耳朵 -->
          <polygon points="22,42 18,14 42,28" fill="#E89242" stroke="#6B4423" stroke-width="3" stroke-linejoin="round" />
          <polygon points="24,36 22,20 36,29" fill="#FFD3B6" />
          <polygon points="78,42 82,14 58,28" fill="#E89242" stroke="#6B4423" stroke-width="3" stroke-linejoin="round" />
          <polygon points="76,36 78,20 64,29" fill="#FFD3B6" />
          <!-- 圓臉 -->
          <ellipse cx="50" cy="56" rx="34" ry="30" fill="#F2A44D" stroke="#6B4423" stroke-width="3" />
          <!-- 奶油臉頰與下巴 -->
          <path d="M 22 58 C 22 44, 38 46, 50 54 C 62 46, 78 44, 78 58 C 78 76, 66 85, 50 85 C 34 85, 22 76, 22 58 Z" fill="#FFF8EA" />
          <!-- 小眉毛點 -->
          <ellipse cx="38" cy="44" rx="3.8" ry="2.4" fill="#FFF8EA" />
          <ellipse cx="62" cy="44" rx="3.8" ry="2.4" fill="#FFF8EA" />
          <!-- 水汪汪大眼 -->
          <circle cx="37" cy="54" r="5" fill="#4A3222" />
          <circle cx="35.5" cy="52.2" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="54" r="5" fill="#4A3222" />
          <circle cx="61.5" cy="52.2" r="1.8" fill="#FFFFFF" />
          <!-- 粉嫩腮紅 -->
          <ellipse cx="28" cy="63" rx="6" ry="3.8" fill="#FF9A9E" opacity="0.65" />
          <ellipse cx="72" cy="63" rx="6" ry="3.8" fill="#FF9A9E" opacity="0.65" />
          <!-- 小鼻與微笑 -->
          <ellipse cx="50" cy="61" rx="4.5" ry="3.2" fill="#4A3222" />
          <path d="M 43 68 Q 50 74 50 65 Q 50 74 57 68" fill="none" stroke="#4A3222" stroke-width="2.6" stroke-linecap="round" />
          <!-- 可愛綠領巾 -->
          <path d="M 35 83 Q 50 92 65 83 L 58 93 L 50 88 L 42 93 Z" fill="#52B079" stroke="#2F7A4E" stroke-width="2" stroke-linejoin="round" />
        </svg>`
    },
    {
      id: "bunny",
      name: "棉花糖兔",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創棉花糖兔頭像">
          <circle cx="50" cy="50" r="48" fill="#FFECEB" />
          <!-- 長耳朵 -->
          <ellipse cx="34" cy="26" rx="9" ry="21" transform="rotate(-10 34 26)" fill="#FFFFFF" stroke="#7A5A52" stroke-width="3" />
          <ellipse cx="34" cy="27" rx="4.5" ry="13" transform="rotate(-10 34 27)" fill="#FFB8C6" />
          <ellipse cx="66" cy="26" rx="9" ry="21" transform="rotate(10 66 26)" fill="#FFFFFF" stroke="#7A5A52" stroke-width="3" />
          <ellipse cx="66" cy="27" rx="4.5" ry="13" transform="rotate(10 66 27)" fill="#FFB8C6" />
          <!-- 圓潤白臉 -->
          <ellipse cx="50" cy="60" rx="33" ry="27" fill="#FFFFFF" stroke="#7A5A52" stroke-width="3" />
          <!-- 頭頂小花 -->
          <g transform="translate(65, 36)">
            <circle cx="0" cy="-6" r="4.5" fill="#FFD57E" />
            <circle cx="6" cy="0" r="4.5" fill="#FFD57E" />
            <circle cx="0" cy="6" r="4.5" fill="#FFD57E" />
            <circle cx="-6" cy="0" r="4.5" fill="#FFD57E" />
            <circle cx="0" cy="0" r="4" fill="#F07470" />
          </g>
          <!-- 大眼 -->
          <circle cx="37" cy="58" r="4.8" fill="#4A3222" />
          <circle cx="35.5" cy="56.2" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="58" r="4.8" fill="#4A3222" />
          <circle cx="61.5" cy="56.2" r="1.8" fill="#FFFFFF" />
          <!-- 粉紅腮紅 -->
          <ellipse cx="27" cy="66" rx="6.5" ry="4" fill="#FF9EAA" opacity="0.7" />
          <ellipse cx="73" cy="66" rx="6.5" ry="4" fill="#FF9EAA" opacity="0.7" />
          <!-- 粉紅小鼻與微笑 -->
          <polygon points="46,63 54,63 50,67" fill="#F07470" />
          <path d="M 44 71 Q 50 76 50 68 Q 50 76 56 71" fill="none" stroke="#7A5A52" stroke-width="2.5" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "bear",
      name: "蜂蜜小熊",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創蜂蜜小熊頭像">
          <circle cx="50" cy="50" r="48" fill="#E6FAEE" />
          <!-- 圓耳朵 -->
          <circle cx="24" cy="30" r="12" fill="#B57B4C" stroke="#5E3C22" stroke-width="3" />
          <circle cx="24" cy="30" r="6" fill="#F2CFA0" />
          <circle cx="76" cy="30" r="12" fill="#B57B4C" stroke="#5E3C22" stroke-width="3" />
          <circle cx="76" cy="30" r="6" fill="#F2CFA0" />
          <!-- 圓臉 -->
          <ellipse cx="50" cy="56" rx="34" ry="30" fill="#C48A5A" stroke="#5E3C22" stroke-width="3" />
          <!-- 頭頂幸運小葉子 -->
          <path d="M 50 26 Q 60 12 70 20 Q 60 30 50 26 Z" fill="#52B079" stroke="#2F7A4E" stroke-width="2" />
          <path d="M 50 26 Q 40 14 34 22 Q 42 29 50 26 Z" fill="#77C996" stroke="#2F7A4E" stroke-width="2" />
          <!-- 奶油嘴套 -->
          <ellipse cx="50" cy="66" rx="15" ry="12" fill="#FFF3DC" />
          <!-- 眼睛 -->
          <circle cx="36" cy="52" r="4.8" fill="#422B1A" />
          <circle cx="34.5" cy="50.3" r="1.7" fill="#FFFFFF" />
          <circle cx="64" cy="52" r="4.8" fill="#422B1A" />
          <circle cx="62.5" cy="50.3" r="1.7" fill="#FFFFFF" />
          <!-- 腮紅 -->
          <ellipse cx="26" cy="62" rx="6" ry="3.8" fill="#FF968A" opacity="0.65" />
          <ellipse cx="74" cy="62" rx="6" ry="3.8" fill="#FF968A" opacity="0.65" />
          <!-- 鼻嘴 -->
          <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#422B1A" />
          <path d="M 44 69 Q 50 74 56 69" fill="none" stroke="#422B1A" stroke-width="2.6" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "cat",
      name: "三花小貓",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創三花小貓頭像">
          <circle cx="50" cy="50" r="48" fill="#FFF3E0" />
          <!-- 貓耳 -->
          <polygon points="20,44 20,16 44,30" fill="#FFFDF8" stroke="#6B4C3B" stroke-width="3" stroke-linejoin="round" />
          <polygon points="24,38 24,23 37,31" fill="#FFB8B8" />
          <polygon points="80,44 80,16 56,30" fill="#F09E4D" stroke="#6B4C3B" stroke-width="3" stroke-linejoin="round" />
          <polygon points="76,38 76,23 63,31" fill="#FFB8B8" />
          <!-- 圓臉 -->
          <ellipse cx="50" cy="57" rx="34" ry="29" fill="#FFFDF8" stroke="#6B4C3B" stroke-width="3" />
          <!-- 橘棕額頭花紋 -->
          <path d="M 52 28 C 68 28, 82 38, 83 50 C 70 50, 58 44, 52 28 Z" fill="#F09E4D" />
          <path d="M 22 44 C 28 34, 38 30, 46 29 C 40 40, 32 45, 22 44 Z" fill="#8C6248" />
          <!-- 星星亮眼 -->
          <circle cx="37" cy="56" r="5" fill="#4A3222" />
          <circle cx="35.5" cy="54.2" r="1.9" fill="#FFFFFF" />
          <circle cx="63" cy="56" r="5" fill="#4A3222" />
          <circle cx="61.5" cy="54.2" r="1.9" fill="#FFFFFF" />
          <!-- 腮紅與小鬍鬚 -->
          <ellipse cx="27" cy="64" rx="5.5" ry="3.5" fill="#FF9AA2" opacity="0.7" />
          <ellipse cx="73" cy="64" rx="5.5" ry="3.5" fill="#FF9AA2" opacity="0.7" />
          <line x1="12" y1="58" x2="23" y2="60" stroke="#6B4C3B" stroke-width="2.2" stroke-linecap="round" />
          <line x1="13" y1="66" x2="23" y2="65" stroke="#6B4C3B" stroke-width="2.2" stroke-linecap="round" />
          <line x1="88" y1="58" x2="77" y2="60" stroke="#6B4C3B" stroke-width="2.2" stroke-linecap="round" />
          <line x1="87" y1="66" x2="77" y2="65" stroke="#6B4C3B" stroke-width="2.2" stroke-linecap="round" />
          <!-- 粉紅小鼻與貓嘴 -->
          <polygon points="47,62 53,62 50,65.5" fill="#F07470" />
          <path d="M 43 70 Q 47 74 50 67 Q 53 74 57 70" fill="none" stroke="#6B4C3B" stroke-width="2.4" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "owl",
      name: "博士貓頭鷹",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創博士貓頭鷹頭像">
          <circle cx="50" cy="50" r="48" fill="#F5ECD7" />
          <!-- 羽角耳 -->
          <polygon points="22,36 18,18 36,28" fill="#9E7352" stroke="#5A3E2B" stroke-width="3" stroke-linejoin="round" />
          <polygon points="78,36 82,18 64,28" fill="#9E7352" stroke="#5A3E2B" stroke-width="3" stroke-linejoin="round" />
          <!-- 圓胖身體臉 -->
          <ellipse cx="50" cy="56" rx="34" ry="32" fill="#B58763" stroke="#5A3E2B" stroke-width="3" />
          <!-- 奶油眼周與肚肚 -->
          <circle cx="37" cy="52" r="14" fill="#FFF7E6" />
          <circle cx="63" cy="52" r="14" fill="#FFF7E6" />
          <ellipse cx="50" cy="78" rx="18" ry="10" fill="#FFF7E6" />
          <!-- 圓框金眼鏡 -->
          <circle cx="37" cy="52" r="11.5" fill="none" stroke="#D4943A" stroke-width="2.6" />
          <circle cx="63" cy="52" r="11.5" fill="none" stroke="#D4943A" stroke-width="2.6" />
          <line x1="48.5" y1="52" x2="51.5" y2="52" stroke="#D4943A" stroke-width="2.6" />
          <!-- 大眼 -->
          <circle cx="37" cy="52" r="5" fill="#3F2B1D" />
          <circle cx="35.5" cy="50" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="52" r="5" fill="#3F2B1D" />
          <circle cx="61.5" cy="50" r="1.8" fill="#FFFFFF" />
          <!-- 可愛黃小嘴 -->
          <polygon points="45,60 55,60 50,69" fill="#F2A43B" stroke="#5A3E2B" stroke-width="2" stroke-linejoin="round" />
          <!-- 腮紅 -->
          <ellipse cx="25" cy="64" rx="5" ry="3.2" fill="#FF968A" opacity="0.65" />
          <ellipse cx="75" cy="64" rx="5" ry="3.2" fill="#FF968A" opacity="0.65" />
        </svg>`
    },
    {
      id: "panda",
      name: "竹葉熊貓",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創竹葉熊貓頭像">
          <circle cx="50" cy="50" r="48" fill="#E8F8EE" />
          <!-- 圓圓黑耳 -->
          <circle cx="24" cy="29" r="12" fill="#463E3B" />
          <circle cx="76" cy="29" r="12" fill="#463E3B" />
          <!-- 雪白圓臉 -->
          <ellipse cx="50" cy="56" rx="34" ry="30" fill="#FFFFFF" stroke="#463E3B" stroke-width="3" />
          <!-- 頭頂嫩綠小竹葉 -->
          <path d="M 48 26 Q 58 12 68 18 Q 58 29 48 26 Z" fill="#52B079" stroke="#2F7A4E" stroke-width="2" />
          <!-- 可愛斜黑眼圈 -->
          <ellipse cx="36" cy="54" rx="10" ry="8" transform="rotate(-18 36 54)" fill="#463E3B" />
          <ellipse cx="64" cy="54" rx="10" ry="8" transform="rotate(18 64 54)" fill="#463E3B" />
          <!-- 亮晶晶眼珠 -->
          <circle cx="37" cy="53" r="3.4" fill="#FFFFFF" />
          <circle cx="37.8" cy="53.6" r="1.8" fill="#2A2422" />
          <circle cx="63" cy="53" r="3.4" fill="#FFFFFF" />
          <circle cx="62.2" cy="53.6" r="1.8" fill="#2A2422" />
          <!-- 腮紅 -->
          <ellipse cx="26" cy="65" rx="6" ry="3.8" fill="#FF9EAA" opacity="0.72" />
          <ellipse cx="74" cy="65" rx="6" ry="3.8" fill="#FF9EAA" opacity="0.72" />
          <!-- 鼻與微笑 -->
          <ellipse cx="50" cy="63" rx="4.8" ry="3.2" fill="#463E3B" />
          <path d="M 43 70 Q 50 75 50 67 Q 50 75 57 70" fill="none" stroke="#463E3B" stroke-width="2.5" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "fox",
      name: "焦糖狐狸",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創焦糖狐狸頭像">
          <circle cx="50" cy="50" r="48" fill="#FFEFE2" />
          <!-- 大尖耳 -->
          <polygon points="18,44 14,12 44,28" fill="#EE7F4B" stroke="#5A3826" stroke-width="3" stroke-linejoin="round" />
          <polygon points="21,36 18,18 36,28" fill="#5A3826" />
          <polygon points="82,44 86,12 56,28" fill="#EE7F4B" stroke="#5A3826" stroke-width="3" stroke-linejoin="round" />
          <polygon points="79,36 82,18 64,28" fill="#5A3826" />
          <!-- 狐狸臉 -->
          <ellipse cx="50" cy="58" rx="35" ry="29" fill="#F28A54" stroke="#5A3826" stroke-width="3" />
          <!-- 奶油雙頰絨毛 -->
          <path d="M 16 60 Q 34 46 50 62 Q 66 46 84 60 C 80 78 66 86 50 86 C 34 86 20 78 16 60 Z" fill="#FFFDF8" />
          <!-- 亮眼 -->
          <circle cx="36" cy="55" r="4.8" fill="#422B1D" />
          <circle cx="34.5" cy="53.2" r="1.8" fill="#FFFFFF" />
          <circle cx="64" cy="55" r="4.8" fill="#422B1D" />
          <circle cx="62.5" cy="53.2" r="1.8" fill="#FFFFFF" />
          <!-- 腮紅 -->
          <ellipse cx="26" cy="64" rx="5.8" ry="3.6" fill="#FF948A" opacity="0.72" />
          <ellipse cx="74" cy="64" rx="5.8" ry="3.6" fill="#FF948A" opacity="0.72" />
          <!-- 鼻與微笑 -->
          <ellipse cx="50" cy="63" rx="4.4" ry="3.2" fill="#422B1D" />
          <path d="M 43 70 Q 50 75 50 67 Q 50 75 57 70" fill="none" stroke="#422B1D" stroke-width="2.5" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "koala",
      name: "呆萌無尾熊",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創呆萌無尾熊頭像">
          <circle cx="50" cy="50" r="48" fill="#F2ECF9" />
          <!-- 蓬鬆大圓耳 -->
          <circle cx="20" cy="36" r="16" fill="#9E948E" stroke="#574B45" stroke-width="3" />
          <circle cx="20" cy="36" r="9" fill="#FFF5EE" />
          <circle cx="80" cy="36" r="16" fill="#9E948E" stroke="#574B45" stroke-width="3" />
          <circle cx="80" cy="36" r="9" fill="#FFF5EE" />
          <!-- 圓臉 -->
          <ellipse cx="50" cy="58" rx="33" ry="29" fill="#B5ABA4" stroke="#574B45" stroke-width="3" />
          <!-- 頭頂尤加利葉 -->
          <path d="M 50 28 Q 62 15 72 22 Q 60 32 50 28 Z" fill="#67B882" stroke="#357A4D" stroke-width="2" />
          <!-- 亮眼 -->
          <circle cx="36" cy="55" r="4.8" fill="#3E332E" />
          <circle cx="34.5" cy="53.3" r="1.7" fill="#FFFFFF" />
          <circle cx="64" cy="55" r="4.8" fill="#3E332E" />
          <circle cx="62.5" cy="53.3" r="1.7" fill="#FFFFFF" />
          <!-- 腮紅 -->
          <ellipse cx="27" cy="65" rx="6" ry="3.8" fill="#FF9AA8" opacity="0.72" />
          <ellipse cx="73" cy="65" rx="6" ry="3.8" fill="#FF9AA8" opacity="0.72" />
          <!-- 招牌大橢圓黑鼻與微笑 -->
          <ellipse cx="50" cy="61" rx="6.5" ry="8.5" fill="#4A3F3A" />
          <ellipse cx="48" cy="58" rx="2" ry="2.8" fill="#8C7E78" />
          <path d="M 44 73 Q 50 78 56 73" fill="none" stroke="#4A3F3A" stroke-width="2.5" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "dino",
      name: "抹茶小恐龍",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創抹茶小恐龍頭像">
          <circle cx="50" cy="50" r="48" fill="#EAF9EC" />
          <!-- 頭頂可愛金黃小角棘 -->
          <polygon points="43,28 50,12 57,28" fill="#FFD35C" stroke="#5A4031" stroke-width="2.6" stroke-linejoin="round" />
          <polygon points="27,34 30,20 39,30" fill="#FFA85C" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round" />
          <polygon points="73,34 70,20 61,30" fill="#FFA85C" stroke="#5A4031" stroke-width="2.4" stroke-linejoin="round" />
          <!-- 圓臉 -->
          <ellipse cx="50" cy="58" rx="34" ry="29" fill="#86CF8C" stroke="#436B47" stroke-width="3" />
          <!-- 淺奶油下巴 -->
          <path d="M 24 66 Q 50 58 76 66 C 72 80 62 86 50 86 C 38 86 28 80 24 66 Z" fill="#F4FCEB" />
          <!-- 臉頰斑點 -->
          <circle cx="30" cy="46" r="3.5" fill="#5BB364" opacity="0.65" />
          <circle cx="70" cy="46" r="4" fill="#5BB364" opacity="0.65" />
          <!-- 大眼 -->
          <circle cx="37" cy="55" r="5" fill="#3B2D23" />
          <circle cx="35.5" cy="53.2" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="55" r="5" fill="#3B2D23" />
          <circle cx="61.5" cy="53.2" r="1.8" fill="#FFFFFF" />
          <!-- 腮紅 -->
          <ellipse cx="27" cy="63" rx="6" ry="3.6" fill="#FF968E" opacity="0.72" />
          <ellipse cx="73" cy="63" rx="6" ry="3.6" fill="#FF968E" opacity="0.72" />
          <!-- 小鼻孔與微笑小尖牙 -->
          <circle cx="46" cy="61" r="1.8" fill="#3D6B42" />
          <circle cx="54" cy="61" r="1.8" fill="#3D6B42" />
          <path d="M 41 69 Q 50 76 59 69" fill="none" stroke="#3B2D23" stroke-width="2.6" stroke-linecap="round" />
        </svg>`
    },
    {
      id: "hamster",
      name: "葵花小倉鼠",
      svg: `
        <svg viewBox="0 0 100 100" class="avatar-svg" role="img" aria-label="原創葵花小倉鼠頭像">
          <circle cx="50" cy="50" r="48" fill="#FFF4E4" />
          <!-- 小圓耳 -->
          <circle cx="25" cy="30" r="11" fill="#F2B872" stroke="#6B4828" stroke-width="3" />
          <circle cx="25" cy="30" r="5.5" fill="#FFB6B9" />
          <circle cx="75" cy="30" r="11" fill="#F2B872" stroke="#6B4828" stroke-width="3" />
          <circle cx="75" cy="30" r="5.5" fill="#FFB6B9" />
          <!-- 鼓鼓雙頰大圓臉 -->
          <path d="M 16 62 C 14 40, 30 28, 50 28 C 70 28, 86 40, 84 62 C 86 78, 70 86, 50 86 C 30 86, 14 78, 16 62 Z" fill="#F6C78A" stroke="#6B4828" stroke-width="3" />
          <!-- 雪白胖臉頰與肚肚 -->
          <path d="M 18 64 C 18 52, 34 52, 50 60 C 66 52, 82 52, 82 64 C 82 78, 68 85, 50 85 C 32 85, 18 78, 18 64 Z" fill="#FFFDF9" />
          <!-- 頭頂小葵花籽 -->
          <ellipse cx="50" cy="24" rx="4.5" ry="7" fill="#5A4031" stroke="#FFFDF9" stroke-width="1.2" />
          <line x1="50" y1="18" x2="50" y2="30" stroke="#E8D3B9" stroke-width="1.4" />
          <!-- 水汪汪大眼 -->
          <circle cx="37" cy="53" r="5" fill="#422B1A" />
          <circle cx="35.5" cy="51.2" r="1.8" fill="#FFFFFF" />
          <circle cx="63" cy="53" r="5" fill="#422B1A" />
          <circle cx="61.5" cy="51.2" r="1.8" fill="#FFFFFF" />
          <!-- 鼓鼓腮紅 -->
          <ellipse cx="26" cy="64" rx="7" ry="4.5" fill="#FF969A" opacity="0.75" />
          <ellipse cx="74" cy="64" rx="7" ry="4.5" fill="#FF969A" opacity="0.75" />
          <!-- 粉紅小鼻與小門牙微笑 -->
          <ellipse cx="50" cy="60" rx="3.5" ry="2.5" fill="#F07878" />
          <path d="M 43 66 Q 50 72 57 66" fill="none" stroke="#6B4828" stroke-width="2.4" stroke-linecap="round" />
        </svg>`
    }
  ];

  const byId = new Map(AVATARS.map((a) => [a.id, a]));

  function resolveId(raw) {
    if (byId.has(raw)) return raw;
    if (LEGACY_MAP[raw]) return LEGACY_MAP[raw];
    return "shiba";
  }

  function render(raw, sizeClass = "avatar-md") {
    const id = resolveId(raw);
    const item = byId.get(id) || AVATARS[0];
    return `<span class="avatar-frame ${sizeClass}" title="${item.name}">${item.svg}</span>`;
  }

  window.AvatarArt = {
    list: AVATARS,
    resolveId,
    render
  };
})();
