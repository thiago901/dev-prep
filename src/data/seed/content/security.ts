import type { Content } from '@/domain/types';
import {
  answers,
  choices,
  code,
  compare,
  content,
  explain,
  followUps,
  list,
  lookingFor,
  prompt,
  setupText,
  t,
  tip,
  warn,
} from '../authoring';

/** Authentication, authorization, tokens, and the holes that pass code review. */
export const SECURITY_CONTENT: Content[] = [
  content({
    slug: 'sec-auth-vs-authz',
    type: 'interview-question',
    title: t('Autenticação e autorização', 'Authentication and authorization'),
    categoryId: 'security',
    stackIds: ['rest'],
    skillIds: ['security'],
    difficulty: 'intermediate',
    tags: ['authentication', 'authorization', 'rbac', 'idor'],
    minutes: 4,
    related: ['api-secure-rest', 'sec-idor', 'sec-rbac-abac'],
    blocks: [
      prompt(
        t(
          'Qual a diferença entre autenticação e autorização? Dê um exemplo de sistema que acerta uma e erra a outra.',
          'What is the difference between authentication and authorization? Give an example of a system that gets one right and the other wrong.',
        ),
      ),
      answers({
        short: t(
          'Autenticação responde "quem é você" e acontece uma vez, no login. Autorização responde "o que você pode fazer" e precisa acontecer em toda operação. O erro clássico é ter autenticação impecável — senha forte, MFA, token assinado — e autorização que só verifica se o token é válido, sem verificar se aquele usuário específico pode acessar aquele recurso específico. Aí basta trocar o id na URL para ler o pedido de outra pessoa.',
          'Authentication answers "who are you" and happens once, at login. Authorization answers "what may you do" and has to happen on every operation. The classic failure is impeccable authentication — strong passwords, MFA, signed tokens — with authorization that only checks the token is valid, never whether that specific user may access that specific resource. Then changing the id in the URL is enough to read someone else\'s order.',
        ),
        strong: t(
          'Autenticação estabelece identidade. Autorização decide permissão. Elas acontecem em momentos diferentes e falham de formas diferentes.\n\nA autenticação acontece uma vez e produz uma credencial. A autorização precisa acontecer em toda requisição, e para cada recurso tocado.\n\n**O exemplo que eu daria** é o mais comum em API real. O sistema tem login com MFA, token assinado, expiração curta — autenticação exemplar. E o endpoint faz:\n\n```\napp.get("/orders/:id", authenticate, async (req, res) => {\n  const order = await orders.findById(req.params.id);\n  res.json(order);\n});\n```\n\nO middleware confirma que existe um usuário válido. Ninguém confirma que aquele pedido pertence a ele. Qualquer usuário autenticado lê o pedido de qualquer outro trocando o id. Isso é IDOR, e é consistentemente a vulnerabilidade mais encontrada em API.\n\nA correção é a autorização entrar na consulta, não depois dela:\n\n```\nconst order = await orders.findByIdForUser(req.params.id, req.user.id);\nif (!order) return res.status(404).end();\n```\n\nBuscar já filtrando pelo dono, e responder 404 em vez de 403 para não confirmar que o recurso existe.\n\n**Outra forma de errar**, na direção oposta: autorização correta no backend e autenticação fraca — sessão que não expira, token sem rotação, reset de senha sem rate limit. Aí as permissões estão certas, mas a identidade é fácil de roubar.\n\nA regra que eu levo para code review: toda consulta que retorna dado de usuário precisa ter o dono na cláusula de filtro. Se a autorização estiver em um `if` depois do fetch, ela vai ser esquecida em algum endpoint, porque é fácil esquecer um `if` e difícil esquecer um parâmetro obrigatório.',
          'Authentication establishes identity. Authorization decides permission. They happen at different moments and fail in different ways.\n\nAuthentication happens once and produces a credential. Authorization has to happen on every request, for every resource touched.\n\n**The example I would give** is the most common one in real APIs. The system has login with MFA, a signed token, short expiry — exemplary authentication. And the endpoint does:\n\n```\napp.get("/orders/:id", authenticate, async (req, res) => {\n  const order = await orders.findById(req.params.id);\n  res.json(order);\n});\n```\n\nThe middleware confirms there is a valid user. Nobody confirms that order belongs to them. Any authenticated user reads any other user\'s order by changing the id. That is IDOR, and it is consistently the most-found vulnerability in APIs.\n\nThe fix is authorization entering the query rather than following it:\n\n```\nconst order = await orders.findByIdForUser(req.params.id, req.user.id);\nif (!order) return res.status(404).end();\n```\n\nFetch already filtered by owner, and answer 404 rather than 403 so as not to confirm the resource exists.\n\n**The other way to get it wrong**, in the opposite direction: correct authorization with weak authentication — a session that never expires, tokens without rotation, password reset without rate limiting. Then the permissions are right but the identity is easy to steal.\n\nThe rule I take into code review: every query returning user data must have the owner in the filter clause. If authorization lives in an `if` after the fetch, it will be forgotten on some endpoint, because forgetting an `if` is easy and forgetting a required parameter is hard.',
        ),
      }),
      lookingFor(
        list(
          [
            'Distinguir claramente os dois conceitos',
            'Saber que autorização é por requisição e por recurso',
            'Dar IDOR como exemplo concreto',
            'Propor filtrar por dono na consulta, não depois',
            'Saber quando 404 é preferível a 403',
          ],
          [
            'Clearly distinguishing the two concepts',
            'Knowing authorization is per request and per resource',
            'Giving IDOR as a concrete example',
            'Proposing to filter by owner in the query rather than after',
            'Knowing when 404 is preferable to 403',
          ],
        ),
        {
          shallow: t(
            'Uma resposta superficial define os dois termos corretamente e não consegue dar um exemplo de falha real.',
            'A shallow answer defines both terms correctly and cannot produce an example of a real failure.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você testaria se a autorização está correta em toda a API?',
            'Quando responder 404 em vez de 403?',
            'Como você modelaria permissões que dependem do recurso?',
          ],
          [
            'How would you test that authorization is correct across the whole API?',
            'When would you answer 404 instead of 403?',
            'How would you model permissions that depend on the resource?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-idor',
    type: 'security',
    title: t('Encontre a vulnerabilidade', 'Find the vulnerability'),
    categoryId: 'security',
    stackIds: ['nodejs', 'rest'],
    skillIds: ['security', 'api-design'],
    difficulty: 'advanced',
    tags: ['idor', 'authorization', 'mass-assignment', 'vulnerability'],
    minutes: 5,
    related: ['sec-auth-vs-authz', 'api-secure-rest'],
    blocks: [
      setupText(
        t(
          'Este endpoint passou em code review e está em produção.',
          'This endpoint passed code review and is in production.',
        ),
      ),
      prompt(
        t(
          'Quantas vulnerabilidades você encontra? Explique o impacto de cada uma.',
          'How many vulnerabilities can you find? Explain the impact of each.',
        ),
      ),
      code(
        'typescript',
        `
app.patch("/api/users/:id", authenticate, async (req, res) => {
  const user = await db.users.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await db.users.update(req.params.id, req.body);

  const updated = await db.users.findById(req.params.id);
  return res.json(updated);
});
`,
      ),
      answers({
        short: t(
          'Três, e todas graves. Primeira: não há verificação de que `req.params.id` é o próprio usuário — qualquer pessoa autenticada edita qualquer conta. Segunda: `req.body` vai direto para o update, então dá para enviar `{"role": "admin"}` e se promover; isso é mass assignment. Terceira: a resposta devolve o objeto inteiro do banco, que provavelmente inclui hash de senha, token de reset e email. As correções são: checar propriedade, usar uma allowlist de campos, e serializar a resposta explicitamente.',
          'Three, and all serious. First: nothing checks that `req.params.id` is the user themselves — any authenticated person edits any account. Second: `req.body` goes straight into the update, so you can send `{"role": "admin"}` and promote yourself; that is mass assignment. Third: the response returns the whole database object, which probably includes the password hash, reset token and email. The fixes are: check ownership, use a field allowlist, and serialise the response explicitly.',
        ),
        strong: t(
          'Vou por ordem de gravidade.\n\n**1. IDOR — autorização ausente.** O `authenticate` confirma que existe um usuário logado. Nada confirma que ele é o dono de `:id`. Qualquer usuário autenticado edita qualquer conta iterando ids. Impacto: alteração de dados de qualquer pessoa, incluindo email — e trocar o email de alguém para o seu geralmente permite tomar a conta pelo fluxo de recuperação de senha. Isso é escalada para tomada de conta completa.\n\nCorreção: comparar com o usuário autenticado, ou melhor, ignorar o parâmetro da URL quando a operação é sobre si mesmo.\n\n**2. Mass assignment.** `req.body` é passado inteiro para o update. O cliente controla quais colunas são escritas. Enviar `{"role": "admin"}` ou `{"emailVerified": true}` ou `{"credits": 999999}` funciona, dependendo do schema. Impacto: escalada de privilégio.\n\nCorreção: extrair explicitamente os campos permitidos, ou validar com um schema que rejeita chaves desconhecidas. Allowlist, nunca denylist — denylist esquece o campo que alguém adicionar no ano que vem.\n\n**3. Exposição excessiva de dados.** A resposta é o registro do banco sem filtro. Em praticamente todo schema de usuário isso inclui hash de senha, e frequentemente token de reset, segredo de MFA, e dados pessoais. Impacto: vazamento de credencial em uma resposta legítima de API.\n\nCorreção: um serializador explícito que lista o que sai. Nunca devolver a entidade direto.\n\n**Uma quarta coisa** que eu levantaria no review: não há registro de auditoria. Alteração de dados sensíveis, especialmente email e permissões, precisa deixar rastro de quem mudou o quê e quando.\n\nE uma observação de processo: esse código passou em review, o que sugere que o time não tem checklist de segurança. As três falhas são de categorias conhecidas e aparecem em qualquer lista de vulnerabilidades comuns de API. Um lint de segurança e um teste que tente editar recurso alheio pegariam as duas primeiras automaticamente.',
          'I will go in order of severity.\n\n**1. IDOR — missing authorization.** The `authenticate` middleware confirms someone is logged in. Nothing confirms they own `:id`. Any authenticated user edits any account by iterating ids. Impact: modifying anyone\'s data, including their email — and changing someone\'s email to yours usually lets you take the account over through password recovery. That escalates to full account takeover.\n\nFix: compare against the authenticated user, or better, ignore the URL parameter entirely when the operation is about yourself.\n\n**2. Mass assignment.** `req.body` is passed wholesale into the update. The client controls which columns get written. Sending `{"role": "admin"}` or `{"emailVerified": true}` or `{"credits": 999999}` works, depending on the schema. Impact: privilege escalation.\n\nFix: extract the permitted fields explicitly, or validate with a schema that rejects unknown keys. Allowlist, never denylist — a denylist forgets the field someone adds next year.\n\n**3. Excessive data exposure.** The response is the raw database record. In practically every user schema that includes the password hash, and often the reset token, the MFA secret, and personal data. Impact: credential leakage in a legitimate API response.\n\nFix: an explicit serialiser listing what goes out. Never return the entity directly.\n\n**A fourth thing** I would raise in review: there is no audit trail. Changes to sensitive data, especially email and permissions, need a record of who changed what and when.\n\nAnd a process observation: this code passed review, which suggests the team has no security checklist. All three failures are known categories and appear on any list of common API vulnerabilities. A security lint and a test that tries editing someone else\'s resource would catch the first two automatically.',
        ),
      }),
      code(
        'typescript',
        `
app.patch("/api/users/:id", authenticate, async (req, res) => {
  // 1. Authorization: the URL cannot decide whose account this is.
  if (req.params.id !== req.user.id) {
    return res.status(404).end(); // 404, not 403: do not confirm it exists
  }

  // 2. Allowlist: the client never decides which columns get written.
  const patch = updateProfileSchema.parse(req.body); // rejects unknown keys

  await db.users.update(req.user.id, patch);
  await audit.record("user.profile_updated", req.user.id, Object.keys(patch));

  // 3. Explicit serialisation: the entity never leaves the boundary raw.
  const updated = await db.users.findById(req.user.id);
  return res.json(toPublicProfile(updated));
});
`,
        { phase: 'answer', caption: t('As três correções', 'The three fixes') },
      ),
      lookingFor(
        list(
          [
            'Encontrar as três, não só a primeira',
            'Explicar o impacto, não só nomear a falha',
            'Perceber que trocar email leva a tomada de conta',
            'Propor allowlist em vez de denylist',
            'Lembrar de auditoria',
          ],
          [
            'Finding all three, not just the first',
            'Explaining the impact rather than only naming the flaw',
            'Noticing that changing an email leads to account takeover',
            'Proposing an allowlist rather than a denylist',
            'Remembering the audit trail',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte encadeia o impacto: IDOR permite trocar email, trocar email permite recuperar a senha, recuperar a senha entrega a conta.',
            'A strong answer chains the impact: IDOR lets you change the email, changing the email lets you reset the password, resetting the password hands over the account.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você impediria mass assignment no projeto inteiro?',
            'Que teste automatizado pegaria o IDOR?',
            'O que exatamente você registraria na auditoria?',
          ],
          [
            'How would you prevent mass assignment across the whole project?',
            'What automated test would catch the IDOR?',
            'What exactly would you record in the audit log?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-jwt-storage',
    type: 'interview-question',
    title: t('Onde guardar o token no frontend', 'Where to store the token in the frontend'),
    categoryId: 'security',
    stackIds: ['react', 'rest'],
    skillIds: ['security'],
    difficulty: 'advanced',
    tags: ['jwt', 'xss', 'csrf', 'cookies', 'tokens'],
    minutes: 5,
    related: ['api-secure-rest', 'sec-jwt-revoke', 'sec-xss-csrf'],
    blocks: [
      prompt(
        t(
          'Onde você guardaria o access token no frontend: localStorage ou cookie? Defenda a escolha.',
          'Where would you store the access token in the frontend: localStorage or a cookie? Defend your choice.',
        ),
      ),
      answers({
        short: t(
          'Cookie `httpOnly`, `secure`, `SameSite`. O motivo é simples: em localStorage o token é acessível por JavaScript, então qualquer XSS — inclusive vindo de uma dependência comprometida — entrega a sessão inteira. Com `httpOnly`, o script não alcança o token. O custo é que cookie é enviado automaticamente, o que reabre CSRF, e isso eu resolvo com `SameSite` e token anti-CSRF nas operações que mudam estado. Não existe opção sem custo; existe a que eu consigo defender.',
          'An `httpOnly`, `secure`, `SameSite` cookie. The reason is simple: in localStorage the token is reachable by JavaScript, so any XSS — including one from a compromised dependency — hands over the whole session. With `httpOnly`, script cannot reach the token. The cost is that cookies are sent automatically, which reopens CSRF, and I handle that with `SameSite` plus an anti-CSRF token on state-changing operations. There is no cost-free option; there is the one I can defend.',
        ),
        strong: t(
          'Eu escolho cookie `httpOnly`, e o raciocínio é sobre qual ataque é mais provável e qual é mais devastador.\n\n**localStorage** é conveniente e o token fica acessível ao JavaScript da página. Isso significa que qualquer execução de script no seu domínio lê o token. E XSS não vem só de código seu: vem de dependência transitiva comprometida, de tag de analytics, de conteúdo gerado por usuário mal escapado. A superfície é grande e você não controla toda ela.\n\nO agravante é o impacto. Com XSS e token em localStorage, o atacante exfiltra o token e usa a sessão de onde quiser, pelo tempo de vida do token. Com `httpOnly`, o XSS ainda é grave — ele pode fazer requisições como o usuário enquanto a página está aberta — mas ele não consegue levar a credencial embora. A diferença entre "fez estrago enquanto a aba estava aberta" e "tem a sua sessão no servidor dele" é grande.\n\n**O custo do cookie é CSRF.** Como o navegador anexa automaticamente, um site malicioso pode induzir a requisição. As defesas:\n\n`SameSite=Lax` já bloqueia a maior parte, porque impede o envio em requisições cross-site que não sejam navegação de topo. `Strict` bloqueia mais, mas quebra fluxo de link externo que leva para área logada.\n\nToken anti-CSRF nas operações que mudam estado, no padrão de double submit ou sincronizado com a sessão.\n\nE checar `Origin` no servidor para requisições que mudam estado, que é barato e eficaz.\n\n**O que eu faço na prática:** refresh token em cookie `httpOnly` com caminho restrito ao endpoint de refresh, e access token de vida curta mantido apenas em memória no cliente — nem localStorage nem cookie. Se a aba recarrega, o cliente chama o refresh e obtém outro. Assim o access token nunca é persistido em lugar nenhum, e o refresh token nunca é alcançável por script.\n\nO custo dessa escolha é uma chamada extra no carregamento da página, o que eu acho um preço baixo.',
          'I choose an `httpOnly` cookie, and the reasoning is about which attack is more likely and which is more devastating.\n\n**localStorage** is convenient and leaves the token reachable by page JavaScript. That means any script execution on your domain reads the token. And XSS does not only come from your code: it comes from a compromised transitive dependency, an analytics tag, badly escaped user-generated content. The surface is large and you do not control all of it.\n\nThe aggravating part is impact. With XSS and a token in localStorage, the attacker exfiltrates it and uses the session from anywhere, for the token\'s lifetime. With `httpOnly`, XSS is still serious — it can make requests as the user while the page is open — but it cannot carry the credential away. The difference between "did damage while the tab was open" and "has your session on their machine" is large.\n\n**The cost of a cookie is CSRF.** Since the browser attaches it automatically, a malicious site can induce the request. The defences:\n\n`SameSite=Lax` already blocks most of it, because it prevents sending on cross-site requests that are not top-level navigations. `Strict` blocks more but breaks external links into authenticated areas.\n\nAn anti-CSRF token on state-changing operations, double-submit or synchronised with the session.\n\nAnd checking `Origin` server-side on state-changing requests, which is cheap and effective.\n\n**What I do in practice:** the refresh token in an `httpOnly` cookie scoped to the refresh endpoint only, and a short-lived access token kept in memory on the client — neither localStorage nor a cookie. If the tab reloads, the client calls refresh and gets another. That way the access token is never persisted anywhere, and the refresh token is never reachable by script.\n\nThe cost of that choice is one extra call on page load, which I think is a low price.',
        ),
      }),
      compare(
        t('localStorage', 'localStorage'),
        t('Cookie httpOnly', 'httpOnly cookie'),
        [
          {
            aspect: t('Exposto a XSS', 'Exposed to XSS'),
            left: t('Sim — token pode ser exfiltrado', 'Yes — the token can be exfiltrated'),
            right: t('Não — script não alcança', 'No — script cannot reach it'),
          },
          {
            aspect: t('Exposto a CSRF', 'Exposed to CSRF'),
            left: t('Não — envio é manual', 'No — sending is manual'),
            right: t('Sim — mitigado por SameSite e token anti-CSRF', 'Yes — mitigated by SameSite and an anti-CSRF token'),
          },
          {
            aspect: t('Pior caso', 'Worst case'),
            left: t('Sessão roubada e usada remotamente', 'Session stolen and used remotely'),
            right: t('Ações feitas enquanto a aba está aberta', 'Actions taken while the tab is open'),
          },
        ],
        t(
          'Os dois têm risco. A diferença é se o atacante leva a credencial embora.',
          'Both carry risk. The difference is whether the attacker walks away with the credential.',
        ),
      ),
      tip(
        t(
          'Essa pergunta testa se você raciocina sobre trade-off ou se decorou uma regra. Responder "cookie, porque é mais seguro" é fraco. Responder nomeando o ataque que cada opção abre é forte.',
          'This question tests whether you reason about trade-offs or memorised a rule. Answering "cookie, because it is safer" is weak. Answering by naming the attack each option opens is strong.',
        ),
      ),
      followUps(
        list(
          [
            'Como o token anti-CSRF funciona no padrão double submit?',
            'Qual a diferença prática entre SameSite Lax e Strict?',
            'Como você lidaria com múltiplas abas e refresh concorrente?',
          ],
          [
            'How does the anti-CSRF token work in the double-submit pattern?',
            'What is the practical difference between SameSite Lax and Strict?',
            'How would you handle multiple tabs refreshing concurrently?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-jwt-revoke',
    type: 'interview-question',
    title: t('Como revogar um JWT', 'How to revoke a JWT'),
    categoryId: 'security',
    stackIds: ['redis', 'rest'],
    skillIds: ['security', 'architecture'],
    difficulty: 'advanced',
    tags: ['jwt', 'revocation', 'sessions', 'tokens'],
    minutes: 5,
    related: ['sec-jwt-storage', 'api-secure-rest'],
    blocks: [
      setupText(
        t(
          'Um usuário clicou em "sair de todos os dispositivos". Você usa JWT sem estado no servidor.',
          'A user clicked "sign out of all devices". You use stateless JWTs on the server.',
        ),
      ),
      prompt(t('Como você faz isso funcionar?', 'How do you make that work?')),
      answers({
        short: t(
          'Não dá para revogar um JWT de verdade — ele é válido até expirar, porque a validação é só a verificação da assinatura e não consulta nada. Então ou eu aceito a janela e uso access token de vida muito curta, tipo cinco minutos, com refresh token que eu consigo invalidar no servidor; ou eu mantenho uma lista de revogação consultada a cada requisição, o que devolve estado ao servidor e anula boa parte da vantagem do JWT. Na prática eu faço o primeiro: o refresh token é a sessão real e é armazenado; o access token é curto o suficiente para a janela ser aceitável.',
          'You cannot genuinely revoke a JWT — it is valid until it expires, because validation is just a signature check and consults nothing. So either I accept the window and use a very short-lived access token, say five minutes, with a refresh token I can invalidate server-side; or I keep a revocation list consulted on every request, which puts state back on the server and cancels most of the JWT advantage. In practice I do the first: the refresh token is the real session and is stored; the access token is short enough that the window is acceptable.',
        ),
        strong: t(
          'Eu começo pelo desconforto: a pergunta expõe uma contradição real no uso de JWT. A propriedade que torna o JWT atraente — validar sem consultar nada — é exatamente a que impede revogação.\n\n**Três abordagens, com custos diferentes:**\n\n**Vida curta mais refresh com estado.** É o que eu uso. O access token vale cinco a quinze minutos e é verificado só pela assinatura. O refresh token é opaco, armazenado no servidor, e é a sessão de verdade. "Sair de todos os dispositivos" apaga os refresh tokens daquele usuário. Os access tokens em circulação continuam válidos até expirar, então existe uma janela — mas ela é de minutos e é um risco que eu consigo explicar para o time de segurança.\n\n**Lista de revogação.** Manter em Redis os jtis revogados, com TTL igual ao tempo restante do token, e consultar a cada requisição. Funciona e a janela fecha. O custo é honesto: agora toda requisição consulta um estado compartilhado, que é exatamente o que o JWT queria evitar. Se você vai fazer isso, vale perguntar por que não usar sessão opaca direto.\n\n**Versão de token no usuário.** Guardar um contador no registro do usuário e colocá-lo dentro do token. Invalidar tudo é incrementar. Continua exigindo leitura do usuário a cada requisição, mas é uma leitura que muitas aplicações já fazem de qualquer forma para carregar permissões.\n\n**O que eu decido na prática:** para a maioria dos sistemas, a resposta honesta é que sessão opaca com armazenamento no servidor é mais simples e melhor, e o JWT foi escolhido por hábito. JWT faz sentido de verdade quando a validação precisa acontecer sem acesso ao armazenamento de sessão — entre serviços diferentes, ou na borda.\n\nE tem um caso que não pode ter janela nenhuma: conta comprometida. Para isso eu combino a lista de revogação, mesmo aceitando o custo, porque cinco minutos de acesso com a conta comprometida é inaceitável.\n\n**O detalhe que eu sempre implemento:** rotação de refresh token com detecção de reuso. Cada refresh emite um novo e invalida o anterior. Se o anterior for usado outra vez, isso significa que alguém tem uma cópia, e eu invalido a família toda. É a defesa mais eficaz contra roubo de refresh token.',
          'I start with the discomfort: this question exposes a real contradiction in how JWTs get used. The property that makes a JWT attractive — validating without consulting anything — is exactly the one that prevents revocation.\n\n**Three approaches, with different costs:**\n\n**Short life plus stateful refresh.** This is what I use. The access token lasts five to fifteen minutes and is verified by signature alone. The refresh token is opaque, stored server-side, and is the real session. "Sign out everywhere" deletes that user\'s refresh tokens. Access tokens already in circulation stay valid until they expire, so there is a window — but it is minutes long and it is a risk I can explain to the security team.\n\n**A revocation list.** Keep revoked jtis in Redis, with a TTL equal to the token\'s remaining life, and check on every request. It works and the window closes. The cost is honest: now every request consults shared state, which is precisely what the JWT was trying to avoid. If you are going to do that, it is worth asking why not use an opaque session instead.\n\n**A token version on the user.** Store a counter on the user record and put it inside the token. Invalidating everything is incrementing it. It still requires reading the user on every request, but that is a read many applications already do to load permissions.\n\n**What I decide in practice:** for most systems, the honest answer is that an opaque session with server-side storage is simpler and better, and the JWT was chosen out of habit. JWTs genuinely make sense when validation has to happen without access to session storage — across different services, or at the edge.\n\nAnd there is one case that can have no window at all: a compromised account. For that I add the revocation list, accepting the cost, because five minutes of access on a compromised account is unacceptable.\n\n**The detail I always implement:** refresh token rotation with reuse detection. Each refresh issues a new one and invalidates the previous. If the previous one gets used again, that means somebody has a copy, and I invalidate the entire family. It is the most effective defence against refresh token theft.',
        ),
      }),
      lookingFor(
        list(
          [
            'Reconhecer que JWT não é revogável por design',
            'Nomear a janela e dimensioná-la',
            'Saber que lista de revogação anula a vantagem do JWT',
            'Questionar se JWT era a escolha certa',
            'Mencionar rotação de refresh com detecção de reuso',
          ],
          [
            'Recognising a JWT is not revocable by design',
            'Naming the window and sizing it',
            'Knowing a revocation list cancels the JWT advantage',
            'Questioning whether a JWT was the right choice',
            'Mentioning refresh rotation with reuse detection',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte admite que para muitos sistemas a sessão opaca é melhor, em vez de defender o JWT por reflexo.',
            'A strong answer admits an opaque session is better for many systems, rather than defending the JWT by reflex.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como funciona a detecção de reuso de refresh token?',
            'Quando JWT é realmente a escolha certa?',
            'Como você trataria uma conta comprometida?',
          ],
          [
            'How does refresh token reuse detection work?',
            'When is a JWT genuinely the right choice?',
            'How would you handle a compromised account?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-sql-injection-orm',
    type: 'find-the-bug',
    title: t('ORM não te protege sozinho', 'An ORM does not protect you by itself'),
    categoryId: 'security',
    stackIds: ['postgres', 'nodejs'],
    skillIds: ['security', 'databases'],
    difficulty: 'intermediate',
    tags: ['sql-injection', 'orm', 'validation'],
    minutes: 4,
    related: ['sec-idor', 'api-secure-rest'],
    blocks: [
      setupText(
        t(
          'O time usa um ORM e assume que está protegido contra SQL injection.',
          'The team uses an ORM and assumes they are protected against SQL injection.',
        ),
      ),
      prompt(t('Onde está o problema?', 'Where is the problem?')),
      code(
        'typescript',
        `
const sortBy = req.query.sortBy ?? "created_at";
const direction = req.query.direction ?? "desc";

const users = await db.query(
  \`select id, name, email from users
   where organization_id = $1
   order by \${sortBy} \${direction}
   limit 50\`,
  [organizationId],
);
`,
        { highlightLines: [6] },
      ),
      answers({
        short: t(
          'O `organization_id` está parametrizado corretamente, mas `sortBy` e `direction` são interpolados direto na string. Identificador não pode ser parâmetro em SQL — só valor pode — então o ORM não tem como proteger. Um atacante manda `sortBy` com um subselect e extrai qualquer coisa do banco. A correção é uma allowlist: mapear o valor recebido para um nome de coluna conhecido e rejeitar qualquer outro.',
          'The `organization_id` is parameterised correctly, but `sortBy` and `direction` are interpolated straight into the string. An identifier cannot be a parameter in SQL — only values can — so the ORM has no way to protect you. An attacker sends a `sortBy` containing a subselect and extracts anything from the database. The fix is an allowlist: map the incoming value to a known column name and reject anything else.',
        ),
        strong: t(
          'A falsa sensação de segurança vem de uma confusão sobre o que a parametrização faz.\n\nUm placeholder como `$1` protege **valores**. O banco recebe a query e os valores separadamente, e o valor nunca é interpretado como SQL. Mas nome de coluna, nome de tabela e direção de ordenação são **identificadores** e fazem parte da estrutura da query — não existe placeholder para eles em nenhum banco. Então qualquer parte dinâmica da estrutura é interpolação de string, com todos os riscos disso.\n\nAqui, `sortBy` vem direto de `req.query`. Um atacante pode mandar algo como:\n\n```\n?sortBy=(select case when (select substring(password_hash,1,1) from users limit 1)=\'a\' then id else name end)\n```\n\nE extrair o hash de senha caractere por caractere observando a ordem dos resultados. É injection cega por ordenação, e funciona mesmo sem mensagem de erro.\n\n**A correção é allowlist estrita:**\n\n```\nconst SORTABLE = { created_at: "created_at", name: "name", email: "email" } as const;\nconst column = SORTABLE[req.query.sortBy as keyof typeof SORTABLE] ?? "created_at";\nconst direction = req.query.direction === "asc" ? "ASC" : "DESC";\n```\n\nRepare que eu não sanitizo a entrada: eu a uso como chave de um mapa. Qualquer coisa fora do mapa vira o padrão. Isso é mais seguro que escapar, porque não depende de eu prever todas as formas de ataque.\n\n**Os outros lugares onde ORM não protege**, que eu checaria no mesmo review: raw query com template string, cláusula `IN` montada por concatenação, e nome de tabela dinâmico em código multi-tenant.\n\nE eu adicionaria uma defesa em profundidade: o usuário do banco que a aplicação usa não precisa de permissão para ler tabelas que a aplicação não usa, nem para escrever em tabelas de auditoria. Privilégio mínimo limita o estrago quando a primeira defesa falha.',
          'The false sense of security comes from a confusion about what parameterisation does.\n\nA placeholder like `$1` protects **values**. The database receives the query and the values separately, and the value is never interpreted as SQL. But column names, table names and sort direction are **identifiers** and part of the query\'s structure — no database has a placeholder for those. So any dynamic part of the structure is string interpolation, with every risk that implies.\n\nHere, `sortBy` comes straight from `req.query`. An attacker can send something like:\n\n```\n?sortBy=(select case when (select substring(password_hash,1,1) from users limit 1)=\'a\' then id else name end)\n```\n\nand extract the password hash character by character by watching the result ordering. That is blind injection through ORDER BY, and it works even with no error messages.\n\n**The fix is a strict allowlist:**\n\n```\nconst SORTABLE = { created_at: "created_at", name: "name", email: "email" } as const;\nconst column = SORTABLE[req.query.sortBy as keyof typeof SORTABLE] ?? "created_at";\nconst direction = req.query.direction === "asc" ? "ASC" : "DESC";\n```\n\nNote that I do not sanitise the input: I use it as a key into a map. Anything outside the map becomes the default. That is safer than escaping, because it does not depend on me anticipating every attack shape.\n\n**The other places an ORM does not protect you**, which I would check in the same review: raw queries built with template strings, an `IN` clause assembled by concatenation, and dynamic table names in multi-tenant code.\n\nAnd I would add defence in depth: the database user the application connects as does not need permission to read tables the application never uses, nor to write to audit tables. Least privilege bounds the damage when the first defence fails.',
        ),
      }),
      lookingFor(
        list(
          [
            'Saber que placeholder protege valor e não identificador',
            'Reconhecer que ORM não cobre esse caso',
            'Propor allowlist por mapeamento, não sanitização',
            'Conhecer injection cega por ordenação',
            'Mencionar privilégio mínimo como defesa em profundidade',
          ],
          [
            'Knowing placeholders protect values, not identifiers',
            'Recognising the ORM does not cover this case',
            'Proposing an allowlist by mapping rather than sanitisation',
            'Knowing about blind injection through ORDER BY',
            'Mentioning least privilege as defence in depth',
          ],
        ),
      ),
      warn(
        t(
          'Nenhum banco aceita placeholder para nome de coluna ou de tabela. Se a estrutura da query é dinâmica, a proteção tem que ser allowlist.',
          'No database accepts a placeholder for a column or table name. If the query structure is dynamic, the protection has to be an allowlist.',
        ),
      ),
      followUps(
        list(
          [
            'Como você montaria uma cláusula IN com segurança?',
            'Que permissões o usuário do banco da aplicação deveria ter?',
            'Como você detectaria tentativa de injection em produção?',
          ],
          [
            'How would you build an IN clause safely?',
            'What permissions should the application database user have?',
            'How would you detect injection attempts in production?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-xss-csrf',
    type: 'compare',
    title: t('XSS e CSRF são problemas diferentes', 'XSS and CSRF are different problems'),
    categoryId: 'security',
    stackIds: ['react'],
    skillIds: ['security'],
    difficulty: 'intermediate',
    tags: ['xss', 'csrf', 'frontend', 'browser'],
    minutes: 4,
    related: ['sec-jwt-storage', 'api-secure-rest'],
    blocks: [
      prompt(
        t(
          'Qual a diferença entre XSS e CSRF, e como você se defende de cada um?',
          'What is the difference between XSS and CSRF, and how do you defend against each?',
        ),
      ),
      answers({
        short: t(
          'XSS é executar código malicioso dentro do seu site — o atacante abusa da confiança que o usuário tem no seu domínio. CSRF é induzir o navegador do usuário a fazer uma requisição para o seu site a partir de outro — o atacante abusa da confiança que o seu servidor tem no navegador do usuário. Contra XSS: escapar saída, Content Security Policy, e nunca montar HTML com dado de usuário. Contra CSRF: `SameSite` nos cookies, token anti-CSRF nas operações que mudam estado, e checar `Origin`.',
          'XSS is executing malicious code inside your site — the attacker abuses the trust the user has in your domain. CSRF is inducing the user\'s browser to make a request to your site from another one — the attacker abuses the trust your server has in the user\'s browser. Against XSS: escape output, a Content Security Policy, and never build HTML from user data. Against CSRF: `SameSite` cookies, an anti-CSRF token on state-changing operations, and checking `Origin`.',
        ),
        strong: t(
          'A forma mais clara de separar é pela direção da confiança.\n\n**XSS abusa da confiança do usuário no seu site.** O atacante consegue executar JavaScript no seu domínio. A partir daí ele é o seu site: lê o DOM, faz requisições autenticadas, altera a interface, captura o que for digitado. É a falha mais grave do frontend, porque ela derrota praticamente todas as outras defesas do lado do cliente.\n\nDefesas, em camadas:\n\nEscapar por padrão. React já escapa o que é interpolado em JSX, e é por isso que XSS em React geralmente vem de `dangerouslySetInnerHTML`, de `href` com `javascript:`, ou de uma biblioteca que injeta HTML.\n\nContent Security Policy. Restringe de onde script pode ser carregado e bloqueia inline. É a defesa que continua funcionando quando alguém erra no escape, e é a que menos gente configura.\n\nSanitizar quando HTML do usuário é requisito de produto, com uma biblioteca madura, nunca com regex.\n\nAtributos de cookie: `httpOnly` não previne XSS, mas limita o que ele consegue levar.\n\n**CSRF abusa da confiança do seu servidor no navegador.** O usuário está logado no seu site; outro site faz o navegador dele enviar uma requisição, e o navegador anexa os cookies automaticamente. O atacante não lê a resposta — ele só quer o efeito colateral.\n\nDefesas:\n\n`SameSite=Lax` como padrão, que já elimina a maior parte dos vetores.\n\nToken anti-CSRF em operações que mudam estado. O atacante não consegue lê-lo por causa da política de mesma origem.\n\nVerificar `Origin` ou `Referer` no servidor.\n\nE não usar GET para operação que muda estado — GET é o vetor mais fácil de explorar.\n\n**A relação entre os dois** que eu sempre menciono: se você tem XSS, nenhuma defesa de CSRF importa, porque o script está na sua origem e consegue ler o token anti-CSRF. XSS é estritamente mais grave, e a prioridade deve refletir isso.',
          'The clearest way to separate them is by the direction of trust.\n\n**XSS abuses the user\'s trust in your site.** The attacker manages to execute JavaScript on your domain. From there they are your site: they read the DOM, make authenticated requests, alter the interface, capture keystrokes. It is the most severe frontend flaw, because it defeats practically every other client-side defence.\n\nDefences, in layers:\n\nEscape by default. React escapes what is interpolated into JSX, which is why XSS in React usually comes from `dangerouslySetInnerHTML`, from an `href` with `javascript:`, or from a library that injects HTML.\n\nA Content Security Policy. It restricts where scripts can load from and blocks inline script. It is the defence that keeps working when someone gets escaping wrong, and the one fewest people configure.\n\nSanitising when user HTML is a product requirement, with a mature library, never with a regex.\n\nCookie attributes: `httpOnly` does not prevent XSS, but it bounds what XSS can carry away.\n\n**CSRF abuses your server\'s trust in the browser.** The user is logged into your site; another site makes their browser send a request, and the browser attaches the cookies automatically. The attacker does not read the response — they just want the side effect.\n\nDefences:\n\n`SameSite=Lax` as the default, which already removes most vectors.\n\nAn anti-CSRF token on state-changing operations. The attacker cannot read it because of the same-origin policy.\n\nChecking `Origin` or `Referer` server-side.\n\nAnd not using GET for state-changing operations — GET is the easiest vector to exploit.\n\n**The relationship between the two** that I always mention: if you have XSS, no CSRF defence matters, because the script is on your origin and can read the anti-CSRF token. XSS is strictly more severe, and priorities should reflect that.',
        ),
      }),
      compare(
        t('XSS', 'XSS'),
        t('CSRF', 'CSRF'),
        [
          {
            aspect: t('Confiança abusada', 'Trust abused'),
            left: t('Do usuário no seu site', 'The user\'s trust in your site'),
            right: t('Do seu servidor no navegador', 'Your server\'s trust in the browser'),
          },
          {
            aspect: t('Atacante lê a resposta?', 'Does the attacker read the response?'),
            left: t('Sim, está na sua origem', 'Yes, it runs on your origin'),
            right: t('Não, só provoca o efeito', 'No, it only triggers the effect'),
          },
          {
            aspect: t('Defesa principal', 'Main defence'),
            left: t('Escape por padrão e CSP', 'Escaping by default and CSP'),
            right: t('SameSite e token anti-CSRF', 'SameSite and an anti-CSRF token'),
          },
        ],
        t(
          'Com XSS presente, as defesas de CSRF deixam de valer. Priorize XSS.',
          'With XSS present, CSRF defences stop mattering. Prioritise XSS.',
        ),
      ),
      followUps(
        list(
          [
            'Como você configuraria uma CSP para um app React?',
            'De onde vem XSS em React, já que ele escapa por padrão?',
            'Por que GET não deve mudar estado?',
          ],
          [
            'How would you configure a CSP for a React app?',
            'Where does XSS come from in React, given it escapes by default?',
            'Why should GET never change state?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-rbac-abac',
    type: 'architecture',
    title: t('Modelar permissões que vão crescer', 'Modelling permissions that will grow'),
    categoryId: 'security',
    skillIds: ['security', 'architecture'],
    difficulty: 'advanced',
    tags: ['rbac', 'abac', 'permissions', 'authorization'],
    minutes: 5,
    related: ['sec-auth-vs-authz', 'sec-idor'],
    blocks: [
      setupText(
        t(
          'O produto começou com dois papéis: admin e usuário. Agora o cliente quer que um gerente veja só os pedidos da própria filial, e que o financeiro veja valores mas não dados pessoais.',
          'The product started with two roles: admin and user. Now the customer wants a manager to see only their branch\'s orders, and finance to see amounts but not personal data.',
        ),
      ),
      prompt(
        t('Como você modelaria isso?', 'How would you model that?')),
      answers({
        short: t(
          'O pedido do cliente já saiu do que RBAC puro resolve. Papel responde "o que este tipo de usuário pode fazer"; a pergunta agora é "sobre quais registros" e "quais campos", que dependem de atributos do usuário e do recurso. Eu manteria papéis para agrupar permissões, e adicionaria uma camada de escopo — o gerente tem papel de gerente com escopo da filial X — resolvida no filtro da consulta. Filtragem de campo eu trataria na serialização, por papel.',
          'What the customer is asking for has already outgrown pure RBAC. A role answers "what can this kind of user do"; the question now is "over which records" and "which fields", which depend on attributes of the user and the resource. I would keep roles to group permissions, and add a scope layer — the manager has the manager role scoped to branch X — resolved in the query filter. Field filtering I would handle in serialisation, per role.',
        ),
        strong: t(
          'Eu separaria três perguntas que costumam ser tratadas como uma.\n\n**Que ações este usuário pode realizar?** É RBAC clássico, e funciona bem. Papel agrupa permissões, usuário tem papéis. `orders.read`, `orders.refund`, `users.manage`.\n\n**Sobre quais registros?** É aqui que papel sozinho não resolve. "Gerente vê pedidos da própria filial" não é uma permissão, é um escopo. Eu modelaria como atribuição de papel com escopo: o usuário tem o papel `manager` no contexto `branch:42`. E o ponto crucial é que isso precisa virar cláusula de filtro na consulta, não um `if` depois de buscar — senão volta a ser IDOR esperando acontecer.\n\n**Quais campos?** Financeiro vê valor mas não CPF. Isso é filtragem de campo e vive na camada de serialização, definida por papel. Eu não deixaria isso espalhado pelos controllers: um serializador por papel, ou um mapa de campos permitidos.\n\n**O desenho que eu proporia:**\n\nPermissões como strings estáveis. Papéis como conjuntos de permissões, configuráveis em dados e não em código — porque cliente novo sempre quer um papel novo, e isso não pode exigir deploy.\n\nAtribuição de papel com escopo opcional: `(user, role, scopeType, scopeId)`.\n\nUm ponto único de decisão. Uma função `can(user, action, resource)` e uma função que devolve o filtro de escopo para consultas de listagem. Duas funções, uma para item e outra para coleção, porque a segunda precisa entrar no SQL.\n\nAuditoria de mudança de papel, sempre.\n\n**O que eu evitaria:** pular direto para ABAC completo com motor de políticas. É poderoso e é genuinamente difícil de raciocinar, testar e depurar — quando alguém pergunta "por que este usuário não consegue ver isto", você precisa conseguir responder. RBAC com escopo cobre a grande maioria dos pedidos reais e continua explicável.\n\nEu iria para políticas de verdade só quando as regras dependerem de atributos dinâmicos combinados — horário, valor da transação, estado do recurso — e aí com uma ferramenta que permita testar as políticas.\n\n**E eu perguntaria uma coisa ao produto antes de implementar:** essas permissões são por cliente, ou iguais para todos? Se cada cliente configura o próprio conjunto de papéis, isso muda o desenho por completo e é melhor descobrir agora.',
          'I would separate three questions that tend to get treated as one.\n\n**What actions may this user perform?** That is classic RBAC, and it works well. A role groups permissions, a user has roles. `orders.read`, `orders.refund`, `users.manage`.\n\n**Over which records?** This is where roles alone stop working. "A manager sees their branch\'s orders" is not a permission, it is a scope. I would model it as a scoped role assignment: the user holds the `manager` role in the context `branch:42`. And the crucial part is that this has to become a filter clause in the query, not an `if` after fetching — otherwise it is IDOR waiting to happen again.\n\n**Which fields?** Finance sees the amount but not the tax id. That is field filtering and it lives in the serialisation layer, defined per role. I would not let that scatter through controllers: one serialiser per role, or a map of permitted fields.\n\n**The design I would propose:**\n\nPermissions as stable strings. Roles as sets of permissions, configurable as data rather than code — because a new customer always wants a new role, and that cannot require a deploy.\n\nRole assignment with an optional scope: `(user, role, scopeType, scopeId)`.\n\nA single decision point. A `can(user, action, resource)` function and a function returning the scope filter for list queries. Two functions, one for items and one for collections, because the second has to reach the SQL.\n\nAuditing on every role change, always.\n\n**What I would avoid:** jumping straight to full ABAC with a policy engine. It is powerful and genuinely hard to reason about, test and debug — when someone asks "why can this user not see this", you need to be able to answer. RBAC with scopes covers the large majority of real requests and stays explainable.\n\nI would move to real policies only when rules depend on combined dynamic attributes — time of day, transaction amount, resource state — and then with a tool that lets you test the policies.\n\n**And I would ask product one thing before implementing:** are these permissions per customer, or the same for everyone? If each customer configures their own set of roles, that changes the design completely and it is better to find out now.',
        ),
      }),
      lookingFor(
        list(
          [
            'Separar ação, escopo e campo como perguntas distintas',
            'Saber que escopo precisa entrar no filtro da consulta',
            'Manter papéis configuráveis em dados',
            'Um ponto único de decisão de autorização',
            'Resistir a ABAC completo antes de precisar',
            'Perguntar sobre multi-tenancy antes de desenhar',
          ],
          [
            'Separating action, scope and field as distinct questions',
            'Knowing scope has to enter the query filter',
            'Keeping roles configurable as data',
            'A single authorization decision point',
            'Resisting full ABAC before it is needed',
            'Asking about multi-tenancy before designing',
          ],
        ),
        {
          strong: t(
            'Uma resposta forte exige que a decisão seja explicável: "por que este usuário não vê isto" precisa ter resposta, e é por isso que motor de políticas cedo demais machuca.',
            'A strong answer insists the decision must be explainable: "why can this user not see this" needs an answer, which is why a policy engine too early hurts.',
          ),
        },
      ),
      followUps(
        list(
          [
            'Como você testaria que as permissões estão corretas?',
            'Como isso muda se cada cliente configurar os próprios papéis?',
            'Onde você colocaria a filtragem de campos?',
          ],
          [
            'How would you test that the permissions are correct?',
            'How does this change if each customer configures their own roles?',
            'Where would you put the field filtering?',
          ],
        ),
      ),
    ],
  }),

  content({
    slug: 'sec-password-storage',
    type: 'multiple-choice',
    title: t('Armazenamento de senha', 'Password storage'),
    categoryId: 'security',
    skillIds: ['security'],
    difficulty: 'intermediate',
    tags: ['passwords', 'hashing', 'bcrypt', 'argon2'],
    minutes: 2,
    related: ['api-secure-rest', 'sec-jwt-storage'],
    blocks: [
      prompt(
        t(
          'Qual destas abordagens é adequada para armazenar senhas de usuários?',
          'Which of these is an adequate way to store user passwords?',
        ),
      ),
      choices(false, [
        {
          id: 'sha',
          label: t('SHA-256 com um salt aleatório por usuário', 'SHA-256 with a random per-user salt'),
          correct: false,
          quality: 'partial',
          why: t(
            'O salt está certo e resolve rainbow table, mas SHA-256 é rápido de propósito — foi desenhado para verificar integridade, não para resistir a força bruta. Uma GPU comum calcula bilhões de SHA-256 por segundo, então um vazamento vira senhas quebradas em horas.',
            'The salt is right and defeats rainbow tables, but SHA-256 is fast on purpose — it was designed to verify integrity, not to resist brute force. A commodity GPU computes billions of SHA-256 per second, so a leak becomes cracked passwords within hours.',
          ),
        },
        {
          id: 'argon',
          label: t('Argon2id com parâmetros de custo calibrados', 'Argon2id with calibrated cost parameters'),
          correct: true,
          why: t(
            'Correto, e é a recomendação atual. Argon2id é deliberadamente lento e, mais importante, consome memória de propósito — o que remove a vantagem de GPUs e ASICs, que têm muito paralelismo e pouca memória por núcleo. Os parâmetros precisam ser calibrados para o seu hardware, e revistos ao longo do tempo. bcrypt continua aceitável com fator de custo adequado; scrypt também.',
            'Correct, and it is the current recommendation. Argon2id is deliberately slow and, more importantly, deliberately memory-hard — which removes the advantage of GPUs and ASICs, which have plenty of parallelism and little memory per core. The parameters have to be calibrated for your hardware and revisited over time. bcrypt remains acceptable with an adequate cost factor; so does scrypt.',
          ),
        },
        {
          id: 'aes',
          label: t('AES com uma chave guardada no gerenciador de segredos', 'AES with the key held in a secrets manager'),
          correct: false,
          why: t(
            'Criptografia é reversível, e senha não deve ser recuperável nem por você. Se a chave vazar junto com o banco — e em um comprometimento sério ela costuma vazar — todas as senhas ficam em texto claro. Além disso, poder descriptografar significa que um insider pode ler as senhas dos usuários.',
            'Encryption is reversible, and a password should not be recoverable, not even by you. If the key leaks alongside the database — and in a serious compromise it usually does — every password is in the clear. On top of that, being able to decrypt means an insider can read users\' passwords.',
          ),
        },
      ]),
      explain(
        t(
          'A propriedade que se quer é **custo**. O hash precisa ser caro o suficiente para tornar força bruta inviável, e barato o suficiente para o seu login responder. O parâmetro de custo é uma decisão de engenharia, não um valor padrão: calibre para gastar algo entre 100 e 500 milissegundos no seu hardware, e revise quando trocar de máquina.',
          'The property you want is **cost**. The hash has to be expensive enough to make brute force impractical, and cheap enough that your login still responds. The cost parameter is an engineering decision, not a default: calibrate it to spend somewhere between 100 and 500 milliseconds on your hardware, and revisit it when the hardware changes.',
        ),
        t('O que realmente importa', 'What actually matters'),
      ),
      followUps(
        list(
          [
            'Como você migraria de bcrypt para Argon2 sem forçar reset de senha?',
            'Por que memory-hard importa contra GPU?',
          ],
          [
            'How would you migrate from bcrypt to Argon2 without forcing a password reset?',
            'Why does memory-hardness matter against GPUs?',
          ],
        ),
      ),
    ],
  }),
];
