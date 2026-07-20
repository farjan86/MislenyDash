# MislenyDash

Közösségi adat-dashboard Kozármisleny városról — egy helyen összegyűjtve a
lakosság számára rendszeresen hasznos, automatikusan frissülő adatok.

## Cél

Statikus, olcsón hostolható egyoldalas oldal, amelyet ütemezett lekérések
(pl. GitHub Actions cron → JSON a `data/` mappába) töltenek fel adattal.
Szerver nélkül is működik.

## Adatforrások — megvalósíthatósági jegyzet

Utolsó ellenőrzés: 2026-07-18

### ✅ Önkormányzati hírek — JÓL integrálható
- Oldal: https://www.kozarmisleny.hu/hirek — **WordPress** (készítő: W5 labs).
- WordPress alapból ad RSS feedet: próbálandó `https://kozarmisleny.hu/feed/`
  vagy `https://www.kozarmisleny.hu/hirek/feed/`.
- Ha nincs RSS: a hírlista strukturált HTML (dátum + thumbnail + saját URL,
  pagination) → könnyen scrapelhető.
- Alternatíva: az önkormányzat "Munipolis" portált is használ.
- Frissülés: naponta/hetente. **Automatizálható.**

### ✅ Helyi sport (SE Kozármisleny) — JÓL integrálható
- Csapat: HR-RENT KOZÁRMISLENY, NB II (Merkantil Bank Liga).
- Forrás 1: https://www.eredmenyek.com/csapat/kozarmisleny/Yik4F60k/
  (Flashscore-alapú) — következő meccsek, eredmények, tabella, keret,
  real-time frissül. Scrapelhető.
- Forrás 2: MLSZ adatbank — https://adatbank.mlsz.hu/ (hivatalos).
- Frissülés: mérkőzésenként. **Automatizálható.**

### ✅ Áram- / gáz-szünet — integrálható (endpoint feltárás kell)
- E.ON online **interaktív térkép** a tervezett áram- ÉS gázszünetekről,
  településre szűrhető. Interaktív térkép = van mögötte JSON backend, amit
  fel lehet deríteni (böngésző Network fül) és lekérdezni Kozármislenyre.
- Belépő: https://www.eon.hu/hu/lakossagi/aram/aramszunet-informaciok.html
- Az önkormányzat is közli hírként a helyi áramszüneteket (fallback).
- Frissülés: eseti. **Automatizálható, de reverse-engineering kell.**
- Víz: Baranya-Víz / helyi vízmű értesítők — külön csatorna, valószínűleg
  scraping vagy manuális.

### ✅ Hulladéknaptár — MEGOLDVA, PDF gépileg parse-olható
- Közvetlen, stabil URL: https://delkom.hu/letoltes/hulladeknaptar/Kozarmisleny.pdf
  (a delkom.hu/letoltes böngészőnézete 403-at ad, de a direkt PDF 200 OK).
- `pdftotext -layout` kiadja a teljes 2026-os menetrendet: kommunális /
  szelektív / zöldhulladék ürítési napok hónapokra bontva, lomtalanítás
  (2026-03-18/19, 10-01/02), sőt utcánkénti keleti/nyugati oldal bontás.
- Letöltve: data/Kozarmisleny_hulladek.pdf
- Terv: évi 1x cron → PDF letölt + parse → data/hulladek.json → dashboard
  számolja a "következő ürítés" napot. Automatizálható, nem törékeny.

## MVP (5 kártya)
1. Időjárás + levegőminőség — Open-Meteo API (kulcs nélkül, azonnal megy)
2. Következő hulladékszállítás — `data/hulladek.json`-ból számolva
3. Aktuális/közelgő áram-gázszünet — E.ON térkép backend
4. Következő SE Kozármisleny meccs + utolsó eredmény
5. Önkormányzati hírek — utolsó 5 bejegyzés (RSS/scrape)

## Struktúra (terv)
```
mislenydash/
  index.html        # a dashboard (statikus)
  data/             # ütemezetten frissülő JSON-ok
    hulladek.json
    weather.json
    outages.json
    sport.json
    news.json
  scripts/          # a lekérő/frissítő scriptek
```
