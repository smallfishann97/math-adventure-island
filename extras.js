/**
 * 數學遊戲冒險島｜八大實用與好玩擴充功能模組
 * 1. 島嶼金幣商店 & 佈置自己的小島
 * 2. 榮譽徽章牆 & 每日簽到任務
 * 3. 答題內建手寫計算草稿紙（Canvas）
 * 4. 題目語音朗讀按鈕
 * 5. 三款互動數學小教具（互動時鐘、互動分數披薩、互動直尺）
 * 6. 四大領域學習診斷雷達圖（原創 SVG）
 * 7. 一鍵列印 A4 單元練習卷 / 錯題補考卷（含教師解答卷）
 * 8. 學習記錄 JSON 匯出／匯入備份
 */
(function () {
  // 1. 島嶼金幣商店商品目錄（共 112 款會動的超可愛島嶼裝飾，含 20 位會說話的 Q 版小人物、12 種交通工具、多種房型、樹花草與動物，分 8 大主題！）
  const SHOP_CATEGORIES = ["全部", "👩‍🎨 Q版小人物", "🚗 交通工具", "🌸 植物花草", "🐾 動物夥伴", "🍰 甜點美食", "🎡 童話建築", "⛵ 海洋天空", "🎵 慶典寶物"];
  let activeShopCategory = "全部";

  const SHOP_ITEMS = [
    // 🌸 植物花草 (10)
    { id: "sakura", cat: "🌸 植物花草", name: "粉嫩櫻花樹", icon: "🌸", anim: "anim-sway", price: 45, x: 185, y: 185, desc: "在海風中輕輕搖曳的粉紅櫻花樹" },
    { id: "tulip", cat: "🌸 植物花草", name: "鬱金香花圃", icon: "🌷", anim: "anim-sway", price: 40, x: 408, y: 315, desc: "隨風擺動的繽紛鬱金香花圃" },
    { id: "mushroom", cat: "🌸 植物花草", name: "童話紅蘑菇", icon: "🍄", anim: "anim-bounce", price: 45, x: 245, y: 382, desc: "Q 彈微跳的可愛圓點小蘑菇" },
    { id: "hibiscus", cat: "🌸 植物花草", name: "扶桑花叢", icon: "🌺", anim: "anim-sway", price: 45, x: 675, y: 155, desc: "充滿度假氣息的搖曳扶桑花" },
    { id: "sunflower", cat: "🌸 植物花草", name: "微笑向日葵", icon: "🌻", anim: "anim-sway", price: 50, x: 300, y: 270, desc: "朝著陽光點點頭的向日葵花田" },
    { id: "clover", cat: "🌸 植物花草", name: "幸運四葉草", icon: "🍀", anim: "anim-flicker", price: 55, x: 520, y: 175, desc: "閃閃發光、帶來滿分好運的四葉草" },
    { id: "rose", cat: "🌸 植物花草", name: "紅玫瑰花園", icon: "🌹", anim: "anim-sway", price: 60, x: 605, y: 145, desc: "高雅又迷人的小島玫瑰拱門" },
    { id: "cactus", cat: "🌸 植物花草", name: "迷你仙人掌", icon: "🌵", anim: "anim-bounce", price: 50, x: 750, y: 392, desc: "長在沙灘旁會輕輕搖擺的小仙人掌" },
    { id: "bamboo", cat: "🌸 植物花草", name: "翠綠小竹林", icon: "🎋", anim: "anim-sway", price: 65, x: 215, y: 138, desc: "掛著許願紙條的涼爽小竹林" },
    { id: "lotus", cat: "🌸 植物花草", name: "水上粉蓮花", icon: "🪷", anim: "anim-float", price: 70, x: 478, y: 422, desc: "在水面上輕輕漂浮的夢幻粉紅蓮花" },

    // 🐾 動物夥伴 (10)
    { id: "butterfly", cat: "🐾 動物夥伴", name: "彩蝶花園", icon: "🦋", anim: "anim-flutter", price: 55, x: 492, y: 262, desc: "翩翩飛舞的彩色蝴蝶小花園" },
    { id: "duck", cat: "🐾 動物夥伴", name: "小鴨戲水池", icon: "🦆", anim: "anim-float", price: 65, x: 372, y: 418, desc: "在淺灘旁晃呀晃的可愛小鴨" },
    { id: "bee", cat: "🐾 動物夥伴", name: "採蜜小蜜蜂", icon: "🐝", anim: "anim-flutter", price: 50, x: 330, y: 185, desc: "嗡嗡飛舞忙著採花蜜的勤勞小蜜蜂" },
    { id: "ladybug", cat: "🐾 動物夥伴", name: "幸運小瓢蟲", icon: "🐞", anim: "anim-bounce", price: 45, x: 425, y: 265, desc: "在草葉上蹦蹦跳跳的紅點點瓢蟲" },
    { id: "rabbit", cat: "🐾 動物夥伴", name: "草原小白兔", icon: "🐇", anim: "anim-bounce", price: 75, x: 268, y: 342, desc: "喜歡在草地上跳高的軟萌小白兔" },
    { id: "squirrel", cat: "🐾 動物夥伴", name: "松果小松鼠", icon: "🐿️", anim: "anim-bounce", price: 70, x: 562, y: 215, desc: "抱著松果跳來跳去的可愛小松鼠" },
    { id: "hedgehog", cat: "🐾 動物夥伴", name: "迷你小刺蝟", icon: "🦔", anim: "anim-bounce", price: 75, x: 660, y: 348, desc: "在花園散步的圓滾滾小刺蝟" },
    { id: "swan", cat: "🐾 動物夥伴", name: "優雅白天鵝", icon: "🦢", anim: "anim-float", price: 95, x: 185, y: 432, desc: "在碧綠海灣悠閒滑水的白天鵝" },
    { id: "flamingo", cat: "🐾 動物夥伴", name: "粉紅紅鶴", icon: "🦩", anim: "anim-sway", price: 90, x: 838, y: 300, desc: "單腳站立在沙灘上的粉紅大紅鶴" },
    { id: "unicorn", cat: "🐾 動物夥伴", name: "幸運獨角獸", icon: "🦄", anim: "anim-flutter", price: 170, x: 695, y: 278, desc: "蹦蹦跳跳的傳說級幸運獨角獸" },

    // 🍰 甜點美食 (10)
    { id: "icecream", cat: "🍰 甜點美食", name: "冰淇淋小攤", icon: "🍦", anim: "anim-bounce", price: 80, x: 560, y: 345, desc: "過關累了來一支清涼香草冰淇淋！" },
    { id: "cake", cat: "🍰 甜點美食", name: "草莓甜點屋", icon: "🧁", anim: "anim-bounce", price: 85, x: 268, y: 298, desc: "香噴噴的馬卡龍杯子蛋糕野餐桌" },
    { id: "donut", cat: "🍰 甜點美食", name: "糖霜甜甜圈", icon: "🍩", anim: "anim-spin", price: 65, x: 382, y: 365, desc: "像招牌一樣慢慢旋轉的彩色甜甜圈" },
    { id: "lollipop", cat: "🍰 甜點美食", name: "彩虹棒棒糖", icon: "🍭", anim: "anim-sway", price: 55, x: 465, y: 348, desc: "比人還高的夢幻巨型彩虹棒棒糖" },
    { id: "shortcake", cat: "🍰 甜點美食", name: "慶生蛋糕塔", icon: "🎂", anim: "anim-flicker", price: 95, x: 515, y: 228, desc: "點著閃亮蠟燭的派對大蛋糕" },
    { id: "boba", cat: "🍰 甜點美食", name: "珍珠奶茶攤", icon: "🧋", anim: "anim-bounce", price: 75, x: 618, y: 252, desc: "台灣小朋友最愛的 Q 彈珍奶小攤" },
    { id: "pudding", cat: "🍰 甜點美食", name: "焦糖布丁屋", icon: "🍮", anim: "anim-bounce", price: 70, x: 730, y: 330, desc: "ㄉㄨㄞ ㄉㄨㄞ 搖晃的滑嫩焦糖布丁" },
    { id: "popcorn", cat: "🍰 甜點美食", name: "奶油爆米花", icon: "🍿", anim: "anim-bounce", price: 65, x: 312, y: 212, desc: "一直跳出香甜爆米花的可愛推車" },
    { id: "watermelon", cat: "🍰 甜點美食", name: "海邊西瓜攤", icon: "🍉", anim: "anim-sway", price: 60, x: 818, y: 268, desc: "夏日消暑必備的冰涼紅西瓜攤" },
    { id: "honey", cat: "🍰 甜點美食", name: "黃金蜂蜜罐", icon: "🍯", anim: "anim-flicker", price: 80, x: 200, y: 280, desc: "閃著甜蜜光澤的森林大蜂蜜罐" },

    // 🎡 童話建築 (10)
    { id: "windmill", cat: "🎡 童話建築", name: "童話摩天輪", icon: "🎡", anim: "anim-spin", price: 110, x: 358, y: 136, desc: "緩緩轉動的夢幻童話大摩天輪" },
    { id: "carousel", cat: "🎡 童話建築", name: "旋轉木馬", icon: "🎠", anim: "anim-bounce", price: 120, x: 430, y: 162, desc: "歡樂上下起伏的遊樂園旋轉木馬" },
    { id: "fountain", cat: "🎡 童話建築", name: "星光噴水池", icon: "⛲", anim: "anim-flicker", price: 115, x: 642, y: 392, desc: "水花閃閃發亮的許願噴水池" },
    { id: "lighthouse", cat: "🎡 童話建築", name: "海角小燈塔", icon: "🗼", anim: "anim-flicker", price: 130, x: 860, y: 205, desc: "閃耀溫暖金光的可愛海角燈塔" },
    { id: "circus", cat: "🎡 童話建築", name: "嘉年華帳篷", icon: "🎪", anim: "anim-bounce", price: 140, x: 542, y: 404, desc: "充滿笑聲與魔術表演的繽紛帳篷" },
    { id: "rollercoaster", cat: "🎡 童話建築", name: "雲霄飛車", icon: "🎢", anim: "anim-sway", price: 155, x: 488, y: 118, desc: "刺激好玩的島嶼彩虹雲霄飛車" },
    { id: "cottage", cat: "🎡 童話建築", name: "森林小木屋", icon: "🏠", anim: "anim-bounce", price: 105, x: 148, y: 278, desc: "溫馨可愛的圓木頭小渡假屋" },
    { id: "shrine", cat: "🎡 童話建築", name: "祈福紅鳥居", icon: "⛩️", anim: "anim-flicker", price: 135, x: 685, y: 122, desc: "走過去就能考一百分的祈福拱門" },
    { id: "statue_bell", cat: "🎡 童話建築", name: "幸福鐘樓", icon: "🔔", anim: "anim-sway", price: 125, x: 580, y: 298, desc: "隨風敲響清脆鐘聲的黃金小鐘樓" },
    { id: "castle", cat: "🎡 童話建築", name: "糖果小城堡", icon: "🏰", anim: "anim-flicker", price: 220, x: 735, y: 268, desc: "最高榮耀！閃閃發亮的童話城堡" },

    // ⛵ 海洋天空 (10)
    { id: "balloon", cat: "⛵ 海洋天空", name: "夢幻熱氣球", icon: "🎈", anim: "anim-float", price: 90, x: 132, y: 186, desc: "在空中輕盈上下漂浮的彩色氣球" },
    { id: "sailboat", cat: "⛵ 海洋天空", name: "冒險小帆船", icon: "⛵", anim: "anim-float", price: 125, x: 858, y: 395, desc: "隨海浪輕輕起伏的迷你小帆船" },
    { id: "rainbow", cat: "⛵ 海洋天空", name: "彩虹許願橋", icon: "🌈", anim: "anim-float", price: 150, x: 472, y: 132, desc: "漂浮在島嶼天空的七彩幸運彩虹" },
    { id: "kite", cat: "⛵ 海洋天空", name: "高飛小風箏", icon: "🪁", anim: "anim-flutter", price: 65, x: 235, y: 158, desc: "乘著海風在天空搖擺的彩色風箏" },
    { id: "parasol", cat: "⛵ 海洋天空", name: "海灘陽傘", icon: "⛱️", anim: "anim-sway", price: 70, x: 785, y: 382, desc: "在奶油沙灘旁乘涼的條紋大陽傘" },
    { id: "shell", cat: "⛵ 海洋天空", name: "珍珠大海螺", icon: "🐚", anim: "anim-flicker", price: 60, x: 292, y: 428, desc: "聽得見大海聲音的閃亮大海螺" },
    { id: "shootingstar", cat: "⛵ 海洋天空", name: "許願流星雨", icon: "🌠", anim: "anim-flutter", price: 145, x: 615, y: 112, desc: "劃過島嶼上空的閃亮許願流星" },
    { id: "moon", cat: "⛵ 海洋天空", name: "微笑彎月亮", icon: "🌙", anim: "anim-float", price: 115, x: 745, y: 120, desc: "溫柔守護冒險島的金色小彎月" },
    { id: "sun_happy", cat: "⛵ 海洋天空", name: "暖暖小太陽", icon: "☀️", anim: "anim-spin", price: 120, x: 398, y: 108, desc: "轉呀轉帶來溫暖好天氣的小太陽" },
    { id: "rocket", cat: "⛵ 海洋天空", name: "太空小火箭", icon: "🚀", anim: "anim-float", price: 185, x: 862, y: 135, desc: "準備飛向數學星球的酷炫小火箭" },

    // 🎵 慶典寶物 (10)
    { id: "campfire", cat: "🎵 慶典寶物", name: "星空營火堆", icon: "🔥", anim: "anim-flicker", price: 75, x: 158, y: 342, desc: "火苗閃爍發光的溫馨露營營火" },
    { id: "trophy_statue", cat: "🎵 慶典寶物", name: "黃金冠軍碑", icon: "🏆", anim: "anim-flicker", price: 190, x: 292, y: 214, desc: "閃耀金光的數學小博士冠軍獎盃" },
    { id: "music", cat: "🎵 慶典寶物", name: "跳動音符樹", icon: "🎵", anim: "anim-flutter", price: 70, x: 525, y: 358, desc: "會飄出快樂旋律的魔法音樂盒" },
    { id: "guitar", cat: "🎵 慶典寶物", name: "營火小吉他", icon: "🎸", anim: "anim-sway", price: 85, x: 180, y: 378, desc: "在星空下彈奏輕快曲子的木吉他" },
    { id: "giftbox", cat: "🎵 慶典寶物", name: "驚喜禮物盒", icon: "🎁", anim: "anim-bounce", price: 80, x: 452, y: 396, desc: "一直開心跳動的蝴蝶結大禮物盒" },
    { id: "lantern", cat: "🎵 慶典寶物", name: "慶典紅燈籠", icon: "🏮", anim: "anim-sway", price: 75, x: 672, y: 228, desc: "在慶典廣場隨風輕晃的溫暖燈籠" },
    { id: "fireworks", cat: "🎵 慶典寶物", name: "派對煙火秀", icon: "🎆", anim: "anim-flicker", price: 160, x: 325, y: 112, desc: "在天空綻放絢麗光彩的慶祝煙火" },
    { id: "crystal", cat: "🎵 慶典寶物", name: "魔法水晶球", icon: "🔮", anim: "anim-flicker", price: 150, x: 585, y: 162, desc: "散發神秘星光的占卜魔法水晶球" },
    { id: "diamond", cat: "🎵 慶典寶物", name: "閃耀大鑽石", icon: "💎", anim: "anim-flicker", price: 200, x: 625, y: 342, desc: "收藏家夢寐以求的璀璨大寶石" },
    { id: "crown_monument", cat: "🎵 慶典寶物", name: "島主金皇冠", icon: "👑", anim: "anim-float", price: 250, x: 502, y: 142, desc: "全島最尊貴的漂浮黃金皇冠紀念碑！" },

    // 👩‍🎨 Q版小人物 (12)
    { id: "char_teacher", cat: "👩‍🎨 Q版小人物", name: "Q版數學小老師", icon: "👩‍🏫", anim: "anim-bounce", price: 85, x: 240, y: 260, desc: "戴圓眼鏡拿教鞭的親切 Q 版數學小老師！" },
    { id: "char_chef", cat: "👩‍🎨 Q版小人物", name: "Q版甜點小主廚", icon: "👨‍🍳", anim: "anim-bounce", price: 85, x: 520, y: 310, desc: "戴著蓬蓬白高帽做蛋糕的 Q 版小主廚！" },
    { id: "char_doctor", cat: "👩‍🎨 Q版小人物", name: "Q版愛心小醫師", icon: "👩‍⚕️", anim: "anim-bounce", price: 90, x: 640, y: 240, desc: "掛著聽診器守護島上健康的 Q 版小醫師！" },
    { id: "char_firefighter", cat: "👩‍🎨 Q版小人物", name: "Q版英勇消防員", icon: "🧑‍🚒", anim: "anim-bounce", price: 90, x: 350, y: 340, desc: "戴紅色安全帽守護小島平安的 Q 版消防員！" },
    { id: "char_astronaut", cat: "👩‍🎨 Q版小人物", name: "Q版太空探險家", icon: "👩‍🚀", anim: "anim-float", price: 110, x: 760, y: 190, desc: "漂浮在半空中探索星際的 Q 版太空人！" },
    { id: "char_artist", cat: "👩‍🎨 Q版小人物", name: "Q版夢幻小畫家", icon: "👩‍🎨", anim: "anim-sway", price: 85, x: 430, y: 210, desc: "戴貝雷帽拿調色盤畫畫的 Q 版小畫家！" },
    { id: "char_farmer", cat: "👩‍🎨 Q版小人物", name: "Q版元氣小農夫", icon: "👨‍🌾", anim: "anim-bounce", price: 80, x: 280, y: 360, desc: "戴金黃草帽種出甜甜蔬果的 Q 版小農夫！" },
    { id: "char_baker", cat: "👩‍🎨 Q版小人物", name: "Q版麵包烘焙師", icon: "🥖", anim: "anim-bounce", price: 85, x: 580, y: 370, desc: "手拿剛出爐香噴噴麵包的 Q 版烘焙師！" },
    { id: "char_musician", cat: "👩‍🎨 Q版小人物", name: "Q版街頭音樂家", icon: "🎻", anim: "anim-sway", price: 95, x: 490, y: 260, desc: "戴著可愛小禮帽拉快樂旋律的 Q 版音樂家！" },
    { id: "char_gardener", cat: "👩‍🎨 Q版小人物", name: "Q版陽光小花匠", icon: "🌻", anim: "anim-bounce", price: 80, x: 380, y: 280, desc: "拿著小澆花壺照顧花圃的 Q 版小花匠！" },
    { id: "char_captain", cat: "👩‍🎨 Q版小人物", name: "Q版冒險小船長", icon: "⛵", anim: "anim-sway", price: 100, x: 790, y: 340, desc: "戴船長帽帶領群島航行的 Q 版小船長！" },
    { id: "char_scientist", cat: "👩‍🎨 Q版小人物", name: "Q版實驗小博士", icon: "🧪", anim: "anim-bounce", price: 105, x: 670, y: 310, desc: "戴護目鏡拿泡泡燒瓶做實驗的 Q 版小博士！" },
    { id: "char_police", cat: "👩‍🎨 Q版小人物", name: "Q版熱心小警察", icon: "👮", anim: "anim-bounce", price: 90, x: 220, y: 320, desc: "戴星星警帽守護小島秩序的 Q 版小警察！" },
    { id: "char_pilot", cat: "👩‍🎨 Q版小人物", name: "Q版飛官小機師", icon: "🧑‍✈️", anim: "anim-sway", price: 105, x: 740, y: 240, desc: "圍紅圍巾戴護目鏡翱翔天際的 Q 版小機師！" },
    { id: "char_vet", cat: "👩‍🎨 Q版小人物", name: "Q版動物小獸醫", icon: "🩺", anim: "anim-bounce", price: 90, x: 310, y: 230, desc: "溫柔照顧島上小動物健康的 Q 版小獸醫！" },
    { id: "char_postman", cat: "👩‍🎨 Q版小人物", name: "Q版元氣小郵差", icon: "✉️", anim: "anim-bounce", price: 85, x: 460, y: 360, desc: "每天開心送信到各座小島的 Q 版小郵差！" },
    { id: "char_dancer", cat: "👩‍🎨 Q版小人物", name: "Q版芭蕾小舞者", icon: "🩰", anim: "anim-sway", price: 95, x: 560, y: 220, desc: "穿粉紅澎澎裙優雅轉圈的 Q 版小舞者！" },
    { id: "char_detective", cat: "👩‍🎨 Q版小人物", name: "Q版數學小偵探", icon: "🔎", anim: "anim-bounce", price: 100, x: 390, y: 190, desc: "拿著放大鏡找出解題線索的 Q 版小偵探！" },
    { id: "char_librarian", cat: "👩‍🎨 Q版小人物", name: "Q版圖書管理員", icon: "📚", anim: "anim-sway", price: 85, x: 620, y: 360, desc: "抱著滿滿故事書與數學百科的 Q 版管理員！" },
    { id: "char_athlete", cat: "👩‍🎨 Q版小人物", name: "Q版運動小健將", icon: "🏅", anim: "anim-bounce", price: 90, x: 710, y: 360, desc: "綁熱血頭帶跑向滿分終點的 Q 版小健將！" },

    // 🏘️ 多種房型建築 (+6)
    { id: "house_treehouse", cat: "🎡 童話建築", name: "大樹秘密樹屋", icon: "🌳", anim: "anim-sway", price: 135, x: 250, y: 180, desc: "蓋在茂密大樹上的秘密木頭小樹屋！" },
    { id: "house_cafe", cat: "🎡 童話建築", name: "奶油咖啡甜品屋", icon: "☕", anim: "anim-bounce", price: 140, x: 420, y: 290, desc: "飄著蛋糕與拿鐵香氣的條紋遮陽棚咖啡屋！" },
    { id: "house_mushroom", cat: "🎡 童話建築", name: "童話蘑菇精靈屋", icon: "🍄", anim: "anim-bounce", price: 125, x: 310, y: 350, desc: "圓滾滾紅白點點屋頂的森林蘑菇屋！" },
    { id: "house_villa", cat: "🎡 童話建築", name: "海景陽台小別墅", icon: "🏖️", anim: "anim-flicker", price: 165, x: 740, y: 270, desc: "擁有超大陽光露台的度假風海景小別墅！" },
    { id: "house_teahouse", cat: "🎡 童話建築", name: "和風抹茶小茶屋", icon: "🍵", anim: "anim-sway", price: 145, x: 610, y: 190, desc: "掛著可愛紅燈籠的寧靜和風小茶屋！" },
    { id: "house_bakery", cat: "🎡 童話建築", name: "紅磚歐風麵包店", icon: "🥐", anim: "anim-bounce", price: 140, x: 520, y: 340, desc: "招牌掛著大麵包、溫馨迷人的紅磚麵包店！" },

    // 🌳 樹、花、草 (+7)
    { id: "plant_maple", cat: "🌸 植物花草", name: "秋日楓葉紅樹", icon: "🍁", anim: "anim-sway", price: 55, x: 220, y: 210, desc: "在暖風中飄落橘紅楓葉的浪漫楓樹！" },
    { id: "plant_appletree", cat: "🌸 植物花草", name: "結實蘋果小樹", icon: "🍎", anim: "anim-sway", price: 60, x: 640, y: 220, desc: "結滿紅通通甜美蘋果的豐收果樹！" },
    { id: "plant_willow", cat: "🌸 植物花草", name: "湖畔垂柳綠樹", icon: "🌿", anim: "anim-sway", price: 60, x: 480, y: 210, desc: "枝條輕輕隨風擺動的涼爽垂柳樹！" },
    { id: "plant_lavender", cat: "🌸 植物花草", name: "夢幻薰衣草田", icon: "💐", anim: "anim-sway", price: 55, x: 360, y: 260, desc: "散發淡淡花香的浪漫紫色薰衣草花田！" },
    { id: "plant_daisy", cat: "🌸 植物花草", name: "微笑小雛菊叢", icon: "🌼", anim: "anim-bounce", price: 40, x: 540, y: 290, desc: "開滿奶油白與金黃花蕊的小雛菊花叢！" },
    { id: "plant_grass", cat: "🌸 植物花草", name: "嫩綠幸運小草叢", icon: "🌱", anim: "anim-sway", price: 35, x: 290, y: 310, desc: "點綴著粉黃野花的柔軟小草叢！" },
    { id: "plant_dandelion", cat: "🌸 植物花草", name: "飛舞蒲公英草地", icon: "🌬️", anim: "anim-float", price: 45, x: 690, y: 320, desc: "毛茸茸隨風飄散許願種子的蒲公英！" },

    // 🐾 更多動物夥伴 (+7)
    { id: "animal_corgi", cat: "🐾 動物夥伴", name: "微笑小柯基", icon: "🐶", anim: "anim-bounce", price: 80, x: 340, y: 320, desc: "搖著短短尾巴開心奔跑的微笑小柯基！" },
    { id: "animal_cat", cat: "🐾 動物夥伴", name: "慵懶小橘貓", icon: "🐱", anim: "anim-bounce", price: 80, x: 470, y: 310, desc: "喜歡在陽光草地上打滾的軟萌小橘貓！" },
    { id: "animal_koala", cat: "🐾 動物夥伴", name: "抱樹小無尾熊", icon: "🐨", anim: "anim-sway", price: 90, x: 260, y: 240, desc: "圓滾滾大耳朵愛打瞌睡的小無尾熊！" },
    { id: "animal_deer", cat: "🐾 動物夥伴", name: "森林小梅花鹿", icon: "🦌", anim: "anim-bounce", price: 95, x: 590, y: 260, desc: "背上有奶油斑點的溫柔森林小梅花鹿！" },
    { id: "animal_fox", cat: "🐾 動物夥伴", name: "毛茸茸小狐狸", icon: "🦊", anim: "anim-bounce", price: 90, x: 670, y: 290, desc: "聰明機靈又愛交朋友的橘毛小狐狸！" },
    { id: "animal_panda", cat: "🐾 動物夥伴", name: "吃竹子小熊貓", icon: "🐼", anim: "anim-bounce", price: 100, x: 420, y: 240, desc: "黑白圓滾滾最愛啃竹子的療癒小熊貓！" },
    { id: "animal_turtle", cat: "🐾 動物夥伴", name: "悠閒小海龜", icon: "🐢", anim: "anim-float", price: 75, x: 760, y: 360, desc: "在沙灘上慢悠悠散步的幸運綠小海龜！" },

    // 🚗 各種可愛交通工具 (12)
    { id: "veh_car", cat: "🚗 交通工具", name: "奶油小汽車", icon: "🚗", anim: "anim-bounce", price: 95, x: 260, y: 330, desc: "圓滾滾暖黃色超可愛兜風小汽車！" },
    { id: "veh_bus", cat: "🚗 交通工具", name: "雙層觀光巴士", icon: "🚌", anim: "anim-bounce", price: 120, x: 420, y: 310, desc: "載著大家環島兜風的紅白雙層觀光巴士！" },
    { id: "veh_train", cat: "🚗 交通工具", name: "童話蒸汽小火車", icon: "🚂", anim: "anim-bounce", price: 145, x: 560, y: 270, desc: "噗噗冒著白煙繞著小島跑的抹茶綠小火車！" },
    { id: "veh_plane", cat: "🚗 交通工具", name: "螺旋槳小飛機", icon: "✈️", anim: "anim-float", price: 135, x: 340, y: 150, desc: "在雲朵間自由翱翔的蜜桃橘螺旋槳飛機！" },
    { id: "veh_heli", cat: "🚗 交通工具", name: "救援小直升機", icon: "🚁", anim: "anim-float", price: 130, x: 640, y: 155, desc: "空中盤旋守護六座群島的黃金小直升機！" },
    { id: "veh_bike", cat: "🚗 交通工具", name: "花籃腳踏車", icon: "🚲", anim: "anim-sway", price: 70, x: 300, y: 260, desc: "前車籃裝著可愛小花的薄荷綠復古單車！" },
    { id: "veh_scooter", cat: "🚗 交通工具", name: "復古小偉士牌", icon: "🛵", anim: "anim-bounce", price: 85, x: 490, y: 355, desc: "在小鎮巷弄噗噗騎乘的蜂蜜黃小摩托車！" },
    { id: "veh_firetruck", cat: "🚗 交通工具", name: "迷你消防車", icon: "🚒", anim: "anim-bounce", price: 125, x: 220, y: 280, desc: "配著金色雲梯隨時出動救災的帥氣消防車！" },
    { id: "veh_ambulance", cat: "🚗 交通工具", name: "愛心救護車", icon: "🚑", anim: "anim-bounce", price: 120, x: 680, y: 280, desc: "閃著愛心紅燈守護大家健康的暖心救護車！" },
    { id: "veh_ship", cat: "🚗 交通工具", name: "豪華小郵輪", icon: "🚢", anim: "anim-float", price: 160, x: 810, y: 380, desc: "航行在六座主題群島之間的夢幻大郵輪！" },
    { id: "veh_submarine", cat: "🚗 交通工具", name: "黃金小潛水艇", icon: "🚤", anim: "anim-float", price: 140, x: 155, y: 410, desc: "潛入海灣探索珊瑚礁的檸檬黃小潛水艇！" },
    { id: "veh_ufo", cat: "🚗 交通工具", name: "彩虹小飛碟", icon: "🛸", anim: "anim-float", price: 175, x: 520, y: 140, desc: "散發溫暖金光的神祕童話外星小飛碟！" }
  ];

  // 2. 榮譽徽章定義
  const BADGES = [
    {
      id: "first_clear", icon: "🌱", name: "初登冒險島", desc: "完成任意 1 個闖關關卡",
      check: (u) => Object.values(u.stageStars || {}).some((s) => s > 0)
    },
    {
      id: "perfect_star", icon: "👑", name: "滿分小博士", desc: "任意 1 關獲得 3 顆星榮耀",
      check: (u) => Object.values(u.stageStars || {}).some((s) => s >= 3)
    },
    {
      id: "ten_stages", icon: "⭐", name: "星光探險家", desc: "累計收集 15 顆以上星星",
      check: (u) => Object.values(u.stageStars || {}).reduce((a, b) => a + b, 0) >= 15
    },
    {
      id: "shop_builder", icon: "🛍️", name: "島嶼建築師", desc: "在金幣商店購買 1 件島嶼裝飾",
      check: (u) => Array.isArray(u.ownedItems) && u.ownedItems.length >= 1
    },
    {
      id: "glossary_fan", icon: "🃏", name: "名詞記憶王", desc: "在字卡館標記熟記 5 張以上字卡",
      check: (u) => Array.isArray(u.masteredTerms) && u.masteredTerms.length >= 5
    },
    {
      id: "checkin_3", icon: "📅", name: "勤學打卡星", desc: "累計簽到 3 天以上",
      check: (u) => (u.checkinDays || 0) >= 3
    },
    {
      id: "rich_coins", icon: "🪙", name: "閃亮大富翁", desc: "累計擁有 150 枚以上閃亮金幣",
      check: (u) => (u.coins || 0) >= 150
    },
    {
      id: "unit_master", icon: "🏆", name: "單元全破霸主", desc: "完成單一單元的全部 10 道關卡",
      check: (u) => {
        const counts = {};
        Object.entries(u.stageStars || {}).forEach(([k, v]) => {
          if (v > 0) {
            const uid = k.split("-")[0];
            counts[uid] = (counts[uid] || 0) + 1;
          }
        });
        return Object.values(counts).some((c) => c >= 10);
      }
    },
    {
      id: "grand_slam", icon: "👑", name: "傳說大滿貫島主", desc: "隱藏大彩蛋！全破全部 16 單元共 160 關（贈 +500 金幣）",
      check: (u) => Object.values(u.stageStars || {}).filter((s) => s > 0).length >= 160
    }
  ];

  function ensureUserExtras(user) {
    if (!user) return;
    if (!Array.isArray(user.ownedItems)) user.ownedItems = [];
    if (!Array.isArray(user.placedItems)) user.placedItems = [];
    if (!user.customPositions || typeof user.customPositions !== "object") user.customPositions = {};
    if (typeof user.checkinDays !== "number") user.checkinDays = 0;
    if (typeof user.lastCheckinDate !== "string") user.lastCheckinDate = "";
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getItemIsland(user, itemId) {
    ensureUserExtras(user);
    const custom = user.customPositions[itemId];
    return (custom && custom.island) ? custom.island : "main";
  }

  // 取得要擺放在指定島嶼上的已購買裝飾 HTML（優先使用使用者自訂島嶼與位置）
  function getPlacedIslandPropsHtml(user, selectedItemId = null, islandId = "main") {
    ensureUserExtras(user);
    return user.placedItems
      .map((id) => SHOP_ITEMS.find((it) => it.id === id))
      .filter((it) => it && getItemIsland(user, it.id) === islandId)
      .map((it) => {
        const custom = user.customPositions[it.id];
        const px = custom ? custom.x : it.x;
        const py = custom ? custom.y : it.y;
        const selCls = selectedItemId === it.id ? "is-picked" : "";
        const iconHtml = window.MathIcons ? window.MathIcons.renderIcon(it.id, "svg-prop-icon") : it.icon;
        return `<div class="island-prop custom-prop ${selCls}" data-custom-prop="${it.id}" style="left:${px}px;top:${py}px;" title="${it.name}（佈置模式可移動到任何一座島）">
             <span class="prop-emoji prop-house ${it.anim || "anim-bounce"}">${iconHtml}</span>
           </div>`;
      })
      .join("");
  }

  // ==================== 商店、簽到與徽章渲染 ====================
  function renderShopAndBadges(user, saveCb, refreshHomeCb) {
    ensureUserExtras(user);
    const today = todayKey();
    const checkedToday = user.lastCheckinDate === today;

    // 每日簽到區
    const checkinEl = document.getElementById("daily-checkin-box");
    if (checkinEl) {
      checkinEl.innerHTML = `
        <div class="checkin-info">
          <span class="checkin-icon">${window.MathIcons ? window.MathIcons.renderIcon("badge_checkin_3", "svg-checkin-icon") : "📅"}</span>
          <div>
            <h3>每日登島簽到任務</h3>
            <p>已累計簽到 <strong>${user.checkinDays} 天</strong>｜目前擁有 <strong>🪙 ${user.coins || 0} 閃亮金幣</strong></p>
          </div>
        </div>
        <button type="button" class="btn ${checkedToday ? "btn-ghost" : "btn-gold"} btn-lg" id="btn-do-checkin" ${checkedToday ? "disabled" : ""}>
          ${checkedToday ? "✅ 今日已簽到！" : "🎁 立即簽到領 +50 金幣"}
        </button>
      `;
      const btn = checkinEl.querySelector("#btn-do-checkin");
      if (btn && !checkedToday) {
        btn.addEventListener("click", () => {
          user.lastCheckinDate = today;
          user.checkinDays += 1;
          user.coins = (user.coins || 0) + 50;
          saveCb();
          refreshHomeCb();
          window.SoundFX.playFanfare(3);
          window.VisualFX.burstConfetti();
          renderShopAndBadges(user, saveCb, refreshHomeCb);
        });
      }
    }

    // 榮譽徽章牆（每點亮 1 枚徽章可額外領取一次 🪙 +30 金幣獎勵！）
    if (!Array.isArray(user.claimedBadges)) user.claimedBadges = [];
    const badgeGrid = document.getElementById("badges-grid");
    if (badgeGrid) {
      badgeGrid.innerHTML = BADGES.map((b) => {
        const unlocked = b.check(user) || (Array.isArray(user.unlockedBadges) && user.unlockedBadges.includes(b.id));
        const claimed = user.claimedBadges.includes(b.id);
        let actionHtml = `<span style="margin-top:6px;font-size:0.76rem;font-weight:800;color:var(--muted);">🔒 達成可領 +30 金幣</span>`;
        if (unlocked && !claimed) {
          actionHtml = `<button type="button" class="btn btn-gold btn-sm" data-claim-badge="${b.id}" style="margin-top:8px;">🎁 領取 +30 金幣</button>`;
        } else if (unlocked && claimed) {
          actionHtml = `<span style="margin-top:6px;font-size:0.78rem;font-weight:900;color:#257a42;">✅ 已領取 +30 金幣</span>`;
        }
        return `
          <div class="badge-card ${unlocked ? "unlocked" : "locked"}">
            <div class="badge-emoji">${window.MathIcons ? window.MathIcons.renderIcon(unlocked ? "badge_" + b.id : "locked", "svg-badge-icon") : (unlocked ? b.icon : "🔒")}</div>
            <strong>${b.name}</strong>
            <span>${b.desc}</span>
            ${actionHtml}
          </div>
        `;
      }).join("");

      badgeGrid.onclick = (ev) => {
        const claimBtn = ev.target.closest("button[data-claim-badge]");
        if (!claimBtn) return;
        const bid = claimBtn.dataset.claimBadge;
        if (user.claimedBadges.includes(bid)) return;
        user.claimedBadges.push(bid);
        user.coins = (user.coins || 0) + 30;
        saveCb();
        refreshHomeCb();
        window.SoundFX.playFanfare(3);
        window.VisualFX.burstConfetti();
        renderShopAndBadges(user, saveCb, refreshHomeCb);
      };
    }

    // 商店分類篩選列
    const catBar = document.getElementById("shop-category-bar");
    if (catBar) {
      catBar.innerHTML = SHOP_CATEGORIES.map(
        (cat) => `<button type="button" class="filter-chip ${activeShopCategory === cat ? "active" : ""}" data-shop-cat="${cat}">${cat}</button>`
      ).join("");
      catBar.onclick = (ev) => {
        const b = ev.target.closest("button[data-shop-cat]");
        if (!b) return;
        window.SoundFX.playClick();
        activeShopCategory = b.dataset.shopCat;
        renderShopAndBadges(user, saveCb, refreshHomeCb);
      };
    }

    // 島嶼金幣商店
    const shopGrid = document.getElementById("shop-grid");
    if (shopGrid) {
      const visibleItems = activeShopCategory === "全部"
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter((it) => it.cat === activeShopCategory);
      shopGrid.innerHTML = visibleItems.map((item) => {
        const owned = user.ownedItems.includes(item.id);
        const placed = user.placedItems.includes(item.id);
        const canBuy = (user.coins || 0) >= item.price;
        let btnHtml = "";
        if (!owned) {
          btnHtml = `<button type="button" class="btn ${canBuy ? "btn-gold" : "btn-ghost"} btn-sm" data-shop-buy="${item.id}" ${canBuy ? "" : "disabled"}>🪙 ${item.price} 購買</button>`;
        } else {
          btnHtml = `<button type="button" class="btn ${placed ? "btn-forest" : "btn-burgundy"} btn-sm" data-shop-toggle="${item.id}">${placed ? "🏝️ 已擺在島上（點此收回）" : "✨ 擺上我的冒險島"}</button>`;
        }
        const isChar = Boolean(CHARACTER_QUOTES[item.id]);
        return `
          <article class="shop-item-card ${owned ? "owned" : ""}">
            <div class="shop-icon ${item.anim || "anim-bounce"} ${isChar ? "shop-char-voice" : ""}" ${isChar ? `data-preview-voice="${item.id}" title="點我聽聽看說話！"` : ""}>${window.MathIcons ? window.MathIcons.renderIcon(item.id, "svg-shop-icon") : item.icon}</div>
            <h4>${item.name}${isChar ? ' <span class="voice-mini-tag">🔊點我說話</span>' : ""}</h4>
            <p>${item.desc}</p>
            ${btnHtml}
          </article>
        `;
      }).join("");

      shopGrid.onclick = (ev) => {
        const voiceEl = ev.target.closest("[data-preview-voice]");
        if (voiceEl) {
          const quotes = CHARACTER_QUOTES[voiceEl.dataset.previewVoice];
          if (quotes && quotes.length) {
            const line = quotes[Math.floor(Math.random() * quotes.length)];
            window.SoundFX.playClick();
            if (window.SpeechFX) window.SpeechFX.speak(line);
            const r = voiceEl.getBoundingClientRect();
            window.VisualFX.spawnFloatingText(`💬 ${line}`, "#5a4031", r.left + r.width / 2, Math.max(90, r.top - 10));
          }
          return;
        }
        const buyBtn = ev.target.closest("button[data-shop-buy]");
        if (buyBtn) {
          const item = SHOP_ITEMS.find((i) => i.id === buyBtn.dataset.shopBuy);
          if (!item || (user.coins || 0) < item.price) return;
          user.coins -= item.price;
          user.ownedItems.push(item.id);
          user.placedItems.push(item.id);
          saveCb();
          refreshHomeCb();
          window.SoundFX.playFanfare(2);
          window.VisualFX.burstConfetti();
          renderShopAndBadges(user, saveCb, refreshHomeCb);
          return;
        }
        const togBtn = ev.target.closest("button[data-shop-toggle]");
        if (togBtn) {
          const id = togBtn.dataset.shopToggle;
          const idx = user.placedItems.indexOf(id);
          if (idx === -1) user.placedItems.push(id);
          else user.placedItems.splice(idx, 1);
          window.SoundFX.playClick();
          saveCb();
          refreshHomeCb();
          renderShopAndBadges(user, saveCb, refreshHomeCb);
        }
      };
    }
  }

  // ==================== 3. 答題內建手寫計算草稿紙 ====================
  function initScratchpad() {
    const toggleBtn = document.getElementById("btn-toggle-scratchpad");
    const panel = document.getElementById("scratchpad-panel");
    const canvas = document.getElementById("scratchpad-canvas");
    if (!toggleBtn || !panel || !canvas) return;
    const ctx = canvas.getContext("2d");

    let drawing = false;
    let isEraser = false;
    let penColor = "#5a4031";
    let penWidth = 4;
    let eraserWidth = 20;

    const penRange = document.getElementById("pen-size-range");
    const penVal = document.getElementById("pen-size-val");
    const eraserRange = document.getElementById("eraser-size-range");
    const eraserVal = document.getElementById("eraser-size-val");

    if (penRange) {
      penRange.addEventListener("input", () => {
        penWidth = Number(penRange.value) || 4;
        if (penVal) penVal.textContent = String(penWidth);
      });
    }
    if (eraserRange) {
      eraserRange.addEventListener("input", () => {
        eraserWidth = Number(eraserRange.value) || 20;
        if (eraserVal) eraserVal.textContent = String(eraserWidth);
      });
    }

    function clearPad() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getPos(ev) {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((ev.clientX - r.left) / r.width) * canvas.width,
        y: ((ev.clientY - r.top) / r.height) * canvas.height
      };
    }

    canvas.addEventListener("pointerdown", (ev) => {
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
        ctx.lineWidth = eraserWidth;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    canvas.addEventListener("pointerup", () => { drawing = false; ctx.globalCompositeOperation = "source-over"; });
    canvas.addEventListener("pointercancel", () => { drawing = false; ctx.globalCompositeOperation = "source-over"; });

    toggleBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      panel.classList.toggle("hidden");
      toggleBtn.textContent = panel.classList.contains("hidden") ? "✏️ 打開草稿紙" : "✏️ 收起草稿紙";
    });

    document.querySelectorAll("[data-pen-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.SoundFX.playClick();
        document.querySelectorAll("[data-pen-color]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const c = btn.dataset.penColor;
        if (c === "ERASER") {
          isEraser = true;
        } else {
          isEraser = false;
          penColor = c;
        }
      });
    });

    const expandBtn = document.getElementById("btn-expand-scratchpad");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        window.SoundFX.playClick();
        const expanded = panel.classList.toggle("is-expanded");
        expandBtn.textContent = expanded ? "⤡ 縮小畫布" : "⤢ 展開畫布";
        // 保留已寫內容，調整畫布解析度比例避免筆畫被拉長
        const snapshot = document.createElement("canvas");
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext("2d").drawImage(canvas, 0, 0);
        canvas.height = expanded ? 460 : 220;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(snapshot, 0, 0);
      });
    }

    document.getElementById("btn-clear-scratchpad").addEventListener("click", () => {
      window.SoundFX.playClick();
      clearPad();
    });

    window.MathExtrasClearPad = clearPad;
  }

  // ==================== 5. 三款互動數學小教具 ====================
  function initInteractiveTools() {
    // 教具 A：互動時鐘
    const hrSlider = document.getElementById("tool-clock-hr");
    const minSlider = document.getElementById("tool-clock-min");
    const clockSlot = document.getElementById("tool-clock-svg");
    const clockInfo = document.getElementById("tool-clock-info");

    function updateClockTool() {
      if (!hrSlider || !minSlider || !clockSlot) return;
      const h24 = Number(hrSlider.value);
      const m = Number(minSlider.value);
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const period = h24 < 12 ? "上午" : "下午";

      // 計算指針角度
      const minDeg = m * 6;
      const hrDeg = (h24 % 12) * 30 + m * 0.5;
      let diff = Math.abs(hrDeg - minDeg);
      if (diff > 180) diff = 360 - diff;
      const angleType = Math.abs(diff - 90) < 2 ? "直角 (90°)" : diff < 90 ? `銳角 (約 ${Math.round(diff)}°)` : Math.abs(diff - 180) < 2 ? "平角 (180°)" : `鈍角 (約 ${Math.round(diff)}°)`;

      const cx = 110, cy = 110, r = 90;
      const mRad = (minDeg - 90) * Math.PI / 180;
      const hRad = (hrDeg - 90) * Math.PI / 180;
      let nums = "";
      for (let i = 1; i <= 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180;
        nums += `<text x="${cx + Math.cos(a) * 72}" y="${cy + Math.sin(a) * 72 + 5}" text-anchor="middle" fill="#5a4031" font-size="14" font-weight="900">${i}</text>`;
      }
      clockSlot.innerHTML = `
        <svg viewBox="0 0 220 220" width="210" height="210">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffdf7" stroke="#f2a43b" stroke-width="6" />
          ${nums}
          <line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(mRad) * 62}" y2="${cy + Math.sin(mRad) * 62}" stroke="#52b079" stroke-width="5" stroke-linecap="round" />
          <line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(hRad) * 44}" y2="${cy + Math.sin(hRad) * 44}" stroke="#f07470" stroke-width="7" stroke-linecap="round" />
          <circle cx="${cx}" cy="${cy}" r="6" fill="#5a4031" />
        </svg>
      `;
      clockInfo.innerHTML = `
        <div>12 小時制：<strong>${period} ${h12} 時 ${String(m).padStart(2, "0")} 分</strong></div>
        <div>24 小時制：<strong>${String(h24).padStart(2, "0")} : ${String(m).padStart(2, "0")}</strong></div>
        <div>指針夾角：<strong>${angleType}</strong></div>
      `;
    }
    if (hrSlider && minSlider) {
      hrSlider.addEventListener("input", updateClockTool);
      minSlider.addEventListener("input", updateClockTool);
      updateClockTool();
    }

    // 教具 B：互動分數披薩
    const denSlider = document.getElementById("tool-pizza-den");
    const pizzaSlot = document.getElementById("tool-pizza-svg");
    const pizzaInfo = document.getElementById("tool-pizza-info");
    let pizzaSelected = new Set([0, 1, 2]);

    function updatePizzaTool() {
      if (!denSlider || !pizzaSlot) return;
      const den = Number(denSlider.value);
      pizzaSelected = new Set([...pizzaSelected].filter((i) => i < den));
      const cx = 110, cy = 110, r = 88;
      let slices = "";
      for (let i = 0; i < den; i++) {
        const a1 = (i * 360 / den - 90) * Math.PI / 180;
        const a2 = ((i + 1) * 360 / den - 90) * Math.PI / 180;
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
        const large = 360 / den > 180 ? 1 : 0;
        const active = pizzaSelected.has(i);
        slices += `<path data-slice="${i}" d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z"
          fill="${active ? "#f2a43b" : "#fff7e2"}" stroke="#7c563c" stroke-width="2.5" style="cursor:pointer;" />`;
      }
      pizzaSlot.innerHTML = `<svg viewBox="0 0 220 220" width="210" height="210">${slices}</svg>`;
      const cnt = pizzaSelected.size;
      pizzaInfo.innerHTML = `
        <div>平分成 <strong>${den}</strong> 塊（分母）｜點擊披薩塗色！</div>
        <div>已塗色：<strong>${cnt}/${den}</strong> 個披薩　｜　剩下：<strong>${den - cnt}/${den}</strong> 個</div>
      `;
    }

    if (denSlider && pizzaSlot) {
      denSlider.addEventListener("input", () => {
        pizzaSelected = new Set([0]);
        updatePizzaTool();
      });
      pizzaSlot.addEventListener("click", (ev) => {
        const p = ev.target.closest("[data-slice]");
        if (!p) return;
        window.SoundFX.playClick();
        const idx = Number(p.dataset.slice);
        if (pizzaSelected.has(idx)) pizzaSelected.delete(idx);
        else pizzaSelected.add(idx);
        updatePizzaTool();
      });
      updatePizzaTool();
    }

    // 教具 C：互動直尺換算
    const rStart = document.getElementById("tool-ruler-start");
    const rEnd = document.getElementById("tool-ruler-end");
    const rulerSlot = document.getElementById("tool-ruler-svg");
    const rulerInfo = document.getElementById("tool-ruler-info");

    function updateRulerTool() {
      if (!rStart || !rEnd || !rulerSlot) return;
      let s = Number(rStart.value);
      let e = Number(rEnd.value);
      if (e <= s) {
        e = Math.min(100, s + 5);
        rEnd.value = String(e);
      }
      const len = e - s;
      rulerSlot.innerHTML = window.MathVisual.render({
        type: "ruler", startMm: s, endMm: e, maxCm: 10, caption: ""
      });
      rulerInfo.innerHTML = `
        <div>紙條長度 ＝ 終點 ${e}mm － 起點 ${s}mm ＝ <strong>${len} 毫米</strong></div>
        <div>換算成公分：<strong>${Math.floor(len / 10)} 公分 ${len % 10} 毫米</strong> ＝ <strong>${(len / 10).toFixed(1)} 公分</strong></div>
      `;
    }

    if (rStart && rEnd) {
      rStart.addEventListener("input", updateRulerTool);
      rEnd.addEventListener("input", updateRulerTool);
      updateRulerTool();
    }
  }

  // ==================== 6. 家長／老師學習診斷雷達圖 ====================
  function renderDiagnosisRadar(user, questionMap) {
    const slot = document.getElementById("radar-chart-slot");
    const summaryEl = document.getElementById("radar-summary");
    if (!slot || !summaryEl) return;

    const domains = [
      { key: "數與量", label: "數與量" },
      { key: "空間與形狀", label: "空間與形狀" },
      { key: "關係", label: "關係與規律" },
      { key: "資料與不確定性", label: "統計表格" }
    ];

    const stats = {};
    domains.forEach((d) => (stats[d.key] = { correct: 0, total: 0 }));

    (user.history || []).forEach((h) => {
      (h.items || []).forEach((it) => {
        const q = questionMap.get(it.qid);
        if (!q) return;
        const unit = window.GRADE3_MATH_BANK.units.find((u) => u.id === q.unitId);
        if (!unit) return;
        domains.forEach((d) => {
          if (unit.domain.includes(d.key)) {
            stats[d.key].total += 1;
            if (it.isCorrect) stats[d.key].correct += 1;
          }
        });
      });
    });

    const cx = 160, cy = 135, maxR = 88;
    const angles = [-90, 0, 90, 180].map((a) => (a * Math.PI) / 180);

    // 背景同心四邊形
    let gridSvg = "";
    [0.25, 0.5, 0.75, 1].forEach((ratio) => {
      const pts = angles.map((a) => `${cx + Math.cos(a) * maxR * ratio},${cy + Math.sin(a) * maxR * ratio}`).join(" ");
      gridSvg += `<polygon points="${pts}" fill="none" stroke="#e5d8bf" stroke-width="1.5" />`;
    });
    angles.forEach((a) => {
      gridSvg += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * maxR}" y2="${cy + Math.sin(a) * maxR}" stroke="#e5d8bf" stroke-width="1.5" />`;
    });

    const pcts = domains.map((d) => {
      const s = stats[d.key];
      return s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
    });

    const dataPts = angles
      .map((a, i) => {
        const ratio = Math.max(0.12, pcts[i] / 100);
        return `${cx + Math.cos(a) * maxR * ratio},${cy + Math.sin(a) * maxR * ratio}`;
      })
      .join(" ");

    const labelsSvg = domains
      .map((d, i) => {
        const a = angles[i];
        const lx = cx + Math.cos(a) * (maxR + 26);
        const ly = cy + Math.sin(a) * (maxR + 18) + 4;
        return `<text x="${lx}" y="${ly}" text-anchor="middle" fill="#5a4031" font-size="12" font-weight="900">${d.label} (${pcts[i]}%)</text>`;
      })
      .join("");

    slot.innerHTML = `
      <svg viewBox="0 0 320 270" width="310" height="260">
        ${gridSvg}
        <polygon points="${dataPts}" fill="rgba(82, 176, 121, 0.35)" stroke="#388d5c" stroke-width="3" />
        ${labelsSvg}
      </svg>
    `;

    const hasAny = domains.some((d) => stats[d.key].total > 0);
    if (!hasAny) {
      summaryEl.innerHTML = `<p style="color:var(--muted);font-weight:700;">目前還沒有足夠的答題記錄喔！快去冒險島闖幾關，雷達圖就會自動分析孩子的強項與待加強領域！</p>`;
    } else {
      summaryEl.innerHTML = domains
        .map((d, i) => {
          const s = stats[d.key];
          const advice = s.total === 0 ? "尚未練習" : pcts[i] >= 80 ? "🌟 表現優秀！" : pcts[i] >= 60 ? "👍 穩步進步中" : "💡 建議多看教學與錯題特訓";
          return `<div class="diag-row"><strong>${d.label}</strong><span>答對 ${s.correct}/${s.total} 題（${pcts[i]}%）</span><em>${advice}</em></div>`;
        })
        .join("");
    }
  }

  // ==================== 7. 一鍵列印 A4 練習卷 / 教師解答卷 ====================
  function initPrintWorksheet(getUserFn, questionMap) {
    const unitSel = document.getElementById("print-unit-select");
    const countSel = document.getElementById("print-count-select");
    const withAnsChk = document.getElementById("print-with-answers");
    const printBtn = document.getElementById("btn-print-worksheet");
    if (!unitSel || !printBtn) return;

    unitSel.innerHTML =
      `<option value="MISTAKES">🛠️ 我的錯題補考卷</option>` +
      window.GRADE3_MATH_BANK.units
        .map((u) => `<option value="${u.id}">第 ${String(u.order).padStart(2, "0")} 單元：${u.title}（共50題）</option>`)
        .join("");

    printBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      const user = getUserFn();
      const target = unitSel.value;
      const limit = Number(countSel.value);
      const includeAns = withAnsChk.checked;

      let title = "";
      let qs = [];
      if (target === "MISTAKES") {
        title = `${user.name} 的數學錯題補考卷`;
        qs = (user.mistakes || []).map((id) => questionMap.get(id)).filter(Boolean);
        if (qs.length === 0) {
          alert("你的錯題本目前是空的喔！請先選擇其他單元來列印練習卷。");
          return;
        }
      } else {
        const u = window.GRADE3_MATH_BANK.units.find((x) => x.id === target);
        title = `國小三年級數學・第 ${String(u.order).padStart(2, "0")} 單元：${u.title} 練習卷`;
        qs = u.questions.slice();
      }

      qs = qs.slice(0, Math.min(limit, qs.length));
      const win = window.open("", "_blank");
      if (!win) {
        alert("瀏覽器封鎖了彈出視窗，請允許彈出視窗以開啟 A4 列印預覽！");
        return;
      }

      const questionsHtml = qs
        .map((q, i) => {
          const opts = q.type === "choice"
            ? `<div class="opts">${q.options.map((o, idx) => `<span>(${String.fromCharCode(65 + idx)}) ${o}</span>`).join("")}</div>`
            : `<div class="blank-line">答：____________________</div>`;
          return `<div class="q-item"><p><strong>${i + 1}. [${q.difficulty}]</strong> ${q.question}</p>${opts}</div>`;
        })
        .join("");

      const answersHtml = includeAns
        ? `<div class="page-break"></div><h2>教師解答與詳細解析卷</h2>` +
          qs.map((q, i) => `<p class="ans-row"><strong>${i + 1}. 答案：${q.answer}</strong>｜解析：${q.explanation}</p>`).join("")
        : "";

      win.document.write(`
        <!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><title>${title}</title>
        <style>
          body { font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif; color: #222; padding: 24px 32px; line-height: 1.65; }
          h1 { font-size: 20px; text-align: center; margin: 0 0 6px; }
          .meta { text-align: center; font-size: 13px; color: #555; margin-bottom: 18px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .q-item { margin-bottom: 14px; page-break-inside: avoid; }
          .opts { display: flex; gap: 18px; flex-wrap: wrap; margin-left: 20px; font-size: 14px; }
          .blank-line { margin: 8px 0 0 20px; font-size: 14px; }
          .page-break { page-break-before: always; }
          .ans-row { font-size: 13px; margin: 6px 0; }
          footer { margin-top: 24px; text-align: center; font-size: 11px; color: #666; }
        </style></head><body>
          <h1>${title}</h1>
          <div class="meta">姓名：${user.name}　　座號：______　　日期：____年____月____日　　得分：________</div>
          ${questionsHtml}
          ${answersHtml}
          <footer>Copyright © 2026 Ann Lu. All Rights Reserved.</footer>
          <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
        </body></html>
      `);
      win.document.close();
    });
  }

  // ==================== 8. 學習記錄匯出／匯入備份 ====================
  function initBackupControls(getStoreFn, setStoreFn) {
    const expBtn = document.getElementById("btn-export-backup");
    const impInput = document.getElementById("input-import-backup");
    const impBtn = document.getElementById("btn-import-backup");
    if (!expBtn || !impBtn || !impInput) return;

    expBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      const dataStr = JSON.stringify(getStoreFn(), null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `數學遊戲冒險島_學習備份_${todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    impBtn.addEventListener("click", () => {
      window.SoundFX.playClick();
      impInput.click();
    });

    impInput.addEventListener("change", (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || !parsed.users) throw new Error("格式不符");
          setStoreFn(parsed);
          alert("🎉 學習記錄匯入成功！畫面已同步還原！");
        } catch (_) {
          alert("匯入失敗：請確認選擇的是本網站匯出的 JSON 備份檔喔！");
        }
      };
      reader.readAsText(file, "utf-8");
      impInput.value = "";
    });
  }

  const CHARACTER_QUOTES = {
    char_teacher: ["今天也要一起解開數學謎題喔！", "寫完算式記得檢查單位喔！", "你越來越厲害了，給你一百分！"],
    char_chef: ["烤蛋糕要量好公克和毫升喔！", "闖關辛苦了，請你吃草莓蛋糕！", "二分之一加二分之一，就是整個蛋糕喔！"],
    char_doctor: ["記得多喝水、讓眼睛休息一下喔！", "每天練幾題數學，頭腦越動越聰明！"],
    char_firefighter: ["數學小英雄出發！有困難我來挺你！", "看清楚題目再作答，安全又滿分！"],
    char_astronaut: ["一起飛向數學星球吧！三、二、一、發射！", "宇宙裡滿滿都是神奇的數字和圖形喔！"],
    char_artist: ["正方形、長方形和圓形，都能畫出美麗風景！", "你把小島佈置得超漂亮，好有藝術感！"],
    char_farmer: ["今天收成好多紅蘿蔔，幫我算算有幾根吧！", "一分耕耘一分收穫，繼續加油喔！"],
    char_baker: ["香噴噴的麵包出爐囉！要平分給大家吃喔！", "買麵包找零錢，用加減法就難不倒你！"],
    char_musician: ["答對一題就像彈出一個快樂的音符！", "聽著音樂算數學，心情最輕鬆了！"],
    char_gardener: ["幫花朵澆水囉！你的星星越開越多顆了！", "每天進步一點點，就會開出最美的花！"],
    char_captain: ["揚帆啟航！帶你去探索六座神祕小島！", "勇敢向前衝，前方就是滿分寶藏島！"],
    char_scientist: ["哇！這個算式真有趣，我們一起驗算看看！", "好奇心是最棒的魔法，你是數學小天才！"],
    char_police: ["小島治安我守護，計算粗心我幫你抓出來！", "一步一步算清楚，滿分安全過關！"],
    char_pilot: ["起飛囉！帶你從高空俯瞰六座美麗小島！", "直衝雲霄，你的數學實力正在起飛！"],
    char_vet: ["小動物們都說你算數學的樣子超帥氣喔！", "多陪陪島上的小動物，心情會變超好！"],
    char_postman: ["叮咚！有一封「滿分表揚信」要送給你喔！", "每天累積一點點，知識就會裝滿大郵袋！"],
    char_dancer: ["答對一題轉個圈，你的節奏好輕快！", "優雅又專心，這關一定難不倒你！"],
    char_detective: ["真相只有一個！答案就藏在題目關鍵字裡！", "用放大鏡看清楚單位，你就破案成功了！"],
    char_librarian: ["想複習名詞嗎？字卡館隨時歡迎你喔！", "愛看書又愛思考的小朋友最厲害了！"],
    char_athlete: ["加油加油！跑向終點拿三顆星金牌！", "跌倒沒關係，看懂解析再挑戰一次就贏了！"]
  };

  window.MathExtras = {
    SHOP_ITEMS,
    BADGES,
    CHARACTER_QUOTES,
    ensureUserExtras,
    getItemIsland,
    getPlacedIslandPropsHtml,
    renderShopAndBadges,
    initScratchpad,
    initInteractiveTools,
    renderDiagnosisRadar,
    initPrintWorksheet,
    initBackupControls
  };
})();
