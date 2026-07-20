"use client";

import { useEffect, useState } from "react";

type Alert = {
  event: string;
  desc: string;
  level: number;
  color: string;
  icon: string;
  typeLabel: string;
  from: string | null;
  to: string | null;
  upcoming: boolean;
};
type Data = { ok: boolean; region: string; alerts: Alert[] };

function fmt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("hu-HU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function WeatherAlertCard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather-alerts")
      .then((r) => r.json())
      .then((d: Data) => setData(d))
      .catch(() => setError(true));
  }, []);

  const alerts = data?.alerts ?? [];

  return (
    <div className="card accent-amber">
      <div className="card-head">
        <div className="title">
          <span className="ico">⚠️</span>
          <h3>Meteorológiai riasztás</h3>
        </div>
        <span className="updated">HungaroMet · {data?.region ?? "Baranya"}</span>
      </div>

      {!error && !data && <p className="state">Betöltés…</p>}
      {error && <p className="state err">Nem sikerült lekérni a figyelmeztetéseket.</p>}

      {data && alerts.length === 0 && (
        <p className="outage-note">
          ✅ Jelenleg <b>nincs</b> érvényes meteorológiai figyelmeztetés Baranyára.
        </p>
      )}

      {alerts.length > 0 && (
        <div className="wa-list">
          {alerts.map((a, i) => (
            <div className={"wa-item wa-" + a.color} key={i}>
              <div className="wa-top">
                <span className="wa-badge">
                  {a.icon} {cap(a.event)}
                </span>
                {a.upcoming && <span className="wa-soon">Várható</span>}
              </div>
              {(a.from || a.to) && (
                <div className="wa-time">
                  {fmt(a.from)}
                  {a.to ? ` – ${fmt(a.to)}` : ""}
                </div>
              )}
              {a.desc && <div className="wa-desc">{a.desc}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
