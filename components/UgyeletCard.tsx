import health from "@/data/health.json";

type Contact = {
  name: string;
  addr?: string;
  tel: string;
  dial: string;
  hours?: string;
  note?: string;
};

const E = health.emergency;

function Item({ kind, c }: { kind: string; c: Contact }) {
  return (
    <div className="uc-item">
      <div className="uci-kind">{kind}</div>
      <div className="uci-name">{c.name}</div>
      {c.addr && <div className="uci-addr">📍 {c.addr}</div>}
      {(c.hours || c.note) && <div className="uci-meta">{c.hours ?? c.note}</div>}
      <a className="up-tel uci-tel" href={"tel:" + c.dial}>
        📞 {c.tel}
      </a>
    </div>
  );
}

type Line = { label: string; tel: string; dial: string; note?: string };

function PhoneLine({ c }: { c: Line }) {
  return (
    <div className="uc-line">
      <div className="ucl-txt">
        <div className="uci-kind">{c.label}</div>
        {c.note && <div className="uci-meta">{c.note}</div>}
      </div>
      <a className="up-tel" href={"tel:" + c.dial}>
        📞 {c.tel}
      </a>
    </div>
  );
}

function Column({
  title,
  group,
}: {
  title: string;
  group: { place: string; addr: string; duty: Line; emergency: Line };
}) {
  return (
    <div className="ugy-col">
      <div className="uc-head">{title}</div>
      <div className="uc-place">
        📍 {group.place} · {group.addr}
      </div>
      <PhoneLine c={group.duty} />
      <PhoneLine c={group.emergency} />
    </div>
  );
}

export default function UgyeletCard() {
  return (
    <div className="card accent-brick">
      <div className="card-head">
        <div className="title">
          <span className="ico">🚑</span>
          <h3>Orvosi ügyelet — hova menjek?</h3>
        </div>
        <span className="updated">Pécs</span>
      </div>

      {/* Életveszély — mindig elöl, nagy hívógomb */}
      <a className="ugy-life" href={"tel:" + E.life.dial}>
        <span className="ul-ico">🚨</span>
        <span className="ul-txt">
          <b>{E.life.label}</b>
          <span className="ul-sub">{E.life.note}</span>
        </span>
        <span className="ul-num">{E.life.tel}</span>
      </a>

      {/* Központi ügyeleti hívószám */}
      <div className="ugy-central">
        <span>☎️ {E.central.label}</span>
        <a className="up-tel" href={"tel:" + E.central.dial}>
          📞 {E.central.tel}
        </a>
      </div>
      <div className="ugy-hours">{E.central.hours}</div>
      {E.central.desc && <p className="ugy-desc">{E.central.desc}</p>}

      <div className="ugy-cols">
        <Column title="🧑 Felnőtt" group={E.adult} />
        <Column title="🧒 Gyermek" group={E.child} />
      </div>

      {/* Fogászati ügyelet — felnőtt és gyermek közös */}
      <div className="ugy-col ugy-dental">
        <div className="uc-head">🦷 Fogászati ügyelet</div>
        <Item kind="Hétvégi / ünnepnapi fogászat" c={E.dental} />
      </div>

      <p className="ugy-note">
        {E.note}{" "}
        <a href={E.source} target="_blank" rel="noreferrer">
          (forrás)
        </a>
      </p>
    </div>
  );
}
