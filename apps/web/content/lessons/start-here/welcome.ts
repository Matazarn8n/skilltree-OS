import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Bienvenue sur SkillTree",
  estMin: 3,
  dek: "Ce qu'est SkillTree, et ce que tu auras de fonctionnel une fois ce parcours terminé.",
  blocks: [
    { type: "p", text: "Bienvenue sur SkillTree." },
    {
      type: "p",
      text: "SkillTree est la console où tu construis ton second cerveau et où tu recrutes la force de travail IA qui fait tourner ton activité. Une seule idée sous-tend tout le reste : des systèmes IA qui délivrent vraiment de la valeur, pas des démos.",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "À la fin de ce parcours, tu n'auras pas regardé un cours · tu auras Claude Code qui tourne, ton Brain en vie, et tes premiers employés IA qui font du vrai travail dans ton activité. Tu construis dans SkillTree. Tu ne le regardes pas.",
    },
    {
      type: "p",
      text: "Tu ne regardes pas SkillTree, tu construis dedans. Trois surfaces font le travail :",
    },
    {
      type: "ul",
      items: [
        "La Carte · une carte interactive des métiers des 7 départements d'une entreprise, avec des fichiers de skill exécutables. Chacun est un employé IA que tu installes dans ton propre Claude Code pour faire un vrai travail : recherche commerciale, reporting client, traitement de factures, mise à jour CRM, onboarding.",
        "Les tableaux de bord · des command centers prêts à construire (Ads Meta, Pipeline, Finance, Contenu, Outbound, Ops). Chacun embarque un prompt qui bâtit le dashboard dans ton propre Claude Code.",
        "Le Brain · ton second cerveau. La base de connaissance de l'entreprise que chaque skill lit automatiquement, pour que rien ne reparte d'un cold start.",
      ],
    },
    { type: "h2", text: "Ce que tu auras de fonctionnel à la fin de ce parcours" },
    {
      type: "ul",
      items: [
        "Claude Code installé et configuré sur ta machine",
        "Ton Brain démarré · un CLAUDE.md et une base de connaissance qui disent à Claude qui tu es et comment tourne ton activité",
        "Tes premiers employés IA installés depuis la carte et en train de faire du vrai travail",
        "Ton premier command center construit et branché sur des données live",
        "Une façon claire d'auditer n'importe quelle entreprise · la tienne ou celle d'un client · pour trouver où l'IA rapporte",
      ],
    },
    {
      type: "p",
      text: "Voici le parcours guidé complet : Commence ici → Fondations Claude Code → Construis ton second cerveau. Commence ici. Lis tout avant d'ouvrir un terminal. Le contexte que tu bâtis dans ces leçons rend chaque étape technique qui suit plus rapide et plus déliberée.",
    },
  ],
};

export default lesson;
