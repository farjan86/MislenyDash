# MislenyMa

**Kozármisleny élő városi adat-dashboardja** — időjárás, hulladéknaptár, közmű-üzemszünetek, egészségügyi ügyelet, sport és helyi hírek egy helyen, valós idejű adatokkal.

- **Élő:** https://misleny-dash-git-main-prowolf.vercel.app (a `mislenyma.hu` domain kötése folyamatban)
- **Repo:** https://github.com/farjan86/MislenyDash

---

## 1. Mi ez?

Egy naponta használható helyi „infó-műszerfal" Kozármisleny (~6 900 fő) lakóinak. Nem brosúra, hanem **valós idejű adat-dashboard**: megnyitod, és rögtön látod, mi van *most* (időjárás, következő kukanap, üzemszünet, ügyelet). Kétféle adatot ötvöz:

- **Élő / futásidejű** — API-route-ok kérik le és cache-elik külső forrásokból (időjárás, riasztás, üzemszünet, sport, hírek).
- **Statikus / build-idejű** — kézzel karbantartott JSON-ok (orvosok, gyógyszertár, védőnő, ügyelet, hulladéknaptár dátumai).

## 2. Tech stack

| Réteg | Választás |
|---|---|
| Keretrendszer | **Next.js 16.2.10** (App Router, Turbopack) |
| UI | **React 19.2.4**, TypeScript |
| Stílus | Sima CSS (`app/globals.css`), design-tokenek `:root`-ban |
| Adat | Külső API-k + HTML-scrape + statikus JSON |
| Perzisztencia | **Upstash Redis** (látogatószámláló — serverless-barát, REST-alapú) |
| Hosting | **Vercel** (serverless, GitHub-push → auto-deploy) |

> ⚠️ **Figyelem:** ez a repo egy módosított Next.js-t használ — az API-k és konvenciók eltérhetnek a megszokottól. Kód írása előtt olvasd a `node_modules/next/dist/docs/` alatti guide-okat (lásd `AGENTS.md`).

## 3. Gyors start

```bash
npm install
npm run dev        # fejlesztői szerver (http://localhost:3000)
npm run build      # produkciós build
npm run start      # produkciós szerver
```

Windows batch-segédek (a projekt gyökerében):

| Fájl | Mit csinál |
|---|---|
| **`build.bat`** | Leállítja a 3000-es porton futó appot (**csak azt a PID-et**, nem minden node-ot!), törli a `.next`-et, buildel, indít. |
| **`commit.bat`** | `git add + commit + push` a GitHub repóra. Első futáskor `git init` + remote beállítás. Üzenet: `commit.bat Saját üzenet`, vagy paraméter nélkül időbélyeg. |

## 4. Projektstruktúra

```
mislenyma/
├─ app/
│  ├─ layout.tsx            # metaadat (cím, leírás), <html lang="hu">
│  ├─ page.tsx              # a teljes oldal összeállítása (szekciók)
│  ├─ globals.css           # design rendszer + minden stílus
│  └─ api/                  # serverless route-ok (élő adat)
│     ├─ weather-alerts/    # MeteoAlarm (HungaroMet) riasztások
│     ├─ outages/           # E.ON áram/gáz + DRV víz (scrape)
│     ├─ kuka.ics/          # hulladéknaptár .ics feed (feliratkozás)
│     ├─ news/              # helyi + megyei hírek
│     ├─ football/          # SE Kozármisleny (TheSportsDB)
│     ├─ handball/          # Kozármisleny KA (eredmenyek.com scrape)
│     └─ visits/            # látogatószámláló (Upstash Redis, atomi INCR)
├─ components/              # kártyák és UI-elemek (lásd lent)
│  └─ VisitorCounter.tsx    # footer látogatószámláló (kliens komponens)
├─ lib/                     # segédfüggvények (waste, flashscore, hours, useNow)
├─ data/
│  ├─ health.json           # orvos/gyógyszertár/állatorvos/védőnő/ügyelet (STATIKUS)
│  ├─ waste-2026.json       # hulladéknaptár dátumai (STATIKUS)
│  ├─ visits.json           # (RÉGI, már nem használt — a szám Redisben; .gitignore-olt)
│  └─ Kozarmisleny_hulladek.pdf  # forrás-PDF
├─ build.bat / commit.bat
└─ README.md
```

