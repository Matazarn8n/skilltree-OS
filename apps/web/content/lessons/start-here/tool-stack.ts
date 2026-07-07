import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "La stack d'outils optimale",
  estMin: 5,
  dek: "Une carte des outils qui composent une stack moderne de systèmes IA. Pas une plongée profonde · juste assez de contexte pour que rien ne paraisse étranger plus tard.",
  blocks: [
    {
      type: "p",
      text: "Tu n'as pas besoin d'utiliser tous ces outils. Tu dois savoir ce qu'ils sont et pourquoi ils existent, pour que le jour où ils surgissent dans une construction ou une conversation client, tu saches où ils se rangent.",
    },
    { type: "p", text: "Pense la stack en couches." },
    { type: "h2", text: "Le socle · l'écosystème Claude" },
    {
      type: "table",
      headers: ["Outil", "Ce qu'il fait"],
      rows: [
        ["Claude", "Discussion, recherche, rédaction"],
        ["Claude Code", "Construire et faire tourner des agents, dans le terminal"],
        ["Claude API", "Embarquer de l'intelligence dans des systèmes"],
      ],
    },
    { type: "p", text: "C'est la couche où tu passeras le plus de temps." },
    { type: "h2", text: "Connaissance et contexte" },
    {
      type: "ul",
      items: [
        "Notion · le choix par défaut pour les bases de connaissance structurées, les portails client, la doc projet et les seconds cerveaux. La plupart des systèmes ici sont construits autour.",
        "Obsidian · plus granulaire, local-first, open source. Meilleur pour la gestion de connaissance personnelle si tu veux garder le contrôle total de tes données.",
      ],
    },
    { type: "h2", text: "Workspace et connectivité" },
    {
      type: "ul",
      items: [
        "Google Workspace · Docs, Sheets, Gmail, Calendar, Drive. La plupart des clients l'utilisent déjà. Se connecte à Claude via MCP.",
      ],
    },
    { type: "h2", text: "CRM" },
    {
      type: "ul",
      items: [
        "HubSpot · le choix le plus courant pour les entreprises de service B2B. Bon support MCP, bonne gestion de pipeline.",
        "Airtable · plus flexible, meilleur pour des workflows sur mesure et de petites équipes.",
      ],
    },
    { type: "h2", text: "Recherche et scraping" },
    {
      type: "ul",
      items: [
        "Exa · recherche web sémantique pensée pour les agents. Trouve des pages contextuellement pertinentes, pas juste des correspondances de mots-clés.",
        "Jina Reader · convertit n'importe quelle URL en markdown propre que Claude peut lire. Aucune installation.",
        "Firecrawl · scrape des sites entiers en données structurées. Bon pour la veille concurrentielle et l'extraction de contenu.",
        "Apify · des acteurs de scraping tout prêts pour LinkedIn, Google Maps, Amazon, Instagram, et plus.",
      ],
    },
    { type: "h2", text: "Outbound" },
    {
      type: "ul",
      items: [
        "Apollo · sourcing de leads. Filtre par ICP, exporte en CSV ou pousse directement vers Clay.",
        "Clay · enrichissement et personnalisation de leads. Se connecte à l'API Claude pour générer une copy email personnalisée par lead.",
        "Instantly · envoi d'emails, séquençage, détection de réponse, rotation de boîtes.",
      ],
    },
    { type: "h2", text: "Infrastructure" },
    {
      type: "ul",
      items: [
        "Vercel · déploie des apps web et des dashboards en une commande.",
        "GitHub · contrôle de version. Chaque build, fichier de skill et template d'agent devrait y vivre.",
        "Supabase · base de données et backend open source. Bon pour les builds qui ont besoin de stocker et requêter des données.",
      ],
    },
    {
      type: "p",
      text: "Note sur n8n : encore utile pour certaines intégrations, mais largement dépassé par Claude Code pour l'essentiel de ce qu'on couvre ici. Claude Code peut désormais orchestrer directement via des API sans avoir besoin d'un constructeur de workflow séparé. Si tu l'utilises déjà, ça fonctionne très bien à côté de Claude Code · mais ce n'est pas quelque chose à apprendre pour les builds ici.",
    },
    {
      type: "p",
      text: "Tu n'as pas besoin de tout mettre en place le jour 1. Les builds et les MCP te diront exactement ce dont tu as besoin pour chaque système. Cet aperçu sert juste à ce que tu saches ce qu'est une chose la première fois que tu la croises.",
    },
  ],
};

export default lesson;
