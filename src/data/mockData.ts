import { Product, Seller, Order, BlogPost, PartnerBar, PayoutRequest, B2BInquiry } from "@/types";

export const SIGNATURE_PRODUCT: Product = {
  id: "mewmao-signature-500",
  name: "Mewmao Mơ",
  subName: "Rượu Mơ Má Đào Thủ Công — Lên Men Tự Nhiên",
  tagline: "Nghệ thuật chưng cất thủ công gặp gỡ văn hóa Underground tự do",
  price: 289000,
  originalPrice: 350000,
  volume: "500ml",
  abv: "19% ABV",
  description:
    "Được chưng cất và ngâm ủ hoàn toàn thủ công từ những quả mơ má đào Mộc Châu chín vàng căng mọng, hòa quyện cùng men rượu nếp cái hoa vàng truyền thống và ủ chum sành tĩnh lặng suốt 365 ngày. Mewmao mang đến một trải nghiệm đa tầng: vị chua thanh tự nhiên, hương thơm hoa quả mộc mạc và hậu vị ngọt êm, ấm nồng lan tỏa.",
  details: {
    origin: "Mộc Châu & Tây Bắc, Việt Nam",
    vintage: "Mẻ Ủ Chum Sành 2025 - 2026",
    barrelAged: "12 Tháng (365 Ngày) Trong Chum Sành Tĩnh",
    harvestMethod: "Hái tuyển thủ công từng quả mơ má đào chín đỏ",
  },
  tastingNotes: {
    nose: "Hương thơm quả mơ má đào chín rộ tự nhiên, thoáng hương hoa dại vùng cao và men nếp mộc mạc.",
    palate: "Vị chua thanh mát bung tỏa đánh thức vị giác, dẫn lối cho vị ngọt dịu êm của mật mơ ủ chậm.",
    finish: "Hậu vị ấm áp, êm mượt nơi vòm họng với dư vị hạnh nhân dịu nhẹ, không gắt, không đau đầu.",
  },
  botanicals: [
    "Mơ má đào Mộc Châu tuyển chọn loại 1",
    "Rượu nếp cái hoa vàng cất thủ công",
    "Đường phèn mía thô thanh khiết",
    "Men thảo mộc gia truyền ủ chum sành",
  ],
  stock: 148,
  isAvailable: true,
};

