import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wjmtlewjkommnaylysiu.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("API order delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
