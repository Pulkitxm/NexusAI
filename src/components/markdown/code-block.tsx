"use client";

import {
  Copy,
  Check,
  Download,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Braces,
  Globe,
  Palette,
  Database,
  Terminal,
  Settings,
  Code2,
  Cpu,
  Zap,
  Package,
  FileCode,
  Layers,
  LucideProps
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  className?: string;
  showLineNumbers?: boolean;
  fileName?: string;
  maxHeight?: number;
}

const languageNames: Record<string, string> = {
  js: "JavaScript",
  jsx: "React JSX",
  ts: "TypeScript",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  json: "JSON",
  md: "Markdown",
  py: "Python",
  rb: "Ruby",
  go: "Go",
  java: "Java",
  c: "C",
  cpp: "C++",
  cs: "C#",
  php: "PHP",
  swift: "Swift",
  rust: "Rust",
  kotlin: "Kotlin",
  dart: "Dart",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  powershell: "PowerShell",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  xml: "XML",
  vue: "Vue",
  svelte: "Svelte"
};

const languageIcons: Record<
  string,
  ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
> = {
  js: Zap,
  jsx: Layers,
  ts: Cpu,
  tsx: Layers,
  html: Globe,
  css: Palette,
  scss: Palette,
  sass: Palette,
  json: Braces,
  md: FileText,
  py: Code2,
  rb: Package,
  go: Zap,
  java: Cpu,
  c: Terminal,
  cpp: Terminal,
  cs: Package,
  php: Code2,
  swift: Zap,
  rust: Settings,
  kotlin: Package,
  dart: Zap,
  sql: Database,
  sh: Terminal,
  bash: Terminal,
  zsh: Terminal,
  powershell: Terminal,
  yaml: Settings,
  yml: Settings,
  toml: Settings,
  dockerfile: Package,
  graphql: Database,
  xml: FileCode,
  vue: Layers,
  svelte: Layers
};

const languageColors: Record<string, string> = {
  js: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  jsx: "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300",
  ts: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  tsx: "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300",
  html: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  css: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300",
  py: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  json: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300"
};

