// Hivatalos meteorológiai figyelmeztetések (HungaroMet) — a MeteoAlarm feedből,
// Baranyára (Dél-Dunántúl, NUTS2 = HU23) szűrve. Nincs auth; a feed ~0,5 MB.
export const revalidate = 1800; // 30 perc

const FEED = "https://feeds.meteoalarm.org/api/v1/warnings/feeds-hungary";
const REGION = "HU23";
const REGION_NAME = "Dél-Dunántúl (Baranya)";

const TYPE: Record<string, { icon: string; label: string }> = {
  "1": { icon: "💨", label: "Szél" },
  "2": { icon: "❄️", label: "Hó / ónos eső" },
  "3": { icon: "⛈️", label: "Zivatar" },
  "4": { icon: "🌫️", label: "Köd" },
  "5": { icon: "🌡️", label: "Hőség" },
  "6": { icon: "🥶", label: "Hideg" },
  "7": { icon: "🌊", label: "Partmenti" },
  "8": { icon: "🔥", label: "Erdőtűz" },
  "9": { icon: "🏔️", label: "Lavina" },
  "10": { icon: "🌧️", label: "Eső" },
  "11": { icon: "🌊", label: "Árvíz" },
  "12": { icon: "🌊", label: "Áradás" },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function param(params: any[], name: string): string {
  return params?.find((p) => p.valueName === name)?.value ?? "";
}

export async function GET() {
  try {
    const r = await fetch(FEED, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MislenyDash/1.0)" },
      next: { revalidate },
    });
    if (!r.ok) return Response.json({ ok: false, region: REGION_NAME, alerts: [] });
    const j = (await r.json()) as { warnings?: any[] };

    const now = Date.now();
    const seen = new Set<string>();
    const alerts: any[] = [];

    for (const w of j.warnings ?? []) {
      for (const info of w.alert?.info ?? []) {
        if (!/^hu/i.test(info.language ?? "")) continue; // csak magyar változat
        const inRegion = (info.area ?? []).some((a: any) =>
          (a.geocode ?? []).some((g: any) => g.value === REGION)
        );
        if (!inRegion) continue;

        const exp = Date.parse(info.expires ?? "");
        if (isFinite(exp) && exp < now) continue; // lejárt figyelmeztetés

        const [lvlNum, color] = param(info.parameter, "awareness_level")
          .split(";")
          .map((s: string) => s.trim());
        const level = Number(lvlNum) || 1;
        if (level < 2) continue; // csak sárga (2) és felette

        const typeCode = param(info.parameter, "awareness_type").split(";")[0].trim();
        const t = TYPE[typeCode] ?? { icon: "⚠️", label: "Figyelmeztetés" };

        const from = info.onset || info.effective || null;
        const key = `${info.event}|${from}|${info.expires}`;
        if (seen.has(key)) continue;
        seen.add(key);

        alerts.push({
          event: info.event || info.headline || t.label,
          desc: info.description || "",
          level,
          color: color || "yellow",
          icon: t.icon,
          typeLabel: t.label,
          from,
          to: info.expires || null,
          upcoming: from ? Date.parse(from) > now : false,
        });
      }
    }

    alerts.sort(
      (a, b) => b.level - a.level || Date.parse(a.from || "0") - Date.parse(b.from || "0")
    );

    return Response.json({
      ok: true,
      region: REGION_NAME,
      alerts,
      updated: new Date().toISOString(),
    });
  } catch {
    return Response.json({ ok: false, region: REGION_NAME, alerts: [] });
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
