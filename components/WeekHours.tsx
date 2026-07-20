"use client";

import { useNow } from "@/lib/useNow";
import { weekly, todayKey, type Hours } from "@/lib/hours";

// Heti nyitvatartás-csík; a mai nap kiemelve. (Ugyanaz a vizuális nyelv,
// mint az időjárás 7 napos sávja.)
export default function WeekHours({ hours }: { hours: Hours }) {
  const now = useNow();
  const days = weekly(hours);
  const tk = now ? todayKey(now) : null;

  return (
    <div className="wh">
      {days.map((d) => (
        <div className={"wh-d" + (d.key === tk ? " today" : "")} key={d.key}>
          <span className="wh-day">{d.short}</span>
          {d.parts.length ? (
            d.parts.map((p, i) => (
              <span className="wh-hrs" key={i}>
                {p}
              </span>
            ))
          ) : (
            <span className="wh-hrs off">—</span>
          )}
        </div>
      ))}
    </div>
  );
}
