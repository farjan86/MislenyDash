"use client";

import { useEffect, useState } from "react";

// Kozármisleny hozzávetőleges koordinátái
const LAT = 46.045;
const LON = 18.272;

const API =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
  `&hourly=precipitation,precipitation_probability` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset` +
  `&timezone=Europe%2FBudapest&forecast_days=14`;

function describe(code: number): { label: string; icon: string } {
  const map: Record<number, [string, string]> = {
    0: ["Derült", "☀️"], 1: ["Túlnyomóan derült", "🌤️"], 2: ["Részben felhős", "⛅"],
    3: ["Borult", "☁️"], 45: ["Köd", "🌫️"], 48: ["Zúzmarás köd", "🌫️"],
    51: ["Gyenge szitálás", "🌦️"], 53: ["Szitálás", "🌦️"], 55: ["Erős szitálás", "🌦️"],
    56: ["Ónos szitálás", "🌧️"], 57: ["Ónos szitálás", "🌧️"],
    61: ["Gyenge eső", "🌧️"], 63: ["Eső", "🌧️"], 65: ["Erős eső", "🌧️"],
    66: ["Ónos eső", "🌧️"], 67: ["Ónos eső", "🌧️"],
    71: ["Gyenge havazás", "❄️"], 73: ["Havazás", "❄️"], 75: ["Erős havazás", "❄️"],
    77: ["Hószállingózás", "❄️"], 80: ["Gyenge zápor", "🌦️"], 81: ["Zápor", "🌦️"],
    82: ["Erős zápor", "⛈️"], 85: ["Hózápor", "🌨️"], 86: ["Erős hózápor", "🌨️"],
    95: ["Zivatar", "⛈️"], 96: ["Jeges zivatar", "⛈️"], 99: ["Jeges zivatar", "⛈️"],
  };
  return { label: map[code]?.[0] ?? "—", icon: map[code]?.[1] ?? "❓" };
}

type Weather = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: { time: string[]; precipitation: number[]; precipitation_probability: number[] };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

const dayFmt = new Intl.DateTimeFormat("hu-HU", { weekday: "short" });
const timeFmt = new Intl.DateTimeFormat("hu-HU", { hour: "2-digit", minute: "2-digit" });
const hm = (iso: string) => timeFmt.format(new Date(iso));

function dayWord(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86_400_000
  );
  if (diff === 0) return "ma";
  if (diff === 1) return "holnap";
  return new Intl.DateTimeFormat("hu-HU", { weekday: "long" }).format(d);
}

// A legközelebbi óra, amikor esik (≥0,1 mm), és a folyamatos esős órák összege.
function nextRain(h: Weather["hourly"]): { time: string; amount: number; now: boolean } | null {
  const nowMs = Date.now();
  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]).getTime();
    if (t < nowMs - 3_600_000) continue;
    if ((h.precipitation[i] ?? 0) >= 0.1) {
      let total = 0;
      for (let j = i; j < h.time.length && (h.precipitation[j] ?? 0) >= 0.1; j++) {
        total += h.precipitation[j];
      }
      return { time: h.time[i], amount: total, now: t <= nowMs };
    }
  }
  return null;
}

export default function WeatherCard() {
  const [data, setData] = useState<Weather | null>(null);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then((json: Weather) => {
        setData(json);
        setUpdated(timeFmt.format(new Date()));
      })
      .catch(() => setError(true));
  }, []);

  const now = data && describe(data.current.weather_code);
  const rain = data && nextRain(data.hourly);

  return (
    <div className="card">
      <div className="card-head">
        <div className="title">
          <span className="ico">🌤️</span>
          <h3>Időjárás</h3>
        </div>
        {updated && <span className="updated">Frissítve {updated}</span>}
      </div>

      {error && <p className="state err">Nem sikerült betölteni az időjárást.</p>}
      {!error && !data && <p className="state">Betöltés…</p>}

      {data && now && (
        <>
          <div className="wx-now">
            <span className="big-ico">{now.icon}</span>
            <div>
              <div className="temp">{Math.round(data.current.temperature_2m)}°</div>
              <div className="cond">{now.label}</div>
            </div>
          </div>

          <div className={"wx-rain" + (rain ? "" : " dry")}>
            {rain ? (
              rain.now ? (
                <>
                  🌧️ <b>Most esik</b> — a következő órákban ~
                  {rain.amount.toFixed(1)} mm várható
                </>
              ) : (
                <>
                  🌧️ Következő eső: <b>{dayWord(rain.time)} {hm(rain.time)}</b> · ~
                  {rain.amount.toFixed(1)} mm
                </>
              )
            ) : (
              <>☀️ A következő napokban nem jelez esőt</>
            )}
          </div>

          <div className="wx-meta">
            <span>
              🌡️ Hőérzet <b>{Math.round(data.current.apparent_temperature)}°</b>
            </span>
            <span>
              💧 <b>{data.current.relative_humidity_2m}%</b>
            </span>
            <span>
              💨 <b>{Math.round(data.current.wind_speed_10m)}</b> km/h
            </span>
          </div>

          <div className="wx-extra">
            <div className="wxs">
              <span className="wxs-l">Csapadékesély ma</span>
              <span className="wxs-v">{data.daily.precipitation_probability_max[0] ?? 0}%</span>
            </div>
            <div className="wxs">
              <span className="wxs-l">UV-index</span>
              <span className="wxs-v">{Math.round(data.daily.uv_index_max[0] ?? 0)}</span>
            </div>
            <div className="wxs">
              <span className="wxs-l">Napkelte</span>
              <span className="wxs-v">{hm(data.daily.sunrise[0])}</span>
            </div>
            <div className="wxs">
              <span className="wxs-l">Napnyugta</span>
              <span className="wxs-v">{hm(data.daily.sunset[0])}</span>
            </div>
          </div>

          <div className="wx-days wx-days-14">
            {data.daily.time.map((iso, i) => {
              const d = describe(data.daily.weather_code[i]);
              const dayLabel =
                i === 0 ? "Ma" : dayFmt.format(new Date(iso)).replace(".", "");
              return (
                <div className="wx-day" key={iso}>
                  <span className="d">{dayLabel}</span>
                  <span className="di">{d.icon}</span>
                  <span className="hi">
                    {Math.round(data.daily.temperature_2m_max[i])}°
                  </span>
                  <span className="lo">
                    {Math.round(data.daily.temperature_2m_min[i])}°
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
