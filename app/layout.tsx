import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MislenyDash — Kozármisleny élő adatai",
  description:
    "Közösségi adat-dashboard Kozármislenyről: időjárás, hulladéknaptár és minden, ami helyben hasznos — egy helyen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
