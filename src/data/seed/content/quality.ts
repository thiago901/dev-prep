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
  trueFalse,
  warn,
} from '../authoring';

/**
 * Code quality: SOLID, tests and refactoring.
 *
 * The roadmap this bank was built from spends a whole region on clean code,
 * SOLID, design patterns and refactoring — and those are exactly the subjects
 * a mid-level interview probes by asking you to justify a decision, not to
 * recite a definition. Every item here ends in a judgement call.
 */
export const QUALITY_CONTENT: Content[] = [
  content({
    slug: 'cq-solid-learn',
    type: 'concept',
    kind: 'learn',
    title: t('SOLID sem decorar a sigla', 'SOLID without memorising the acronym'),
    categoryId: 'code-quality',
    topic: 'solid',
    stackIds: ['typescript', 'nodejs'],
    sourceIds: ['fowler-test-pyramid'],
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['solid', 'oop', 'design'],
    minutes: 4,
    related: ['cq-design-decisions', 'cq-abstraction-interview'],
    blocks: [
      note(
        t(
          'SOLID não é um checklist para passar em code review. São cinco observações sobre o que costuma doer quando o código muda — e em entrevista o que pesa é você explicar a dor, não a sigla.',
          'SOLID is not a checklist to pass code review. It is five observations about what tends to hurt when code changes — and in an interview what counts is explaining the pain, not the acronym.',
        ),
      ),
      note(
        t(
          '**S — uma razão para mudar.** Se a classe muda quando o layout muda *e* quando a regra fiscal muda, duas equipes vão brigar pelo mesmo arquivo. O sinal prático é o `git log`: arquivos que aparecem em commits de motivos muito diferentes estão fazendo coisas demais.',
          '**S — one reason to change.** If the class changes when the layout changes *and* when the tax rule changes, two teams will fight over the same file. The practical signal is `git log`: files that show up in commits for wildly different reasons are doing too much.',
        ),
        t('Responsabilidade única', 'Single responsibility'),
      ),
      note(
        t(
          '**O — aberto para extensão.** Quando adicionar um caso novo exige editar um `switch` que já tem oito ramos, cada adição arrisca quebrar os sete anteriores. A saída costuma ser um registro de estratégias, não uma hierarquia nova.',
          '**O — open for extension.** When adding a new case means editing a `switch` that already has eight branches, each addition risks breaking the other seven. The way out is usually a registry of strategies, not a new hierarchy.',
        ),
        t('Aberto/fechado', 'Open/closed'),
      ),
      note(
        t(
          '**L — o substituto tem que se comportar.** O clássico: `Quadrado extends Retângulo` quebra quem chama `setWidth` e espera que a altura fique igual. Em código real aparece como subclasse que lança exceção num método que a superclasse promete.',
          '**L — the substitute has to behave.** The classic: `Square extends Rectangle` breaks whoever calls `setWidth` and expects the height to stay put. In real code it shows up as a subclass throwing from a method the superclass promises.',
        ),
        t('Substituição de Liskov', 'Liskov substitution'),
      ),
      note(
        t(
          '**I — interface pequena.** Uma interface com doze métodos obriga todo implementador a fingir. Quebrar em duas costuma ser mais barato do que explicar por que metade dos métodos lança `NotImplemented`.',
          '**I — small interfaces.** A twelve-method interface forces every implementer to pretend. Splitting it in two is usually cheaper than explaining why half the methods throw `NotImplemented`.',
        ),
        t('Segregação de interface', 'Interface segregation'),
      ),
      note(
        t(
          '**D — dependa da abstração.** O caso de uso não precisa saber que o repositório é Postgres. O ganho não é "trocar de banco depois" — quase ninguém troca. O ganho é testar a regra sem subir infraestrutura.',
          '**D — depend on the abstraction.** The use case does not need to know the repository is Postgres. The win is not "swapping databases later" — almost nobody does. The win is testing the rule without booting infrastructure.',
        ),
        t('Inversão de dependência', 'Dependency inversion'),
      ),
      note(
        t(
          'O contrapeso honesto: aplicar os cinco em tudo produz vinte arquivos para uma regra de dez linhas. Em entrevista, quem diz *quando não aplicar* soa sênior; quem recita os cinco soa recém-formado.',
          'The honest counterweight: applying all five everywhere produces twenty files for a ten-line rule. In an interview, saying *when not to apply them* sounds senior; reciting all five sounds fresh out of a course.',
        ),
        t('O contrapeso', 'The counterweight'),
      ),
    ],
  }),

  content({
    slug: 'cq-design-decisions',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões de design no dia a dia', 'Design calls you make every week'),
    categoryId: 'code-quality',
    topic: 'solid',
    stackIds: ['typescript', 'nodejs'],
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['design', 'herança', 'dry'],
    minutes: 3,
    related: ['cq-solid-learn', 'cq-refactor-choice'],
    blocks: [
      decisions(
        [
          {
            statement: t(
              'Dois serviços repetem oito linhas de validação. Vou extrair um pacote compartilhado agora.',
              'Two services repeat eight lines of validation. I will extract a shared package right now.',
            ),
            expected: 'disagree',
            verdict: t(
              'Duplicação entre serviços é mais barata que acoplamento entre serviços.',
              'Duplication across services is cheaper than coupling across services.',
            ),
            why: t(
              'DRY vale dentro de um limite de mudança, não através dele. Um pacote compartilhado faz os dois times versionarem juntos e transforma uma mudança local em negociação. Oito linhas repetidas custam menos que isso — até que as duas cópias comecem a mudar pelo mesmo motivo, e aí sim a extração se paga.',
              'DRY holds inside a boundary of change, not across one. A shared package makes both teams version together and turns a local change into a negotiation. Eight duplicated lines cost less than that — until both copies start changing for the same reason, and then extraction pays for itself.',
            ),
            context: t(
              'Dentro do mesmo serviço, ou quando a regra é de domínio e tem uma fonte só (cálculo de imposto, política de senha), extrair na primeira repetição é o certo.',
              'Inside one service, or when the rule is domain law with a single source of truth (tax calculation, password policy), extracting on the first repeat is right.',
            ),
          },
          {
            statement: t(
              'Preciso reaproveitar comportamento entre duas classes. Vou criar uma classe base e herdar das duas.',
              'I need to reuse behaviour between two classes. I will create a base class and inherit in both.',
            ),
            expected: 'disagree',
            verdict: t(
              'Herança para reúso amarra o que só precisava ser chamado.',
              'Inheritance for reuse ties together what only needed to be called.',
            ),
            why: t(
              'Herança expressa "é um tipo de", e traz junto construtor, estado e o resto da superclasse. Para reaproveitar comportamento, composição resolve com menos: injeta o colaborador e pronto. Quando a terceira subclasse precisa de metade da base, herança vira sobrescrita e `super` espalhado.',
              'Inheritance says "is a kind of", and it drags along the constructor, the state and the rest of the superclass. To reuse behaviour, composition does it with less: inject the collaborator and move on. When the third subclass needs half the base, inheritance turns into overrides and scattered `super` calls.',
            ),
            tradeOff: t(
              'Composição custa um pouco mais de plumbing e um construtor maior. Em hierarquias realmente estáveis e pequenas, herança continua legítima.',
              'Composition costs a little plumbing and a bigger constructor. In genuinely small, stable hierarchies, inheritance is still legitimate.',
            ),
          },
          {
            statement: t(
              'Esse método pode falhar de três formas. Vou devolver um objeto de resultado em vez de lançar exceção.',
              'This method can fail in three ways. I will return a result object instead of throwing.',
            ),
            expected: 'agree',
            verdict: t(
              'Falha esperada é retorno; falha inesperada é exceção.',
              'Expected failure is a return value; unexpected failure is an exception.',
            ),
            why: t(
              'Se a falha faz parte do fluxo — cartão recusado, e-mail já cadastrado, saldo insuficiente — ela é um resultado do domínio e o tipo deveria dizer isso. Exceção é para o que quebrou o contrato: banco fora, bug, invariante violada. Misturar os dois é o que produz `try/catch` gigante com regra de negócio dentro.',
              'If the failure is part of the flow — card declined, email already taken, insufficient funds — it is a domain outcome and the type should say so. Exceptions are for broken contracts: database down, a bug, a violated invariant. Mixing the two is what produces a giant `try/catch` with business rules inside it.',
            ),
            context: t(
              'Em linguagens sem união de tipos decente, a ergonomia do resultado piora e a exceção documentada pode ser a escolha pragmática.',
              'In languages without decent union types, result ergonomics get worse and a documented exception can be the pragmatic call.',
            ),
          },
        ],
        'buttons',
      ),
    ],
  }),

  content({
    slug: 'cq-refactor-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('O método que ninguém quer tocar', 'The method nobody wants to touch'),
    categoryId: 'code-quality',
    topic: 'refactoring',
    stackIds: ['typescript', 'nodejs'],
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['refatoração', 'code smell'],
    minutes: 3,
    related: ['cq-design-decisions', 'cq-god-class'],
    blocks: [
      code(
        'ts',
        `
async function processOrder(order: Order, type: string) {
  if (type === 'retail') {
    // 30 linhas de regra de varejo
  } else if (type === 'wholesale') {
    // 40 linhas de regra de atacado
  } else if (type === 'marketplace') {
    // 35 linhas de regra de marketplace
  }
  await db.save(order);
  await mailer.send(order.customerEmail, buildEmail(order, type));
  await analytics.track('order_processed', { type });
}
`,
        {
          caption: t(
            'Cada tipo novo de pedido entra aqui, e cada bug de e-mail também.',
            'Every new order type lands here, and so does every email bug.',
          ),
        },
      ),
      prompt(
        t(
          'Qual refatoração ataca a causa de este arquivo ser editado toda semana?',
          'Which refactoring attacks the reason this file gets edited every week?',
        ),
      ),
      choices(false, [
        {
          id: 'extract-methods',
          label: t(
            'Extrair cada bloco `if` para um método privado da mesma classe.',
            'Extract each `if` branch into a private method on the same class.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Deixa legível, e é quase sempre o primeiro passo honesto. Mas o arquivo continua sendo editado a cada tipo novo e continua acoplando regra de pedido a e-mail e analytics. Melhora a leitura, não a razão de mudar.',
            'It reads better, and it is almost always the honest first step. But the file still gets edited for every new type, and still couples order rules to email and analytics. It improves reading, not the reason to change.',
          ),
        },
        {
          id: 'strategy',
          label: t(
            'Uma interface `OrderRule` por tipo, resolvida por um registro, e o efeito colateral movido para fora.',
            'One `OrderRule` interface per type, resolved by a registry, with the side effects moved out.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'Tipo novo passa a ser arquivo novo, sem tocar no caminho existente, e a regra fica testável sem mailer nem analytics. O ponto que o entrevistador procura é você separar *decidir* de *notificar*: salvar, enviar e-mail e medir são três responsabilidades diferentes.',
            'A new type becomes a new file, without touching the existing path, and the rule becomes testable with no mailer and no analytics. The point the interviewer is looking for is separating *deciding* from *notifying*: saving, emailing and tracking are three different jobs.',
          ),
        },
        {
          id: 'inherit',
          label: t(
            'Uma classe base `OrderProcessor` com uma subclasse por tipo.',
            'A base `OrderProcessor` class with one subclass per type.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Resolve o `switch`, e é uma resposta comum. O custo aparece no quarto tipo, quando ele precisa de metade do comportamento de dois irmãos e a hierarquia vira sobrescrita. Composição com estratégias chega no mesmo lugar sem prender a forma.',
            'It removes the `switch`, and it is a common answer. The cost shows up at the fourth type, when it needs half the behaviour of two siblings and the hierarchy turns into overrides. Composition with strategies gets to the same place without locking the shape.',
          ),
        },
        {
          id: 'flags',
          label: t(
            'Manter o `if` e cobrir tudo com feature flags por tipo.',
            'Keep the `if` and cover everything with per-type feature flags.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Adiciona um segundo eixo de ramificação ao mesmo arquivo. Flags servem para controlar exposição no tempo, não para organizar variação de domínio.',
            'It adds a second branching axis to the same file. Flags exist to control exposure over time, not to organise domain variation.',
          ),
        },
      ]),
      lookingFor(
        list(
          [
            'Separar a regra que varia do efeito colateral que não varia.',
            'Citar o custo da alternativa escolhida, não só o benefício.',
            'Falar em como o código será editado daqui a seis meses.',
          ],
          [
            'Separating the rule that varies from the side effect that does not.',
            'Naming the cost of the chosen option, not only its benefit.',
            'Talking about how this file will be edited six months from now.',
          ],
        ),
      ),
      tip(
        t(
          'Dizer "eu começaria extraindo métodos para enxergar as fronteiras, e só depois extrairia as estratégias" mostra que você refatora em passos seguros em vez de reescrever.',
          'Saying "I would extract methods first to see the seams, and only then pull out the strategies" shows you refactor in safe steps instead of rewriting.',
        ),
      ),
    ],
  }),

  content({
    slug: 'cq-god-class',
    type: 'refactoring',
    kind: 'written',
    title: t('A classe que sabe demais', 'The class that knows too much'),
    categoryId: 'code-quality',
    topic: 'refactoring',
    stackIds: ['typescript', 'nodejs'],
    skillIds: ['architecture', 'testing'],
    difficulty: 'advanced',
    tags: ['code smell', 'testes', 'acoplamento'],
    minutes: 5,
    related: ['cq-refactor-choice', 'cq-test-pyramid-learn'],
    blocks: [
      code(
        'ts',
        `
class UserService {
  constructor(private db: Pool, private smtp: Smtp, private stripe: Stripe) {}

  async register(input: RegisterInput) {
    if (!/^[^@]+@[^@]+$/.test(input.email)) throw new Error('invalid email');
    const hash = await bcrypt.hash(input.password, 10);
    const { rows } = await this.db.query(
      'insert into users (email, password_hash) values ($1, $2) returning *',
      [input.email, hash],
    );
    const customer = await this.stripe.customers.create({ email: input.email });
    await this.db.query('update users set stripe_id = $1 where id = $2', [customer.id, rows[0].id]);
    await this.smtp.send(input.email, 'Bem-vindo', renderWelcome(rows[0]));
    logger.info('user registered', { id: rows[0].id });
    return rows[0];
  }
}
`,
      ),
      prompt(
        t(
          'Como você quebraria esta classe, e em que ordem? O que passaria a ser testável que hoje não é?',
          'How would you break this class up, and in what order? What becomes testable that is not testable today?',
        ),
        t(
          'O time reclama que qualquer teste de cadastro precisa de banco, SMTP e Stripe de mentira.',
          'The team complains that any registration test needs a fake database, SMTP and Stripe.',
        ),
      ),
      answers({
        short: t(
          'Eu separaria em três camadas: validação e regra de cadastro puras, persistência atrás de uma interface `UserRepository`, e os efeitos externos (cobrança e e-mail) como passos explícitos depois do commit. Assim a regra é testada sem infraestrutura, e a falha do Stripe deixa de desfazer o cadastro inteiro.',
          'I would split it into three layers: validation and the registration rule as pure code, persistence behind a `UserRepository` interface, and the external effects (billing and email) as explicit steps after the commit. The rule is then testable with no infrastructure, and a Stripe failure stops undoing the whole registration.',
        ),
        strong: t(
          'Primeiro eu olharia o que é regra e o que é efeito. Regra aqui é pouca coisa: e-mail válido, senha com hash, usuário único. Isso pode virar código puro, testável em milissegundos.\n\nDepois eu esconderia o banco atrás de um `UserRepository` com dois métodos, `create` e `findByEmail`. O ganho imediato não é trocar de banco, é o teste da regra parar de precisar de Postgres.\n\nO ponto mais importante é a ordem dos efeitos. Hoje, se o Stripe falha, o usuário já está gravado e sem `stripe_id`; se o SMTP falha, o cadastro inteiro estoura mesmo tendo dado certo. Eu commitaria o usuário primeiro e publicaria um evento `UserRegistered`; cobrança e e-mail viram consumidores, com retry próprio. Se o produto exige cliente no Stripe antes de liberar, aí é uma transação de duas fases explícita, não um `await` no meio do caminho.\n\nPor último, `logger` e a validação com regex viram detalhes: injeto o logger e troco a regex por uma validação de domínio com mensagem própria.',
          'First I would separate rule from effect. There is not much rule here: valid email, hashed password, unique user. That can become pure code, tested in milliseconds.\n\nThen I would hide the database behind a `UserRepository` with two methods, `create` and `findByEmail`. The immediate win is not swapping databases, it is that the rule test stops needing Postgres.\n\nThe important part is the ordering of effects. Today, if Stripe fails the user is already stored with no `stripe_id`; if SMTP fails the whole registration blows up even though it worked. I would commit the user first and publish a `UserRegistered` event; billing and email become consumers with their own retries. If the product requires a Stripe customer before access, then it is an explicit two-step flow, not an `await` in the middle.\n\nFinally, the logger and the regex become details: I inject the logger and replace the regex with a domain validation that carries its own message.',
        ),
        deep: t(
          'Em revisão eu levaria a sequência de refatoração, porque ninguém aceita reescrita: (1) extrair métodos privados para enxergar as costuras; (2) introduzir `UserRepository` com a implementação atual por dentro — nada muda no comportamento; (3) mover cobrança e e-mail para depois do retorno, atrás de uma fila; (4) só então mover a regra para uma função pura.\n\nCada passo é um PR pequeno com os testes existentes passando. Isso costuma valer mais na entrevista do que o desenho final, porque mostra que você sabe refatorar código que está em produção.\n\nO risco que eu nomearia: ao mover o e-mail para fila, a entrega deixa de ser síncrona e o time precisa decidir o que fazer com falha permanente — dead letter queue e alerta, não log silencioso.',
          'In review I would bring the refactoring sequence, because nobody accepts a rewrite: (1) extract private methods to expose the seams; (2) introduce `UserRepository` with the current implementation inside — behaviour unchanged; (3) move billing and email after the return, behind a queue; (4) only then move the rule into a pure function.\n\nEach step is a small PR with the existing tests passing. That usually counts for more in an interview than the final design, because it shows you can refactor code that is already in production.\n\nThe risk I would name: once email moves to a queue, delivery stops being synchronous and the team has to decide what happens on permanent failure — a dead letter queue and an alert, not a silent log.',
        ),
        seconds: { short: 40, strong: 140, deep: 240 },
      }),
      rubric({
        incorrect: t(
          'Fala em "separar em camadas" sem dizer o que cada camada passa a testar, ou propõe reescrever a classe inteira de uma vez.',
          'Talks about "splitting into layers" without saying what each layer makes testable, or proposes rewriting the whole class at once.',
        ),
        partial: t(
          'Extrai repositório e regra, mas não percebe que a falha do Stripe ou do SMTP hoje corrompe o cadastro.',
          'Extracts a repository and the rule, but misses that a Stripe or SMTP failure corrupts the registration today.',
        ),
        strong: t(
          'Separa regra, persistência e efeitos, e trata a ordem dos efeitos como decisão de consistência.',
          'Separates rule, persistence and effects, and treats effect ordering as a consistency decision.',
        ),
        interviewReady: t(
          'Tudo acima, mais uma sequência de PRs pequenos e o risco que a mudança introduz — dito antes de o entrevistador perguntar.',
          'All of the above, plus a sequence of small PRs and the risk the change introduces — said before the interviewer asks.',
        ),
      }),
      mistakes(
        list(
          [
            'Trocar a classe por três classes igualmente acopladas.',
            'Prometer "trocar de banco fácil" como justificativa do repositório.',
            'Ignorar que o e-mail assíncrono muda o contrato com o usuário.',
          ],
          [
            'Swapping one class for three equally coupled ones.',
            'Selling "easy database swap" as the reason for the repository.',
            'Ignoring that async email changes the contract with the user.',
          ],
        ),
      ),
      followUps(
        list(
          [
            'E se o cadastro precisar ser atômico com a criação no Stripe?',
            'Como você testaria o consumidor de e-mail?',
            'Que teste você escreveria primeiro para se sentir seguro refatorando?',
          ],
          [
            'What if registration has to be atomic with the Stripe customer?',
            'How would you test the email consumer?',
            'Which test would you write first to feel safe refactoring?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'cq-test-pyramid-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Que teste escrever, e quantos', 'Which tests to write, and how many'),
    categoryId: 'code-quality',
    topic: 'testing',
    stackIds: ['typescript', 'nodejs'],
    sourceIds: ['fowler-test-pyramid'],
    skillIds: ['testing'],
    difficulty: 'intermediate',
    tags: ['testes', 'pirâmide', 'ci'],
    minutes: 4,
    related: ['cq-test-choice', 'api-testing-strategy'],
    blocks: [
      note(
        t(
          'A pirâmide de testes é uma regra sobre custo, não sobre pureza. Testes rápidos e isolados você roda a cada salvar; testes que sobem o sistema inteiro você roda menos vezes, porque cada um custa segundos e falha por motivos que não são o seu código.',
          'The test pyramid is a rule about cost, not about purity. Fast isolated tests run on every save; tests that boot the whole system run less often, because each one costs seconds and fails for reasons that are not your code.',
        ),
      ),
      note(
        t(
          '**Unitário** testa uma decisão sem infraestrutura: cálculo, validação, máquina de estados. É onde a regra de negócio deveria estar concentrada, e é por isso que código bem separado é fácil de testar — o teste difícil normalmente denuncia acoplamento, não falta de disciplina.',
          '**Unit** tests one decision with no infrastructure: a calculation, a validation, a state machine. It is where business rules should be concentrated, which is why well-separated code is easy to test — a hard test usually reports coupling, not a lack of discipline.',
        ),
        t('Unitário', 'Unit'),
      ),
      note(
        t(
          '**Integração** testa a costura com o que é de verdade: o SQL roda mesmo, a migration existe, o contrato do cliente HTTP bate. É o teste que pega o bug que mock nenhum pegaria — nome de coluna errado, índice que não existe, serialização de data.',
          '**Integration** tests the seam against the real thing: the SQL actually runs, the migration exists, the HTTP client contract holds. It is the test that catches the bug no mock would — a wrong column name, a missing index, date serialisation.',
        ),
        t('Integração', 'Integration'),
      ),
      note(
        t(
          '**Ponta a ponta** testa o caminho que paga a conta: login, compra, checkout. Poucos, escolhidos, e sempre os mais caros de manter — mudou um seletor, quebrou. Por isso são a ponta da pirâmide, não porque sejam menos importantes.',
          '**End to end** tests the path that pays the bills: login, purchase, checkout. Few of them, chosen carefully, and always the most expensive to maintain — a selector changes and they break. That is why they are the tip of the pyramid, not because they matter less.',
        ),
        t('Ponta a ponta', 'End to end'),
      ),
      code(
        'ts',
        `
// Unitário: a regra, sem banco
expect(priceFor({ plan: 'pro', seats: 3, coupon: 'WELCOME' })).toBe(8700);

// Integração: o SQL de verdade contra um Postgres de teste
const found = await repo.findOverdue(new Date('2026-01-10'));
expect(found.map((o) => o.id)).toEqual(['ord_2']);
`,
      ),
      note(
        t(
          'O número que a pirâmide sugere (80/15/5) importa menos que a pergunta: *este teste falha quando o comportamento muda, ou quando o código muda?* Teste que quebra em toda refatoração está testando implementação, e vai ser deletado no primeiro sprint apertado.',
          'The ratio the pyramid suggests (80/15/5) matters less than the question: *does this test fail when behaviour changes, or when code changes?* A test that breaks on every refactor is testing implementation, and it will be deleted in the first tight sprint.',
        ),
        t('A pergunta que importa', 'The question that matters'),
      ),
      note(
        t(
          'Em entrevista, "qual sua estratégia de testes?" quase nunca quer a pirâmide. Quer saber o que você faz quando o time está atrasado: o que continua sendo testado, o que você aceita não testar, e como você decide.',
          'In an interview, "what is your testing strategy?" is almost never asking for the pyramid. It wants to know what you do when the team is behind: what stays tested, what you accept leaving untested, and how you decide.',
        ),
        t('O que a pergunta quer', 'What the question wants'),
      ),
    ],
  }),

  content({
    slug: 'cq-test-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Um bug escapou para produção', 'A bug reached production'),
    categoryId: 'code-quality',
    topic: 'testing',
    stackIds: ['nodejs', 'postgres'],
    skillIds: ['testing'],
    difficulty: 'intermediate',
    tags: ['testes', 'regressão'],
    minutes: 3,
    related: ['cq-test-pyramid-learn'],
    blocks: [
      prompt(
        t(
          'Qual teste você escreve para que esse bug específico não volte?',
          'Which test do you write so that this specific bug cannot come back?',
        ),
        t(
          'Um relatório somava valores de pedidos cancelados porque a query esqueceu `status <> \'cancelled\'`. A regra de soma em si está correta.',
          'A report was summing cancelled orders because the query forgot `status <> \'cancelled\'`. The summing rule itself is correct.',
        ),
      ),
      choices(false, [
        {
          id: 'unit-sum',
          label: t(
            'Um teste unitário da função que soma os valores.',
            'A unit test of the function that sums the values.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'Essa função já estava certa. O teste passaria antes e depois do bug, o que é a definição de um teste que não protege nada.',
            'That function was already correct. The test would pass before and after the bug, which is the definition of a test that protects nothing.',
          ),
        },
        {
          id: 'integration-query',
          label: t(
            'Um teste de integração que insere pedidos, um deles cancelado, e roda a query real.',
            'An integration test that inserts orders, one of them cancelled, and runs the real query.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'O bug estava no SQL, então o teste precisa executar o SQL. Com dois pedidos e um cancelado, ele falha antes da correção e passa depois — e continua falhando se alguém reescrever a query com o mesmo esquecimento.',
            'The bug was in the SQL, so the test has to run the SQL. With two orders and one cancelled, it fails before the fix and passes after — and keeps failing if someone rewrites the query with the same omission.',
          ),
        },
        {
          id: 'e2e',
          label: t(
            'Um teste ponta a ponta que abre o relatório no navegador e confere o total.',
            'An end-to-end test that opens the report in the browser and checks the total.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Pega o bug, e é o teste mais caro possível para pegá-lo: sobe tudo, demora, e quebra por motivos de interface. Serve se o relatório for um fluxo crítico de receita, mas não como resposta para "não deixe voltar".',
            'It does catch the bug, and it is the most expensive possible way to catch it: boots everything, runs slowly, and breaks for interface reasons. Worth it if the report is a critical revenue flow, but not as the answer to "stop it coming back".',
          ),
        },
        {
          id: 'mock-repo',
          label: t(
            'Um teste do caso de uso com o repositório mockado devolvendo pedidos sem cancelados.',
            'A use-case test with the repository mocked to return orders with none cancelled.',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'Documenta a expectativa, mas o mock devolve exatamente o que o SQL errado não devolvia. Testar o filtro com o filtro substituído é o jeito mais comum de escrever um teste verde sobre um bug vivo.',
            'It documents the expectation, but the mock returns exactly what the broken SQL failed to return. Testing a filter with the filter replaced is the most common way to write a green test over a live bug.',
          ),
        },
      ]),
      tip(
        t(
          'A frase que fecha essa resposta em entrevista: "o teste tem que falhar na ausência da correção — se ele passa com o bug, ele não é o teste desse bug".',
          'The line that closes this answer in an interview: "the test has to fail without the fix — if it passes with the bug in place, it is not the test for that bug".',
        ),
      ),
      warn(
        t(
          'Cuidado com o reflexo de responder "escrevo os três". Escrever três testes para um bug de filtro é o tipo de resposta que soa segura e entrega suíte lenta.',
          'Careful with the reflex of answering "I write all three". Three tests for one filter bug is the kind of answer that sounds safe and ships a slow suite.',
        ),
      ),
    ],
  }),

  content({
    slug: 'cq-abstraction-interview',
    type: 'interview-question',
    kind: 'interview',
    title: t('Quando você decide abstrair', 'When you decide to abstract'),
    categoryId: 'code-quality',
    topic: 'solid',
    stackIds: ['typescript', 'nodejs'],
    skillIds: ['architecture', 'communication'],
    difficulty: 'advanced',
    tags: ['design', 'abstração', 'trade-off'],
    minutes: 5,
    related: ['cq-solid-learn', 'cq-design-decisions'],
    blocks: [
      prompt(
        t(
          'Como você decide que chegou a hora de criar uma abstração?',
          'How do you decide it is time to create an abstraction?',
        ),
        t(
          'Pergunta comum em entrevista de pleno para sênior, logo depois de você citar SOLID.',
          'A common mid-to-senior interview question, right after you mention SOLID.',
        ),
      ),
      answers({
        short: t(
          'Eu espero o terceiro caso. Com dois, ainda não sei o que varia de verdade, e a abstração que eu criar vai estar moldada no primeiro caso. Com três, o eixo de variação aparece sozinho. A exceção é quando a abstração existe para isolar algo instável — um serviço externo, por exemplo — aí eu crio já no primeiro.',
          'I wait for the third case. With two, I still do not know what actually varies, and the abstraction I write will be shaped by the first one. With three, the axis of variation shows itself. The exception is an abstraction that exists to isolate something unstable — an external service, say — there I create it on the first.',
        ),
        strong: t(
          'Na prática eu uso dois gatilhos. O primeiro é repetição com o mesmo motivo de mudança: se os três lugares vão mudar juntos quando a regra mudar, eles querem ser um só. Repetição que muda por motivos diferentes é coincidência, e unificar coincidência é como se cria acoplamento acidental.\n\nO segundo gatilho é fronteira de instabilidade. Integração com gateway de pagamento, provedor de e-mail, fila — coisas que eu não controlo e que quebram de formas específicas. Aí eu crio a interface no primeiro uso, não pela troca futura, mas para conseguir testar o meu lado e para o erro deles não vazar para dentro do domínio.\n\nO que eu evito é abstrair por simetria: criar `BaseService` porque os outros módulos têm um. Custa indireção, dificulta ler o caminho do código e normalmente não sobrevive ao terceiro caso.\n\nQuando erro — e erra-se — eu prefiro errar para o lado do código duplicado, porque desfazer duplicação é mecânico e desfazer abstração errada envolve todo mundo que já dependeu dela.',
          'In practice I use two triggers. The first is repetition with the same reason to change: if all three places will change together when the rule changes, they want to be one. Repetition that changes for different reasons is coincidence, and unifying coincidence is how accidental coupling gets made.\n\nThe second trigger is an instability boundary. A payment gateway, an email provider, a queue — things I do not control that break in specific ways. There I create the interface on first use, not for a future swap, but so I can test my side and so their errors do not leak into the domain.\n\nWhat I avoid is abstracting for symmetry: creating a `BaseService` because the other modules have one. It costs indirection, makes the code path harder to follow, and usually does not survive the third case.\n\nWhen I get it wrong — and I do — I prefer to err towards duplicated code, because undoing duplication is mechanical and undoing a wrong abstraction involves everyone who already depends on it.',
        ),
        deep: t(
          'Vale falar de custo por tipo de abstração. Uma função extraída custa quase nada e pode ser desfeita em minutos. Uma interface com duas implementações custa indireção. Um pacote compartilhado entre serviços custa coordenação de release, e é o mais caro de todos — normalmente eu só aceito para contrato de dados e não para comportamento.\n\nTambém falo de reversibilidade: decisão barata de desfazer eu tomo rápido, decisão cara eu adio até ter evidência. Isso é o mesmo raciocínio de "portas de uma via e de duas vias", e serve tanto para abstração de código quanto para escolha de infraestrutura.\n\nSe o entrevistador insistir em número, eu digo três, mas deixo claro que é heurística, não regra: um caso com fronteira externa já basta.',
          'It is worth talking about cost per kind of abstraction. An extracted function costs almost nothing and can be undone in minutes. An interface with two implementations costs indirection. A package shared between services costs release coordination, and is the most expensive of all — I usually accept it for data contracts, not for behaviour.\n\nI also talk about reversibility: cheap-to-undo decisions I make fast, expensive ones I defer until there is evidence. That is the same reasoning as one-way and two-way doors, and it applies to code abstractions as much as to infrastructure choices.\n\nIf the interviewer pushes for a number, I say three, but I make clear it is a heuristic, not a rule: one case with an external boundary is already enough.',
        ),
        seconds: { short: 35, strong: 130, deep: 230 },
      }),
      rubric({
        incorrect: t(
          'Responde com a regra dos três sem justificar, ou defende abstrair sempre "para ficar preparado".',
          'Answers with the rule of three and no reasoning, or defends always abstracting "to be prepared".',
        ),
        partial: t(
          'Usa repetição como gatilho, mas não distingue repetição que muda junto de repetição coincidente.',
          'Uses repetition as the trigger, but does not distinguish repetition that changes together from coincidental repetition.',
        ),
        strong: t(
          'Dá gatilhos concretos, inclui fronteira externa, e nomeia o custo da abstração errada.',
          'Gives concrete triggers, includes external boundaries, and names the cost of the wrong abstraction.',
        ),
        interviewReady: t(
          'Tudo acima com um exemplo vivido, e a preferência explícita por errar para o lado da duplicação.',
          'All of the above with an example you lived through, and an explicit preference for erring towards duplication.',
        ),
      }),
      followUps(
        list(
          [
            'Conte uma abstração que você criou cedo demais. O que aconteceu?',
            'Como você desfaz uma abstração da qual metade do time já depende?',
            'Onde entra design pattern nessa conversa?',
          ],
          [
            'Tell me about an abstraction you created too early. What happened?',
            'How do you undo an abstraction half the team already depends on?',
            'Where do design patterns come into this?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'cq-tests-tf',
    type: 'true-false',
    kind: 'decision',
    title: t('Verdadeiro ou falso: testes', 'True or false: tests'),
    categoryId: 'code-quality',
    topic: 'testing',
    stackIds: ['nodejs'],
    skillIds: ['testing'],
    difficulty: 'beginner',
    tags: ['testes'],
    minutes: 2,
    related: ['cq-test-pyramid-learn'],
    blocks: [
      trueFalse([
        {
          statement: t(
            'Cobertura de 100% garante que o comportamento está correto.',
            '100% coverage guarantees the behaviour is correct.',
          ),
          answer: false,
          why: t(
            'Cobertura diz que a linha foi executada, não que a asserção certa foi feita. Dá para ter 100% com testes que não afirmam nada — e é exatamente o que acontece quando a meta de cobertura vira obrigação.',
            'Coverage says the line ran, not that the right assertion was made. You can hit 100% with tests that assert nothing — which is exactly what happens when a coverage target becomes a mandate.',
          ),
        },
        {
          statement: t(
            'Um teste que quebra em toda refatoração normalmente está testando implementação.',
            'A test that breaks on every refactor is usually testing implementation.',
          ),
          answer: true,
          why: t(
            'Sim. Se o comportamento observável não mudou e o teste quebrou, ele estava preso ao caminho interno — mocks demais, asserção em chamada de método privado, ordem de execução.',
            'Yes. If observable behaviour did not change and the test broke, it was tied to the internal path — too many mocks, assertions on private calls, execution order.',
          ),
        },
        {
          statement: t(
            'Testes de integração devem substituir os unitários quando o time tem pouco tempo.',
            'Integration tests should replace unit tests when the team is short on time.',
          ),
          answer: false,
          why: t(
            'Eles pegam outra classe de bug e custam outra ordem de grandeza. Trocar todos os unitários por integração dá uma suíte lenta que ninguém roda antes do push — o que na prática é ter menos teste, não mais.',
            'They catch a different class of bug and cost an order of magnitude more. Replacing every unit test with integration gives a slow suite nobody runs before pushing — which in practice is fewer tests, not more.',
          ),
        },
      ]),
    ],
  }),
];
