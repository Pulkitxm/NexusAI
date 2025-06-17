"use client";

import {
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Poppins,
  Montserrat,
  Raleway,
  Nunito,
  Source_Sans_3,
  Merriweather,
  Oswald,
  Playfair_Display,
  Ubuntu,
  Rubik,
  Quicksand,
  Cabin,
  Josefin_Sans,
  Dancing_Script,
  Comfortaa
} from "next/font/google";
import { createContext, useContext, useEffect, useState } from "react";

import { debugLog } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto"
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans"
});
const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato"
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins"
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat"
});
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro"
});
const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald"
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display"
});
const ubuntu = Ubuntu({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu"
});
const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik"
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand"
});
const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-cabin"
});
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin-sans"
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script"
});
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa"
});

const fonts = {
  inter,
  roboto,
  "open-sans": openSans,
  lato,
  poppins,
  montserrat,
  raleway,
  nunito,
  "source-sans-pro": sourceSansPro,
  merriweather,
  oswald,
  "playfair-display": playfairDisplay,
  ubuntu,
  rubik,
  quicksand,
  cabin,
  "josefin-sans": josefinSans,
  "dancing-script": dancingScript,
  comfortaa
};

type FontContextType = {
  currentFont: string;
  setCurrentFont: (font: string) => void;
};

const FontContext = createContext<FontContextType>({
  currentFont: "inter",
  setCurrentFont: () => {}
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [currentFont, setCurrentFont] = useState("inter");

  useEffect(() => {
    const savedFont = localStorage.getItem("customFont");
    if (savedFont) {
      setCurrentFont(savedFont);
    }
  }, []);

  const handleFontChange = (font: string) => {
    debugLog("Font changed to", font);
    setCurrentFont(font);
    localStorage.setItem("customFont", font);
  };

  return (
    <FontContext.Provider value={{ currentFont, setCurrentFont: handleFontChange }}>
      <div
        className={`${Object.values(fonts)
          .map((font) => font.variable)
          .join(" ")} font-${currentFont}`}
      >
        {children}
      </div>
    </FontContext.Provider>
  );
}

export const useFont = () => useContext(FontContext);
