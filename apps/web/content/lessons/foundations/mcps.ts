import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Les MCP : connecter Claude à ta stack",
  estMin: 12,
  dek: "Les MCP donnent à Claude un accès live à tes outils · Notion, Gmail, Google Calendar, GitHub, ton CRM. Ce que c'est, comment installer le premier, et la stack cœur à connecter.",
  blocks: [
    { type: "h2", text: "Qu'est-ce qu'un MCP ?" },
    { type: "p", text: "MCP veut dire Model Context Protocol · le standard ouvert pour connecter des agents IA à des outils et services externes." },
    {
      type: "p",
      text: "Sans MCP, Claude ne peut lire et écrire que des fichiers sur ta machine locale. Avec les MCP, Claude a un accès live à ta stack externe :",
    },
    {
      type: "ul",
      items: [
        "Lire et mettre à jour tes pages et bases Notion",
        "Chercher dans ta boîte Gmail et rédiger des réponses",
        "Vérifier ton Google Calendar et créer des événements",
        "Pousser des commits et gérer des repos GitHub",
        "Lire et mettre à jour deals et contacts dans ton CRM",
      ],
    },
    {
      type: "p",
      text: "La différence est significative. Une session Claude sans MCP est un assistant très intelligent assis dans une pièce sans téléphone ni internet. Les MCP lui donnent une ligne vers le monde extérieur. C'est ce qui transforme un skill de « rédige une relance » en « rédige la relance, l'envoie depuis ta boîte, et la journalise sur le deal ».",
    },
    { type: "h2", text: "Comment installer un MCP" },
    { type: "p", text: "Le pattern général :" },
    { type: "code", lang: "bash", code: "claude mcp add [nom] [flags de transport] [url-ou-commande-du-serveur]" },
    { type: "p", text: "Chaque MCP a sa propre commande d'installation. Voici le MCP Notion à essayer tout de suite :" },
    { type: "code", lang: "bash", code: "claude mcp add --transport http notion https://mcp.notion.com/mcp" },
    {
      type: "p",
      text: "Premier lancement : Claude ouvre ton navigateur pour t'authentifier avec ton compte Notion. Ensuite, c'est connecté en permanence.",
    },
    { type: "p", text: "Teste-le en demandant à Claude :" },
    { type: "code", lang: "text", code: "Lis ma page [nom de la page] dans Notion et donne-moi un résumé" },
    {
      type: "p",
      text: "Voir Claude lire une vraie page de ton propre workspace est en général le moment où ça clique. Il arrête d'avoir l'air d'un outil et commence à donner l'impression de connaître réellement ton monde.",
    },
    { type: "h2", text: "La stack cœur à connecter" },
    { type: "p", text: "Tu n'as pas besoin de tout ça dès le jour 1. Installe celui de l'outil que tu utilises le plus, puis ajoute les autres au fur et à mesure." },
    {
      type: "table",
      headers: ["MCP", "Idéal pour", "Installation"],
      rows: [
        ["Notion", "Gestion de connaissance, contexte projet, ton Brain", "claude mcp add --transport http notion https://mcp.notion.com/mcp"],
        ["Gmail", "Rédaction d'emails, recherche de boîte, automatisation de relance", "URL du serveur MCP Gmail + authentification navigateur"],
        ["Google Calendar", "Planification, briefings quotidiens, vérification de disponibilité", "URL du serveur MCP Calendar + authentification navigateur"],
        ["GitHub", "Gestion de code, création de repo, historique de commits", "claude mcp add --transport http github https://api.githubcopilot.com/mcp"],
        ["CRM (HubSpot / Attio)", "Suivi de pipeline, journalisation de contacts, mise à jour de deals", "URL du serveur MCP de ton CRM + authentification navigateur"],
      ],
    },
    {
      type: "p",
      text: "Chaque MCP s'authentifie de la même façon · lance la commande d'ajout, Claude ouvre ton navigateur, tu accordes l'accès, c'est connecté pour de bon. Pour voir ce qui est connecté à tout moment, lance claude mcp list.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Le piège d'authentification qui piège tout le monde",
      text: "Un connecteur installé n'est pas la même chose qu'un connecteur actif. Avec les MCP distants (ceux que tu ajoutes via le panneau connecteurs), Claude traite chaque discussion comme une instance neuve · si le connecteur n'est pas activé pour cette conversation précise, Claude te dira qu'il ne peut pas naviguer / atteindre l'outil. Premier réflexe si un MCP « ne marche pas » : ouvre le panneau connecteurs et vérifie qu'il est vert. Pour les MCP en config locale, le piège équivalent est une config JSON malformée · souvent une virgule traînante. Colle-la dans jsonlint.com en cas de doute.",
    },
    { type: "h2", text: "Deux exemples travaillés" },
    { type: "p", text: "Le pattern est toujours le même · seul change ce que tu branches. En voici deux qui transforment Claude en quelque chose que la plupart des gens paient." },
    { type: "h3", text: "Donner à Claude un vrai navigateur · TinyFish" },
    {
      type: "p",
      text: "Par défaut, Claude ne peut pas consulter une page web live, extraire des données locales d'entreprises, ou opérer sur un site. TinyFish est un MCP qui lui donne un vrai navigateur qu'il peut naviguer, cliquer, et dont il peut extraire des données structurées. Ajoute-le comme connecteur personnalisé avec cette URL distante :",
    },
    { type: "code", lang: "text", code: "https://agent.tinyfish.ai/mcp" },
    {
      type: "p",
      text: "Récupère une clé gratuite sur tinyfish.ai d'abord, puis : Claude → + → Ajouter un connecteur → Gérer les connecteurs → + Ajouter un connecteur personnalisé, nomme-le TinyFish, colle l'URL ci-dessus, clique sur Connecter, et termine la connexion. Active-le dans la discussion, puis essaie :",
    },
    {
      type: "code",
      lang: "text",
      code: "Trouve les 20 meilleurs restaurants de pizza à Austin, au Texas. Pour\nchacun, extrais nom, note Google, nombre d'avis, site web et téléphone.\nRetourne sous forme de tableau.",
    },
    { type: "p", text: "C'est de la recherche outbound · le genre de chose que les agences paient à Apollo ou Clay · qui tourne sur n'importe quelle ville ou niche." },
    { type: "h3", text: "Pousser du cold email dans ta stack d'envoi · Smartlead" },
    {
      type: "p",
      text: "Claude rédige un excellent cold email mais ne peut pas le faire atterrir en boîte de réception · c'est de l'infrastructure de délivrabilité (warmup, santé de domaine, rotation de boîtes). Smartlead gère cette couche. Il n'y a pas encore de MCP Smartlead officiel, mais tu n'en as pas besoin : Smartlead a une API REST, et Claude Code peut l'appeler directement avec ta clé.",
    },
    {
      type: "p",
      text: "Récupère la clé depuis Smartlead → Settings → Integrations → API Keys → Generate API Key, garde-la dans le .env de ton projet sous SMARTLEAD_API_KEY (ne colle jamais une clé dans une discussion). Décris ensuite le résultat voulu et laisse Claude rédiger et créer la campagne :",
    },
    {
      type: "code",
      lang: "text",
      code: "Écris une séquence de cold email en 4 étapes pour [ICP] vendant [offre],\naccrochée sur [douleur]. Crée-la ensuite dans Smartlead comme NOUVELLE\ncampagne via leur API REST (clé dans .env sous SMARTLEAD_API_KEY), et\nlaisse-la EN PAUSE pour que je relise avant tout envoi.",
    },
    {
      type: "p",
      text: "Claude rédige la copy, appelle l'API Smartlead pour créer la campagne en pause, et te rapporte l'ID de campagne. Tu préfères rester manuel ? Retire la ligne « via leur API REST » et colle simplement la séquence rédigée dans le générateur de campagne de Smartlead toi-même.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Toujours créer en pause",
      text: "Fais de « laisse-la EN PAUSE pour que je relise avant tout envoi » une partie permanente de l'instruction · tu relis à la fois la séquence et la liste de leads avant qu'un seul email ne parte.",
    },
    { type: "h2", text: "MCP + skills = de vrais workflows" },
    { type: "p", text: "Le vrai pouvoir, c'est de les combiner. Exemple :" },
    {
      type: "ul",
      items: [
        "Tu termines un appel client",
        "Tu colles tes notes brutes dans Claude et tu lances un skill de notes de réunion",
        "Il produit un résumé structuré, des actions à mener, et un brouillon d'email de relance",
        "Avec le MCP Gmail actif, Claude envoie la relance directement depuis ta boîte",
        "Avec le MCP Notion actif, Claude journalise le résumé sur le projet du client",
      ],
    },
    {
      type: "p",
      text: "C'est une commande qui remplace vingt minutes de travail manuel. C'est le pattern autour duquel chaque employé IA de la carte SkillTree est construit · un skill pour le workflow, des MCP pour la portée vers tes vrais outils.",
    },
    { type: "h2", text: "Lance une vraie première session" },
    { type: "p", text: "Avec Claude Code installé, ton CLAUDE.md configuré, et au moins un MCP connecté, fais tourner un vrai travail de bout en bout :" },
    { type: "code", lang: "bash", code: "cd /ton-dossier-projet\nclaude" },
    { type: "p", text: "Oriente ensuite Claude et remets-lui quelque chose de précis :" },
    {
      type: "code",
      lang: "text",
      code: "Je travaille sur [projet]. Aujourd'hui je veux [tâche précise].\nVoici le contexte pertinent : [colle toute note ou détail]",
    },
    {
      type: "p",
      text: "Un prompt vague donne une sortie vague. Sois précis · « écris 3 variantes de cold email à [prospect] chez [entreprise] ; sa douleur est [douleur] ; mon angle est [angle] ; max 5 phrases chacune, un CTA par email » bat « aide-moi avec l'outbound » à chaque fois.",
    },
    {
      type: "p",
      text: "Avant de finir, lance /diff pour voir chaque fichier touché par Claude, et /compact quand la session s'allonge. Si quelque chose tourne mal, capture l'erreur et colle-la en retour, ou /clear et réessaie avec un prompt plus serré. Les erreurs font partie du processus · le but n'est pas de les éviter, c'est de devenir rapide à les réparer.",
    },
    {
      type: "quote",
      text: "La plus grande erreur qu'on puisse faire dans les premières étapes, c'est d'être impatient, d'exiger des progrès quand le monde demande d'absorber.",
      cite: "Robert Greene, La 50e loi",
    },
    {
      type: "p",
      text: "C'est la fondation. Claude Code est installé, configuré, et connecté à ta stack. Module suivant : construis ton Brain · le second cerveau que chaque skill lit.",
    },
  ],
};

export default lesson;
