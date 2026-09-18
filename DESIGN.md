---
name: DevPrep
description: A two-channel language lab for rehearsing interview answers out loud.
colors:
  booth: "#110D0A"
  felt: "#17120E"
  chassis: "#1F1914"
  plate: "#29221C"
  rule: "#362E27"
  rule-strong: "#483F37"
  legend: "#EDE8DE"
  legend-2: "#B4ADA1"
  legend-3: "#8A847A"
  brass: "#C9913D"
  monitor: "#79A98A"
  record: "#D6483B"
  record-ink: "#E8796B"
  channel2: "#8496A6"
  booth-light: "#E8E3D9"
  felt-light: "#DED8CC"
  chassis-light: "#F4F1EA"
  plate-light: "#FFFFFF"
  rule-light: "#CFC8B9"
  rule-strong-light: "#B3AB9A"
  legend-light: "#17150F"
  legend-2-light: "#4B463C"
  legend-3-light: "#6B655A"
  brass-light: "#8A5B12"
  monitor-light: "#2C6543"
  record-light: "#A8291D"
  record-ink-light: "#8E2318"
  channel2-light: "#3C4F61"
typography:
  deck:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  prompt-lg:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.32
    letterSpacing: "-0.018em"
  prompt:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.65
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.125rem"
    letterSpacing: "0.02em"
  micro:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "0.08em"
  legend:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 118"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    fontFeature: "'tnum'"
rounded:
  hairline: "2px"
  control: "3px"
  recess: "4px"
  panel: "5px"
  lamp: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  rail: "13.5rem"
  transport: "4.5rem"
components:
  button-record:
    backgroundColor: "{colors.record}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "#14110C"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-neutral:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.legend}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-neutral-hover:
    backgroundColor: "{colors.rule}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.legend-2}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-reveal-locked:
    backgroundColor: "transparent"
    textColor: "{colors.legend-3}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  faceplate:
    backgroundColor: "{colors.chassis}"
    rounded: "{rounded.panel}"
  panel-header:
    typography: "{typography.legend}"
    textColor: "{colors.legend-3}"
    padding: "12px 16px"
  recess-well:
    backgroundColor: "{colors.felt}"
    rounded: "{rounded.recess}"
  tag:
    typography: "{typography.legend}"
    textColor: "{colors.legend-3}"
    rounded: "{rounded.control}"
    padding: "2px 6px"
  lamp:
    backgroundColor: "{colors.rule-strong}"
    rounded: "{rounded.lamp}"
    size: "8px"
  level-meter:
    backgroundColor: "{colors.felt}"
    rounded: "{rounded.recess}"
    height: "10px"
  list-row:
    backgroundColor: "{colors.chassis}"
    textColor: "{colors.legend}"
    padding: "14px 56px 14px 16px"
  list-row-hover:
    backgroundColor: "{colors.plate}"
  inline-code:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.legend}"
    rounded: "{rounded.hairline}"
  session-rail:
    backgroundColor: "{colors.felt}"
    rounded: "{rounded.recess}"
    height: "10px"
  session-rail-done:
    backgroundColor: "{colors.brass}"
  session-rail-skipped:
    backgroundColor: "{colors.rule-strong}"
  session-rail-current:
    backgroundColor: "{colors.legend-3}"
  switch-position-touch:
    typography: "{typography.legend}"
    rounded: "{rounded.hairline}"
    height: "44px"
  chip-toggle:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.legend-2}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  chip-toggle-active:
    textColor: "{colors.brass}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
---

# Design System: DevPrep

## Overview

**Creative North Star: "The Language Lab"**

DevPrep is a two-channel language lab booth, not a study dashboard. Your take goes on channel one; the model answer sits on channel two, and channel two stays inert until channel one has signal. The rule that you record before you reveal is built into the hardware, not a setting. Every surface is a piece of that equipment: machined faceplates sitting on an acoustically dead room, silkscreened legends, lamps, level meters and transport keys with real travel.

The density is Operate, not poster. Type stays measured (display tops out at 2.25rem), panels share one header baseline, and the reading field stays achromatic so colour means something wherever it shows up. Colour lives only at edges, lamps, meters and the one armed control. Dark is the default theme because people use this alone at night; the light theme is the same booth with the lights on, using the same token names.

