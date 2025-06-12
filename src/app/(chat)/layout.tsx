import type React from "react";
import { ReactNode } from "react";
import { LayoutContent } from "./LayoutContent";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutContent>{children}</LayoutContent>
  );
}
