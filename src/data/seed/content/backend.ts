import type { Content } from '@/domain/types';
import {
  answers,
  code,
  compare,
  content,
  diagram,
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

/** API design, HTTP semantics and the things that break under real traffic. */
export const BACKEND_CONTENT: Content[] = [
  content({
    slug: 'api-secure-rest',
    type: 'interview-question',
    title: t('Como você protegeria uma API REST', 'How would you secure a REST API'),
    categoryId: 'security',
    stackIds: ['rest', 'nodejs'],
    skillIds: ['security', 'api-design'],
    difficulty: 'advanced',
    tags: ['security', 'authentication', 'authorization', 'rate-limiting', 'api'],
    minutes: 6,
    related: ['sec-auth-vs-authz', 'sec-jwt-storage', 'api-rate-limit-distributed'],
    blocks: [
      prompt(
        t(
          'Como você adicionaria segurança a uma API REST?',
          'How would you secure a REST API?',
        ),
      ),
      answers({
        short: t(
          'Eu penso em camadas. Transporte com HTTPS e HSTS. Identidade com autenticação por token curto e refresh. Permissão com autorização checada no servidor, por recurso, nunca só escondendo botão. Entrada com validação de schema e limite de tamanho. Abuso com rate limiting por identidade e por IP. E operação com log sem dado sensível e segredos fora do código. A parte que costuma faltar é autorização no nível do objeto — a pessoa está autenticada, mas está acessando o pedido de outro usuário.',
          'I think in layers. Transport with HTTPS and HSTS. Identity with short-lived token authentication plus refresh. Permission with authorization checked server-side, per resource, never by hiding a button. Input with schema validation and size limits. Abuse with rate limiting per identity and per IP. And operations with logs free of sensitive data and secrets kept out of the code. The part that usually gets missed is object-level authorization — the person is authenticated, but they are reading someone else\'s order.',
        ),
        strong: t(
          'Eu organizo em camadas, da borda para dentro, porque elas falham de formas diferentes.\n\n**Transporte.** HTTPS obrigatório, HSTS, e nada de aceitar downgrade. Sem isso o resto é teatro.\n\n**Autenticação — quem é você.** Access token de vida curta, refresh token rotacionado e com detecção de reuso. Se um refresh token for usado duas vezes, eu invalido a família inteira: é o sinal mais claro de token roubado.\n\n**Autorização — o que você pode.** Essa é a camada onde eu vejo mais falha real. Não basta perguntar "tem um token válido"; tem que perguntar "este usuário pode ver este recurso específico". A vulnerabilidade mais comum em API não é injection, é IDOR: trocar o id na URL e receber o dado de outra pessoa. Eu checo ownership na query, não depois de buscar.\n\n**Entrada.** Schema de validação em tudo que entra, com allowlist e não denylist. Limite de tamanho de body. Cuidado com mass assignment — aceitar um campo `role` que o cliente mandou é como privilégio vaza.\n\n**Abuso.** Rate limit por identidade autenticada e por IP, com limites mais apertados no login e no reset de senha. Em endpoint de login eu combino com backoff progressivo e bloqueio temporário por conta, senão dá para fazer credential stuffing dentro do limite.\n\n**Operação.** Segredos em um gerenciador, não em variável de ambiente commitada. Log sem token, sem senha, sem dado pessoal. CORS com origem explícita, nunca refletindo o header. E auditoria nas ações sensíveis.\n\nSe eu tivesse que escolher duas para fazer primeiro: autorização por objeto e rate limit no login. São as que aparecem em incidente real com mais frequência.',
          'I organise it in layers, from the edge inwards, because they fail in different ways.\n\n**Transport.** HTTPS enforced, HSTS, and no accepting a downgrade. Without that the rest is theatre.\n\n**Authentication — who you are.** Short-lived access token, rotating refresh token with reuse detection. If a refresh token is used twice, I invalidate the whole family: that is the clearest signal a token was stolen.\n\n**Authorization — what you may do.** This is the layer where I see real failures. Asking "is there a valid token" is not enough; you have to ask "may this user see this specific resource". The most common API vulnerability is not injection, it is IDOR: change the id in the URL and get somebody else\'s data. I check ownership in the query, not after fetching.\n\n**Input.** A validation schema on everything coming in, allowlist rather than denylist. Body size limits. And watch for mass assignment — accepting a `role` field the client sent is how privileges leak.\n\n**Abuse.** Rate limiting per authenticated identity and per IP, with tighter limits on login and password reset. On login I combine it with progressive backoff and a temporary per-account lock, otherwise credential stuffing fits comfortably inside the limit.\n\n**Operations.** Secrets in a manager, not in a committed environment file. Logs with no tokens, no passwords, no personal data. CORS with explicit origins, never reflecting the header back. And an audit trail on sensitive actions.\n\nIf I had to pick two to do first: object-level authorization and login rate limiting. Those are the ones that show up in real incidents most often.',
        ),
        deep: t(
          'Duas coisas que elevam a resposta em entrevista sênior.\n\n**Onde o token vive.** Guardar JWT em localStorage significa que qualquer XSS entrega a sessão. Cookie `httpOnly`, `secure`, `SameSite=Lax` tira o token do alcance do JavaScript, mas traz CSRF de volta, então precisa de token anti-CSRF ou `SameSite=Strict` onde der. Não existe opção sem custo; existe a escolha que você consegue defender.\n\n**Segurança que não depende da UI.** A regra que eu repito é: se a proteção só existe porque o botão está escondido, ela não existe. Isso vale para autorização, para filtro de campos na resposta e para regra de negócio. Já vi API devolvendo o objeto inteiro do usuário, incluindo hash de senha, porque o frontend "só mostrava o nome".\n\nE para o desenho geral: API Gateway ou WAF na frente ajudam com volumetria e assinatura de ataque conhecida, mas não substituem autorização dentro da aplicação. Eles filtram o óbvio; o IDOR passa por eles sem esforço, porque é uma requisição perfeitamente bem formada.',
          'Two things that lift this answer at a senior interview.\n\n**Where the token lives.** Keeping a JWT in localStorage means any XSS hands over the session. An `httpOnly`, `secure`, `SameSite=Lax` cookie puts the token out of JavaScript\'s reach, but brings CSRF back, so you need an anti-CSRF token or `SameSite=Strict` where it fits. There is no cost-free option; there is the choice you can defend.\n\n**Security that does not depend on the UI.** The rule I repeat: if the protection exists only because the button is hidden, it does not exist. That goes for authorization, for field filtering in responses, and for business rules. I have seen an API return the entire user object, password hash included, because the frontend "only displayed the name".\n\nAnd for the overall design: an API Gateway or WAF in front helps with volume and known attack signatures, but neither replaces authorization inside the application. They filter the obvious; IDOR walks straight past them, because it is a perfectly well-formed request.',
        ),
      }),
      lookingFor(
        list(
          [
            'Autenticação',
            'Autorização, inclusive no nível do objeto',
            'Validação de entrada',
            'Rate limiting',
            'HTTPS e transporte',
            'Armazenamento e ciclo de vida do token',
            'CORS configurado com origem explícita',
            'Log sem dado sensível',
            'Gestão de segredos',
          ],
          [
            'Authentication',
            'Authorization, including at the object level',
            'Input validation',
            'Rate limiting',
            'HTTPS and transport',
            'Token storage and lifecycle',
            'CORS with explicit origins',
            'Logging without sensitive data',
            'Secrets management',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte prioriza. Listar dez itens é fácil; dizer quais dois você faria primeiro e por quê mostra que você já teve que escolher.',
            'A strong answer prioritises. Listing ten items is easy; saying which two you would do first and why shows you have had to choose.',
          ),
          shallow: t(
            'Uma resposta superficial diz "uso JWT e HTTPS" e para. Isso responde identidade e transporte, e deixa autorização, abuso e entrada de fora.',
            'A shallow answer says "I use JWT and HTTPS" and stops. That covers identity and transport, and leaves out authorization, abuse and input.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Confundir autenticação com autorização',
            'Esquecer autorização por objeto, que é a falha mais comum de verdade',
            'Usar CORS com origem refletida achando que é seguro',
            'Guardar token em localStorage sem discutir o risco de XSS',
            'Listar tecnologias em vez de explicar o que cada camada protege',
          ],
          [
            'Conflating authentication with authorization',
            'Forgetting object-level authorization, which is the most common real failure',
            'Reflecting the origin in CORS and thinking it is safe',
            'Storing tokens in localStorage without discussing the XSS risk',
            'Listing technologies instead of explaining what each layer protects',
          ],
        ),
      ),
      tip(
        t(
          'Essa pergunta é aberta de propósito: o entrevistador quer ver como você organiza o assunto. Comece dizendo "eu penso em camadas" e nomeie as camadas antes de detalhar. A estrutura da resposta vale tanto quanto o conteúdo.',
          'This question is open on purpose: the interviewer wants to see how you organise the topic. Start with "I think about it in layers" and name the layers before going into detail. The structure of the answer counts as much as the content.',
        ),
      ),
      followUps(
        list(
          [
            'Como você evitaria ataque de força bruta no login?',
            'Onde você guardaria o access token no frontend?',
            'Como você trataria a expiração do token?',
            'O que exatamente você colocaria no log de auditoria?',
            'Como você testaria se sua autorização funciona?',
          ],
          [
            'How would you prevent brute-force attacks on login?',
            'Where would you store the access token in the frontend?',
            'How would you handle token expiration?',
            'What exactly would you put in the audit log?',
            'How would you test that your authorization actually works?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-idempotency',
    type: 'interview-question',
    title: t('Idempotência em endpoint de pagamento', 'Idempotency on a payment endpoint'),
    categoryId: 'backend',
    stackIds: ['rest'],
    skillIds: ['api-design', 'architecture'],
    difficulty: 'advanced',
    tags: ['idempotency', 'retry', 'payments', 'api'],
    minutes: 5,
    related: ['api-error-contract', 'arch-queue-exactly-once'],
    blocks: [
      setupText(
        t(
          'O app mobile tem retry automático. Alguns clientes estão sendo cobrados duas vezes.',
          'The mobile app retries automatically. Some customers are being charged twice.',
        ),
      ),
      prompt(
        t(
          'Como você resolveria isso, e o que é idempotência nesse contexto?',
          'How would you fix this, and what does idempotency mean here?',
        ),
      ),
      answers({
        short: t(
          'Idempotência é a garantia de que repetir a mesma requisição produz o mesmo resultado, sem efeito adicional. O caso clássico é exatamente esse: a primeira chamada funcionou, a resposta se perdeu na rede, o cliente tentou de novo e cobrou duas vezes. A solução é uma chave de idempotência gerada pelo cliente, enviada no header, que o servidor grava junto com o resultado. Se a mesma chave chegar de novo, eu devolvo a resposta guardada em vez de processar.',
          'Idempotency is the guarantee that repeating the same request produces the same result, with no extra effect. This is the classic case: the first call worked, the response was lost on the network, the client retried, and the customer got charged twice. The fix is a client-generated idempotency key sent in a header, which the server stores alongside the result. If the same key arrives again, I return the stored response instead of processing.',
        ),
        strong: t(
          'O ponto que organiza a resposta é: o cliente não consegue distinguir "não chegou" de "chegou e a resposta se perdeu". Então ele vai tentar de novo, e está certo em tentar. Quem tem que ser seguro é o servidor.\n\n**A chave vem do cliente**, não do servidor. Precisa ser gerada uma vez pela intenção do usuário — quando ele aperta "pagar" — e reutilizada em todos os retries daquela intenção. Um UUID serve. Se o servidor gerar, não resolve nada, porque cada requisição ganharia uma nova.\n\n**O servidor grava a chave junto com o resultado**, em uma tabela com constraint de unicidade. O fluxo é: tenta inserir a chave; se conflitar, é retry.\n\n**A parte difícil é a requisição em andamento.** Se o retry chega enquanto a primeira ainda está processando, não existe resposta guardada ainda. Aí eu tenho três estados possíveis por chave: em processamento, concluída, falhada. Em processamento, eu respondo 409 e o cliente tenta depois — melhor do que processar duas vezes.\n\n**A chave precisa estar amarrada ao conteúdo.** Se chegar a mesma chave com um corpo diferente, isso é erro do cliente, não retry. Eu guardo um hash do corpo e respondo 422 se divergir. Senão dá para reusar chave de uma cobrança de dez reais para uma de mil.\n\n**Expiração.** Guardo por 24 ou 48 horas. Retry legítimo acontece em segundos ou minutos.\n\nE o método importa: GET, PUT e DELETE já deveriam ser idempotentes por semântica de HTTP. POST não é, e é justamente por isso que criação e pagamento precisam de chave explícita.',
          'The thing that organises the answer is: the client cannot tell "it never arrived" apart from "it arrived and the response was lost". So it will retry, and it is right to retry. The server is what has to be safe.\n\n**The key comes from the client**, not the server. It has to be generated once per user intent — when they press "pay" — and reused across every retry of that intent. A UUID does the job. If the server generates it, nothing is solved, because each request would get a new one.\n\n**The server stores the key with the result**, in a table with a uniqueness constraint. The flow is: try to insert the key; if it conflicts, this is a retry.\n\n**The hard part is the in-flight request.** If the retry arrives while the first one is still processing, there is no stored response yet. So I keep three states per key: in progress, completed, failed. In progress, I answer 409 and the client comes back later — better than processing twice.\n\n**The key has to be bound to the content.** If the same key arrives with a different body, that is a client bug, not a retry. I store a hash of the body and answer 422 if it differs. Otherwise you could reuse the key from a ten-euro charge for a thousand-euro one.\n\n**Expiry.** I keep them for 24 or 48 hours. A legitimate retry happens within seconds or minutes.\n\nAnd the method matters: GET, PUT and DELETE should already be idempotent by HTTP semantics. POST is not, which is exactly why creation and payment need an explicit key.',
        ),
      }),
      code(
        'sql',
        `
create table idempotency_keys (
  key            text primary key,
  request_hash   text        not null,
  status         text        not null check (status in ('in_progress','completed','failed')),
  response_body  jsonb,
  response_status int,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null
);

-- The insert itself is the lock: a conflict means this is a retry.
insert into idempotency_keys (key, request_hash, status, expires_at)
values ($1, $2, 'in_progress', now() + interval '48 hours')
on conflict (key) do nothing
returning key;
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'Entender por que o cliente não pode distinguir os dois casos de falha',
            'Chave gerada pelo cliente, por intenção',
            'Persistir chave com o resultado, com unicidade no banco',
            'Tratar o caso da requisição ainda em andamento',
            'Amarrar a chave ao conteúdo da requisição',
            'Saber quais métodos HTTP já são idempotentes',
          ],
          [
            'Understanding why the client cannot tell the two failure cases apart',
            'A client-generated key, one per intent',
            'Persisting the key with the result, with a database uniqueness constraint',
            'Handling the still-in-flight case',
            'Binding the key to the request content',
            'Knowing which HTTP methods are already idempotent',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte traz o caso da requisição concorrente sem o entrevistador pedir. É o detalhe que separa quem implementou de quem leu sobre.',
            'A strong answer raises the concurrent-request case unprompted. It is the detail that separates having implemented this from having read about it.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Gerar a chave no servidor',
            'Só verificar duplicidade pelos campos do pedido, que podem repetir legitimamente',
            'Ignorar o retry que chega durante o processamento',
            'Guardar a chave para sempre',
          ],
          [
            'Generating the key on the server',
            'Deduplicating on the order fields, which can legitimately repeat',
            'Ignoring the retry that arrives during processing',
            'Keeping keys forever',
          ],
        ),
      ),
      followUps(
        list(
          [
            'O que você responde se a mesma chave vier com corpo diferente?',
            'Como isso interage com a transação do banco?',
            'Qual a diferença entre idempotência e exactly-once?',
          ],
          [
            'What do you answer if the same key arrives with a different body?',
            'How does this interact with the database transaction?',
            'What is the difference between idempotency and exactly-once?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-high-traffic-endpoint',
    type: 'scenario',
    title: t('Endpoint com dez vezes o tráfego normal', 'An endpoint at ten times normal traffic'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'redis'],
    skillIds: ['performance', 'architecture', 'caching'],
    difficulty: 'advanced',
    tags: ['scaling', 'caching', 'load', 'incident'],
    minutes: 6,
    related: ['db-slow-query', 'arch-cache-invalidation', 'api-rate-limit-distributed'],
    blocks: [
      setupText(
        t(
          'São 9h de uma segunda-feira. Um endpoint está recebendo dez vezes o tráfego normal. A latência subiu, o banco está com a CPU em 90%, e o time está no canal do incidente esperando você falar.',
          'It is 9am on a Monday. One endpoint is taking ten times its normal traffic. Latency is up, the database is at 90% CPU, and the team is in the incident channel waiting for you to speak.',
        ),
      ),
      prompt(
        t('O que você faz, e nesta ordem?', 'What do you do, and in what order?'),
      ),
      answers({
        short: t(
          'Primeiro eu estabilizo, depois entendo. Estabilizar: verificar se é tráfego legítimo ou abuso, e se for abuso, rate limit na borda. Se for legítimo, proteger o banco — cache no que for lido repetidamente, e limitar a concorrência para a fila não empurrar o banco para o chão. Só depois de a latência voltar é que eu investigo a causa. Em incidente, a ordem é parar o sangramento, não descobrir por que sangrou.',
          'First I stabilise, then I understand. Stabilising: check whether the traffic is legitimate or abuse, and if it is abuse, rate limit at the edge. If it is legitimate, protect the database — cache whatever is read repeatedly, and cap concurrency so the queue does not push the database over. Only once latency is back do I investigate the cause. In an incident the order is stop the bleeding, not find out why it bled.',
        ),
        strong: t(
          'Eu separo em três fases, e digo isso em voz alta no canal para o time saber onde estamos.\n\n**Fase 1 — entender o que está acontecendo, em dois minutos.** É tráfego legítimo ou ataque? Vem de poucos IPs ou de muitos? É um cliente com retry agressivo? Um gráfico de requisições por origem responde isso rápido. Também olho se o deploy de hoje mexeu nesse caminho — a causa mais comum de "subiu dez vezes" é retry em cima de algo que ficou mais lento, e aí o tráfego é consequência, não causa.\n\n**Fase 2 — estabilizar.** Se for abuso, rate limit na borda e pronto. Se for legítimo:\n\nCache é a alavanca mais rápida, se o dado tolerar. Mesmo 30 segundos de TTL corta quase todo o tráfego repetido em um pico. Com o cuidado de não criar stampede: quando a chave expira sob dez vezes o tráfego, todo mundo vai ao banco ao mesmo tempo. Eu uso lock de recomputação ou stale-while-revalidate.\n\nLimitar concorrência contra o banco. Contraintuitivo mas essencial: com o pool saturado, aumentar o pool piora. Melhor rejeitar rápido com 503 e `Retry-After` do que aceitar tudo e dar timeout em tudo. Falhar rápido mantém parte do serviço em pé.\n\nDegradar com intenção, se existir essa opção. Devolver uma versão mais simples da resposta, desligar um enriquecimento opcional, servir dado levemente velho.\n\nEscalar réplicas ajuda se o gargalo for a aplicação. Se o gargalo é o banco, escalar a aplicação piora — mais processos, mais conexões, mesmo banco.\n\n**Fase 3 — depois que estabilizou.** Aí sim eu vou atrás da query, do índice que falta, do N+1 que só aparece nessa escala. E escrevo o postmortem com a pergunta que importa: o que fez isso passar despercebido até virar incidente?',
          'I split it into three phases, and I say so out loud in the channel so the team knows where we are.\n\n**Phase 1 — understand what is happening, in two minutes.** Is this legitimate traffic or an attack? A few IPs or many? One client retrying aggressively? A requests-by-origin graph answers that fast. I also check whether today\'s deploy touched this path — the most common cause of "traffic went up ten times" is retries on top of something that got slower, in which case the traffic is a consequence, not a cause.\n\n**Phase 2 — stabilise.** If it is abuse, rate limit at the edge and move on. If it is legitimate:\n\nCaching is the fastest lever, if the data tolerates it. Even a 30-second TTL removes most of the repeated traffic in a spike. With one caveat: do not create a stampede. When the key expires under ten times the traffic, everyone hits the database at once. I use a recompute lock or stale-while-revalidate.\n\nCap concurrency against the database. Counterintuitive but essential: with the pool saturated, growing the pool makes it worse. Better to reject fast with a 503 and `Retry-After` than to accept everything and time out on everything. Failing fast keeps part of the service alive.\n\nDegrade on purpose, where that option exists. Return a simpler version of the response, switch off an optional enrichment, serve slightly stale data.\n\nScaling replicas helps if the bottleneck is the application. If the bottleneck is the database, scaling the application makes it worse — more processes, more connections, same database.\n\n**Phase 3 — after it is stable.** Now I go after the query, the missing index, the N+1 that only shows up at this scale. And I write the postmortem around the question that matters: what let this go unnoticed until it became an incident?',
        ),
      }),
      lookingFor(
        list(
          [
            'Separar estabilizar de diagnosticar, e nessa ordem',
            'Perguntar se o tráfego é legítimo antes de escalar',
            'Conhecer cache stampede e como evitar',
            'Saber que escalar a aplicação piora se o gargalo é o banco',
            'Preferir falhar rápido a aceitar tudo e dar timeout',
            'Pensar em degradação intencional',
          ],
          [
            'Separating stabilising from diagnosing, in that order',
            'Asking whether the traffic is legitimate before scaling',
            'Knowing about cache stampede and how to avoid it',
            'Knowing that scaling the app makes it worse when the database is the bottleneck',
            'Preferring to fail fast over accepting everything and timing out',
            'Thinking about deliberate degradation',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte comunica. Dizer "vou narrar o que estou fazendo no canal" mostra que a pessoa já esteve em incidente de verdade, onde metade do problema é o time não saber o que está acontecendo.',
            'A strong answer communicates. Saying "I will narrate what I am doing in the channel" shows someone who has been in a real incident, where half the problem is the team not knowing what is going on.',
          ),
        },
      ),
      warn(
        t(
          'Aumentar o pool de conexões com o banco já saturado é a reação errada mais comum: transforma latência alta em timeout generalizado.',
          'Growing the connection pool while the database is already saturated is the most common wrong reflex: it turns high latency into universal timeouts.',
        ),
      ),
      followUps(
        list(
          [
            'Como você evitaria cache stampede?',
            'Por que aumentar o pool de conexões pode piorar?',
            'O que você mediria para saber se estabilizou?',
            'Como isso teria sido detectado antes de virar incidente?',
          ],
          [
            'How would you avoid a cache stampede?',
            'Why can growing the connection pool make things worse?',
            'What would you measure to know it has stabilised?',
            'How would this have been caught before becoming an incident?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-rate-limit-distributed',
    type: 'architecture',
    title: t('Rate limiting com várias instâncias', 'Rate limiting across many instances'),
    categoryId: 'backend',
    stackIds: ['redis', 'nodejs'],
    skillIds: ['architecture', 'security', 'api-design'],
    difficulty: 'advanced',
    tags: ['rate-limiting', 'redis', 'distributed', 'algorithms'],
    minutes: 5,
    related: ['api-secure-rest', 'api-high-traffic-endpoint'],
    blocks: [
      setupText(
        t(
          'Sua API roda em doze instâncias atrás de um load balancer. O rate limit em memória está deixando passar doze vezes o limite configurado.',
          'Your API runs on twelve instances behind a load balancer. The in-memory rate limit is letting through twelve times the configured limit.',
        ),
      ),
      prompt(
        t(
          'Como você implementaria rate limiting distribuído, e qual algoritmo escolheria?',
          'How would you implement distributed rate limiting, and which algorithm would you pick?',
        ),
      ),
      answers({
        short: t(
          'Precisa de um contador compartilhado, e na prática isso é Redis. O algoritmo que eu escolheria por padrão é sliding window counter: precisão boa o suficiente, custo baixo, e sem o problema do fixed window, que permite o dobro do limite na virada da janela. Token bucket é melhor quando eu quero permitir rajada controlada. E o rate limit tem que devolver headers dizendo o limite, o restante e quando reseta, senão o cliente não tem como cooperar.',
          'You need a shared counter, and in practice that means Redis. The algorithm I would default to is a sliding window counter: accurate enough, cheap, and without the fixed-window problem of allowing double the limit around the boundary. Token bucket is better when I want to allow a controlled burst. And the rate limiter has to return headers stating the limit, the remainder and the reset time, otherwise the client has no way to cooperate.',
        ),
        strong: t(
          'O estado tem que sair do processo. Com doze instâncias, doze contadores locais significam doze vezes o limite. Redis é a escolha natural porque as operações são atômicas e ele é rápido o suficiente para ficar no caminho de toda requisição.\n\nSobre o algoritmo, eu penso em três:\n\n**Fixed window** é o mais simples: um contador por chave e por janela de tempo. O problema é a virada. Com limite de 100 por minuto, o cliente pode mandar 100 no segundo 59 e mais 100 no segundo 61 — 200 em dois segundos. Para proteção contra abuso, isso é uma falha real.\n\n**Sliding window counter** resolve isso de forma barata: mantém o contador da janela atual e o da anterior, e pondera o anterior pela fração de tempo que ainda está dentro da janela. A conta é aproximada, mas o erro é pequeno e o custo é duas chaves. É o meu padrão.\n\n**Token bucket** é o melhor modelo quando rajada é aceitável. O balde enche a uma taxa constante e a requisição consome um token. Permite um pico curto e depois força a média. Para API pública que atende cliente que faz batch, é mais justo.\n\nDetalhes que importam na implementação:\n\nA operação precisa ser atômica — um script Lua ou `INCR` com `EXPIRE` na mesma ida. Se eu ler e depois escrever, tem corrida.\n\nO limite precisa ser por identidade autenticada quando existir, e por IP só como fallback. Limitar só por IP castiga quem está atrás de NAT corporativo.\n\nE eu devolvo `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` e, no 429, `Retry-After`. Sem isso o cliente bem-intencionado não consegue se comportar e vira o problema.\n\nÚltimo ponto: o que fazer se o Redis cair. Fail open — deixa passar — ou fail closed — bloqueia tudo? Para rate limit de abuso eu prefiro fail open com um limite local conservador: perder proteção por alguns minutos é melhor do que derrubar a API inteira porque o Redis piscou.',
          'The state has to leave the process. With twelve instances, twelve local counters mean twelve times the limit. Redis is the natural choice because the operations are atomic and it is fast enough to sit in the path of every request.\n\nOn the algorithm, I think about three:\n\n**Fixed window** is the simplest: one counter per key per time window. The problem is the boundary. With a limit of 100 per minute, a client can send 100 at second 59 and another 100 at second 61 — 200 in two seconds. For abuse protection that is a real hole.\n\n**Sliding window counter** fixes that cheaply: keep the current window\'s counter and the previous one, and weight the previous by the fraction of it still inside the window. The arithmetic is approximate, but the error is small and the cost is two keys. That is my default.\n\n**Token bucket** is the better model when bursts are acceptable. The bucket refills at a constant rate and each request spends a token. It allows a short spike and then enforces the average. For a public API serving clients that batch, it is fairer.\n\nImplementation details that matter:\n\nThe operation has to be atomic — a Lua script, or `INCR` with `EXPIRE` in the same round trip. Read-then-write has a race.\n\nThe limit should key on the authenticated identity where one exists, with IP only as a fallback. Limiting purely by IP punishes everyone behind a corporate NAT.\n\nAnd I return `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and on a 429, `Retry-After`. Without those a well-behaved client cannot behave, and becomes the problem.\n\nLast point: what happens if Redis goes down. Fail open — let traffic through — or fail closed — block everything? For abuse rate limiting I prefer fail open with a conservative local limit: losing protection for a few minutes beats taking the whole API down because Redis blinked.',
        ),
      }),
      compare(
        t('Sliding window counter', 'Sliding window counter'),
        t('Token bucket', 'Token bucket'),
        [
          {
            aspect: t('Rajada', 'Bursts'),
            left: t('Suaviza: rajada conta contra a janela', 'Smooths: a burst counts against the window'),
            right: t('Permite rajada até o tamanho do balde', 'Allows a burst up to the bucket size'),
          },
          {
            aspect: t('Estado por chave', 'State per key'),
            left: t('Dois contadores', 'Two counters'),
            right: t('Tokens e timestamp da última recarga', 'Token count and last refill timestamp'),
          },
          {
            aspect: t('Melhor para', 'Best for'),
            left: t('Proteção contra abuso', 'Abuse protection'),
            right: t('Quota justa de API pública', 'Fair quota on a public API'),
          },
        ],
      ),
      followUps(
        list(
          [
            'O que acontece se o Redis ficar indisponível?',
            'Por que limitar só por IP é problemático?',
            'Como você trataria um cliente que ignora o 429?',
          ],
          [
            'What happens if Redis becomes unavailable?',
            'Why is limiting purely by IP a problem?',
            'How would you handle a client that ignores the 429?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-error-contract',
    type: 'interview-question',
    title: t('Status codes e contrato de erro', 'Status codes and the error contract'),
    categoryId: 'backend',
    stackIds: ['rest'],
    skillIds: ['api-design'],
    difficulty: 'intermediate',
    tags: ['http', 'rest', 'errors', 'api-design'],
    minutes: 4,
    related: ['node-error-handling-api', 'api-versioning'],
    blocks: [
      prompt(
        t(
          'Como você decide entre 400, 401, 403, 404, 409 e 422? E o que a resposta de erro deveria conter?',
          'How do you choose between 400, 401, 403, 404, 409 and 422? And what should the error response contain?',
        ),
      ),
      answers({
        short: t(
          '400 é requisição malformada — JSON quebrado, tipo errado. 401 é "não sei quem você é": faltou credencial ou ela expirou. 403 é "sei quem você é e você não pode". 404 é recurso inexistente, e às vezes eu uso no lugar de 403 de propósito, para não revelar que o recurso existe. 409 é conflito de estado — o recurso mudou, ou já existe. 422 é sintaxe válida mas semântica inválida: o campo veio no formato certo e ainda assim não faz sentido. Na resposta eu mando um código estável, uma mensagem para humano, os detalhes por campo e um id de correlação.',
          '400 is a malformed request — broken JSON, wrong type. 401 is "I do not know who you are": missing or expired credentials. 403 is "I know who you are and you may not". 404 is a non-existent resource, and sometimes I use it in place of 403 on purpose so as not to reveal that the resource exists. 409 is a state conflict — the resource changed, or it already exists. 422 is valid syntax but invalid semantics: the field arrived in the right shape and still makes no sense. In the response I send a stable code, a human message, per-field details, and a correlation id.',
        ),
        strong: t(
          'Eu decido por qual pergunta o status responde.\n\n**400** — não consegui nem interpretar. JSON inválido, content-type errado, parâmetro com tipo impossível.\n\n**401** — falta identidade, ou a identidade não é válida. Token ausente, expirado, assinatura errada. O nome "Unauthorized" no HTTP é confuso: ele significa não autenticado.\n\n**403** — identidade válida, permissão insuficiente. Aqui tem uma decisão de segurança: se responder 403 revela que o recurso existe, e isso for informação sensível, eu respondo 404. Enumerar ids e ver quais dão 403 é um vazamento real.\n\n**404** — não existe, ou você não tem o direito de saber que existe.\n\n**409** — conflito com o estado atual. Recurso já criado com aquele identificador único, ou edição concorrente com versão desatualizada.\n\n**422** — o corpo está bem formado, os tipos estão certos, mas a regra não passa. Data de fim antes da data de início. CPF com dígito verificador inválido. Eu uso 422 para validação de negócio e 400 para validação estrutural; alguns times usam 400 para tudo, e isso também é defensável desde que seja consistente.\n\nSobre o corpo da resposta, o que importa é ter um formato só para a API inteira:\n\nUm `code` estável em string, porque o cliente precisa de algo para comparar que não quebra quando o texto muda. Uma `message` para humano. Um `details` por campo quando for validação, senão o formulário não consegue mostrar o erro no lugar certo. Um `requestId` que também esteja no log do servidor.\n\nO que eu não coloco: stack trace, nome de tabela, query. Isso é informação de arquitetura interna.\n\nE o mais importante: escolher um formato e não desviar. Cliente lidando com três formatos de erro diferentes na mesma API é pior do que um formato imperfeito.',
          'I decide by which question the status answers.\n\n**400** — I could not even parse it. Invalid JSON, wrong content type, a parameter with an impossible type.\n\n**401** — identity is missing or not valid. Token absent, expired, bad signature. The HTTP name "Unauthorized" is confusing: it means unauthenticated.\n\n**403** — valid identity, insufficient permission. There is a security decision here: if answering 403 reveals that the resource exists, and that is sensitive, I answer 404 instead. Enumerating ids and watching which return 403 is a real leak.\n\n**404** — it does not exist, or you have no right to know that it does.\n\n**409** — conflict with current state. A resource already created with that unique identifier, or a concurrent edit against a stale version.\n\n**422** — the body is well formed, the types are right, but a rule fails. End date before start date. A tax id with an invalid check digit. I use 422 for business validation and 400 for structural validation; some teams use 400 for everything, which is also defensible as long as it is consistent.\n\nOn the response body, what matters is having one shape for the whole API:\n\nA stable string `code`, because the client needs something to compare against that does not break when the wording changes. A human `message`. A per-field `details` for validation, otherwise the form cannot show the error in the right place. A `requestId` that also appears in the server log.\n\nWhat I leave out: stack traces, table names, queries. That is internal architecture.\n\nAnd the most important part: pick a shape and stick to it. A client dealing with three different error formats in one API is worse off than with one imperfect format.',
        ),
      }),
      code(
        'json',
        `
{
  "code": "validation_failed",
  "message": "The order could not be created.",
  "details": [
    { "field": "items[0].quantity", "code": "min_value", "message": "Must be at least 1." },
    { "field": "shippingAddress.postcode", "code": "invalid_format", "message": "Not a valid postcode." }
  ],
  "requestId": "01JG9X7K2M4QW8N3"
}
`,
        { phase: 'answer', caption: t('Um formato para a API inteira', 'One shape for the whole API') },
      ),
      lookingFor(
        list(
          [
            'Distinguir 401 de 403 corretamente',
            'Saber quando 404 é a escolha de segurança certa',
            'Diferenciar validação estrutural de validação de negócio',
            'Código de erro estável, separado da mensagem',
            'Detalhes por campo para formulário',
            'Consistência acima de perfeição',
          ],
          [
            'Telling 401 and 403 apart correctly',
            'Knowing when 404 is the right security choice',
            'Separating structural validation from business validation',
            'A stable error code, separate from the message',
            'Per-field details for forms',
            'Consistency over perfection',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como o cliente deveria tratar um 409?',
            'Você usaria 200 com um campo de erro no corpo? Por quê?',
            'Como você versionaria uma mudança no formato de erro?',
          ],
          [
            'How should the client handle a 409?',
            'Would you ever return 200 with an error field in the body? Why?',
            'How would you version a change to the error format?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-pagination',
    type: 'compare',
    title: t('Paginação por offset ou por cursor', 'Offset or cursor pagination'),
    categoryId: 'backend',
    stackIds: ['rest', 'postgres'],
    skillIds: ['api-design', 'databases', 'performance'],
    difficulty: 'intermediate',
    tags: ['pagination', 'api-design', 'performance'],
    minutes: 4,
    related: ['db-slow-query', 'db-index-basics'],
    blocks: [
      prompt(
        t(
          'Quando você usaria paginação por offset e quando usaria por cursor?',
          'When would you use offset pagination and when would you use a cursor?',
        ),
      ),
      answers({
        short: t(
          'Offset é simples e permite pular para uma página arbitrária, mas degrada: `OFFSET 100000` faz o banco percorrer e descartar cem mil linhas. E em lista que muda, o usuário vê item repetido ou perde item entre páginas. Cursor usa a última linha vista como referência, então é estável e tem custo constante — mas não permite pular para a página 50. Eu uso offset em painel administrativo com poucos dados e cursor em qualquer lista grande ou em feed.',
          'Offset is simple and lets you jump to an arbitrary page, but it degrades: `OFFSET 100000` makes the database walk and discard a hundred thousand rows. And on a changing list, the user sees duplicates or misses items between pages. A cursor uses the last row seen as the reference, so it is stable and costs the same at any depth — but you cannot jump to page 50. I use offset on admin panels with small datasets and cursors on any large list or feed.',
        ),
        strong: t(
          'A diferença que importa é o que acontece quando os dados mudam entre as páginas, e o que acontece quando a página é profunda.\n\n**Offset.** `LIMIT 20 OFFSET 40`. O banco precisa produzir as 60 primeiras linhas e jogar 40 fora. Em página 5 ninguém nota; em página 5000, é uma varredura. E se alguém inserir uma linha no topo enquanto o usuário navega, tudo desloca: ele vê o mesmo item de novo na página seguinte. Se alguém deletar, ele pula um item sem saber.\n\n**Cursor.** Em vez de "pule 40", eu digo "me dê os próximos 20 depois deste ponto". A query vira algo como `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20`. Com índice nessas colunas, o banco vai direto ao ponto: custo constante, independente da profundidade. E como a referência é um valor e não uma posição, inserção e deleção não deslocam nada.\n\nO detalhe que costuma dar errado é o desempate. Se eu ordenar só por `created_at` e duas linhas tiverem o mesmo timestamp, o cursor pode pular ou repetir. Por isso o cursor precisa incluir uma coluna única — normalmente o id — e a comparação precisa ser de tupla, não de campos separados com AND.\n\nO custo do cursor é a navegação: não dá para "ir para a página 50", nem mostrar o total de páginas sem um count separado que também é caro. Para feed e para API consumida por máquina, isso não importa. Para um grid administrativo onde o usuário pula para o fim, offset é mais honesto.\n\nEu também codifico o cursor em base64 opaco. Não é segurança, é contrato: deixa claro que o cliente não deve construir nem interpretar o valor, e me permite mudar a chave de ordenação sem quebrar ninguém.',
          'The difference that matters is what happens when the data changes between pages, and what happens when the page is deep.\n\n**Offset.** `LIMIT 20 OFFSET 40`. The database has to produce the first 60 rows and throw 40 away. On page 5 nobody notices; on page 5000 it is a scan. And if someone inserts a row at the top while the user is paging, everything shifts: they see the same item again on the next page. If someone deletes one, they skip an item without knowing.\n\n**Cursor.** Instead of "skip 40", I say "give me the next 20 after this point". The query becomes something like `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20`. With an index on those columns the database seeks straight to the point: constant cost regardless of depth. And because the reference is a value rather than a position, inserts and deletes shift nothing.\n\nThe detail that usually goes wrong is the tiebreaker. Order by `created_at` alone and two rows sharing a timestamp let the cursor skip or repeat. So the cursor has to include a unique column — normally the id — and the comparison has to be a tuple comparison, not separate fields joined with AND.\n\nThe cost of a cursor is navigation: you cannot "go to page 50", nor show a total page count without a separate count that is also expensive. For a feed, or an API consumed by machines, that does not matter. For an admin grid where the user jumps to the end, offset is more honest.\n\nI also encode the cursor as opaque base64. Not for security, for contract: it makes clear the client should neither build nor interpret the value, and it lets me change the sort key later without breaking anyone.',
        ),
      }),
      code(
        'sql',
        `
-- Offset: the database produces 100020 rows to return 20.
select * from orders order by created_at desc limit 20 offset 100000;

-- Cursor: a tuple comparison seeks straight to the position.
select * from orders
where (created_at, id) < ($1, $2)
order by created_at desc, id desc
limit 20;

-- The index that makes the cursor constant-cost.
create index on orders (created_at desc, id desc);
`,
        { phase: 'answer' },
      ),
      compare(
        t('Offset', 'Offset'),
        t('Cursor', 'Cursor'),
        [
          {
            aspect: t('Custo em página profunda', 'Cost on a deep page'),
            left: t('Cresce linearmente', 'Grows linearly'),
            right: t('Constante', 'Constant'),
          },
          {
            aspect: t('Lista que muda', 'Changing list'),
            left: t('Repete e pula itens', 'Repeats and skips items'),
            right: t('Estável', 'Stable'),
          },
          {
            aspect: t('Pular para página N', 'Jumping to page N'),
            left: t('Funciona', 'Works'),
            right: t('Não funciona', 'Does not work'),
          },
          {
            aspect: t('Total de páginas', 'Total page count'),
            left: t('Possível, com count caro', 'Possible, with an expensive count'),
            right: t('Normalmente não exposto', 'Usually not exposed'),
          },
        ],
        t(
          'Feed e API pública: cursor. Grid administrativo pequeno: offset resolve e é mais simples.',
          'Feeds and public APIs: cursor. Small admin grids: offset does the job and is simpler.',
        ),
      ),
      followUps(
        list(
          [
            'Por que o cursor precisa de uma coluna de desempate?',
            'Como você mostraria o total de resultados com cursor?',
            'Por que codificar o cursor em base64?',
          ],
          [
            'Why does the cursor need a tiebreaker column?',
            'How would you show a total result count with cursors?',
            'Why encode the cursor as base64?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-versioning',
    type: 'interview-question',
    title: t('Versionar uma API sem quebrar clientes', 'Versioning an API without breaking clients'),
    categoryId: 'backend',
    stackIds: ['rest'],
    skillIds: ['api-design', 'architecture'],
    difficulty: 'advanced',
    tags: ['versioning', 'api-design', 'compatibility'],
    minutes: 4,
    related: ['api-error-contract'],
    blocks: [
      setupText(
        t(
          'Você precisa mudar o formato de um campo em uma API usada por um app mobile que continua rodando em versões antigas nos celulares das pessoas.',
          'You need to change the shape of a field in an API used by a mobile app that keeps running in old versions on people\'s phones.',
        ),
      ),
      prompt(
        t('Como você faria essa mudança?', 'How would you make that change?'),
      ),
      answers({
        short: t(
          'A primeira pergunta é se dá para não versionar. Adicionar campo é compatível; remover ou mudar o significado de um existente não é. Se der para adicionar o novo campo ao lado do antigo, manter os dois por um tempo e migrar os clientes, isso é mais barato do que qualquer esquema de versão. Quando não dá, eu versiono na URL — `/v2/orders` — porque é explícito, fácil de rotear e fácil de observar. E defino desde o começo quando a v1 morre, senão ela vive para sempre.',
          'The first question is whether I can avoid versioning at all. Adding a field is compatible; removing one or changing the meaning of an existing one is not. If I can add the new field next to the old one, keep both for a while and migrate clients, that is cheaper than any versioning scheme. When I cannot, I version in the URL — `/v2/orders` — because it is explicit, easy to route and easy to observe. And I set the v1 sunset date up front, otherwise it lives forever.',
        ),
        strong: t(
          'Eu trato versionamento como último recurso, não como primeira ferramenta. Cada versão viva é um custo de manutenção permanente.\n\n**Primeiro, tento a mudança compatível.** As regras que eu sigo: adicionar campo é seguro; adicionar valor novo em um enum não é, porque o cliente pode ter um switch que não trata; remover campo quebra; mudar tipo quebra; mudar o significado de um campo mantendo o nome é o pior de todos, porque quebra em silêncio.\n\nPara o caso de mudar o formato de um campo, a jogada é adicionar o novo ao lado, deixar os dois preenchidos, instrumentar quem ainda lê o antigo, e remover quando o uso chegar a zero. Com app mobile isso leva meses, porque tem gente que não atualiza — e é por isso que eu preciso da telemetria por versão de app, senão eu removo às cegas.\n\n**Quando a mudança é incompatível de verdade**, eu prefiro versão na URL. Versão por header é mais purista em REST, mas é pior na prática: mais difícil de testar no navegador, mais difícil de rotear no gateway, mais fácil de esquecer. `/v2/` aparece no log e no dashboard.\n\nO que eu não faço é versionar a API inteira por causa de um recurso. Se só o endpoint de pedidos mudou, só ele ganha v2; o resto continua compartilhado.\n\n**E a política de fim de vida importa mais que o mecanismo.** Anúncio, prazo, header de deprecação nas respostas da v1, contato com quem ainda usa, e uma data. Sem data, você vai manter três versões para sempre, e a complexidade disso acaba sendo maior que a da mudança original.',
          'I treat versioning as a last resort, not a first tool. Every live version is a permanent maintenance cost.\n\n**First, I try to make the change compatible.** The rules I follow: adding a field is safe; adding a new enum value is not, because a client may have a switch that does not handle it; removing a field breaks; changing a type breaks; and changing the meaning of a field while keeping its name is the worst of all, because it breaks silently.\n\nFor changing a field\'s shape, the move is to add the new one alongside, populate both, instrument who still reads the old one, and remove it when usage reaches zero. With a mobile app that takes months, because some people never update — which is exactly why I need per-app-version telemetry, otherwise I am removing blind.\n\n**When the change is genuinely incompatible**, I prefer URL versioning. Header versioning is more REST-purist, but it is worse in practice: harder to test in a browser, harder to route at the gateway, easier to forget. `/v2/` shows up in the log and on the dashboard.\n\nWhat I do not do is version the whole API because of one resource. If only orders changed, only orders gets a v2; the rest stays shared.\n\n**And the sunset policy matters more than the mechanism.** An announcement, a deadline, a deprecation header on v1 responses, outreach to whoever is still on it, and a date. Without a date you will maintain three versions forever, and that complexity ends up larger than the original change.',
        ),
      }),
      lookingFor(
        list(
          [
            'Tentar a mudança compatível antes de versionar',
            'Saber quais mudanças quebram e quais não',
            'Reconhecer que app mobile não atualiza junto',
            'Usar telemetria por versão para decidir quando remover',
            'Ter política de fim de vida com data',
          ],
          [
            'Trying the compatible change before versioning',
            'Knowing which changes break and which do not',
            'Recognising that mobile apps do not update in lockstep',
            'Using per-version telemetry to decide when to remove',
            'Having a sunset policy with a date',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte menciona que adicionar valor em enum pode quebrar cliente. É um detalhe que só aparece para quem já quebrou um.',
            'A strong answer mentions that adding an enum value can break a client. That detail only shows up for someone who has broken one.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você saberia que ninguém usa mais a v1?',
            'Versão na URL ou no header: defenda sua escolha.',
            'Como você comunicaria uma depreciação?',
          ],
          [
            'How would you know nobody uses v1 any more?',
            'URL or header versioning: defend your choice.',
            'How would you communicate a deprecation?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-graphql-vs-rest',
    type: 'compare',
    title: t('GraphQL ou REST', 'GraphQL or REST'),
    categoryId: 'backend',
    stackIds: ['graphql', 'rest'],
    skillIds: ['api-design', 'architecture'],
    difficulty: 'advanced',
    tags: ['graphql', 'rest', 'api-design', 'trade-offs'],
    minutes: 5,
    related: ['api-pagination', 'db-n-plus-one'],
    blocks: [
      prompt(
        t(
          'Quando você escolheria GraphQL em vez de REST? E o que você perde ao escolher?',
          'When would you choose GraphQL over REST? And what do you give up by choosing it?',
        ),
      ),
      answers({
        short: t(
          'GraphQL ganha quando há muitos clientes diferentes com necessidades de dados diferentes sobre o mesmo domínio — especialmente mobile, onde over-fetching custa bateria e dados. O que se perde: cache HTTP deixa de funcionar do jeito simples, autorização fica mais difícil porque cada campo é um ponto de acesso, o problema do N+1 aparece por padrão e precisa de dataloader, e o cliente consegue montar query cara sem querer, então precisa de análise de complexidade. Para uma API interna com poucos consumidores, REST costuma ser a escolha mais barata.',
          'GraphQL wins when you have many different clients with different data needs over the same domain — especially mobile, where over-fetching costs battery and bandwidth. What you give up: HTTP caching stops working the easy way, authorization gets harder because every field is an access point, the N+1 problem appears by default and needs a dataloader, and clients can accidentally compose an expensive query, so you need complexity analysis. For an internal API with a couple of consumers, REST is usually the cheaper choice.',
        ),
        strong: t(
          'Eu escolho pelo formato do problema, não pela tecnologia.\n\n**GraphQL resolve bem** o caso de muitos clientes com necessidades divergentes. Quando web quer vinte campos, mobile quer cinco e o parceiro quer um subconjunto diferente, com REST você acaba criando endpoint por tela ou parâmetro de `fields` — e aí está reimplementando GraphQL mal. Também é bom quando o domínio é um grafo de verdade e o cliente precisa navegar relacionamentos em uma ida só.\n\n**O que se paga:**\n\nCache HTTP some. Em REST, um GET com ETag é cacheado por CDN e por navegador de graça. Em GraphQL tudo é POST em um endpoint só. Dá para resolver com persisted queries e GET, mas é trabalho que em REST você não teria.\n\nAutorização fica mais granular e mais fácil de errar. Em REST eu protejo um endpoint. Em GraphQL, um campo sensível pode ser alcançado por vários caminhos no grafo, e a checagem precisa estar no resolver do campo, não na entrada.\n\nN+1 é o comportamento padrão. Uma query de dez pedidos com o usuário de cada um dispara onze consultas se ninguém colocar dataloader. Não é defeito do GraphQL, é consequência da resolução campo a campo — mas é uma armadilha que todo time cai uma vez.\n\nO cliente controla o custo. Ele pode pedir uma consulta aninhada que explode. Precisa de limite de profundidade, análise de complexidade e timeout.\n\nObservabilidade muda. Todo mundo responde 200 no mesmo endpoint, então o monitoramento por status code e por rota não serve. Precisa instrumentar por operação.\n\n**Minha regra prática:** poucos consumidores e telas estáveis, REST. Muitos consumidores com necessidades divergentes, ou um app mobile onde payload importa muito, GraphQL compensa o custo operacional.',
          'I choose by the shape of the problem, not by the technology.\n\n**GraphQL solves** the case of many clients with diverging needs. When web wants twenty fields, mobile wants five, and a partner wants a different subset, REST pushes you into an endpoint per screen or a `fields` parameter — at which point you are reimplementing GraphQL badly. It is also good when the domain genuinely is a graph and the client needs to walk relationships in one round trip.\n\n**What you pay:**\n\nHTTP caching disappears. In REST, a GET with an ETag is cached by the CDN and the browser for free. In GraphQL everything is a POST to one endpoint. You can recover it with persisted queries and GET, but that is work you would not have had.\n\nAuthorization gets more granular and easier to get wrong. In REST I protect an endpoint. In GraphQL, a sensitive field can be reached through several paths in the graph, and the check has to live in the field resolver rather than at the entrance.\n\nN+1 is the default behaviour. A query for ten orders with each one\'s user fires eleven queries unless someone adds a dataloader. That is not a GraphQL defect, it is a consequence of field-by-field resolution — but it is a trap every team falls into once.\n\nThe client controls the cost. It can ask for a nested query that explodes. You need depth limits, complexity analysis and timeouts.\n\nObservability changes. Everything answers 200 on the same endpoint, so monitoring by status code and route stops working. You have to instrument per operation.\n\n**My rule of thumb:** few consumers and stable screens, REST. Many consumers with diverging needs, or a mobile app where payload size really matters, GraphQL earns its operational cost.',
        ),
      }),
      tradeOff([
        {
          option: t('REST', 'REST'),
          pros: list(
            ['Cache HTTP de graça', 'Observabilidade por rota e status', 'Autorização por endpoint'],
            ['HTTP caching for free', 'Observability by route and status', 'Authorization per endpoint'],
          ),
          cons: list(
            ['Over-fetching e under-fetching', 'Endpoint por tela quando os clientes divergem'],
            ['Over-fetching and under-fetching', 'An endpoint per screen once clients diverge'],
          ),
        },
        {
          option: t('GraphQL', 'GraphQL'),
          pros: list(
            ['Cliente pede exatamente o que precisa', 'Uma ida para navegar relacionamentos', 'Schema como contrato tipado'],
            ['The client asks for exactly what it needs', 'One round trip to walk relationships', 'The schema as a typed contract'],
          ),
          cons: list(
            ['Cache mais difícil', 'N+1 por padrão', 'Custo controlado pelo cliente', 'Autorização por campo'],
            ['Harder caching', 'N+1 by default', 'Cost controlled by the client', 'Field-level authorization'],
          ),
        },
      ]),
      followUps(
        list(
          [
            'Como um dataloader resolve o N+1?',
            'Como você limitaria o custo de uma query?',
            'Como você faria cache em GraphQL?',
          ],
          [
            'How does a dataloader solve N+1?',
            'How would you cap the cost of a query?',
            'How would you cache in GraphQL?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-testing-strategy',
    type: 'interview-question',
    title: t('O que você testa, e o que não testa', 'What you test, and what you do not'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'typescript'],
    skillIds: ['testing', 'architecture'],
    difficulty: 'intermediate',
    tags: ['testing', 'strategy', 'quality'],
    minutes: 4,
    related: ['js-dependency-injection'],
    blocks: [
      prompt(
        t(
          'Como você estrutura os testes de um serviço backend? E o que você decide não testar?',
          'How do you structure tests for a backend service? And what do you decide not to test?',
        ),
      ),
      answers({
        short: t(
          'Eu concentro no teste que roda o caso de uso de ponta a ponta com as bordas substituídas: o handler, a regra de negócio e o banco de verdade em container, com integrações externas em fake. É onde está a melhor relação entre confiança e custo. Teste unitário eu uso para lógica com muitos casos — cálculo, parser, máquina de estado. E-mail sendo enviado de verdade, biblioteca de terceiro, e getter trivial eu não testo. O que eu não testo mesmo é código que só repassa: um teste que só verifica que o mock foi chamado não prova nada e trava refatoração.',
          'I concentrate on the test that runs the use case end to end with the edges swapped out: the handler, the business rule and a real database in a container, with external integrations faked. That is where the confidence-to-cost ratio is best. Unit tests I use for logic with many cases — calculations, parsers, state machines. Actually sending email, third-party libraries and trivial getters I do not test. What I really avoid is testing pass-through code: a test that only checks a mock was called proves nothing and blocks refactoring.',
        ),
        strong: t(
          'Eu penso em termos de "que mudança eu quero que quebre o teste", e não em pirâmide.\n\n**A camada onde eu invisto mais** é o teste de caso de uso com banco real em container. Sobe o Postgres, roda a migration, executa o caso de uso, verifica o efeito no banco. Isso pega o que realmente quebra em produção: constraint, transação, query errada, regra de negócio. E resiste a refatoração, porque testa comportamento e não estrutura.\n\n**Teste unitário puro** eu reservo para lógica com muitos ramos. Cálculo de imposto, parser, máquina de estado, regra de desconto. Onde o valor está em cobrir quinze casos rapidinho.\n\n**Teste de contrato** quando existe integração entre serviços de times diferentes. É mais barato que e2e e pega o que importa: mudança de formato.\n\n**E2E de verdade**, com tudo de pé, eu mantenho no mínimo — os dois ou três fluxos que se quebrarem significam empresa parada. São lentos e instáveis; muitos deles e o time para de confiar na suíte, que é o pior resultado possível.\n\n**O que eu não testo:**\n\nCódigo que só repassa. Um controller que chama um serviço e devolve não precisa de teste próprio.\n\nBiblioteca de terceiro. Não é meu trabalho testar o driver do banco.\n\nMock verificando mock. Se o teste afirma que `repository.save` foi chamado uma vez, ele não prova que o pedido foi salvo. Prefiro verificar o estado resultante.\n\nE a coisa mais importante que eu falaria: cobertura não é meta. Cem por cento de cobertura com asserção fraca é pior do que sessenta por cento nos caminhos que importam, porque dá confiança falsa e custa o dobro para manter.',
          'I think in terms of "which change do I want to break the test", not in terms of a pyramid.\n\n**The layer I invest most in** is the use-case test with a real database in a container. Start Postgres, run the migrations, execute the use case, assert the effect in the database. That catches what actually breaks in production: constraints, transactions, a wrong query, a business rule. And it survives refactoring, because it tests behaviour rather than structure.\n\n**Pure unit tests** I reserve for logic with many branches. Tax calculation, a parser, a state machine, a discount rule. Where the value is covering fifteen cases quickly.\n\n**Contract tests** when there is an integration between services owned by different teams. Cheaper than e2e and catches what matters: a shape change.\n\n**Real e2e**, with everything running, I keep to a minimum — the two or three flows whose breakage means the business has stopped. They are slow and flaky; too many of them and the team stops trusting the suite, which is the worst possible outcome.\n\n**What I do not test:**\n\nPass-through code. A controller that calls a service and returns its result does not need its own test.\n\nThird-party libraries. Testing the database driver is not my job.\n\nMocks verifying mocks. If the test asserts `repository.save` was called once, it has not proved the order was saved. I would rather assert the resulting state.\n\nAnd the most important thing I would say: coverage is not a target. A hundred percent coverage with weak assertions is worse than sixty percent on the paths that matter, because it gives false confidence and costs twice as much to maintain.',
        ),
      }),
      lookingFor(
        list(
          [
            'Justificar a estratégia pelo risco, não por proporção de pirâmide',
            'Testar comportamento em vez de estrutura',
            'Usar banco real em container em vez de mockar o repositório',
            'Saber nomear o que não vale a pena testar',
            'Tratar cobertura como sintoma e não como meta',
          ],
          [
            'Justifying the strategy by risk rather than by pyramid proportions',
            'Testing behaviour rather than structure',
            'Using a real database in a container instead of mocking the repository',
            'Being able to name what is not worth testing',
            'Treating coverage as a symptom rather than a target',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você lidaria com um teste instável?',
            'Quando um mock é a ferramenta certa?',
            'Como você testaria código que depende de tempo?',
          ],
          [
            'How would you deal with a flaky test?',
            'When is a mock the right tool?',
            'How would you test code that depends on time?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-graceful-shutdown',
    type: 'find-the-bug',
    title: t('Requisições perdidas em todo deploy', 'Requests lost on every deploy'),
    categoryId: 'devops',
    stackIds: ['nodejs', 'kubernetes', 'docker'],
    skillIds: ['devops', 'nodejs', 'observability'],
    difficulty: 'advanced',
    tags: ['deploy', 'graceful-shutdown', 'kubernetes', 'availability'],
    minutes: 4,
    related: ['node-error-handling-api'],
    blocks: [
      setupText(
        t(
          'A cada deploy aparecem alguns erros 502 no monitoramento, sempre no mesmo minuto em que os pods são substituídos. Ninguém investigou porque "é só durante o deploy".',
          'Every deploy produces a handful of 502s in monitoring, always in the same minute the pods are replaced. Nobody has investigated because "it is only during the deploy".',
        ),
      ),
      prompt(
        t('O que está acontecendo e como você corrigiria?', 'What is happening and how would you fix it?'),
      ),
      code(
        'javascript',
        `
const server = app.listen(3000);

process.on("SIGTERM", () => {
  server.close();
  process.exit(0);
});
`,
      ),
      answers({
        short: t(
          'O processo está morrendo com requisições ainda em voo. O `server.close` para de aceitar conexões novas mas é assíncrono — ele só termina quando as conexões atuais fecham. Chamar `process.exit(0)` na linha seguinte mata tudo imediatamente, inclusive as requisições que estavam sendo processadas. O certo é esperar o callback do close, com um timeout de segurança, e fechar as dependências antes de sair.',
          'The process is dying with requests still in flight. `server.close` stops accepting new connections but it is asynchronous — it only finishes once the current connections close. Calling `process.exit(0)` on the next line kills everything immediately, including requests that were being processed. The fix is waiting for the close callback, with a safety timeout, and closing dependencies before exiting.',
        ),
        strong: t(
          'Tem dois problemas: um no código e um no ciclo de vida do deploy.\n\n**No código**, `server.close()` recebe um callback e é justamente ele que indica que as conexões terminaram. Chamar `process.exit(0)` logo depois é dizer "pare de aceitar conexões e morra agora", e quem estava no meio de uma requisição recebe conexão cortada — que no load balancer vira 502.\n\nA correção é esperar, mas com limite, porque uma conexão keep-alive pode ficar aberta indefinidamente:\n\n```\nprocess.on("SIGTERM", async () => {\n  server.close(async () => {\n    await db.end();\n    await queue.close();\n    process.exit(0);\n  });\n  setTimeout(() => process.exit(1), 15000).unref();\n});\n```\n\nE fechar as dependências importa: encerrar o pool do banco e o consumidor da fila evita conexão pendurada e mensagem processada pela metade.\n\n**No ciclo de vida**, tem uma parte que o código sozinho não resolve. Quando o Kubernetes manda SIGTERM, ele remove o pod dos endpoints do service ao mesmo tempo — mas a propagação dessa remoção para os proxies não é instantânea. Existe uma janela de um a dois segundos em que o pod já recebeu SIGTERM e ainda está recebendo tráfego novo.\n\nPor isso a sequência correta é: no SIGTERM, primeiro marcar o readiness probe como falho, esperar alguns segundos para a remoção propagar, e só então parar de aceitar conexões. Um `preStop` hook com um sleep curto resolve, e é a parte que quase todo mundo esquece.\n\nE eu levantaria a premissa: "é só durante o deploy" significa que o time normalizou erro em produção. Se o deploy é diário, isso é erro diário para algum usuário real.',
          'There are two problems: one in the code and one in the deploy lifecycle.\n\n**In the code**, `server.close()` takes a callback, and that callback is exactly what signals the connections have finished. Calling `process.exit(0)` right after says "stop accepting connections and die now", and anyone mid-request gets their connection cut — which the load balancer reports as a 502.\n\nThe fix is waiting, but with a bound, because a keep-alive connection can stay open indefinitely:\n\n```\nprocess.on("SIGTERM", async () => {\n  server.close(async () => {\n    await db.end();\n    await queue.close();\n    process.exit(0);\n  });\n  setTimeout(() => process.exit(1), 15000).unref();\n});\n```\n\nAnd closing dependencies matters: shutting the database pool and the queue consumer avoids hung connections and half-processed messages.\n\n**In the lifecycle**, there is a part code alone cannot fix. When Kubernetes sends SIGTERM, it removes the pod from the service endpoints at the same time — but propagating that removal to the proxies is not instant. There is a one-to-two second window where the pod has received SIGTERM and is still being sent new traffic.\n\nSo the correct sequence is: on SIGTERM, first fail the readiness probe, wait a few seconds for the removal to propagate, and only then stop accepting connections. A `preStop` hook with a short sleep handles it, and that is the part almost everyone forgets.\n\nAnd I would challenge the premise: "it is only during the deploy" means the team has normalised errors in production. If deploys are daily, that is a daily error for some real user.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber que server.close é assíncrono',
            'Adicionar timeout de segurança para keep-alive',
            'Fechar banco e fila antes de sair',
            'Conhecer a janela de propagação do readiness',
            'Questionar a premissa de que erro no deploy é aceitável',
          ],
          [
            'Knowing server.close is asynchronous',
            'Adding a safety timeout for keep-alive connections',
            'Closing the database and queue before exiting',
            'Knowing about the readiness propagation window',
            'Challenging the premise that deploy-time errors are acceptable',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Qual a diferença entre liveness e readiness probe?',
            'Como você trataria um job em execução no momento do SIGTERM?',
            'Por que o timeout precisa de unref?',
          ],
          [
            'What is the difference between a liveness and a readiness probe?',
            'How would you handle a job running at the moment of SIGTERM?',
            'Why does the timeout need unref?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'api-observability-3am',
    type: 'interview-question',
    title: t('O que você instrumenta antes de precisar', 'What you instrument before you need it'),
    categoryId: 'backend',
    stackIds: ['nodejs'],
    skillIds: ['observability', 'devops'],
    difficulty: 'advanced',
    tags: ['observability', 'logging', 'metrics', 'tracing'],
    minutes: 5,
    related: ['api-high-traffic-endpoint', 'js-memory-leak-node'],
    blocks: [
      prompt(
        t(
          'Você é acordado às três da manhã porque a API está lenta. O que você espera encontrar já instrumentado?',
          'You get paged at 3am because the API is slow. What do you expect to find already instrumented?',
        ),
      ),
      answers({
        short: t(
          'Eu quero conseguir responder três perguntas sem fazer deploy: o que está lento, para quem, e desde quando. Isso pede latência por endpoint em percentis — p50, p95, p99, nunca média —, taxa de erro por endpoint, e alguma forma de correlacionar uma requisição do começo ao fim. Além disso, saturação: pool de conexão, event loop lag, memória. E log estruturado com id de correlação, senão não dá para seguir uma requisição entre serviços.',
          'I want to answer three questions without shipping anything: what is slow, for whom, and since when. That needs per-endpoint latency in percentiles — p50, p95, p99, never the average — error rate per endpoint, and some way to correlate one request from end to end. On top of that, saturation: connection pool, event loop lag, memory. And structured logs with a correlation id, otherwise you cannot follow a request across services.',
        ),
        strong: t(
          'Eu organizo pelo que a pessoa de plantão precisa decidir.\n\n**Primeiro, é global ou localizado?** Latência por endpoint em percentis responde. Média não serve para nada aqui: se 95% das requisições respondem em 50ms e 5% em 10 segundos, a média fica boa e o cliente está furioso. p99 é onde o problema aparece primeiro.\n\n**Segundo, é a aplicação ou uma dependência?** Preciso de latência das chamadas externas separada da latência do meu processamento. Se o p99 do banco subiu junto, o problema não está no meu código. Isso normalmente vem de tracing distribuído — um trace mostra onde os segundos foram gastos, em vez de eu adivinhar.\n\n**Terceiro, o que mudou?** Deploy marcado no gráfico. A correlação entre "subiu às 2h47" e "deploy às 2h45" resolve a maioria dos incidentes em trinta segundos.\n\n**Saturação** é a categoria que mais falta na prática. Pool de conexões esgotado aparece como latência alta com CPU baixa, e sem essa métrica você procura no lugar errado por uma hora. Em Node eu incluiria event loop lag, que é a métrica mais reveladora e a menos coletada.\n\n**Log estruturado com id de correlação.** Log em JSON, com id que atravessa os serviços, e que também volta na resposta de erro para o cliente. Sem isso, investigar um ticket de suporte é impossível.\n\nO que eu evitaria: log em texto livre, alta cardinalidade em label de métrica — id de usuário como label explode o custo —, e alerta em cima de coisa que não exige ação. Alerta que dispara toda semana e é ignorado é pior que não ter alerta, porque treina o time a ignorar.\n\nE o alerta em si eu prefiro em cima de sintoma do usuário — latência e taxa de erro — e não de causa. Alerta de CPU alta acorda alguém por algo que talvez esteja funcionando bem.',
          'I organise it by what the person on call needs to decide.\n\n**First, is it global or localised?** Per-endpoint latency in percentiles answers that. The average is useless here: if 95% of requests answer in 50ms and 5% in 10 seconds, the average looks fine and the customer is furious. p99 is where the problem shows up first.\n\n**Second, is it the application or a dependency?** I need external call latency separated from my own processing latency. If the database p99 rose at the same time, the problem is not my code. That usually comes from distributed tracing — a trace shows where the seconds went, instead of me guessing.\n\n**Third, what changed?** Deploy markers on the graph. The correlation between "it rose at 02:47" and "we deployed at 02:45" resolves most incidents in thirty seconds.\n\n**Saturation** is the category most often missing in practice. An exhausted connection pool looks like high latency with low CPU, and without that metric you search in the wrong place for an hour. In Node I would add event loop lag, the most revealing metric and the least collected.\n\n**Structured logs with a correlation id.** JSON logs, an id that travels across services, and that also comes back in the error response to the client. Without it, investigating a support ticket is impossible.\n\nWhat I would avoid: free-text logs, high cardinality in metric labels — a user id as a label explodes the cost — and alerts on things that need no action. An alert that fires weekly and gets ignored is worse than no alert, because it trains the team to ignore alerts.\n\nAnd for the alert itself I prefer user-facing symptoms — latency and error rate — over causes. A high-CPU alert wakes someone for something that may be working perfectly well.',
        ),
      }),
      lookingFor(
        list(
          [
            'Percentis em vez de média, e saber por quê',
            'Separar latência própria da latência de dependência',
            'Marcar deploys no gráfico',
            'Métricas de saturação, não só de tráfego e erro',
            'Id de correlação atravessando serviços e resposta',
            'Alertar em sintoma, não em causa',
          ],
          [
            'Percentiles rather than averages, and knowing why',
            'Separating own latency from dependency latency',
            'Deploy markers on graphs',
            'Saturation metrics, not just traffic and errors',
            'A correlation id crossing services and responses',
            'Alerting on symptoms rather than causes',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte fala sobre alerta que não exige ação. É um sinal claro de quem já ficou de plantão.',
            'A strong answer talks about alerts that require no action. It is a clear signal of someone who has actually been on call.',
          ),
        },
      ),
      diagram(
        t('As três perguntas das três da manhã', 'The three 3am questions'),
        [
          { id: 'q1', label: t('O que está lento?', 'What is slow?'), col: 0, row: 0, tone: 'accent' },
          { id: 'm1', label: t('Latência p99 por endpoint', 'p99 latency per endpoint'), col: 1, row: 0 },
          { id: 'q2', label: t('É meu ou da dependência?', 'Mine or a dependency?'), col: 0, row: 1, tone: 'accent' },
          { id: 'm2', label: t('Trace distribuído', 'Distributed trace'), col: 1, row: 1 },
          { id: 'q3', label: t('Desde quando?', 'Since when?'), col: 0, row: 2, tone: 'accent' },
          { id: 'm3', label: t('Marcador de deploy', 'Deploy marker'), col: 1, row: 2 },
        ],
        [
          { from: 'q1', to: 'm1' },
          { from: 'q2', to: 'm2' },
          { from: 'q3', to: 'm3' },
        ],
      ),
      followUps(
        list(
          [
            'Por que percentil e não média?',
            'O que é cardinalidade e por que ela custa caro?',
            'Em que você alertaria, e em que não alertaria?',
          ],
          [
            'Why percentiles and not averages?',
            'What is cardinality and why is it expensive?',
            'What would you alert on, and what would you not?',
          ],
        ),
      ),
    ],
  }),
];
