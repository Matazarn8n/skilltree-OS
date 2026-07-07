import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Construire avec du contexte dès le jour 1",
  estMin: 5,
  dek: "Pourquoi la façon dont tu configures ton environnement dès le départ détermine la qualité de tout ce que tu construis ensuite. La philosophie de CLAUDE.md, des seconds cerveaux, et de l'infrastructure de contexte.",
  blocks: [
    { type: "p", text: "La plupart des gens ouvrent Claude Code pour la première fois et se mettent juste à taper." },
    {
      type: "p",
      text: "Ça marche pour des tâches simples. Ça ne marche pas pour construire des systèmes, gérer des projets clients, ou obtenir des résultats cohérents d'une session à l'autre. Sans contexte, Claude repart de zéro à chaque fois. Il ne connaît ni ton activité, ni tes clients, ni tes préférences, ni ta stack. Chaque session est un cold start.",
    },
    {
      type: "p",
      text: "Les gens qui obtiennent les meilleurs résultats de Claude Code ne sont pas les plus techniques. Ce sont ceux qui ont investi dans l'infrastructure de contexte · les fichiers, dossiers et documents qui disent à Claude exactement qui ils sont, ce qu'ils construisent, et comment ils veulent travailler.",
    },
    { type: "p", text: "L'outil principal pour ça, c'est CLAUDE.md." },
    { type: "h2", text: "Ce qu'est CLAUDE.md" },
    {
      type: "p",
      text: "CLAUDE.md est un fichier markdown qui vit dans ton dossier projet ou ton répertoire Claude global. À chaque démarrage de session, Claude le lit. Il devient ta couche d'instruction permanente · le contexte toujours présent sans que tu aies à te répéter.",
    },
    { type: "p", text: "Un bon CLAUDE.md dit à Claude :" },
    {
      type: "ul",
      items: [
        "Qui tu es et ce que fait ton activité",
        "Sur quoi tu travailles en ce moment",
        "Tes préférences de communication",
        "Ta stack technique",
        "Les contacts clés et le contexte client",
        "Comment tu veux qu'il se comporte",
      ],
    },
    { type: "p", text: "Plus ce fichier est précis, meilleurs seront tes résultats. Pas juste sur une session · sur chaque session, en permanence." },
    { type: "h2", text: "Pourquoi ça compose" },
    { type: "p", text: "Imagine deux personnes qui commencent à utiliser Claude Code aujourd'hui :" },
    {
      type: "ul",
      items: [
        "La personne A tape juste des prompts dans le terminal",
        "La personne B passe 20 minutes à monter un vrai CLAUDE.md, connecte Notion via MCP, et documente ses processus au fil de l'eau",
      ],
    },
    {
      type: "p",
      text: "Après un mois, les résultats sont nettement différents. Après six mois, l'écart est significatif. Après deux ans, la personne B fait tourner un système qui connaît son activité en profondeur · ses clients, ses processus, ses préférences, son historique. La personne A repart encore de zéro à chaque session.",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "Le contexte compose. C'est le pari. Ceux qui gagnent avec Claude Code ne sont pas les plus techniques · ce sont ceux qui ont investi tôt dans leur Brain et l'ont laissé rapporter à chaque session ensuite.",
    },
    {
      type: "quote",
      text: "Tous les rendements dans la vie, que ce soit en richesse, en relations ou en connaissance, viennent des intérêts composés.",
      cite: "Naval Ravikant",
    },
    { type: "h2", text: "À quoi ressemble une bonne infrastructure de contexte" },
    { type: "p", text: "Pas besoin que ce soit compliqué. Les bases :" },
    {
      type: "ul",
      items: [
        "Un CLAUDE.md global avec ton identité, ta stack et tes préférences",
        "Des CLAUDE.md au niveau projet pour chaque client ou build",
        "Un workspace Notion avec des pages structurées pour les clients, les processus et les projets actifs",
        "Une documentation de processus écrite au fil de l'eau · pas parfaitement, juste avec constance",
      ],
    },
    {
      type: "p",
      text: "La mise en place technique de tout ça arrive dans Fondations Claude Code. Le but de cette leçon est de comprendre pourquoi ça compte avant de le mettre en place. Les gens qui comprennent pourquoi ils font quelque chose le mettent en place correctement. Ceux qui ne comprennent pas le sautent ou le font mal.",
    },
    { type: "p", text: "Ne le saute pas." },
  ],
};

export default lesson;
