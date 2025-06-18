"use client";

import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
}

export function MessageContent({ content, isUser, isStreaming = false }: MessageContentProps) {
  return (
    <div className="text-sm">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <pre className="rounded-md bg-slate-800 p-3 text-sm text-slate-100 dark:bg-slate-900">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className={`rounded bg-slate-200 px-1 py-0.5 text-sm dark:bg-slate-700 ${
                    isUser ? "bg-purple-400/20 text-white" : ""
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },

            a: ({ children, href, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline hover:no-underline ${
                  isUser ? "text-purple-200" : "text-purple-600 dark:text-purple-400"
                }`}
                {...props}
              >
                {children}
              </a>
            ),

            ul: ({ children, ...props }) => (
              <ul className="list-disc pl-4" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal pl-4" {...props}>
                {children}
              </ol>
            ),

            blockquote: ({ children, ...props }) => (
              <blockquote
                className={`border-l-4 pl-4 italic ${
                  isUser ? "border-purple-400 text-purple-100" : "border-slate-400 text-slate-600 dark:text-slate-400"
                }`}
                {...props}
              >
                {children}
              </blockquote>
            ),

            p: ({ children, ...props }) => <span {...props}>{children}</span>
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Streaming indicator */}
        {isStreaming && !isUser && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 dark:border-slate-700">
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is typing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
