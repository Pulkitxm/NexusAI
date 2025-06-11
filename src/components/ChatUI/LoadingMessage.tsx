"use client";

export function LoadingMessage() {
  return (
    <div className="flex justify-start gap-2 mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
    </div>
  );
}
