// Egyszeri segéd: kinyeri a hulladék-PDF nyers szövegét, hogy lássuk a szerkezetét.
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const pdfPath = path.join(__dirname, "..", "data", "Kozarmisleny_hulladek.pdf");
const outPath = path.join(__dirname, "..", "scratchpad-waste-raw.txt");

(async () => {
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  const res = await parser.getText();
  fs.writeFileSync(outPath, res.text, "utf8");
  console.log("Szöveg hossz:", res.text.length);
  console.log("=== ELSŐ 3000 KARAKTER ===");
  console.log(res.text.slice(0, 3000));
  await parser.destroy();
})();
