import health from "@/data/health.json";
import PractitionerBlock, { type Practitioner } from "./PractitionerBlock";

export default function PharmacyCard() {
  return (
    <div className="card accent-green">
      <div className="card-head">
        <div className="title">
          <span className="ico">💊</span>
          <h3>Gyógyszertár</h3>
        </div>
      </div>

      <div className="pr-group">
        {(health.pharmacies as unknown as Practitioner[]).map((p) => (
          <PractitionerBlock key={p.name} p={p} />
        ))}
      </div>

      <div className="duty">
        🌙 <b>Ügyelet:</b> {health.pharmacyDuty.note}{" "}
        <a href={health.pharmacyDuty.url} target="_blank" rel="noreferrer">
          Pécsi ügyeleti beosztás →
        </a>
      </div>
    </div>
  );
}
