// Best-effort parser az eredmenyek.com (Flashscore-hálózat) oldalak HTML-jébe
// ágyazott adatfolyamához. A folyam rekordjait `~` választja el, a mezőket `¬`,
// a kulcs–érték párokat `÷`. FRAGILIS: ha a külső oldal formátuma változik,
// üres eredményt ad — a hívó ilyenkor statikus tartalomra vált vissza.

export type FeedMatch = {
  id: string;
  ts: number; // unix másodperc
  date: string | null; // ISO
  home: string | null;
  away: string | null;
  homeScore: string | null;
  awayScore: string | null;
  round: number | null;
  finished: boolean;
};

const REC = "~";
const FIELD = "¬"; // ¬
const KV = "÷"; // ÷

// A `needle`-re illeszkedő (hazai vagy vendég) csapat mérkőzéseit adja vissza.
export function parseFeed(html: string, needle: RegExp): FeedMatch[] {
  const out: FeedMatch[] = [];
  const seen = new Set<string>();

  for (const rec of html.split(REC)) {
    if (!rec.includes("AA" + KV)) continue;
    const f: Record<string, string> = {};
    for (const pair of rec.split(FIELD)) {
      const i = pair.indexOf(KV);
      if (i > 0) f[pair.slice(0, i)] = pair.slice(i + 1);
    }

    const home = f.AE || f.CX || null;
    const away = f.AF || null;
    if (!home || !away) continue;
    if (!needle.test(home) && !needle.test(away)) continue;

    const id = f.AA;
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const ts = Number(f.AD) || 0;
    const hs = f.AG ?? "";
    const as = f.AH ?? "";
    out.push({
      id,
      ts,
      date: ts ? new Date(ts * 1000).toISOString() : null,
      home,
      away,
      homeScore: hs === "" ? null : hs,
      awayScore: as === "" ? null : as,
      round: f.ER ? parseInt(f.ER, 10) || null : null,
      finished: f.AB === "3",
    });
  }
  return out;
}
