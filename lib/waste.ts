// Hulladéknaptár-segédfüggvények (keret-független)

export type WasteType = { label: string; icon: string; dates: string[] };

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// A legközelebbi ürítési nap (ma vagy a jövőben), vagy null.
export function nextDate(dates: string[], from: Date): string | null {
  const today = ymd(from);
  return dates.filter((d) => d >= today).sort()[0] ?? null;
}

// A legközelebbi adott hét­napra eső dátum (ma is számít). weekday: 0=vas … 6=szo.
export function nextWeekday(weekday: number, from: Date): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return ymd(d);
}

// Egy évben az adott hét­napra eső összes dátum (ISO), rendezve.
export function weekdayDates(weekday: number, year: number): string[] {
  const out: string[] = [];
  const d = new Date(year, 0, 1);
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
  for (; d.getFullYear() === year; d.setDate(d.getDate() + 7)) out.push(ymd(d));
  return out;
}

export function daysUntil(iso: string, from: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((target - base) / 86_400_000);
}

export function relativeHu(days: number): string {
  if (days <= 0) return "Ma";
  if (days === 1) return "Holnap";
  return `${days} nap múlva`;
}

export function fmtDateHu(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
