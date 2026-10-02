-- =========================================================================
-- MEWMAO DISTILLERY - SUPABASE DATABASE SCHEMA
-- Dán toàn bộ mã SQL này vào: Supabase Dashboard -> SQL Editor -> Run
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
  status text not null default 'pending', -- pending, confirmed, shipping, delivered, cancelled
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
  status text not null default 'pending', -- pending, completed, rejected
  requested_at text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. BẬT ROW LEVEL SECURITY (RLS) & CHÍNH SÁCH TRUY CẬP AN TOÀN
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
alter table public.payouts enable row level security;

-- Cho phép đọc / thêm / cập nhật an toàn qua Anon Key
create policy "Allow public read sellers" on public.sellers for select using (true);
create policy "Allow public insert sellers" on public.sellers for insert with check (true);
create policy "Allow public update sellers" on public.sellers for update using (true);
create policy "Allow public delete sellers" on public.sellers for delete using (true);

create policy "Allow public read orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true);

create policy "Allow public read payouts" on public.payouts for select using (true);
create policy "Allow public insert payouts" on public.payouts for insert with check (true);
create policy "Allow public update payouts" on public.payouts for update using (true);

-- 5. THÊM DỮ LIỆU MẪU ĐẠI SỨ ĐẦU TIÊN (NẾU BẢNG TRỐNG)
insert into public.sellers (id, name, phone, email, affiliate_code, pin, commission_rate, balance, total_earned, total_withdrawn, bank_name, account_number, account_holder, status)
values
  ('seller-1', 'Minh Đức (DJ)', '0912345678', 'duc.dj@mewmao.vn', 'DJDUC', '123456', 0.15, 260000, 760000, 500000, 'Techcombank', '1903678912345', 'NGUYEN MINH DUC', 'active'),
  ('seller-2', 'Hà Anh (Mixologist)', '0987654321', 'haanh.bar@mewmao.vn', 'HAANH', '567890', 0.15, 480000, 1180000, 700000, 'Vietcombank', '0011004567890', 'TRAN HA ANH', 'active')
on conflict (id) do nothing;
