import { useMemo, useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { TOKEN_CLASS, tokenize } from '@/lib/highlight';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

/**
 * A code listing.
 *
 * Line numbers are a real gutter rather than part of the text, so selecting
 * and copying gives back the code and nothing else. Highlighted lines mark
 * where a find-the-bug item wants the eye to go.
 */
export function CodeView({
  code,
  language,
  filename,
  highlightLines,
  className,
}: {
  code: string;
  language: string;
  filename?: string;
  highlightLines?: number[];
  className?: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    const raw = code.replace(/\n$/, '').split('\n');
    return raw.map((line) => tokenize(line, language));
  }, [code, language]);

  const marked = useMemo(() => new Set(highlightLines ?? []), [highlightLines]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the code is selectable either way.
    }
  };

  const gutterWidth = `${String(lines.length).length + 1}ch`;

  return (
    <figure className={cn('recess overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-rule bg-chassis px-3 py-2">
        <span className="legend-type truncate">{filename ?? language}</span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            'legend-type inline-flex items-center gap-1.5 rounded-[3px] px-2 py-1',
            'transition-colors duration-150 hover:bg-plate hover:text-legend-2',
            copied && 'text-monitor',
          )}
        >
          {copied ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copied ? t('block.code.copied') : t('block.code.copy')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <pre className="min-w-full py-3 font-mono text-[0.8125rem] leading-[1.7]">
          <code className="block">
            {lines.map((tokens, lineIndex) => {
              const lineNumber = lineIndex + 1;
              const isMarked = marked.has(lineNumber);
              return (
                <span
                  key={lineNumber}
                  className={cn(
                    'flex w-full px-3',
                    isMarked && 'bg-brass/[0.08] shadow-[inset_2px_0_0_rgb(var(--lab-brass))]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    style={{ width: gutterWidth }}
                    className="mr-4 shrink-0 select-none text-right tabular-nums text-legend-3/70"
                  >
                    {lineNumber}
                  </span>
                  <span className="whitespace-pre">
                    {tokens.map((token, position) => (
                      <span key={position} className={TOKEN_CLASS[token.kind]}>
                        {token.value}
                      </span>
                    ))}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </figure>
  );
}
