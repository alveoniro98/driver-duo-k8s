"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["Biografi", "#biografi"],
  ["Statistik", "#statistik"],
  ["Karier", "#karier"],
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUsername(data.username ?? null))
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsername(null);
  }

  return (
    <header className="relative z-20 flex items-center justify-between gap-6 px-5 py-7 md:px-10">
      <div className="text-[30px] leading-none font-bold italic tracking-[-0.05em]">
        <span className="text-red">GP</span>ID
        <span className="font-light text-white/55">26</span>
      </div>

      <nav className="hidden gap-14 text-[15px] md:flex">
        {links.map(([label, href]) => (
          <a key={href} href={href} className="text-white/75 transition-colors hover:text-yellow">
            {label}
          </a>
        ))}
      </nav>

      <div className="relative flex items-center gap-2.5">
        {username ? (
          <>
            <span className="hidden text-sm text-white/75 sm:inline">Halo, {username}</span>
            <button type="button" onClick={logout} className="flex items-center gap-2 rounded-md bg-white px-[18px] py-[11px] text-sm font-medium text-[#111] cursor-pointer">
          <span className="inline-flex size-4 items-center justify-center rounded-full border-[1.5px] border-[#111] text-[9px]">
            ➜
          </span>
              Keluar
            </button>
          </>
        ) : (
          <Link href="/masuk" className="flex items-center gap-2 rounded-md bg-white px-[18px] py-[11px] text-sm font-medium text-[#111]">
          <span className="inline-flex size-4 items-center justify-center rounded-full border-[1.5px] border-[#111] text-[9px]">
            ➜
          </span>
            Masuk
          </Link>
        )}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-[42px] cursor-pointer flex-col items-center justify-center gap-[5px] rounded-md bg-white/12"
        >
          <span className="block h-[1.5px] w-4 bg-white" />
          <span className="block h-[1.5px] w-4 bg-white" />
        </button>

        {menuOpen && (
          <nav className="absolute top-full right-0 mt-2 flex min-w-40 flex-col rounded-md bg-base/95 p-2 text-[15px] ring-1 ring-white/12 backdrop-blur">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2 text-white/75 transition-colors hover:text-yellow"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
