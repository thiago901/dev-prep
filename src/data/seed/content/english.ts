import type { Content } from '@/domain/types';
import {
  answers,
  content,
  explain,
  followUps,
  list,
  lookingFor,
  mistakes,
  prompt,
  setupText,
  t,
  tip,
} from '../authoring';

/**
 * Spoken technical English.
 *
 * These items are authored in English only, on purpose: the exercise is
 * producing the answer in English, so a Portuguese version would let the user
 * rehearse in the wrong language. The guidance around them stays bilingual,
 * because understanding why an answer works is not the thing being trained.
 */
export const ENGLISH_CONTENT: Content[] = [
  content({
    slug: 'eng-explain-your-work',
    type: 'interview-question',
    title: t('Explique o que você construiu', 'Explain what you built'),
    categoryId: 'english',
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'intermediate',
    tags: ['english', 'speaking', 'explaining'],
    languages: ['en'],
    minutes: 5,
    related: ['beh-tell-me-about-yourself', 'eng-explain-a-concept', 'eng-disagree-politely'],
    blocks: [
      setupText(
        t(
          'Responda em inglês. Se você travar, continue falando — travar e recomeçar é exatamente o que essa prática existe para resolver.',
          'Answer in English. If you get stuck, keep going — freezing and restarting is exactly what this practice exists to fix.',
        ),
      ),
      prompt(
        t(
          'Walk me through something you built recently. What was it, and what was hard about it?',
          'Walk me through something you built recently. What was it, and what was hard about it?',
        ),
      ),
      answers({
        short: {
          en: 'Recently I worked on the retry logic for our payment webhooks. The provider sends us an event when a charge settles, and we were losing some of them when our service restarted mid-processing. I moved the handling into a queue with an idempotency key, so a redelivered event does not create a duplicate record. The hard part was not the queue — it was figuring out which events we had already lost, and backfilling them without double-charging anyone.',
        },
        strong: {
          en: 'Sure. The most recent one was reworking how we handle payment webhooks.\n\nSo, the context: our payment provider sends us an event whenever a charge settles or fails. We were processing those events directly in the HTTP handler. That worked fine until traffic grew, and then we started seeing a small number of events that never got processed — usually when the service restarted during a deploy.\n\nThe fix itself was fairly standard. We now acknowledge the webhook immediately, put the event on a queue, and process it in a worker. Each event carries an idempotency key, so if the provider redelivers — which they do, quite aggressively — we do not create a duplicate record.\n\nThe hard part was actually the cleanup. We knew we had lost some events, but we did not know which ones. So we had to reconcile against the provider\'s API, compare their records against ours, and backfill the gaps. And that had to be careful, because a naive backfill would have re-triggered confirmation emails to customers about charges from three weeks earlier.\n\nWhat I took away from it is that the interesting problem was not the new design. It was migrating to it while the old data was already inconsistent.',
        },
        deep: {
          en: 'A few things that make this kind of answer land in English, beyond the content.\n\n**Signpost the structure out loud.** "So, the context is…", "The fix itself was…", "The hard part was…". These phrases buy you a second to think and they tell the interviewer where you are in the story. In your own language you do this instinctively; in English it is worth doing deliberately.\n\n**Short sentences.** The most common thing that goes wrong is starting a long sentence, losing the grammar halfway, and having to restart. Two short sentences always beat one long one that collapses.\n\n**Do not translate idioms.** If you reach for a Portuguese expression and start translating it word by word, you will stall. Say the plain version instead.\n\n**Recovering out loud is fine.** "Sorry, let me rephrase that" is a completely normal thing for a native speaker to say. Silence while you rebuild the sentence in your head is what reads as struggling.\n\n**Numbers and technical nouns are the easy part.** You already know "idempotency key", "queue", "webhook". What usually breaks is the connective tissue — "which is why", "so that", "the reason being". Those are worth practising specifically.',
        },
      }),
      lookingFor(
        list(
          [
            'Estrutura clara: contexto, o que foi feito, o que foi difícil',
            'Frases curtas em vez de uma frase longa que desmorona',
            'Marcadores de transição ditos em voz alta',
            'Um detalhe concreto que só quem fez saberia',
            'Recuperação natural quando trava, sem silêncio longo',
          ],
          [
            'A clear structure: context, what you did, what was hard',
            'Short sentences rather than one long one that collapses',
            'Signposting phrases said out loud',
            'One concrete detail only the person who did it would know',
            'Natural recovery when stuck, without a long silence',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte em inglês não é a que tem vocabulário mais avançado. É a que o entrevistador entende na primeira vez, sem precisar reconstruir a frase.',
            'A strong answer in English is not the one with the most advanced vocabulary. It is the one the interviewer understands the first time, without having to rebuild the sentence.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Tentar impressionar com vocabulário e perder a frase no meio',
            'Traduzir expressão idiomática do português',
            'Ficar em silêncio para montar a frase perfeita',
            'Falar rápido demais por nervosismo — a clareza cai antes da gramática',
          ],
          [
            'Reaching for impressive vocabulary and losing the sentence halfway',
            'Translating a Portuguese idiom word by word',
            'Going silent while assembling the perfect sentence',
            'Speaking too fast from nerves — clarity goes before grammar does',
          ],
        ),
      ),
      tip(
        t(
          'Grave esta antes de ler a resposta modelo. Depois ouça a sua gravação prestando atenção em uma coisa só: quantas vezes você recomeçou uma frase. Esse número cai rápido com prática, e é o indicador mais honesto de fluência sob pressão.',
          'Record this before reading the model answer. Then listen back paying attention to one thing only: how many times you restarted a sentence. That number drops quickly with practice, and it is the most honest indicator of fluency under pressure.',
        ),
      ),
      followUps(
        list(
          [
            'How did you decide it was worth rewriting rather than patching?',
            'What would you do differently if you started again?',
            'How did you test the backfill before running it?',
          ],
          [
            'How did you decide it was worth rewriting rather than patching?',
            'What would you do differently if you started again?',
            'How did you test the backfill before running it?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-explain-a-concept',
    type: 'concept',
    title: t('Explique um conceito técnico em inglês', 'Explain a technical concept in English'),
    categoryId: 'english',
    stackIds: ['nodejs'],
    skillIds: ['english-speaking', 'communication', 'nodejs'],
    difficulty: 'intermediate',
    tags: ['english', 'speaking', 'explaining', 'event-loop'],
    languages: ['en'],
    minutes: 5,
    related: ['js-event-loop-single-thread', 'eng-explain-your-work'],
    blocks: [
      setupText(
        t(
          'Você já sabe a resposta técnica desta. O exercício é outro: dizê-la em inglês, em voz alta, sem preparar.',
          'You already know the technical answer to this one. The exercise is different: saying it in English, out loud, unprepared.',
        ),
      ),
      prompt(
        t(
          'Imagine I am a product manager with some technical background. Explain to me why a Node.js service can handle a lot of traffic on a single thread.',
          'Imagine I am a product manager with some technical background. Explain to me why a Node.js service can handle a lot of traffic on a single thread.',
        ),
      ),
      answers({
        short: {
          en: 'The short version is that most of what a server does is waiting, not computing. When we query the database, Node does not sit there holding the thread — it hands the work off to the operating system and moves on to the next request. When the database answers, Node picks it back up. So one thread can have thousands of requests in flight, because almost all of them are just waiting. Where it breaks down is if we do heavy computation in a request, because that actually occupies the thread and everything else queues up behind it.',
        },
        strong: {
          en: 'Let me use an analogy first, and then I will be specific.\n\nThink of a waiter in a restaurant. One waiter can serve twenty tables, because most of the time they are not doing anything for any particular table — they take an order, hand it to the kitchen, and go to the next table. The kitchen does the slow part. The waiter is only the coordinator.\n\nNode works the same way. The single thread takes the request, and when it needs something slow — a database query, an API call, reading a file — it hands that off and immediately moves on. The operating system does the waiting. When the result comes back, the thread picks that request up again and finishes it.\n\nSo the thing that lets it scale is that a typical API request is mostly waiting. If a request takes 200 milliseconds and 190 of those are the database, the thread is only busy for 10.\n\nThe limitation is the other case. If a request needs the thread to actually compute something — generating a PDF, resizing an image, parsing a very large file — then the waiter is stuck in the kitchen, and every other table waits. That is when we move that work to a background worker or a separate service.\n\nSo the rule I would give you is: Node is excellent when the work is waiting, and needs help when the work is thinking.',
        },
      }),
      lookingFor(
        list(
          [
            'Adaptar o nível à audiência descrita, e não recitar a explicação técnica',
            'Uma analogia que sustenta o ponto sem distorcer',
            'Voltar do concreto para o específico',
            'Nomear o limite, não só a vantagem',
            'Uma frase final que resume',
          ],
          [
            'Adapting to the audience described, rather than reciting the technical explanation',
            'An analogy that carries the point without distorting it',
            'Returning from the concrete to the specific',
            'Naming the limitation, not only the advantage',
            'A closing sentence that summarises',
          ],
        ),
        {
          strong: t(
            'Explicar bem para alguém não técnico é o sinal mais forte de que você entendeu de verdade. Empresas internacionais testam isso de propósito, porque o trabalho é distribuído e escrito.',
            'Explaining well to a non-technical person is the strongest signal that you genuinely understand it. International companies test this on purpose, because the work is distributed and written.',
          ),
        },
      ),
      tip(
        t(
          'Comece pela analogia e avise que é uma analogia: "let me use an analogy first". Isso te dá controle sobre o ritmo e dá ao entrevistador um mapa do que vem. Termine voltando ao termo técnico, senão parece que você só sabe a metáfora.',
          'Start with the analogy and announce it as one: "let me use an analogy first". That gives you control of the pacing and gives the interviewer a map of what is coming. Finish by returning to the technical term, otherwise it looks like the metaphor is all you have.',
        ),
      ),
      followUps(
        list(
          [
            'So would adding more CPU cores make it faster?',
            'What happens if the database gets slow?',
            'How would you explain that to a non-technical stakeholder?',
          ],
          [
            'So would adding more CPU cores make it faster?',
            'What happens if the database gets slow?',
            'How would you explain that to a non-technical stakeholder?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-disagree-politely',
    type: 'scenario',
    title: t('Discordar em inglês sem soar agressivo', 'Disagreeing in English without sounding blunt'),
    categoryId: 'english',
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'advanced',
    tags: ['english', 'speaking', 'disagreement', 'register'],
    languages: ['en'],
    minutes: 4,
    related: ['beh-conflict', 'eng-ask-for-clarification'],
    blocks: [
      setupText(
        t(
          'Registro é a parte do inglês que mais atrapalha desenvolvedores que já leem e escrevem bem. Traduzir a estrutura direta do português costuma soar mais agressivo do que se pretendia.',
          'Register is the part of English that most trips up developers who already read and write well. Translating the direct Portuguese structure usually lands harsher than intended.',
        ),
      ),
      prompt(
        t(
          'In a design review, a senior engineer proposes storing the session token in localStorage. You think that is a bad idea. Say so, out loud, the way you would in the meeting.',
          'In a design review, a senior engineer proposes storing the session token in localStorage. You think that is a bad idea. Say so, out loud, the way you would in the meeting.',
        ),
      ),
      answers({
        short: {
          en: 'I see the appeal, since it is simpler to work with. My concern is XSS though — anything in localStorage is readable by any script on the page, including something that comes in through a dependency. Could we use an httpOnly cookie instead? It costs us the CSRF handling, but it means a compromised script cannot walk away with the session.',
        },
        strong: {
          en: 'Can I push back on that one a bit?\n\nI see why it is attractive — it is simpler, and it works the same across tabs without extra handling.\n\nWhat worries me is the XSS surface. Anything in localStorage is readable by any JavaScript running on the page, and that includes code we did not write — an analytics tag, or a transitive dependency that gets compromised. If that happens, the attacker does not just act within the session, they take the token and use it from anywhere.\n\nWith an httpOnly cookie, an XSS is still bad, but the attacker cannot extract the credential. That difference matters a lot for us, because we handle payment data.\n\nThe trade-off is that cookies bring CSRF back, so we would need SameSite plus a token on state-changing endpoints. That is maybe a day of work.\n\nSo my suggestion would be the cookie, unless there is a constraint I am missing. Is there something about our setup that makes cookies awkward?',
        },
        deep: {
          en: 'The structural pattern that works in English is: signal, acknowledge, object, propose, invite.\n\n**Signal before you disagree.** "Can I push back on that?", "Can I offer a different angle?". In Portuguese you can go straight into the objection and it reads as engaged. In English, launching directly into "No, that is a problem because…" reads colder than you intend.\n\n**Acknowledge something real.** Not flattery — a genuine advantage of their proposal. It shows you understood it rather than pattern-matched against it.\n\n**Object with a concern, not a verdict.** "My concern is…" and "What worries me is…" are doing work here. They frame it as your assessment, which is harder to take personally and easier to respond to.\n\n**Propose an alternative with its cost.** Naming what your own option costs is what makes you sound senior rather than contrarian.\n\n**Invite a response.** "Unless there is a constraint I am missing" and "Is there something about our setup that makes that awkward?" leave the door open. In a distributed team where the other person may have context you do not, this is not politeness theatre — it is frequently how you find out you were wrong.\n\n**One habit to avoid:** stacking softeners. "I might be wrong, but I was just sort of wondering if maybe we could possibly…" undermines the point entirely. One signal phrase is enough. Hedging past that reads as lack of confidence rather than politeness.',
        },
      }),
      lookingFor(
        list(
          [
            'Um marcador antes da discordância',
            'Reconhecimento genuíno do outro lado',
            'Preocupação enquadrada como sua avaliação',
            'Alternativa apresentada com o próprio custo',
            'Uma pergunta que abre espaço para resposta',
            'Sem empilhar atenuadores',
          ],
          [
            'A signal phrase before the disagreement',
            'Genuine acknowledgement of the other side',
            'The concern framed as your assessment',
            'An alternative presented with its own cost',
            'A question that leaves room for a reply',
            'No stacked softeners',
          ],
        ),
        {
          shallow: t(
            'Uma resposta superficial vai direto ao ponto técnico — que pode até estar certo — e sai da reunião com a pessoa na defensiva.',
            'A shallow answer goes straight to the technical point — which may well be correct — and leaves the meeting with the other person defensive.',
          ),
        },
      ),
      explain(
        t(
          'Frases que fazem o trabalho pesado: "Can I push back on that?", "I see the appeal, my concern is…", "The trade-off would be…", "Unless there is a constraint I am missing". Vale decorar essas quatro. Elas aparecem em praticamente toda discordância técnica e liberam a sua atenção para o conteúdo.',
          'The phrases doing the heavy lifting: "Can I push back on that?", "I see the appeal, my concern is…", "The trade-off would be…", "Unless there is a constraint I am missing". These four are worth memorising. They come up in practically every technical disagreement and free your attention for the content.',
        ),
        t('Frases que carregam a conversa', 'Phrases that carry the conversation'),
      ),
      followUps(
        list(
          [
            'What if they say the CSRF work is not worth it?',
            'How would you raise this if you were the most junior person in the room?',
            'How would you write the same objection as a comment on a design document?',
          ],
          [
            'What if they say the CSRF work is not worth it?',
            'How would you raise this if you were the most junior person in the room?',
            'How would you write the same objection as a comment on a design document?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-ask-for-clarification',
    type: 'scenario',
    title: t('Pedir para repetir sem parecer perdido', 'Asking someone to repeat without looking lost'),
    categoryId: 'english',
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'intermediate',
    tags: ['english', 'speaking', 'clarification', 'confidence'],
    languages: ['en'],
    minutes: 3,
    related: ['eng-disagree-politely', 'eng-explain-your-work'],
    blocks: [
      setupText(
        t(
          'O medo de pedir para repetir faz muita gente responder a pergunta errada, que é um resultado bem pior. Esta prática é sobre ter as frases prontas para não precisar improvisar no momento.',
          'The fear of asking someone to repeat makes many people answer the wrong question, which is a far worse outcome. This practice is about having the phrases ready so you do not have to improvise in the moment.',
        ),
      ),
      prompt(
        t(
          'The interviewer asks a long question and speaks quickly with an accent you are not used to. You caught about half of it. Say out loud what you would actually say next.',
          'The interviewer asks a long question and speaks quickly with an accent you are not used to. You caught about half of it. Say out loud what you would actually say next.',
        ),
      ),
      answers({
        short: {
          en: 'Sorry, I caught the first part about the caching layer but I lost you after that. Could you repeat the last bit?',
        },
        strong: {
          en: 'There are three situations and they need different sentences.\n\n**You missed the words.** "Sorry, could you say that again? I did not catch the last part." That is it. No apology beyond the one word, no explanation about your English. Native speakers ask each other this constantly.\n\n**You heard it but you are not sure what is being asked.** This is the more useful one, and it makes you look better rather than worse: "Just to make sure I understood — are you asking how I would design it, or how I would debug the existing one?" That is a senior move in any language. It shows you noticed the question had two readings.\n\n**You need thinking time.** "That is a good question, let me think about it for a second." Then actually take the second. Silence after announcing it is comfortable; silence without announcing it feels like you are stuck.\n\nThe one thing I would avoid is apologising for your English. "Sorry, my English is not very good" does two things, both bad: it draws attention to something the interviewer may not have even noticed, and it frames everything you say afterwards as an excuse. Ask the question, get the answer, move on.',
        },
      }),
      lookingFor(
        list(
          [
            'Pedir esclarecimento sem se desculpar pelo idioma',
            'Reformular a pergunta para confirmar o entendimento',
            'Pedir tempo para pensar de forma explícita',
            'Manter o tom confiante',
          ],
          [
            'Asking for clarification without apologising for the language',
            'Restating the question to confirm understanding',
            'Asking for thinking time explicitly',
            'Keeping the tone confident',
          ],
        ),
        {
          strong: t(
            'Reformular a pergunta antes de responder é lido como senioridade em qualquer idioma. Em uma entrevista em inglês, resolve dois problemas de uma vez.',
            'Restating the question before answering reads as seniority in any language. In an English interview it solves two problems at once.',
          ),
        },
      ),
      mistakes(
        list(
          [
            'Pedir desculpa pelo inglês',
            'Responder o que você acha que foi perguntado, sem confirmar',
            'Ficar em silêncio esperando entender sozinho',
            'Dizer "yes" para ganhar tempo e depois responder outra coisa',
          ],
          [
            'Apologising for your English',
            'Answering what you think was asked, without confirming',
            'Going silent hoping to work it out alone',
            'Saying "yes" to buy time and then answering something else',
          ],
        ),
      ),
      tip(
        t(
          'Tenha três frases prontas antes da entrevista e pratique falando, não lendo. No momento do nervoso você não improvisa bem — você usa o que já está automático.',
          'Have three sentences ready before the interview and practise them out loud, not by reading. In the nervous moment you do not improvise well — you use whatever is already automatic.',
        ),
      ),
      followUps(
        list(
          [
            'How would you handle it if you missed the question twice?',
            'What if the interviewer speaks too fast for the whole call?',
          ],
          [
            'How would you handle it if you missed the question twice?',
            'What if the interviewer speaks too fast for the whole call?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-salary-conversation',
    type: 'scenario',
    title: t('A conversa sobre salário em inglês', 'The salary conversation in English'),
    categoryId: 'english',
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'advanced',
    tags: ['english', 'speaking', 'negotiation', 'compensation'],
    languages: ['en'],
    minutes: 4,
    related: ['beh-why-international', 'eng-disagree-politely'],
    blocks: [
      setupText(
        t(
          'Esta é a conversa que mais gente responde mal por nervosismo somado ao idioma. Ter a frase pronta importa mais aqui do que em qualquer outra pergunta.',
          'This is the conversation most people handle badly, from nerves compounded by the language. Having the sentence ready matters more here than on any other question.',
        ),
      ),
      prompt(
        t(
          'Early in the call, the recruiter asks: "What are your salary expectations?" Answer out loud.',
          'Early in the call, the recruiter asks: "What are your salary expectations?" Answer out loud.',
        ),
      ),
      answers({
        short: {
          en: 'I would rather understand the scope a bit more first, if that is alright. Do you have a range budgeted for this role? I am fairly flexible, and if we are in the same area it will not be the hard part.',
        },
        strong: {
          en: 'Happy to talk about it. Before I give you a number, could I ask what range you have budgeted for the role? You will have a better sense than I do of how this level maps to your bands.\n\n[If they give a range:]\nThat works. Based on what you described, I would be looking at the upper half of that, given the payments and reliability experience — but it sounds like we are in the same territory, so I do not think it will be the difficult part.\n\n[If they insist you go first:]\nSure. Based on what I have seen for similar roles, I am looking at somewhere between X and Y, and where I land in that depends on the rest of the package — how you handle equity, and whether the role is fully remote. Does that fit what you had in mind?',
        },
        deep: {
          en: 'The mechanics, and then the language.\n\n**Try to get their range first.** Not as a game — recruiters usually have a band, and it is genuinely faster. "Do you have a range budgeted for this role?" is a completely normal question and almost always gets an answer.\n\n**If you have to name a number, name a range, and anchor the bottom at what you would actually accept.** Whatever number you say first becomes the ceiling of the conversation. A range where the bottom is uncomfortable for you is a bad range.\n\n**Tie the number to something.** "Based on what I have seen for similar roles" or "given the scope you described". A number with a reason is harder to negotiate down than a number on its own.\n\n**Language notes that matter here:**\n\n"I am looking for" sounds more settled than "I would like" or "I want".\n\n"That works" is a complete, confident answer. You do not need to justify agreement.\n\nDo not say "I am flexible" as your only answer — in this context it is heard as "I will take whatever you offer".\n\nAnd resist the urge to keep talking after you say the number. Say it, then stop. The silence that follows is uncomfortable and it is not your job to fill it. Filling it is how people negotiate against themselves — I have watched candidates lower their own number in the same breath they said it.\n\n**One practical note for international roles:** ask early whether the number is gross or net, and whether the role is a contract or employment. Those change the real figure enormously across countries, and it is a completely reasonable thing to ask.',
        },
      }),
      lookingFor(
        list(
          [
            'Tentar obter a faixa antes de dar um número',
            'Se precisar dar, dar uma faixa ancorada em algo',
            'Não continuar falando depois de dizer o número',
            'Tom confiante, sem pedir desculpa',
            'Perguntar sobre bruto, líquido e modelo de contratação',
          ],
          [
            'Trying to get their range before naming a number',
            'If you must name one, giving a range anchored in something',
            'Not continuing to talk after saying the number',
            'A confident tone, without apologising',
            'Asking about gross, net and employment model',
          ],
        ),
        {
          strong: t(
            'Silêncio depois de dizer o número é a parte mais difícil e a mais valiosa. Quem preenche o silêncio quase sempre negocia contra si mesmo.',
            'The silence after naming the number is the hardest and most valuable part. Whoever fills it almost always negotiates against themselves.',
          ),
        },
      ),
      tip(
        t(
          'Grave esta duas vezes. Na primeira você vai falar demais depois do número — praticamente todo mundo faz. Na segunda, pare de propósito e deixe o silêncio durar. É estranho de treinar e é exatamente por isso que vale.',
          'Record this one twice. The first time you will keep talking after the number — practically everyone does. The second time, stop on purpose and let the silence sit. It feels strange to practise and that is exactly why it is worth it.',
        ),
      ),
      followUps(
        list(
          [
            'What if their range is below what you need?',
            'How do you ask about equity without sounding greedy?',
            'What do you say if they ask your current salary?',
          ],
          [
            'What if their range is below what you need?',
            'How do you ask about equity without sounding greedy?',
            'What do you say if they ask your current salary?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-questions-for-them',
    type: 'behavioral',
    title: t('As perguntas que você faz', 'The questions you ask'),
    categoryId: 'english',
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'intermediate',
    tags: ['english', 'speaking', 'closing', 'evaluation'],
    languages: ['en'],
    minutes: 4,
    related: ['beh-why-hire-you', 'beh-career-goals'],
    blocks: [
      setupText(
        t(
          'Quase toda entrevista termina aqui, e é a parte mais subestimada. As perguntas que você faz dizem sobre você tanto quanto as respostas que você deu.',
          'Nearly every interview ends here, and it is the most underrated part. The questions you ask say as much about you as the answers you gave.',
        ),
      ),
      prompt(
        t(
          '"So, do you have any questions for us?" Answer out loud.',
          '"So, do you have any questions for us?" Answer out loud.',
        ),
      ),
      answers({
        short: {
          en: 'Yes, a couple. What does the first month look like for whoever takes this role — is there something specific waiting, or is it more about getting context? And on the team side, how do decisions get made when there is disagreement about a technical direction?',
        },
        strong: {
          en: 'Yes, three if there is time.\n\nFirst, on the work itself: what does the first three months look like for whoever joins? I am trying to understand whether there is a specific problem waiting, or whether it is more about picking up context gradually.\n\nSecond, on how the team works: when there is a technical disagreement and people do not converge, how does that get resolved? I ask because I have worked somewhere that had no answer to that, and decisions used to stall for weeks.\n\nAnd third, something I ask everyone: what is the part of working here that people find hardest? Not to be difficult — every team has one, and I would rather know what it is now than find out in month three.\n\n[If there is time:]\nActually one more, if I may — what happened to the last person in this role?',
        },
        deep: {
          en: 'What makes a question good here is that the answer would actually change your decision. That rules out most of what people ask.\n\n**Questions worth asking:**\n\n"What does the first three months look like?" — tells you whether the role is real and defined or vague.\n\n"How does a technical disagreement get resolved here?" — this one is very revealing. A team with a healthy process answers immediately. A team without one gives you a vague answer about collaboration.\n\n"What is the hardest part of working here?" — an honest interviewer gives you something real. An evasive answer is itself information.\n\n"What happened to the last person in this role?" — direct, and completely fair to ask.\n\n"How do you handle the time zone difference?" — for a distributed role, this is practical and shows you have thought about it.\n\n**Questions not worth asking:**\n\nAnything answered on the careers page. It reads as not having looked.\n\n"What is the company culture like?" — nobody has ever answered this usefully.\n\n"Are there growth opportunities?" — every company says yes.\n\n**The language part:** having two or three prepared is enough, and you should genuinely want to know the answers. A memorised question is obvious because you do not react to the reply. The strongest thing you can do here is follow up on what they say — "you mentioned X, how does that work in practice?" — which requires listening rather than waiting for your turn.\n\n**And never say "no, I think you covered everything".** Even when it is true, it reads as disengaged. Ask something.',
        },
      }),
      lookingFor(
        list(
          [
            'Perguntas cuja resposta mudaria a sua decisão',
            'Pelo menos uma sobre como o time funciona, não só sobre a tecnologia',
            'Reagir genuinamente à resposta, com um follow-up',
            'Nunca dizer que não tem perguntas',
          ],
          [
            'Questions whose answer would change your decision',
            'At least one about how the team works, not only about the technology',
            'Reacting genuinely to the answer, with a follow-up',
            'Never saying you have no questions',
          ],
        ),
        {
          strong: t(
            'Perguntar "qual é a parte mais difícil de trabalhar aqui" quase sempre produz a informação mais útil da entrevista inteira — inclusive quando a pessoa desconversa.',
            'Asking "what is the hardest part of working here" almost always produces the most useful information in the whole interview — including when the person dodges.',
          ),
        },
      ),
      followUps(
        list(
          [
            'How would you follow up on a vague answer?',
            'What would make you turn down an offer?',
          ],
          [
            'How would you follow up on a vague answer?',
            'What would make you turn down an offer?',
          ],
        ),
      ),
    ],
  }),
];
