interface CodeBlock {
  type: "code" | "text";
  content: string;
  language?: string;
  startIndex: number;
  endIndex: number;
}

interface Match {
  start: number;
  end: number;
  content: string;
  type: "code" | "text";
  language?: string;
  priority: number;
}

export function detectCodeInText(text: string): CodeBlock[] {
  if (!text.trim()) {
    return [createTextBlock(text, 0, text.length)];
  }

  const matches = findAllMatches(text);
  return buildBlocks(text, matches);
}

function findAllMatches(text: string): Match[] {
  const matches: Match[] = [];

  // Fenced code blocks (highest priority)
  addFencedCodeMatches(text, matches);

  // Inline code (medium priority)
  addInlineCodeMatches(text, matches);

  // Code patterns (lowest priority)
  addCodePatternMatches(text, matches);

  return resolveOverlaps(matches);
}

function addFencedCodeMatches(text: string, matches: Match[]): void {
  const fencedRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let match;

  while ((match = fencedRegex.exec(text)) !== null) {
    const [fullMatch, language, code] = match;
    matches.push({
      start: match.index,
      end: match.index + fullMatch.length,
      content: code.trim(),
      type: "code",
      language: language || detectLanguage(code),
      priority: 3,
    });
  }
}

function addInlineCodeMatches(text: string, matches: Match[]): void {
  const inlineRegex = /`([^`\n]+)`/g;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
      type: "code",
      language: detectLanguage(match[1]),
      priority: 2,
    });
  }
}

function addCodePatternMatches(text: string, matches: Match[]): void {
  const patterns = [
    // Programming keywords and structures
    {
      regex:
        /\b(function|const|let|var|class|import|export|return|if|else|for|while|switch|case|def|print|public|private|protected)\s+[\w\s(){}[\].,;:=>"'`-]+/g,
      priority: 1,
    },
    // File paths
    {
      regex: /[a-zA-Z]:[\\/][\w\\/.-]+|\/[\w/.-]+\.\w+|\w+\.\w{2,4}/g,
      priority: 1,
    },
    // URLs
    {
      regex: /https?:\/\/[\w.-]+(?:\/[\w/?#[\]@!$&'()*+,;=.-]*)?/g,
      priority: 1,
    },
    // JSON-like structures
    {
      regex: /\{[\s\S]*?\}/g,
      priority: 1,
    },
    // Arrays
    {
      regex: /\[[\s\S]*?\]/g,
      priority: 1,
    },
    // Command line patterns
    {
      regex: /^\s*(npm|yarn|git|cd|ls|mkdir|rm|cp|mv|sudo|chmod|chown)\s+.*/gm,
      priority: 1,
    },
    // SQL patterns
    {
      regex:
        /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER)\b[\s\S]*?;?/gi,
      priority: 1,
    },
  ];

  patterns.forEach(({ regex, priority }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const content = match[0].trim();
      if (content.length > 3) {
        // Avoid very short matches
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content,
          type: "code",
          language: detectLanguage(content),
          priority,
        });
      }
    }
  });
}

function resolveOverlaps(matches: Match[]): Match[] {
  if (matches.length === 0) return matches;

  // Sort by start position, then by priority (higher first)
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.priority - a.priority;
  });

  const resolved: Match[] = [];
  let lastEnd = 0;

  for (const match of matches) {
    // Skip if this match overlaps with a higher priority match
    if (match.start < lastEnd) continue;

    resolved.push(match);
    lastEnd = match.end;
  }

  return resolved;
}

