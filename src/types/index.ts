export type UserRole = "admin" | "seller" | "guest";

export interface Product {
  id: string;
  name: string;
  subName: string;
  tagline: string;
  price: number;
  originalPrice: number;
  volume: string;
  abv: string;
  description: string;
  details: {
    origin: string;
    vintage: string;
    barrelAged: string;
    harvestMethod: string;
  };
  tastingNotes: {
    nose: string;
    palate: string;
    finish: string;
  };
  botanicals: string[];
  stock: number;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
export type PaymentMethod = "vietqr" | "cod";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string;
  items: OrderItem[];
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "unpaid";
  status: OrderStatus;
  affiliateCode?: string;
  voucherCode?: string;
  sellerCommission: number;
  createdAt: string;
}

export type DiscountType = "percent" | "fixed";

export interface Voucher {
  id: string;
  code: string; // VD: MEWMAO20K, TET2026, BANMOI
  name: string; // Tên chương trình, VD: Ưu đãi bạn mới
  discountType: DiscountType; // "percent" (%) hoặc "fixed" (VNĐ)
  discountValue: number; // VD: 10 (%) hoặc 30000 (VNĐ)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (để trống = không giới hạn)
  minOrderValue?: number; // Đơn tối thiểu để áp dụng (VD: 0)
  usageLimit?: number; // Số lượt dùng tối đa (undefined = không giới hạn)
  usedCount: number; // Số lượt đã sử dụng
  status: "active" | "inactive";
  createdAt?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "seller";
  status?: "active" | "pending" | "inactive";
  affiliateCode: string;
  pin: string; // Mã PIN đăng nhập của Seller (VD: "1234")
  commissionRate: number; // e.g. 0.15 (15%)
  promoDiscountPerBottle?: number; // Tùy chọn (nếu có chương trình đặc biệt)
  balance: number;
  totalWithdrawn: number;
  totalEarned: number;
  clicksCount: number;
  ordersCount: number;
  bottlesSoldCount: number; // Tổng số chai bán được
  createdAt?: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: "pending" | "completed" | "rejected";
  requestedAt: string;
  processedAt?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: "Cocktail Lab" | "Artisanal Craft" | "Underground Culture" | "Tasting Diary";
  coverImage: string;
  readTime: string;
  date: string;
  tags: string[];
  en?: {
    title: string;
    excerpt: string;
    content: string[];
    readTime: string;
    date: string;
    tags: string[];
    category?: "Cocktail Lab" | "Artisanal Craft" | "Underground Culture" | "Tasting Diary";
  };
}

export interface PartnerBar {
  id: string;
  name: string;
  type: "Speakeasy" | "Cocktail Bar" | "Vinyl Lounge" | "Club" | "Artisan Bistro";
  city: "Hà Nội" | "TP. Hồ Chí Minh" | "Đà Nẵng" | "Đà Lạt";
  address: string;
  description: string;
  signatureDrink: string;
  instagram: string;
  featured: boolean;
}

export interface B2BInquiry {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  businessType: string;
  estimatedVolume: string;
  notes?: string;
  status: "new" | "contacted" | "contracted";
  createdAt: string;
}
