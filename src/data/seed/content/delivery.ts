import type { Content } from '@/domain/types';
import {
  answers,
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
  warn,
} from '../authoring';

/**
 * Delivery: containers and the pipeline that puts code in production.
 *
 * The roadmap has a Docker region and a CI/CD region, and backend interviews
 * lean on both — usually as "how does your code get to production, and what
 * happens when it goes wrong".
 */
export const DELIVERY_CONTENT: Content[] = [
  content({
    slug: 'dev-containers-learn',
    type: 'concept',
    kind: 'learn',
    title: t('O que um container realmente é', 'What a container actually is'),
    categoryId: 'devops',
    topic: 'containers',
    stackIds: ['docker', 'nodejs'],
    sourceIds: ['docker-build', 'twelve-factor'],
    skillIds: ['devops'],
    difficulty: 'intermediate',
    tags: ['docker', 'imagem', 'deploy'],
    minutes: 4,
    related: ['dev-dockerfile-bug', 'dev-deploy-decisions'],
    blocks: [
      note(
        t(
          'Container não é máquina virtual. É um processo do mesmo kernel, isolado por recursos do sistema operacional — namespaces para não enxergar o resto, cgroups para não consumir tudo. Por isso sobe em milissegundos e por isso não serve para rodar outro sistema operacional.',
          'A container is not a virtual machine. It is a process on the same kernel, isolated by operating-system features — namespaces so it cannot see the rest, cgroups so it cannot consume everything. That is why it starts in milliseconds, and why it cannot run a different operating system.',
        ),
      ),
      note(
        t(
          '**Imagem** é o sistema de arquivos empacotado, em camadas, imutável. **Container** é uma execução dessa imagem com uma camada de escrita por cima, descartada no fim. Entender isso resolve metade das dúvidas de deploy: "por que meu arquivo sumiu?" porque ele estava na camada de escrita.',
          'An **image** is the packaged filesystem, in layers, immutable. A **container** is one execution of that image with a writable layer on top, discarded at the end. Understanding that answers half the deploy questions: "why did my file disappear?" because it lived in the writable layer.',
        ),
        t('Imagem e container', 'Image and container'),
      ),
      note(
        t(
          'As camadas são cacheadas por instrução. Copiar o código antes de instalar dependências invalida o cache a cada commit, e o build passa de vinte segundos para três minutos. Por isso a ordem canônica é: copiar manifesto, instalar, depois copiar o resto.',
          'Layers are cached per instruction. Copying the code before installing dependencies invalidates the cache on every commit, and the build goes from twenty seconds to three minutes. That is why the canonical order is: copy the manifest, install, then copy the rest.',
        ),
        t('Camadas e cache', 'Layers and cache'),
      ),
      code(
        'dockerfile',
        `
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./          # muda pouco: cache aproveitado
RUN npm ci
COPY . .                       # muda sempre: só daqui para baixo reconstrói
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
`,
        {
          caption: t(
            'Multi-stage: a imagem final não carrega compilador, testes nem código-fonte.',
            'Multi-stage: the final image carries no compiler, no tests and no source.',
          ),
        },
      ),
      note(
        t(
          '**Volume** existe porque o container é descartável: banco, upload e qualquer estado que precisa sobreviver ficam fora. **Rede** existe porque containers só se enxergam por nome quando estão na mesma rede — é a explicação para metade dos "connection refused" em Compose.',
          '**Volumes** exist because containers are disposable: databases, uploads and any state that must survive live outside. **Networks** exist because containers only resolve each other by name on the same network — which explains half the "connection refused" errors in Compose.',
        ),
        t('Volume e rede', 'Volumes and networks'),
      ),
      note(
        t(
          'Configuração entra por variável de ambiente, não por arquivo dentro da imagem. A mesma imagem tem que rodar em staging e produção — se precisar rebuildar para trocar de ambiente, o que você está promovendo não é o artefato testado.',
          'Configuration comes in through environment variables, not a file baked into the image. The same image has to run in staging and production — if you need a rebuild to switch environments, what you are promoting is not the artefact you tested.',
        ),
        t('Configuração', 'Configuration'),
      ),
    ],
  }),

  content({
    slug: 'dev-dockerfile-bug',
    type: 'find-the-bug',
    kind: 'find-the-bug',
    title: t('O Dockerfile que ninguém revisou', 'The Dockerfile nobody reviewed'),
    categoryId: 'devops',
    topic: 'containers',
    stackIds: ['docker', 'nodejs'],
    sourceIds: ['docker-build'],
    skillIds: ['devops', 'security'],
    difficulty: 'intermediate',
    tags: ['docker', 'build', 'segurança'],
    minutes: 4,
    related: ['dev-containers-learn'],
    blocks: [
      code(
        'dockerfile',
        `
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV DATABASE_URL=postgres://app:s3cr3t@db:5432/app
EXPOSE 3000
CMD npm start
`,
      ),
      prompt(
        t(
          'Aponte os problemas deste Dockerfile, do mais grave ao menos grave, e diga o que muda em cada correção.',
          'List the problems in this Dockerfile, worst first, and say what each fix changes.',
        ),
      ),
      answers({
        short: t(
          'O mais grave é a senha do banco fixada na imagem: quem puxar a imagem tem a credencial, e ela fica no histórico de camadas mesmo se removida depois. Depois: `COPY . .` antes do `npm install` mata o cache e ainda leva `.git` e `.env` para dentro; `npm install` em vez de `npm ci` ignora o lockfile; a imagem final é a completa com compilador, sem multi-stage; roda como root; e `CMD npm start` deixa o Node como processo filho, então sinal de parada não chega direito.',
          'The worst is the database password baked into the image: anyone who pulls it has the credential, and it stays in the layer history even if removed later. Then: `COPY . .` before `npm install` kills the cache and also drags in `.git` and `.env`; `npm install` instead of `npm ci` ignores the lockfile; the final image is the full one with a compiler, no multi-stage; it runs as root; and `CMD npm start` leaves Node as a child process, so stop signals do not arrive properly.',
        ),
        strong: t(
          'Em ordem de gravidade:\n\n**Segredo na imagem.** `ENV DATABASE_URL=...` grava a senha numa camada. Quem tiver a imagem tem a credencial, e `docker history` mostra. Correção: variável injetada em runtime, e a senha rotacionada, porque ela já vazou.\n\n**`COPY . .` antes de instalar.** Invalida o cache em todo commit e ainda copia `.git`, `.env` e `node_modules` local se não houver `.dockerignore`. Correção: `.dockerignore` e copiar só o manifesto antes do install.\n\n**`npm install` no lugar de `npm ci`.** O build pode resolver versões diferentes das testadas. `npm ci` respeita o lockfile e falha se ele estiver dessincronizado — que é o comportamento que se quer em CI.\n\n**Sem multi-stage.** A imagem final leva compilador, devDependencies e código-fonte: mais superfície de ataque e mais tempo de pull em cada escala.\n\n**Root.** Sem `USER node`, qualquer execução de código dentro do container é root no namespace. Correção de uma linha.\n\n**`CMD npm start`.** O npm vira PID 1 e repassa sinal de forma inconsistente; em desligamento, conexões em andamento são cortadas em vez de drenadas. Correção: `CMD ["node", "dist/server.js"]`.\n\nSe eu tivesse que corrigir só duas coisas hoje: tirar o segredo e rotacionar a senha, e adicionar `.dockerignore` — a primeira por risco, a segunda porque é onde o `.env` de alguém entra na imagem sem ninguém perceber.',
          'In order of severity:\n\n**Secret in the image.** `ENV DATABASE_URL=...` writes the password into a layer. Anyone with the image has the credential, and `docker history` shows it. Fix: inject it at runtime, and rotate the password, because it has already leaked.\n\n**`COPY . .` before installing.** Invalidates the cache on every commit and also copies `.git`, `.env` and a local `node_modules` when there is no `.dockerignore`. Fix: a `.dockerignore`, and copy only the manifest before installing.\n\n**`npm install` instead of `npm ci`.** The build can resolve different versions than the ones tested. `npm ci` honours the lockfile and fails when it is out of sync — which is the behaviour you want in CI.\n\n**No multi-stage.** The final image ships a compiler, devDependencies and source: more attack surface and more pull time on every scale-out.\n\n**Root.** Without `USER node`, any code execution inside the container is root in that namespace. A one-line fix.\n\n**`CMD npm start`.** npm becomes PID 1 and forwards signals inconsistently; on shutdown, in-flight connections get cut instead of drained. Fix: `CMD ["node", "dist/server.js"]`.\n\nIf I could only fix two things today: remove the secret and rotate the password, and add a `.dockerignore` — the first for risk, the second because that is where somebody\'s `.env` silently enters the image.',
        ),
        seconds: { short: 45, strong: 150 },
      }),
      rubric({
        incorrect: t(
          'Aponta só estilo (tamanho da imagem, versão da base) e não vê o segredo.',
          'Only points at style (image size, base version) and misses the secret.',
        ),
        partial: t(
          'Encontra segredo e cache, mas não liga `CMD npm start` a desligamento e sinais.',
          'Finds the secret and the cache issue, but does not connect `CMD npm start` to shutdown and signals.',
        ),
        strong: t(
          'Ordena por risco, explica o efeito de cada correção e cita `.dockerignore`.',
          'Orders by risk, explains the effect of each fix, and mentions `.dockerignore`.',
        ),
        interviewReady: t(
          'Tudo acima, mais rotacionar a credencial vazada e priorizar o que corrigir hoje.',
          'All of the above, plus rotating the leaked credential and prioritising what to fix today.',
        ),
      }),
      warn(
        t(
          'Remover o `ENV` num commit seguinte não apaga a camada anterior. Imagem com segredo é credencial comprometida — rotacione.',
          'Removing the `ENV` in a later commit does not erase the earlier layer. An image with a secret is a compromised credential — rotate it.',
        ),
      ),
    ],
  }),

  content({
    slug: 'dev-pipeline-learn',
    type: 'concept',
    kind: 'learn',
    title: t('O que uma pipeline precisa garantir', 'What a pipeline has to guarantee'),
    categoryId: 'devops',
    topic: 'ci-cd',
    stackIds: ['docker', 'nodejs'],
    sourceIds: ['gh-actions', 'twelve-factor'],
    skillIds: ['devops', 'testing'],
    difficulty: 'intermediate',
    tags: ['ci', 'cd', 'deploy'],
    minutes: 4,
    related: ['dev-deploy-decisions', 'dev-deploy-interview'],
    blocks: [
      note(
        t(
          'Uma pipeline não existe para "rodar testes". Existe para responder uma pergunta com confiança: *este commit pode ir para produção?* Tudo que ela faz deveria servir a essa resposta.',
          'A pipeline does not exist to "run tests". It exists to answer one question with confidence: *can this commit go to production?* Everything it does should serve that answer.',
        ),
      ),
      note(
        t(
          'A ordem importa porque feedback rápido é o produto. Lint e testes unitários primeiro, em segundos. Build e testes de integração depois. Coisas caras — end to end, análise de segurança, imagem final — por último, ou em paralelo, para não fazer o desenvolvedor esperar dez minutos por um erro de formatação.',
          'Order matters because fast feedback is the product. Lint and unit tests first, in seconds. Build and integration tests next. Expensive things — end to end, security scanning, the final image — last, or in parallel, so a developer does not wait ten minutes for a formatting error.',
        ),
        t('A ordem dos estágios', 'Stage order'),
      ),
      note(
        t(
          'O artefato é construído **uma vez** e promovido entre ambientes. Se cada ambiente faz o próprio build, o que foi testado não é o que foi para produção — e o bug que só aparece em produção passa a ser inevitável.',
          'The artefact is built **once** and promoted between environments. If each environment builds its own, what was tested is not what shipped — and the bug that only appears in production becomes inevitable.',
        ),
        t('Construa uma vez', 'Build once'),
      ),
      code(
        'yaml',
        `
# rápido primeiro, caro depois
jobs:
  check:     # lint + typecheck + unit        ~40s
  build:     # compila e publica a imagem     ~90s   needs: check
  it:        # integração com Postgres real   ~3min  needs: build
  deploy:    # promove a MESMA imagem         needs: [it]
`,
      ),
      note(
        t(
          'Migrations são a parte que morde. Elas rodam antes do código novo e precisam funcionar com o código antigo ainda no ar — por isso a regra de expandir e contrair: adicionar coluna nova, fazer o código escrever nas duas, migrar, e só depois remover a antiga, em outro deploy.',
          'Migrations are the part that bites. They run before the new code and have to work while the old code is still live — hence expand and contract: add the new column, have the code write to both, migrate, and only then drop the old one, in a separate deploy.',
        ),
        t('Migrations', 'Migrations'),
      ),
      note(
        t(
          'E a pipeline precisa de um caminho de volta. Rollback de código é fácil; rollback de migration destrutiva não existe. É por isso que "posso reverter em um minuto?" é uma pergunta melhor do que "quantos testes temos?".',
          'And a pipeline needs a way back. Rolling back code is easy; rolling back a destructive migration does not exist. That is why "can I revert in a minute?" is a better question than "how many tests do we have?".',
        ),
        t('O caminho de volta', 'The way back'),
      ),
    ],
  }),

  content({
    slug: 'dev-deploy-decisions',
    type: 'scenario',
    kind: 'decision',
    title: t('Decisões de deploy', 'Deploy calls'),
    categoryId: 'devops',
    topic: 'ci-cd',
    stackIds: ['docker', 'postgres'],
    skillIds: ['devops'],
    difficulty: 'advanced',
    tags: ['deploy', 'migration', 'rollback'],
    minutes: 3,
    related: ['dev-pipeline-learn', 'db-migration-zero-downtime'],
    blocks: [
      decisions(
        [
          {
            statement: t(
              'A coluna `full_name` virou `first_name` e `last_name`. Vou fazer a migration e o deploy do código novo no mesmo passo.',
              'The `full_name` column became `first_name` and `last_name`. I will run the migration and deploy the new code in one step.',
            ),
            expected: 'disagree',
            verdict: t(
              'Durante o deploy, as duas versões do código rodam ao mesmo tempo.',
              'During a deploy, both versions of the code are running at once.',
            ),
            why: t(
              'Se a coluna antiga sumir antes de a instância antiga morrer, ela quebra em produção — e rollback não traz a coluna de volta. O caminho é expandir e contrair: criar as colunas novas, escrever nas duas, migrar os dados, trocar a leitura, e remover `full_name` só num deploy posterior.',
              'If the old column disappears before the old instance does, it breaks in production — and a rollback will not bring the column back. The path is expand and contract: create the new columns, write to both, migrate the data, switch reads, and drop `full_name` only in a later deploy.',
            ),
            tradeOff: t(
              'São três deploys em vez de um, e um período com dados duplicados. É o preço de poder reverter.',
              'That is three deploys instead of one, and a window with duplicated data. It is the price of being able to revert.',
            ),
          },
          {
            statement: t(
              'A feature é grande e arriscada. Vou entregá-la atrás de uma flag desligada e ligar para 5% dos usuários.',
              'The feature is big and risky. I will ship it behind a flag, turned off, and enable it for 5% of users.',
            ),
            expected: 'agree',
            verdict: t(
              'Separar deploy de release é o que torna a entrega reversível.',
              'Separating deploy from release is what makes delivery reversible.',
            ),
            why: t(
              'Código em produção com a flag desligada já valida build, migration e inicialização, sem expor ninguém. Ligar para uma fatia dá sinal real com dano limitado, e desligar é instantâneo — bem mais rápido que um rollback de imagem.',
              'Code in production with the flag off already validates the build, the migration and startup, without exposing anyone. Enabling a slice gives real signal with limited blast radius, and switching off is instant — much faster than rolling an image back.',
            ),
            context: t(
              'O custo é flag esquecida: sem data de remoção, o código acumula dois caminhos para sempre. Flag de release precisa de prazo.',
              'The cost is forgotten flags: with no removal date, the code carries two paths forever. A release flag needs an expiry.',
            ),
          },
          {
            statement: t(
              'Nosso deploy tem downtime de 30 segundos. Como é de madrugada, não vale o esforço de mudar.',
              'Our deploy has 30 seconds of downtime. Since it runs at night, changing it is not worth the effort.',
            ),
            expected: 'disagree',
            verdict: t(
              'Downtime aceito é deploy adiado, e deploy adiado é lote grande.',
              'Accepted downtime means postponed deploys, and postponed deploys mean big batches.',
            ),
            why: t(
              'O custo real não são os 30 segundos: é o time passar a evitar deploy no horário comercial, juntar dez mudanças por vez e transformar cada correção urgente numa decisão. Rolling update com health check e desligamento gracioso resolve na maioria dos casos, e destrava entrega contínua.',
              'The real cost is not the 30 seconds: it is the team starting to avoid deploying during business hours, batching ten changes at a time, and turning every urgent fix into a decision. A rolling update with health checks and graceful shutdown solves most cases, and unblocks continuous delivery.',
            ),
          },
        ],
        'buttons',
      ),
    ],
  }),

  content({
    slug: 'dev-deploy-interview',
    type: 'interview-question',
    kind: 'interview',
    title: t('Como você sabe que o deploy deu certo', 'How you know a deploy went well'),
    categoryId: 'devops',
    topic: 'ci-cd',
    stackIds: ['docker'],
    sourceIds: ['sre-monitoring'],
    skillIds: ['devops', 'observability', 'communication'],
    difficulty: 'advanced',
    tags: ['deploy', 'observabilidade', 'incidente'],
    minutes: 4,
    related: ['dev-deploy-decisions', 'api-observability-3am'],
    blocks: [
      prompt(
        t(
          'Você acabou de subir uma versão. Como você sabe, nos primeiros minutos, se ela está saudável — e o que faz você reverter?',
          'You have just shipped a version. How do you know, in the first few minutes, whether it is healthy — and what makes you roll back?',
        ),
      ),
      answers({
        short: t(
          'Eu olho quatro sinais nos primeiros minutos: taxa de erro, latência p95, throughput e saúde das dependências. Comparo com a versão anterior, não com um limite absoluto. E decido rollback por critério combinado antes do deploy — por exemplo, erro acima de 2% por cinco minutos — para não ficar negociando durante o incidente.',
          'I watch four signals in the first minutes: error rate, p95 latency, throughput and dependency health. I compare against the previous version, not an absolute threshold. And I agree the rollback criterion before deploying — say, errors above 2% for five minutes — so I am not negotiating during the incident.',
        ),
        strong: t(
          'A parte que importa é decidir antes. Antes de subir, o time combina o que significa "ruim": qual métrica, qual valor, por quanto tempo. Durante o incidente ninguém consegue julgar isso com clareza, e a conversa vira opinião.\n\nOs sinais que eu uso são os quatro clássicos: taxa de erro, latência, tráfego e saturação. Comparados com a janela equivalente da versão anterior, porque o valor absoluto engana — terça às 10h não parece domingo às 3h.\n\nDepois eu olho o que é específico do que mudou. Se o deploy mexeu em pagamento, quero a taxa de aprovação, não só o HTTP 200. Métrica de negócio pega o que a métrica técnica não pega: o endpoint responde 200 e nenhuma compra é concluída.\n\nSobre reverter: eu prefiro reverter cedo e investigar depois. Rollback é barato quando existe artefato anterior e a migration foi compatível; se a migration não for reversível, isso precisava ter sido pensado antes do deploy, e nesse caso o caminho é flag ou correção para frente.\n\nPor fim, entrega gradual muda tudo: com canário em 5%, o sinal chega com dano pequeno, e a decisão fica fácil. Sem canário, você está escolhendo entre esperar e adivinhar.',
          'The part that matters is deciding beforehand. Before shipping, the team agrees what "bad" means: which metric, which value, for how long. During an incident nobody judges that clearly, and the conversation turns into opinion.\n\nThe signals I use are the four classics: error rate, latency, traffic and saturation. Compared against the equivalent window of the previous version, because absolute values mislead — Tuesday 10am does not look like Sunday 3am.\n\nThen I look at what is specific to what changed. If the deploy touched payments, I want the approval rate, not just HTTP 200s. Business metrics catch what technical ones miss: the endpoint answers 200 and no purchase completes.\n\nOn rolling back: I would rather roll back early and investigate after. A rollback is cheap when the previous artefact exists and the migration was compatible; if the migration is not reversible, that had to be thought through before the deploy, and then the path is a flag or a fix forward.\n\nFinally, gradual delivery changes everything: with a 5% canary, the signal arrives with small damage and the decision is easy. Without one, you are choosing between waiting and guessing.',
        ),
        seconds: { short: 40, strong: 145 },
      }),
      lookingFor(
        list(
          [
            'Critério de rollback definido antes, não durante.',
            'Comparação com a versão anterior, não com um número solto.',
            'Pelo menos uma métrica de negócio, além das técnicas.',
            'Consciência de que migration decide se rollback é possível.',
          ],
          [
            'A rollback criterion agreed before, not during.',
            'Comparison against the previous version, not an isolated number.',
            'At least one business metric beyond the technical ones.',
            'Awareness that the migration decides whether rollback is even possible.',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Confiar só em health check: ele diz que o processo subiu, não que o produto funciona.',
            'Esperar o usuário reclamar como forma de monitoramento.',
            'Tratar rollback como derrota e insistir em corrigir para frente sob pressão.',
          ],
          [
            'Trusting the health check alone: it says the process started, not that the product works.',
            'Using user complaints as a monitoring strategy.',
            'Treating rollback as defeat and insisting on fixing forward under pressure.',
          ],
        ),
      ),
      followUps(
        list(
          [
            'O que você faz quando a métrica piora, mas só para um cliente grande?',
            'Como você testaria o rollback antes de precisar dele?',
            'Quem decide reverter às três da manhã?',
          ],
          [
            'What do you do when the metric degrades, but only for one large customer?',
            'How would you test the rollback before you need it?',
            'Who decides to roll back at 3am?',
          ],
        ),
      ),
      tip(
        t(
          'Se você citar "combinamos o critério de rollback antes de subir", normalmente o entrevistador muda de assunto satisfeito — é o sinal de quem já operou.',
          'If you mention "we agree the rollback criterion before shipping", interviewers usually move on satisfied — it is the signal of someone who has operated software.',
        ),
      ),
    ],
  }),
];
