"use client";

import { useEffect, useState } from "react";

type Match = {
  date: string | null;
  home: string | null;
  away: string | null;
  homeScore: string | null;
  awayScore: string | null;
  venue: string | null;
  round: number | null;
};
type Standing = { rank: number; points: number; played: number; season: string };
type Data = { ok: boolean; next: Match | null; last: Match[]; standing: Standing | null };

const isMisleny = (t: string | null) => !!t && /misleny/i.test(t);

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

// Eredmény Kozármisleny-nézőpontból: Gy/D/V
function outcome(m: Match): "w" | "d" | "l" | "" {
  const hs = Number(m.homeScore), as = Number(m.awayScore);
  if (m.homeScore == null || m.awayScore == null || isNaN(hs) || isNaN(as)) return "";
  const misHome = isMisleny(m.home);
  const mis = misHome ? hs : as;
  const opp = misHome ? as : hs;
  return mis > opp ? "w" : mis === opp ? "d" : "l";
}

function Team({ name }: { name: string | null }) {
  return <span className={isMisleny(name) ? "fb-home" : ""}>{name ?? "?"}</span>;
}

export default function FootballCard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/football")
      .then((r) => r.json())
      .then((d: Data) => {
        if (!d.ok) throw new Error();
        setData(d);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <div className="card accent-green">
      <div className="card-head">
        <div className="title">
          <span className="ico">⚽</span>
          <h3>SE Kozármisleny</h3>
        </div>
        <span className="updated">NB II</span>
      </div>

      {error && <p className="state err">Nem sikerült betölteni az adatokat.</p>}
      {!error && !data && <p className="state">Betöltés…</p>}

      {data && (
        <div className="fb">
          {data.next && (
            <div className="fb-block">
              <div className="fb-lbl">Következő meccs</div>
              <div className="fb-teams">
                <Team name={data.next.home} /> <span className="fb-vs">–</span>{" "}
                <Team name={data.next.away} />
              </div>
              <div className="fb-meta">
                {fmtDate(data.next.date)}
                {data.next.round ? ` · ${data.next.round}. forduló` : ""}
              </div>
            </div>
          )}

          {data.last?.length > 0 && (
            <div className="fb-block">
              <div className="fb-lbl">Legutóbbi eredmények</div>
              <div className="fb-results">
                {data.last.map((m, i) => (
                  <div className="fb-res" key={i}>
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

          {data.standing && (
            <div className="fb-standing">
              <span className="fb-rank">{data.standing.rank}.</span>
              <span>
                a tabellán · <b>{data.standing.points}</b> pont /{" "}
                {data.standing.played} meccs
              </span>
              <span className="fb-season">{data.standing.season}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
