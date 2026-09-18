import type { SourceRef } from '@/domain/types';

/**
 * Where the technical claims come from.
 *
 * Official documentation first, then standards, then a small number of
 * well-known references. Nothing here is invented: a source that cannot be
 * opened is worse than no source, because it teaches the reader to trust a
 * link that lies.
 */
export const SOURCES: SourceRef[] = [
  // --- web platform ---------------------------------------------------------
  {
    id: 'mdn-localstorage',
    title: 'Window: localStorage property',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
    publisher: 'MDN Web Docs',
    kind: 'official_docs',
  },
  {
    id: 'mdn-set-cookie',
    title: 'Set-Cookie header',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie',
    publisher: 'MDN Web Docs',
    kind: 'official_docs',
  },
  {
    id: 'mdn-cors',
    title: 'Cross-Origin Resource Sharing (CORS)',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
    publisher: 'MDN Web Docs',
    kind: 'official_docs',
  },
  {
    id: 'mdn-http-status',
    title: 'HTTP response status codes',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
    publisher: 'MDN Web Docs',
    kind: 'reference',
  },
  {
    id: 'mdn-event-loop',
    title: 'The event loop',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop',
    publisher: 'MDN Web Docs',
    kind: 'official_docs',
  },
  {
    id: 'rfc-9110',
    title: 'RFC 9110 — HTTP Semantics',
    url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
    publisher: 'IETF',
    kind: 'rfc',
  },
  {
    id: 'rfc-7519',
    title: 'RFC 7519 — JSON Web Token (JWT)',
    url: 'https://www.rfc-editor.org/rfc/rfc7519',
    publisher: 'IETF',
    kind: 'rfc',
  },

  // --- node and javascript --------------------------------------------------
  {
    id: 'node-event-loop',
    title: 'The Node.js event loop, timers, and process.nextTick()',
    url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
    publisher: 'Node.js',
    kind: 'official_docs',
  },
  {
    id: 'node-worker-threads',
    title: 'Worker threads',
    url: 'https://nodejs.org/api/worker_threads.html',
    publisher: 'Node.js',
    kind: 'official_docs',
  },
  {
    id: 'node-streams',
    title: 'Stream',
    url: 'https://nodejs.org/api/stream.html',
    publisher: 'Node.js',
    kind: 'official_docs',
  },

  // --- databases ------------------------------------------------------------
  {
    id: 'pg-indexes',
    title: 'Indexes',
    url: 'https://www.postgresql.org/docs/current/indexes.html',
    publisher: 'PostgreSQL',
    kind: 'official_docs',
  },
  {
    id: 'pg-explain',
    title: 'Using EXPLAIN',
    url: 'https://www.postgresql.org/docs/current/using-explain.html',
    publisher: 'PostgreSQL',
    kind: 'official_docs',
  },
  {
    id: 'pg-isolation',
    title: 'Transaction isolation',
    url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
    publisher: 'PostgreSQL',
    kind: 'official_docs',
  },
  {
    id: 'pg-create-index',
    title: 'CREATE INDEX (including CONCURRENTLY)',
    url: 'https://www.postgresql.org/docs/current/sql-createindex.html',
    publisher: 'PostgreSQL',
    kind: 'official_docs',
  },
  {
    id: 'redis-docs',
    title: 'Redis documentation',
    url: 'https://redis.io/docs/latest/',
    publisher: 'Redis',
    kind: 'official_docs',
  },

  // --- security -------------------------------------------------------------
  {
    id: 'owasp-xss',
    title: 'Cross Site Scripting Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
    publisher: 'OWASP',
    kind: 'security',
  },
  {
    id: 'owasp-csrf',
    title: 'Cross-Site Request Forgery Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
    publisher: 'OWASP',
    kind: 'security',
  },
  {
    id: 'owasp-password-storage',
    title: 'Password Storage Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
    publisher: 'OWASP',
    kind: 'security',
  },
  {
    id: 'owasp-top-ten',
    title: 'OWASP Top 10',
    url: 'https://owasp.org/www-project-top-ten/',
    publisher: 'OWASP',
    kind: 'security',
  },

  // --- architecture and operations -----------------------------------------
  {
    id: 'azure-cache-aside',
    title: 'Cache-Aside pattern',
    url: 'https://learn.microsoft.com/azure/architecture/patterns/cache-aside',
    publisher: 'Microsoft Learn',
    kind: 'reference',
  },
  {
    id: 'azure-antipatterns',
    title: 'Performance antipatterns for cloud applications',
    url: 'https://learn.microsoft.com/azure/architecture/antipatterns/',
    publisher: 'Microsoft Learn',
    kind: 'reference',
  },
  {
    id: 'azure-retry',
    title: 'Retry pattern',
    url: 'https://learn.microsoft.com/azure/architecture/patterns/retry',
    publisher: 'Microsoft Learn',
    kind: 'reference',
  },
  {
    id: 'azure-circuit-breaker',
    title: 'Circuit Breaker pattern',
    url: 'https://learn.microsoft.com/azure/architecture/patterns/circuit-breaker',
    publisher: 'Microsoft Learn',
    kind: 'reference',
  },
  {
    id: 'fowler-bounded-context',
    title: 'BoundedContext',
    url: 'https://martinfowler.com/bliki/BoundedContext.html',
    publisher: 'martinfowler.com',
    kind: 'article',
  },
  {
    id: 'fowler-cqrs',
    title: 'CQRS',
    url: 'https://martinfowler.com/bliki/CQRS.html',
    publisher: 'martinfowler.com',
    kind: 'article',
  },
  {
    id: 'fowler-test-pyramid',
    title: 'The Practical Test Pyramid',
    url: 'https://martinfowler.com/articles/practical-test-pyramid.html',
    publisher: 'martinfowler.com',
    kind: 'article',
  },
  {
    id: 'fowler-strangler',
    title: 'Strangler Fig Application',
    url: 'https://martinfowler.com/bliki/StranglerFigApplication.html',
    publisher: 'martinfowler.com',
    kind: 'article',
  },
  {
    id: 'sre-monitoring',
    title: 'Monitoring Distributed Systems',
    url: 'https://sre.google/sre-book/monitoring-distributed-systems/',
    publisher: 'Google SRE Book',
    kind: 'book',
  },
  {
    id: 'twelve-factor',
    title: 'The Twelve-Factor App',
    url: 'https://12factor.net/',
    publisher: '12factor.net',
    kind: 'reference',
  },
  {
    id: 'stripe-idempotency',
    title: 'Idempotent requests',
    url: 'https://docs.stripe.com/api/idempotent_requests',
    publisher: 'Stripe',
    kind: 'official_docs',
  },

  // --- delivery -------------------------------------------------------------
  {
    id: 'docker-build',
    title: 'Docker build',
    url: 'https://docs.docker.com/build/',
    publisher: 'Docker',
    kind: 'official_docs',
  },
  {
    id: 'docker-compose',
    title: 'Docker Compose',
    url: 'https://docs.docker.com/compose/',
    publisher: 'Docker',
    kind: 'official_docs',
  },
  {
    id: 'gh-actions',
    title: 'GitHub Actions documentation',
    url: 'https://docs.github.com/actions',
    publisher: 'GitHub',
    kind: 'official_docs',
  },
];

export const SOURCE_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));
