import {
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";

/** Landing typography (template identity), loaded only on public pages. */
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-landing-sans",
});
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-landing-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-landing-mono",
});

export const landingFonts = `${sans.variable} ${display.variable} ${mono.variable}`;
