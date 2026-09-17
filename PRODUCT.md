# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed by the user in the original brief (not delegated):

- React + Vite + TypeScript
- Tailwind CSS + HeroUI
- React Icons
- PWA-ready
- Firebase: Authentication, Firestore, Storage, Analytics, Remote Config

Growth paths the architecture must not block: Cloud Functions, AI answer
evaluation, cross-device sync, premium subscription, push notifications, new
content types, sandboxed code execution.

**First-version runtime (confirmed):** the user does not have a Firebase project
yet. The app must be fully usable today with no credentials, via a local
persistence adapter, with the Firebase adapter complete behind the same
interface and activated by dropping keys into `.env`.

## Users

Primary: working software developers, mid to senior level, preparing for
technical and behavioral interviews at international companies. Portuguese
speakers by default; English is a second language they read well but have not
practiced *speaking* under interview pressure.

Their situation: they know the engineering. What breaks down is saying it out
loud, in English, in twelve minutes, to a stranger who is judging them. They
study in scattered sessions, before work, late at night, on a phone during a
commute, over the weeks leading up to a real interview loop.

Their job: walk into an interview able to answer unprepared, in their own words,
without sounding rehearsed and without freezing on a question they actually
know.

## Product Purpose

DevPrep trains the act of answering, not the act of reading answers.

Every piece of content withholds its answer until the user has tried to produce
one out loud and recorded it. The recording is the point: it is the first time
most users hear what they actually sound like explaining the event loop in
English. Success is not a completed deck of cards. It is a user who answers a
real interview question better than they could last month, and who can hear the
difference in their own attempts.

## Positioning

Two things a neighboring product could not truthfully copy:

1. **Record-before-reveal is enforced at the engine level**, not offered as a
   feature. The content renderer will not show an answer until the attempt gate
   is passed, either by recording or by an explicit, logged choice to skip. This
   is the product, not a study aid bolted onto a question bank.
2. **Spoken technical English is a first-class tracked skill**, scored alongside
   Node.js or System Design, not a translation layer over Portuguese content.
   Each language carries its own authored answer, written the way a developer
   would actually speak it.

## Operating Context

- **Sessions are short and interrupted.** Users must resume exactly where they
  stopped without re-navigating.
- **Speaking out loud requires privacy.** Some sessions happen where the user
  cannot talk; the product must stay useful in a silent mode without making the
  user feel they cheated.
- **Microphone permission is a real failure surface.** Denied, unavailable, and
  browser-unsupported are normal states, not errors.
- **Mobile is a primary device, not a reduced desktop.** Recording on a phone
  must be the easiest interaction in the product.
- **Preparation is deadline-driven.** A user with an interview on Thursday needs
  to know what to study now, not a general curriculum.

## Capabilities and Constraints

**Content engine.** Content is data, never hardcoded in components. The model is
`Content -> Type -> Blocks -> Interaction -> Answer -> Evaluation`. Blocks are a
typed, extensible union; the renderer resolves blocks to components, so new
content types ship without touching screen code.

Content types at launch: Interview Question, Code Reading, Explain the Code,
Find the Bug, Debugging Challenge, Architecture Challenge, System Design,
Scenario, Behavioral, Concept, Multiple Choice, True/False, Compare,
Refactoring Challenge, Security Challenge.

Taxonomy (categories, stacks, difficulties, content types, tags) is configurable
data, not enumerated in the UI layer.

**Answer depth.** Each answerable content carries Short (~30s), Strong (1-2min),
and Deep Dive levels, plus what the interviewer is looking for, common mistakes,
interview tips, trade-offs, and follow-up questions.

**Attempts and recordings.** Recordings belong to a content item, kept as an
ordered attempt history with duration and date, playable and comparable. Free
tier caps stored recordings; premium raises the cap.

**Review system.** States: New, Learning, Review, Mastered, driven by
self-reported confidence and interval scheduling. Progress is measured per
skill, not only as a count of completed items.

**Languages.** Portuguese and English at launch, each with independently authored
content. Architecture must accept Spanish, French and others without a schema
change. **UI chrome is bilingual with a user-facing toggle** (confirmed).

**Content level (confirmed).** Mid/senior. Scenario-driven and trade-off-driven
questions that assume production experience. Definition-recall questions are out
of scope.

**Monetization.** Free tier with discreet ads and limits; premium removes ads and
raises limits. Ads are structurally forbidden from the recording flow, the
question surface, and anything between a user and an answer. Architecture should
accept AdMob, AdSense and a subscription service later.

**Security.** Firestore and Storage rules must actually enforce ownership.
Hiding UI is not access control. User-submitted code must never execute in the
frontend or in an unisolated backend.

**Undecided, must not be invented:** pricing, premium price point, launch date,
company or legal entity, any user numbers or testimonials.

## Brand Commitments

- Name: **DevPrep** (confirmed).
- Dark mode is the primary experience; light mode is a supported option.
- The product must read as "built by developers, for developers": credible to a
  senior engineer, never a generic corporate dashboard or a course-seller
  landing page.
- Voice: direct, professional, peer-level. No hype, no motivational filler, no
  gamified congratulation. It talks the way a good senior colleague gives
  interview feedback.
- No existing logo, typeface or palette. Identity is to be created.

## Evidence on Hand

- The user's brief supplies real seed questions for Technical, Code Reading and
  Behavioral tracks; those are the factual content starting point.
- **No real users, metrics, testimonials, company names or press exist.** No
  screen may display social proof, user counts or endorsements.
- No media assets (images, diagrams, video) are supplied. Video and diagram
  blocks must degrade honestly when a content item has none, rather than
  showing placeholder media that implies content exists.

## Product Principles

1. **The attempt comes before the answer.** Any flow that lets a user read the
   answer first has failed, however convenient it is.
2. **Content is data; the app is an engine.** If shipping a new content format
   requires editing a screen, the architecture is wrong.
3. **Measure capability, not consumption.** Report what the user can now explain
   and what they still cannot. Never optimize for finishing cards.
4. **Each language is authored, never translated.** An English answer must sound
   like a developer speaking, not like Portuguese converted to English.
5. **Nothing may stand between the user and their answer.** Ads, upsells and
   interstitials are structurally excluded from the study surface.

## Accessibility & Inclusion

- Full keyboard operation, including the record-then-reveal flow.
- Visible focus, adequate contrast, real labels and ARIA on custom controls.
- `prefers-reduced-motion` honored.
- Touch targets sized for one-handed phone use during recording.
- The product must remain fully usable by someone who cannot or will not speak
  aloud in a given session. Silence is a context, not an edge case, and both
  paths preserve progress tracking.
