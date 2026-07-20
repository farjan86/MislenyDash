// A Dél-Kom 2026-os Kozármisleny hulladéknaptárból (data/Kozarmisleny_hulladek.pdf)
// kiolvasott hónap-nap listákból generálja a data/waste-2026.json-t.
// A PDF évente 1x frissül → ilyenkor a lenti tömböket kell frissíteni.
const fs = require("fs");
const path = require("path");

const YEAR = 2026;

// Havi ürítési napok (index 0 = január … 11 = december) — a PDF táblázatából.
const SZELEKTIV = [
  [6, 20], [3, 17], [3, 17, 31], [14, 28], [12, 26], [9, 23],
  [7, 21], [4, 18], [1, 15, 29], [13, 27], [10, 24], [8, 22],
];
const ZOLD = [
  [13, 27], [10, 24], [10, 24], [7, 21], [5, 19], [2, 16, 30],
  [14, 28], [11, 25], [8, 22], [6, 20], [3, 17], [1, 15, 29],
];

const iso = (month0, day) =>
  `${YEAR}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const toDates = (monthly) =>
  monthly.flatMap((days, m) => days.map((d) => iso(m, d)));

const data = {
  year: YEAR,
  source: "https://delkom.hu/letoltes/hulladeknaptar/Kozarmisleny.pdf",
  updated: "2026-07-19",
  note:
    "A kommunális (vegyes) hulladékot hetente szállítják; a PDF nem ad rá dátumsort. " +
    "A szelektív és a zöldhulladék dátumai a Dél-Kom 2026-os naptárából származnak.",
  types: {
    szelektiv: { label: "Szelektív", icon: "♻️", dates: toDates(SZELEKTIV) },
    zold: { label: "Zöldhulladék", icon: "🌿", dates: toDates(ZOLD) },
  },
  lomtalanitas: [
    { date: `${YEAR}-03-18`, note: "keleti oldal" },
    { date: `${YEAR}-03-19`, note: "nyugati oldal" },
    { date: `${YEAR}-10-01`, note: "keleti oldal" },
    { date: `${YEAR}-10-02`, note: "nyugati oldal" },
  ],
};

const outPath = path.join(__dirname, "..", "data", "waste-2026.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(
  `Kész: ${outPath}\n  szelektív: ${data.types.szelektiv.dates.length} nap\n` +
  `  zöldhulladék: ${data.types.zold.dates.length} nap`
);
