"use client";

import { useEffect, useState } from "react";

type OutageItem = {
  type: "áram" | "gáz" | "víz";
  streets: string[];
  from: string | null;
  to: string | null;
  status: string | null;
  consumers: number | null;
  description: string | null;
};

const ICON = { áram: "⚡", gáz: "🔥", víz: "💧" } as const;
const BADGE = { áram: "closed", gáz: "warn", víz: "info" } as const;

type NewsItem = { title: string; url: string; date: string | null; source: string };
// Hír-cím, ami közmű-kimaradásra utal. Az áram/gáz/víz kulcsszavak tágak; az
// internet/hálózat/szolgáltatás csak kimaradás-szóval együtt számít (kevesebb téves találat).
const OUTAGE_RE =
  /(áramszünet|áram.?kimaradás|üzemszünet|üzemzavar|gázszünet|gáz.?szünet|vízhiány|vízkorlát|vízszünet|szennyvíz|(?:internet|hálózat|szolgáltatás).?(?:kimaradás|szünet|hiba|leállás|zavar))/i;

// Helyi közmű-szolgáltatók (a felhasználó helyi tudása alapján: víz = DRV, szennyvíz = Tettye).
const PROVIDERS: {
  icon: string;
  label: string;
  name: string;
  href: string;
  tel?: string;
  telLabel?: string;
}[] = [
  {
    icon: "⚡",
    label: "Áram",
    name: "E.ON",
    href: "https://www.eon.hu/hu/lakossagi/elerhetosegek/bejelentesek/hibabejelentes/hibabejelentes-aram.html",
    tel: "+3680205020",
    telLabel: "80/205-020",
  },
  {
    icon: "🔥",
    label: "Gáz",
    name: "E.ON",
    href: "https://www.eon.hu/hu/lakossagi/elerhetosegek/bejelentesek/hibabejelentes/hibabejelentes-foldgaz.html",
    tel: "+3680424242",
    telLabel: "80/424-242",
  },
  {
    icon: "💧",
    label: "Ivóvíz",
    name: "DRV Zrt.",
    href: "https://www.drv.hu/vizhiannyal-jaro-hibaelharitasok",
    tel: "+3684240240",
    telLabel: "84/240-240",
  },
  {
    icon: "🚿",
    label: "Szennyvíz",
    name: "Tettye Forráshaz",
    href: "https://www.tettyeforrashaz.hu/hibabejelentes",
    tel: "+3672421799",
    telLabel: "72/421-799",
  },
];

export default function OutageCard() {
  const [items, setItems] = useState<OutageItem[] | null>(null);
  const [error, setError] = useState(false);
  const [announcements, setAnnouncements] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/api/outages")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: { ok: boolean; items: OutageItem[] }) => {
        if (!d.ok) throw new Error();
        setItems(d.items);
      })
      .catch(() => setError(true));

    // Második forrás: a helyi hírek közt keresünk kimaradás-bejelentést.
    fetch("/api/news")
      .then((r) => r.json())
      .then((d: { local?: NewsItem[]; county?: NewsItem[] }) => {
        const all = [...(d.local ?? []), ...(d.county ?? [])];
        setAnnouncements(all.filter((i) => OUTAGE_RE.test(i.title)));
      })
      .catch(() => setAnnouncements([]));
  }, []);

  return (
    <div className="card accent-brick">
      <div className="card-head">
        <div className="title">
          <span className="ico">⚡</span>
          <h3>Áram- / gázszünet</h3>
        </div>
        <span className="updated">E.ON</span>
      </div>

      <div className="outage-body">
      {error && <p className="state err">Nem sikerült lekérni az E.ON adatait.</p>}
      {!error && !items && <p className="state">Betöltés…</p>}

      {items && items.length === 0 && (
        <p className="outage-note">
          ✅ Jelenleg <b>nincs</b> ismert tervezett áram-, gáz- vagy vízszünet
          Kozármislenyen.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="outage-list">
          {items.map((o, i) => (
            <div className="outage-item" key={i}>
              <div className="oi-head">
                <span className={"badge " + BADGE[o.type]}>
                  {ICON[o.type]} {o.type}
                </span>
                {o.consumers != null && (
                  <span className="oi-cons">{o.consumers} fogyasztó</span>
                )}
              </div>
              {o.streets.length > 0 && (
                <div className="oi-streets">{o.streets.join(", ")}</div>
              )}
              {(o.from || o.to) && (
                <div className="oi-time">
                  {o.to ? `${o.from ?? "?"} – ${o.to}` : o.from}
                </div>
              )}
              {o.description && <div className="oi-desc">{o.description}</div>}
            </div>
          ))}
        </div>
      )}

      {announcements.length > 0 && (
        <div className="outage-ann">
          <div className="oa-head">📢 Bejelentések a helyi hírekben</div>
          {announcements.map((a) => (
            <a
              className="oa-item"
              href={a.url}
              target="_blank"
              rel="noreferrer"
              key={a.url}
            >
              {a.title}
            </a>
          ))}
        </div>
      )}

      <div className="util-providers">
        <div className="up-head">📇 Közmű-szolgáltatók</div>
        {PROVIDERS.map((p) => (
          <div className="up-row" key={p.label}>
            <span className="up-ico">{p.icon}</span>
            <span className="up-label">{p.label}</span>
            <a className="up-name" href={p.href} target="_blank" rel="noreferrer">
              {p.name} →
            </a>
            {p.tel && (
              <a
                className="up-tel"
                href={"tel:" + p.tel}
                title={`${p.name} hibabejelentő: ${p.telLabel ?? p.tel}`}
                aria-label={`${p.name} hibabejelentő telefonszám: ${p.telLabel ?? p.tel}`}
              >
                📞 {p.telLabel ?? p.tel}
              </a>
            )}
          </div>
        ))}
        <p className="up-note">
          🌐 Internet: szolgáltatófüggő (Telekom / DIGI / One) — kimaradást a
          szolgáltató hibabejelentőjén; ha helyi hír szól róla, lent megjelenik.
          A víz/szennyvíz üzemszünetet a szolgáltatók jellemzően csak helyben
          (plakát, Facebook), 3 nappal előre hirdetik — élő adatforrás nincs.
        </p>
      </div>
      </div>
    </div>
  );
}
