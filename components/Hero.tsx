/* eslint-disable @next/next/no-img-element */
import { driverIds, drivers, type Driver, type DriverId } from "@/lib/drivers";
import Header from "./Header";
import TrackMap from "./TrackMap";

const pointColors = ["text-white/28", "text-white/50", "text-yellow"];

type Props = {
  driver: Driver;
  onSelect: (id: DriverId) => void;
};

export default function Hero({ driver, onSelect }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#1a0609_0%,#2b0a10_22%,#0c1116_48%,#0a2a36_78%,#0a3140_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_22%_20%,rgba(190,20,30,.55),transparent_70%),radial-gradient(ellipse_40%_40%_at_80%_90%,rgba(0,120,150,.35),transparent_70%)]" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] left-1/2 -translate-x-1/2 text-[min(52vw,520px)] leading-none font-semibold tracking-[-0.04em] text-white/[0.07] select-none"
      >
        {driver.number}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
        {driverIds.map((id) => (
          <img
            key={id}
            src={drivers[id].photo}
            alt={id === driver.id ? `${drivers[id].first} ${drivers[id].last}` : ""}
            className={`absolute bottom-0 h-[70%] w-auto max-w-full object-cover object-top drop-shadow-[0_0_60px_rgba(0,0,0,.6)] transition-opacity duration-[600ms] ease-in-out md:h-[88%] ${
              id === driver.id ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <Header />

      <div className="absolute top-[150px] left-5 max-w-[60%] md:left-10 md:max-w-[38%]">
        <div className="mb-4 flex items-center gap-2 text-[13px] text-white/70">
          Indonesia
          <span className="inline-block h-3 w-[18px] overflow-hidden rounded-[2px] bg-[linear-gradient(#e8192c_50%,#fff_50%)]" />
        </div>
        <h2 className="text-[clamp(34px,4.4vw,58px)] leading-[1.05] font-normal tracking-[-0.02em] text-pretty">
          {driver.city}
          <br />
          {driver.province}
        </h2>
      </div>

      <TrackMap track={driver.track} />

      <div className="absolute right-5 bottom-10 left-5 flex items-end justify-between gap-10 md:right-10 md:left-10">
        <div className="min-w-0">
          <div className="mb-[18px] flex items-center">
            <div className="flex size-[34px] items-center justify-center rounded-full border-2 border-base bg-red text-xs font-bold tracking-[-0.05em]">
              ID
            </div>
            {driverIds.map((id) => {
              const d = drivers[id];
              const isActive = id === driver.id;
              return (
                <button
                  key={id}
                  type="button"
                  title={`${d.first} ${d.last}`}
                  aria-label={`${d.first} ${d.last}`}
                  aria-pressed={isActive}
                  onClick={() => onSelect(id)}
                  style={{ backgroundImage: `url("${d.photo}")` }}
                  className={`-ml-2 size-[34px] cursor-pointer rounded-full border-2 bg-[#222] bg-[length:210%_auto] bg-[position:center_22%] bg-no-repeat p-0 transition-transform duration-200 ${
                    isActive ? "z-10 scale-[1.08] border-yellow" : "border-base"
                  }`}
                />
              );
            })}
            <div className="ml-1 rounded-full bg-yellow px-4 py-[9px] text-[13px] leading-none font-semibold tracking-[0.01em] text-[#111]">
              Semua
            </div>
          </div>
          <h1 className="text-[clamp(48px,8.5vw,118px)] leading-[0.92] font-medium tracking-[-0.04em] text-balance">
            {driver.first}
            <br />
            {driver.last}
          </h1>
        </div>

        <div className="shrink-0 text-right">
          <div className="mb-3 flex items-center justify-end gap-2 text-[13px] text-white/70">
            Poin Musim
            <span className="inline-block size-4 rounded-full border-[1.5px] border-white/50" />
          </div>
          {driver.points.map((point, i) => (
            <div
              key={i}
              className={`text-[clamp(40px,6.4vw,90px)] leading-[0.9] font-medium tracking-[-0.04em] ${pointColors[i]}`}
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
