"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";

const MemoizedMarkdown = memo(({ content, className }: { content: string; className?: string }) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert", className)}>
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeContent = String(children).replace(/\n$/, "");

            if (language) {
              return <CodeBlock code={codeContent} language={language} className={className} showLineNumbers />;
            }

            return (
              <code
                className="relative rounded-md bg-slate-100 px-2 py-1 font-mono text-sm text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
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
              className="mb-6 border-b border-slate-200 pb-3 text-3xl font-bold tracking-tight text-slate-900 dark:border-slate-700 dark:text-slate-100"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mt-8 mb-4 text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="mt-6 mb-3 text-xl font-medium tracking-tight text-slate-800 dark:text-slate-200" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="mt-4 mb-2 text-lg font-medium text-slate-800 dark:text-slate-200" {...props}>
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-4 leading-7 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="mb-6 ml-6 list-disc space-y-2 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-6 ml-6 list-decimal space-y-2 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="mb-6 border-l-4 border-blue-500 bg-blue-50/50 py-4 pl-6 text-slate-700 italic backdrop-blur-sm dark:border-blue-400 dark:bg-blue-950/20 dark:text-slate-300"
              {...props}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-4 transition-all hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-800" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </td>
          ),
          hr: ({ ...props }) => <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />,
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="text-slate-700 italic dark:text-slate-300" {...props}>
              {children}
            </em>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export { MemoizedMarkdown };
