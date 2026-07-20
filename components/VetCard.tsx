import health from "@/data/health.json";
import PractitionerBlock, { type Practitioner } from "./PractitionerBlock";

export default function VetCard() {
  return (
    <div className="card accent-green">
      <div className="card-head">
        <div className="title">
          <span className="ico">🐾</span>
          <h3>Állatorvos</h3>
        </div>
      </div>

      <div className="pr-group">
        {(health.vets as unknown as Practitioner[]).map((p) => (
          <PractitionerBlock key={p.name} p={p} />
        ))}
      </div>
    </div>
  );
}