function buildBlocks(text: string, matches: Match[]): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  let currentIndex = 0;

  for (const match of matches) {
    // Add text block before code block if there's content
    if (match.start > currentIndex) {
      const textContent = text.slice(currentIndex, match.start);
      if (textContent.trim()) {
        blocks.push(createTextBlock(textContent, currentIndex, match.start));
      }
    }

    // Add code block
    blocks.push({
      type: "code",
      content: match.content,
      language: match.language,
      startIndex: match.start,
      endIndex: match.end,
    });

    currentIndex = match.end;
  }

  // Add remaining text if any
  if (currentIndex < text.length) {
    const remainingContent = text.slice(currentIndex);
    if (remainingContent.trim()) {
      blocks.push(createTextBlock(remainingContent, currentIndex, text.length));
    }
  }

  // If no matches found, return entire text as text block
  if (blocks.length === 0) {
    return [createTextBlock(text, 0, text.length)];
  }

  return blocks;
}

function createTextBlock(
  content: string,
  startIndex: number,
  endIndex: number
): CodeBlock {
  return {
    type: "text",
    content,
    startIndex,
    endIndex,
  };
}

function detectLanguage(code: string): string {
  const trimmedCode = code.trim().toLowerCase();

  // Language detection patterns with better accuracy
  const languagePatterns = [
    {
      language: "typescript",
      patterns: [
        /\b(interface|type|enum|namespace|declare|as\s+\w+)\b/,
        /:\s*(string|number|boolean|object|any|unknown|never)/,
        /\.(ts|tsx)$/,
      ],
    },
    {
      language: "javascript",
      patterns: [
        /\b(function|const|let|var|=>|import|export|class|async|await)\b/,
        /\.(js|jsx|mjs)$/,
        /console\.(log|error|warn)/,
      ],
    },
    {
      language: "python",
      patterns: [
        /\b(def|import|from|class|if __name__|print|return|lambda|yield)\b/,
        /\.py$/,
        /^\s*#.*python/i,
      ],
    },
    {
      language: "html",
      patterns: [/<[^>]+>/, /<!doctype|<html|<head|<body/, /\.html?$/],
    },
    {
      language: "css",
      patterns: [
        /\{[^}]*:[^}]*\}/,
        /\.(css|scss|sass|less)$/,
        /@(media|import|keyframes)/,
      ],
    },
    {
      language: "json",
      patterns: [
        /^\s*[[{][\s\S]*[\]}]\s*$/,
        /\.json$/,
        /"[\w-]+"\s*:\s*(".*?"|[\d.]+|true|false|null)/,
      ],
    },
    {
      language: "sql",
      patterns: [
        /\b(select|insert|update|delete|create|drop|alter|from|where|join)\b/i,
        /\.sql$/,
      ],
    },
    {
      language: "bash",
      patterns: [
        /^\s*(npm|yarn|git|cd|ls|mkdir|rm|cp|mv|sudo|chmod|chown|curl|wget)/,
        /\.(sh|bash)$/,
        /^#!\/(bin\/)?(bash|sh)/,
      ],
    },
    {
      language: "yaml",
      patterns: [/^\s*[\w-]+:\s*/, /\.ya?ml$/, /---\s*$/m],
    },
    {
      language: "xml",
      patterns: [/<\?xml/, /\.xml$/, /<[\w-]+[^>]*>[\s\S]*<\/[\w-]+>/],
    },
    {
      language: "markdown",
      patterns: [/^#+\s/, /\*\*.*?\*\*/, /\[.*?\]\(.*?\)/, /\.md$/],
    },
    {
      language: "dockerfile",
      patterns: [/^FROM\s+/, /^RUN\s+/, /^COPY\s+/, /dockerfile/i],
    },
  ];

  for (const { language, patterns } of languagePatterns) {
    if (patterns.some((pattern) => pattern.test(trimmedCode))) {
      return language;
    }
  }

  // Check for file extensions in the code
  const extensionMatch = trimmedCode.match(/\.(\w+)$/);
  if (extensionMatch) {
    const ext = extensionMatch[1];
    const extensionMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      cpp: "cpp",
      c: "c",
      java: "java",
      php: "php",
      swift: "swift",
      kt: "kotlin",
    };
    if (extensionMap[ext]) return extensionMap[ext];
  }

  return "text";
}