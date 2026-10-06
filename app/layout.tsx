import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Driver Duo — GPID26",
  description:
    "Profil pembalap Yassir Army Tigreal dan Alveoniro Moskop Epic: biografi, statistik, dan karier.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${outfit.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