The brief requires some things that category dashboards also show (a greeting, a study streak, counts, quick category access). They are expressed as instrument parts, never as dashboard furniture: the greeting and streak are one quiet meta line, counts are channel-strip readouts, and categories are a single-column selector list.

**Key Characteristics:**
- Brown-black booth ground with no texture; chassis panels one step lighter.
- Expanded, tracked silkscreen legends (Archivo at 118% width) as the panel headings themselves.
- One lit element per first viewport: the record key.
- Channel two is cool blue-grey, struck through and inert until unlocked.
- Depth comes from machining: a highlight along the top edge, offset shadows, and keys that press into the panel.
- Motion is mechanical and short; nothing floats.

## Colors

A warm achromatic booth with four signal colours, each with exactly one job.

### Primary
- **Record Red** (record; record-ink for text on dark grounds): used for the armed or rolling state and for genuine failures. It fills the record key, the rolling counter and error ink. It is the only lit element in a first viewport.

### Secondary
- **VU Brass** (brass): used for VU illumination, caution, and the one recommended action on a screen. It lights the "learning" lamp, the unlocked reveal key, the recommended start key on Home, Learn, a path and Speaking Practice, favourite stars, active mobile nav icons, the focus ring, the text caret and selection (at 28%). Never two brass fills in one viewport.

### Tertiary
- **Channel Two Blue-Grey** (channel2): the model-answer track, cool and desaturated. Used for the locked channel legend (struck through at 50%), lock icons, the "review" lamp and silent-attempt notes.
- **Monitor Sage** (monitor): level OK. Used for the "mastered" lamp and good-level meters only.

### Neutral
- **Booth** (booth): the page ground, with a real brown cast. The sticky header and mobile transport bar use it at 92–95% with a light blur.
- **Felt** (felt): recessed wells, panel footers, transport rows and table heads.
- **Chassis** (chassis): faceplates and list rows at rest.
- **Plate** (plate): raised neutral keys, row hover, the pressed switch position and the inline code ground.
- **Rule / Rule Strong** (rule, rule-strong): hairlines, borders, unlit meter segments, off lamps, scrollbar thumbs.
- **Legend / Legend 2 / Legend 3** (legend, legend-2, legend-3): bone silkscreen ink in three steps. Primary text, secondary text, and legends/meta.

Light theme tokens (the `-light` keys) keep the same roles under the same names at runtime: `[data-theme='light']` swaps the RGB channel variables, and plate becomes the brightest surface.

### Named Rules
**The One Lit Element Rule.** Exactly one saturated fill per first viewport, and it belongs to the single action the screen is recommending. On Home, the learning path and the practice session are ranked, and only the recommended one carries the brass key — the other drops to Neutral *and* to the smaller heading, so size and illumination always agree. Inside an activity the lit key is the one the activity needs: the record key where the answer is spoken, the submit key where it is written, the reveal key once it is unlocked. Brass, sage and blue-grey never appear as a second filled control.

**The Record Red Rule.** Record Red fills one control only: a key that arms or is rolling a take. It is not a way to start a session, a path or a screen, because a session now opens on whatever rung comes first — often a briefing with nothing to record. Red also carries genuine failure ink. Nothing else.

**The Brown Booth Rule.** The ground is brown-black (booth 17 13 10), never blue-black, and it has no grain, noise or texture. The texture was tried and deliberately removed.

**The Achromatic Reading Field Rule.** Prose, prompts and inline code use only legend inks on neutral grounds. Inline code is legend ink on plate, never tinted with an accent.

**The Off-Lamp Local Mode Rule.** Local mode is a state of the booth: an off lamp plus a legend in the header, with its explanation in the title and screen-reader text. It is never a banner or a coloured band.

**The Unlit Next Key Rule.** In the practice runner the lit element belongs to the activity on screen — the record key where the answer is spoken, the submit key where it is written, the reveal key once it is unlocked, and nothing at all on a card that only asks to be read. The footer's "Próxima atividade" / "Concluir" key is always Neutral: it sits disabled at 40% until the activity is finished, then receives focus, but it never turns red or brass.

## Typography

**Display Font:** Archivo (variable, weight 100–900, width 62–125%, self-hosted), with system-ui fallback
**Body Font:** Archivo
**Label/Mono Font:** JetBrains Mono (400–700, self-hosted), with ui-monospace fallback

**Character:** One grotesque does all the work. Its width axis turns the same face into real expanded faceplate legends rather than letter-spaced imitations. The mono face is only for code, counters, timecode and percentage readouts. It is never a "technical" costume.

