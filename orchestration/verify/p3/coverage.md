# Couverture 18/18 — leçon ↔ capture (MOD-01)

Méthode : pour chaque leçon (ordre `apps/web/lib/lessons.ts` : `start-here`×8, `foundations`×5,
`second-brain`×5), la capture source dédiée est `captures/lessons/modules_<module>_<slug>.json`
(underscore) — les **18 leçons ont une capture dédiée** (aucune leçon "sans capture"). La comparaison
porte sur la **structure** : titres de section (`headings` H2/H3 ou liste "ON THIS PAGE" du champ
`text` pour `start-here`, où les intitulés ne sont pas des `<h2>/<h3>` DOM mais des libellés visuels),
callouts (`KEY IDEA`/`TIP`), blocs code (`Copy`), listes/tableaux. Une leçon est **alignée** si toutes
les sections structurelles de la capture existent dans le contenu FR (`apps/web/content/lessons/`,
`type: "h2"|"h3"` + blocs) ; **à compléter** si une section structurelle manque (listée) ; **manquant→
réécrit** si la leçon FR n'existait pas du tout (aucun cas ici — les 18 fichiers FR existent déjà,
D1).

| # | module/slug | capture source | sections capture | sections leçon FR | verdict |
|---|---|---|---|---|---|
| 1 | start-here/welcome | modules_start_here_welcome.json | (pas de TOC — leçon courte 3 min ; contenu : 3 surfaces Carte/Dashboards/Brain + 5 items "fonctionnel à la fin") | 1 h2 "Ce que tu auras de fonctionnel à la fin de ce parcours" + callout Idée clé + 2 listes (3 items, 5 items) | aligné |
| 2 | start-here/not-technical | modules_start_here_not_technical.json | "The two things that still trip people up", "What the real skill is" | "Les deux choses qui font encore trébucher" (+ 2 sous-items h3 "1. Ouvrir un terminal…" / "2. Tomber sur des erreurs"), "La vraie compétence" | aligné |
| 3 | start-here/where-ai-is-going | modules_start_here_where_ai_is_going.json | (pas de TOC — contenu : constat outils suffisants, thèse du contexte, callout KEY IDEA, citation Karpathy) | 1 h2 "La thèse du contexte…" + callout Idée clé + citation (`quote` cite="Andrej Karpathy…") | aligné |
| 4 | start-here/how-to-think | modules_start_here_how_to_think.json | "The ROI-first framework", "Why sales and marketing dominate", "The jobs-to-be-done lens" | "Le cadre ROI-d'abord", "Pourquoi les ventes et le marketing dominent", "Le prisme « jobs to be done »" | aligné |
| 5 | start-here/audit-mindset | modules_start_here_audit_mindset.json | "The move…", "The three questions…", "What a good audit output looks like", "How to read the ROI", "Don't trip on these" (+ citation Drucker, callouts KEY IDEA + TIP, tableau ROI) | 5/5 h2 équivalents + citation Drucker + 2 callouts (key+tip) + table + ul + ol | aligné |
| 6 | start-here/tool-stack | modules_start_here_tool_stack.json | "The core · Claude ecosystem", "Knowledge and context", "Workspace and connectivity", "CRM", "Research and scraping", "Outbound", "Infrastructure", **"Meetings"** | 7/8 — la section **"Meetings" (Fireflies) est absente** du fichier FR | **à compléter (Meetings)** |
| 7 | start-here/context-from-day-1 | modules_start_here_context_from_day_1.json | "What CLAUDE.md is", "Why this compounds", "What good context infrastructure looks like" | "Ce qu'est CLAUDE.md", "Pourquoi ça compose", "À quoi ressemble une bonne infrastructure de contexte" | aligné |
| 8 | start-here/first-win | modules_start_here_first_win.json | "Day 1…" à "Day 6–7…" (6 jours) | "Jour 1…" à "Jour 6–7…" (6 jours, mêmes durées) | aligné |
| 9 | foundations/install-claude-code | modules_foundations_install_claude_code.json | "The recommended setup: Claude Code inside VS Code", "Before you start", "Install Claude Code", "Verify it's installed", "Authenticate", "Confirm it's working", "Common errors and fixes" (7) | 13 h2/h3 — les 7 sections + détail en sous-étapes (VS Code, extension) et 4 erreurs nommées sous "Erreurs courantes" ; 6 blocs code (cap. ~5 `Copy`) | aligné (superset) |
| 10 | foundations/how-it-works | modules_foundations_how_it_works.json | "Claude Code is not a chatbot", "AI-Enhanced vs AI-Native", "The context window", "How Claude reads your project", "Power-user moves worth knowing early" (5) | 5/5 identiques (traduits) | aligné |
| 11 | foundations/claude-md | modules_foundations_claude_md.json | "What CLAUDE.md is", "Two types of CLAUDE.md", "What to put in vs leave out", "The quickest way to start: /init", "Starter template", "Global CLAUDE.md setup" (6) | 8 h2/h3 — 6 sections + 2 sous-types (Global/Projet) déjà présents dans le texte original sous "Two types" | aligné |
| 12 | foundations/skills | modules_foundations_skills.json | "What is a skill?", "The built-in skills you should know", "Key commands to know", "Installing a skill from the SkillTree map", "Writing your own" (5) | 5/5 identiques (traduits), tableau commandes | aligné |
| 13 | foundations/mcps | modules_foundations_mcps.json | "What is an MCP?", "How to install an MCP", "The core stack to connect", "Two worked examples", "Give Claude a real browser · TinyFish", "Push cold email…Smartlead", "MCPs + skills = real workflows", "Run a real first session" (8) | 8/8 identiques (traduits), 8 blocs code / 8 côté capture | aligné |
| 14 | second-brain/why-a-brain | modules_second_brain_why_a_brain.json | "The problem: context amnesia", "Why this compounds", "What the Brain actually is", "What you'll build in this module" (4) | 4/4 identiques (traduits) | aligné |
| 15 | second-brain/brain-in-notion | modules_second_brain_brain_in_notion.json | "The fastest way…", "Why Notion over a folder of docs", "The structure", "What goes in each section", "Connecting your Brain to Claude", "Make your skills read it · the bridge", "The habit that makes it compound" (7) + section avancée non listée au TOC ("A shared Brain for a team") | 14 h2/h3 — les 7 sections + détail des 7 sous-pages (À propos de moi/Projets actifs/Clients/Processus/Connaissance/Notes de réunion/Pipeline) sous "Ce qui va dans chaque section" (fidèle aux sous-titres capturés dans le texte original) + callout avancé "Brain partagé pour une équipe" couvert ; 5 blocs code / 5 capture | aligné (superset) |
| 16 | second-brain/brain-in-obsidian | modules_second_brain_brain_in_obsidian.json | "The fastest way…", "Notion or Obsidian · which for what", "The three-layer architecture", "Vault structure", "The highest-leverage move: prose-as-title", "Connecting Obsidian to Claude", "Make your skills read it · the bridge", "The auto-memory layer", "The session rhythm", "Common mistakes" (10) | 10/10 identiques (traduits), 6 blocs code / 6 capture | aligné |
| 17 | second-brain/the-capture-workflow | modules_second_brain_the_capture_workflow.json | "The gap where knowledge dies", "The two-step capture workflow", "Why this matters for meetings", "The self-improving graph", "The weekly rhythm", "Start here" (6) | 8 h2/h3 — 6 sections + 2 sous-étapes ("Étape 1 · Récupère le transcript" / "Étape 2 · Laisse Claude le classer") sous "Le workflow de capture en deux étapes" ; 3 blocs code / 3 capture | aligné (superset) |
| 18 | second-brain/prompting-your-brain | modules_second_brain_prompting_your_brain.json | "The honest truth about prompting", "The context-first principle", "Anticipate where it gets confused", "Give it the right frame", "Show it an example", "Useful prompt patterns", "When the problem is reasoning, not the prompt", "The one rule that covers everything" (8) | 8/8 identiques (traduits), 8 blocs code / 8 capture | aligné |

