"use client";

import React, { useState } from "react";
import { PARTNERS_LIST } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import {
  MapPin,
  Building2,
  Send,
  CheckCircle2,
  GlassWater,
} from "lucide-react";

export default function PartnersPage() {
  const { submitB2BInquiry, language } = useStore();
  const isEn = language === "en";

  const [cityFilter, setCityFilter] = useState<string>("All");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Hanoi");
  const [businessType, setBusinessType] = useState("Cocktail Bar / Speakeasy");
  const [estimatedVolume, setEstimatedVolume] = useState("24 - 48 bottles / month");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cities = isEn
    ? ["All", "Hanoi", "Ho Chi Minh City", "Da Nang", "Da Lat"]
    : ["Tất Cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Đà Lạt"];

  const cityMap: Record<string, string> = {
    "Hanoi": "Hà Nội",
    "Ho Chi Minh City": "TP. Hồ Chí Minh",
    "Da Nang": "Đà Nẵng",
    "Da Lat": "Đà Lạt",
  };

  const filteredPartners =
    cityFilter === "All" || cityFilter === "Tất Cả"
      ? PARTNERS_LIST
      : PARTNERS_LIST.filter(
          (p) => p.city === (cityMap[cityFilter] || cityFilter)
        );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactName.trim() || !phone.trim()) {
      alert("Please fill in Business Name, Contact Person, and Phone.");
      return;
    }

    submitB2BInquiry({
      businessName,
      contactName,
      phone,
      email,
      city,
      businessType,
      estimatedVolume,
      notes,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="py-16 sm:py-24 bg-[#0a0a0a] text-white">

      {/* 1. Header */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "AUTHORIZED STOCKISTS & PARTNERS" : "ĐỐI TÁC PHÂN PHỐI & STOCKISTS"}
        </span>
        <h1 className="font-serif text-5xl sm:text-7xl font-black text-white leading-none">
          {isEn ? (
            <>Speakeasy <span className="text-amber-gradient">Network.</span></>
          ) : (
            <>Mạng Lưới <span className="text-amber-gradient">Speakeasy.</span></>
          )}
        </h1>
        <p className="text-sm text-white/40 max-w-xl mx-auto font-light leading-relaxed">
          {isEn
            ? "Visit our partner speakeasies to taste signature plum cocktails, or inquire to feature Mewmao on your backbar."
            : "Ghé thăm các địa điểm đối tác để thưởng thức cocktail rượu mơ độc quyền, hoặc đăng ký đưa Mewmao vào menu quán bar của bạn."}
        </p>

        {/* City Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all uppercase ${
                cityFilter === c
                  ? "bg-white text-zinc-950 font-bold"
                  : "border border-white/10 text-white/40 hover:text-white hover:border-white/25"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Stockists Directory */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-16 sm:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPartners.map((bar) => (
            <div
              key={bar.id}
              className="p-6 rounded-3xl bg-zinc-900 border border-white/06 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="uppercase text-mewmao-orange font-bold">{bar.type}</span>
                  <span className="text-white/30">{bar.city}</span>
                </div>
                <h3 className="font-serif text-2xl font-black text-white leading-snug">{bar.name}</h3>
                <div className="flex items-start gap-1.5 text-xs text-white/40 font-light">
                  <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                  <span>{bar.address}</span>
                </div>
                <p className="text-xs text-white/50 font-light leading-relaxed">{bar.description}</p>
              </div>

              <div className="pt-4 border-t border-white/06 space-y-2">
                <div className="text-[11px] text-white/60 bg-white/05 p-2.5 rounded-xl border border-white/06 flex items-center gap-1.5 font-mono">
                  <GlassWater className="w-3.5 h-3.5 text-mewmao-orange flex-shrink-0" />
                  <span className="truncate">Signature: <strong className="text-white">{bar.signatureDrink}</strong></span>
                </div>
                <div className="text-[10px] font-mono text-white/25 text-right">{bar.instagram}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. B2B Wholesale Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-mewmao-orange font-semibold block">
              B2B WHOLESALE & DISTRIBUTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
              {isEn ? "Feature Mewmao on Your Backbar" : "Đưa Mewmao Vào Quầy Bar Của Bạn"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              {isEn
                ? "Wholesale tiers from 20% to 35% discount, complimentary staff cocktail training, and bartender tasting kits."
                : "Chính sách giá đại lý chiết khấu từ 20% đến 35%, hỗ trợ đào tạo pha chế menu cocktail độc quyền và cung cấp bộ tasting kit miễn phí."}
            </p>
          </div>

          {/* Wholesale Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-center font-mono">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Starter Tier</span>
              <strong className="text-sm font-bold text-white">12 - 24 Bottles</strong>
              <div className="text-xs text-mewmao-orange font-bold mt-0.5">20% Discount</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
              <span className="text-[9px] text-zinc-300 uppercase tracking-wider block">Bar Standard</span>
              <strong className="text-sm font-bold text-white">24 - 60 Bottles</strong>
              <div className="text-xs text-mewmao-orange font-bold mt-0.5">28% Discount + Bar Kit</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Key Partner</span>
              <strong className="text-sm font-bold text-white">&gt; 60 Bottles / Mo</strong>
              <div className="text-xs text-mewmao-orange font-bold mt-0.5">35% Discount + Co-Branding</div>
            </div>
          </div>

          {/* Form */}
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-white">
                {isEn ? "Inquiry Received Successfully" : "Đã Gửi Yêu Cầu Hợp Tác Thành Công!"}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-light leading-relaxed">
                {isEn
                  ? `Our partnership representative will contact ${contactName} (${phone}) within 2-4 business hours with our wholesale portfolio and tasting kit.`
                  : `Đội ngũ quan hệ đối tác của Mewmao Distillery sẽ liên hệ với ${contactName} (${phone}) trong vòng 2-4 giờ làm việc để gửi bảng báo giá đại lý chi tiết và gửi bộ mẫu thử.`}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 font-mono"
              >
                {isEn ? "Submit Another Inquiry" : "Gửi thêm yêu cầu khác"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    {isEn ? "Business / Venue Name *" : "Tên Quán / Doanh Nghiệp *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Rabbit Hole Speakeasy"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    {isEn ? "Contact Person *" : "Người Liên Hệ *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex Nguyen"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    {isEn ? "Phone / WhatsApp *" : "Số Điện Thoại *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bar@yourvenue.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    {isEn ? "City" : "Thành Phố"}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange"
                  >
                    <option value="Hanoi">Hanoi</option>
                    <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                    <option value="Da Nang">Da Nang</option>
                    <option value="Da Lat">Da Lat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  {isEn ? "Notes or Tasting Kit Request" : "Ghi Chú Hoặc Yêu Cầu Mẫu Thử"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isEn ? "e.g. Requesting a tasting sample bottle for our new seasonal menu..." : "Ghi chú thêm..."}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-mewmao-orange placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-mewmao-orange hover:bg-orange-600 text-white font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEn ? "Submit Wholesale Request & Receive Tasting Kit" : "Gửi Yêu Cầu Báo Giá Đại Lý & Nhận Mẫu Thử"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
