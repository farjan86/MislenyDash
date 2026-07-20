import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Egyszerű, fájlba perzisztáló látogatószámláló. A self-hosted `next start`
// egyetlen, hosszan futó folyamat, így a lemezre írás munkamenetek közt megmarad.
const FILE = path.join(process.cwd(), "data", "visits.json");

// Egy látogatót 6 órán belül egyszer számolunk (cookie alapján).
const DEDUP_SECONDS = 6 * 60 * 60;

type Store = { total: number; updated: string };

async function read(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
  } catch {
    return { total: 0, updated: new Date().toISOString() };
  }
}

// Folyamaton belüli sorbaállítás, hogy a read-modify-write ne versenyezzen.
let chain: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}

export async function GET() {
  const { total } = await read();
  return Response.json({ total });
}

export async function POST(request: Request) {
  const seen = (request.headers.get("cookie") ?? "").includes("mm_seen=1");

  const total = await locked(async () => {
    const store = await read();
    if (!seen) {
      store.total += 1;
      store.updated = new Date().toISOString();
      await mkdir(path.dirname(FILE), { recursive: true });
      await writeFile(FILE, JSON.stringify(store));
    }
    return store.total;
  });

  const headers = new Headers({ "content-type": "application/json" });
  if (!seen) {
    headers.append(
      "set-cookie",
      `mm_seen=1; Max-Age=${DEDUP_SECONDS}; Path=/; SameSite=Lax; HttpOnly`
    );
  }
  return new Response(JSON.stringify({ total }), { headers });
}
