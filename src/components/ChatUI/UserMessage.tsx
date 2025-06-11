"use client"

import { memo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { detectCodeInText } from "@/utils/code-detection"
import { cn } from "@/lib/utils"

interface UserMessageProps {
  content: string
  className?: string
}

export const UserMessage = memo(({ content, className }: UserMessageProps) => {
  const { theme } = useTheme()
  const codeBlocks = detectCodeInText(content)

  if (codeBlocks.length === 1 && codeBlocks[0].type === "text") {
    return <div className={cn("whitespace-pre-wrap break-words leading-relaxed", className)}>{content}</div>
  }

  return (
    <div className={cn("space-y-2", className)}>
      {codeBlocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <div key={index} className="whitespace-pre-wrap break-words leading-relaxed">
              {block.content}
            </div>
          )
        }

        return (
          <div key={index} className="my-2">
            <SyntaxHighlighter
              style={theme === "dark" ? oneDark : oneLight}
              language={block.language || "text"}
              PreTag="div"
              className="!mt-0 !mb-0 rounded-lg overflow-hidden text-sm"
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                background: theme === "dark" ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.8)",
                padding: "0.75rem",
                border: theme === "dark" ? "1px solid rgba(71, 85, 105, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: "0.875rem",
                  lineHeight: "1.4",
                },
              }}
            >
              {block.content}
            </SyntaxHighlighter>
          </div>
        )
      })}
    </div>
  )
})

UserMessage.displayName = "UserMessage"