### Hierarchy
- **Deck** (600, 2.25rem, 1.16, -0.025em): page titles such as Library and content titles. Limited to 68ch.
- **Prompt / Prompt Large** (500, 1.375rem, rising to 1.75rem from the sm breakpoint): the heading of the recommended section on Home, the question or statement inside an activity, and the decision card.
- **Body Large** (500, 1.0625rem, 1.65): empty and error state titles, the wordmark (600, 108% width).
- **Body** (400, 0.9375rem, 1.6): all reading text and list-row titles. The measure is 68ch (`max-w-read`).
- **Meta** (0.75rem, 1.125rem): the greeting/streak line, row descriptions, table row heads, small counters.
- **Micro** (0.6875rem, 0.08em): footnotes such as the reveal-without-trying escape.
- **Legend** (600, 0.6875rem, 118% width, 0.14em, uppercase, line-height 1): panel headings, lamp labels, tags, switch positions, table column heads.

### Named Rules
**The Legend Is the Heading Rule.** A silkscreened legend is the real heading element of its panel (set through PanelHeader or Legend). Never put an eyebrow or kicker label above a heading.

**The Tabular Readout Rule.** Counters, percentages, time and counts use tabular figures, so they never change width.

**The Truthful Estimate Rule.** Every number on a practice surface is counted, never decorative. Plan minutes are summed from per-activity estimates (0.5 min when no spoken take is required, 1.5 for system design and architecture, 1 otherwise, never below 1). Remaining minutes count only pending activities. Summary time uses real on-screen time capped at four times the estimate. "Why these activities" lists a reason only when its count is above 0 and below the session size, so no line restates the whole plan.

## Layout

The app shell is centred at up to 78rem. It has a sticky 56px header (wordmark and local-mode lamp on the left; language switch and theme key on the right). From `lg` up there is a 13.5rem left rail; below that, a fixed bottom transport bar with 4.5rem keys, safe-area padding and a "more" drawer. The main column gap is 32px, and vertical padding is 24px, or 32px from lg.

Home uses one column, which splits from `xl` into a flexible main column and a 20rem monitor-bank aside. The recommended section comes first, then the other sections in rank order, then speaking practice and the subject list; the monitor bank and the review queue sit in the aside. Panels stack with a 24px gap. Inside a panel, headers are padded 12px × 16px, bodies 20px × 16px, and footers and transport rows sit on felt at 12px × 16px. List rows are divided by rule hairlines at 60% opacity.

The spacing rhythm is 6 / 12 / 16 / 24 / 32px. Reading text never exceeds 68ch, even inside wide panels.

### Named Rules
**The No Tiles Rule.** Counts are readouts on channel strips, and categories are a single-column selector list with a tabular count on the right. The product has no stat tiles and no card grids.

**The Quiet Greeting Rule.** The greeting and streak share one meta line above the first section of Home (greeting in legend-2, then streak and total spoken time in legend-3, separated by middots). This line is never a banner or headline.

The streak carries an unlit flame icon (legend-3, beside legend-2 text). The user asked for the flame; it stays unlit so the greeting line never competes with the recommended section.

Today's Practice keeps the shell's rhythm. The practice desk and the runner use a 52rem column. On Home, the "got five minutes?" panel is removed from the grid when it is hidden, and the explicit xl row template shrinks with it, so no empty row is left. The runner is immersive: no rail and no transport bar. It has a sticky 56px booth-at-95% header (mark, session name from sm, mono counter `n / total`, reason lamp and legend, remaining minutes from md, a quiet exit key) with the session rail under it. A fixed footer with safe-area padding holds the status line, a quiet sm Skip key and the lg next key. The main column reserves 160px of bottom padding so the footer never covers content. On mobile, preference switches keep 44px positions, and the four-position difficulty switch becomes a 2×2 grid, returning to inline from sm.

## Elevation & Depth

Depth is mechanical. Faceplates sit slightly proud of the booth. They have a 5% highlight along the top edge, a tight contact shadow and a long soft drop, all scaled by a theme variable (0.55 dark, 0.16 light). Wells sit into the chassis with an inset shadow. Keys start raised and swap to an inset shadow and a 1px downward shift when pressed. There are no zero-offset glows.

