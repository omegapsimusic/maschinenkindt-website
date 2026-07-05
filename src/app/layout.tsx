import type { Metadata, Viewport } from "next";
import { Teko, Chakra_Petch, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Cursor } from "@/components/site/cursor";
import { Intro } from "@/components/site/intro";
import { PlayerVisualizerProvider } from "@/components/site/player-visualizer-context";
import { TribalVisualizer } from "@/components/site/tribal-visualizer";

const teko = Teko({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-teko",
  display: "swap",
});

const chakra = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MASCHINENKINDT — Hardtechno",
  description:
    "Maschinenkindt — rituelle Maschinenmusik. Hardtechno zwischen 150 und 180 BPM. Diskographie, Biographie und Booking.",
  keywords: ["Maschinenkindt", "Hardtechno", "Techno", "Booking", "Rave"],
  openGraph: {
    title: "MASCHINENKINDT — Hardtechno",
    description: "Rituelle Maschinenmusik. 150–180 BPM.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${teko.variable} ${chakra.variable} ${spaceMono.variable}`}
    >
      <body className="u-grain u-vignette-global min-h-dvh antialiased">
        <Script src="https://open.spotify.com/embed/iframe-api/v1" strategy="afterInteractive" />
        <PlayerVisualizerProvider>
          <Intro />
          <Cursor />
          <SmoothScroll>{children}</SmoothScroll>
          <TribalVisualizer />
        </PlayerVisualizerProvider>
      </body>
    </html>
  );
}
