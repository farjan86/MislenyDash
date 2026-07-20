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
│     └─ handball/          # Kozármisleny KA (eredmenyek.com scrape)
├─ components/              # kártyák és UI-elemek (lásd lent)
├─ lib/                     # segédfüggvények (waste, flashscore, hours, useNow)
├─ data/
│  ├─ health.json           # orvos/gyógyszertár/állatorvos/védőnő/ügyelet (STATIKUS)
│  ├─ waste-2026.json       # hulladéknaptár dátumai (STATIKUS)
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

## 7. API route-ok részletei

- **`/api/weather-alerts`** — MeteoAlarm JSON feedből a `hu-HU` nyelvű, `HU23` (Dél-Dunántúl) régióra érvényes, **sárga+** (2. szint felett) és nem lejárt figyelmeztetések. Zöld (1) és lejárt kimarad.
- **`/api/outages`** — E.ON `poweroutage.json`/`gasoutage.json` (memóriabeli TTL-cache, mert >2 MB, nem fér a Next fetch-cache-be), + DRV víz-scrape. Kozármislenyre szűr. `?city=` paraméterrel más településre is.
- **`/api/kuka.ics`** — iCalendar feed a hulladéknaptárhoz. Minden ürítés egy esemény + `VALARM` (előző este 18:00 emlékeztető). A vegyes heti ismétlődő (`RRULE:WEEKLY;BYDAY=TU`). Feliratkozás: `webcal://…/api/kuka.ics`.
- **`/api/news`** — helyi/megyei hírek scrape-elve, cím + link + dátum.
- **`/api/football`** — TheSportsDB: következő meccs, utolsó eredmények, tabella-pozíció.
- **`/api/handball`** — eredmenyek.com HTML-be ágyazott Flashscore-feed parse-olása (`lib/flashscore.ts`), Kozármisleny KA meccsei. Best-effort → hiba esetén a kártya statikus infóra vált.

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

## 10. Design rendszer

`app/globals.css` `:root`:
- **Színek:** meleg papír háttér (`--paper #f2f0e6`), mélyzöld (`--green #23503f`), borostyán (`--amber`), tégla (`--brick`), kék (`--blue`).
- **Tipográfia:** `--serif` Georgia (címek), `--sans` system-ui (törzs), `--mono` (adat/kód).
- **Kártyák:** krém háttér, finom keret + árnyék, hover-emelés. Akcent-csík felül (`.accent-green/amber/brick/blue`).
- **Navigáció:** sötétzöld ragadós sáv (`.qbar`), aktív szekció kiemelve.

## 11. Deploy (Vercel)

1. `commit.bat` → kód a GitHubra.
2. Vercel → Import a repo → auto-detektálja a Next.js-t → **Deploy** (nincs env-változó, nincs adatbázis).
3. Minden push → automatikus re-deploy.
4. **Publikusság:** Settings → Deployment Protection → *Vercel Authentication = Disabled* (különben login mögött van).

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

---

*MislenyMa — közösségi adat-dashboard Kozármislenyről.*
