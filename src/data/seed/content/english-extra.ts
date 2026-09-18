import type { Content } from '@/domain/types';
import {
  answers,
  content,
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
 * English for the rounds that are not about grammar.
 *
 * These items exist in English only, on purpose. The work is producing the
 * answer in the language you will be interviewed in — not translating a
 * Portuguese one, which is exactly the habit that makes people freeze.
 */
export const ENGLISH_EXTRA_CONTENT: Content[] = [
  content({
    slug: 'eng-explain-bug',
    type: 'interview-question',
    kind: 'speaking',
    title: t('Explain a bug you fixed', 'Explain a bug you fixed'),
    categoryId: 'english',
    topic: 'storytelling',
    stackIds: ['nodejs'],
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'intermediate',
    tags: ['english', 'debugging', 'storytelling'],
    minutes: 4,
    languages: ['en'],
    related: ['eng-explain-your-work', 'db-slow-query'],
    blocks: [
      prompt(
        t(
          'Tell me about a bug that was hard to find. How did you track it down?',
          'Tell me about a bug that was hard to find. How did you track it down?',
        ),
        t(
          'Asked in almost every technical screen. It is not testing the bug — it is testing whether you can narrate an investigation.',
          'Asked in almost every technical screen. It is not testing the bug — it is testing whether you can narrate an investigation.',
        ),
      ),
      answers({
        short: t(
          'We had checkout failing for about one order in fifty, with no error in the logs. I started from what the failing orders had in common — they were all from the same payment method. Turned out our retry was firing on a timeout while the provider had already accepted the charge, so the second call came back as a duplicate and we rejected the order. We fixed it with an idempotency key, and added a metric for retried charges so we would see it next time.',
          'We had checkout failing for about one order in fifty, with no error in the logs. I started from what the failing orders had in common — they were all from the same payment method. Turned out our retry was firing on a timeout while the provider had already accepted the charge, so the second call came back as a duplicate and we rejected the order. We fixed it with an idempotency key, and added a metric for retried charges so we would see it next time.',
        ),
        strong: t(
          'The symptom was strange: checkout worked for almost everyone, but roughly two per cent of orders ended in a generic error, and support could not reproduce it.\n\nThe first thing I did was stop guessing and find the pattern. I pulled the failed orders from the last week and looked for anything they shared — time of day, payment method, customer, amount. They clustered around one provider and around slower-than-usual responses.\n\nThat gave me a hypothesis: a timeout. Our client had a two second timeout and retried once. The provider was occasionally taking longer than two seconds, so we retried a charge they had already accepted. Their API answered the second call with "duplicate", and our code treated any error from them as a failed payment.\n\nSo the user was charged and the order was rejected. That is the worst possible combination, and it explains why support could not reproduce it: everything looked fine on our side.\n\nThe fix had three parts. We sent an idempotency key, so a retry returns the original result instead of a duplicate error. We stopped treating every provider error as a decline, and mapped their codes properly. And we added a dashboard for retried charges, because we had no way of seeing this at all.\n\nWhat I took from it: when something fails for a small percentage of users, the answer is usually in what those users have in common, not in the code you suspect.',
          'The symptom was strange: checkout worked for almost everyone, but roughly two per cent of orders ended in a generic error, and support could not reproduce it.\n\nThe first thing I did was stop guessing and find the pattern. I pulled the failed orders from the last week and looked for anything they shared — time of day, payment method, customer, amount. They clustered around one provider and around slower-than-usual responses.\n\nThat gave me a hypothesis: a timeout. Our client had a two second timeout and retried once. The provider was occasionally taking longer than two seconds, so we retried a charge they had already accepted. Their API answered the second call with "duplicate", and our code treated any error from them as a failed payment.\n\nSo the user was charged and the order was rejected. That is the worst possible combination, and it explains why support could not reproduce it: everything looked fine on our side.\n\nThe fix had three parts. We sent an idempotency key, so a retry returns the original result instead of a duplicate error. We stopped treating every provider error as a decline, and mapped their codes properly. And we added a dashboard for retried charges, because we had no way of seeing this at all.\n\nWhat I took from it: when something fails for a small percentage of users, the answer is usually in what those users have in common, not in the code you suspect.',
        ),
        seconds: { short: 40, strong: 140 },
      }),
      lookingFor(
        list(
          [
            'A method: symptom, pattern, hypothesis, evidence, fix.',
            'Past simple for the story, present for what is true now. Keep tenses boring.',
            'The detection gap — what you added so it would be visible next time.',
            'One sentence of what you learned, not a paragraph of reflection.',
          ],
          [
            'A method: symptom, pattern, hypothesis, evidence, fix.',
            'Past simple for the story, present for what is true now. Keep tenses boring.',
            'The detection gap — what you added so it would be visible next time.',
            'One sentence of what you learned, not a paragraph of reflection.',
          ],
        ),
      ),
      mistakes(
        list(
          [
            'Starting with the codebase instead of the symptom, so the listener is lost by sentence three.',
            'Saying "we fixed it" without saying how you knew it was fixed.',
            'Translating a Portuguese sentence structure: long clauses joined by "that", instead of short sentences.',
          ],
          [
            'Starting with the codebase instead of the symptom, so the listener is lost by sentence three.',
            'Saying "we fixed it" without saying how you knew it was fixed.',
            'Translating a Portuguese sentence structure: long clauses joined by "that", instead of short sentences.',
          ],
        ),
      ),
      tip(
        t(
          'Phrases worth having ready: "the symptom was…", "what they had in common was…", "so my hypothesis was…", "the fix had two parts…". They carry the whole story and they are easy to say under pressure.',
          'Phrases worth having ready: "the symptom was…", "what they had in common was…", "so my hypothesis was…", "the fix had two parts…". They carry the whole story and they are easy to say under pressure.',
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-tradeoffs-speak',
    type: 'interview-question',
    kind: 'speaking',
    title: t('Talk through a trade-off in English', 'Talk through a trade-off in English'),
    categoryId: 'english',
    topic: 'system-design',
    stackIds: ['nodejs', 'redis'],
    skillIds: ['english-speaking', 'system-design', 'communication'],
    difficulty: 'advanced',
    tags: ['english', 'system design', 'trade-off'],
    minutes: 4,
    languages: ['en'],
    related: ['sd-read-strategy-learn', 'eng-explain-a-concept'],
    blocks: [
      prompt(
        t(
          'You suggested adding a cache. The interviewer asks: "what does that cost us?" Answer out loud.',
          'You suggested adding a cache. The interviewer asks: "what does that cost us?" Answer out loud.',
        ),
        t(
          'In a design round, the follow-up is always the cost. Answering it well is what separates a candidate who read about caching from one who has run it.',
          'In a design round, the follow-up is always the cost. Answering it well is what separates a candidate who read about caching from one who has run it.',
        ),
      ),
      answers({
        short: t(
          'Three things. First, staleness: users can see data that is up to a minute old, so we need to agree what that window is per screen. Second, a new failure mode: if the cache is down, everything falls back to the database, so our sizing has to survive that. And third, invalidation becomes part of the feature — every write path now has to know what it invalidates, which is easy to forget six months later.',
          'Three things. First, staleness: users can see data that is up to a minute old, so we need to agree what that window is per screen. Second, a new failure mode: if the cache is down, everything falls back to the database, so our sizing has to survive that. And third, invalidation becomes part of the feature — every write path now has to know what it invalidates, which is easy to forget six months later.',
        ),
        strong: t(
          'The obvious cost is staleness, and I would make that a product question rather than a technical one: for the catalogue, sixty seconds is fine; for stock counts, it is not, because we would be promising units we do not have.\n\nThe second cost is the failure mode we are adding. Today, if the database is slow, the API is slow. With a cache, we have two ways to fail: the database slow, or the cache down and all of that traffic landing on the database at once. So I would size the database for the no-cache case, at least for the critical endpoints, and I would treat a cold cache as a normal event — after a deploy, for example.\n\nThe third is invalidation, and that is the one that bites later. Every place that writes has to know which keys it invalidates. If we forget one, we get wrong data with good latency, which is harder to notice than being slow.\n\nGiven all that, I would still add it here, because reads outnumber writes by a large factor and the data changes once a day. But I would start with one endpoint, measure the hit rate, and only expand if the number justifies it.',
          'The obvious cost is staleness, and I would make that a product question rather than a technical one: for the catalogue, sixty seconds is fine; for stock counts, it is not, because we would be promising units we do not have.\n\nThe second cost is the failure mode we are adding. Today, if the database is slow, the API is slow. With a cache, we have two ways to fail: the database slow, or the cache down and all of that traffic landing on the database at once. So I would size the database for the no-cache case, at least for the critical endpoints, and I would treat a cold cache as a normal event — after a deploy, for example.\n\nThe third is invalidation, and that is the one that bites later. Every place that writes has to know which keys it invalidates. If we forget one, we get wrong data with good latency, which is harder to notice than being slow.\n\nGiven all that, I would still add it here, because reads outnumber writes by a large factor and the data changes once a day. But I would start with one endpoint, measure the hit rate, and only expand if the number justifies it.',
        ),
        seconds: { short: 35, strong: 130 },
      }),
      rubric({
        incorrect: t(
          'Lists benefits of caching again, or says "there is no real downside".',
          'Lists benefits of caching again, or says "there is no real downside".',
        ),
        partial: t(
          'Mentions staleness only, and stops before the operational cost.',
          'Mentions staleness only, and stops before the operational cost.',
        ),
        strong: t(
          'Names staleness, the new failure mode and invalidation, and ties each to a decision.',
          'Names staleness, the new failure mode and invalidation, and ties each to a decision.',
        ),
        interviewReady: t(
          'All of that, plus a recommendation with a first step and a number that would change your mind.',
          'All of that, plus a recommendation with a first step and a number that would change your mind.',
        ),
      }),
      tip(
        t(
          'Structure buys you fluency: "there are three costs" gives your listener a map and gives you time to build each sentence.',
          'Structure buys you fluency: "there are three costs" gives your listener a map and gives you time to build each sentence.',
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-clarifying-questions',
    type: 'scenario',
    kind: 'speaking',
    title: t('Ask the questions before you design', 'Ask the questions before you design'),
    categoryId: 'english',
    topic: 'system-design',
    stackIds: ['nodejs'],
    skillIds: ['english-speaking', 'system-design', 'communication'],
    difficulty: 'advanced',
    tags: ['english', 'system design', 'perguntas'],
    minutes: 4,
    languages: ['en'],
    related: ['eng-ask-for-clarification', 'sd-notifications-design'],
    blocks: [
      prompt(
        t(
          '"Design a URL shortener." Before you draw anything, ask your clarifying questions out loud, in English.',
          '"Design a URL shortener." Before you draw anything, ask your clarifying questions out loud, in English.',
        ),
        t(
          'The first two minutes of a design round are scored. Candidates who start drawing lose points they never see.',
          'The first two minutes of a design round are scored. Candidates who start drawing lose points they never see.',
        ),
      ),
      answers({
        short: t(
          'Before I design anything — how many links are we creating per day, and how many redirects? Are the links permanent, or do they expire? Do users need analytics on them? And is this public, or internal to a product we already run? The answers change almost every decision after this.',
          'Before I design anything — how many links are we creating per day, and how many redirects? Are the links permanent, or do they expire? Do users need analytics on them? And is this public, or internal to a product we already run? The answers change almost every decision after this.',
        ),
        strong: t(
          'I would start with scale, because it decides the storage and the read path. How many new links per day, and what is the read-to-write ratio? For a shortener it is usually heavily read-dominated, and that pushes me towards caching and read replicas early.\n\nThen lifetime. Do links expire, and can they be deleted? If they are permanent, storage grows forever and I need a plan for cold data. If they expire, I can be much more relaxed.\n\nThen behaviour. Do we need custom aliases? Because that changes key generation from "any unique short string" to "a uniqueness check with user input", which is a different problem. And do we need click analytics? That turns every redirect into a write, and the write volume becomes the real design challenge.\n\nThen constraints. Is there a latency target for the redirect? Is this global, so I should think about where the data lives? And is there anything about abuse — do we need to block malicious URLs? That one is often forgotten and it usually matters.\n\nI would ask those in under two minutes, and then say what I am assuming if the interviewer does not have numbers, so we can move.',
          'I would start with scale, because it decides the storage and the read path. How many new links per day, and what is the read-to-write ratio? For a shortener it is usually heavily read-dominated, and that pushes me towards caching and read replicas early.\n\nThen lifetime. Do links expire, and can they be deleted? If they are permanent, storage grows forever and I need a plan for cold data. If they expire, I can be much more relaxed.\n\nThen behaviour. Do we need custom aliases? Because that changes key generation from "any unique short string" to "a uniqueness check with user input", which is a different problem. And do we need click analytics? That turns every redirect into a write, and the write volume becomes the real design challenge.\n\nThen constraints. Is there a latency target for the redirect? Is this global, so I should think about where the data lives? And is there anything about abuse — do we need to block malicious URLs? That one is often forgotten and it usually matters.\n\nI would ask those in under two minutes, and then say what I am assuming if the interviewer does not have numbers, so we can move.',
        ),
        seconds: { short: 35, strong: 130 },
      }),
      lookingFor(
        list(
          [
            'Questions that would change the design, not trivia.',
            'Grouping them: scale, lifetime, behaviour, constraints.',
            'Stating assumptions and moving on, instead of waiting to be given numbers.',
            'Natural question forms: "How many…?", "Do we need…?", "Is there a target for…?"',
          ],
          [
            'Questions that would change the design, not trivia.',
            'Grouping them: scale, lifetime, behaviour, constraints.',
            'Stating assumptions and moving on, instead of waiting to be given numbers.',
            'Natural question forms: "How many…?", "Do we need…?", "Is there a target for…?"',
          ],
        ),
      ),
      warn(
        t(
          'Do not spend five minutes on questions. Two minutes, then: "I will assume ten million redirects a day and no custom aliases — tell me if that is wrong."',
          'Do not spend five minutes on questions. Two minutes, then: "I will assume ten million redirects a day and no custom aliases — tell me if that is wrong."',
        ),
      ),
      followUps(
        list(
          [
            'What would you change if custom aliases were required?',
            'What if 90% of traffic came from one country?',
            'How would you handle a link that becomes malicious after it was created?',
          ],
          [
            'What would you change if custom aliases were required?',
            'What if 90% of traffic came from one country?',
            'How would you handle a link that becomes malicious after it was created?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'eng-written-update',
    type: 'behavioral',
    kind: 'written',
    title: t('Write the update nobody has to decode', 'Write the update nobody has to decode'),
    categoryId: 'english',
    topic: 'communication',
    stackIds: [],
    skillIds: ['english-speaking', 'communication'],
    difficulty: 'intermediate',
    tags: ['english', 'escrita', 'async'],
    minutes: 4,
    languages: ['en'],
    related: ['eng-disagree-politely', 'beh-deadline'],
    blocks: [
      note(
        t(
          'On a distributed team, most of your visible work is written: stand-up updates, pull request descriptions, incident notes. Written English is judged as much as spoken English, and it is far easier to practise.',
          'On a distributed team, most of your visible work is written: stand-up updates, pull request descriptions, incident notes. Written English is judged as much as spoken English, and it is far easier to practise.',
        ),
      ),
      prompt(
        t(
          'Write the async update. The migration you own is late, one dependency is blocking you, and the team needs to know whether Friday is still realistic.',
          'Write the async update. The migration you own is late, one dependency is blocking you, and the team needs to know whether Friday is still realistic.',
        ),
      ),
      answers({
        short: t(
          '**Status: at risk for Friday.**\n\nThe data migration is about 60% done. The remaining part depends on the new billing endpoint, which is not deployed yet — I raised it with the billing team this morning and they expect it Wednesday.\n\nIf it lands Wednesday, Friday still works. If it slips to Thursday, I would move the cutover to Monday rather than run it late on Friday.\n\nNothing needed from anyone right now. I will update tomorrow after their deploy.',
          '**Status: at risk for Friday.**\n\nThe data migration is about 60% done. The remaining part depends on the new billing endpoint, which is not deployed yet — I raised it with the billing team this morning and they expect it Wednesday.\n\nIf it lands Wednesday, Friday still works. If it slips to Thursday, I would move the cutover to Monday rather than run it late on Friday.\n\nNothing needed from anyone right now. I will update tomorrow after their deploy.',
        ),
        strong: t(
          'The shape that works is always the same: status first, then facts, then the decision you are proposing, then what you need.\n\n**Status: at risk for Friday.**\n\n**Where it stands.** The migration script is done and tested against a copy of production. It moved 4.2M of 7M rows in the dry run, in about 40 minutes, which is inside our window.\n\n**What is blocking.** The last step writes to the new billing endpoint, which is not in production yet. I asked the billing team this morning; they expect to deploy on Wednesday.\n\n**What I propose.** If their deploy lands Wednesday, we keep Friday and I run the cutover at 7am. If it slips past Wednesday, I would rather move to Monday than start a seven-hour migration on a Friday afternoon, because a rollback would land on the weekend.\n\n**What I need.** Nothing today. If anyone disagrees with moving to Monday, say so before Thursday morning.\n\nTwo habits make this readable: leading with the conclusion, and separating what is fact from what you are proposing. Both are easier in English than they sound, because the sentences stay short.',
          'The shape that works is always the same: status first, then facts, then the decision you are proposing, then what you need.\n\n**Status: at risk for Friday.**\n\n**Where it stands.** The migration script is done and tested against a copy of production. It moved 4.2M of 7M rows in the dry run, in about 40 minutes, which is inside our window.\n\n**What is blocking.** The last step writes to the new billing endpoint, which is not in production yet. I asked the billing team this morning; they expect to deploy on Wednesday.\n\n**What I propose.** If their deploy lands Wednesday, we keep Friday and I run the cutover at 7am. If it slips past Wednesday, I would rather move to Monday than start a seven-hour migration on a Friday afternoon, because a rollback would land on the weekend.\n\n**What I need.** Nothing today. If anyone disagrees with moving to Monday, say so before Thursday morning.\n\nTwo habits make this readable: leading with the conclusion, and separating what is fact from what you are proposing. Both are easier in English than they sound, because the sentences stay short.',
        ),
        seconds: { short: 40, strong: 120 },
      }),
      rubric({
        incorrect: t(
          'Describes activity ("I worked on the migration") without saying whether the date holds.',
          'Describes activity ("I worked on the migration") without saying whether the date holds.',
        ),
        partial: t(
          'Says it is late and why, but leaves the decision to the reader.',
          'Says it is late and why, but leaves the decision to the reader.',
        ),
        strong: t(
          'Leads with status, separates facts from proposal, and names the deadline for objections.',
          'Leads with status, separates facts from proposal, and names the deadline for objections.',
        ),
        interviewReady: t(
          'All of that, in short sentences a reader in another time zone can act on without asking a single follow-up question.',
          'All of that, in short sentences a reader in another time zone can act on without asking a single follow-up question.',
        ),
      }),
      mistakes(
        list(
          [
            'Apologising for three lines before saying what happened.',
            'Hiding the risk in the middle of a paragraph.',
            'Writing "I think maybe we could possibly" — hedging reads as uncertainty about the facts, not politeness.',
          ],
          [
            'Apologising for three lines before saying what happened.',
            'Hiding the risk in the middle of a paragraph.',
            'Writing "I think maybe we could possibly" — hedging reads as uncertainty about the facts, not politeness.',
          ],
        ),
      ),
      tip(
        t(
          'Polite and direct at the same time: "I would rather move to Monday, because…" is softer than it looks and still states a position.',
          'Polite and direct at the same time: "I would rather move to Monday, because…" is softer than it looks and still states a position.',
        ),
      ),
    ],
  }),
];
