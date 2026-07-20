"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    // A POST növeli a számlálót (munkamenetenként egyszer, cookie alapján),
    // és visszaadja az aktuális összeget.
    fetch("/api/visits", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d.total === "number") setTotal(d.total);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <span>
      {total === null ? "· látogató" : `${total.toLocaleString("hu-HU")} látogató`}
    </span>
  );
}
