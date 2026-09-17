import type { Content } from '@/domain/types';
import {
  answers,
  choices,
  code,
  content,
  diagram,
  explain,
  followUps,
  list,
  lookingFor,
  mistakes,
  prompt,
  setupText,
  t,
  tip,
  tradeOff,
  warn,
} from '../authoring';

/** Scale, boundaries, queues, and the real cost of every decision. */
export const ARCHITECTURE_CONTENT: Content[] = [
  content({
    slug: 'arch-url-shortener',
    type: 'system-design',
    title: t('Desenhe um encurtador de URL', 'Design a URL shortener'),
    categoryId: 'system-design',
    stackIds: ['redis', 'postgres', 'aws'],
    skillIds: ['system-design', 'architecture', 'caching'],
    difficulty: 'advanced',
    tags: ['system-design', 'scalability', 'caching', 'sharding'],
    minutes: 10,
    related: ['arch-horizontal-vertical', 'arch-cache-invalidation', 'db-redis-when'],
    blocks: [
      setupText(
        t(
          'Dez milhões de usuários. Cem milhões de links criados por mês. As leituras são muito mais frequentes que as escritas.',
          'Ten million users. A hundred million links created per month. Reads vastly outnumber writes.',
        ),
      ),
      prompt(
        t(
          'Desenhe o sistema. Comece pelas perguntas que você faria antes de desenhar qualquer caixa.',
          'Design the system. Start with the questions you would ask before drawing any box.',
        ),
      ),
      answers({
        short: t(
          'Antes de desenhar eu pergunto três coisas: qual a proporção entre leitura e escrita, se os links expiram, e se o usuário pode escolher o alias. Assumindo leitura dominante e escrita moderada, o desenho é: um serviço de escrita que gera um id curto e grava no banco, um serviço de leitura que resolve o id e redireciona, e um cache na frente da leitura. A geração do id eu faria por contador distribuído codificado em base62, não por hash — hash traz colisão, contador não. E a leitura é o caminho que precisa escalar: cache com alta taxa de acerto, réplicas de leitura, e CDN se der.',
          'Before drawing anything I would ask three things: the read-to-write ratio, whether links expire, and whether users can choose their alias. Assuming reads dominate and writes are moderate, the design is: a write service that generates a short id and stores it, a read service that resolves the id and redirects, and a cache in front of reads. I would generate the id from a distributed counter encoded in base62, not from a hash — hashing brings collisions, a counter does not. And reads are the path that has to scale: a cache with a high hit rate, read replicas, and a CDN if possible.',
        ),
        strong: t(
          'Vou estruturar em requisitos, estimativa, desenho e os pontos onde quebra.\n\n**Perguntas primeiro.** Links expiram? Usuário pode escolher o alias? Precisa de analytics por clique? Qual a latência aceitável no redirecionamento? Essas respostas mudam o desenho, então eu não desenho antes.\n\nAssumindo: sem expiração obrigatória, alias customizado opcional, analytics assíncrono, redirecionamento abaixo de 50ms.\n\n**Estimativa de escala.** Cem milhões de escritas por mês são cerca de 40 por segundo em média, com pico talvez dez vezes isso. Nada extraordinário. Com proporção de leitura de 100 para 1, são 4 mil leituras por segundo em média. O sistema é dominado por leitura, e é isso que decide a arquitetura.\n\nVolume de dados: cem milhões por mês, digamos 500 bytes por registro, é 50 GB por mês. Em três anos, menos de dois terabytes. Cabe em um Postgres bem cuidado — não preciso de sharding no dia um, e eu diria isso em voz alta, porque propor sharding para dois terabytes é over-engineering.\n\n**Geração do id.** Duas opções.\n\nHash da URL truncado é tentador, mas tem colisão, e tratar colisão exige uma leitura antes de escrever, o que anula a simplicidade.\n\nContador monotônico codificado em base62 não colide por construção. Sete caracteres de base62 dão 3,5 trilhões de combinações. O problema é que fica sequencial e enumerável, então eu embaralharia com uma permutação reversível — algo como Feistel ou multiplicação modular — para que os ids não revelem volume nem permitam varrer o acervo.\n\nPara o contador distribuído, cada instância pega um bloco de ids de uma vez, digamos mil, e consome localmente. Assim não há ida ao coordenador por requisição.\n\n**Caminho de leitura.** É o que importa. Redis na frente com alta taxa de acerto, porque a distribuição de acessos é fortemente enviesada: poucos links concentram a maior parte dos cliques. TTL longo, já que o mapeamento raramente muda. Miss vai ao banco e popula o cache.\n\nRedirecionamento 301 ou 302: essa escolha tem consequência. 301 é cacheado pelo navegador, o que reduz tráfego mas mata o analytics, porque o clique seguinte nem chega ao servidor. Se analytics importa, 302. Eu falaria desse trade-off explicitamente, porque é o tipo de detalhe que o entrevistador está esperando.\n\n**Analytics** sai do caminho crítico: o redirect emite um evento para uma fila e um worker agrega. O usuário não espera por isso.\n\n**Onde quebra.** Um link viral concentra tráfego em uma chave só — o cache aguenta, mas se aquele nó do Redis saturar, é hot key, e a saída é replicar o valor em várias chaves ou cachear na borda. E a disponibilidade da leitura é mais crítica que a da escrita: se eu não consigo criar link novo por cinco minutos, é ruim; se milhões de links existentes param de resolver, é um incidente grave. Eu projetaria a leitura para degradar servindo do cache mesmo com o banco fora.',
          'I will structure this as requirements, estimates, design, and where it breaks.\n\n**Questions first.** Do links expire? Can users choose an alias? Do we need per-click analytics? What redirect latency is acceptable? Those answers change the design, so I would not draw before asking.\n\nAssuming: no mandatory expiry, optional custom alias, asynchronous analytics, redirect under 50ms.\n\n**Scale estimate.** A hundred million writes per month is around 40 per second on average, with a peak maybe ten times that. Nothing extraordinary. At a 100:1 read ratio, that is 4,000 reads per second on average. The system is read-dominated, and that is what decides the architecture.\n\nData volume: a hundred million a month, say 500 bytes per record, is 50GB per month. Over three years, under two terabytes. That fits in a well-tended Postgres — I do not need sharding on day one, and I would say so out loud, because proposing sharding for two terabytes is over-engineering.\n\n**Id generation.** Two options.\n\nA truncated hash of the URL is tempting, but it collides, and handling collisions requires a read before every write, which cancels out the simplicity.\n\nA monotonic counter encoded in base62 cannot collide by construction. Seven base62 characters give 3.5 trillion combinations. The problem is that it is sequential and enumerable, so I would shuffle it with a reversible permutation — a Feistel network or modular multiplication — so ids reveal neither volume nor allow scanning the corpus.\n\nFor the distributed counter, each instance takes a block of ids at once, say a thousand, and consumes them locally. That removes a round trip to the coordinator per request.\n\n**The read path.** This is what matters. Redis in front with a high hit rate, because the access distribution is heavily skewed: a few links account for most clicks. Long TTL, since the mapping rarely changes. A miss goes to the database and populates the cache.\n\nA 301 or a 302 redirect: that choice has consequences. A 301 is cached by the browser, which cuts traffic but kills analytics, because the next click never reaches the server. If analytics matter, 302. I would raise that trade-off explicitly, because it is exactly the kind of detail the interviewer is waiting for.\n\n**Analytics** leaves the critical path: the redirect emits an event to a queue and a worker aggregates. The user does not wait for it.\n\n**Where it breaks.** A viral link concentrates traffic on a single key — the cache handles it, but if that Redis node saturates, that is a hot key, and the way out is replicating the value across several keys or caching at the edge. And read availability matters more than write availability: not being able to create a new link for five minutes is bad; millions of existing links failing to resolve is a serious incident. I would design reads to degrade by serving from cache even with the database down.',
        ),
      }),
      diagram(
        t('O caminho de leitura é o sistema', 'The read path is the system'),
        [
          { id: 'client', label: t('Cliente', 'Client'), col: 0, row: 1 },
          { id: 'cdn', label: t('CDN / borda', 'CDN / edge'), col: 1, row: 1, tone: 'muted' },
          { id: 'read', label: t('Serviço de leitura', 'Read service'), col: 2, row: 1, tone: 'accent' },
          { id: 'cache', label: t('Redis', 'Redis'), col: 3, row: 0, tone: 'accent' },
          { id: 'db', label: t('Postgres + réplicas', 'Postgres + replicas'), col: 3, row: 1 },
          { id: 'write', label: t('Serviço de escrita', 'Write service'), col: 2, row: 2 },
          { id: 'queue', label: t('Fila de eventos', 'Event queue'), col: 3, row: 2, tone: 'muted' },
        ],
        [
          { from: 'client', to: 'cdn' },
          { from: 'cdn', to: 'read' },
          { from: 'read', to: 'cache', label: t('hit', 'hit') },
          { from: 'read', to: 'db', label: t('miss', 'miss'), dashed: true },
          { from: 'read', to: 'queue', label: t('analytics', 'analytics'), dashed: true },
          { from: 'write', to: 'db' },
        ],
      ),
      lookingFor(
        list(
          [
            'Fazer perguntas antes de desenhar',
            'Estimar a escala e concluir o que ela exige — e o que não exige',
            'Reconhecer que o sistema é dominado por leitura',
            'Escolher geração de id com justificativa, não por reflexo',
            'Discutir 301 contra 302 e o efeito no analytics',
            'Nomear onde o desenho quebra',
          ],
          [
            'Asking questions before drawing',
            'Estimating scale and concluding what it requires — and what it does not',
            'Recognising the system is read-dominated',
            'Choosing id generation with justification rather than reflex',
            'Discussing 301 versus 302 and the effect on analytics',
            'Naming where the design breaks',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte diz explicitamente que não precisa de sharding nessa escala. Recusar complexidade desnecessária impressiona mais do que propor Kafka.',
            'A strong answer says explicitly that sharding is not needed at this scale. Refusing unnecessary complexity impresses more than proposing Kafka.',
          ),
          shallow: t(
            'Uma resposta superficial começa desenhando microsserviços e Kafka antes de estimar quantas requisições por segundo o sistema realmente recebe.',
            'A shallow answer starts drawing microservices and Kafka before estimating how many requests per second the system actually takes.',
          ),
        },
      ),
      tip(
        t(
          'Em system design, o entrevistador avalia como você conduz a conversa, não se você acertou a arquitetura "certa". Diga em voz alta o que está assumindo, pergunte quando faltar informação, e nomeie os trade-offs. Silêncio enquanto você pensa é o pior resultado possível.',
          'In system design the interviewer is assessing how you drive the conversation, not whether you found the "right" architecture. Say your assumptions out loud, ask when information is missing, and name the trade-offs. Silence while you think is the worst possible outcome.',
        ),
      ),
      followUps(
        list(
          [
            'Como você lidaria com um link que viraliza?',
            'E se o usuário puder escolher o alias?',
            'Como você implementaria expiração de links?',
            'Quando você começaria a pensar em sharding?',
          ],
          [
            'How would you handle a link going viral?',
            'What if users can pick their own alias?',
            'How would you implement link expiry?',
            'When would you start thinking about sharding?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-horizontal-vertical',
    type: 'interview-question',
    title: t('Escalar para cima ou para os lados', 'Scaling up or scaling out'),
    categoryId: 'architecture',
    skillIds: ['architecture', 'performance'],
    difficulty: 'intermediate',
    tags: ['scaling', 'availability', 'trade-offs'],
    minutes: 4,
    related: ['arch-url-shortener', 'api-high-traffic-endpoint'],
    blocks: [
      prompt(
        t(
          'Qual a diferença entre escalar horizontalmente e verticalmente, e como você escolhe?',
          'What is the difference between scaling horizontally and vertically, and how do you choose?',
        ),
      ),
      answers({
        short: t(
          'Vertical é colocar uma máquina maior; horizontal é colocar mais máquinas. Vertical é mais simples e não exige nada do código, mas tem teto físico e a máquina continua sendo um ponto único de falha. Horizontal escala muito além e ainda melhora a disponibilidade, mas exige que a aplicação não guarde estado local e traz a complexidade de balanceamento e coordenação. Eu escalo vertical primeiro quando o esforço de engenharia é caro e o teto ainda está longe, e horizontal quando disponibilidade importa ou o volume não cabe mais em uma máquina.',
          'Vertical is a bigger machine; horizontal is more machines. Vertical is simpler and asks nothing of the code, but it has a physical ceiling and the machine stays a single point of failure. Horizontal scales far beyond that and improves availability as a side effect, but it requires the application to hold no local state and brings load balancing and coordination complexity. I scale vertically first when engineering effort is expensive and the ceiling is still far away, and horizontally when availability matters or the volume no longer fits on one machine.',
        ),
        strong: t(
          'A diferença técnica é simples; o que importa é a decisão.\n\n**Vertical** é barato em engenharia e caro em hardware. Trocar a instância por uma com o dobro de memória leva um restart. Não exige mudança no código. É frequentemente a resposta certa e subestimada — já vi time gastar três meses em uma migração para microsserviços quando dobrar a máquina do banco resolveria por dois anos.\n\nOs limites são reais, porém: existe um tamanho máximo de máquina, o preço cresce de forma não linear no topo da faixa, e principalmente você continua com uma máquina só. Se ela cair, o sistema caiu.\n\n**Horizontal** é caro em engenharia e mais barato em hardware por unidade de capacidade. Exige que a aplicação seja sem estado local: sessão em Redis e não em memória, upload em object storage e não em disco local, cache que tolere estar diferente entre instâncias.\n\nO benefício que eu considero mais importante não é escala, é disponibilidade. Com três instâncias, perder uma é degradação; com uma, é queda.\n\n**Como eu decido, na prática:**\n\nPergunto onde está o gargalo de verdade. Se é o banco, adicionar instâncias da aplicação piora — mais processos abrindo mais conexões no mesmo banco.\n\nPergunto quanto tempo o vertical compra. Se dobrar a máquina resolve por dezoito meses e o horizontal custa dois meses de trabalho, eu escalo vertical e uso o tempo comprado para fazer o horizontal direito, sem incêndio.\n\nE pergunto qual o requisito de disponibilidade. Se o acordo de nível de serviço não admite janela de restart, horizontal deixa de ser escolha de capacidade e vira requisito.\n\nO estado é sempre a parte difícil. Aplicação sem estado escala horizontalmente com facilidade; banco de dados não. É por isso que a maioria dos sistemas acaba com aplicação horizontal e banco vertical com réplicas de leitura, até que o volume force sharding.',
          'The technical difference is simple; the decision is what matters.\n\n**Vertical** is cheap in engineering and expensive in hardware. Swapping the instance for one with twice the memory takes a restart. It asks nothing of the code. It is frequently the right answer and badly underrated — I have watched a team spend three months migrating to microservices when doubling the database machine would have covered them for two years.\n\nThe limits are real though: there is a maximum machine size, the price grows non-linearly at the top of the range, and above all you still have one machine. If it goes down, the system is down.\n\n**Horizontal** is expensive in engineering and cheaper in hardware per unit of capacity. It requires the application to hold no local state: sessions in Redis rather than memory, uploads in object storage rather than local disk, caches that tolerate differing between instances.\n\nThe benefit I consider most important is not scale, it is availability. With three instances, losing one is degradation; with one, it is an outage.\n\n**How I decide, in practice:**\n\nI ask where the bottleneck actually is. If it is the database, adding application instances makes things worse — more processes opening more connections to the same database.\n\nI ask how much time vertical buys. If doubling the machine covers eighteen months and horizontal costs two months of work, I scale vertically and spend the bought time doing horizontal properly, without a fire.\n\nAnd I ask what the availability requirement is. If the service level agreement does not tolerate a restart window, horizontal stops being a capacity choice and becomes a requirement.\n\nState is always the hard part. A stateless application scales out easily; a database does not. That is why most systems end up with a horizontal application and a vertical database with read replicas, until volume forces sharding.',
        ),
      }),
      tradeOff([
        {
          option: t('Vertical', 'Vertical'),
          pros: list(
            ['Nenhuma mudança de código', 'Sem complexidade de coordenação', 'Rápido de executar'],
            ['No code changes', 'No coordination complexity', 'Fast to execute'],
          ),
          cons: list(
            ['Teto físico', 'Continua sendo ponto único de falha', 'Preço não linear no topo'],
            ['A physical ceiling', 'Still a single point of failure', 'Non-linear price at the top'],
          ),
        },
        {
          option: t('Horizontal', 'Horizontal'),
          pros: list(
            ['Escala muito além', 'Melhora a disponibilidade', 'Permite deploy sem downtime'],
            ['Scales far further', 'Improves availability', 'Enables zero-downtime deploys'],
          ),
          cons: list(
            ['Exige aplicação sem estado local', 'Balanceamento e coordenação', 'Mais superfície operacional'],
            ['Requires a stateless application', 'Load balancing and coordination', 'More operational surface'],
          ),
        },
      ]),
      followUps(
        list(
          [
            'O que impede sua aplicação de escalar horizontalmente hoje?',
            'Como você escalaria a camada de banco?',
            'Quando sharding passa a ser inevitável?',
          ],
          [
            'What stops your application from scaling horizontally today?',
            'How would you scale the database layer?',
            'When does sharding become unavoidable?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-microservices-challenges',
    type: 'interview-question',
    title: t('O que microsserviços realmente custam', 'What microservices actually cost'),
    categoryId: 'architecture',
    skillIds: ['architecture', 'devops', 'observability'],
    difficulty: 'advanced',
    tags: ['microservices', 'monolith', 'distributed-systems', 'trade-offs'],
    minutes: 6,
    related: ['arch-service-boundaries', 'arch-queue-exactly-once', 'api-observability-3am'],
    blocks: [
      prompt(
        t(
          'Quais são os principais desafios de microsserviços? E quando você recomendaria continuar com um monolito?',
          'What are the main challenges of microservices? And when would you recommend staying with a monolith?',
        ),
      ),
      answers({
        short: t(
          'O custo real não é operacional, é que você trocou chamadas de função por rede — e rede falha, tem latência e é parcial. O que era uma transação vira consistência eventual. O que era um stack trace vira um trace distribuído. E o limite entre serviços vira um contrato que custa caro mudar. Eu recomendo monolito quando o time é pequeno, o domínio ainda não está claro, ou quando o problema é organizacional e não técnico. Microsserviço resolve um problema de times independentes; se você tem um time só, você comprou o custo sem o benefício.',
          'The real cost is not operational, it is that you replaced function calls with the network — and the network fails, has latency, and fails partially. What was a transaction becomes eventual consistency. What was a stack trace becomes a distributed trace. And the boundary between services becomes a contract that is expensive to change. I recommend a monolith when the team is small, the domain is not yet clear, or when the problem is organisational rather than technical. Microservices solve a problem of independent teams; with one team, you have bought the cost without the benefit.',
        ),
        strong: t(
          'Eu separo os desafios em três camadas, porque eles não têm o mesmo peso.\n\n**O que muda na correção do sistema.** Esta é a camada que as pessoas subestimam.\n\nUma transação que atravessava três tabelas agora atravessa três serviços, e transação distribuída não é uma opção prática. Você precisa de saga, com passos de compensação — e compensação nem sempre existe. Estornar um pagamento é possível; "desenviar" um email não é.\n\nFalha parcial vira o estado normal. A chamada não deu erro nem sucesso: deu timeout. Você não sabe se o outro lado processou. É por isso que idempotência deixa de ser refinamento e vira requisito em toda operação.\n\nConsistência eventual vira visível para o usuário. Ele cria algo e não aparece na listagem por dois segundos, e alguém vai abrir um chamado.\n\n**O que muda na operação.** Debug exige tracing distribuído, porque stack trace não atravessa rede. Deploy vira coordenação de versões. Ambiente local fica difícil ou impossível de rodar inteiro. E o número de coisas que podem estar fora às três da manhã multiplica.\n\n**O que muda na organização.** Contrato entre serviços vira contrato entre times. Mudar um campo que era uma linha de diff vira uma negociação.\n\n**Quando eu recomendo monolito:**\n\nTime pequeno. Se todo mundo cabe em uma sala, a coordenação não é o gargalo, e microsserviço resolve coordenação.\n\nDomínio incerto. Limite errado entre serviços é caríssimo de corrigir; limite errado entre módulos é um refactor. No começo você não sabe onde estão os limites.\n\nE quando o motivo alegado é técnico mas o problema é organizacional, ou vice-versa. "O deploy é lento" às vezes se resolve com pipeline melhor, não com quinze repositórios.\n\n**O que eu defendo** é monolito modular: limites internos claros, módulos que se comunicam por interface explícita, banco com schemas separados por domínio. Quando um módulo realmente precisar escalar ou pertencer a outro time, extrair fica barato — porque o limite já existe. É o caminho que dá o benefício quando ele for necessário, sem pagar antes.',
          'I split the challenges into three layers, because they do not weigh the same.\n\n**What changes about the system\'s correctness.** This is the layer people underestimate.\n\nA transaction that spanned three tables now spans three services, and distributed transactions are not a practical option. You need a saga, with compensating steps — and compensation does not always exist. Refunding a payment is possible; un-sending an email is not.\n\nPartial failure becomes the normal state. The call did not fail or succeed: it timed out. You do not know whether the other side processed it. That is why idempotency stops being a refinement and becomes a requirement on every operation.\n\nEventual consistency becomes visible to users. They create something and it does not appear in the list for two seconds, and someone files a ticket.\n\n**What changes about operations.** Debugging needs distributed tracing, because a stack trace does not cross the network. Deploys become version coordination. Running the whole thing locally becomes hard or impossible. And the number of things that can be down at 3am multiplies.\n\n**What changes about the organisation.** A contract between services becomes a contract between teams. Changing a field that used to be a one-line diff becomes a negotiation.\n\n**When I recommend a monolith:**\n\nA small team. If everyone fits in one room, coordination is not the bottleneck, and microservices solve coordination.\n\nAn uncertain domain. A wrong boundary between services is extremely expensive to fix; a wrong boundary between modules is a refactor. Early on, you do not know where the boundaries are.\n\nAnd when the stated reason is technical but the problem is organisational, or the reverse. "Deploys are slow" is sometimes fixed by a better pipeline, not by fifteen repositories.\n\n**What I argue for** is a modular monolith: clear internal boundaries, modules talking through explicit interfaces, a database with schemas separated by domain. When a module genuinely needs to scale or belong to another team, extracting it is cheap — because the boundary already exists. It is the path that gives you the benefit when you need it, without paying for it beforehand.',
        ),
      }),
      lookingFor(
        list(
          [
            'Começar pelos desafios de correção, não só de operação',
            'Mencionar transação distribuída, saga e compensação',
            'Tratar falha parcial e idempotência como consequência direta',
            'Reconhecer o custo organizacional do contrato',
            'Saber quando recomendar monolito, e por quê',
            'Propor monolito modular como caminho',
          ],
          [
            'Starting with correctness challenges, not only operational ones',
            'Mentioning distributed transactions, sagas and compensation',
            'Treating partial failure and idempotency as direct consequences',
            'Recognising the organisational cost of contracts',
            'Knowing when to recommend a monolith, and why',
            'Proposing a modular monolith as the path',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte diz que microsserviço resolve um problema organizacional. Quem entende isso não propõe a arquitetura errada para o time errado.',
            'A strong answer says microservices solve an organisational problem. Someone who understands that does not propose the wrong architecture for the wrong team.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Listar só desafios de infraestrutura e esquecer consistência',
            'Tratar microsserviço como sinônimo de moderno',
            'Não saber dizer nenhum caso em que monolito é melhor',
          ],
          [
            'Listing only infrastructure challenges and forgetting consistency',
            'Treating microservices as a synonym for modern',
            'Not being able to name a single case where a monolith is better',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você lidaria com uma transação que atravessa três serviços?',
            'Como você definiria os limites entre serviços?',
            'Como um serviço se defende de outro que ficou lento?',
          ],
          [
            'How would you handle a transaction spanning three services?',
            'How would you define the boundaries between services?',
            'How does one service defend itself from another that got slow?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-service-boundaries',
    type: 'architecture',
    title: t('Onde cortar entre serviços', 'Where to cut between services'),
    categoryId: 'architecture',
    skillIds: ['architecture', 'system-design'],
    difficulty: 'expert',
    tags: ['boundaries', 'ddd', 'microservices', 'coupling'],
    minutes: 5,
    related: ['arch-microservices-challenges', 'arch-queue-exactly-once'],
    blocks: [
      setupText(
        t(
          'Um time propôs quebrar o monolito em serviços de Usuário, Pedido, Produto, Pagamento e Notificação, um por tabela principal.',
          'A team proposed splitting the monolith into User, Order, Product, Payment and Notification services, one per main table.',
        ),
      ),
      prompt(
        t('O que você acha dessa divisão?', 'What do you think of that split?')),
      answers({
        short: t(
          'Dividir por entidade é o erro mais comum, porque entidade não é limite — quase toda operação de negócio toca várias delas. Se criar um pedido exige chamar Usuário, Produto e Pagamento de forma síncrona, você criou um monolito distribuído: tem todo o custo de rede e nenhum benefício de independência. O limite certo vem da capacidade de negócio e do que muda junto. Eu olharia quais partes mudam pelos mesmos motivos e quais transações precisam ser atômicas, e cortaria onde o acoplamento já é baixo.',
          'Splitting by entity is the most common mistake, because an entity is not a boundary — nearly every business operation touches several of them. If creating an order requires synchronous calls to User, Product and Payment, you have built a distributed monolith: all the network cost and none of the independence. The right boundary comes from business capability and from what changes together. I would look at which parts change for the same reasons and which transactions need to be atomic, and cut where coupling is already low.',
        ),
        strong: t(
          'Eu diria que a divisão está organizada pelo substantivo errado. Serviço não é tabela com HTTP na frente.\n\n**O teste que eu aplico:** pego os três ou quatro casos de uso mais importantes e desenho quais serviços cada um precisa chamar. Se "criar pedido" precisa de quatro chamadas síncronas, o limite está errado — porque agora eu tenho uma operação de negócio cuja disponibilidade é o produto das disponibilidades de quatro serviços, e cuja latência é a soma.\n\n**Os sinais de limite errado:**\n\nChamada síncrona em cadeia para completar uma operação.\n\nDois serviços que são deployados sempre juntos. Se mudar um exige mudar o outro na mesma semana, eles são um serviço com uma rede no meio.\n\nUm serviço que só faz CRUD e não tem nenhuma regra própria. Serviço anêmico é uma tabela com latência.\n\nCompartilhar banco de dados. Se dois serviços leem a mesma tabela, o schema é o contrato e nada é independente.\n\n**Como eu procuraria o limite certo:**\n\nPor capacidade de negócio, não por entidade. "Checkout", "Catálogo", "Entrega" são capacidades; "Usuário" é uma tabela.\n\nPelo que muda junto. Se duas coisas mudam sempre pelo mesmo motivo, elas pertencem ao mesmo serviço.\n\nPelos limites de transação. Se duas escritas precisam ser atômicas, elas querem ficar do mesmo lado. Separar cria saga, e saga é caro.\n\nPela estrutura dos times. Um serviço que exige três times para mudar não é independente de verdade.\n\n**O que eu recomendaria concretamente:** não quebrar tudo de uma vez. Estabelecer esses limites dentro do monolito primeiro, como módulos com interface explícita e schemas separados. Quando um módulo estiver realmente isolado — comunicação por interface, sem acesso cruzado a tabela, com seu próprio ritmo de mudança — extrair vira uma tarefa de dias em vez de um projeto de trimestres. E se, ao tentar isolar, descobrirmos que o limite estava errado, corrigir dentro do monolito custa um refactor em vez de uma migração.',
          'I would say the split is organised around the wrong noun. A service is not a table with HTTP in front of it.\n\n**The test I apply:** take the three or four most important use cases and draw which services each one has to call. If "create order" needs four synchronous calls, the boundary is wrong — because now I have a business operation whose availability is the product of four services\' availabilities, and whose latency is their sum.\n\n**The signals of a wrong boundary:**\n\nChained synchronous calls to complete one operation.\n\nTwo services always deployed together. If changing one requires changing the other in the same week, they are one service with a network in the middle.\n\nA service that only does CRUD and owns no rules of its own. An anaemic service is a table with latency.\n\nA shared database. If two services read the same table, the schema is the contract and nothing is independent.\n\n**How I would look for the right boundary:**\n\nBy business capability, not by entity. "Checkout", "Catalogue", "Fulfilment" are capabilities; "User" is a table.\n\nBy what changes together. If two things always change for the same reason, they belong in the same service.\n\nBy transaction boundaries. If two writes must be atomic, they want to be on the same side. Separating them creates a saga, and sagas are expensive.\n\nBy team structure. A service that needs three teams to change is not genuinely independent.\n\n**What I would concretely recommend:** do not split everything at once. Establish those boundaries inside the monolith first, as modules with explicit interfaces and separate schemas. Once a module is genuinely isolated — communicating through an interface, no cross-table access, with its own change rhythm — extracting it becomes a days-long task instead of a quarters-long project. And if, while trying to isolate it, we discover the boundary was wrong, fixing it inside the monolith costs a refactor instead of a migration.',
        ),
      }),
      lookingFor(
        list(
          [
            'Reconhecer divisão por entidade como anti-padrão',
            'Nomear o monolito distribuído',
            'Usar casos de uso como teste do limite',
            'Considerar disponibilidade composta e latência somada',
            'Propor estabelecer limites dentro do monolito primeiro',
          ],
          [
            'Recognising entity-based splitting as an anti-pattern',
            'Naming the distributed monolith',
            'Using use cases as the boundary test',
            'Considering compounded availability and summed latency',
            'Proposing to establish boundaries inside the monolith first',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte quantifica: quatro serviços a 99,9% em cadeia dão 99,6%, o que é quase três horas de indisponibilidade a mais por mês.',
            'A strong answer quantifies it: four services at 99.9% in a chain give 99.6%, which is nearly three extra hours of downtime a month.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você transformaria uma cadeia síncrona em algo assíncrono?',
            'O que fazer quando dois serviços precisam do mesmo dado?',
            'Como você mediria se um limite está errado?',
          ],
          [
            'How would you turn a synchronous chain into something asynchronous?',
            'What do you do when two services need the same data?',
            'How would you measure that a boundary is wrong?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-queue-exactly-once',
    type: 'interview-question',
    title: t('Entrega exatamente uma vez existe?', 'Does exactly-once delivery exist?'),
    categoryId: 'architecture',
    stackIds: ['kafka', 'aws'],
    skillIds: ['architecture', 'system-design'],
    difficulty: 'expert',
    tags: ['queues', 'messaging', 'idempotency', 'distributed-systems'],
    minutes: 5,
    related: ['api-idempotency', 'arch-microservices-challenges', 'js-event-emitter-async'],
    blocks: [
      prompt(
        t(
          'Uma fila promete entrega "exatamente uma vez". Você confia? Como você desenharia o consumidor?',
          'A queue promises "exactly-once" delivery. Do you trust it? How would you design the consumer?',
        ),
      ),
      answers({
        short: t(
          'Não confio, e desenharia como se fosse pelo menos uma vez. Entrega exatamente uma vez é impossível de garantir entre sistemas independentes: sempre existe a janela entre processar a mensagem e confirmar o recebimento, e se o processo cair nessa janela a mensagem volta. O que os sistemas oferecem é processamento efetivamente uma vez, dentro do próprio domínio deles. A resposta prática é fazer o consumidor idempotente: uma chave de deduplicação persistida, ou uma operação que possa ser aplicada várias vezes com o mesmo resultado.',
          'I would not, and I would design for at-least-once. Exactly-once delivery is impossible to guarantee between independent systems: there is always a window between processing the message and acknowledging it, and if the process dies in that window the message comes back. What these systems offer is effectively-once processing, within their own domain. The practical answer is making the consumer idempotent: a persisted deduplication key, or an operation that can be applied repeatedly with the same result.',
        ),
        strong: t(
          'Eu começaria dizendo que a promessa é quase sempre mal interpretada, e que o desenho seguro não depende dela.\n\n**Por que é impossível no caso geral.** Entre receber a mensagem, processar, e confirmar, existem duas ordens possíveis e as duas têm falha:\n\nSe eu confirmo antes de processar e caio no meio, a mensagem foi perdida. Isso é no máximo uma vez.\n\nSe eu processo e confirmo depois, e caio entre os dois, a mensagem é reentregue e eu processo de novo. Isso é pelo menos uma vez.\n\nNão existe uma terceira opção, porque não dá para fazer as duas coisas atomicamente quando elas estão em sistemas diferentes. O Kafka consegue algo parecido com exatamente uma vez dentro do Kafka, com transações que cobrem consumo e produção no mesmo cluster — mas no momento em que o efeito colateral é escrever no meu banco ou chamar uma API externa, a garantia acaba.\n\n**Então eu escolho pelo menos uma vez, conscientemente,** porque perder mensagem é pior do que processar duas vezes, e a segunda eu sei resolver.\n\n**Como eu faço o consumidor idempotente:**\n\nA forma mais robusta é uma tabela de mensagens processadas, com o id da mensagem como chave primária, gravada na mesma transação do efeito. Se a transação commita, a marca e o efeito commitam juntos; se falha, os dois voltam. Isso transforma pelo menos uma vez em efetivamente uma vez, e é a única forma que realmente fecha a janela.\n\nQuando o efeito é naturalmente idempotente, é ainda melhor: um UPDATE que define um estado — `status = shipped` — pode rodar cinco vezes sem problema. Já um INSERT de lançamento financeiro, não.\n\n**O que eu sempre adiciono:** a mensagem precisa carregar um identificador estável de negócio, não só o id técnico da fila. Se a mensagem for reproduzida por um replay, o id da fila muda e a deduplicação por ele falha.\n\nE uma fila de mensagens mortas com limite de tentativas, senão uma mensagem envenenada fica em loop para sempre e consome o consumidor inteiro.\n\n**Sobre ordenação**, já que costuma vir junto: garantia de ordem normalmente é por partição ou por grupo de mensagens, não global. Se o processamento depende de ordem, a chave de particionamento tem que ser escolhida de propósito — por id de agregado, por exemplo — e isso limita o paralelismo.',
          'I would open by saying the promise is almost always misread, and that a safe design does not depend on it.\n\n**Why it is impossible in the general case.** Between receiving the message, processing it, and acknowledging, there are two possible orders and both have a failure mode:\n\nIf I acknowledge before processing and die in between, the message is lost. That is at-most-once.\n\nIf I process and acknowledge afterwards, and die in between, the message is redelivered and I process it twice. That is at-least-once.\n\nThere is no third option, because you cannot do both atomically when they live in different systems. Kafka achieves something close to exactly-once within Kafka, with transactions covering consumption and production in the same cluster — but the moment the side effect is writing to my database or calling an external API, the guarantee ends.\n\n**So I choose at-least-once deliberately,** because losing a message is worse than processing it twice, and the second problem I know how to solve.\n\n**How I make the consumer idempotent:**\n\nThe most robust shape is a processed-messages table, with the message id as the primary key, written in the same transaction as the effect. If the transaction commits, the marker and the effect commit together; if it fails, both roll back. That turns at-least-once into effectively-once, and it is the only approach that genuinely closes the window.\n\nWhen the effect is naturally idempotent, better still: an UPDATE that sets a state — `status = shipped` — can run five times without harm. An INSERT of a financial entry cannot.\n\n**What I always add:** the message has to carry a stable business identifier, not just the queue\'s technical id. If the message is replayed, the queue id changes and deduplication on it fails.\n\nAnd a dead letter queue with a retry limit, otherwise a poison message loops forever and consumes the whole consumer.\n\n**On ordering**, since it usually comes up alongside: ordering guarantees are normally per partition or per message group, not global. If processing depends on order, the partition key has to be chosen on purpose — by aggregate id, for instance — and that caps your parallelism.',
        ),
      }),
      code(
        'sql',
        `
-- The marker and the effect commit or roll back together.
begin;

insert into processed_messages (message_id, consumer, processed_at)
values ($1, 'order-fulfilment', now())
on conflict (message_id, consumer) do nothing;

-- No row inserted means this message was already handled: stop here.

update orders set status = 'shipped', shipped_at = now() where id = $2;

commit;
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'Explicar por que exatamente uma vez é impossível entre sistemas',
            'Escolher pelo menos uma vez conscientemente e justificar',
            'Propor deduplicação na mesma transação do efeito',
            'Distinguir efeito naturalmente idempotente de efeito que não é',
            'Lembrar de dead letter queue e limite de tentativas',
          ],
          [
            'Explaining why exactly-once is impossible across systems',
            'Choosing at-least-once deliberately and justifying it',
            'Proposing deduplication in the same transaction as the effect',
            'Distinguishing naturally idempotent effects from ones that are not',
            'Remembering the dead letter queue and retry limits',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte não só diz "faça idempotente": ela mostra que a marca e o efeito precisam commitar juntos, que é onde a maioria das implementações erra.',
            'A strong answer does not just say "make it idempotent": it shows the marker and the effect have to commit together, which is where most implementations get it wrong.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você lidaria com uma mensagem envenenada?',
            'O que acontece com a ordenação quando você paraleliza?',
            'Como você limparia a tabela de deduplicação?',
          ],
          [
            'How would you handle a poison message?',
            'What happens to ordering when you parallelise?',
            'How would you clean up the deduplication table?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-cache-invalidation',
    type: 'interview-question',
    title: t('Estratégias de cache e o problema real', 'Cache strategies and the real problem'),
    categoryId: 'architecture',
    stackIds: ['redis'],
    skillIds: ['caching', 'architecture', 'performance'],
    difficulty: 'advanced',
    tags: ['caching', 'invalidation', 'redis', 'consistency'],
    minutes: 5,
    related: ['db-redis-when', 'api-high-traffic-endpoint', 'arch-url-shortener'],
    blocks: [
      prompt(
        t(
          'Que estratégias de cache você conhece, e como você decide a política de invalidação?',
          'What caching strategies do you know, and how do you decide the invalidation policy?',
        ),
      ),
      answers({
        short: t(
          'A estratégia mais comum é cache-aside: a aplicação procura no cache, e no miss busca no banco e popula. Existem também write-through, que escreve nos dois ao mesmo tempo, e write-behind, que escreve no cache e persiste depois. Mas a decisão que importa não é a estratégia, é quanto de desatualização o dado tolera. Eu começo por aí: se tolera trinta segundos, TTL resolve e eu não preciso de invalidação ativa nenhuma. Se não tolera nada, provavelmente não deveria estar em cache.',
          'The most common strategy is cache-aside: the application checks the cache, and on a miss reads the database and populates it. There is also write-through, writing to both at once, and write-behind, writing to the cache and persisting later. But the decision that matters is not the strategy, it is how much staleness the data tolerates. I start there: if it tolerates thirty seconds, a TTL handles it and I need no active invalidation at all. If it tolerates none, it probably should not be cached.',
        ),
        strong: t(
          'Eu inverto a pergunta: antes de escolher estratégia, eu pergunto qual a tolerância a dado velho, porque ela decide tudo.\n\n**Se tolera segundos ou minutos**, TTL curto resolve e eu nem preciso de invalidação. É a solução mais simples e a mais subestimada. Um TTL de trinta segundos em um endpoint com mil requisições por segundo já corta 99,9% da carga.\n\n**Se tolera pouco mas não zero**, cache-aside com invalidação no write. A aplicação apaga a chave ao atualizar o dado. A sutileza é apagar em vez de reescrever: reescrever cria corrida entre duas atualizações concorrentes e pode deixar o valor antigo no cache permanentemente.\n\n**Se não tolera nada**, eu questionaria se cache é a ferramenta. Normalmente o que a pessoa quer é uma consulta mais rápida, e aí o problema é índice, não cache.\n\n**As estratégias:**\n\nCache-aside é o padrão. Simples, e o cache ficar fora não derruba nada.\n\nWrite-through mantém o cache sempre quente, ao custo de latência de escrita. Bom quando a leitura logo após a escrita é garantida.\n\nWrite-behind é rápido na escrita e arriscado: se o cache cair antes de persistir, o dado se perde. Eu só usaria em dado que pode ser perdido, tipo contador de visualização.\n\n**Os problemas que eu levanto sem ser perguntado**, porque é onde cache quebra de verdade:\n\n**Stampede.** A chave expira e mil requisições vão ao banco ao mesmo tempo. A defesa é lock de recomputação — só um recalcula, os outros esperam ou servem o valor velho — ou stale-while-revalidate.\n\n**Hot key.** Um item concentra o tráfego todo e satura o nó. Replicar a chave com sufixo aleatório, ou cachear também na aplicação.\n\n**Invalidação que falha.** Se o delete do cache falhar depois do commit no banco, o cache fica errado indefinidamente. É por isso que eu sempre coloco um TTL mesmo tendo invalidação ativa: o TTL é a rede de segurança que limita quanto tempo um erro dura.\n\nA frase que eu acho mais honesta sobre isso: cache não é uma otimização de graça, é uma segunda fonte de verdade que você se comprometeu a manter sincronizada.',
          'I invert the question: before choosing a strategy, I ask how much staleness is acceptable, because that decides everything.\n\n**If it tolerates seconds or minutes**, a short TTL handles it and I need no invalidation at all. That is the simplest solution and the most underrated. A thirty-second TTL on an endpoint doing a thousand requests a second already removes 99.9% of the load.\n\n**If it tolerates little but not zero**, cache-aside with invalidation on write. The application deletes the key when it updates the data. The subtlety is deleting rather than rewriting: rewriting races between two concurrent updates and can leave the old value cached permanently.\n\n**If it tolerates nothing**, I would question whether a cache is the tool at all. Usually what the person wants is a faster query, and then the problem is an index, not a cache.\n\n**The strategies:**\n\nCache-aside is the default. Simple, and the cache being down does not take anything with it.\n\nWrite-through keeps the cache warm at the cost of write latency. Good when a read immediately after a write is guaranteed.\n\nWrite-behind is fast to write and risky: if the cache dies before persisting, the data is gone. I would only use it for data that can be lost, like a view counter.\n\n**The problems I raise unprompted**, because this is where caches genuinely break:\n\n**Stampede.** The key expires and a thousand requests hit the database at once. The defence is a recompute lock — one recalculates, the others wait or serve the stale value — or stale-while-revalidate.\n\n**Hot key.** One item takes all the traffic and saturates a node. Replicate the key with a random suffix, or cache in the application too.\n\n**Failed invalidation.** If the cache delete fails after the database commit, the cache is wrong indefinitely. That is why I always set a TTL even with active invalidation: the TTL is the safety net bounding how long a mistake lasts.\n\nThe most honest sentence about this: a cache is not a free optimisation, it is a second source of truth you have committed to keeping in sync.',
        ),
      }),
      lookingFor(
        list(
          [
            'Começar pela tolerância a desatualização',
            'Conhecer cache-aside, write-through e write-behind',
            'Apagar em vez de reescrever na invalidação, e saber por quê',
            'Trazer stampede e hot key sem ser perguntado',
            'Manter TTL como rede de segurança mesmo com invalidação ativa',
          ],
          [
            'Starting from staleness tolerance',
            'Knowing cache-aside, write-through and write-behind',
            'Deleting rather than rewriting on invalidation, and knowing why',
            'Raising stampede and hot key unprompted',
            'Keeping a TTL as a safety net even with active invalidation',
          ],
        ),
      ),
      warn(
        t(
          'Cache sem TTL e com invalidação ativa é uma bomba-relógio: qualquer falha na invalidação serve dado errado para sempre.',
          'A cache with no TTL relying on active invalidation is a time bomb: any failed invalidation serves wrong data forever.',
        ),
      ),
      followUps(
        list(
          [
            'Como você implementaria stale-while-revalidate?',
            'O que acontece se a invalidação falhar depois do commit?',
            'Como você mediria se o cache está valendo a pena?',
          ],
          [
            'How would you implement stale-while-revalidate?',
            'What happens if invalidation fails after the commit?',
            'How would you measure whether the cache is worth it?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-resilience-timeouts',
    type: 'scenario',
    title: t('Um serviço lento derrubando toda a cadeia', 'One slow service taking down the chain'),
    categoryId: 'architecture',
    skillIds: ['architecture', 'observability'],
    difficulty: 'advanced',
    tags: ['resilience', 'timeouts', 'circuit-breaker', 'cascading-failure'],
    minutes: 5,
    related: ['arch-microservices-challenges', 'api-high-traffic-endpoint'],
    blocks: [
      setupText(
        t(
          'Um serviço de terceiro que você chama para enriquecer uma resposta começou a responder em 30 segundos em vez de 200ms. Em dez minutos, toda a sua API estava fora, incluindo endpoints que nem chamam esse serviço.',
          'A third-party service you call to enrich a response started answering in 30 seconds instead of 200ms. Within ten minutes your whole API was down, including endpoints that never call it.',
        ),
      ),
      prompt(
        t(
          'Por que a falha se espalhou, e o que você colocaria para isso não acontecer de novo?',
          'Why did the failure spread, and what would you put in place so it does not happen again?',
        ),
      ),
      answers({
        short: t(
          'Se espalhou porque as requisições lentas ficaram segurando recursos compartilhados — conexões, threads do pool, memória — e endpoints que não têm relação nenhuma ficaram sem recurso para atender. É falha em cascata por esgotamento de recurso. As defesas são timeout agressivo na chamada externa, isolamento do pool para que aquele caminho não consuma tudo, e um circuit breaker que pare de tentar quando a taxa de falha subir.',
          'It spread because the slow requests held shared resources — connections, pool slots, memory — and unrelated endpoints ran out of resources to serve. That is a cascading failure through resource exhaustion. The defences are an aggressive timeout on the external call, bulkheading the pool so that path cannot consume everything, and a circuit breaker that stops trying once the failure rate climbs.',
        ),
        strong: t(
          'A cadeia causal é o que importa aqui, e ela quase sempre é a mesma.\n\nA chamada externa ficou lenta. Se o timeout é alto ou inexistente, cada requisição fica ocupando um slot por trinta segundos. Como as requisições continuam chegando na taxa normal, o número de requisições em voo cresce sem parar. Elas consomem conexões, memória e, em Node, ficam acumuladas como callbacks pendentes.\n\nQuando o recurso compartilhado esgota — normalmente o pool de conexões ou o limite de sockets —, qualquer endpoint passa a falhar, inclusive os que não têm relação. E aí entra o retry: o cliente vê lentidão e tenta de novo, o que aumenta a carga exatamente no pior momento.\n\n**As defesas, na ordem em que eu colocaria:**\n\n**Timeout, sempre.** Toda chamada de rede precisa de timeout explícito, e ele deve ser derivado do orçamento de latência do endpoint, não escolhido por hábito. Se meu endpoint deve responder em um segundo, a chamada externa não pode ter timeout de dez. Essa é a defesa mais barata e a mais frequentemente ausente.\n\n**Isolamento de recursos.** Um pool separado para chamadas àquele serviço, com tamanho limitado. Se ele saturar, só o caminho que depende dele degrada. É o conceito de bulkhead, emprestado de compartimento estanque de navio: o vazamento inunda um compartimento, não o casco inteiro.\n\n**Circuit breaker.** Depois de uma taxa de falha, ele abre e as chamadas passam a falhar imediatamente, sem esperar o timeout. Isso protege duas coisas: o meu serviço, que para de acumular requisições presas, e o serviço em apuros, que para de receber tráfego enquanto tenta se recuperar. Depois de um intervalo ele deixa passar uma requisição de teste.\n\n**Degradação.** A pergunta de produto: se o enriquecimento falhar, eu posso responder sem ele? Quase sempre a resposta é sim, e é a melhor saída. Responder com o dado principal e sem o opcional é infinitamente melhor do que não responder.\n\n**Retry com cuidado.** Retry sem backoff exponencial e sem jitter transforma degradação em ataque. E eu só faço retry em erro que faz sentido tentar de novo, nunca em 4xx.\n\nA lição geral que eu tiraria para o postmortem: toda dependência externa é uma fonte potencial de indisponibilidade própria, e o desenho tem que assumir que ela vai ficar lenta, não apenas que ela pode cair. Lentidão é pior que queda, porque queda falha rápido.',
          'The causal chain is what matters here, and it is almost always the same one.\n\nThe external call got slow. If the timeout is high or absent, each request occupies a slot for thirty seconds. Since requests keep arriving at the normal rate, the number in flight grows without bound. They consume connections, memory, and in Node they pile up as pending callbacks.\n\nWhen the shared resource runs out — usually the connection pool or the socket limit — every endpoint starts failing, including unrelated ones. And then retries join in: the client sees slowness and tries again, adding load at exactly the worst moment.\n\n**The defences, in the order I would add them:**\n\n**Timeouts, always.** Every network call needs an explicit timeout, derived from the endpoint\'s latency budget rather than chosen by habit. If my endpoint should answer in one second, the external call cannot have a ten-second timeout. That is the cheapest defence and the most frequently missing one.\n\n**Resource isolation.** A separate pool for calls to that service, with a bounded size. If it saturates, only the path depending on it degrades. That is the bulkhead idea, borrowed from ship compartments: the leak floods one compartment, not the hull.\n\n**A circuit breaker.** Past a failure rate it opens, and calls fail immediately without waiting for the timeout. That protects two things: my service, which stops accumulating stuck requests, and the struggling service, which stops receiving traffic while it tries to recover. After an interval it lets one probe request through.\n\n**Degradation.** The product question: if the enrichment fails, can I answer without it? Almost always the answer is yes, and it is the best way out. Answering with the main data and without the optional part is infinitely better than not answering.\n\n**Careful retries.** Retrying without exponential backoff and jitter turns degradation into an attack. And I only retry errors worth retrying, never a 4xx.\n\nThe general lesson I would put in the postmortem: every external dependency is a potential source of your own downtime, and the design has to assume it will get slow, not merely that it might go down. Slow is worse than down, because down fails fast.',
        ),
      }),
      diagram(
        t('Como a falha se espalha', 'How the failure spreads'),
        [
          { id: 'slow', label: t('Dependência lenta', 'Slow dependency'), col: 0, row: 0, tone: 'danger' },
          { id: 'inflight', label: t('Requisições presas acumulam', 'Stuck requests pile up'), col: 1, row: 0 },
          { id: 'pool', label: t('Pool compartilhado esgota', 'Shared pool exhausts'), col: 2, row: 0, tone: 'danger' },
          { id: 'all', label: t('Endpoints sem relação falham', 'Unrelated endpoints fail'), col: 3, row: 0, tone: 'danger' },
          { id: 'retry', label: t('Clientes fazem retry', 'Clients retry'), col: 2, row: 1, tone: 'muted' },
        ],
        [
          { from: 'slow', to: 'inflight' },
          { from: 'inflight', to: 'pool' },
          { from: 'pool', to: 'all' },
          { from: 'all', to: 'retry' },
          { from: 'retry', to: 'inflight', label: t('amplifica', 'amplifies'), dashed: true },
        ],
      ),
      lookingFor(
        list(
          [
            'Explicar a cascata por esgotamento de recurso compartilhado',
            'Timeout derivado do orçamento de latência',
            'Isolamento de pool por dependência',
            'Circuit breaker, e saber que ele protege os dois lados',
            'Perguntar se dá para degradar sem aquele dado',
            'Retry com backoff e jitter, e só no que faz sentido',
          ],
          [
            'Explaining the cascade through shared resource exhaustion',
            'Timeouts derived from the latency budget',
            'Pool isolation per dependency',
            'A circuit breaker, and knowing it protects both sides',
            'Asking whether the response can degrade without that data',
            'Retries with backoff and jitter, and only where they make sense',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte diz que lentidão é pior que queda. É uma inversão contraintuitiva que só quem passou por isso formula.',
            'A strong answer says slow is worse than down. It is a counterintuitive inversion that only someone who has lived it formulates.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você escolheria o valor do timeout?',
            'Como o circuit breaker decide voltar a tentar?',
            'Por que jitter no backoff importa?',
          ],
          [
            'How would you choose the timeout value?',
            'How does the circuit breaker decide to try again?',
            'Why does jitter in the backoff matter?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-consistency-tradeoff',
    type: 'interview-question',
    title: t('Consistência forte ou eventual', 'Strong or eventual consistency'),
    categoryId: 'architecture',
    skillIds: ['architecture', 'system-design', 'databases'],
    difficulty: 'expert',
    tags: ['consistency', 'cap', 'distributed-systems', 'replication'],
    minutes: 5,
    related: ['arch-queue-exactly-once', 'db-transaction-isolation'],
    blocks: [
      prompt(
        t(
          'Quando você aceitaria consistência eventual, e quando exigiria consistência forte? Dê exemplos concretos.',
          'When would you accept eventual consistency, and when would you require strong consistency? Give concrete examples.',
        ),
      ),
      answers({
        short: t(
          'Eu decido pelo custo de estar errado por alguns segundos. Contador de curtidas, feed, contagem de visualizações, busca: eventual serve, e o usuário nem percebe. Saldo em transferência, reserva de estoque no último item, e qualquer regra de unicidade como email cadastrado: precisa ser forte, porque uma janela de inconsistência vira dinheiro perdido ou dado duplicado. E tem um caso intermediário que importa muito na prática: o usuário precisa ver a própria escrita imediatamente, mesmo que os outros não precisem.',
          'I decide by the cost of being wrong for a few seconds. A like counter, a feed, view counts, search: eventual is fine, and the user does not notice. A balance during a transfer, reserving the last item in stock, and any uniqueness rule like a registered email: those need strong consistency, because a window of inconsistency becomes lost money or duplicated data. And there is an in-between case that matters a lot in practice: the user needs to see their own write immediately, even if nobody else does.',
        ),
        strong: t(
          'A pergunta que eu faço é sempre: se este dado estiver errado por três segundos, o que acontece?\n\n**Eventual serve quando a resposta é "nada demais".** Contagem de curtidas, número de visualizações, feed, resultado de busca, dashboard analítico. Ninguém toma decisão irreversível em cima disso, e o ganho de disponibilidade e escala é enorme.\n\n**Forte é necessária quando a resposta é "alguém perde dinheiro ou o dado fica inválido".** Débito e crédito de uma transferência. Reserva do último item do estoque. Unicidade de email ou de CPF. Qualquer coisa em que duas operações concorrentes possam produzir um estado que o domínio considera impossível.\n\n**O caso intermediário**, que eu acho o mais importante na prática, é consistência de leitura da própria escrita. O usuário edita o perfil, a tela recarrega da réplica que ainda não recebeu a mudança, e ele vê o valor antigo. Tecnicamente está tudo certo; para ele, o sistema perdeu a edição dele.\n\nIsso se resolve sem exigir consistência forte global: direciono as leituras daquele usuário para o primário por alguns segundos após a escrita, ou devolvo o valor escrito na resposta e o cliente usa o que já tem. É uma solução de produto barata para um problema que parece de infraestrutura.\n\n**Sobre CAP**, já que costuma vir junto: eu evito recitar o teorema, porque a formulação "escolha dois" confunde mais do que ajuda. Partição não é uma escolha — ela acontece. A escolha real é o que fazer *durante* a partição: recusar escrita para manter consistência, ou aceitar e reconciliar depois. E na ausência de partição, que é quase sempre, a escolha verdadeira é entre latência e consistência, que é o que o PACELC formaliza.\n\nNa prática, sistemas reais são mistos. O mesmo produto pode ter saldo consistente de forma forte e contador de visualização eventual, e isso não é incoerência, é a decisão certa tomada duas vezes.',
          'The question I always ask is: if this data is wrong for three seconds, what happens?\n\n**Eventual works when the answer is "not much".** Like counts, view counts, feeds, search results, analytics dashboards. Nobody makes an irreversible decision on top of those, and the availability and scale gain is enormous.\n\n**Strong is required when the answer is "somebody loses money or the data becomes invalid".** Debiting and crediting a transfer. Reserving the last item in stock. Uniqueness of an email or a tax id. Anything where two concurrent operations can produce a state the domain considers impossible.\n\n**The in-between case**, which I think matters most in practice, is read-your-own-writes. The user edits their profile, the screen reloads from a replica that has not received the change, and they see the old value. Technically everything is correct; to them, the system lost their edit.\n\nThat is solvable without demanding global strong consistency: route that user\'s reads to the primary for a few seconds after a write, or return the written value in the response and let the client use what it already has. It is a cheap product solution to a problem that looks like infrastructure.\n\n**On CAP**, since it usually comes up: I avoid reciting the theorem, because the "pick two" framing confuses more than it helps. A partition is not a choice — it happens. The real choice is what to do *during* the partition: refuse writes to stay consistent, or accept them and reconcile later. And in the absence of a partition, which is nearly always, the actual choice is between latency and consistency, which is what PACELC formalises.\n\nIn practice, real systems are mixed. The same product can have a strongly consistent balance and an eventually consistent view counter, and that is not incoherence, it is the right decision made twice.',
        ),
      }),
      lookingFor(
        list(
          [
            'Decidir pelo custo de estar errado, não por preferência',
            'Dar exemplos concretos dos dois lados',
            'Trazer leitura da própria escrita como caso à parte',
            'Tratar CAP com nuance em vez de recitar',
            'Reconhecer que o mesmo sistema mistura os dois',
          ],
          [
            'Deciding by the cost of being wrong rather than by preference',
            'Giving concrete examples on both sides',
            'Raising read-your-own-writes as its own case',
            'Treating CAP with nuance rather than reciting it',
            'Recognising the same system mixes both',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte questiona a formulação "escolha dois" do CAP. É o tipo de nuance que distingue leitura de blog de experiência real.',
            'A strong answer pushes back on the "pick two" framing of CAP. That is the kind of nuance that separates blog reading from real experience.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você garantiria leitura da própria escrita com réplicas?',
            'O que é PACELC e o que ele acrescenta ao CAP?',
            'Como você reconciliaria escritas conflitantes?',
          ],
          [
            'How would you guarantee read-your-own-writes with replicas?',
            'What is PACELC and what does it add to CAP?',
            'How would you reconcile conflicting writes?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-feature-flags',
    type: 'interview-question',
    title: t('Deploy não é release', 'Deploy is not release'),
    categoryId: 'devops',
    skillIds: ['devops', 'architecture'],
    difficulty: 'intermediate',
    tags: ['feature-flags', 'deploy', 'release', 'ci-cd'],
    minutes: 4,
    related: ['db-migration-zero-downtime', 'api-versioning'],
    blocks: [
      prompt(
        t(
          'Como você entregaria uma funcionalidade grande e arriscada com segurança?',
          'How would you ship a large, risky feature safely?',
        ),
      ),
      answers({
        short: t(
          'Separando deploy de release. Eu levo o código para produção desligado atrás de uma flag, em incrementos pequenos e frequentes, e depois ligo para uma fração de usuários e vou aumentando. Assim o risco de "colocar em produção" e o risco de "ativar para todo mundo" deixam de ser o mesmo evento. Se algo der errado, desligar a flag leva segundos e não exige rollback de deploy — que é lento e pode esbarrar em migração de banco.',
          'By separating deploy from release. I get the code to production switched off behind a flag, in small frequent increments, then turn it on for a fraction of users and ramp up. That way the risk of "putting it in production" and the risk of "turning it on for everyone" stop being the same event. If something goes wrong, switching the flag off takes seconds and needs no deploy rollback — which is slow and can run into database migrations.',
        ),
        strong: t(
          'A ideia central é que deploy e release são eventos diferentes, e tratar os dois como um só é o que torna entrega grande assustadora.\n\n**Deploy** é o código chegar em produção. Deve ser frequente, pequeno e chato.\n\n**Release** é o usuário ver. Deve ser controlado e reversível em segundos.\n\nCom flag, eu levo o código incompleto para produção desde cedo, desligado. Isso mata a branch de longa duração, que é onde nascem os merges infernais e os bugs de integração descobertos tarde.\n\n**A liberação eu faço em rampa:** primeiro o time interno, depois 1% dos usuários, depois 10%, 50%, 100%. Em cada patamar eu olho as métricas que importam — taxa de erro, latência, e a métrica de negócio que a feature deveria mover. Se piorar, desligo. Segundos, não minutos.\n\n**O que eu cuido:**\n\nFlag é dívida. Toda flag precisa de dono e de data de remoção. Código com quarenta flags antigas fica impossível de raciocinar, porque o número de combinações de estado explode.\n\nO estado com a flag desligada precisa continuar correto. Se a feature nova escreve em uma coluna e a antiga não, a migração precisa lidar com os dois.\n\nBanco de dados não volta com a flag. Se a feature exige mudança de schema, a mudança precisa ser compatível para frente e para trás, senão desligar a flag não te salva.\n\nFlag não substitui teste. Ela limita o raio de impacto; não torna o código correto.\n\n**Para uma feature realmente grande**, eu combinaria com escrita dupla e comparação: o caminho novo roda em paralelo, sem efeito, e eu comparo o resultado com o do caminho antigo em produção com tráfego real. Quando os resultados baterem por tempo suficiente, eu troco. É mais trabalho, e é a única forma de ter confiança de verdade em uma substituição crítica.',
          'The core idea is that deploy and release are different events, and treating them as one is what makes big deliveries frightening.\n\n**Deploy** is the code reaching production. It should be frequent, small and boring.\n\n**Release** is the user seeing it. It should be controlled and reversible in seconds.\n\nWith a flag, I get incomplete code into production early, switched off. That kills the long-lived branch, which is where hellish merges and late-discovered integration bugs come from.\n\n**I release on a ramp:** internal team first, then 1% of users, then 10%, 50%, 100%. At each step I watch the metrics that matter — error rate, latency, and the business metric the feature is supposed to move. If it gets worse, I switch it off. Seconds, not minutes.\n\n**What I watch out for:**\n\nA flag is debt. Every flag needs an owner and a removal date. Code with forty old flags becomes impossible to reason about, because the number of state combinations explodes.\n\nThe state with the flag off has to stay correct. If the new feature writes to a column and the old one does not, the migration has to handle both.\n\nThe database does not roll back with the flag. If the feature needs a schema change, that change has to be forward and backward compatible, otherwise switching the flag off does not save you.\n\nA flag is not a substitute for testing. It limits the blast radius; it does not make the code correct.\n\n**For a genuinely large feature**, I would combine it with dual writes and comparison: the new path runs in parallel, with no effect, and I compare its result against the old path in production with real traffic. Once results match for long enough, I switch. It is more work, and it is the only way to get real confidence in a critical replacement.',
        ),
      }),
      lookingFor(
        list(
          [
            'Separar deploy de release explicitamente',
            'Liberação em rampa com métrica em cada patamar',
            'Tratar flag como dívida com data de remoção',
            'Lembrar que o banco não volta junto com a flag',
            'Propor comparação em paralelo para substituição crítica',
          ],
          [
            'Separating deploy from release explicitly',
            'A ramped release with metrics at each step',
            'Treating flags as debt with a removal date',
            'Remembering the database does not roll back with the flag',
            'Proposing parallel comparison for a critical replacement',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você decidiria avançar de 10% para 50%?',
            'O que fazer quando a feature exige mudança de schema?',
            'Como você evitaria acúmulo de flags antigas?',
          ],
          [
            'How would you decide to go from 10% to 50%?',
            'What do you do when the feature needs a schema change?',
            'How would you stop old flags from accumulating?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-monolith-or-not',
    type: 'true-false',
    title: t('Microsserviços escalam melhor', 'Microservices scale better'),
    categoryId: 'architecture',
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['microservices', 'monolith', 'scaling'],
    minutes: 2,
    related: ['arch-microservices-challenges', 'arch-horizontal-vertical'],
    blocks: [
      prompt(
        t(
          'Verdadeiro ou falso: microsserviços escalam melhor do que um monolito.',
          'True or false: microservices scale better than a monolith.',
        ),
      ),
      choices(false, [
        {
          id: 'true',
          label: t('Verdadeiro', 'True'),
          correct: false,
          why: t(
            'Um monolito sem estado local escala horizontalmente tão bem quanto qualquer serviço: basta subir mais instâncias atrás de um balanceador. O gargalo de escala quase nunca é a aplicação — é o banco de dados, e esse é compartilhado nas duas arquiteturas.',
            'A stateless monolith scales horizontally as well as any service: you add instances behind a load balancer. The scaling bottleneck is almost never the application — it is the database, and that is shared in both architectures.',
          ),
        },
        {
          id: 'false',
          label: t('Falso', 'False'),
          correct: true,
          why: t(
            'Correto. O que microsserviços permitem é escalar **partes diferentes de forma independente** — se só o serviço de busca precisa de dez máquinas, você não precisa replicar o resto. Isso é eficiência de recurso, não capacidade máxima. O benefício principal dos microsserviços é organizacional: times entregando sem coordenar deploy. Responder isso com segurança em entrevista vale mais do que recitar vantagens.',
            'Correct. What microservices allow is scaling **different parts independently** — if only the search service needs ten machines, you do not replicate everything else. That is resource efficiency, not maximum capacity. The main benefit of microservices is organisational: teams shipping without coordinating deploys. Answering this confidently in an interview is worth more than reciting advantages.',
          ),
        },
      ]),
      explain(
        t(
          'A pergunta é uma armadilha comum porque a afirmação é repetida com frequência. O entrevistador quer ver se você distingue **escala** de **escala independente**, e se consegue discordar de um lugar-comum com argumento.',
          'The question is a common trap because the claim gets repeated so often. The interviewer wants to see whether you distinguish **scale** from **independent scale**, and whether you can disagree with a cliché and back it up.',
        ),
        t('Por que perguntam isso', 'Why they ask this'),
      ),
      followUps(
        list(
          [
            'Então qual é o benefício real de microsserviços?',
            'O que impede um monolito de escalar horizontalmente?',
          ],
          [
            'So what is the real benefit of microservices?',
            'What stops a monolith from scaling horizontally?',
          ],
        ),
      ),
    ],
  }),
];
