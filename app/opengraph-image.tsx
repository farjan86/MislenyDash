import { ImageResponse } from "next/og";

// Megosztási előnézeti kép (Facebook, Messenger, WhatsApp, helyi csoportok).
export const alt = "MislenyMa — Kozármisleny élő városi adatai egy helyen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #23503f 0%, #1c4132 100%)",
          color: "#f2f0e6",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "88px",
              height: "88px",
              borderRadius: "20px",
              background: "#f2f0e6",
              color: "#23503f",
              fontSize: "54px",
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c9d8d0",
            }}
          >
            Kozármisleny
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "104px", fontWeight: 800 }}>
          MislenyMa
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "40px",
            marginTop: "22px",
            maxWidth: "940px",
            color: "#dbe7e0",
            lineHeight: 1.3,
          }}
        >
          A város élő adatai egy helyen — időjárás, hulladéknaptár, áramszünet,
          orvos és helyi hírek.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "46px",
            height: "8px",
            width: "190px",
            background: "#b07a1c",
            borderRadius: "4px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
