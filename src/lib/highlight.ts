/**
 * A small syntax highlighter.
 *
 * The product shows short, self-contained snippets in four or five languages.
 * A full tokenizer library would be one of the heaviest dependencies in the
 * bundle for that, so this does the job directly: one pass, ordered
 * alternation, and a token stream the renderer turns into spans.
 *
 * It is deliberately approximate — it will not colour a generic type parameter
 * perfectly — but it never mangles the code, because the raw text is always
 * reassembled verbatim from the tokens.
 */

export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'literal'
  | 'function'
  | 'operator'
  | 'punctuation'
  | 'property';

export interface Token {
  kind: TokenKind;
  value: string;
}

const JS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
  'constructor', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum',
  'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements',
  'import', 'in', 'instanceof', 'interface', 'keyof', 'let', 'namespace', 'new', 'of',
  'private', 'protected', 'public', 'readonly', 'return', 'satisfies', 'set', 'static',
  'super', 'switch', 'this', 'throw', 'try', 'type', 'typeof', 'var', 'void', 'while',
  'yield',
]);

const JS_LITERALS = new Set([
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'any', 'unknown', 'never',
  'string', 'number', 'boolean', 'object', 'symbol', 'bigint',
]);

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete',
  'create', 'table', 'index', 'alter', 'add', 'drop', 'column', 'primary', 'key',
  'foreign', 'references', 'not', 'null', 'default', 'check', 'unique', 'constraint',
  'join', 'inner', 'left', 'right', 'outer', 'on', 'group', 'by', 'order', 'having',
  'limit', 'offset', 'and', 'or', 'in', 'exists', 'case', 'when', 'then', 'else',
  'end', 'as', 'distinct', 'union', 'all', 'begin', 'commit', 'rollback', 'returning',
  'conflict', 'do', 'nothing', 'desc', 'asc', 'with', 'interval', 'now', 'concurrently',
  'analyze', 'explain', 'buffers', 'for', 'share',
]);

const SQL_LITERALS = new Set([
  'text', 'integer', 'int', 'bigint', 'boolean', 'timestamptz', 'timestamp', 'jsonb',
  'json', 'uuid', 'numeric', 'varchar', 'serial', 'date',
]);

interface LanguageRules {
  keywords: Set<string>;
  literals: Set<string>;
  lineComment: string | null;
  caseInsensitive: boolean;
}

function rulesFor(language: string): LanguageRules {
  const normalised = language.toLowerCase();

  if (normalised === 'sql') {
    return {
      keywords: SQL_KEYWORDS,
      literals: SQL_LITERALS,
      lineComment: '--',
      caseInsensitive: true,
    };
  }

  if (normalised === 'json') {
    return { keywords: new Set(), literals: JS_LITERALS, lineComment: null, caseInsensitive: false };
  }

  return {
    keywords: JS_KEYWORDS,
    literals: JS_LITERALS,
    lineComment: '//',
    caseInsensitive: false,
  };
}

/**
 * Order matters: comments and strings are matched before anything else so a
 * keyword inside a string is never coloured as code.
 */
export function tokenize(source: string, language: string): Token[] {
  if (language.toLowerCase() === 'text') {
    return [{ kind: 'plain', value: source }];
  }

  const rules = rulesFor(language);
  const tokens: Token[] = [];

  const patterns: Array<{ kind: TokenKind; regex: RegExp }> = [
    { kind: 'comment', regex: /^\/\*[\s\S]*?\*\// },
    ...(rules.lineComment === '--'
      ? [{ kind: 'comment' as TokenKind, regex: /^--[^\n]*/ }]
      : [{ kind: 'comment' as TokenKind, regex: /^\/\/[^\n]*/ }]),
    { kind: 'string', regex: /^"(?:[^"\\]|\\.)*"/ },
    { kind: 'string', regex: /^'(?:[^'\\]|\\.)*'/ },
    { kind: 'string', regex: /^`(?:[^`\\]|\\.)*`/ },
    { kind: 'number', regex: /^\$\d+/ },
    { kind: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
    { kind: 'plain', regex: /^[A-Za-z_$][\w$]*/ },
    { kind: 'operator', regex: /^(?:=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\+\+|--|[+\-*/%=<>!?:&|^~])/ },
    { kind: 'punctuation', regex: /^[{}[\]();,.]/ },
    { kind: 'plain', regex: /^\s+/ },
    { kind: 'plain', regex: /^[\s\S]/ },
  ];

  let rest = source;

  while (rest.length > 0) {
    let matched = false;

    for (const pattern of patterns) {
      const match = pattern.regex.exec(rest);
      if (!match) continue;

      const value = match[0];
      let kind = pattern.kind;

      if (kind === 'plain' && /^[A-Za-z_$]/.test(value)) {
        const probe = rules.caseInsensitive ? value.toLowerCase() : value;
        if (rules.keywords.has(probe)) {
          kind = 'keyword';
        } else if (rules.literals.has(probe)) {
          kind = 'literal';
        } else if (/^\(/.test(rest.slice(value.length))) {
          kind = 'function';
        } else if (tokens.at(-1)?.value === '.') {
          kind = 'property';
        }
      }

      const previous = tokens.at(-1);
      if (previous && previous.kind === kind) {
        previous.value += value;
      } else {
        tokens.push({ kind, value });
      }

      rest = rest.slice(value.length);
      matched = true;
      break;
    }

    // Defensive: a pattern set that matches nothing would spin forever.
    if (!matched) {
      tokens.push({ kind: 'plain', value: rest[0] });
      rest = rest.slice(1);
    }
  }

  return tokens;
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: 'text-legend',
  comment: 'text-legend-3 italic',
  string: 'text-monitor',
  number: 'text-channel2',
  keyword: 'text-brass',
  literal: 'text-channel2',
  function: 'text-legend',
  operator: 'text-legend-2',
  punctuation: 'text-legend-3',
  property: 'text-legend-2',
};
