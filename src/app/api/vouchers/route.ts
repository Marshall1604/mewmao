import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession } from "@/lib/auth";
import { Voucher } from "@/types";

// Helper: Read vouchers from system-vouchers fallback record
async function getVouchersFromFallback(supabase: any): Promise<Voucher[]> {
  try {
    const { data } = await supabase
      .from("sellers")
      .select("discount_code")
      .eq("id", "system-vouchers")
      .single();

    if (data && data.discount_code) {
      const parsed = JSON.parse(data.discount_code);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Fallback read vouchers error:", e);
  }
  return [];
}

// Helper: Save vouchers to system-vouchers fallback record
async function saveVouchersToFallback(supabase: any, vouchers: Voucher[]) {
  try {
    await supabase.from("sellers").upsert({
      id: "system-vouchers",
      name: "Mewmao System Vouchers",
      affiliate_code: "SYS_VOUCHERS",
      pin: "000000",
      commission_rate: 0,
      status: "system_vouchers",
      discount_code: JSON.stringify(vouchers),
    });
  } catch (e) {
    console.warn("Fallback save vouchers error:", e);
  }
}

// GET all vouchers (public can see active vouchers, Admin can see all)
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const isAdmin = verifyAdminSession(request);

    // 1. Try reading from vouchers table
    let query = supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("status", "active");
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: Voucher[] = data.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        discountType: row.discount_type || "fixed",
        discountValue: Number(row.discount_value) || 0,
        startDate: row.start_date || undefined,
        endDate: row.end_date || undefined,
        minOrderValue: Number(row.min_order_value) || 0,
        usageLimit: typeof row.usage_limit === "number" ? row.usage_limit : undefined,
        usedCount: Number(row.used_count) || 0,
        status: row.status || "active",
        createdAt: row.created_at || new Date().toISOString(),
      }));
      return NextResponse.json({ data: mapped });
    }

    // 2. Fallback read
    let fallbackList = await getVouchersFromFallback(supabase);
    if (!fallbackList || fallbackList.length === 0) {
      fallbackList = [
        {
          id: "voucher-1",
          code: "MEWMAO20K",
          name: "Ưu Đãi Trải Nghiệm Mơ Tây Bắc",
          discountType: "fixed",
          discountValue: 20000,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          minOrderValue: 0,
          usageLimit: 500,
          usedCount: 0,
          status: "active",
        },
        {
          id: "voucher-2",
          code: "CHAOMUNG10",
          name: "Giảm 10% Cho Khách Hàng Thân Thiết",
          discountType: "percent",
          discountValue: 10,
          startDate: "2026-01-01",
          minOrderValue: 0,
          usageLimit: 200,
          usedCount: 0,
          status: "active",
        },
        {
          id: "voucher-3",
          code: "TET2026",
          name: "Voucher Lộc Xuân Rượu Mơ",
          discountType: "fixed",
          discountValue: 30000,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          minOrderValue: 0,
          usageLimit: 100,
          usedCount: 0,
          status: "active",
        },
      ];
    }

    const resultList = isAdmin
      ? fallbackList
      : fallbackList.filter((v) => v.status === "active" || !v.status);

    return NextResponse.json({ data: resultList });
  } catch (err: any) {
    return NextResponse.json({ data: [], error: err.message });
  }
}

// POST create voucher - strictly protected for Admin
export async function POST(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để tạo voucher" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (body.vouchers && Array.isArray(body.vouchers)) {
      await saveVouchersToFallback(supabase, body.vouchers);

      try {
        for (const v of body.vouchers) {
          await supabase.from("vouchers").upsert({
            id: v.id,
            code: v.code,
            name: v.name,
            discount_type: v.discountType,
            discount_value: v.discountValue,
            start_date: v.startDate || null,
            end_date: v.endDate || null,
            min_order_value: v.minOrderValue || 0,
            usage_limit: v.usageLimit || null,
            used_count: v.usedCount || 0,
            status: v.status || "active",
          });
        }
      } catch {}

      return NextResponse.json({ success: true, count: body.vouchers.length });
    }

    const newVoucher: Voucher = body;
    const currentList = await getVouchersFromFallback(supabase);
    const existingIdx = currentList.findIndex(
      (v) => v.id === newVoucher.id || v.code === newVoucher.code
    );

    let updatedList: Voucher[];
    if (existingIdx >= 0) {
      updatedList = [...currentList];
      updatedList[existingIdx] = newVoucher;
    } else {
      updatedList = [newVoucher, ...currentList];
    }

    await saveVouchersToFallback(supabase, updatedList);

    try {
      await supabase.from("vouchers").upsert({
        id: newVoucher.id,
        code: newVoucher.code,
        name: newVoucher.name,
        discount_type: newVoucher.discountType,
        discount_value: newVoucher.discountValue,
        start_date: newVoucher.startDate || null,
        end_date: newVoucher.endDate || null,
        min_order_value: newVoucher.minOrderValue || 0,
        usage_limit: newVoucher.usageLimit || null,
        used_count: newVoucher.usedCount || 0,
        status: newVoucher.status || "active",
      });
    } catch {}

    return NextResponse.json({ success: true, data: newVoucher });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH update voucher - strictly protected for Admin
export async function PATCH(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để cập nhật voucher" },
        { status: 401 }
      );
    }

    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();

    const currentList = await getVouchersFromFallback(supabase);
    const updatedList = currentList.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    await saveVouchersToFallback(supabase, updatedList);

    try {
      const dbUpdates: any = {};
      if (updates.code) dbUpdates.code = updates.code;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.discountType) dbUpdates.discount_type = updates.discountType;
      if (updates.discountValue !== undefined)
        dbUpdates.discount_value = updates.discountValue;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.minOrderValue !== undefined)
        dbUpdates.min_order_value = updates.minOrderValue;
      if (updates.usageLimit !== undefined)
        dbUpdates.usage_limit = updates.usageLimit;
      if (updates.usedCount !== undefined) dbUpdates.used_count = updates.usedCount;
      if (updates.status) dbUpdates.status = updates.status;

      await supabase.from("vouchers").update(dbUpdates).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE a voucher - strictly protected for Admin
export async function DELETE(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xóa voucher" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing voucher id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const currentList = await getVouchersFromFallback(supabase);
    const updatedList = currentList.filter((v) => v.id !== id);
    await saveVouchersToFallback(supabase, updatedList);

    try {
      await supabase.from("vouchers").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
