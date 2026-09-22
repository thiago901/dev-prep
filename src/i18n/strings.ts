import type { Locale } from '@/domain/types';

/**
 * UI chrome copy.
 *
 * Content is authored per language elsewhere; this is only the shell. Two
 * rules hold throughout: controls name their action, and errors name both the
 * problem and the recovery.
 */
type Entry = Record<Locale, string>;

export const STRINGS = {
  // --- shell ---------------------------------------------------------------
  'app.name': { pt: 'DevPrep', en: 'DevPrep' },
  'app.tagline': {
    pt: 'Grave sua resposta antes de ler a nossa.',
    en: 'Record your answer before you read ours.',
  },

  'nav.home': { pt: 'Início', en: 'Home' },
  'nav.library': { pt: 'Biblioteca', en: 'Library' },
  'nav.practice': { pt: 'Praticar', en: 'Practice' },
  'nav.flashcards': { pt: 'Cartões', en: 'Flashcards' },
  'nav.english': { pt: 'Inglês', en: 'English' },
  'nav.mock': { pt: 'Simulado', en: 'Mock interview' },
  'nav.progress': { pt: 'Progresso', en: 'Progress' },
  'nav.profile': { pt: 'Perfil', en: 'Profile' },
  'nav.admin': { pt: 'Conteúdo', en: 'Content' },
  'nav.skipToContent': { pt: 'Ir para o conteúdo', en: 'Skip to content' },
  'nav.more': { pt: 'Mais', en: 'More' },
  'nav.mainLabel': { pt: 'Navegação principal', en: 'Main navigation' },

  // --- generic actions -----------------------------------------------------
  'action.close': { pt: 'Fechar', en: 'Close' },
  'action.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'action.save': { pt: 'Salvar', en: 'Save' },
  'action.saved': { pt: 'Salvo', en: 'Saved' },
  'action.delete': { pt: 'Apagar', en: 'Delete' },
  'action.retry': { pt: 'Tentar de novo', en: 'Try again' },
  'action.back': { pt: 'Voltar', en: 'Back' },
  'action.next': { pt: 'Próxima', en: 'Next' },
  'action.previous': { pt: 'Anterior', en: 'Previous' },
  'action.finish': { pt: 'Concluir', en: 'Finish' },
  'action.clearFilters': { pt: 'Limpar filtros', en: 'Clear filters' },
  'action.seeAll': { pt: 'Ver tudo', en: 'See all' },
  'action.signIn': { pt: 'Entrar', en: 'Sign in' },
  'action.signOut': { pt: 'Sair', en: 'Sign out' },
  'action.continue': { pt: 'Continuar', en: 'Continue' },
  'action.start': { pt: 'Começar', en: 'Start' },

  // --- theme and language --------------------------------------------------
  'settings.theme': { pt: 'Tema', en: 'Theme' },
  'settings.theme.dark': { pt: 'Escuro', en: 'Dark' },
  'settings.theme.light': { pt: 'Claro', en: 'Light' },
  'settings.theme.toggle': {
    pt: 'Alternar entre tema claro e escuro',
    en: 'Switch between light and dark theme',
  },
  'settings.uiLanguage': { pt: 'Idioma da interface', en: 'Interface language' },
  'settings.answerLanguage': { pt: 'Idioma das respostas', en: 'Answer language' },
  'settings.answerLanguage.help': {
    pt: 'Em qual idioma mostrar a resposta modelo quando o conteúdo tem as duas.',
    en: 'Which language to show the model answer in when the content has both.',
  },

  // --- home ----------------------------------------------------------------
  'home.greeting.morning': { pt: 'Bom dia', en: 'Good morning' },
  'home.greeting.afternoon': { pt: 'Boa tarde', en: 'Good afternoon' },
  'home.greeting.evening': { pt: 'Boa noite', en: 'Good evening' },
  'home.deck.title': { pt: 'Continue de onde parou', en: 'Pick up where you left off' },
  'home.deck.emptyTitle': { pt: 'Comece por aqui', en: 'Start here' },
  'home.deck.emptyBody': {
    pt: 'Uma pergunta, uma tentativa gravada, e só depois a resposta. É assim que funciona.',
    en: 'One question, one recorded attempt, and only then the answer. That is how this works.',
  },
  'home.deck.open': { pt: 'Abrir e gravar', en: 'Open and record' },
  'home.deck.openSilent': { pt: 'Abrir', en: 'Open' },
  'home.channel2': { pt: 'Canal 2 · resposta modelo', en: 'Channel 2 · model answer' },
  'home.channel2.help': {
    pt: 'Sem sinal até você gravar a sua.',
    en: 'No signal until you record yours.',
  },
  'home.noSignal': { pt: 'Sem sinal', en: 'No signal' },
  'home.coverage': { pt: 'Respondidas', en: 'Answered' },
  'home.coverage.badge': { pt: '{seen}/{total} · {mastered} dominadas', en: '{seen}/{total} · {mastered} mastered' },
  'home.subjects': { pt: 'Assuntos', en: 'Subjects' },
  'home.monitor.title': { pt: 'Suas habilidades', en: 'Your skills' },
  'home.monitor.empty': {
    pt: 'Os níveis aparecem depois das primeiras respostas.',
    en: 'Levels appear after your first few answers.',
  },
  'home.queue.title': { pt: 'Para revisar hoje', en: 'Due for another take today' },
  'home.queue.empty': {
    pt: 'Nada vencido. O que você respondeu ainda está fresco.',
    en: 'Nothing lapsed. What you answered is still fresh.',
  },
  'home.queue.count': { pt: '{count} para revisar', en: '{count} to review' },
  'home.streak': { pt: 'Sequência', en: 'Streak' },
  'home.streak.days': { pt: '{count} dias', en: '{count} days' },
  'home.streak.day': { pt: '{count} dia', en: '{count} day' },
  'home.streak.none': { pt: 'Sem sequência ainda', en: 'No streak yet' },
  'home.spokenTime': { pt: 'Tempo falando', en: 'Time speaking' },
  'home.answered': { pt: 'Respondidas', en: 'Answered' },
  'home.mastered': { pt: 'Dominadas', en: 'Mastered' },
  'home.browse': { pt: 'Explorar por assunto', en: 'Browse by subject' },

  // --- reasons for recommendation -----------------------------------------
  'reason.due': { pt: 'Vencida para revisão', en: 'Due for review' },
  'reason.weak-skill': { pt: 'Reforça um ponto fraco', en: 'Shores up a weak spot' },
  'reason.unfinished': { pt: 'Você começou e não fechou', en: 'You started this one' },
  'reason.fresh-start': { pt: 'Boa para começar', en: 'A good place to start' },
  'reason.language': { pt: 'Prática de inglês', en: 'English practice' },

  // --- library -------------------------------------------------------------
  'library.title': { pt: 'Biblioteca', en: 'Library' },
  'library.search': { pt: 'Buscar por pergunta, tag ou stack', en: 'Search by question, tag or stack' },
  'library.searchLabel': { pt: 'Buscar conteúdo', en: 'Search content' },
  'library.filters': { pt: 'Filtros', en: 'Filters' },
  'library.filters.category': { pt: 'Categoria', en: 'Category' },
  'library.filters.stack': { pt: 'Stack', en: 'Stack' },
  'library.filters.difficulty': { pt: 'Dificuldade', en: 'Difficulty' },
  'library.filters.type': { pt: 'Formato', en: 'Format' },
  'library.filters.state': { pt: 'Situação', en: 'Status' },
  'library.filters.language': { pt: 'Idioma', en: 'Language' },
  'library.filters.favorites': { pt: 'Só favoritas', en: 'Favourites only' },
  'library.filters.traps': { pt: 'Só pegadinhas', en: 'Traps only' },
  'library.results': { pt: '{count} de {total}', en: '{count} of {total}' },
  'library.empty.title': { pt: 'Nenhum resultado', en: 'Nothing matches' },
  'library.empty.body': {
    pt: 'Nenhum conteúdo combina com esses filtros. Remova um deles para ver mais.',
    en: 'No content matches these filters. Drop one of them to see more.',
  },

  // --- content states ------------------------------------------------------
  'state.new': { pt: 'Nova', en: 'New' },
  'state.learning': { pt: 'Aprendendo', en: 'Learning' },
  'state.review': { pt: 'Em revisão', en: 'In review' },
  'state.mastered': { pt: 'Dominada', en: 'Mastered' },

  'difficulty.beginner': { pt: 'Iniciante', en: 'Beginner' },
  'difficulty.intermediate': { pt: 'Intermediário', en: 'Intermediate' },
  'difficulty.advanced': { pt: 'Avançado', en: 'Advanced' },
  'difficulty.expert': { pt: 'Especialista', en: 'Expert' },

  'content.trap': { pt: 'Pegadinha', en: 'Trap' },
  'content.trap.explain': {
    pt: 'Feita para pegar quem decorou a definição em vez de entender o comportamento.',
    en: 'Built to catch anyone who memorised the definition instead of the behaviour.',
  },
  'content.minutes': { pt: '{count} min', en: '{count} min' },
  'content.favorite.add': { pt: 'Marcar como favorita', en: 'Add to favourites' },
  'content.favorite.remove': { pt: 'Remover dos favoritos', en: 'Remove from favourites' },
  'content.notFound.title': { pt: 'Conteúdo não encontrado', en: 'Content not found' },
  'content.notFound.body': {
    pt: 'Esse item não existe mais ou o endereço está errado.',
    en: 'That item no longer exists, or the address is wrong.',
  },
  'content.onlyEnglish': {
    pt: 'Este conteúdo existe só em inglês, de propósito.',
    en: 'This content is English only, on purpose.',
  },

  // --- the attempt gate ----------------------------------------------------
  'attempt.title': { pt: 'Sua resposta', en: 'Your answer' },
  'attempt.prompt': {
    pt: 'Responda em voz alta, como responderia em uma entrevista de verdade. Depois você ouve.',
    en: 'Answer out loud, the way you would in a real interview. You will hear it back afterwards.',
  },
  'attempt.record': { pt: 'Gravar resposta', en: 'Record answer' },
  'attempt.recording': { pt: 'Gravando', en: 'Recording' },
  'attempt.paused': { pt: 'Pausado', en: 'Paused' },
  'attempt.pause': { pt: 'Pausar', en: 'Pause' },
  'attempt.resume': { pt: 'Retomar', en: 'Resume' },
  'attempt.stop': { pt: 'Parar', en: 'Stop' },
  'attempt.discard': { pt: 'Descartar', en: 'Discard' },
  'attempt.play': { pt: 'Ouvir', en: 'Play' },
  'attempt.pausePlayback': { pt: 'Pausar', en: 'Pause' },
  'attempt.again': { pt: 'Gravar de novo', en: 'Record again' },
  'attempt.keep': { pt: 'Guardar esta take', en: 'Keep this take' },
  'attempt.silent': { pt: 'Responder sem falar', en: 'Answer without speaking' },
  'attempt.silent.help': {
    pt: 'Para quando você não pode falar em voz alta. Pense a resposta inteira antes de revelar — o progresso conta igual.',
    en: 'For when you cannot speak out loud. Think the whole answer through before revealing — progress counts the same.',
  },
  'attempt.silent.confirm': { pt: 'Pensei a resposta', en: 'I have thought it through' },
  'attempt.history': { pt: 'Suas takes', en: 'Your takes' },
  'attempt.take': { pt: 'Take {number}', en: 'Take {number}' },
  'attempt.latest': { pt: 'Mais recente', en: 'Latest' },
  'attempt.star': { pt: 'Marcar como melhor take', en: 'Mark as best take' },
  'attempt.unstar': { pt: 'Desmarcar melhor take', en: 'Unmark best take' },
  'attempt.starred': { pt: 'Melhor take', en: 'Best take' },
  'attempt.delete.confirm': {
    pt: 'Apagar esta gravação? Isso não pode ser desfeito.',
    en: 'Delete this recording? This cannot be undone.',
  },
  'attempt.words': { pt: '~{count} palavras', en: '~{count} words' },
  'attempt.wordsPerMinute': { pt: '{count} palavras/min', en: '{count} words/min' },

  // --- microphone errors ---------------------------------------------------
  'mic.denied.title': { pt: 'Microfone bloqueado', en: 'Microphone blocked' },
  'mic.denied.body': {
    pt: 'O navegador negou o acesso ao microfone. Libere nas permissões do site e recarregue, ou responda sem falar.',
    en: 'The browser denied microphone access. Allow it in the site permissions and reload, or answer without speaking.',
  },
  'mic.unsupported.title': { pt: 'Gravação indisponível', en: 'Recording unavailable' },
  'mic.unsupported.body': {
    pt: 'Este navegador não permite gravar áudio. Você ainda pode responder sem falar e acompanhar o progresso normalmente.',
    en: 'This browser cannot record audio. You can still answer without speaking and track progress as normal.',
  },
  'mic.missing.title': { pt: 'Nenhum microfone encontrado', en: 'No microphone found' },
  'mic.missing.body': {
    pt: 'Conecte um microfone e tente de novo, ou responda sem falar.',
    en: 'Connect a microphone and try again, or answer without speaking.',
  },
  'mic.failed.title': { pt: 'A gravação falhou', en: 'Recording failed' },
  'mic.failed.body': {
    pt: 'Não foi possível iniciar a gravação. Verifique se outro programa está usando o microfone.',
    en: 'The recording could not start. Check whether another program is using the microphone.',
  },
  'mic.limit.title': { pt: 'Limite de tempo atingido', en: 'Time limit reached' },
  'mic.limit.body': {
    pt: 'A gravação parou em {minutes} minutos. Respostas de entrevista raramente passam disso.',
    en: 'Recording stopped at {minutes} minutes. Interview answers rarely run longer.',
  },

  // --- reveal --------------------------------------------------------------
  'reveal.locked': { pt: 'Resposta travada', en: 'Answer locked' },
  'reveal.lockedHelp': {
    pt: 'Grave sua tentativa primeiro. Ler antes de tentar é a única forma de não aprender nada aqui.',
    en: 'Record your attempt first. Reading before trying is the one way to learn nothing here.',
  },
  'reveal.action': { pt: 'Revelar resposta', en: 'Reveal answer' },
  'reveal.lockedHelpWrite': {
    pt: 'Escreva sua resposta primeiro. Ler antes de tentar é a única forma de não aprender nada aqui.',
    en: 'Write your answer first. Reading before trying is the one way to learn nothing here.',
  },
  'reveal.lockedSelect': { pt: 'Explicação travada', en: 'Explanation locked' },
  'reveal.lockedSelectHelp': {
    pt: 'Responda primeiro. A explicação aparece junto com o resultado.',
    en: 'Answer first. The explanation arrives with the result.',
  },
  'reveal.actionSelect': { pt: 'Ver explicação', en: 'See the explanation' },
  'reveal.anyway': { pt: 'Revelar sem tentar', en: 'Reveal without trying' },
  'reveal.anyway.help': {
    pt: 'Isso não conta como prática e não avança a revisão.',
    en: 'This does not count as practice and does not advance your review schedule.',
  },
  'reveal.hide': { pt: 'Esconder resposta', en: 'Hide answer' },

  // --- answer levels -------------------------------------------------------
  'answer.short': { pt: 'Resposta curta', en: 'Short answer' },
  'answer.strong': { pt: 'Resposta forte', en: 'Strong answer' },
  'answer.deep': { pt: 'Aprofundada', en: 'Deep dive' },
  'answer.seconds': { pt: '~{count}s falando', en: '~{count}s spoken' },
  'answer.levelHelp': {
    pt: 'A resposta curta é o que cabe em uma entrevista. As outras são para você saber o que existe atrás dela.',
    en: 'The short answer is what fits in an interview. The others are so you know what sits behind it.',
  },

  // --- block headings ------------------------------------------------------
  'block.expectedOutput': { pt: 'Saída esperada', en: 'Expected output' },
  'block.lookingFor': { pt: 'O que o entrevistador procura', en: 'What the interviewer is looking for' },
  'block.strongSignal': { pt: 'Sinal de resposta forte', en: 'Sign of a strong answer' },
  'block.shallowSignal': { pt: 'Sinal de resposta superficial', en: 'Sign of a shallow answer' },
  'block.mistakes': { pt: 'Erros comuns', en: 'Common mistakes' },
  'block.tradeOff': { pt: 'Trade-offs', en: 'Trade-offs' },
  'block.interviewTip': { pt: 'Dica de entrevista', en: 'Interview tip' },
  'block.warning': { pt: 'Atenção', en: 'Watch out' },
  'block.tip': { pt: 'Dica', en: 'Tip' },
  'block.followUp': { pt: 'O entrevistador pode continuar', en: 'The interviewer may follow up' },
  'block.followUp.help': {
    pt: 'Responda estas em voz alta também. É assim que a conversa realmente acontece.',
    en: 'Answer these out loud too. That is how the conversation actually goes.',
  },
  'block.related': { pt: 'Continue por aqui', en: 'Continue from here' },
  'block.compare': { pt: 'Comparação', en: 'Comparison' },
  'block.verdict': { pt: 'Na prática', en: 'In practice' },
  'block.aspect': { pt: 'Critério', en: 'Aspect' },
  'block.pros': { pt: 'A favor', en: 'For' },
  'block.cons': { pt: 'Contra', en: 'Against' },
  'block.video': { pt: 'Vídeo', en: 'Video' },
  'block.links': { pt: 'Para ler depois', en: 'To read later' },
  'block.choices.prompt': { pt: 'Escolha antes de revelar', en: 'Choose before revealing' },
  'block.choices.correct': { pt: 'Correta', en: 'Correct' },
  'block.choices.incorrect': { pt: 'Incorreta', en: 'Incorrect' },
  'block.code.copy': { pt: 'Copiar código', en: 'Copy code' },
  'block.code.copied': { pt: 'Copiado', en: 'Copied' },

  // --- confidence ----------------------------------------------------------
  'confidence.title': { pt: 'Comparado com a sua resposta', en: 'Compared with your answer' },
  'confidence.help': {
    pt: 'Isso define quando esta pergunta volta para você.',
    en: 'This decides when this question comes back to you.',
  },
  'confidence.known': { pt: 'Eu disse isso', en: 'I said that' },
  'confidence.partial': { pt: 'Disse parte', en: 'I said part of it' },
  'confidence.unknown': { pt: 'Não cheguei lá', en: 'I did not get there' },
  'confidence.saved.known': {
    pt: 'Guardado. Volta em {days} dias.',
    en: 'Noted. Back in {days} days.',
  },
  'confidence.saved.soon': { pt: 'Guardado. Volta hoje mesmo.', en: 'Noted. Back again today.' },

  // --- today's practice ---------------------------------------------------
  'nav.practice.today': { pt: 'Treino', en: 'Practice' },
  'practice.title': { pt: 'Treino de hoje', en: "Today's Practice" },
  'practice.subtitle': {
    pt: 'Uma sessão curta, montada a partir do que você precisa praticar agora. Tem começo, meio e fim.',
    en: 'A short session built from what you need to practise right now. It has a beginning, a middle and an end.',
  },
  'practice.size.5': { pt: 'Treino rápido', en: 'Quick Practice' },
  'practice.size.10': { pt: 'Treino de hoje', en: "Today's Practice" },
  'practice.size.20': { pt: 'Treino profundo', en: 'Deep Practice' },
  'practice.meta': { pt: '{count} atividades · ~{minutes} min', en: '{count} activities · ~{minutes} min' },
  'practice.start': { pt: 'Começar', en: 'Start' },
  'practice.sessions': { pt: 'Sessões', en: 'Sessions' },
  'practice.continue': { pt: 'Continuar', en: 'Continue' },
  'practice.dailyGoal': { pt: 'Sua meta diária', en: 'Your daily goal' },
  'practice.progress': { pt: '{done} de {total} concluídas', en: '{done} of {total} completed' },
  'practice.remaining': { pt: '~{minutes} min restantes', en: '~{minutes} min remaining' },
  'practice.next.label': { pt: 'A seguir', en: 'Up next' },
  'practice.why': { pt: 'Por que estas atividades?', en: 'Why these activities?' },
  'practice.why.review': { pt: '{count} para revisar', en: '{count} to review' },
  'practice.why.fresh': { pt: '{count} desafios novos', en: '{count} new challenges' },
  'practice.why.weak': { pt: '{count} em pontos fracos', en: '{count} on weak spots' },
  'practice.why.technical': { pt: '{count} técnicas', en: '{count} technical' },
  'practice.why.english': { pt: '{count} de inglês', en: '{count} in English' },
  'practice.why.speaking': { pt: '{count} para responder falando', en: '{count} answered out loud' },
  'practice.quick.title': { pt: 'Tem 5 minutos?', en: 'Got 5 minutes?' },
  'practice.done.title': { pt: 'Treino de hoje concluído', en: "Today's practice is done" },
  'practice.done.seeSummary': { pt: 'Ver resumo', en: 'See summary' },
  'practice.empty': {
    pt: 'Não há conteúdo suficiente para montar uma sessão com essas preferências. Remova um foco ou uma stack.',
    en: 'There is not enough content to build a session with these preferences. Drop a focus or a stack.',
  },
  'practice.prefs.title': { pt: 'Preferências do treino', en: 'Practice preferences' },
  'practice.prefs.goal': { pt: 'Meta diária (atividades)', en: 'Daily goal (activities)' },
  'practice.prefs.goalOption': { pt: '{count} atividades', en: '{count} activities' },
  'practice.prefs.focus': { pt: 'Foco', en: 'Focus' },
  'practice.prefs.focus.help': {
    pt: 'Sem foco marcado, a sessão se equilibra sozinha a partir do seu desempenho.',
    en: 'With no focus selected, the session balances itself from your results.',
  },
  'practice.prefs.difficulty': { pt: 'Dificuldade', en: 'Difficulty' },
  'practice.prefs.stacks': { pt: 'Stacks preferidas', en: 'Preferred stacks' },
  'focus.technical': { pt: 'Técnico', en: 'Technical' },
  'focus.english': { pt: 'Inglês', en: 'English' },
  'focus.behavioral': { pt: 'Comportamental', en: 'Behavioural' },
  'focus.architecture': { pt: 'Arquitetura', en: 'Architecture' },
  'focus.security': { pt: 'Segurança', en: 'Security' },
  'focus.code-reading': { pt: 'Leitura de código', en: 'Code reading' },
  'pdiff.mixed': { pt: 'Misto', en: 'Mixed' },
  'pdiff.comfortable': { pt: 'Confortável', en: 'Comfortable' },
  'pdiff.challenging': { pt: 'Desafiador', en: 'Challenging' },
  'pdiff.hard': { pt: 'Difícil', en: 'Hard' },
  'practice.reason.review': { pt: 'Revisão vencida', en: 'Due for review' },
  'practice.reason.missed': { pt: 'Você errou da última vez', en: 'Missed last time' },
  'practice.reason.weak-skill': { pt: 'Ponto fraco', en: 'Weak spot' },
  'practice.reason.focus': { pt: 'Seu foco', en: 'Your focus' },
  'practice.reason.new': { pt: 'Nova para você', en: 'New to you' },
  'practice.reason.english': { pt: 'Inglês falado', en: 'Spoken English' },
  'practice.exit': { pt: 'Sair do treino', en: 'Leave practice' },
  'practice.exit.saved': { pt: 'O progresso fica salvo.', en: 'Your progress is saved.' },
  'practice.next': { pt: 'Próxima atividade', en: 'Next activity' },
  'practice.skip': { pt: 'Pular esta', en: 'Skip this one' },
  'practice.finish': { pt: 'Concluir treino', en: 'Finish practice' },
  'practice.end': { pt: 'Encerrar agora', en: 'End now' },
  'practice.itemDone': { pt: 'Atividade registrada', en: 'Activity recorded' },
  'practice.gradeToContinue': {
    pt: 'Revele a resposta e diga o quanto você sabia para seguir.',
    en: 'Reveal the answer and say how much you knew to move on.',
  },
  'practice.complete.title': { pt: 'Treino concluído', en: 'Practice complete' },
  'practice.complete.ended': { pt: 'Treino encerrado', en: 'Practice ended' },
  'practice.summary.completed': { pt: 'Concluídas', en: 'Completed' },
  'practice.summary.time': { pt: 'Tempo aproximado', en: 'Approximate time' },
  'practice.summary.knew': { pt: 'Sabia', en: 'Knew it' },
  'practice.summary.recordings': { pt: 'Gravações', en: 'Recordings' },
  'practice.summary.session': { pt: 'Nesta sessão', en: 'In this session' },
  'practice.summary.categories': { pt: 'Assuntos praticados', en: 'Subjects practised' },
  'practice.summary.needsReview': { pt: 'Precisa revisar', en: 'Needs review' },
  'practice.summary.needsReview.none': {
    pt: 'Nada ficou para trás nesta sessão.',
    en: 'Nothing was left behind in this session.',
  },
  'kind.speaking': { pt: 'Atividades faladas', en: 'Speaking activities' },
  'kind.technical': { pt: 'Desafios técnicos', en: 'Technical challenges' },
  'kind.code-reading': { pt: 'Leitura de código', en: 'Code reading' },
  'kind.architecture': { pt: 'Arquitetura', en: 'Architecture' },
  'kind.security': { pt: 'Segurança', en: 'Security' },
  'kind.behavioral': { pt: 'Comportamentais', en: 'Behavioural' },
  'kind.english': { pt: 'Inglês', en: 'English' },
  'kind.review': { pt: 'Revisões', en: 'Reviews' },
  'practice.rec.title': { pt: 'Recomendado a seguir', en: 'Recommended next' },
  'practice.rec.struggled': {
    pt: 'Você teve dificuldade com “{title}”. Revise {count} desafios relacionados amanhã.',
    en: 'You struggled with “{title}”. Review {count} related challenges tomorrow.',
  },
  'practice.rec.english': {
    pt: 'Sua resposta em inglês teve {percent}% da duração habitual. Tente outro desafio de fala em inglês.',
    en: 'Your English answer ran to {percent}% of your usual length. Try another English speaking challenge.',
  },
  'practice.rec.push': {
    pt: 'Tudo o que você avaliou saiu como sabido. Suba a dificuldade nas preferências.',
    en: 'Everything you graded landed. Raise the difficulty in your preferences.',
  },
  'practice.rec.none': {
    pt: 'Ainda não há dados suficientes para recomendar algo específico. Depois de mais algumas sessões, esta parte passa a dizer algo útil.',
    en: 'There is not enough data yet to recommend anything specific. After a few more sessions, this part starts saying something useful.',
  },
  'practice.backHome': { pt: 'Voltar ao início', en: 'Back to home' },
  'practice.seeProgress': { pt: 'Ver progresso', en: 'See progress' },
  'confidence.easy': { pt: 'Fácil demais', en: 'Too easy' },

  // --- flashcards ----------------------------------------------------------
  'flashcards.title': { pt: 'Cartões', en: 'Flashcards' },
  'flashcards.subtitle': {
    pt: 'Rápido e sem gravar. Pense a resposta, revele, e diga o quanto você sabia.',
    en: 'Fast, no recording. Think the answer, reveal, and say how much you knew.',
  },
  'flashcards.show': { pt: 'Mostrar resposta', en: 'Show answer' },
  'flashcards.progress': { pt: '{current} de {total}', en: '{current} of {total}' },
  'flashcards.done.title': { pt: 'Sessão concluída', en: 'Session complete' },
  'flashcards.done.body': {
    pt: 'Você passou por {count} cartões. As que você não soube voltam primeiro.',
    en: 'You went through {count} cards. The ones you did not know come back first.',
  },
  'flashcards.empty.title': { pt: 'Nada na fila', en: 'Nothing queued' },
  'flashcards.empty.body': {
    pt: 'Você não tem cartões vencidos. Escolha um assunto na biblioteca para começar um novo.',
    en: 'You have no cards due. Pick a subject in the library to start a new one.',
  },

  // --- english practice ----------------------------------------------------
  'english.title': { pt: 'Inglês de entrevista', en: 'Interview English' },
  'english.subtitle': {
    pt: 'Perguntas em inglês para responder falando. O objetivo não é vocabulário, é não travar.',
    en: 'Questions in English, answered out loud. The goal is not vocabulary, it is not freezing.',
  },
  'english.metrics.title': { pt: 'Sua última take', en: 'Your last take' },
  'english.metrics.duration': { pt: 'Duração', en: 'Duration' },
  'english.metrics.words': { pt: 'Palavras (estimado)', en: 'Words (estimated)' },
  'english.metrics.pace': { pt: 'Ritmo', en: 'Pace' },
  'english.metrics.pace.slow': { pt: 'Pausado', en: 'Measured' },
  'english.metrics.pace.natural': { pt: 'Natural', en: 'Natural' },
  'english.metrics.pace.fast': { pt: 'Acelerado', en: 'Rushed' },
  'english.metrics.pauses': { pt: 'Pausas longas', en: 'Long pauses' },
  'english.metrics.estimateNote': {
    pt: 'Contagem estimada a partir do áudio, neste dispositivo. Nada é enviado para nenhum servidor.',
    en: 'Estimated from the audio, on this device. Nothing is sent to any server.',
  },
  'english.ai.title': { pt: 'Avaliação automática', en: 'Automatic evaluation' },
  'english.ai.body': {
    pt: 'Clareza, estrutura, vocabulário e naturalidade avaliados por IA. Ainda não disponível.',
    en: 'Clarity, structure, vocabulary and naturalness assessed by AI. Not available yet.',
  },

  // --- mock interview ------------------------------------------------------
  'mock.title': { pt: 'Simulado', en: 'Mock interview' },
  'mock.subtitle': {
    pt: 'Perguntas seguidas, sem ver nenhuma resposta até o fim. É a parte mais desconfortável e a mais útil.',
    en: 'Questions back to back, with no answers until the end. The most uncomfortable part and the most useful.',
  },
  'mock.start': { pt: 'Começar simulado', en: 'Start mock interview' },
  'mock.question': { pt: 'Pergunta {current} de {total}', en: 'Question {current} of {total}' },
  'mock.skip': { pt: 'Pular esta', en: 'Skip this one' },
  'mock.nextQuestion': { pt: 'Próxima pergunta', en: 'Next question' },
  'mock.finish': { pt: 'Encerrar e ver o debrief', en: 'Finish and see the debrief' },
  'mock.abandon': { pt: 'Encerrar simulado', en: 'End mock interview' },
  'mock.abandon.confirm': {
    pt: 'Encerrar agora? As respostas gravadas até aqui continuam salvas.',
    en: 'End it now? The takes you have recorded stay saved.',
  },
  'mock.noAnswers': {
    pt: 'As respostas ficam travadas até o fim. É esse o ponto.',
    en: 'Answers stay locked until the end. That is the point.',
  },
  'mock.summary.title': { pt: 'Debrief', en: 'Debrief' },
  'mock.summary.answered': { pt: 'Respondidas', en: 'Answered' },
  'mock.summary.skipped': { pt: 'Puladas', en: 'Skipped' },
  'mock.summary.averageTime': { pt: 'Tempo médio', en: 'Average time' },
  'mock.summary.totalTime': { pt: 'Tempo total', en: 'Total time' },
  'mock.summary.review': { pt: 'Vale revisar', en: 'Worth reviewing' },
  'mock.summary.reviewHelp': {
    pt: 'Puladas, ou respondidas rápido demais para a pergunta.',
    en: 'Skipped, or answered faster than the question deserved.',
  },
  'mock.summary.takes': { pt: 'Ouvir suas takes', en: 'Listen to your takes' },
  'mock.summary.noneAnswered': {
    pt: 'Você não gravou nenhuma resposta nesta rodada.',
    en: 'You did not record any answers in this round.',
  },

  // --- progress ------------------------------------------------------------
  'progress.title': { pt: 'Progresso', en: 'Progress' },
  'progress.skills': { pt: 'Habilidades', en: 'Skills' },
  'progress.weakest': { pt: 'Onde você está mais fraco', en: 'Where you are weakest' },
  'progress.strongest': { pt: 'Onde você está mais forte', en: 'Where you are strongest' },
  'progress.needsEvidence': {
    pt: 'Responda pelo menos duas perguntas de uma habilidade para ela aparecer aqui.',
    en: 'Answer at least two questions in a skill for it to appear here.',
  },
  'progress.byCategory': { pt: 'Por assunto', en: 'By subject' },
  'progress.empty.title': { pt: 'Nada medido ainda', en: 'Nothing measured yet' },
  'progress.empty.body': {
    pt: 'As métricas aqui vêm das suas respostas, não das perguntas que você abriu. Responda a primeira para começar.',
    en: 'The numbers here come from your answers, not from the questions you opened. Answer your first one to start.',
  },
  'progress.storage': { pt: 'Gravações neste dispositivo', en: 'Recordings on this device' },
  'progress.storage.used': { pt: '{count} takes · {size}', en: '{count} takes · {size}' },

  // --- profile -------------------------------------------------------------
  'profile.title': { pt: 'Perfil', en: 'Profile' },
  'profile.name': { pt: 'Nome', en: 'Name' },
  'profile.namePlaceholder': { pt: 'Como podemos te chamar', en: 'What we should call you' },
  'profile.targetRole': { pt: 'Vaga que você busca', en: 'Role you are aiming for' },
  'profile.level': { pt: 'Nível', en: 'Level' },
  'profile.stacks': { pt: 'Suas stacks', en: 'Your stacks' },
  'profile.interviewLocales': { pt: 'Idiomas de entrevista', en: 'Interview languages' },
  'profile.goal': { pt: 'Seu objetivo', en: 'Your goal' },
  'profile.goalPlaceholder': {
    pt: 'Ex.: vagas backend na Europa, entrevistando em março',
    en: 'e.g. backend roles in the EU, interviewing in March',
  },
  'profile.goalHelp': {
    pt: 'Uma linha para você mesmo. Não é enviado para lugar nenhum.',
    en: 'One line for yourself. It is not sent anywhere.',
  },
  'profile.dangerZone': { pt: 'Apagar meus dados', en: 'Delete my data' },
  'profile.dangerZone.body': {
    pt: 'Remove progresso, tentativas e gravações deste dispositivo. Não dá para desfazer.',
    en: 'Removes progress, attempts and recordings from this device. There is no undo.',
  },
  'profile.dangerZone.confirm': {
    pt: 'Apagar tudo? Suas gravações e todo o progresso serão perdidos.',
    en: 'Delete everything? Your recordings and all progress will be lost.',
  },

  'role.backend': { pt: 'Backend', en: 'Backend' },
  'role.frontend': { pt: 'Frontend', en: 'Frontend' },
  'role.fullstack': { pt: 'Fullstack', en: 'Fullstack' },
  'role.software-engineer': { pt: 'Software Engineer', en: 'Software Engineer' },
  'role.tech-lead': { pt: 'Tech Lead', en: 'Tech Lead' },

  'level.mid': { pt: 'Pleno', en: 'Mid' },
  'level.senior': { pt: 'Sênior', en: 'Senior' },
  'level.staff': { pt: 'Staff', en: 'Staff' },

  // --- auth ----------------------------------------------------------------
  'auth.title': { pt: 'Entrar no DevPrep', en: 'Sign in to DevPrep' },
  'auth.subtitle': {
    pt: 'Para sincronizar progresso e gravações entre dispositivos.',
    en: 'To sync your progress and recordings across devices.',
  },
  'auth.google': { pt: 'Continuar com Google', en: 'Continue with Google' },
  'auth.email': { pt: 'Email', en: 'Email' },
  'auth.password': { pt: 'Senha', en: 'Password' },
  'auth.signUp': { pt: 'Criar conta', en: 'Create account' },
  'auth.haveAccount': { pt: 'Já tenho conta', en: 'I already have an account' },
  'auth.noAccount': { pt: 'Criar uma conta', en: 'Create an account' },
  'auth.guestNotice': {
    pt: 'Você está usando sem conta. Tudo funciona, mas fica só neste dispositivo.',
    en: 'You are using this without an account. Everything works, but it stays on this device.',
  },
  'auth.guestContinue': { pt: 'Continuar sem conta', en: 'Continue without an account' },
  'auth.unavailable.title': { pt: 'Contas ainda não configuradas', en: 'Accounts not configured yet' },
  'auth.unavailable.body': {
    pt: 'Este build não tem credenciais do Firebase, então o login está desligado. Seu progresso é salvo neste dispositivo e continua funcionando normalmente.',
    en: 'This build has no Firebase credentials, so sign-in is switched off. Your progress is saved on this device and everything keeps working.',
  },
  'auth.error.invalidCredentials': {
    pt: 'Email ou senha incorretos. Verifique e tente de novo.',
    en: 'Wrong email or password. Check them and try again.',
  },
  'auth.error.emailInUse': {
    pt: 'Já existe uma conta com este email. Entre em vez de criar.',
    en: 'An account with this email already exists. Sign in instead.',
  },
  'auth.error.weakPassword': {
    pt: 'A senha precisa de pelo menos 6 caracteres.',
    en: 'The password needs at least 6 characters.',
  },
  'auth.error.network': {
    pt: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
    en: 'No connection to the server. Check your internet and try again.',
  },
  'auth.error.generic': {
    pt: 'Não foi possível entrar. Tente de novo em alguns segundos.',
    en: 'Sign-in did not work. Try again in a few seconds.',
  },

  // --- admin ---------------------------------------------------------------
  'admin.title': { pt: 'Conteúdo', en: 'Content' },
  'admin.subtitle': {
    pt: 'O mesmo renderizador que exibe o conteúdo, em modo de edição.',
    en: 'The same renderer that displays content, switched into edit mode.',
  },
  'admin.readOnly': {
    pt: 'Somente leitura neste build. Publicar exige um projeto Firebase configurado e a conta marcada como administradora.',
    en: 'Read only in this build. Publishing needs a configured Firebase project and an account marked as an administrator.',
  },
  'admin.blocks': { pt: 'Blocos', en: 'Blocks' },
  'admin.preview': { pt: 'Pré-visualização', en: 'Preview' },
  'admin.export': { pt: 'Exportar JSON', en: 'Export JSON' },

  // --- the ladder: what each activity asks of you ---------------------------
  'activity.learn': { pt: 'Aprender', en: 'Learn' },
  'activity.learn.what': {
    pt: 'Leia um resumo curto do assunto. Nada é cobrado aqui.',
    en: 'Read a short briefing on the subject. Nothing is graded here.',
  },
  'activity.decision': { pt: 'Decisão', en: 'Decision' },
  'activity.decision.what': {
    pt: 'Tome uma posição: verdadeiro ou falso, faria ou não faria. Cada resposta vem explicada.',
    en: 'Take a side: true or false, would or would not. Every answer comes explained.',
  },
  'activity.multiple-choice': { pt: 'Múltipla escolha', en: 'Multiple choice' },
  'activity.multiple-choice.what': {
    pt: 'Alternativas plausíveis. Mais de uma funciona; uma é a melhor decisão.',
    en: 'Plausible options. More than one works; one is the better call.',
  },
  'activity.code-reading': { pt: 'Ler código', en: 'Code reading' },
  'activity.code-reading.what': {
    pt: 'Diga o que o código faz antes de ver a explicação.',
    en: 'Say what the code does before you see the explanation.',
  },
  'activity.find-the-bug': { pt: 'Achar o bug', en: 'Find the bug' },
  'activity.find-the-bug.what': {
    pt: 'O código roda, mas está errado. Encontre onde e por quê.',
    en: 'The code runs, and it is still wrong. Find where, and why.',
  },
  'activity.architecture': { pt: 'Arquitetura', en: 'Architecture' },
  'activity.architecture.what': {
    pt: 'Um cenário aberto para resolver em voz alta, com os trade-offs.',
    en: 'An open scenario to solve out loud, trade-offs included.',
  },
  'activity.interview': { pt: 'Pergunta de entrevista', en: 'Interview question' },
  'activity.interview.what': {
    pt: 'Uma pergunta real de entrevista. Responda como responderia na hora.',
    en: 'A real interview question. Answer it the way you would on the day.',
  },
  'activity.speaking': { pt: 'Prática falada', en: 'Speaking practice' },
  'activity.speaking.what': {
    pt: 'Fale a resposta em voz alta e depois escute a sua própria gravação.',
    en: 'Say the answer out loud, then listen back to your own take.',
  },
  'activity.written': { pt: 'Resposta escrita', en: 'Written answer' },
  'activity.written.what': {
    pt: 'Escreva sua resposta antes de comparar com a nossa.',
    en: 'Write your answer before comparing it with ours.',
  },
  'activity.challenge': { pt: 'Desafio', en: 'Challenge' },
  'activity.challenge.what': {
    pt: 'Mais difícil de propósito: junta vários conceitos numa coisa só.',
    en: 'Harder on purpose: several concepts folded into one problem.',
  },

  // The constant half of an activity chip: how you answer, in one word.
  'mode.read': { pt: 'Ler', en: 'Read' },
  'mode.select': { pt: 'Escolher', en: 'Choose' },
  'mode.write': { pt: 'Escrever', en: 'Write' },
  'mode.speak': { pt: 'Falar', en: 'Speak' },

  // --- briefing: what happens when you press start --------------------------
  'briefing.heading': { pt: 'O que vem agora', en: 'What happens next' },
  'briefing.rung': { pt: 'Nível {level} de 5', en: 'Rung {level} of 5' },
  'briefing.start': { pt: 'Começar', en: 'Start' },
  'briefing.recording': {
    pt: 'Tem gravação nesta. O microfone só liga quando você apertar.',
    en: 'This one has recording. The microphone only opens when you press it.',
  },
  'briefing.writing': {
    pt: 'Você escreve sua resposta antes de ver a nossa.',
    en: 'You write your answer before you see ours.',
  },
  'briefing.selection': {
    pt: 'Você responde escolhendo. A explicação vem junto com o resultado.',
    en: 'You answer by choosing. The explanation comes with the result.',
  },
  'briefing.reading': {
    pt: 'Só leitura. No fim você diz se ficou claro.',
    en: 'Reading only. At the end you say whether it landed.',
  },

  // --- learn activity -------------------------------------------------------
  'learn.gotIt': { pt: 'Entendi', en: 'Got it' },
  'learn.again': { pt: 'Preciso reler', en: 'Need another pass' },
  'learn.marked': { pt: 'Anotado', en: 'Noted' },
  'learn.check': { pt: 'Agora vem a checagem', en: 'The check comes next' },

  // --- quick check ----------------------------------------------------------
  'quick.yes': { pt: 'Sim', en: 'Yes' },
  'quick.no': { pt: 'Não', en: 'No' },
  'quick.right': { pt: 'Isso mesmo', en: 'That is it' },
  'quick.wrong': { pt: 'Não é isso', en: 'Not this one' },
  'quick.answerWas': { pt: 'Resposta: {answer}', en: 'Answer: {answer}' },
  'quick.progress': { pt: '{done} de {total}', en: '{done} of {total}' },
  'quick.score': { pt: '{right} de {total} certas', en: '{right} of {total} right' },

  // --- decision -------------------------------------------------------------
  'decision.agree': { pt: 'Eu faria', en: 'I would' },
  'decision.true': { pt: 'Verdadeiro', en: 'True' },
  'decision.false': { pt: 'Falso', en: 'False' },
  'decision.disagree': { pt: 'Não faria', en: 'I would not' },
  'decision.help': {
    pt: 'Arraste o card para o lado ou use os botões.',
    en: 'Drag the card either way, or use the buttons.',
  },
  'decision.yours': { pt: 'Sua decisão', en: 'Your call' },
  'decision.expected': { pt: 'Decisão esperada', en: 'Expected call' },
  'decision.match': { pt: 'Mesma decisão', en: 'Same call' },
  'decision.differ': { pt: 'Decisão diferente', en: 'Different call' },
  'decision.context': { pt: 'Quando o contrário se defende', en: 'When the other call holds' },
  'decision.tradeOff': { pt: 'O que você paga', en: 'What it costs you' },
  'decision.card': { pt: 'Card {current} de {total}', en: 'Card {current} of {total}' },

  // --- written answers ------------------------------------------------------
  'write.action': { pt: 'Escrever resposta', en: 'Write answer' },
  'write.title': { pt: 'Sua resposta', en: 'Your answer' },
  'write.placeholder': {
    pt: 'Escreva como você responderia numa entrevista.',
    en: 'Write it the way you would answer in an interview.',
  },
  'write.submit': { pt: 'Salvar resposta', en: 'Save answer' },
  'write.saved': { pt: 'Resposta salva', en: 'Answer saved' },
  'write.yours': { pt: 'O que você escreveu', en: 'What you wrote' },
  'write.thought': { pt: 'Só pensei a resposta', en: 'I just thought it through' },
  'write.count': { pt: '{count} palavras', en: '{count} words' },
  'write.rewrite': { pt: 'Reescrever', en: 'Rewrite' },

  // --- feedback after answering --------------------------------------------
  'feedback.title': { pt: 'O que isso ensina', en: 'What this teaches' },
  // The four steps an interviewer walks when judging an open answer.
  'rubric.title': { pt: 'Como esta resposta é avaliada', en: 'How this answer is judged' },
  'rubric.incorrect': { pt: 'Falta o principal', en: 'Misses the point' },
  'rubric.partial': { pt: 'Funciona, mas incompleta', en: 'Works, but incomplete' },
  'rubric.strong': { pt: 'Resposta forte', en: 'Strong answer' },
  'rubric.interviewReady': { pt: 'Pronta para entrevista', en: 'Interview-ready' },
  'sources.title': { pt: 'Fontes', en: 'Sources' },
  'feedback.expected': { pt: 'Raciocínio esperado', en: 'Expected reasoning' },
  'feedback.why': { pt: 'Por quê', en: 'Why' },
  'feedback.better': { pt: 'Resposta mais forte', en: 'A stronger answer' },
  'feedback.yourPick': { pt: 'Sua escolha', en: 'Your pick' },
  'feedback.quality.ideal': { pt: 'Decisão forte', en: 'Strong call' },
  'feedback.quality.partial': { pt: 'Parcialmente certa', en: 'Partly right' },
  'feedback.quality.incorrect': { pt: 'Tem um problema real', en: 'Has a real problem' },
  'feedback.quality.help.partial': {
    pt: 'Funciona, mas ignora algo que a entrevista vai cobrar.',
    en: 'It works, and it skips something the interview will ask about.',
  },

  // --- learn area and paths -------------------------------------------------
  'nav.learn': { pt: 'Aprender', en: 'Learn' },
  'nav.speaking': { pt: 'Falar', en: 'Speaking' },
  'learn.title': { pt: 'Aprender', en: 'Learn' },
  'learn.subtitle': {
    pt: 'Trilhas curtas que vão do conceito até conseguir responder a pergunta de entrevista.',
    en: 'Short paths that go from the concept to answering the interview question.',
  },
  'learn.continueTitle': { pt: 'Continue aprendendo', en: 'Continue learning' },
  'learn.paths': { pt: 'Trilhas', en: 'Paths' },
  'learn.explore': { pt: 'Explorar por assunto', en: 'Browse by subject' },
  'learn.exploreHelp': {
    pt: 'Todo o banco, filtrado do seu jeito.',
    en: 'The whole bank, filtered your way.',
  },
  'path.stepOf': { pt: 'Etapa {current} de {total}', en: 'Step {current} of {total}' },
  'path.stepsLegend': { pt: 'Etapas', en: 'Steps' },
  'path.steps': { pt: '{count} etapas', en: '{count} steps' },
  'path.start': { pt: 'Começar trilha', en: 'Start path' },
  'path.continue': { pt: 'Continuar trilha', en: 'Continue path' },
  'path.restart': { pt: 'Refazer trilha', en: 'Run it again' },
  'path.done': { pt: 'Trilha concluída', en: 'Path complete' },
  'path.doneBody': {
    pt: 'Você percorreu as etapas desta trilha. Ela volta na revisão quando fizer sentido.',
    en: 'You worked through every step here. It comes back for review when it should.',
  },
  'path.remaining': { pt: '~{count} min restantes', en: '~{count} min left' },
  'path.stepDone': { pt: 'Feito', en: 'Done' },
  'path.current': { pt: 'Você está aqui', en: 'You are here' },
  'path.next': { pt: 'Próxima etapa', en: 'Next step' },
  'path.prev': { pt: 'Etapa anterior', en: 'Previous step' },
  'path.finish': { pt: 'Concluir trilha', en: 'Finish path' },
  'path.exit': { pt: 'Sair da trilha', en: 'Leave path' },
  'path.exit.saved': {
    pt: 'Você pode sair: seu progresso na trilha fica salvo.',
    en: 'You can leave: your progress in the path is saved.',
  },
  'path.stepDoneNow': { pt: 'Etapa concluída', en: 'Step done' },
  'path.stepHint': {
    pt: 'Termine esta etapa, ou siga para a próxima.',
    en: 'Finish this step, or move on to the next one.',
  },
  'path.backToPath': { pt: 'Voltar à trilha', en: 'Back to the path' },
  'path.empty': {
    pt: 'Nenhuma trilha ainda. Explore a biblioteca enquanto isso.',
    en: 'No paths yet. Browse the library in the meantime.',
  },

  // --- speaking practice area ----------------------------------------------
  'speaking.title': { pt: 'Praticar falando', en: 'Speaking practice' },
  'speaking.subtitle': {
    pt: 'Aqui a resposta é falada. Grave, escute e compare com a resposta modelo.',
    en: 'Here the answer is spoken. Record it, listen back, compare with the model answer.',
  },
  'speaking.filter.technical': { pt: 'Técnicas', en: 'Technical' },
  'speaking.filter.behavioral': { pt: 'Comportamentais', en: 'Behavioral' },
  'speaking.filter.architecture': { pt: 'Arquitetura', en: 'Architecture' },
  'speaking.filter.english': { pt: 'Inglês', en: 'English' },
  'speaking.filter.hard': { pt: 'Difíceis', en: 'Difficult' },
  'speaking.filter.recent': { pt: 'Praticadas há pouco', en: 'Recently practiced' },
  'speaking.filter.review': { pt: 'Para revisar', en: 'Needs review' },
  'speaking.never': { pt: 'Nunca praticada', en: 'Never practiced' },
  'speaking.startFirst': { pt: 'Praticar a primeira', en: 'Practise the first one' },
  'speaking.attempts': { pt: '{count} tentativas', en: '{count} attempts' },
  'speaking.attempt': { pt: '{count} tentativa', en: '{count} attempt' },
  'speaking.waiting': { pt: '{count} esperando prática', en: '{count} waiting for a take' },
  'speaking.empty': {
    pt: 'Nenhuma pergunta com esses filtros. Tire um filtro para ver mais.',
    en: 'No questions with these filters. Drop one to see more.',
  },
  'speaking.englishArea': { pt: 'Prática guiada de inglês', en: 'Guided English practice' },
  'speaking.homeBody': {
    pt: 'Perguntas que valem responder em voz alta.',
    en: 'Questions worth answering out loud.',
  },

  // --- home sections --------------------------------------------------------
  'home.section.learn': { pt: 'Continue aprendendo', en: 'Continue learning' },
  'home.section.practice': { pt: 'Treino de hoje', en: "Today's practice" },
  'home.section.speaking': { pt: 'Praticar falando', en: 'Speaking practice' },
  'home.section.explore': { pt: 'Explorar', en: 'Explore' },
  'home.learn.startTitle': { pt: 'Comece uma trilha', en: 'Start a path' },
  'home.learn.startBody': {
    pt: 'Cada trilha vai do conceito até a pergunta de entrevista, em etapas curtas.',
    en: 'Each path runs from the concept to the interview question, in short steps.',
  },

  // --- loading --------------------------------------------------------------
  'loading.practice': { pt: 'Montando seu treino', en: 'Building your practice' },
  'loading.activity': { pt: 'Abrindo a atividade', en: 'Opening the activity' },
  'loading.saving': { pt: 'Salvando', en: 'Saving' },

  // --- misc ----------------------------------------------------------------
  'common.loading': { pt: 'Carregando', en: 'Loading' },
  'common.navigating': { pt: 'Abrindo', en: 'Opening' },
  'common.error.title': { pt: 'Algo quebrou aqui', en: 'Something broke here' },
  'common.error.body': {
    pt: 'Esta tela não conseguiu carregar. Recarregar costuma resolver; se não resolver, seus dados continuam salvos.',
    en: 'This screen could not load. Reloading usually fixes it; if it does not, your data is still saved.',
  },
  'common.error.reload': { pt: 'Recarregar', en: 'Reload' },
  'common.localMode': { pt: 'Modo local', en: 'Local mode' },
  'common.localMode.help': {
    pt: 'Tudo está salvo neste navegador. Configure o Firebase para sincronizar entre dispositivos.',
    en: 'Everything is saved in this browser. Configure Firebase to sync across devices.',
  },
  'common.minutes': { pt: '{count} min', en: '{count} min' },
  'common.hours': { pt: '{count} h', en: '{count} h' },
  'common.seconds': { pt: '{count} s', en: '{count} s' },
} as const satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;
