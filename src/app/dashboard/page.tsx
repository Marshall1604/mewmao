"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-sans text-xs text-zinc-500">
      Đang chuyển hướng đến cổng Quản trị Admin (/admin)...
    </div>
  );
}
