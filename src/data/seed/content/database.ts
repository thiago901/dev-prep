import type { Content } from '@/domain/types';
import {
  answers,
  code,
  compare,
  content,
  expected,
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

/** Indexes, transactions, isolation, and why the query got slow at 3am. */
export const DATABASE_CONTENT: Content[] = [
  content({
    slug: 'db-index-basics',
    type: 'interview-question',
    title: t('O que um índice realmente é', 'What an index actually is'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases', 'performance'],
    difficulty: 'intermediate',
    tags: ['index', 'b-tree', 'postgres', 'performance'],
    minutes: 5,
    related: ['db-slow-query', 'db-composite-index-order', 'api-pagination'],
    blocks: [
      prompt(
        t(
          'O que é um índice de banco de dados, e por que criar um em toda coluna é uma má ideia?',
          'What is a database index, and why is creating one on every column a bad idea?',
        ),
      ),
      answers({
        short: t(
          'Um índice é uma estrutura ordenada separada — normalmente uma B-tree — que aponta para as linhas da tabela. Ele troca espaço e custo de escrita por velocidade de leitura: em vez de varrer a tabela inteira, o banco navega na árvore e vai direto às linhas. Criar em toda coluna é ruim porque todo INSERT, UPDATE e DELETE precisa manter cada índice atualizado. Índice demais transforma escrita rápida em escrita lenta, ocupa espaço, e ainda confunde o planner, que passa a ter opções demais para avaliar.',
          'An index is a separate ordered structure — usually a B-tree — pointing at the table rows. It trades disk and write cost for read speed: instead of scanning the whole table, the database walks the tree and goes straight to the rows. Indexing every column is bad because every INSERT, UPDATE and DELETE has to keep each index current. Too many indexes turn fast writes into slow writes, cost space, and confuse the planner, which now has too many options to evaluate.',
        ),
        strong: t(
          'Um índice é uma cópia ordenada de uma ou mais colunas, com um ponteiro para a linha. A estrutura padrão é B-tree, que mantém os valores ordenados e permite busca logarítmica em vez de linear.\n\nO ganho aparece em três situações: busca por igualdade, busca por faixa, e ordenação. Se a consulta ordena pela mesma coluna do índice, o banco pode ler na ordem do índice e pular o sort inteiro.\n\n**O custo tem três partes:**\n\n**Escrita.** Cada índice precisa ser atualizado em toda modificação. Uma tabela com oito índices paga oito atualizações por INSERT. Em tabela de escrita intensa, isso vira o gargalo.\n\n**Espaço.** Índice ocupa disco e, mais importante, ocupa cache. Se a memória do banco está sendo usada por índices que ninguém consulta, ela não está segurando os dados que importam.\n\n**Planejamento.** O planner avalia os caminhos possíveis. Com índices demais e estatísticas desatualizadas, ele pode escolher o errado.\n\nNa prática eu começo pelas consultas reais, não pelo schema. Olho as queries mais frequentes e as mais lentas, e crio índice para elas. Depois monitoro o uso — no Postgres, `pg_stat_user_indexes` mostra quantas vezes cada índice foi usado. Índice com zero leitura em trinta dias é candidato a ser removido.\n\nE tem um caso que engana: índice em coluna de baixa seletividade não ajuda. Um índice em `status` com três valores possíveis, onde 90% das linhas são `active`, não será usado para buscar os ativos — varrer é mais barato que pular entre índice e tabela. Índice serve para achar poucas linhas em muitas.',
          'An index is an ordered copy of one or more columns, with a pointer to the row. The default structure is a B-tree, which keeps values sorted and allows logarithmic instead of linear search.\n\nThe win shows up in three situations: equality lookups, range lookups, and ordering. If a query sorts by the same column as the index, the database can read in index order and skip the sort entirely.\n\n**The cost has three parts:**\n\n**Writes.** Every index has to be updated on every modification. A table with eight indexes pays eight updates per INSERT. On a write-heavy table, that becomes the bottleneck.\n\n**Space.** An index takes disk and, more importantly, takes cache. If the database\'s memory is holding indexes nobody queries, it is not holding the data that matters.\n\n**Planning.** The planner evaluates the available paths. With too many indexes and stale statistics, it can pick the wrong one.\n\nIn practice I start from the real queries, not from the schema. I look at the most frequent and the slowest queries and index for those. Then I monitor usage — in Postgres, `pg_stat_user_indexes` shows how many times each index was used. An index with zero reads in thirty days is a candidate for removal.\n\nAnd there is one case that fools people: an index on a low-selectivity column does not help. An index on `status` with three possible values, where 90% of rows are `active`, will not be used to find the active ones — scanning is cheaper than bouncing between the index and the table. Indexes are for finding a few rows among many.',
        ),
      }),
      lookingFor(
        list(
          [
            'Explicar a estrutura, não só "deixa mais rápido"',
            'Nomear os três custos: escrita, espaço, planejamento',
            'Saber que índice serve para ordenação também',
            'Entender seletividade e por que ela decide o uso',
            'Partir das consultas reais, não do schema',
          ],
          [
            'Explaining the structure rather than just "it makes it faster"',
            'Naming the three costs: writes, space, planning',
            'Knowing indexes help ordering too',
            'Understanding selectivity and why it decides usage',
            'Starting from real queries rather than the schema',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte menciona que índice em coluna pouco seletiva simplesmente não é usado. É o detalhe que mostra quem já leu um plano de execução.',
            'A strong answer mentions that an index on a low-selectivity column simply does not get used. That detail shows someone who has read a query plan.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Quando um índice não é usado mesmo existindo?',
            'O que é um index-only scan?',
            'Qual a diferença entre B-tree, hash e GIN?',
          ],
          [
            'When is an existing index not used?',
            'What is an index-only scan?',
            'What is the difference between B-tree, hash and GIN?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-composite-index-order',
    type: 'code-reading',
    trap: true,
    title: t('A ordem das colunas no índice composto', 'Column order in a composite index'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases', 'performance'],
    difficulty: 'advanced',
    tags: ['index', 'composite-index', 'postgres'],
    minutes: 4,
    related: ['db-index-basics', 'db-slow-query'],
    blocks: [
      setupText(
        t(
          'Existe este índice na tabela de pedidos.',
          'This index exists on the orders table.',
        ),
      ),
      code(
        'sql',
        `
create index idx_orders on orders (customer_id, status, created_at);
`,
      ),
      prompt(
        t(
          'Quais destas consultas conseguem usar o índice, e quais não? Por quê?',
          'Which of these queries can use the index, and which cannot? Why?',
        ),
      ),
      code(
        'sql',
        `
-- A
select * from orders where customer_id = 42;

-- B
select * from orders where customer_id = 42 and status = 'paid';

-- C
select * from orders where status = 'paid';

-- D
select * from orders where customer_id = 42 and created_at > now() - interval '7 days';

-- E
select * from orders where customer_id = 42 and status = 'paid'
order by created_at desc;
`,
      ),
      expected(
        `A  usa o índice (prefixo)
B  usa o índice (prefixo)
C  não usa eficientemente (pula a primeira coluna)
D  usa parcialmente (só customer_id; created_at não é contíguo)
E  usa o índice inteiro, inclusive para a ordenação`,
      ),
      answers({
        short: t(
          'A regra é o prefixo mais à esquerda. O índice serve para consultas que usam as colunas da esquerda para a direita, sem pular. A e B usam porque começam em `customer_id`. C não usa bem porque começa em `status`, pulando a primeira coluna. D usa só a primeira parte: filtra por `customer_id` no índice, mas como `status` não foi informado, o `created_at` não fica contíguo, então a faixa não é aproveitada. E é o caso ideal: as três colunas na ordem, e a ordenação sai de graça porque o índice já está ordenado.',
          'The rule is the leftmost prefix. The index serves queries that use its columns left to right, without skipping. A and B work because they start at `customer_id`. C does not work well because it starts at `status`, skipping the first column. D uses only the first part: it filters on `customer_id` in the index, but since `status` was not given, `created_at` is not contiguous, so the range is not exploited. E is the ideal case: all three columns in order, and the sort comes for free because the index is already ordered.',
        ),
        strong: t(
          'Um índice composto é ordenado como uma lista telefônica ordenada por sobrenome, depois nome, depois endereço. Você consegue buscar por sobrenome, ou por sobrenome e nome. Não consegue buscar eficientemente só por nome, porque os nomes estão espalhados por todos os sobrenomes.\n\nAplicando:\n\n**A** usa: `customer_id` é o prefixo. O banco vai direto à faixa daquele cliente.\n\n**B** usa melhor ainda: `customer_id` e `status` são as duas primeiras colunas, na ordem. A faixa fica bem estreita.\n\n**C** é o caso do "só pelo nome". Os valores de `status` estão espalhados por todos os clientes. O Postgres pode até fazer um index skip scan em versões recentes se a primeira coluna tiver poucos valores distintos, mas com muitos clientes ele vai preferir varrer a tabela.\n\n**D** é o mais interessante e o que a maioria erra. A consulta usa a primeira e a terceira coluna, pulando a segunda. O índice localiza a faixa do `customer_id`, mas dentro dessa faixa as linhas estão ordenadas por `status` primeiro — então as datas do último mês estão espalhadas por cada valor de status. O banco usa o índice para chegar ao cliente e depois filtra as linhas uma a uma. Funciona, mas não é o seek que se esperava.\n\n**E** é o caso perfeito: filtro nas duas primeiras, ordenação pela terceira. Como dentro de `(customer_id, status)` as linhas já estão ordenadas por `created_at`, o banco lê na ordem e não faz sort nenhum. Isso importa muito em consulta paginada.\n\nA regra que eu uso para desenhar: colunas de igualdade primeiro, depois a de faixa ou ordenação. E uma coluna de faixa deve ser a última que o índice aproveita, porque depois dela a ordenação se perde.',
          'A composite index is ordered like a phone book sorted by surname, then first name, then address. You can look up by surname, or by surname and first name. You cannot efficiently look up by first name alone, because first names are scattered across every surname.\n\nApplying that:\n\n**A** works: `customer_id` is the prefix. The database seeks straight to that customer\'s range.\n\n**B** works even better: `customer_id` and `status` are the first two columns, in order. The range gets narrow.\n\n**C** is the "first name only" case. `status` values are scattered across every customer. Postgres may do an index skip scan on recent versions if the first column has few distinct values, but with many customers it will prefer a table scan.\n\n**D** is the most interesting and the one most people get wrong. The query uses the first and third columns, skipping the second. The index locates the `customer_id` range, but inside that range rows are ordered by `status` first — so last month\'s dates are scattered across each status value. The database uses the index to reach the customer and then filters rows one by one. It works, but it is not the seek you expected.\n\n**E** is the perfect case: equality on the first two, ordering on the third. Since within `(customer_id, status)` the rows are already ordered by `created_at`, the database reads in order and does no sort at all. That matters a lot on a paginated query.\n\nThe rule I use when designing them: equality columns first, then the range or ordering column. And a range column should be the last one the index exploits, because ordering is lost after it.',
        ),
      }),
      tip(
        t(
          'Se perguntarem isso, peça para ver o `EXPLAIN`. Dizer "eu confirmaria no plano de execução em vez de assumir" é uma resposta forte, não uma fuga.',
          'If you get this question, ask to see the `EXPLAIN`. Saying "I would confirm in the query plan rather than assume" is a strong answer, not a dodge.',
        ),
      ),
      followUps(
        list(
          [
            'Como você mudaria o índice para otimizar a consulta C?',
            'O que é um index skip scan?',
            'Por que a coluna de faixa deve vir por último?',
          ],
          [
            'How would you change the index to optimise query C?',
            'What is an index skip scan?',
            'Why should the range column come last?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-slow-query',
    type: 'debugging',
    title: t('A query ficou lenta em produção', 'The query got slow in production'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases', 'performance', 'observability'],
    difficulty: 'advanced',
    tags: ['slow-query', 'explain', 'postgres', 'debugging'],
    minutes: 6,
    related: ['db-index-basics', 'db-n-plus-one', 'api-high-traffic-endpoint'],
    blocks: [
      setupText(
        t(
          'Uma consulta que sempre respondeu em 20ms passou a levar 4 segundos. Nada foi deployado. Em homologação ela continua rápida.',
          'A query that always answered in 20ms now takes 4 seconds. Nothing was deployed. In staging it is still fast.',
        ),
      ),
      prompt(
        t(
          'Como você investigaria isso? Seja específico sobre a ordem.',
          'How would you investigate this? Be specific about the order.',
        ),
      ),
      answers({
        short: t(
          'Eu rodaria `EXPLAIN (ANALYZE, BUFFERS)` na query em produção, com os parâmetros reais. A pergunta central é se o plano mudou. O padrão mais comum nesse cenário — dados cresceram, código não mudou — é o planner ter trocado de index scan para sequential scan porque a estatística ficou desatualizada, ou porque a tabela passou de um limiar onde a varredura pareceu mais barata. Homologação continuar rápida reforça a hipótese: lá a tabela é pequena.',
          'I would run `EXPLAIN (ANALYZE, BUFFERS)` on the query in production, with the real parameters. The central question is whether the plan changed. The most common pattern in this scenario — data grew, code did not change — is the planner switching from an index scan to a sequential scan because statistics went stale, or because the table crossed a threshold where scanning looked cheaper. Staging staying fast supports that: the table there is small.',
        ),
        strong: t(
          'O detalhe mais informativo do enunciado é "nada foi deployado". Isso elimina mudança de query e aponta para mudança de dados ou de ambiente.\n\n**Primeiro passo: `EXPLAIN (ANALYZE, BUFFERS)` com os parâmetros reais.** Não `EXPLAIN` sozinho, porque eu quero o tempo real e não só a estimativa. E com parâmetros reais, porque o plano depende deles.\n\nO que eu procuro no plano:\n\nA diferença entre linhas estimadas e linhas reais. Se o planner estimou 50 e vieram 500 mil, a estatística está errada, e toda decisão dele foi tomada em cima de informação falsa. Essa é a pista mais valiosa do plano inteiro.\n\nO tipo de nó: virou Seq Scan onde antes era Index Scan? Apareceu um Nested Loop com milhares de iterações?\n\nO `BUFFERS` mostra se está lendo do cache ou do disco. Muito `read` e pouco `hit` indica que os dados não cabem mais em memória — que é uma causa de degradação gradual sem nada ter mudado no código.\n\n**Hipóteses, em ordem de probabilidade para este cenário:**\n\n**Estatística desatualizada.** O autovacuum não rodou, ou está atrasado em uma tabela com muita escrita. `ANALYZE` na tabela e reavaliar. Barato de testar e resolve com frequência.\n\n**Bloat.** Tabela com muitas linhas mortas por UPDATE e DELETE sem vacuum efetivo. A tabela ocupa muito mais páginas do que os dados vivos justificam, e toda leitura fica cara.\n\n**Mudança de seletividade.** Um cliente cresceu desproporcionalmente e a consulta que antes retornava dez linhas agora retorna cem mil. O plano ótimo mudou de verdade, e aí a correção é outra consulta ou outro índice.\n\n**Bloqueio.** Se for contenção e não plano, o tempo aparece em espera. Eu checaria `pg_stat_activity` e `pg_locks`.\n\n**Cache frio.** Failover recente ou restart deixou o cache vazio.\n\nO que eu não faria primeiro é criar índice novo. Índice é a solução mais comum e é a que mais esconde a causa: se o problema é estatística ou bloat, o índice novo funciona por algumas semanas e o problema volta.',
          'The most informative detail in the setup is "nothing was deployed". That rules out a query change and points at a data or environment change.\n\n**First step: `EXPLAIN (ANALYZE, BUFFERS)` with the real parameters.** Not plain `EXPLAIN`, because I want actual timings rather than estimates. And with real parameters, because the plan depends on them.\n\nWhat I look for in the plan:\n\nThe gap between estimated and actual rows. If the planner estimated 50 and 500,000 came back, the statistics are wrong, and every decision it made rested on false information. That is the single most valuable clue in the whole plan.\n\nThe node types: did it become a Seq Scan where it used to be an Index Scan? Is there a Nested Loop running thousands of iterations?\n\n`BUFFERS` shows whether it is reading from cache or disk. Lots of `read` and little `hit` means the data no longer fits in memory — a cause of gradual degradation with no code change at all.\n\n**Hypotheses, in order of likelihood for this scenario:**\n\n**Stale statistics.** Autovacuum has not run, or is behind on a write-heavy table. Run `ANALYZE` on the table and re-check. Cheap to test and often the answer.\n\n**Bloat.** A table with many dead rows from UPDATEs and DELETEs without effective vacuuming. The table occupies far more pages than the live data justifies, and every read gets expensive.\n\n**A genuine selectivity change.** One customer grew disproportionately and the query that returned ten rows now returns a hundred thousand. The optimal plan really did change, and the fix is a different query or a different index.\n\n**Locking.** If it is contention rather than planning, the time shows up as waiting. I would check `pg_stat_activity` and `pg_locks`.\n\n**Cold cache.** A recent failover or restart left the cache empty.\n\nWhat I would not do first is create a new index. An index is the most common fix and the one that hides the cause best: if the problem is statistics or bloat, the new index works for a few weeks and the problem returns.',
        ),
      }),
      lookingFor(
        list(
          [
            'Usar EXPLAIN ANALYZE, e saber por que ANALYZE importa',
            'Comparar linhas estimadas com linhas reais',
            'Conhecer estatística desatualizada e bloat como causas',
            'Usar o fato de que homologação está rápida como evidência',
            'Resistir ao reflexo de criar índice antes de diagnosticar',
          ],
          [
            'Using EXPLAIN ANALYZE, and knowing why ANALYZE matters',
            'Comparing estimated rows against actual rows',
            'Knowing stale statistics and bloat as causes',
            'Using the fact that staging is fast as evidence',
            'Resisting the reflex to add an index before diagnosing',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte aponta a discrepância entre estimativa e realidade como o primeiro sinal a procurar no plano.',
            'A strong answer names the estimate-versus-actual gap as the first thing to look for in the plan.',
          ),
          shallow: t(
            'Uma resposta superficial vai direto para "eu criaria um índice".',
            'A shallow answer jumps straight to "I would add an index".',
          ),
        },
      ),
      code(
        'text',
        `
Seq Scan on orders  (cost=0.00..18334.00 rows=52 width=84)
                    (actual time=0.031..3980.114 rows=418233 loops=1)
  Filter: (customer_id = 42)
  Rows Removed by Filter: 1581767
  Buffers: shared hit=112 read=18222

-- estimated 52 rows, got 418233: the planner was working from
-- statistics that no longer describe this table.
`,
        {
          phase: 'answer',
          caption: t('A assinatura de estatística desatualizada', 'The signature of stale statistics'),
        },
      ),
      followUps(
        list(
          [
            'O que o autovacuum faz e por que ele pode ficar atrasado?',
            'Como você identificaria bloat em uma tabela?',
            'Quando criar um índice é realmente a resposta certa?',
          ],
          [
            'What does autovacuum do and why can it fall behind?',
            'How would you identify bloat on a table?',
            'When is adding an index genuinely the right answer?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-n-plus-one',
    type: 'find-the-bug',
    title: t('Cem requisições viram mil queries', 'A hundred requests become a thousand queries'),
    categoryId: 'database',
    stackIds: ['postgres', 'nodejs'],
    skillIds: ['databases', 'performance'],
    difficulty: 'intermediate',
    tags: ['n-plus-one', 'orm', 'performance'],
    minutes: 4,
    related: ['db-slow-query', 'api-graphql-vs-rest'],
    blocks: [
      setupText(
        t(
          'Um endpoint que lista pedidos ficou lento conforme a base cresceu. Cada consulta individual é rápida.',
          'An endpoint listing orders got slow as the database grew. Each individual query is fast.',
        ),
      ),
      prompt(t('O que está acontecendo?', 'What is going on?')),
      code(
        'typescript',
        `
const orders = await orderRepository.findRecent(100);

const result = [];
for (const order of orders) {
  const customer = await customerRepository.findById(order.customerId);
  const items = await itemRepository.findByOrderId(order.id);
  result.push({ ...order, customer, items });
}
`,
      ),
      answers({
        short: t(
          'É um N+1, na verdade um 2N+1. Uma query traz os cem pedidos, e depois o loop faz duas consultas por pedido — duzentas e uma no total. Cada uma é rápida, mas o custo é dominado pelo round trip: duzentas idas ao banco, cada uma com latência de rede. A correção é buscar em lote: uma query para os clientes com `WHERE id IN (...)` e uma para os itens com `WHERE order_id IN (...)`, montando o resultado em memória. Três queries em vez de duzentas e uma.',
          'It is an N+1, actually a 2N+1. One query fetches the hundred orders, then the loop runs two queries per order — two hundred and one in total. Each one is fast, but the cost is dominated by round trips: two hundred trips to the database, each with network latency. The fix is batching: one query for the customers with `WHERE id IN (...)` and one for the items with `WHERE order_id IN (...)`, assembling the result in memory. Three queries instead of two hundred and one.',
        ),
        strong: t(
          'O sintoma "cada consulta é rápida mas o endpoint é lento" é a assinatura exata do N+1. O problema não é o custo de cada query, é a quantidade de idas e voltas.\n\nCom latência de 2ms por round trip, duzentas consultas são 400ms só de rede, antes de o banco fazer qualquer trabalho. E isso é sequencial, porque cada `await` dentro do loop espera o anterior.\n\n**A correção padrão é buscar em lote.** Uma query para os pedidos, uma para todos os clientes daquele conjunto, uma para todos os itens, e o join em memória com um Map. Três round trips com número de pedidos constante.\n\n```\nconst orders = await orderRepository.findRecent(100);\nconst customerIds = [...new Set(orders.map(o => o.customerId))];\n\nconst [customers, items] = await Promise.all([\n  customerRepository.findByIds(customerIds),\n  itemRepository.findByOrderIds(orders.map(o => o.id)),\n]);\n\nconst customerById = new Map(customers.map(c => [c.id, c]));\nconst itemsByOrder = groupBy(items, i => i.orderId);\n```\n\nA alternativa é um JOIN único no banco. É menos round trip ainda, mas duplica os dados do pedido para cada item, e com muitos itens o volume transferido cresce. Eu escolho pelo tamanho: poucos relacionamentos, JOIN; muitos itens por pedido, busca em lote.\n\n**O que eu falaria sobre prevenção**, porque é o que evita o próximo: em ORM, isso quase sempre nasce de lazy loading. O código parece inocente — acessa `order.customer` e o ORM dispara uma query. A defesa é carregamento explícito e um teste que conte as queries em um caso representativo. Já vi time colocar assert de número de queries no teste de integração, e é uma das medidas que mais paga.\n\nE tem um detalhe de segurança: cuidado com `IN` de tamanho ilimitado. Se a lista puder crescer muito, quebre em lotes.',
          'The symptom "each query is fast but the endpoint is slow" is the exact signature of N+1. The problem is not the cost per query, it is the number of round trips.\n\nAt 2ms of latency per round trip, two hundred queries are 400ms of pure network before the database does any work. And it is sequential, because each `await` inside the loop waits for the previous one.\n\n**The standard fix is batching.** One query for the orders, one for all the customers in that set, one for all the items, and the join in memory with a Map. Three round trips regardless of how many orders there are.\n\n```\nconst orders = await orderRepository.findRecent(100);\nconst customerIds = [...new Set(orders.map(o => o.customerId))];\n\nconst [customers, items] = await Promise.all([\n  customerRepository.findByIds(customerIds),\n  itemRepository.findByOrderIds(orders.map(o => o.id)),\n]);\n\nconst customerById = new Map(customers.map(c => [c.id, c]));\nconst itemsByOrder = groupBy(items, i => i.orderId);\n```\n\nThe alternative is a single JOIN in the database. Even fewer round trips, but it duplicates the order data for every item, and with many items the transferred volume grows. I choose by shape: few relations, JOIN; many items per order, batched fetch.\n\n**What I would say about prevention**, because that is what stops the next one: in an ORM this almost always comes from lazy loading. The code looks innocent — it touches `order.customer` and the ORM fires a query. The defence is explicit loading plus a test that counts queries on a representative case. I have seen teams assert query counts in integration tests, and it is one of the highest-paying measures there is.\n\nAnd one security note: be careful with an unbounded `IN` list. If it can grow large, chunk it.',
        ),
      }),
      lookingFor(
        list(
          [
            'Nomear o padrão N+1',
            'Explicar que o custo é round trip, não a query em si',
            'Propor busca em lote com Map em memória',
            'Comparar com JOIN e saber quando cada um é melhor',
            'Falar de prevenção, não só de correção',
          ],
          [
            'Naming the N+1 pattern',
            'Explaining the cost is round trips rather than the query itself',
            'Proposing a batched fetch with an in-memory Map',
            'Comparing against a JOIN and knowing when each is better',
            'Talking about prevention, not only the fix',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Trocar o for por Promise.all e achar que resolveu — continua sendo N queries',
            'Sempre usar JOIN sem pensar na duplicação de dados',
            'Culpar o ORM sem entender o lazy loading',
          ],
          [
            'Swapping the for loop for Promise.all and calling it fixed — it is still N queries',
            'Always reaching for a JOIN without thinking about row duplication',
            'Blaming the ORM without understanding lazy loading',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Promise.all no loop resolveria? Por quê não?',
            'Quando o JOIN é pior que a busca em lote?',
            'Como você impediria que isso volte a acontecer?',
          ],
          [
            'Would Promise.all in the loop fix it? Why not?',
            'When is a JOIN worse than a batched fetch?',
            'How would you stop this from coming back?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-transaction-isolation',
    type: 'interview-question',
    title: t('Níveis de isolamento e o que cada um evita', 'Isolation levels and what each one prevents'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases'],
    difficulty: 'expert',
    tags: ['transactions', 'isolation', 'concurrency', 'postgres'],
    minutes: 6,
    related: ['db-race-condition-balance', 'db-locking'],
    blocks: [
      prompt(
        t(
          'Quais são os níveis de isolamento de transação, e qual problema cada um resolve?',
          'What are the transaction isolation levels, and which problem does each one solve?',
        ),
      ),
      answers({
        short: t(
          'Os quatro do padrão SQL são Read Uncommitted, Read Committed, Repeatable Read e Serializable. Eles existem para evitar anomalias progressivamente: dirty read, non-repeatable read, e phantom read. Read Committed, que é o padrão do Postgres, garante que você só lê dado commitado, mas duas leituras na mesma transação podem devolver valores diferentes. Repeatable Read congela um snapshot no início. Serializable garante que o resultado é equivalente a executar as transações uma de cada vez. Quanto mais forte, mais conflito e mais retry.',
          'The four standard SQL levels are Read Uncommitted, Read Committed, Repeatable Read and Serializable. They exist to prevent anomalies progressively: dirty reads, non-repeatable reads, and phantom reads. Read Committed, the Postgres default, guarantees you only read committed data, but two reads in the same transaction can return different values. Repeatable Read freezes a snapshot at the start. Serializable guarantees the outcome is equivalent to running the transactions one at a time. The stronger the level, the more conflicts and retries.',
        ),
        strong: t(
          'Eu prefiro explicar pelas anomalias, porque é isso que importa na prática.\n\n**Dirty read** é ler uma alteração que ainda não foi commitada e pode ser desfeita. Só acontece em Read Uncommitted, que o Postgres nem implementa de verdade — ele trata como Read Committed.\n\n**Non-repeatable read** é ler a mesma linha duas vezes na mesma transação e obter valores diferentes, porque alguém commitou no meio. Read Committed permite isso. Na prática, é o que quebra quando você lê um saldo, decide algo, e escreve baseado no valor lido.\n\n**Phantom read** é a mesma coisa para um conjunto: você roda a mesma consulta duas vezes e aparecem linhas novas. Repeatable Read do padrão permite phantom; a implementação do Postgres, que usa snapshot, não permite.\n\n**Serializable** garante que existe alguma ordem sequencial das transações que produziria o mesmo resultado. No Postgres isso é implementado com detecção de conflito, não com lock: as transações rodam otimisticamente e uma delas é abortada com erro de serialização se o conflito for detectado.\n\n**A consequência prática que eu sempre menciono:** usar Serializable significa que sua aplicação precisa saber tentar de novo. Uma transação pode falhar com erro de serialização sem nada de errado ter acontecido, e o código que não trata isso vira erro para o usuário. Não é uma opção que você liga e esquece.\n\n**O que eu faço na prática:** fico em Read Committed para a maioria e resolvo os casos críticos de forma explícita — `SELECT ... FOR UPDATE` para travar as linhas que vou modificar, ou um UPDATE atômico que faz a conta no banco em vez de ler, calcular e escrever. Isso é mais previsível do que subir o isolamento global, que afeta código que ninguém revisou.\n\nSubo para Serializable em operação específica onde a regra depende de um conjunto de linhas — tipo "só pode haver um agendamento por horário" — porque ali o lock por linha não basta: o problema é justamente a linha que ainda não existe.',
          'I prefer to explain it through the anomalies, because that is what matters in practice.\n\n**A dirty read** is reading a change that has not been committed and may be rolled back. It only happens at Read Uncommitted, which Postgres does not genuinely implement — it treats it as Read Committed.\n\n**A non-repeatable read** is reading the same row twice in one transaction and getting different values, because someone committed in between. Read Committed allows that. In practice it is what breaks when you read a balance, decide something, and write based on the value you read.\n\n**A phantom read** is the same thing for a set: you run the same query twice and new rows appear. Standard Repeatable Read permits phantoms; the Postgres implementation, which uses snapshots, does not.\n\n**Serializable** guarantees there exists some sequential ordering of the transactions that would produce the same result. In Postgres that is implemented with conflict detection rather than locking: transactions run optimistically and one is aborted with a serialization error if a conflict is found.\n\n**The practical consequence I always mention:** using Serializable means your application has to know how to retry. A transaction can fail with a serialization error with nothing actually wrong, and code that does not handle it turns that into an error for the user. It is not a setting you switch on and forget.\n\n**What I do in practice:** stay on Read Committed for most things and handle the critical cases explicitly — `SELECT ... FOR UPDATE` to lock the rows I am about to modify, or an atomic UPDATE that does the arithmetic in the database rather than read, compute, write. That is more predictable than raising the global isolation level, which affects code nobody reviewed.\n\nI raise it to Serializable for a specific operation where the rule depends on a set of rows — something like "only one booking per time slot" — because there a row lock is not enough: the problem is precisely the row that does not exist yet.',
        ),
      }),
      compare(
        t('Read Committed', 'Read Committed'),
        t('Serializable', 'Serializable'),
        [
          {
            aspect: t('Garante', 'Guarantees'),
            left: t('Só lê dado commitado', 'Only reads committed data'),
            right: t('Resultado equivalente a execução sequencial', 'Outcome equivalent to sequential execution'),
          },
          {
            aspect: t('Custo', 'Cost'),
            left: t('Baixo, pouco conflito', 'Low, few conflicts'),
            right: t('Abortos por conflito de serialização', 'Aborts from serialization conflicts'),
          },
          {
            aspect: t('Exige da aplicação', 'Requires from the app'),
            left: t('Cuidado explícito nos casos críticos', 'Explicit care in critical paths'),
            right: t('Lógica de retry obrigatória', 'Mandatory retry logic'),
          },
        ],
      ),
      followUps(
        list(
          [
            'Como você trataria um erro de serialização?',
            'Quando FOR UPDATE é melhor do que subir o isolamento?',
            'O que é write skew?',
          ],
          [
            'How would you handle a serialization error?',
            'When is FOR UPDATE better than raising the isolation level?',
            'What is write skew?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-race-condition-balance',
    type: 'find-the-bug',
    title: t('Saldo ficando negativo', 'A balance going negative'),
    categoryId: 'database',
    stackIds: ['postgres', 'nodejs'],
    skillIds: ['databases', 'architecture'],
    difficulty: 'advanced',
    tags: ['race-condition', 'transactions', 'locking', 'concurrency'],
    minutes: 5,
    related: ['db-transaction-isolation', 'db-locking', 'api-idempotency'],
    blocks: [
      setupText(
        t(
          'Em raros casos, uma conta fica com saldo negativo, mesmo com a verificação abaixo.',
          'In rare cases an account ends up with a negative balance, despite the check below.',
        ),
      ),
      prompt(
        t('Por que isso acontece, e como você corrigiria?', 'Why does this happen, and how would you fix it?'),
      ),
      code(
        'typescript',
        `
await db.transaction(async (trx) => {
  const account = await trx.query(
    "select balance from accounts where id = $1",
    [accountId],
  );

  if (account.balance < amount) {
    throw new InsufficientFunds();
  }

  await trx.query(
    "update accounts set balance = balance - $1 where id = $2",
    [amount, accountId],
  );
});
`,
        { highlightLines: [2, 3, 4, 5] },
      ),
      answers({
        short: t(
          'É uma condição de corrida clássica de read-modify-write. Estar dentro de uma transação não impede que duas transações leiam o mesmo saldo ao mesmo tempo — em Read Committed, o SELECT não trava nada. As duas leem 100, as duas aprovam um saque de 80, e as duas atualizam. A correção mais simples é travar a linha na leitura com `SELECT ... FOR UPDATE`, ou melhor, fazer a verificação na própria UPDATE com um `WHERE balance >= $1` e checar quantas linhas foram afetadas.',
          'It is a classic read-modify-write race. Being inside a transaction does not stop two transactions from reading the same balance at the same time — under Read Committed, a SELECT locks nothing. Both read 100, both approve an 80 withdrawal, both update. The simplest fix is locking the row on read with `SELECT ... FOR UPDATE`, or better, doing the check inside the UPDATE itself with a `WHERE balance >= $1` and checking how many rows were affected.',
        ),
        strong: t(
          'O erro de raciocínio aqui é achar que transação significa exclusividade. Transação dá atomicidade e isolamento de leitura; ela não impede que outra transação leia a mesma linha ao mesmo tempo.\n\nA sequência que produz o bug:\n\n```\nT1: select balance -> 100\nT2: select balance -> 100\nT1: 100 >= 80, ok\nT2: 100 >= 80, ok\nT1: update balance = balance - 80  -> 20\nT2: update balance = balance - 80  -> -60\n```\n\nRepare que o UPDATE em si está certo: ele usa `balance = balance - $1`, que é calculado no banco. O problema é que a *decisão* foi tomada com um valor lido antes.\n\n**Três correções, da melhor para a mais pesada:**\n\n**Colocar a condição na própria UPDATE.** É a que eu prefiro:\n\n```\nupdate accounts set balance = balance - $1\nwhere id = $2 and balance >= $1\n```\n\nSe nenhuma linha foi afetada, não havia saldo. Uma única instrução atômica, sem lock explícito, sem janela entre ler e escrever. E eu adicionaria uma constraint `check (balance >= 0)` como rede de segurança — se a regra é invariante do dado, o banco deve garantir, não só a aplicação.\n\n**`SELECT ... FOR UPDATE`.** Trava a linha na leitura; a segunda transação espera. Funciona e às vezes é necessário quando a decisão depende de mais coisas do que cabem em um WHERE. O custo é contenção: transações na mesma conta serializam.\n\n**Serializable.** Funciona, mas exige retry na aplicação e é o mais caro dos três para este caso, que é simples.\n\n**E uma questão de modelagem** que eu levantaria: guardar saldo como coluna mutável é o que cria essa classe de problema. Em sistema financeiro, o padrão é um livro-razão de lançamentos imutáveis e o saldo derivado deles, com snapshot periódico. Aí não existe read-modify-write, existe append. É mais trabalho, mas auditar fica trivial, e "por que esse saldo está errado" passa a ter resposta.',
          'The reasoning error here is thinking a transaction means exclusivity. A transaction gives atomicity and read isolation; it does not stop another transaction from reading the same row at the same time.\n\nThe interleaving that produces the bug:\n\n```\nT1: select balance -> 100\nT2: select balance -> 100\nT1: 100 >= 80, ok\nT2: 100 >= 80, ok\nT1: update balance = balance - 80  -> 20\nT2: update balance = balance - 80  -> -60\n```\n\nNote the UPDATE itself is correct: it uses `balance = balance - $1`, computed in the database. The problem is that the *decision* was made from a value read earlier.\n\n**Three fixes, best to heaviest:**\n\n**Put the condition in the UPDATE.** This is the one I prefer:\n\n```\nupdate accounts set balance = balance - $1\nwhere id = $2 and balance >= $1\n```\n\nIf no rows were affected, there was not enough balance. One atomic statement, no explicit lock, no window between read and write. And I would add a `check (balance >= 0)` constraint as a safety net — if the rule is an invariant of the data, the database should enforce it, not only the application.\n\n**`SELECT ... FOR UPDATE`.** Locks the row on read; the second transaction waits. It works, and is sometimes necessary when the decision depends on more than fits in a WHERE. The cost is contention: transactions on the same account serialise.\n\n**Serializable.** It works, but needs application retry logic and is the most expensive of the three for a case this simple.\n\n**And a modelling point** I would raise: storing the balance as a mutable column is what creates this whole class of problem. In financial systems the pattern is an immutable ledger of entries with the balance derived from them, plus periodic snapshots. Then there is no read-modify-write, there is append. More work, but auditing becomes trivial, and "why is this balance wrong" starts having an answer.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber que transação não trava a leitura por padrão',
            'Descrever a intercalação que produz o bug',
            'Propor a condição dentro da UPDATE',
            'Mencionar constraint no banco como rede de segurança',
            'Conhecer FOR UPDATE e o custo de contenção',
          ],
          [
            'Knowing a transaction does not lock reads by default',
            'Describing the interleaving that produces the bug',
            'Proposing the condition inside the UPDATE',
            'Mentioning a database constraint as a safety net',
            'Knowing FOR UPDATE and its contention cost',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte sugere a constraint no banco além da correção no código, porque aplicação tem bug e o dado precisa sobreviver a ele.',
            'A strong answer suggests the database constraint on top of the code fix, because applications have bugs and the data has to survive them.',
          ),
        },
      ),
      warn(
        t(
          'Estar dentro de uma transação não impede condição de corrida. Isolamento não é exclusão mútua.',
          'Being inside a transaction does not prevent a race condition. Isolation is not mutual exclusion.',
        ),
      ),
      followUps(
        list(
          [
            'Como você trataria a contenção se muitas transações disputarem a mesma conta?',
            'Por que um livro-razão imutável evita essa classe de bug?',
            'Como você testaria uma condição de corrida?',
          ],
          [
            'How would you handle contention if many transactions fight over the same account?',
            'Why does an immutable ledger avoid this class of bug?',
            'How would you test a race condition?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-locking',
    type: 'scenario',
    title: t('Deadlock intermitente em produção', 'Intermittent deadlocks in production'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases', 'observability'],
    difficulty: 'expert',
    tags: ['deadlock', 'locking', 'transactions'],
    minutes: 5,
    related: ['db-transaction-isolation', 'db-race-condition-balance'],
    blocks: [
      setupText(
        t(
          'O log do banco mostra deadlocks algumas vezes por dia. O time adicionou retry e o erro parou de aparecer para os usuários.',
          'The database log shows deadlocks a few times a day. The team added retries and the error stopped reaching users.',
        ),
      ),
      prompt(
        t(
          'Isso resolve o problema? O que você faria?',
          'Does that solve the problem? What would you do?',
        ),
      ),
      answers({
        short: t(
          'Retry é uma mitigação válida e eu manteria, mas não é a solução — deadlock significa que duas transações estão adquirindo os mesmos locks em ordens diferentes, e isso continua acontecendo, agora com custo de latência escondido. Eu leria o log de deadlock do Postgres, que mostra as duas queries envolvidas, e alinharia a ordem de aquisição: se todas as transações tocarem as linhas na mesma ordem, o ciclo não se forma.',
          'Retrying is a valid mitigation and I would keep it, but it is not the fix — a deadlock means two transactions are acquiring the same locks in different orders, and that is still happening, now with the latency cost hidden. I would read the Postgres deadlock log, which shows both queries involved, and align the acquisition order: if every transaction touches rows in the same order, the cycle cannot form.',
        ),
        strong: t(
          'Primeiro, o retry não é errado. Deadlock é detectado e resolvido pelo banco abortando uma das transações, e esse erro é retryable por natureza. Manteria.\n\nMas o que aconteceu foi que o problema virou invisível. A latência do retry continua, o trabalho está sendo feito duas vezes, e se a taxa subir o retry vira tempestade.\n\n**Deadlock tem uma causa só:** duas transações adquirem os mesmos locks em ordem inversa. T1 trava A e quer B; T2 trava B e quer A. Ninguém libera. O Postgres detecta o ciclo e mata uma.\n\n**O log dá a resposta pronta.** O `deadlock detected` do Postgres mostra os dois processos, as queries e os locks envolvidos. Essa mensagem costuma ser suficiente para identificar o par.\n\nOs padrões que eu procuro:\n\n**Ordem de atualização variável.** Uma transferência que atualiza a conta de origem e depois a de destino cria deadlock sempre que duas transferências opostas acontecem juntas. A correção é ordenar as linhas por id antes de travar, sempre — assim as duas transações pedem na mesma ordem e uma espera em vez de travar.\n\n**Índice ou chave estrangeira gerando lock que ninguém esperava.** Um UPDATE em uma tabela filha pega lock na linha pai por causa da FK, e isso não aparece na query.\n\n**Transação longa demais.** Quanto mais tempo a transação segura locks, maior a janela. Chamada HTTP dentro de transação é o caso clássico e o pior.\n\n**A correção estrutural** é reduzir o escopo da transação e padronizar a ordem de acesso. Depois disso eu monitoraria a taxa de deadlock como métrica: se subir de novo, é regressão, e não algo que o retry deve esconder.',
          'First, the retry is not wrong. A deadlock is detected and resolved by the database aborting one transaction, and that error is retryable by nature. I would keep it.\n\nBut what happened is that the problem became invisible. The retry latency is still there, work is being done twice, and if the rate climbs the retries become a storm.\n\n**A deadlock has exactly one cause:** two transactions acquiring the same locks in opposite orders. T1 locks A and wants B; T2 locks B and wants A. Neither releases. Postgres detects the cycle and kills one.\n\n**The log hands you the answer.** The Postgres `deadlock detected` message shows both processes, the queries and the locks involved. That message is usually enough to identify the pair.\n\nThe patterns I look for:\n\n**Variable update order.** A transfer that updates the source account then the destination deadlocks whenever two opposite transfers run together. The fix is sorting the rows by id before locking, always — then both transactions ask in the same order and one waits instead of deadlocking.\n\n**An index or foreign key producing a lock nobody expected.** An UPDATE on a child table takes a lock on the parent row because of the FK, and that does not appear in the query.\n\n**A transaction that is too long.** The longer it holds locks, the wider the window. An HTTP call inside a transaction is the classic case and the worst.\n\n**The structural fix** is shrinking the transaction scope and standardising access order. After that I would monitor the deadlock rate as a metric: if it climbs again that is a regression, not something the retry should hide.',
        ),
      }),
      code(
        'typescript',
        `
// Deadlocks whenever two opposite transfers run at the same time.
await trx.query("update accounts set balance = balance - $1 where id = $2", [amount, fromId]);
await trx.query("update accounts set balance = balance + $1 where id = $2", [amount, toId]);

// Always acquire in the same order, so one transaction waits instead of cycling.
const [first, second] = [fromId, toId].sort();
await trx.query("select id from accounts where id in ($1, $2) order by id for update", [first, second]);
`,
        { phase: 'answer' },
      ),
      lookingFor(
        list(
          [
            'Reconhecer que retry é mitigação válida, mas não correção',
            'Saber a causa única do deadlock',
            'Usar o log do banco em vez de adivinhar',
            'Propor ordem de aquisição padronizada',
            'Apontar transação longa e chamada externa dentro dela',
          ],
          [
            'Recognising retries as a valid mitigation but not a fix',
            'Knowing the single cause of a deadlock',
            'Using the database log instead of guessing',
            'Proposing a standardised acquisition order',
            'Pointing at long transactions and external calls inside them',
          ],
        ),
      ),
      followUps(
        list(
          [
            'Qual a diferença entre deadlock e lock wait timeout?',
            'Por que chamada HTTP dentro de transação é perigosa?',
            'Como você mediria se a correção funcionou?',
          ],
          [
            'What is the difference between a deadlock and a lock wait timeout?',
            'Why is an HTTP call inside a transaction dangerous?',
            'How would you measure whether the fix worked?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-redis-when',
    type: 'compare',
    title: t('Quando Redis, quando Postgres', 'When Redis, when Postgres'),
    categoryId: 'database',
    stackIds: ['redis', 'postgres'],
    skillIds: ['databases', 'caching', 'architecture'],
    difficulty: 'intermediate',
    tags: ['redis', 'postgres', 'caching', 'trade-offs'],
    minutes: 4,
    related: ['arch-cache-invalidation', 'api-rate-limit-distributed'],
    blocks: [
      prompt(
        t(
          'Quando você usaria Redis, e quando Postgres já resolve?',
          'When would you reach for Redis, and when does Postgres already handle it?',
        ),
      ),
      answers({
        short: t(
          'Redis é bom quando o acesso é por chave, a latência precisa ser de menos de um milissegundo, e o dado pode ser perdido sem drama — cache, sessão, rate limiting, fila leve, contador, lock distribuído. Postgres resolve quando eu preciso de consulta por vários critérios, de garantia transacional, ou de durabilidade. O erro que eu evito é colocar Redis na frente de tudo por reflexo: cache adiciona um problema difícil, que é invalidação, e frequentemente a query estava lenta por falta de índice.',
          'Redis is good when access is by key, latency has to be sub-millisecond, and the data can be lost without drama — cache, sessions, rate limiting, a light queue, counters, distributed locks. Postgres handles it when I need to query by several criteria, need transactional guarantees, or need durability. The mistake I avoid is putting Redis in front of everything by reflex: a cache adds a hard problem, invalidation, and often the query was slow because of a missing index.',
        ),
        strong: t(
          'Eu penso em três eixos: padrão de acesso, garantia necessária e o que acontece se o dado sumir.\n\n**Redis ganha quando:**\n\nO acesso é por chave conhecida e a latência importa muito. Sessão, token, resultado de um cálculo caro.\n\nO dado é efêmero por natureza. Rate limiting, lock distribuído com TTL, fila de trabalho leve, contador de tempo real.\n\nA estrutura de dados nativa resolve o problema. Sorted set para leaderboard, HyperLogLog para contar únicos de forma aproximada, stream para consumo por grupo. Fazer isso em Postgres é possível e é pior.\n\n**Postgres já resolve quando:**\n\nA consulta é por mais de um critério, ou precisa de agregação, ou de join.\n\nO dado precisa ser durável e consistente. Redis tem persistência, mas o modelo padrão aceita perder os últimos segundos em uma queda.\n\nO volume não justifica. Um Postgres com índice adequado e uma tabela que cabe em memória responde em poucos milissegundos, e isso é suficiente para a maioria das telas.\n\n**O custo que eu sempre coloco na mesa:** adicionar Redis é adicionar um sistema para operar, monitorar, escalar, e uma nova forma de falhar. E cache traz invalidação, que é o problema difícil de verdade — dado velho em cache é pior que consulta lenta, porque a consulta lenta você percebe.\n\nA regra prática: primeiro eu tento resolver no banco, com índice e consulta melhor. Se continuar lento e o dado tolerar estar alguns segundos desatualizado, aí sim cache. Se o problema for naturalmente de chave-valor ou efêmero, Redis desde o começo, sem passar pelo Postgres.',
          'I think along three axes: access pattern, required guarantee, and what happens if the data vanishes.\n\n**Redis wins when:**\n\nAccess is by a known key and latency matters a lot. Sessions, tokens, the result of an expensive computation.\n\nThe data is ephemeral by nature. Rate limiting, a distributed lock with a TTL, a light work queue, a real-time counter.\n\nA native data structure solves the problem. A sorted set for a leaderboard, HyperLogLog for approximate unique counts, streams for consumer-group reads. Doing that in Postgres is possible and worse.\n\n**Postgres already handles it when:**\n\nThe query has more than one criterion, or needs aggregation, or a join.\n\nThe data must be durable and consistent. Redis has persistence, but the default model accepts losing the last seconds in a crash.\n\nThe volume does not justify it. A Postgres with the right index on a table that fits in memory answers in a few milliseconds, and that is enough for most screens.\n\n**The cost I always put on the table:** adding Redis is adding a system to operate, monitor, scale, and a new way to fail. And a cache brings invalidation, which is the genuinely hard problem — stale cached data is worse than a slow query, because you notice the slow query.\n\nMy rule of thumb: first I try to fix it in the database, with an index and a better query. If it stays slow and the data tolerates being a few seconds stale, then a cache. If the problem is naturally key-value or ephemeral, Redis from the start, without going through Postgres at all.',
        ),
      }),
      tradeOff([
        {
          option: t('Redis', 'Redis'),
          pros: list(
            ['Latência sub-milissegundo', 'Estruturas nativas úteis', 'TTL embutido'],
            ['Sub-millisecond latency', 'Useful native structures', 'TTL built in'],
          ),
          cons: list(
            ['Durabilidade fraca por padrão', 'Consulta só por chave', 'Mais um sistema para operar'],
            ['Weak durability by default', 'Key-only access', 'One more system to operate'],
          ),
        },
        {
          option: t('Postgres', 'Postgres'),
          pros: list(
            ['Transações e durabilidade', 'Consulta flexível', 'Um sistema a menos'],
            ['Transactions and durability', 'Flexible querying', 'One fewer system'],
          ),
          cons: list(
            ['Latência maior em acesso por chave quente', 'Escala de leitura exige réplica'],
            ['Higher latency on hot key access', 'Read scaling needs replicas'],
          ),
        },
      ]),
      followUps(
        list(
          [
            'O que acontece com sua aplicação se o Redis cair?',
            'Que política de invalidação você usaria?',
            'Quando você usaria Redis como fila em vez de Kafka ou SQS?',
          ],
          [
            'What happens to your application if Redis goes down?',
            'What invalidation policy would you use?',
            'When would you use Redis as a queue instead of Kafka or SQS?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-normalization-when-not',
    type: 'interview-question',
    title: t('Quando desnormalizar de propósito', 'When to denormalise on purpose'),
    categoryId: 'database',
    stackIds: ['postgres', 'mongodb'],
    skillIds: ['databases', 'architecture'],
    difficulty: 'advanced',
    tags: ['normalization', 'modeling', 'trade-offs'],
    minutes: 4,
    related: ['db-index-basics', 'arch-cache-invalidation'],
    blocks: [
      prompt(
        t(
          'Normalização é sempre o objetivo? Quando você desnormalizaria de propósito?',
          'Is normalisation always the goal? When would you denormalise on purpose?',
        ),
      ),
      answers({
        short: t(
          'Normalizar é o padrão certo porque evita a pior classe de bug: o mesmo fato guardado em dois lugares que divergem. Eu desnormalizo em casos específicos e conscientes: quando o custo de join em um caminho quente é medido e alto, quando o dado precisa ser um retrato histórico e não a versão atual, e quando a agregação é cara demais para calcular em tempo de leitura. O caso histórico é o mais importante e o menos lembrado: o preço no item do pedido não é uma cópia do preço do produto, é o preço que foi cobrado.',
          'Normalising is the right default because it prevents the worst class of bug: the same fact stored in two places that diverge. I denormalise in specific, conscious cases: when the join cost on a hot path is measured and high, when the data needs to be a historical snapshot rather than the current version, and when an aggregate is too expensive to compute at read time. The historical case is the most important and the least remembered: the price on an order line is not a copy of the product price, it is the price that was charged.',
        ),
        strong: t(
          'Normalização existe para garantir que cada fato é guardado uma vez. O custo de violar isso é divergência, que é insidiosa porque só aparece muito depois.\n\nMas tem três situações em que eu desnormalizo de propósito.\n\n**Retrato histórico.** Esse não é nem desnormalização de verdade, é modelagem correta que parece desnormalização. O item do pedido guarda o preço, o nome e a descrição do produto no momento da compra. Se alguém mudar o preço do produto amanhã, o pedido de ontem não pode mudar. Aqui, referenciar o produto seria o erro. Eu vejo esse engano com frequência: alguém normaliza corretamente demais e o relatório de faturamento do ano passado muda sozinho.\n\n**Agregação cara.** Contador de comentários em um post, total do pedido, saldo. Calcular com `count(*)` a cada leitura é caro quando a leitura é muito mais frequente que a escrita. Aqui a desnormalização é uma escolha de desempenho, e ela vem com uma obrigação: manter o valor consistente, seja por trigger, seja na mesma transação, e ter um job que reconcilia. Sem reconciliação, o contador erra e ninguém percebe.\n\n**Caminho de leitura quente e medido.** Quando o join está comprovadamente custando, e depois de eu já ter tentado índice. A palavra importante é medido: desnormalizar por intuição de performance é como a maioria dos schemas ruins nasce.\n\nO que eu não aceito é desnormalizar porque o ORM ficou chato, ou porque join parece complicado. Um join com índice adequado é rápido; os bancos relacionais foram construídos para isso.\n\nE eu registraria a decisão. Toda desnormalização é dívida deliberada, e alguém em dois anos vai olhar o campo duplicado e não saber se é intencional ou bug.',
          'Normalisation exists to guarantee each fact is stored once. The cost of violating that is divergence, which is insidious because it only shows up much later.\n\nBut there are three situations where I denormalise on purpose.\n\n**A historical snapshot.** This one is not really denormalisation, it is correct modelling that looks like it. An order line stores the product\'s price, name and description as of purchase time. If someone changes the product price tomorrow, yesterday\'s order cannot change. Here, referencing the product would be the bug. I see this mistake often: someone normalises a little too correctly and last year\'s revenue report starts changing on its own.\n\n**An expensive aggregate.** A comment count on a post, an order total, a balance. Computing it with `count(*)` on every read is expensive when reads vastly outnumber writes. Here denormalisation is a performance choice, and it comes with an obligation: keep the value consistent, whether by trigger or in the same transaction, and have a reconciliation job. Without reconciliation the counter drifts and nobody notices.\n\n**A hot, measured read path.** When the join is demonstrably costing, and after I have already tried an index. The important word is measured: denormalising on a hunch about performance is how most bad schemas are born.\n\nWhat I do not accept is denormalising because the ORM got awkward, or because joins look complicated. A join with the right index is fast; relational databases were built for it.\n\nAnd I would record the decision. Every denormalisation is deliberate debt, and someone in two years will look at the duplicated column and not know whether it is intentional or a bug.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber por que normalizar é o padrão',
            'Identificar o caso histórico como modelagem, não como otimização',
            'Exigir medição antes de desnormalizar por performance',
            'Lembrar da obrigação de reconciliar agregados',
            'Registrar a decisão como dívida deliberada',
          ],
          [
            'Knowing why normalising is the default',
            'Identifying the historical case as modelling rather than optimisation',
            'Requiring measurement before denormalising for performance',
            'Remembering the obligation to reconcile aggregates',
            'Recording the decision as deliberate debt',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte usa o exemplo do preço no pedido. É concreto, é correto, e mostra que a pessoa já modelou um domínio real.',
            'A strong answer uses the order-line price example. It is concrete, it is correct, and it shows the person has modelled a real domain.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você manteria um contador desnormalizado consistente?',
            'Como isso muda em um banco de documentos?',
            'Quando uma view materializada é melhor do que desnormalizar?',
          ],
          [
            'How would you keep a denormalised counter consistent?',
            'How does this change in a document database?',
            'When is a materialised view better than denormalising?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'db-migration-zero-downtime',
    type: 'architecture',
    title: t('Migration sem downtime', 'A migration with no downtime'),
    categoryId: 'database',
    stackIds: ['postgres'],
    skillIds: ['databases', 'devops', 'architecture'],
    difficulty: 'expert',
    tags: ['migration', 'deploy', 'postgres', 'availability'],
    minutes: 5,
    related: ['api-versioning', 'api-graceful-shutdown'],
    blocks: [
      setupText(
        t(
          'Você precisa renomear uma coluna usada por um serviço que roda em várias instâncias e não pode parar.',
          'You need to rename a column used by a service running on several instances that cannot be stopped.',
        ),
      ),
      prompt(
        t('Como você faria essa migração?', 'How would you run that migration?')),
      answers({
        short: t(
          'Renomear direto quebra, porque durante o deploy as versões antiga e nova rodam ao mesmo tempo. O padrão é expandir, migrar, contrair: primeiro adiciono a coluna nova e escrevo nas duas; depois faço o backfill dos dados antigos em lotes; depois deployo o código que lê da nova; e só quando nenhuma instância antiga existir é que eu removo a antiga. São quatro deploys em vez de um, e cada passo é reversível sozinho.',
          'Renaming directly breaks, because during the deploy the old and new versions run at the same time. The pattern is expand, migrate, contract: first add the new column and write to both; then backfill the old data in batches; then deploy code that reads from the new one; and only once no old instance exists do I drop the old column. Four deploys instead of one, and each step is independently reversible.',
        ),
        strong: t(
          'A restrição que define tudo: durante um rolling deploy, código antigo e novo rodam simultaneamente contra o mesmo banco. Então todo estado intermediário do schema precisa funcionar para as duas versões.\n\n**Passo 1 — expandir.** Adiciono a coluna nova, nullable e sem default que force reescrita de tabela. No Postgres, adicionar coluna nullable é instantâneo; adicionar com default volátil reescreve a tabela e trava. Deployo o código que escreve nas duas colunas e continua lendo da antiga. Nesse ponto as duas versões do código convivem sem problema.\n\n**Passo 2 — backfill.** Copio os dados antigos em lotes, com pausa entre eles. Um `UPDATE` sem `WHERE` em uma tabela grande segura lock e gera bloat enorme. Eu faço por faixa de id, alguns milhares por vez, monitorando replicação — lag de réplica é o efeito colateral que costuma derrubar leitura.\n\n**Passo 3 — trocar a leitura.** Deployo o código que lê da coluna nova e continua escrevendo nas duas. Se algo der errado, o rollback é trivial porque a coluna antiga ainda está correta e populada.\n\n**Passo 4 — contrair.** Depois de um tempo de segurança, paro de escrever na antiga. Depois, em um deploy separado, removo a coluna.\n\nO intervalo entre os passos importa. Eu não encadeio tudo no mesmo dia: quero que a versão nova rode em produção tempo suficiente para eu confiar antes de remover a rede de segurança.\n\n**Cuidados específicos do Postgres** que eu mencionaria: `CREATE INDEX CONCURRENTLY` para não travar escrita; adicionar constraint como `NOT VALID` e validar depois, em passo separado; e cuidado com lock de DDL, porque `ALTER TABLE` espera por transação longa e, enquanto espera, enfileira todo mundo atrás dele. Já vi um `ALTER TABLE` inocente derrubar uma API porque ficou esperando uma transação esquecida aberta.',
          'The constraint that defines everything: during a rolling deploy, old and new code run simultaneously against the same database. So every intermediate schema state has to work for both versions.\n\n**Step 1 — expand.** Add the new column, nullable, with no default that forces a table rewrite. In Postgres, adding a nullable column is instant; adding one with a volatile default rewrites the table and locks it. Deploy code that writes to both columns and still reads from the old one. At this point both code versions coexist fine.\n\n**Step 2 — backfill.** Copy the old data in batches, with pauses between them. An `UPDATE` with no `WHERE` on a big table holds locks and generates enormous bloat. I go by id range, a few thousand at a time, watching replication — replica lag is the side effect that usually takes reads down.\n\n**Step 3 — switch the read.** Deploy code that reads the new column and keeps writing to both. If something goes wrong the rollback is trivial, because the old column is still correct and populated.\n\n**Step 4 — contract.** After a safety period, stop writing to the old one. Then, in a separate deploy, drop the column.\n\nThe gap between steps matters. I do not chain them all in one day: I want the new version running in production long enough to trust it before removing the safety net.\n\n**Postgres-specific care** I would mention: `CREATE INDEX CONCURRENTLY` so writes are not blocked; adding constraints as `NOT VALID` and validating later in a separate step; and watching DDL locks, because `ALTER TABLE` waits for long transactions and, while waiting, queues everyone behind it. I have watched an innocent `ALTER TABLE` take an API down because it was waiting on a forgotten open transaction.',
        ),
      }),
      lookingFor(
        list(
          [
            'Reconhecer que as duas versões do código convivem durante o deploy',
            'Nomear o padrão expandir, migrar, contrair',
            'Fazer backfill em lotes, atento a lag de réplica',
            'Manter reversibilidade em cada passo',
            'Conhecer os cuidados de DDL do Postgres',
          ],
          [
            'Recognising both code versions coexist during the deploy',
            'Naming the expand, migrate, contract pattern',
            'Backfilling in batches, watching replica lag',
            'Keeping each step reversible',
            'Knowing the Postgres DDL pitfalls',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte menciona que ALTER TABLE esperando um lock enfileira todas as outras queries. É um detalhe que só se aprende derrubando algo.',
            'A strong answer mentions that an ALTER TABLE waiting on a lock queues every other query behind it. That detail is only learned by taking something down.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você faria isso se a coluna tivesse uma constraint NOT NULL?',
            'Por que CREATE INDEX CONCURRENTLY e qual o custo?',
            'Como você saberia que é seguro remover a coluna antiga?',
          ],
          [
            'How would you do this if the column had a NOT NULL constraint?',
            'Why CREATE INDEX CONCURRENTLY, and what does it cost?',
            'How would you know it is safe to drop the old column?',
          ],
        ),
      ),
    ],
  }),
];
