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
              <p className="kuka-help-os">🍎 iPhone</p>
              <ol>
                <li>
                  Nyisd meg ezt az oldalt a <b>telefonodon</b>, és koppints a{" "}
                  <b>🔔 Feliratkozás</b> gombra.
                </li>
                <li>
                  A Naptár megkérdezi, hozzáadja-e — nyomj <b>Igen</b>-t.
                </li>
              </ol>
              <p className="kuka-help-what">
                Ezután <b>nem kell semmit csinálnod</b>: minden szállítás{" "}
                <b>előző estéjén 18:00-kor</b> szól a telefonod — „Holnap kukanap,
                húzd ki a kukát!" Ha új dátum jön, <b>magától frissül</b>.
              </p>

              <p className="kuka-help-os">🤖 Android</p>
              <ol>
                <li>
                  Koppints a <b>🔔 Hozzáadás a naptárhoz</b> gombra — letölt egy kis
                  naptárfájlt.
                </li>
                <li>
                  Nyisd meg a letöltött fájlt (<b>Megnyitás</b>), válaszd a{" "}
                  <b>Naptár</b> alkalmazást, majd add hozzá az eseményeket.
                </li>
              </ol>
              <p className="kuka-help-note">
                Így az idei év összes időpontja egyszerre bekerül a naptáradba.
                Ha nem szólna előző este: a Naptár beállításaiban kapcsold be az{" "}
                <b>egész napos események értesítését</b> (előző nap 18:00).
              </p>
              <p className="kuka-help-note">
                <b>Magától frissülő változat (Google Naptár):</b> koppints a{" "}
                <b>🔗 Naptárlink másolása</b> gombra, majd böngészőben (legjobb gépen)
                nyisd meg a <b>calendar.google.com</b> oldalt → <b>Egyéb naptárak +</b>{" "}
                → <b>URL-ből</b> → illeszd be. Pár perc múlva a telefonod Naptárában
                is megjelenik.
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
  // A címek csak a kliensen állnak össze (mount után), hogy ne legyen hydration-eltérés.
  const [env, setEnv] = useState<{ host: string; origin: string; android: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(
    () =>
      setEnv({
        host: window.location.host,
        origin: window.location.origin,
        android: /Android/i.test(navigator.userAgent),
      }),
    []
  );
  if (!env) return null;

  // iPhone / Mac / asztali gép: a webcal:// linket a rendszer naptára kezeli.
  if (!env.android) {
    return (
      <a className="btn ghost" href={`webcal://${env.host}/api/kuka.ics`}>
        🔔 Feliratkozás
      </a>
    );
  }

  // Android: a webcal:// sémát semmi nem kezeli (a Chrome nem csinál semmit),
  // a Google Naptár app pedig nem tud URL-re feliratkozni. Ezért itt a naptárfájlt
  // adjuk oda https-en (ezt megnyitja a Naptár), mellé a feed címét másolhatóan.
  const feedUrl = `${env.origin}/api/kuka.ics`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
    } catch {
      window.prompt("Másold ki a naptár címét:", feedUrl);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <>
      <a className="btn ghost" href="/api/kuka.ics" download="kozarmisleny-hulladek.ics">
        🔔 Hozzáadás a naptárhoz
      </a>
      <button type="button" className="btn ghost" onClick={copy}>
        {copied ? "✓ Kimásolva" : "🔗 Naptárlink másolása"}
      </button>
    </>
  );
}
