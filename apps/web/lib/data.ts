import type { Sector, Skill, ModuleMeta, SectorSlug } from "./types";

// ── Catalogue seed (FR) — dérivé des captures réelles, contenu réécrit en français.
// En prod : table Postgres `sectors`/`skills`/`skill_edges`. Ici seed statique (cache ISR).

export const SECTORS: Sector[] = [
  { slug: "operations",   name: "Opérations",   tagline: "cadence · flux · fiabilité",   colorVar: "var(--color-sector-operations)",   order: 0 },
  { slug: "intelligence", name: "Intelligence", tagline: "signal · veille · décision",    colorVar: "var(--color-sector-intelligence)", order: 1 },
  { slug: "customer",     name: "Clients",      tagline: "accueil · soin · rétention",    colorVar: "var(--color-sector-customer)",     order: 2 },
  { slug: "backoffice",   name: "Back-office",  tagline: "admin · finance · conformité",  colorVar: "var(--color-sector-backoffice)",   order: 3 },
  { slug: "sales",        name: "Ventes",       tagline: "prospect · relance · closing",  colorVar: "var(--color-sector-sales)",        order: 4 },
  { slug: "deals",        name: "Affaires",     tagline: "offre · preuve · signature",    colorVar: "var(--color-sector-deals)",        order: 5 },
  { slug: "marketing",    name: "Marketing",    tagline: "marque · contenu · portée",     colorVar: "var(--color-sector-marketing)",    order: 6 },
];

