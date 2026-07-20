import { Redis } from "@upstash/redis";

// Vercel serverless: nincs perzisztens fájlrendszer, ezért a számot egy
// hálózaton elérhető Upstash Redis tárolja. A REST-hitelesítést a Vercel
// Storage integráció injektálja env-változóként (mindkét elnevezést kezeljük).
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "mm:visits";

// Egy látogatót 6 órán belül egyszer számolunk (cookie alapján).
const DEDUP_SECONDS = 6 * 60 * 60;

export async function GET() {
  if (!redis) return Response.json({ total: null });
  const total = (await redis.get<number>(KEY)) ?? 0;
  return Response.json({ total });
}

export async function POST(request: Request) {
  // Ha nincs beállítva a tároló, ne hibázzunk — a UI egyszerűen elrejti a számot.
  if (!redis) return Response.json({ total: null });

  const seen = (request.headers.get("cookie") ?? "").includes("mm_seen=1");

  // Az INCR atomi, így párhuzamos kérések esetén sincs versenyhelyzet.
  const total = seen ? (await redis.get<number>(KEY)) ?? 0 : await redis.incr(KEY);

  const headers = new Headers({ "content-type": "application/json" });
  if (!seen) {
    headers.append(
      "set-cookie",
      `mm_seen=1; Max-Age=${DEDUP_SECONDS}; Path=/; SameSite=Lax; HttpOnly`
    );
  }
  return new Response(JSON.stringify({ total }), { headers });
}
