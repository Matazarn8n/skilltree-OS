import { MODULES } from "./data";
import type { LessonMeta, ModuleMeta } from "./types";
import type { LessonContent } from "./lesson-types";

// start-here
import welcome from "@/content/lessons/start-here/welcome";
import notTechnical from "@/content/lessons/start-here/not-technical";
import whereAiIsGoing from "@/content/lessons/start-here/where-ai-is-going";
import howToThink from "@/content/lessons/start-here/how-to-think";
import auditMindset from "@/content/lessons/start-here/audit-mindset";
import toolStack from "@/content/lessons/start-here/tool-stack";
import contextFromDay1 from "@/content/lessons/start-here/context-from-day-1";
import firstWin from "@/content/lessons/start-here/first-win";

// foundations
import installClaudeCode from "@/content/lessons/foundations/install-claude-code";
import howItWorks from "@/content/lessons/foundations/how-it-works";
import claudeMd from "@/content/lessons/foundations/claude-md";
import skills from "@/content/lessons/foundations/skills";
import mcps from "@/content/lessons/foundations/mcps";

// second-brain
import whyABrain from "@/content/lessons/second-brain/why-a-brain";
import brainInNotion from "@/content/lessons/second-brain/brain-in-notion";
import brainInObsidian from "@/content/lessons/second-brain/brain-in-obsidian";
import theCaptureWorkflow from "@/content/lessons/second-brain/the-capture-workflow";
import promptingYourBrain from "@/content/lessons/second-brain/prompting-your-brain";

// Ordre des leçons par module — la seule source de vérité pour le slug + l'ordre.
// Le titre et la durée viennent du contenu importé ci-dessus (pas dupliqués ici).
const ORDER: Record<string, string[]> = {
  "start-here": [
    "welcome",
    "not-technical",
    "where-ai-is-going",
    "how-to-think",
    "audit-mindset",
    "tool-stack",
    "context-from-day-1",
    "first-win",
  ],
  foundations: ["install-claude-code", "how-it-works", "claude-md", "skills", "mcps"],
  "second-brain": ["why-a-brain", "brain-in-notion", "brain-in-obsidian", "the-capture-workflow", "prompting-your-brain"],
};

const CONTENT: Record<string, Record<string, LessonContent>> = {
  "start-here": {
    welcome,
    "not-technical": notTechnical,
    "where-ai-is-going": whereAiIsGoing,
    "how-to-think": howToThink,
    "audit-mindset": auditMindset,
    "tool-stack": toolStack,
    "context-from-day-1": contextFromDay1,
    "first-win": firstWin,
  },
  foundations: {
    "install-claude-code": installClaudeCode,
    "how-it-works": howItWorks,
    "claude-md": claudeMd,
    skills,
    mcps,
  },
  "second-brain": {
    "why-a-brain": whyABrain,
    "brain-in-notion": brainInNotion,
    "brain-in-obsidian": brainInObsidian,
    "the-capture-workflow": theCaptureWorkflow,
    "prompting-your-brain": promptingYourBrain,
  },
};

export function getModule(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getOrderedModules(): ModuleMeta[] {
  return [...MODULES].sort((a, b) => a.order - b.order);
}

/** Métadonnées des leçons d'un module, dans l'ordre du parcours. */
export function getLessons(moduleSlug: string): LessonMeta[] {
  const order = ORDER[moduleSlug] ?? [];
  return order.map((slug, i) => {
    const content = CONTENT[moduleSlug]?.[slug];
    return {
      slug,
      module: moduleSlug,
      title: content?.title ?? slug,
      order: i,
      estMin: content?.estMin ?? 0,
    };
  });
}

export interface ResolvedLesson {
  meta: LessonMeta;
  content: LessonContent;
}

export function getLesson(moduleSlug: string, lessonSlug: string): ResolvedLesson | undefined {
  const content = CONTENT[moduleSlug]?.[lessonSlug];
  if (!content) return undefined;
  const lessons = getLessons(moduleSlug);
  const meta = lessons.find((l) => l.slug === lessonSlug);
  if (!meta) return undefined;
  return { meta, content };
}

export interface AdjacentLesson {
  moduleSlug: string;
  slug: string;
  title: string;
  /** true si la leçon adjacente appartient à un autre module (transition de module). */
  crossModule: boolean;
}

export interface LessonPosition {
  index: number; // position 0-based dans le module
  total: number; // nombre de leçons dans le module
  prev?: AdjacentLesson;
  next?: AdjacentLesson;
}

/** Leçon précédente / suivante, y compris en traversant vers le module adjacent. */
export function getAdjacent(moduleSlug: string, lessonSlug: string): LessonPosition | undefined {
  const lessons = getLessons(moduleSlug);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;

  const modules = getOrderedModules();
  const mi = modules.findIndex((m) => m.slug === moduleSlug);

  let prev: AdjacentLesson | undefined;
  if (index > 0) {
    const l = lessons[index - 1];
    prev = { moduleSlug, slug: l.slug, title: l.title, crossModule: false };
  } else if (mi > 0) {
    const prevModule = modules[mi - 1];
    const prevLessons = getLessons(prevModule.slug);
    const last = prevLessons.at(-1);
    if (last) prev = { moduleSlug: prevModule.slug, slug: last.slug, title: last.title, crossModule: true };
  }

  let next: AdjacentLesson | undefined;
  if (index < lessons.length - 1) {
    const l = lessons[index + 1];
    next = { moduleSlug, slug: l.slug, title: l.title, crossModule: false };
  } else if (mi < modules.length - 1) {
    const nextModule = modules[mi + 1];
    const first = getLessons(nextModule.slug)[0];
    if (first) next = { moduleSlug: nextModule.slug, slug: first.slug, title: first.title, crossModule: true };
  }

  return { index, total: lessons.length, prev, next };
}

export function totalLessonCount(): number {
  return getOrderedModules().reduce((sum, m) => sum + getLessons(m.slug).length, 0);
}

export function lessonKey(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}
