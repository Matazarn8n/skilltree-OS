import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Construis ton Brain dans Notion",
  estMin: 10,
  dek: "La version structurée et IA-prête de ton cerveau d'entreprise. La structure du workspace, ce qui va dans chaque section, et comment la connecter à Claude pour qu'elle devienne du contexte live pour chaque skill.",
  blocks: [
    { type: "p", text: "Notion est l'endroit le plus simple pour démarrer ton Brain, surtout pour tout ce qu'un client ou une équipe va toucher." },
    { type: "h2", text: "Le moyen le plus rapide : laisse Claude le construire pour toi" },
    { type: "p", text: "Tu n'as rien à créer à la main. Connecte le MCP Notion, puis colle un seul prompt · Claude échafaude tout le Brain, t'interviewe, remplit ton À propos de moi, et écrit ton CLAUDE.md." },
    { type: "code", lang: "bash", code: "claude mcp add --transport http notion https://mcp.notion.com/mcp" },
    {
      type: "code",
      lang: "text",
      code:
        "Tu configures mon Brain · le second cerveau de mon entreprise · dans Notion.\nTu as le MCP Notion connecté. Construis-le en trois passes et ne bâcle pas l'interview.\n\nPASSE 1 · Interviewe-moi. Pose ces questions une par une et attends chaque réponse :\n1. Que fait mon activité, et comment gagne-t-elle de l'argent ?\n2. Qui sont mes clients actuels ou les gens que je sers ?\n3. Quelle est ma stack technique · les outils que j'utilise tous les jours ?\n4. Comment j'aime communiquer ? Ton, do's et don'ts stricts. Colle-moi 2-3 lignes de mon écriture réelle pour que tu matches ma voix.\n5. Quelles sont mes 3 priorités du moment ?\n\nPASSE 2 · Avec le MCP Notion, crée une page racine \"Brain\" avec ces sous-pages :\nÀ propos de moi · Projets actifs · Clients · Processus · Connaissance · Notes de réunion · Pipeline.\nRemplis \"À propos de moi\" à partir de mes réponses sous ces en-têtes : Qui je suis · Ce que je fais · Ma stack · Ma voix · Priorités actives · Clients · Règles dures. Sois précis · un À propos de moi vague produit des sessions vagues. Amorce chaque autre page avec une description d'une ligne de ce qui y va.\n\nPASSE 3 · Génère un CLAUDE.md qui reflète la page À propos de moi : moins de 150 lignes, écrit comme un document pédagogique pour un nouvel employé qui se souvient de tout pour toujours. Imprime-le en entier pour que je le colle dans mon ~/.claude/CLAUDE.md global, et dis-moi exactement où vit ce fichier.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "Tout ce qui suit est ce que ce prompt construit. Parcours-le pour ajuster la structure et savoir ce qui va où · ou construis-le à la main si tu préfères posséder chaque étape.",
    },
    { type: "h2", text: "Pourquoi Notion plutôt qu'un dossier de docs" },
    { type: "p", text: "La plupart des gens stockent leur connaissance dans des dossiers. Les dossiers sont des archives : les choses y entrent, on ne les retrouve quasiment jamais. Le problème n'est pas le contenu, c'est qu'il n'y a aucune structure que Claude peut naviguer." },
    { type: "p", text: "Notion est différent pour trois raisons :" },
    {
      type: "ol",
      items: [
        "C'est structuré par défaut. Chaque page a un titre, des propriétés, une hiérarchie. Claude la cherche sémantiquement via MCP et trouve réellement ce qu'il cherche.",
        "L'IA est intégrée. Notion AI peut chercher, résumer et interroger ton workspace nativement. Combiné au MCP Notion, tu as deux couches d'IA qui travaillent sur la même connaissance.",
        "C'est collaboratif. Un Brain Notion n'est pas seulement le tien · ton équipe ou un client peut aussi le lire et l'écrire. Il devient un système partagé, pas un carnet privé.",
      ],
    },
    { type: "h2", text: "La structure" },
    { type: "p", text: "Garde ça simple. Le but est que n'importe quel skill SkillTree trouve le contexte pertinent en moins de dix secondes." },
    {
      type: "code",
      lang: "text",
      code:
        "Ton Brain\n├── 📌 À propos de moi     ← qui tu es, ton activité, ta stack\n├── 💼 Projets actifs      ← sur quoi tu travailles en ce moment\n├── 👥 Clients             ← une page par client, tout le contexte y vit\n├── 🛠️ Processus           ← tes SOP, comment tu fais les choses\n├── 📚 Connaissance         ← ce que tu as appris, notes, ressources\n├── 📅 Notes de réunion     ← chaque appel journalisé ici\n└── 💰 Pipeline            ← deals et opportunités",
    },
    { type: "p", text: "C'est le minimum. La structure exacte compte moins que la règle derrière : chaque type d'information a une maison, et ces maisons sont utilisées de façon cohérente." },
    { type: "h2", text: "Ce qui va dans chaque section" },
    { type: "h3", text: "À propos de moi" },
    { type: "p", text: "La source de vérité pour ton CLAUDE.md. Écris-la comme si tu expliquais ton activité à un nouvel employé qui doit la comprendre en dix minutes. Mets-la à jour quand les choses changent. Inclus :" },
    {
      type: "ul",
      items: [
        "Ce que fait ton activité et comment elle gagne de l'argent",
        "Ton focus et tes priorités actuelles",
        "Ta stack technique",
        "Comment tu préfères travailler et communiquer",
        "Tes relations clés · clients, partenaires, équipe",
      ],
    },
    { type: "h3", text: "Projets actifs" },
    { type: "p", text: "Une page par projet. Chaque page porte :" },
    {
      type: "ul",
      items: [
        "Ce que c'est et pourquoi ça existe",
        "Le statut actuel et la prochaine action",
        "Les décisions clés prises et pourquoi",
        "Les questions ouvertes",
        "Des liens vers les fichiers ou conversations pertinents",
      ],
    },
    { type: "p", text: "Claude lit ceci quand tu lui demandes de l'aide sur un projet. Plus il y a de contexte ici, meilleure est la sortie." },
    { type: "h3", text: "Clients" },
    { type: "p", text: "Une page par client, traitée comme un dossier :" },
    {
      type: "ul",
      items: [
        "Aperçu de l'entreprise et ce qu'elle fait",
        "Contacts clés et leurs rôles",
        "Ce que tu as construit ou construis",
        "Historique de deal et engagement actuel",
        "Notes de réunion (lien depuis la section Notes de réunion)",
        "Décisions et contexte importants",
      ],
    },
    { type: "h3", text: "Processus" },
    { type: "p", text: "Tes SOP · comment tu fais les choses, écrites simplement pour que Claude puisse les suivre. Comment tu mènes un appel de découverte, onboardes un client, structures une proposition, déploies un build. Quand Claude connaît tes processus, il arrête de réinventer la roue à chaque session." },
    { type: "h3", text: "Connaissance" },
    { type: "p", text: "Tout ce que tu veux te souvenir et retrouver plus tard · articles, cadres, notes de conversations. Garde des titres descriptifs pour que la recherche sémantique les retrouve." },
    { type: "h3", text: "Notes de réunion" },
    { type: "p", text: "Chaque appel, journalisé. Traite le transcript après chaque appel et dépose-le dans une nouvelle page. Format de titre : [Client/Sujet] · [Date]. Avec le temps, ça devient la mémoire institutionnelle de ton activité." },
    { type: "h3", text: "Pipeline" },
    { type: "p", text: "Chaque deal actif avec son statut actuel, dernier contact, et prochaine étape. Connecte-le à ton CRM via MCP si tu veux que Claude le mette à jour automatiquement." },
    { type: "h2", text: "Connecter ton Brain à Claude" },
    { type: "p", text: "Une fois Notion configuré, le MCP Notion en fait du contexte live pour chaque session." },
    { type: "code", lang: "bash", code: "claude mcp add --transport http notion https://mcp.notion.com/mcp" },
    { type: "p", text: "Claude peut maintenant lire et écrire sur tout ton workspace. La chose la plus rentable à faire avec, c'est un prompt de briefing matinal :" },
    {
      type: "code",
      lang: "text",
      code:
        "Lis ma page Projets actifs, mon Pipeline, et mon calendrier du jour.\nDonne-moi un briefing : qu'est-ce qui est le plus important aujourd'hui,\nà qui je parle, qu'est-ce que je dois préparer, et qu'est-ce qui est en retard.",
    },
    { type: "p", text: "C'est toute ta journée mise en contexte en trente secondes." },
    {
      type: "callout",
      variant: "tip",
      title: "Branche-le à un dashboard",
      text: "Une fois ce prompt de briefing fonctionnel, c'est la graine d'un DASHBOARD SkillTree · un command center qui le lance pour toi au lieu que tu le tapes. Le Brain est la couche de données ; les dashboards sont le front-end qui la lit.",
    },
    { type: "h2", text: "Fais lire ça à tes skills · le pont" },
    {
      type: "p",
      text: "Le MCP Notion te permet de tirer Notion dans une discussion. Mais les skills SkillTree que tu installes ne lisent pas Notion · ils lisent un dossier local knowledge/ (company.md, voice.md, offer.md, stack.md). C'est délibéré : les skills tournent vite contre des fichiers plats, pas une API live.",
    },
    {
      type: "p",
      text: "Il y a donc un pont à faire tourner. Le skill Brain Sync tire ton Brain Notion vers ce dossier knowledge/ · il fait correspondre chaque section Notion au bon fichier, te montre un diff, et n'écrit que ce que tu approuves. Édite dans Notion, lance la sync, et chaque skill que tu déploies lit la vérité du moment.",
    },
    {
      type: "p",
      text: "Fais-en un réflexe : change un prix ou un client dans Notion → lance « synchronise mon Brain » → tes skills citent le nouveau prix la fois suivante où tu les lances. C'est la boucle qui rend « installer un skill et qu'il connaisse déjà mon activité » littéralement vrai.",
    },
    { type: "h2", text: "L'habitude qui fait composer" },
    { type: "p", text: "Le Brain ne marche que si tu le nourris. Le rythme minimum viable :" },
    {
      type: "ul",
      items: [
        "Après chaque appel : traite le transcript, journalise-le dans Notion.",
        "Après chaque décision : ajoute une note à la page projet ou client concernée.",
        "Chaque semaine : passe quinze minutes à revoir les projets actifs, mettre à jour les statuts, archiver ce qui est terminé.",
      ],
    },
    { type: "p", text: "Rien de tout ça ne prend longtemps. Saute-le pendant deux semaines et tes skills se mettent à travailler avec un contexte périmé." },
    {
      type: "callout",
      variant: "tip",
      title: "Avancé · un Brain partagé pour une équipe",
      text: "La même architecture s'étend à plus d'une personne. Un Brain de groupe remplace ton CLAUDE.md par un GROUP-CLAUDE.md qui cartographie l'expertise de chaque membre (pas des bios · des angles : sur quoi chacun fait autorité et comment il pense), les conventions partagées par tous, et les décisions que le groupe a écartées ensemble. Le Claude de chaque membre le lit, et chaque session que quiconque lance nourrit le même graphe. C'est la version multijoueur de tout ce module · bon à savoir que ça existe, mais construis d'abord ton propre Brain solide.",
    },
  ],
};

export default lesson;
