import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Pourquoi tu as besoin d'un Brain",
  estMin: 7,
  dek: "Les skills que tu débloques dans SkillTree ne valent que le contexte qu'ils lisent. Le Brain est ce contexte. Voici pourquoi le construire avant de bâtir quoi que ce soit dessus.",
  blocks: [
    { type: "p", text: "Chaque skill SkillTree lit à un seul endroit : ton Brain." },
    {
      type: "p",
      text: "La carte te donne 78 employés IA. Les dashboards te donnent des command centers. Mais un skill qui rédige ton recap client, met à jour ton pipeline, ou recherche un prospect ne sert à rien s'il ne connaît pas ton activité. Il doit savoir qui sont tes clients, ce que tu as construit, comment tu parles, ce que tu as décidé le mois dernier. C'est ça le Brain · le second cerveau de ton entreprise, la base de connaissance à laquelle chaque skill puise automatiquement.",
    },
    { type: "p", text: "Construis-le une fois. Chaque skill devient plus intelligent gratuitement." },
    { type: "h2", text: "Le problème : l'amnésie de contexte" },
    { type: "p", text: "La plupart des gens ouvrent Claude et se mettent juste à taper. Ça marche pour des tâches ponctuelles. Ça s'effondre dès que tu fais tourner une vraie entreprise dessus." },
    {
      type: "p",
      text: "Sans système de mémoire, chaque session repart de zéro. Ton architecture, tes conventions, le détail client que tu as expliqué hier · disparu à la fermeture de la fenêtre. Tu brûles 30 à 40 minutes par session à réexpliquer ce que le modèle devrait déjà savoir. C'est une journée de travail complète par semaine, chaque semaine, juste à te répéter.",
    },
    { type: "p", text: "Les symptômes sont prévisibles :" },
    {
      type: "ul",
      items: [
        "Il reredemande des questions déjà répondues",
        "Il propose des patterns que tu as explicitement rejetés",
        "Il oublie des décisions prises trois sessions plus tôt",
        "Il traite ton activité comme s'il la voyait pour la première fois",
        "Il perd le raisonnement derrière les décisions, pas juste les décisions",
      ],
    },
    {
      type: "p",
      text: "Quand les gens disent que l'IA ne peut pas faire de vrai travail, ce qu'ils disent en réalité, c'est qu'ils lui ont donné un mauvais contexte. Le fix n'est pas un modèle plus intelligent. C'est un système de mémoire depuis lequel le modèle peut opérer.",
    },
    { type: "h2", text: "Pourquoi ça compose" },
    { type: "p", text: "Imagine deux opérateurs qui commencent tous les deux à faire tourner leur activité sur l'IA aujourd'hui :" },
    {
      type: "ul",
      items: [
        "L'opérateur A tape juste des prompts. Cold start à chaque session.",
        "L'opérateur B passe quelques heures à construire un Brain · clients, processus, décisions, notes de réunion · et le nourrit au fil de l'eau.",
      ],
    },
    {
      type: "p",
      text: "Après un mois, les sorties sont nettement différentes. Après six mois, l'écart est large. Après deux ans, l'opérateur B fait tourner un système qui connaît son activité à froid : chaque client, chaque processus, chaque décision, tout l'historique. L'opérateur A se réexplique encore à une fenêtre vide.",
    },
    { type: "p", text: "Le contexte compose. C'est tout le pari." },
    {
      type: "quote",
      text: "Tous les rendements dans la vie, que ce soit en richesse, en relations ou en connaissance, viennent des intérêts composés.",
      cite: "Naval Ravikant",
    },
    {
      type: "p",
      text: "Le Brain, c'est comment tu mets la connaissance de ton entreprise sur une courbe qui compose. Chaque réunion journalisée, chaque décision capturée, chaque processus écrit rend chaque future session meilleure · pas juste la prochaine.",
    },
    {
      type: "callout",
      variant: "key",
      title: "La thèse du contexte qui compose",
      text: "Un modèle plus intelligent te donne un bond ponctuel. Un Brain te donne une courbe. Chaque session dépose du contexte que la suivante lit, donc l'écart entre toi et quelqu'un qui repart à froid avec Claude s'élargit pour toujours. Le pari n'est pas sur le modèle. Il est sur la mémoire que tu construis derrière.",
    },
    { type: "h2", text: "Ce qu'est vraiment le Brain" },
    { type: "p", text: "Deux surfaces, un seul job : être la mémoire à laquelle chaque skill puise." },
    {
      type: "ul",
      items: [
        "Notion · structuré, collaboratif, IA-natif. Idéal pour les clients, les projets, le pipeline, et tout ce que touche une équipe ou un client.",
        "Obsidian · local, privé, basé sur un graphe. Idéal pour la connaissance personnelle profonde et la pensée, avec un graphe de connaissance que Claude peut interroger à l'exécution.",
      ],
    },
    { type: "p", text: "Beaucoup d'opérateurs font tourner les deux : Obsidian pour la connaissance et la pensée personnelles, Notion pour les clients et les projets. C'est une configuration valide, et le reste de ce module te montre comment construire chacune." },
    { type: "h2", text: "Ce que tu vas construire dans ce module" },
    {
      type: "ul",
      items: [
        "Ton Brain dans Notion · le cerveau d'entreprise structuré",
        "Ton Brain dans Obsidian · le graphe de connaissance local",
        "Le workflow de capture · comment la nouvelle connaissance se capture automatiquement",
        "Comment prompter ton Brain pour que le contexte arrive vraiment",
      ],
    },
    {
      type: "p",
      text: "La configuration technique de CLAUDE.md et des MCP vit dans Fondations Claude Code. Ce module concerne la construction de la couche de connaissance que ces outils lisent. Ne le saute pas · un skill sans Brain n'est qu'une supposition coûteuse.",
    },
  ],
};

export default lesson;
