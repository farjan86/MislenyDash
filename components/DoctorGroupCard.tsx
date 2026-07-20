import health from "@/data/health.json";
import PractitionerBlock, { type Practitioner } from "./PractitionerBlock";

type Group = "gp" | "pediatric" | "dentist";

const META: Record<Group, { label: string; icon: string }> = {
  gp: { label: "Háziorvos", icon: "🩺" },
  pediatric: { label: "Gyermekorvos", icon: "🧸" },
  dentist: { label: "Fogorvos", icon: "🦷" },
};

export default function DoctorGroupCard({ group }: { group: Group }) {
  const m = META[group];
  const docs = health.doctors[group] as unknown as Practitioner[];

  return (
    <div className="card accent-blue">
      <div className="card-head">
        <div className="title">
          <span className="ico">{m.icon}</span>
          <h3>{m.label}</h3>
        </div>
      </div>

      <div className="pr-group">
        {docs.map((p) => (
          <PractitionerBlock key={p.name} p={p} />
        ))}
      </div>

      <p className="source-note">
        Forrás:{" "}
        <a href={health.source} target="_blank" rel="noreferrer">
          kozarmisleny.hu
        </a>
      </p>
    </div>
  );
}
