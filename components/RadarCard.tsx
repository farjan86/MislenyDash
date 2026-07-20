// Interaktív időjárás-térkép (csapadékradar + műhold) a Windy beágyazásból.
// Kulcs nélkül, Kozármislenyre központozva; a felhasználó nagyíthat, réteget válthat.
const SRC =
  "https://embed.windy.com/embed2.html?lat=46.045&lon=18.272" +
  "&detailLat=46.045&detailLon=18.272&zoom=9&level=surface&overlay=radar" +
  "&menu=&message=&marker=true&calendar=&pressure=&type=map&location=coordinates" +
  "&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1";

export default function RadarCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="title">
          <span className="ico">🛰️</span>
          <h3>Csapadékradar</h3>
        </div>
        <span className="updated">Windy</span>
      </div>

      <div className="radar-wrap">
        <iframe
          src={SRC}
          title="Kozármisleny időjárás-radar és műholdtérkép"
          loading="lazy"
        />
      </div>
      <p className="source-note">
        Élő radar- és műholdtérkép — nagyíts, húzd, vagy válts réteget (eső,
        felhő, szél) a térképen.
      </p>
    </div>
  );
}
