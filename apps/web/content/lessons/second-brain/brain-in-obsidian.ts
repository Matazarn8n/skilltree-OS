import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Construis ton Brain dans Obsidian",
  estMin: 12,
  dek: "La version locale de ton cerveau d'entreprise. Contrôle total de tes données, un graphe de connaissance que Claude peut interroger à l'exécution, et l'architecture en trois couches qui transforme un vault de notes en un vrai moteur de contexte IA.",
  blocks: [
    { type: "p", text: "Obsidian est l'autre moitié du Brain. Tout est local, rien ne touche le cloud, et le vault devient un graphe de connaissance que Claude interroge à l'exécution." },
    { type: "h2", text: "Le moyen le plus rapide : laisse Claude le construire pour toi" },
    { type: "p", text: "Ouvre Claude Code dans le dossier où tu veux ton vault et colle ceci. Il échafaude toute la structure, t'interviewe, et écrit ton CLAUDE.md et tes fichiers de mémoire en une fois." },
    {
      type: "code",
      lang: "text",
      code:
        "Tu configures mon Brain · mon second cerveau · comme un vault Obsidian local.\nConstruis-le, puis amorce-le à partir d'une courte interview.\n\n1. Crée cette structure de vault (demande-moi où, par défaut ~/obsidian/brain/) :\n   00-home/ (index.md, top-of-mind.md) · atlas/ (projects.md, vault-structure.md) · inbox/ · knowledge/ · sessions/ · voice-notes/\n\n2. Interviewe-moi une question à la fois : ce que fait mon activité et comment\n   elle gagne de l'argent, mes clients, ma stack quotidienne, comment je\n   communique (avec 2-3 lignes de mon écriture réelle), et mes 3 priorités du moment.\n\n3. À partir de mes réponses, écris :\n   - un CLAUDE.md à la racine du vault · moins de 150 lignes, un document\n     pédagogique, pas un fichier de config\n   - un dossier memory/ avec decisions.md, clients.md, projects.md,\n     patterns.md, open-loops.md, chacun commençant par un en-tête d'une\n     ligne expliquant ce qui y va\n\n4. Toute note que tu crées utilise le titre-en-prose · chaque titre est une\n   affirmation falsifiable, pas une catégorie.\n\nImprime le CLAUDE.md en entier une fois terminé et dis-moi comment pointer Claude vers ce vault.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "Tout ce qui suit explique ce que ce prompt construit et pourquoi · les trois couches, la structure, et le titre-en-prose. Lis-le pour façonner le vault à ta façon de penser réelle.",
    },
    { type: "h2", text: "Notion ou Obsidian · quoi pour quoi" },
    { type: "p", text: "Les deux sont excellents. Ils résolvent des problèmes légèrement différents." },
    { type: "p", text: "Notion est meilleur quand :" },
    {
      type: "ul",
      items: [
        "Tu construis quelque chose de collaboratif · équipe ou client",
        "Tu veux une structure de base de données pour suivre des choses",
        "Tu veux de l'IA intégrée dans le workspace",
        "Tu préfères le glisser-déposer aux fichiers",
      ],
    },
    { type: "p", text: "Obsidian est meilleur quand :" },
    {
      type: "ul",
      items: [
        "Tu veux tout en local et privé · rien dans le cloud",
        "Tu veux un graphe de connaissance avec des liens bidirectionnels entre notes",
        "Tu construis une base de connaissance personnelle profonde avec des milliers de notes",
        "Tu veux une compatibilité maximale avec la lecture de fichiers de Claude",
      ],
    },
    { type: "p", text: "Beaucoup d'opérateurs font tourner les deux : Obsidian pour la connaissance et la pensée personnelles, Notion pour les clients et les projets. C'est une configuration valide." },
    { type: "h2", text: "L'architecture en trois couches" },
    { type: "p", text: "C'est ce qui fait d'Obsidian un vrai moteur de contexte IA, pas juste une app de notes." },
    {
      type: "code",
      lang: "text",
      code:
        "┌─────────────────────────────────────────┐\n│ Couche 3 : Pipeline d'ingestion          │\n│ vidéo/audio → connaissance structurée    │\n├─────────────────────────────────────────┤\n│ Couche 2 : Graphe de connaissance        │\n│ vault Obsidian + pont MCP                │\n├─────────────────────────────────────────┤\n│ Couche 1 : Mémoire de session            │\n│ CLAUDE.md + dossier auto-memory          │\n└─────────────────────────────────────────┘",
    },
    { type: "p", text: "Couche 1 · Mémoire de session (CLAUDE.md). Ce que Claude lit au démarrage de chaque session : ton identité, tes projets actuels, tes conventions. Garde-le sous 150 lignes. C'est un document pédagogique, pas un fichier de config." },
    { type: "p", text: "Couche 2 · Graphe de connaissance (le vault). Ta mémoire long terme cherchable. Claude y accède via MCP. Le vault est une couche de persistance que Claude peut interroger à l'exécution, pas seulement au démarrage de session." },
    { type: "p", text: "Couche 3 · Pipeline d'ingestion. Comment la nouvelle connaissance entre · transcripts, mémos vocaux, enregistrements, articles, traités en notes structurées automatiquement. (Couvert en détail dans la leçon suivante.)" },
    { type: "p", text: "Elles composent ensemble. Saute une couche et les autres se dégradent." },
    { type: "h2", text: "Structure du vault" },
    { type: "p", text: "La structure compte énormément · un dépôt non structuré dégrade vite la récupération. Utilise ces niveaux pour que Claude trouve la bonne profondeur du premier coup :" },
    {
      type: "code",
      lang: "text",
      code:
        "obsidian-vault/\n├── 00-home/          ← cartes de contenu · table des matières de ton Brain\n│   ├── index.md\n│   └── top-of-mind.md\n├── atlas/            ← vue d'ensemble structurelle\n│   ├── projects.md\n│   └── vault-structure.md\n├── inbox/            ← les captures non traitées atterrissent ici d'abord\n├── knowledge/        ← connaissance triée, traitée\n├── sessions/         ← transcripts de session et notes d'appels\n└── voice-notes/      ← captures vocales transcrites",
    },
    { type: "h2", text: "Le mouvement le plus rentable : le titre-en-prose" },
    { type: "p", text: "Nomme les notes comme des affirmations, pas des catégories. Chaque titre de note est une affirmation falsifiable. Si tu ne peux pas évaluer l'affirmation rien qu'au titre, réécris-le." },
    { type: "p", text: "❌ systemes-de-memoire.md ✅ les graphes de mémoire battent les gros fichiers de mémoire.md" },
    { type: "p", text: "❌ notes-ventes.md ✅ l'outbound tiède convertit 3x mieux que le froid quand la séquence reflète le langage de l'acheteur.md" },
    { type: "p", text: "❌ pricing.md ✅ ancrer le forfait au coût d'un ETP évité clôture plus vite que les projections de ROI.md" },
    { type: "p", text: "Quand Claude cherche dans ton vault, le seul titre de la note lui dit si c'est pertinent avant même de lire une ligne. Les titres en prose rendent la recherche sémantique nettement plus précise." },
    { type: "p", text: "La même logique s'applique aux liens. Fais en sorte que les wiki-liens se lisent comme des phrases :" },
    {
      type: "code",
      lang: "text",
      code:
        "on a appris que [[les graphes de mémoire battent les gros fichiers de mémoire]]\nquand on [[benchmark la récupération comme une infra de recherche]]",
    },
    { type: "p", text: "Le graphe devient auto-documenté. La récupération devient de la navigation." },
    { type: "h2", text: "Connecter Obsidian à Claude" },
    { type: "p", text: "Deux MCP donnent à Claude un accès structuré et complet à ton vault. Ajoute-les à Claude Code avec claude mcp add · comme tu l'as fait pour Notion et GitHub dans le module Fondations :" },
    {
      type: "code",
      lang: "bash",
      code:
        "# Accès lecture/écriture complet à ton vault Obsidian\nclaude mcp add obsidian -- npx -y obsidian-mcp\n\n# Requêtes structurées sur les notes par chemin, tag et frontmatter\nclaude mcp add qmd -- npx -y @tobilu/qmd mcp",
    },
    { type: "p", text: "Pointe chaque serveur vers ton dossier vault quand il le demande (ou dans sa config). Lance claude mcp list pour confirmer que les deux sont connectés." },
    { type: "p", text: "obsidian-mcp permet à Claude de lire et écrire des notes dans tout le vault ; qmd est l'outil de précision pour récupérer des notes par chemin ou tag. Ensemble ils couvrent la recherche plein-texte et structurée." },
    { type: "p", text: "Pour une recherche sémantique « trouve des notes liées même sans connaître le titre exact », installe le plugin Smart Connections dans Obsidian lui-même (Plugins communautaires → Smart Connections). Il construit les embeddings localement et complète les MCP ci-dessus." },
    { type: "h2", text: "Fais lire ça à tes skills · le pont" },
    { type: "p", text: "Les MCP te permettent d'interroger le vault dans une discussion. Mais les skills SkillTree que tu installes ne lisent pas ton vault Obsidian · ils lisent un dossier local knowledge/ (company.md, voice.md, offer.md, stack.md). Les skills tournent vite contre des fichiers plats, pas un vault live." },
    { type: "p", text: "Le skill Brain Sync est le pont. Il tire ton Brain Obsidian vers ce dossier knowledge/ · en faisant correspondre chaque note au bon fichier, en montrant un diff, et en n'écrivant que ce que tu approuves. Édite dans Obsidian, lance la sync, et chaque skill lit la vérité du moment." },
    { type: "p", text: "Change un fait dans le vault → lance « synchronise mon Brain depuis Obsidian » → tes skills le récupèrent. C'est la boucle qui rend « installer un skill et qu'il connaisse déjà mon activité » littéralement vrai." },
    { type: "h2", text: "La couche auto-memory" },
    { type: "p", text: "En plus du vault, Claude persiste ce qu'il apprend d'une session à l'autre dans son dossier de mémoire :" },
    {
      type: "code",
      lang: "text",
      code:
        "~/.claude/projects/<hash-du-projet>/memory/\n├── MEMORY.md        # document de routage · garde sous 200 lignes\n├── debugging.md     # solutions aux problèmes récurrents\n├── patterns.md      # conventions confirmées\n├── architecture.md  # décisions d'architecture clés\n└── preferences.md   # tes préférences de workflow",
    },
    { type: "p", text: "Garde MEMORY.md sous 200 lignes. C'est un document de routage, pas un dépotoir · le détail va dans les fichiers thématiques qu'il pointe." },
    { type: "h2", text: "Le rythme de session" },
    {
      type: "ol",
      items: [
        "Orienter · Claude lit CLAUDE.md et interroge les notes de vault pertinentes",
        "Travailler · session complète avec le contexte chargé",
        "Persister · Claude écrit ce qu'il a appris dans le bon fichier de mémoire",
      ],
    },
    { type: "p", text: "L'étape persister est celle que presque tout le monde laisse tomber. C'est aussi celle où toute la valeur compose." },
    {
      type: "callout",
      variant: "tip",
      title: "Fais de persister une seule ligne",
      text: "Termine chaque session par : « Mets à jour mes fichiers de mémoire avec tout ce que tu as appris aujourd'hui · nouvelles décisions, patterns, contexte client. » Dix secondes de frappe, et la session suivante démarre plus intelligente. Saute-le et ton vault arrête de s'améliorer le jour où tu arrêtes de le maintenir à la main.",
    },
    { type: "h2", text: "Erreurs courantes" },
    {
      type: "ul",
      items: [
        "Traiter CLAUDE.md comme un fichier de réglages. C'est un document pédagogique · écris-le comme si tu onboardais quelqu'un qui se souvient de tout pour toujours.",
        "Tout déverser dans un seul gros fichier. Les notes atomiques à titre en prose sont récupérables. Les fichiers monolithiques ne le sont pas.",
        "Sauter l'étape persister. Sans elle, ta mémoire de session ne s'améliore jamais.",
        "Ne pas nourrir la Couche 3. Le vault ne connaît que ce que tu y mets. Commence par tes trois derniers enregistrements les plus utiles.",
      ],
    },
  ],
};

export default lesson;
