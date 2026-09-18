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
  {
    id: 'path-code-quality',
    slug: 'qualidade-de-codigo',
    title: { pt: 'Decisões de código que aparecem em entrevista', en: 'Code decisions interviews ask about' },
    summary: {
      pt: 'SOLID, refatoração e testes — do conceito até justificar uma escolha de design falando.',
      en: 'SOLID, refactoring and tests — from the concept to defending a design call out loud.',
    },
    categoryId: 'code-quality',
    stackIds: ['typescript', 'nodejs'],
    difficulty: 'intermediate',
    stepIds: [
      'cq-solid-learn',
      'cq-design-decisions',
      'cq-refactor-choice',
      'cq-god-class',
      'cq-abstraction-interview',
    ],
  },
  {
    id: 'path-boundaries',
    slug: 'fronteiras',
    title: { pt: 'Onde cortar um sistema', en: 'Where to cut a system' },
    summary: {
      pt: 'Bounded context, camadas e monólito modular — até saber dizer quando extrair um serviço.',
      en: 'Bounded contexts, layers and the modular monolith — until you can say when to extract a service.',
    },
    categoryId: 'architecture',
    stackIds: ['nodejs', 'typescript'],
    difficulty: 'advanced',
    stepIds: [
      'arch-bounded-context-learn',
      'arch-hexagonal-learn',
      'arch-modeling-decisions',
      'arch-where-rule-choice',
      'arch-modular-monolith-written',
      'arch-extract-service',
    ],
  },
  {
    id: 'path-scale',
    slug: 'escala',
    title: { pt: 'Escalar com números, não com fé', en: 'Scaling with numbers, not faith' },
    summary: {
      pt: 'Capacidade, estratégias de leitura e a ordem certa de escalar — até desenhar um sistema falando.',
      en: 'Capacity, read strategies and the right order to scale — until you can design one out loud.',
    },
    categoryId: 'system-design',
    stackIds: ['nodejs', 'postgres', 'redis'],
    difficulty: 'advanced',
    stepIds: [
      'sd-capacity-learn',
      'sd-read-strategy-learn',
      'sd-scaling-decisions',
      'sd-capacity-choice',
      'sd-read-strategy-choice',
      'sd-notifications-design',
    ],
  },
  {
    id: 'path-resilience',
    slug: 'resiliencia',
    title: { pt: 'Quando a dependência falha', en: 'When the dependency fails' },
    summary: {
      pt: 'Anti-patterns de performance, retry, circuito e degradação — o que derrubar e o que segurar.',
      en: 'Performance antipatterns, retries, breakers and degradation — what to drop and what to hold.',
    },
    categoryId: 'architecture',
    stackIds: ['nodejs'],
    difficulty: 'advanced',
    stepIds: [
      'sd-antipatterns-learn',
      'sd-resilience-decisions',
      'sd-retry-storm',
      'sd-degradation-interview',
    ],
  },
  {
    id: 'path-delivery',
    slug: 'entrega',
    title: { pt: 'Do commit à produção', en: 'From commit to production' },
    summary: {
      pt: 'Containers, pipeline, migration e rollback — até explicar como você sabe que o deploy deu certo.',
      en: 'Containers, pipeline, migrations and rollback — until you can explain how you know a deploy went well.',
    },
    categoryId: 'devops',
    stackIds: ['docker', 'nodejs'],
    difficulty: 'intermediate',
    stepIds: [
      'dev-containers-learn',
      'dev-pipeline-learn',
      'dev-deploy-decisions',
      'dev-dockerfile-bug',
      'dev-deploy-interview',
    ],
  },
  {
    id: 'path-http',
    slug: 'http-na-pratica',
    title: { pt: 'HTTP como contrato', en: 'HTTP as a contract' },
    summary: {
      pt: 'Métodos, status, cache e CORS — do fundamento até defender o desenho da sua API falando.',
      en: 'Methods, status, caching and CORS — from the fundamentals to defending your API design out loud.',
    },
    categoryId: 'backend',
    stackIds: ['rest', 'nodejs'],
    difficulty: 'intermediate',
    stepIds: [
      'web-http-learn',
      'web-cors-learn',
      'web-http-tf',
      'web-status-choice',
      'web-caching-choice',
      'web-cors-bug',
      'api-secure-rest',
    ],
  },
];

export const LEARNING_PATH_BY_SLUG = new Map(LEARNING_PATHS.map((path) => [path.slug, path]));
