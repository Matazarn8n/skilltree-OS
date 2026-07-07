import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Ta checklist de première victoire",
  estMin: 6,
  dek: "Un plan jour par jour pour avoir Claude Code opérationnel, ton Brain démarré, et ton premier employé IA au travail sur du réel · en 7 jours.",
  blocks: [
    { type: "p", text: "Ne te contente pas de lire ça. Travaille-le dans l'ordre. Chaque jour s'appuie sur le précédent." },
    { type: "h2", text: "Jour 1 · Fais tourner Claude Code (30 min)" },
    {
      type: "ul",
      items: [
        "Installe Claude Code · suis les étapes de Fondations Claude Code",
        "Crée ton premier dossier de projet",
        "Confirme que Claude répond dans ton terminal",
        "Tape /skills pour voir tous les skills déjà présents sur ta machine · essaie /review sur n'importe quel fichier",
      ],
    },
    {
      type: "p",
      text: "Tu n'as pas besoin de comprendre ce qui se passe sous le capot. Suis les étapes, et quand quelque chose casse, colle l'erreur dans Claude.",
    },
    { type: "h2", text: "Jour 2 · Démarre ton Brain (45 min)" },
    {
      type: "ul",
      items: [
        "Configure ton CLAUDE.md avec le template de démarrage de Construis ton second cerveau",
        "Dis-lui qui tu es, ce que fait ton activité, ta stack, tes préférences",
        "Démarre la base de connaissance · dépose tes processus clés, tes clients, ton contexte projet",
      ],
    },
    {
      type: "p",
      text: "C'est la couche que chaque skill lit automatiquement. Plus tu mets ici, mieux tout ce que tu construis ensuite performera.",
    },
    { type: "h2", text: "Jour 3 · Installe ton premier skill depuis la carte (20 min)" },
    {
      type: "ul",
      items: [
        "Ouvre la carte SkillTree et choisis un métier pertinent pour toi · recherche commerciale, reporting client ou traitement de factures est un bon premier choix",
        "Installe ce skill dans ton Claude Code",
        "Fais-le tourner sur quelque chose de réel · un prospect, un client, une vraie facture",
      ],
    },
    { type: "p", text: "C'est le moment où ça clique : un employé IA qui fait un vrai travail, en lisant le Brain que tu viens de construire." },
    { type: "h2", text: "Jour 4 · Connecte un outil de recherche (45 min)" },
    { type: "p", text: "Choisis-en un et fais-le tourner :" },
    {
      type: "ul",
      items: [
        "Exa · recherche sémantique propulsée par l'IA. Installation : claude mcp add exa -- npx -y exa-mcp-server puis demande à Claude de rechercher une entreprise ou un sujet",
        "Jina Reader · convertit n'importe quelle URL en markdown propre. Aucune installation · demande à Claude : lis cette page : r.jina.ai/[url]",
        "Firecrawl · scrape des sites entiers en données structurées. Installation : claude mcp add firecrawl -- npx -y firecrawl-mcp",
      ],
    },
    { type: "p", text: "Pointe-le sur quelque chose de réel · le site d'un prospect, un concurrent, un marché qui t'intéresse. Regarde ce que Claude fait avec des données live." },
    { type: "h2", text: "Jour 5 · Connecte ton premier MCP (20 min)" },
    {
      type: "ul",
      items: [
        "Connecte le MCP Notion ou le MCP Gmail · celui que tu utilises le plus. Les MCP sont couverts dans Fondations Claude Code",
        "Demande à Claude de lire quelque chose de réel dans ton workspace",
        "Demande-lui d'écrire quelque chose en retour · un brouillon, un résumé, une tâche",
      ],
    },
    { type: "p", text: "Maintenant Claude ne fait plus que discuter. Il touche à tes vrais outils." },
    { type: "h2", text: "Jour 6–7 · Construis ton premier command center (1–2 h)" },
    {
      type: "ul",
      items: [
        "Ouvre les dashboards de SkillTree et choisis le command center le plus pertinent pour toi · Pipeline, Finance, Contenu, Outbound ou Ops",
        "Lis la page avant de toucher à quoi que ce soit · comprends ce qu'elle construit",
        "Lance le prompt de construction dans ton propre Claude Code",
        "Fais-le tourner sur des données réelles, même juste un petit lot de test",
      ],
    },
    {
      type: "p",
      text: "C'est ta première victoire : Claude Code qui tourne, ton Brain en vie, un employé IA qui travaille, et un command center qui montre ton activité en temps réel.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "L'élan bat la lecture d'avance",
      text: "Les gens qui obtiennent des résultats le plus vite ne sont pas les plus techniques · ce sont ceux qui finissent cette checklist au lieu de sauter au module suivant. Une seule vraie victoire qui tourne sur ta propre activité change ta façon de penser tout ce qui vient après. Construis d'abord. Développe ensuite.",
    },
  ],
};

export default lesson;