## Bilan

- **17/18 alignées** (dont 6 en superset — sous-sections FR plus détaillées que la table des
  matières visuelle capturée, sans rien omettre : vérifié section par section contre le champ
  `text` complet des captures, pas seulement `headings`).
- **1/18 à compléter** : `start-here/tool-stack` — section **"Meetings"** (outil Fireflies) absente
  du fichier FR `apps/web/content/lessons/start-here/tool-stack.ts`. Complétée en FR neuve dans la
  Task 2 (prose reformulée, jamais traduite verbatim du texte anglais de la capture).
- **0 leçon manquante** — les 18 fichiers `.ts` existaient déjà (D1, prototype `apps/web` adopté) et
  sont tous résolus par `getLesson()`/`ORDER` de `lib/lessons.ts`.
- Méthode de vérification anti-omission : pour les modules `foundations`/`second-brain`, la capture
  DOM fournit un tableau `headings` explicite (H1/H3) directement comparable. Pour `start-here`, les
  intitulés de section ne sont pas des balises `<h2>/<h3>` (page plus courte, style éditorial) : la
  liste "ON THIS PAGE" en fin de `text` sert de table des matières de référence, complétée par une
  lecture intégrale du `text` pour les 2 leçons sans "ON THIS PAGE" (`welcome`, `where-ai-is-going`)
  afin de ne pas rater une section qui n'aurait pas généré de TOC.
