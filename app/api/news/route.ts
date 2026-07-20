import * as cheerio from "cheerio";

export const revalidate = 1800;

type NewsItem = {
  title: string;
  url: string;
  date: string | null;
  image: string | null;
  source: string;
};

const UA = "Mozilla/5.0 (compatible; MislenyDash/1.0)";

// Önkormányzati hírarchívum — több oldalt olvasunk a múltért.
async function townPage(page: number): Promise<NewsItem[]> {
  try {
    const url =
      page === 1
        ? "https://www.kozarmisleny.hu/hirek"
        : `https://www.kozarmisleny.hu/hirek/page/${page}/`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate } });
    if (!res.ok) return [];
    const $ = cheerio.load(await res.text());
    const items: NewsItem[] = [];
    $("article").each((_, el) => {
      const a = $(el).find("h3.heading-sm a").first();
      const title = a.text().trim();
      const url2 = a.attr("href") ?? "";
      if (!title || !url2.includes("/hirek/")) return;
      items.push({
        title,
        url: url2,
        date: $(el).find("time").attr("datetime") ?? null,
        image: $(el).find("img.wp-post-image").attr("src") ?? null,
        source: "Önkormányzat",
      });
    });
    return items;
  } catch {
    return [];
  }
}

// Általános RSS-olvasó (misleny.hu, pecsma.hu, Google Hírek).
async function rss(url: string, fallbackSource: string, stripSuffix = false): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate } });
    if (!res.ok) return [];
    const $ = cheerio.load(await res.text(), { xmlMode: true });
    const items: NewsItem[] = [];
    $("item").each((_, el) => {
      let title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim();
      const pub = $(el).find("pubDate").first().text().trim();
      const src = $(el).find("source").first().text().trim();
      if (stripSuffix) title = title.replace(/\s+-\s+[^-]+$/, "").trim();
      let date: string | null = null;
      if (pub) {
        const d = new Date(pub);
        if (!isNaN(d.getTime())) date = d.toISOString();
      }
      if (title && link) items.push({ title, url: link, date, image: null, source: src || fallbackSource });
    });
    return items;
  } catch {
    return [];
  }
}

function dedupeSort(list: NewsItem[], limit: number): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of list) {
    if (!it.title || !it.url) continue;
    const key = it.title.toLowerCase().replace(/[^a-z0-9á-űö-ü]+/gi, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return out.slice(0, limit);
}

export async function GET() {
  const [t1, t2, t3, misleny, google, pecsma] = await Promise.all([
    townPage(1),
    townPage(2),
    townPage(3),
    rss("https://misleny.hu/feed/", "misleny.hu"),
    rss(
      "https://news.google.com/rss/search?q=%22Koz%C3%A1rmisleny%22&hl=hu&gl=HU&ceid=HU:hu",
      "web",
      true
    ),
    rss("https://pecsma.hu/feed/", "pecsma.hu"),
  ]);

  const local = dedupeSort([...t1, ...t2, ...t3], 27);
  const county = dedupeSort([...google.slice(0, 15), ...pecsma.slice(0, 10), ...misleny], 22);

  return Response.json({ local, county, updated: new Date().toISOString() });
}
