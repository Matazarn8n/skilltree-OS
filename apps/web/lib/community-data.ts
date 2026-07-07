export interface CommunityPost {
  id: string;
  author: string;
  initials: string;
  timeAgo: string;
  content: string;
  reactions: number;
}

// Seed factice — en prod : table Postgres `community_posts`.
export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Léa Fontaine",
    initials: "LF",
    timeAgo: "il y a 12 min",
    content: "Le skill « Minage de base » vient de me sortir 300 leads qualifiés en une nuit. Quelqu'un a testé le scoring derrière ?",
    reactions: 14,
  },
  {
    id: "2",
    author: "Karim Benali",
    initials: "KB",
    timeAgo: "il y a 1 h",
    content: "Petit retour d'expérience sur « Sync du Brain » : la connexion à mon Obsidian a pris 2 minutes, tout le reste suit tout seul.",
    reactions: 22,
  },
  {
    id: "3",
    author: "Inès Duval",
    initials: "ID",
    timeAgo: "il y a 3 h",
    content: "Je cherche un exemple concret d'orchestration de campagne multicanale. Quelqu'un veut bien partager son setup ?",
    reactions: 6,
  },
  {
    id: "4",
    author: "Thomas Roy",
    initials: "TR",
    timeAgo: "il y a 6 h",
    content: "Premier drop publié cette semaine : « Ingénieur SEO ». Encore chaud, tous les retours sont bons à prendre.",
    reactions: 31,
  },
  {
    id: "5",
    author: "Sofia Marchetti",
    initials: "SM",
    timeAgo: "il y a 1 j",
    content: "La leçon sur les fondations Claude Code m'a fait gagner une semaine de tâtonnement. Merci à l'équipe.",
    reactions: 45,
  },
  {
    id: "6",
    author: "Julien Perrot",
    initials: "JP",
    timeAgo: "il y a 2 j",
    content: "Qui utilise « Surveillance d'anomalies » en prod ? Je veux comparer les seuils d'alerte avant de brancher le mien.",
    reactions: 9,
  },
];
