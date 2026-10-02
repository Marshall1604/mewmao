# MEWMAO DISTILLERY — WEBSITE THƯƠNG MẠI ĐIỆN TỬ & HỆ THỐNG AFFILIATE SELLER

Trang web bán lẻ cao cấp chuẩn **Apple Flat Minimalism** kết hợp **Underground Youth Culture** dành riêng cho thương hiệu rượu thủ công **Mewmao Distillery** ([Facebook](https://www.facebook.com/Mewmaodistillery) | [Instagram](https://www.instagram.com/mewmaodistillery)).

---

## 🍸 TÍNH NĂNG NỔI BẬT

1. **Giao diện chuẩn Apple Phẳng & Tinh tế (White - Black - Amber Orange)**:
   - Tối giản, không rườm rà, tập trung 100% vào chất lượng và sự tinh khiết của giọt rượu mơ má đào.
   - Tone màu: Trắng tinh khiết (`#FFFFFF`) — Đen Obsidian (`#09090B`) — Cam Hổ phách Rượu Mơ (`#FF5E00` / `#FF7A00`).
   - Lớp phủ Grain Noise Analog Vinyl, hiệu ứng khúc xạ thủy tinh và ánh sáng hổ phách Amber Glow.
   - Trình phát âm thanh **Underground Lounge Synthesizer** (Web Audio API) nhẹ nhàng khi lướt web.

2. **Chai Rượu Độc Bản (Single-SKU Hero Focus)**:
   - Mô hình chai rượu tương tác **3D Parallax Tilt** nghiêng theo chuyển động con trỏ chuột.
   - **Tasting Notes 3 Tầng**: *The Nose* (Hương Đầu) — *The Palate* (Vị Thân) — *The Finish* (Hậu Vị).
   - Biểu đồ chỉ số vị giác (Độ chua thanh, Độ ngọt mật, Độ êm mượt, Độ nồng ấm).

3. **Quy trình Mua Hàng & Thanh toán Siêu Tốc (Express Checkout Drawer)**:
   - Tự động sinh mã **VietQR ngân hàng** kèm thông tin chuyển khoản và mã đơn hàng `MEWMAO_[ID]`.
   - Hỗ trợ thanh toán tiền mặt khi nhận hàng (**COD**).
   - Bảo hiểm nứt vỡ 100% trong quá trình vận chuyển.

4. **Hệ Thống Phân Quyền Đa Tầng (Admin & Seller Portal)**:
   - **Cổng Seller (Cộng Tác Viên / Đại Sứ)**:
     - Tạo link giới thiệu cá nhân độc quyền: `https://mewmao.vn/?ref=DUCMEW`.
     - Tự động ghi nhận lượt click, số đơn hàng phát sinh, tỷ lệ chuyển đổi.
     - Tự động tính hoa hồng 15% cho từng đơn thành công.
     - Form yêu cầu rút tiền về tài khoản ngân hàng và tra cứu lịch sử đơn hàng.
   - **Cổng Admin (Quản Trị Viên)**:
     - Tổng quan doanh thu, số chai xuất xưởng, tổng hoa hồng đã chi.
     - Quản lý trạng thái đơn hàng (Chờ xác nhận → Đang giao → Đã giao).
     - Quản lý mạng lưới đại sứ, kiểm soát % hoa hồng.
     - Duyệt lệnh rút tiền cho seller.
     - Quản lý danh sách đối tác B2B (các quán bar gửi yêu cầu từ website).

5. **Các Trang Nội Dung Chuyên Sâu**:
   - `/about`: Tuyên ngôn thương hiệu, triết lý "Tam Bất" (Không cồn công nghiệp, không hương liệu, không chất bảo quản), quy trình ủ chum sành 365 ngày.
   - `/blog`: Tạp chí Cocktail Lab, công thức mixology chuẩn bar (Mewmao Highball, Mewmao Sour, Plum on the rocks).
   - `/partners`: Mạng lưới Speakeasy Bar, Vinyl Lounge đang phục vụ Mewmao và form B2B báo giá sỉ tự động.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (LOCAL DEVELOPMENT)

### Yêu cầu:
- Node.js >= 18 (Khuyến nghị Node.js v20+)

### Cài đặt và chạy:
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

### Kiểm tra build sản phẩm:
```bash
npm run build
npm run start
```

---

## 👥 TÀI KHOẢN TRẢI NGHIỆM PHÂN QUYỀN

Trên thanh điều hướng (Navbar) hoặc Dashboard, bạn có thể chuyển đổi nhanh giữa các vai trò bằng menu dropdown:
1. **Khách hàng (Guest)**: Trải nghiệm mua sắm, xem câu chuyện và công thức cocktail.
2. **Seller: Minh Đức (DJ)**: Mã ref `DUCMEW` • Hoa hồng 15% • Đã tạo sẵn đơn hàng và lịch sử rút tiền.
3. **Seller: Hà Anh (Bartender)**: Mã ref `HAANHBAR` • Hoa hồng 15%.
4. **Admin (Quản Trị Viên)**: Quản lý toàn bộ hệ thống đơn hàng, sellers, duyệt thanh toán.

---

© 2026 Mewmao Distillery. Chưng cất thủ công tại Việt Nam.
