import type { Content } from '@/domain/types';
import {
  answers,
  choices,
  code,
  compare,
  content,
  diagram,
  expected,
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

/**
 * JavaScript and Node.js runtime behaviour.
 *
 * Every prompt here is written the way a real interviewer asks it: from a
 * situation, not from a definition. "What is Node.js" is deliberately absent.
 */
export const JAVASCRIPT_CONTENT: Content[] = [
  content({
    slug: 'js-event-loop-order',
    type: 'code-reading',
    trap: true,
    title: t('Ordem de execução: timers e microtasks', 'Execution order: timers and microtasks'),
    categoryId: 'javascript',
    stackIds: ['javascript', 'nodejs'],
    skillIds: ['javascript', 'nodejs'],
    difficulty: 'intermediate',
    tags: ['event-loop', 'microtasks', 'promises', 'async'],
    minutes: 5,
    related: ['js-event-loop-single-thread', 'js-microtask-starvation', 'node-set-immediate'],
    blocks: [
      prompt(
        t(
          'O que será impresso, e em que ordem? Explique o porquê.',
          'What gets printed, and in what order? Explain why.',
        ),
      ),
      code(
        'javascript',
        `
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
`,
      ),
      expected(
        `A
D
C
B`,
        t(
          'A ordem é a mesma no Node.js e no browser.',
          'The order is the same in Node.js and in the browser.',
        ),
      ),
      answers({
        short: t(
          'A, D, C, B. O código síncrono roda primeiro, então A e D. Quando a call stack esvazia, o runtime drena a fila de microtasks antes de qualquer timer, então o `.then` imprime C. Só depois disso o event loop chega na fase de timers e executa o callback do setTimeout, que imprime B.',
          'A, D, C, B. The synchronous code runs first, so A and D. Once the call stack empties, the runtime drains the microtask queue before touching any timer, so the `.then` prints C. Only after that does the event loop reach the timer phase and run the setTimeout callback, which prints B.',
        ),
        strong: t(
          'A, D, C, B.\n\nA e D saem primeiro porque são síncronos — estão no mesmo tick, executam de cima para baixo e nada os interrompe.\n\nO setTimeout não agenda nada para "daqui a zero milissegundos". Ele registra um callback na fase de timers do event loop, que só é alcançada depois que a stack esvazia.\n\nO `Promise.resolve().then` entra na fila de microtasks. A regra que importa é essa: sempre que a call stack esvazia, o runtime drena a fila de microtasks inteira antes de avançar para a próxima fase do loop. Por isso C vem antes de B, mesmo o timer tendo sido registrado primeiro no código.\n\nNa prática isso importa quando você tem um `.then` que dispara outro `.then`: ele fura a fila na frente de qualquer timer que já estava esperando.',
          'A, D, C, B.\n\nA and D come out first because they are synchronous. Same tick, top to bottom, nothing interrupts them.\n\nsetTimeout does not schedule anything for "zero milliseconds from now". It registers a callback in the timer phase of the event loop, which is only reached after the stack is empty.\n\nThe `Promise.resolve().then` goes onto the microtask queue. That is the rule that actually matters: every time the call stack empties, the runtime drains the entire microtask queue before moving on to the next phase of the loop. So C comes before B even though the timer was registered first in the source.\n\nWhere this bites in practice is a `.then` that schedules another `.then` — it jumps the queue ahead of any timer that was already waiting.',
        ),
        deep: t(
          'Vale separar três coisas que costumam ser confundidas.\n\n**Call stack** — o que está executando agora. Enquanto tiver algo aqui, nada mais roda.\n\n**Fila de microtasks** — promises resolvidas, `queueMicrotask`, e no Node também `process.nextTick`, que na verdade tem prioridade ainda maior e roda antes das promises. Essa fila é drenada por completo, e microtasks agendadas durante a drenagem entram na mesma passada.\n\n**Fases do event loop** — timers, pending callbacks, poll, check (`setImmediate`), close. O loop caminha entre elas, e entre cada transição drena microtasks de novo.\n\nA consequência séria: um loop de promises que se re-agenda nunca devolve o controle para o loop. Se eu escrevo uma recursão com `Promise.resolve().then(loop)`, os timers nunca rodam e o processo trava sem nunca aparecer como CPU bloqueada por código síncrono. Já vi isso derrubar um health check.',
          'It helps to separate three things people tend to blur together.\n\n**The call stack** — what is running right now. While anything is here, nothing else runs.\n\n**The microtask queue** — resolved promises, `queueMicrotask`, and in Node also `process.nextTick`, which actually has even higher priority and runs before promises. This queue is drained completely, and microtasks scheduled during the drain join the same pass.\n\n**The event loop phases** — timers, pending callbacks, poll, check (`setImmediate`), close. The loop walks between them, and drains microtasks again between each transition.\n\nThe serious consequence: a promise loop that reschedules itself never gives control back to the loop. If I write a recursion like `Promise.resolve().then(loop)`, timers never fire and the process wedges without ever showing up as CPU blocked by synchronous code. I have watched that take down a health check.',
        ),
      }),
      lookingFor(
        list(
          [
            'A ordem correta, dita com segurança',
            'A distinção entre código síncrono e agendado',
            'Que setTimeout(0) não significa "imediatamente"',
            'A regra de drenar microtasks antes de mudar de fase',
            'Alguma consequência prática, não só a teoria',
          ],
          [
            'The correct order, said with confidence',
            'The distinction between synchronous and scheduled code',
            'That setTimeout(0) does not mean "immediately"',
            'The rule that microtasks drain before the loop changes phase',
            'Some practical consequence, not only the theory',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte não para na ordem: ela explica que microtasks podem causar starvation e dá um exemplo de onde isso apareceu em produção.',
            'A strong answer does not stop at the order. It explains that microtasks can starve the loop, and gives an example of where that showed up in production.',
          ),
          shallow: t(
            'Uma resposta superficial acerta a ordem de cor mas não consegue dizer por que C vem antes de B quando o entrevistador pergunta.',
            'A shallow answer gets the order right from memory but cannot say why C beats B when the interviewer asks.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Dizer que setTimeout com 0 executa imediatamente',
            'Chamar a fila de microtasks de "callback queue" e misturar as duas',
            'Afirmar que Promise é assíncrona "porque roda em outra thread"',
            'Decorar a ordem sem saber explicar a regra que a produz',
          ],
          [
            'Saying setTimeout with 0 runs immediately',
            'Calling the microtask queue "the callback queue" and blurring the two',
            'Claiming a Promise is asynchronous "because it runs on another thread"',
            'Memorising the order without being able to explain the rule behind it',
          ],
        ),
      ),
      tip(
        t(
          'Diga a ordem primeiro, em uma frase, e só depois explique. Entrevistador que faz essa pergunta quer saber se você chega à resposta — se você começar pela teoria antes de responder, parece que está ganhando tempo.',
          'Say the order first, in one sentence, and explain afterwards. An interviewer asking this wants to know whether you land the answer. Opening with theory before answering reads as stalling.',
        ),
      ),
      followUps(
        list(
          [
            'E se eu trocar o setTimeout por setImmediate?',
            'Onde process.nextTick entra nessa ordem?',
            'Como um loop de promises pode travar o event loop?',
            'A ordem muda entre Node.js e browser?',
          ],
          [
            'What if I swap the setTimeout for setImmediate?',
            'Where does process.nextTick sit in that order?',
            'How can a promise loop starve the event loop?',
            'Does the order change between Node.js and the browser?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-event-loop-single-thread',
    type: 'interview-question',
    title: t(
      'Milhares de requisições em uma thread só',
      'Thousands of requests on a single thread',
    ),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'performance'],
    difficulty: 'intermediate',
    tags: ['event-loop', 'concurrency', 'libuv', 'node'],
    minutes: 5,
    related: ['js-event-loop-order', 'node-blocking-cpu', 'js-worker-threads'],
    blocks: [
      prompt(
        t(
          'Esta API recebe milhares de requisições por segundo. Se o Node.js executa JavaScript em uma única thread, por que a aplicação não fica bloqueada? Explique o que acontece internamente.',
          'This API takes thousands of requests per second. If Node.js runs JavaScript on a single thread, why does the application not block? Explain what happens internally.',
        ),
      ),
      answers({
        short: t(
          'Porque quase tudo que uma API faz é esperar, não calcular. O JavaScript roda em uma thread só, mas as operações de I/O — rede, disco, banco — são delegadas ao sistema operacional pela libuv. Enquanto essas operações estão pendentes, a thread fica livre para atender outras requisições. Ela só volta a trabalhar quando o resultado chega e o callback é agendado.',
          'Because almost everything an API does is waiting, not computing. JavaScript runs on one thread, but the I/O work — network, disk, database — is handed off to the operating system through libuv. While those operations are pending, the thread is free to take other requests. It only picks the work back up when the result comes in and the callback gets scheduled.',
        ),
        strong: t(
          'O ponto é que a thread única é de execução de JavaScript, não de trabalho.\n\nQuando eu faço uma query no banco, o Node não fica parado esperando. Ele registra a operação, entrega para a libuv, e a libuv usa o mecanismo do sistema operacional — epoll no Linux, kqueue no BSD — para ser notificada quando o socket tiver resposta. Nesse meio tempo, a thread volta para o event loop e pega a próxima requisição.\n\nEntão a concorrência vem do fato de que o trabalho é esperar. Com mil requisições esperando o banco, você tem mil operações pendentes e uma thread ociosa, não mil threads bloqueadas. É por isso que o modelo escala bem para I/O.\n\nO contraponto, que eu sempre menciono: isso desaba no momento em que aparece CPU. Se eu processar uma imagem ou fizer um JSON.parse de dez megabytes no meio do handler, eu bloqueio a thread e todas as outras requisições ficam na fila atrás daquilo. Aí a solução é worker thread, ou tirar aquele trabalho do processo.',
          'The key thing is that the single thread is for running JavaScript, not for doing the work.\n\nWhen I make a database query, Node does not sit there waiting. It registers the operation, hands it to libuv, and libuv uses the operating system mechanism — epoll on Linux, kqueue on BSD — to get notified when the socket has data. Meanwhile the thread goes back to the event loop and picks up the next request.\n\nSo the concurrency comes from the fact that the work is waiting. With a thousand requests waiting on the database, you have a thousand pending operations and one idle thread, not a thousand blocked threads. That is why the model scales well for I/O.\n\nThe counterpoint, which I always bring up: it falls apart the moment CPU shows up. If I process an image or JSON.parse ten megabytes inside the handler, I block the thread and every other request queues behind it. That is when you reach for a worker thread, or move that work out of the process entirely.',
        ),
        deep: t(
          'Duas coisas que costumam faltar na resposta.\n\n**Nem todo I/O é assíncrono de verdade.** Rede é: o kernel avisa. Sistema de arquivos não é, na maioria das plataformas — a libuv resolve isso com um thread pool, que por padrão tem quatro threads. Então `fs.readFile` e operações de crypto como `pbkdf2` consomem esse pool. Se você saturar as quatro threads, o I/O de arquivo começa a formar fila mesmo com o event loop livre. Dá para aumentar com `UV_THREADPOOL_SIZE`, mas o mais importante é saber que esse limite existe.\n\n**O event loop tem latência mensurável.** Eu monitoro event loop lag em produção — `perf_hooks.monitorEventLoopDelay` no Node. Se o p99 do lag sobe, é sinal de que algum handler está segurando a thread, e isso aparece como latência em endpoints que não têm nada a ver com o culpado. É uma das métricas mais úteis que existem em um serviço Node e quase ninguém coleta.\n\nE horizontalmente: uma thread não usa uma máquina de oito núcleos. Em produção eu rodo com o módulo cluster ou várias réplicas atrás de um load balancer, uma por núcleo.',
          'Two things usually missing from the answer.\n\n**Not all I/O is genuinely async.** Network is: the kernel notifies you. The filesystem is not, on most platforms — libuv covers that with a thread pool, four threads by default. So `fs.readFile` and crypto work like `pbkdf2` consume that pool. Saturate those four threads and file I/O starts queueing even with a free event loop. You can raise it with `UV_THREADPOOL_SIZE`, but the important part is knowing the limit is there at all.\n\n**The event loop has measurable latency.** I monitor event loop lag in production — `perf_hooks.monitorEventLoopDelay` in Node. When p99 lag climbs, something is holding the thread, and it shows up as latency on endpoints that have nothing to do with the culprit. It is one of the most useful metrics a Node service can have and almost nobody collects it.\n\nAnd horizontally: one thread does not use an eight-core box. In production I run the cluster module or several replicas behind a load balancer, roughly one per core.',
        ),
      }),
      lookingFor(
        list(
          [
            'Separar "thread de JavaScript" de "thread de trabalho"',
            'Mencionar libuv e a delegação para o sistema operacional',
            'Entender que I/O é espera, não processamento',
            'Reconhecer que CPU bloqueante quebra o modelo',
            'Saber o que fazer quando quebra: worker threads, fila, outro processo',
          ],
          [
            'Separating "the JavaScript thread" from "the thread doing the work"',
            'Mentioning libuv and the handoff to the operating system',
            'Understanding that I/O is waiting, not processing',
            'Recognising that blocking CPU breaks the model',
            'Knowing what to do when it breaks: worker threads, a queue, another process',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte menciona o thread pool da libuv e o fato de que operações de arquivo e crypto não são realmente assíncronas.',
            'A strong answer brings up the libuv thread pool and the fact that file and crypto work is not genuinely async.',
          ),
          shallow: t(
            'Uma resposta superficial repete "Node é não-bloqueante e assíncrono" sem explicar quem está esperando no lugar da thread.',
            'A shallow answer repeats "Node is non-blocking and asynchronous" without explaining who is doing the waiting instead of the thread.',
          ),
        },
      ),
      diagram(
        t('Onde o trabalho realmente acontece', 'Where the work actually happens'),
        [
          { id: 'js', label: t('Thread de JavaScript', 'JavaScript thread'), col: 0, row: 0, tone: 'accent' },
          { id: 'loop', label: t('Event loop', 'Event loop'), col: 1, row: 0 },
          { id: 'uv', label: t('libuv', 'libuv'), col: 2, row: 0 },
          { id: 'os', label: t('Kernel (epoll / kqueue)', 'Kernel (epoll / kqueue)'), col: 3, row: 0 },
          { id: 'pool', label: t('Thread pool (4)', 'Thread pool (4)'), col: 3, row: 1, tone: 'muted' },
        ],
        [
          { from: 'js', to: 'loop' },
          { from: 'loop', to: 'uv' },
          { from: 'uv', to: 'os', label: t('rede', 'network') },
          { from: 'uv', to: 'pool', label: t('arquivo, crypto', 'file, crypto') },
          { from: 'os', to: 'loop', label: t('callback', 'callback'), dashed: true },
          { from: 'pool', to: 'loop', dashed: true },
        ],
        t(
          'A thread de JavaScript nunca espera: quem espera é o kernel ou o thread pool.',
          'The JavaScript thread never waits. The kernel or the thread pool does the waiting.',
        ),
      ),
      mistakes(
        list(
          [
            'Dizer que o Node é multithread por baixo e parar aí',
            'Confundir concorrência com paralelismo',
            'Não saber dizer o que acontece se um handler fizer trabalho pesado de CPU',
            'Ignorar que uma única instância não usa todos os núcleos',
          ],
          [
            'Saying Node is multithreaded underneath and stopping there',
            'Conflating concurrency with parallelism',
            'Not being able to say what happens when a handler does heavy CPU work',
            'Ignoring that a single instance does not use every core',
          ],
        ),
      ),
      tip(
        t(
          'Essa pergunta é um convite para você mostrar experiência de produção. Depois de explicar o modelo, diga em uma frase como você percebeu isso na prática — event loop lag, um endpoint que derrubou os outros. É o que separa quem leu de quem operou.',
          'This question is an invitation to show production experience. After explaining the model, say in one sentence how you have seen it in practice — event loop lag, one endpoint taking the others down. That is what separates having read about it from having run it.',
        ),
      ),
      followUps(
        list(
          [
            'O que acontece se um handler fizer um cálculo pesado de CPU?',
            'Como você detectaria que o event loop está travando?',
            'Quando vale a pena usar worker threads?',
            'Como você usaria todos os núcleos da máquina?',
          ],
          [
            'What happens if a handler does a heavy CPU computation?',
            'How would you detect the event loop stalling?',
            'When are worker threads worth it?',
            'How would you use every core on the machine?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-closure-loop-var',
    type: 'code-reading',
    trap: true,
    title: t('Closures dentro de um loop', 'Closures inside a loop'),
    categoryId: 'javascript',
    stackIds: ['javascript'],
    skillIds: ['javascript'],
    difficulty: 'intermediate',
    tags: ['closures', 'scope', 'var', 'let', 'hoisting'],
    minutes: 4,
    related: ['js-event-loop-order', 'js-this-binding'],
    blocks: [
      prompt(
        t(
          'O que este código imprime? E o que muda se `var` virar `let`?',
          'What does this print? And what changes if `var` becomes `let`?',
        ),
      ),
      code(
        'javascript',
        `
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
`,
      ),
      expected(
        `3
3
3`,
        t(
          'Com `let`, imprime 0, 1, 2.',
          'With `let`, it prints 0, 1, 2.',
        ),
      ),
      answers({
        short: t(
          'Imprime 3, 3, 3. `var` tem escopo de função, então existe uma única variável `i` compartilhada pelas três closures. Quando os callbacks rodam, o loop já terminou e `i` vale 3. Trocando para `let`, cada iteração ganha o seu próprio binding, e a saída vira 0, 1, 2.',
          'It prints 3, 3, 3. `var` is function-scoped, so there is a single `i` shared by all three closures. By the time the callbacks run, the loop has finished and `i` is 3. Switch to `let` and each iteration gets its own binding, so the output becomes 0, 1, 2.',
        ),
        strong: t(
          '3, 3, 3.\n\nDuas coisas se combinam aqui. Primeiro, `var` tem escopo de função, não de bloco — existe uma variável `i` só, e as três arrow functions fecham sobre a mesma. Segundo, os callbacks do setTimeout só executam depois que a stack esvazia, ou seja, depois que o loop terminou e `i` já chegou a 3.\n\nEntão não é que a closure "capturou o valor errado". Ela capturou a variável, não o valor, e quando foi lida a variável valia 3.\n\nCom `let`, a especificação cria um binding novo por iteração e copia o valor do anterior no começo de cada volta. Cada closure fecha sobre um binding diferente, e a saída fica 0, 1, 2.\n\nAntes do `let` existir, o jeito de resolver era criar um escopo na mão com uma IIFE, ou passar `i` como argumento para o setTimeout. Hoje é só usar `let`.',
          'Three, three, three.\n\nTwo things combine here. First, `var` is function-scoped rather than block-scoped — there is exactly one `i`, and all three arrow functions close over that same one. Second, the setTimeout callbacks only run after the stack empties, which is after the loop has finished and `i` has reached 3.\n\nSo it is not that the closure "captured the wrong value". It captured the variable, not the value, and by the time it was read the variable was 3.\n\nWith `let`, the spec creates a fresh binding per iteration and copies the previous value in at the top of each pass. Each closure closes over a different binding, and you get 0, 1, 2.\n\nBefore `let` existed, you fixed it by making a scope by hand with an IIFE, or by passing `i` as an argument to setTimeout. These days you just use `let`.',
        ),
      }),
      lookingFor(
        list(
          [
            'A saída correta nas duas versões',
            'Closure captura a variável, não o valor',
            'Escopo de função versus escopo de bloco',
            'Por que o timing do setTimeout importa aqui',
          ],
          [
            'The correct output in both versions',
            'A closure captures the variable, not the value',
            'Function scope versus block scope',
            'Why the setTimeout timing matters here',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Dizer 0, 1, 2 sem pensar no momento em que o callback roda',
            'Explicar como "bug do JavaScript" em vez de comportamento especificado',
            'Não saber explicar o que exatamente `let` faz diferente',
          ],
          [
            'Saying 0, 1, 2 without thinking about when the callback runs',
            'Explaining it as "a JavaScript bug" rather than specified behaviour',
            'Not being able to say what exactly `let` does differently',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você resolveria isso sem usar let?',
            'O que é a temporal dead zone?',
            'Closures podem causar vazamento de memória? Como?',
          ],
          [
            'How would you fix this without using let?',
            'What is the temporal dead zone?',
            'Can closures cause memory leaks? How?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-this-binding',
    type: 'code-reading',
    trap: true,
    title: t('Para onde o this aponta', 'Where this points'),
    categoryId: 'javascript',
    stackIds: ['javascript'],
    skillIds: ['javascript'],
    difficulty: 'intermediate',
    tags: ['this', 'binding', 'arrow-functions', 'context'],
    minutes: 4,
    related: ['js-closure-loop-var'],
    blocks: [
      prompt(
        t(
          'O que acontece quando cada uma dessas chamadas executa?',
          'What happens when each of these calls runs?',
        ),
      ),
      code(
        'javascript',
        `
const counter = {
  count: 0,
  incrementRegular() {
    setTimeout(function () {
      this.count++;
      console.log(this.count);
    }, 0);
  },
  incrementArrow() {
    setTimeout(() => {
      this.count++;
      console.log(this.count);
    }, 0);
  },
};

counter.incrementRegular();
counter.incrementArrow();
`,
      ),
      expected(
        `NaN
1`,
        t(
          'Em módulo ES ou modo estrito, a primeira lança TypeError em vez de imprimir NaN.',
          'In an ES module or strict mode, the first one throws a TypeError instead of printing NaN.',
        ),
      ),
      answers({
        short: t(
          'A primeira imprime NaN, a segunda imprime 1. Em uma `function` comum, `this` é definido por como a função é chamada — e o setTimeout chama ela sem receiver, então `this` não é o objeto. A arrow function não tem `this` próprio: ela herda o do escopo onde foi escrita, que é o método, e ali `this` é o `counter`.',
          'The first prints NaN, the second prints 1. In a regular `function`, `this` is decided by how the function is called — and setTimeout calls it with no receiver, so `this` is not the object. An arrow function has no `this` of its own: it inherits from the scope where it was written, which is the method, and there `this` is `counter`.',
        ),
        strong: t(
          'NaN e depois 1.\n\nNa versão com `function`, o callback é chamado pelo setTimeout, não pelo objeto. Como `this` em função comum depende do call site, ele vira o objeto global — ou `undefined` em modo estrito. `this.count` é `undefined`, `undefined++` é NaN, e imprime NaN. Em um módulo ES, onde tudo é estrito, isso nem chega a imprimir: lança TypeError ao tentar ler `count` de `undefined`.\n\nNa versão com arrow, não existe binding de `this` próprio. A arrow herda léxicamente, e o escopo onde ela está escrita é o método `incrementArrow`, chamado como `counter.incrementArrow()`. Então `this` é `counter`, o contador vai para 1 e imprime 1.\n\nA regra que eu uso na cabeça: função comum, `this` depende de quem chamou; arrow, `this` depende de onde foi escrita. É por isso que arrow é a escolha certa para callback dentro de método, e a escolha errada para método de objeto.',
          'NaN, then 1.\n\nIn the `function` version, the callback is invoked by setTimeout, not by the object. Since `this` in a regular function depends on the call site, it becomes the global object — or `undefined` in strict mode. `this.count` is `undefined`, `undefined++` is NaN, so it prints NaN. In an ES module, where everything is strict, it does not even get that far: it throws a TypeError trying to read `count` of `undefined`.\n\nIn the arrow version there is no own `this` binding at all. An arrow inherits lexically, and the scope it is written in is the `incrementArrow` method, called as `counter.incrementArrow()`. So `this` is `counter`, the count goes to 1, and it prints 1.\n\nThe rule I keep in my head: regular function, `this` depends on who called it; arrow, `this` depends on where it was written. That is why an arrow is the right choice for a callback inside a method, and the wrong choice for an object method.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber que `this` em função comum vem do call site',
            'Saber que arrow herda `this` léxicamente',
            'Notar a diferença entre modo estrito e não estrito',
            'Saber quando usar cada uma',
          ],
          [
            'Knowing `this` in a regular function comes from the call site',
            'Knowing an arrow inherits `this` lexically',
            'Noticing the difference between strict and sloppy mode',
            'Knowing when to use each',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Dizer que arrow function "é só uma sintaxe mais curta"',
            'Achar que `this` é definido onde a função foi declarada, em função comum',
            'Usar arrow como método de objeto e depois estranhar o resultado',
          ],
          [
            'Saying an arrow function is "just shorter syntax"',
            'Thinking `this` in a regular function is set where it was declared',
            'Using an arrow as an object method and then being surprised',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como bind, call e apply mudam isso?',
            'Por que arrow function não serve como método de objeto?',
            'O que acontece com `this` dentro de uma classe?',
          ],
          [
            'How do bind, call and apply change this?',
            'Why is an arrow function a bad object method?',
            'What happens to `this` inside a class?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-async-error-handling',
    type: 'find-the-bug',
    title: t('Erros que somem no async', 'Errors that vanish in async code'),
    categoryId: 'javascript',
    stackIds: ['nodejs', 'javascript'],
    skillIds: ['javascript', 'nodejs'],
    difficulty: 'advanced',
    tags: ['async', 'error-handling', 'promises', 'unhandled-rejection'],
    minutes: 5,
    related: ['node-error-handling-api', 'js-event-loop-order'],
    blocks: [
      setupText(
        t(
          'Este handler está em produção. De vez em quando uma requisição fica pendurada até dar timeout no cliente, e não aparece nenhum erro no log.',
          'This handler is in production. Every so often a request hangs until the client times out, and nothing shows up in the logs.',
        ),
      ),
      prompt(
        t(
          'Qual é o problema, por que ele acontece, e como você corrigiria?',
          'What is the problem, why does it happen, and how would you fix it?',
        ),
      ),
      code(
        'javascript',
        `
app.post("/orders", async (req, res) => {
  try {
    const order = await createOrder(req.body);

    items.forEach(async (item) => {
      await reserveStock(item);
    });

    res.status(201).json(order);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal error" });
  }
});
`,
        { highlightLines: [5, 6, 7] },
      ),
      answers({
        short: t(
          'O `forEach` com callback async não espera nada. Ele dispara as promises e segue em frente, então o `res.status(201)` responde antes das reservas terminarem. Pior: se `reserveStock` rejeitar, aquela rejeição não passa pelo `try/catch`, porque o catch já saiu de escopo — vira unhandled rejection. A correção é usar `for...of` com await, ou `Promise.all` se puder ser em paralelo.',
          'The `forEach` with an async callback does not wait for anything. It fires the promises and moves on, so `res.status(201)` responds before the reservations finish. Worse: if `reserveStock` rejects, that rejection never reaches the `try/catch`, because the catch has already gone out of scope — it becomes an unhandled rejection. The fix is `for...of` with await, or `Promise.all` if they can run in parallel.',
        ),
        strong: t(
          'Tem dois bugs, e o segundo é o que explica o log vazio.\n\n**O forEach não espera.** `Array.prototype.forEach` ignora o valor de retorno do callback. Como o callback é async, ele retorna uma promise, e o forEach descarta. O resultado é que o código chega no `res.json(order)` com as reservas ainda em andamento. O cliente recebe 201 para um pedido que pode não ter estoque reservado.\n\n**As rejeições escapam do try/catch.** O `try/catch` só captura o que acontece dentro do fluxo que ele está aguardando. Como ninguém deu await nas promises do forEach, uma rejeição ali vira unhandled rejection — que no Node moderno derruba o processo por padrão, e em versões antigas só emitia um warning. É por isso que não aparece nada no logger: o erro nunca passou pelo catch.\n\nA correção depende de uma pergunta de produto: as reservas podem ser em paralelo?\n\nSe sim, `await Promise.all(items.map(item => reserveStock(item)))`. Se a ordem importa ou o serviço tem rate limit, `for (const item of items) { await reserveStock(item); }`.\n\nE eu levantaria uma terceira coisa em code review: se uma reserva falhar no meio, o pedido já foi criado. Isso precisa de compensação ou de uma transação — senão fica pedido criado com estoque parcial.',
          'There are two bugs, and the second one explains the empty log.\n\n**forEach does not wait.** `Array.prototype.forEach` ignores the callback\'s return value. The callback is async, so it returns a promise, and forEach throws it away. The result is that execution reaches `res.json(order)` while the reservations are still in flight. The client gets a 201 for an order that may have no stock reserved.\n\n**The rejections escape the try/catch.** A `try/catch` only catches what happens inside the flow it is awaiting. Since nobody awaited the forEach promises, a rejection there becomes an unhandled rejection — which in modern Node kills the process by default, and in older versions just printed a warning. That is why nothing reaches the logger: the error never went through the catch.\n\nThe fix depends on a product question: can the reservations run in parallel?\n\nIf yes, `await Promise.all(items.map(item => reserveStock(item)))`. If order matters or the service is rate limited, `for (const item of items) { await reserveStock(item); }`.\n\nAnd I would raise a third thing in code review: if one reservation fails halfway, the order has already been created. That needs a compensating action or a transaction, otherwise you end up with an order holding partial stock.',
        ),
        deep: t(
          'Vale falar do trade-off entre `Promise.all` e `Promise.allSettled`.\n\n`Promise.all` rejeita na primeira falha, mas não cancela as outras — elas continuam rodando. Se cada uma tiver efeito colateral, como reservar estoque, você pode acabar com metade das reservas feitas e um erro na mão. `allSettled` espera todas e devolve o resultado de cada uma, o que deixa você decidir o que compensar.\n\nPara este caso eu provavelmente usaria `allSettled`, olharia quais falharam e liberaria as que deram certo, ou mandaria o pedido para um estado `pending_stock` e deixaria um job resolver. Responder 201 e limpar depois em background é geralmente melhor experiência do que segurar a requisição.\n\nE no nível do processo: eu sempre registro `process.on("unhandledRejection")` para logar antes de morrer. Não para continuar rodando — um processo em estado desconhecido deve morrer — mas para que o incidente tenha stack trace em vez de um silêncio.',
          'It is worth talking about the trade-off between `Promise.all` and `Promise.allSettled`.\n\n`Promise.all` rejects on the first failure, but it does not cancel the others — they keep running. If each one has a side effect, like reserving stock, you can end up with half the reservations made and an error in your hand. `allSettled` waits for all of them and hands back each outcome, which lets you decide what to compensate.\n\nFor this case I would probably use `allSettled`, look at which ones failed, and release the ones that succeeded — or move the order into a `pending_stock` state and let a job resolve it. Answering 201 and cleaning up in the background is usually a better experience than holding the request open.\n\nAnd at the process level: I always register `process.on("unhandledRejection")` to log before dying. Not to keep running — a process in an unknown state should die — but so the incident has a stack trace instead of silence.',
        ),
      }),
      lookingFor(
        list(
          [
            'Identificar que forEach não aguarda callback async',
            'Explicar por que o try/catch não pega a rejeição',
            'Conectar isso ao sintoma: resposta antecipada e log vazio',
            'Propor a correção certa para o caso (serial ou paralelo)',
            'Notar o problema de consistência que sobra',
          ],
          [
            'Spotting that forEach does not await an async callback',
            'Explaining why the try/catch misses the rejection',
            'Connecting that to the symptom: early response and empty log',
            'Proposing the right fix for the case (serial or parallel)',
            'Noticing the consistency problem that remains',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte pergunta se as reservas podem ser paralelas antes de escolher a correção, e menciona o que fazer quando uma falha no meio.',
            'A strong answer asks whether the reservations can run in parallel before choosing a fix, and mentions what to do when one fails halfway.',
          ),
        },
      ),
      warn(
        t(
          'Trocar `forEach` por `map` sem `await Promise.all` corrige nada: continua disparando e seguindo.',
          'Swapping `forEach` for `map` without `await Promise.all` fixes nothing: it still fires and moves on.',
        ),
      ),
      mistakes(
        list(
          [
            'Trocar forEach por map e achar que resolveu',
            'Usar Promise.all sem pensar no efeito colateral parcial',
            'Não perceber que a resposta é enviada antes do trabalho terminar',
          ],
          [
            'Swapping forEach for map and calling it fixed',
            'Reaching for Promise.all without thinking about partial side effects',
            'Not noticing the response is sent before the work finishes',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Quando você usaria allSettled em vez de all?',
            'Como você garantiria consistência se uma reserva falhar?',
            'O que acontece com unhandled rejection no Node atual?',
          ],
          [
            'When would you use allSettled instead of all?',
            'How would you keep consistency if one reservation fails?',
            'What happens to an unhandled rejection in current Node?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-microtask-starvation',
    type: 'debugging',
    title: t('O processo trava sem CPU alta', 'The process wedges with no CPU spike'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'observability', 'performance'],
    difficulty: 'expert',
    tags: ['event-loop', 'microtasks', 'starvation', 'debugging'],
    minutes: 6,
    related: ['js-event-loop-order', 'js-event-loop-single-thread'],
    blocks: [
      setupText(
        t(
          'Um serviço Node para de responder depois de alguns minutos sob carga. O health check falha por timeout. A CPU do container está em 100%, mas nenhum profiler aponta uma função pesada — o tempo aparece espalhado.',
          'A Node service stops responding after a few minutes under load. The health check times out. Container CPU is pinned at 100%, but no profiler points at a heavy function — the time looks spread out.',
        ),
      ),
      prompt(
        t(
          'O que você investigaria, e qual hipótese você testaria primeiro?',
          'What would you investigate, and which hypothesis would you test first?',
        ),
      ),
      answers({
        short: t(
          'CPU em 100% com o profiler espalhado me faz suspeitar de starvation do event loop por microtasks, não de uma função lenta. Alguma promise está se re-agendando em cadeia, e como microtasks são drenadas por completo antes do loop mudar de fase, os timers e o I/O nunca chegam a rodar. Eu mediria event loop lag primeiro — se ele explodir enquanto nenhuma função individual aparece cara, é isso.',
          'CPU pinned with the profiler spread out makes me suspect event loop starvation from microtasks rather than one slow function. Some promise chain is rescheduling itself, and since microtasks drain completely before the loop changes phase, timers and I/O never get a turn. I would measure event loop lag first — if that explodes while no single function looks expensive, that is the answer.',
        ),
        strong: t(
          'O sintoma já elimina metade das hipóteses. CPU alta descarta deadlock de I/O. Profiler sem um pico claro descarta uma função quadrática óbvia. O que sobra é trabalho que roda muitas vezes, rápido, em loop.\n\nMinha ordem de investigação:\n\n**Primeiro, event loop lag.** `monitorEventLoopDelay` do `perf_hooks`, ou simplesmente um `setInterval` que mede o atraso entre o esperado e o real. Se o lag estiver em segundos, o loop está sendo segurado.\n\n**Segundo, distinguir síncrono de microtask.** Se o lag vem de um bloco síncrono grande, o profiler mostraria uma função gorda. Como não mostra, eu suspeito de microtask starvation: uma cadeia de `.then` ou `process.nextTick` que se realimenta. A fila de microtasks é drenada até esvaziar, e se ela nunca esvazia, o loop nunca avança de fase. Timer nenhum roda. Socket nenhum é lido. Health check morre.\n\n**Terceiro, achar o culpado.** Eu tiraria um heap snapshot e olharia o crescimento, mas o mais direto é `--cpu-prof` e olhar não pela função mais cara e sim pela mais chamada. Padrões clássicos: retry com `Promise.resolve().then(retry)` sem backoff, um stream processado com recursão de promise, ou um `await` dentro de um `while (true)` sobre uma condição que ficou sempre verdadeira.\n\n**A correção** é devolver o controle ao loop: trocar a recursão de microtask por `setImmediate`, que agenda na fase de check e deixa o I/O respirar. Ou colocar um backoff de verdade no retry.',
          'The symptom already rules out half the hypotheses. Pinned CPU rules out an I/O deadlock. A profiler with no clear peak rules out an obvious quadratic function. What is left is work that runs many times, fast, in a loop.\n\nMy order of investigation:\n\n**First, event loop lag.** `monitorEventLoopDelay` from `perf_hooks`, or just a `setInterval` measuring the gap between expected and actual. If lag is in seconds, something is holding the loop.\n\n**Second, separate synchronous from microtask.** If the lag came from one big synchronous block, the profiler would show a fat function. It does not, so I suspect microtask starvation: a `.then` or `process.nextTick` chain feeding itself. The microtask queue drains until empty, and if it never empties, the loop never advances a phase. No timer fires. No socket gets read. The health check dies.\n\n**Third, find the culprit.** I would take a heap snapshot and watch growth, but the most direct route is `--cpu-prof` and looking not for the most expensive function but for the most called one. Classic shapes: a retry written as `Promise.resolve().then(retry)` with no backoff, a stream processed with promise recursion, or an `await` inside a `while (true)` on a condition that became permanently true.\n\n**The fix** is giving control back to the loop: replace the microtask recursion with `setImmediate`, which schedules in the check phase and lets I/O breathe. Or put a real backoff on the retry.',
        ),
      }),
      lookingFor(
        list(
          [
            'Usar o sintoma para eliminar hipóteses antes de chutar',
            'Saber medir event loop lag',
            'Conhecer starvation por microtask como categoria de falha',
            'Diferenciar bloqueio síncrono de fila que não esvazia',
            'Propor setImmediate ou backoff como correção',
          ],
          [
            'Using the symptom to eliminate hypotheses before guessing',
            'Knowing how to measure event loop lag',
            'Knowing microtask starvation as a failure category at all',
            'Telling a synchronous block apart from a queue that never empties',
            'Proposing setImmediate or a backoff as the fix',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte escolhe a primeira medição de propósito e justifica por que ela discrimina entre as hipóteses.',
            'A strong answer picks the first measurement on purpose and says why it discriminates between the hypotheses.',
          ),
          shallow: t(
            'Uma resposta superficial lista ferramentas sem dizer o que cada uma provaria.',
            'A shallow answer lists tools without saying what each one would prove.',
          ),
        },
      ),
      code(
        'javascript',
        `
// The shape that causes it: the queue never drains.
function poll() {
  return checkQueue().then((job) => {
    if (job) process(job);
    return poll(); // microtask recursion — the loop never advances
  });
}

// The fix: hand control back to the event loop.
function poll() {
  return checkQueue().then((job) => {
    if (job) process(job);
    setImmediate(poll); // check phase — I/O gets a turn
  });
}
`,
        {
          phase: 'answer',
          caption: t('A forma do bug e a correção', 'The shape of the bug and the fix'),
        },
      ),
      followUps(
        list(
          [
            'Qual a diferença entre setImmediate e setTimeout(0) aqui?',
            'Como process.nextTick piora esse problema?',
            'Que métrica você deixaria em produção para pegar isso antes?',
          ],
          [
            'What is the difference between setImmediate and setTimeout(0) here?',
            'How does process.nextTick make this worse?',
            'What metric would you leave in production to catch this earlier?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'node-set-immediate',
    type: 'compare',
    title: t('setImmediate, setTimeout e nextTick', 'setImmediate, setTimeout and nextTick'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'javascript'],
    difficulty: 'advanced',
    tags: ['event-loop', 'timers', 'node'],
    minutes: 4,
    related: ['js-event-loop-order', 'js-microtask-starvation'],
    blocks: [
      prompt(
        t(
          'Quando você usaria cada um: setImmediate, setTimeout(fn, 0) e process.nextTick?',
          'When would you use each: setImmediate, setTimeout(fn, 0) and process.nextTick?',
        ),
      ),
      answers({
        short: t(
          '`process.nextTick` roda antes de tudo, assim que a operação atual termina, antes até das promises — uso só para garantir que um callback seja assíncrono de forma consistente. `setImmediate` agenda na fase de check, depois do I/O da volta atual — é o que eu uso para devolver o controle ao loop no meio de trabalho pesado. `setTimeout(fn, 0)` agenda na fase de timers com um mínimo de um milissegundo, e a ordem dele em relação ao setImmediate no topo do programa não é determinística.',
          '`process.nextTick` runs before everything, right after the current operation finishes, ahead of promises even — I only use it to make a callback consistently asynchronous. `setImmediate` schedules in the check phase, after this turn\'s I/O — that is what I use to hand control back to the loop in the middle of heavy work. `setTimeout(fn, 0)` schedules in the timer phase with a one-millisecond floor, and its ordering against setImmediate at the top level of a program is not deterministic.',
        ),
        strong: t(
          'A diferença é em qual ponto do loop cada um entra.\n\n`process.nextTick` não faz parte do event loop. A fila dele é drenada assim que a operação corrente termina, antes das promises e antes de qualquer fase. Isso o torna a ferramenta mais perigosa das três: uma recursão de nextTick trava o loop por completo. Eu uso em um caso só — quando estou escrevendo uma API que às vezes responderia de forma síncrona, e eu quero que ela seja sempre assíncrona para não criar dois comportamentos diferentes para quem chama.\n\n`setImmediate` entra na fase de check, que vem depois da fase de poll. Na prática: ele roda depois do I/O que já estava pronto nesta volta. É o que eu uso para quebrar trabalho pesado em pedaços sem matar a responsividade — processo um lote, agendo o próximo com setImmediate, o loop atende o I/O no meio.\n\n`setTimeout(fn, 0)` vai para a fase de timers, e o zero vira um na prática. Dentro de um callback de I/O, setImmediate sempre roda antes do setTimeout, porque a fase de check vem logo depois do poll e a de timers só na volta seguinte. No topo do programa, a ordem depende de quanto tempo o processo levou para iniciar, então não dá para confiar.',
          'The difference is which point of the loop each one enters at.\n\n`process.nextTick` is not part of the event loop. Its queue drains as soon as the current operation finishes, before promises and before any phase. That makes it the most dangerous of the three: a nextTick recursion wedges the loop completely. I use it for exactly one thing — when I am writing an API that would sometimes respond synchronously and I want it to always be async, so callers do not get two different behaviours.\n\n`setImmediate` lands in the check phase, which comes after the poll phase. In practice: it runs after the I/O that was already ready on this turn. That is what I use to break heavy work into chunks without killing responsiveness — process a batch, schedule the next with setImmediate, let the loop serve I/O in between.\n\n`setTimeout(fn, 0)` goes to the timer phase, and the zero effectively becomes one. Inside an I/O callback, setImmediate always runs before setTimeout, because check comes right after poll and timers only come round on the next pass. At the top level of a program the order depends on how long startup took, so it is not something to rely on.',
        ),
      }),
      compare(
        t('setImmediate', 'setImmediate'),
        t('setTimeout(fn, 0)', 'setTimeout(fn, 0)'),
        [
          {
            aspect: t('Fase do loop', 'Loop phase'),
            left: t('Check, logo depois do poll', 'Check, right after poll'),
            right: t('Timers, no início da volta seguinte', 'Timers, at the start of the next pass'),
          },
          {
            aspect: t('Dentro de callback de I/O', 'Inside an I/O callback'),
            left: t('Sempre roda primeiro', 'Always runs first'),
            right: t('Roda na volta seguinte', 'Runs on the next pass'),
          },
          {
            aspect: t('No topo do programa', 'At the top level'),
            left: t('Ordem não determinística', 'Non-deterministic order'),
            right: t('Ordem não determinística', 'Non-deterministic order'),
          },
          {
            aspect: t('Uso típico', 'Typical use'),
            left: t('Ceder o loop entre lotes de trabalho', 'Yielding the loop between batches of work'),
            right: t('Adiar de verdade por tempo', 'Genuinely deferring by time'),
          },
        ],
        t(
          'Para ceder o controle ao loop, setImmediate é a escolha correta e a intenção fica explícita no código.',
          'For yielding control back to the loop, setImmediate is the right choice and the intent reads clearly in the code.',
        ),
      ),
      tip(
        t(
          'Se você não souber a ordem no topo do programa, diga que ela não é determinística. É a resposta certa, e admitir isso vale mais do que chutar uma das duas.',
          'If you do not know the top-level ordering, say it is non-deterministic. That is the correct answer, and admitting it is worth more than guessing one of the two.',
        ),
      ),
      followUps(
        list(
          [
            'Por que a ordem no topo do programa não é determinística?',
            'O que acontece se você recursivamente chamar nextTick?',
            'Como você quebraria um processamento pesado sem travar o loop?',
          ],
          [
            'Why is the top-level ordering non-deterministic?',
            'What happens if you recursively call nextTick?',
            'How would you break up heavy processing without stalling the loop?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-coercion-equality',
    type: 'code-reading',
    trap: true,
    title: t('Comparações que não parecem', 'Comparisons that are not what they look like'),
    categoryId: 'javascript',
    stackIds: ['javascript'],
    skillIds: ['javascript'],
    difficulty: 'intermediate',
    tags: ['coercion', 'equality', 'types'],
    minutes: 3,
    related: ['js-this-binding', 'js-closure-loop-var'],
    blocks: [
      prompt(
        t('O que cada linha imprime, e por quê?', 'What does each line print, and why?'),
      ),
      code(
        'javascript',
        `
console.log([] == false);
console.log([] === false);
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);
console.log(typeof null);
`,
      ),
      expected(
        `true
false
true
false
false
"object"`,
      ),
      answers({
        short: t(
          'true, false, true, false, false, "object". O `==` converte os dois lados antes de comparar: `[]` vira string vazia, vira 0, e `false` também vira 0. O `===` não converte, então array nunca é igual a boolean. `null == undefined` é true por uma regra explícita da spec, mas eles são tipos diferentes, então `===` dá false. `NaN` não é igual a nada, nem a si mesmo. E `typeof null` retornar "object" é um bug histórico que nunca foi corrigido por compatibilidade.',
          'true, false, true, false, false, "object". `==` converts both sides before comparing: `[]` becomes an empty string, becomes 0, and `false` becomes 0 too. `===` does not convert, so an array is never equal to a boolean. `null == undefined` is true by an explicit rule in the spec, but they are different types, so `===` is false. `NaN` is not equal to anything, including itself. And `typeof null` returning "object" is a historical bug kept for compatibility.',
        ),
        strong: t(
          'Vou pelas regras em vez de decorar cada caso.\n\n`[] == false` é true porque `==` aplica coerção. O `false` vira 0. O `[]` passa por ToPrimitive, que chama `join`, resultando em string vazia, e a string vazia vira 0. Zero igual a zero, true.\n\n`[] === false` é false direto: tipos diferentes, o `===` nem compara valor.\n\n`null == undefined` é true porque a spec tem uma regra específica dizendo que eles são equivalentes com `==`, sem passar por coerção numérica. É justamente essa regra que faz `x == null` ser um jeito idiomático de testar "é null ou undefined".\n\n`null === undefined` é false porque os tipos são diferentes.\n\n`NaN === NaN` é false porque NaN é definido pelo IEEE 754 como não igual a nada. Para testar, `Number.isNaN` ou `Object.is`.\n\n`typeof null` é "object" por causa de como os valores eram representados na primeira implementação. Corrigir quebraria a web, então ficou.\n\nNa prática eu uso `===` sempre, com uma exceção: `== null` quando quero pegar os dois de uma vez.',
          'I would go by the rules rather than memorising each case.\n\n`[] == false` is true because `==` applies coercion. `false` becomes 0. `[]` goes through ToPrimitive, which calls `join`, producing an empty string, and an empty string becomes 0. Zero equals zero, true.\n\n`[] === false` is false immediately: different types, `===` does not even compare values.\n\n`null == undefined` is true because the spec has a specific rule saying they are equivalent under `==`, without any numeric coercion. That rule is exactly why `x == null` is the idiomatic way to test for "null or undefined".\n\n`null === undefined` is false because the types differ.\n\n`NaN === NaN` is false because IEEE 754 defines NaN as not equal to anything. To test it you use `Number.isNaN` or `Object.is`.\n\n`typeof null` is "object" because of how values were tagged in the first implementation. Fixing it would break the web, so it stayed.\n\nIn practice I use `===` everywhere, with one exception: `== null` when I want to catch both at once.',
        ),
      }),
      lookingFor(
        list(
          [
            'Explicar a regra, não decorar os casos',
            'Saber que == faz coerção e === não',
            'Conhecer a regra especial de null e undefined',
            'Saber testar NaN corretamente',
          ],
          [
            'Explaining the rule rather than reciting cases',
            'Knowing == coerces and === does not',
            'Knowing the special null/undefined rule',
            'Knowing how to test for NaN properly',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Quando você usaria == de propósito?',
            'O que Object.is resolve que === não resolve?',
            'Por que [] + {} e {} + [] dão resultados diferentes no console?',
          ],
          [
            'When would you use == on purpose?',
            'What does Object.is solve that === does not?',
            'Why do [] + {} and {} + [] differ in the console?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'node-blocking-cpu',
    type: 'scenario',
    title: t('Um endpoint derrubando todos os outros', 'One endpoint taking down all the others'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'performance', 'architecture'],
    difficulty: 'advanced',
    tags: ['cpu', 'worker-threads', 'event-loop', 'scaling'],
    minutes: 5,
    related: ['js-event-loop-single-thread', 'js-worker-threads'],
    blocks: [
      setupText(
        t(
          'Você adicionou um endpoint que gera um relatório em PDF. Desde então, a latência p99 de toda a API subiu, inclusive de endpoints que só leem cache.',
          'You shipped an endpoint that generates a PDF report. Since then, p99 latency across the whole API has gone up, including endpoints that only read from cache.',
        ),
      ),
      prompt(
        t('O que está acontecendo e o que você faria?', 'What is going on and what would you do?'),
      ),
      answers({
        short: t(
          'A geração do PDF é trabalho de CPU rodando na mesma thread que atende todo o resto. Enquanto ela roda, o event loop não processa mais nada — por isso até o endpoint de cache fica lento. Eu tiraria esse trabalho do caminho da requisição: ou uma worker thread, ou melhor, uma fila com um worker separado, respondendo 202 e entregando o PDF depois.',
          'The PDF generation is CPU work running on the same thread that serves everything else. While it runs, the event loop processes nothing — which is why even the cache endpoint gets slow. I would get that work off the request path: either a worker thread, or better, a queue with a separate worker, responding 202 and delivering the PDF afterwards.',
        ),
        strong: t(
          'O sintoma é a assinatura clássica de bloqueio do event loop: a latência sobe em endpoints que não têm relação nenhuma com o novo. Isso só acontece quando o recurso compartilhado é a thread.\n\nGerar PDF é CPU pura. Enquanto aquele handler está calculando, nenhum outro callback roda. Uma requisição de PDF que leva dois segundos adiciona até dois segundos de latência a qualquer coisa que chegue naquele intervalo.\n\nPrimeiro eu confirmaria com dado: event loop lag correlacionado com as chamadas ao endpoint novo. Não quero refatorar em cima de uma teoria.\n\nDepois, as opções, da menos para a mais invasiva:\n\n**Worker thread.** Tira o cálculo da thread principal e mantém a resposta síncrona do ponto de vista do cliente. Resolve o bloqueio, mas continua consumindo CPU da mesma máquina e segurando a conexão aberta.\n\n**Fila e worker separado.** O endpoint enfileira, responde 202 com um id, e um processo dedicado gera o PDF. O cliente busca depois ou recebe um webhook. Isola totalmente o problema e escala independente — se a demanda de relatório triplicar, eu subo mais workers sem tocar na API.\n\n**Serviço externo.** Se a geração for realmente pesada, ou depender de um Chrome headless, eu tiraria do processo Node de vez.\n\nEu iria de fila. É mais trabalho no começo, mas relatório é justamente o tipo de coisa em que o usuário aceita esperar, e isso protege o resto da API de um pico de uso de relatório.',
          'The symptom is the classic signature of event loop blocking: latency rises on endpoints that have nothing to do with the new one. That only happens when the shared resource is the thread.\n\nGenerating a PDF is pure CPU. While that handler is computing, no other callback runs. A PDF request taking two seconds adds up to two seconds of latency to anything that arrives in that window.\n\nFirst I would confirm with data: event loop lag correlated with calls to the new endpoint. I do not want to refactor on top of a theory.\n\nThen the options, least to most invasive:\n\n**Worker thread.** Moves the computation off the main thread and keeps the response synchronous from the client\'s point of view. Fixes the blocking, but still burns CPU on the same box and holds the connection open.\n\n**Queue and a separate worker.** The endpoint enqueues, responds 202 with an id, and a dedicated process generates the PDF. The client polls or gets a webhook. Fully isolates the problem and scales independently — if report demand triples, I add workers without touching the API.\n\n**External service.** If generation is genuinely heavy, or needs a headless Chrome, I would get it out of the Node process entirely.\n\nI would go with the queue. More work up front, but a report is exactly the kind of thing users accept waiting for, and it protects the rest of the API from a spike in report usage.',
        ),
      }),
      lookingFor(
        list(
          [
            'Reconhecer a assinatura: latência sobe em endpoints não relacionados',
            'Confirmar com métrica antes de refatorar',
            'Conhecer worker threads e saber seu limite',
            'Propor tirar do caminho da requisição',
            'Justificar a escolha com o comportamento do usuário',
          ],
          [
            'Recognising the signature: latency rising on unrelated endpoints',
            'Confirming with a metric before refactoring',
            'Knowing worker threads and where they stop helping',
            'Proposing to move the work off the request path',
            'Justifying the choice with user behaviour',
          ],
        ),
      ),
      tradeOff([
        {
          option: t('Worker thread', 'Worker thread'),
          pros: list(
            ['Mudança pequena', 'Cliente continua recebendo o PDF na mesma chamada'],
            ['Small change', 'The client still gets the PDF in the same call'],
          ),
          cons: list(
            ['Mesma máquina, mesma CPU', 'Conexão fica aberta durante a geração'],
            ['Same box, same CPU', 'The connection stays open during generation'],
          ),
        },
        {
          option: t('Fila com worker dedicado', 'Queue with a dedicated worker'),
          pros: list(
            ['Isola de verdade', 'Escala independente da API', 'Retry fica trivial'],
            ['Genuinely isolated', 'Scales independently of the API', 'Retries become trivial'],
          ),
          cons: list(
            ['Fluxo assíncrono para o cliente', 'Mais infraestrutura para operar'],
            ['Asynchronous flow for the client', 'More infrastructure to operate'],
          ),
        },
      ]),
      followUps(
        list(
          [
            'Como o cliente saberia que o PDF ficou pronto?',
            'Qual métrica provaria sua hipótese antes de mexer no código?',
            'Quando worker thread é suficiente e quando não é?',
          ],
          [
            'How would the client know the PDF is ready?',
            'Which metric would prove your hypothesis before touching code?',
            'When is a worker thread enough, and when is it not?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-worker-threads',
    type: 'interview-question',
    title: t('Worker threads na prática', 'Worker threads in practice'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'performance'],
    difficulty: 'advanced',
    tags: ['worker-threads', 'concurrency', 'cpu'],
    minutes: 4,
    related: ['node-blocking-cpu', 'js-event-loop-single-thread'],
    blocks: [
      prompt(
        t(
          'Quando você usaria worker threads, e quando elas não resolvem o problema?',
          'When would you use worker threads, and when do they not solve the problem?',
        ),
      ),
      answers({
        short: t(
          'Worker threads servem para trabalho de CPU que bloquearia o event loop: parsing pesado, criptografia, processamento de imagem, compressão. Elas não ajudam em I/O, porque I/O já é assíncrono — colocar uma query de banco em worker thread só adiciona overhead. E elas não são de graça: cada worker tem seu próprio heap e isolate, o que custa memória e tempo de inicialização.',
          'Worker threads are for CPU work that would block the event loop: heavy parsing, cryptography, image processing, compression. They do not help with I/O, because I/O is already async — putting a database query in a worker thread just adds overhead. And they are not free: each worker has its own heap and isolate, which costs memory and startup time.',
        ),
        strong: t(
          'A regra é simples: worker thread resolve CPU, não resolve espera.\n\nEu uso quando tem cálculo que segura a thread por tempo perceptível. Na prática isso quase sempre é uma dessas coisas: transformar imagem, gerar ou parsear um documento grande, hash de senha com custo alto, compressão, ou um algoritmo do domínio que é genuinamente pesado.\n\nNão uso para I/O. Uma query de banco já devolve o controle ao loop; mandar para um worker só adiciona serialização e troca de contexto.\n\nAs limitações que eu levanto antes de propor:\n\n**Comunicação custa.** Dados vão por mensagem e são estruturalmente clonados. Se eu mandar um objeto de dez megabytes, o clone em si pode custar mais que o cálculo. `SharedArrayBuffer` e transferência de ArrayBuffer existem para isso, mas mudam a forma como você escreve o código.\n\n**Worker não é grátis.** Cada um carrega um isolate próprio. Criar um por requisição é um erro clássico — o certo é um pool, dimensionado pelo número de núcleos.\n\n**Não substitui escalar horizontalmente.** Se o problema é volume, e não uma operação pontual, a resposta é mais processos ou mais máquinas, não mais threads dentro do mesmo processo.\n\nNa dúvida entre worker thread e fila, eu pergunto se o usuário precisa da resposta na mesma requisição. Se não precisa, fila é melhor: isola mais, escala melhor e ganha retry de graça.',
          'The rule is simple: a worker thread fixes CPU, it does not fix waiting.\n\nI use them when there is computation holding the thread for a noticeable stretch. In practice that is almost always one of a few things: transforming an image, generating or parsing a large document, password hashing at a high cost factor, compression, or a genuinely heavy domain algorithm.\n\nI do not use them for I/O. A database query already hands control back to the loop; shipping it to a worker only adds serialisation and a context switch.\n\nThe limits I raise before proposing them:\n\n**Communication costs.** Data travels as messages and gets structurally cloned. Send a ten-megabyte object and the clone itself can cost more than the computation. `SharedArrayBuffer` and ArrayBuffer transfer exist for that, but they change how you write the code.\n\n**A worker is not free.** Each one carries its own isolate. Creating one per request is the classic mistake — you want a pool, sized to the core count.\n\n**It does not replace scaling out.** If the problem is volume rather than one heavy operation, the answer is more processes or more machines, not more threads inside one process.\n\nWhen I am torn between a worker thread and a queue, I ask whether the user needs the answer in the same request. If not, the queue wins: better isolation, better scaling, and retries for free.',
        ),
      }),
      lookingFor(
        list(
          [
            'Separar CPU de I/O com clareza',
            'Saber que a comunicação entre threads tem custo',
            'Mencionar pool em vez de worker por requisição',
            'Reconhecer quando a resposta certa é escalar processos',
          ],
          [
            'Separating CPU from I/O clearly',
            'Knowing cross-thread communication has a cost',
            'Mentioning a pool rather than a worker per request',
            'Recognising when the right answer is scaling processes instead',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Propor worker thread para acelerar chamada de banco',
            'Criar um worker por requisição',
            'Ignorar o custo de clonar dados grandes na mensagem',
          ],
          [
            'Proposing a worker thread to speed up a database call',
            'Creating one worker per request',
            'Ignoring the cost of cloning large data in the message',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você dimensionaria o pool?',
            'O que é SharedArrayBuffer e quando vale usar?',
            'Worker threads ou cluster: qual a diferença de propósito?',
          ],
          [
            'How would you size the pool?',
            'What is SharedArrayBuffer and when is it worth using?',
            'Worker threads or cluster: what is the difference in purpose?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'node-streams-why',
    type: 'interview-question',
    title: t('Por que streams, e o que é backpressure', 'Why streams, and what backpressure is'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'performance'],
    difficulty: 'advanced',
    tags: ['streams', 'backpressure', 'memory', 'node'],
    minutes: 5,
    related: ['node-blocking-cpu', 'js-event-loop-single-thread'],
    blocks: [
      setupText(
        t(
          'Um endpoint exporta um CSV com alguns milhões de linhas. Em homologação funcionava; em produção o container começou a morrer por falta de memória.',
          'An endpoint exports a CSV with a few million rows. It worked in staging; in production the container started dying out of memory.',
        ),
      ),
      prompt(
        t(
          'Por que isso acontece, e como streams resolvem? O que é backpressure?',
          'Why does that happen, and how do streams fix it? What is backpressure?',
        ),
      ),
      answers({
        short: t(
          'O código provavelmente carrega tudo na memória antes de responder — monta o array inteiro, transforma em string e manda. Com alguns milhões de linhas isso é um buffer de centenas de megabytes por requisição, e duas ou três requisições simultâneas estouram o container. Com stream, você lê do banco em lotes e escreve na resposta conforme lê, mantendo a memória constante. Backpressure é o mecanismo que faz a leitura pausar quando quem escreve não está dando conta.',
          'The code is probably loading everything into memory before responding — building the whole array, turning it into a string, sending it. With a few million rows that is hundreds of megabytes per request, and two or three concurrent requests blow the container. With a stream, you read from the database in batches and write to the response as you go, keeping memory flat. Backpressure is the mechanism that pauses the reader when the writer cannot keep up.',
        ),
        strong: t(
          'O problema é que o pico de memória é proporcional ao tamanho do resultado vezes o número de requisições simultâneas. Em homologação a tabela é pequena e tem um usuário; em produção os dois fatores crescem juntos.\n\nStream inverte isso. Em vez de "carregue tudo, transforme tudo, envie tudo", vira "leia um pedaço, transforme, envie, repita". A memória fica proporcional ao tamanho do buffer, não ao do resultado. Na prática, um cursor do banco alimentando um Transform que gera as linhas de CSV, encanado na resposta HTTP.\n\n**Backpressure** é a parte que a maioria esquece e é justamente o que faz a coisa funcionar.\n\nImagine que o banco entrega linhas muito mais rápido do que o cliente consegue baixar — uma conexão móvel lenta, por exemplo. Sem backpressure, os dados se acumulam no buffer interno do socket e você voltou a ter o problema de memória, só que mais difícil de enxergar.\n\nO `write` de um stream retorna false quando o buffer interno passou do highWaterMark. Esse false é o sinal: pare de ler até o evento `drain`. Quando você usa `pipe` ou `pipeline`, isso é feito automaticamente. Quando você escreve o loop na mão e ignora o retorno do write, você desligou o backpressure sem perceber.\n\nÉ por isso que eu sempre uso `stream.pipeline` em vez de encadear `pipe`: além do backpressure, ele propaga erro e destrói os streams corretamente, o que o `pipe` sozinho não faz e é fonte clássica de file descriptor vazando.',
          'The problem is that peak memory is proportional to result size times concurrent requests. In staging the table is small and there is one user; in production both factors grow together.\n\nA stream inverts that. Instead of "load everything, transform everything, send everything", it becomes "read a chunk, transform it, send it, repeat". Memory becomes proportional to the buffer size rather than the result size. In practice: a database cursor feeding a Transform that emits CSV rows, piped into the HTTP response.\n\n**Backpressure** is the part most people skip and it is exactly what makes this work.\n\nPicture the database handing over rows far faster than the client can download them — a slow mobile connection, say. Without backpressure the data piles up in the socket\'s internal buffer and you are back to the memory problem, only harder to see.\n\nA stream\'s `write` returns false when the internal buffer has passed the highWaterMark. That false is the signal: stop reading until the `drain` event. When you use `pipe` or `pipeline`, this is handled for you. When you write the loop by hand and ignore the return value of write, you have switched backpressure off without noticing.\n\nThat is why I always reach for `stream.pipeline` rather than chaining `pipe`: on top of backpressure it propagates errors and destroys the streams properly, which `pipe` alone does not, and which is a classic source of leaked file descriptors.',
        ),
      }),
      code(
        'javascript',
        `
// Memory grows with the result set.
const rows = await db.query("SELECT * FROM orders");
res.send(rows.map(toCsvLine).join("\\n"));

// Memory stays flat, and errors actually propagate.
await pipeline(
  db.queryStream("SELECT * FROM orders"),
  new Transform({
    objectMode: true,
    transform(row, _enc, done) {
      done(null, toCsvLine(row) + "\\n");
    },
  }),
  res,
);
`,
        { phase: 'answer', caption: t('O antes e o depois', 'Before and after') },
      ),
      lookingFor(
        list(
          [
            'Conectar o pico de memória ao tamanho do resultado e à concorrência',
            'Explicar stream como processamento incremental',
            'Saber o que é backpressure e por que existe',
            'Mencionar pipeline em vez de pipe, e por quê',
          ],
          [
            'Connecting peak memory to result size and concurrency',
            'Explaining a stream as incremental processing',
            'Knowing what backpressure is and why it exists',
            'Mentioning pipeline over pipe, and why',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte explica backpressure sem que o entrevistador precise perguntar, e sabe dizer o que acontece quando ele é ignorado.',
            'A strong answer explains backpressure without being asked, and can say what happens when it is ignored.',
          ),
        },
      ),
      followUps(
        list(
          [
            'O que o highWaterMark controla?',
            'Por que pipeline é melhor do que encadear pipe?',
            'Como você trataria um erro no meio do stream, com a resposta já iniciada?',
          ],
          [
            'What does highWaterMark control?',
            'Why is pipeline better than chaining pipe?',
            'How would you handle an error mid-stream, with the response already started?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'ts-benefits-real',
    type: 'interview-question',
    title: t('O que TypeScript resolve de verdade', 'What TypeScript actually solves'),
    categoryId: 'javascript',
    stackIds: ['typescript'],
    skillIds: ['typescript', 'javascript'],
    difficulty: 'intermediate',
    tags: ['typescript', 'types', 'design'],
    minutes: 4,
    related: ['ts-unknown-any'],
    blocks: [
      prompt(
        t(
          'Quais são os benefícios reais de TypeScript, e o que ele não resolve?',
          'What are the real benefits of TypeScript, and what does it not solve?',
        ),
      ),
      answers({
        short: t(
          'O ganho maior não é pegar erro de digitação, é poder refatorar com confiança e ter o contrato do código documentado onde ele é usado. Em time, tipo é a forma mais barata de comunicar intenção. O que ele não resolve: nada em runtime. Dados que vêm de fora — request, banco, API de terceiro — não são validados pelo compilador, e é exatamente ali que os bugs de produção nascem.',
          'The bigger win is not catching typos, it is being able to refactor with confidence and having the contract documented where the code is used. On a team, a type is the cheapest way to communicate intent. What it does not solve: anything at runtime. Data coming from outside — a request, the database, a third-party API — is not validated by the compiler, and that is exactly where production bugs are born.',
        ),
        strong: t(
          'Eu separo em três benefícios reais e um limite importante.\n\n**Refatoração.** Esse é o que mais importa em código que vive anos. Mudar a assinatura de uma função e o compilador apontar os trinta lugares que quebraram é a diferença entre refatorar e não refatorar. Sem isso, o time evita mexer, e o código apodrece.\n\n**Documentação que não desatualiza.** Um tipo fica ao lado do uso e o compilador garante que ele continua verdadeiro. Comentário mente; tipo não.\n\n**Modelagem de domínio.** Esse é o benefício que separa quem usa TypeScript de quem usa JavaScript com anotações. Union type discriminada deixa estados impossíveis serem impossíveis de representar — se um pedido só pode ter `trackingCode` depois de enviado, eu modelo isso no tipo e o compilador impede o acesso antes. Isso elimina uma classe inteira de bug.\n\n**O limite:** TypeScript some em runtime. Todo dado que atravessa a fronteira do sistema precisa de validação de verdade — eu uso Zod ou equivalente na borda, e derivo o tipo dali. `as SomeType` em um `req.body` é uma mentira que o compilador aceita.\n\nO custo honesto é build, configuração e um pouco de atrito com biblioteca mal tipada. Em projeto pequeno e descartável, talvez não compense. Em API que um time vai manter por anos, compensa muito.',
          'I split it into three real benefits and one important limit.\n\n**Refactoring.** This is the one that matters most in code that lives for years. Changing a function signature and having the compiler point at the thirty places that broke is the difference between refactoring and not refactoring. Without it the team avoids touching things, and the code rots.\n\n**Documentation that cannot go stale.** A type sits next to the usage and the compiler guarantees it is still true. Comments lie; types do not.\n\n**Domain modelling.** This is the benefit that separates people using TypeScript from people using JavaScript with annotations. A discriminated union makes impossible states impossible to represent — if an order can only have a `trackingCode` once it has shipped, I model that in the type and the compiler stops the access before. That removes an entire class of bug.\n\n**The limit:** TypeScript disappears at runtime. Every piece of data crossing the system boundary needs real validation — I use Zod or equivalent at the edge and derive the type from it. `as SomeType` on a `req.body` is a lie the compiler accepts.\n\nThe honest cost is a build step, configuration, and some friction with badly typed libraries. On a small throwaway project it may not pay for itself. On an API a team will maintain for years, it pays a lot.',
        ),
      }),
      code(
        'typescript',
        `
// A type that makes an impossible state unrepresentable.
type Order =
  | { status: "draft"; items: Item[] }
  | { status: "paid"; items: Item[]; paidAt: Date }
  | { status: "shipped"; items: Item[]; paidAt: Date; trackingCode: string };

function track(order: Order) {
  // The compiler refuses this unless the status was narrowed first.
  if (order.status === "shipped") {
    return order.trackingCode;
  }
  return null;
}
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'Falar de refatoração e manutenção, não só de "pegar erro"',
            'Saber que tipos somem em runtime',
            'Mencionar validação na borda do sistema',
            'Dar um exemplo de modelagem de domínio com union discriminada',
            'Reconhecer o custo honestamente',
          ],
          [
            'Talking about refactoring and maintenance, not just "catching errors"',
            'Knowing types disappear at runtime',
            'Mentioning validation at the system boundary',
            'Giving a domain modelling example with a discriminated union',
            'Acknowledging the cost honestly',
          ],
        ),
        {
          shallow: t(
            'Uma resposta superficial diz "ajuda o autocomplete e evita erro de tipo" e para.',
            'A shallow answer says "it helps autocomplete and prevents type errors" and stops.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você validaria o body de uma requisição?',
            'Qual a diferença prática entre unknown e any?',
            'Quando você usaria um type assertion, e por quê é perigoso?',
          ],
          [
            'How would you validate a request body?',
            'What is the practical difference between unknown and any?',
            'When would you use a type assertion, and why is it dangerous?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'ts-unknown-any',
    type: 'compare',
    title: t('unknown contra any', 'unknown versus any'),
    categoryId: 'javascript',
    stackIds: ['typescript'],
    skillIds: ['typescript'],
    difficulty: 'intermediate',
    tags: ['typescript', 'types', 'safety'],
    minutes: 3,
    related: ['ts-benefits-real'],
    blocks: [
      prompt(
        t(
          'Qual a diferença entre `unknown` e `any`, e quando você usaria cada um?',
          'What is the difference between `unknown` and `any`, and when would you use each?',
        ),
      ),
      answers({
        short: t(
          '`any` desliga o compilador para aquele valor: você pode fazer qualquer coisa com ele e nada é verificado. `unknown` diz "eu não sei o que é isto" e obriga você a estreitar o tipo antes de usar. Na prática eu uso `unknown` em toda entrada externa e `any` praticamente nunca, exceto para destravar uma tipagem de biblioteca ruim, sempre isolado em um ponto só.',
          '`any` switches the compiler off for that value: you can do anything with it and nothing is checked. `unknown` says "I do not know what this is" and forces you to narrow before using it. In practice I use `unknown` for every external input and `any` almost never, except to unblock a badly typed library, always isolated to one spot.',
        ),
        strong: t(
          'A diferença é de quem carrega o ônus da prova.\n\nCom `any`, o compilador aceita tudo. `value.foo.bar()` compila mesmo que `value` seja um número. Pior: `any` se espalha — atribua um `any` a outra variável e ela também fica sem checagem. Um `any` mal colocado apaga a segurança de um pedaço inteiro do código sem avisar.\n\nCom `unknown`, o compilador não deixa você fazer nada até provar o tipo. Você precisa de um `typeof`, de um type guard ou de um parser. O valor é igualmente desconhecido nos dois casos — a diferença é que `unknown` te obriga a lidar com isso.\n\nÉ por isso que `unknown` é o tipo certo para o que vem de fora: `JSON.parse`, resposta de API, `req.body`, mensagem de fila. Eu tipo como `unknown` e passo por um validador que devolve o tipo correto. Aí a garantia é real, não uma promessa do compilador sobre um dado que ele nunca viu.\n\nO uso legítimo de `any` que eu aceito é destravar uma tipagem de terceiro quebrada — e mesmo aí eu isolo em uma função com a assinatura correta por fora, para o `any` não vazar.',
          'The difference is who carries the burden of proof.\n\nWith `any`, the compiler accepts everything. `value.foo.bar()` compiles even when `value` is a number. Worse: `any` spreads — assign an `any` to another variable and that one loses checking too. One badly placed `any` erases the safety of a whole region of code without saying anything.\n\nWith `unknown`, the compiler lets you do nothing until you prove the type. You need a `typeof`, a type guard, or a parser. The value is equally unknown in both cases — the difference is that `unknown` forces you to deal with it.\n\nThat is why `unknown` is the right type for anything from outside: `JSON.parse`, an API response, `req.body`, a queue message. I type it `unknown` and run it through a validator that returns the real type. Then the guarantee is actual, not a compiler promise about data it never saw.\n\nThe legitimate use of `any` I accept is unblocking a broken third-party typing — and even then I isolate it inside a function with the correct signature on the outside, so the `any` does not leak.',
        ),
      }),
      compare(
        t('unknown', 'unknown'),
        t('any', 'any'),
        [
          {
            aspect: t('Acesso a propriedade', 'Property access'),
            left: t('Bloqueado até estreitar o tipo', 'Blocked until you narrow'),
            right: t('Sempre permitido, sem verificação', 'Always allowed, never checked'),
          },
          {
            aspect: t('Contaminação', 'Spread'),
            left: t('Não contamina: precisa ser tratado', 'Does not spread: has to be handled'),
            right: t('Contamina tudo que recebe o valor', 'Infects everything it is assigned to'),
          },
          {
            aspect: t('Uso adequado', 'Proper use'),
            left: t('Entrada externa, antes de validar', 'External input, before validation'),
            right: t('Último recurso, isolado', 'Last resort, isolated'),
          },
        ],
      ),
      followUps(
        list(
          [
            'Como você escreveria um type guard para um objeto?',
            'O que `never` representa e onde ele aparece na prática?',
            'Por que `as` é perigoso em dados externos?',
          ],
          [
            'How would you write a type guard for an object?',
            'What does `never` represent and where does it show up in practice?',
            'Why is `as` dangerous on external data?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'node-error-handling-api',
    type: 'interview-question',
    title: t('Tratamento de erro em uma API Node', 'Error handling in a Node API'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'rest'],
    skillIds: ['nodejs', 'api-design', 'observability'],
    difficulty: 'advanced',
    tags: ['errors', 'api', 'node', 'operability'],
    minutes: 5,
    related: ['js-async-error-handling', 'api-error-contract'],
    blocks: [
      prompt(
        t(
          'Como você estrutura tratamento de erro em uma API Node que vai para produção?',
          'How do you structure error handling in a Node API that is going to production?',
        ),
      ),
      answers({
        short: t(
          'Separo erro esperado de erro inesperado. Erro esperado — validação, não encontrado, conflito — é parte do contrato: vira uma classe de domínio com status e código, e o cliente sabe tratar. Erro inesperado vira 500 genérico, com log completo no servidor e nada de stack trace na resposta. No topo eu tenho um handler único que faz essa tradução, e no processo eu escuto uncaughtException e unhandledRejection para logar e morrer, em vez de continuar em estado desconhecido.',
          'I separate expected errors from unexpected ones. An expected error — validation, not found, conflict — is part of the contract: it becomes a domain class with a status and a code, and the client knows how to handle it. An unexpected error becomes a generic 500, with a full log on the server and no stack trace in the response. At the top there is a single handler doing that translation, and at the process level I listen for uncaughtException and unhandledRejection to log and then die, rather than continue in an unknown state.',
        ),
        strong: t(
          'A decisão que organiza todo o resto é: este erro é esperado ou não?\n\n**Erro esperado é contrato.** Validação falhou, recurso não existe, conflito de versão, saldo insuficiente. Isso não é falha do sistema, é uma resposta legítima. Eu modelo com uma classe base — algo como `AppError` com `statusCode`, um `code` estável em string e um `details` opcional. O `code` é o que o cliente usa para decidir o que fazer; a mensagem é para humano e pode mudar.\n\n**Erro inesperado é bug ou indisponibilidade.** Banco fora, null onde não devia, biblioteca estourando. Isso vira 500, o cliente recebe uma mensagem genérica com um id de correlação, e o log do servidor tem tudo: stack, request id, usuário, parâmetros. Nunca devolvo stack trace — é entrega de informação de arquitetura interna para quem estiver sondando.\n\n**Um único ponto de tradução.** Um error handler no fim da cadeia converte exceção em resposta. Se cada controller montar o próprio JSON de erro, o contrato diverge em três meses.\n\n**No nível do processo.** `unhandledRejection` e `uncaughtException` logam e encerram. Não tento continuar: o processo está em estado desconhecido. O orquestrador sobe outro. O importante é o graceful shutdown — parar de aceitar conexão nova, terminar as em voo com um timeout, fechar o pool do banco.\n\n**O que eu nunca faço** é engolir erro com catch vazio, e não uso erro para controle de fluxo esperado em caminho quente, porque construir stack trace custa.\n\nE ligo isso à observabilidade: o id de correlação que vai na resposta tem que ser o mesmo que está no log, senão o suporte não consegue investigar o ticket do cliente.',
          'The decision that organises everything else is: is this error expected or not?\n\n**An expected error is part of the contract.** Validation failed, the resource does not exist, a version conflict, insufficient balance. That is not a system failure, it is a legitimate response. I model it with a base class — something like `AppError` carrying `statusCode`, a stable string `code`, and optional `details`. The `code` is what the client branches on; the message is for humans and is allowed to change.\n\n**An unexpected error is a bug or an outage.** Database down, a null where there should not be one, a library blowing up. That becomes a 500, the client gets a generic message with a correlation id, and the server log has everything: stack, request id, user, parameters. I never return a stack trace — that is handing internal architecture to whoever is probing.\n\n**One single translation point.** An error handler at the end of the chain converts exceptions into responses. If every controller builds its own error JSON, the contract diverges within three months.\n\n**At the process level.** `unhandledRejection` and `uncaughtException` log and exit. I do not try to carry on: the process is in an unknown state. The orchestrator starts another one. What matters is graceful shutdown — stop accepting new connections, finish in-flight ones with a timeout, close the database pool.\n\n**What I never do** is swallow an error in an empty catch, and I avoid exceptions for expected control flow on a hot path, because building a stack trace costs.\n\nAnd I tie it to observability: the correlation id in the response has to be the same one in the log, otherwise support cannot investigate a customer ticket.',
        ),
      }),
      code(
        'typescript',
        `
export class AppError extends Error {
  constructor(
    readonly code: string,       // stable, the client branches on this
    readonly statusCode: number,
    message: string,             // for humans, free to change
    readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("resource_not_found", 404, resource + " not found");
  }
}

// One translation point for the whole API.
app.use((error, req, res, _next) => {
  const requestId = req.id;

  if (error instanceof AppError) {
    logger.warn({ requestId, code: error.code }, error.message);
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
    });
  }

  logger.error({ requestId, err: error }, "unhandled error");
  return res.status(500).json({
    code: "internal_error",
    message: "Something went wrong on our side.",
    requestId,
  });
});
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'A distinção entre erro esperado e inesperado',
            'Um ponto único de tradução para resposta',
            'Não vazar stack trace para o cliente',
            'Código de erro estável para o cliente decidir',
            'Correlação entre resposta e log',
            'O que fazer no nível do processo, incluindo shutdown',
          ],
          [
            'The distinction between expected and unexpected errors',
            'A single translation point into responses',
            'Not leaking stack traces to the client',
            'A stable error code the client can branch on',
            'Correlation between the response and the log',
            'What to do at the process level, including shutdown',
          ],
        ),
      ),
      followUps(
        list(
          [
            'O que você faz quando o erro acontece com a resposta já iniciada?',
            'Como você trataria um erro em um job de background?',
            'Qual a diferença entre 400, 409 e 422 na sua API?',
          ],
          [
            'What do you do when the error happens after the response has started?',
            'How would you handle an error in a background job?',
            'What is the difference between 400, 409 and 422 in your API?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-dependency-injection',
    type: 'interview-question',
    title: t('Injeção de dependência sem framework', 'Dependency injection without a framework'),
    categoryId: 'backend',
    stackIds: ['nodejs', 'typescript', 'nestjs'],
    skillIds: ['architecture', 'testing', 'typescript'],
    difficulty: 'intermediate',
    tags: ['dependency-injection', 'testing', 'design'],
    minutes: 4,
    related: ['ts-benefits-real'],
    blocks: [
      prompt(
        t(
          'O que é injeção de dependência e por que ela importa? Você precisa de um framework para isso?',
          'What is dependency injection and why does it matter? Do you need a framework for it?',
        ),
      ),
      answers({
        short: t(
          'É passar as dependências de fora em vez de criá-las dentro. Em vez do serviço instanciar o repositório, ele recebe. O ganho real é testabilidade e acoplamento: dá para trocar a implementação sem tocar em quem usa. E não, não precisa de framework — na maioria dos casos é só um parâmetro de construtor. Framework de DI resolve o problema de montar o grafo quando ele fica grande, não o conceito.',
          'It is passing dependencies in from the outside instead of creating them inside. Rather than the service instantiating the repository, it receives one. The real win is testability and coupling: you can swap the implementation without touching the caller. And no, you do not need a framework — in most cases it is a constructor parameter. A DI framework solves the problem of wiring the graph once it gets big, not the concept itself.',
        ),
        strong: t(
          'Injeção de dependência é inverter quem decide a implementação. O código que usa declara o que precisa; quem monta a aplicação decide o que entregar.\n\nO benefício que eu mais sinto no dia a dia é teste. Se o serviço faz `new PostgresOrderRepository()` lá dentro, para testar eu preciso de um Postgres. Se ele recebe algo que satisfaz a interface, eu passo uma implementação em memória e o teste roda em milissegundos, sem docker e sem flakiness.\n\nO segundo benefício é conseguir trocar implementação. Migrar de um provedor de email para outro deveria tocar em um arquivo de configuração, não em vinte serviços.\n\nSobre framework: em TypeScript eu passo por construtor e monto o grafo em um arquivo de composição. É explícito, dá para ler, o compilador verifica, e não tem mágica de decorator. Funciona muito bem até a aplicação ficar grande.\n\nQuando o grafo passa de algumas dezenas de nós, ou quando eu preciso de escopo por requisição, um container ajuda — é o que o NestJS entrega. O custo é que a montagem vira implícita, e erro de configuração aparece em runtime, não em compilação.\n\nO ponto que eu faço questão de dizer: injetar dependência é sobre desenho, não sobre a ferramenta. Já vi código com container de DI configurado e serviço instanciando repositório no meio do método.',
          'Dependency injection is inverting who decides the implementation. The consuming code declares what it needs; whoever assembles the application decides what to hand it.\n\nThe benefit I feel most day to day is testing. If the service does `new PostgresOrderRepository()` inside, testing it needs a Postgres. If it receives something satisfying the interface, I pass an in-memory implementation and the test runs in milliseconds, with no docker and no flakiness.\n\nThe second benefit is being able to swap implementations. Migrating from one email provider to another should touch a composition file, not twenty services.\n\nOn frameworks: in TypeScript I pass through the constructor and wire the graph in one composition file. It is explicit, readable, compiler-checked, and there is no decorator magic. That works very well until the application gets large.\n\nOnce the graph passes a few dozen nodes, or when I need request-scoped instances, a container earns its place — that is what NestJS gives you. The cost is that wiring becomes implicit, and a misconfiguration shows up at runtime rather than at compile time.\n\nThe point I make sure to say: injecting dependencies is about design, not about the tool. I have seen codebases with a fully configured DI container and a service instantiating a repository in the middle of a method.',
        ),
      }),
      code(
        'typescript',
        `
// The service declares what it needs. It does not know what it will get.
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

export class PlaceOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway,
  ) {}

  async execute(input: PlaceOrderInput): Promise<Order> { /* ... */ }
}

// One composition file decides the real implementations.
const placeOrder = new PlaceOrder(
  new PostgresOrderRepository(pool),
  new StripePaymentGateway(stripeClient),
);

// And a test decides different ones, with no container in sight.
const placeOrder = new PlaceOrder(new InMemoryOrderRepository(), new FakeGateway());
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'Explicar a inversão de quem decide a implementação',
            'Dar testabilidade como motivo concreto',
            'Saber que não precisa de framework',
            'Reconhecer quando um container passa a valer a pena',
          ],
          [
            'Explaining the inversion of who chooses the implementation',
            'Giving testability as a concrete reason',
            'Knowing a framework is not required',
            'Recognising when a container starts to earn its keep',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Qual a diferença entre injeção de dependência e inversão de controle?',
            'Quando você usaria um mock e quando usaria uma implementação fake?',
            'Que problema um container resolve que o construtor não resolve?',
          ],
          [
            'What is the difference between dependency injection and inversion of control?',
            'When would you use a mock versus a fake implementation?',
            'What problem does a container solve that a constructor does not?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-memory-leak-node',
    type: 'debugging',
    title: t('Memória que só sobe', 'Memory that only goes up'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'observability', 'performance'],
    difficulty: 'expert',
    tags: ['memory-leak', 'heap', 'debugging', 'node'],
    minutes: 5,
    related: ['node-streams-why', 'js-microtask-starvation'],
    blocks: [
      setupText(
        t(
          'O consumo de memória de um serviço sobe de forma constante ao longo do dia e o container é reiniciado pelo orquestrador toda madrugada. Ninguém considera isso um incidente porque o restart "resolve".',
          'A service\'s memory climbs steadily through the day and the orchestrator restarts the container every night. Nobody calls it an incident because the restart "fixes" it.',
        ),
      ),
      prompt(
        t(
          'Como você investigaria, e quais são os suspeitos mais prováveis?',
          'How would you investigate, and who are the most likely suspects?',
        ),
      ),
      answers({
        short: t(
          'Eu tiraria dois heap snapshots com um intervalo grande sob carga e compararia a diferença — o que cresceu entre eles é o vazamento. Os suspeitos mais comuns em Node são cache sem limite nem TTL, listener registrado dentro de um handler e nunca removido, closure segurando um objeto grande, e timer que nunca é limpo. Antes disso, eu confirmaria que é vazamento mesmo e não só o heap crescendo até o limite configurado.',
          'I would take two heap snapshots with a long gap under load and diff them — whatever grew between them is the leak. The usual suspects in Node are an unbounded cache with no TTL, a listener registered inside a handler and never removed, a closure holding a large object, and a timer that is never cleared. Before that, I would confirm it is actually a leak and not just the heap growing to its configured ceiling.',
        ),
        strong: t(
          'Primeiro eu separo duas coisas que parecem iguais no gráfico: heap crescendo até o limite natural do garbage collector e vazamento real.\n\nO V8 não coleta agressivamente enquanto tem espaço. Se o `--max-old-space-size` é alto, o gráfico sobe e parece vazamento quando na verdade o GC só não achou necessário trabalhar. O teste é forçar uma coleta e ver se a linha base cai. Se a linha base depois de cada coleta sobe a cada ciclo, é vazamento.\n\nConfirmado, o método é comparação de snapshots. Dois heap snapshots com carga entre eles, e olho a visão de comparação: quais construtores ganharam instâncias que não foram liberadas, e qual é o caminho de retenção até a raiz. Esse caminho é a resposta — ele diz literalmente quem está segurando.\n\nOs suspeitos que eu checo por ordem de frequência:\n\n**Cache sem limite.** Um `Map` usado como cache, chaveado por algo com cardinalidade alta como id de usuário, sem TTL e sem tamanho máximo. Cresce para sempre. É de longe o mais comum.\n\n**Listener acumulado.** `emitter.on` dentro de um handler de requisição. Cada requisição adiciona um listener que nunca sai. O aviso de max listeners exceeded aparece no log e costuma ser ignorado.\n\n**Closure com referência gorda.** Um callback guardado em algum lugar que fecha sobre o objeto de request inteiro. O callback é pequeno; o que ele segura não é.\n\n**Timer não limpo.** `setInterval` criado por conexão e nunca limpo quando a conexão cai.\n\nA correção depende do caso, mas o padrão geral é: todo cache precisa de política de expiração, e todo registro precisa de um desregistro no caminho de erro também, não só no de sucesso.',
          'First I separate two things that look identical on a graph: the heap growing to its natural ceiling, and a real leak.\n\nV8 does not collect aggressively while it has room. If `--max-old-space-size` is high, the graph climbs and looks like a leak when the GC simply saw no need to work. The test is forcing a collection and watching whether the baseline drops. If the post-collection baseline rises every cycle, it is a leak.\n\nOnce confirmed, the method is snapshot comparison. Two heap snapshots with load between them, then the comparison view: which constructors gained instances that were never freed, and what the retention path back to the root looks like. That path is the answer — it literally names who is holding on.\n\nThe suspects I check, in order of how often they turn out to be it:\n\n**An unbounded cache.** A `Map` used as a cache, keyed on something high-cardinality like a user id, with no TTL and no maximum size. It grows forever. By far the most common.\n\n**Accumulated listeners.** `emitter.on` inside a request handler. Every request adds a listener that never leaves. The max listeners exceeded warning shows up in the log and usually gets ignored.\n\n**A closure holding something fat.** A callback stored somewhere that closes over the entire request object. The callback is small; what it retains is not.\n\n**An uncleaned timer.** A `setInterval` created per connection and never cleared when the connection drops.\n\nThe fix depends on the case, but the general pattern is: every cache needs an eviction policy, and every registration needs a deregistration on the error path too, not only on the happy one.',
        ),
      }),
      lookingFor(
        list(
          [
            'Distinguir crescimento normal do heap de vazamento real',
            'Usar comparação de snapshots, não achismo',
            'Saber ler caminho de retenção',
            'Conhecer os padrões típicos de vazamento em Node',
            'Propor política de expiração como correção estrutural',
          ],
          [
            'Telling normal heap growth apart from a real leak',
            'Using snapshot comparison rather than guessing',
            'Knowing how to read a retention path',
            'Knowing the typical Node leak shapes',
            'Proposing an eviction policy as the structural fix',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte questiona a premissa: reiniciar todo dia é um incidente que o time normalizou.',
            'A strong answer challenges the premise: a nightly restart is an incident the team has normalised.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você distinguiria vazamento de simples pressão de memória?',
            'Que política de cache você usaria, e por quê?',
            'Como um WeakMap ajuda aqui?',
          ],
          [
            'How would you tell a leak from plain memory pressure?',
            'What cache policy would you use, and why?',
            'How does a WeakMap help here?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-event-emitter-async',
    type: 'find-the-bug',
    title: t('EventEmitter com listener async', 'EventEmitter with an async listener'),
    categoryId: 'javascript',
    stackIds: ['nodejs'],
    skillIds: ['nodejs', 'javascript'],
    difficulty: 'advanced',
    tags: ['event-emitter', 'async', 'error-handling'],
    minutes: 4,
    related: ['js-async-error-handling', 'node-error-handling-api'],
    blocks: [
      setupText(
        t(
          'Depois que um pedido é criado, o serviço emite um evento e outros módulos reagem. Às vezes o email não é enviado e não há erro no log.',
          'After an order is created, the service emits an event and other modules react. Sometimes the email is not sent, and there is no error in the log.',
        ),
      ),
      prompt(
        t('Qual é o problema aqui?', 'What is the problem here?'),
      ),
      code(
        'javascript',
        `
orders.on("created", async (order) => {
  await sendConfirmationEmail(order);
});

function createOrder(data) {
  const order = repository.save(data);
  orders.emit("created", order);
  return order;
}
`,
      ),
      answers({
        short: t(
          'O EventEmitter não sabe nada sobre promises. O `emit` chama o listener, recebe uma promise de volta e descarta. Se `sendConfirmationEmail` rejeitar, ninguém trata — vira unhandled rejection, que em Node moderno derruba o processo. E o `emit` retorna antes do email sair, então não há garantia nenhuma de entrega.',
          'EventEmitter knows nothing about promises. `emit` calls the listener, gets a promise back, and throws it away. If `sendConfirmationEmail` rejects, nobody handles it — it becomes an unhandled rejection, which in modern Node kills the process. And `emit` returns before the email goes out, so there is no delivery guarantee at all.',
        ),
        strong: t(
          'Tem dois problemas, um de erro e um de desenho.\n\n**O erro some.** `emit` é síncrono. Ele invoca os listeners um a um e ignora o retorno. Um listener async devolve uma promise que ninguém aguarda e ninguém observa. Se ela rejeitar, é unhandled rejection. Por isso o log está vazio: o erro nunca passou por nenhum catch.\n\nA correção mínima é o listener nunca deixar rejeição escapar:\n\n```\norders.on("created", (order) => {\n  sendConfirmationEmail(order).catch((error) =>\n    logger.error({ err: error, orderId: order.id }, "confirmation email failed"),\n  );\n});\n```\n\nAgora o erro aparece. Mas isso só resolve o sintoma.\n\n**O problema de desenho é que isso não é entrega garantida.** Um EventEmitter é comunicação em memória, dentro do processo. Se o processo cair entre o `emit` e o email sair, o evento sumiu — não tem retry, não tem fila, não tem histórico. Enviar email de confirmação é um efeito que o negócio espera que aconteça; em memória não dá essa garantia.\n\nSe isso importa, o certo é gravar a intenção junto com o pedido, na mesma transação, e ter um worker que processa. É o padrão outbox. Aí o pior caso é atraso, não perda.\n\nEu decidiria pela criticidade: notificação interna de dashboard pode viver em EventEmitter com catch; email de confirmação de compra, não.',
          'There are two problems, one about errors and one about design.\n\n**The error disappears.** `emit` is synchronous. It invokes listeners one by one and ignores the return value. An async listener returns a promise nobody awaits and nobody observes. If it rejects, that is an unhandled rejection. That is why the log is empty: the error never passed through any catch.\n\nThe minimum fix is to never let a rejection escape the listener:\n\n```\norders.on("created", (order) => {\n  sendConfirmationEmail(order).catch((error) =>\n    logger.error({ err: error, orderId: order.id }, "confirmation email failed"),\n  );\n});\n```\n\nNow the error shows up. But that only addresses the symptom.\n\n**The design problem is that this is not guaranteed delivery.** An EventEmitter is in-memory, in-process communication. If the process dies between the `emit` and the email going out, the event is gone — no retry, no queue, no history. Sending a confirmation email is an effect the business expects to happen; in-memory cannot promise that.\n\nIf it matters, the right shape is recording the intent alongside the order, in the same transaction, with a worker that processes it. That is the outbox pattern. Then the worst case is a delay rather than a loss.\n\nI would decide by criticality: an internal dashboard notification can live on an EventEmitter with a catch; a purchase confirmation email cannot.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber que emit ignora o retorno do listener',
            'Conectar isso ao log vazio',
            'Dar a correção imediata de capturar a rejeição',
            'Ir além: reconhecer que não há garantia de entrega',
            'Mencionar outbox ou fila para efeitos críticos',
          ],
          [
            'Knowing emit ignores the listener\'s return value',
            'Connecting that to the empty log',
            'Giving the immediate fix of catching the rejection',
            'Going further: recognising there is no delivery guarantee',
            'Mentioning an outbox or a queue for critical effects',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte separa "o erro sumiu" de "o evento pode se perder" e trata os dois como problemas diferentes.',
            'A strong answer separates "the error vanished" from "the event can be lost" and treats them as different problems.',
          ),
        },
      ),
      followUps(
        list(
          [
            'O que é o padrão outbox e que problema ele resolve?',
            'Quando EventEmitter é a ferramenta certa?',
            'Como você garantiria que o email seja enviado exatamente uma vez?',
          ],
          [
            'What is the outbox pattern and what problem does it solve?',
            'When is an EventEmitter the right tool?',
            'How would you make sure the email is sent exactly once?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'js-promise-all-settled',
    type: 'multiple-choice',
    title: t('Promise.all e falha parcial', 'Promise.all and partial failure'),
    categoryId: 'javascript',
    stackIds: ['javascript', 'nodejs'],
    skillIds: ['javascript'],
    difficulty: 'intermediate',
    tags: ['promises', 'error-handling', 'concurrency'],
    minutes: 2,
    related: ['js-async-error-handling'],
    blocks: [
      prompt(
        t(
          'Três chamadas rodam com `Promise.all`. A segunda rejeita depois de 100ms; a terceira levaria 2 segundos e tem efeito colateral. O que acontece?',
          'Three calls run under `Promise.all`. The second rejects after 100ms; the third would take 2 seconds and has a side effect. What happens?',
        ),
      ),
      choices(false, [
        {
          id: 'a',
          label: t(
            'O Promise.all rejeita em 100ms e a terceira chamada é cancelada.',
            'Promise.all rejects at 100ms and the third call is cancelled.',
          ),
          correct: false,
          why: t(
            'Promises não são canceláveis. A terceira continua executando até o fim, com efeito colateral e tudo.',
            'Promises are not cancellable. The third one keeps running to completion, side effect included.',
          ),
        },
        {
          id: 'b',
          label: t(
            'O Promise.all rejeita em 100ms, mas a terceira continua rodando e completa o efeito colateral.',
            'Promise.all rejects at 100ms, but the third keeps running and completes its side effect.',
          ),
          correct: true,
          why: t(
            'Exatamente. `Promise.all` rejeita na primeira falha, porém não tem poder nenhum sobre as promises já iniciadas. Elas seguem até o fim. É por isso que falha parcial com efeito colateral precisa de compensação explícita, ou de `allSettled` para você saber o que realmente aconteceu.',
            'Exactly. `Promise.all` rejects on the first failure, but it has no power over promises already in flight. They run to completion. That is why partial failure with side effects needs explicit compensation, or `allSettled` so you actually know what happened.',
          ),
        },
        {
          id: 'c',
          label: t(
            'O Promise.all espera as três e rejeita ao final com todos os erros.',
            'Promise.all waits for all three and rejects at the end with every error.',
          ),
          correct: false,
          why: t(
            'Esse é o comportamento de `Promise.allSettled`, que nunca rejeita e devolve o resultado de cada uma.',
            'That is `Promise.allSettled`, which never rejects and returns the outcome of each one.',
          ),
        },
      ]),
      explain(
        t(
          'A pegadinha é achar que rejeitar significa parar. Uma promise representa um trabalho que já começou; rejeitar o agregador só decide o que **você** vê, não o que o trabalho faz. Sempre que houver efeito colateral, a pergunta certa é "o que eu faço com as que deram certo?".',
          'The trap is assuming that rejecting means stopping. A promise represents work that has already started; rejecting the aggregator only decides what **you** see, not what the work does. Whenever there are side effects, the right question is "what do I do about the ones that succeeded?".',
        ),
        t('Por que isso importa', 'Why this matters'),
      ),
      followUps(
        list(
          [
            'Como você cancelaria uma operação de verdade?',
            'Quando allSettled é a escolha certa?',
          ],
          [
            'How would you actually cancel an operation?',
            'When is allSettled the right choice?',
          ],
        ),
      ),
    ],
  }),
];
