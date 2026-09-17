import type { Content } from '@/domain/types';
import {
  answers,
  content,
  followUps,
  list,
  lookingFor,
  mistakes,
  prompt,
  setupText,
  t,
  tip,
  warn,
} from '../authoring';

/**
 * Behavioural content.
 *
 * The model answers here are shapes, not scripts. Each one carries a worked
 * example so the structure is visible, and every interview tip says plainly
 * that the candidate's own story goes into that shape. A memorised story is
 * detectable within two sentences, which defeats the point.
 */
export const BEHAVIORAL_CONTENT: Content[] = [
  content({
    slug: 'beh-tell-me-about-yourself',
    type: 'behavioral',
    title: t('Fale sobre você', 'Tell me about yourself'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'storytelling'],
    difficulty: 'intermediate',
    tags: ['introduction', 'opener', 'positioning'],
    minutes: 5,
    related: ['beh-why-international', 'beh-why-hire-you', 'eng-explain-your-work'],
    blocks: [
      setupText(
        t(
          'É a primeira pergunta, quase sempre. E é a que mais gente desperdiça.',
          'It is the first question, nearly always. And the one most people waste.',
        ),
      ),
      prompt(t('Fale sobre você.', 'Tell me about yourself.')),
      answers({
        short: t(
          'Sou desenvolvedor backend, trabalho principalmente com Node.js e Postgres há uns seis anos. Nos últimos dois anos estive em uma equipe de pagamentos, onde a maior parte do meu trabalho foi confiabilidade — idempotência, reprocessamento, deixar o sistema previsível quando a integração do outro lado não é. É o tipo de problema que eu gosto: pouco glamour e muito impacto. Estou procurando uma posição onde eu continue nessa área, com um time distribuído.',
          'I am a backend developer, mostly Node.js and Postgres, for about six years. For the last two I have been on a payments team, where most of my work has been reliability — idempotency, reprocessing, making the system predictable when the integration on the other side is not. That is the kind of problem I like: not glamorous, high impact. I am looking for a role where I keep working in that area, with a distributed team.',
        ),
        strong: t(
          'Sou desenvolvedor backend há uns seis anos, principalmente Node.js, TypeScript e Postgres.\n\nComecei em uma agência, o que me deu variedade mas pouca profundidade — muito projeto entregue e nunca operado. Saí de lá porque queria ver o que acontece com o software depois do deploy.\n\nOs últimos dois anos foram em uma equipe de pagamentos, e foi onde eu mais aprendi. Pagamento é um domínio em que quase tudo dá errado eventualmente: o provedor cai, a resposta se perde, o cliente clica duas vezes. Boa parte do meu trabalho foi fazer o sistema lidar com isso sem intervenção manual — chave de idempotência nos endpoints de cobrança, reconciliação automática, e um painel para o time de operações resolver sozinho o que antes virava chamado para engenharia.\n\nO que eu tirei disso, e que eu levo para qualquer lugar, é que confiabilidade é principalmente sobre o que acontece quando algo falha, não sobre evitar a falha.\n\nAgora eu estou procurando um time internacional, distribuído, com problemas de escala maiores do que os que eu já vi. E honestamente também para trabalhar em inglês no dia a dia — eu leio e escrevo bem, e quero que falar seja igualmente natural.',
          'I have been a backend developer for about six years, mostly Node.js, TypeScript and Postgres.\n\nI started at an agency, which gave me variety but not much depth — a lot of projects delivered and never operated. I left because I wanted to see what happens to software after the deploy.\n\nThe last two years have been on a payments team, and that is where I learned the most. Payments is a domain where nearly everything eventually goes wrong: the provider goes down, the response gets lost, the customer double-clicks. A lot of my work was making the system handle that without manual intervention — idempotency keys on the charge endpoints, automatic reconciliation, and a dashboard that let the operations team resolve things themselves that used to become engineering tickets.\n\nWhat I took from that, and carry anywhere, is that reliability is mostly about what happens when something fails, not about preventing the failure.\n\nNow I am looking for an international, distributed team with scale problems bigger than the ones I have seen. And honestly, also to work in English day to day — I read and write it well, and I want speaking it to feel just as natural.',
        ),
        deep: t(
          'A estrutura que funciona é: onde você está agora, como chegou aqui, o que você fez que importa, e por que esta vaga.\n\n**Onde você está agora**, em uma frase. Cargo, stack principal, tempo. Isso dá âncora ao entrevistador.\n\n**Como chegou aqui**, brevemente, e só se a trajetória contar algo. Uma transição de carreira explicada em uma frase é interessante; uma lista cronológica de empregos não é.\n\n**Uma coisa concreta que você fez.** Essa é a parte que quase todo mundo omite e é a que o entrevistador vai lembrar. Não precisa ser grande — precisa ser específica e sua. "Trabalhei com microsserviços" não é nada. "Coloquei chave de idempotência nos endpoints de cobrança porque o app de mobile tinha retry e a gente estava cobrando gente duas vezes" é uma história inteira em uma frase.\n\n**Por que esta vaga**, em uma frase honesta.\n\n**Duração:** entre um minuto e meio e dois. Menos que isso soa desinteressado; mais que isso e o entrevistador já parou de ouvir.\n\n**O que deixar de fora:** onde você nasceu, faculdade em detalhe (a não ser que seja recém-formado), lista completa de tecnologias, e adjetivos sobre si mesmo. "Sou proativo, comunicativo e apaixonado por tecnologia" não informa nada e todo mundo diz. Deixe o entrevistador concluir isso a partir do que você conta.',
          'The structure that works is: where you are now, how you got here, one thing you did that mattered, and why this role.\n\n**Where you are now**, in one sentence. Title, main stack, how long. That gives the interviewer an anchor.\n\n**How you got here**, briefly, and only if the path says something. A career change explained in one sentence is interesting; a chronological list of jobs is not.\n\n**One concrete thing you did.** This is the part almost everyone leaves out and the part the interviewer will remember. It does not have to be large — it has to be specific and yours. "I worked with microservices" is nothing. "I put idempotency keys on our charge endpoints because the mobile app had retries and we were charging people twice" is a whole story in one sentence.\n\n**Why this role**, in one honest sentence.\n\n**Length:** between ninety seconds and two minutes. Less sounds disengaged; more and the interviewer has stopped listening.\n\n**What to leave out:** where you were born, university in detail (unless you just graduated), a complete technology list, and adjectives about yourself. "I am proactive, communicative and passionate about technology" carries no information and everybody says it. Let the interviewer conclude that from what you describe.',
        ),
      }),
      lookingFor(
        list(
          [
            'Uma narrativa, não uma leitura do currículo',
            'Pelo menos um exemplo concreto e específico',
            'Conexão explícita com a vaga em questão',
            'Entre um minuto e meio e dois minutos',
            'Sinais de que a pessoa pensa sobre o próprio trabalho',
          ],
          [
            'A narrative rather than a reading of the CV',
            'At least one concrete, specific example',
            'An explicit connection to this particular role',
            'Between ninety seconds and two minutes',
            'Signs the person thinks about their own work',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte tem um detalhe que só quem viveu aquilo contaria. É o que faz o entrevistador se lembrar de você entre oito candidatos.',
            'A strong answer has one detail only someone who lived it would tell. That is what makes the interviewer remember you among eight candidates.',
          ),
          shallow: t(
            'Uma resposta superficial recita tecnologias em ordem cronológica e termina sem que o entrevistador saiba do que você gosta.',
            'A shallow answer recites technologies chronologically and ends without the interviewer knowing what you enjoy.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Começar por "nasci em..." e contar a vida inteira',
            'Listar todas as tecnologias que já tocou',
            'Falar quatro minutos',
            'Usar adjetivos genéricos sobre si mesmo em vez de exemplos',
            'Dar exatamente a mesma resposta em todas as entrevistas, sem adaptar à vaga',
          ],
          [
            'Starting with "I was born in..." and telling your whole life',
            'Listing every technology you have ever touched',
            'Talking for four minutes',
            'Using generic adjectives about yourself instead of examples',
            'Giving the identical answer in every interview, without adapting to the role',
          ],
        ),
      ),
      tip(
        t(
          'A resposta acima é uma forma, não um texto para decorar. História decorada é detectável em duas frases — o ritmo muda e a pessoa para de olhar para a câmera. Escreva a sua em tópicos, grave três vezes, e jogue fora o texto. O objetivo é conhecer a história, não a redação dela.',
          'The answer above is a shape, not a script. A memorised story is detectable within two sentences — the rhythm changes and the person stops looking at the camera. Write yours as bullet points, record it three times, then throw the text away. The goal is knowing the story, not the wording.',
        ),
      ),
      followUps(
        list(
          [
            'Por que você saiu da empresa anterior?',
            'Qual foi a parte mais difícil desse projeto?',
            'O que você faria diferente hoje?',
          ],
          [
            'Why did you leave your previous company?',
            'What was the hardest part of that project?',
            'What would you do differently today?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-difficult-project',
    type: 'behavioral',
    title: t('Um projeto difícil', 'A difficult project'),
    categoryId: 'behavioral',
    skillIds: ['storytelling', 'communication'],
    difficulty: 'intermediate',
    tags: ['star', 'project', 'complexity'],
    minutes: 5,
    related: ['beh-mistake', 'beh-conflict', 'beh-deadline'],
    blocks: [
      prompt(
        t(
          'Me conte sobre o projeto mais difícil em que você trabalhou.',
          'Tell me about the most difficult project you have worked on.',
        ),
      ),
      answers({
        short: t(
          'Migrar o sistema de cobrança de um provedor para outro, com o negócio rodando. A dificuldade não foi técnica, foi que não podia ter janela de parada e nenhuma cobrança podia ser duplicada ou perdida. A gente rodou os dois provedores em paralelo por seis semanas, comparando resultado antes de trocar de fato. Terminou sem incidente, e o que eu levei disso foi que a parte difícil de uma migração raramente é o código novo.',
          'Migrating our billing from one provider to another with the business running. The difficulty was not technical, it was that there could be no downtime and no charge could be duplicated or lost. We ran both providers in parallel for six weeks, comparing results before actually switching. It finished with no incident, and what I took from it is that the hard part of a migration is rarely the new code.',
        ),
        strong: t(
          'Foi a migração do nosso provedor de pagamento. O contrato com o antigo vencia em quatro meses e não seria renovado, então a data era real.\n\n**O contexto que tornava difícil:** cobrança recorrente de alguns milhares de assinantes, com cartões salvos no provedor antigo. Não podia parar, não podia cobrar duas vezes, e não podia deixar de cobrar — cada falha era receita perdida e um cliente irritado.\n\n**O que eu fiz.** A primeira coisa foi convencer o time a não fazer a troca de uma vez. A proposta inicial era um cutover em um fim de semana, e eu argumentei que a gente não tinha como validar a lógica nova antes de ela estar cobrando dinheiro de verdade.\n\nA gente construiu uma camada de abstração sobre os dois provedores e rodou em sombra: o provedor novo processava tudo em paralelo, sem efeito financeiro, e a gente comparava o resultado com o do antigo todo dia. Nas duas primeiras semanas os números não batiam — descobrimos diferenças de arredondamento e de tratamento de reembolso parcial que ninguém tinha previsto.\n\nA parte mais chata foi a migração dos cartões, que dependia de um processo do lado dos provedores e levou cinco semanas de espera.\n\n**Resultado:** trocamos por lotes, começando com 5% dos assinantes. Terminou sem incidente de cobrança, e a camada de abstração ficou — quando a gente adicionou um terceiro provedor no ano seguinte, levou duas semanas.\n\n**O que eu aprendi**, e é o que eu realmente carrego: em migração, o risco não está no código novo, está nas diferenças de comportamento que você não sabe que existem. A comparação em paralelo foi o que salvou o projeto, e foi a parte que quase não foi aprovada porque "atrasaria a entrega".',
          'It was migrating our payment provider. The contract with the old one expired in four months and was not being renewed, so the date was real.\n\n**The context that made it hard:** recurring billing for a few thousand subscribers, with cards stored at the old provider. It could not stop, it could not double charge, and it could not fail to charge — every failure was lost revenue and an angry customer.\n\n**What I did.** The first thing was convincing the team not to switch all at once. The initial plan was a weekend cutover, and I argued we had no way to validate the new logic before it was charging real money.\n\nWe built an abstraction over both providers and ran it in shadow mode: the new provider processed everything in parallel with no financial effect, and we compared results against the old one daily. For the first two weeks the numbers did not match — we found rounding differences and partial refund handling nobody had anticipated.\n\nThe most tedious part was migrating the stored cards, which depended on a process on the providers\' side and took five weeks of waiting.\n\n**Outcome:** we switched in batches, starting with 5% of subscribers. It finished with no billing incident, and the abstraction layer stayed — when we added a third provider the following year, it took two weeks.\n\n**What I learned**, and this is what I actually carry: in a migration the risk is not in the new code, it is in the behavioural differences you do not know exist. Running the comparison in parallel is what saved the project, and it was the part that nearly did not get approved because it "would delay delivery".',
        ),
      }),
      lookingFor(
        list(
          [
            'Contexto suficiente para a dificuldade fazer sentido',
            'O que a pessoa fez, especificamente, e não o que "o time fez"',
            'Uma decisão real com justificativa',
            'Resultado concreto',
            'Um aprendizado que não seja genérico',
          ],
          [
            'Enough context for the difficulty to make sense',
            'What the person specifically did, rather than what "the team did"',
            'A real decision with a justification',
            'A concrete outcome',
            'A takeaway that is not generic',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte inclui a parte que deu errado no meio. Projeto difícil em que tudo correu bem não era difícil.',
            'A strong answer includes the part that went wrong along the way. A difficult project where everything went smoothly was not difficult.',
          ),
          shallow: t(
            'Uma resposta superficial descreve a arquitetura em detalhe e nunca diz o que a pessoa decidiu ou por quê.',
            'A shallow answer describes the architecture in detail and never says what the person decided, or why.',
          ),
        },
      ),
      warn(
        t(
          'Cuidado com o "nós". Se a resposta inteira for em primeira pessoa do plural, o entrevistador sai sem saber o que você fez.',
          'Watch the "we". If the whole answer is in the plural, the interviewer leaves without knowing what you did.',
        ),
      ),
      tip(
        t(
          'Escolha um projeto difícil por um motivo interessante — ambiguidade, restrição, pessoas — e não pela quantidade de tecnologia envolvida. "Difícil porque usamos Kubernetes" não é uma história; "difícil porque ninguém concordava sobre o que era sucesso" é.',
          'Pick a project that was difficult for an interesting reason — ambiguity, a constraint, people — rather than for the amount of technology involved. "Hard because we used Kubernetes" is not a story; "hard because nobody agreed on what success meant" is.',
        ),
      ),
      followUps(
        list(
          [
            'O que você faria diferente se começasse hoje?',
            'Como você convenceu o time da abordagem?',
            'O que deu errado que você não esperava?',
          ],
          [
            'What would you do differently starting today?',
            'How did you convince the team of the approach?',
            'What went wrong that you did not expect?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-conflict',
    type: 'behavioral',
    title: t('Conflito com um colega', 'A conflict with a teammate'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'leadership', 'storytelling'],
    difficulty: 'advanced',
    tags: ['conflict', 'teamwork', 'disagreement'],
    minutes: 5,
    related: ['beh-feedback', 'beh-disagree-commit', 'beh-difficult-project'],
    blocks: [
      prompt(
        t(
          'Me conte sobre um conflito que você teve com um colega de time.',
          'Tell me about a conflict you had with a teammate.',
        ),
      ),
      answers({
        short: t(
          'Eu e um colega discordamos sobre adotar um ORM novo em um serviço. Ele queria migrar, eu achava que o custo não se pagava. A discussão estava travando o time, então a gente combinou de testar: ele migrou um módulo pequeno em dois dias e a gente mediu. O resultado mostrou que ele tinha razão sobre a legibilidade e eu tinha razão sobre o custo da migração completa. Migramos só os módulos novos. O que eu aprendi foi que a maioria das discussões técnicas longas é barata de resolver com um experimento.',
          'A colleague and I disagreed about adopting a new ORM in one service. He wanted to migrate, I thought the cost did not pay off. The discussion was blocking the team, so we agreed to test it: he migrated one small module in two days and we measured. The result showed he was right about readability and I was right about the cost of a full migration. We migrated only new modules. What I learned is that most long technical arguments are cheap to settle with an experiment.',
        ),
        strong: t(
          'Foi com um colega sênior, sobre adotar um ORM em um serviço que usava SQL escrito à mão.\n\n**O desacordo real:** ele argumentava que o SQL manual estava deixando o código difícil de manter e que quem entrava no time demorava para produzir. Eu argumentava que a gente tinha várias consultas com otimização específica, e que o ORM ia esconder isso e trazer problemas de performance que a gente ia descobrir em produção.\n\nOs dois argumentos eram legítimos. O problema é que a discussão já durava três semanas, tinha vazado para o canal do time, e estava começando a virar pessoal — eu percebi que a gente estava repetindo os mesmos pontos com mais irritação a cada vez.\n\n**O que eu fiz.** Primeiro, chamei ele para uma conversa fora do canal, porque discussão técnica em público com plateia piora. Falei que eu achava que a gente estava discutindo duas coisas diferentes: ele estava falando de manutenibilidade, eu estava falando de performance, e nenhum dos dois estava errado sobre a própria parte.\n\nDepois propus fechar a questão com dado em vez de argumento: ele escolheria um módulo representativo, migraria, e a gente compararia legibilidade e as consultas geradas. Combinamos um prazo de dois dias e que o resultado decidiria, os dois aceitando de antemão.\n\n**O que aconteceu:** o código ficou claramente melhor, e ele estava certo nisso. Mas duas consultas geraram planos ruins, e uma delas era de um caminho quente. Então o resultado foi misto e mais útil do que qualquer um dos dois esperava.\n\n**A decisão:** ORM para tudo novo e para o CRUD existente, SQL manual mantido nas consultas críticas, com um comentário explicando por quê. Quem entrou depois no time achou isso natural.\n\n**O que eu aprendi:** quase toda discussão técnica que dura mais de uma semana é sobre critérios diferentes, não sobre a mesma pergunta. E quando o custo de testar é de dois dias, discutir por três semanas é a opção cara.',
          'It was with a senior colleague, about adopting an ORM in a service that used hand-written SQL.\n\n**The real disagreement:** he argued the hand-written SQL was making the code hard to maintain and that new joiners took too long to become productive. I argued we had several queries with specific optimisations, and that the ORM would hide them and bring performance problems we would discover in production.\n\nBoth arguments were legitimate. The problem was that the discussion had been running for three weeks, had spilled into the team channel, and was starting to get personal — I noticed we were repeating the same points with more irritation each time.\n\n**What I did.** First, I took it to a conversation outside the channel, because a technical argument in public with an audience gets worse. I said I thought we were arguing about two different things: he was talking about maintainability, I was talking about performance, and neither of us was wrong about our own part.\n\nThen I proposed settling it with data rather than argument: he would pick a representative module, migrate it, and we would compare readability and the generated queries. We agreed on a two-day box and that the result would decide, both of us accepting that up front.\n\n**What happened:** the code was clearly better, and he was right about that. But two queries produced bad plans, and one of them was on a hot path. So the outcome was mixed and more useful than either of us expected.\n\n**The decision:** the ORM for everything new and for existing CRUD, hand-written SQL kept on the critical queries, with a comment explaining why. People who joined later found that natural.\n\n**What I learned:** almost every technical argument that runs longer than a week is about different criteria rather than the same question. And when the cost of testing is two days, arguing for three weeks is the expensive option.',
        ),
      }),
      lookingFor(
        list(
          [
            'Um conflito real, não um mal-entendido inofensivo',
            'Representar o argumento do outro lado de forma justa',
            'Reconhecer a própria contribuição para o conflito',
            'Uma ação concreta para destravar',
            'Um resultado em que a pessoa não sai sendo a heroína',
          ],
          [
            'A real conflict, not a harmless misunderstanding',
            'Representing the other side\'s argument fairly',
            'Acknowledging your own contribution to the conflict',
            'A concrete action that unblocked it',
            'An outcome where the person does not come out the hero',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte dá razão ao outro em alguma parte. Candidato que estava totalmente certo em um conflito ou não teve conflito, ou não entendeu o que aconteceu.',
            'A strong answer concedes some ground to the other person. A candidate who was entirely right in a conflict either had no conflict or did not understand what happened.',
          ),
          shallow: t(
            'Uma resposta superficial escolhe um conflito trivial para evitar o assunto, e o entrevistador percebe.',
            'A shallow answer picks a trivial conflict to dodge the topic, and the interviewer notices.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Dizer que nunca teve conflito — soa como falta de autoconhecimento ou de envolvimento',
            'Pintar o colega como irracional',
            'Contar um conflito em que você só estava certo',
            'Terminar sem dizer como ficou a relação depois',
          ],
          [
            'Saying you have never had a conflict — it reads as low self-awareness or low engagement',
            'Painting the colleague as irrational',
            'Telling a conflict where you were simply right',
            'Ending without saying what the relationship looked like afterwards',
          ],
        ),
      ),
      tip(
        t(
          'O entrevistador não quer saber quem estava certo. Ele quer saber se dá para discordar de você sem que o trabalho pare. Fale do processo, não do placar.',
          'The interviewer does not want to know who was right. They want to know whether someone can disagree with you without work stopping. Talk about the process, not the score.',
        ),
      ),
      followUps(
        list(
          [
            'Como ficou a relação de vocês depois disso?',
            'E se o experimento tivesse dado razão total a ele?',
            'Você já teve um conflito que não se resolveu?',
          ],
          [
            'What did your relationship look like afterwards?',
            'What if the experiment had proved him entirely right?',
            'Have you had a conflict that did not get resolved?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-mistake',
    type: 'behavioral',
    title: t('Um erro que você cometeu', 'A mistake you made'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'storytelling'],
    difficulty: 'advanced',
    tags: ['failure', 'ownership', 'incident'],
    minutes: 5,
    related: ['beh-weakness', 'beh-feedback', 'beh-difficult-project'],
    blocks: [
      prompt(
        t(
          'Me conte sobre uma vez em que você cometeu um erro.',
          'Tell me about a time you made a mistake.',
        ),
      ),
      answers({
        short: t(
          'Eu rodei uma migration que adicionava uma coluna com valor padrão em uma tabela de vinte milhões de linhas, em horário comercial. Ela reescreveu a tabela inteira e travou escrita por quase quatro minutos. Eu avisei no canal assim que percebi, a gente esperou terminar porque cancelar no meio seria pior, e no dia seguinte eu escrevi um checklist de migration que o time usa até hoje. O erro foi não ter testado com volume parecido com o de produção.',
          'I ran a migration adding a column with a default value on a twenty-million-row table, during business hours. It rewrote the whole table and blocked writes for nearly four minutes. I flagged it in the channel the moment I noticed, we let it finish because cancelling midway would have been worse, and the next day I wrote a migration checklist the team still uses. The mistake was not having tested against production-like volume.',
        ),
        strong: t(
          'Eu derrubei a escrita do banco principal por quatro minutos, em uma terça-feira à tarde.\n\n**O que aconteceu:** eu precisava adicionar uma coluna com valor padrão em uma tabela grande. Em homologação a migration rodou em menos de um segundo, então eu rodei em produção sem pensar muito. A tabela de homologação tinha umas dez mil linhas; a de produção tinha vinte milhões. Na versão do Postgres que a gente usava, adicionar coluna com default reescrevia a tabela inteira e pegava lock exclusivo. Tudo que tentava escrever ficou na fila.\n\n**O que eu fiz no momento:** avisei no canal do time antes de alguém perguntar. Isso importou — a pessoa de plantão já estava investigando um alerta e saber a causa em trinta segundos economizou o resto da investigação.\n\nA decisão difícil foi não cancelar. Cancelar no meio de uma reescrita significava rollback, que levaria tempo parecido e deixaria a tabela em estado pior. Foi desconfortável, e em retrospecto foi a decisão certa.\n\n**O que eu fiz depois:** escrevi o postmortem, e fiz questão de que ele não focasse em mim. A pergunta que eu levantei foi por que era possível para uma pessoa sozinha rodar aquilo sem nenhuma verificação. A resposta é que o processo dependia de todo mundo lembrar de uma coisa que ninguém tinha escrito.\n\nSaíram três mudanças: um checklist obrigatório de migration no template de pull request, um ambiente de homologação com um dump anonimizado de volume real, e a regra de rodar migration de tabela grande fora do pico.\n\n**O que eu aprendi:** eu confiava em homologação como se fosse produção, e eles diferiam exatamente na dimensão que importava. Hoje, antes de qualquer operação em tabela grande, a primeira pergunta que eu faço é quantas linhas tem em produção.',
          'I took down writes on the main database for four minutes, on a Tuesday afternoon.\n\n**What happened:** I needed to add a column with a default value to a large table. In staging the migration ran in under a second, so I ran it in production without thinking much about it. The staging table had about ten thousand rows; production had twenty million. On the Postgres version we were running, adding a column with a default rewrote the entire table and took an exclusive lock. Everything trying to write queued up behind it.\n\n**What I did at the time:** I flagged it in the team channel before anyone asked. That mattered — the person on call was already investigating an alert, and knowing the cause within thirty seconds saved the rest of the investigation.\n\nThe hard decision was not cancelling. Cancelling midway through a rewrite meant a rollback, which would have taken a similar amount of time and left the table in a worse state. It was uncomfortable, and in hindsight it was the right call.\n\n**What I did afterwards:** I wrote the postmortem, and I made a point of not centring it on me. The question I raised was why it was possible for one person to run that with no check at all. The answer was that the process relied on everyone remembering something nobody had written down.\n\nThree changes came out of it: a mandatory migration checklist in the pull request template, a staging environment with an anonymised dump at real volume, and a rule about running large-table migrations outside peak hours.\n\n**What I learned:** I was trusting staging as if it were production, and they differed on exactly the dimension that mattered. These days, before any operation on a large table, my first question is how many rows it has in production.',
        ),
      }),
      lookingFor(
        list(
          [
            'Um erro real, com consequência real',
            'Assumir sem terceirizar a culpa',
            'O que a pessoa fez no momento, incluindo comunicar',
            'Mudança sistêmica, não só "vou ter mais cuidado"',
            'Um aprendizado específico e aplicável',
          ],
          [
            'A real mistake with a real consequence',
            'Owning it without deflecting',
            'What the person did at the time, including communicating',
            'A systemic change, not just "I will be more careful"',
            'A specific, applicable lesson',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte transforma o erro pessoal em melhoria de processo, sem usar isso para fugir da responsabilidade. As duas coisas cabem na mesma resposta.',
            'A strong answer turns the personal mistake into a process improvement, without using that to dodge responsibility. Both fit in the same answer.',
          ),
          shallow: t(
            'Uma resposta superficial escolhe um erro sem consequência, ou culpa a documentação, o outro time, o prazo.',
            'A shallow answer picks a consequence-free mistake, or blames the documentation, the other team, the deadline.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Escolher um erro tão pequeno que não custa nada admitir',
            'Terminar em "aprendi a ter mais atenção", que não é uma mudança',
            'Culpar processo desde o início, antes de assumir a parte sua',
            'Dizer que não lembra de nenhum erro',
          ],
          [
            'Picking a mistake so small that admitting it costs nothing',
            'Ending on "I learned to be more careful", which is not a change',
            'Blaming the process from the start, before owning your part',
            'Saying you cannot think of any mistakes',
          ],
        ),
      ),
      tip(
        t(
          'Esta pergunta é sobre segurança psicológica, não sobre o erro. O entrevistador quer saber se você consegue falar de falha sem se desmontar e sem terceirizar. Um candidato que admite um erro sério com tranquilidade parece mais sênior do que um que nunca errou.',
          'This question is about psychological safety, not about the mistake. The interviewer wants to know whether you can discuss failure without falling apart and without deflecting. A candidate who admits a serious mistake calmly reads as more senior than one who has never made any.',
        ),
      ),
      followUps(
        list(
          [
            'Como o time reagiu?',
            'O que impediria isso de acontecer de novo hoje?',
            'Você já viu alguém cometer esse mesmo erro depois?',
          ],
          [
            'How did the team react?',
            'What would stop that from happening again today?',
            'Have you seen someone else make that same mistake since?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-weakness',
    type: 'behavioral',
    title: t('Seu maior ponto fraco', 'Your biggest weakness'),
    categoryId: 'behavioral',
    skillIds: ['communication'],
    difficulty: 'advanced',
    tags: ['weakness', 'self-awareness'],
    minutes: 4,
    related: ['beh-mistake', 'beh-feedback'],
    blocks: [
      prompt(t('Qual é o seu maior ponto fraco?', 'What is your biggest weakness?')),
      answers({
        short: t(
          'Eu tenho dificuldade de considerar uma coisa pronta. Costumo ver mais três melhorias possíveis quando o valor já foi entregue. Isso me custou prazo mais de uma vez. O que funciona para mim é definir o critério de pronto por escrito antes de começar, e tratar as melhorias como itens separados no backlog em vez de coisas que eu faço "já que estou aqui".',
          'I have trouble calling something finished. I tend to see three more possible improvements once the value has already shipped. That has cost me deadlines more than once. What works for me is writing down the definition of done before I start, and treating the improvements as separate backlog items rather than things I do "while I am in here".',
        ),
        strong: t(
          'O meu é dificuldade de parar. Eu tenho uma tendência forte a continuar melhorando uma solução depois que ela já resolve o problema.\n\nIsso aparece de um jeito específico: eu entrego algo que funciona, e enquanto revejo, eu vejo três coisas que ficariam melhores. Aí eu mexo. E o que era uma tarefa de dois dias vira quatro, e o valor adicional dos dois dias extras normalmente é pequeno.\n\nO caso que me fez encarar isso foi um endpoint de relatório. A versão que funcionava ficou pronta na quarta. Eu entreguei na sexta, com cache, com uma abstração para futuros relatórios, e com tratamento de um caso de borda que a gente nunca teve. O time precisava do endpoint na quarta para desbloquear o frontend. Ninguém reclamou, mas eu bloqueei duas pessoas por dois dias por uma escolha minha.\n\nO que eu mudei foi concreto. Antes de começar, eu escrevo o que "pronto" significa para aquela tarefa, no próprio ticket. Quando eu vejo uma melhoria durante o trabalho, ela vira um item novo no backlog em vez de escopo adicional. E se a melhoria for realmente importante, eu levo para o time decidir prioridade em vez de decidir sozinho enquanto ninguém está olhando.\n\nNão sumiu — eu ainda tenho o impulso. Mas agora ele vira um item na lista em vez de um atraso na entrega.',
          'Mine is difficulty stopping. I have a strong pull towards continuing to improve a solution after it already solves the problem.\n\nIt shows up in a specific way: I deliver something that works, and while reviewing it I see three things that would be better. So I change them. What was a two-day task becomes four, and the additional value of those two extra days is usually small.\n\nThe case that made me face it was a reporting endpoint. The working version was done on Wednesday. I delivered on Friday, with caching, with an abstraction for future reports, and with handling for an edge case we have never had. The team needed that endpoint on Wednesday to unblock the frontend. Nobody complained, but I blocked two people for two days because of a choice I made.\n\nWhat I changed was concrete. Before starting, I write down what "done" means for that task, in the ticket itself. When I spot an improvement during the work, it becomes a new backlog item rather than extra scope. And if the improvement is genuinely important, I take it to the team to prioritise instead of deciding alone while nobody is watching.\n\nIt has not gone away — I still get the pull. But now it turns into an item on a list rather than a late delivery.',
        ),
      }),
      lookingFor(
        list(
          [
            'Um ponto fraco de verdade, com custo real',
            'Um exemplo concreto de quando atrapalhou',
            'Uma mudança específica, não uma intenção',
            'Honestidade sobre ainda ser um trabalho em andamento',
          ],
          [
            'A genuine weakness with a real cost',
            'A concrete example of when it got in the way',
            'A specific change rather than an intention',
            'Honesty that it is still a work in progress',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte tem um exemplo em que a fraqueza custou algo a outra pessoa. É isso que prova que é real.',
            'A strong answer has an example where the weakness cost somebody else something. That is what proves it is real.',
          ),
          shallow: t(
            'Uma resposta superficial usa uma qualidade disfarçada. "Sou perfeccionista" e "me dedico demais" são reconhecidos instantaneamente como evasão.',
            'A shallow answer uses a strength in disguise. "I am a perfectionist" and "I care too much" are recognised as evasion instantly.',
          ),
        },
      ),
      warn(
        t(
          'Evite também o extremo oposto: uma fraqueza que inviabiliza a vaga. "Tenho dificuldade com prazos" em uma vaga de entrega contínua é honestidade que custa a oferta.',
          'Avoid the opposite extreme too: a weakness that disqualifies you for the role. "I struggle with deadlines" in a continuous-delivery role is honesty that costs you the offer.',
        ),
      ),
      tip(
        t(
          'A escolha certa é uma fraqueza real, que custou algo, que não é central para a vaga, e sobre a qual você já fez alguma coisa. As três partes importam: sem custo não é fraqueza, sem ação não é autoconhecimento, e sem cuidado com a vaga é ingenuidade.',
          'The right choice is a real weakness, that cost something, that is not central to the role, and that you have already acted on. All three parts matter: with no cost it is not a weakness, with no action it is not self-awareness, and with no regard for the role it is naivety.',
        ),
      ),
      followUps(
        list(
          [
            'Alguém já te deu feedback sobre isso?',
            'Como você sabe que melhorou?',
            'Em que situação isso ainda aparece?',
          ],
          [
            'Has anyone given you feedback about that?',
            'How do you know you have improved?',
            'In what situation does it still show up?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-feedback',
    type: 'behavioral',
    title: t('Um feedback difícil de ouvir', 'Feedback that was hard to hear'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'leadership'],
    difficulty: 'advanced',
    tags: ['feedback', 'growth', 'self-awareness'],
    minutes: 4,
    related: ['beh-weakness', 'beh-conflict'],
    blocks: [
      prompt(
        t(
          'Me conte sobre uma vez em que você recebeu um feedback difícil.',
          'Tell me about a time you received difficult feedback.',
        ),
      ),
      answers({
        short: t(
          'Meu tech lead me disse que meus code reviews estavam desmotivando as pessoas mais novas. Eu achava que estava sendo rigoroso e útil; para quem recebia, eram vinte comentários sem hierarquia entre o que era bug e o que era preferência minha. Doeu porque eu estava orgulhoso da qualidade dos meus reviews. Mudei duas coisas: passei a marcar o que é bloqueante e o que é sugestão, e a limitar o número de comentários de estilo. O tempo de aprovação caiu e as pessoas passaram a me pedir review.',
          'My tech lead told me my code reviews were demotivating the more junior people. I thought I was being rigorous and helpful; what they received was twenty comments with no hierarchy between what was a bug and what was my preference. It stung because I was proud of the quality of my reviews. I changed two things: I started marking what is blocking versus what is a suggestion, and capped the number of style comments. Approval time went down and people started asking me for reviews.',
        ),
        strong: t(
          'Foi em uma conversa de um a um com o meu tech lead. Ele me disse que dois desenvolvedores mais novos tinham comentado que ficavam ansiosos quando eu era o revisor.\n\nIsso foi difícil por um motivo específico: eu tinha orgulho dos meus reviews. Eu achava que revisar com cuidado era uma das coisas que eu fazia melhor, e a informação de que isso estava tendo o efeito contrário contradizia como eu me via.\n\n**A minha primeira reação foi defensiva**, e eu preciso admitir isso porque é a parte honesta. Eu comecei a explicar por que cada tipo de comentário era necessário. Ele me deixou terminar e perguntou uma coisa que virou a conversa: "quantos dos seus comentários no último pull request eram bugs, e quantos eram como você teria escrito?".\n\nEu fui olhar. Eram vinte e três comentários. Dois eram problemas reais. O resto era preferência minha, misturada no meio, com o mesmo tom e o mesmo peso visual. Quem recebia não tinha como distinguir o que precisava corrigir do que era opinião.\n\n**O que eu mudei:**\n\nPassei a prefixar: `bloqueante` para o que impede o merge, `sugestão` para o que a pessoa decide, `nit` para estilo. Só isso mudou a percepção quase imediatamente.\n\nLimitei comentário de estilo — se eram mais de três, virava uma conversa sobre lint ou formatter, porque é problema de ferramenta e não de pessoa.\n\nE passei a aprovar com comentários quando não havia bloqueio, em vez de segurar esperando ajuste de preferência.\n\n**O resultado:** o tempo médio até aprovação caiu bastante, e mais importante, os dois desenvolvedores passaram a me marcar espontaneamente em review. Um deles me disse meses depois que aprendeu a revisar assim.\n\n**O que eu aprendi:** eu estava otimizando para o código e esquecendo que review é uma interação entre pessoas. E que a minha intenção não estava na conta — só o efeito estava.',
          'It came up in a one-to-one with my tech lead. He told me two of the more junior developers had mentioned they got anxious when I was the reviewer.\n\nThat was hard for a specific reason: I was proud of my reviews. I thought reviewing carefully was one of the things I did best, and being told it was having the opposite effect contradicted how I saw myself.\n\n**My first reaction was defensive**, and I need to admit that because it is the honest part. I started explaining why each kind of comment was necessary. He let me finish and asked one question that turned the conversation: "how many of your comments on the last pull request were bugs, and how many were how you would have written it?"\n\nI went and looked. Twenty-three comments. Two were real problems. The rest were my preferences, mixed in, with the same tone and the same visual weight. The person receiving them had no way to tell what needed fixing from what was opinion.\n\n**What I changed:**\n\nI started prefixing: `blocking` for what stops the merge, `suggestion` for what the author decides, `nit` for style. That alone shifted the perception almost immediately.\n\nI capped style comments — if there were more than three, it became a conversation about the linter or the formatter, because that is a tooling problem rather than a people problem.\n\nAnd I started approving with comments when nothing was blocking, instead of holding a pull request hostage to a preference.\n\n**The outcome:** average time to approval dropped noticeably, and more importantly, both developers started tagging me for reviews on their own. One of them told me months later that he learned to review that way.\n\n**What I learned:** I was optimising for the code and forgetting that review is an interaction between people. And that my intent did not count — only the effect did.',
        ),
      }),
      lookingFor(
        list(
          [
            'Um feedback que realmente incomodou',
            'Honestidade sobre a reação inicial',
            'Mudança concreta e verificável',
            'Evidência de que a mudança funcionou',
            'Um aprendizado sobre si mesmo, não sobre a outra pessoa',
          ],
          [
            'Feedback that genuinely stung',
            'Honesty about the initial reaction',
            'A concrete, verifiable change',
            'Evidence the change worked',
            'A lesson about yourself rather than about the other person',
          ],
        ),
        {
          strong: t(
            'Admitir que a primeira reação foi defensiva torna a resposta mais crível, não menos. Todo mundo reage assim; poucos conseguem contar.',
            'Admitting the first reaction was defensive makes the answer more credible, not less. Everyone reacts that way; few can say so.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você dá feedback difícil para outra pessoa?',
            'Já recebeu um feedback com o qual você discordou? O que fez?',
            'Como você pede feedback hoje?',
          ],
          [
            'How do you give difficult feedback to someone else?',
            'Have you had feedback you disagreed with? What did you do?',
            'How do you ask for feedback these days?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-deadline',
    type: 'behavioral',
    title: t('Um prazo que não cabia', 'A deadline that did not fit'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'leadership'],
    difficulty: 'advanced',
    tags: ['deadline', 'pressure', 'scope', 'negotiation'],
    minutes: 4,
    related: ['beh-difficult-project', 'beh-disagree-commit'],
    blocks: [
      prompt(
        t(
          'Como você lida com prazos apertados? Me conte um caso.',
          'How do you handle tight deadlines? Tell me about one.',
        ),
      ),
      answers({
        short: t(
          'Eu trato prazo apertado como um problema de escopo, não de esforço. Teve um lançamento com data fixa por causa de uma feira, e a estimativa dava três semanas a mais do que a gente tinha. Em vez de prometer e falhar, eu levei para a gerente de produto uma lista do que era realmente necessário para um cliente usar no dia, e o que podia entrar depois. Cortamos duas funcionalidades e entregamos no prazo. O que eu não faço é aceitar em silêncio e avisar que não vai dar na véspera.',
          'I treat a tight deadline as a scope problem rather than an effort problem. There was a launch with a fixed date because of a trade show, and the estimate was three weeks longer than we had. Rather than promising and failing, I took the product manager a list of what a customer genuinely needed on day one and what could come later. We cut two features and shipped on time. What I do not do is accept quietly and announce it will not happen the night before.',
        ),
        strong: t(
          'A minha posição é que prazo, escopo e qualidade são três variáveis, e quando alguém fixa as três, uma delas vai ceder sozinha — normalmente qualidade, e de um jeito que ninguém decidiu.\n\n**O caso:** a gente tinha uma feira do setor com data fixa, e a expectativa era demonstrar uma funcionalidade nova. A estimativa honesta era de nove semanas; a gente tinha seis.\n\n**O que eu fiz.** Primeiro, avisei cedo. Na primeira semana, não na quinta. Isso é a parte mais importante e a que mais gente erra — o custo de uma notícia ruim cresce com o tempo, porque as opções de resposta desaparecem.\n\nSegundo, eu não cheguei dizendo "não dá". Cheguei com três opções:\n\nEntregar tudo em nove semanas.\n\nEntregar o fluxo principal em seis, sem o painel de configuração e sem importação em massa — funcional para demonstrar e para os primeiros clientes usarem.\n\nEntregar tudo em seis com uma pessoa a mais, sabendo que alguém novo em um projeto no meio não produz muito nas duas primeiras semanas.\n\nTerceiro, eu fui explícito sobre o que a opção dois significava depois da feira: as duas funcionalidades cortadas precisavam de data, senão viravam dívida permanente.\n\n**A decisão** foi a opção dois, o que era previsível — a gerente de produto só precisava saber qual parte era negociável, e essa informação era minha.\n\n**O resultado:** entregamos com uma semana de folga, que usamos para o que sempre aparece. As duas funcionalidades saíram no mês seguinte.\n\n**O que eu não faço:** aceitar o prazo em silêncio para evitar a conversa desconfortável. Isso só transfere o problema para um momento em que ninguém consegue mais resolver. E não compenso prazo com hora extra sistemática: funciona por uma semana, e depois o time entrega menos, com mais bug.',
          'My position is that deadline, scope and quality are three variables, and when someone fixes all three, one of them gives way on its own — usually quality, in a way nobody chose.\n\n**The case:** we had an industry trade show with a fixed date, and the expectation was demonstrating a new feature. The honest estimate was nine weeks; we had six.\n\n**What I did.** First, I raised it early. In week one, not week five. That is the most important part and the one most people get wrong — the cost of bad news grows with time, because the available responses disappear.\n\nSecond, I did not turn up saying "it cannot be done". I turned up with three options:\n\nDeliver everything in nine weeks.\n\nDeliver the main flow in six, without the configuration panel and without bulk import — functional enough to demo and for the first customers to use.\n\nDeliver everything in six with one more person, knowing that someone joining a project midway produces very little in the first fortnight.\n\nThird, I was explicit about what option two meant after the show: the two cut features needed a date, otherwise they became permanent debt.\n\n**The decision** was option two, which was predictable — the product manager only needed to know which part was negotiable, and that information was mine to give.\n\n**The outcome:** we shipped with a week to spare, which we spent on the things that always turn up. The two features came out the following month.\n\n**What I do not do:** accept the deadline quietly to avoid the uncomfortable conversation. That only moves the problem to a point where nobody can solve it. And I do not make up time with systematic overtime: it works for a week, and after that the team delivers less, with more bugs.',
        ),
      }),
      lookingFor(
        list(
          [
            'Tratar prazo como negociação de escopo',
            'Comunicar cedo, com dado',
            'Chegar com opções e consequências, não com um problema',
            'Reconhecer o custo de hora extra sistemática',
            'Cuidar do que foi cortado, para não virar dívida invisível',
          ],
          [
            'Treating the deadline as a scope negotiation',
            'Communicating early, with evidence',
            'Arriving with options and consequences rather than a problem',
            'Recognising the cost of systematic overtime',
            'Following up on what was cut, so it does not become invisible debt',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte oferece opções em vez de um veto. "Não dá" encerra a conversa; três caminhos com custos diferentes devolvem a decisão a quem é dono dela.',
            'A strong answer offers options rather than a veto. "It cannot be done" ends the conversation; three paths with different costs hand the decision back to whoever owns it.',
          ),
          shallow: t(
            'Uma resposta superficial vira uma história de heroísmo: "trabalhei fim de semana e entreguei". Isso sinaliza que a pessoa não vai avisar quando o próximo prazo estiver em risco.',
            'A shallow answer becomes a heroism story: "I worked the weekend and delivered". That signals the person will not speak up when the next deadline is at risk.',
          ),
        },
      ),
      followUps(
        list(
          [
            'E se a gerência tivesse insistido no escopo completo?',
            'Como você estima trabalho com incerteza alta?',
            'Como você garantiu que o que foi cortado não sumisse?',
          ],
          [
            'What if management had insisted on the full scope?',
            'How do you estimate work with high uncertainty?',
            'How did you make sure the cut work did not disappear?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-disagree-commit',
    type: 'behavioral',
    title: t('Discordar e seguir mesmo assim', 'Disagreeing and committing anyway'),
    categoryId: 'behavioral',
    skillIds: ['leadership', 'communication'],
    difficulty: 'advanced',
    tags: ['disagreement', 'decision', 'team'],
    minutes: 4,
    related: ['beh-conflict', 'beh-deadline'],
    blocks: [
      prompt(
        t(
          'Me conte sobre uma decisão do time com a qual você discordou. O que você fez?',
          'Tell me about a team decision you disagreed with. What did you do?',
        ),
      ),
      answers({
        short: t(
          'O time decidiu reescrever um serviço em vez de refatorar, e eu era contra — achava que a gente ia perder comportamento que não estava documentado em lugar nenhum. Eu argumentei, mostrei exemplos, e a decisão foi de reescrever mesmo assim. Aí eu me comprometi de verdade: ajudei a mapear o comportamento existente a partir dos logs de produção, que era justamente a minha preocupação. A reescrita levou mais tempo do que o estimado e menos do que eu temia. Eu continuo achando que refatorar teria sido melhor, e continuo achando que valeu ter seguido a decisão.',
          'The team decided to rewrite a service instead of refactoring it, and I was against it — I thought we would lose behaviour that was not documented anywhere. I argued, showed examples, and the decision was to rewrite anyway. Then I committed properly: I helped map the existing behaviour from production logs, which was exactly my concern. The rewrite took longer than estimated and less long than I feared. I still think refactoring would have been better, and I still think following the decision was right.',
        ),
        strong: t(
          'O caso foi a decisão de reescrever um serviço de importação que tinha uns quatro anos e ninguém entendia por completo.\n\n**Minha posição:** eu era contra. O argumento era que aquele serviço tinha muitos comportamentos específicos — tratamento de arquivo malformado de clientes específicos, regras que foram adicionadas depois de incidentes — e nada disso estava documentado nem coberto por teste. Reescrever a partir da especificação significava reescrever a partir de uma especificação que não existia, e a gente ia redescobrir cada regra por meio de um cliente reclamando.\n\n**Como eu argumentei:** eu não disse só que era arriscado. Eu peguei três exemplos concretos de comportamento estranho no código, rastreei cada um até o incidente que o originou, e mostrei que nenhum deles estava em teste. Isso mudou a discussão, porque virou concreto.\n\n**A decisão foi reescrever mesmo assim.** Os argumentos do outro lado também eram bons: o serviço usava uma versão de runtime sem suporte, ninguém queria mexer nele, e todo ajuste levava semanas.\n\n**O que eu fiz depois** é a parte que importa. Eu tinha duas opções: seguir reclamando, ou tornar a decisão mais segura. Escolhi a segunda, e isso foi uma decisão consciente, não resignação.\n\nEspecificamente: propus e construí um mecanismo de comparação. A gente rodou o serviço novo em paralelo com o antigo por seis semanas, processando os mesmos arquivos sem efeito, e comparando a saída. Isso endereçava exatamente a minha preocupação — em vez de descobrir as regras perdidas por meio de cliente, a gente descobria por meio de divergência.\n\nEncontramos onze comportamentos que a reescrita tinha perdido. Sete eram regras reais.\n\n**O resultado:** a migração aconteceu sem incidente visível ao cliente. Levou cerca de 40% mais tempo que o estimado.\n\n**O que eu acho hoje:** continuo achando que refatorar teria sido mais barato. Mas o time ganhou algo que eu não tinha considerado, que é um serviço que as pessoas não têm medo de tocar. Isso tem valor e eu tinha subestimado.\n\n**O princípio que eu sigo:** discordar é obrigação antes da decisão e é ruído depois. Uma vez decidido, se eu continuo minando por baixo, eu sabotei sem assumir. Se eu acho que a decisão é errada a ponto de eu não conseguir apoiar, isso é uma conversa diferente e maior.',
          'The case was the decision to rewrite an import service that was about four years old and that nobody fully understood.\n\n**My position:** I was against it. The argument was that the service had many specific behaviours — handling of malformed files from particular customers, rules added after incidents — and none of it was documented or covered by tests. Rewriting from the specification meant rewriting from a specification that did not exist, and we would rediscover each rule through a customer complaint.\n\n**How I argued it:** I did not just say it was risky. I took three concrete examples of strange behaviour in the code, traced each back to the incident that produced it, and showed that none were covered by tests. That changed the discussion, because it became concrete.\n\n**The decision was to rewrite anyway.** The arguments on the other side were also good: the service ran on an unsupported runtime version, nobody wanted to touch it, and every change took weeks.\n\n**What I did afterwards** is the part that matters. I had two options: keep complaining, or make the decision safer. I chose the second, and that was a conscious decision rather than resignation.\n\nSpecifically: I proposed and built a comparison harness. We ran the new service in parallel with the old one for six weeks, processing the same files with no effect, and diffing the output. That addressed my exact concern — instead of discovering lost rules through customers, we discovered them through divergence.\n\nWe found eleven behaviours the rewrite had dropped. Seven were real rules.\n\n**The outcome:** the migration happened with no customer-visible incident. It took about 40% longer than estimated.\n\n**What I think now:** I still believe refactoring would have been cheaper. But the team gained something I had not weighed, which is a service people are not afraid to touch. That has value and I had underrated it.\n\n**The principle I follow:** disagreeing is an obligation before the decision and noise after it. Once it is decided, if I keep undermining it quietly, I have sabotaged without owning it. If I think a decision is wrong to the point where I cannot support it, that is a different and bigger conversation.',
        ),
      }),
      lookingFor(
        list(
          [
            'Argumentar com evidência antes da decisão',
            'Aceitar a decisão sem minar por baixo',
            'Agir para reduzir o risco que preocupava',
            'Reconhecer o que o outro lado acertou',
            'Ter um princípio claro sobre quando isso não se aplica',
          ],
          [
            'Arguing with evidence before the decision',
            'Accepting the decision without quietly undermining it',
            'Acting to reduce the risk that worried you',
            'Acknowledging what the other side got right',
            'Having a clear principle about when this does not apply',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte mostra a pessoa trabalhando para o sucesso de uma decisão que ela não queria. É o comportamento mais difícil de fingir em uma história.',
            'A strong answer shows the person working for the success of a decision they did not want. It is the hardest behaviour to fake in a story.',
          ),
        },
      ),
      followUps(
        list(
          [
            'E se a decisão fosse antiética, não só ruim tecnicamente?',
            'Como você sabe quando insistir e quando parar?',
            'Você mudou de ideia sobre o mérito depois?',
          ],
          [
            'What if the decision were unethical, not just technically poor?',
            'How do you know when to push and when to stop?',
            'Did you change your mind about the merits afterwards?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-why-international',
    type: 'behavioral',
    title: t('Por que uma empresa internacional', 'Why an international company'),
    categoryId: 'behavioral',
    skillIds: ['communication'],
    difficulty: 'intermediate',
    tags: ['motivation', 'remote', 'international'],
    minutes: 4,
    related: ['beh-tell-me-about-yourself', 'beh-why-hire-you', 'beh-career-goals'],
    blocks: [
      prompt(
        t(
          'Por que você quer trabalhar para uma empresa internacional?',
          'Why do you want to work for an international company?',
        ),
      ),
      answers({
        short: t(
          'Dois motivos. O primeiro é escala: os problemas que me interessam — confiabilidade, carga, dados — aparecem de forma mais interessante em produtos com muitos usuários, e eu quero trabalhar nessa faixa. O segundo é a forma de trabalhar: time distribuído em vários fusos força decisão escrita e assíncrona, e eu trabalho melhor assim. O salário faz parte, obviamente, mas não é o que me faria escolher entre duas ofertas.',
          'Two reasons. The first is scale: the problems I find interesting — reliability, load, data — show up in more interesting forms in products with many users, and I want to work in that range. The second is how the work happens: a team spread across time zones forces written, asynchronous decisions, and I work better that way. The salary is part of it, obviously, but it is not what would make me choose between two offers.',
        ),
        strong: t(
          'Eu costumo ser direto nisso, porque acho que a resposta evasiva é pior que a honesta.\n\n**O motivo técnico**, que é o principal: os problemas que me interessam aparecem em outra escala. Eu passei os últimos anos trabalhando em confiabilidade de pagamento, e o que eu vi foi interessante — mas em um volume que não força as decisões difíceis. Eu quero estar em um lugar onde a resposta para "só aumenta a máquina" não funciona mais, porque é aí que se aprende arquitetura de verdade.\n\n**A forma de trabalhar.** Time distribuído em vários fusos não pode resolver tudo em reunião, então decisão vira documento, contexto vira escrito, e trabalho assíncrono deixa de ser exceção. Eu prefiro isso genuinamente — escrever me obriga a organizar o raciocínio antes de defendê-lo, e eu produzo melhor assim do que em uma sala discutindo.\n\n**O idioma.** Trabalhar em inglês todo dia é algo que eu quero por si só. Eu leio documentação técnica e escrevo em inglês há anos, mas falar em reunião ainda me custa mais esforço do que deveria. A única forma de resolver isso é fazendo.\n\n**E a parte financeira**, que eu menciono porque fingir que não existe soa falso: sim, a diferença é relevante. Mas não é o que decide. Se fosse só isso, eu procuraria a vaga que paga mais, e não é o que eu estou fazendo — eu estou procurando time e problema.\n\nSe a pergunta atrás da pergunta for sobre permanência, a resposta é que eu não estou procurando uma passagem. Eu quero um lugar onde eu fique tempo suficiente para ver as consequências das minhas decisões, que é a única forma de aprender com elas.',
          'I tend to be direct about this, because I think an evasive answer is worse than an honest one.\n\n**The technical reason**, which is the main one: the problems I care about appear at a different scale. I have spent the last few years on payment reliability, and what I saw was interesting — but at a volume that does not force the hard decisions. I want to be somewhere the answer "just get a bigger machine" has stopped working, because that is where you actually learn architecture.\n\n**The way the work happens.** A team across time zones cannot settle everything in a meeting, so decisions become documents, context becomes written, and asynchronous work stops being the exception. I genuinely prefer that — writing forces me to organise my reasoning before defending it, and I produce better that way than in a room arguing.\n\n**The language.** Working in English every day is something I want for its own sake. I have read technical documentation and written in English for years, but speaking in a meeting still costs me more effort than it should. The only way to fix that is by doing it.\n\n**And the money**, which I mention because pretending it does not exist sounds false: yes, the difference is meaningful. But it is not what decides. If it were only that, I would be chasing the highest-paying posting, and that is not what I am doing — I am looking for a team and a problem.\n\nIf the question behind the question is about staying, the answer is that I am not looking for a stepping stone. I want somewhere I stay long enough to see the consequences of my own decisions, which is the only way to learn from them.',
        ),
      }),
      lookingFor(
        list(
          [
            'Um motivo profissional, não só financeiro',
            'Alguma familiaridade real com trabalho assíncrono',
            'Honestidade sobre a parte financeira, sem ser o centro',
            'Sinal de que a pessoa pretende ficar',
          ],
          [
            'A professional reason, not only a financial one',
            'Some real familiarity with asynchronous work',
            'Honesty about the money, without it being the centre',
            'A signal that the person intends to stay',
          ],
        ),
        {
          strong: t(
            'Mencionar dinheiro com naturalidade e seguir em frente é mais crível do que fingir que não é um fator. Quem finge parece estar escondendo outra coisa.',
            'Mentioning money naturally and moving on is more credible than pretending it is not a factor. Pretending reads as hiding something else.',
          ),
          shallow: t(
            'Uma resposta superficial elogia a empresa de forma genérica: "admiro a cultura e a inovação". Serve para qualquer empresa, então não informa nada.',
            'A shallow answer praises the company generically: "I admire the culture and the innovation". It fits any company, so it says nothing.',
          ),
        },
      ),
      tip(
        t(
          'A preocupação real por trás desta pergunta costuma ser retenção e fuso horário. Se você conseguir tocar nos dois sem ser perguntado — que você pretende ficar, e que você já trabalha de forma assíncrona — você respondeu mais do que foi pedido.',
          'The real worry behind this question is usually retention and time zones. If you can address both unprompted — that you intend to stay, and that you already work asynchronously — you have answered more than was asked.',
        ),
      ),
      followUps(
        list(
          [
            'Como você lida com uma diferença de seis horas no fuso?',
            'Você já trabalhou com um time totalmente remoto?',
            'O que te faria sair de uma empresa?',
          ],
          [
            'How do you handle a six-hour time zone difference?',
            'Have you worked with a fully remote team before?',
            'What would make you leave a company?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-why-hire-you',
    type: 'behavioral',
    title: t('Por que devemos contratar você', 'Why should we hire you'),
    categoryId: 'behavioral',
    skillIds: ['communication', 'storytelling'],
    difficulty: 'advanced',
    tags: ['closing', 'positioning', 'motivation'],
    minutes: 4,
    related: ['beh-tell-me-about-yourself', 'beh-why-international'],
    blocks: [
      prompt(t('Por que devemos contratar você?', 'Why should we hire you?')),
      answers({
        short: t(
          'Pelo que vocês descreveram, a dor é ter um sistema de cobrança que cresceu rápido e agora é difícil de mudar com segurança. Essa é exatamente a situação em que eu passei os últimos dois anos, e a parte que eu fiz bem foi tornar seguro mexer em algo crítico — comparação em paralelo, idempotência, reconciliação automática. Não é uma habilidade rara, mas é uma que a maioria só desenvolve depois de quebrar algo caro, e eu já quebrei.',
          'From what you described, the pain is a billing system that grew fast and is now hard to change safely. That is exactly the situation I have spent the last two years in, and the part I did well was making it safe to touch something critical — parallel comparison, idempotency, automatic reconciliation. It is not a rare skill, but it is one most people only develop after breaking something expensive, and I have already broken something expensive.',
        ),
        strong: t(
          'Vou responder ligando ao que vocês me contaram nesta conversa, porque uma resposta genérica aqui não ajuda nenhum de nós.\n\nVocês descreveram três coisas: um sistema de cobrança que cresceu mais rápido que a estrutura, dificuldade de mudar sem medo, e um time pequeno que precisa de alguém que funcione com autonomia.\n\n**Sobre a primeira**, é literalmente o que eu fiz nos últimos dois anos. Não porque eu escolhi — porque o sistema estava assim quando eu cheguei. O que eu aprendi ali não foi como construir um sistema de pagamento do zero; foi como mudar um que já está rodando com dinheiro passando por ele. São habilidades diferentes, e a segunda é a que vocês precisam.\n\n**Sobre a segunda**, a técnica que eu mais uso é comparação em paralelo antes de trocar. Já apliquei em migração de provedor e em reescrita de serviço, e nas duas vezes ela encontrou comportamento que ninguém sabia que existia. É o tipo de prática que parece lenta e que na verdade é a mais rápida, porque evita o ciclo de descobrir problema por meio de cliente.\n\n**Sobre a terceira**, eu trabalho bem sozinho e comunico demais em vez de comunicar de menos. Prefiro escrever a decisão e as alternativas antes de implementar, o que em time pequeno e distribuído tende a economizar retrabalho.\n\n**Onde eu não sou a pessoa mais forte:** eu não tenho experiência profunda de frontend, e se a vaga precisar de alguém que atue nas duas pontas com o mesmo nível, tem gente melhor. Eu prefiro dizer isso agora.\n\nSe o critério for quem faz o sistema de vocês ficar mais seguro de mudar nos próximos seis meses, eu acho que sou uma boa escolha.',
          'I will answer this by connecting to what you told me in this conversation, because a generic answer here helps neither of us.\n\nYou described three things: a billing system that grew faster than its structure, difficulty changing it without fear, and a small team that needs someone who works with autonomy.\n\n**On the first**, that is literally what I have done for the last two years. Not because I chose it — because the system was already like that when I arrived. What I learned there was not how to build a payment system from scratch; it was how to change one that is already running with money flowing through it. Those are different skills, and the second is the one you need.\n\n**On the second**, the technique I use most is parallel comparison before switching. I have applied it to a provider migration and to a service rewrite, and both times it found behaviour nobody knew existed. It is the kind of practice that looks slow and is actually the fastest, because it avoids the cycle of discovering problems through customers.\n\n**On the third**, I work well independently and I over-communicate rather than under-communicate. I prefer writing down the decision and the alternatives before implementing, which in a small distributed team tends to save rework.\n\n**Where I am not the strongest candidate:** I do not have deep frontend experience, and if the role needs someone equally strong on both ends, there are better people. I would rather say that now.\n\nIf the criterion is who makes your system safer to change over the next six months, I think I am a good choice.',
        ),
      }),
      lookingFor(
        list(
          [
            'Conectar ao que foi dito na própria entrevista',
            'Evidência concreta em vez de adjetivos',
            'Alguma honestidade sobre limites',
            'Uma frase de fechamento clara',
          ],
          [
            'Connecting to what was said in this interview',
            'Concrete evidence rather than adjectives',
            'Some honesty about limits',
            'A clear closing sentence',
          ],
        ),
        {
          strong: t(
            'Nomear onde você não é o candidato mais forte aumenta a credibilidade de tudo que você disse antes. E o entrevistador já ia descobrir.',
            'Naming where you are not the strongest candidate increases the credibility of everything you said before. And the interviewer was going to find out anyway.',
          ),
        },
      ),
      tip(
        t(
          'Esta pergunta costuma vir no fim, e é a sua última chance de deixar uma frase na cabeça do entrevistador. Escolha uma coisa que você quer que ele lembre e diga ela de forma limpa, sem enfeitar.',
          'This question usually comes at the end, and it is your last chance to leave one sentence in the interviewer\'s head. Pick the one thing you want them to remember and say it cleanly, without dressing it up.',
        ),
      ),
      followUps(
        list(
          [
            'O que você precisaria aprender nos primeiros três meses?',
            'Você tem perguntas para nós?',
          ],
          [
            'What would you need to learn in the first three months?',
            'Do you have questions for us?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'beh-career-goals',
    type: 'behavioral',
    title: t('Onde você quer chegar', 'Where you want to get to'),
    categoryId: 'behavioral',
    skillIds: ['communication'],
    difficulty: 'intermediate',
    tags: ['career', 'goals', 'growth'],
    minutes: 3,
    related: ['beh-why-international', 'beh-why-hire-you'],
    blocks: [
      prompt(
        t(
          'Onde você se vê daqui a cinco anos?',
          'Where do you see yourself in five years?',
        ),
      ),
      answers({
        short: t(
          'Eu não tenho um cargo específico em mente, e prefiro ser honesto sobre isso. O que eu sei é a direção: quero ser a pessoa que o time procura quando um problema é ambíguo e grande demais para uma pessoa resolver sozinha. Isso pode ser um cargo de staff engineer ou pode ser tech lead — depende de onde eu estiver e do que o time precisar. O que eu não quero é sair de perto do código, porque é de lá que eu tiro o contexto para decidir bem.',
          'I do not have a specific title in mind, and I would rather be honest about that. What I do know is the direction: I want to be the person the team comes to when a problem is ambiguous and too big for one person. That might be a staff engineer role or it might be tech lead — it depends where I am and what the team needs. What I do not want is to move away from the code, because that is where I get the context to decide well.',
        ),
        strong: t(
          'Eu vou responder por direção em vez de por cargo, porque cinco anos é tempo demais para eu fingir que tenho um plano preciso.\n\n**O que eu quero desenvolver** é a capacidade de lidar com problemas mal definidos. Hoje eu sou bom quando o problema está claro — me dê um requisito e eu entrego uma solução sólida. O que eu ainda estou construindo é a parte anterior: descobrir qual é o problema certo quando cinco pessoas descrevem cinco coisas diferentes, e conseguir alinhar isso.\n\n**Em termos de papel**, o caminho que me atrai mais é o técnico — algo na linha de staff engineer. Não porque eu não tenha interesse em gestão, mas porque o que me dá energia é resolver e ensinar, não coordenar e priorizar. Eu já fiz um pouco dos dois e sei qual me cansa menos.\n\n**O que eu quero evitar** é o que eu vi acontecer com pessoas que eu admiro: ir subindo e se afastar do código até não conseguir mais avaliar uma decisão técnica de forma independente. Aí a pessoa vira alguém que aprova, não alguém que decide.\n\n**No horizonte mais próximo**, que eu acho mais útil responder: nos próximos dois anos eu quero trabalhar em um sistema com escala maior do que eu já vi, e ficar confortável conduzindo uma discussão técnica em inglês do mesmo jeito que eu conduzo em português. Essas duas coisas eu consigo medir.',
          'I will answer by direction rather than by title, because five years is too long for me to pretend I have a precise plan.\n\n**What I want to develop** is the ability to handle badly defined problems. Today I am good when the problem is clear — hand me a requirement and I will deliver something solid. What I am still building is the step before: working out which is the right problem when five people describe five different things, and getting that aligned.\n\n**In terms of role**, the path that attracts me most is the technical one — something along staff engineer lines. Not because I have no interest in management, but because what gives me energy is solving and teaching, not coordinating and prioritising. I have done a bit of both and I know which one tires me less.\n\n**What I want to avoid** is what I have watched happen to people I admire: moving up and drifting away from the code until they can no longer assess a technical decision independently. At that point you become someone who approves rather than someone who decides.\n\n**On the nearer horizon**, which I think is more useful to answer: over the next two years I want to work on a system at a bigger scale than I have seen, and get comfortable running a technical discussion in English the way I run one in Portuguese. Those two I can actually measure.',
        ),
      }),
      lookingFor(
        list(
          [
            'Uma direção pensada, mesmo sem cargo definido',
            'Autoconhecimento sobre o que dá energia',
            'Algo mensurável no horizonte curto',
            'Compatibilidade plausível com a vaga',
          ],
          [
            'A considered direction, even without a fixed title',
            'Self-knowledge about what gives energy',
            'Something measurable on the near horizon',
            'Plausible compatibility with the role',
          ],
        ),
        {
          shallow: t(
            'Uma resposta superficial diz "quero continuar crescendo e aprendendo", que é verdade para todo mundo e portanto não informa nada.',
            'A shallow answer says "I want to keep growing and learning", which is true of everybody and therefore says nothing.',
          ),
        },
      ),
      followUps(
        list(
          [
            'O que você precisa aprender para chegar lá?',
            'Você tem interesse em gestão?',
            'Como esta vaga se encaixa nesse caminho?',
          ],
          [
            'What do you need to learn to get there?',
            'Are you interested in management?',
            'How does this role fit into that path?',
          ],
        ),
      ),
    ],
  }),
];
