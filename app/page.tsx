import type { Metadata } from "next";
import HotelHome from "@/components/HotelHome";

export const metadata: Metadata = {
  title: "Sora House — Boutique Stay di Uluwatu",
  description: "Temukan jeda di Sora House, hotel butik tepi laut di Uluwatu, Bali.",
};

export default function Home() {
  return <HotelHome />;
}
