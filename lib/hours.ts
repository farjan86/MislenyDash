// Nyitvatartás-segédfüggvények (keret-független, tesztelhető)

export type Interval = [string, string]; // ["HH:MM", "HH:MM"]
export type Hours = Record<string, Interval[]>; // kulcs: mon..sun

// JS getDay(): 0=vasárnap … 6=szombat
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const WEEK: [string, string][] = [
  ["mon", "H"], ["tue", "K"], ["wed", "Sze"], ["thu", "Cs"],
  ["fri", "P"], ["sat", "Szo"], ["sun", "V"],
];
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"];

export function todayKey(d: Date): string {
  return DAY_KEYS[d.getDay()];
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// "08:00" → "8", "12:30" → "12:30" (kerek órák rövidülnek)
export function pretty(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? h : `${h}:${m}`;
}

export function todayIntervals(hours: Hours, d: Date): Interval[] {
  return hours[todayKey(d)] ?? [];
}

export function isOpenNow(hours: Hours, d: Date): boolean {
  const now = d.getHours() * 60 + d.getMinutes();
  return todayIntervals(hours, d).some(
    ([a, b]) => now >= toMin(a) && now < toMin(b)
  );
}

export function fmtIntervals(ivs: Interval[]): string {
  if (!ivs.length) return "Zárva";
  return ivs.map(([a, b]) => `${a}–${b}`).join(", ");
}

// Heti nézet: hétköznapok mindig, hétvége csak ha van nyitvatartás.
export function weekly(
  hours: Hours
): { key: string; short: string; parts: string[] }[] {
  const out: { key: string; short: string; parts: string[] }[] = [];
  for (const [key, short] of WEEK) {
    const ivs = hours[key] ?? [];
    if (!WEEKDAYS.includes(key) && ivs.length === 0) continue;
    out.push({ key, short, parts: ivs.map(([a, b]) => `${pretty(a)}–${pretty(b)}`) });
  }
  return out;
}

export function dayNameHu(d: Date): string {
  return new Intl.DateTimeFormat("hu-HU", { weekday: "long" }).format(d);
}
