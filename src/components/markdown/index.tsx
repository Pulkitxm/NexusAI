"use client";

import React, { memo, JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink, Hash } from "lucide-react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
  showLineNumbers?: boolean;
  fileName?: string;
}

function CodeBlock({ code, language, className, showLineNumbers = false, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="relative group not-prose my-6">
      {fileName && (
        <div className="flex items-center px-4 py-2 text-sm font-mono bg-slate-100 dark:bg-slate-800 border-t border-x border-slate-200 dark:border-slate-700 rounded-t-lg">
          <span className="text-slate-600 dark:text-slate-400 flex-1">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0 ml-2"
            aria-label={isCollapsed ? "Expand code" : "Collapse code"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <div className={cn("relative transition-all duration-200", isCollapsed ? "max-h-12 overflow-hidden" : "")}>
        <div className="sticky top-0 right-0 z-20 flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className={cn(
              "h-8 w-8 p-0 transition-all duration-200",
              "bg-white/95 dark:bg-slate-800/95 hover:bg-gray-100 dark:hover:bg-slate-700/95",
              "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600",
              "shadow-lg backdrop-blur-sm"
            )}
            aria-label="Copy code"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <pre className="not-prose">
          <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function HeadingWithAnchor({ level, children, ...props }: any) {
  const id = children
    ? children
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
    : "";

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const headingClasses = {
    1: "text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 group",
    2: "text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200 mt-6 group",
    3: "text-lg font-medium mb-2 text-slate-800 dark:text-slate-200 mt-4 group",
    4: "text-base font-medium mb-2 text-slate-800 dark:text-slate-200 mt-3 group",
    5: "text-sm font-medium mb-1 text-slate-800 dark:text-slate-200 mt-3 group",
    6: "text-xs font-medium mb-1 text-slate-800 dark:text-slate-200 mt-2 group",
  };

  return (
    <HeadingTag id={id} className={headingClasses[level as keyof typeof headingClasses]} {...props}>
      {children}
      <a
        href={`#${id}`}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        aria-label={`Link to ${children}`}
      >
        <Hash className="inline h-4 w-4" />
      </a>
    </HeadingTag>
  );
}

interface CollapsibleProps {
  summary: string;
  children: ReactNode;
}

function Collapsible({ summary, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg mb-4 not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-t-lg"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-slate-800 dark:text-slate-200">{summary}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {isOpen && <div className="px-4 py-3 prose dark:prose-invert max-w-none">{children}</div>}
    </div>
  );
}

interface CalloutProps {
  type: "info" | "warning" | "success" | "error";
  children: ReactNode;
}

function Callout({ type, children }: CalloutProps) {
  const styles = {
    info: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  };

  return <div className={`p-4 border-l-4 rounded-r-lg mb-4 ${styles[type]}`}>{children}</div>;
}

interface MarkdownProps {
  content: string;
  className?: string;
}

const MemoizedMarkdown = memo(({ content, className }: MarkdownProps) => {
  const components = {
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeContent = String(children).replace(/\n$/, "");

      const fileNameMatch = language && language.includes(":") ? language.split(":") : null;
      const actualLanguage = fileNameMatch ? fileNameMatch[0] : language;
      const fileName = fileNameMatch ? fileNameMatch[1] : undefined;

      if (language) {
        return (
          <CodeBlock
            code={codeContent}
            language={actualLanguage}
            className={className}
            showLineNumbers={language.includes("showLineNumbers")}
            fileName={fileName}
          />
        );
      }

      return (
        <code
          className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700"
          {...props}
        >
          {codeContent}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre className="not-prose" {...props}>
        {children}
      </pre>
    ),
    h1: (props: any) => <HeadingWithAnchor level={1} {...props} />,
    h2: (props: any) => <HeadingWithAnchor level={2} {...props} />,
    h3: (props: any) => <HeadingWithAnchor level={3} {...props} />,
    h4: (props: any) => <HeadingWithAnchor level={4} {...props} />,
    h5: (props: any) => <HeadingWithAnchor level={5} {...props} />,
    h6: (props: any) => <HeadingWithAnchor level={6} {...props} />,
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-slate-700 dark:text-slate-300" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-purple-500 dark:border-purple-400 pl-4 italic mb-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({ children, href, ...props }: any) => {
      const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"));

      return (
        <div className="relative group not-prose my-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={href}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline underline-offset-2 hover:underline-offset-4 transition-all inline-flex items-center gap-1"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  {...props}
                >
                  {children}
                  {isExternal && <ExternalLink className="h-3 w-3 inline" />}
                </a>
              </TooltipTrigger>
              {isExternal && (
                <TooltipContent>
                  <p>Opens in a new tab</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    img: ({ src, alt, ...props }: any) => (
      <div className="my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <Image
          src={src || "/placeholder.svg?height=400&width=600"}
          alt={alt || "Image"}
          width={800}
          height={600}
          className="w-full h-auto object-cover"
          loading="lazy"
          {...props}
        />
        {alt && (
          <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
            {alt}
          </div>
        )}
      </div>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-slate-50 dark:bg-slate-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700" {...props}>
        {children}
      </tbody>
    ),
    th: ({ children, ...props }: any) => (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap" {...props}>
        {children}
      </td>
    ),
    hr: (props: any) => <hr className="my-8 border-t border-slate-200 dark:border-slate-700" {...props} />,

    div: ({ className, children, ...props }: any) => {
      if (className === "collapsible") {
        const childrenArray = React.Children.toArray(children);
        const summary = "Details";
        const content = childrenArray.slice(1);

        return <Collapsible summary={summary}>{content}</Collapsible>;
      }

      if (className?.startsWith("callout-")) {
        const type = className.replace("callout-", "") as "info" | "warning" | "success" | "error";
        return <Callout type={type}>{children}</Callout>;
      }

      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    },
  };

  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export { MemoizedMarkdown };
