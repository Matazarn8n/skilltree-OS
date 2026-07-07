import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Où en est l'IA aujourd'hui, et où elle va",
  estMin: 4,
  dek: "Un état des lieux honnête des systèmes IA actuels, pourquoi Claude Code compte, et à quoi ressemblent vraiment les deux prochaines années.",
  blocks: [
    { type: "p", text: "Voici le tableau honnête de la situation." },
    {
      type: "p",
      text: "Les outils sont déjà assez bons. Claude Code peut construire des systèmes en production. Les MCP peuvent le connecter à toute ta stack. Les skills peuvent lui donner un mode opératoire pour n'importe quelle tâche répétable. La technologie pour faire du travail réel et utile avec l'IA existe aujourd'hui · pas dans une future version, pas quand le prochain modèle sortira. Maintenant.",
    },
    { type: "p", text: "Ce qui manque à la plupart des gens, ce ne sont pas les outils. C'est la façon de penser." },
    {
      type: "p",
      text: "Une bonne partie du contenu IA actuel se concentre sur des automatisations qui font cool · techniquement impressionnantes mais déconnectées d'un vrai problème business :",
    },
    {
      type: "ul",
      items: [
        "Des chatbots que personne n'utilise",
        "Des workflows qui font gagner 10 minutes par semaine",
        "Des démos qui impressionnent sur LinkedIn mais ne délivrent aucun ROI",
      ],
    },
    {
      type: "p",
      text: "Le vrai changement, c'est de passer de « qu'est-ce que je peux construire avec l'IA » à « de quoi cette entreprise a-t-elle vraiment besoin, et est-ce que je peux chiffrer la valeur de le corriger ».",
    },
    { type: "h2", text: "La thèse du contexte · pourquoi les deux prochaines années vont tourner autour de ça plus que tout" },
    {
      type: "p",
      text: "Aujourd'hui, il existe encore un écart significatif entre ceux qui savent utiliser Claude Code et ceux qui ne savent pas. Cet écart se referme vite. Dans deux ans, la couche outils sera totalement démocratisée. Tout le monde aura accès aux mêmes modèles, aux mêmes MCP, au même écosystème de skills.",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "L'avantage concurrentiel ne sera pas les outils. Ce sera le contexte. Tout le monde aura les mêmes modèles et les mêmes MCP dans deux ans · l'avantage ira à celui qui a nourri ses outils avec la meilleure information. C'est tout le pari derrière ton Brain.",
    },
    {
      type: "p",
      text: "Les entreprises et les builders qui passent les deux prochaines années à construire intentionnellement une connaissance structurée · processus documentés, seconds cerveaux, contexte projet bien organisé, fichiers CLAUDE.md détaillés · obtiendront des sorties d'IA nettement meilleures que ceux qui ne l'ont pas fait. Pas parce qu'ils ont de meilleurs outils. Parce qu'ils ont donné à leurs outils une meilleure information avec laquelle travailler.",
    },
    { type: "quote", text: "2025–2035 est la décennie des agents.", cite: "Andrej Karpathy, cofondateur d'OpenAI" },
    {
      type: "p",
      text: "Le contexte est de l'infrastructure. Ceux qui le traitent comme tel en ce moment construisent un avantage qui compose dans le temps et qu'il sera très difficile de rattraper plus tard.",
    },
    {
      type: "p",
      text: "SkillTree est construit autour de cette idée. Tout ici · les skills, les MCP, la philosophie CLAUDE.md, le cadre d'audit · est de l'infrastructure de contexte.",
    },
  ],
};

export default lesson;
