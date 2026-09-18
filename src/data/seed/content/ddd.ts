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
 * Boundaries: domain modelling and the shapes a codebase can take.
 *
 * The roadmap puts DDD, layered, hexagonal, modular monolith and
 * microservices next to each other, which is also how interviews ask about
 * them: not "what is a bounded context" but "where would you cut, and what
 * does the cut cost you".
 */
export const DDD_CONTENT: Content[] = [
  content({
    slug: 'arch-bounded-context-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Onde um modelo termina', 'Where one model ends'),
    categoryId: 'architecture',
    topic: 'ddd',
    stackIds: ['nodejs', 'typescript'],
    sourceIds: ['fowler-bounded-context'],
    skillIds: ['architecture'],
    difficulty: 'advanced',
    tags: ['ddd', 'bounded context', 'modelagem'],
    minutes: 4,
    related: ['arch-modeling-decisions', 'arch-bounded-context-speak'],
    blocks: [
      note(
        t(
          'A palavra "cliente" significa coisas diferentes em áreas diferentes da mesma empresa. Para vendas, cliente é quem pode comprar. Para cobrança, é quem tem forma de pagamento. Para suporte, é quem tem contrato ativo. Um modelo único que atenda aos três acumula campos opcionais até ninguém saber o que é obrigatório.',
          'The word "customer" means different things in different parts of the same company. To sales, a customer is someone who can buy. To billing, someone with a payment method. To support, someone with an active contract. A single model serving all three accumulates optional fields until nobody knows what is required.',
        ),
      ),
      note(
        t(
          'Bounded context é o limite dentro do qual um termo tem um significado só. Dentro dele, "cliente" é uma coisa e o modelo é coerente. Fora dele, o mesmo nome pode existir com outro formato — e isso é saudável, não duplicação a ser corrigida.',
          'A bounded context is the boundary inside which a term has exactly one meaning. Inside it, "customer" is one thing and the model is coherent. Outside it the same name can exist with a different shape — and that is healthy, not duplication to be fixed.',
        ),
        t('O que é o limite', 'What the boundary is'),
      ),
      code(
        'ts',
        `
// Vendas
type Customer = { id: string; segment: 'smb' | 'enterprise'; owner: SalesRepId };

// Cobrança — o mesmo id, outro modelo, outra equipe
type Payer = { customerId: string; taxId: string; method: PaymentMethod; dunningState: string };
`,
        {
          caption: t(
            'O que atravessa a fronteira é o identificador, não a classe.',
            'What crosses the boundary is the identifier, not the class.',
          ),
        },
      ),
      note(
        t(
          'Dentro de um contexto, o **agregado** é o pedaço que precisa mudar junto para continuar válido. Pedido e seus itens mudam juntos: o total depende dos itens. Pedido e cliente não: ninguém precisa travar o cliente para inserir um item. Agregado grande demais vira lock e contenção; agregado pequeno demais vira regra espalhada.',
          'Inside a context, the **aggregate** is the piece that has to change together to stay valid. An order and its items change together: the total depends on the items. An order and a customer do not: nobody needs to lock the customer to add an item. Too large an aggregate means locks and contention; too small means rules scattered everywhere.',
        ),
        t('Agregado', 'Aggregate'),
      ),
      note(
        t(
          'Contextos se falam por contrato explícito: um evento publicado, uma API, um arquivo. O que não funciona é os dois lerem a mesma tabela — aí a fronteira é ficção e qualquer migration vira negociação entre times.',
          'Contexts talk through an explicit contract: a published event, an API, a file. What does not work is both reading the same table — then the boundary is fiction and any migration becomes a negotiation between teams.',
        ),
        t('Como contextos conversam', 'How contexts talk'),
      ),
      note(
        t(
          'Em entrevista, o sinal de que você usou DDD de verdade não é citar entidade, value object e agregado. É explicar um limite que você desenhou, por que ele ficou naquele lugar, e o que quebrou quando alguém o atravessou.',
          'In an interview, the sign you have really used DDD is not naming entity, value object and aggregate. It is explaining a boundary you drew, why it landed where it did, and what broke when somebody crossed it.',
        ),
        t('O que conta na entrevista', 'What counts in the interview'),
      ),
    ],
  }),

  content({
    slug: 'arch-modeling-decisions',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões de modelagem', 'Modelling calls'),
    categoryId: 'architecture',
    topic: 'ddd',
    stackIds: ['nodejs', 'postgres'],
    skillIds: ['architecture'],
    difficulty: 'advanced',
    tags: ['ddd', 'agregado', 'acoplamento'],
    minutes: 3,
    related: ['arch-bounded-context-learn', 'arch-where-rule-choice'],
    blocks: [
      decisions(
        [
          {
            statement: t(
              'Para garantir consistência, vou colocar Pedido, Cliente e Estoque no mesmo agregado.',
              'To guarantee consistency, I will put Order, Customer and Inventory in one aggregate.',
            ),
            expected: 'disagree',
            verdict: t(
              'Isso troca consistência por contenção.',
              'That trades consistency for contention.',
            ),
            why: t(
              'Um agregado é a unidade de transação e de lock. Se pedido, cliente e estoque mudam juntos, toda compra do mesmo cliente serializa, e o item mais disputado do catálogo vira gargalo. O caminho normal é agregados separados com consistência eventual entre eles: reserva de estoque como passo explícito, com compensação se falhar.',
              'An aggregate is the unit of transaction and of locking. If order, customer and inventory change together, every purchase by the same customer serialises, and the hottest item in the catalogue becomes the bottleneck. The usual path is separate aggregates with eventual consistency between them: stock reservation as an explicit step, with compensation if it fails.',
            ),
            tradeOff: t(
              'Consistência eventual significa uma janela em que o estoque reservado ainda não virou pedido. Isso precisa aparecer no produto — "reservado por 10 minutos" — e não ser escondido.',
              'Eventual consistency means a window where reserved stock is not yet an order. That has to show up in the product — "reserved for 10 minutes" — not be hidden.',
            ),
          },
          {
            statement: t(
              'O time de cobrança precisa do endereço do cliente. Vou dar acesso de leitura à tabela de clientes do nosso serviço.',
              'The billing team needs the customer address. I will give them read access to our customers table.',
            ),
            expected: 'disagree',
            verdict: t(
              'Leitura direta transforma o seu schema em API pública.',
              'Direct reads turn your schema into a public API.',
            ),
            why: t(
              'A partir daí, renomear uma coluna quebra outro time sem aviso, e a sua migration precisa de aprovação deles. Um endpoint ou um evento com os campos que eles precisam custa mais no começo e devolve liberdade de mudar o resto.',
              'From then on, renaming a column breaks another team without warning, and your migration needs their approval. An endpoint or an event carrying the fields they need costs more up front and buys back the freedom to change everything else.',
            ),
            context: t(
              'Uma réplica de leitura com uma *view* estável e versionada é um meio-termo aceitável quando o volume não cabe numa API.',
              'A read replica behind a stable, versioned view is an acceptable middle ground when the volume does not fit an API.',
            ),
          },
          {
            statement: t(
              'Nosso domínio é CRUD de verdade. Vou manter entidades anêmicas e a regra nos serviços.',
              'Our domain really is CRUD. I will keep anemic entities and the rules in services.',
            ),
            expected: 'agree',
            verdict: t(
              'Nem todo domínio pede modelo rico — e dizer isso é maturidade.',
              'Not every domain wants a rich model — and saying so is maturity.',
            ),
            why: t(
              'Modelo rico se paga quando existe invariante interessante: regra de preço, máquina de estados, política que muda. Num cadastro com validação simples, a camada de domínio vira cerimônia e o time perde tempo mapeando objeto para tabela. O erro é o inverso do comum: aplicar DDD tático onde não há domínio complexo.',
              'A rich model pays off when there are interesting invariants: pricing rules, a state machine, a policy that changes. In a registry with simple validation, the domain layer becomes ceremony and the team spends its time mapping objects to tables. The mistake here is the opposite of the usual one: applying tactical DDD where there is no complex domain.',
            ),
            tradeOff: t(
              'O risco é o domínio ficar complexo depois e a regra já estar espalhada em cinco serviços. Vale revisar quando aparecer a terceira condição no mesmo fluxo.',
              'The risk is the domain getting complex later with the rules already spread across five services. Worth revisiting when the third condition shows up in the same flow.',
            ),
          },
        ],
        'buttons',
      ),
    ],
  }),

  content({
    slug: 'arch-where-rule-choice',
    type: 'multiple-choice',
    kind: 'multiple-choice',
    title: t('Onde essa regra deveria morar', 'Where that rule should live'),
    categoryId: 'architecture',
    topic: 'layers',
    stackIds: ['nodejs', 'typescript', 'nestjs'],
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['camadas', 'ddd', 'design'],
    minutes: 3,
    related: ['arch-hexagonal-learn', 'cq-god-class'],
    blocks: [
      prompt(
        t(
          'Onde você colocaria a regra "um cupom só pode ser usado uma vez por cliente e não vale para assinatura anual"?',
          'Where would you put the rule "a coupon can be used once per customer and never on an annual plan"?',
        ),
        t(
          'Aplicação em camadas: controller HTTP, caso de uso, entidades de domínio, repositórios.',
          'A layered application: HTTP controller, use case, domain entities, repositories.',
        ),
      ),
      choices(false, [
        {
          id: 'controller',
          label: t(
            'No controller, antes de chamar o caso de uso.',
            'In the controller, before calling the use case.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'A regra vale para qualquer entrada — HTTP, job, importação em lote, CLI. No controller, ela protege só uma porta, e a segunda porta vai esquecer.',
            'The rule applies to every entry point — HTTP, a job, a bulk import, a CLI. In the controller it guards one door only, and the second door will forget.',
          ),
        },
        {
          id: 'db-constraint',
          label: t(
            'Como restrição no banco: índice único de (cupom, cliente).',
            'As a database constraint: a unique index on (coupon, customer).',
          ),
          correct: false,
          quality: 'partial',
          why: t(
            'O índice único é uma ótima rede de segurança para a parte "uma vez por cliente", e resolve corrida melhor que qualquer checagem em memória. Mas não expressa a parte do plano anual, e o erro que ele produz é uma violação de constraint, não uma mensagem que o produto pode mostrar.',
            'The unique index is an excellent safety net for the "once per customer" half, and it handles races better than any in-memory check. But it cannot express the annual-plan half, and the error it raises is a constraint violation, not a message the product can show.',
          ),
        },
        {
          id: 'domain',
          label: t(
            'No domínio, como política do cupom, com o índice único do banco como garantia de corrida.',
            'In the domain, as a coupon policy, with the unique index as the race guarantee.',
          ),
          correct: true,
          quality: 'ideal',
          why: t(
            'A regra é do negócio e muda com o negócio, então ela fica onde é lida e testada sem infraestrutura. O banco continua sendo a última linha, porque duas requisições simultâneas passam por qualquer checagem feita em memória. Dizer as duas coisas juntas é o que separa uma resposta de livro de uma resposta de produção.',
            'The rule belongs to the business and changes with it, so it lives where it can be read and tested without infrastructure. The database stays as the last line, because two concurrent requests slip past any in-memory check. Saying both together is what separates a textbook answer from a production one.',
          ),
        },
        {
          id: 'repository',
          label: t(
            'No repositório, junto da query que carrega o cupom.',
            'In the repository, next to the query that loads the coupon.',
          ),
          correct: false,
          quality: 'incorrect',
          why: t(
            'O repositório existe para buscar e guardar. Regra ali fica invisível para quem lê o caso de uso, e some quando alguém adiciona um segundo método de busca.',
            'The repository exists to fetch and store. A rule there is invisible to anyone reading the use case, and disappears the moment someone adds a second finder.',
          ),
        },
      ]),
      lookingFor(
        list(
          [
            'Perguntar por onde mais essa operação pode entrar.',
            'Separar regra de negócio de garantia de concorrência.',
            'Dizer como a regra seria testada.',
          ],
          [
            'Asking what other entry points this operation has.',
            'Separating the business rule from the concurrency guarantee.',
            'Saying how the rule would be tested.',
          ],
        ),
      ),
      tip(
        t(
          'Se você citar o índice único como rede e a política no domínio como regra, normalmente vem o follow-up sobre corrida — e você já respondeu antes de ser perguntado.',
          'If you mention the unique index as a net and the domain policy as the rule, the race-condition follow-up usually comes — and you have already answered it.',
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-hexagonal-learn',
    type: 'concept',
    kind: 'learn',
    title: t('Camadas, portas e adaptadores', 'Layers, ports and adapters'),
    categoryId: 'architecture',
    topic: 'layers',
    stackIds: ['nodejs', 'typescript'],
    skillIds: ['architecture'],
    difficulty: 'intermediate',
    tags: ['hexagonal', 'camadas', 'clean architecture'],
    minutes: 4,
    related: ['arch-where-rule-choice', 'arch-modular-monolith-written'],
    blocks: [
      note(
        t(
          'Arquitetura em camadas, hexagonal, onion e clean architecture resolvem o mesmo incômodo com nomes diferentes: impedir que detalhe de infraestrutura decida a forma da regra de negócio.',
          'Layered, hexagonal, onion and clean architecture all solve the same discomfort under different names: stopping an infrastructure detail from deciding the shape of the business rule.',
        ),
      ),
      note(
        t(
          'A ideia central é a direção da dependência. O domínio não importa nada de fora. O caso de uso declara **portas** — "eu preciso de algo que salve um pedido" — e a infraestrutura fornece **adaptadores** que implementam essas portas: Postgres, SQS, Stripe, o que for.',
          'The core idea is the direction of dependency. The domain imports nothing from outside. The use case declares **ports** — "I need something that saves an order" — and infrastructure provides **adapters** implementing them: Postgres, SQS, Stripe, whatever.',
        ),
        t('A direção da seta', 'Which way the arrow points'),
      ),
      code(
        'ts',
        `
// porta: pertence ao domínio, não conhece banco nenhum
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
}

// adaptador: pertence à infraestrutura, conhece Postgres
export class PgOrderRepository implements OrderRepository { /* ... */ }
`,
      ),
      note(
        t(
          'O ganho real, na prática, é teste: o caso de uso roda com um repositório em memória, em milissegundos, sem docker. O ganho vendido — "trocar de banco" — quase nunca acontece, e usar isso como justificativa em entrevista costuma render um follow-up incômodo.',
          'The real, practical win is testing: the use case runs against an in-memory repository, in milliseconds, with no docker. The advertised win — "swap the database" — almost never happens, and using it as your justification in an interview usually earns an awkward follow-up.',
        ),
        t('O ganho que realmente aparece', 'The win that actually shows up'),
      ),
      note(
        t(
          'O custo também é real: mais arquivos, mais mapeamento entre modelo de domínio e linha de tabela, e uma curva para quem chega. Em CRUD simples, isso é cerimônia. A pergunta honesta é se o domínio tem regra suficiente para pagar a indireção.',
          'The cost is real too: more files, more mapping between domain model and table row, and a learning curve for newcomers. In simple CRUD that is ceremony. The honest question is whether the domain has enough rule to pay for the indirection.',
        ),
        t('O custo', 'The cost'),
      ),
      note(
        t(
          'Sinal de que a arquitetura está de fachada: a entidade de domínio tem decorador de ORM, ou o caso de uso recebe o objeto de request HTTP. Nos dois casos a dependência aponta para dentro vindo de fora, que é exatamente o que essas arquiteturas existem para impedir.',
          'A sign the architecture is decorative: the domain entity carries ORM decorators, or the use case receives the HTTP request object. In both cases the dependency points inward from outside, which is exactly what these architectures exist to prevent.',
        ),
        t('Como saber que é só fachada', 'How to spot the decorative version'),
      ),
    ],
  }),

  content({
    slug: 'arch-modular-monolith-written',
    type: 'architecture',
    kind: 'written',
    title: t('Um monólito que não vira bola de lama', 'A monolith that does not become a mud ball'),
    categoryId: 'architecture',
    topic: 'boundaries',
    stackIds: ['nodejs', 'typescript', 'postgres'],
    sourceIds: ['fowler-strangler'],
    skillIds: ['architecture'],
    difficulty: 'advanced',
    tags: ['monólito modular', 'fronteiras', 'migração'],
    minutes: 5,
    related: ['arch-extract-service', 'arch-microservices-challenges'],
    blocks: [
      prompt(
        t(
          'Como você organizaria esse monólito em módulos, e como impediria que as fronteiras fossem furadas no dia a dia?',
          'How would you organise this monolith into modules, and how would you stop the boundaries being punched through day to day?',
        ),
        t(
          'Uma aplicação Node com 200 mil linhas, um banco Postgres, oito pessoas no time e um plano de talvez extrair serviços no futuro.',
          'A 200k-line Node application, one Postgres database, eight people on the team, and a plan to maybe extract services later.',
        ),
      ),
      answers({
        short: t(
          'Eu organizaria por domínio, não por camada técnica: `billing`, `orders`, `catalog`, cada um com sua camada interna. Cada módulo expõe uma interface pública e mantém o resto privado, incluindo suas tabelas — nada de join entre módulos. E eu colocaria isso no CI com uma regra de dependência, porque fronteira sem verificação automática dura duas sprints.',
          'I would organise by domain, not by technical layer: `billing`, `orders`, `catalog`, each with its own internal layering. Each module exposes a public interface and keeps the rest private, including its tables — no cross-module joins. And I would put that in CI as a dependency rule, because a boundary with no automated check lasts about two sprints.',
        ),
        strong: t(
          'Primeiro a estrutura de pastas por domínio, com um `index.ts` por módulo que é o único ponto de entrada. Dentro dele, a organização em camadas fica livre — quem cuida do módulo decide.\n\nDepois as fronteiras de dados. Cada módulo é dono das suas tabelas, e ninguém lê tabela de outro módulo. Se `billing` precisa do e-mail do cliente, ele chama a interface pública de `customers` ou guarda uma cópia do que precisa. Em Postgres dá para reforçar isso com schemas separados e permissões por role, o que transforma a regra em erro de banco em vez de acordo verbal.\n\nA parte que faz a diferença é a verificação: uma regra de lint de dependência (ou uma checagem no CI) que falha o build se um módulo importar o interior de outro. É o mesmo raciocínio de teste — fronteira sem teste não é fronteira, é intenção.\n\nEventos internos ajudam onde o acoplamento seria temporal: `orders` publica `OrderPaid`, `billing` reage. Começa como chamada em processo, e o dia que um módulo virar serviço, o contrato já existe.\n\nSobre extrair serviços: eu não extrairia nada agora. Com oito pessoas e um banco, o custo operacional de microsserviços é maior do que o ganho. O monólito modular é exatamente o passo que torna a extração barata depois — quando um módulo tiver ciclo de vida, time ou perfil de carga diferentes.',
          'First, folder structure by domain, with one `index.ts` per module as the only entry point. Inside it, layering is up to whoever owns the module.\n\nThen data boundaries. Each module owns its tables, and nobody reads another module\'s tables. If `billing` needs the customer email, it calls the public interface of `customers` or keeps a copy of what it needs. In Postgres you can enforce that with separate schemas and per-role permissions, which turns the rule into a database error instead of a verbal agreement.\n\nThe part that makes the difference is enforcement: a dependency lint rule (or a CI check) that fails the build when a module imports another module\'s internals. Same reasoning as tests — a boundary with no test is not a boundary, it is an intention.\n\nInternal events help where the coupling would be temporal: `orders` publishes `OrderPaid`, `billing` reacts. It starts as an in-process call, and the day a module becomes a service the contract already exists.\n\nOn extracting services: I would not extract anything now. With eight people and one database, the operational cost of microservices is higher than the gain. The modular monolith is exactly the step that makes extraction cheap later — when a module has a different lifecycle, team or load profile.',
        ),
        deep: t(
          'Se o entrevistador puxar para migração, eu descreveria o caminho de figueira estranguladora: escolher o módulo com fronteira mais limpa e menor acoplamento de dados, colocar um contrato na frente, mover leitura primeiro e escrita depois, e manter os dois caminhos vivos até a métrica dizer que dá para desligar o antigo.\n\nOs sinais que eu usaria para decidir extrair: o módulo precisa escalar sozinho; ele tem requisito de conformidade diferente; ou o time dele está bloqueado por deploy de outro. Sem um desses, extrair só multiplica ambiente e latência.\n\nE o risco que quase ninguém menciona: transação. Dentro do monólito modular, dois módulos ainda compartilham uma transação se você deixar. No dia da extração, isso vira consistência eventual. Por isso eu evitaria transações que cruzam módulos desde o começo, mesmo sendo tecnicamente possível.',
          'If the interviewer pushes towards migration, I would describe the strangler fig route: pick the module with the cleanest boundary and least data coupling, put a contract in front of it, move reads first and writes second, and keep both paths alive until metrics say the old one can go.\n\nThe signals I would use to decide to extract: the module needs to scale on its own; it has a different compliance requirement; or its team is blocked by someone else\'s deploy. Without one of those, extracting only multiplies environments and latency.\n\nAnd the risk almost nobody mentions: transactions. Inside a modular monolith two modules still share a transaction if you let them. On extraction day that becomes eventual consistency. So I would avoid cross-module transactions from the start, even though they are technically available.',
        ),
        seconds: { short: 45, strong: 150, deep: 250 },
      }),
      tradeOff([
        {
          option: t('Monólito modular', 'Modular monolith'),
          pros: list(
            ['Um deploy, uma transação quando precisa, latência local.', 'Fronteiras podem ser corrigidas com refatoração.'],
            ['One deploy, one transaction when needed, local latency.', 'Boundaries can be fixed by refactoring.'],
          ),
          cons: list(
            ['Escala junto, mesmo que só um módulo precise.', 'Fronteira depende de disciplina e verificação.'],
            ['Scales as one, even when only one module needs it.', 'Boundaries depend on discipline and enforcement.'],
          ),
        },
        {
          option: t('Microsserviços', 'Microservices'),
          pros: list(
            ['Deploy e escala independentes; falha isolada.'],
            ['Independent deploy and scale; isolated failure.'],
          ),
          cons: list(
            ['Consistência eventual obrigatória, observabilidade cara, mais ambiente.'],
            ['Eventual consistency becomes mandatory, observability gets expensive, more environments.'],
          ),
        },
      ]),
      rubric({
        incorrect: t(
          'Organiza por camada técnica (controllers, services, models) e chama isso de modular.',
          'Organises by technical layer (controllers, services, models) and calls that modular.',
        ),
        partial: t(
          'Separa por domínio, mas deixa os módulos lendo as tabelas uns dos outros.',
          'Separates by domain, but leaves modules reading each other\'s tables.',
        ),
        strong: t(
          'Fronteira de código e de dados, com verificação automática no CI.',
          'Code and data boundaries, with automated enforcement in CI.',
        ),
        interviewReady: t(
          'Tudo acima, mais o critério para extrair um serviço e o que muda em transação quando isso acontecer.',
          'All of the above, plus the criteria for extracting a service and what changes about transactions when it happens.',
        ),
      }),
      warn(
        t(
          'Responder "eu já começaria com microsserviços" para um time de oito pessoas é o jeito mais rápido de perder essa pergunta.',
          'Answering "I would start with microservices" for a team of eight is the fastest way to lose this question.',
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-extract-service',
    type: 'interview-question',
    kind: 'interview',
    title: t('Quando extrair um serviço', 'When to extract a service'),
    categoryId: 'architecture',
    topic: 'boundaries',
    stackIds: ['nodejs', 'kafka'],
    sourceIds: ['fowler-strangler'],
    skillIds: ['architecture', 'communication'],
    difficulty: 'advanced',
    tags: ['microsserviços', 'migração', 'trade-off'],
    minutes: 5,
    related: ['arch-modular-monolith-written', 'arch-microservices-challenges'],
    blocks: [
      prompt(
        t(
          'Que evidência faria você extrair um módulo do monólito para um serviço próprio — e como você faria a migração sem parar o produto?',
          'What evidence would make you extract a module from the monolith into its own service — and how would you migrate without stopping the product?',
        ),
      ),
      answers({
        short: t(
          'Eu extraio quando existe um motivo que o monólito não resolve: o módulo precisa escalar sozinho, tem requisito de conformidade diferente, ou o time dele vive bloqueado pelo deploy dos outros. "Está grande" não é motivo. A migração eu faria por estrangulamento: contrato na frente, leitura primeiro, escrita depois, os dois caminhos vivos até a métrica autorizar desligar o antigo.',
          'I extract when there is a reason the monolith cannot solve: the module needs to scale on its own, it has a different compliance requirement, or its team is permanently blocked by other people\'s deploys. "It is big" is not a reason. I would migrate by strangling it: contract in front, reads first, writes second, both paths alive until metrics allow turning the old one off.',
        ),
        strong: t(
          'Eu separo a decisão em evidência e custo.\n\nEvidência a favor: perfil de carga próprio — o processamento de imagem consome CPU e o resto da API não; ciclo de release diferente — o time de pagamentos precisa liberar às terças e o resto às quintas; requisito regulatório que pede isolamento de dados; ou falha que precisa ser contida, para que um travamento não derrube o checkout.\n\nCusto contra: cada serviço novo traz rede entre chamadas que eram função, consistência eventual onde havia transação, mais um pipeline, mais um alerta, mais um lugar para o oncall olhar às três da manhã. Com time pequeno, esse custo é maior que o ganho na maioria das vezes.\n\nNa migração eu começaria pelo módulo com fronteira de dados mais limpa, não pelo mais problemático — o objetivo do primeiro é o time aprender a operar dois serviços. Colocaria uma interface na frente dentro do próprio monólito, faria o serviço novo atender leitura em paralelo, compararia resultados em produção por um tempo, e só então moveria escrita, com a possibilidade de voltar atrás por flag.\n\nO que eu não faria: extrair e manter os dois lendo o mesmo banco. Isso é o pior dos dois mundos — a latência de rede sem a independência de dados.',
          'I split the decision into evidence and cost.\n\nEvidence in favour: its own load profile — image processing burns CPU while the rest of the API does not; a different release cadence — payments ships Tuesdays and the rest Thursdays; a regulatory requirement demanding data isolation; or failure that has to be contained, so one stuck component cannot take checkout down.\n\nCost against: every new service turns function calls into network calls, turns transactions into eventual consistency, and adds a pipeline, an alert and one more place for the on-call to look at 3am. With a small team that cost usually beats the gain.\n\nFor the migration I would start with the module that has the cleanest data boundary, not the most painful one — the first extraction exists so the team learns to operate two services. I would put an interface in front of it inside the monolith, have the new service serve reads in parallel, compare results in production for a while, and only then move writes, keeping a flag to go back.\n\nWhat I would not do: extract it and leave both reading the same database. That is the worst of both worlds — network latency without data independence.',
        ),
        deep: t(
          'Vale falar do que muda na operação no dia seguinte. Precisa de tracing distribuído para responder "onde foi o tempo", porque log local deixa de contar a história. Precisa de política de timeout e retry com jitter, senão o serviço lento derruba o chamador. Precisa decidir o que acontece quando o serviço novo está fora: degrada, enfileira, ou falha rápido — e isso é decisão de produto, não de infraestrutura.\n\nSobre dados, eu esperaria a pergunta de transação. O caso clássico: criar pedido e reservar estoque deixaram de ser atômicos. A saída normal é uma saga com compensação explícita e um estado intermediário visível no produto ("reservando"), não uma transação distribuída.\n\nE eu daria o critério de parada: se depois de seis meses o serviço extraído não deploya independente do monólito, a extração não entregou o que prometeu, e vale reconsiderar em vez de seguir extraindo mais.',
          'It is worth talking about what changes operationally the next day. You need distributed tracing to answer "where did the time go", because local logs stop telling the story. You need a timeout and retry-with-jitter policy, or the slow service takes the caller down with it. You need to decide what happens when the new service is down: degrade, queue, or fail fast — and that is a product decision, not an infrastructure one.\n\nOn data, I would expect the transaction question. The classic case: creating an order and reserving stock stopped being atomic. The usual answer is a saga with explicit compensation and a visible intermediate state in the product ("reserving"), not a distributed transaction.\n\nAnd I would give a stopping criterion: if after six months the extracted service still cannot deploy independently of the monolith, the extraction did not deliver what it promised, and that is worth reconsidering instead of extracting more.',
        ),
        seconds: { short: 45, strong: 150, deep: 250 },
      }),
      lookingFor(
        list(
          [
            'Evidência concreta em vez de tamanho ou moda.',
            'Plano de migração incremental com volta atrás.',
            'O custo operacional dito em voz alta.',
            'O que acontece com transações que cruzavam a fronteira.',
          ],
          [
            'Concrete evidence instead of size or fashion.',
            'An incremental migration plan with a way back.',
            'The operational cost said out loud.',
            'What happens to transactions that used to cross the boundary.',
          ],
        ),
        {
          strong: t(
            'Quem diz "o primeiro serviço extraído serve para o time aprender a operar" mostra que já viveu isso.',
            'Saying "the first extracted service exists so the team learns to operate two" shows you have lived through it.',
          ),
          shallow: t(
            'Listar vantagens de microsserviços sem citar um único custo.',
            'Listing microservice benefits without naming a single cost.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Extrair por tamanho de repositório.',
            'Manter banco compartilhado depois de extrair.',
            'Prometer transação distribuída como se fosse barata.',
          ],
          [
            'Extracting because the repository is big.',
            'Keeping a shared database after extraction.',
            'Promising distributed transactions as if they were cheap.',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Como você mediria se a extração valeu a pena?',
            'O que você faz com os relatórios que faziam join entre os dois domínios?',
            'Como fica o ambiente local do desenvolvedor depois disso?',
          ],
          [
            'How would you measure whether the extraction was worth it?',
            'What do you do with reports that used to join across both domains?',
            'What happens to the developer local environment after this?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'arch-bounded-context-speak',
    type: 'interview-question',
    kind: 'speaking',
    title: t('Explain a boundary you drew', 'Explain a boundary you drew'),
    categoryId: 'english',
    topic: 'ddd',
    stackIds: ['nodejs'],
    skillIds: ['architecture', 'english-speaking', 'communication'],
    difficulty: 'advanced',
    tags: ['english', 'ddd', 'arquitetura'],
    minutes: 4,
    languages: ['en'],
    related: ['arch-bounded-context-learn', 'arch-modular-monolith-written'],
    blocks: [
      prompt(
        t(
          'Walk me through a boundary you drew in a system: what was on each side, and how did you decide where the line went?',
          'Walk me through a boundary you drew in a system: what was on each side, and how did you decide where the line went?',
        ),
        t(
          'You already know this material in Portuguese. The exercise is saying it in English, out loud, without rehearsing.',
          'You already know this material in Portuguese. The exercise is saying it in English, out loud, without rehearsing.',
        ),
      ),
      answers({
        short: t(
          'On my last team we split ordering from fulfilment. Ordering owned the cart, pricing and payment; fulfilment owned picking, shipping and tracking. We drew the line where the language changed: after payment, nobody says "cart" any more, they say "shipment". The two sides talk through an event, so fulfilment never reads ordering tables.',
          'On my last team we split ordering from fulfilment. Ordering owned the cart, pricing and payment; fulfilment owned picking, shipping and tracking. We drew the line where the language changed: after payment, nobody says "cart" any more, they say "shipment". The two sides talk through an event, so fulfilment never reads ordering tables.',
        ),
        strong: t(
          'We had one service doing everything from cart to delivery tracking, and every change to shipping rules meant touching pricing code. So we looked at where the vocabulary actually changed.\n\nUp to payment, the team talks about carts, discounts and payment methods. After payment, they talk about shipments, carriers and tracking numbers. Same order in the database, two different conversations — that is usually where a boundary wants to be.\n\nWe put an event in between: ordering publishes `OrderPaid` with the items, the address and the order id. Fulfilment consumes it and builds its own model. It keeps a copy of the address, which people found strange at first, but it means a change to the customer address later does not silently reroute a package that is already moving.\n\nThe hard part was reporting, because finance used to join both sides in one query. We solved it with a read model that consumes both events, rather than letting reporting reach into either database.\n\nIf I did it again, I would draw the same line, but I would move the reporting question to the start instead of the end. It was the part that nearly forced us to keep the tables together.',
          'We had one service doing everything from cart to delivery tracking, and every change to shipping rules meant touching pricing code. So we looked at where the vocabulary actually changed.\n\nUp to payment, the team talks about carts, discounts and payment methods. After payment, they talk about shipments, carriers and tracking numbers. Same order in the database, two different conversations — that is usually where a boundary wants to be.\n\nWe put an event in between: ordering publishes `OrderPaid` with the items, the address and the order id. Fulfilment consumes it and builds its own model. It keeps a copy of the address, which people found strange at first, but it means a change to the customer address later does not silently reroute a package that is already moving.\n\nThe hard part was reporting, because finance used to join both sides in one query. We solved it with a read model that consumes both events, rather than letting reporting reach into either database.\n\nIf I did it again, I would draw the same line, but I would move the reporting question to the start instead of the end. It was the part that nearly forced us to keep the tables together.',
        ),
        seconds: { short: 40, strong: 135 },
      }),
      lookingFor(
        list(
          [
            'Plain sentences. Short clauses beat long ones when you are speaking a second language.',
            'A concrete system, not a definition of bounded context.',
            'The trade-off you accepted — duplicated data, extra latency, a harder report.',
            'What you would do differently, said without hedging.',
          ],
          [
            'Plain sentences. Short clauses beat long ones when you are speaking a second language.',
            'A concrete system, not a definition of bounded context.',
            'The trade-off you accepted — duplicated data, extra latency, a harder report.',
            'What you would do differently, said without hedging.',
          ],
        ),
      ),
      tip(
        t(
          'Useful openers when you need a second to think in English: "The short version is…", "Let me give you the context first…". They are natural, and they buy you a sentence.',
          'Useful openers when you need a second to think in English: "The short version is…", "Let me give you the context first…". They are natural, and they buy you a sentence.',
        ),
      ),
    ],
  }),
];
