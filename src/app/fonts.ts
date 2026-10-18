import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";

export const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--ff-display",
});

export const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--ff-body",
});

export const num = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--ff-num",
});

export const fontVariables = [display.variable, body.variable, num.variable].join(" ");