export const INITIAL_SELLERS: Seller[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PAYOUTS: PayoutRequest[] = [];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "recipe-highball",
    slug: "mewmao-highball-co-dien-soda",
    title: "Mewmao Highball Cổ Điển: Đánh Thức Vị Giác Với Bọt Sủi Soda Sảng Khoái",
    excerpt:
      "Công thức cocktail quốc dân thanh mát tột đỉnh, hòa quyện giữa vị chua ngọt của mơ má đào Mộc Châu và bọt ga soda lăn tăn mát lạnh giải nhiệt tức thì.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Highball", "Soda", "Cocktail", "Dễ Làm"],
    content: [
      "> 'Một ly Highball hoàn hảo không nằm ở sự cầu kỳ, mà nằm ở độ lạnh sâu của viên đá và sự tinh tế khi bọt ga chạm vào đầu lưỡi.'",
      "Mewmao Highball là sự khởi đầu lý tưởng cho bất kỳ ai muốn bước vào thế giới mixology tại gia. Vị chua thanh nguyên bản từ mơ má đào Mộc Châu cùng men nếp ủ chum sành khi kết hợp cùng soda sẽ bung tỏa các nốt hương hoa quả tươi tắn nhất.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 60ml Rượu mơ Mewmao Má Đào (ướp lạnh)",
      "* 100ml Nước Soda không đường (Schweppes lon hoặc Evervess)",
      "* Đá bi già hoặc đá cây thanh lớn trong suốt",
      "* 1 lát chanh vàng tươi hoặc 1 nhánh lá bạc hà (húng lủi) trang trí",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho đá đầy vào ly Highball dáng cao. Dùng thìa khuấy tròn nhẹ vài giây để làm lạnh thành ly.",
      "* Bước 2: Rót từ từ 60ml rượu mơ Mewmao vào đáy ly.",
      "* Bước 3: Nghiêng nhẹ ly 45 độ, rót nhẹ nhàng 100ml soda theo thành ly để tránh làm vỡ các bọt khí có ga.",
      "* Bước 4: Dùng muỗng bar khuấy nhẹ duy nhất 1 lần từ đáy lên trên. Thả lát chanh vàng lên bề mặt và thưởng thức ngay khi ly còn đọng sương lạnh.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Vị chua thanh mát lành lan tỏa ngay từ ngụm đầu tiên, tiếp theo là vị ngọt hậu êm ái của mật mơ ủ chậm. Thức uống tuyệt vời để giải nhiệt ngày nắng nóng, dùng khai vị trước bữa ăn hoặc nhâm nhi khi xem phim chill cuối tuần."
    ],
  },
  {
    id: "recipe-jasmine-tea",
    slug: "mo-ma-dao-tra-lai-suong-mai",
    title: "Mơ Má Đào Trà Lài Sương Mai: Khúc Biến Tấu Thanh Tao Của Hoa Nhài & Rượu Mơ",
    excerpt:
      "Sự kết hợp tinh tế giữa hương thơm ngát của trà lài ủ lạnh và vị mơ má đào chua ngọt đằm thắm, mang đậm phong vị Á Đông tao nhã.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Trà Lài", "Cold Brew", "Thảo Mộc", "Mocktail"],
    content: [
      "> 'Hương hoa nhài thoang thoảng trong làn gió mai, hòa cùng mật mơ óng ả tạo nên một cảm giác tĩnh tại và êm dịu lạ kỳ.'",
      "Trà lài từ lâu đã là biểu tượng thanh nhã của văn hóa ẩm thực Việt. Khi gặp gỡ rượu mơ má đào Mewmao, vị đắng chát dịu nhẹ của trà xanh hòa nhài giúp cân bằng vị ngọt của mật quả, tạo nên một ly cocktail dịu dàng và đầy thi vị.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 50ml Rượu mơ Mewmao Má Đào",
      "* 80ml Trà lài ủ lạnh (Cold Brew trà lài hoặc trà túi lọc lài pha nguội)",
      "* 15ml Mật ong rừng tự nhiên (hoặc nước đường phèn)",
      "* 1-2 quả quất (tắc) cắt lát mỏng",
      "* Đá viên và 1 quả mơ ngâm Mewmao",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho 50ml rượu mơ Mewmao, 80ml trà lài và 15ml mật ong vào bình lắc (shaker) cùng một lượng đá vừa phải.",
      "* Bước 2: Lắc đều tay trong khoảng 10-15 giây cho đến khi mặt ngoài bình lắc đóng một lớp sương lạnh mỏng.",
      "* Bước 3: Rót hỗn hợp ra ly thủy tinh qua rây lọc đá.",
      "* Bước 4: Thả quả mơ ngâm và vài lát quất mỏng lên trên để hoàn thiện.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Mùi hương hoa nhài đưa lên sống mũi ngay trước khi chạm môi. Vị rượu êm dịu, ngọt thanh tao không gắt, phù hợp cho những buổi tiệc trà chiều, trò chuyện thân mật hoặc đọc sách tĩnh lặng."
    ],
  },
  {
    id: "recipe-yakult-fizz",
    slug: "mo-sua-tuyet-trang-mewmao-yakult-fizz",
    title: "Mơ Sữa Tuyết Trắng (Yakult Fizz): Thức Uống 'Gây Nghiện' Dành Cho Phái Đẹp",
    excerpt:
      "Chua thanh mịn màng, thơm ngậy nhẹ của men sữa chua lên men hòa quyện cùng men mơ êm dịu, nồng độ cồn nhẹ như tan biến trên đầu lưỡi.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Yakult", "Fizz", "Dành Cho Nàng", "Easy Drink"],
    content: [
      "> 'Một ly cocktail màu trắng ngọc ngà, chua ngọt dịu êm khiến bất kỳ cô gái nào cũng phải mỉm cười ngay ngụm đầu tiên.'",
      "Nếu bạn e ngại vị nồng của cồn, Mewmao Yakult Fizz sinh ra là để dành cho bạn. Sự kết hợp giữa sữa chua uống lên men sống và rượu mơ thủ công tạo nên kết cấu sánh mượt, chua ngọt hài hòa khó cưỡng.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 50ml Rượu mơ Mewmao Má Đào",
      "* 1 chai sữa chua uống Yakult (hoặc Betagen/Probi)",
      "* 40ml Nước Soda hoặc Sprite/7Up",
      "* Đá viên sạch, lát dâu tây hoặc nhánh hương thảo trang trí",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho đá viên vào khoảng 2/3 ly rock lùn.",
      "* Bước 2: Rót 50ml rượu mơ Mewmao vào trước để tạo tầng đáy hổ phách.",
      "* Bước 3: Lắc nhẹ hũ Yakult rồi rót chậm rãi phủ lên trên lớp đá.",
      "* Bước 4: Châm thêm 40ml soda tạo độ sủi tăm bông tuyết bồng bềnh, gài nhánh hương thảo lên miệng ly.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Vị chua thanh mát của khuẩn chua hòa quyện ngọt ngào với hương thơm quả mơ chín. Thức uống cực kỳ êm bụng, dễ tiêu hóa sau các bữa tiệc nướng nhiều dầu mỡ."
    ],
  },
  {
    id: "recipe-coconut-sunset",
    slug: "hoang-hon-nhiet-doi-mewmao-coconut-sunset",
    title: "Hoàng Hôn Miền Nhiệt Đới: Vị Dừa Xiêm Thanh Khiết Cùng Rượu Mơ Má Đào",
    excerpt:
      "Mang cả bãi biển nhiệt đới về bàn tiệc với nước dừa xiêm Bến Tre ngọt dịu, hòa cùng độ chua sắc và hậu vị đằm sâu của rượu mơ Mewmao.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Nước Dừa", "Nhiệt Đới", "Giải Khát", "Summer Vibe"],
    content: [
      "> 'Vị ngọt thanh khiết của dừa xiêm Bến Tre hòa cùng tinh hoa mơ má đào Tây Bắc – sự hội ngộ trọn vẹn của hai miền đất nước.'",
      "Nước dừa tươi có độ khoáng tự nhiên và vị ngọt mát dịu dàng, khi được phối cùng rượu mơ chua sâu sẽ tạo nên cảm giác vô cùng thanh tao, không hề ngấy ngọt và đặc biệt giải nhiệt nhanh chóng.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 50ml Rượu mơ Mewmao Má Đào",
      "* 90ml Nước dừa tươi nguyên chất (dừa xiêm xanh Bến Tre)",
      "* 10ml Nước cốt chanh tươi vắt bỏ hạt",
      "* Cơm dừa non nạo sợi mỏng",
      "* Đá viên tinh khiết",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Rót 50ml rượu mơ Mewmao và 10ml nước chanh tươi vào ly.",
      "* Bước 2: Thêm đầy đá viên vào ly để giữ độ lạnh sâu.",
      "* Bước 3: Rót từ từ 90ml nước dừa xiêm mát lạnh lên trên.",
      "* Bước 4: Trang trí với vài sợi cơm dừa non trắng muốt và khuấy nhẹ đều trước khi thưởng thức.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Cảm giác thanh khiết mát lịm tràn ngập khoang miệng. Độ ngọt tự nhiên từ nước dừa làm dịu hẳn vị cồn, giúp bữa tiệc sân vườn hay pool party thêm phần thư thái, sảng khoái."
    ],
  },
  {
    id: "recipe-plum-shandy",
    slug: "bia-mo-dam-vi-mewmao-shandy",
    title: "Bia Mơ Mewmao Shandy: Bí Quyết Đốt Cháy Mọi Bữa Tiệc Nướng BBQ",
    excerpt:
      "Sự hòa quyện bùng nổ giữa men bia sảng khoái và vị ngọt thơm của quả mơ chín mọng, giải ngấy hoàn hảo cho các món thịt nướng.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Beer Cocktail", "Shandy", "BBQ Party", "Men Say"],
    content: [
      "> 'Khi lớp bọt bia trắng mịn hòa tan cùng hương mật mơ vàng óng, mọi món nướng xèo xèo đều trở nên ngon miệng gấp bội.'",
      "Beer cocktail vốn là trào lưu cực thịnh tại các lễ hội bia châu Âu. Biến tấu Mewmao Shandy mang đậm bản sắc Việt khi dung hòa vị đắng nhẹ của hoa bia cùng hương chua ngọt mê hoặc của rượu mơ nếp cái hoa vàng.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 45ml Rượu mơ Mewmao Má Đào (đã ướp lạnh)",
      "* 120ml Bia lager nhẹ (Heineken Silver, Blanc 1664 hoặc Tiger Crystal)",
      "* 1 lát gừng tươi đập dập nhẹ",
      "* Vài giọt nước cốt chanh tươi",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Ướp lạnh sẵn ly uống bia trong ngăn mát tủ lạnh khoảng 15 phút.",
      "* Bước 2: Thả lát gừng đập dập vào đáy ly, rót 45ml rượu mơ Mewmao cùng vài giọt nước cốt chanh tươi.",
      "* Bước 3: Nghiêng ly 45 độ, rót nhẹ 120ml bia thật lạnh để tạo lớp bọt mịn dày chừng 1 đốt ngón tay.",
      "* Bước 4: Thưởng thức ngay khi bọt bia còn đang sủi tăm sống động.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Bọt bia bồng bềnh mang vị đắng êm dịu, ngay sau đó là vị ngọt ngào của quả mơ bùng nổ. Đây là 'vũ khí bí mật' đánh bay cảm giác ngấy mỡ trong các bữa tiệc bò nướng, lẩu thái hay hải sản cay nồng."
    ],
  },
  {
    id: "recipe-warm-ginger",
    slug: "gung-nong-ruou-mo-mua-dong",
    title: "Gừng Nóng Rượu Mơ Mùa Đông: Tách Trà Giữ Ấm Êm Dịu Cho Đêm Lạnh",
    excerpt:
      "Thức uống thảo mộc ấm nồng từ quế, gừng tươi và rượu mơ ủ chum sành, giúp làm ấm cơ thể, êm bụng và thư giãn tinh thần sau ngày dài.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Trà Gừng Nóng", "Mùa Đông", "Thư Giãn", "Health & Warmth"],
    content: [
      "> 'Những đêm đông se sắt hay khi cơ thể thấm mệt, một tách rượu mơ ấm tỏa hương quế gừng chính là chiếc chăn ấm cho tâm hồn.'",
      "Trong văn hóa Nhật Bản và Tây Bắc Việt Nam, uống rượu mơ ấm vào mùa lạnh là bài thuốc dưỡng sinh tuyệt hảo. Hương cồn dịu bay bớt khi làm nóng, để lại trọn vẹn tinh túy mơ má đào cùng tính ấm giải cảm của gừng già.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 60ml Rượu mơ Mewmao Má Đào",
      "* 90ml Nước sôi nóng (khoảng 70-80°C)",
      "* 3 lát gừng tươi thái mỏng",
      "* 1 thanh quế khô nhỏ và 1 thìa cà phê mật ong nguyên chất",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho lát gừng tươi và thanh quế vào cốc sứ hoặc ly thủy tinh chịu nhiệt.",
      "* Bước 2: Châm 90ml nước nóng 80°C vào, đậy nắp hãm chừng 3 phút cho tinh dầu quế gừng ngấm ra nước.",
      "* Bước 3: Cho 1 thìa mật ong và rót 60ml rượu mơ Mewmao vào khuấy đều nhẹ nhàng.",
      "* Bước 4: Thưởng thức từng ngụm chậm rãi khi thức uống còn đang bốc khói thơm dịu.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Cảm giác ấm nồng lan tỏa từ cuống họng xuống bụng, làm dịu thần kinh, hỗ trợ tuần hoàn máu và giúp bạn có một giấc ngủ sâu ngon giấc trong đêm lạnh."
    ],
  },
  {
    id: "recipe-perilla-tonic",
    slug: "mewmao-tia-to-tonic-sparkler",
    title: "Mewmao Tía Tô & Tonic: Nốt Hương Thảo Mộc Đột Phá Đậm Chất Việt",
    excerpt:
      "Vị đắng êm của Tonic kết hợp cùng tinh dầu lá tía tô thơm ngát và độ chua thanh của mơ, tạo nên một ly cocktail đẳng cấp Speakeasy bar.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Tía Tô", "Tonic", "Speakeasy", "Signature"],
    content: [
      "> 'Tía tô Việt Nam – gia vị quen thuộc khi kết hợp cùng cocktail lại tạo nên nốt hương thảo mộc thanh lịch khiến giới sành rượu bất ngờ.'",
      "Công thức này lấy cảm hứng từ các quán bar speakeasy underground hiện đại, nơi những nguyên liệu thảo mộc bản địa được nâng tầm nghệ thuật. Vị chát nhẹ của quinine trong tonic tôn lên vị chua tự nhiên của mơ má đào.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 50ml Rượu mơ Mewmao Má Đào",
      "* 80ml Nước Tonic (Schweppes Tonic)",
      "* 4-5 lá tía tô tươi non rửa sạch",
      "* 1 lát chanh tươi và đá thanh",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Đặt lá tía tô vào lòng bàn tay rồi vỗ mạnh một cái để đánh thức tinh dầu thơm.",
      "* Bước 2: Cho lá tía tô vào đáy ly, dùng chày dằm nhẹ cùng một chút rượu mơ để tinh dầu hòa tan.",
      "* Bước 3: Thêm đá viên đầy ly, rót nốt phần rượu mơ Mewmao còn lại vào.",
      "* Bước 4: Rót đầy Tonic mát lạnh lên trên và kẹp lát chanh tươi viền miệng ly.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Hương thơm ngát quyến rũ của tía tô, vị đắng thanh dịu của tonic hòa quyện cùng vị ngọt đằm của mơ tạo nên trải nghiệm đa tầng phức hợp, rất thích hợp cho những buổi hẹn hò lãng mạn."
    ],
  },
  {
    id: "recipe-plum-coldbrew",
    slug: "mo-ma-dao-da-tuyet-ca-phe-cold-brew",
    title: "Mơ Má Đào Plum Cold Brew: Cocktail Cà Phê Tỉnh Thức Cho Chiều Muộn",
    excerpt:
      "Sự giao thoa bất ngờ giữa hạt cà phê Arabica Cầu Đất ủ lạnh và mật mơ má đào thơm lừng, phân tầng thị giác đẹp mắt và đánh thức tư duy sáng tạo.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Cold Brew", "Cà Phê", "Phân Tầng", "Creative Focus"],
    content: [
      "> 'Một chút men say dịu êm của mơ má đào, hòa cùng vị chua thanh sâu thẳm của cà phê Arabica thượng hạng – thức uống bừng tỉnh năng lượng.'",
      "Cà phê cold brew vốn có hương vị thanh thoát, ít đắng gắt và giàu hương quả mọng. Khi song hành cùng rượu mơ Mewmao và một chút bọt tonic sủi tăm, ly cocktail vừa đẹp mắt về thị giác vừa bùng nổ vị giác.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 45ml Rượu mơ Mewmao Má Đào",
      "* 60ml Cà phê ủ lạnh Cold Brew (ưu tiên hạt Arabica Cầu Đất hoặc Khe Sanh)",
      "* 30ml Nước Tonic hoặc Soda",
      "* Đá viên lớn và vỏ cam vàng xoắn mỏng",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho đá viên vào ly ngắn (Rock glass).",
      "* Bước 2: Rót 45ml rượu mơ Mewmao xuống đáy ly, tiếp theo cho 30ml Tonic vào tạo tầng màu hổ phách sáng.",
      "* Bước 3: Dùng thìa úp ngược sát mặt đá, rót nhẹ nhàng 60ml cà phê Cold Brew chảy chậm qua lưng thìa để tạo tầng cà phê đen huyền bí phía trên.",
      "* Bước 4: Xoắn nhẹ miếng vỏ cam vàng trên miệng ly để tinh dầu cam thơm ngát lan tỏa.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Thức uống 2 tầng màu sang trọng. Vị chua thanh hoa quả của mơ và cà phê Arabica bổ trợ cho nhau hoàn hảo, đem lại sự sảng khoái và tỉnh táo tuyệt vời trong những buổi chiều làm việc sáng tạo."
    ],
  },
  {
    id: "recipe-sugarcane-calamansi",
    slug: "ruou-mo-mia-quat-pho-co",
    title: "Rượu Mơ Mía Quất Phố Cổ: Nâng Tầm Nét Dân Dã Thành Thức Uống Thời Thượng",
    excerpt:
      "Vị ngọt lành của mía lau ép tươi, hương tinh dầu quất thơm rực rỡ và men rượu mơ ủ chum, gợi nhắc những chiều dạo bước phố cổ rợp bóng cây.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Nước Mía", "Quất Tươi", "Phố Cổ", "Street Vibe"],
    content: [
      "> 'Những thức quà đường phố thân thuộc của Hà Nội và Sài Gòn nay được khoác lên mình diện mạo mới mẻ, tinh tế và đầy cuốn hút.'",
      "Nước mía quất vỉa hè là thức uống gắn liền với ký ức của biết bao người Việt. Khi phối hợp cùng rượu mơ má đào Mewmao, mật mía tự nhiên hòa tan trọn vẹn vị rượu nếp, tạo nên ly mocktail/cocktail ngọt thanh không đâu có được.",
      "### 🛒 Nguyên Liệu Chuẩn Bị",
      "* 50ml Rượu mơ Mewmao Má Đào",
      "* 80ml Nước mía tươi nguyên chất (mía ép cùng quất)",
      "* 2 quả quất tươi mọng nước",
      "* Đá bào hoặc đá bi nhỏ mát lạnh",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho 80ml nước mía tươi vào ly cùng nước cốt của 2 quả quất tươi (bỏ hạt để không bị đắng).",
      "* Bước 2: Khuấy đều nhẹ tay rồi xúc đầy đá bào lên đến miệng ly.",
      "* Bước 3: Rót từ từ 50ml rượu mơ Mewmao phủ lên lớp đá tuyết trắng xóa.",
      "* Bước 4: Thả 1 lát quất mỏng lên trên đỉnh và cắm ống hút thân thiện môi trường để thưởng thức.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Ngọt thanh khiết mát lịm của mía lau, chua thơm nồng nàn của quất tươi và men say nồng ấm của rượu mơ. Món uống tuyệt hảo cho các buổi tụ họp bạn bè ăn vặt hay ngồi chill ngắm phố phường."
    ],
  },
  {
    id: "recipe-tropical-sangria",
    slug: "mewmao-sangria-trai-cay-miet-vuon",
    title: "Mewmao Sangria Trái Cây Miệt Vườn: Bình Cocktail Gắn Kết Của Mọi Cuộc Vui",
    excerpt:
      "Bình cocktail khổng lồ ngập tràn dâu tây, táo giòn, cam vàng và mơ ngâm, hương thơm ngào ngạt lan tỏa làm bùng nổ không khí tiệc tùng hội bạn.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    date: "03 Tháng 10, 2026",
    tags: ["Sangria", "Trái Cây Tươi", "Tiệc Tùng", "Group Drink"],
    content: [
      "> 'Một bình Sangria đầy sắc màu rực rỡ là tâm điểm kết nối mọi người cùng nâng ly chia sẻ những khoảnh khắc đáng nhớ.'",
      "Sangria là thức uống cocktail chia sẻ nổi tiếng thế giới. Với Mewmao Plum Sangria, các loại trái cây tươi ngấm trọn mật mơ má đào thơm lừng, tạo nên vị rượu trái cây ngọt ngào, thơm phức mà ai cũng yêu thích.",
      "### 🛒 Nguyên Liệu Chuẩn Bị (Cho 1 bình lớn 1 lít tiệc 4-6 người)",
      "* 200ml Rượu mơ Mewmao Má Đào",
      "* 1 chai Soda lon 330ml (hoặc Sprite/7Up nếu thích vị ngọt đậm hơn)",
      "* 200ml Nước ép táo hoặc nước ép nho trắng nguyên chất",
      "* Trái cây tươi: 1 quả cam vàng cắt lát, 1 quả táo xanh thái hạt lựu, 5 quả dâu tây cắt đôi, 5-6 quả mơ ngâm Mewmao",
      "* Nhánh bạc hà tươi và nhiều đá viên",
      "### 🍸 Hướng Dẫn Pha Chế Từng Bước",
      "* Bước 1: Cho toàn bộ trái cây đã cắt vào một bình thủy tinh lớn (pitcher).",
      "* Bước 2: Rót 200ml rượu mơ Mewmao và 200ml nước ép táo vào ngâm cùng trái cây trong ngăn mát tủ lạnh khoảng 30–45 phút để trái cây ngấm hương mơ.",
      "* Bước 3: Khi bắt đầu vào tiệc, lấy bình ra, cho thật nhiều đá viên vào đầy bình.",
      "* Bước 4: Rót chai soda hoặc 7Up vào, khuấy nhẹ đều tay rồi múc cả rượu lẫn trái cây ra từng ly cho mọi người.",
      "### ✨ Trải Nghiệm Hương Vị & Dịp Thưởng Thức",
      "Bùng nổ sắc màu và hương thơm hoa quả tươi. Thức uống dịu ngọt, dễ uống, cực kỳ bắt mắt để chụp ảnh check-in và gắn kết tiếng cười trong các buổi sinh nhật, liên hoan hay party gia đình."
    ],
  },
  {
    id: "blog-1",
    slug: "nghe-thuat-pha-che-mewmao-cocktail-tai-gia",
    title: "Nghệ Thuật Mixology: 3 Công Thức Cocktail Với Rượu Mơ Mewmao Chuẩn Speakeasy Bar",
    excerpt:
      "Không cần dụng cụ phức tạp, bạn hoàn toàn có thể biến căn phòng của mình thành một góc lounge underground với Mewmao Highball, Mewmao Sour và Plum Cold Brew.",
    category: "Cocktail Lab",
    coverImage:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
    readTime: "4 phút đọc",
    date: "25 Tháng 9, 2026",
    tags: ["Cocktail", "Mixology", "Underground", "Lifestyle"],
    content: [
      "Rượu mơ thủ công Mewmao với nồng độ 19% ABV là chất xúc tác hoàn hảo cho mọi sáng tạo mixology. Vị chua thanh nguyên bản từ mơ má đào Mộc Châu cùng hậu vị ngọt dịu giúp Mewmao hòa quyện xuất sắc mà không bị lấn át bởi các thành phần khác.",
      "1. MEWMAO HIGHBALL (Tươi mát, sảng khoái): 60ml Rượu Mơ Mewmao + 120ml Soda hoặc Tonic ướp lạnh + 1 lát cam sấy hoặc vỏ bưởi nướng + Nhiều đá già. Khuấy nhẹ một vòng để giữ ga.",
      "2. MEWMAO SOUR (Cổ điển & đầm ấm): 50ml Rượu Mơ Mewmao + 20ml Bourbon whisky + 15ml nước cốt chanh tươi + 10ml siro đường + Lòng trắng trứng (tùy chọn). Lắc mạnh cùng đá và rót qua rây.",
      "3. PLUM ON THE ROCKS: Rót trực tiếp 45ml Mewmao vào ly rock có 1 viên đá cầu nguyên khối trong suốt. Thưởng thức chầm chậm theo từng điệu nhạc vinyl lounge.",
    ],
  },
  {
    id: "blog-2",
    slug: "hanh-trinh-san-mo-ma-dao-tay-bac",
    title: "Hành Trình Săn Mơ Má Đào Mộc Châu: Khi Thiên Nhiên Dành Tặng Giọt Mật Hổ Phách",
    excerpt:
      "Mỗi mùa xuân đi qua, những người thợ nấu rượu của Mewmao lại lặn lội lên các bản làng Mộc Châu để tự tay chọn những quả mơ ửng hồng má đào thơm nức mũi.",
    category: "Artisanal Craft",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    readTime: "5 phút đọc",
    date: "18 Tháng 9, 2026",
    tags: ["Mộc Châu", "Nông Sản Bản Địa", "Craftsmanship", "Story"],
    content: [
      "Không phải quả mơ nào cũng đủ tiêu chuẩn bước vào chum sành của Mewmao. Chúng tôi chỉ chọn giống mơ má đào cổ thụ được chăm sóc tự nhiên bởi người đồng bào vùng cao, nơi có độ cao trên 1000m với sương mù và chênh lệch nhiệt độ ngày đêm lớn.",
      "Quả mơ thu hoạch phải đạt đúng độ chín: lớp da ửng đỏ phớt hồng như má thiếu nữ, ruột vàng ruộm, vỏ căng bóng không dập xước. Từng quả được rửa sạch dưới dòng suối mát và lau khô tỉ mỉ trước khi bắt đầu hành trình ngâm ủ kéo dài 1 năm.",
    ],
  },
  {
    id: "blog-3",
    slug: "van-hoa-underground-va-vi-sao-nguoi-tre-me-mewmao",
    title: "Văn Hóa Tiệc Tùng Underground: Vì Sao Người Trẻ Hiện Đại Tìm Về Hương Vị Tinh Khiết?",
    excerpt:
      "Rời xa những ồn ào công nghiệp và các loại rượu cồn xốc gắt, giới trẻ underground chọn Mewmao như một tuyên ngôn về phong cách sống tự do, tinh tế và có gu.",
    category: "Underground Culture",
    coverImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    readTime: "3 phút đọc",
    date: "10 Tháng 9, 2026",
    tags: ["Nightlife", "Underground", "Youth Culture", "Music"],
    content: [
      "Trong các buổi jamming session acoustic, những party bí mật tại studio nghệ thuật hay góc chill sau giờ diễn DJ, một chai Mewmao màu hổ phách luôn là tâm điểm của sự kết nối.",
      "Không đau đầu vào sáng hôm sau nhờ quy trình chưng cất tự nhiên không cồn công nghiệp. Vị chua ngọt cân bằng êm ru giúp câu chuyện nối dài bất tận đến tận rạng sáng.",
    ],
  },
];

