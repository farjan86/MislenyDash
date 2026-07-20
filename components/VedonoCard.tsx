import health from "@/data/health.json";

type Vedono = {
  name: string;
  role: string;
  address: string;
  phone: string;
  schedule: { label: string; when: string }[];
  area: string;
};

export default function VedonoCard() {
  const list = health.healthVisitors as Vedono[];
  return (
    <div className="card accent-blue">
      <div className="card-head">
        <div className="title">
          <span className="ico">👶</span>
          <h3>Védőnői szolgálat</h3>
        </div>
      </div>

      <div className="pr-group vedono-grid">
        {list.map((v) => (
          <div className="pr" key={v.name}>
            <div className="pr-top">
              <div>
                <div className="pr-name">{v.name}</div>
                <div className="pr-role">{v.role}</div>
              </div>
            </div>

            <div className="vsched">
              {v.schedule.map((s, i) => (
                <div className="vs-row" key={i}>
                  <span className="vs-l">{s.label}</span>
                  <span className="vs-w">{s.when}</span>
                </div>
              ))}
            </div>

            <div className="pr-meta">
              <a href={"tel:" + v.phone.split("/")[0].replace(/[^+\d]/g, "")}>
                📞 {v.phone}
              </a>
              <span>📍 {v.address}</span>
            </div>

            <details className="pr-area">
              <summary>Körzethez tartozó terület</summary>
              <p>{v.area}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
