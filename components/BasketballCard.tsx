// Kozármisleny SE kosárlabda szakosztály — statikus infó.
// Megyei / NB2 szinten nincs strukturált, géppel olvasható eredményforrás,
// ezért itt nincs élő adat, csak a szakosztály adatai és a hivatalos linkek.

const SITE = "https://basketkozarmislenyse.hu/";
const FB = "https://www.facebook.com/basketkozarmislenyse/";

export default function BasketballCard() {
  return (
    <div className="card accent-amber">
      <div className="card-head">
        <div className="title">
          <span className="ico">🏀</span>
          <h3>Kozármisleny SE Kosárlabda</h3>
        </div>
        <span className="updated">Megyei / NB2</span>
      </div>

      <div className="sport-static">
        <p>
          A 2014-ben újraindított kosárlabda-szakosztály felnőtt és utánpótlás
          csapatokkal. Erről a szintről nincs élő, géppel olvasható eredmény­forrás,
          ezért a friss meccsek a szakosztály hivatalos felületein követhetők.
        </p>
        <div className="sport-links">
          <a className="btn ghost" href={SITE} target="_blank" rel="noreferrer">
            🔗 Honlap
          </a>
          <a className="btn ghost" href={FB} target="_blank" rel="noreferrer">
            📘 Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
