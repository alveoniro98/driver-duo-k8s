"use client";

import { useEffect, useState } from "react";
import { driverIds, drivers, type DriverId } from "@/lib/drivers";
import Hero from "./Hero";
import { Biografi, Karier, Statistik } from "./Sections";

const ROTATE_INTERVAL_MS = 5000;

type Props = {
  defaultDriver?: DriverId;
  autoRotate?: boolean;
};

export default function DriverProfile({
  defaultDriver = "yassir",
  autoRotate = false,
}: Props) {
  const [active, setActive] = useState<DriverId>(defaultDriver);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setActive((id) => driverIds[(driverIds.indexOf(id) + 1) % driverIds.length]);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const driver = drivers[active];

  return (
    <main>
      <Hero driver={driver} onSelect={setActive} />
      <Biografi driver={driver} />
      <Statistik driver={driver} />
      <Karier driver={driver} />
    </main>
  );
}
