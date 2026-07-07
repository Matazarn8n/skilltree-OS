import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Comment Claude Code fonctionne vraiment",
  estMin: 10,
  dek: "Le modèle mental. Fenêtres de contexte, comment Claude lit ton projet, et pourquoi c'est fondamentalement différent d'utiliser Claude dans un navigateur.",
  blocks: [
    {
      type: "quote",
      text: "Je programme vraiment surtout en anglais maintenant · je dis au LLM en mots quel code écrire. Ça pique un peu l'ego. Mais le pouvoir d'opérer sur du logiciel à travers de grandes actions de code est juste trop net-utile.",
      cite: "Andrej Karpathy, cofondateur d'OpenAI",
    },
    { type: "h2", text: "Claude Code n'est pas un chatbot" },
    {
      type: "p",
      text: "Quand tu utilises Claude dans un navigateur, tu as une conversation. Il peut se souvenir de choses d'une session à l'autre avec la mémoire activée, mais il n'a aucun accès à tes fichiers, ne peut pas lancer de commandes, et ne peut pas agir en ton nom.",
    },
    {
      type: "p",
      text: "Claude Code est différent. Quand tu lances claude depuis un dossier de projet, il lit tout ce qu'il contient · tes fichiers, tes notes, ton code, ta documentation. Il peut éditer des fichiers, lancer des commandes, vérifier les erreurs, et agir pour toi. C'est un agent, pas une interface de discussion.",
    },
    { type: "p", text: "La distinction n'est pas la mémoire · c'est l'agentivité. Claude Code fait vraiment des choses dans ton environnement, il ne fait pas que te répondre." },
    { type: "h2", text: "IA-augmenté vs IA-natif" },
    {
      type: "p",
      text: "C'est le fossé que la plupart des gens ne franchissent jamais. La majorité utilise l'IA comme un Google plus rapide : poser une question, obtenir une réponse, fermer l'onglet. Même workflow, un peu plus rapide. Les opérateurs qui prennent de l'avance font tourner toute leur activité via des systèmes qui connaissent déjà leur contexte et exécutent en leur nom.",
    },
    {
      type: "table",
      headers: ["IA-augmenté", "IA-natif"],
      rows: [
        ["Utilise l'IA pour des tâches ponctuelles", "L'IA gère des workflows entiers"],
        ["Réexplique le contexte à chaque session", "L'IA a un contexte business permanent"],
        ["Attend que l'IA réponde", "L'IA travaille pendant le sommeil"],
        ["Gain de productivité : 2–3x", "Gain de productivité : 10–50x"],
      ],
    },
    {
      type: "p",
      text: "Claude Code est ce qui rend ce saut possible. Ce n'est pas un chatbot · c'est un agent avec un harnais. Il lit et écrit des fichiers, lance des commandes, navigue sur le web, et se connecte à tes outils. Il opère sur ton activité réelle, pas juste dans une fenêtre de discussion.",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "Le contexte est tout. Plus Claude a de contexte pertinent, meilleure est sa sortie. Une session avec un dossier projet bien structuré, un bon CLAUDE.md, et des MCP connectés produit des résultats nettement meilleurs qu'un terminal vide. Chaque skill que tu installes depuis la carte SkillTree tourne mieux quand le contexte autour est riche.",
    },
    { type: "h2", text: "La fenêtre de contexte" },
    {
      type: "p",
      text: "Claude a une fenêtre de contexte limitée · la quantité d'information qu'il peut garder en tête à un instant donné. Pense-y comme une mémoire de travail à court terme. Plus une session dure longtemps, plus le contexte se remplit d'échanges précédents.",
    },
    {
      type: "p",
      text: "Quand le contexte devient trop plein, Claude commence à perdre le fil des instructions et détails précédents. C'est la « zone bête de l'agent ». Tu le remarques quand Claude se répète, ignore des instructions antérieures, ou fait des erreurs qu'il ne faisait pas avant.",
    },
    { type: "p", text: "Comment gérer le contexte :" },
    {
      type: "ul",
      items: [
        "Lance /compact quand ta session devient longue · ça résume la conversation et libère de la place. Fais-le proactivement autour de 50 % de remplissage, pas quand ça part déjà en vrille.",
        "Lance /clear pour repartir complètement à zéro quand tu changes de tâche.",
        "Garde chaque session concentrée sur une seule tâche. Ne saute pas entre problèmes sans rapport dans la même session.",
      ],
    },
    { type: "h2", text: "Comment Claude lit ton projet" },
    {
      type: "p",
      text: "Quand tu lances claude depuis un dossier, Claude peut voir et lire chaque fichier de ce dossier. C'est pour ça que la structure du projet compte · un dossier bien organisé avec des noms de fichiers clairs donne à Claude une carte bien meilleure de ton projet qu'un dossier en désordre.",
    },
    { type: "p", text: "Une structure recommandée pour n'importe quel projet :" },
    {
      type: "code",
      lang: "text",
      code: "/mon-projet\n  CLAUDE.md          ← ton fichier d'instructions (couvert ensuite)\n  /src               ← code ou scripts\n  /docs              ← documentation, notes, SOP\n  /assets            ← fichiers de support",
    },
    {
      type: "p",
      text: "Tu n'as pas besoin de suivre ça à la lettre · le principe est que les noms de dossiers doivent décrire ce qu'ils contiennent. Claude lit les noms et la structure pour s'orienter, pas seulement le contenu des fichiers.",
    },
    {
      type: "p",
      text: "C'est aussi le socle sur lequel repose ton Brain. Une fois ton second cerveau construit, ce même comportement de lecture de projet est ce qui permet à chaque skill de puiser automatiquement le contexte de ton entreprise.",
    },
    { type: "h2", text: "Réflexes de power-user à connaître tôt" },
    {
      type: "p",
      text: "Tu n'en as pas besoin dès le jour 1, mais ça change la façon dont l'outil se ressent une fois que tu fais tourner du vrai travail dessus : /compact et /clear pour la gestion du contexte, /diff pour voir chaque changement fait par Claude dans la session en cours, et /config pour choisir ton style de réponse préféré.",
    },
  ],
};

export default lesson;