### Shadow Vocabulary
- **Faceplate** (`box-shadow: 0 1px 0 rgb(var(--lab-highlight) / 0.05) inset, 0 1px 2px rgb(0 0 0 / calc(var(--lab-shadow-strength) * 0.6)), 0 10px 28px -18px rgb(0 0 0 / var(--lab-shadow-strength))`): every panel.
- **Recess** (`box-shadow: 0 2px 5px rgb(0 0 0 / calc(var(--lab-shadow-strength) * 0.5)) inset`): search fields, meters, the two-position switch.
- **Raised** (`box-shadow: 0 1px 0 rgb(var(--lab-highlight) / 0.06) inset, 0 2px 6px rgb(0 0 0 / 0.4)`): record, primary and neutral keys at rest.
- **Pressed** (`box-shadow: 0 1px 3px rgb(0 0 0 / 0.5) inset`): keys while pressed, the active switch position, the active rail item.

### Named Rules
**The Depth Not Glow Rule.** Affordance comes from travel and shadow. Pressed things sit into the panel; nothing lifts or glows on hover.

## Shapes

The corners are machined, not pillowed. Panels use 5px; wells use 4px; keys, tags, rows and the skeleton use 3px; inline code and switch positions use 2px. Only lamps and count badges are fully round. Borders are 1px rule hairlines everywhere. A dashed border means "inert": the locked channel-two panel and its locked reveal key use it. The mark is a rounded faceplate square holding two channel tracks, with the upper track mostly filled in brass and the lower one barely started in blue-grey.

## Components

### Buttons (Transport Keys)
Every button is a transport key with real mechanical travel.
- **Shape:** gently squared (3px), 1px border, medium weight.
- **Sizes:** sm is 36px high (meta text), md is 44px (body text), lg is 56px (body-large text). Record on a phone must be the easiest target.
- **Record:** a red fill with white ink. Used only for arming a take. It carries the microphone icon.
- **Record is never a start key.** Starting a session, a path or an activity is Primary (the recommended one) or Neutral with an arrow (everything else). Record appears inside an activity whose answer is spoken, and the runner focuses it on arrival (`autoFocusRecord`) only for those.
- **Primary:** a brass fill with near-black ink. Reserved for the unlocked reveal key and equivalent caution-positive actions.
- **Neutral:** a plate fill with a rule-strong border. Hover goes to the rule fill with a legend-3 border.
- **Quiet:** transparent with legend-2 ink. Hover goes to a plate fill with legend ink.
- **Danger:** transparent with record-ink and a 40% red border. Hover tints the fill red at 10%.
- **Press / Focus:** a 1px downward shift and a raised-to-pressed shadow swap, over 150ms on the engage curve. Focus is a 2px brass outline with a 2px offset. Disabled keys drop to 40% opacity.

### Channel Two Reveal (signature)
- **Locked:** a dashed panel, a blue-grey lock icon, and a legend struck through in blue-grey at 50%, with help text in legend-3. The reveal key is inert by construction: dashed rule-strong border, transparent ground, no shadow, legend-3 ink, a lock icon, full opacity.
- **Escape:** "reveal without trying" is a micro footnote link (legend-3, underlined in rule-strong) that states its cost. It is never a peer key.
- **Unlocked:** the border turns solid, the icon becomes an open brass lock, and the key becomes Primary brass.
- **Gate:** answer-phase blocks are absent from the DOM until the gate opens. They are not hidden with CSS.

### Chips (Tags)
- **Style:** legend type, a 1px border, 3px corners, 2px × 6px padding, no fill. The neutral tag uses a rule border and legend-3 ink. Tone variants use the tone's ink with a 35% border.
- **Rule:** tags are non-interactive descriptors.

### Cards / Containers (Faceplates)
- **Corner Style:** 5px.
- **Background:** chassis. Footers and transport rows are felt, and the header is separated by a rule hairline.
- **Shadow Strategy:** the faceplate shadow (see Elevation).
- **Border:** a 1px rule; dashed only when inert.
- **Callouts:** 5px, a tone border at 30% over a 6% tone wash, and a legend label in the tone ink with an icon.

