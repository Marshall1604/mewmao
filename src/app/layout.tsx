import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickBuyDrawer from "@/components/QuickBuyDrawer";
import AgeGateModal from "@/components/AgeGateModal";
import ContactQuickMenu from "@/components/ContactQuickMenu";
import VoucherFloatingWidget from "@/components/VoucherFloatingWidget";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const serif = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Mewmao Distillery — Artisanal Vietnamese Plum Spirit",
  description:
    "Naturally fermented Moc Chau blush plums aged for 365 days in unvarnished earthenware urns. Ancient mountain alchemy meets underground freedom.",
  keywords: [
    "Mewmao",
    "Mewmao distillery",
    "Artisanal plum spirit",
    "Rượu mơ má đào",
    "Vietnamese craft liquor",
    "Underground craft spirit",
  ],
  openGraph: {
    title: "Mewmao Distillery — Artisanal Vietnamese Plum Spirit",
    description: "The Taste of Night and Liberty. 19% ABV. Handcrafted in Vietnam.",
    url: "https://mewmao.com",
    siteName: "Mewmao Distillery",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans antialiased selection:bg-black selection:text-white">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <QuickBuyDrawer />
          <AgeGateModal />
          <ContactQuickMenu />
          <VoucherFloatingWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