export const PARTNERS_LIST: PartnerBar[] = [
  {
    id: "bar-1",
    name: "The Velvet Speakeasy & Vinyl Room",
    type: "Speakeasy",
    city: "Hà Nội",
    address: "Tầng 2, 38 Tràng Thi, Hoàn Kiếm, Hà Nội",
    description: "Không gian cổ điển đậm chất jazz & vinyl, nơi Mewmao là nguyên liệu chính cho ly cocktail 'Hanoi Dusk'.",
    signatureDrink: "Mewmao Autumn Mist",
    instagram: "@thevelvet.speakeasy",
    featured: true,
  },
  {
    id: "bar-2",
    name: "Obsidian Underground Lounge",
    type: "Vinyl Lounge",
    city: "TP. Hồ Chí Minh",
    address: "Hẻm 151 Đồng Khởi, Bến Nghé, Quận 1, TP. HCM",
    description: "Quán bar giấu mình trong con hẻm cổ, quy tụ các nghệ sĩ indie và giới sành rượu thủ công Sài Gòn.",
    signatureDrink: "Underground Plum Sour",
    instagram: "@obsidian.saigon",
    featured: true,
  },
  {
    id: "bar-3",
    name: "Sóng & Đá Cocktail Club",
    type: "Cocktail Bar",
    city: "Đà Nẵng",
    address: "12 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    description: "View biển lộng gió kết hợp quầy bar hiện đại phong cách tối giản Apple, nổi tiếng với món Mewmao Highball ướp lạnh.",
    signatureDrink: "Coastal Plum Highball",
    instagram: "@songda.danang",
    featured: true,
  },
  {
    id: "bar-4",
    name: "Chum Sành & Gỗ Bistro",
    type: "Artisan Bistro",
    city: "Đà Lạt",
    address: "88 Khe Sanh, Phường 10, Đà Lạt",
    description: "Không gian gỗ ấm cúng giữa thông reo, phục vụ Mewmao hâm nóng bên bếp củi những đêm lạnh sương mù.",
    signatureDrink: "Warm Spiced Mewmao",
    instagram: "@chumsanh.dalat",
    featured: false,
  },
];

export const INITIAL_B2B_INQUIRIES: B2BInquiry[] = [];
