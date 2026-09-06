import type { ReactNode } from "react";

/**
 * Tiny line-based renderer for AI Health Assistant replies.
 *
 * The assistant's reply text (see `generateAssistantReply` in
 * `utils/aiAssistant.ts`) is plain text with a handful of lightweight
 * conventions rather than full Markdown:
 *   - "**bold**"            -> inline emphasis (already used throughout)
 *   - "## Heading"          -> a short section heading
 *   - "• item" / "- item"   -> bullet list item
 *   - "1. item"             -> numbered list item
 *   - "⚠️ ..."              -> a warning/notice callout (emergency guidance,
 *                              diagnosis disclaimers)
 *   - blank line            -> paragraph break
 *
 * Deliberately not a full Markdown parser — no new dependency, and the
 * assistant only ever emits these five shapes. Keeping this separate from
 * the page component so the shape is unit-testable and reusable anywhere
 * else a chat transcript might render (e.g. a future export/print view).
 */

const HEADING_RE = /^##\s+(.*)$/;
const BULLET_RE = /^[•-]\s+(.*)$/;
const NUMBERED_RE = /^\d+\.\s+(.*)$/;
const WARNING_RE = /^⚠️\s*(.*)$/;

/** Renders `**bold**` spans within a single line/item of text. */
function renderInline(text: string, keyPrefix: string): ReactNode {
  const parts = text.split("**");
  return parts.map((chunk, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{chunk}</strong> : <span key={`${keyPrefix}-t${i}`}>{chunk}</span>
  );
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "heading"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "warning"; lines: string[] };

function toBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      continue; // paragraph breaks are implicit between differing block kinds
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ kind: "heading", text: heading[1] });
      continue;
    }

    const warning = line.match(WARNING_RE);
    if (warning) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "warning") last.lines.push(warning[1]);
      else blocks.push({ kind: "warning", lines: [warning[1]] });
      continue;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "bullets") last.items.push(bullet[1]);
      else blocks.push({ kind: "bullets", items: [bullet[1]] });
      continue;
    }

    const numbered = line.match(NUMBERED_RE);
    if (numbered) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "numbered") last.items.push(numbered[1]);
      else blocks.push({ kind: "numbered", items: [numbered[1]] });
      continue;
    }

    const last = blocks[blocks.length - 1];
    if (last?.kind === "paragraph") last.lines.push(line);
    else blocks.push({ kind: "paragraph", lines: [line] });
  }

  return blocks;
}

/** Strips the chat markup conventions down to plain readable text — used for text-to-speech. */
export function stripChatMarkup(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      return trimmed
        .replace(HEADING_RE, "$1")
        .replace(BULLET_RE, "$1")
        .replace(NUMBERED_RE, "$1")
        .replace(WARNING_RE, "$1")
        .replace(/\*\*/g, "");
    })
    .filter(Boolean)
    .join(". ");
}

/** Renders assistant/user chat content into React nodes per the conventions above. */
export function renderChatContent(content: string): ReactNode {
  const blocks = toBlocks(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const key = `block-${i}`;
        switch (block.kind) {
          case "heading":
            return (
              <p key={key} className="text-[13px] font-bold text-mx-ink">
                {renderInline(block.text, key)}
              </p>
            );
          case "bullets":
            return (
              <ul key={key} className="list-disc space-y-1 pl-4">
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "numbered":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-4">
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case "warning":
            return (
              <div
                key={key}
                role="note"
                className="flex items-start gap-2 rounded-mx-sm border border-mx-warning/40 bg-mx-warning-soft px-3 py-2 text-mx-warning"
              >
                <span aria-hidden="true">⚠️</span>
                <div className="space-y-1">
                  {block.lines.map((line, j) => (
                    <p key={`${key}-${j}`}>{renderInline(line, `${key}-${j}`)}</p>
                  ))}
                </div>
              </div>
            );
          case "paragraph":
          default:
            return (
              <p key={key} className="leading-relaxed">
                {block.lines.map((line, j) => (
                  <span key={`${key}-${j}`}>
                    {j > 0 && <br />}
                    {renderInline(line, `${key}-${j}`)}
                  </span>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
