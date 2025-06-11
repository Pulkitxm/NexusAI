"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { EnhancedCodeBlock } from "./ChatUI/EnhancedCodeBlock"

const MemoizedMarkdown = memo(({ content, className }: { content: string; className?: string }) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const codeContent = String(children).replace(/\n$/, "")

            if (language) {
              return <EnhancedCodeBlock code={codeContent} language={language} className={className} />
            }

            return (
              <code
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700"
                {...props}
              >
                {codeContent}
              </code>
            )
          },
          pre: ({ children, ...props }) => (
            <pre className="not-prose" {...props}>
              {children}
            </pre>
          ),
          h1: ({ children, ...props }) => (
            <h1
              className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200 mt-6" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-slate-200 mt-4" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props}>
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
              className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic mb-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800 font-semibold text-left text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-700 dark:text-slate-300"
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
  )
})

MemoizedMarkdown.displayName = "MemoizedMarkdown"

export { MemoizedMarkdown }
