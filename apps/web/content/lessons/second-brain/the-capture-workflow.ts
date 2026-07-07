import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Le workflow de capture",
  estMin: 8,
  dek: "La plupart de la connaissance ne démarre pas en texte. Elle démarre en vidéo, en conférence, en mémo vocal, en appel client. Un workflow de capture simple referme l'écart entre « j'ai entendu un truc utile » et « Claude peut le retrouver ».",
  blocks: [
    { type: "p", text: "Un Brain ne vaut que ce que tu lui donnes. Les deux premières couches donnent à Claude un cerveau et un moyen de l'interroger. Cette couche garde le Brain nourri." },
    { type: "h2", text: "L'écart où la connaissance meurt" },
    {
      type: "p",
      text: "La connaissance la plus difficile à capturer n'est pas dans les documents · elle est dans les têtes des gens et dans ce que tu regardes et écoutes. Tu choisis Postgres plutôt que Mongo, peut-être que la décision est écrite quelque part. Mais le raisonnement, les arbitrages, le contexte qui rendait ça évident · c'est perdu.",
    },
    {
      type: "p",
      text: "Pareil pour chaque conférence YouTube, session de talk, mémo vocal et réunion client. L'écart entre « j'ai regardé un truc utile » et « Claude peut le retrouver » est là où la plupart de la connaissance meurt. La capture doit être une seule étape, sinon ça n'arrivera pas.",
    },
    { type: "h2", text: "Le workflow de capture en deux étapes" },
    { type: "p", text: "Pas besoin de CLI magique. Deux étapes, toutes deux avec des outils qui existent déjà. Récupère un transcript, puis laisse Claude le transformer en note structurée dans ton Brain." },
    { type: "h3", text: "Étape 1 · Récupère le transcript" },
    {
      type: "ul",
      items: [
        "Un appel enregistré est déjà transcrit si tu utilises Fireflies, Otter ou Granola · exporte le transcript en texte.",
        "Une conférence YouTube · récupère les sous-titres en local, sans avoir à la re-regarder.",
        "Un enregistrement local ou un mémo vocal · transcris-le sur ta propre machine avec Whisper.",
      ],
    },
    { type: "code", lang: "bash", code: 'yt-dlp --write-auto-subs --skip-download --sub-format vtt "https://youtube.com/watch?v=..."' },
    { type: "code", lang: "bash", code: 'pip install -U openai-whisper\nwhisper "/chemin/vers/reunion.mp4" --model small --output_format txt' },
    { type: "h3", text: "Étape 2 · Laisse Claude le classer dans ton Brain" },
    { type: "p", text: "Ouvre Claude Code dans ton vault et colle ceci, en le pointant vers le transcript :" },
    {
      type: "code",
      lang: "text",
      code:
        "Lis ce transcript et ajoute-le à mon Brain (chemin de fichier ou collé ci-dessous).\n\n1. Extrais seulement la connaissance durable : affirmations distinctes,\n   frameworks ou modèles mentaux nommés, techniques actionnables, et\n   exemples concrets avec contexte. Saute le remplissage et le small talk.\n2. Écris UNE seule note dans inbox/ avec un nom de fichier en titre-en-prose\n   (une affirmation falsifiable, pas un sujet), un frontmatter (source,\n   date, type), et des wiki-liens vers les notes déjà liées dans le vault.\n3. Imprime un résumé de 3 lignes de ce que tu as capturé et où tu l'as classé.",
    },
    { type: "p", text: "Tout reste sur ta machine : Whisper transcrit en local, et Claude lit le transcript et écrit la note. Un transcript en entrée · une note structurée, liée, récupérable en sortie." },
    {
      type: "callout",
      variant: "warning",
      title: "Capture avant que le détail s'évapore",
      text: "La connaissance à plus forte valeur est verbale · ce qui a été dit en appel, le raisonnement derrière une décision, le framework lâché en plein talk. Enregistre chaque appel, puis lance le workflow de capture dans les 24 heures, tant que tu te souviens encore du contexte. Un talk de 90 minutes que tu ne reregarderais jamais devient 12 à 18 affirmations récupérables. Fais-en un réflexe : appel terminé, transcription, classement.",
    },
    { type: "p", text: "Ce que tu obtiens d'un seul talk de 90 minutes :" },
    {
      type: "ul",
      items: [
        "12 à 18 affirmations distinctes qui valent d'être conservées",
        "3 à 5 frameworks ou modèles mentaux nommés",
        "5 à 8 techniques actionnables",
        "2 à 4 exemples concrets avec contexte",
      ],
    },
    { type: "p", text: "C'est le matériau qui compose quand Claude le récupère six semaines plus tard sur un problème complètement différent." },
    { type: "h2", text: "Pourquoi ça compte pour les réunions" },
    { type: "p", text: "Les réunions étaient autrefois le puits sans fond de la connaissance. Maintenant tu enregistres chaque conversation, tu lances le workflow de capture sur le transcript, et la connaissance tacite enfermée dans les têtes devient un nœud structuré de ton graphe de Brain." },
    { type: "p", text: "Ce n'est pas des résumés de réunion que personne ne relit. C'est une synchronisation active entre ta pensée et sa représentation externalisée · la version d'elle-même que Claude peut vraiment chercher." },
    { type: "h2", text: "Le graphe qui s'auto-améliore" },
    { type: "p", text: "C'est la partie qui change tout. Les agents ne s'ennuient pas de la maintenance. Ils ne sautent pas la mise à jour parce qu'ils sont en retard à une réunion. Ce qui a tué chaque wiki est exactement ce pour quoi les agents sont faits." },
    { type: "p", text: "Avec le temps, le système :" },
    {
      type: "ul",
      items: [
        "Remarque quand deux notes se contredisent et signale la tension",
        "Remarque quand la spec est désynchronisée du code",
        "Accumule automatiquement les signaux de friction",
        "Propose des changements structurels quand l'architecture crée du frottement",
      ],
    },
    { type: "p", text: "Il refactore ses propres instructions. Il fait évoluer sa propre structure. Le Brain arrête d'être quelque chose que tu maintiens et commence à être quelque chose qui se maintient lui-même." },
    { type: "h2", text: "Le rythme hebdomadaire" },
    { type: "p", text: "La capture est l'étape un. Le traitement est l'étape deux. Fixe une revue récurrente de 20 minutes :" },
    {
      type: "ul",
      items: [
        "Traiter l'inbox/ · promouvoir les captures en connaissance triée, supprimer le bruit",
        "Revoir tes fichiers de mémoire, élaguer ce qui est périmé",
        "Confirmer que les sources récentes les plus précieuses ont bien été ingérées",
      ],
    },
    {
      type: "quote",
      text: "L'illettré du 21e siècle ne sera pas celui qui ne sait ni lire ni écrire, mais celui qui ne sait pas apprendre, désapprendre et réapprendre.",
      cite: "en paraphrasant Alvin Toffler",
    },
    { type: "p", text: "Un Brain qui ingère, traite et élague est une entreprise qui apprend plus vite qu'elle n'oublie." },
    { type: "h2", text: "Commence ici" },
    { type: "p", text: "N'essaie pas de tout ingérer. Lance le workflow de capture sur tes trois derniers enregistrements les plus précieux · les talks ou appels dont tu voudrais vraiment que Claude se souvienne. Fais ensuite de la capture un réflexe : chaque appel, chaque talk, transcris et classe. Le graphe compose à partir de là." },
  ],
};

export default lesson;
