"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "login" | "register";

const copy = {
  login: { title: "Masuk", submit: "Masuk", switchText: "Belum punya akun?", switchLabel: "Daftar" },
  register: { title: "Daftar", submit: "Buat akun", switchText: "Sudah punya akun?", switchLabel: "Masuk" },
};

const inputClass =
  "w-full rounded-md border border-white/12 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-yellow";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const text = copy[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setPending(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      if (response.ok) {
        router.push("/");
        return;
      }
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Terjadi kesalahan. Coba lagi.");
    } catch {
      setError("Server tidak bisa dihubungi. Coba lagi.");
    }
    setPending(false);
  }

  return (
    <div className="relative w-full max-w-[400px]">
      <Link href="/" className="text-[30px] leading-none font-bold italic tracking-[-0.05em]">
        <span className="text-red">GP</span>ID
        <span className="font-light text-white/55">26</span>
      </Link>

      <h1 className="mt-10 text-[clamp(40px,6vw,56px)] leading-none font-medium tracking-[-0.04em]">
        {text.title}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-1.5 text-[13px] text-white/70">
          Username
          <input name="username" required autoComplete="username" autoCapitalize="none" className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-[13px] text-white/70">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 cursor-pointer rounded-md bg-white px-[18px] py-3 text-sm font-medium text-[#111] transition-opacity disabled:cursor-default disabled:opacity-60"
        >
          {pending ? "Memproses…" : text.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/60">
        {text.switchText}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="cursor-pointer text-yellow"
        >
          {text.switchLabel}
        </button>
      </p>
    </div>
  );
}
