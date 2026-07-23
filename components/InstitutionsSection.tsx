import data from "@/data/institutions.json";
import type { Hours } from "@/lib/hours";
import WeekHours from "./WeekHours";

// Város intézményei (oktatás, szociális, kultúra) — statikus adatból,
// kategóriánként rácsba szedve. Ugyanaz a kártya-nyelv, mint a
// PractitionerBlock / OfficeCard: név + típus, nyitvatartás-csík, elérhetőségek.

type Institution = {
  icon?: string;
  name: string;
  kind?: string;
  address: string;
  phones?: string[];
  email?: string;
  web?: string;
  leader?: { role: string; name: string };
  hoursLabel?: string;
  hours?: Hours;
  hoursNote?: string;
};

const tel = (phone: string) => "tel:" + phone.replace(/[^+\d]/g, "");

function InstitutionCard({ inst, accent }: { inst: Institution; accent: string }) {
  return (
    <div className={"card accent-" + accent}>
      <div className="card-head">
        <div className="title">
          {inst.icon && <span className="ico">{inst.icon}</span>}
          <h3>{inst.name}</h3>
        </div>
      </div>

      {inst.kind && <div className="pr-role">{inst.kind}</div>}

      {inst.leader && (
        <div className="pr-name" style={{ marginTop: 8 }}>
          {inst.leader.name}
          <span className="pr-role" style={{ display: "inline", marginLeft: 8 }}>
            {inst.leader.role}
          </span>
        </div>
      )}

      {inst.hours && (
        <>
          {inst.hoursLabel && (
            <div className="pr-gh" style={{ marginTop: 12 }}>{inst.hoursLabel}</div>
          )}
          <WeekHours hours={inst.hours} />
        </>
      )}
      {inst.hoursNote && <div className="pr-extra">{inst.hoursNote}</div>}

      <div className="pr-meta">
        {inst.phones?.map((p) => (
          <a key={p} href={tel(p)}>📞 {p}</a>
        ))}
        {inst.email && <a href={"mailto:" + inst.email}>✉️ {inst.email}</a>}
        <span>📍 {inst.address}</span>
        {inst.web && (
          <a href={inst.web} target="_blank" rel="noreferrer">🌐 Weboldal</a>
        )}
      </div>
    </div>
  );
}

export default function InstitutionsSection() {
  return (
    <>
      {data.categories.map((cat) => (
        <div key={cat.id} className="inst-group">
          <div className="pr-gh inst-gh">{cat.eyebrow} · {cat.title}</div>
          <div className="dash grid">
            {cat.items.map((inst) => (
              <InstitutionCard key={inst.name} inst={inst as Institution} accent={cat.accent} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
