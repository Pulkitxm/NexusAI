"use client"

import { useState, useRef, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EnhancedCodeBlockProps {
  code: string
  language: string
  className?: string
}

export function EnhancedCodeBlock({ code, language, className }: EnhancedCodeBlockProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const codeBlockRef = useRef<HTMLDivElement>(null)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (codeBlockRef.current) {
        const rect = codeBlockRef.current.getBoundingClientRect()
        const isCodeBlockVisible = rect.top < 60 && rect.bottom > 60
        setIsSticky(isCodeBlockVisible && rect.height > window.innerHeight * 0.3)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={codeBlockRef} className="relative group">
      <Button
        ref={copyButtonRef}
        variant="ghost"
        size="sm"
        onClick={copyCode}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-200 z-20",
          "bg-white/95 dark:bg-slate-800/95 hover:bg-gray-100 dark:hover:bg-slate-700/95",
          "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600",
          "shadow-lg backdrop-blur-sm",
          isSticky ? "fixed top-4 right-4 opacity-100" : "absolute top-3 right-3 opacity-0 group-hover:opacity-100",
        )}
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </Button>

      <SyntaxHighlighter
        style={theme === "dark" ? oneDark : oneLight}
        language={language}
        PreTag="div"
        className={cn(
          "!mt-0 !mb-4 rounded-xl overflow-hidden",
          "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700",
          className,
        )}
        customStyle={{
          margin: 0,
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          background: "transparent",
          padding: "1.5rem",
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
  )
}
