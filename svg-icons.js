/**
 * 數學遊戲冒險島｜100% 原創向量 SVG 圖庫（全跨平台 Windows / Mac / iPhone / Android 顯示完全一致）
 * 統一暖色系馬卡龍繪本風格（焦糖棕描邊 #5A4031、奶油白、蜂蜜金、抹茶綠、珊瑚粉、薄荷綠，零刺眼藍）
 */
(function () {
  const S = 'stroke="#5A4031" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';

  const ICONS = {
    // 品牌葉子 Logo
    brand_leaf: `
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#8B6343" stroke="#F8D277" stroke-width="3.5"/>
      <path d="M18 32 C18 22, 26 16, 36 16" fill="none" stroke="#F6E6D8" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
      <path d="M22 34 C22 27, 28 22, 35 21" fill="none" stroke="#F6E6D8" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
      <path d="M46 29 C46 37, 42 42, 36 44" fill="none" stroke="#F6E6D8" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
      <path d="M32 32 C32 23, 39 18, 47 18 C47 26, 42 32, 32 32 Z" fill="#4DC387" stroke="#2D8B5B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M47 18 C47 15, 48.5 14, 49.5 15" fill="none" stroke="#2D8B5B" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M34 30 L45 20" stroke="#2D8B5B" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M21 31 C33 31, 41 37, 41 47 C30 47, 21 41, 21 31 Z" fill="#52D08E" stroke="#2D8B5B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M21 31 C20 27, 21 25, 22.5 25" fill="none" stroke="#2D8B5B" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M23 33 L38 45" stroke="#2D8B5B" stroke-width="1.8" stroke-linecap="round"/>
    `,

    // 天空蓬鬆雲朵
    cloud: `
      <path d="M16 46 H48 C54 46 58 42 58 36 C58 31 54 27 49 27 C48 20 42 15 34 15 C27 15 21 19 19 26 C13 26 8 30 8 36 C8 42 12 46 16 46 Z" fill="#FFFDF8" stroke="#D8C8AE" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M18 42 H47" stroke="#F3E7D3" stroke-width="2.5" stroke-linecap="round"/>
    `,

    // 島嶼固定景觀（圓樹、松樹、棕櫚、小屋、帳篷）
    tree_round: `
      <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(60,90,50,0.18)"/>
      <rect x="27" y="38" width="10" height="17" rx="3" fill="#B57B4C" ${S}/>
      <circle cx="22" cy="30" r="11" fill="#6EC47A" ${S}/>
      <circle cx="42" cy="30" r="11" fill="#5EB56D" ${S}/>
      <circle cx="32" cy="21" r="13" fill="#82D48B" ${S}/>
      <circle cx="27" cy="18" r="3" fill="#B9F0BC"/>
    `,
    tree_pine: `
      <ellipse cx="32" cy="56" rx="13" ry="4" fill="rgba(60,90,50,0.18)"/>
      <rect x="28" y="42" width="8" height="13" rx="2" fill="#A66D3F" ${S}/>
      <polygon points="32,10 16,30 48,30" fill="#5CB574" ${S}/>
      <polygon points="32,20 13,43 51,43" fill="#4DA365" ${S}/>
      <polygon points="32,10 24,22 40,22" fill="#7AD18E"/>
    `,
    house: `
      <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="rgba(60,90,50,0.18)"/>
      <rect x="14" y="29" width="36" height="26" rx="4" fill="#FFF5DF" ${S}/>
      <polygon points="8,31 32,11 56,31" fill="#E87D67" ${S}/>
      <rect x="42" y="13" width="7" height="12" rx="2" fill="#C96450" ${S}/>
      <rect x="26" y="38" width="12" height="17" rx="5" fill="#B97A4B" ${S}/>
      <circle cx="35" cy="47" r="1.5" fill="#FFE28A"/>
      <rect x="18" y="35" width="7" height="7" rx="2" fill="#FFE699" ${S}/>
    `,
    tent: `
      <ellipse cx="32" cy="56" rx="21" ry="4.5" fill="rgba(60,90,50,0.18)"/>
      <polygon points="32,13 9,54 55,54" fill="#F4B255" ${S}/>
      <polygon points="32,13 21,54 43,54" fill="#FFF2D6" ${S}/>
      <polygon points="32,32 24,54 40,54" fill="#7D5638" ${S}/>
      <path d="M29 13 L35 9 M35 13 L29 9" ${S}/>
    `,
    palm: `
      <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(60,90,50,0.18)"/>
      <path d="M31 55 Q36 39 29 24" fill="none" stroke="#B67C49" stroke-width="7" stroke-linecap="round"/>
      <path d="M31 55 Q36 39 29 24" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round"/>
      <path d="M29 24 C17 18 11 24 10 31 C18 27 24 27 29 24 Z" fill="#63BE72" ${S}/>
      <path d="M29 24 C19 11 12 13 12 19 C19 18 24 21 29 24 Z" fill="#7ED487" ${S}/>
      <path d="M29 24 C38 11 49 12 52 19 C44 19 37 22 29 24 Z" fill="#63BE72" ${S}/>
      <path d="M29 24 C42 20 51 26 53 34 C44 29 37 27 29 24 Z" fill="#4DA360" ${S}/>
      <circle cx="27" cy="27" r="3.2" fill="#8C5832" ${S}/>
      <circle cx="32" cy="28" r="3.2" fill="#8C5832" ${S}/>
    `,

    // ==================== 🌸 植物花草 (10) ====================
    sakura: `
      <rect x="27" y="38" width="10" height="18" rx="3" fill="#A66D45" ${S}/>
      <circle cx="21" cy="29" r="11" fill="#FFB8CC" ${S}/>
      <circle cx="43" cy="29" r="11" fill="#FFA4BF" ${S}/>
      <circle cx="32" cy="20" r="13" fill="#FFD1DF" ${S}/>
      <circle cx="26" cy="18" r="2.5" fill="#FFF"/>
      <circle cx="38" cy="24" r="2" fill="#FF7EA3"/>
      <circle cx="21" cy="30" r="2" fill="#FF7EA3"/>
    `,
    tulip: `
      <path d="M32 34 V56" ${S}/>
      <path d="M32 48 C22 47 17 40 19 34 C25 37 29 42 32 48 Z" fill="#6DC47A" ${S}/>
      <path d="M32 48 C42 47 47 40 45 34 C39 37 35 42 32 48 Z" fill="#59B268" ${S}/>
      <path d="M20 22 C20 34 26 37 32 37 C38 37 44 34 44 22 L38 26 L32 16 L26 26 Z" fill="#F27289" ${S}/>
      <path d="M27 24 L32 16 L37 24" fill="#FFA4B4"/>
    `,
    mushroom: `
      <path d="M24 36 H40 L42 54 C42 56 22 56 22 54 Z" fill="#FFF3DC" ${S}/>
      <path d="M10 36 C10 18 22 12 32 12 C42 12 54 18 54 36 Z" fill="#E8655A" ${S}/>
      <circle cx="23" cy="24" r="4" fill="#FFF9EE"/>
      <circle cx="38" cy="21" r="3.5" fill="#FFF9EE"/>
      <circle cx="44" cy="30" r="3" fill="#FFF9EE"/>
      <circle cx="28" cy="45" r="1.5" fill="#5A4031"/>
      <circle cx="36" cy="45" r="1.5" fill="#5A4031"/>
      <path d="M30 48 Q32 50 34 48" fill="none" stroke="#5A4031" stroke-width="1.8" stroke-linecap="round"/>
    `,
    hibiscus: `
      <circle cx="32" cy="18" r="10" fill="#FF7F8A" ${S}/>
      <circle cx="45" cy="27" r="10" fill="#FF7F8A" ${S}/>
      <circle cx="40" cy="43" r="10" fill="#F46A78" ${S}/>
      <circle cx="24" cy="43" r="10" fill="#F46A78" ${S}/>
      <circle cx="19" cy="27" r="10" fill="#FF7F8A" ${S}/>
      <circle cx="32" cy="32" r="7" fill="#FFD966" ${S}/>
      <path d="M32 32 L38 18" stroke="#FFF4B8" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="38" cy="17" r="2.5" fill="#FFE97F"/>
    `,
    sunflower: `
      <path d="M32 38 V57" ${S}/>
      <path d="M32 49 C22 48 18 43 20 39 C26 41 29 44 32 49 Z" fill="#6AC477" ${S}/>
      <g fill="#FFCA3A" ${S}>
        <ellipse cx="32" cy="13" rx="4.5" ry="7"/><ellipse cx="32" cy="39" rx="4.5" ry="7"/>
        <ellipse cx="19" cy="26" rx="7" ry="4.5"/><ellipse cx="45" cy="26" rx="7" ry="4.5"/>
        <ellipse cx="22.5" cy="16.5" rx="5" ry="5"/><ellipse cx="41.5" cy="16.5" rx="5" ry="5"/>
        <ellipse cx="22.5" cy="35.5" rx="5" ry="5"/><ellipse cx="41.5" cy="35.5" rx="5" ry="5"/>
      </g>
      <circle cx="32" cy="26" r="10" fill="#8C5A34" ${S}/>
      <circle cx="29" cy="25" r="1.4" fill="#FFF"/><circle cx="35" cy="25" r="1.4" fill="#FFF"/>
      <path d="M29 29 Q32 31 35 29" fill="none" stroke="#FFE28A" stroke-width="1.8" stroke-linecap="round"/>
    `,
    clover: `
      <path d="M32 34 Q32 48 26 56" fill="none" stroke="#4FA663" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="24" cy="22" r="9.5" fill="#68C87A" ${S}/>
      <circle cx="40" cy="22" r="9.5" fill="#7AD68A" ${S}/>
      <circle cx="24" cy="36" r="9.5" fill="#57B86A" ${S}/>
      <circle cx="40" cy="36" r="9.5" fill="#68C87A" ${S}/>
      <circle cx="32" cy="29" r="4" fill="#C9F7CF"/>
    `,
    rose: `
      <path d="M32 36 V56" ${S}/>
      <path d="M32 47 C22 45 19 41 21 37 C26 39 29 42 32 47 Z" fill="#5DB96E" ${S}/>
      <circle cx="32" cy="25" r="13" fill="#E3566B" ${S}/>
      <path d="M24 25 C24 19 30 16 35 19 C40 22 39 30 32 31 C27 31 26 26 29 23 C32 21 35 23 34 26" fill="none" stroke="#FFC4CE" stroke-width="2.4" stroke-linecap="round"/>
    `,
    cactus: `
      <rect x="20" y="45" width="24" height="12" rx="4" fill="#D98B5F" ${S}/>
      <rect x="26" y="16" width="12" height="30" rx="6" fill="#68C078" ${S}/>
      <path d="M26 31 H18 V24" fill="none" stroke="#68C078" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 31 H18 V24" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M38 28 H46 V21" fill="none" stroke="#68C078" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M38 28 H46 V21" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="32" cy="14" r="4" fill="#FF8FA3" ${S}/>
    `,
    bamboo: `
      <rect x="22" y="12" width="8" height="44" rx="3" fill="#75CA7E" ${S}/>
      <rect x="35" y="18" width="8" height="38" rx="3" fill="#5CB668" ${S}/>
      <path d="M22 26 H30 M22 40 H30 M35 32 H43 M35 45 H43" ${S}/>
      <path d="M22 22 C13 18 11 13 14 11 C19 13 21 17 22 22 Z" fill="#8EE095" ${S}/>
      <path d="M43 24 C51 19 53 15 50 13 C46 15 44 19 43 24 Z" fill="#8EE095" ${S}/>
      <rect x="45" y="27" width="8" height="12" rx="2" fill="#FF9E9E" ${S}/>
    `,
    lotus: `
      <ellipse cx="32" cy="48" rx="22" ry="7" fill="#66C282" ${S}/>
      <path d="M32 45 C18 44 12 34 14 26 C22 28 28 35 32 45 Z" fill="#FFB3C9" ${S}/>
      <path d="M32 45 C46 44 52 34 50 26 C42 28 36 35 32 45 Z" fill="#FFB3C9" ${S}/>
      <path d="M32 45 C23 36 24 20 32 14 C40 20 41 36 32 45 Z" fill="#FFD1DF" ${S}/>
      <circle cx="32" cy="36" r="4.5" fill="#FFE066"/>
    `,

    // ==================== 🐾 動物夥伴 (10) ====================
    butterfly: `
      <ellipse cx="21" cy="24" rx="11" ry="9" fill="#FFB76B" ${S}/>
      <ellipse cx="43" cy="24" rx="11" ry="9" fill="#FFB76B" ${S}/>
      <ellipse cx="23" cy="39" rx="8" ry="7" fill="#FF909E" ${S}/>
      <ellipse cx="41" cy="39" rx="8" ry="7" fill="#FF909E" ${S}/>
      <rect x="29" y="18" width="6" height="28" rx="3" fill="#6E4E37" ${S}/>
      <path d="M30 18 Q26 11 22 12 M34 18 Q38 11 42 12" fill="none" ${S}/>
      <circle cx="19" cy="23" r="3" fill="#FFF3C4"/><circle cx="45" cy="23" r="3" fill="#FFF3C4"/>
    `,
    duck: `
      <ellipse cx="33" cy="42" rx="17" ry="12" fill="#FFE066" ${S}/>
      <circle cx="24" cy="25" r="10" fill="#FFE882" ${S}/>
      <path d="M14 25 L8 28 L15 30 Z" fill="#F28C38" ${S}/>
      <circle cx="21" cy="23" r="2" fill="#3F2B1D"/>
      <path d="M30 40 C36 36 44 38 45 43 C40 46 33 45 30 40 Z" fill="#F6C445" ${S}/>
      <path d="M12 53 Q22 49 32 53 Q42 57 52 53" fill="none" stroke="#7ED0B0" stroke-width="2.6" stroke-linecap="round"/>
    `,
    bee: `
      <ellipse cx="26" cy="20" rx="8" ry="6" fill="#FFFDF5" ${S}/>
      <ellipse cx="38" cy="20" rx="8" ry="6" fill="#FFFDF5" ${S}/>
      <ellipse cx="32" cy="36" rx="16" ry="12" fill="#FFD94A" ${S}/>
      <path d="M26 25 V47 M34 24 V48 M42 27 V45" stroke="#5A4031" stroke-width="3.5"/>
      <circle cx="21" cy="34" r="2" fill="#3F2B1D"/>
      <ellipse cx="21" cy="38" rx="2.5" ry="1.4" fill="#FF929E"/>
    `,
    ladybug: `
      <circle cx="32" cy="20" r="8" fill="#5A4031"/>
      <circle cx="32" cy="36" r="15" fill="#E95A52" ${S}/>
      <path d="M32 21 V51" ${S}/>
      <circle cx="24" cy="31" r="2.8" fill="#5A4031"/><circle cx="40" cy="31" r="2.8" fill="#5A4031"/>
      <circle cx="25" cy="42" r="2.5" fill="#5A4031"/><circle cx="39" cy="42" r="2.5" fill="#5A4031"/>
      <path d="M28 14 L24 9 M36 14 L40 9" ${S}/>
    `,
    rabbit: `
      <ellipse cx="25" cy="18" rx="4.5" ry="12" fill="#FFFDF8" ${S}/>
      <ellipse cx="39" cy="18" rx="4.5" ry="12" fill="#FFFDF8" ${S}/>
      <ellipse cx="25" cy="18" rx="2" ry="7" fill="#FFB7C5"/>
      <ellipse cx="39" cy="18" rx="2" ry="7" fill="#FFB7C5"/>
      <ellipse cx="32" cy="46" rx="14" ry="10" fill="#FFFDF8" ${S}/>
      <circle cx="32" cy="33" r="12" fill="#FFFDF8" ${S}/>
      <circle cx="27" cy="32" r="2" fill="#3F2B1D"/><circle cx="37" cy="32" r="2" fill="#3F2B1D"/>
      <ellipse cx="24" cy="36" rx="2.5" ry="1.5" fill="#FF9AA9"/><ellipse cx="40" cy="36" rx="2.5" ry="1.5" fill="#FF9AA9"/>
      <circle cx="32" cy="35" r="1.6" fill="#FF7C92"/>
    `,
    squirrel: `
      <path d="M40 46 C56 44 58 22 44 16 C37 13 34 22 39 27 C43 31 41 37 37 39 Z" fill="#C98349" ${S}/>
      <ellipse cx="27" cy="44" rx="11" ry="11" fill="#D99357" ${S}/>
      <circle cx="25" cy="27" r="9.5" fill="#E39F63" ${S}/>
      <circle cx="20" cy="19" r="3.5" fill="#D99357" ${S}/><circle cx="30" cy="19" r="3.5" fill="#D99357" ${S}/>
      <circle cx="22" cy="26" r="1.9" fill="#3F2B1D"/>
      <ellipse cx="18" cy="42" rx="4" ry="5" fill="#9C6234" ${S}/>
    `,
    hedgehog: `
      <path d="M12 42 C12 24 24 18 34 18 C46 18 54 28 54 42 Z" fill="#9B6B46" ${S}/>
      <path d="M14 44 C14 34 24 30 34 30 C44 30 50 36 50 46 H14 Z" fill="#F4DFC0" ${S}/>
      <circle cx="22" cy="38" r="2" fill="#3F2B1D"/>
      <circle cx="13" cy="41" r="2.8" fill="#5A4031"/>
      <ellipse cx="25" cy="42" rx="2.5" ry="1.4" fill="#FF95A2"/>
    `,
    swan: `
      <path d="M16 42 C18 32 32 32 48 36 C48 46 38 51 24 50 C18 50 15 47 16 42 Z" fill="#FFFDF8" ${S}/>
      <path d="M22 40 C20 26 24 16 31 16 C35 16 36 20 34 23" fill="none" stroke="#FFFDF8" stroke-width="7" stroke-linecap="round"/>
      <path d="M22 40 C20 26 24 16 31 16 C35 16 36 20 34 23" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round"/>
      <polygon points="35,19 42,22 35,24" fill="#F49D37" ${S}/>
      <circle cx="31" cy="19" r="1.5" fill="#3F2B1D"/>
    `,
    flamingo: `
      <path d="M34 39 V56 M34 49 L25 46 L27 52" fill="none" stroke="#D96B78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="35" cy="36" rx="12" ry="8" fill="#FF92A8" ${S}/>
      <path d="M25 34 C19 26 23 14 30 14 C34 14 34 18 31 20" fill="none" stroke="#FF92A8" stroke-width="5.5" stroke-linecap="round"/>
      <polygon points="32,16 39,19 33,21" fill="#5A4031"/>
      <circle cx="29" cy="16" r="1.5" fill="#3F2B1D"/>
    `,
    unicorn: `
      <polygon points="27,19 21,6 32,16" fill="#FFD452" ${S}/>
      <path d="M36 22 C44 20 48 28 45 36" fill="none" stroke="#FF9BC0" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="34" cy="43" rx="14" ry="10" fill="#FFFDF9" ${S}/>
      <circle cx="28" cy="27" r="11" fill="#FFFDF9" ${S}/>
      <ellipse cx="19" cy="30" rx="5" ry="4" fill="#FFE3EE" ${S}/>
      <circle cx="26" cy="26" r="2" fill="#3F2B1D"/>
      <ellipse cx="29" cy="30" rx="2.6" ry="1.5" fill="#FF98B0"/>
    `,

    // ==================== 🍰 甜點美食 (10) ====================
    icecream: `
      <polygon points="22,34 42,34 32,57" fill="#E8B46D" ${S}/>
      <circle cx="24" cy="29" r="9" fill="#FFB3C6" ${S}/>
      <circle cx="40" cy="29" r="9" fill="#A8E6B8" ${S}/>
      <circle cx="32" cy="19" r="10" fill="#FFF3D1" ${S}/>
      <circle cx="32" cy="10" r="3.5" fill="#E85D68" ${S}/>
    `,
    cake: `
      <polygon points="18,35 46,35 42,55 22,55" fill="#F2B872" ${S}/>
      <path d="M16 35 C16 24 24 19 32 19 C40 19 48 24 48 35 Z" fill="#FFB8CB" ${S}/>
      <circle cx="32" cy="14" r="5" fill="#E85A6A" ${S}/>
      <circle cx="25" cy="28" r="2" fill="#FFF"/><circle cx="38" cy="29" r="2" fill="#FFE066"/>
    `,
    donut: `
      <circle cx="32" cy="32" r="20" fill="#E6A965" ${S}/>
      <path d="M13 29 C16 18 24 12 32 12 C42 12 51 20 51 30 C46 34 42 29 38 33 C33 36 28 30 23 33 C18 35 15 32 13 29 Z" fill="#FF9AB8" ${S}/>
      <circle cx="32" cy="32" r="7" fill="#FFFDF7" ${S}/>
      <rect x="23" y="19" width="5" height="2.4" rx="1" fill="#FFE066" transform="rotate(-20 23 19)"/>
      <rect x="37" y="18" width="5" height="2.4" rx="1" fill="#82D99B" transform="rotate(25 37 18)"/>
    `,
    lollipop: `
      <path d="M32 38 V57" stroke="#E0C8A8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="24" r="15" fill="#FF92A8" ${S}/>
      <path d="M32 24 m-10 0 a10 10 0 1 0 20 0 a7 7 0 1 0 -14 0 a4 4 0 1 0 8 0" fill="none" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/>
    `,
    shortcake: `
      <rect x="13" y="34" width="38" height="21" rx="5" fill="#FFF4DE" ${S}/>
      <path d="M13 34 H51 V42 C46 46 42 40 37 43 C32 46 28 40 22 43 C18 45 15 42 13 40 Z" fill="#FFA2B8" ${S}/>
      <rect x="29" y="19" width="6" height="15" rx="2" fill="#FFE066" ${S}/>
      <path d="M32 10 C36 14 35 19 32 19 C29 19 28 14 32 10 Z" fill="#FF7B54" ${S}/>
    `,
    boba: `
      <path d="M34 9 L31 24" stroke="#E67A6B" stroke-width="5" stroke-linecap="round"/>
      <polygon points="19,24 45,24 41,56 23,56" fill="#E8C08D" ${S}/>
      <rect x="17" y="21" width="30" height="5" rx="2.5" fill="#FFF5E1" ${S}/>
      <circle cx="27" cy="49" r="3" fill="#4A3222"/><circle cx="34" cy="50" r="3" fill="#4A3222"/><circle cx="37" cy="44" r="2.8" fill="#4A3222"/><circle cx="29" cy="43" r="2.8" fill="#4A3222"/>
    `,
    pudding: `
      <ellipse cx="32" cy="52" rx="22" ry="5" fill="#FFFDF7" ${S}/>
      <path d="M16 50 L21 24 C22 20 42 20 43 24 L48 50 Z" fill="#FFE07D" ${S}/>
      <path d="M20 27 C21 20 43 20 44 27 C40 31 36 27 32 30 C28 32 24 27 20 27 Z" fill="#9E5629" ${S}/>
    `,
    popcorn: `
      <polygon points="18,28 46,28 42,56 22,56" fill="#FFFDF7" ${S}/>
      <path d="M25 28 L27 56 M32 28 V56 M39 28 L37 56" stroke="#E86258" stroke-width="3.5"/>
      <circle cx="23" cy="24" r="6" fill="#FFE999" ${S}/><circle cx="32" cy="20" r="7" fill="#FFF4C2" ${S}/><circle cx="41" cy="24" r="6" fill="#FFE999" ${S}/>
    `,
    watermelon: `
      <path d="M10 38 A22 22 0 0 0 54 38 Z" fill="#52B068" ${S}/>
      <path d="M14 38 A18 18 0 0 0 50 38 Z" fill="#F26B74" ${S}/>
      <circle cx="24" cy="44" r="1.8" fill="#4A3222"/><circle cx="32" cy="47" r="1.8" fill="#4A3222"/><circle cx="40" cy="44" r="1.8" fill="#4A3222"/>
    `,
    honey: `
      <ellipse cx="32" cy="40" rx="16" ry="15" fill="#F6B942" ${S}/>
      <rect x="22" y="19" width="20" height="7" rx="3" fill="#FFF2CE" ${S}/>
      <path d="M21 26 C21 34 26 36 29 31 C32 37 38 36 42 29" fill="#FFE07D" stroke="#B6721A" stroke-width="2"/>
    `,

    // ==================== 🎡 童話建築 (10) ====================
    windmill: `
      <circle cx="32" cy="28" r="18" fill="none" stroke="#F08A74" stroke-width="3.5"/>
      <path d="M32 10 V46 M14 28 H50 M19 15 L45 41 M45 15 L19 41" stroke="#D9A05B" stroke-width="1.8"/>
      <polygon points="22,56 32,28 42,56" fill="none" ${S}/>
      <circle cx="32" cy="10" r="3.5" fill="#FFE066" ${S}/><circle cx="50" cy="28" r="3.5" fill="#82D99B" ${S}/>
      <circle cx="14" cy="28" r="3.5" fill="#FFB3C6" ${S}/><circle cx="32" cy="28" r="4" fill="#FFFDF7" ${S}/>
    `,
    carousel: `
      <polygon points="10,26 32,11 54,26" fill="#F07B72" ${S}/>
      <rect x="14" y="48" width="36" height="7" rx="3" fill="#F4B255" ${S}/>
      <path d="M22 26 V48 M32 26 V48 M42 26 V48" stroke="#D8A148" stroke-width="2.5"/>
      <ellipse cx="22" cy="39" rx="5" ry="4" fill="#FFFDF7" ${S}/>
      <ellipse cx="42" cy="36" rx="5" ry="4" fill="#FFE082" ${S}/>
    `,
    fountain: `
      <ellipse cx="32" cy="50" rx="22" ry="7" fill="#E8DCC6" ${S}/>
      <ellipse cx="32" cy="49" rx="17" ry="4" fill="#9EE0C6"/>
      <rect x="28" y="31" width="8" height="17" fill="#E8DCC6" ${S}/>
      <ellipse cx="32" cy="32" rx="12" ry="4" fill="#F5EBDA" ${S}/>
      <path d="M32 30 Q26 16 19 25 M32 30 Q38 16 45 25 M32 30 V14" fill="none" stroke="#7ED4B8" stroke-width="3" stroke-linecap="round"/>
    `,
    lighthouse: `
      <polygon points="24,24 40,24 44,56 20,56" fill="#FFFDF7" ${S}/>
      <rect x="22" y="34" width="20" height="7" fill="#E86A5A"/>
      <rect x="25" y="16" width="14" height="9" fill="#FFE680" ${S}/>
      <polygon points="22,16 32,8 42,16" fill="#E86A5A" ${S}/>
    `,
    circus: `
      <polygon points="10,32 32,12 54,32" fill="#E86A5A" ${S}/>
      <polygon points="21,32 32,12 43,32" fill="#FFF6DE" ${S}/>
      <rect x="13" y="32" width="38" height="23" fill="#FFF6DE" ${S}/>
      <path d="M25 55 V40 C25 36 39 36 39 40 V55 Z" fill="#E86A5A" ${S}/>
    `,
    rollercoaster: `
      <path d="M8 46 Q20 14 32 34 T56 20" fill="none" stroke="#F08370" stroke-width="4" stroke-linecap="round"/>
      <path d="M16 54 V30 M32 54 V34 M48 54 V24" stroke="#B68B5A" stroke-width="2.5"/>
      <rect x="24" y="24" width="12" height="7" rx="3" fill="#FFE066" ${S}/>
    `,
    cottage: `
      <rect x="15" y="30" width="34" height="25" rx="3" fill="#D8A36D" ${S}/>
      <polygon points="9,32 32,12 55,32" fill="#76B86C" ${S}/>
      <rect x="27" y="40" width="10" height="15" rx="4" fill="#8C5932" ${S}/>
      <circle cx="32" cy="24" r="4" fill="#FFF2B8" ${S}/>
    `,
    shrine: `
      <path d="M10 18 Q32 23 54 18" fill="none" stroke="#DF5B4F" stroke-width="6" stroke-linecap="round"/>
      <rect x="15" y="26" width="34" height="5" rx="2" fill="#DF5B4F" ${S}/>
      <rect x="19" y="21" width="6" height="35" rx="2" fill="#DF5B4F" ${S}/>
      <rect x="39" y="21" width="6" height="35" rx="2" fill="#DF5B4F" ${S}/>
      <rect x="29" y="21" width="6" height="8" fill="#5A4031"/>
    `,
    statue_bell: `
      <path d="M20 44 C20 26 24 16 32 16 C40 16 44 26 44 44 L48 48 H16 Z" fill="#F8C84A" ${S}/>
      <circle cx="32" cy="51" r="4.5" fill="#D48B28" ${S}/>
      <circle cx="32" cy="13" r="3" fill="#D48B28" ${S}/>
    `,
    castle: `
      <rect x="16" y="28" width="32" height="27" fill="#FFF3E0" ${S}/>
      <rect x="11" y="22" width="11" height="33" fill="#FFE2EC" ${S}/>
      <rect x="42" y="22" width="11" height="33" fill="#FFE2EC" ${S}/>
      <polygon points="9,23 16.5,11 24,23" fill="#F0839A" ${S}/>
      <polygon points="40,23 47.5,11 55,23" fill="#F0839A" ${S}/>
      <polygon points="24,28 32,12 40,28" fill="#F4B255" ${S}/>
      <path d="M27 55 V42 C27 38 37 38 37 42 V55 Z" fill="#A67048" ${S}/>
    `,

    // ==================== ⛵ 海洋天空 (10) ====================
    balloon: `
      <path d="M32 39 C20 39 14 29 14 22 C14 13 22 8 32 8 C42 8 50 13 50 22 C50 29 44 39 32 39 Z" fill="#FF8C82" ${S}/>
      <path d="M32 8 C26 15 26 30 32 39 C38 30 38 15 32 8 Z" fill="#FFE07D" ${S}/>
      <path d="M27 39 L28 47 M37 39 L36 47" ${S}/>
      <rect x="26" y="47" width="12" height="8" rx="2" fill="#C48A54" ${S}/>
    `,
    sailboat: `
      <path d="M12 44 H52 L46 54 H18 Z" fill="#C98349" ${S}/>
      <path d="M32 14 V44" ${S}/>
      <polygon points="32,14 16,40 32,40" fill="#FFFDF7" ${S}/>
      <polygon points="34,18 49,40 34,40" fill="#FF9E8A" ${S}/>
    `,
    rainbow: `
      <path d="M10 46 A22 22 0 0 1 54 46" fill="none" stroke="#F07B72" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 46 A17 17 0 0 1 49 46" fill="none" stroke="#F8C84A" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 46 A12 12 0 0 1 44 46" fill="none" stroke="#6AC477" stroke-width="5" stroke-linecap="round"/>
      <circle cx="13" cy="48" r="6" fill="#FFFDF7" ${S}/><circle cx="51" cy="48" r="6" fill="#FFFDF7" ${S}/>
    `,
    kite: `
      <polygon points="32,10 48,26 32,44 16,26" fill="#FF9E7D" ${S}/>
      <polygon points="32,10 48,26 32,26" fill="#FFE066" ${S}/>
      <path d="M32 44 Q38 50 31 56" fill="none" ${S}/>
    `,
    parasol: `
      <path d="M32 28 V55" stroke="#B67C49" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M10 31 C12 16 22 12 32 12 C42 12 52 16 54 31 Z" fill="#F27C72" ${S}/>
      <path d="M21 31 C23 18 28 12 32 12 C36 12 41 18 43 31 Z" fill="#FFF5DC" ${S}/>
    `,
    shell: `
      <path d="M14 42 C12 24 22 14 32 14 C42 14 52 24 50 42 L40 52 H24 Z" fill="#FFD3C2" ${S}/>
      <path d="M32 14 V50 M22 19 L28 50 M42 19 L36 50" stroke="#C98A78" stroke-width="2"/>
    `,
    shootingstar: `
      <path d="M10 48 L34 26 M16 52 L36 33" stroke="#FFE07D" stroke-width="4" stroke-linecap="round"/>
      <polygon points="42,10 45,19 54,19 47,25 49,34 42,29 35,34 37,25 30,19 39,19" fill="#FFD447" ${S}/>
    `,
    moon: `
      <path d="M40 14 C26 14 16 24 16 36 C16 48 26 56 38 54 C29 50 26 40 30 30 C32 23 36 18 40 14 Z" fill="#FFE07D" ${S}/>
      <circle cx="45" cy="22" r="2.8" fill="#FFF4B8"/><circle cx="49" cy="34" r="2" fill="#FFF4B8"/>
    `,
    sun_happy: `
      <g stroke="#F2A43B" stroke-width="3.5" stroke-linecap="round">
        <line x1="32" y1="7" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="57"/>
        <line x1="7" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="57" y2="32"/>
        <line x1="14" y1="14" x2="19" y2="19"/><line x1="45" y1="45" x2="50" y2="50"/>
        <line x1="50" y1="14" x2="45" y2="19"/><line x1="19" y1="45" x2="14" y2="50"/>
      </g>
      <circle cx="32" cy="32" r="14" fill="#FFE066" ${S}/>
      <circle cx="27" cy="30" r="1.8" fill="#5A4031"/><circle cx="37" cy="30" r="1.8" fill="#5A4031"/>
      <path d="M28 35 Q32 38 36 35" fill="none" stroke="#5A4031" stroke-width="2" stroke-linecap="round"/>
    `,
    rocket: `
      <path d="M32 9 C42 18 44 32 42 44 H22 C20 32 22 18 32 9 Z" fill="#FFFDF7" ${S}/>
      <path d="M25 18 H39 C37 14 35 11 32 9 C29 11 27 14 25 18 Z" fill="#E86A5A" ${S}/>
      <polygon points="22,34 13,44 22,44" fill="#E86A5A" ${S}/>
      <polygon points="42,34 51,44 42,44" fill="#E86A5A" ${S}/>
      <circle cx="32" cy="28" r="5" fill="#A8E6CF" ${S}/>
      <path d="M27 44 L32 56 L37 44 Z" fill="#FFB74D" ${S}/>
    `,

    // ==================== 🎵 慶典寶物 (10) ====================
    campfire: `
      <rect x="14" y="45" width="36" height="7" rx="3" fill="#9E6234" ${S} transform="rotate(-10 32 48)"/>
      <rect x="14" y="45" width="36" height="7" rx="3" fill="#B67742" ${S} transform="rotate(10 32 48)"/>
      <path d="M32 14 C44 25 46 38 32 44 C18 38 20 25 32 14 Z" fill="#FF7B54" ${S}/>
      <path d="M32 24 C38 30 39 39 32 43 C25 39 26 30 32 24 Z" fill="#FFE066"/>
    `,
    trophy_statue: `
      <path d="M18 16 H46 V28 C46 37 40 42 32 42 C24 42 18 37 18 28 Z" fill="#FFD447" ${S}/>
      <path d="M18 20 H11 C11 29 14 33 19 33 M46 20 H53 C53 29 50 33 45 33" fill="none" stroke="#E09F24" stroke-width="3.2"/>
      <rect x="29" y="42" width="6" height="8" fill="#E09F24" ${S}/>
      <rect x="20" y="50" width="24" height="6" rx="2" fill="#8C5932" ${S}/>
    `,
    music: `
      <path d="M26 44 V18 L48 14 V38" fill="none" stroke="#E87A68" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="21" cy="45" rx="7" ry="5" fill="#F4A259" ${S}/>
      <ellipse cx="43" cy="39" rx="7" ry="5" fill="#F4A259" ${S}/>
    `,
    guitar: `
      <path d="M44 12 L28 28" stroke="#8C5932" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="40" r="13" fill="#E8A25A" ${S}/>
      <circle cx="31" cy="32" r="9" fill="#E8A25A" ${S}/>
      <circle cx="26" cy="38" r="4" fill="#6E4424"/>
    `,
    giftbox: `
      <rect x="14" y="25" width="36" height="30" rx="4" fill="#FF8C82" ${S}/>
      <rect x="12" y="21" width="40" height="8" rx="3" fill="#FF7369" ${S}/>
      <rect x="29" y="21" width="6" height="34" fill="#FFE066" ${S}/>
      <path d="M32 21 C24 12 18 16 24 21 M32 21 C40 12 46 16 40 21" fill="#FFE066" ${S}/>
    `,
    lantern: `
      <ellipse cx="32" cy="33" rx="16" ry="18" fill="#E85A52" ${S}/>
      <rect x="24" y="13" width="16" height="4" rx="2" fill="#FFD447" ${S}/>
      <rect x="24" y="49" width="16" height="4" rx="2" fill="#FFD447" ${S}/>
      <path d="M32 53 V59 M28 53 V58 M36 53 V58" stroke="#E09F24" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M20 26 H44 M20 40 H44" stroke="#C03E38" stroke-width="1.8"/>
    `,
    fireworks: `
      <g stroke-width="3.2" stroke-linecap="round">
        <line x1="32" y1="32" x2="32" y2="10" stroke="#F07B72"/><line x1="32" y1="32" x2="32" y2="54" stroke="#F4B255"/>
        <line x1="32" y1="32" x2="10" y2="32" stroke="#6AC477"/><line x1="32" y1="32" x2="54" y2="32" stroke="#FF92A8"/>
        <line x1="32" y1="32" x2="16" y2="16" stroke="#FFE066"/><line x1="32" y1="32" x2="48" y2="48" stroke="#E87A68"/>
        <line x1="32" y1="32" x2="48" y2="16" stroke="#82D99B"/><line x1="32" y1="32" x2="16" y2="48" stroke="#FFB76B"/>
      </g>
      <circle cx="32" cy="32" r="5" fill="#FFF3B0" ${S}/>
    `,
    crystal: `
      <circle cx="32" cy="29" r="17" fill="#E6C6F5" ${S}/>
      <path d="M23 22 C25 18 30 16 34 17" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <polygon points="18,54 22,44 42,44 46,54" fill="#9E6A42" ${S}/>
      <circle cx="35" cy="31" r="2.5" fill="#FFF"/>
    `,
    diamond: `
      <polygon points="20,16 44,16 54,28 32,54 10,28" fill="#A6E6D4" ${S}/>
      <polygon points="20,16 44,16 32,28" fill="#D4F7EC"/>
      <path d="M10 28 H54 M20 16 L24 28 L32 54 M44 16 L40 28 L32 54" stroke="#5A4031" stroke-width="1.6"/>
    `,
    crown_monument: `
      <polygon points="12,48 10,22 23,32 32,16 41,32 54,22 52,48" fill="#FFD447" ${S}/>
      <rect x="12" y="45" width="40" height="7" rx="3" fill="#E89D24" ${S}/>
      <circle cx="32" cy="37" r="3.5" fill="#E85A6A"/>
      <circle cx="21" cy="39" r="2.5" fill="#6AC477"/><circle cx="43" cy="39" r="2.5" fill="#6AC477"/>
    `,

    // ==================== 🏅 8 大榮譽徽章與鎖頭 ====================
    badge_first_clear: `
      <circle cx="32" cy="32" r="24" fill="#EAF9EE" ${S}/>
      <path d="M32 48 V30" ${S}/>
      <path d="M32 32 C20 30 16 20 20 16 C28 18 31 24 32 32 Z" fill="#6AC477" ${S}/>
      <path d="M32 34 C44 32 48 22 44 18 C36 20 33 26 32 34 Z" fill="#88DA92" ${S}/>
    `,
    badge_perfect_star: `
      <circle cx="32" cy="32" r="24" fill="#FFF6D6" ${S}/>
      <polygon points="16,42 15,24 25,31 32,19 39,31 49,24 48,42" fill="#FFD447" ${S}/>
    `,
    badge_ten_stages: `
      <circle cx="32" cy="32" r="24" fill="#FFF3D1" ${S}/>
      <polygon points="32,12 37,24 50,25 40,34 43,47 32,40 21,47 24,34 14,25 27,24" fill="#FFCA3A" ${S}/>
    `,
    badge_shop_builder: `
      <circle cx="32" cy="32" r="24" fill="#FFEAE5" ${S}/>
      <rect x="18" y="25" width="28" height="22" rx="4" fill="#F08378" ${S}/>
      <path d="M24 25 C24 16 40 16 40 25" fill="none" stroke="#5A4031" stroke-width="2.5"/>
    `,
    badge_glossary_fan: `
      <circle cx="32" cy="32" r="24" fill="#F2F8E8" ${S}/>
      <rect x="19" y="16" width="26" height="32" rx="5" fill="#FFFDF7" ${S}/>
      <path d="M25 26 H39 M25 33 H39 M25 40 H34" stroke="#6AC477" stroke-width="2.6" stroke-linecap="round"/>
    `,
    badge_checkin_3: `
      <circle cx="32" cy="32" r="24" fill="#FFF2DC" ${S}/>
      <rect x="17" y="20" width="30" height="26" rx="5" fill="#FFFDF7" ${S}/>
      <rect x="17" y="20" width="30" height="9" rx="3" fill="#F08370" ${S}/>
      <path d="M26 37 L30 41 L39 32" fill="none" stroke="#52B068" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    badge_rich_coins: `
      <circle cx="32" cy="32" r="24" fill="#FFF6D6" ${S}/>
      <circle cx="32" cy="32" r="15" fill="#FFD447" ${S}/>
      <circle cx="32" cy="32" r="10" fill="#FFE680" stroke="#D48B28" stroke-width="1.8"/>
      <polygon points="32,25 34,30 39,30 35,33 36,38 32,35 28,38 29,33 25,30 30,30" fill="#D48B28"/>
    `,
    badge_unit_master: `
      <circle cx="32" cy="32" r="24" fill="#FFF1CE" ${S}/>
      <path d="M21 18 H43 V29 C43 36 38 40 32 40 C26 40 21 36 21 29 Z" fill="#FFD447" ${S}/>
      <rect x="29" y="40" width="6" height="6" fill="#E09F24" ${S}/>
      <rect x="23" y="46" width="18" height="4" rx="2" fill="#8C5932" ${S}/>
    `,
    badge_grand_slam: `
      <circle cx="32" cy="32" r="26" fill="#FFE8A3" stroke="#D48B28" stroke-width="2.6"/>
      <circle cx="32" cy="32" r="21" fill="#FFF8DE" stroke="#F4B255" stroke-width="1.8" stroke-dasharray="4 3"/>
      <polygon points="15,41 13,22 24,30 32,16 40,30 51,22 49,41" fill="#FFD447" ${S}/>
      <rect x="15" y="39" width="34" height="6" rx="2.5" fill="#E89D24" ${S}/>
      <circle cx="32" cy="33" r="3" fill="#E85A6A"/>
      <circle cx="22" cy="35" r="2.2" fill="#5CB574"/><circle cx="42" cy="35" r="2.2" fill="#5CB574"/>
    `,
    locked: `
      <rect x="18" y="28" width="28" height="22" rx="6" fill="#D8CEBE" ${S}/>
      <path d="M24 28 V21 C24 15 40 15 40 21 V28" fill="none" stroke="#8C7B68" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="32" cy="38" r="3" fill="#7A6A58"/>
    `,

    // ==================== 👩‍🎨 各行各業可愛風小人物 (12) ====================
    char_teacher: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#6AC477" ${S}/>
      <rect x="28" y="39" width="8" height="16" fill="#FFFDF7" ${S}/>
      <circle cx="32" cy="24" r="13" fill="#FFE0C2" ${S}/>
      <path d="M19 22 C19 12 27 9 32 9 C38 9 45 12 45 22 C41 18 37 16 32 16 C27 16 23 18 19 22 Z" fill="#6E4A32" ${S}/>
      <circle cx="27" cy="25" r="3.4" fill="none" stroke="#5A4031" stroke-width="1.8"/>
      <circle cx="37" cy="25" r="3.4" fill="none" stroke="#5A4031" stroke-width="1.8"/>
      <path d="M30.4 25 H33.6" stroke="#5A4031" stroke-width="1.6"/>
      <circle cx="27" cy="25" r="1.4" fill="#3F2B1D"/><circle cx="37" cy="25" r="1.4" fill="#3F2B1D"/>
      <ellipse cx="23" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="41" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31 Q32 33.5 35 31" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M45 44 L55 31" stroke="#C48242" stroke-width="2.6" stroke-linecap="round"/>
    `,
    char_chef: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFFDF8" ${S}/>
      <path d="M25 40 L32 45 L39 40" fill="none" stroke="#E86A5A" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="27" r="12" fill="#FFE0C2" ${S}/>
      <path d="M21 18 C18 12 24 7 29 9 C31 5 37 6 38 10 C44 9 46 15 43 18 Z" fill="#FFFDF8" ${S}/>
      <rect x="22" y="16" width="20" height="5" rx="2" fill="#FFFDF8" ${S}/>
      <circle cx="27.5" cy="27" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32 Q32 34.5 35 32" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="48" cy="43" r="4" fill="#FFB3C6" ${S}/>
    `,
    char_doctor: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFFDF8" ${S}/>
      <path d="M26 39 C26 48 38 48 38 39" fill="none" stroke="#8C7A6B" stroke-width="2.4"/>
      <circle cx="32" cy="49" r="3" fill="#F4B255" ${S}/>
      <circle cx="32" cy="26" r="12.5" fill="#FFE0C2" ${S}/>
      <path d="M20 22 C21 13 27 10 32 10 C37 10 43 13 44 22 C39 18 25 18 20 22 Z" fill="#5A4031" ${S}/>
      <rect x="25" y="9" width="14" height="8" rx="3" fill="#FFFDF8" ${S}/>
      <path d="M32 11 V15 M30 13 H34" stroke="#E85A5A" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="27.5" cy="26" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="26" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31 Q32 33.5 35 31" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_firefighter: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#E86254" ${S}/>
      <rect x="21" y="45" width="22" height="4" fill="#FFE066"/>
      <circle cx="32" cy="27" r="12" fill="#FFE0C2" ${S}/>
      <path d="M16 23 C17 12 24 9 32 9 C40 9 47 12 48 23 Z" fill="#E85A4F" ${S}/>
      <rect x="28" y="13" width="8" height="6" rx="2" fill="#FFE066" ${S}/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_astronaut: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFFDF8" ${S}/>
      <rect x="26" y="43" width="12" height="7" rx="2" fill="#F4B255" ${S}/>
      <circle cx="32" cy="25" r="15" fill="#FFFDF8" ${S}/>
      <circle cx="32" cy="26" r="11" fill="#FFE5CC" ${S}/>
      <circle cx="28" cy="25.5" r="1.8" fill="#3F2B1D"/><circle cx="36" cy="25.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24.5" cy="29" rx="2.2" ry="1.2" fill="#FF98A8"/><ellipse cx="39.5" cy="29" rx="2.2" ry="1.2" fill="#FF98A8"/>
      <path d="M29.5 30.5 Q32 33 34.5 30.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M32 10 V6" stroke="#F4B255" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="5" r="2.2" fill="#FFD447" ${S}/>
    `,
    char_artist: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FF9E8A" ${S}/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <ellipse cx="33" cy="14" rx="14" ry="6.5" fill="#C95F55" ${S} transform="rotate(-10 33 14)"/>
      <path d="M32 8 L33 5" ${S}/>
      <circle cx="27.5" cy="26" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="26" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31 Q32 33.5 35 31" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <ellipse cx="47" cy="46" rx="7" ry="5.5" fill="#F5D7A4" ${S}/>
      <circle cx="45" cy="44" r="1.5" fill="#E85A6A"/><circle cx="49" cy="45" r="1.5" fill="#6AC477"/><circle cx="46" cy="48" r="1.5" fill="#FFD447"/>
    `,
    char_farmer: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#F4B255" ${S}/>
      <rect x="24" y="42" width="16" height="13" rx="3" fill="#77B96E" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <ellipse cx="32" cy="18" rx="18" ry="4.5" fill="#F5D27A" ${S}/>
      <path d="M22 18 C22 10 42 10 42 18 Z" fill="#F5D27A" ${S}/>
      <path d="M22 17 H42" stroke="#E86A5A" stroke-width="3"/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_baker: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFF3DC" ${S}/>
      <rect x="24" y="42" width="16" height="13" rx="3" fill="#B97A4B" ${S}/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <path d="M19 23 C19 13 26 10 32 10 C38 10 45 13 45 23 C41 19 23 19 19 23 Z" fill="#9E6234" ${S}/>
      <circle cx="27.5" cy="26" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="26" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="29.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31 Q32 33.5 35 31" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <ellipse cx="47" cy="45" rx="4.5" ry="9" fill="#E6A556" ${S} transform="rotate(24 47 45)"/>
    `,
    char_musician: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#D98B5F" ${S}/>
      <polygon points="28,39 36,39 32,44" fill="#E85A6A"/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <ellipse cx="32" cy="18" rx="14" ry="3.5" fill="#7D5638" ${S}/>
      <rect x="23" y="10" width="18" height="8" rx="3" fill="#7D5638" ${S}/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M48 39 V26 L54 24 V36" fill="none" stroke="#E87A68" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="46" cy="39" r="2.6" fill="#E87A68"/>
    `,
    char_gardener: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#82D48B" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <path d="M17 20 C19 10 26 9 32 9 C38 9 45 10 47 20 Z" fill="#5CB574" ${S}/>
      <circle cx="41" cy="15" r="3.5" fill="#FFE066" ${S}/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <rect x="43" y="43" width="9" height="8" rx="2" fill="#FFE07D" ${S}/>
      <path d="M52 46 L56 43" ${S}/>
    `,
    char_captain: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFFDF8" ${S}/>
      <polygon points="24,39 40,39 32,47" fill="#E86A5A" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <path d="M18 19 H46 L43 11 H21 Z" fill="#FFFDF8" ${S}/>
      <rect x="20" y="17" width="24" height="3.5" fill="#F4B255"/>
      <circle cx="32" cy="14" r="2.2" fill="#F4B255"/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_scientist: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFFDF8" ${S}/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <path d="M18 22 C16 14 23 9 28 11 C31 6 38 7 39 11 C45 10 47 16 45 22 C41 18 23 18 18 22 Z" fill="#D4C7B8" ${S}/>
      <rect x="21" y="16" width="10" height="6" rx="3" fill="#A6E6D4" ${S}/>
      <rect x="33" y="16" width="10" height="6" rx="3" fill="#A6E6D4" ${S}/>
      <circle cx="27.5" cy="27" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32 Q32 34.5 35 32" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <polygon points="46,42 50,42 53,52 43,52" fill="#8EE095" ${S}/>
    `,
    char_police: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#529478" ${S}/>
      <circle cx="37" cy="46" r="3" fill="#FFD447" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <path d="M18 19 H46 L44 11 H20 Z" fill="#467D66" ${S}/>
      <rect x="20" y="17" width="24" height="3" fill="#FFD447"/>
      <polygon points="32,11 33.4,14 36.5,14 34,15.8 35,18.5 32,16.8 29,18.5 30,15.8 27.5,14 30.6,14" fill="#FFD447"/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_pilot: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#B57B4C" ${S}/>
      <path d="M23 39 H41 L46 46 L38 45 L32 43 L23 43 Z" fill="#E86A5A" ${S}/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <path d="M19 25 C19 13 25 10 32 10 C39 10 45 13 45 25 C43 18 21 18 19 25 Z" fill="#8C5932" ${S}/>
      <rect x="20" y="14" width="10" height="6" rx="3" fill="#FFE699" ${S}/>
      <rect x="34" y="14" width="10" height="6" rx="3" fill="#FFE699" ${S}/>
      <circle cx="27.5" cy="27" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="30.5" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32 Q32 34.5 35 32" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_vet: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FFE4EC" ${S}/>
      <path d="M32 44 C29 41 25 43 27 47 L32 51 L37 47 C39 43 35 41 32 44 Z" fill="#F0728A"/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <path d="M19 23 C19 12 26 9 32 9 C38 9 45 12 45 23 C41 19 23 19 19 23 Z" fill="#8C5932" ${S}/>
      <circle cx="27.5" cy="26.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="26.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="30" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="30" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31.5 Q32 34 35 31.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_postman: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#5CB574" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <path d="M18 19 H46 L42 11 H22 Z" fill="#4DA365" ${S}/>
      <path d="M17 19 H47" stroke="#FFE066" stroke-width="2.5"/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <rect x="41" y="42" width="13" height="9" rx="2" fill="#FFFDF7" ${S}/>
      <path d="M41 43 L47.5 48 L54 43" fill="none" stroke="#E86A5A" stroke-width="1.8"/>
    `,
    char_dancer: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M15 53 L23 40 H41 L49 53 Q32 58 15 53 Z" fill="#FFB3CC" ${S}/>
      <circle cx="32" cy="25" r="12" fill="#FFE0C2" ${S}/>
      <circle cx="32" cy="11" r="5" fill="#7D5638" ${S}/>
      <path d="M20 22 C20 13 26 10 32 10 C38 10 44 13 44 22 C40 18 24 18 20 22 Z" fill="#7D5638" ${S}/>
      <polygon points="27,14 32,8 37,14" fill="#FFD447" ${S}/>
      <circle cx="27.5" cy="25.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="25.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 30.5 Q32 33 35 30.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,
    char_detective: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#D4A66A" ${S}/>
      <circle cx="32" cy="27" r="11.5" fill="#FFE0C2" ${S}/>
      <ellipse cx="32" cy="18" rx="16" ry="4" fill="#B5834B" ${S}/>
      <path d="M21 18 C22 10 42 10 43 18 Z" fill="#C9965B" ${S}/>
      <circle cx="27.5" cy="27.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="27.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="31" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 32.5 Q32 35 35 32.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="48" cy="43" r="5" fill="#E8F9F2" ${S}/>
      <path d="M51 47 L55 52" stroke="#7D5638" stroke-width="3" stroke-linecap="round"/>
    `,
    char_librarian: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#E6B89C" ${S}/>
      <circle cx="32" cy="25" r="12" fill="#FFE0C2" ${S}/>
      <path d="M19 23 C19 12 26 9 32 9 C38 9 45 12 45 23 C41 19 23 19 19 23 Z" fill="#6E4A32" ${S}/>
      <circle cx="27.5" cy="25.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="25.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="29" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 30.5 Q32 33 35 30.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
      <rect x="24" y="42" width="16" height="12" rx="2" fill="#6AC477" ${S}/>
      <path d="M32 42 V54" stroke="#FFFDF7" stroke-width="2"/>
    `,
    char_athlete: `
      <ellipse cx="32" cy="57" rx="14" ry="3.5" fill="rgba(60,90,50,0.18)"/>
      <path d="M19 55 C19 42 24 38 32 38 C40 38 45 42 45 55 Z" fill="#FF8C69" ${S}/>
      <circle cx="32" cy="46" r="4" fill="#FFD447" ${S}/>
      <circle cx="32" cy="26" r="12" fill="#FFE0C2" ${S}/>
      <path d="M19 22 C19 12 26 9 32 9 C38 9 45 12 45 22 Z" fill="#5A4031" ${S}/>
      <rect x="20" y="17" width="24" height="4" rx="2" fill="#E85A52"/>
      <circle cx="27.5" cy="26.5" r="1.8" fill="#3F2B1D"/><circle cx="36.5" cy="26.5" r="1.8" fill="#3F2B1D"/>
      <ellipse cx="24" cy="30" rx="2.3" ry="1.3" fill="#FF98A8"/><ellipse cx="40" cy="30" rx="2.3" ry="1.3" fill="#FF98A8"/>
      <path d="M29 31.5 Q32 34 35 31.5" fill="none" stroke="#5A4031" stroke-width="1.7" stroke-linecap="round"/>
    `,

    // ==================== 🏘️ 多種可愛房型建築 (+6) ====================
    house_treehouse: `
      <rect x="25" y="34" width="14" height="22" rx="3" fill="#9E6234" ${S}/>
      <circle cx="20" cy="26" r="12" fill="#6AC477" ${S}/>
      <circle cx="44" cy="26" r="12" fill="#5CB56C" ${S}/>
      <circle cx="32" cy="18" r="13" fill="#82D48B" ${S}/>
      <rect x="21" y="21" width="22" height="16" rx="3" fill="#E8B87D" ${S}/>
      <polygon points="18,22 32,11 46,22" fill="#C96F4B" ${S}/>
      <circle cx="32" cy="29" r="3.5" fill="#FFE680" ${S}/>
    `,
    house_cafe: `
      <rect x="12" y="26" width="40" height="29" rx="4" fill="#FFF7E4" ${S}/>
      <path d="M10 28 L15 17 H49 L54 28 Z" fill="#F08A78" ${S}/>
      <path d="M18 17 L16 28 M26 17 L25 28 M34 17 L35 28 M42 17 L44 28" stroke="#FFFDF7" stroke-width="3"/>
      <rect x="18" y="35" width="12" height="11" rx="2" fill="#FFE8A3" ${S}/>
      <rect x="35" y="35" width="11" height="20" rx="3" fill="#B57B4C" ${S}/>
      <circle cx="32" cy="12" r="4" fill="#A66D3F" ${S}/>
    `,
    house_mushroom: `
      <path d="M20 34 H44 L46 55 H18 Z" fill="#FFF4DE" ${S}/>
      <path d="M9 35 C9 16 21 10 32 10 C43 10 55 16 55 35 Z" fill="#F06E78" ${S}/>
      <circle cx="22" cy="23" r="4" fill="#FFFDF7"/><circle cx="39" cy="20" r="3.5" fill="#FFFDF7"/><circle cx="45" cy="29" r="3" fill="#FFFDF7"/>
      <path d="M26 55 V42 C26 38 38 38 38 42 V55 Z" fill="#C4834B" ${S}/>
    `,
    house_villa: `
      <rect x="13" y="22" width="38" height="33" rx="4" fill="#FFFDF7" ${S}/>
      <rect x="10" y="18" width="44" height="7" rx="3" fill="#F4B255" ${S}/>
      <rect x="18" y="29" width="28" height="9" rx="2" fill="#A8E6CF" ${S}/>
      <path d="M18 38 H46" stroke="#C98A4B" stroke-width="2.5"/>
      <rect x="26" y="42" width="12" height="13" rx="2" fill="#D4955A" ${S}/>
    `,
    house_teahouse: `
      <rect x="15" y="30" width="34" height="25" fill="#FFF6E0" ${S}/>
      <path d="M8 31 Q32 22 56 31 L46 17 H18 Z" fill="#5D8C68" ${S}/>
      <rect x="23" y="36" width="18" height="19" fill="#E8D7B7" ${S}/>
      <path d="M32 36 V55 M23 45 H41" stroke="#8C6A46" stroke-width="2"/>
      <circle cx="19" cy="36" r="3" fill="#E86258" ${S}/>
    `,
    house_bakery: `
      <rect x="13" y="27" width="38" height="28" rx="4" fill="#E8B288" ${S}/>
      <polygon points="9,29 32,12 55,29" fill="#B85D4B" ${S}/>
      <rect x="26" y="38" width="12" height="17" rx="5" fill="#8C5932" ${S}/>
      <ellipse cx="32" cy="22" rx="7" ry="4" fill="#F6C86E" ${S}/>
    `,

    // ==================== 🌳 樹、花、草 (+7) ====================
    plant_maple: `
      <rect x="28" y="38" width="8" height="17" rx="2" fill="#8C5932" ${S}/>
      <circle cx="21" cy="29" r="11" fill="#F07B52" ${S}/>
      <circle cx="43" cy="29" r="11" fill="#E85A4F" ${S}/>
      <circle cx="32" cy="20" r="13" fill="#F6A24B" ${S}/>
    `,
    plant_appletree: `
      <rect x="27" y="39" width="10" height="16" rx="3" fill="#A66D3F" ${S}/>
      <circle cx="21" cy="29" r="11" fill="#68C078" ${S}/>
      <circle cx="43" cy="29" r="11" fill="#59B068" ${S}/>
      <circle cx="32" cy="20" r="13" fill="#7ED487" ${S}/>
      <circle cx="24" cy="26" r="3.5" fill="#E85A52" ${S}/>
      <circle cx="38" cy="21" r="3.5" fill="#E85A52" ${S}/>
      <circle cx="36" cy="32" r="3.5" fill="#E85A52" ${S}/>
    `,
    plant_willow: `
      <rect x="28" y="36" width="8" height="19" rx="2" fill="#9E6A42" ${S}/>
      <path d="M14 44 C14 20 22 12 32 12 C42 12 50 20 50 44" fill="#8EDB92" ${S}/>
      <path d="M20 22 V46 M26 18 V48 M32 16 V46 M38 18 V48 M44 22 V46" stroke="#58A866" stroke-width="2.2" stroke-linecap="round"/>
    `,
    plant_lavender: `
      <path d="M22 55 V24 M32 55 V18 M42 55 V24" stroke="#5CB574" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="22" cy="24" rx="5" ry="9" fill="#C79CE8" ${S}/>
      <ellipse cx="32" cy="19" rx="5.5" ry="10" fill="#B584DC" ${S}/>
      <ellipse cx="42" cy="24" rx="5" ry="9" fill="#D5B2F0" ${S}/>
    `,
    plant_daisy: `
      <path d="M32 36 V56" stroke="#5CB574" stroke-width="3" stroke-linecap="round"/>
      <g fill="#FFFDF8" ${S}>
        <circle cx="32" cy="17" r="6"/><circle cx="32" cy="35" r="6"/>
        <circle cx="23" cy="26" r="6"/><circle cx="41" cy="26" r="6"/>
      </g>
      <circle cx="32" cy="26" r="7" fill="#FFD447" ${S}/>
    `,
    plant_grass: `
      <path d="M12 52 Q16 32 22 46 Q24 22 32 44 Q40 20 42 46 Q48 32 52 52 Z" fill="#76CC80" ${S}/>
      <circle cx="23" cy="43" r="2.5" fill="#FFE066"/><circle cx="40" cy="42" r="2.5" fill="#FFB3C6"/>
    `,
    plant_dandelion: `
      <path d="M32 36 V56" stroke="#6AC477" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="32" cy="25" r="13" fill="#FFFDF7" stroke="#D9CBB4" stroke-width="2.5" stroke-dasharray="4 3"/>
      <circle cx="32" cy="25" r="5" fill="#F4E3B8"/>
      <circle cx="49" cy="15" r="3" fill="#FFFDF7" stroke="#D9CBB4" stroke-width="1.5"/>
    `,

    // ==================== 🐾 更多超萌動物 (+7) ====================
    animal_corgi: `
      <polygon points="18,24 15,10 27,18" fill="#E89D52" ${S}/>
      <polygon points="46,24 49,10 37,18" fill="#E89D52" ${S}/>
      <ellipse cx="32" cy="45" rx="15" ry="10" fill="#F0AA60" ${S}/>
      <circle cx="32" cy="29" r="13" fill="#F0AA60" ${S}/>
      <path d="M23 33 C25 27 39 27 41 33 C39 39 25 39 23 33 Z" fill="#FFFDF7"/>
      <circle cx="27" cy="27" r="2" fill="#3F2B1D"/><circle cx="37" cy="27" r="2" fill="#3F2B1D"/>
      <ellipse cx="32" cy="31" rx="2.4" ry="1.8" fill="#3F2B1D"/>
    `,
    animal_cat: `
      <polygon points="19,24 17,12 28,19" fill="#F6B26B" ${S}/>
      <polygon points="45,24 47,12 36,19" fill="#F6B26B" ${S}/>
      <ellipse cx="32" cy="45" rx="14" ry="10" fill="#F6B26B" ${S}/>
      <circle cx="32" cy="29" r="12.5" fill="#F6B26B" ${S}/>
      <path d="M29 18 V22 M32 17 V22 M35 18 V22" stroke="#C97A34" stroke-width="2" stroke-linecap="round"/>
      <circle cx="27" cy="29" r="2" fill="#3F2B1D"/><circle cx="37" cy="29" r="2" fill="#3F2B1D"/>
      <ellipse cx="23" cy="32" rx="2.4" ry="1.3" fill="#FF98A8"/><ellipse cx="41" cy="32" rx="2.4" ry="1.3" fill="#FF98A8"/>
    `,
    animal_koala: `
      <circle cx="17" cy="25" r="8" fill="#C4BFB8" ${S}/><circle cx="47" cy="25" r="8" fill="#C4BFB8" ${S}/>
      <circle cx="17" cy="25" r="4" fill="#FFF3E6"/><circle cx="47" cy="25" r="4" fill="#FFF3E6"/>
      <ellipse cx="32" cy="46" rx="13" ry="9" fill="#C4BFB8" ${S}/>
      <circle cx="32" cy="29" r="12.5" fill="#D4CFC8" ${S}/>
      <ellipse cx="32" cy="31" rx="3.5" ry="5" fill="#5A4031"/>
      <circle cx="25" cy="28" r="1.9" fill="#3F2B1D"/><circle cx="39" cy="28" r="1.9" fill="#3F2B1D"/>
    `,
    animal_deer: `
      <path d="M24 18 L20 10 M22 14 L16 13 M40 18 L44 10 M42 14 L48 13" stroke="#8C5932" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="32" cy="46" rx="14" ry="9" fill="#D99B62" ${S}/>
      <circle cx="32" cy="29" r="12" fill="#E3A86E" ${S}/>
      <circle cx="25" cy="44" r="2" fill="#FFF6DC"/><circle cx="38" cy="45" r="2" fill="#FFF6DC"/>
      <circle cx="27" cy="28" r="2" fill="#3F2B1D"/><circle cx="37" cy="28" r="2" fill="#3F2B1D"/>
      <ellipse cx="32" cy="32" rx="2.4" ry="1.6" fill="#5A4031"/>
    `,
    animal_fox: `
      <polygon points="18,24 15,10 28,18" fill="#E87A46" ${S}/>
      <polygon points="46,24 49,10 36,18" fill="#E87A46" ${S}/>
      <ellipse cx="32" cy="45" rx="14" ry="10" fill="#E87A46" ${S}/>
      <circle cx="32" cy="29" r="12.5" fill="#F08652" ${S}/>
      <path d="M20 31 Q32 39 44 31 Q32 42 20 31 Z" fill="#FFFDF7"/>
      <circle cx="27" cy="28" r="2" fill="#3F2B1D"/><circle cx="37" cy="28" r="2" fill="#3F2B1D"/>
      <circle cx="32" cy="32" r="2.2" fill="#3F2B1D"/>
    `,
    animal_panda: `
      <circle cx="21" cy="18" r="5.5" fill="#4A3B32"/><circle cx="43" cy="18" r="5.5" fill="#4A3B32"/>
      <ellipse cx="32" cy="46" rx="14" ry="9" fill="#FFFDF8" ${S}/>
      <circle cx="32" cy="29" r="12.5" fill="#FFFDF8" ${S}/>
      <ellipse cx="26" cy="29" rx="4" ry="3.2" fill="#4A3B32"/><ellipse cx="38" cy="29" rx="4" ry="3.2" fill="#4A3B32"/>
      <circle cx="26" cy="28.5" r="1.3" fill="#FFF"/><circle cx="38" cy="28.5" r="1.3" fill="#FFF"/>
      <ellipse cx="32" cy="33" rx="2.2" ry="1.5" fill="#4A3B32"/>
    `,
    animal_turtle: `
      <circle cx="49" cy="38" r="6" fill="#82D48B" ${S}/>
      <circle cx="51" cy="37" r="1.5" fill="#3F2B1D"/>
      <path d="M14 44 C14 26 44 26 44 44 Z" fill="#52A868" ${S}/>
      <path d="M22 44 L25 32 L33 32 L36 44" fill="none" stroke="#9EE8A4" stroke-width="2"/>
      <rect x="13" y="42" width="32" height="5" rx="2.5" fill="#FFE082" ${S}/>
      <circle cx="20" cy="49" r="3.5" fill="#82D48B" ${S}/><circle cx="38" cy="49" r="3.5" fill="#82D48B" ${S}/>
    `,

    // ==================== 🚗 各種可愛交通工具 (12) ====================
    veh_car: `
      <ellipse cx="32" cy="54" rx="21" ry="4" fill="rgba(60,90,50,0.18)"/>
      <path d="M12 44 V35 C12 32 15 30 18 30 L23 20 H41 L46 30 C49 30 52 32 52 35 V44 Z" fill="#FFD452" ${S}/>
      <path d="M24 23 H40 L43 30 H21 Z" fill="#FFF7DF" ${S}/>
      <circle cx="21" cy="45" r="6" fill="#5A4031"/><circle cx="21" cy="45" r="2.6" fill="#FFFDF7"/>
      <circle cx="43" cy="45" r="6" fill="#5A4031"/><circle cx="43" cy="45" r="2.6" fill="#FFFDF7"/>
      <circle cx="49" cy="36" r="2.2" fill="#FFF5C2"/>
    `,
    veh_bus: `
      <ellipse cx="32" cy="55" rx="22" ry="4" fill="rgba(60,90,50,0.18)"/>
      <rect x="10" y="16" width="44" height="30" rx="7" fill="#E86A5A" ${S}/>
      <rect x="14" y="20" width="9" height="8" rx="2" fill="#FFF5DA" ${S}/>
      <rect x="27" y="20" width="9" height="8" rx="2" fill="#FFF5DA" ${S}/>
      <rect x="40" y="20" width="9" height="8" rx="2" fill="#FFF5DA" ${S}/>
      <rect x="14" y="32" width="14" height="8" rx="2" fill="#FFF5DA" ${S}/>
      <rect x="33" y="32" width="16" height="8" rx="2" fill="#FFF5DA" ${S}/>
      <circle cx="20" cy="47" r="5.5" fill="#5A4031"/><circle cx="20" cy="47" r="2.4" fill="#FFFDF7"/>
      <circle cx="44" cy="47" r="5.5" fill="#5A4031"/><circle cx="44" cy="47" r="2.4" fill="#FFFDF7"/>
    `,
    veh_train: `
      <circle cx="20" cy="14" r="4" fill="#FFFDF7" stroke="#D8C8AE" stroke-width="1.8"/>
      <circle cx="26" cy="10" r="3" fill="#FFFDF7" stroke="#D8C8AE" stroke-width="1.6"/>
      <rect x="16" y="19" width="7" height="10" rx="2" fill="#F4B255" ${S}/>
      <rect x="11" y="28" width="26" height="18" rx="4" fill="#5CB574" ${S}/>
      <rect x="34" y="20" width="19" height="26" rx="4" fill="#6AC477" ${S}/>
      <rect x="38" y="24" width="11" height="9" rx="2" fill="#FFF5DA" ${S}/>
      <circle cx="19" cy="47" r="5.5" fill="#5A4031"/><circle cx="19" cy="47" r="2.2" fill="#FFE066"/>
      <circle cx="32" cy="47" r="5.5" fill="#5A4031"/><circle cx="32" cy="47" r="2.2" fill="#FFE066"/>
      <circle cx="45" cy="47" r="5.5" fill="#5A4031"/><circle cx="45" cy="47" r="2.2" fill="#FFE066"/>
    `,
    veh_plane: `
      <ellipse cx="32" cy="34" rx="21" ry="8" fill="#FF9A76" ${S}/>
      <polygon points="24,27 36,27 31,11 26,11" fill="#FFE07D" ${S}/>
      <polygon points="25,40 37,40 32,53 27,53" fill="#FFE07D" ${S}/>
      <polygon points="10,24 18,31 12,34" fill="#E86A5A" ${S}/>
      <circle cx="38" cy="33" r="3" fill="#FFFDF7" ${S}/>
      <circle cx="29" cy="33" r="3" fill="#FFFDF7" ${S}/>
      <path d="M54 27 V41" stroke="#5A4031" stroke-width="3" stroke-linecap="round"/>
    `,
    veh_heli: `
      <path d="M14 14 H50 M32 14 V22" stroke="#5A4031" stroke-width="3" stroke-linecap="round"/>
      <path d="M12 31 H26" stroke="#E86A5A" stroke-width="5" stroke-linecap="round"/>
      <circle cx="11" cy="31" r="4" fill="#FFE066" ${S}/>
      <ellipse cx="36" cy="32" rx="16" ry="11" fill="#F4B255" ${S}/>
      <path d="M36 22 C45 22 51 27 51 33 H36 Z" fill="#FFF7DF" ${S}/>
      <path d="M24 47 H48 M30 43 V47 M42 43 V47" ${S}/>
    `,
    veh_bike: `
      <circle cx="18" cy="44" r="10" fill="none" stroke="#5A4031" stroke-width="3"/>
      <circle cx="46" cy="44" r="10" fill="none" stroke="#5A4031" stroke-width="3"/>
      <path d="M18 44 L29 29 H41 L46 44 M29 29 L33 44 H18" fill="none" stroke="#5CB574" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 27 H32" stroke="#8C5932" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="40" y="21" width="11" height="8" rx="2" fill="#E6B274" ${S}/>
      <circle cx="45" cy="19" r="3" fill="#FF92A8"/>
    `,
    veh_scooter: `
      <circle cx="19" cy="46" r="6.5" fill="#5A4031"/><circle cx="19" cy="46" r="2.6" fill="#FFFDF7"/>
      <circle cx="46" cy="46" r="6.5" fill="#5A4031"/><circle cx="46" cy="46" r="2.6" fill="#FFFDF7"/>
      <path d="M14 42 C14 33 23 32 30 35 H40 L43 22 H48 L47 42 Z" fill="#FFE066" ${S}/>
      <rect x="19" y="30" width="13" height="5" rx="2.5" fill="#8C5932" ${S}/>
      <circle cx="49" cy="25" r="3" fill="#FFFDF7" ${S}/>
    `,
    veh_firetruck: `
      <rect x="10" y="24" width="44" height="22" rx="5" fill="#E85A52" ${S}/>
      <rect x="37" y="28" width="12" height="9" rx="2" fill="#FFF5DA" ${S}/>
      <path d="M14 24 L34 13 L37 17 L17 28 Z" fill="#FFE07D" ${S}/>
      <rect x="41" y="19" width="6" height="5" rx="2" fill="#FFD447" ${S}/>
      <circle cx="20" cy="47" r="5.5" fill="#5A4031"/><circle cx="20" cy="47" r="2.4" fill="#FFFDF7"/>
      <circle cx="44" cy="47" r="5.5" fill="#5A4031"/><circle cx="44" cy="47" r="2.4" fill="#FFFDF7"/>
    `,
    veh_ambulance: `
      <rect x="10" y="22" width="44" height="24" rx="6" fill="#FFFDF8" ${S}/>
      <rect x="38" y="26" width="12" height="9" rx="2" fill="#D8F3E5" ${S}/>
      <path d="M24 28 V38 M19 33 H29" stroke="#E85A52" stroke-width="4" stroke-linecap="round"/>
      <rect x="29" y="17" width="8" height="5" rx="2" fill="#E85A52" ${S}/>
      <circle cx="20" cy="47" r="5.5" fill="#5A4031"/><circle cx="20" cy="47" r="2.4" fill="#FFFDF7"/>
      <circle cx="44" cy="47" r="5.5" fill="#5A4031"/><circle cx="44" cy="47" r="2.4" fill="#FFFDF7"/>
    `,
    veh_ship: `
      <rect x="22" y="15" width="7" height="10" rx="2" fill="#E86A5A" ${S}/>
      <rect x="33" y="15" width="7" height="10" rx="2" fill="#F4B255" ${S}/>
      <rect x="16" y="24" width="32" height="12" rx="3" fill="#FFFDF8" ${S}/>
      <circle cx="23" cy="30" r="2.2" fill="#FFE066"/><circle cx="32" cy="30" r="2.2" fill="#FFE066"/><circle cx="41" cy="30" r="2.2" fill="#FFE066"/>
      <path d="M9 36 H55 L48 49 H16 Z" fill="#C97B4B" ${S}/>
      <path d="M10 53 Q21 49 32 53 Q43 57 54 53" fill="none" stroke="#7ED0B0" stroke-width="2.8" stroke-linecap="round"/>
    `,
    veh_submarine: `
      <path d="M32 14 V22 M32 14 H38" fill="none" stroke="#D99B26" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="25" y="20" width="14" height="8" rx="3" fill="#F4B255" ${S}/>
      <ellipse cx="32" cy="37" rx="21" ry="12" fill="#FFD447" ${S}/>
      <circle cx="22" cy="37" r="4.2" fill="#D4F5E9" ${S}/>
      <circle cx="33" cy="37" r="4.2" fill="#D4F5E9" ${S}/>
      <circle cx="43" cy="37" r="3.5" fill="#D4F5E9" ${S}/>
      <path d="M9 31 V43" stroke="#E86A5A" stroke-width="3.5" stroke-linecap="round"/>
    `,
    veh_ufo: `
      <path d="M20 31 C20 20 44 20 44 31 Z" fill="#D4F5E9" ${S}/>
      <ellipse cx="32" cy="34" rx="23" ry="8.5" fill="#B598E6" ${S}/>
      <circle cx="19" cy="34" r="2.5" fill="#FFE066"/><circle cx="32" cy="36" r="2.5" fill="#FF92A8"/><circle cx="45" cy="34" r="2.5" fill="#FFE066"/>
      <polygon points="24,42 40,42 46,56 18,56" fill="#FFE999" opacity="0.55"/>
    `
  };

  function renderIcon(id, cls = "") {
    const body = ICONS[id] || ICONS.sunflower;
    return `<svg viewBox="0 0 64 64" class="svg-icon-art ${cls}" aria-hidden="true">${body}</svg>`;
  }

  window.MathIcons = {
    renderIcon,
    hasIcon: (id) => Boolean(ICONS[id])
  };
})();
