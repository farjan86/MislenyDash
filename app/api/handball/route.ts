// Kozármisleny KA (női kézilabda) — best-effort scraper az eredmenyek.com-ról.
// Nincs hivatalos API; ha a scrape nem hoz adatot, a kártya statikus infóra vált.
import { parseFeed, type FeedMatch } from "@/lib/flashscore";

export const revalidate = 3600; // 1 óra

const NEEDLE = /misleny/i;
// Több jelölt oldal: az eredmenyek.com az NB I-et fedi (itt vannak a csapat
// legutóbbi eredményei); az NB I/B-t egyelőre nem — de ha később felkerül,
// a scraper magától elkezdi onnan is behúzni.
const URLS = [
  "https://www.eredmenyek.com/kezilabda/magyarorszag/nb-i-noi/",
  "https://www.eredmenyek.com/kezilabda/magyarorszag/nb-i-b-noi/",
  "https://www.eredmenyek.com/kezilabda/magyarorszag/nb-ib-noi/",
];

async function grab(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MislenyDash/1.0)" },
      next: { revalidate },
    });
    if (!r.ok) return "";
    return await r.text();
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const htmls = await Promise.all(URLS.map(grab));

    const seen = new Set<string>();
    const all: FeedMatch[] = [];
    for (const html of htmls) {
      for (const m of parseFeed(html, NEEDLE)) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          all.push(m);
        }
      }
    }

    const nowTs = Date.now() / 1000;
    const finished = all
      .filter((m) => m.finished || (m.homeScore != null && m.awayScore != null))
      .sort((a, b) => b.ts - a.ts);
    const upcoming = all
      .filter((m) => !m.finished && m.homeScore == null && m.ts > nowTs)
      .sort((a, b) => a.ts - b.ts);

    return Response.json({
      ok: true,
      next: upcoming[0] ?? null,
      last: finished.slice(0, 6),
      updated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ ok: false, next: null, last: [] });
  }
}
