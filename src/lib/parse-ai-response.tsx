import { ReactNode } from "react";

interface ParsedBlock {
  type: "text" | "bold" | "list-item" | "heading";
  content: string;
}

export function parseAIResponse(text: string): ParsedBlock[] {
  const lines = text.split("\n");
  const blocks: ParsedBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", content: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", content: trimmed.slice(3) });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({ type: "list-item", content: trimmed.slice(2) });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({ type: "list-item", content: trimmed.replace(/^\d+\.\s/, "") });
    } else {
      blocks.push({ type: "text", content: trimmed });
    }
  }

  return blocks;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-gray-900">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function renderAIBlocks(blocks: ParsedBlock[]): ReactNode[] {
  return blocks.map((block, i) => {
    switch (block.type) {
      case "heading":
        return (
          <p key={i} className="font-semibold text-gray-900 mt-3 mb-1 text-sm">
            {block.content}
          </p>
        );
      case "list-item":
        return (
          <div key={i} className="flex gap-2 text-sm ml-1">
            <span className="text-brand-teal mt-0.5">•</span>
            <span>{renderInlineMarkdown(block.content)}</span>
          </div>
        );
      case "text":
      default:
        return (
          <p key={i} className="text-sm">
            {renderInlineMarkdown(block.content)}
          </p>
        );
    }
  });
}
