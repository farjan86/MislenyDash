import type { Metadata } from "next";
import "./globals.css";

const SITE = "https://mislenyma.hu";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "MislenyMa — Kozármisleny élő adatai egy helyen",
    template: "%s · MislenyMa",
  },
  description:
    "Kozármisleny élő városi adatai egy helyen: időjárás, hulladéknaptár, áramszünet, orvosi ügyelet, gyógyszertár, védőnő, helyi hírek és SE Kozármisleny sport.",
  keywords: [
    "Kozármisleny",
    "Kozármisleny időjárás",
    "Kozármisleny hulladéknaptár",
    "Kozármisleny áramszünet",
    "Kozármisleny orvosi ügyelet",
    "Kozármisleny gyógyszertár",
    "Kozármisleny hírek",
    "MislenyMa",
  ],
  applicationName: "MislenyMa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: SITE,
    siteName: "MislenyMa",
    title: "MislenyMa — Kozármisleny élő adatai egy helyen",
    description:
      "Időjárás, hulladéknaptár, áramszünet, orvos, gyógyszertár és helyi hírek Kozármislenyről — egy helyen, élőben.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "MislenyMa",
      description:
        "Kozármisleny élő városi adatai egy helyen: időjárás, hulladéknaptár, áramszünet, egészségügy, helyi hírek és sport.",
      inLanguage: "hu-HU",
      about: {
        "@type": "City",
        name: "Kozármisleny",
        address: {
          "@type": "PostalAddress",
          postalCode: "7761",
          addressLocality: "Kozármisleny",
          addressCountry: "HU",
        },
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
