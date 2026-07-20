"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  url: string;
  date: string | null;
  image: string | null;
  source: string;
};
type Data = { local: NewsItem[]; county: NewsItem[] };

function relative(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso);
  if (isNaN(then.getTime())) return "";
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return "ma";
  if (days === 1) return "tegnap";
  if (days < 30) return `${days} napja`;
  return then.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" });
}

function List({ items }: { items: NewsItem[] }) {
  if (!items.length) return <p className="state">Nincs friss hír.</p>;
  return (
    <div className="news-list">
      {items.map((it) => (
        <a className="news-item" key={it.url} href={it.url} target="_blank" rel="noreferrer">
          {it.image && <img src={it.image} alt="" />}
          <div>
            <div className="t">{it.title}</div>
            <div className="meta">
              {it.source}
              {relative(it.date) ? ` · ${relative(it.date)}` : ""}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function NewsCard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: Data) => setData(d))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="card accent-ink">
      <div className="card-head">
        <div className="title">
          <span className="ico">📰</span>
          <h3>Helyi és megyei hírek</h3>
        </div>
        <span className="updated">óránként frissül</span>
      </div>

      {error && <p className="state err">Nem sikerült betölteni a híreket.</p>}
      {!error && !data && <p className="state">Betöltés…</p>}

      {data && (
        <div className="news-cols">
          <div className="news-col">
            <div className="news-ch">🏛️ Önkormányzati hírek</div>
            <List items={data.local} />
          </div>
          <div className="news-col">
            <div className="news-ch">🗺️ Megyei &amp; környékbeli hírek</div>
            <List items={data.county} />
          </div>
        </div>
      )}
    </div>
  );
}
