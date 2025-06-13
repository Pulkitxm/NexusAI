"use client";

import { signOut } from "next-auth/react";
import React, { cloneElement, Children, isValidElement } from "react";

export function LogOut({ children }: { children: React.ReactNode }) {
  const child = Children.only(children);

  if (!isValidElement<{ onClick?: () => void }>(child)) {
    return <>{children}</>;
  }

  return cloneElement(child, {
    onClick: () => signOut(),
  });
}