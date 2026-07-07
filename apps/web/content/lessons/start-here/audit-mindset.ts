import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "L'état d'esprit de l'audit",
  estMin: 6,
  dek: "Comment repérer les opportunités d'automatisation dans n'importe quelle entreprise · la tienne ou celle d'un client. Quoi chercher, quelles questions poser, et à quoi ressemble le résultat.",
  blocks: [
    {
      type: "quote",
      text: "Il n'y a rien d'aussi inutile que de faire efficacement ce qui ne devrait pas être fait du tout.",
      cite: "Peter Drucker",
    },
    { type: "p", text: "Avant de construire quoi que ce soit, tu audites." },
    {
      type: "p",
      text: "Un audit est simplement une façon structurée de répondre à une question : où cette entreprise fait-elle du travail manuel et répétitif qui pourrait être pris en charge par un système ?",
    },
    {
      type: "callout",
      variant: "key",
      title: "Idée clé",
      text: "La plupart des gens qui « font de l'IA » balancent des prompts au hasard sur des tâches au hasard et se demandent pourquoi rien ne compose. Le fix n'est pas un meilleur prompt · c'est de s'arrêter assez longtemps pour trouver où est vraiment l'argent. Le but est de trouver les automatisations à 200 000 €, pas celles à 200 €.",
    },
    { type: "h2", text: "Le mouvement : construis un agent d'audit, pas un prompt jetable" },
    {
      type: "p",
      text: "Ne colle pas un prompt, ne l'exécute pas une fois pour le perdre ensuite. Monte un Agent d'Audit une bonne fois pour toutes et garde-le pour toujours · relance-le le trimestre prochain, ou pointe-le vers une nouvelle partie de ton activité. C'est un Projet Claude avec toute la méthodologie intégrée : comment t'interviewer, comment scorer honnêtement, quoi restituer. Cinq minutes pour le monter, aucun code, marche sur n'importe quel plan.",
    },
    {
      type: "ol",
      items: [
        "Dans Claude, crée un nouveau Projet (barre latérale gauche → New Project). Appelle-le « Audit d'automatisation ».",
        "Ouvre les instructions personnalisées du Projet.",
        "Colle l'agent d'audit dedans. Enregistre.",
        "Démarre une nouvelle discussion dans ce Projet et tape « Commençons l'audit ».",
      ],
    },
    {
      type: "p",
      text: "L'agent tourne en trois phases · Capture (t'interviewe une question à la fois pour bâtir un inventaire de 12 à 15 processus), Rank (score chacun par ROI honnête), et Brief (transforme ton opportunité n°1 en un brief de construction d'une page). Il audite la réalité mieux que ta mémoire, donc dépose des transcripts d'appels, des SOP ou ta liste d'outils avant de démarrer et il pré-remplit l'essentiel de l'inventaire lui-même.",
    },
    { type: "h2", text: "Les trois questions qui font remonter les meilleures opportunités" },
    {
      type: "ul",
      items: [
        "À quoi passes-tu le plus clair de ton temps ?",
        "Quelles tâches sont à fort volume mais ne demandent pas beaucoup de réflexion · elles doivent juste être faites ?",
        "Quels sont les goulots d'étranglement qui ralentissent le revenu, la livraison ou les opérations ?",
      ],
    },
    {
      type: "p",
      text: "Les meilleurs candidats sont répétables, pourraient être écrits comme une SOP en moins de 30 minutes, et ont un coût clair quand ça se passe mal ou que ça prend trop de temps.",
    },
    {
      type: "p",
      text: "Exemples courants : recherche commerciale, rédaction d'emails de prospection, lecture et traitement de factures, mise à jour des fiches CRM après les appels, génération de rapports clients, onboarding de nouveaux clients, planification et relances.",
    },
    { type: "h2", text: "À quoi ressemble un bon résultat d'audit" },
    {
      type: "p",
      text: "Un tableau simple. Pas un long rapport. Quelque chose que tu peux poser devant un client ou utiliser toi-même :",
    },
    {
      type: "table",
      headers: ["Processus", "Fréquence", "Heures/semaine", "Coût horaire", "Coût annuel", "Potentiel d'automatisation"],
      rows: [
        ["Recherche commerciale", "Quotidien", "5 h", "40 €", "10 400 €", "Élevé"],
        ["Reporting client", "Hebdo", "3 h", "40 €", "6 240 €", "Élevé"],
        ["Traitement de factures", "Hebdo", "2 h", "35 €", "3 640 €", "Élevé"],
      ],
    },
    {
      type: "p",
      text: "Quand tu mets des chiffres à côté des tâches, la conversation change. L'agent score honnêtement pour que tu puisses défendre chaque ligne · coût annuel, puis une part automatisable conservatrice (la fraction que l'IA peut vraiment posséder de bout en bout), puis les économies réalisées avec une décote délibérée de 0,7 pour la relecture et la montée en charge. Ne suppose jamais 100 % de capture.",
    },
    { type: "h2", text: "Comment lire le ROI" },
    {
      type: "table",
      headers: ["Multiple de ROI", "À faire"],
      rows: [
        ["15x et plus", "Construis maintenant. C'est par là que tu commences."],
        ["5–15x", "Mets-le en file pour le trimestre prochain."],
        ["2–5x", "Vaut le coup une fois les victoires évidentes livrées."],
        ["Moins de 2x", "Passe · sauf si le score de douleur est de 5."],
      ],
    },
    {
      type: "p",
      text: "Une exception au calcul : un processus à faible ROI avec un score de douleur de 5 peut quand même valoir la peine d'être automatisé. Si une tâche épuise silencieusement la personne qui la fait, l'économie de rétention n'apparaît jamais dans le tableau mais elle est réelle. Dis-le à l'agent et il en tiendra compte.",
    },
    { type: "h2", text: "Ne trébuche pas sur ça" },
    {
      type: "ul",
      items: [
        "Estimer la fréquence de mémoire. Une tâche « hebdomadaire » est souvent trois ou quatre fois par semaine une fois qu'on la suit vraiment. Sois honnête avec l'agent · il challenge, mais il ne voit pas ton agenda.",
        "Faire confiance au premier chiffre. Les estimations sont une position de départ à challenger, pas un verdict. Presse les trois hypothèses que l'agent signale avant de chiffrer quoi que ce soit à un client.",
        "Automatiser un processus cassé. Corrige d'abord le workflow. Automatiser un bazar rend juste le bazar plus rapide et plus difficile à voir.",
        "Aucun propriétaire nommé. Chaque automatisation validée a besoin d'une personne responsable. Pas « l'IA ». Un nom.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Astuce",
      text: "Après la Phase 2, l'agent nomme ton opportunité la plus rentable. En Phase 3 il la transforme en brief de construction d'une page : le résultat visé, ce que fait l'automatisation, ce qui reste humain, les systèmes touchés, les risques, et un business case en deux lignes. Exécute-le sur ton top 1 ou 2, puis va les construire · c'est exactement à ça que servent la carte et les dashboards SkillTree.",
    },
  ],
};

export default lesson;
