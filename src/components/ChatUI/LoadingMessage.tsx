"use client"

export function LoadingMessage() {
  return (
    <div className="flex justify-start mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-[85%]">
        <div className="bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg backdrop-blur-sm border">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Assistant is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
