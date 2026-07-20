"use client";

import { useNow } from "@/lib/useNow";
import waste from "@/data/waste-2026.json";
import { nextDate, daysUntil, relativeHu, type WasteType } from "@/lib/waste";

export default function TodayRibbon() {
  const now = useNow();

  // A ribbon időfüggő → mount-ig üres helyőrző (nincs hydration-eltérés).
  if (!now) return <div className="ribbon" aria-hidden />;

  const dateStr = now.toLocaleDateString("hu-HU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const types = waste.types as Record<string, WasteType>;
  const next = (["szelektiv", "zold"] as const)
    .map((k) => {
      const iso = nextDate(types[k].dates, now);
      return iso ? { t: types[k], iso, days: daysUntil(iso, now) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.days - b!.days)[0];

  return (
    <div className="ribbon">
      <span className="rb-cell rb-date">{dateStr}</span>
      {next && (
        <span className="rb-cell rb-waste">
          <span className="rb-ico">{next.t.icon}</span>
          Következő ürítés: <b>{next.t.label.toLowerCase()}</b>,{" "}
          {relativeHu(next.days).toLowerCase()}
        </span>
      )}
    </div>
  );
}
