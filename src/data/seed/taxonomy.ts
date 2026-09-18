import type {
  Category,
  ContentTypeDef,
  Difficulty,
  MockBlueprint,
  Skill,
  Stack,
} from '@/domain/types';

/**
 * Taxonomy ships as data so an administrator can add a category, stack or
 * difficulty without a code change. Screens read these lists; they never
 * enumerate them inline.
 */

export const CATEGORIES: Category[] = [
  {
    id: 'javascript',
    label: { pt: 'JavaScript', en: 'JavaScript' },
    blurb: {
      pt: 'Comportamento da linguagem sob pressão: event loop, closures, coerção, this.',
      en: 'How the language actually behaves under pressure: event loop, closures, coercion, this.',
    },
    order: 1,
  },
  {
    id: 'backend',
    label: { pt: 'Backend', en: 'Backend' },
    blurb: {
      pt: 'APIs em produção: contratos, erros, idempotência, versionamento, carga.',
      en: 'APIs in production: contracts, errors, idempotency, versioning, load.',
    },
    order: 2,
  },
  {
    id: 'database',
    label: { pt: 'Banco de dados', en: 'Databases' },
    blurb: {
      pt: 'Índices, transações, isolamento e por que a query ficou lenta às três da manhã.',
      en: 'Indexes, transactions, isolation, and why the query got slow at 3am.',
    },
    order: 3,
  },
  {
    id: 'architecture',
    label: { pt: 'Arquitetura', en: 'Architecture' },
    blurb: {
      pt: 'Escala, filas, limites de serviço e o custo real de cada decisão.',
      en: 'Scale, queues, service boundaries and the real cost of each decision.',
    },
    order: 4,
  },
  {
    id: 'system-design',
    label: { pt: 'System Design', en: 'System Design' },
    blurb: {
      pt: 'Desenhar um sistema inteiro em voz alta, em 45 minutos, sem travar.',
      en: 'Designing a whole system out loud, in 45 minutes, without freezing.',
    },
    order: 5,
  },
  {
    id: 'security',
    label: { pt: 'Segurança', en: 'Security' },
    blurb: {
      pt: 'Autenticação, autorização, tokens e as falhas que passam em code review.',
      en: 'Authentication, authorization, tokens and the holes that pass code review.',
    },
    order: 6,
  },
  {
    id: 'performance',
    label: { pt: 'Performance', en: 'Performance' },
    blurb: {
      pt: 'Medir antes de otimizar, e saber explicar o que você mediu.',
      en: 'Measuring before optimising, and being able to explain what you measured.',
    },
    order: 7,
  },
  {
    id: 'code-quality',
    label: { pt: 'Qualidade de código', en: 'Code quality' },
    blurb: {
      pt: 'SOLID, testes e refatoração — as decisões que aparecem em code review e em entrevista.',
      en: 'SOLID, tests and refactoring — the calls that show up in code review and in interviews.',
    },
    order: 9,
  },
  {
    id: 'devops',
    label: { pt: 'DevOps', en: 'DevOps' },
    blurb: {
      pt: 'Deploy, containers, pipelines e o que fazer quando a produção cai.',
      en: 'Deploys, containers, pipelines and what you do when production is down.',
    },
    order: 8,
  },
  {
    id: 'frontend',
    label: { pt: 'Frontend', en: 'Frontend' },
    blurb: {
      pt: 'Estado, renderização e as decisões que aparecem em entrevista de produto.',
      en: 'State, rendering and the decisions that come up in a product interview.',
    },
    order: 9,
  },
  {
    id: 'behavioral',
    label: { pt: 'Comportamental', en: 'Behavioural' },
    blurb: {
      pt: 'Conflito, falha, feedback e prazo — contados como história, não como currículo.',
      en: 'Conflict, failure, feedback and deadlines, told as a story rather than a CV.',
    },
    order: 10,
  },
  {
    id: 'english',
    label: { pt: 'Inglês técnico', en: 'Technical English' },
    blurb: {
      pt: 'Explicar o que você já sabe, em voz alta, em inglês, sem ensaiar.',
      en: 'Explaining what you already know, out loud, in English, unrehearsed.',
    },
    order: 11,
  },
];