export function CodeBlock({
  code,
  language,
  className,
  showLineNumbers = false,
  fileName,
  maxHeight = 500
}: EnhancedCodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLineNumbers_, setShowLineNumbers] = useState(showLineNumbers);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      const element = codeRef.current;
      setIsOverflowing(element.scrollHeight > maxHeight);

      const checkHorizontalOverflow = () => {
        const selectors = ["pre", "code", "[class*='language-']", ".token-line"];
        let foundOverflow = false;

        for (const selector of selectors) {
          const codeElement = element.querySelector(selector);
          if (codeElement) {
            const hasOverflow = codeElement.scrollWidth > codeElement.clientWidth;
            if (hasOverflow) {
              foundOverflow = true;
              break;
            }
          }
        }

        if (!foundOverflow) {
          const lines = code.split("\n");
          const hasLongLine = lines.some((line) => line.length > 80);
          foundOverflow = hasLongLine;
        }

        setHasHorizontalOverflow(foundOverflow);
      };

      checkHorizontalOverflow();
      const timer = setTimeout(checkHorizontalOverflow, 100);

      return () => clearTimeout(timer);
    }
  }, [code, maxHeight]);

  const shouldShowWrapButton = hasHorizontalOverflow || code.split("\n").some((line) => line.length > 80);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `code.${language || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleWrap = () => {
    setIsWrapped(!isWrapped);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers_);
  };

  const displayLanguage = languageNames[language] || language || "Plain Text";
  const LanguageIcon = languageIcons[language] || FileCode;
  const languageColorClass =
    languageColors[language] || "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300";
  const lineCount = code.split("\n").length;

  return (
    <div className="not-prose group my-8 overflow-hidden rounded-2xl border border-purple-200/60 bg-white shadow-lg transition-all duration-300 hover:border-purple-300/60 hover:shadow-xl dark:border-purple-700/60 dark:bg-slate-900 dark:hover:border-purple-600/60">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between border-b border-purple-200/60 bg-gradient-to-r from-purple-50/80 to-violet-100/80 px-6 py-4 backdrop-blur-sm dark:border-purple-700/60 dark:from-purple-900/20 dark:to-violet-900/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-200/80 dark:bg-purple-700/80">
              <LanguageIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
            <Badge className={cn("px-3 py-1 font-medium shadow-sm", languageColorClass)}>{displayLanguage}</Badge>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 rounded-lg bg-purple-200/50 px-3 py-1.5 text-sm text-purple-600 dark:bg-purple-700/50 dark:text-purple-300">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-mono font-medium">{fileName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-purple-500 dark:text-purple-400">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 dark:bg-purple-500" />
            <span className="font-medium">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLineNumbers}
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-200",
                    showLineNumbers_
                      ? "bg-purple-100 text-purple-600 shadow-sm dark:bg-purple-900/30 dark:text-purple-400"
                      : "hover:bg-purple-200 dark:hover:bg-purple-700"
                  )}
                  aria-label={showLineNumbers_ ? "Hide line numbers" : "Show line numbers"}
                >
                  <span className="font-mono text-sm font-bold">#</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <p>{showLineNumbers_ ? "Hide line numbers" : "Show line numbers"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Show wrap button if there's horizontal overflow or long lines */}
          {shouldShowWrapButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleWrap}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all duration-200",
                      isWrapped
                        ? "bg-purple-100 text-purple-600 shadow-sm dark:bg-purple-900/30 dark:text-purple-400"
                        : "hover:bg-purple-200 dark:hover:bg-purple-700"
                    )}
                    aria-label={isWrapped ? "Disable text wrap" : "Enable text wrap"}
                  >
                    {isWrapped ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <p>{isWrapped ? "Disable text wrap" : "Enable text wrap"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isOverflowing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpanded}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all duration-200",
                      isExpanded
                        ? "bg-purple-100 text-purple-600 shadow-sm dark:bg-purple-900/30 dark:text-purple-400"
                        : "hover:bg-purple-200 dark:hover:bg-purple-700"
                    )}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <p>{isExpanded ? "Collapse code" : "Expand code"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="mx-2 h-6 w-px bg-purple-300 dark:bg-purple-600" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadCode}
                  className="h-9 w-9 rounded-xl transition-all duration-200 hover:bg-purple-200 dark:hover:bg-purple-700"
                  aria-label="Download code"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <p>Download code file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCode}
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-200",
                    copied
                      ? "bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "hover:bg-purple-200 dark:hover:bg-purple-700"
                  )}
                  aria-label="Copy code"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <p>{copied ? "Copied to clipboard!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Code Content with improved wrapping */}
      <div
        ref={codeRef}
        className={cn("relative transition-all duration-300", !isExpanded && isOverflowing && "overflow-hidden")}
        style={{
          maxHeight: !isExpanded && isOverflowing ? `${maxHeight}px` : "none"
        }}
      >
        <div className={cn("code-wrapper relative", !isWrapped && "overflow-x-auto")}>
          <SyntaxHighlighter
            style={theme === "dark" ? oneDark : oneLight}
            language={language}
            PreTag="div"
            showLineNumbers={showLineNumbers_}
            className={cn("!mb-0 !mt-0", className)}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.875rem",
              background: "transparent",
              padding: "2rem",
              lineHeight: "1.7",
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

              whiteSpace: isWrapped ? "pre-wrap" : "pre",
              wordBreak: isWrapped ? "break-word" : "normal",
              overflowWrap: isWrapped ? "anywhere" : "normal",
              wordWrap: isWrapped ? "break-word" : "normal"
            }}
            lineNumberStyle={{
              minWidth: "3.5em",
              paddingRight: "1.5em",
              color: theme === "dark" ? "#a855f7" : "#9333ea",
              borderRight: `2px solid ${theme === "dark" ? "#7c3aed" : "#c084fc"}`,
              marginRight: "1.5em",
              fontSize: "0.75rem",
              userSelect: "none",
              fontWeight: "500",
              textAlign: "right"
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: "0.875rem",
                lineHeight: "1.7",
                whiteSpace: isWrapped ? "pre-wrap" : "pre",
                wordBreak: isWrapped ? "break-word" : "normal",
                overflowWrap: isWrapped ? "anywhere" : "normal",
                wordWrap: isWrapped ? "break-word" : "normal"
              }
            }}
            wrapLines={false}
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>

          {/* Enhanced CSS for better wrapping control */}
          <style jsx>{`
            .code-wrapper pre {
              white-space: ${isWrapped ? "pre-wrap !important" : "pre !important"};
              word-break: ${isWrapped ? "break-word !important" : "normal !important"};
              overflow-wrap: ${isWrapped ? "anywhere !important" : "normal !important"};
              word-wrap: ${isWrapped ? "break-word !important" : "normal !important"};
              hyphens: ${isWrapped ? "auto" : "none"};
            }

            .code-wrapper code {
              white-space: ${isWrapped ? "pre-wrap !important" : "pre !important"};
              word-break: ${isWrapped ? "break-word !important" : "normal !important"};
              overflow-wrap: ${isWrapped ? "anywhere !important" : "normal !important"};
              word-wrap: ${isWrapped ? "break-word !important" : "normal !important"};
              hyphens: ${isWrapped ? "auto" : "none"};
            }

            .code-wrapper .token {
              white-space: ${isWrapped ? "pre-wrap !important" : "pre !important"};
              word-break: ${isWrapped ? "break-word !important" : "normal !important"};
              overflow-wrap: ${isWrapped ? "anywhere !important" : "normal !important"};
              word-wrap: ${isWrapped ? "break-word !important" : "normal !important"};
            }

            /* Better handling of long words and URLs */
            .code-wrapper .token.string,
            .code-wrapper .token.url,
            .code-wrapper .token.comment {
              word-break: ${isWrapped ? "break-all !important" : "normal !important"};
              overflow-wrap: ${isWrapped ? "anywhere !important" : "normal !important"};
            }

            /* Prevent awkward breaks in the middle of important tokens */
            .code-wrapper .token.keyword,
            .code-wrapper .token.function,
            .code-wrapper .token.class-name {
              word-break: ${isWrapped ? "keep-all !important" : "normal !important"};
            }
          `}</style>
        </div>

        {/* Enhanced fade overlay */}
        {!isExpanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
        )}
      </div>

      {/* Enhanced Expand/Collapse button */}
      {isOverflowing && (
        <div className="border-t border-purple-200/60 bg-gradient-to-r from-purple-50/50 to-violet-100/50 px-6 py-3 dark:border-purple-700/60 dark:from-purple-900/20 dark:to-violet-900/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="w-full rounded-xl py-2 text-sm font-medium text-purple-600 transition-all duration-200 hover:bg-purple-200/80 hover:text-purple-900 dark:text-purple-400 dark:hover:bg-purple-700/80 dark:hover:text-purple-100"
          >
            {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {isExpanded ? "Show less" : `Show all ${lineCount} lines`}
          </Button>
        </div>
      )}
    </div>
  );
}
