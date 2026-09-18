import type { LearningPath } from '@/domain/types';

/**
 * Learning paths.
 *
 * An itinerary through the bank, not a second kind of content: every step is
 * an ordinary item that Today's Practice can also serve on its own. The order
 * is the product — briefing, then recognition, then a decision, then the open
 * question — so that nobody is asked to argue with a senior about something
 * they met thirty seconds ago.
 */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-browser-session',
    slug: 'sessao-no-navegador',
    title: {
      pt: 'A sessão no navegador',
      en: 'The session in the browser',
    },
    summary: {
      pt: 'Onde guardar o token, por que isso é uma decisão de segurança, e como defender a sua escolha numa conversa.',
      en: 'Where to keep the token, why that is a security decision, and how to defend your choice in a conversation.',
    },
    categoryId: 'security',
    stackIds: ['javascript', 'react'],
    difficulty: 'intermediate',
    stepIds: [
      'sec-session-storage-learn',
      'sec-session-storage-check',
      'sec-session-storage-decision',
      'sec-session-spa-choice',
      'sec-xss-csrf',
      'sec-session-senior-talk',
    ],
  },
  {
    id: 'path-event-loop',
    slug: 'event-loop',
    title: { pt: 'O event loop do Node', en: "Node's event loop" },
    summary: {
      pt: 'Da ordem de execução até explicar, em voz alta, por que uma thread só aguenta tanta requisição.',
      en: 'From execution order to explaining out loud why one thread handles that much traffic.',
    },
    categoryId: 'javascript',
    stackIds: ['javascript', 'nodejs'],
    difficulty: 'intermediate',
    stepIds: [
      'js-event-loop-learn',
      'js-event-loop-check',
      'js-event-loop-order',
      'js-microtask-starvation',
      'node-set-immediate',
      'js-event-loop-single-thread',
    ],
  },
  {
    id: 'path-indexes',
    slug: 'indices',
    title: { pt: 'Índices que o banco usa', en: 'Indexes the database actually uses' },
    summary: {
      pt: 'Por que o índice acelera, quando ele é ignorado, e o que dizer quando a query lenta aparece na entrevista.',
      en: 'Why an index speeds things up, when it gets ignored, and what to say when the slow query shows up in the interview.',
    },
    categoryId: 'database',
    stackIds: ['postgresql'],
    difficulty: 'intermediate',
    stepIds: [
      'db-index-learn',
      'db-index-decision',
      'db-composite-index-order',
      'db-slow-query',
      'db-index-basics',
    ],
  },
  {
    id: 'path-idempotency',
    slug: 'idempotencia',
    title: { pt: 'APIs que aguentam repetição', en: 'APIs that survive being repeated' },
    summary: {
      pt: 'Retry, cobrança duplicada e chave de idempotência — até conseguir desenhar isso falando.',
      en: 'Retries, double charges and idempotency keys — until you can design it out loud.',
    },
    categoryId: 'backend',
    stackIds: ['nodejs', 'rest-api'],
    difficulty: 'advanced',
    stepIds: [
      'api-idempotency-learn',
      'api-idempotency-check',
      'api-idempotency-choice',
      'api-error-contract',
      'api-idempotency',
    ],
  },
];

export const LEARNING_PATH_BY_SLUG = new Map(LEARNING_PATHS.map((path) => [path.slug, path]));