### Inputs / Fields
- **Style:** a recessed well (felt, 4px, inset shadow) with a legend-3 search icon and a 44px transparent input in body type. The caret is brass, and the placeholder is legend-3 at full opacity.
- **Two-Position Switch:** a recess holding two legend-type positions. The active one is plate, legend ink and pressed; the inactive one is legend-3. It is used for PT/EN instead of a dropdown.
- **Multi-position switch:** the same recess also holds more positions (daily goal 5/10/15/20, difficulty). On touch-first screens, `optionClassName` gives each position a 44px minimum height (and 44px width for numeric positions).
- **Toggle chip:** multi-select preferences (focus, stacks). At rest it is plate with a rule-strong border and legend-2 meta text. When active it is pressed, with brass ink, a 50% brass border and a 12% brass wash. Its state is `aria-pressed`.

### Navigation
- **Six destinations, one question each:** Início (what now?), Aprender (what can I learn?), Treino (what can I practise?), Falar (what can I answer out loud?), Progresso (how am I doing?), Perfil. The library, the flashcards and the mock interview are reached from the screen they belong to, not from the rail, because they are collections rather than destinations.
- **Mobile carries four plus the drawer.** The transport strip holds Início, Aprender, Treino and Falar; everything else lives in "Mais". Five cells is what fits 390px without clipping a key.
- **Rail (lg+):** body-type items with icons. Active items are plate, legend and pressed; inactive items are legend-3, with a chassis hover. Secondary destinations sit below a rule divider.
- **Mobile transport bar:** fixed to the bottom on booth at 95% with blur, with 4.5rem keys. Icons sit above 0.625rem legend labels, and the active icon is brass. Never more than five cells.

### Lamps, Level Meters and Channel Strips
- **Lamp:** an 8px (or 10px) round lamp with an inner 30% black ring, in off/monitor/brass/record/channel2. It is always paired with a text legend. Only a rolling take pulses (1.6s).
- **State mapping:** new is off (and its label is not printed in rows), learning is brass, review is channel2, mastered is monitor.
- **Level Meter:** a recessed strip of 24 segments separated by 1px gaps. Lit segments take the tone colour, unlit ones take rule. It is used for both live input level and skill mastery.
- **Channel Strip:** a name plus a mono percentage readout (or a lamp and legend badge) over a meter. Compact mode uses meta names and an 8px meter for banks where most strips read zero.
- **Waveform / Counter:** the waveform is built from the real peak trail and falls back to a flat line, never fake data. Counters are mono and tabular, in legend, record-ink or muted ink.

### The Ladder
The product teaches in six rungs — Learn, Recognise, Decide, Apply, Explain, Speak — and every content item declares which rung it sits on and how it is answered (read, select, write, speak). That declaration drives the UI, not a label on top of it.

- **Activity chip:** the fixed identity of an activity, in the same shape everywhere (list row, briefing, card header, runner). An icon, the kind name, a hairline, and the answer mode in legend-3: "LER CÓDIGO | ESCREVER". It is inert — never a control — and it always sits *below* the heading it describes.
- **Briefing:** before an activity starts outside a session, a panel says what happens: the heading, the chip, one line naming the work, one line naming how it will be answered, the minutes, and a Primary start key. The panel header carries a labelled five-cell rung meter ("Nível 3 de 5"); the meter never appears without its legend.
- **Learn card:** read-only. No gate, no lock panel, no microphone. It ends on a footer with a Primary "Entendi" and a Neutral "Preciso reler", which is the only grading a card with no question can honestly ask for.
- **Quick check:** one statement at a time on a faceplate, two 44px keys, and an explanation on felt for every answer — right ones included. The explanation region is a live region.
- **Decision:** a recessed card that drags with the pointer and rotates with travel, side legends lighting only in the direction of travel, and two Neutral keys that do exactly the same thing. Never gesture-only. The verdict panel pairs "sua decisão" with "decisão esperada" and a match lamp, then the reasoning, the context and the trade-off.
- **Multiple choice:** options grade to ideal (monitor), partly right (brass) or a real problem (record), and the option the user picked is marked "sua escolha". A set with no partly-right option is a recall quiz, not an engineering question.
- **Written deck:** a recessed textarea on felt with a word count, a Primary submit and a quiet "só pensei a resposta" escape. After the gate opens, what the user wrote stays on screen above the model answer.
- **Gate by mode:** the locked channel-two panel appears only where there is an answer side to withhold. Selection activities get selection copy and no "reveal without trying" footnote — that escape exists for a broken microphone, and there is no such thing as a broken multiple choice.

