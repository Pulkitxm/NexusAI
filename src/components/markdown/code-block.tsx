"use client"

import { useState, useRef } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { Copy, Check, Download, FileCode, WrapTextIcon as Wrap, AlignJustify } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedCodeBlockProps {
  code: string
  language: string
  className?: string
  showLineNumbers?: boolean
  fileName?: string
}

const languageNames: Record<string, string> = {
  js: "JavaScript",
  jsx: "React JSX",
  ts: "TypeScript",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
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
  powershell: "PowerShell",
  yaml: "YAML",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
}

export function CodeBlock({
  code,
  language,
  className,
  showLineNumbers = false,
  fileName,
}: EnhancedCodeBlockProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [isWrapped, setIsWrapped] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName || `code.${language || "txt"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleWrap = () => {
    setIsWrapped(!isWrapped)
  }

  const displayLanguage = languageNames[language] || language || "Plain Text"

  return (
    <div className="relative group not-prose my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Sticky header with controls */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Badge variant="outline" className="text-xs font-medium">
            {displayLanguage}
          </Badge>
          {fileName && <span className="text-sm text-slate-500 dark:text-slate-400 font-mono ml-2">{fileName}</span>}
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleWrap}
                  className="h-8 w-8 p-0"
                  aria-label={isWrapped ? "Disable text wrap" : "Enable text wrap"}
                >
                  {isWrapped ? <AlignJustify className="h-4 w-4" /> : <Wrap className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-500 text-white dark:bg-purple-500 ">
                <p>{isWrapped ? "Disable text wrap" : "Enable text wrap"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadCode}
                  className="h-8 w-8 p-0"
                  aria-label="Download code"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-500 text-white dark:bg-purple-500 ">
                <p>Download code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={copyCode} className="h-8 w-8 p-0" aria-label="Copy code">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-purple-500 text-white dark:bg-purple-500 ">
                <p>{copied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Code content */}
      <div
        ref={codeRef}
        className={cn("relative transition-all duration-200")}
      >
        <SyntaxHighlighter
          style={theme === "dark" ? oneDark : oneLight}
          language={language}
          PreTag="div"
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          wrapLongLines={isWrapped}
          className={cn("!mt-0 !mb-0", "bg-slate-50 dark:bg-slate-900", className)}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
            background: "transparent",
            padding: "1.5rem",
            maxHeight: "500px",
            overflow: "auto",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: "0.875rem",
              lineHeight: "1.5",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
