import type { Content } from '@/domain/types';
import {
  answers,
  choices,
  code,
  content,
  decisions,
  followUps,
  list,
  lookingFor,
  mistakes,
  note,
  prompt,
  rubric,
  t,
  tip,
  tradeOff,
  warn,
} from '../authoring';

/**
 * Scale: capacity, read strategies, performance antipatterns and resilience.
 *
 * The roadmap's system-design region is mostly numbers and failure modes, and
 * that is exactly what a senior interview probes: not "what is sharding" but
 * "how many instances, and what breaks first when the dependency is slow".
 */
export const SCALE_CONTENT: Content[] = [
  content({
    slug: 'sd-capacity-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Os números que você precisa estimar', 'The numbers you have to estimate'),
    categoryId: 'system-design',
    topic: 'capacity',
    stackIds: ['nodejs', 'aws'],
    sourceIds: ['sre-monitoring'],
    skillIds: ['system-design', 'performance'],
    difficulty: 'intermediate',
    tags: ['capacidade', 'rps', 'latência'],
    minutes: 4,
    related: ['sd-capacity-choice', 'sd-scaling-decisions'],
    blocks: [
      note(
        t(
          'Em system design, a primeira coisa que separa uma resposta vaga de uma resposta de engenheiro é estimar. Não precisa acertar: precisa mostrar o raciocínio e a ordem de grandeza.',
          'In system design, the first thing that separates a vague answer from an engineer\'s answer is estimating. You do not have to be right: you have to show the reasoning and the order of magnitude.',
        ),
      ),
      note(
        t(
          '**RPS.** Um milhão de requisições por dia dá cerca de 12 por segundo na média — e média engana. O pico costuma ser de três a dez vezes a média, e é para o pico que se dimensiona. Sempre pergunte se o tráfego é espalhado ou concentrado em duas horas.',
          '**RPS.** A million requests a day is roughly 12 per second on average — and averages lie. Peak is usually three to ten times the average, and you size for peak. Always ask whether traffic is spread out or concentrated in two hours.',
        ),
        t('Requisições por segundo', 'Requests per second'),
      ),
      note(
        t(
          '**Latência e throughput não são a mesma coisa.** Latência é quanto demora uma requisição; throughput é quantas cabem por segundo. Dá para melhorar throughput adicionando máquinas e não mexer na latência — e é por isso que "está lento" nunca é resolvido só com mais instância.',
          '**Latency and throughput are not the same.** Latency is how long one request takes; throughput is how many fit per second. You can improve throughput by adding machines without moving latency at all — which is why "it is slow" is never fixed by instances alone.',
        ),
        t('Latência × throughput', 'Latency vs throughput'),
      ),
      note(
        t(
          '**Concorrência.** A regra prática é a lei de Little: concorrência ≈ throughput × latência. Com 200 req/s e 250 ms por requisição, há cerca de 50 requisições em voo a qualquer momento. Esse número é o que dimensiona pool de conexões e threads — e é o que explica por que um pool de 10 conexões vira fila.',
          '**Concurrency.** The rule of thumb is Little\'s law: concurrency ≈ throughput × latency. At 200 req/s with 250 ms per request, about 50 requests are in flight at any moment. That number sizes connection pools and threads — and it is what explains why a pool of 10 turns into a queue.',
        ),
        t('Concorrência simultânea', 'Concurrency in flight'),
      ),
      code(
        'text',
        `
1.000.000 req/dia  ->  ~12 req/s em média  ->  pico de ~60 req/s (5x)
latência p95 = 250 ms
concorrência em voo = 60 x 0,25 = 15 requisições
pool de conexões < 15  ->  fila antes do banco, mesmo com CPU baixa
`,
      ),
      note(
        t(
          '**Percentis, não média.** A média esconde a cauda. Se o p50 é 80 ms e o p99 é 4 s, há um usuário em cem esperando quatro segundos — e normalmente é o cliente com mais dados. Fale sempre em p95 ou p99.',
          '**Percentiles, not averages.** The mean hides the tail. If p50 is 80 ms and p99 is 4 s, one user in a hundred waits four seconds — and it is usually the customer with the most data. Always talk in p95 or p99.',
        ),
        t('Percentis', 'Percentiles'),
      ),
      note(
        t(
          '**Saturação.** Utilização acima de ~70% de qualquer recurso — CPU, pool, IOPS — faz a fila crescer rápido e a latência explodir de forma não linear. É por isso que "a CPU está em 85%, está tudo bem" costuma ser o último comentário antes do incidente.',
          '**Saturation.** Utilisation above ~70% of any resource — CPU, pool, IOPS — makes the queue grow fast and latency blow up non-linearly. That is why "CPU is at 85%, we are fine" tends to be the last comment before the incident.',
        ),
        t('Saturação', 'Saturation'),
      ),
    ],
  }),

  content({
    slug: 'sd-capacity-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Dimensionar antes da Black Friday', 'Sizing before Black Friday'),
    categoryId: 'system-design',
    topic: 'capacity',
    stackIds: ['nodejs', 'aws'],
    skillIds: ['system-design', 'performance'],
    difficulty: 'advanced',
    tags: ['capacidade', 'rps', 'escala'],
    minutes: 3,
    related: ['sd-capacity-learn'],
    blocks: [
      prompt(
        t(
          'Qual raciocínio você levaria para a reunião de capacidade?',
          'Which line of reasoning would you take into the capacity meeting?',
        ),
        t(
          'A API faz 40 req/s no pico normal com p95 de 200 ms. Marketing espera 6x o tráfego por três horas. Cada instância aguenta hoje cerca de 25 req/s antes de a latência subir.',
          'The API peaks at 40 req/s with a p95 of 200 ms. Marketing expects 6x the traffic for three hours. Each instance currently handles about 25 req/s before latency climbs.',
        ),
      ),
      choices(false, [
        {
          id: 'linear',
          label: t(
            '240 req/s ÷ 25 = 10 instâncias. Subo 10 e acompanho.',
            '240 req/s ÷ 25 = 10 instances. I bring up 10 and watch.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'A conta está certa e é o começo da resposta. O que falta é margem — ninguém opera a 100% do limite medido — e a pergunta de o que mais escala junto: banco, pool de conexões, serviço de pagamento, limite de fila. Instância é o recurso mais fácil de multiplicar e quase nunca é o que quebra primeiro.',
            'The arithmetic is right and it is the start of the answer. What is missing is headroom — nobody runs at 100% of a measured limit — and the question of what else scales with it: the database, the connection pool, the payment provider, queue limits. Instances are the easiest resource to multiply and almost never the first thing to break.',
          ),
        },
        {
          id: 'headroom-deps',
          label: t(
            '240 req/s com folga de 30% dá ~13 instâncias, e antes disso eu verifico banco, pool e limites dos provedores externos.',
            '240 req/s with 30% headroom is ~13 instances, and before that I check the database, the pool and external provider limits.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'Dimensiona para o pico com margem e trata o resto do caminho como parte do sistema. Em quase todo incidente de Black Friday o gargalo não é a aplicação: é conexão de banco esgotada, rate limit do provedor de pagamento, ou uma query que degrada com o volume do dia.',
            'Sizes for peak with headroom and treats the rest of the path as part of the system. In nearly every Black Friday incident the bottleneck is not the application: it is exhausted database connections, a payment provider rate limit, or a query that degrades with the day\'s volume.',
          ),
        },
        {
          id: 'autoscale',
          label: t(
            'Configuro autoscaling por CPU e deixo a plataforma resolver.',
            'I set up CPU-based autoscaling and let the platform handle it.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Autoscaling ajuda, e é razoável ter. Mas ele reage com atraso — alguns minutos entre métrica, decisão e instância pronta — e uma campanha que começa às 9h em ponto satura antes disso. Além disso, CPU costuma ser a métrica errada quando o gargalo é espera de I/O.',
            'Autoscaling helps and is reasonable to have. But it reacts with a lag — minutes between metric, decision and a warm instance — and a campaign that starts at 9am sharp saturates before that. On top of that, CPU is usually the wrong metric when the bottleneck is I/O wait.',
          ),
        },
        {
          id: 'cache-everything',
          label: t(
            'Coloco cache na frente de tudo e mantenho as instâncias atuais.',
            'I put a cache in front of everything and keep the current instances.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Cache resolve leitura repetida, e o pico de Black Friday tem escrita: carrinho, pedido, pagamento. Sem medir a taxa de acerto esperada, isso é uma aposta — e cache mal invalidado num dia de promoção produz preço errado na tela.',
            'A cache solves repeated reads, and a Black Friday peak is full of writes: carts, orders, payments. Without measuring the expected hit rate this is a bet — and a badly invalidated cache on a promotion day puts the wrong price on screen.',
          ),
        },
      ]),
      tip(
        t(
          'Fazer a conta em voz alta vale mais que o número final. "240 no pico, cada instância aguenta 25, com folga de 30% são 13" mostra o método que o entrevistador quer ver.',
          'Doing the arithmetic out loud is worth more than the final number. "240 at peak, 25 per instance, 30% headroom means 13" shows the method the interviewer wants to see.',
        ),
      ),
    ],
  }),

  content({
    slug: 'sd-scaling-decisions',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões de escala', 'Scaling calls'),
    categoryId: 'system-design',
    topic: 'scaling',
    stackIds: ['nodejs', 'aws', 'redis'],
    skillIds: ['system-design'],
    difficulty: 'intermediate',
    tags: ['escala', 'stateless', 'autoscaling'],
    minutes: 3,
    related: ['sd-capacity-learn', 'arch-horizontal-vertical'],
    blocks: [
      decisions(
        [
          {
            statement: t(
              'A API guarda sessão em memória. Para escalar, vou ligar sticky sessions no load balancer.',
              'The API keeps sessions in memory. To scale, I will turn on sticky sessions at the load balancer.',
            ),
            expected: 'disagree',
            verdict: t(
              'Sticky session é adiar o problema e piorar o dia do deploy.',
              'Sticky sessions postpone the problem and make deploy day worse.',
            ),
            why: t(
              'Com afinidade de sessão, cada deploy ou instância removida derruba quem estava naquele nó, o balanceamento fica desigual, e autoscaling perde efeito porque as instâncias novas não recebem quem já está logado. Mover a sessão para fora — Redis ou um token assinado — torna a instância descartável, que é o que "escalar horizontalmente" significa na prática.',
              'With session affinity, every deploy or removed instance drops whoever was on that node, balancing goes uneven, and autoscaling loses effect because new instances do not receive existing users. Moving the session out — Redis, or a signed token — makes the instance disposable, which is what "scaling horizontally" actually means.',
            ),
            tradeOff: t(
              'Sessão em Redis adiciona uma dependência no caminho de cada requisição, e ela precisa de alta disponibilidade própria.',
              'Sessions in Redis add a dependency to every request path, and it needs its own availability story.',
            ),
          },
          {
            statement: t(
              'O banco é o gargalo. Antes de sharding, vou subir uma réplica de leitura e mandar os relatórios para ela.',
              'The database is the bottleneck. Before sharding, I will add a read replica and send reports to it.',
            ),
            expected: 'agree',
            verdict: t(
              'A ordem certa: réplica é reversível, sharding não.',
              'The right order: a replica is reversible, sharding is not.',
            ),
            why: t(
              'Relatório é leitura pesada, tolera dado alguns segundos atrasado e é o primeiro candidato a sair do primário. Sharding muda o modelo de dados, quebra join e transação entre shards, e é caríssimo de desfazer. Só se justifica quando escrita ou volume não cabem mais numa instância.',
              'Reports are heavy reads, tolerate data a few seconds stale, and are the first candidate to leave the primary. Sharding changes the data model, breaks joins and transactions across shards, and is brutally expensive to undo. It is only justified when writes or volume no longer fit one instance.',
            ),
            context: t(
              'Se o relatório precisa de número exato do instante — fechamento contábil, por exemplo — a réplica atrasada não serve e a conversa vira outra.',
              'If the report needs an exact number for the instant — an accounting close, say — a lagging replica will not do and the conversation changes.',
            ),
          },
          {
            statement: t(
              'Vou configurar o autoscaling para reagir a p95 de latência em vez de CPU.',
              'I will configure autoscaling to react to p95 latency instead of CPU.',
            ),
            expected: 'agree',
            verdict: t(
              'A métrica certa é a que representa a dor do usuário.',
              'The right metric is the one that represents the user\'s pain.',
            ),
            why: t(
              'Em serviço de I/O, a CPU fica baixa enquanto a latência sobe: a thread está esperando banco, não calculando. Escalar por latência (ou por profundidade de fila) reage ao problema real. Vale cuidar de dois detalhes: latência alta por causa de um dependente lento não melhora com mais instâncias, e limite máximo de instâncias evita que um incidente vire uma fatura.',
              'In an I/O-bound service, CPU stays low while latency climbs: the thread is waiting on the database, not computing. Scaling on latency (or queue depth) reacts to the real problem. Two details matter: latency caused by a slow dependency does not improve with more instances, and a maximum instance count keeps an incident from becoming an invoice.',
            ),
          },
        ],
        'buttons',
      ),
    ],
  }),

  content({
    slug: 'sd-read-strategy-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Quando o banco não aguenta a leitura', 'When reads outgrow the database'),
    categoryId: 'system-design',
    topic: 'data-scaling',
    stackIds: ['postgres', 'redis'],
    sourceIds: ['azure-cache-aside', 'fowler-cqrs'],
    skillIds: ['databases', 'system-design'],
    difficulty: 'advanced',
    tags: ['réplica', 'cache', 'sharding', 'cqrs'],
    minutes: 5,
    related: ['sd-read-strategy-choice', 'db-index-learn'],
    blocks: [
      note(
        t(
          'Existe uma ordem quase sempre correta para escalar leitura, e ela vai do mais reversível para o mais caro de desfazer. Responder nessa ordem numa entrevista já mostra experiência.',
          'There is an almost always correct order for scaling reads, and it runs from the most reversible to the most expensive to undo. Answering in that order already signals experience.',
        ),
      ),
      note(
        t(
          '**1. Índice e query.** Antes de qualquer infraestrutura: ler o plano. Metade dos "precisamos de cache" morre num índice composto na ordem certa ou numa query que parou de trazer colunas que ninguém usa.',
          '**1. Index and query.** Before any infrastructure: read the plan. Half of "we need a cache" dies to one composite index in the right order, or a query that stopped selecting columns nobody uses.',
        ),
        t('Primeiro, o barato', 'The cheap step first'),
      ),
      note(
        t(
          '**2. Cache.** O padrão usual é *cache-aside*: a aplicação procura no cache, e em caso de falta lê o banco e grava. As perguntas que definem se vai funcionar são a taxa de acerto esperada e o que acontece com dado velho. Cache sem política de invalidação é dado errado com latência boa.',
          '**2. Cache.** The usual pattern is *cache-aside*: the application looks in the cache, and on a miss reads the database and writes back. The questions that decide whether it works are the expected hit rate and what stale data costs. A cache with no invalidation policy is wrong data with good latency.',
        ),
        t('Cache', 'Cache'),
      ),
      note(
        t(
          '**3. Réplica de leitura.** Tira relatório e leitura tolerante do primário. O preço é *replication lag*: logo depois de escrever, ler da réplica pode devolver o estado anterior. Por isso leitura pós-escrita do mesmo usuário costuma ir para o primário.',
          '**3. Read replica.** Moves reports and tolerant reads off the primary. The price is replication lag: right after a write, reading from a replica can return the previous state. That is why read-after-write for the same user usually goes to the primary.',
        ),
        t('Réplica', 'Replica'),
      ),
      note(
        t(
          '**4. CQRS.** Separar o modelo de escrita do modelo de leitura, alimentando o segundo por eventos. Resolve o caso em que a leitura quer uma forma que a escrita não tem — um feed, um extrato, uma busca. Custa consistência eventual visível e mais uma peça para operar.',
          '**4. CQRS.** Separating the write model from the read model, feeding the second with events. It solves the case where reads want a shape writes do not have — a feed, a statement, a search. It costs visible eventual consistency and one more moving part.',
        ),
        t('CQRS', 'CQRS'),
      ),
      note(
        t(
          '**5. Sharding.** Dividir os dados por chave entre instâncias. É o último recurso: join entre shards deixa de existir, transação atravessando shard também, e escolher a chave errada produz um shard quente que concentra tudo de novo. Quase sempre vem depois de tudo acima, e por causa de escrita, não de leitura.',
          '**5. Sharding.** Splitting data by key across instances. It is the last resort: cross-shard joins stop existing, so do cross-shard transactions, and the wrong key produces a hot shard that concentrates everything again. It almost always comes after everything above, and because of writes, not reads.',
        ),
        t('Sharding', 'Sharding'),
      ),
      note(
        t(
          'Em entrevista, a resposta que impressiona não é "eu usaria sharding". É "eu mediria primeiro, e essa é a ordem em que eu tentaria, porque cada passo é mais difícil de desfazer que o anterior".',
          'In an interview, the answer that lands is not "I would shard". It is "I would measure first, and this is the order I would try, because each step is harder to undo than the one before".',
        ),
        t('Como responder', 'How to answer it'),
      ),
    ],
  }),

  content({
    slug: 'sd-read-strategy-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('O perfil do cliente está lento', 'The customer profile page is slow'),
    categoryId: 'system-design',
    topic: 'data-scaling',
    stackIds: ['postgres', 'redis', 'nodejs'],
    skillIds: ['databases', 'performance'],
    difficulty: 'advanced',
    tags: ['cache', 'réplica', 'leitura'],
    minutes: 3,
    related: ['sd-read-strategy-learn', 'db-slow-query'],
    blocks: [
      prompt(
        t(
          'Qual estratégia você aplicaria primeiro, e por quê?',
          'Which strategy would you apply first, and why?',
        ),
        t(
          'A tela de perfil faz seis queries, todas com índice, somando 900 ms de p95. Os mesmos dados são lidos dezenas de vezes por sessão e mudam no máximo uma vez por dia. O banco está com 60% de CPU.',
          'The profile screen runs six indexed queries adding up to a 900 ms p95. The same data is read dozens of times per session and changes at most once a day. The database sits at 60% CPU.',
        ),
      ),
      choices(false, [
        {
          id: 'cache',
          label: t(
            'Cache-aside por cliente, com TTL curto e invalidação no evento de atualização do perfil.',
            'Cache-aside per customer, short TTL, invalidated by the profile update event.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'Leitura repetida de dado que muda pouco é o caso de livro do cache, e a taxa de acerto aqui será alta. O TTL cobre o esquecimento de invalidar, e a invalidação por evento cobre a janela em que o TTL seria longo demais. É também o passo mais fácil de remover se não funcionar.',
            'Repeated reads of rarely-changing data is the textbook case for a cache, and the hit rate here will be high. The TTL covers forgotten invalidation, and event invalidation covers the window where the TTL alone would be too long. It is also the easiest step to remove if it does not work.',
          ),
        },
        {
          id: 'replica',
          label: t(
            'Mandar essas leituras para uma réplica.',
            'Send these reads to a replica.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Tira carga do primário, e é defensável. Mas não resolve o problema principal: continuam sendo seis idas ao banco por render, e a latência da tela pouco muda. Além disso, o usuário que acabou de editar o perfil pode ver o valor antigo.',
            'It takes load off the primary and is defensible. But it does not address the main problem: still six round trips per render, and the screen latency barely moves. On top of that, a user who just edited their profile may see the old value.',
          ),
        },
        {
          id: 'denormalize',
          label: t(
            'Desnormalizar em uma tabela de leitura mantida por trigger.',
            'Denormalise into a read table maintained by a trigger.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Resolve as seis queries de verdade e é a resposta certa em alguns sistemas. O custo é maior: trigger é lógica escondida do time, a tabela precisa de backfill, e desfazer dá trabalho. Vale quando o cache já foi tentado e a taxa de acerto decepcionou.',
            'It genuinely solves the six queries and is the right answer in some systems. The cost is higher: triggers hide logic from the team, the table needs a backfill, and undoing it is work. Worth it once a cache has been tried and the hit rate disappointed.',
          ),
        },
        {
          id: 'shard',
          label: t(
            'Fazer sharding por id de cliente.',
            'Shard by customer id.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Com 60% de CPU e leitura repetida, não há nada indicando que os dados não cabem numa instância. Sharding aqui multiplica complexidade sem tocar na causa, que é ler a mesma coisa muitas vezes.',
            'At 60% CPU with repeated reads, nothing suggests the data does not fit one instance. Sharding here multiplies complexity without touching the cause, which is reading the same thing over and over.',
          ),
        },
      ]),
      lookingFor(
        list(
          [
            'Ligar a escolha ao padrão de acesso descrito, não ao tamanho do sistema.',
            'Falar de invalidação antes de falar de TTL.',
            'Reconhecer o que a alternativa recusada resolveria bem.',
          ],
          [
            'Tying the choice to the described access pattern, not to system size.',
            'Talking about invalidation before talking about TTL.',
            'Acknowledging what the rejected option would solve well.',
          ],
        ),
      ),
      warn(
        t(
          'O follow-up quase certo é "e se o cache cair?". Tenha a resposta pronta: a aplicação volta a ler o banco, e por isso o cache não pode ser a única coisa que sustenta o dimensionamento.',
          'The near-certain follow-up is "what if the cache goes down?". Have the answer ready: the application falls back to the database, which is why the cache cannot be the only thing holding up your sizing.',
        ),
      ),
    ],
  }),

  content({
    slug: 'sd-antipatterns-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Cinco formas conhecidas de ficar lento', 'Five well-known ways to get slow'),
    categoryId: 'performance',
    topic: 'antipatterns',
    stackIds: ['nodejs', 'postgres', 'redis'],
    sourceIds: ['azure-antipatterns'],
    skillIds: ['performance', 'system-design'],
    difficulty: 'advanced',
    tags: ['anti-patterns', 'performance'],
    minutes: 5,
    related: ['sd-retry-storm', 'db-n-plus-one'],
    blocks: [
      note(
        t(
          'Problemas de performance em produção se repetem. Conhecer os nomes ajuda em dois momentos: no incidente, para reconhecer rápido, e na entrevista, para descrever o que você viu sem parecer anedota.',
          'Production performance problems repeat themselves. Knowing the names helps twice: in the incident, to recognise it fast, and in the interview, to describe what you saw without it sounding like an anecdote.',
        ),
      ),
      note(
        t(
          '**Busy database.** Lógica que poderia estar na aplicação empurrada para o banco: cursores, funções pesadas, relatório rodando no primário. O banco é o recurso mais caro de escalar e o mais compartilhado; sobrecarregá-lo afeta todo mundo, inclusive quem só queria fazer login.',
          '**Busy database.** Logic that could live in the application pushed into the database: cursors, heavy functions, reports running on the primary. The database is the most expensive resource to scale and the most shared; overloading it hits everyone, including whoever only wanted to log in.',
        ),
        t('Banco ocupado demais', 'Busy database'),
      ),
      note(
        t(
          '**No caching.** Recalcular a cada requisição o que muda uma vez por dia. O sintoma é CPU de banco alta com as mesmas queries no topo do `pg_stat_statements`, repetidas milhares de vezes com os mesmos parâmetros.',
          '**No caching.** Recomputing on every request what changes once a day. The symptom is high database CPU with the same queries at the top of `pg_stat_statements`, repeated thousands of times with identical parameters.',
        ),
        t('Sem cache', 'No caching'),
      ),
      note(
        t(
          '**Improper instantiation.** Criar por requisição o que deveria ser criado uma vez: cliente HTTP, pool de conexão, cliente de SDK. Cada requisição paga handshake e o número de conexões explode. É um dos bugs de performance mais fáceis de corrigir e um dos mais comuns.',
          '**Improper instantiation.** Creating per request what should be created once: an HTTP client, a connection pool, an SDK client. Every request pays a handshake and connection counts explode. It is one of the easiest performance bugs to fix and one of the most common.',
        ),
        t('Instanciação imprópria', 'Improper instantiation'),
      ),
      note(
        t(
          '**Noisy neighbor.** Em sistema multi-inquilino, um cliente consome recurso suficiente para degradar os outros: uma importação gigante, um relatório de dez anos, um cliente com mil vezes mais dados. Sem cota por inquilino, o incidente parece aleatório para quem só olha a média.',
          '**Noisy neighbor.** In a multi-tenant system, one customer consumes enough resource to degrade the others: a huge import, a ten-year report, a customer with a thousand times more data. Without per-tenant quotas, the incident looks random to anyone watching averages.',
        ),
        t('Vizinho barulhento', 'Noisy neighbor'),
      ),
      note(
        t(
          '**Retry storm.** Um serviço fica lento, todo mundo tenta de novo ao mesmo tempo, e a carga extra impede a recuperação. Retry sem backoff exponencial e sem jitter transforma um soluço em queda prolongada — e o gráfico fica com aquele degrau que não desce.',
          '**Retry storm.** One service gets slow, everybody retries at once, and the extra load prevents recovery. Retries without exponential backoff and jitter turn a hiccup into a long outage — and the graph gets that step that never comes back down.',
        ),
        t('Tempestade de retentativas', 'Retry storm'),
      ),
      note(
        t(
          'Todos esses têm o mesmo sintoma inicial: "ficou lento e a CPU da aplicação está baixa". A pergunta que separa quem investiga de quem chuta é sempre a mesma — onde está a espera?',
          'All of these share one first symptom: "it got slow and application CPU is low". The question that separates investigating from guessing is always the same — where is the waiting happening?',
        ),
        t('O sintoma comum', 'The shared symptom'),
      ),
    ],
  }),

  content({
    slug: 'sd-retry-storm',
    type: 'find-the-bug',
    kind: 'find-the-bug',
    title: t('O retry que derrubou o serviço', 'The retry that took the service down'),
    categoryId: 'architecture',
    topic: 'resilience',
    stackIds: ['nodejs'],
    sourceIds: ['azure-retry', 'azure-circuit-breaker'],
    skillIds: ['architecture', 'performance'],
    difficulty: 'advanced',
    tags: ['retry', 'resiliência', 'incidente'],
    minutes: 4,
    related: ['sd-antipatterns-learn', 'sd-resilience-decisions'],
    blocks: [
      code(
        'ts',
        `
export async function chargeCard(payload: Charge) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await paymentApi.post('/charges', payload, { timeout: 30_000 });
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(200);
    }
  }
}
`,
        {
          caption: t(
            'O provedor ficou 90 segundos instável. A API ficou 25 minutos fora.',
            'The provider was unstable for 90 seconds. The API was down for 25 minutes.',
          ),
        },
      ),
      prompt(
        t(
          'O que neste código transforma uma instabilidade curta do provedor em uma queda longa da sua API?',
          'What in this code turns a short provider hiccup into a long outage of your own API?',
        ),
      ),
      answers({
        short: t(
          'São quatro problemas somados: timeout de 30 s segurando conexão, cinco tentativas sem backoff exponencial, sem jitter — então todas as instâncias tentam no mesmo instante — e nenhum circuit breaker, de forma que o serviço continua martelando um provedor que já avisou que não aguenta. Junto, isso multiplica a carga no provedor e esgota o pool da própria API.',
          'Four problems stacked: a 30 s timeout holding connections, five attempts with no exponential backoff, no jitter — so every instance retries at the same instant — and no circuit breaker, so the service keeps hammering a provider that already said it cannot cope. Together that multiplies load on the provider and exhausts your own pool.',
        ),
        strong: t(
          'O que mata é a combinação.\n\nO timeout de 30 segundos é longo demais para um pagamento síncrono. Com cinco tentativas, uma requisição pode ocupar um worker por dois minutos e meio. Se chegam 40 req/s, a fila interna estoura muito antes do provedor voltar.\n\nO sleep fixo de 200 ms sem crescimento significa que as cinco tentativas acontecem em um segundo — o provedor recebe cinco vezes o tráfego normal exatamente quando está pior. E como todas as instâncias falharam juntas, elas também tentam juntas: sem jitter, a carga chega em ondas sincronizadas.\n\nFalta o circuito. Depois de N falhas seguidas, o certo é parar de tentar por alguns segundos e falhar rápido, devolvendo erro claro ou enfileirando a cobrança. Isso protege os dois lados: o provedor recebe menos e a sua API libera worker.\n\nE falta idempotência. Retry em cobrança sem `Idempotency-Key` pode gerar cobrança dupla quando a resposta se perde — o pedido chegou, a confirmação não.\n\nA correção que eu faria: timeout de 2–3 s, no máximo 2 ou 3 tentativas com backoff exponencial e jitter, circuit breaker com meia-abertura, chave de idempotência, e fallback explícito — enfileirar a cobrança para processar depois em vez de segurar o usuário.',
          'What kills it is the combination.\n\nA 30 second timeout is far too long for a synchronous payment. With five attempts, one request can hold a worker for two and a half minutes. At 40 req/s the internal queue blows up long before the provider recovers.\n\nThe fixed 200 ms sleep with no growth means all five attempts happen inside a second — the provider gets five times normal traffic exactly when it is worst. And because every instance failed together, they also retry together: with no jitter, load arrives in synchronised waves.\n\nThere is no breaker. After N consecutive failures the right move is to stop trying for a few seconds and fail fast, returning a clear error or queueing the charge. That protects both sides: the provider receives less and your API frees workers.\n\nAnd there is no idempotency. Retrying a charge without an `Idempotency-Key` can double-charge when the response is lost — the request landed, the confirmation did not.\n\nThe fix I would make: a 2–3 s timeout, at most 2 or 3 attempts with exponential backoff and jitter, a circuit breaker with a half-open state, an idempotency key, and an explicit fallback — queue the charge for later instead of holding the user.',
        ),
        deep: t(
          'Um detalhe que costuma render ponto: retry só faz sentido para erro transitório. Retentar um 400 ou um 422 é desperdício garantido; retentar 429 exige respeitar o `Retry-After`; retentar 500 depende de saber se a operação é idempotente. Uma política única para tudo é o que produz o pior comportamento nos dois extremos.\n\nDo lado da observabilidade, eu instrumentaria tentativas separadas de requisições, senão a métrica de tráfego mente: cinco tentativas parecem uma requisição no log do chamador e cinco no do provedor.\n\nE vale falar do que o usuário vê. Cobrança que falha por instabilidade não precisa virar erro na cara dele: dá para aceitar o pedido, marcar como "processando" e confirmar por e-mail. Essa é uma decisão de produto que o engenheiro deveria propor.',
          'One detail that usually scores: retries only make sense for transient errors. Retrying a 400 or 422 is guaranteed waste; retrying 429 means honouring `Retry-After`; retrying 500 depends on whether the operation is idempotent. One policy for everything produces the worst behaviour at both extremes.\n\nOn observability, I would instrument attempts separately from requests, otherwise the traffic metric lies: five attempts look like one request in the caller\'s log and five in the provider\'s.\n\nAnd it is worth talking about what the user sees. A charge failing from instability does not have to become an error in their face: you can accept the order, mark it "processing" and confirm by email. That is a product decision an engineer should propose.',
        ),
        seconds: { short: 45, strong: 150, deep: 240 },
      }),
      mistakes(
        list(
          [
            'Responder só "falta backoff" e parar por aí.',
            'Aumentar o número de tentativas para "garantir".',
            'Esquecer que retry em cobrança precisa de idempotência.',
          ],
          [
            'Answering only "it needs backoff" and stopping there.',
            'Raising the retry count "to be safe".',
            'Forgetting that retrying a charge needs idempotency.',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você escolheria o timeout?',
            'O que o usuário vê enquanto o circuito está aberto?',
            'Como você testaria esse comportamento antes do próximo incidente?',
          ],
          [
            'How would you choose the timeout?',
            'What does the user see while the breaker is open?',
            'How would you test this behaviour before the next incident?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sd-resilience-decisions',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões de resiliência', 'Resilience calls'),
    categoryId: 'architecture',
    topic: 'resilience',
    stackIds: ['nodejs'],
    sourceIds: ['azure-circuit-breaker'],
    skillIds: ['architecture', 'observability'],
    difficulty: 'advanced',
    tags: ['timeout', 'circuit breaker', 'degradação'],
    minutes: 3,
    related: ['sd-retry-storm', 'arch-resilience-timeouts'],
    blocks: [
      decisions(
        [
          {
            statement: t(
              'O serviço de recomendação está fora. Vou deixar a página de produto falhar com 500 para o time perceber rápido.',
              'The recommendation service is down. I will let the product page fail with a 500 so the team notices fast.',
            ),
            expected: 'disagree',
            verdict: t(
              'Recomendação é enfeite; produto é receita.',
              'Recommendations are garnish; the product page is revenue.',
            ),
            why: t(
              'Degradação graciosa é exatamente isto: a página carrega sem o bloco de recomendação, e o alerta vai para o time por monitoramento, não pela queda do checkout. O erro fica registrado, o usuário compra, e ninguém descobre o incidente pelo Twitter.',
              'Graceful degradation is exactly this: the page loads without the recommendation block, and the alert reaches the team through monitoring, not by taking checkout down. The error is recorded, the user buys, and nobody learns about the incident on Twitter.',
            ),
            tradeOff: t(
              'Degradar silenciosamente pode esconder falha por semanas. Por isso o alerta é parte da decisão, não um extra.',
              'Degrading silently can hide a failure for weeks. That is why the alert is part of the decision, not an extra.',
            ),
          },
          {
            statement: t(
              'Vou definir timeout de cliente HTTP menor que o timeout do servidor que eu chamo.',
              'I will set my HTTP client timeout lower than the timeout of the server I call.',
            ),
            expected: 'agree',
            verdict: t(
              'Timeouts precisam formar uma hierarquia, do mais externo ao mais interno.',
              'Timeouts have to form a hierarchy, outermost to innermost.',
            ),
            why: t(
              'Se o seu timeout é maior que o do dependente, você espera por uma resposta que já foi abandonada do outro lado. A regra prática é: cada camada mais externa espera um pouco menos que a soma das internas, e a requisição inteira tem um orçamento de tempo. Sem isso, uma chamada lenta no fim da cadeia segura recurso em todas as camadas acima.',
              'If your timeout is longer than the dependency\'s, you wait for an answer the other side already abandoned. The rule of thumb: each outer layer waits slightly less than the sum of the inner ones, and the whole request has a time budget. Without it, one slow call at the end of the chain holds resources in every layer above.',
            ),
          },
          {
            statement: t(
              'Para não perder venda, se a análise antifraude não responder em 1 s eu aprovo o pedido e sigo.',
              'To avoid losing sales, if the fraud check does not answer within 1 s I approve the order and move on.',
            ),
            expected: 'disagree',
            verdict: t(
              'Fail-open em controle de risco é decisão de negócio, não de engenharia.',
              'Failing open on a risk control is a business decision, not an engineering one.',
            ),
            why: t(
              'Degradar é certo para o que é acessório e errado para o que existe para proteger. Aprovar automaticamente durante uma indisponibilidade cria exatamente a janela que fraudador procura. O caminho normal é fail-closed com fila: aceita o pedido em estado "em análise" e conclui quando o serviço voltar — e essa escolha precisa ser acordada com risco e produto, não decidida sozinho no código.',
              'Degrading is right for what is accessory and wrong for what exists to protect. Auto-approving during an outage creates exactly the window a fraudster looks for. The usual path is fail-closed with a queue: accept the order as "under review" and finish when the service returns — and that choice has to be agreed with risk and product, not decided alone in code.',
            ),
            context: t(
              'Em compra de valor muito baixo, algumas empresas aceitam o risco conscientemente, com limite e monitoramento. A diferença é que foi decidido, e não virou default por causa de um timeout.',
              'For very low-value purchases some companies accept the risk deliberately, with a cap and monitoring. The difference is that it was decided, rather than becoming the default because of a timeout.',
            ),
          },
        ],
        'buttons',
      ),
    ],
  }),

  content({
    slug: 'sd-notifications-design',
    type: 'system-design',
    kind: 'architecture',
    title: t('Desenhe o serviço de notificações', 'Design the notification service'),
    categoryId: 'system-design',
    topic: 'design',
    stackIds: ['nodejs', 'kafka', 'redis', 'postgres'],
    skillIds: ['system-design', 'architecture'],
    difficulty: 'expert',
    tags: ['system design', 'filas', 'escala'],
    minutes: 8,
    related: ['sd-capacity-learn', 'arch-queue-exactly-once'],
    blocks: [
      prompt(
        t(
          'Desenhe um serviço que envia notificações por push, e-mail e SMS para o produto inteiro. Comece pelos requisitos e pelas contas.',
          'Design a service that sends push, email and SMS notifications for the whole product. Start from the requirements and the arithmetic.',
        ),
        t(
          'Vinte milhões de usuários, picos previsíveis (campanhas às 9h), e outros times querem disparar notificação sem falar com você.',
          'Twenty million users, predictable peaks (campaigns at 9am), and other teams want to send notifications without talking to you.',
        ),
      ),
      answers({
        short: t(
          'Eu trataria como três problemas: aceitar o pedido rápido, decidir para quem e por qual canal, e entregar com retentativa. Uma API fina que só valida e publica em fila; workers por canal consumindo com backoff; e uma tabela de preferências e opt-out consultada antes do envio. Idempotência por chave de notificação, porque fila reentrega. Campanha grande não entra pela mesma porta que notificação transacional — filas separadas, senão o e-mail de "sua senha mudou" fica atrás de dois milhões de promoções.',
          'I would treat it as three problems: accept the request fast, decide who and which channel, and deliver with retries. A thin API that only validates and publishes to a queue; per-channel workers consuming with backoff; and a preferences and opt-out table consulted before sending. Idempotency by notification key, because queues redeliver. Big campaigns do not come through the same door as transactional notifications — separate queues, otherwise the "your password changed" email sits behind two million promotions.',
        ),
        strong: t(
          'Requisitos primeiro. Funcionais: enviar por push, e-mail e SMS; respeitar preferência e opt-out; deduplicar; permitir agendamento; dar rastreabilidade do que foi enviado. Não funcionais: transacional entregue em segundos, campanha pode levar minutos, nenhuma notificação duplicada visível ao usuário, e o serviço não pode cair quando um provedor cai.\n\nContas: 20 milhões de usuários, campanha atingindo 10% deles são 2 milhões de mensagens. Se o provedor aceita 1.000 por segundo, são ~33 minutos só de entrega — então a fila precisa segurar isso e o produto precisa saber que campanha não é instantânea. Transacional, no mesmo período, talvez 200 por segundo. Esses dois números justificam sozinhos a separação de filas.\n\nDesenho: API de ingestão que valida o payload, resolve o template e publica. Fila por prioridade (transacional, campanha) e por canal, porque os limites de taxa são por provedor. Worker consome, checa preferência e opt-out, checa a chave de idempotência num Redis com TTL, chama o provedor, grava o resultado. Falha transitória volta para a fila com backoff exponencial e jitter; falha permanente vai para dead letter com motivo.\n\nEstado: uma tabela de notificações com status por destinatário para suporte responder "por que não recebi", e um índice por usuário e data. Não guardaria o corpo inteiro para sempre — retenção curta com o essencial.\n\nPontos que eu levantaria sem esperar a pergunta: rate limit por provedor com fila própria; preferência consultada no worker e não na ingestão, porque o usuário pode desativar entre o agendamento e o envio; e um circuito por provedor, para uma indisponibilidade da SMS não travar push.',
          'Requirements first. Functional: send push, email and SMS; honour preferences and opt-out; deduplicate; allow scheduling; give traceability of what was sent. Non-functional: transactional delivered in seconds, campaigns may take minutes, no user-visible duplicates, and the service must not fall over when one provider does.\n\nArithmetic: 20 million users, a campaign hitting 10% is 2 million messages. If the provider accepts 1,000 per second, that is ~33 minutes of delivery alone — so the queue has to hold it and the product has to know campaigns are not instant. Transactional in the same window might be 200 per second. Those two numbers alone justify separating the queues.\n\nDesign: an ingestion API that validates the payload, resolves the template and publishes. Queues by priority (transactional, campaign) and by channel, because rate limits are per provider. A worker consumes, checks preferences and opt-out, checks the idempotency key in Redis with a TTL, calls the provider, records the result. Transient failure goes back to the queue with exponential backoff and jitter; permanent failure goes to a dead letter queue with a reason.\n\nState: a notifications table with per-recipient status so support can answer "why did I not get it", indexed by user and date. I would not keep the full body forever — short retention with the essentials.\n\nPoints I would raise without waiting to be asked: per-provider rate limiting with its own queue; preferences checked in the worker rather than at ingestion, because a user can opt out between scheduling and sending; and a breaker per provider, so an SMS outage does not stall push.',
        ),
        deep: t(
          'Duas áreas costumam decidir a entrevista aqui.\n\nA primeira é exatamente-uma-vez. Fila entrega pelo menos uma vez, então a dedupe é sua: chave determinística (usuário + tipo de evento + id do evento), gravada antes do envio numa operação atômica. Ainda assim existe a janela entre enviar e gravar o resultado; por isso a chave vai *antes*, e a reentrega vira consulta em vez de envio. Duplicata visível ao usuário é pior que atraso.\n\nA segunda é multi-inquilino: se um time dispara uma campanha mal calibrada, ninguém mais consegue notificar. Cota por time e fila separada resolvem o vizinho barulhento. Sem isso, o serviço vira gargalo compartilhado e a culpa cai em você.\n\nSe sobrar tempo, eu falaria de agendamento com fuso horário — "enviar às 9h" significa nove horas de picos diferentes no mundo — e de janela de silêncio, que é requisito de produto com impacto direto no dimensionamento.',
          'Two areas usually decide this interview.\n\nThe first is exactly-once. Queues deliver at least once, so dedupe is yours: a deterministic key (user + event type + event id), written before sending in an atomic operation. There is still a window between sending and recording the result; that is why the key goes in *first*, and redelivery becomes a lookup instead of a send. A user-visible duplicate is worse than a delay.\n\nThe second is multi-tenancy: if one team fires a badly calibrated campaign, nobody else can notify anyone. Per-team quotas and separate queues solve the noisy neighbour. Without them the service becomes a shared bottleneck and the blame lands on you.\n\nWith time left I would talk about time-zone scheduling — "send at 9am" means nine hours of different peaks around the world — and quiet hours, which is a product requirement with direct sizing impact.',
        ),
        seconds: { short: 60, strong: 190, deep: 300 },
      }),
      lookingFor(
        list(
          [
            'Requisitos e contas antes de caixinhas.',
            'Separar transacional de campanha, com o motivo numérico.',
            'Dedupe explícita, porque fila reentrega.',
            'Isolamento por provedor e por time.',
          ],
          [
            'Requirements and arithmetic before boxes.',
            'Separating transactional from campaign traffic, with the numeric reason.',
            'Explicit dedupe, because queues redeliver.',
            'Isolation per provider and per team.',
          ],
        ),
        {
          strong: t(
            'Dizer quanto tempo a campanha leva e tratar isso como requisito de produto, em vez de esconder atrás de "é assíncrono".',
            'Saying how long the campaign takes and treating that as a product requirement, instead of hiding behind "it is asynchronous".',
          ),
          shallow: t(
            'Desenhar API, fila e worker sem nenhum número e sem falar de falha de provedor.',
            'Drawing an API, a queue and a worker with no numbers and no word about provider failure.',
          ),
        },
      ),
      tradeOff([
        {
          option: t('Fila única com prioridade', 'Single queue with priority'),
          pros: list(['Menos infraestrutura, um consumidor só.'], ['Less infrastructure, one consumer.']),
          cons: list(
            ['Campanha grande ainda atrasa transacional quando a prioridade falha.'],
            ['A big campaign still delays transactional traffic when priority fails.'],
          ),
        },
        {
          option: t('Filas separadas por classe', 'Separate queues per class'),
          pros: list(
            ['Isolamento real, escala independente, limite por provedor.'],
            ['Real isolation, independent scale, per-provider limits.'],
          ),
          cons: list(['Mais peças para operar e monitorar.'], ['More pieces to operate and monitor.']),
        },
      ]),
    ],
  }),

  content({
    slug: 'sd-degradation-interview',
    type: 'interview-question',
    kind: 'interview',
    title: t('O dependente caiu. O que você derruba junto?', 'A dependency is down. What do you take down with it?'),
    categoryId: 'architecture',
    topic: 'resilience',
    stackIds: ['nodejs'],
    skillIds: ['architecture', 'communication'],
    difficulty: 'advanced',
    tags: ['degradação', 'incidente', 'produto'],
    minutes: 4,
    related: ['sd-resilience-decisions', 'arch-resilience-timeouts'],
    blocks: [
      prompt(
        t(
          'Como você decide o que degrada e o que falha quando uma dependência fica indisponível?',
          'How do you decide what degrades and what fails when a dependency becomes unavailable?',
        ),
      ),
      answers({
        short: t(
          'Eu classifico cada dependência por o que ela protege ou habilita. O que é acessório — recomendação, contagem de curtidas, banner — degrada em silêncio com alerta. O que é regra de negócio ou controle de risco — estoque, antifraude, autorização — falha fechado, porque aprovar sem checar é pior que recusar. E o que é caminho de receita ganha um plano próprio: fila, modo somente leitura, ou confirmação assíncrona.',
          'I classify each dependency by what it protects or enables. Accessory things — recommendations, like counts, a banner — degrade quietly with an alert. Business rules and risk controls — stock, fraud checks, authorisation — fail closed, because approving without checking is worse than declining. And anything on the revenue path gets its own plan: a queue, a read-only mode, or asynchronous confirmation.',
        ),
        strong: t(
          'A conversa começa antes do incidente. Para cada dependência eu quero saber três coisas: o que quebra para o usuário se ela sumir, se existe resposta aceitável sem ela, e quem decide isso — porque quase sempre é decisão de produto, não minha.\n\nCom isso, as categorias ficam claras. Acessório: some o bloco, a página carrega, o alerta dispara. Não posso deixar sumir silenciosamente para sempre, então o alerta faz parte da solução.\n\nControle: falha fechado. Antifraude fora significa pedido em análise, não pedido aprovado. Estoque fora significa não prometer entrega. Aqui eu prefiro frustrar o usuário a criar um passivo.\n\nCaminho de receita: vale investir em alternativa. Gateway de pagamento fora pode virar fila com confirmação por e-mail, ou um segundo provedor se o volume justificar. Isso custa dinheiro e complexidade, então é decisão com o negócio.\n\nO que eu levo para a conversa é o número: quanto vale cada minuto daquele fluxo. Sem isso, a discussão vira preferência pessoal.\n\nE em todos os casos eu quero que o modo degradado seja testado. Modo de fallback que nunca rodou em produção normalmente não funciona no dia — costumo forçá-lo em ambiente controlado, ou até em produção com uma fração de tráfego.',
          'The conversation starts before the incident. For each dependency I want three things: what breaks for the user if it disappears, whether an acceptable answer exists without it, and who decides — because it is almost always a product decision, not mine.\n\nWith that, the categories become clear. Accessory: the block disappears, the page loads, the alert fires. I cannot let it disappear silently forever, so the alert is part of the solution.\n\nControls: fail closed. Fraud checks down means the order is under review, not approved. Inventory down means not promising delivery. Here I would rather frustrate a user than create a liability.\n\nRevenue path: worth investing in an alternative. A payment gateway outage can become a queue with email confirmation, or a second provider if the volume justifies it. That costs money and complexity, so it is a decision with the business.\n\nWhat I bring to that conversation is a number: what one minute of that flow is worth. Without it the discussion becomes personal preference.\n\nAnd in every case I want the degraded mode tested. A fallback that has never run in production usually does not work on the day — I tend to force it in a controlled environment, or even in production with a slice of traffic.',
        ),
        seconds: { short: 40, strong: 145 },
      }),
      rubric({
        incorrect: t(
          'Trata todas as dependências igual, ou diz "retry até voltar".',
          'Treats every dependency the same, or says "retry until it comes back".',
        ),
        partial: t(
          'Separa essencial de acessório, mas não fala de quem decide nem de alerta.',
          'Separates essential from accessory, but does not mention who decides or the alert.',
        ),
        strong: t(
          'Classifica por consequência, inclui fail-closed para controle e nomeia a decisão de produto.',
          'Classifies by consequence, includes fail-closed for controls, and names the product decision.',
        ),
        interviewReady: t(
          'Tudo acima, mais testar o modo degradado e o custo por minuto do fluxo afetado.',
          'All of the above, plus testing the degraded mode and the per-minute cost of the affected flow.',
        ),
      }),
      followUps(
        list(
          [
            'Como você testa o modo degradado sem esperar o próximo incidente?',
            'O que muda se a dependência for interna, de outro time?',
            'Como você comunica degradação ao usuário sem assustar?',
          ],
          [
            'How do you test the degraded mode without waiting for the next incident?',
            'What changes if the dependency is internal, owned by another team?',
            'How do you communicate degradation to users without alarming them?',
          ],
        ),
      ),
    ],
  }),
];
