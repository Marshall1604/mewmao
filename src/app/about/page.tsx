"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Wine, ShieldCheck, Instagram, Facebook } from "lucide-react";

export default function AboutPage() {
  const { language } = useStore();
  const isEn = language === "en";

  return (
    <div className="py-16 sm:py-24 bg-[#faf9f6] text-zinc-900 min-h-screen">

      {/* 1. Header Banner */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-5">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "THE MEWMAO STORY" : "CÂU CHUYỆN THƯƠNG HIỆU"}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-950 leading-tight">
          {isEn ? (
            <>About Us — <span className="italic font-normal text-amber-gradient">Mewmao Distillery</span></>
          ) : (
            <>Về Chúng Tôi — <span className="italic font-normal text-amber-gradient">Mewmao Distillery</span></>
          )}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {isEn
            ? "Mewmao was founded to bridge the ancient herbal alchemy of Vietnam's high mountains with the nocturnal pulse of underground youth culture."
            : "Mewmao ra đời từ mong muốn tạo ra một dòng rượu thủ công bản địa Việt Nam vừa lưu giữ trọn vẹn hồn cốt thảo mộc vùng cao, vừa mang nhịp đập hiện đại của văn hóa underground."}
        </p>
      </section>

      {/* 2. Story Narrative */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-20 sm:mt-28 border-t border-zinc-200/80 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
              {isEn ? "ORIGIN: MOC CHAU HIGHLANDS" : "KHỞI NGUỒN TỪ MẢNH ĐẤT MỘC CHÂU"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-zinc-950 leading-snug">
              {isEn
                ? "When blush plums meet the unhurried patience of clay urns."
                : "Khi quả mơ má đào tìm thấy chiếc chum sành tĩnh lặng."}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
              {isEn
                ? "Every early summer across the mist-shrouded slopes of Moc Chau, native ancient plum groves awaken. The plums reach their peak: flushed pink like youthful cheeks, deep golden pulp, releasing intoxicating wild honey aromas across the valleys."
                : "Mỗi độ đầu hè, khi những triền đồi Mộc Châu chuyển mình trong nắng mới, những quả mơ má đào cổ thụ đạt tới độ chín viên mãn nhất: lớp vỏ phớt hồng như má đào, ruột vàng óng ả và hương thơm nồng nàn lan khắp thung lũng."}
            </p>
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
              {isEn
                ? "Refusing industrial shortcuts, Mewmao insists on deliberate slowness: every plum is picked by hand, inspected, immersed in tower-distilled heirloom sticky rice spirit, and rests inside unvarnished Bat Trang earthenware vats for 365 days."
                : "Thay vì sử dụng phương pháp công nghiệp cấp tốc, Mewmao chọn con đường kiên nhẫn: từng quả mơ được hái tay, ngâm ủ cùng rượu nếp cái hoa vàng chưng cất tháp truyền thống trong chum sành không tráng men suốt 365 ngày đêm."}
            </p>
          </div>

          {/* Philosophy Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] border border-stone-200/80 space-y-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-mewmao-orange">
              <Wine className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-black text-zinc-950">
                {isEn ? "The Three Inviolable Tenets" : "Triết Lý Tam Bất Của Mewmao"}
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                {isEn
                  ? "Our unwavering distillation standards ensuring absolute purity in every drop:"
                  : "Chuẩn mực thủ công khắt khe bảo chứng cho từng giọt rượu đến tay bạn:"}
              </p>
            </div>
            <ul className="space-y-4 text-xs text-zinc-700 font-normal">
              {[
                { enL: "Zero Chemical Alcohol:", viL: "Không Cồn Công Nghiệp:", enD: "100% natural heirloom sticky rice wine fermented with 36 mountain botanicals.", viD: "100% men nếp cái hoa vàng cổ truyền lên men thảo mộc." },
                { enL: "Zero Artificial Fragrance:", viL: "Không Hương Liệu Nhân Tạo:", enD: "The natural scent of sun-drenched Moc Chau plums, pure and unaltered.", viD: "Mùi thơm tự nhiên của mơ má đào chín sương vùng cao." },
                { enL: "Zero Chemical Preservatives:", viL: "Không Chất Bảo Quản:", enD: "Naturally self-preserving through porous clay vat micro-aeration.", viD: "Lên men tự nhiên và tự bảo quản nhờ cấu trúc ủ chum sành vi xốp." },
              ].map((row) => (
                <li key={row.enL} className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-mewmao-orange flex-shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-950 font-bold">{isEn ? row.enL : row.viL}</strong>{" "}{isEn ? row.enD : row.viD}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Four Stages */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-24 sm:mt-32 border-t border-zinc-200/80 pt-16">
        <div className="mb-14 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
            {isEn ? "THE HARVEST & CELLAR ARCHITECTURE" : "QUY TRÌNH KỲ CÔNG"}
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-black text-zinc-950 leading-tight">
            {isEn ? "Four Stages of Slow Craft" : "4 Bước Tạo Nên Tuyệt Phẩm"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-zinc-200/80">
          {[
            { n: "01", en: "Prime Blush Plums", vi: "Mơ Má Đào Loại 1", enD: "Handpicked at optimum ripeness, washed in mountain spring water, and naturally air-dried.", viD: "Hái tuyển từng quả đúng độ chín mọng, rửa bằng nước nguồn tự nhiên và hong khô thủ công." },
            { n: "02", en: "Tower Distillation", vi: "Rượu Cốt Nếp Tháp", enD: "Tower distillation purifies out heavy fusel oils and aldehydes, providing a pure, clear spirit.", viD: "Rượu nếp cái hoa vàng cất qua tháp đa tầng, tách bỏ hoàn toàn aldehyde." },
            { n: "03", en: "365 Days Clay Aging", vi: "Ủ Chum Sành 365 Ngày", enD: "Resting undisturbed in unglazed earthenware, softening spirit molecules into silk.", viD: "Rượu được thở qua thành gốm không tráng men, làm mềm hóa phân tử rượu êm mượt." },
            { n: "04", en: "Wax Sealed Flasks", vi: "Chiết Rót & Niêm Phong", enD: "Single batch hand bottling, individually numbered and wax sealed for uncompromising quality.", viD: "Rót chai thủ công từng mẻ nhỏ, kiểm định chất lượng nghiêm ngặt trước khi xuất xưởng." },
          ].map((s) => (
            <div key={s.n} className="py-8 lg:py-0 lg:px-8 first:pl-0 last:pr-0 space-y-3">
              <span className="font-serif text-4xl text-zinc-300 font-black">{s.n}</span>
              <h3 className="font-serif text-xl font-black text-zinc-950">{isEn ? s.en : s.vi}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed">{isEn ? s.enD : s.viD}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Social Links */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 mt-24 pb-8 text-center space-y-6">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "CONNECT WITH THE ATELIER" : "KẾT NỐI VỚI CỘNG ĐỒNG MEWMAO"}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-black text-zinc-950 leading-tight">
          {isEn ? "Follow Our Journey" : "Theo Dõi Hành Trình"}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://www.facebook.com/Mewmaodistillery"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-mewmao-black"
          >
            <Facebook className="w-4 h-4" /> Facebook: Mewmaodistillery
          </a>
          <a
            href="https://www.instagram.com/mewmaodistillery"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-mewmao-white"
          >
            <Instagram className="w-4 h-4" /> Instagram: @mewmaodistillery
          </a>
        </div>
      </section>
    </div>
  );
}