export const SKILLS: Skill[] = [
  // ── Ventes ──
  { slug: "definition-icp", name: "Définition ICP", sector: "sales", stage: "foundation", autonomy: true, status: "live", installCount: 42, icon: "target",
    summary: "Transforme ton historique gagné/perdu en profils de client idéal que tes agents peuvent réellement exploiter." },
  { slug: "cartographie-marche", name: "Cartographie de marché", sector: "sales", stage: "foundation", autonomy: true, status: "live", installCount: 33, icon: "map", requires: ["definition-icp"],
    summary: "Dresse la carte des comptes cibles d'un segment, avec signaux d'intention et priorité." },
  { slug: "minage-base", name: "Minage de base", sector: "sales", stage: "capture", autonomy: true, status: "live", installCount: 28, icon: "database", requires: ["cartographie-marche"],
    summary: "Extrait, dédoublonne et enrichit une base de prospects prête à contacter." },
  { slug: "scoring-leads", name: "Scoring des leads", sector: "sales", stage: "capture", autonomy: true, status: "live", installCount: 31, icon: "gauge", requires: ["minage-base"],
    summary: "Note chaque lead sur ta définition d'ICP et route en priorité ce qui est chaud." },
  { slug: "brouillon-froid", name: "Brouillon à froid", sector: "sales", stage: "generate", autonomy: true, status: "live", installCount: 37, icon: "pen", requires: ["scoring-leads"],
    summary: "Rédige des premiers messages personnalisés à partir des signaux réels du prospect." },
  { slug: "messagerie-linkedin", name: "Messagerie LinkedIn", sector: "sales", stage: "generate", autonomy: true, status: "live", installCount: 24, icon: "chat", requires: ["brouillon-froid"],
    summary: "Séquence et personnalise l'approche LinkedIn, relances comprises." },
  { slug: "orchestration-campagne", name: "Orchestration de campagne", sector: "sales", stage: "orchestrate", autonomy: true, status: "live", installCount: 19, icon: "flow", requires: ["messagerie-linkedin", "brouillon-froid"],
    summary: "Pilote la cadence multicanale et arbitre les relances selon les réponses." },
  { slug: "gestionnaire-sourcing", name: "Gestionnaire de sourcing", sector: "sales", stage: "capture", autonomy: true, status: "live", installCount: 51, icon: "search",
    summary: "Trouve et qualifie en continu de nouveaux comptes correspondant à ton ICP." },

  // ── Affaires (Deals) ──
  { slug: "producteur-deal-room", name: "Producteur de deal room", sector: "deals", stage: "generate", autonomy: true, status: "drop", installCount: 4, publishedDaysAgo: 3, icon: "room",
    summary: "Assemble tout ce qu'il faut à un prospect pour dire oui : proposition, preuves, prix, dans un seul espace." },
  { slug: "strategiste-icp", name: "Stratège ICP", sector: "deals", stage: "foundation", autonomy: true, status: "drop", installCount: 6, publishedDaysAgo: 7, icon: "target",
    summary: "Convertit ton historique gagné/perdu en profils de client idéal actionnables par tes agents." },
  { slug: "gestionnaire-inbound", name: "Gestionnaire d'inbound", sector: "deals", stage: "capture", autonomy: true, status: "drop", installCount: 5, publishedDaysAgo: 10, icon: "inbox",
    summary: "Chaque formulaire, email et DM traité en minutes, qualifié et routé tant que c'est chaud." },
  { slug: "orchestration-proposition", name: "Orchestration de proposition", sector: "deals", stage: "orchestrate", autonomy: true, status: "live", installCount: 12, icon: "flow", requires: ["producteur-deal-room"],
    summary: "Génère, versionne et relance les propositions jusqu'à la signature." },

  // ── Marketing ──
  { slug: "analyse-audience", name: "Analyse d'audience", sector: "marketing", stage: "foundation", autonomy: true, status: "live", installCount: 26, icon: "users",
    summary: "Comprend qui écoute vraiment et ce qui les fait réagir." },
  { slug: "analyse-concurrence", name: "Analyse de la concurrence", sector: "marketing", stage: "foundation", autonomy: true, status: "live", installCount: 22, icon: "eye",
    summary: "Cartographie le positionnement et les angles des concurrents." },
  { slug: "veille-tendances", name: "Veille des tendances", sector: "marketing", stage: "capture", autonomy: true, status: "live", installCount: 20, icon: "trend", requires: ["analyse-audience"],
    summary: "Repère tôt les sujets et formats qui montent dans ton créneau." },
  { slug: "production-carrousel", name: "Production de carrousel", sector: "marketing", stage: "generate", autonomy: true, status: "live", installCount: 34, icon: "cards", requires: ["veille-tendances"],
    summary: "Décline un angle en carrousel prêt à publier, visuels et copy compris." },
  { slug: "creation-publicitaire", name: "Création publicitaire", sector: "marketing", stage: "generate", autonomy: true, status: "live", installCount: 29, icon: "image", requires: ["production-carrousel"],
    summary: "Génère des variantes d'annonces testables à partir d'un brief." },
  { slug: "minage-performance", name: "Minage de performance", sector: "marketing", stage: "orchestrate", autonomy: true, status: "live", installCount: 17, icon: "chart", requires: ["creation-publicitaire"],
    summary: "Analyse les résultats et propose les prochains itérations créatives." },

  // ── Intelligence ──
  { slug: "demontage-concurrent", name: "Démontage concurrent", sector: "intelligence", stage: "generate", autonomy: true, status: "live", installCount: 21, icon: "scope",
    summary: "Décortique l'offre, le prix et le funnel d'un concurrent en fiche exploitable." },
  { slug: "analyste-intelligence", name: "Analyste d'intelligence compétitive", sector: "intelligence", stage: "foundation", autonomy: true, status: "live", installCount: 18, icon: "brain",
    summary: "Synthétise la veille marché en décisions, pas en rapports." },
  { slug: "surveillance-anomalies", name: "Surveillance d'anomalies", sector: "intelligence", stage: "capture", autonomy: true, status: "live", installCount: 14, icon: "alert", requires: ["analyste-intelligence"],
    summary: "Alerte quand une métrique décroche de sa tendance." },
  { slug: "visualisation-donnees", name: "Visualisation de données", sector: "intelligence", stage: "orchestrate", autonomy: true, status: "live", installCount: 16, icon: "chart", requires: ["surveillance-anomalies"],
    summary: "Transforme des données brutes en tableaux de bord lisibles." },

  // ── Clients (Customer) ──
  { slug: "verification-email", name: "Vérification d'email", sector: "customer", stage: "foundation", autonomy: true, status: "live", installCount: 40, icon: "check",
    summary: "Valide et nettoie les adresses avant tout envoi." },
  { slug: "enrichissement-compte", name: "Enrichissement de compte", sector: "customer", stage: "capture", autonomy: true, status: "live", installCount: 27, icon: "user-plus", requires: ["verification-email"],
    summary: "Complète les fiches comptes avec des données firmographiques fiables." },
  { slug: "enrichissement-contact", name: "Enrichissement de contact", sector: "customer", stage: "capture", autonomy: true, status: "live", installCount: 25, icon: "id", requires: ["verification-email"],
    summary: "Retrouve rôle, coordonnées et contexte d'un contact." },

  // ── Opérations ──
  { slug: "scraping-web-maps", name: "Scraping Web & Maps", sector: "operations", stage: "capture", autonomy: true, status: "live", installCount: 38, icon: "globe",
    summary: "Extrait entreprises, annuaires et sources locales en pistes structurées." },
  { slug: "sync-brain", name: "Sync du Brain", sector: "operations", stage: "orchestrate", autonomy: true, status: "drop", installCount: 7, publishedDaysAgo: 9, icon: "sync",
    summary: "Le pont qui fait lire à chaque skill ton Notion ou ton Cortex Obsidian — modifie ton brain, lance la sync, tes skills citent la vérité du moment." },
  { slug: "moteur-reporting", name: "Moteur de reporting", sector: "operations", stage: "orchestrate", autonomy: true, status: "live", installCount: 15, icon: "report", requires: ["sync-brain"],
    summary: "Compile les indicateurs récurrents en rapports datés automatiques." },

  // ── Back-office ──
  { slug: "ingenieur-seo", name: "Ingénieur SEO", sector: "backoffice", stage: "generate", autonomy: true, status: "drop", installCount: 9, publishedDaysAgo: 1, icon: "seo",
    summary: "Produit des pages optimisées à partir d'une intention de recherche." },
  { slug: "base-connaissance", name: "Base de connaissance", sector: "backoffice", stage: "foundation", autonomy: true, status: "live", installCount: 44, icon: "book",
    summary: "Le socle documentaire que tous tes agents interrogent." },
  { slug: "intelligence-reunion", name: "Ingénieur d'intelligence réunion", sector: "backoffice", stage: "capture", autonomy: true, status: "live", installCount: 48, icon: "mic", requires: ["base-connaissance"],
    summary: "Capte, résume et route les décisions de chaque réunion." },
];

export const MODULES: ModuleMeta[] = [
  { slug: "start-here",   title: "Commence ici",           subtitle: "L'état d'esprit et la carte avant d'ouvrir un terminal.", order: 0, lessonCount: 8 },
  { slug: "foundations",  title: "Fondations Claude Code", subtitle: "Installer, comprendre, configurer, brancher.",           order: 1, lessonCount: 5 },
  { slug: "second-brain", title: "Construis ton Brain",    subtitle: "La base que tout ce que tu bâtis vient lire.",           order: 2, lessonCount: 5 },
];

export const FRESH_DROPS = SKILLS.filter((s) => s.status === "drop")
  .sort((a, b) => (a.publishedDaysAgo ?? 99) - (b.publishedDaysAgo ?? 99));
export const MOST_INSTALLED = [...SKILLS].sort((a, b) => b.installCount - a.installCount).slice(0, 4);

export const bySector = (slug: string) => SKILLS.filter((s) => s.sector === slug);
export const sectorOf = (slug: SectorSlug) => SECTORS.find((s) => s.slug === slug)!;
export const skillBySlug = (slug: string) => SKILLS.find((s) => s.slug === slug);
