"use client";

// Ragadós navigációs sáv (nem tartalom!): sötét, márkaszínű háttér, világos
// linkek ikonnal, és az aktuális szekció kiemelése — így vizuálisan menüsor.
import { useEffect, useState } from "react";

const LINKS = [
  { id: "idojaras", icon: "☀️", label: "Időjárás" },
  { id: "hulladek", icon: "🗑️", label: "Hulladék" },
  { id: "kozmu", icon: "⚡", label: "Áram·gáz·víz" },
  { id: "egeszseg", icon: "🩺", label: "Egészség" },
  { id: "sport", icon: "⚽", label: "Sport" },
  { id: "hirek", icon: "📰", label: "Hírek" },
];

export default function QuickTiles() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="qbar" aria-label="Gyors elérés">
      <div className="qbar-inner wrap">
        <a href="#top" className="qbar-brand">
          MislenyMa
        </a>
        <div className="qbar-links">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={"#" + l.id}
              className={"qbar-link" + (active === l.id ? " on" : "")}
            >
              <span className="qbar-ico">{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
