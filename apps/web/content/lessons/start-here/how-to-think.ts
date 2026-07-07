import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Comment penser les systèmes IA",
  estMin: 5,
  dek: "Le cadre ROI-d'abord pour identifier ce qui vaut vraiment la peine d'être construit. Pourquoi la plupart des projets IA ne délivrent aucune valeur, et comment éviter ça dès le départ.",
  blocks: [
    {
      type: "p",
      text: "La plupart des gens qui se lancent dans l'IA passent beaucoup de temps à construire des choses qui n'ont pas d'importance.",
    },
    {
      type: "p",
      text: "Pas parce qu'ils sont mauvais en construction. Parce qu'ils sont partis de la mauvaise question. Ils ont demandé « qu'est-ce que je peux construire avec l'IA » au lieu de « de quoi cette entreprise a besoin, et comment je chiffre ça ».",
    },
    { type: "p", text: "Le résultat : beaucoup de démos impressionnantes et très peu de valeur réellement livrée." },
    {
      type: "quote",
      text: "Parce que la plupart de ce que nous disons et faisons n'est pas essentiel. Demande-toi à chaque instant : est-ce que c'est nécessaire ?",
      cite: "Marc Aurèle, Pensées pour moi-même",
    },
    { type: "h2", text: "Le cadre ROI-d'abord" },
    {
      type: "p",
      text: "Le cadre qui change tout, c'est de penser ROI-d'abord. Avant d'écrire une ligne de code ou de connecter un seul MCP, demande :",
    },
    {
      type: "ul",
      items: [
        "Qu'est-ce que ça économise ? Du temps, de l'argent, des effectifs, ou les trois ?",
        "Combien de fois est-ce que ça arrive ? Par jour, par semaine, par mois ?",
        "Combien ça coûte quand ça n'arrive pas, ou que ça arrive mal ?",
        "Est-ce que je peux mettre un chiffre là-dessus ?",
      ],
    },
    {
      type: "p",
      text: "Si tu peux répondre à ces questions, tu peux construire quelque chose qui compte et le pricer correctement. Si tu ne peux pas, tu es probablement en train de construire un gadget.",
    },
    { type: "h2", text: "Pourquoi les ventes et le marketing dominent" },
    {
      type: "p",
      text: "La raison pour laquelle tant de systèmes IA se construisent autour de l'outbound, de la recherche de leads, de la rédaction d'emails et du reporting est simple : le ROI est facile à chiffrer et le volume est toujours là.",
    },
    {
      type: "p",
      text: "Une équipe commerciale qui envoie 50 emails par jour manuellement passe 2 à 3 heures sur quelque chose qui peut tourner automatiquement. C'est un chiffre que tu peux poser sur une table et expliquer à un client en 10 minutes.",
    },
    {
      type: "p",
      text: "Ça ne veut pas dire que tout doit être de l'outbound. Ça veut dire que le pattern est le même partout : trouve le travail à fort volume et faible ROI-par-tâche, documente-le, et construis le système qui s'en charge. La tâche elle-même importe presque peu · ce qui compte, c'est qu'elle soit répétable, mesurable, et actuellement faite par une personne.",
    },
    { type: "h2", text: "Le prisme « jobs to be done »" },
    {
      type: "p",
      text: "Quand tu regardes une entreprise · la tienne ou celle d'un client · tu ne cherches pas des endroits où utiliser l'IA. Tu cherches des travaux qui doivent être faits et qui sont actuellement faits de façon inefficace :",
    },
    {
      type: "ul",
      items: [
        "Recherche commerciale",
        "Rédaction d'emails",
        "Lecture et traitement de factures",
        "Mise à jour des CRM après les appels",
        "Génération de rapports clients",
        "Onboarding de nouveaux clients",
        "Planification et relances",
      ],
    },
    {
      type: "p",
      text: "Ce sont des travaux. L'IA est le moyen de les faire mieux. Les meilleurs systèmes IA sont invisibles · ils font juste qu'un travail arrive plus vite, moins cher, et de façon plus cohérente qu'une personne ne pourrait le faire. C'est la cible.",
    },
  ],
};

export default lesson;
