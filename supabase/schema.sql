-- =========================================================================
-- MEWMAO DISTILLERY - SUPABASE DATABASE SCHEMA & SECURE RLS POLICIES
-- BẢN BẢO MẬT CHUẨN: CHẶN TRUY CẬP CÔNG KHAI (ANON), CHỈ SERVER TRUY CẬP
-- =========================================================================

-- 1. BẢNG SELLERS (Đại Lý / Đại Sứ Mewmao)
create table if not exists public.sellers (
  id text primary key,
  name text not null,
  phone text,
  email text,
  affiliate_code text unique not null,
  pin text not null, -- Mã PIN 6 chữ số
  commission_rate numeric not null default 0.15,
  discount_code text,
  discount_percent numeric default 0,
  bottles_sold_count integer default 0,
  orders_count integer default 0,
  balance numeric default 0,
  total_earned numeric default 0,
  total_withdrawn numeric default 0,
  bank_name text,
  account_number text,
  account_holder text,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. BẢNG ORDERS (Đơn Hàng Đặt Mua Rượu)
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_note text,
  items jsonb not null,
  subtotal numeric not null default 289000,
  discount_amount numeric not null default 0,
  total_amount numeric not null default 289000,
  affiliate_code text,
  seller_commission numeric not null default 0,
  payment_method text not null default 'cod',
  payment_status text not null default 'unpaid',
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. BẢNG PAYOUTS (Yêu Cầu Rút Tiền Hoa Hồng)
create table if not exists public.payouts (
  id text primary key,
  seller_id text references public.sellers(id) on delete cascade,
  amount numeric not null,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  status text not null default 'pending',
  requested_at text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. BẢNG VOUCHERS (Mã Giảm Giá Khuyến Mãi)
create table if not exists public.vouchers (
  id text primary key,
  code text unique not null,
  name text not null,
  discount_type text not null default 'fixed',
  discount_value numeric not null default 0,
  start_date text,
  end_date text,
  min_order_value numeric default 0,
  usage_limit integer,
  used_count integer default 0,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. BẢNG B2B_INQUIRIES (Yêu Cầu Hợp Tác Đối Tác / Bar / Nhà Hàng)
create table if not exists public.b2b_inquiries (
  id text primary key,
  business_name text not null,
  contact_person text not null,
  email text,
  phone text not null,
  business_type text default 'other',
  estimated_volume text,
  message text,
  status text not null default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. BẬT BẢO MẬT ROW LEVEL SECURITY (RLS) TRÊN TẤT CẢ CÁC BẢNG
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
alter table public.payouts enable row level security;
alter table public.vouchers enable row level security;
alter table public.b2b_inquiries enable row level security;

-- 7. XÓA BỎ TOÀN BỘ CÁC CHÍNH SÁCH MỞ CÔNG KHAI (ANON) NGUY HIỂM CŨ
drop policy if exists "Allow public read sellers" on public.sellers;
drop policy if exists "Allow public insert sellers" on public.sellers;
drop policy if exists "Allow public update sellers" on public.sellers;
drop policy if exists "Allow public delete sellers" on public.sellers;

drop policy if exists "Allow public read orders" on public.orders;
drop policy if exists "Allow public insert orders" on public.orders;
drop policy if exists "Allow public update orders" on public.orders;
drop policy if exists "Allow public delete orders" on public.orders;

drop policy if exists "Allow public read payouts" on public.payouts;
drop policy if exists "Allow public insert payouts" on public.payouts;
drop policy if exists "Allow public update payouts" on public.payouts;
drop policy if exists "Allow public delete payouts" on public.payouts;

drop policy if exists "Allow public read vouchers" on public.vouchers;
drop policy if exists "Allow public insert vouchers" on public.vouchers;
drop policy if exists "Allow public update vouchers" on public.vouchers;
drop policy if exists "Allow public delete vouchers" on public.vouchers;

drop policy if exists "Allow public read b2b_inquiries" on public.b2b_inquiries;
drop policy if exists "Allow public insert b2b_inquiries" on public.b2b_inquiries;

-- 8. THIẾT LẬP CHÍNH SÁCH BẢO MẬT THEO VAI TRÒ (ROLE-BASED POLICIES)
-- Chỉ cho phép người dùng công khai đọc danh sách Voucher đang hoạt động (active)
create policy "Allow public read active vouchers" on public.vouchers 
  for select using (status = 'active');

-- Bảng sellers, orders, payouts, b2b_inquiries KHÔNG cấp quyền anon công khai!
-- Mọi truy vấn từ Website đều đi qua Server API sử dụng Service Role (tự động bypass RLS an toàn ở máy chủ).
