import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Masuk — Sora House" };

export default function MasukPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#263e32] px-5 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_80%_20%,rgba(200,100,75,.32),transparent_70%)]" />
      <AuthForm />
    </main>
  );
}
