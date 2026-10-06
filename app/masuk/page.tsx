import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Masuk — GPID26" };

export default function MasukPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#1a0609_0%,#2b0a10_22%,#0c1116_48%,#0a2a36_78%,#0a3140_100%)] px-5 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_22%_20%,rgba(190,20,30,.55),transparent_70%),radial-gradient(ellipse_40%_40%_at_80%_90%,rgba(0,120,150,.35),transparent_70%)]" />
      <AuthForm />
    </main>
  );
}
