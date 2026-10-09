import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession } from "@/lib/auth";

// GET all orders - strictly protected for Admin
export async function GET(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xem danh sách đơn hàng" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create a new order - Server-side validation, pricing, stock & commission calculation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const customerName = (body.customerName || body.customer_name || "").trim();
    const customerPhone = (body.customerPhone || body.customer_phone || "").trim();
    const customerAddress = (body.customerAddress || body.customer_address || "").trim();
    const customerNote = (body.customerNote || body.customer_note || "").trim();
    const quantity = Math.max(1, parseInt(body.quantity || "1", 10) || 1);
    const paymentMethod: "vietqr" | "cod" =
      body.paymentMethod === "vietqr" || body.payment_method === "vietqr"
        ? "vietqr"
        : "cod";
    const rawRefCode = (body.affiliateCode || body.affiliate_code || "").trim();
    const rawVoucherCode = (body.voucherCode || body.voucher_code || "").trim();

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ giao hàng" },
        { status: 400 }
      );
    }

    // 1. Fetch system inventory & product price
    let productPrice = 289000;
    let currentStock = 500;

    const { data: systemInv } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", "system-inventory")
      .single();

    if (systemInv) {
      if (typeof systemInv.bottles_sold_count === "number") {
        currentStock = systemInv.bottles_sold_count;
      }
      if (Number(systemInv.balance) > 0) {
        productPrice = Number(systemInv.balance);
      }
    }

    // 2. Validate stock
    if (currentStock < quantity) {
      return NextResponse.json(
        {
          error: `Số lượng trong kho không đủ (chỉ còn ${currentStock} chai)`,
          availableStock: currentStock,
        },
        { status: 400 }
      );
    }

    // 3. Subtotal calculation on Server
    const subtotal = productPrice * quantity;
    let discountAmount = 0;
    let appliedVoucherCode: string | null = null;

    // 4. Server-side Voucher Validation & Calculation
    if (rawVoucherCode) {
      const vCode = rawVoucherCode.toUpperCase();
      let matchedVoucher: any = null;

      // Try reading from vouchers table
      const { data: dbVouchers } = await supabase
        .from("vouchers")
        .select("*")
        .ilike("code", vCode);

      if (dbVouchers && dbVouchers.length > 0) {
        matchedVoucher = dbVouchers[0];
      } else {
        // Fallback check
        const { data: fallbackRow } = await supabase
          .from("sellers")
          .select("discount_code")
          .eq("id", "system-vouchers")
          .single();
        if (fallbackRow && fallbackRow.discount_code) {
          try {
            const list = JSON.parse(fallbackRow.discount_code);
            if (Array.isArray(list)) {
              matchedVoucher = list.find(
                (v: any) => (v.code || "").toUpperCase() === vCode
              );
            }
          } catch {}
        }

        if (!matchedVoucher) {
          const defaultList = [
            { id: "voucher-1", code: "MEWMAO20K", name: "Ưu Đãi Trải Nghiệm Mơ Tây Bắc", discountType: "fixed", discountValue: 20000, startDate: "2026-01-01", endDate: "2026-12-31", minOrderValue: 0, usageLimit: 500, usedCount: 0, status: "active" },
            { id: "voucher-2", code: "CHAOMUNG10", name: "Giảm 10% Cho Khách Hàng Thân Thiết", discountType: "percent", discountValue: 10, startDate: "2026-01-01", minOrderValue: 0, usageLimit: 200, usedCount: 0, status: "active" },
            { id: "voucher-3", code: "TET2026", name: "Voucher Lộc Xuân Rượu Mơ", discountType: "fixed", discountValue: 30000, startDate: "2026-01-01", endDate: "2026-12-31", minOrderValue: 0, usageLimit: 100, usedCount: 0, status: "active" },
          ];
          matchedVoucher = defaultList.find((v) => v.code.toUpperCase() === vCode);
        }
      }

      if (matchedVoucher && (matchedVoucher.status === "active" || !matchedVoucher.status)) {
        const todayStr = new Date().toISOString().split("T")[0];
        const startDate = matchedVoucher.start_date || matchedVoucher.startDate;
        const endDate = matchedVoucher.end_date || matchedVoucher.endDate;
        const minVal = Number(matchedVoucher.min_order_value || matchedVoucher.minOrderValue) || 0;
        const usageLimit = matchedVoucher.usage_limit ?? matchedVoucher.usageLimit;
        const usedCount = Number(matchedVoucher.used_count ?? matchedVoucher.usedCount) || 0;

        const isDateValid = (!startDate || startDate <= todayStr) && (!endDate || endDate >= todayStr);
        const isMinOrderValid = subtotal >= minVal;
        const isLimitValid = !usageLimit || usedCount < usageLimit;

        if (isDateValid && isMinOrderValid && isLimitValid) {
          const discountType = matchedVoucher.discount_type || matchedVoucher.discountType || "fixed";
          const discountVal = Number(matchedVoucher.discount_value ?? matchedVoucher.discountValue) || 0;

          if (discountType === "percent") {
            discountAmount = Math.round(subtotal * (discountVal / 100));
          } else {
            discountAmount = discountVal;
          }
          discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
          appliedVoucherCode = vCode;

          // Increment voucher used count
          if (matchedVoucher.id) {
            try {
              await supabase
                .from("vouchers")
                .update({ used_count: usedCount + 1 })
                .eq("id", matchedVoucher.id);
            } catch {}
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 5. Server-side Seller Affiliate & Commission Calculation
    let sellerCommission = 0;
    let creditedSellerId: string | null = null;
    let appliedAffiliateCode: string | null = null;

    if (rawRefCode) {
      const cleanRef = rawRefCode.toUpperCase();
      const { data: dbSellers } = await supabase
        .from("sellers")
        .select("*")
        .ilike("affiliate_code", cleanRef);

      const matchedSeller = (dbSellers || []).find(
        (s: any) =>
          s.id !== "system-inventory" &&
          s.id !== "system-vouchers" &&
          s.status !== "system" &&
          s.status !== "pending" &&
          s.status !== "inactive"
      );

      if (matchedSeller) {
        creditedSellerId = matchedSeller.id;
        appliedAffiliateCode = matchedSeller.affiliate_code;
        const rate =
          matchedSeller.commission_rate !== null &&
          matchedSeller.commission_rate !== undefined
            ? Number(matchedSeller.commission_rate)
            : 0.15;
        sellerCommission = Math.round(subtotal * rate);

        // Update seller metrics in DB
        await supabase
          .from("sellers")
          .update({
            balance: (Number(matchedSeller.balance) || 0) + sellerCommission,
            total_earned: (Number(matchedSeller.total_earned) || 0) + sellerCommission,
            orders_count: (Number(matchedSeller.orders_count) || 0) + 1,
            bottles_sold_count: (Number(matchedSeller.bottles_sold_count) || 0) + quantity,
          })
          .eq("id", matchedSeller.id);
      }
    }

    // 6. Deduct Stock on Server
    const remainingStock = Math.max(0, currentStock - quantity);
    await supabase
      .from("sellers")
      .update({ bottles_sold_count: remainingStock })
      .eq("id", "system-inventory");

    // 7. Compose Note
    let finalNote = customerNote;
    if (appliedVoucherCode && discountAmount > 0) {
      const voucherTag = `[Voucher: ${appliedVoucherCode} -${discountAmount.toLocaleString("vi-VN")}₫]`;
      finalNote = finalNote ? `${finalNote} ${voucherTag}` : voucherTag;
    }

    // 8. Create Order Record
    const orderId = body.id || `MM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const orderRow = {
      id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_note: finalNote || null,
      items: [
        {
          productId: "mewmao-standard-500ml",
          name: "Rượu Mèo Cào Mewmao 500ml",
          quantity,
          price: productPrice,
        },
      ],
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      affiliate_code: appliedAffiliateCode,
      seller_commission: sellerCommission,
      payment_method: paymentMethod,
      // P1 Payment Fix: VietQR starts as 'unpaid' until confirmed by Admin/bank reconciliation!
      payment_status: "unpaid",
      status: "pending",
      created_at: now.toISOString(),
    };

    const { data: createdOrder, error: insertErr } = await supabase
      .from("orders")
      .insert(orderRow)
      .select()
      .single();

    if (insertErr) {
      console.error("Order insertion error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    const clientOrder = {
      id: orderRow.id,
      customerName: orderRow.customer_name,
      customerPhone: orderRow.customer_phone,
      customerAddress: orderRow.customer_address,
      customerNote: orderRow.customer_note || undefined,
      items: orderRow.items,
      subtotalAmount: orderRow.subtotal,
      discountAmount: orderRow.discount_amount,
      totalAmount: orderRow.total_amount,
      paymentMethod: orderRow.payment_method,
      paymentStatus: orderRow.payment_status,
      status: orderRow.status,
      affiliateCode: orderRow.affiliate_code || undefined,
      voucherCode: appliedVoucherCode || undefined,
      sellerCommission: orderRow.seller_commission,
      createdAt: formattedDate,
      remainingStock,
    };

    return NextResponse.json({ success: true, data: clientOrder });
  } catch (err: any) {
    console.error("API create order exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH update order - strictly protected for Admin
export async function PATCH(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để cập nhật đơn hàng" },
        { status: 401 }
      );
    }

    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE order - strictly protected for Admin
export async function DELETE(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xóa đơn hàng" },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch order details before deleting to revert stock and seller stats
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (order) {
      // Revert stock in system-inventory
      const bottleQty = Array.isArray(order.items)
        ? order.items.reduce(
            (sum: number, it: any) => sum + (Number(it.quantity) || 1),
            0
          )
        : 1;

      const { data: invRow } = await supabase
        .from("sellers")
        .select("bottles_sold_count")
        .eq("id", "system-inventory")
        .single();

      if (invRow) {
        await supabase
          .from("sellers")
          .update({
            bottles_sold_count: (Number(invRow.bottles_sold_count) || 0) + bottleQty,
          })
          .eq("id", "system-inventory");
      }

      // Revert seller commission and bottles sold if order had affiliate code
      if (order.affiliate_code) {
        const { data: sellerRow } = await supabase
          .from("sellers")
          .select("*")
          .ilike("affiliate_code", order.affiliate_code)
          .single();

        if (sellerRow) {
          const comm = Number(order.seller_commission) || 0;
          await supabase
            .from("sellers")
            .update({
              balance: Math.max(0, (Number(sellerRow.balance) || 0) - comm),
              total_earned: Math.max(0, (Number(sellerRow.total_earned) || 0) - comm),
              orders_count: Math.max(0, (Number(sellerRow.orders_count) || 0) - 1),
              bottles_sold_count: Math.max(
                0,
                (Number(sellerRow.bottles_sold_count) || 0) - bottleQty
              ),
            })
            .eq("id", sellerRow.id);
        }
      }
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

