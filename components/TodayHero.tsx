"use client";

import { useEffect, useState } from "react";
import waste from "@/data/waste-2026.json";
import { useNow } from "@/lib/useNow";
import { nextDate, daysUntil, relativeHu, type WasteType } from "@/lib/waste";

const LAT = 46.045;
const LON = 18.272;
const WX =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code&hourly=precipitation&timezone=Europe%2FBudapest&forecast_days=3`;

const ICON: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌦️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const timeFmt = new Intl.DateTimeFormat("hu-HU", { hour: "2-digit", minute: "2-digit" });

function dayWord(iso: string): string {
  const d = new Date(iso);
  const t = new Date();
  const diff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()) / 86_400_000
  );
  if (diff === 0) return "ma";
  if (diff === 1) return "holnap";
  return new Intl.DateTimeFormat("hu-HU", { weekday: "short" }).format(d).replace(".", "");
}

type Wx = { current: { temperature_2m: number; weather_code: number }; hourly: { time: string[]; precipitation: number[] } };
type FbMatch = { date: string | null; home: string | null; away: string | null };

export default function TodayHero() {
  const now = useNow();
  const [wx, setWx] = useState<Wx | null>(null);
  const [nextMatch, setNextMatch] = useState<FbMatch | null>(null);

  useEffect(() => {
    fetch(WX).then((r) => (r.ok ? r.json() : null)).then(setWx).catch(() => {});
    fetch("/api/football")
      .then((r) => r.json())
      .then((d) => setNextMatch(d?.next ?? null))
      .catch(() => {});
  }, []);

  if (!now) return <div className="hero" aria-hidden />;

  const dateStr = now.toLocaleDateString("hu-HU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // következő eső
  let rain: string | null = null;
  if (wx?.hourly) {
    const nowMs = Date.now();
    for (let i = 0; i < wx.hourly.time.length; i++) {
      const t = new Date(wx.hourly.time[i]).getTime();
      if (t < nowMs - 3_600_000) continue;
      if ((wx.hourly.precipitation[i] ?? 0) >= 0.1) {
        rain = t <= nowMs ? "most esik" : `${dayWord(wx.hourly.time[i])} ${timeFmt.format(new Date(wx.hourly.time[i]))}`;
        break;
      }
    }
  }

  // következő kuka
  const types = waste.types as Record<string, WasteType>;
  const nextW = (["szelektiv", "zold"] as const)
    .map((k) => {
      const iso = nextDate(types[k].dates, now);
      return iso ? { t: types[k], days: daysUntil(iso, now) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.days - b!.days)[0];

  return (
    <div className="hero">
      <div className="hero-cell hero-date">{dateStr}</div>
      {wx?.current && (
        <div className="hero-cell">
          <span className="hero-ic">{ICON[wx.current.weather_code] ?? "🌡️"}</span>
          <b>{Math.round(wx.current.temperature_2m)}°</b>
        </div>
      )}
      <div className="hero-cell">
        <span className="hero-ic">🌧️</span>
        {rain ? <>Eső: <b>{rain}</b></> : <>Ma nem várható eső</>}
      </div>
      {nextW && (
        <div className="hero-cell">
          <span className="hero-ic">{nextW.t.icon}</span>
          {nextW.t.label}: <b>{relativeHu(nextW.days).toLowerCase()}</b>
        </div>
      )}
      {nextMatch?.date && (
        <div className="hero-cell">
          <span className="hero-ic">⚽</span>
          <b>{(nextMatch.home && /misleny/i.test(nextMatch.home) ? nextMatch.away : nextMatch.home) ?? ""}</b>
          {" "}
          {dayWord(nextMatch.date)}
        </div>
      )}
    </div>
  );
}
