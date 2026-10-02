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

export const INITIAL_SELLERS: Seller[] = [
  {
    id: "seller-1",
    name: "Minh Đức (Underground DJ / Producer)",
    email: "duc.underground@mewmao.vn",
    phone: "0988776655",
    role: "seller",
    affiliateCode: "DUCMEW",
    pin: "123456",
    commissionRate: 0.15, // 15%
    promoDiscountPerBottle: 0, // Không áp dụng giảm giá, nhận diện tự động qua Cookie
    balance: 867000,
    totalWithdrawn: 1734000,
    totalEarned: 2601000,
    clicksCount: 384,
    ordersCount: 60,
    bottlesSoldCount: 72,
    createdAt: "2026-09-15",
    bankInfo: {
      bankName: "MB Bank",
      accountNumber: "0988776655",
      accountHolder: "LE MINH DUC",
    },
  },
  {
    id: "seller-2",
    name: "Hà Anh (Head Bartender & Mixologist)",
    email: "haanh.cocktail@mewmao.vn",
    phone: "0912345678",
    role: "seller",
    affiliateCode: "HAANHBAR",
    pin: "567890",
    commissionRate: 0.15,
    promoDiscountPerBottle: 0, // Không áp dụng giảm giá, nhận diện tự động qua Cookie
    balance: 1300500,
    totalWithdrawn: 3034500,
    totalEarned: 4335000,
    clicksCount: 620,
    ordersCount: 100,
    bottlesSoldCount: 124,
    createdAt: "2026-09-18",
    bankInfo: {
      bankName: "Techcombank",
      accountNumber: "190334889910",
      accountHolder: "NGUYEN HA ANH",
    },
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "MM-9821",
    customerName: "Trần Thế Bảo",
    customerPhone: "0901234567",
    customerAddress: "42 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
    customerNote: "Giao sau 18h tối giúp mình nhé",
    items: [
      {
        productId: SIGNATURE_PRODUCT.id,
        name: SIGNATURE_PRODUCT.name,
        quantity: 2,
        price: SIGNATURE_PRODUCT.price,
      },
    ],
    totalAmount: 578000,
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    status: "delivered",
    affiliateCode: "DUCMEW",
    sellerCommission: 86700,
    createdAt: "2026-09-28 14:30",
  },
  {
    id: "MM-9822",
    customerName: "Nguyễn Vũ Linh",
    customerPhone: "0918765432",
    customerAddress: "15 Pasteur, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    customerNote: "Đóng gói bọc xốp cẩn thận tặng sinh nhật",
    items: [
      {
        productId: SIGNATURE_PRODUCT.id,
        name: SIGNATURE_PRODUCT.name,
        quantity: 1,
        price: SIGNATURE_PRODUCT.price,
      },
    ],
    totalAmount: 289000,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    status: "shipping",
    affiliateCode: "HAANHBAR",
    sellerCommission: 43350,
    createdAt: "2026-09-29 09:15",
  },
  {
    id: "MM-9823",
    customerName: "Hoàng Minh Trí",
    customerPhone: "0982334455",
    customerAddress: "88 Bạch Đằng, Hải Châu, Đà Nẵng",
    items: [
      {
        productId: SIGNATURE_PRODUCT.id,
        name: SIGNATURE_PRODUCT.name,
        quantity: 3,
        price: SIGNATURE_PRODUCT.price,
      },
    ],
    totalAmount: 867000,
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    status: "confirmed",
    affiliateCode: "DUCMEW",
    sellerCommission: 130050,
    createdAt: "2026-09-30 20:05",
  },
  {
    id: "MM-9824",
    customerName: "Đỗ Phương Oanh",
    customerPhone: "0977112233",
    customerAddress: "28 Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
    items: [
      {
        productId: SIGNATURE_PRODUCT.id,
        name: SIGNATURE_PRODUCT.name,
        quantity: 1,
        price: SIGNATURE_PRODUCT.price,
      },
    ],
    totalAmount: 289000,
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    status: "pending",
    affiliateCode: undefined,
    sellerCommission: 0,
    createdAt: "2026-10-01 16:45",
  },
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: "PAY-101",
    sellerId: "seller-1",
    sellerName: "Minh Đức",
    amount: 1470000,
    bankInfo: {
      bankName: "MB Bank",
      accountNumber: "0988776655",
      accountHolder: "LE MINH DUC",
    },
    status: "completed",
    requestedAt: "2026-09-20",
    processedAt: "2026-09-21",
  },
  {
    id: "PAY-102",
    sellerId: "seller-2",
    sellerName: "Hà Anh",
    amount: 2000000,
    bankInfo: {
      bankName: "Techcombank",
      accountNumber: "190334889910",
      accountHolder: "NGUYEN HA ANH",
    },
    status: "pending",
    requestedAt: "2026-09-30",
  },
];

export const BLOG_POSTS: BlogPost[] = [
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

export const INITIAL_B2B_INQUIRIES: B2BInquiry[] = [
  {
    id: "b2b-1",
    businessName: "The Alchemist Bar Hanoi",
    contactName: "Nguyễn Hải Đăng",
    phone: "0904321987",
    email: "dang.alchemist@gmail.com",
    city: "Hà Nội",
    businessType: "Cocktail Bar",
    estimatedVolume: "30 - 50 chai / tháng",
    notes: "Muốn đặt thử mẫu mẻ ủ sồi mới nhất cho menu mùa thu đông.",
    status: "contacted",
    createdAt: "2026-09-27",
  },
];
