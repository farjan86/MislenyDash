"use client";

import { useEffect, useState } from "react";

type Match = {
  id: string;
  date: string | null;
  home: string | null;
  away: string | null;
  homeScore: string | null;
  awayScore: string | null;
  round: number | null;
};
type Data = { ok: boolean; next: Match | null; last: Match[] };

const OFFICIAL = "https://www.kozarmislenyse.hu/";
const isMisleny = (t: string | null) => !!t && /misleny/i.test(t);

// A tabella nem szerepel a scrape-elt HTML-ben (külön, aláírt feedből töltődik),
// ezért a legutóbbi végeredmény tényként, statikusan szerepel — ez már nem változik.
const LAST_SEASON = { season: "2025/26", league: "NB I", rank: 13, note: "kiesett" };
const CURRENT = { season: "2026/27", league: "NB I/B" };

function fmtDate(iso: string | null, withTime = true): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
    weekday: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function outcome(m: Match): "w" | "d" | "l" | "" {
  const hs = Number(m.homeScore), as = Number(m.awayScore);
  if (m.homeScore == null || m.awayScore == null || isNaN(hs) || isNaN(as)) return "";
  const misHome = isMisleny(m.home);
  const mis = misHome ? hs : as;
  const opp = misHome ? as : hs;
  return mis > opp ? "w" : mis === opp ? "d" : "l";
}

function Team({ name }: { name: string | null }) {
  // A Flashscore a női csapatnevekhez " N" végződést tesz — ezt levágjuk.
  const disp = name ? name.replace(/\s+N$/, "") : name;
  return <span className={isMisleny(name) ? "fb-home" : ""}>{disp ?? "?"}</span>;
}

// Statikus infó, ha a scrape nem ad élő adatot (nincs hivatalos API).
function StaticInfo() {
  return (
    <div className="sport-static">
      <p>
        Női kézilabdacsapat. Élő eredményhez nincs hivatalos adat-API, ezért az
        adatok külső oldalról, best-effort módon töltődnek — épp nincs elérhető
        friss mérkőzés (nyári holtszezon).
      </p>
      <a className="btn ghost" href={OFFICIAL} target="_blank" rel="noreferrer">
        🔗 Hivatalos oldal
      </a>
    </div>
  );
}

export default function HandballCard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/handball")
      .then((r) => r.json())
      .then((d: Data) => setData(d))
      .catch(() => setError(true));
  }, []);

  const hasLive = !!data && (data.next != null || data.last?.length > 0);

  return (
    <div className="card accent-brick">
      <div className="card-head">
        <div className="title">
          <span className="ico">🤾</span>
          <h3>Kozármisleny KA</h3>
        </div>
        <span className="updated">Női kézilabda</span>
      </div>

      {!error && !data && <p className="state">Betöltés…</p>}

      {(error || (data && !hasLive)) && <StaticInfo />}

      {hasLive && (
        <div className="fb">
          {data!.next && (
            <div className="fb-block">
              <div className="fb-lbl">Következő meccs</div>
              <div className="fb-teams">
                <Team name={data!.next.home} /> <span className="fb-vs">–</span>{" "}
                <Team name={data!.next.away} />
              </div>
              <div className="fb-meta">
                {fmtDate(data!.next.date)}
                {data!.next.round ? ` · ${data!.next.round}. forduló` : ""}
              </div>
            </div>
          )}

          {data!.last?.length > 0 && (
            <div className="fb-block">
              <div className="fb-lbl">Legutóbbi eredmények</div>
              <div className="fb-results">
                {data!.last.map((m) => (
                  <div className="fb-res" key={m.id}>
                    <span className={"fb-oc oc-" + (outcome(m) || "x")}>
                      {outcome(m) === "w" ? "GY" : outcome(m) === "d" ? "D" : outcome(m) === "l" ? "V" : "–"}
                    </span>
                    <span className="fb-res-t">
                      <Team name={m.home} /> {m.homeScore}–{m.awayScore}{" "}
                      <Team name={m.away} />
                    </span>
                    <span className="fb-res-d">{fmtDate(m.date, false)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(error || data) && (
        <div className="fb-standing hb-season">
          <span className="fb-rank">{LAST_SEASON.rank}.</span>
          <span>
            {LAST_SEASON.season} · {LAST_SEASON.league} — <b>{LAST_SEASON.note}</b>
          </span>
          <span className="fb-season">
            {CURRENT.season}: {CURRENT.league}
          </span>
        </div>
      )}
    </div>
  );
}
