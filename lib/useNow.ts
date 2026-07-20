"use client";

import { useEffect, useState } from "react";

// A pontos időt csak a kliensen (mount után) állítjuk be, hogy ne legyen
// hydration-eltérés. Percenként frissül, így a "most nyitva" élő marad.
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
