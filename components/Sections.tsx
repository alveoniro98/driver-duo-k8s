import type { ReactNode } from "react";
import type { Driver } from "@/lib/drivers";

type Props = { driver: Driver };

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[13px] tracking-[0.14em] text-red uppercase ${className}`}>{children}</div>
  );
}

export function Biografi({ driver }: Props) {
  const { bio } = driver;
  const facts = [
    ["Lahir", bio.lahir],
    ["Asal", bio.asal],
    ["Tim", bio.tim],
    ["Debut", bio.debut],
  ];

  return (
    <section
      id="biografi"
      className="grid gap-12 border-t border-white/8 bg-base px-5 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:px-10"
    >
      <div>
        <Eyebrow className="mb-4">Biografi</Eyebrow>
        <h2 className="text-[clamp(32px,4vw,52px)] leading-none font-medium tracking-[-0.03em]">
          {driver.first} {driver.last}
        </h2>
      </div>
      <div className="grid gap-10">
        <p className="max-w-[720px] text-[clamp(18px,1.6vw,22px)] leading-normal font-light text-pretty text-white/85">
          {bio.text}
        </p>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-6 border-t border-white/12 pt-6">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1.5 text-xs text-white/50">{label}</dt>
              <dd className="text-base">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="mb-1.5 text-xs text-white/50">Nomor</dt>
            <dd className="text-base text-yellow">#{driver.number}</dd>
          </div>
          <div className="col-span-full">
            <dt className="mb-1.5 text-xs text-white/50">Kendaraan</dt>
            <dd className="text-base">{bio.kendaraan}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function Statistik({ driver }: Props) {
  return (
    <section
      id="statistik"
      className="border-t border-white/8 bg-[linear-gradient(180deg,#0b0d12,#0a1a22)] px-5 py-24 md:px-10"
    >
      <Eyebrow className="mb-10">Statistik Karier</Eyebrow>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
        {driver.stats.map(([label, value]) => (
          <div key={label} className="border-t-2 border-white/15 pt-5">
            <div className="text-[clamp(48px,6vw,88px)] leading-[0.95] font-medium tracking-[-0.04em]">
              {value}
            </div>
            <div className="mt-2.5 text-sm text-white/60">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Karier({ driver }: Props) {
  return (
    <section id="karier" className="border-t border-white/8 bg-deep px-5 pt-24 pb-[120px] md:px-10">
      <Eyebrow className="mb-10">Karier</Eyebrow>
      <div className="grid max-w-[960px]">
        {driver.karier.map(([tahun, tim, catatan]) => (
          <div
            key={tahun}
            className="grid grid-cols-[120px_minmax(0,1fr)] items-baseline gap-6 border-t border-white/12 py-7"
          >
            <div className="text-lg font-medium text-yellow">{tahun}</div>
            <div>
              <div className="text-[22px] font-medium tracking-[-0.01em]">{tim}</div>
              <div className="mt-1.5 text-[15px] text-pretty text-white/60">{catatan}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
