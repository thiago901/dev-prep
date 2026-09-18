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
  quickChecks,
  t,
  tip,
  tradeOff,
  warn,
} from '../authoring';

/**
 * The lower rungs.
 *
 * The bank started at the top: open interview questions, answered out loud.
 * These are the steps that come before one — a short briefing, a yes/no check,
 * a decision, a multiple choice — so that by the time somebody is asked "your
 * senior wants to do X, what would you say?", they have actually met X.
 *
 * They are ordinary content items, which is what lets Today's Practice reuse
 * them without a second authoring pass.
 */

export const LADDER_CONTENT: Content[] = [
  // =========================================================================
  // Path: the session in the browser
  // =========================================================================
  content({
    slug: 'sec-session-storage-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Onde a sessão mora no navegador', 'Where the session lives in the browser'),
    categoryId: 'security',
    stackIds: ['javascript', 'react'],
    skillIds: ['security'],
    difficulty: 'intermediate',
    tags: ['localStorage', 'xss', 'cookies', 'sessão'],
    minutes: 4,
    related: ['sec-jwt-storage', 'sec-xss-csrf'],
    blocks: [
      note(
        t(
          'Toda aplicação web autenticada precisa guardar alguma prova de que você já entrou. Onde essa prova fica é uma decisão de segurança, e é uma das perguntas mais comuns em entrevista de frontend e de fullstack.',
          'Every authenticated web app has to keep some proof that you already logged in. Where that proof lives is a security decision, and it is one of the most common questions in frontend and fullstack interviews.',
        ),
      ),
      note(
        t(
          'O `localStorage` é um armazenamento de chave e valor do navegador, por origem, que sobrevive a fechar a aba. Ele é síncrono, guarda só texto, e — o ponto que importa aqui — é lido e escrito por qualquer JavaScript que rode naquela página.',
          'The `localStorage` is a key/value store in the browser, scoped per origin, that survives closing the tab. It is synchronous, it only holds strings, and — the part that matters here — it is readable and writable by any JavaScript running on that page.',
        ),
        t('O que é localStorage', 'What localStorage is'),
      ),
      code(
        'js',
        `
// Guardando a sessão onde qualquer script da página alcança
localStorage.setItem('access_token', token);

// Qualquer código que rode nesta origem lê isso. Inclusive um que
// você não escreveu.
const stolen = localStorage.getItem('access_token');
`,
        {
          caption: t(
            'Não existe permissão, escopo ou flag que esconda uma chave do resto da página.',
            'There is no permission, scope or flag that hides a key from the rest of the page.',
          ),
        },
      ),
      note(
        t(
          'XSS é quando um script que você não escreveu roda na sua página: um campo que renderiza HTML sem escapar, uma dependência comprometida, um script de terceiro. Se isso acontece e a sessão está no `localStorage`, o atacante lê o token e faz requisições como você — de outra máquina, sem senha, sem segundo fator.',
          'XSS is when a script you did not write runs on your page: a field that renders HTML unescaped, a compromised dependency, a third-party tag. If that happens and the session sits in `localStorage`, the attacker reads the token and makes requests as you — from another machine, with no password and no second factor.',
        ),
        t('Por que isso é sensível', 'Why this is sensitive'),
      ),
      note(
        t(
          'A alternativa usual é um cookie com `HttpOnly`, `Secure` e `SameSite`. `HttpOnly` significa que o JavaScript da página não consegue ler aquele cookie: ele é anexado pelo navegador nas requisições e pronto. Um XSS ainda pode fazer requisições em nome do usuário enquanto a página está aberta, mas não consegue copiar o token e usar depois, em outro lugar.',
          'The usual alternative is a cookie with `HttpOnly`, `Secure` and `SameSite`. `HttpOnly` means page JavaScript cannot read that cookie: the browser attaches it to requests and that is all. An XSS can still make requests on the user\'s behalf while the page is open, but it cannot copy the token and reuse it later, somewhere else.',
        ),
        t('A alternativa mais comum', 'The usual alternative'),
      ),
      note(
        t(
          'Cookie não é grátis. Ele viaja sozinho, então abre espaço para CSRF e pede `SameSite` mais um token anti-CSRF nos casos que importam. Em domínios diferentes entre frontend e API, dá trabalho de configurar. E tokens de curta duração com refresh continuam sendo a defesa real: se o token vale cinco minutos, o estrago do vazamento é menor, não importa onde ele esteja guardado.',
          'Cookies are not free. They travel on their own, which opens the door to CSRF and calls for `SameSite` plus an anti-CSRF token where it matters. With frontend and API on different domains, they take configuration work. And short-lived tokens with refresh are still the real defence: if the token is valid for five minutes, a leak costs less wherever it was stored.',
        ),
        t('Nada aqui é de graça', 'None of this is free'),
      ),
      note(
        t(
          'Em entrevista, a resposta fraca é "localStorage é inseguro". A resposta forte nomeia o ataque (XSS), o que muda com `HttpOnly`, o que **não** muda (a página comprometida continua podendo agir), e o que você faria além disso: expiração curta, refresh rotativo, e escopo mínimo no token.',
          'In an interview, the weak answer is "localStorage is insecure". The strong answer names the attack (XSS), what `HttpOnly` changes, what it does **not** change (a compromised page can still act), and what you would do beyond that: short expiry, rotating refresh, and minimal scope in the token.',
        ),
        t('O que uma boa resposta tem', 'What a good answer has'),
      ),
    ],
  }),

  content({
    slug: 'sec-session-storage-check',
    type: 'true-false',
    kind: 'quick-check',
    title: t('Checagem: sessão e localStorage', 'Quick check: sessions and localStorage'),
    categoryId: 'security',
    stackIds: ['javascript'],
    skillIds: ['security'],
    difficulty: 'beginner',
    tags: ['localStorage', 'xss', 'cookies'],
    minutes: 2,
    related: ['sec-session-storage-learn'],
    blocks: [
      quickChecks([
        {
          statement: t(
            'O `localStorage` pode ser lido por qualquer JavaScript que rode naquela página.',
            'Any JavaScript running on the page can read `localStorage`.',
          ),
          answer: true,
          why: t(
            'Sim. O escopo é a origem, não o script. Código de uma dependência ou de uma tag de terceiro lê exatamente as mesmas chaves que o seu código.',
            'Yes. The scope is the origin, not the script. Code from a dependency or a third-party tag reads exactly the same keys your code does.',
          ),
        },
        {
          statement: t(
            'Um cookie marcado como `HttpOnly` pode ser lido por `document.cookie`.',
            'A cookie marked `HttpOnly` can be read through `document.cookie`.',
          ),
          answer: false,
          why: t(
            'Não. É exatamente isso que a flag faz: o cookie continua indo nas requisições, mas some para o JavaScript da página.',
            'No. That is exactly what the flag does: the cookie still rides along on requests, but disappears from page JavaScript.',
          ),
        },
        {
          statement: t(
            'Trocar `localStorage` por cookie `HttpOnly` resolve o XSS.',
            'Swapping `localStorage` for an `HttpOnly` cookie fixes XSS.',
          ),
          answer: false,
          why: t(
            'Não. Reduz o estrago: o token não pode ser copiado e reutilizado fora dali. Mas um script injetado ainda faz requisições autenticadas enquanto a página está aberta. A correção do XSS é não injetar script.',
            'No. It reduces the damage: the token cannot be copied and reused elsewhere. But an injected script still makes authenticated requests while the page is open. The fix for XSS is not injecting script.',
          ),
        },
        {
          statement: t(
            'Um token de acesso com validade curta diminui o custo de um vazamento.',
            'A short-lived access token lowers the cost of a leak.',
          ),
          answer: true,
          why: t(
            'Sim, e é a parte da resposta que mais gente esquece. Cinco minutos de validade transformam um token roubado em um problema de cinco minutos — desde que o refresh seja rotativo e revogável.',
            'Yes, and it is the part of the answer most people forget. A five-minute lifetime turns a stolen token into a five-minute problem — as long as the refresh is rotating and revocable.',
          ),
        },
      ]),
    ],
  }),

  content({
    slug: 'sec-session-storage-decision',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões sobre a sessão', 'Calls about the session'),
    categoryId: 'security',
    stackIds: ['javascript', 'react'],
    skillIds: ['security', 'communication'],
    difficulty: 'intermediate',
    tags: ['localStorage', 'cookies', 'decisão'],
    minutes: 3,
    related: ['sec-session-storage-learn', 'sec-jwt-storage'],
    blocks: [
      decisions([
        {
          statement: t(
            'Vou guardar o access token no `localStorage`: é simples, funciona em qualquer domínio e o time já conhece.',
            'I will keep the access token in `localStorage`: it is simple, it works across domains, and the team already knows it.',
          ),
          expected: 'disagree',
          verdict: t(
            'Os motivos são reais, mas não pagam o risco.',
            'The reasons are real, and they do not pay for the risk.',
          ),
          why: t(
            'Simplicidade é um argumento legítimo, e é por isso que essa decisão aparece tanto. O problema é o que ela custa: qualquer XSS vira roubo de sessão reutilizável fora do navegador da vítima. Com cookie `HttpOnly` o mesmo XSS continua sendo grave, mas o token não sai dali.',
            'Simplicity is a legitimate argument, which is why this call shows up so often. The problem is what it costs: any XSS turns into session theft that is reusable outside the victim\'s browser. With an `HttpOnly` cookie the same XSS is still serious, but the token does not leave the page.',
          ),
          context: t(
            'Se o "token" não dá acesso a nada sensível — uma preferência, um id anônimo de analytics — o `localStorage` está de bom tamanho.',
            'If the "token" grants nothing sensitive — a preference, an anonymous analytics id — `localStorage` is perfectly fine.',
          ),
          tradeOff: t(
            'Cookie exige `SameSite` bem configurado, cuidado com CSRF em requisições que mudam estado, e mais trabalho quando API e frontend estão em domínios diferentes.',
            'Cookies require `SameSite` set properly, care with CSRF on state-changing requests, and more work when the API and the frontend sit on different domains.',
          ),
        },
        {
          statement: t(
            'Como já usamos cookie `HttpOnly`, não preciso mais me preocupar em escapar o que renderizo.',
            'Since we already use an `HttpOnly` cookie, I no longer need to worry about escaping what I render.',
          ),
          expected: 'disagree',
          verdict: t(
            'Uma defesa não substitui a outra.',
            'One defence does not replace the other.',
          ),
          why: t(
            'O cookie protege o token contra cópia. Ele não impede o script injetado de disparar uma transferência, mudar o e-mail da conta ou ler a tela. Escapar saída e ter CSP continuam sendo a defesa principal.',
            'The cookie protects the token from being copied. It does not stop an injected script from firing a transfer, changing the account email or reading the screen. Escaping output and having a CSP are still the main defence.',
          ),
        },
        {
          statement: t(
            'Para o time conseguir depurar produção, vou logar o token inteiro no console quando a requisição falhar.',
            'So the team can debug production, I will log the whole token to the console when a request fails.',
          ),
          expected: 'disagree',
          verdict: t('Isso vaza a sessão em qualquer print de tela.', 'That leaks the session in any screenshot.'),
          why: t(
            'Console vai para ferramentas de monitoramento, prints e sessões de suporte. Logue o id da requisição e o status; credencial nenhuma, nem em ambiente de teste, porque o hábito viaja junto com o código.',
            'The console ends up in monitoring tools, screenshots and support sessions. Log the request id and the status; never a credential, not even in staging, because the habit travels with the code.',
          ),
          context: t(
            'Precisando mesmo correlacionar sessões, logue um hash curto e irreversível do token, nunca o valor.',
            'If you genuinely need to correlate sessions, log a short irreversible hash of the token, never the value.',
          ),
        },
      ]),
    ],
  }),

  content({
    slug: 'sec-session-spa-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Sessão autenticada numa SPA', 'Keeping a session in a SPA'),
    categoryId: 'security',
    stackIds: ['javascript', 'react'],
    skillIds: ['security'],
    difficulty: 'advanced',
    tags: ['sessão', 'spa', 'token'],
    minutes: 3,
    related: ['sec-session-storage-learn', 'sec-jwt-revoke'],
    blocks: [
      prompt(
        t(
          'Qual abordagem reduz melhor a exposição da credencial ao JavaScript da página, sem quebrar o refresh da sessão?',
          'Which approach best reduces the credential\'s exposure to page JavaScript, without breaking session refresh?',
        ),
        t(
          'Uma SPA em React conversa com uma API no mesmo domínio raiz. A sessão precisa sobreviver a recarregar a página.',
          'A React SPA talks to an API on the same root domain. The session has to survive a page reload.',
        ),
      ),
      choices(false, [
        {
          id: 'https',
          label: t(
            'Servir tudo por HTTPS e manter o token no `localStorage`.',
            'Serve everything over HTTPS and keep the token in `localStorage`.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'HTTPS protege o transporte, e é obrigatório de qualquer jeito. Ele não muda nada sobre quem consegue ler o `localStorage` dentro da página, que é justamente o risco aqui.',
            'HTTPS protects transport, and it is mandatory anyway. It changes nothing about who can read `localStorage` inside the page, which is exactly the risk here.',
          ),
        },
        {
          id: 'memory',
          label: t(
            'Manter o access token só em memória e pedir um novo ao recarregar.',
            'Keep the access token in memory only, and ask for a new one on reload.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Boa ideia, e é metade da resposta: em memória o token não sobrevive a um `getItem`. Mas alguma coisa precisa sustentar o refresh depois do reload — e é exatamente essa coisa que precisa estar fora do alcance do JavaScript.',
            'Good idea, and it is half the answer: in memory the token does not survive a `getItem`. But something has to sustain the refresh after a reload — and that something is exactly what needs to be out of JavaScript\'s reach.',
          ),
        },
        {
          id: 'httponly-refresh',
          label: t(
            'Refresh token em cookie `HttpOnly`, `Secure` e `SameSite`, com access token curto em memória.',
            'Refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie, with a short access token in memory.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'O que dura fica onde o script não alcança; o que o script usa dura pouco e morre no reload. O XSS continua sendo grave enquanto a página está aberta, mas o atacante não sai dali com uma sessão reutilizável.',
            'What lasts sits where script cannot reach; what script uses is short-lived and dies on reload. XSS is still serious while the page is open, but the attacker does not walk away with a reusable session.',
          ),
        },
        {
          id: 'encrypt',
          label: t(
            'Criptografar o token antes de salvar no `localStorage`.',
            'Encrypt the token before saving it to `localStorage`.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'A chave de descriptografia precisa estar na página para ser útil, então o atacante pega as duas coisas. Isso adiciona passos sem mover o limite de confiança.',
            'The decryption key has to be on the page to be useful, so the attacker takes both. It adds steps without moving the trust boundary.',
          ),
        },
      ]),
      lookingFor(
        list(
          [
            'Separar o que dura (refresh) do que é usado a todo momento (access).',
            'Nomear o ataque concreto: XSS lendo armazenamento acessível por script.',
            'Reconhecer o que a escolha não resolve, em vez de vender bala de prata.',
          ],
          [
            'Separating what lasts (refresh) from what is used constantly (access).',
            'Naming the concrete attack: XSS reading script-accessible storage.',
            'Admitting what the choice does not solve, instead of selling a silver bullet.',
          ],
        ),
      ),
      tip(
        t(
          'Dizer "depende do domínio da API e de onde o frontend está hospedado" antes de escolher mostra experiência real — desde que você escolha em seguida.',
          'Saying "it depends on the API domain and where the frontend is hosted" before choosing shows real experience — as long as you then choose.',
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-session-senior-talk',
    type: 'scenario',
    kind: 'interview',
    title: t('Seu senior quer usar localStorage', 'Your senior wants to use localStorage'),
    categoryId: 'security',
    stackIds: ['javascript', 'react'],
    skillIds: ['security', 'communication'],
    difficulty: 'advanced',
    tags: ['sessão', 'comunicação', 'xss'],
    minutes: 5,
    related: ['sec-session-spa-choice', 'sec-xss-csrf', 'beh-disagree-commit'],
    blocks: [
      prompt(
        t(
          'Como você conduziria essa conversa com ele?',
          'How would you run that conversation with them?',
        ),
        t(
          'Seu senior propôs guardar a sessão no `localStorage` porque é mais simples. Você acha que isso aumenta a exposição a XSS. O time precisa entregar essa semana.',
          'Your senior proposed keeping the session in `localStorage` because it is simpler. You think it increases XSS exposure. The team has to ship this week.',
        ),
      ),
      answers({
        short: t(
          'Eu perguntaria primeiro o que motivou a escolha, porque normalmente é prazo ou domínio diferente entre API e frontend. Depois colocaria o risco em termos concretos: com XSS, token em `localStorage` vira sessão reutilizável fora do navegador do usuário. E proporia o caminho do meio: refresh em cookie `HttpOnly` e access token curto em memória, que cabe no prazo.',
          'I would ask what drove the choice first, because it is usually a deadline or a different domain between API and frontend. Then I would put the risk in concrete terms: with XSS, a token in `localStorage` becomes a session that is reusable outside the user\'s browser. And I would propose the middle path: refresh in an `HttpOnly` cookie and a short access token in memory, which fits the deadline.',
        ),
        strong: t(
          'Eu trataria como decisão técnica com trade-off, não como quem está certo. Começo perguntando o que pesou: se for domínio diferente entre API e frontend, o cookie realmente dá mais trabalho, e isso muda a conversa.\n\nDepois eu deixaria o risco concreto, sem alarmismo: "se alguém conseguir injetar script em qualquer página nossa, o token sai daqui e continua valendo em outra máquina". Isso é diferente de dizer "localStorage é inseguro", que soa a regra decorada.\n\nEntão eu proporia a alternativa junto do custo: refresh em cookie `HttpOnly`, `Secure` e `SameSite`, access token curto em memória. Digo o que isso custa — configuração de CORS e credenciais, atenção a CSRF nas rotas que mudam estado — e o que continua nosso problema de qualquer jeito: escapar saída e ter CSP.\n\nSe ainda assim ele decidir por `localStorage`, eu registro a decisão e o risco no PR ou no ADR, peço expiração curta como mitigação mínima, e sigo. Discordar e se comprometer é parte do trabalho; deixar o risco sem registro, não.',
          'I would treat it as a technical decision with a trade-off, not as who is right. I start by asking what weighed most: if the API and frontend are on different domains, the cookie really is more work, and that changes the conversation.\n\nThen I would make the risk concrete, without alarm: "if anyone manages to inject script on any page of ours, the token leaves here and still works on another machine". That is different from saying "localStorage is insecure", which sounds like a memorised rule.\n\nThen I would propose the alternative together with its cost: refresh in an `HttpOnly`, `Secure`, `SameSite` cookie, short access token in memory. I name what it costs — CORS and credential configuration, CSRF care on state-changing routes — and what stays our problem either way: escaping output and having a CSP.\n\nIf they still decide on `localStorage`, I record the decision and the risk in the PR or the ADR, ask for short expiry as the minimum mitigation, and move on. Disagreeing and committing is part of the job; leaving the risk unrecorded is not.',
        ),
        deep: t(
          'Além da conversa, eu levaria uma evidência barata: um pull request pequeno mostrando o fluxo com cookie funcionando no nosso ambiente, ou um teste que demonstra a leitura do token por um script injetado numa página de exemplo. Argumento com demonstração encurta discussão.\n\nTambém separaria o que é decisão de arquitetura do que é decisão de entrega: dá para entregar esta semana com `localStorage` e expiração de cinco minutos, e abrir um item para mover o refresh para cookie antes de abrir para clientes externos. Colocar prazo no item evita que "depois" signifique nunca.\n\nE eu ajustaria o tom ao contexto: numa empresa com revisão de segurança formal, eu levaria isso para o canal de segurança em vez de resolver na conversa. Em time pequeno, resolvo no PR mesmo.',
          'Beyond the conversation, I would bring cheap evidence: a small pull request showing the cookie flow working in our environment, or a test demonstrating an injected script reading the token on a sample page. An argument with a demonstration shortens the debate.\n\nI would also separate the architecture decision from the delivery decision: we can ship this week with `localStorage` and a five-minute expiry, and open an item to move the refresh to a cookie before we open up to external clients. Putting a date on the item stops "later" from meaning never.\n\nAnd I would match the tone to the context: at a company with a formal security review, I would take this to the security channel instead of settling it in conversation. On a small team, the PR is the right place.',
        ),
        seconds: { short: 40, strong: 130, deep: 240 },
      }),
      lookingFor(
        list(
          [
            'Perguntar antes de discordar: o motivo do outro lado costuma ser real.',
            'Descrever o risco em consequência concreta, não em rótulo.',
            'Propor alternativa com o custo dela dito em voz alta.',
            'Saber terminar: decisão registrada, mitigação mínima, seguir em frente.',
          ],
          [
            'Asking before disagreeing: the other side usually has a real reason.',
            'Describing the risk as a concrete consequence, not a label.',
            'Proposing an alternative with its cost said out loud.',
            'Knowing how to end it: decision recorded, minimum mitigation, move on.',
          ],
        ),
        {
          strong: t(
            'Quem separa "o que entregamos esta semana" de "o que corrigimos antes de abrir para fora" mostra senioridade sem precisar dizer que tem razão.',
            'Separating "what we ship this week" from "what we fix before we open up" shows seniority without having to claim to be right.',
          ),
          shallow: t(
            'Repetir que localStorage é inseguro, sem nomear o ataque nem o que a alternativa custa.',
            'Repeating that localStorage is insecure, without naming the attack or what the alternative costs.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Transformar em discussão de quem sabe mais segurança.',
            'Propor cookie sem citar CSRF e CORS, e ser pego no follow-up.',
            'Aceitar calado e reclamar depois que aconteceu.',
          ],
          [
            'Turning it into a contest about who knows more security.',
            'Proposing cookies without mentioning CSRF and CORS, and getting caught on the follow-up.',
            'Quietly accepting, then complaining after it happens.',
          ],
        ),
      ),
      followUps(
        list(
          [
            'E se a API estivesse em outro domínio, sem subdomínio comum?',
            'Como você revogaria a sessão de um usuário específico nesse desenho?',
            'O que muda se o produto for um app mobile com WebView?',
          ],
          [
            'What if the API were on another domain, with no shared subdomain?',
            'How would you revoke one specific user\'s session in that design?',
            'What changes if the product is a mobile app with a WebView?',
          ],
        ),
      ),
      warn(
        t(
          'Se a entrevista for para uma vaga sênior, a parte da conversa pesa tanto quanto a parte técnica. A pergunta é sobre como você discorda, não só sobre onde o token fica.',
          'If the interview is for a senior role, the conversation half weighs as much as the technical half. The question is about how you disagree, not only about where the token lives.',
        ),
      ),
    ],
  }),

  // =========================================================================
  // Path: the event loop
  // =========================================================================
  content({
    slug: 'js-event-loop-learn',
    type: 'concept',
    kind: 'learn',
    title: t('O event loop, em uma passada', 'The event loop, in one pass'),
    categoryId: 'javascript',
    stackIds: ['javascript', 'nodejs'],
    skillIds: ['javascript'],
    difficulty: 'intermediate',
    tags: ['event loop', 'async', 'microtask'],
    minutes: 4,
    related: ['js-event-loop-order', 'js-event-loop-single-thread'],
    blocks: [
      note(
        t(
          'Node roda o seu código em uma thread só. Isso assusta quando a pergunta é "e como ele aguenta mil requisições ao mesmo tempo?" — e a resposta está em quem faz o trabalho de espera.',
          'Node runs your code on a single thread. That sounds alarming when the question is "so how does it handle a thousand requests at once?" — and the answer is in who does the waiting.',
        ),
      ),
      note(
        t(
          'Ler um arquivo, chamar um banco ou responder a uma requisição HTTP é quase tudo espera. Node entrega essa espera ao sistema operacional e continua executando outra coisa. Quando a espera termina, o resultado volta como um callback numa fila, e o event loop pega essa fila quando a pilha está vazia.',
          'Reading a file, calling a database or answering an HTTP request is mostly waiting. Node hands that waiting to the operating system and carries on with something else. When the wait finishes, the result comes back as a callback on a queue, and the event loop picks that queue up when the stack is empty.',
        ),
        t('Uma thread, muito paralelismo de espera', 'One thread, plenty of waiting in parallel'),
      ),
      note(
        t(
          'Nem toda fila é igual. Microtasks — `Promise.then`, `queueMicrotask`, `await` — rodam antes de o loop seguir para a próxima fase, e rodam até esvaziar. Macrotasks — `setTimeout`, `setImmediate`, I/O — esperam a próxima volta. Por isso um `then` ganha de um `setTimeout(…, 0)` agendado antes dele.',
          'Not every queue is equal. Microtasks — `Promise.then`, `queueMicrotask`, `await` — run before the loop moves to the next phase, and they run until empty. Macrotasks — `setTimeout`, `setImmediate`, I/O — wait for the next turn. That is why a `then` beats a `setTimeout(…, 0)` scheduled before it.',
        ),
        t('Duas filas com prioridades diferentes', 'Two queues with different priority'),
      ),
      code(
        'js',
        `
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('microtask'));
console.log('sync');

// sync
// microtask
// timeout
`,
        {
          caption: t(
            'O síncrono primeiro, a fila de microtasks antes de voltar ao loop, e só então o timer.',
            'Synchronous first, the microtask queue before returning to the loop, and only then the timer.',
          ),
        },
      ),
      note(
        t(
          'O outro lado da moeda: como é uma thread só, qualquer coisa que ocupe CPU sem ceder — um laço grande, um `JSON.parse` de vários megabytes, um hash síncrono — segura *todas* as requisições. É a causa mais comum de "a API ficou lenta e a CPU nem está alta".',
          'The other side of it: because there is one thread, anything that holds the CPU without yielding — a big loop, a multi-megabyte `JSON.parse`, a synchronous hash — stalls *every* request. It is the most common cause of "the API got slow and the CPU is not even high".',
        ),
        t('O preço', 'The price'),
      ),
      note(
        t(
          'Em entrevista, o pulo do gato é ligar as duas partes: a arquitetura é ótima para espera, péssima para CPU. Quem diz só "é assíncrono e não bloqueia" responde metade.',
          'In an interview, the trick is connecting the two halves: the architecture is excellent for waiting, terrible for CPU. Saying only "it is asynchronous and non-blocking" answers half of it.',
        ),
        t('O que ligar na resposta', 'What to connect in the answer'),
      ),
    ],
  }),

  content({
    slug: 'js-event-loop-check',
    type: 'true-false',
    kind: 'quick-check',
    title: t('Checagem: event loop', 'Quick check: the event loop'),
    categoryId: 'javascript',
    stackIds: ['javascript', 'nodejs'],
    skillIds: ['javascript'],
    difficulty: 'beginner',
    tags: ['event loop', 'async'],
    minutes: 2,
    related: ['js-event-loop-learn', 'js-event-loop-order'],
    blocks: [
      quickChecks([
        {
          statement: t(
            'Node executa o seu código de aplicação em várias threads por padrão.',
            'Node runs your application code on several threads by default.',
          ),
          answer: false,
          why: t(
            'Não. O seu código roda em uma thread. Existe um pool de threads para certas operações (arquivo, DNS, cripto) e existem worker threads quando você pede — mas isso é outra coisa.',
            'No. Your code runs on one thread. There is a thread pool for certain operations (file, DNS, crypto) and there are worker threads when you ask for them — but that is a different thing.',
          ),
        },
        {
          statement: t(
            'Um `Promise.then` já resolvido roda antes de um `setTimeout(fn, 0)` agendado antes dele.',
            'An already-resolved `Promise.then` runs before a `setTimeout(fn, 0)` scheduled before it.',
          ),
          answer: true,
          why: t(
            'Sim. A fila de microtasks é drenada antes de o loop seguir para a fase de timers.',
            'Yes. The microtask queue is drained before the loop moves on to the timers phase.',
          ),
        },
        {
          statement: t(
            'Um laço síncrono de dois segundos atrasa só a requisição que o disparou.',
            'A two-second synchronous loop only delays the request that triggered it.',
          ),
          answer: false,
          why: t(
            'Não. Ele segura a thread inteira: todas as outras requisições ficam esperando, inclusive as que já estavam prontas para responder.',
            'No. It holds the whole thread: every other request waits, including the ones that were ready to respond.',
          ),
        },
      ]),
    ],
  }),

  // =========================================================================
  // Path: indexes
  // =========================================================================
  content({
    slug: 'db-index-learn',
    type: 'concept',
    kind: 'learn',
    title: t('O que o banco faz com um índice', 'What the database does with an index'),
    categoryId: 'database',
    stackIds: ['postgresql'],
    skillIds: ['database'],
    difficulty: 'intermediate',
    tags: ['índice', 'performance', 'query'],
    minutes: 4,
    related: ['db-index-basics', 'db-composite-index-order'],
    blocks: [
      note(
        t(
          'Índice não é "uma configuração que deixa a query rápida". É uma estrutura de dados mantida pelo banco — normalmente uma árvore B — que guarda os valores de uma ou mais colunas em ordem, junto com o endereço da linha.',
          'An index is not "a setting that makes the query fast". It is a data structure the database maintains — usually a B-tree — holding the values of one or more columns in order, together with the address of the row.',
        ),
      ),
      note(
        t(
          'Como está ordenado, o banco encontra uma faixa de valores descendo a árvore em vez de ler a tabela inteira. É a diferença entre procurar um nome no índice remissivo e folhear o livro.',
          'Because it is ordered, the database finds a range of values by walking down the tree instead of reading the whole table. It is the difference between using the index at the back of a book and flipping through every page.',
        ),
        t('Por que fica rápido', 'Why it gets fast'),
      ),
      note(
        t(
          'Em índice composto, a ordem das colunas manda. `(status, created_at)` serve para filtrar por `status`, e para `status` mais faixa de `created_at`. Não serve para filtrar só por `created_at`: é como procurar um sobrenome numa lista ordenada por nome.',
          'In a composite index, the column order rules. `(status, created_at)` serves filtering by `status`, and by `status` plus a range of `created_at`. It does not serve filtering by `created_at` alone: that is like looking up a surname in a list sorted by first name.',
        ),
        t('A regra que mais cai em entrevista', 'The rule that comes up most in interviews'),
      ),
      code(
        'sql',
        `
CREATE INDEX idx_orders_status_created ON orders (status, created_at);

-- usa o índice
SELECT * FROM orders WHERE status = 'paid' AND created_at > now() - interval '7 days';

-- não usa este índice para filtrar
SELECT * FROM orders WHERE created_at > now() - interval '7 days';
`,
      ),
      note(
        t(
          'Índice custa. Cada `INSERT`, `UPDATE` e `DELETE` mantém também as árvores, e índice demais deixa a escrita lenta e ocupa disco. Além disso, o planejador pode ignorar o índice quando a query devolve uma fatia grande da tabela — ler tudo em sequência sai mais barato.',
          'Indexes cost. Every `INSERT`, `UPDATE` and `DELETE` also maintains the trees, and too many indexes make writes slow and eat disk. On top of that, the planner may ignore the index when the query returns a large slice of the table — reading it all sequentially is cheaper.',
        ),
        t('O que ele cobra', 'What it charges you'),
      ),
      note(
        t(
          'Função na coluna também derruba o índice: `WHERE lower(email) = $1` não usa um índice em `email`. Ou se indexa a expressão, ou se normaliza na escrita.',
          'A function on the column kills it too: `WHERE lower(email) = $1` does not use an index on `email`. Either index the expression, or normalise on write.',
        ),
        t('O detalhe que derruba candidato', 'The detail that trips candidates up'),
      ),
    ],
  }),

  content({
    slug: 'db-index-decision',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões sobre índices', 'Calls about indexes'),
    categoryId: 'database',
    stackIds: ['postgresql'],
    skillIds: ['database'],
    difficulty: 'intermediate',
    tags: ['índice', 'performance'],
    minutes: 3,
    related: ['db-index-learn', 'db-slow-query'],
    blocks: [
      decisions([
        {
          statement: t(
            'A query está lenta em produção. Vou criar o índice direto na tabela de pedidos, agora.',
            'The query is slow in production. I will create the index on the orders table right now.',
          ),
          expected: 'disagree',
          verdict: t(
            'Não antes de olhar o plano — e não sem `CONCURRENTLY`.',
            'Not before reading the plan — and not without `CONCURRENTLY`.',
          ),
          why: t(
            'Duas coisas. Primeiro, o `EXPLAIN ANALYZE` pode mostrar que o problema é outro: N+1, falta de filtro, estatística velha. Segundo, `CREATE INDEX` comum pega lock de escrita na tabela; em produção isso derruba escrita. `CREATE INDEX CONCURRENTLY` existe para isso e custa mais tempo.',
            'Two things. First, `EXPLAIN ANALYZE` may show the problem is elsewhere: N+1, a missing filter, stale statistics. Second, a plain `CREATE INDEX` takes a write lock on the table; in production that stalls writes. `CREATE INDEX CONCURRENTLY` exists for this and costs more time.',
          ),
          tradeOff: t(
            'Concurrently é mais lento, pode falhar e deixar um índice inválido para trás, e exige acompanhar. Ainda assim é o caminho em tabela quente.',
            'Concurrently is slower, can fail and leave an invalid index behind, and needs watching. It is still the way on a hot table.',
          ),
        },
        {
          statement: t(
            'Essa tabela é consultada por cinco filtros diferentes, então vou criar um índice para cada coluna.',
            'This table is queried by five different filters, so I will create one index per column.',
          ),
          expected: 'disagree',
          verdict: t('Índice demais é um custo fixo em toda escrita.', 'Too many indexes is a fixed cost on every write.'),
          why: t(
            'Cada índice é mantido em cada escrita e ocupa disco e cache. O caminho é olhar as queries que realmente rodam, ver quais combinações de filtro aparecem juntas e cobrir com índices compostos na ordem certa — normalmente dois ou três resolvem.',
            'Each index is maintained on every write and takes disk and cache. The way through is to look at the queries that actually run, see which filter combinations appear together, and cover them with composite indexes in the right order — usually two or three do it.',
          ),
          context: t(
            'Em tabela pequena e quase só de leitura, o custo de escrita é irrelevante e vários índices simples não incomodam.',
            'On a small, read-mostly table the write cost is irrelevant and several simple indexes do no harm.',
          ),
        },
        {
          statement: t(
            'Já existe índice em `(status, created_at)`. Para a tela que filtra só por data, vou criar outro em `created_at`.',
            'There is already an index on `(status, created_at)`. For the screen that filters by date alone, I will create another on `created_at`.',
          ),
          expected: 'agree',
          verdict: t('Faz sentido: o composto não cobre esse caso.', 'Reasonable: the composite does not cover that case.'),
          why: t(
            'Um índice em `(status, created_at)` não serve para filtrar só por `created_at`, porque a primeira coluna define a ordem. Se essa tela roda muito, o índice novo se paga. A conversa seguinte é se ela poderia filtrar por status também, o que evitaria o índice.',
            'An index on `(status, created_at)` does not serve a filter on `created_at` alone, because the first column defines the ordering. If that screen runs often, the new index pays for itself. The next conversation is whether it could filter by status too, which would avoid the index.',
          ),
        },
      ]),
    ],
  }),

  // =========================================================================
  // Path: idempotency
  // =========================================================================
  content({
    slug: 'api-idempotency-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Idempotência sem decorar a definição', 'Idempotency without memorising the definition'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'rest-api'],
    skillIds: ['api-design'],
    difficulty: 'intermediate',
    tags: ['idempotência', 'retry', 'pagamento'],
    minutes: 4,
    related: ['api-idempotency', 'arch-queue-exactly-once'],
    blocks: [
      note(
        t(
          'Uma operação é idempotente quando repeti-la tem o mesmo efeito de fazê-la uma vez. Isso importa porque a internet repete: timeout no cliente, retry do gateway, usuário clicando duas vezes, fila entregando a mesma mensagem de novo.',
          'An operation is idempotent when repeating it has the same effect as doing it once. This matters because the internet repeats: a client timeout, a gateway retry, a user double-clicking, a queue delivering the same message again.',
        ),
      ),
      note(
        t(
          'O caso clássico: o cliente manda `POST /payments`, o servidor cobra, a resposta se perde no caminho e o cliente tenta de novo. Sem proteção, o cartão é cobrado duas vezes — e ninguém no time vê erro nenhum no log.',
          'The classic case: the client sends `POST /payments`, the server charges, the response is lost on the way back, and the client retries. With no protection, the card is charged twice — and nobody on the team sees a single error in the log.',
        ),
        t('Onde isso morde', 'Where it bites'),
      ),
      note(
        t(
          'A solução usual é uma chave de idempotência gerada pelo cliente, mandada num header. O servidor guarda a chave com o resultado da primeira execução. Se a mesma chave chegar de novo, ele devolve o resultado guardado em vez de executar outra vez.',
          'The usual answer is an idempotency key generated by the client and sent in a header. The server stores the key with the result of the first run. If the same key arrives again, it returns the stored result instead of executing again.',
        ),
        t('Como se resolve', 'How it is solved'),
      ),
      code(
        'http',
        `
POST /payments
Idempotency-Key: 9f1c2b7a-6d2e-4f3a-b0c9-2f1d5e7a8b30

{ "amount": 4990, "currency": "BRL" }
`,
        {
          caption: t(
            'A chave é do cliente e sobrevive ao retry dele. Se o cliente gerar uma nova chave a cada tentativa, não adianta nada.',
            'The key belongs to the client and survives its own retry. If the client generates a new key per attempt, it achieves nothing.',
          ),
        },
      ),
      note(
        t(
          'Três detalhes que separam a resposta rasa da boa: a chave precisa de prazo de validade; a gravação da chave e o efeito precisam estar na mesma transação, senão dá para cobrar e não gravar; e requisições concorrentes com a mesma chave precisam de um lock, ou você executa duas vezes em paralelo.',
          'Three details that separate a shallow answer from a good one: the key needs an expiry; storing the key and applying the effect have to be in the same transaction, otherwise you can charge and fail to record it; and concurrent requests with the same key need a lock, or you run twice in parallel.',
        ),
        t('Os detalhes que cobram', 'The details they ask about'),
      ),
      note(
        t(
          'Vale lembrar o que já é idempotente por natureza: `GET`, `PUT` com o recurso inteiro e `DELETE` (o segundo devolve 404, o efeito é o mesmo). `POST` não é, e é por isso que ele é o que precisa de chave.',
          'Worth remembering what is idempotent by nature: `GET`, `PUT` with the full resource, and `DELETE` (the second returns 404, the effect is the same). `POST` is not, which is why it is the one that needs a key.',
        ),
        t('O que já vem de graça', 'What you get for free'),
      ),
    ],
  }),

  content({
    slug: 'api-idempotency-check',
    type: 'true-false',
    kind: 'quick-check',
    title: t('Checagem: idempotência', 'Quick check: idempotency'),
    categoryId: 'backend',
    stackIds: ['rest-api'],
    skillIds: ['api-design'],
    difficulty: 'beginner',
    tags: ['idempotência', 'http'],
    minutes: 2,
    related: ['api-idempotency-learn'],
    blocks: [
      quickChecks([
        {
          statement: t(
            'Um `DELETE` repetido no mesmo recurso é idempotente.',
            'A repeated `DELETE` on the same resource is idempotent.',
          ),
          answer: true,
          why: t(
            'Sim. A segunda chamada devolve 404 em vez de 204, mas o estado final do servidor é o mesmo: o recurso não existe.',
            'Yes. The second call returns 404 instead of 204, but the final server state is the same: the resource does not exist.',
          ),
        },
        {
          statement: t(
            'Gerar uma chave de idempotência nova a cada tentativa de retry resolve a cobrança duplicada.',
            'Generating a new idempotency key on each retry solves the duplicate charge.',
          ),
          answer: false,
          why: t(
            'Não, e esse é o erro mais comum. A chave só funciona se for a mesma entre as tentativas da mesma intenção do usuário.',
            'No, and this is the most common mistake. The key only works if it stays the same across retries of the same user intent.',
          ),
        },
        {
          statement: t(
            'Guardar a chave de idempotência fora da transação que aplica o efeito é seguro.',
            'Storing the idempotency key outside the transaction that applies the effect is safe.',
          ),
          answer: false,
          why: t(
            'Não. Se o processo cair entre as duas coisas, ou você cobra sem registrar a chave (e cobra de novo no retry), ou registra sem cobrar (e nunca cobra).',
            'No. If the process dies between the two, you either charge without recording the key (and charge again on retry), or record without charging (and never charge).',
          ),
        },
      ]),
    ],
  }),

  content({
    slug: 'api-idempotency-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Cobrança duplicada no retry', 'Double charge on retry'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'rest-api', 'postgresql'],
    skillIds: ['api-design'],
    difficulty: 'advanced',
    tags: ['idempotência', 'retry', 'concorrência'],
    minutes: 3,
    related: ['api-idempotency-learn', 'api-idempotency'],
    blocks: [
      prompt(
        t(
          'Qual mudança resolve a causa, e não o sintoma?',
          'Which change fixes the cause rather than the symptom?',
        ),
        t(
          'Seu endpoint `POST /payments` cobrou duas vezes o mesmo cliente. O log mostra duas requisições idênticas com 400 ms de diferença, vindas do retry automático do app.',
          'Your `POST /payments` endpoint charged the same customer twice. The log shows two identical requests 400 ms apart, from the app\'s automatic retry.',
        ),
      ),
      choices(false, [
        {
          id: 'debounce',
          label: t(
            'Desabilitar o botão no app depois do primeiro clique.',
            'Disable the button in the app after the first click.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Trata um dos gatilhos e deixa o resto: retry automático, reenvio do gateway, dois dispositivos. O servidor continua aceitando a segunda cobrança.',
            'It handles one trigger and leaves the rest: automatic retry, gateway resend, two devices. The server still accepts the second charge.',
          ),
        },
        {
          id: 'dedupe-window',
          label: t(
            'No servidor, recusar uma cobrança igual do mesmo cliente dentro de 60 segundos.',
            'On the server, reject an identical charge from the same customer within 60 seconds.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Reduz o problema hoje e cria outro amanhã: duas compras legítimas do mesmo valor dentro da janela passam a falhar, e o retry que chega em 61 segundos cobra de novo. Serve como remendo enquanto a correção real não sai.',
            'It reduces the problem today and creates another tomorrow: two legitimate purchases of the same amount inside the window start failing, and a retry that lands at 61 seconds charges again. It works as a patch while the real fix ships.',
          ),
        },
        {
          id: 'idempotency-key',
          label: t(
            'Aceitar uma `Idempotency-Key` do cliente, gravada com o resultado na mesma transação da cobrança.',
            'Accept an `Idempotency-Key` from the client, stored with the result in the same transaction as the charge.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'Ataca a causa: a segunda requisição é reconhecida como a mesma intenção e devolve o resultado da primeira. Na mesma transação porque cobrar e registrar precisam acontecer juntos, e com unicidade na chave para o caso de duas chegarem ao mesmo tempo.',
            'It attacks the cause: the second request is recognised as the same intent and returns the first result. In the same transaction because charging and recording have to happen together, and with a unique constraint on the key in case two land at once.',
          ),
        },
        {
          id: 'queue',
          label: t(
            'Mandar as cobranças para uma fila e processar uma de cada vez por cliente.',
            'Push charges onto a queue and process one at a time per customer.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Serializa e tira a concorrência, o que ajuda. Mas fila entrega a mesma mensagem mais de uma vez em falha, então sem uma chave de deduplicação você trocou o retry do app pelo retry da fila.',
            'It serialises and removes concurrency, which helps. But queues redeliver the same message on failure, so without a dedupe key you swapped the app\'s retry for the queue\'s.',
          ),
        },
      ]),
      tip(
        t(
          'Se você citar a restrição de unicidade na coluna da chave, o entrevistador entende que você já implementou isso de verdade — é o detalhe que resolve duas requisições simultâneas.',
          'Mentioning the unique constraint on the key column tells the interviewer you have actually built this — it is the detail that handles two simultaneous requests.',
        ),
      ),
      tradeOff([
        {
          option: t('Chave de idempotência', 'Idempotency key'),
          pros: list(
            ['Resolve retry de qualquer origem.', 'Contrato explícito com o cliente.'],
            ['Handles retries from any source.', 'An explicit contract with the client.'],
          ),
          cons: list(
            ['Exige armazenamento com expiração.', 'O cliente precisa cooperar e reusar a chave.'],
            ['Needs storage with expiry.', 'The client has to cooperate and reuse the key.'],
          ),
        },
        {
          option: t('Janela de deduplicação', 'Dedupe window'),
          pros: list(
            ['Sai rápido, sem mudar o cliente.'],
            ['Ships fast, with no client change.'],
          ),
          cons: list(
            ['Bloqueia compra legítima repetida.', 'Falha fora da janela.'],
            ['Blocks a legitimate repeat purchase.', 'Fails outside the window.'],
          ),
        },
      ]),
    ],
  }),
];
