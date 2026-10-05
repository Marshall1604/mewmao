import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession } from "@/lib/auth";

// GET public stock & price
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: systemInv } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", "system-inventory")
      .single();

    let stock = 500;
    let price = 289000;

    if (systemInv) {
      if (typeof systemInv.bottles_sold_count === "number") {
        stock = systemInv.bottles_sold_count;
      }
      if (Number(systemInv.balance) > 0) {
        price = Number(systemInv.balance);
      }
    }

    return NextResponse.json({ stock, price });
  } catch (err: any) {
    return NextResponse.json({ stock: 500, price: 289000 });
  }
}

// POST update stock - Admin only
export async function POST(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để cập nhật kho hàng" },
        { status: 401 }
      );
    }

    const { stock, price } = await request.json();
    const supabase = getSupabaseAdmin();

    const updates: any = {};
    if (typeof stock === "number") updates.bottles_sold_count = stock;
    if (typeof price === "number") updates.balance = price;

    await supabase
      .from("sellers")
      .upsert({
        id: "system-inventory",
        name: "Mewmao Inventory",
        affiliate_code: "SYS_STOCK",
        pin: "000000",
        status: "system_inventory",
        ...updates,
      });

    return NextResponse.json({ success: true, stock, price });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
