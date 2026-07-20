"use client";

import { useState } from "react";
import waste from "@/data/waste-2026.json";
import { useNow } from "@/lib/useNow";
import { ymd } from "@/lib/waste";

const MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];
const WD = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

const SZEL = new Set(waste.types.szelektiv.dates);
const ZOLD = new Set(waste.types.zold.dates);
const LOM = new Set(waste.lomtalanitas.map((l) => l.date));

export default function WasteCalendar() {
  const now = useNow();
  const [delta, setDelta] = useState(0);

  if (!now) return <div className="wcal-ph" aria-hidden />;

  const YEAR = waste.year;
  const base = now.getFullYear() === YEAR ? now.getMonth() : 0;
  const m = Math.max(0, Math.min(11, base + delta));
  const todayIso = ymd(now);

  const daysInMonth = new Date(YEAR, m + 1, 0).getDate();
  const startPad = (new Date(YEAR, m, 1).getDay() + 6) % 7; // hétfő az első

  const iso = (d: number) =>
    `${YEAR}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="wcal">
      <div className="wcal-head">
        <button
          className="wcal-nav"
          onClick={() => setDelta((x) => x - 1)}
          disabled={m === 0}
          aria-label="Előző hónap"
        >
          ‹
        </button>
        <span className="wcal-title">
          {MONTHS[m]} {YEAR}
        </span>
        <button
          className="wcal-nav"
          onClick={() => setDelta((x) => x + 1)}
          disabled={m === 11}
          aria-label="Következő hónap"
        >
          ›
        </button>
      </div>

      <div className="wcal-grid">
        {WD.map((w) => (
          <div className="wcal-wd" key={w}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div className="wcal-cell empty" key={"e" + i} />;
          const day = iso(d);
          const isToday = day === todayIso;
          const isTue = new Date(YEAR, m, d).getDay() === waste.vegyes.weekday;
          let type = "";
          if (SZEL.has(day)) type = "is-sz";
          else if (ZOLD.has(day)) type = "is-zo";
          else if (LOM.has(day)) type = "is-lo";
          else if (isTue) type = "is-ve"; // vegyes: minden kedd
          return (
            <div
              className={"wcal-cell " + type + (isToday ? " today" : "")}
              key={day}
            >
              <span className="wcal-num">{d}</span>
            </div>
          );
        })}
      </div>

      <div className="wcal-legend">
        <span>
          <span className="wsw ve" /> Vegyes (kedd)
        </span>
        <span>
          <span className="wsw sz" /> Szelektív
        </span>
        <span>
          <span className="wsw zo" /> Zöld
        </span>
        <span>
          <span className="wsw lo" /> Lomtalanítás
        </span>
      </div>
    </div>
  );
}
