import { memo } from "react";

import type React from "react";

interface AnimatedWrapperProps {
  children: React.ReactNode;
  show: boolean;
  delay?: number;
}

export const AnimatedWrapper = memo<AnimatedWrapperProps>(({ children, show, delay = 0 }) => {
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      style={{
        transitionDelay: show ? `${delay}ms` : "0ms"
      }}
    >
      {children}
    </div>
  );
});

AnimatedWrapper.displayName = "AnimatedWrapper";
