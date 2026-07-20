"use client";

import { useNow } from "@/lib/useNow";
import { isOpenNow, type Hours } from "@/lib/hours";
import WeekHours from "./WeekHours";

export type Practitioner = {
  name: string;
  role?: string;
  address: string;
  phone: string;
  hours?: Hours | null;
  extra?: string;
  area?: string;
  web?: string;
};

function telHref(phone: string): string {
  const first = phone.split("/")[0];
  return "tel:" + first.replace(/[^+\d]/g, "");
}

export default function PractitionerBlock({ p }: { p: Practitioner }) {
  const now = useNow();
  const open = now && p.hours ? isOpenNow(p.hours, now) : null;

  return (
    <div className="pr">
      <div className="pr-top">
        <div>
          <div className="pr-name">{p.name}</div>
          {p.role && <div className="pr-role">{p.role}</div>}
        </div>
        {open !== null && (
          <span className={"badge " + (open ? "open" : "closed")}>
            {open ? "Most nyitva" : "Zárva"}
          </span>
        )}
      </div>

      {p.hours && <WeekHours hours={p.hours} />}

      <div className="pr-meta">
        {p.phone && <a href={telHref(p.phone)}>📞 {p.phone}</a>}
        <span>📍 {p.address}</span>
        {p.web && (
          <a href={p.web} target="_blank" rel="noreferrer">
            🌐 Weboldal
          </a>
        )}
      </div>

      {p.extra && <div className="pr-extra">{p.extra}</div>}

      {p.area && (
        <details className="pr-area">
          <summary>Körzethez tartozó utcák</summary>
          <p>{p.area}</p>
        </details>
      )}
    </div>
  );
}
