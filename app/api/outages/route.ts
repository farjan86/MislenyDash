// Közmű-üzemszünetek — Kozármislenyre szűrve.
// Áram/gáz: E.ON statikus JSON-ok. Víz: DRV Zrt. karbantartási/vízhiány oldalak
// (best-effort HTML-scrape). A szennyvíz (Tettye) nem ad gépi forrást → csak link.
import https from "node:https";

export const revalidate = 900; // 15 perc

const BASE =
  "https://www.eon.hu/content/dam/eon/eon-hungary/external-app-data/outages/";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; MislenyDash/1.0)",
  Referer: "https://www.eon.hu/hu/lakossagi/aram/aramszunet-informaciok.html",
};

// A forrás JSON-ok akár ~9 MB-osak, ezért nem férnek be a Next.js fetch
// data cache-be (2 MB/elem limit). Saját, memóriabeli TTL-cache-t használunk:
// egyszer töltjük le revalidate-enként, a szűrés kérésenként fut a kis adaton.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Cached = { at: number; data: { outages?: any[] } };
const cache = new Map<string, Cached>();

async function fetchJson(file: string): Promise<{ outages?: any[] }> {
  const url = BASE + file;
  const now = Date.now();
  const hitc = cache.get(url);
  if (hitc && now - hitc.at < revalidate * 1000) return hitc.data;

  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) return hitc?.data ?? {};
  const data = (await res.json()) as { outages?: any[] };
  cache.set(url, { at: now, data });
  return data;
}

type TimePoint = { date?: string; time?: string };
type OutageItem = {
  type: "áram" | "gáz" | "víz";
  streets: string[];
  from: string | null;
  to: string | null;
  status: string | null;
  consumers: number | null;
  description: string | null;
};

function fmt(tp?: TimePoint | null): string | null {
  if (!tp?.date) return null;
  return `${tp.date} ${(tp.time ?? "").slice(0, 5)}`.trim();
}

const hit = (city: unknown, needle: string) =>
  typeof city === "string" && city.toLowerCase().includes(needle);

async function fetchPower(needle: string): Promise<OutageItem[]> {
  const data = await fetchJson("poweroutage.json");
  const items: OutageItem[] = [];
  for (const o of data.outages ?? []) {
    const ranges = (o.addressRanges ?? []).filter((a: any) => hit(a.city, needle));
    if (!ranges.length) continue;
    const streets = [...new Set(ranges.map((a: any) => a.street).filter(Boolean))] as string[];
    const iv = (o.intervals ?? [])[0];
    items.push({
      type: "áram",
      streets,
      from: fmt(iv?.from),
      to: fmt(iv?.to),
      status: o.status ?? null,
      consumers: o.consumers ?? null,
      description: null,
    });
  }
  return items;
}

async function fetchGas(needle: string): Promise<OutageItem[]> {
  const data = await fetchJson("gasoutage.json");
  const items: OutageItem[] = [];
  for (const o of data.outages ?? []) {
    if (!hit(o.city, needle)) continue;
    items.push({
      type: "gáz",
      streets: o.street ? [o.street] : [],
      from: fmt(o.from),
      to: fmt(o.to),
      status: null,
      consumers: null,
      description: o.description ?? null,
    });
  }
  return items;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---- Víz: DRV Zrt. (best-effort HTML-scrape) ----
// FIGYELEM: a DRV hibás (hiányos) TLS-láncot ad, ezért itt — és KIZÁRÓLAG a
// DRV-kérésekre — kikapcsoljuk a tanúsítvány-ellenőrzést. A globális fetch
// (E.ON stb.) érintetlen marad. A felhasználó ezt tudatosan jóváhagyta.
const DRV_URLS = [
  "https://www.drv.hu/karbantartasi-munkak",
  "https://www.drv.hu/vizhiannyal-jaro-hibaelharitasok",
];
const htmlCache = new Map<string, { at: number; html: string }>();

function drvGet(url: string): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        rejectUnauthorized: false, // csak a DRV törött láncára, szándékosan
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MislenyDash/1.0)" },
        timeout: 8000,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          res.resume();
          return resolve("");
        }
        let d = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      }
    );
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(""));
  });
}

async function drvHtml(url: string): Promise<string> {
  const now = Date.now();
  const c = htmlCache.get(url);
  if (c && now - c.at < revalidate * 1000) return c.html;
  const html = await drvGet(url);
  if (html) htmlCache.set(url, { at: now, html });
  else if (c) return c.html; // hiba esetén a régi tartalom
  return html;
}

const stripTags = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

// Best-effort: a DRV szabadszöveges értesítőjéből kinyeri az időintervallumot.
// Kezelt formák: "júl. 3. és júl. 10. között" (tartomány), "júl. 7-én 8:00–17:00
// között" (egy nap + időablak), "és 10. között" (közös hónapú második nap).
const HU_MONTHS =
  "január|február|március|április|május|június|július|augusztus|szeptember|október|november|december";
const DATE_RE = new RegExp(`(\\d{4})\\.?\\s*(${HU_MONTHS})\\s*(\\d{1,2})`, "gi");
const TIME_RE = /(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/;

function extractInterval(body: string): { from: string | null; to: string | null } {
  const dates: { y: string; mon: string; d: string }[] = [];
  let m: RegExpExecArray | null;
  DATE_RE.lastIndex = 0;
  while ((m = DATE_RE.exec(body))) dates.push({ y: m[1], mon: m[2].toLowerCase(), d: m[3] });
  const fmt = (x: { y: string; mon: string; d: string }) => `${x.y}. ${x.mon} ${x.d}.`;
  const t = body.match(TIME_RE);

  if (!dates.length) return { from: null, to: null };
  if (dates.length >= 2) return { from: fmt(dates[0]), to: fmt(dates[1]) };

  const bareDay = body.match(/és\s*(\d{1,2})\.?\s*közöt/i);
  if (bareDay) return { from: fmt(dates[0]), to: fmt({ ...dates[0], d: bareDay[1] }) };
  if (t) return { from: `${fmt(dates[0])} ${t[1]}`, to: t[2] }; // egy nap: to = záró idő
  return { from: fmt(dates[0]), to: null };
}

function parseDrv(html: string, needle: string): OutageItem[] {
  const out: OutageItem[] = [];
  for (const block of html.split('class="asset-full-content').slice(1)) {
    if (!stripTags(block.slice(0, 4000)).toLowerCase().includes(needle)) continue;
    const h2 = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const title = h2 ? stripTags(h2[1]) : "DRV üzemszünet";
    const p = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const body = p ? stripTags(p[1]) : "";
    const { from, to } = extractInterval(body);
    out.push({
      type: "víz",
      streets: [],
      from,
      to,
      status: null,
      consumers: null,
      description: (body ? `${title} — ${body}` : title).slice(0, 260),
    });
  }
  return out.slice(0, 4);
}

async function fetchWater(needle: string): Promise<OutageItem[]> {
  const pages = await Promise.all(DRV_URLS.map(drvHtml));
  const items: OutageItem[] = [];
  for (const html of pages) if (html) items.push(...parseDrv(html, needle));
  return items;
}

export async function GET(req: Request) {
  const needle = (
    new URL(req.url).searchParams.get("city") ?? "misleny"
  ).toLowerCase();
  try {
    const [power, gas, water] = await Promise.all([
      fetchPower(needle),
      fetchGas(needle),
      fetchWater(needle).catch(() => [] as OutageItem[]),
    ]);
    return Response.json({
      ok: true,
      items: [...power, ...gas, ...water],
      updated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ ok: false, items: [] });
  }
}
