import office from "@/data/office.json";

const tel = (phone: string) => "tel:" + phone.replace(/[^+\d]/g, "");

export default function OfficeCard() {
  return (
    <div className="card accent-ink">
      <div className="card-head">
        <div className="title">
          <span className="ico">🏛️</span>
          <h3>Polgármesteri Hivatal</h3>
        </div>
      </div>

      <div className="pr">
        <div className="pr-name">{office.name}</div>
        <div className="pr-meta">
          <a href={tel(office.phone)}>📞 {office.phone}</a>
          <a href={"mailto:" + office.email}>✉️ {office.email}</a>
          <span>📍 {office.address}</span>
        </div>
      </div>

      <div className="pr">
        <div className="pr-role">Pénztár / ügyintézés</div>
        <div className="vsched">
          {office.cashierHours.map((h) => (
            <div className="vs-row" key={h.label}>
              <span className="vs-l">{h.label}</span>
              <span className="vs-w">{h.when}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pr-group">
        {office.officials.map((o) => (
          <div className="pr" key={o.role}>
            <div className="pr-top">
              <div>
                <div className="pr-name">{o.name}</div>
                <div className="pr-role">{o.role}</div>
              </div>
            </div>
            <div className="vsched">
              <div className="vs-row">
                <span className="vs-l">
                  Fogadóóra{o.note ? ` (${o.note})` : ""}
                </span>
                <span className="vs-w">{o.when}</span>
              </div>
            </div>
            <div className="pr-meta">
              {o.phone ? <a href={tel(o.phone)}>📞 {o.phone}</a> : null}
              {o.email ? <a href={"mailto:" + o.email}>✉️ {o.email}</a> : null}
              {o.address ? <span>📍 {o.address}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="duty">
        ℹ️ További elérhetőségek:{" "}
        <a href={office.sourceUrl} target="_blank" rel="noreferrer">
          kozarmisleny.hu/kapcsolat →
        </a>
      </div>
    </div>
  );
}
