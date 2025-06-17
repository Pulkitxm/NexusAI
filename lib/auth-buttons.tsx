"use client";

import { signIn, signOut } from "next-auth/react";
import React, { cloneElement, Children, isValidElement } from "react";

export function LogOutButton({ children }: { children: React.ReactNode }) {
  const child = Children.only(children);

  if (!isValidElement<{ onClick?: () => void }>(child)) {
    return <>{children}</>;
  }

  return cloneElement(child, {
    onClick: () => signOut()
  });
}

export function LogInButton({ children }: { children: React.ReactNode }) {
  const child = Children.only(children);

  if (!isValidElement<{ onClick?: () => void }>(child)) {
    return <>{children}</>;
  }

  return cloneElement(child, {
    onClick: () => signIn("google")
  });
}
