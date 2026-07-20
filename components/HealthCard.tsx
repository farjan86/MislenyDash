import health from "@/data/health.json";
import PractitionerBlock, { type Practitioner } from "./PractitionerBlock";

const GROUPS: { key: keyof typeof health.doctors; label: string }[] = [
  { key: "gp", label: "Háziorvos" },
  { key: "pediatric", label: "Gyermekorvos" },
  { key: "dentist", label: "Fogorvos" },
];

export default function HealthCard() {
  return (
    <div className="card accent-blue">
      <div className="card-head">
        <div className="title">
          <span className="ico">🩺</span>
          <h3>Orvosi rendelés</h3>
        </div>
      </div>

      {GROUPS.map((g) => (
        <div className="pr-group" key={g.key}>
          <div className="pr-gh">{g.label}</div>
          {(health.doctors[g.key] as unknown as Practitioner[]).map((p) => (
            <PractitionerBlock key={p.name} p={p} />
          ))}
        </div>
      ))}

      <p className="source-note">
        Forrás:{" "}
        <a href={health.source} target="_blank" rel="noreferrer">
          kozarmisleny.hu
        </a>{" "}
        · foglalás előtt ellenőrizd.
      </p>
    </div>
  );
}
