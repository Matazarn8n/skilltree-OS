// Types pour le contenu des leçons (Modules). Nouveau fichier — ne fait pas partie de la spine.
// Un LessonContent est une suite de blocs simples que LessonReader sait rendre,
// sans dépendance MDX : juste de la donnée TS.

export type LessonBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; code: string; lang?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; variant: "key" | "tip" | "warning"; title?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface LessonContent {
  /** Titre FR affiché en H1 sur la page leçon. */
  title: string;
  /** Durée de lecture estimée, en minutes. */
  estMin: number;
  /** Chapô — une phrase sous le titre. */
  dek: string;
  blocks: LessonBlock[];
}
