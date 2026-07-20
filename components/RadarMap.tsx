"use client";

import { useEffect, useRef, useState } from "react";

const OVERLAYS: { key: string; label: string }[] = [
  { key: "radar", label: "Csapadékradar" },
  { key: "satellite", label: "Műhold" },
  { key: "clouds", label: "Felhőzet" },
  { key: "wind", label: "Szél" },
  { key: "temp", label: "Hőmérséklet" },
  { key: "rainAccu", label: "Csapadékösszeg" },
];

function src(overlay: string) {
  return (
    "https://embed.windy.com/embed2.html?lat=46.045&lon=18.272" +
    "&detailLat=46.045&detailLon=18.272&zoom=10&level=surface" +
    `&overlay=${overlay}` +
    "&menu=&message=&marker=true&calendar=&pressure=&type=map&location=coordinates" +
    "&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
  );
}

export default function RadarMap() {
  const [overlay, setOverlay] = useState("radar");

  // A Windy egy külső (cross-origin) iframe, ezért a szülő oldal nem tudja
  // elkapni a fölötte történő görgetést/kattintást. Egy átlátszó „pajzs" fedi a
  // térképet: alaphelyzetben elnyeli az egeret (az oldal simán görgethető).
  // Kattintásra AKTIVÁL: onnantól minden működik (lejátszás, húzás, nagyítás),
  // és amint az egér elhagyja a térképet, magától visszaáll.
  const [active, setActive] = useState(false);
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
    };
  }, []);

  // Ha inaktív állapotban görget a térkép fölött, felvillan a súgó.
  function onShieldWheel() {
    setNudge(true);
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), 1400);
  }

  return (
    <div className="card radar-card">
      <div className="card-head">
        <div className="title">
          <span className="ico">🛰️</span>
          <h3>Időjárás-térkép</h3>
        </div>
        <span className="updated">Windy</span>
      </div>

      <div className="radar-tabs">
        {OVERLAYS.map((o) => (
          <button
            key={o.key}
            className={"rtab" + (overlay === o.key ? " on" : "")}
            onClick={() => setOverlay(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="radar-big" onMouseLeave={() => setActive(false)}>
        <iframe key={overlay} src={src(overlay)} title="Kozármisleny időjárás-térkép" loading="lazy" />
        {/* Pajzs: kattintásig blokkol (az oldal görgethető), utána átenged. */}
        {!active && (
          <button
            type="button"
            className="radar-shield"
            onClick={() => setActive(true)}
            onWheel={onShieldWheel}
            aria-label="Térkép aktiválása (lejátszás, nagyítás, mozgatás)"
          />
        )}
        <div className={"radar-hint" + (active ? " active" : "") + (nudge ? " nudge" : "")}>
          {active
            ? "✅ Aktív — az egeret elvéve az oldal újra görgethető"
            : "Kattints a térkép használatához (▶ lejátszás, nagyítás)"}
        </div>
      </div>
    </div>
  );
}
