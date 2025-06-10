"use client";

import type React from "react";

import { marked } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const CodeBlock = memo(
  ({
    inline,
    className,
    children,
    ...props
  }: React.ClassAttributes<HTMLElement> &
    React.HTMLAttributes<HTMLElement> & {
      inline?: boolean;
    }) => {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const content = String(children).replace(/\n$/, "");

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy code:", error);
      }
    };

    if (!inline && language) {
      return (
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 hover:bg-slate-700 text-white"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <SyntaxHighlighter
            style={theme === "dark" ? oneDark : oneLight}
            language={language}
            PreTag="div"
            className="rounded-lg !mt-0 !mb-4"
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code: CodeBlock,
          pre: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLPreElement>) => (
            <pre className="overflow-x-auto" {...props}>
              {children}
            </pre>
          ),
          h1: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h1
              className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h2
              className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3
              className="text-base font-medium mb-2 text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLParagraphElement>) => (
            <p
              className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed"
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLUListElement>) => (
            <ul
              className="list-disc list-inside mb-3 space-y-1 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLOListElement>) => (
            <ol
              className="list-decimal list-inside mb-3 space-y-1 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
            <li className="text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </li>
          ),
          blockquote: ({
            children,
            ...props
          }: React.HTMLAttributes<HTMLQuoteElement>) => (
            <blockquote
              className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic mb-3 text-slate-600 dark:text-slate-400"
              {...props}
            >
              {children}
            </blockquote>
          ),
          a: ({
            children,
            href,
            ...props
          }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          table: ({
            children,
            ...props
          }: React.TableHTMLAttributes<HTMLTableElement>) => (
            <div className="overflow-x-auto mb-4">
              <table
                className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          th: ({
            children,
            ...props
          }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
            <th
              className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 font-medium text-left text-slate-800 dark:text-slate-200"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({
            children,
            ...props
          }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
            <td
              className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300"
              {...props}
            >
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="markdown-content">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