export const STACKS: Stack[] = [
  { id: 'nodejs', label: 'Node.js', categoryIds: ['backend', 'javascript', 'performance'] },
  { id: 'javascript', label: 'JavaScript', categoryIds: ['javascript', 'frontend'] },
  { id: 'typescript', label: 'TypeScript', categoryIds: ['javascript', 'backend', 'frontend'] },
  { id: 'react', label: 'React', categoryIds: ['frontend'] },
  { id: 'nestjs', label: 'NestJS', categoryIds: ['backend'] },
  { id: 'rest', label: 'REST API', categoryIds: ['backend', 'security'] },
  { id: 'graphql', label: 'GraphQL', categoryIds: ['backend'] },
  { id: 'postgres', label: 'PostgreSQL', categoryIds: ['database'] },
  { id: 'mongodb', label: 'MongoDB', categoryIds: ['database'] },
  { id: 'redis', label: 'Redis', categoryIds: ['database', 'performance', 'architecture'] },
  { id: 'docker', label: 'Docker', categoryIds: ['devops'] },
  { id: 'aws', label: 'AWS', categoryIds: ['devops', 'architecture'] },
  { id: 'kafka', label: 'Kafka', categoryIds: ['architecture'] },
  { id: 'kubernetes', label: 'Kubernetes', categoryIds: ['devops'] },
];

