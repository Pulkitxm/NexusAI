"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

const MemoizedMarkdown = memo(
  ({ content, className }: { content: string; className?: string }) => {
    return (
      <div
        className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      >
        <ReactMarkdown
          components={{
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const codeContent = String(children).replace(/\n$/, "");

              if (language) {
                return (
                  <CodeBlock
                    code={codeContent}
                    language={language}
                    className={className}
                  />
                );
              }

              return (
                <code
                  className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  {...props}
                >
                  {codeContent}
                </code>
              );
            },
            pre: ({ children, ...props }) => (
              <pre className="not-prose" {...props}>
                {children}
              </pre>
            ),
            h1: ({ children, ...props }) => (
              <h1
                className="mb-4 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100"
                {...props}
              >
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2
                className="mt-6 text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3"
                {...props}
              >
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3
                className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200 mb-2"
                {...props}
              >
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p
                className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300"
                {...props}
              >
                {children}
              </p>
            ),
            ul: ({ children, ...props }) => (
              <ul
                className="mb-4 ml-4 list-inside list-disc space-y-2 text-slate-700 dark:text-slate-300"
                {...props}
              >
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol
                className="mb-4 ml-4 list-inside list-decimal space-y-2 text-slate-700 dark:text-slate-300"
                {...props}
              >
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-slate-700 dark:text-slate-300" {...props}>
                {children}
              </li>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="mb-4 rounded-r-lg border-l-4 border-blue-500 bg-slate-50 py-2 pl-4 italic text-slate-600 dark:border-blue-400 dark:bg-slate-800/50 dark:text-slate-400"
                {...props}
              >
                {children}
              </blockquote>
            ),
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                className="text-blue-600 underline underline-offset-2 transition-all hover:underline-offset-4 dark:text-blue-400 dark:hover:text-blue-300 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            table: ({ children, ...props }) => (
              <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th
                className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                {...props}
              >
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td
                className="border-b border-slate-200 px-4 py-3 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                {...props}
              >
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export { MemoizedMarkdown };
