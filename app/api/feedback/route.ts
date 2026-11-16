import { Redis } from "@upstash/redis";
import { DEV_EMAIL, FEEDBACK_MAX } from "@/lib/contact";

// Fejlesztési ötletek továbbítása e-mailben a fejlesztőnek.
// A levelet a Resend REST API küldi (külön npm-csomag nélkül, sima fetch-csel).
// Szükséges env-változó: RESEND_API_KEY. Opcionális: FEEDBACK_TO, FEEDBACK_FROM.
// Ha nincs kulcs, 503 "not_configured" megy vissza — a kliens ilyenkor a
// látogató saját levelezőjét nyitja meg (mailto:), előre kitöltött szöveggel.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO = process.env.FEEDBACK_TO ?? DEV_EMAIL;
// Saját, hitelesített domain nélkül a Resend csak erről a címről enged küldeni,
// és csak a Resend-fiók saját e-mail-címére — ide pont az kell.
const FROM = process.env.FEEDBACK_FROM ?? "MislenyMa <onboarding@resend.dev>";

// Spam elleni korlát: IP-nként óránként legfeljebb 5 üzenet (ha van Redis).
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }

  // Méregcsapda: ezt a rejtett mezőt ember nem tölti ki, csak robot.
  // Sikert jelzünk vissza, de nem küldünk semmit.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const name = clean(body.name, 80);
  const email = clean(body.email, 120);

  if (message.length < 5) return fail("too_short", 400);
  if (message.length > FEEDBACK_MAX) return fail("too_long", 400);
  if (email && !EMAIL_RE.test(email)) return fail("bad_email", 400);

  if (!RESEND_API_KEY) return fail("not_configured", 503);

  if (redis) {
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "ismeretlen";
    const key = `mm:feedback:${ip}`;
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, WINDOW_SECONDS);
      if (count > LIMIT) return fail("rate_limited", 429);
    } catch {
      // Ha a Redis épp nem elérhető, emiatt ne vesszen el az üzenet.
    }
  }

  const text = [
    message,
    "",
    "—",
    `Név: ${name || "(nem adta meg)"}`,
    `E-mail: ${email || "(nem adta meg)"}`,
    `Küldve: ${new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })}`,
  ].join("\n");

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `MislenyMa ötlet${name ? ` — ${name}` : ""}`,
        text,
        ...(email ? { reply_to: email } : {}),
      }),
    });
  } catch (e) {
    console.error("feedback: a Resend nem érhető el", e);
    return fail("send_failed", 502);
  }

  if (!res.ok) {
    console.error("feedback: Resend hiba", res.status, await res.text().catch(() => ""));
    return fail("send_failed", 502);
  }
  return Response.json({ ok: true });
}
