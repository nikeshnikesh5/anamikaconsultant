import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-cinzel", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], style: ["italic"], variable: "--font-playfair", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "Anamika Consultant — Astro Scientist & Consultant",
  description:
    "Anamika Consultant: astro science and private consultations for relationships, career and wellbeing. Clear, practical guidance based on astronomical data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${playfair.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
