"use client";

import { useState, type FormEvent } from "react";
import { DEV_EMAIL, FEEDBACK_MAX } from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const ERRORS: Record<string, string> = {
  too_short: "Írj legalább pár szót az ötletedről.",
  too_long: "Túl hosszú az üzenet — rövidítsd le egy kicsit.",
  bad_email: "Az e-mail-cím nem tűnik érvényesnek.",
  rate_limited: "Most túl sok üzenet érkezett tőled — próbáld meg egy óra múlva.",
};

const SUBJECT = "MislenyMa — fejlesztési ötlet";

export default function FeedbackCard() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // méregcsapda robotoknak
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // A látogató saját levelezőjét megnyitó link, előre kitöltött szöveggel.
  const mailto =
    `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(SUBJECT)}` +
    (message.trim()
      ? `&body=${encodeURIComponent(message.trim() + (name.trim() ? `\n\n${name.trim()}` : ""))}`
      : "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, name, email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("sent");
        setMessage("");
        return;
      }
      if (ERRORS[data.error]) {
        setError(ERRORS[data.error]);
        setStatus("error");
        return;
      }
    } catch {
      // hálózati hiba → lent a levelezős tartalék
    }
    // A közvetlen küldés most nem megy (nincs beállítva vagy hibázott):
    // nyissuk meg a látogató levelezőjét a már megírt szöveggel.
    setStatus("mailto");
    window.location.href = mailto;
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="title">
          <span className="ico">💡</span>
          <h3>Van egy ötleted?</h3>
        </div>
        <span className="updated">a fejlesztőnek megy</span>
      </div>

      <p className="fb-lead">
        Hiányzik valami az oldalról, rossz egy adat, vagy lenne egy jó ötleted? Írd meg
        itt — közvetlenül a fejlesztőhöz érkezik.
      </p>

      {status === "sent" ? (
        <div className="fb-done" role="status">
          <b>✓ Köszönöm, megkaptam!</b> Minden üzenetet elolvasok.
          <button type="button" className="btn ghost" onClick={() => setStatus("idle")}>
            Írok még egyet
          </button>
        </div>
      ) : (
        <form className="fb-form" onSubmit={submit}>
          <label className="fb-field">
            <span>Az ötleted</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={5}
              maxLength={FEEDBACK_MAX}
              rows={5}
              placeholder="Pl. jó lenne, ha a buszmenetrend is látszana…"
            />
          </label>

          <div className="fb-row">
            <label className="fb-field">
              <span>Neved (nem kötelező)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoComplete="name"
              />
            </label>
            <label className="fb-field">
              <span>E-mail-címed, ha választ kérsz (nem kötelező)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                autoComplete="email"
                inputMode="email"
              />
            </label>
          </div>

          {/* Méregcsapda: embernek láthatatlan, a robotok kitöltik. */}
          <div className="fb-hp" aria-hidden="true">
            <label>
              Weboldal
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          {status === "error" && (
            <p className="fb-msg err" role="alert">
              {error}
            </p>
          )}
          {status === "mailto" && (
            <p className="fb-msg" role="status">
              A közvetlen küldés most nem sikerült, ezért megnyitottam a leveleződet a
              megírt szöveggel. Ha nem nyílt meg, írj ide:{" "}
              <a href={mailto}>{DEV_EMAIL}</a>
            </p>
          )}

          <div className="linkrow">
            <button type="submit" className="btn primary" disabled={status === "sending"}>
              {status === "sending" ? "Küldés…" : "✉️ Elküldöm"}
            </button>
          </div>
        </form>
      )}

      <p className="fb-direct">
        Vagy írj közvetlenül e-mailben: <a href={mailto}>{DEV_EMAIL}</a>
      </p>
    </div>
  );
}
