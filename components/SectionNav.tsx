"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "ma", label: "Ma" },
  { id: "idojaras", label: "Időjárás" },
  { id: "hulladek", label: "Hulladék" },
  { id: "kozmu", label: "Közmű" },
  { id: "egeszseg", label: "Egészség" },
  { id: "sport", label: "Sport" },
  { id: "hirek", label: "Hírek" },
];

export default function SectionNav() {
  const [active, setActive] = useState("ma");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="snav" aria-label="Szakaszok">
      <div className="snav-inner wrap">
        <a href="#top" className="snav-brand">
          MislenyMa
        </a>
        <div className="snav-links">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={"#" + s.id}
              className={"snav-link" + (active === s.id ? " on" : "")}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
