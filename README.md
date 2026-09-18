# DevPrep

Preparação para entrevistas técnicas e comportamentais, com uma regra que o
produto inteiro obedece: **você tenta antes de ler a resposta.**

O canal um é a sua tentativa. O canal dois — a resposta modelo — fica travado
até o canal um ter sinal. Isso não é convenção de tela: os blocos de resposta
não existem no DOM até o gate abrir.

O que conta como tentativa depende do trabalho que a atividade pede. O
microfone é a ferramenta da última etapa, não o pedágio na frente de todas:

```text
Aprender → Reconhecer → Decidir → Aplicar → Explicar → Falar
```

Cada conteúdo declara em que degrau está e como se responde (ler, escolher,
escrever ou falar). Uma sessão de dez atividades traz no máximo duas faladas;
o resto da prática de voz mora na área de Praticar falando.

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. **Não precisa de nenhuma credencial.** Sem
Firebase configurado, tudo funciona e fica salvo neste navegador — progresso,
tentativas e gravações (IndexedDB).

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + build de produção + service worker (PWA) |
| `npm run typecheck` | Só o TypeScript |
| `npm run check` | Roda todas as checagens abaixo em sequência |
| `npm run check:content` | Valida o banco de conteúdo: ids relacionados, idiomas, blocos, títulos sem markup |
| `npm run check:practice` | Verifica o gerador do Today's Practice: variedade, sem repetição, revisões e foco |
| `npm run check:storage` | Regressão: escritas concorrentes no armazenamento local não perdem dados |
| `npm run icons` | Regenera os ícones PWA a partir da marca |

## A escada

Onze tipos de atividade, cada um com identidade visual e modo de resposta
próprios (`src/domain/activity.ts`):

| Tipo | Como se responde |
| --- | --- |
| Aprender | Só leitura, e no fim você diz se ficou claro |
| Checagem rápida | Sim/não, uma afirmação por vez, cada resposta explicada |
| Decisão | Arrasta o card ou usa os botões; mostra sua decisão contra a esperada |
| Múltipla escolha | Alternativas plausíveis, graduadas em ideal / parcial / problema real |
| Ler código, Achar o bug | Resposta escrita |
| Arquitetura, Pergunta de entrevista, Prática falada | Resposta falada, com escrita como alternativa |
| Resposta escrita, Desafio | Resposta escrita |

**Trilhas** (`src/data/seed/paths.ts`) encadeiam conteúdos já existentes na
ordem da escada: a trilha de sessão no navegador vai de um card de conceito
sobre `localStorage` até defender a escolha numa conversa com um senior. As
etapas continuam sendo conteúdos comuns — o treino diário reaproveita todas
sem nenhuma autoria duplicada.

## Today's Practice

O centro do app é uma sessão curta e finita — 5, 10 ou 20 atividades — que responde "o que eu deveria praticar agora?". Abrir, apertar Começar, praticar, terminar.

- **Geração por evidência, não aleatória** (`src/domain/practice.ts`): cada item recebe pontos por revisão vencida, erro anterior, habilidade fraca, foco, stacks e dificuldade preferidas, e perde pontos se apareceu nas duas últimas sessões, se foi marcado como fácil demais ou já está dominado. Revisões e erros ganham as vagas primeiro; depois a sessão reserva degraus baixos, impõe variedade (nenhum tipo de atividade passa de um quarto da sessão, nenhuma categoria de um terço), limita as faladas a um quinto, inclui inglês em sessões de 10+, e ordena subindo a escada — abre no degrau mais baixo presente e nunca repete o mesmo tipo em sequência.
- **Modo imersivo** (`/practice/session`): sem trilho nem barra de navegação; só progresso, a atividade, pular, próxima atividade e sair. Nada avança sozinho e a sessão termina — sem scroll infinito. Tudo é salvo a cada passo.
- **Resumo com recomendações honestas:** cada recomendação exige um limite de evidência próprio ("resposta em inglês mais curta que o habitual" só aparece com pelo menos três respostas anteriores para comparar). Sem dados suficientes, a tela diz isso.
- **Confiança em quatro níveis** (não sabia / sabia parte / sabia / fácil demais) alimenta o mesmo agendamento de revisão e as mesmas habilidades do resto do app.

