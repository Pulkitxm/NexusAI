"use client";

import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
}

export function MessageContent({ content, isUser, isStreaming = false }: MessageContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div className="inline">
        <ReactMarkdown
          components={{
            // Override code blocks to have proper styling
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <pre className="rounded-md bg-gray-800 p-3 text-sm text-gray-100">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className={`rounded bg-gray-200 px-1 py-0.5 text-sm dark:bg-gray-700 ${
                    isUser ? "bg-blue-500 text-white" : ""
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Override links to have proper styling
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline hover:no-underline ${
                  isUser ? "text-blue-200" : "text-blue-600 dark:text-blue-400"
                }`}
                {...props}
              >
                {children}
              </a>
            ),
            // Override lists to have proper styling
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
            // Override blockquotes
            blockquote: ({ children, ...props }) => (
              <blockquote
                className={`border-l-4 pl-4 italic ${
                  isUser ? "border-blue-400 text-blue-100" : "border-gray-400 text-gray-600 dark:text-gray-400"
                }`}
                {...props}
              >
                {children}
              </blockquote>
            ),
            // Override paragraphs to be inline when streaming
            p: ({ children, ...props }) => <span {...props}>{children}</span>
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Inline heartbeat dot as a separate React element */}
        {!isUser && isStreaming && (
          <span className="ml-1 inline-block animate-pulse text-blue-500 dark:text-blue-400">●</span>
        )}
      </div>
    </div>
  );
}