## 5. Szekciók és fő komponensek

Az oldal (`app/page.tsx`) felül egy **ragadós, sötétzöld navigációs sávval** (`QuickTiles`) indul, majd szekciók:

| Szekció (`id`) | Komponensek | Tartalom |
|---|---|---|
| **Ma** (`ma`) | `TodayHero` | Napi kiemelt info (pl. „Ma nem várható eső") |
| **Időjárás** (`idojaras`) | `WeatherAlertCard`, `WeatherCard`, `AirCard`, `RadarMap` | Hivatalos riasztás, előrejelzés, levegő, Windy-térkép |
| **Hulladék** (`hulladek`) | `WasteCard`, `WasteCalendar` | Következő ürítés (vegyes/szelektív/zöld), naptár, .ics feliratkozás |
| **Közmű** (`kozmu`) | `OutageCard` | Áram/gáz/víz üzemszünet + szolgáltatói hibabejelentők |
| **Egészség** (`egeszseg`) | `UgyeletCard`, `DoctorGroupCard`, `PharmacyCard`, `VetCard`, `VedonoCard` | Ügyelet („hova menjek?"), háziorvos, gyerekorvos, fogorvos, patika, állatorvos, védőnő |
| **Sport** (`sport`) | `FootballCard`, `HandballCard`, `BasketballCard` | SE Kozármisleny foci, női kézi, kosár |
| **Hírek** (`hirek`) | `NewsCard` | Helyi + megyei hírek |

**Segéd-/megosztott komponensek:** `PractitionerBlock`, `WeekHours` (nyitvatartás), `TodayRibbon`, `RadarCard`, `HealthCard`. A `SectionNav` a régi vékony menüsor — **már nincs használatban**, felváltotta a `QuickTiles`.

**Footer:** a láblécben a `VisitorCounter` kliens komponens jeleníti meg az összes látogató számát (`X látogató`). Betöltéskor egy `POST /api/visits` hívással növeli és lekéri az értéket; ha a tároló nincs beállítva (pl. lokálisan), csendben elrejti a számot.

## 6. Adatforrások — élő vs. statikus

| Adat | Típus | Forrás | Frissül |
|---|---|---|---|
| Időjárás, levegő, radar | Élő | Open-Meteo / Windy | kérésenként, cache-elve |
| **Meteorológiai riasztás** | Élő | MeteoAlarm (HungaroMet), `HU23` = Dél-Dunántúl | 30 perc |
| **Áram / gáz üzemszünet** | Élő | E.ON statikus JSON-ok | 15 perc |
| **Víz üzemszünet** | Élő (scrape) | DRV Zrt. HTML (`node:https`, TLS-bypass) | 15 perc |
| Hírek | Élő (scrape) | helyi + megyei hírportálok | 30 perc |
| Foci | Élő | TheSportsDB ingyenes API | 1 óra |
| **Kézilabda** | Élő (scrape) | eredmenyek.com (Flashscore feed) | 1 óra |
| Kosárlabda | Statikus | nincs gépi forrás → link + info | build-idő |
| Orvos, patika, állatorvos, védőnő, **ügyelet** | Statikus | `data/health.json` | build-idő |
| Hulladéknaptár dátumai | Statikus | `data/waste-2026.json` (Dél-Kom PDF) | build-idő |
| **Látogatószámláló** | Élő (perzisztens) | Upstash Redis (`mm:visits` kulcs) | minden látogatáskor |

## 7. API route-ok részletei

- **`/api/weather-alerts`** — MeteoAlarm JSON feedből a `hu-HU` nyelvű, `HU23` (Dél-Dunántúl) régióra érvényes, **sárga+** (2. szint felett) és nem lejárt figyelmeztetések. Zöld (1) és lejárt kimarad.
- **`/api/outages`** — E.ON `poweroutage.json`/`gasoutage.json` (memóriabeli TTL-cache, mert >2 MB, nem fér a Next fetch-cache-be), + DRV víz-scrape. Kozármislenyre szűr. `?city=` paraméterrel más településre is.
- **`/api/kuka.ics`** — iCalendar feed a hulladéknaptárhoz. Minden ürítés egy esemény + `VALARM` (előző este 18:00 emlékeztető). A vegyes heti ismétlődő (`RRULE:WEEKLY;BYDAY=TU`). Feliratkozás: `webcal://…/api/kuka.ics`.
- **`/api/news`** — helyi/megyei hírek scrape-elve, cím + link + dátum.
- **`/api/football`** — TheSportsDB: következő meccs, utolsó eredmények, tabella-pozíció.
- **`/api/handball`** — eredmenyek.com HTML-be ágyazott Flashscore-feed parse-olása (`lib/flashscore.ts`), Kozármisleny KA meccsei. Best-effort → hiba esetén a kártya statikus infóra vált.
- **`/api/visits`** — látogatószámláló Upstash Redisszel (`mm:visits` kulcs). `POST` → atomi `INCR` (nincs versenyhelyzet) + `mm_seen` cookie (6 óra) a dedup miatt: egy látogatót 6 órán belül egyszer számol; ha a cookie már megvan, csak visszaadja az aktuális értéket növelés nélkül. `GET` → csak olvas. Ha nincs Redis env beállítva, `{ total: null }`-t ad vissza — nem hibázik, a UI elrejti a számot.

## 8. Statikus adatfájlok karbantartása

### `data/health.json`
Kulcsok: `pharmacies`, `pharmacyDuty`, `doctors`, `vets`, `healthVisitors`, **`emergency`** (ügyelet). Az `emergency` blokk: `life` (112), `central` (1830), `adult`/`child` (helyszín + ügyelet + sürgősségi telefonszámok), `dental` (fogászati ügyelet). Telefonszám: `tel` (kijelzés) + `dial` (hívás-link).
→ **Ha egy szám/cím változik:** szerkeszd a JSON-t, `commit.bat`, a Vercel automatikusan deployol. (Nincs gépi forrás, ezért kézi.)

### `data/waste-2026.json`
`types.szelektiv` / `types.zold` dátumtömbök, `vegyes` (heti, `weekday:2` = kedd), `lomtalanitas`. Forrás: Dél-Kom PDF.
→ **Új év / új naptár:** frissítsd a dátumokat és a `year` mezőt.

## 9. Kulcs-megoldások (amit érdemes érteni)

- **DRV TLS-bypass** (`api/outages`): a DRV hibás tanúsítványláncot ad, ezért **csak** a DRV-kérésekre `node:https` + `rejectUnauthorized:false`. A globális `fetch` (E.ON stb.) érintetlen. Tudatosan jóváhagyott kompromisszum.
- **Flashscore feed parse** (`lib/flashscore.ts`): az eredmenyek.com HTML-be ágyazott `~`/`¬`/`÷` tagolású adatfolyam. Mezők: `AE`=hazai, `AF`=vendég, `AG/AH`=eredmény, `AD`=unix dátum, `ER`=forduló, `AB=3`=lejátszott. **Fragilis** — formátumváltásnál üres → statikus fallback.
- **Hulladék .ics**: a „push" valójában a telefon **naptár-alkalmazásának helyi emlékeztetője** (feliratkozás → `VALARM`), nem szerver-push.
- **Windy-térkép** (`RadarMap`): cross-origin iframe fölé „pajzs" — **kattintásra aktiválódik** (lejátszás/nagyítás), az egeret elvéve kikapcsol, hogy az oldal görgetése ne akadjon be.
- **DRV üzemszünet dátum-kinyerés** (`api/outages` `extractInterval`): a szabadszöveges értesítőből best-effort regex szedi ki az intervallumot (tartomány / egy nap + időablak).
- **Látogatószámláló Redisben, NEM fájlban** (`api/visits`): a Vercel serverless fájlrendszere **csak olvasható**, a példányok rövid életűek és nincs közös lemez — ezért runtime-ban tilos fájlba írni (`data/*.json` írás `EROFS`-szal elhasal). Bármi, ami munkamenetek közt tartós állapot (számláló, rate-limit stb.), külső tárolóba megy: itt **Upstash Redis** (`@upstash/redis`, REST). Az atomi `INCR` egyben megoldja a párhuzamos kérések versenyhelyzetét is. A kód mindkét env-elnevezést kezeli (`UPSTASH_REDIS_REST_URL/_TOKEN` és a `KV_REST_API_URL/_TOKEN` alias).

## 10. Design rendszer

`app/globals.css` `:root`:
- **Színek:** meleg papír háttér (`--paper #f2f0e6`), mélyzöld (`--green #23503f`), borostyán (`--amber`), tégla (`--brick`), kék (`--blue`).
- **Tipográfia:** `--serif` Georgia (címek), `--sans` system-ui (törzs), `--mono` (adat/kód).
- **Kártyák:** krém háttér, finom keret + árnyék, hover-emelés. Akcent-csík felül (`.accent-green/amber/brick/blue`).
- **Navigáció:** sötétzöld ragadós sáv (`.qbar`), aktív szekció kiemelve.

## 11. Deploy (Vercel)

1. `commit.bat` → kód a GitHubra.
2. Vercel → Import a repo → auto-detektálja a Next.js-t → **Deploy**.
3. Minden push → automatikus re-deploy.
4. **Publikusság:** Settings → Deployment Protection → *Vercel Authentication = Disabled* (különben login mögött van).

> ⚠️ **Deploy-blokk privát repónál:** ha a Vercel a push után azt írja, hogy *„… attempted to deploy … but they're not a member of the team"*, akkor a pusholó GitHub-fiók nincs összekötve a projektet birtokló Vercel-fiókkal. Megoldás: **tedd a repót publikussá** (GitHub → Settings → Change visibility), **vagy** a Vercel Authentication beállításánál kösd össze ugyanazt a GitHub-fiókot. (Ezt a projektet a repó publikussá tétele oldotta meg.)

### Upstash Redis (látogatószámláló tárolója)
A számláló egy hálózaton elérhető tárolót igényel (a serverless fájlrendszer nem perzisztens — lásd §9). Egyszeri beállítás a Vercelen:
1. **Vercel → a projekt → Storage → Create Database → Upstash → Redis.**
2. Régió: EU (pl. **Frankfurt / `eu-central-1`**); csomag: **Free** (napi ~10 000 művelet — bőven elég); **Custom Prefix: üresen hagyni** (különben a standard env-nevek elromlanak).
3. **Environments:** elég a **Production** (a Preview/Development bepipálása a saját tesztelésedet is beleszámolná a nyilvános számba).
4. **Connect Project → MislenyDash** → a Vercel automatikusan injektálja az env-változókat (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Kézi másolás nem kell, `.env`-et nem commitolunk.
5. Következő deploytól él a számláló. Lokálisan (nincs env) a szám egyszerűen nem jelenik meg — ez szándékos.

### Saját domain (`mislenyma.hu`)
- Vásárlás magyar regisztrátornál (pl. Rackhost). A `.hu`-t **nem** a Vercel árulja.
- DNS a regisztrátornál: **két `A` rekord** (`mislenyma.hu` és `www.mislenyma.hu`) → a Vercel által megadott IP-re. **CNAME nem kell.** Wildcard/`MX`/`NS` érintetlen.
- Vercel → Settings → Domains → add hozzá mindkettőt → megvárod a propagációt → automatikus HTTPS.
- ⚠️ Amíg a `.hu` regisztráció „folyamatban", a domain nem resolvál → a Vercel „Invalid Configuration"-t ír. Ez normális, várni kell az aktiválásra.

## 12. Ismert korlátok

- A **scraperek (DRV, hírek, kézilabda) törékenyek** — külső oldal formátumára építenek; változásnál üres eredmény → a kártyák gracefully statikus/„nincs adat" állapotba esnek, nem törik el az oldal.
- **Serverless cache-ek** (memóriabeli `Map`-ek) instanciánként mulandók; a Next `revalidate` gondoskodik a frissességről.
- Az **ügyeleti/egészségügyi adatok statikusak** — kézi frissítést igényelnek, ha a valóság változik (van `updated` dátum és `source` link a JSON-ban).
- **Kosárlabda:** nincs gépi forrás → csak statikus infó + hivatalos linkek.
- **Nyári holtszezon:** sportnál/riasztásnál üres lehet — ez korrekt, nem hiba.
- **Látogatószámláló ≈ egyedi, nem pontos:** böngészőnként/6 óránként egyszer számol (cookie-alapú dedup), nem valódi egyedi-látogató analitika. Aki törli a cookie-t vagy másik eszközről jön, újra beleszámít. Lokálisan és Preview/Development környezetben (ha nincs Redis env) a szám nem jelenik meg.

---

*MislenyMa — közösségi adat-dashboard Kozármislenyről.*