## Ligando o Firebase

1. Crie um projeto no Firebase com Authentication (Google + Email/senha),
   Firestore e Storage.
2. Copie `.env.example` para `.env` e cole as chaves.
3. Publique as regras: `firebase deploy --only firestore:rules,firestore:indexes,storage`
4. Para liberar o builder de conteúdo a uma conta, crie o documento
   `admins/{uid}` pelo console. Nenhum cliente consegue escrever nessa coleção.

Nenhum outro arquivo muda: os repositórios trocam de implementação sozinhos
quando há um usuário logado num projeto configurado. O SDK do Firebase só é
baixado nesse caso — instalações em modo local nunca carregam os 600 kB.

## Arquitetura

```
src/
  domain/          regras puras, sem React: tipos, escada de atividades,
                   trilhas, repetição espaçada, seletores, simulado, planos
  data/
    ports.ts       as interfaces que as telas usam
    local/         implementação no dispositivo (IndexedDB)
    firebase/      implementação Firebase (Auth, Firestore, Storage)
    seed/          taxonomia + banco de conteúdo (carregado sob demanda)
  i18n/            UI bilíngue PT/EN
  hooks/           useRecorder: MediaRecorder, nível ao vivo, forma de onda
  components/
    lab/           o sistema visual: painéis, lâmpadas, medidores, transporte
    ui/            estados vazios, erro, carregamento
  features/
    content/       ContentRenderer + blocos + RecordingDeck (o gate)
    home, learn, practice, speaking, library, flashcards, english, mock,
    progress, profile, auth, admin
```

### Conteúdo é dado

`Content → Type → Blocks → Interaction → Answer → Evaluation`

Cada item declara uma lista de blocos tipados. Cada bloco tem uma **fase**:
`prompt` (visível antes da tentativa) ou `answer` (lacrado até o gate abrir). O
`ContentRenderer` resolve blocos em componentes por um único registro em
`features/content/blocks/index.tsx`. Um formato novo de conteúdo é um tipo de
bloco novo e um componente — nenhuma tela muda.

Blocos disponíveis: prompt, text, code, expected-output, answer-levels
(curta / forte / aprofundada), looking-for, common-mistakes, trade-off,
interview-tip, warning, tip, example, follow-up, related, choices, compare,
diagram (nós e arestas, renderizado como SVG nos dois temas), video, link,
image.

O banco inicial tem **74 itens de nível pleno/sênior** em JavaScript/Node,
backend, banco de dados, arquitetura, segurança, comportamental e inglês
técnico — com respostas escritas separadamente em cada idioma, não traduzidas.
Os itens de inglês técnico existem só em inglês, de propósito.

### Segurança

`firestore.rules` e `storage.rules` aplicam posse de verdade: tudo sob
`users/{uid}` é só do dono (admins incluídos), assinaturas e a lista de admins
não são graváveis por cliente nenhum, e campos como `role` são rejeitados na
escrita do perfil. Gravações de voz nunca são públicas nem listáveis.

### Monetização

`domain/entitlements.ts` concentra limites de plano e onde anúncio pode
aparecer. Os espaços são uma **allowlist**: uma superfície nova é livre de
anúncio até alguém a adicionar explicitamente, e a gravação, a pergunta e o
caminho até a resposta nunca estão na lista.

## Preparado para depois

- **Avaliação por IA:** `Attempt` já guarda locale, duração e gravação; a
  tela de inglês mostra onde a avaliação entra, sem fingir que existe.
- **Execução de código:** nunca no frontend. O modelo de bloco `code` aceita
  linguagem e saída esperada; execução deve ir para um sandbox isolado.
- **Assinatura:** `subscriptions/{uid}` é escrito só por webhook; o
  `StudyProvider` já resolve `entitlementsFor(plan)` num ponto único.
