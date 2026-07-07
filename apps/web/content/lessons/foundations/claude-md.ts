import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Configurer ton CLAUDE.md",
  estMin: 15,
  dek: "L'étape de configuration la plus importante. CLAUDE.md est le fichier d'instructions que Claude lit au démarrage de chaque session · c'est comme ça que tu construis un contexte permanent qui compose dans le temps.",
  blocks: [
    { type: "h2", text: "Ce qu'est CLAUDE.md" },
    {
      type: "p",
      text: "CLAUDE.md est un fichier markdown que Claude lit automatiquement au début de chaque session. C'est ta couche d'instruction permanente · le contexte toujours présent sans que tu aies à te répéter à chaque fois.",
    },
    {
      type: "p",
      text: "Sans lui, Claude démarre chaque session en ne sachant rien de toi, de ton activité, de ta stack, ou de la façon dont tu veux travailler. Avec lui, chaque session démarre avec le contexte complet déjà chargé.",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "C'est l'unique étape de configuration qui compose. Chaque session que tu lances lit ce fichier, donc chaque amélioration que tu y apportes rapporte à chaque sortie future · pour toujours. Quinze minutes ici sont les quinze minutes à plus fort effet de levier de tout le module. Traite-le comme un document vivant : chaque fois que Claude se trompe, ajoute la ligne qui aurait évité l'erreur.",
    },
    { type: "h2", text: "Deux types de CLAUDE.md" },
    { type: "h3", text: "Global (~/.claude/CLAUDE.md)" },
    { type: "p", text: "S'applique à chaque session Claude Code sur ta machine, peu importe le dossier où tu es. Utilise-le pour ton identité, tes préférences, et tout ce qui est vrai à travers tout ton travail." },
    { type: "h3", text: "Niveau projet (/ton-projet/CLAUDE.md)" },
    { type: "p", text: "S'applique seulement quand tu lances claude depuis ce dossier. Utilise-le pour le contexte spécifique au projet, les objectifs, la stack technique, et tout ce qui concerne cette mission précise." },
    { type: "p", text: "Tu finiras avec les deux · un global pour ton identité et tes préférences de base, et un par projet pour chaque build." },
    { type: "h2", text: "Quoi inclure vs laisser de côté" },
    {
      type: "p",
      text: "CLAUDE.md a une limite. Les recherches montrent que Claude peut suivre environ 150 à 200 instructions avant que la conformité commence à baisser · et le système de Claude Code lui-même en utilise déjà environ 50. Il te reste environ 100 à 150 emplacements.",
    },
    { type: "p", text: "À inclure :" },
    {
      type: "ul",
      items: [
        "Qui tu es et ce que fait ton activité",
        "Les projets actifs et leur statut actuel",
        "Ta stack technique et tes outils",
        "Comment tu veux que Claude communique (ton, format, longueur)",
        "Les contacts clés et le contexte qu'il doit connaître",
        "Toute instruction que Claude rate systématiquement sans qu'on le lui dise",
      ],
    },
    { type: "p", text: "À laisser de côté :" },
    {
      type: "ul",
      items: [
        "Tout ce que Claude peut déduire en lisant tes fichiers",
        "Les conventions standards qu'il connaît déjà",
        "La documentation détaillée (mets un lien à la place)",
        "Tout ce qui change fréquemment (mets à jour quand ça change, ne préempte pas)",
      ],
    },
    { type: "p", text: "La règle de base : pour chaque ligne de ton CLAUDE.md, demande-toi « Claude ferait-il une erreur sans ça ? ». Si non, supprime-la." },
    { type: "h2", text: "Le moyen le plus rapide de démarrer : /init" },
    { type: "p", text: "Avec un dossier projet ouvert dans Claude Code, lance :" },
    { type: "code", lang: "text", code: "/init" },
    {
      type: "p",
      text: "Claude analyse ton projet, détecte ta stack et ta structure, et génère un CLAUDE.md de démarrage. La sortie est généralement trop longue · relis-la et élague sans pitié. Supprime tout ce que Claude saurait de toute façon. Garde ce qui est spécifique à ta façon de travailler.",
    },
    { type: "h2", text: "Template de démarrage" },
    {
      type: "p",
      text: "Pour un projet neuf sans code existant, crée un CLAUDE.md à la main et colle le squelette ci-dessous. Remplis ce que tu sais aujourd'hui, complète au fil du travail. Le but est un document vivant, pas parfait.",
    },
    {
      type: "code",
      lang: "markdown",
      code: "# CLAUDE.md\n\n## Qui je suis\n- Activité : ...\n- Ce que je fais / vends : ...\n\n## Stack\n- Outils du quotidien : ...\n\n## Comment je veux que tu communiques\n- Ton : ...\n- Format préféré : ...\n\n## Projets actifs\n- ...\n\n## Règles dures\n- ...",
    },
    { type: "h2", text: "Configuration du CLAUDE.md global" },
    { type: "p", text: "Crée ton fichier global :" },
    { type: "code", lang: "bash", code: "mkdir -p ~/.claude\ntouch ~/.claude/CLAUDE.md" },
    {
      type: "p",
      text: "Ouvre-le ensuite dans n'importe quel éditeur de texte et colle tes détails personnels. Ce fichier s'applique à chaque session Claude sur ta machine, donc garde-le concentré sur qui tu es et comment tu aimes travailler · pas sur du détail projet.",
    },
    {
      type: "p",
      text: "Ce fichier est aussi la graine de ton Brain. Dans le module suivant, tu transformeras ce contexte de base en un second cerveau complet que chaque skill de la carte SkillTree lit automatiquement.",
    },
  ],
};

export default lesson;
