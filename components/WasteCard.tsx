"use client";

import { useEffect, useState } from "react";
import waste from "@/data/waste-2026.json";
import { useNow } from "@/lib/useNow";
import { nextDate, nextWeekday, daysUntil, relativeHu, fmtDateHu, type WasteType } from "@/lib/waste";
import WasteCalendar from "./WasteCalendar";

const TYPE_ORDER = ["szelektiv", "zold"] as const;
const vegyes = waste.vegyes;

type Row = {
  key: string;
  label: string;
  icon: string;
  iso: string;
  days: number;
  weekly?: string;
};

export default function WasteCard() {
  const now = useNow();
  const types = waste.types as Record<string, WasteType>;

  const rows: Row[] | null =
    now &&
    [
      // A vegyes (kommunális) hetente, minden kedden — mindig elöl.
      {
        key: "vegyes",
        label: vegyes.label,
        icon: vegyes.icon,
        iso: nextWeekday(vegyes.weekday, now),
        weekly: `minden ${vegyes.weekdayLabel}`,
      },
      ...TYPE_ORDER.map((key) => {
        const t = types[key];
        const iso = nextDate(t.dates, now);
        return iso ? { key, label: t.label, icon: t.icon, iso } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    ].map((r) => ({ ...r, days: daysUntil(r.iso, now) }));

  const tomorrow = rows && rows.find((r) => r.days === 1);

  return (
    <div className="card accent-amber">
      <div className="card-head">
        <div className="title">
          <span className="ico">🗑️</span>
          <h3>Hulladéknaptár</h3>
        </div>
        <span className="updated">2026 · Dél-Kom</span>
      </div>

      {tomorrow && (
        <div className="waste-alert">
          {tomorrow.icon} Holnap <b>{tomorrow.label.toLowerCase()}</b> — húzd ki a kukát!
        </div>
      )}

      <div className="waste-body">
        <div className="waste-left">
          {!now && <p className="state">Betöltés…</p>}
          {rows && (
            <div className="waste-next">
              {rows.map((r) => (
                <div className={"wn" + (r.days <= 1 ? " soon" : "")} key={r.key}>
                  <span className="wi">{r.icon}</span>
                  <div>
                    <div className="wl">
                      {r.label}
                      {r.weekly && <span className="wtag">{r.weekly}</span>}
                    </div>
                    <div className="wd">{fmtDateHu(r.iso)}</div>
                  </div>
                  <div className="wcount">
                    <div className="big">{r.days === 0 ? "Ma" : r.days}</div>
                    <div className="u">
                      {r.days > 1 ? "nap múlva" : relativeHu(r.days) === "Holnap" ? "holnap" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="linkrow">
            <SubscribeButton />
          </div>

          <details className="kuka-help">
            <summary>ℹ️ Hogyan kapok emlékeztetőt a telefonomra?</summary>
            <div className="kuka-help-body">
              <ol>
                <li>
                  Nyisd meg ezt az oldalt a <b>telefonodon</b> (ne gépen).
                </li>
                <li>
                  Koppints a <b>🔔 Feliratkozás</b> gombra.
                </li>
                <li>
                  A telefonod Naptára megkérdezi, hozzáadja-e — nyomj <b>Igen</b>-t.
                </li>
              </ol>
              <p className="kuka-help-what">
                Ezután <b>nem kell semmit csinálnod</b>: minden szállítás{" "}
                <b>előző estéjén 18:00-kor</b> szól a telefonod — „Holnap kukanap,
                húzd ki a kukát!" Ha új dátum jön, <b>magától frissül</b>.
              </p>
              <p className="kuka-help-note">
                A gombot a <b>telefonon</b> nyomd meg — különben a gép naptárába
                kerül. (Kivéve, ha telefonon és gépen ugyanaz a Google-fiókod.)
              </p>
            </div>
          </details>
        </div>

        <div className="waste-right">
          <WasteCalendar />
        </div>
      </div>
    </div>
  );
}

function SubscribeButton() {
  // A webcal-cím csak a kliensen áll össze (mount után), hogy ne legyen hydration-eltérés.
  const [host, setHost] = useState("");
  useEffect(() => setHost(window.location.host), []);
  if (!host) return null;
  return (
    <a className="btn ghost" href={`webcal://${host}/api/kuka.ics`}>
      🔔 Feliratkozás
    </a>
  );
}
