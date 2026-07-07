import type { LessonContent } from "@/lib/lesson-types";

const lesson: LessonContent = {
  title: "Tu n'as pas besoin d'être technique",
  estMin: 4,
  dek: "Pourquoi savoir coder n'est plus la barrière pour construire de vrais systèmes IA · et ce qui compte réellement à la place.",
  blocks: [
    { type: "p", text: "Avant de construire des systèmes IA, je ne savais pas coder." },
    {
      type: "p",
      text: "Je ne savais pas déployer sur Vercel. Je ne savais pas connecter GitHub. Les bases de données m'étaient étrangères. Les intégrations Stripe aussi. Tout le côté technique de la construction de produits semblait réservé à d'autres · des gens qui avaient étudié l'informatique ou passé des années en ingénierie.",
    },
    { type: "p", text: "Puis j'ai commencé à utiliser Claude Code." },
    {
      type: "p",
      text: "La première fois que j'ai vraiment déployé quelque chose, ce n'est pas parce que j'avais appris à coder. C'est parce que j'ai arrêté d'essayer de comprendre chaque ligne et j'ai commencé à traiter Claude comme un ingénieur senior à qui je pouvais tout demander. Je tombais sur une erreur, je faisais une capture d'écran, je la collais, et je demandais « qu'est-ce qui se passe ici et comment je répare ça ». Il expliquait, réparait, et on avançait.",
    },
    { type: "p", text: "C'est toujours comme ça que ça marche. C'est comme ça que travaille la majorité des gens ici." },
    {
      type: "quote",
      text: "Je programme vraiment surtout en anglais maintenant · je dis au LLM en mots quel code écrire. Le pouvoir d'opérer sur du logiciel à travers de grandes actions de code est juste trop net-utile.",
      cite: "Andrej Karpathy, cofondateur d'OpenAI",
    },
    { type: "h2", text: "Les deux choses qui font encore trébucher" },
    { type: "h3", text: "1. Ouvrir un terminal pour la première fois" },
    {
      type: "p",
      text: "Ça a l'air peu familier. Pas d'interface visuelle. Tu tapes des commandes en espérant qu'il se passe quelque chose. Cette sensation disparaît après environ 20 minutes d'usage. Rien dans SkillTree ne demande de comprendre ce qui se passe sous le capot · suis les étapes, et quand quelque chose casse, colle l'erreur dans Claude.",
    },
    { type: "h3", text: "2. Tomber sur des erreurs" },
    {
      type: "p",
      text: "Tout génère des erreurs. Les ingénieurs tombent sur des erreurs. La différence, c'est qu'ils les ont déjà vues. Toi tu les verras pour la première fois, et ça donnera l'impression que quelque chose cloche. Rien ne cloche. Capture d'écran de l'erreur, colle-la dans Claude, décris ce que tu essayais de faire. Il va réparer. Presque toujours du premier coup.",
    },
    { type: "h2", text: "La vraie compétence" },
    {
      type: "p",
      text: "La compétence que construit SkillTree, ce n'est pas coder. C'est savoir quoi construire, pourquoi le construire, et comment diriger Claude pour bien le construire. C'est une compétence totalement différente · et entièrement apprenable quel que soit ton bagage technique.",
    },
    {
      type: "p",
      text: "La seule chose qui sépare les gens qui construisent de vraies choses de ceux qui n'y arrivent pas, c'est la persévérance. Pas le talent. Pas un diplôme d'informatique. La persévérance.",
    },
  ],
};

export default lesson;
