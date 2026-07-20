import waste from "@/data/waste-2026.json";

type WT = { label: string; icon: string; dates: string[] };

const compact = (iso: string) => iso.replace(/-/g, "");

function nextDayCompact(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const nd = new Date(y, m - 1, d + 1);
  return `${nd.getFullYear()}${String(nd.getMonth() + 1).padStart(2, "0")}${String(
    nd.getDate()
  ).padStart(2, "0")}`;
}

function vevent(uid: string, iso: string, summary: string, alarm: string): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@mislenydash`,
    "DTSTAMP:20260101T000000Z",
    `DTSTART;VALUE=DATE:${compact(iso)}`,
    `DTEND;VALUE=DATE:${nextDayCompact(iso)}`,
    `SUMMARY:${summary}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${alarm}`,
    "TRIGGER:-PT6H", // 6 órával éjfél előtt = előző este 18:00
    "END:VALARM",
    "END:VEVENT",
  ];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const param = url.searchParams.get("types");
  const wanted = param ? param.split(",") : ["vegyes", "szelektiv", "zold"];
  const types = waste.types as Record<string, WT>;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MislenyMa//Kozarmisleny hulladeknaptar//HU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Kozármisleny hulladéknaptár",
    "X-WR-TIMEZONE:Europe/Budapest",
    "REFRESH-INTERVAL;VALUE=DURATION:P7D",
  ];

  // Vegyes (kommunális): heti ismétlődő esemény, minden kedden.
  if (wanted.includes("vegyes")) {
    const v = waste.vegyes;
    const firstTue = "20260106"; // 2026 első keddje
    lines.push(
      "BEGIN:VEVENT",
      `UID:vegyes-weekly@mislenydash`,
      "DTSTAMP:20260101T000000Z",
      `DTSTART;VALUE=DATE:${firstTue}`,
      "DTEND;VALUE=DATE:20260107",
      "RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20261231",
      `SUMMARY:${v.icon} ${v.label} hulladék`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Holnap ${v.label.toLowerCase()} hulladék — húzd ki a kukát!`,
      "TRIGGER:-PT6H",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  for (const key of wanted) {
    const t = types[key];
    if (!t) continue;
    // Ha a típusnév már tartalmazza a "hulladék" szót (pl. Zöldhulladék),
    // ne fűzzük hozzá még egyszer.
    const nev = /hulladék/i.test(t.label) ? t.label : `${t.label} hulladék`;
    for (const iso of t.dates) {
      lines.push(
        ...vevent(
          `${key}-${compact(iso)}`,
          iso,
          `${t.icon} ${nev}`,
          `Holnap ${nev.toLowerCase()} — húzd ki a kukát!`
        )
      );
    }
  }

  // Lomtalanítás mindig belekerül
  for (const l of waste.lomtalanitas) {
    lines.push(
      ...vevent(
        `lom-${compact(l.date)}`,
        l.date,
        `🛋️ Lomtalanítás (${l.note})`,
        `Holnap lomtalanítás (${l.note}) — készítsd ki a lomot!`
      )
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kozarmisleny-hulladek.ics"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
