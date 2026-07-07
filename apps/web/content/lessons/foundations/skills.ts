import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Comment fonctionnent les skills",
  estMin: 10,
  dek: "Un skill est une fiche de poste que tu remets une fois à Claude et que tu invoques dès que tu en as besoin. Voici ce qu'ils sont, les skills natifs déjà présents, et comment ceux que tu débloques sur la carte SkillTree se branchent.",
  blocks: [
    { type: "h2", text: "Qu'est-ce qu'un skill ?" },
    {
      type: "p",
      text: "Un skill est un jeu d'instructions réutilisable stocké dans un fichier SKILL.md. Quand tu invoques un skill avec une commande slash, Claude charge ces instructions et suit un workflow précis et cohérent · au lieu d'improviser à chaque fois.",
    },
    {
      type: "p",
      text: "Pense-y comme donner à Claude une fiche de poste pour une tâche précise. Plutôt que de réexpliquer ce que tu veux, tu installes le skill une fois et tu l'invoques au besoin. C'est exactement ce qu'est un « employé IA » sur la carte SkillTree · un fichier de skill qui fait un vrai travail dans ton activité : recherche commerciale, reporting client, traitement de factures, mise à jour CRM, onboarding.",
    },
    { type: "p", text: "Les skills viennent de trois endroits :" },
    {
      type: "ul",
      items: [
        "Natifs · livrés avec Claude Code, aucune configuration nécessaire",
        "SkillTree · les 79 fichiers de skill exécutables que tu débloques sur la carte, chacun un employé IA que tu installes dans ton propre Claude Code en une commande",
        "Sur mesure · des skills que tu écris toi-même pour un workflow qui t'est propre",
      ],
    },
    { type: "h2", text: "Les skills natifs à connaître" },
    { type: "p", text: "Tape /skills dans Claude Code pour voir tout ce qui est disponible. Les plus utiles :" },
    {
      type: "table",
      headers: ["Skill", "Ce qu'il fait", "Quand l'utiliser"],
      rows: [
        ["/review", "Relit du code ou de l'écrit pour la qualité · lance des agents en parallèle", "Après avoir fini un morceau de travail"],
        ["/simplify", "Nettoie les fichiers récemment modifiés pour l'efficacité et la réutilisation", "Après un gros build ou un refactor"],
        ["/debug", "Debug systématique avec analyse de cause racine", "Quand quelque chose casse et que tu ne sais pas pourquoi"],
        ["/loop", "Répète une tâche jusqu'à ce qu'une condition soit remplie", "Pour du monitoring, du polling ou de l'itération"],
        ["/batch", "Lance la même tâche sur plusieurs entrées en parallèle", "Quand tu as le même travail à faire sur plein de fichiers ou d'éléments"],
      ],
    },
    {
      type: "callout",
      variant: "tip",
      text: "La plupart des gens ignorent que ces skills existent. Essaie /review sur ce que tu viens d'écrire · du code, un brouillon d'email, un document. Tu obtiens une critique structurée en une trentaine de secondes. C'est le moyen le plus rapide de ressentir ce que fait un skill avant d'en installer un depuis la carte.",
    },
    { type: "h2", text: "Commandes clés à connaître" },
    { type: "p", text: "Au-delà des skills, ces commandes slash font gagner du temps au quotidien :" },
    {
      type: "table",
      headers: ["Commande", "Ce qu'elle fait"],
      rows: [
        ["/skills", "Liste tous les skills disponibles"],
        ["/compact", "Compresse l'historique de conversation pour libérer du contexte · à faire vers 50 % de remplissage"],
        ["/clear", "Démarre une session fraîche · à utiliser en changeant de tâche"],
        ["/diff", "Montre tous les changements faits par Claude dans la session en cours"],
        ["/config", "Règle ton style de réponse préféré (Explicatif, Concis ou Technique)"],
        ["/init", "Génère un CLAUDE.md de démarrage pour ton projet actuel"],
        ["/voice", "Active le push-to-talk · maintiens Espace pour dicter"],
      ],
    },
    { type: "h2", text: "Installer un skill depuis la carte SkillTree" },
    {
      type: "p",
      text: "Les skills que tu débloques sur la carte s'installent de la même façon · chacun est un fichier SKILL.md qui atterrit dans ton projet (ou dans ~/.claude/skills/ pour un skill global) et devient invocable par son nom. Ouvre le skill sur la carte, suis sa commande d'installation, et il est actif dès la session suivante. À partir de là, tu l'invoques comme n'importe quel skill natif.",
    },
    {
      type: "p",
      text: "Le principe de la carte, c'est que tu n'écris aucun de ces skills à partir de zéro. Tu parcoures les métiers des sept départements d'une entreprise, tu trouves l'employé IA qui fait le travail dont tu en as marre, et tu l'installes. Chacun lit déjà ton Brain, donc il arrive en connaissant ton activité.",
    },
    { type: "h2", text: "Écrire le tien" },
    {
      type: "p",
      text: "Quand aucun skill n'existe pour un travail que tu fais souvent, tu en écris un. Un skill est juste un fichier SKILL.md avec un nom, une description de quand l'utiliser, et les étapes que Claude doit suivre. Commence par faire la tâche manuellement avec Claude quelques fois, puis demande-lui de transformer ce workflow en fichier de skill. C'est toute la boucle · le faire une fois bien, le capturer, ne plus jamais avoir à l'expliquer.",
    },
  ],
};

export default lesson;
