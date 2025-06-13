"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});
const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
});
const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
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
};

type FontContextType = {
  currentFont: string;
  setCurrentFont: (font: string) => void;
};

const FontContext = createContext<FontContextType>({
  currentFont: "inter",
  setCurrentFont: () => {},
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
    setCurrentFont(font);
    localStorage.setItem("customFont", font);
  };

  return (
    <FontContext.Provider
      value={{ currentFont, setCurrentFont: handleFontChange }}
    >
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