### Today's Practice
- **Session Rail:** a 10px recessed meter with one flex cell per activity and 1px gaps. The frame never resizes, so progress reads by position. Done cells are brass, skipped cells are rule-strong, the activity on screen is legend-3, and the rest are rule. It is a `progressbar` counting done plus skipped.
- **Home sections:** Home ranks four things — continue a path, today's practice, speaking practice, explore. The recommended section is rendered first, carries the page's `h1` in prompt type and the one brass key; the others follow with a body-large `h2` and Neutral keys. Plan meta (count · minutes) is a mono meta readout in the header actions, and the session's mix is shown as activity chips before anything is pressed. "Why these activities" sits under a rule: a legend label over lamp-plus-meta counts (review brass, weak record, English channel2, others off).
- **Session composition:** a session climbs the ladder — it opens on the lowest rung present and ends no lower than it started — and no more than a fifth of it is spoken. Speaking Practice is where the microphone work lives.
- **Practice desk:** sessions are a selector list. Each row has a body-medium name, an optional brass "daily goal" lamp, a PlanMeta readout and a Neutral arrow start key. The goal row opens a felt strip with its "why" counts.
- **Runner reason lamp:** brass for review or missed, off otherwise, always with its legend.
- **Summary:** a deck `h1` with an inline mono `completed / total` in legend-2 and a meta line (time · recordings). Below it are faceplates: compact channel strips (completed brass, knew monitor), kind rows with legend-3 icons and mono counts, a brass-lamp needs-review list, and recommendation prose. It ends on a Neutral lg "back home" key and a Quiet "see progress" key. There is no "one more session".

### List Rows
- **Style:** a chassis row that hovers to plate. The body-weight title is followed by one silkscreened legend line (type · stack · level · minutes). The state lamp prints only when the state is not "new". Trap is the only separate chip (a brass tag). The favourite star sits absolutely at the right.

### States
- **Empty:** centred, with a body-large title, a legend-3 body limited to 42ch, and one recovery action.
- **Error:** a faceplate with a record-ink title and a neutral retry key.
- **Loading:** a skeleton shaped like the content (plate, 3px, pulsing). The whole-booth loader is five brass bars rolling in sequence.

## Do's and Don'ts

### Do:
- **Do** keep Record Red as the only lit fill in a first viewport; brass is for VU/caution and the unlocked reveal key.
- **Do** set panel headings as silkscreen legends through the panel header, on the shared 12px × 16px baseline.
- **Do** pair every lamp and colour state with a text label.
- **Do** make locked channel two inert by construction: dashed border, transparent ground, no shadow, legend-3 ink, lock icon, and answer blocks absent from the DOM.
- **Do** express counts as channel-strip readouts and categories as a single-column selector list.
- **Do** use JetBrains Mono with tabular figures for counters, percentages, timecode and code only.
- **Do** keep reading text achromatic and within 68ch.
- **Do** keep the runner's next key Neutral; the activity's record key is its lit element.
- **Do** compute every estimate and count from the plan or from real elapsed time, and hide a "why" reason whose count is 0 or the whole session.
- **Do** give switch positions and toggles 44px targets on touch-first screens.
- **Do** make every control a transport key with raised-to-pressed travel over 150ms on `cubic-bezier(0.22, 1, 0.36, 1)`; reduced motion makes it instant.

### Don't:
- **Don't** use a blue-black ground, or add grain or noise texture to the booth.
- **Don't** put eyebrow or kicker legends above headings.
- **Don't** render a greeting banner, stat tiles, progress rings or card grids; the greeting and streak stay one quiet meta line.
- **Don't** make "reveal without trying" a peer button; it stays a micro footnote link.
- **Don't** tint inline code or prose with an accent colour.
- **Don't** announce local mode with a band or banner; it is an off lamp with a legend.
- **Don't** use zero-offset glows or hover lift; depth is travel and inset shadow.
- **Don't** print the "new" state in list rows or add extra chips beyond trap.
- **Don't** use a Record key to start anything. Red arms a take; Primary recommends; Neutral carries you forward.
- **Don't** let the biggest heading and the lit key sit in different sections of the same screen.
- **Don't** offer a microphone for an activity whose answer is a selection, and don't show a locked answer panel where there is no answer side.
- **Don't** put an activity chip, rung meter or legend above a heading.
- **Don't** leave an answered state silent: every explanation, verdict and grade is inside a polite live region.
- **Don't** set a category, session or reason legend above a practice heading; it goes below the `h1` or in the panel header.