export const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: { pt: 'Iniciante', en: 'Beginner' }, order: 1 },
  { id: 'intermediate', label: { pt: 'Intermediário', en: 'Intermediate' }, order: 2 },
  { id: 'advanced', label: { pt: 'Avançado', en: 'Advanced' }, order: 3 },
  { id: 'expert', label: { pt: 'Especialista', en: 'Expert' }, order: 4 },
];

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    id: 'interview-question',
    label: { pt: 'Pergunta de entrevista', en: 'Interview question' },
    instruction: {
      pt: 'Responda como responderia a um entrevistador, em voz alta.',
      en: 'Answer it the way you would answer an interviewer, out loud.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'code-reading',
    label: { pt: 'Leitura de código', en: 'Code reading' },
    instruction: {
      pt: 'Diga o que será impresso e, principalmente, por quê.',
      en: 'Say what gets printed and, more importantly, why.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'explain-code',
    label: { pt: 'Explique o código', en: 'Explain the code' },
    instruction: {
      pt: 'Explique o que este código faz, como se estivesse em um pair.',
      en: 'Explain what this code does, as if you were pairing.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'find-the-bug',
    label: { pt: 'Encontre o bug', en: 'Find the bug' },
    instruction: {
      pt: 'Aponte o problema, explique por que acontece e como você corrigiria.',
      en: 'Name the problem, explain why it happens and how you would fix it.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'debugging',
    label: { pt: 'Investigação', en: 'Debugging challenge' },
    instruction: {
      pt: 'Descreva o que você investigaria primeiro e por quê.',
      en: 'Describe what you would investigate first, and why.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'architecture',
    label: { pt: 'Desafio de arquitetura', en: 'Architecture challenge' },
    instruction: {
      pt: 'Desenhe a solução em voz alta: componentes, dados, trade-offs.',
      en: 'Design it out loud: components, data, trade-offs.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'system-design',
    label: { pt: 'System design', en: 'System design' },
    instruction: {
      pt: 'Conduza a conversa como conduziria a entrevista inteira.',
      en: 'Drive the conversation the way you would drive the whole interview.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'scenario',
    label: { pt: 'Cenário de produção', en: 'Production scenario' },
    instruction: {
      pt: 'Está acontecendo agora. O que você faz, nesta ordem?',
      en: 'It is happening right now. What do you do, in what order?',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'behavioral',
    label: { pt: 'Comportamental', en: 'Behavioural' },
    instruction: {
      pt: 'Conte uma história real, com contexto, ação e resultado.',
      en: 'Tell a real story, with context, action and outcome.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'concept',
    label: { pt: 'Conceito', en: 'Concept' },
    instruction: {
      pt: 'Explique o conceito como explicaria para alguém do time.',
      en: 'Explain the concept the way you would to a teammate.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'compare',
    label: { pt: 'Comparação', en: 'Compare' },
    instruction: {
      pt: 'Quando você usaria cada um? A resposta boa é sobre contexto.',
      en: 'When would you use each? The good answer is about context.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'refactoring',
    label: { pt: 'Refatoração', en: 'Refactoring challenge' },
    instruction: {
      pt: 'O que você mudaria primeiro, e o que deixaria como está?',
      en: 'What would you change first, and what would you leave alone?',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'security',
    label: { pt: 'Desafio de segurança', en: 'Security challenge' },
    instruction: {
      pt: 'Encontre as vulnerabilidades e explique o impacto de cada uma.',
      en: 'Find the vulnerabilities and explain the impact of each.',
    },
    expectsSpokenAttempt: true,
  },
  {
    id: 'multiple-choice',
    label: { pt: 'Múltipla escolha', en: 'Multiple choice' },
    instruction: {
      pt: 'Escolha antes de ver a explicação.',
      en: 'Choose before you see the explanation.',
    },
    expectsSpokenAttempt: false,
  },
  {
    id: 'true-false',
    label: { pt: 'Verdadeiro ou falso', en: 'True or false' },
    instruction: {
      pt: 'Decida antes de revelar.',
      en: 'Decide before revealing.',
    },
    expectsSpokenAttempt: false,
  },
];

export const SKILLS: Skill[] = [
  {
    id: 'javascript',
    label: { pt: 'JavaScript', en: 'JavaScript' },
    kind: 'technical',
    meaning: {
      pt: 'Explicar comportamento da linguagem, não recitar definições.',
      en: 'Explaining language behaviour rather than reciting definitions.',
    },
  },
  {
    id: 'nodejs',
    label: { pt: 'Node.js', en: 'Node.js' },
    kind: 'technical',
    meaning: {
      pt: 'Saber o que acontece dentro do runtime quando a carga sobe.',
      en: 'Knowing what happens inside the runtime when load goes up.',
    },
  },
  {
    id: 'typescript',
    label: { pt: 'TypeScript', en: 'TypeScript' },
    kind: 'technical',
    meaning: {
      pt: 'Argumentar sobre tipos como ferramenta de design, não de burocracia.',
      en: 'Arguing about types as a design tool rather than as paperwork.',
    },
  },
  {
    id: 'api-design',
    label: { pt: 'Design de API', en: 'API design' },
    kind: 'technical',
    meaning: {
      pt: 'Contratos que sobrevivem a clientes que você não controla.',
      en: 'Contracts that survive clients you do not control.',
    },
  },
  {
    id: 'databases',
    label: { pt: 'Banco de dados', en: 'Databases' },
    kind: 'technical',
    meaning: {
      pt: 'Ler um plano de execução e explicar a decisão do planner.',
      en: 'Reading a query plan and explaining the planner’s decision.',
    },
  },
  {
    id: 'caching',
    label: { pt: 'Cache', en: 'Caching' },
    kind: 'technical',
    meaning: {
      pt: 'Saber o que invalidar, e admitir que essa é a parte difícil.',
      en: 'Knowing what to invalidate, and admitting that is the hard part.',
    },
  },
  {
    id: 'architecture',
    label: { pt: 'Arquitetura', en: 'Architecture' },
    kind: 'technical',
    meaning: {
      pt: 'Escolher entre opções ruins e defender a escolha com números.',
      en: 'Choosing between bad options and defending the choice with numbers.',
    },
  },
  {
    id: 'system-design',
    label: { pt: 'System design', en: 'System design' },
    kind: 'technical',
    meaning: {
      pt: 'Conduzir 45 minutos de conversa aberta sem perder o fio.',
      en: 'Driving 45 minutes of open conversation without losing the thread.',
    },
  },
  {
    id: 'security',
    label: { pt: 'Segurança', en: 'Security' },
    kind: 'technical',
    meaning: {
      pt: 'Pensar como quem ataca antes de pensar como quem entrega.',
      en: 'Thinking like an attacker before thinking like a shipper.',
    },
  },
  {
    id: 'performance',
    label: { pt: 'Performance', en: 'Performance' },
    kind: 'technical',
    meaning: {
      pt: 'Medir, isolar e explicar — nessa ordem.',
      en: 'Measure, isolate, explain, in that order.',
    },
  },
  {
    id: 'testing',
    label: { pt: 'Testes', en: 'Testing' },
    kind: 'technical',
    meaning: {
      pt: 'Explicar o que você não testa e por quê.',
      en: 'Explaining what you do not test, and why.',
    },
  },
  {
    id: 'devops',
    label: { pt: 'DevOps', en: 'DevOps' },
    kind: 'technical',
    meaning: {
      pt: 'Entregar, observar e reverter sem drama.',
      en: 'Ship it, watch it, roll it back without drama.',
    },
  },
  {
    id: 'observability',
    label: { pt: 'Observabilidade', en: 'Observability' },
    kind: 'technical',
    meaning: {
      pt: 'Saber qual pergunta seus dados conseguem responder às três da manhã.',
      en: 'Knowing which question your telemetry can answer at 3am.',
    },
  },
  {
    id: 'communication',
    label: { pt: 'Comunicação', en: 'Communication' },
    kind: 'behavioral',
    meaning: {
      pt: 'Ser entendido na primeira tentativa.',
      en: 'Being understood the first time.',
    },
  },
  {
    id: 'storytelling',
    label: { pt: 'Narrativa', en: 'Storytelling' },
    kind: 'behavioral',
    meaning: {
      pt: 'Uma história com contexto, tensão e resultado — em dois minutos.',
      en: 'A story with context, tension and outcome, in two minutes.',
    },
  },
  {
    id: 'leadership',
    label: { pt: 'Liderança', en: 'Leadership' },
    kind: 'behavioral',
    meaning: {
      pt: 'Influência sem autoridade, contada sem heroísmo.',
      en: 'Influence without authority, told without heroics.',
    },
  },
  {
    id: 'english-speaking',
    label: { pt: 'Inglês falado', en: 'Spoken English' },
    kind: 'communication',
    meaning: {
      pt: 'Explicar algo técnico em inglês sem ensaiar e sem travar.',
      en: 'Explaining something technical in English, unrehearsed, without freezing.',
    },
  },
];

export const MOCK_BLUEPRINTS: MockBlueprint[] = [
  {
    id: 'standard-loop',
    label: { pt: 'Loop padrão', en: 'Standard loop' },
    description: {
      pt: 'Cinco perguntas, como uma primeira rodada real: abertura comportamental, dois blocos técnicos, arquitetura e uma em inglês.',
      en: 'Five questions, shaped like a real first round: a behavioural opener, two technical blocks, architecture, and one in English.',
    },
    slots: [
      {
        label: { pt: 'Abertura comportamental', en: 'Behavioural opener' },
        types: ['behavioral'],
        categoryIds: ['behavioral'],
      },
      {
        label: { pt: 'Técnica — linguagem', en: 'Technical — language' },
        types: ['interview-question', 'code-reading', 'concept'],
        categoryIds: ['javascript'],
      },
      {
        label: { pt: 'Técnica — backend', en: 'Technical — backend' },
        types: ['interview-question', 'scenario', 'security', 'find-the-bug'],
        categoryIds: ['backend', 'database', 'security'],
      },
      {
        label: { pt: 'Arquitetura', en: 'Architecture' },
        types: ['architecture', 'system-design', 'compare'],
        categoryIds: ['architecture', 'system-design'],
      },
      {
        label: { pt: 'Comunicação em inglês', en: 'English communication' },
        types: ['interview-question', 'concept', 'behavioral'],
        locale: 'en',
      },
    ],
  },
  {
    id: 'english-round',
    label: { pt: 'Rodada em inglês', en: 'English round' },
    description: {
      pt: 'Quatro perguntas, todas em inglês. Feito para o dia em que a entrevista não vai ser em português.',
      en: 'Four questions, all in English. Built for the day the interview will not be in your first language.',
    },
    slots: [
      { label: { pt: 'Apresentação', en: 'Introduction' }, types: ['behavioral'], locale: 'en' },
      { label: { pt: 'Conceito técnico', en: 'Technical concept' }, types: ['concept', 'interview-question'], locale: 'en' },
      { label: { pt: 'Cenário', en: 'Scenario' }, types: ['scenario', 'debugging'], locale: 'en' },
      { label: { pt: 'Trade-offs', en: 'Trade-offs' }, types: ['compare', 'architecture'], locale: 'en' },
    ],
  },
  {
    id: 'pressure-round',
    label: { pt: 'Rodada de pressão', en: 'Pressure round' },
    description: {
      pt: 'Seis perguntas seguidas, com as pegadinhas incluídas. Serve para descobrir onde você trava.',
      en: 'Six questions back to back, traps included. Built to find where you freeze.',
    },
    slots: [
      { label: { pt: 'Pegadinha', en: 'Trap' }, types: ['code-reading'], difficulty: ['advanced', 'expert'] },
      { label: { pt: 'Linguagem', en: 'Language' }, types: ['interview-question', 'concept'], categoryIds: ['javascript'] },
      { label: { pt: 'Banco de dados', en: 'Database' }, types: ['interview-question', 'scenario', 'debugging'], categoryIds: ['database'] },
      { label: { pt: 'Segurança', en: 'Security' }, types: ['security', 'interview-question'], categoryIds: ['security'] },
      { label: { pt: 'Arquitetura', en: 'Architecture' }, types: ['architecture', 'system-design'], categoryIds: ['architecture', 'system-design'] },
      { label: { pt: 'Comportamental difícil', en: 'Hard behavioural' }, types: ['behavioral'], categoryIds: ['behavioral'] },
    ],
  },
];
