import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    const expectedPin =
      process.env.ADMIN_MASTER_PIN ||
      process.env.NEXT_PUBLIC_MASTER_ADMIN_PIN ||
      "241091";

    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      return NextResponse.json(
        { success: false, error: "Mã PIN không chính xác" },
        { status: 401 }
      );
    }

    // PIN is valid, create admin token (valid 7 days)
    const token = signToken({ role: "admin", sub: "admin" }, 7 * 24 * 3600);

    const isProd = process.env.NODE_ENV === "production";
    const cookieHeader = `mewmao_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${
      isProd ? "; Secure" : ""
    }`;

    const response = NextResponse.json({ success: true, token });
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
