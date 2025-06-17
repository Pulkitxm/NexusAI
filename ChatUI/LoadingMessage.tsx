"use client";

export function LoadingMessage() {
  return (
    <div className="mb-6 flex justify-start gap-2 duration-500 animate-in fade-in-0 slide-in-from-bottom-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.2s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.1s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500" />
    </div>
  );
}
