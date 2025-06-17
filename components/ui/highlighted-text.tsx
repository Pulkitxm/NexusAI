import { memo } from "react";

interface HighlightedTextProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export const HighlightedText = memo<HighlightedTextProps>(({ text, searchQuery, className = "" }) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="rounded bg-yellow-200 px-0.5 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
});

HighlightedText.displayName = "HighlightedText";
