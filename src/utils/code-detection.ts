interface CodeBlock {
  type: "code" | "text";
  content: string;
  language?: string;
  startIndex: number;
  endIndex: number;
}

export function detectCodeInText(text: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let currentIndex = 0;

  const fencedCodeRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let match;

  while ((match = fencedCodeRegex.exec(text)) !== null) {
    const [fullMatch, language, code] = match;
    const startIndex = match.index;
    const endIndex = match.index + fullMatch.length;

    if (startIndex > currentIndex) {
      const textContent = text.slice(currentIndex, startIndex);
      if (textContent.trim()) {
        blocks.push({
          type: "text",
          content: textContent,
          startIndex: currentIndex,
          endIndex: startIndex,
        });
      }
    }

    blocks.push({
      type: "code",
      content: code.trim(),
      language: language || detectLanguage(code),
      startIndex,
      endIndex,
    });

    currentIndex = endIndex;
  }

  if (currentIndex < text.length) {
    const remainingContent = text.slice(currentIndex);
    if (remainingContent.trim()) {
      blocks.push({
        type: "text",
        content: remainingContent,
        startIndex: currentIndex,
        endIndex: text.length,
      });
    }
  }

  if (blocks.length === 0) {
    return detectInlineCodeAndPatterns(text);
  }

  return blocks;
}

function detectInlineCodeAndPatterns(text: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let currentIndex = 0;

  const inlineCodeRegex = /`([^`\n]+)`/g;
  let match;

  const matches: Array<{ start: number; end: number; content: string; type: "code" | "text" }> = [];

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
      type: "code",
    });
  }

  matches.sort((a, b) => a.start - b.start);

  for (const match of matches) {
    if (match.start > currentIndex) {
      const textContent = text.slice(currentIndex, match.start);
      if (textContent.trim()) {
        blocks.push({
          type: "text",
          content: textContent,
          startIndex: currentIndex,
          endIndex: match.start,
        });
      }
    }

    blocks.push({
      type: "code",
      content: match.content,
      language: detectLanguage(match.content),
      startIndex: match.start,
      endIndex: match.end,
    });

    currentIndex = match.end;
  }

  if (currentIndex < text.length) {
    const remainingContent = text.slice(currentIndex);
    blocks.push({
      type: "text",
      content: remainingContent,
      startIndex: currentIndex,
      endIndex: text.length,
    });
  }

  if (blocks.length === 0) {
    return [{ type: "text", content: text, startIndex: 0, endIndex: text.length }];
  }

  return blocks;
}

function detectLanguage(code: string): string {
  const trimmedCode = code.trim().toLowerCase();

  if (
    /\b(function|const|let|var|=>|import|export|class|interface|type)\b/.test(trimmedCode) ||
    /\.(js|ts|jsx|tsx)$/.test(trimmedCode)
  ) {
    return "javascript";
  }

  if (/\b(def|import|from|class|if __name__|print|return)\b/.test(trimmedCode) || /\.py$/.test(trimmedCode)) {
    return "python";
  }

  if (/<[^>]+>/.test(trimmedCode) || /\.html?$/.test(trimmedCode)) {
    return "html";
  }

  if (/\{[^}]*:[^}]*\}/.test(trimmedCode) || /\.css$/.test(trimmedCode) || /\.(scss|sass|less)$/.test(trimmedCode)) {
    return "css";
  }

  if (/^\s*[[{]/.test(trimmedCode) && /[\]}]\s*$/.test(trimmedCode)) {
    return "json";
  }

  if (/\b(select|insert|update|delete|create|drop|alter|from|where|join)\b/i.test(trimmedCode)) {
    return "sql";
  }

  if (
    /^\s*(npm|yarn|git|cd|ls|mkdir|rm|cp|mv|sudo|chmod|chown)/.test(trimmedCode) ||
    /\.(sh|bash)$/.test(trimmedCode)
  ) {
    return "bash";
  }

  return "text";
}