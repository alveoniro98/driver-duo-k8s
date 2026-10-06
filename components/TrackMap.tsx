import type { Driver } from "@/lib/drivers";

export default function TrackMap({ track }: { track: Driver["track"] }) {
  const { path, pin, nodes } = track;

  return (
    <svg
      viewBox="0 0 240 190"
      aria-hidden="true"
      className="absolute right-5 top-[130px] h-auto w-[min(24vw,240px)] fill-none stroke-white stroke-[2.5] [stroke-linejoin:round] md:right-10"
    >
      <path d={path} opacity=".9" />
      <circle
        cx={pin.x}
        cy={pin.y}
        r="14"
        className="animate-pin fill-red/35 stroke-none [transform-box:fill-box] [transform-origin:center] motion-reduce:animate-none"
      />
      <circle cx={pin.x} cy={pin.y} r="5" className="fill-red stroke-none" />
      {nodes.map((n) => (
        <circle key={`${n.x}-${n.y}`} cx={n.x} cy={n.y} r="4.5" className="fill-white stroke-none" />
      ))}
    </svg>
  );
}
