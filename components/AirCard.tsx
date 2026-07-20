"use client";

import { useEffect, useState } from "react";

const LAT = 46.045;
const LON = 18.272;
const API =
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
  `&current=european_aqi,pm10,pm2_5,grass_pollen,ragweed_pollen&timezone=Europe%2FBudapest`;

const timeFmt = new Intl.DateTimeFormat("hu-HU", { hour: "2-digit", minute: "2-digit" });

// Európai levegőminőségi index (EAQI) sávjai
function aqiCat(v: number) {
  if (v <= 20) return { label: "Kiváló", cls: "aqi-1" };
  if (v <= 40) return { label: "Jó", cls: "aqi-2" };
  if (v <= 60) return { label: "Mérsékelt", cls: "aqi-3" };
  if (v <= 80) return { label: "Gyenge", cls: "aqi-4" };
  if (v <= 100) return { label: "Rossz", cls: "aqi-5" };
  return { label: "Nagyon rossz", cls: "aqi-6" };
}

// Pollenszint (grains/m³) — a parlagfű alacsonyabb küszöbön is erős allergén
function pollenCat(v: number, ragweed = false) {
  const mid = ragweed ? 10 : 30;
  const hi = ragweed ? 30 : 70;
  if (v <= 0.1) return { label: "nincs", lvl: 0 };
  if (v < mid) return { label: "alacsony", lvl: 1 };
  if (v < hi) return { label: "közepes", lvl: 2 };
  return { label: "magas", lvl: 3 };
}

type Air = {
  current: {
    european_aqi: number;
    pm10: number;
    pm2_5: number;
    grass_pollen: number;
    ragweed_pollen: number;
  };
};

export default function AirCard() {
  const [data, setData] = useState<Air | null>(null);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((j: Air) => {
        setData(j);
        setUpdated(timeFmt.format(new Date()));
      })
      .catch(() => setError(true));
  }, []);

  const c = data && data.current;
  const aqi = c && aqiCat(c.european_aqi);
  const grass = c && pollenCat(c.grass_pollen);
  const ragweed = c && pollenCat(c.ragweed_pollen, true);

  return (
    <div className="card">
      <div className="card-head">
        <div className="title">
          <span className="ico">🌬️</span>
          <h3>Levegő &amp; pollen</h3>
        </div>
        {updated && <span className="updated">Frissítve {updated}</span>}
      </div>

      {error && <p className="state err">Nem sikerült betölteni a levegő adatait.</p>}
      {!error && !data && <p className="state">Betöltés…</p>}

      {c && aqi && grass && ragweed && (
        <>
          <div className="aqi-now">
            <div className={"aqi-val " + aqi.cls}>{Math.round(c.european_aqi)}</div>
            <div>
              <div className={"aqi-label " + aqi.cls}>{aqi.label}</div>
              <div className="aqi-sub">levegőminőség (EAQI)</div>
            </div>
          </div>
          <div className="wx-meta">
            <span>
              PM10 <b>{Math.round(c.pm10)}</b>
            </span>
            <span>
              PM2.5 <b>{Math.round(c.pm2_5)}</b>
            </span>
            <span className="muted">µg/m³</span>
          </div>

          <div className="pollen">
            <div className="pl-row">
              <span className="pl-name">🌾 Fűpollen</span>
              <span className={"pl-lvl lvl-" + grass.lvl}>{grass.label}</span>
              <span className="pl-val">{c.grass_pollen} g/m³</span>
            </div>
            <div className="pl-row">
              <span className="pl-name">🥀 Parlagfű</span>
              <span className={"pl-lvl lvl-" + ragweed.lvl}>{ragweed.label}</span>
              <span className="pl-val">{c.ragweed_pollen} g/m³</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
