import { ImageResponse } from "next/og";

// A böngészőfülön / könyvjelzőben / Google-találatban megjelenő ikon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#23503f",
          color: "#f2f0e6",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 6,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
