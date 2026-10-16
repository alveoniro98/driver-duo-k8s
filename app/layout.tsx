import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sora House — Boutique Stay di Uluwatu",
  description: "Hotel butik tepi laut di Uluwatu, Bali. Temukan jeda di Sora House.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${outfit.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
