import type { Content } from '@/domain/types';
import {
  answers,
  choices,
  code,
  content,
  followUps,
  list,
  lookingFor,
  mistakes,
  note,
  prompt,
  t,
  tip,
  trueFalse,
  warn,
} from '../authoring';

/**
 * The web platform underneath every backend answer: HTTP semantics, status
 * codes, caching and CORS. The roadmap treats these as fundamentals, and
 * interviews treat them as the questions where a confident wrong answer is
 * very visible.
 */
export const WEB_CONTENT: Content[] = [
  content({
    slug: 'web-http-learn',
    type: 'concept',
    kind: 'learn',
    title: t('HTTP como contrato, não como sintaxe', 'HTTP as a contract, not as syntax'),
    categoryId: 'backend',
    topic: 'http',
    stackIds: ['rest', 'nodejs'],
    sourceIds: ['rfc-9110', 'mdn-http-status'],
    skillIds: ['api-design'],
    difficulty: 'intermediate',
    tags: ['http', 'rest', 'idempotência'],
    minutes: 4,
    related: ['web-status-choice', 'api-idempotency-learn'],
    blocks: [
      note(
        t(
          'Os métodos HTTP carregam promessas, e é por isso que proxies, CDNs, navegadores e bibliotecas se comportam diferente com cada um. Quem trata tudo como "POST resolve" perde essas garantias de graça.',
          'HTTP methods carry promises, which is why proxies, CDNs, browsers and libraries behave differently with each one. Treating everything as "POST works" gives those guarantees away for free.',
        ),
      ),
      note(
        t(
          '**Seguro** significa que não muda estado: `GET` e `HEAD`. Por isso um crawler pode chamá-los à vontade — e por isso uma ação destrutiva atrás de `GET` é um problema esperando um pré-carregador de link.\n\n**Idempotente** significa que repetir tem o mesmo efeito de fazer uma vez: `GET`, `PUT`, `DELETE`. `POST` não é, e é exatamente por isso que ele é o método que precisa de chave de idempotência.',
          '**Safe** means it does not change state: `GET` and `HEAD`. That is why a crawler can call them freely — and why a destructive action behind `GET` is a problem waiting for a link prefetcher.\n\n**Idempotent** means repeating has the same effect as doing it once: `GET`, `PUT`, `DELETE`. `POST` is not, which is exactly why it is the method that needs an idempotency key.',
        ),
        t('Seguro e idempotente', 'Safe and idempotent'),
      ),
      note(
        t(
          'Os status existem para o cliente decidir o que fazer sem ler o corpo. `400` é "você mandou errado, não repita igual"; `401` é "não sei quem você é"; `403` é "sei quem você é e não pode"; `404` é "não existe (ou não te conto)"; `409` é "conflito de estado"; `422` é "entendi o formato, mas os dados não fecham"; `429` é "devagar, e olhe o `Retry-After`". Do lado 5xx, `500` é culpa sua e `503` é "tente de novo em instantes".',
          'Status codes exist so the client can decide what to do without reading the body. `400` is "you sent it wrong, do not repeat it as is"; `401` is "I do not know who you are"; `403` is "I know and you may not"; `404` is "not there (or I will not say)"; `409` is "state conflict"; `422` is "I understood the shape, the data does not add up"; `429` is "slow down, and read `Retry-After`". On the 5xx side, `500` is your fault and `503` is "try again shortly".',
        ),
        t('Status como instrução', 'Status as instruction'),
      ),
      code(
        'http',
        `
POST /orders            201 Created + Location: /orders/9f1c
GET  /orders/9f1c       200 OK + ETag: "v3"
GET  /orders/9f1c       304 Not Modified      (If-None-Match: "v3")
PUT  /orders/9f1c       409 Conflict          (If-Match não bate: alguém editou antes)
`,
      ),
      note(
        t(
          '`ETag` mais `If-None-Match` economiza banda e serve de trava otimista: o cliente diz qual versão viu, e o servidor recusa a escrita se mudou no meio. É a resposta pronta para "como você evita que dois usuários sobrescrevam um ao outro?" sem inventar campo de versão na mão.',
          '`ETag` plus `If-None-Match` saves bandwidth and doubles as optimistic locking: the client says which version it saw, and the server refuses the write if it moved. It is the ready answer to "how do you stop two users overwriting each other?" without hand-rolling a version field.',
        ),
        t('ETag', 'ETag'),
      ),
      note(
        t(
          '`Cache-Control` é do servidor para todo mundo no caminho. `no-store` é "não guarde em lugar nenhum" (use em dado sensível). `private` é "só o navegador". `max-age` é quanto tempo vale sem perguntar. `stale-while-revalidate` entrega o velho e atualiza atrás — é o que faz uma API parecer instantânea sem mentir sobre frescor.',
          '`Cache-Control` is the server talking to everyone on the path. `no-store` means "do not keep this anywhere" (use it for sensitive data). `private` means "browser only". `max-age` is how long it is valid without asking. `stale-while-revalidate` serves the old copy and refreshes behind it — which is what makes an API feel instant without lying about freshness.',
        ),
        t('Cache-Control', 'Cache-Control'),
      ),
    ],
  }),

  content({
    slug: 'web-http-tf',
    type: 'true-false',
    kind: 'decision',
    title: t('Verdadeiro ou falso: HTTP', 'True or false: HTTP'),
    categoryId: 'backend',
    topic: 'http',
    stackIds: ['rest'],
    sourceIds: ['rfc-9110'],
    skillIds: ['api-design'],
    difficulty: 'beginner',
    tags: ['http', 'status'],
    minutes: 2,
    related: ['web-http-learn'],
    blocks: [
      trueFalse([
        {
          statement: t(
            'Um `PUT` repetido com o mesmo corpo deixa o recurso no mesmo estado que uma chamada só.',
            'A repeated `PUT` with the same body leaves the resource in the same state as a single call.',
          ),
          answer: true,
          why: t(
            'Sim, e é isso que torna `PUT` idempotente: ele descreve o estado final, não uma operação incremental. Por isso retry de `PUT` é seguro e retry de `POST` não é.',
            'Yes, and that is what makes `PUT` idempotent: it describes the final state, not an incremental operation. That is why retrying `PUT` is safe and retrying `POST` is not.',
          ),
        },
        {
          statement: t(
            'Devolver `200` com `{"error": "...")` no corpo é aceitável desde que o cliente saiba interpretar.',
            'Returning `200` with `{"error": "..."}` in the body is fine as long as the client knows how to read it.',
          ),
          answer: false,
          why: t(
            'Não. O status é lido por quem não conhece o seu corpo: proxy, CDN, biblioteca de retry, monitoramento. Com `200`, uma falha é contabilizada como sucesso e nenhum alerta dispara — o custo aparece no dia do incidente.',
            'No. The status is read by things that do not know your body: proxies, CDNs, retry libraries, monitoring. With `200`, a failure is counted as a success and no alert fires — the cost shows up on incident day.',
          ),
        },
        {
          statement: t(
            '`401` e `403` podem ser usados de forma intercambiável.',
            '`401` and `403` can be used interchangeably.',
          ),
          answer: false,
          why: t(
            'Não. `401` diz "autentique-se" e o cliente sabe que renovar o token pode resolver. `403` diz "autenticado e sem permissão", e renovar token não muda nada. Trocar os dois faz o cliente entrar em loop de refresh.',
            'No. `401` says "authenticate" and the client knows refreshing the token may fix it. `403` says "authenticated and not allowed", where refreshing changes nothing. Swapping them puts clients in a refresh loop.',
          ),
        },
      ]),
    ],
  }),

  content({
    slug: 'web-status-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Que status devolver aqui', 'Which status to return here'),
    categoryId: 'backend',
    topic: 'http',
    stackIds: ['rest', 'nodejs'],
    sourceIds: ['mdn-http-status'],
    skillIds: ['api-design'],
    difficulty: 'intermediate',
    tags: ['http', 'status', 'api'],
    minutes: 3,
    related: ['web-http-learn', 'api-error-contract'],
    blocks: [
      prompt(
        t(
          'O cliente manda `POST /orders` com um cupom que existe mas já foi usado por ele. Qual resposta você devolve?',
          'A client sends `POST /orders` with a coupon that exists but they have already used. What do you return?',
        ),
      ),
      choices(false, [
        {
          id: '400',
          label: t('`400 Bad Request` com a mensagem de cupom usado.', '`400 Bad Request` with a coupon-used message.'),
          correct: false,
          quality: 'partial',
          why: t(
            'É a resposta mais comum e não está longe. O problema é que `400` diz "a requisição está malformada", e esta está perfeitamente formada — o que falhou foi uma regra de negócio contra o estado atual. Funciona, mas dá ao cliente menos informação do que poderia.',
            'It is the most common answer and it is not far off. The problem is that `400` says "the request is malformed", and this one is perfectly formed — what failed was a business rule against current state. It works, but it tells the client less than it could.',
          ),
        },
        {
          id: '409',
          label: t(
            '`409 Conflict`, com um código de erro próprio no corpo.',
            '`409 Conflict`, with a domain error code in the body.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'O pedido é válido; o que conflita é o estado (este cupom, este cliente, já usado). `409` transmite exatamente isso, e o código no corpo — `coupon_already_used` — deixa o cliente tratar sem parsear mensagem em português. Retentar igual não vai adiantar, e o status já diz isso.',
            'The request is valid; what conflicts is state (this coupon, this customer, already used). `409` conveys exactly that, and a body code — `coupon_already_used` — lets the client handle it without parsing a human message. Retrying as-is will not help, and the status already says so.',
          ),
        },
        {
          id: '422',
          label: t('`422 Unprocessable Content`.', '`422 Unprocessable Content`.'),
          correct: false,
          quality: 'partial',
          why: t(
            'Defensável: o corpo é sintaticamente válido e semanticamente rejeitado. Muitas APIs usam `422` para validação de campo e `409` para conflito de estado; o importante é o time escolher uma convenção e documentá-la. Sem convenção, cada endpoint responde diferente para o mesmo tipo de erro.',
            'Defensible: the body is syntactically valid and semantically rejected. Many APIs use `422` for field validation and `409` for state conflicts; what matters is that the team picks one convention and documents it. Without one, every endpoint answers differently for the same class of error.',
          ),
        },
        {
          id: '500',
          label: t('`500`, porque a operação não pôde ser concluída.', '`500`, because the operation could not complete.'),
          correct: false,
          quality: 'incorrect',
          why: t(
            '`5xx` significa que o servidor falhou. Aqui o servidor funcionou perfeitamente e recusou por regra. Além de confundir o cliente, isso polui a taxa de erro e acorda o oncall por um cupom.',
            '`5xx` means the server failed. Here the server worked perfectly and refused by rule. Beyond confusing the client, it pollutes the error rate and wakes the on-call over a coupon.',
          ),
        },
      ]),
      tip(
        t(
          'Dizer "seguimos a convenção X e documentamos" vale mais do que defender o código perfeito. O entrevistador quer consistência, não citação da RFC.',
          'Saying "we follow convention X and document it" is worth more than defending the perfect code. The interviewer wants consistency, not an RFC quotation.',
        ),
      ),
    ],
  }),

  content({
    slug: 'web-cors-learn',
    type: 'concept',
    kind: 'learn',
    title: t('CORS: quem bloqueia é o navegador', 'CORS: the browser is who blocks'),
    categoryId: 'security',
    topic: 'http',
    stackIds: ['javascript', 'rest'],
    sourceIds: ['mdn-cors'],
    skillIds: ['security', 'api-design'],
    difficulty: 'intermediate',
    tags: ['cors', 'browser', 'api'],
    minutes: 4,
    related: ['web-cors-bug', 'sec-xss-csrf'],
    blocks: [
      note(
        t(
          'O mal-entendido mais comum: CORS não protege o seu servidor. Ele é uma regra que o **navegador** aplica para impedir que uma página em um domínio leia a resposta de outro domínio. `curl`, Postman e qualquer backend ignoram CORS completamente.',
          'The most common misunderstanding: CORS does not protect your server. It is a rule the **browser** enforces to stop a page on one origin from reading a response from another. `curl`, Postman and any backend ignore CORS entirely.',
        ),
      ),
      note(
        t(
          'Origem é o trio esquema + host + porta. `https://app.exemplo.com` e `https://api.exemplo.com` são origens diferentes, e `http` e `https` no mesmo host também. Por isso "mas é o mesmo domínio" quase nunca é verdade quando o erro aparece.',
          'An origin is the triple scheme + host + port. `https://app.example.com` and `https://api.example.com` are different origins, and so are `http` and `https` on the same host. That is why "but it is the same domain" is almost never true when the error shows up.',
        ),
        t('O que conta como origem', 'What counts as an origin'),
      ),
      note(
        t(
          'Requisições "simples" vão direto e o navegador esconde a resposta se o cabeçalho não permitir. As demais — `PUT`, `DELETE`, `Content-Type: application/json`, cabeçalho customizado — disparam um **preflight**: um `OPTIONS` antes, perguntando se aquele método e aqueles cabeçalhos são permitidos.',
          'So-called "simple" requests go straight out, and the browser hides the response if the headers do not allow it. The rest — `PUT`, `DELETE`, `Content-Type: application/json`, a custom header — trigger a **preflight**: an `OPTIONS` call first, asking whether that method and those headers are allowed.',
        ),
        t('Preflight', 'Preflight'),
      ),
      code(
        'http',
        `
OPTIONS /orders                      <- preflight do navegador
Origin: https://app.exemplo.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, authorization

204 No Content
Access-Control-Allow-Origin: https://app.exemplo.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
`,
      ),
      note(
        t(
          'A combinação proibida: `Access-Control-Allow-Origin: *` junto de `Allow-Credentials: true`. O navegador recusa, e com razão — seria permitir que qualquer site fizesse requisições autenticadas com o cookie do usuário. Com credenciais, a origem tem que ser explícita.',
          'The forbidden combination: `Access-Control-Allow-Origin: *` together with `Allow-Credentials: true`. The browser refuses, and rightly so — it would let any site make authenticated requests with the user\'s cookie. With credentials, the origin has to be explicit.',
        ),
        t('A combinação que o navegador recusa', 'The combination the browser refuses'),
      ),
      note(
        t(
          'Refletir a origem recebida (`Allow-Origin: <request origin>`) sem validar contra uma lista é o equivalente a `*` com credenciais — e passa despercebido porque "funciona". Se a sua API aceita cookie, a lista de origens permitidas precisa ser fechada e revisada.',
          'Reflecting whatever origin arrives (`Allow-Origin: <request origin>`) without checking an allowlist is the equivalent of `*` with credentials — and it slips through because "it works". If your API accepts cookies, the allowed-origin list has to be closed and reviewed.',
        ),
        t('O erro que passa despercebido', 'The mistake that slips through'),
      ),
    ],
  }),

  content({
    slug: 'web-cors-bug',
    type: 'find-the-bug',
    kind: 'find-the-bug',
    title: t('O CORS que "resolveu" e abriu a API', 'The CORS fix that opened the API'),
    categoryId: 'security',
    topic: 'http',
    stackIds: ['nodejs', 'javascript'],
    sourceIds: ['mdn-cors', 'owasp-top-ten'],
    skillIds: ['security'],
    difficulty: 'advanced',
    tags: ['cors', 'segurança', 'cookies'],
    minutes: 4,
    related: ['web-cors-learn', 'sec-xss-csrf'],
    blocks: [
      code(
        'ts',
        `
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(session({ cookie: { httpOnly: true, secure: true } }));
`,
        {
          caption: t(
            'Commit original: "fix: resolve CORS error in staging".',
            'Original commit: "fix: resolve CORS error in staging".',
          ),
        },
      ),
      prompt(
        t(
          'Que ataque este middleware viabiliza, e qual seria a correção mínima?',
          'What attack does this middleware enable, and what is the minimum fix?',
        ),
      ),
      answers({
        short: t(
          'Ele reflete qualquer origem e ainda permite credenciais, então qualquer site que a vítima visite pode fazer requisições autenticadas para a API com o cookie de sessão dela e **ler a resposta**. Na prática é CSRF com leitura. A correção mínima é uma lista fixa de origens permitidas, credenciais só para elas, e métodos e cabeçalhos enumerados em vez de `*`.',
          'It reflects any origin and still allows credentials, so any site the victim visits can make authenticated requests to the API with her session cookie and **read the response**. In practice it is CSRF with reading. The minimum fix is a fixed allowlist of origins, credentials only for those, and enumerated methods and headers instead of `*`.',
        ),
        strong: t(
          'O ponto central é que `Allow-Origin` refletido é funcionalmente `*`, e com `Allow-Credentials: true` o navegador passa a enviar o cookie de sessão e a entregar a resposta ao script da página atacante. O `httpOnly` do cookie não ajuda aqui: o atacante não precisa ler o cookie, ele usa o navegador da vítima como procuração.\n\nO cenário concreto: a vítima está logada na nossa aplicação; visita um site qualquer; aquele site faz `fetch("https://api.nossa.com/me", { credentials: "include" })` e recebe o JSON com os dados dela. Se existir endpoint de escrita sem proteção adicional, também dá para agir em nome dela.\n\nA correção que eu faria: manter uma lista de origens permitidas vinda de configuração, comparar exatamente e só então ecoar aquela origem; `Vary: Origin` para o cache não servir a resposta de uma origem para outra; métodos e cabeçalhos explícitos; `Max-Age` para reduzir preflight. E manter as proteções de CSRF — `SameSite` no cookie e token anti-CSRF nas rotas que mudam estado —, porque CORS não substitui nenhuma das duas.',
          'The core point is that a reflected `Allow-Origin` is functionally `*`, and with `Allow-Credentials: true` the browser starts sending the session cookie and handing the response to the attacking page\'s script. The cookie being `httpOnly` does not help here: the attacker does not need to read the cookie, they use the victim\'s browser as a proxy.\n\nThe concrete scenario: the victim is logged into our app; she visits some site; that site runs `fetch("https://api.ours.com/me", { credentials: "include" })` and receives her JSON. If there is an unprotected write endpoint, they can act as her too.\n\nThe fix I would make: keep an allowlist of origins from configuration, compare exactly and only then echo that origin; add `Vary: Origin` so caches do not serve one origin\'s response to another; enumerate methods and headers; set `Max-Age` to reduce preflights. And keep the CSRF protections — `SameSite` on the cookie and an anti-CSRF token on state-changing routes — because CORS replaces neither.',
        ),
        seconds: { short: 40, strong: 140 },
      }),
      mistakes(
        list(
          [
            'Achar que `httpOnly` protege contra este caso.',
            'Deixar o `*` só em staging — que é onde os dados de teste reais costumam estar.',
            'Esquecer `Vary: Origin` e servir resposta cacheada para a origem errada.',
          ],
          [
            'Believing `httpOnly` protects against this case.',
            'Leaving `*` only in staging — which is where real test data usually lives.',
            'Forgetting `Vary: Origin` and serving a cached response to the wrong origin.',
          ],
        ),
      ),
      warn(
        t(
          'Esse middleware costuma nascer de um erro de CORS em desenvolvimento. Vale a regra: erro de CORS se resolve configurando a origem certa, nunca abrindo todas.',
          'This middleware usually starts life as a CORS error in development. The rule: a CORS error is fixed by configuring the right origin, never by opening all of them.',
        ),
      ),
      followUps(
        list(
          [
            'Como você permitiria previews dinâmicos (`pr-123.app.exemplo.com`) sem refletir tudo?',
            'O que muda se a API usar token no header em vez de cookie?',
            'Como você testaria essa configuração automaticamente?',
          ],
          [
            'How would you allow dynamic previews (`pr-123.app.example.com`) without reflecting everything?',
            'What changes if the API uses a header token instead of a cookie?',
            'How would you test this configuration automatically?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'web-caching-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Cabeçalhos de cache para a API', 'Cache headers for the API'),
    categoryId: 'performance',
    topic: 'http',
    stackIds: ['rest', 'nodejs'],
    sourceIds: ['rfc-9110'],
    skillIds: ['performance', 'api-design'],
    difficulty: 'advanced',
    tags: ['cache', 'http', 'cdn'],
    minutes: 3,
    related: ['web-http-learn', 'sd-read-strategy-learn'],
    blocks: [
      prompt(
        t(
          'Qual política de cache você colocaria em `GET /products/:id`?',
          'Which cache policy would you put on `GET /products/:id`?',
        ),
        t(
          'Catálogo público, atrás de CDN. Preço muda algumas vezes por dia e precisa refletir rápido quando muda. Estoque aparece na mesma resposta.',
          'A public catalogue behind a CDN. Prices change a few times a day and must reflect quickly when they do. Stock is part of the same response.',
        ),
      ),
      choices(false, [
        {
          id: 'no-store',
          label: t('`Cache-Control: no-store`, para nunca mostrar preço errado.', '`Cache-Control: no-store`, so a wrong price is impossible.'),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Joga fora todo o benefício da CDN para um recurso público e de leitura massiva. Preço errado se resolve com invalidação, não desligando cache — e sem cache o pico de campanha bate direto no banco.',
            'It throws away the whole CDN benefit for a public, read-heavy resource. A wrong price is solved by invalidation, not by disabling caching — and with no cache the campaign peak lands directly on the database.',
          ),
        },
        {
          id: 'long-max-age',
          label: t('`max-age=3600`, aceitando até uma hora de atraso.', '`max-age=3600`, accepting up to an hour of staleness.'),
          correct: false,
          quality: 'partial',
          why: t(
            'Ótimo para latência e custo, ruim para o requisito declarado: uma hora de preço velho numa promoção é reclamação no suporte. Serviria se o produto aceitasse a janela, e é por isso que essa pergunta começa perguntando quanto de atraso é tolerável.',
            'Great for latency and cost, bad for the stated requirement: an hour of stale price during a promotion is a support ticket. It would fit if the product accepted the window, which is why this question starts by asking how much staleness is tolerable.',
          ),
        },
        {
          id: 'swr',
          label: t(
            '`max-age=60, stale-while-revalidate=300` com `ETag`, e purge na CDN quando o preço muda.',
            '`max-age=60, stale-while-revalidate=300` with an `ETag`, plus a CDN purge when the price changes.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'Cobre os dois lados: a janela normal é curta, a revalidação acontece atrás sem penalizar o usuário, e a mudança de preço é propagada na hora pelo purge em vez de esperar o TTL. O `ETag` ainda evita transferir o corpo quando nada mudou.',
            'It covers both sides: the normal window is short, revalidation happens behind the scenes without penalising the user, and a price change propagates immediately through the purge instead of waiting for the TTL. The `ETag` also avoids transferring the body when nothing changed.',
          ),
        },
        {
          id: 'private',
          label: t('`private, max-age=300`, para cada usuário ter sua cópia.', '`private, max-age=300`, so each user has their own copy.'),
          correct: false,
          quality: 'partial',
          why: t(
            'Faz sentido se a resposta variar por usuário — e aí a CDN não ajuda. Para catálogo público, `private` desliga o cache compartilhado sem ganho. Se parte da resposta é pessoal, o caminho é separar o endpoint, não privatizar o catálogo inteiro.',
            'It makes sense if the response varies per user — and then the CDN cannot help. For a public catalogue, `private` disables shared caching with nothing gained. If part of the response is personal, the answer is to split the endpoint, not to privatise the whole catalogue.',
          ),
        },
      ]),
      lookingFor(
        list(
          [
            'Perguntar quanto de dado velho o produto tolera.',
            'Separar o que é público do que é por usuário.',
            'Citar invalidação como parte da política, não como remendo.',
          ],
          [
            'Asking how much staleness the product tolerates.',
            'Separating what is public from what is per-user.',
            'Naming invalidation as part of the policy, not as a patch.',
          ],
        ),
      ),
      warn(
        t(
          'Estoque na mesma resposta do catálogo é o detalhe escondido da pergunta: se o número de unidades for mostrado, a janela aceitável cai bastante, e vale separar em outro endpoint.',
          'Stock in the same response as the catalogue is the hidden detail: if unit counts are shown, the acceptable window shrinks a lot, and splitting it into another endpoint is worth it.',
        ),
      ),
    ],
  }),
];
