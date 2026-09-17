import { Fragment, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CodeView } from './CodeView';

/**
 * Authored prose.
 *
 * Content is written with a deliberately small formatting vocabulary — blank
 * lines for paragraphs, `**bold**`, backticks for inline code, fenced blocks,
 * and dash lists. Parsing exactly that rather than pulling in a full Markdown
 * renderer keeps the bundle small and keeps authored content from accidentally
 * producing layouts the design system never accounted for.
 */

type Segment =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string; code: string };

function parse(source: string): Segment[] {
  const segments: Segment[] = [];
  const lines = source.split('\n');

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (line.trimStart().startsWith('```')) {
      const language = line.trim().slice(3).trim() || 'text';
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith('```')) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1; // consume the closing fence
      segments.push({ type: 'code', language, code: body.join('\n') });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      segments.push({ type: 'list', items });
      continue;
    }

    if (line.trim() === '') {
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !lines[index].trimStart().startsWith('```') &&
      !/^\s*[-*]\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    segments.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return segments;
}

/** Inline `**bold**` and `` `code` ``. Nothing else is supported on purpose. */
export function renderInline(text: string): ReactNode {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, position) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={position} className="font-semibold text-legend">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={position}
          className="rounded-[2px] bg-plate px-[0.25em] font-mono text-[0.875em] text-legend [box-decoration-break:clone]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={position}>{part}</Fragment>;
  });
}

export function Prose({
  text,
  className,
  size = 'body',
}: {
  text: string;
  className?: string;
  size?: 'body' | 'lg';
}) {
  const segments = useMemo(() => parse(text), [text]);

  return (
    <div
      className={cn(
        'max-w-read space-y-4 text-legend-2',
        size === 'lg' ? 'text-body-lg' : 'text-body',
        className,
      )}
    >
      {segments.map((segment, position) => {
        if (segment.type === 'code') {
          return (
            <CodeView
              key={position}
              code={segment.code}
              language={segment.language}
              className="my-5"
            />
          );
        }

        if (segment.type === 'list') {
          return (
            <ul key={position} className="space-y-2">
              {segment.items.map((item, itemPosition) => (
                <li key={itemPosition} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-[0.65em] h-px w-2.5 shrink-0 bg-rule-strong" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return <p key={position}>{renderInline(segment.text)}</p>;
      })}
    </div>
  );
}
