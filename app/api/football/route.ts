// SE Kozármisleny (HR-RENT) — TheSportsDB ingyenes JSON API (kulcs nélkül).
export const revalidate = 3600; // 1 óra

const KEY = "3"; // ingyenes teszt-kulcs; élesben saját ingyenes kulcsra cserélhető
const TEAM = "146466";
const LEAGUE = "4965";
const BASE = `https://www.thesportsdb.com/api/v1/json/${KEY}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function getJson(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { next: { revalidate } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function normMatch(e: any) {
  if (!e) return null;
  return {
    date: e.dateEvent
      ? `${e.dateEvent}T${e.strTime || "00:00:00"}`
      : e.strTimestamp ?? null,
    home: e.strHomeTeam ?? null,
    away: e.strAwayTeam ?? null,
    homeScore: e.intHomeScore ?? null,
    awayScore: e.intAwayScore ?? null,
    venue: e.strVenue || null,
    round: e.intRound || null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function GET() {
  try {
    const [next, last, season, t2627, t2526] = await Promise.all([
      getJson(`${BASE}/eventsnext.php?id=${TEAM}`),
      getJson(`${BASE}/eventslast.php?id=${TEAM}`),
      getJson(`${BASE}/eventsseason.php?id=${LEAGUE}&s=2025-2026`),
      getJson(`${BASE}/lookuptable.php?l=${LEAGUE}&s=2026-2027`),
      getJson(`${BASE}/lookuptable.php?l=${LEAGUE}&s=2025-2026`),
    ]);

    const nextEv = normMatch(next?.events?.[0]);

    // A teljes szezonból Kozármisleny lejátszott meccsei (több múltbeli eredmény).
    let lastList = ((season?.events ?? []) as any[])
      .filter((e) => /misleny/i.test(`${e.strHomeTeam ?? ""} ${e.strAwayTeam ?? ""}`))
      .filter((e) => e.intHomeScore != null && e.intHomeScore !== "")
      .map(normMatch)
      .filter(Boolean)
      .sort((a, b) => (b!.date ?? "").localeCompare(a!.date ?? ""))
      .slice(0, 8);
    if (!lastList.length) {
      lastList = ((last?.results ?? last?.events ?? []) as unknown[])
        .map(normMatch)
        .filter(Boolean)
        .slice(0, 5);
    }

    const newSeason = Array.isArray(t2627?.table) && t2627.table.length > 0;
    const table = newSeason ? t2627.table : t2526?.table;
    const row = Array.isArray(table)
      ? table.find((t: { strTeam?: string }) => /misleny/i.test(t.strTeam ?? ""))
      : null;
    const standing = row
      ? {
          rank: Number(row.intRank),
          points: Number(row.intPoints),
          played: Number(row.intPlayed),
          season: newSeason ? "2026/27" : "2025/26",
        }
      : null;

    return Response.json({
      ok: true,
      next: nextEv,
      last: lastList,
      standing,
      updated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ ok: false });
  }
}
