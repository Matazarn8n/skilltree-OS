#!/usr/bin/env node
/*
 * parse_data.js
 *
 * Parses the raw captured JS/HTML source files of the SkillTree (altari.ai) app
 * into clean structured JSON, using Node's `vm` module to actually *evaluate*
 * the captured JS (rather than regex-scraping it), so the resulting data is
 * exactly what the app itself would have produced at runtime.
 *
 * Inputs  (captures/raw/):
 *   skilltree_hub_vercel_app_app_map_html.txt      -> const TREE, F(), L()
 *   skilltree_hub_vercel_app_content_js.txt        -> const HUB, const PLAYBOOK
 *   skilltree_hub_vercel_app_skill_meta_js.txt     -> const SKILL_META
 *   skilltree_hub_vercel_app_skill_previews_js.txt -> window.SKILL_PREVIEWS
 *
 * Outputs (data/):
 *   tree.json, skills.json, skill_files.json, summary.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAW_DIR = path.join(__dirname, '..', 'captures', 'raw');
const DATA_DIR = path.join(__dirname, '..', 'data');

function readRaw(name) {
  return fs.readFileSync(path.join(RAW_DIR, name), 'utf8');
}

// ---------------------------------------------------------------------------
// 1. app_map_html.txt -> TREE
// ---------------------------------------------------------------------------
// Extract the *real* F/L helper definitions from the source (do not guess
// their shape). They appear as single-line const declarations right above
// `const TREE = [`.
function extractConstLine(src, constName) {
  const re = new RegExp(`^const ${constName} = .*$`, 'm');
  const m = src.match(re);
  if (!m) throw new Error(`Could not find "const ${constName} =" definition in source`);
  return m[0];
}

function extractTreeArrayLiteral(src) {
  const startMarker = 'const TREE = [';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error('Could not find "const TREE = [" in app_map_html.txt');
  // Find the terminating "];" that closes the TREE array. We know from
  // inspection it's followed by "const N = TREE.length;" - use that as an
  // anchor to slice the exact array literal.
  const endMarker = '\nconst N = TREE.length;';
  const endIdx = src.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error('Could not find end-of-TREE anchor ("const N = TREE.length;")');
  // Slice from the start of "const TREE" through the "];" right before endIdx.
  let literalSection = src.slice(startIdx, endIdx);
  // literalSection = 'const TREE = [ ... \n];' (trailing newline may vary)
  return literalSection.trim().replace(/;$/, ''); // 'const TREE = [ ... ]'
}

function parseAppMap() {
  const src = readRaw('skilltree_hub_vercel_app_app_map_html.txt');

  const lLine = extractConstLine(src, 'L'); // const L = (name, desc, skills, tools, level) => ({...});
  const fLine = extractConstLine(src, 'F'); // const F = (name, jobs) => ({ name, jobs });
  const treeDecl = extractTreeArrayLiteral(src); // 'const TREE = [ ... ]'

  const sandbox = {};
  vm.createContext(sandbox);

  // Define helpers exactly as captured, then evaluate the TREE literal in the
  // same context so F(...)/L(...) calls resolve against the real helpers.
  vm.runInContext(lLine, sandbox, { filename: 'app-map:L' });
  vm.runInContext(fLine, sandbox, { filename: 'app-map:F' });
  vm.runInContext(treeDecl + ';\nthis.__TREE__ = TREE;', sandbox, { filename: 'app-map:TREE' });

  const TREE = sandbox.__TREE__;
  if (!Array.isArray(TREE)) throw new Error('TREE did not evaluate to an array');
  return TREE;
}

// ---------------------------------------------------------------------------
// 2. content_js.txt -> HUB, PLAYBOOK
// ---------------------------------------------------------------------------
function parseContent() {
  const src = readRaw('skilltree_hub_vercel_app_content_js.txt');
  const sandbox = {};
  vm.createContext(sandbox);
  // Run the whole file (defines HUB, PLAYBOOK, HUMAN_DEFAULT, FOUNDATION as consts).
  vm.runInContext(src + '\nthis.__HUB__ = HUB;\nthis.__PLAYBOOK__ = PLAYBOOK;', sandbox, {
    filename: 'content.js',
  });
  const HUB = sandbox.__HUB__;
  const PLAYBOOK = sandbox.__PLAYBOOK__;
  if (typeof HUB !== 'string') throw new Error('HUB did not evaluate to a string');
  if (!PLAYBOOK || typeof PLAYBOOK !== 'object') throw new Error('PLAYBOOK did not evaluate to an object');
  return { HUB, PLAYBOOK };
}

// ---------------------------------------------------------------------------
// 3. skill_meta_js.txt -> SKILL_META
// ---------------------------------------------------------------------------
function parseSkillMeta() {
  const src = readRaw('skilltree_hub_vercel_app_skill_meta_js.txt');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + '\nthis.__SKILL_META__ = SKILL_META;', sandbox, { filename: 'skill-meta.js' });
  const SKILL_META = sandbox.__SKILL_META__;
  if (!SKILL_META || typeof SKILL_META !== 'object') throw new Error('SKILL_META did not evaluate to an object');
  return SKILL_META;
}

// ---------------------------------------------------------------------------
// 4. skill_previews_js.txt -> window.SKILL_PREVIEWS
// ---------------------------------------------------------------------------
function parseSkillPreviews() {
  const src = readRaw('skilltree_hub_vercel_app_skill_previews_js.txt');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'skill-previews.js' });
  const SKILL_PREVIEWS = sandbox.window.SKILL_PREVIEWS;
  if (!SKILL_PREVIEWS || typeof SKILL_PREVIEWS !== 'object') {
    throw new Error('window.SKILL_PREVIEWS did not evaluate to an object');
  }
  return SKILL_PREVIEWS;
}

// ---------------------------------------------------------------------------
// Merge + write
// ---------------------------------------------------------------------------
function slugFromPath(p) {
  // 'skills/icp-strategist.md' -> 'icp-strategist'
  return p.replace(/^skills\//, '').replace(/\.md$/, '');
}

function main() {
  const TREE = parseAppMap();
  const { HUB, PLAYBOOK } = parseContent();
  const SKILL_META = parseSkillMeta();
  const SKILL_PREVIEWS = parseSkillPreviews();

  fs.mkdirSync(DATA_DIR, { recursive: true });

  // ---- data/tree.json --------------------------------------------------
  const tree = TREE.map((sector) => ({
    sector: sector.name,
    sub: sector.sub != null ? sector.sub : null,
    color: sector.color != null ? sector.color : null,
    intro: sector.intro != null ? sector.intro : null,
    functions: (sector.functions || []).map((fn) => ({
      name: fn.name,
      jobs: (fn.jobs || []).map((job) => ({
        name: job.name,
        desc: job.desc != null ? job.desc : null,
        skills: job.skills || [],
        integrations: job.tools || [],
        level: job.level != null ? job.level : null,
      })),
    })),
  }));

  // ---- data/skills.json (jobs, merged TREE + PLAYBOOK) ------------------
  const skills = {};
  const jobNamesInTree = new Set();
  for (const sector of TREE) {
    for (const fn of sector.functions || []) {
      for (const job of fn.jobs || []) {
        jobNamesInTree.add(job.name);
        const playbook = PLAYBOOK[job.name] || null;
        skills[job.name] = {
          name: job.name,
          sector: sector.name,
          function: fn.name,
          desc: job.desc != null ? job.desc : null,
          skills: job.skills || [],
          integrations: job.tools || [],
          level: job.level != null ? job.level : null,
          human: playbook && playbook.human != null ? playbook.human : null,
          replaces: playbook && playbook.replaces != null ? playbook.replaces : null,
          req: playbook && playbook.req != null ? playbook.req : [],
          ladder: playbook && playbook.ladder != null ? playbook.ladder : null,
          notes: playbook && playbook.notes != null ? playbook.notes : null,
          files: playbook && playbook.files != null ? playbook.files : [],
        };
      }
    }
  }

  // Sanity: any PLAYBOOK entries that don't correspond to a TREE job name?
  const playbookOnlyKeys = Object.keys(PLAYBOOK).filter((k) => !jobNamesInTree.has(k));

  // ---- data/skill_files.json (skill files, merged SKILL_META + PREVIEWS) --
  const skillFiles = {};
  for (const [filePath, meta] of Object.entries(SKILL_META)) {
    const slug = slugFromPath(filePath);
    skillFiles[slug] = {
      slug,
      path: filePath,
      title: meta.title != null ? meta.title : null,
      what: meta.what != null ? meta.what : null,
      needs: meta.needs != null ? meta.needs : null,
      markdown: Object.prototype.hasOwnProperty.call(SKILL_PREVIEWS, slug) ? SKILL_PREVIEWS[slug] : null,
    };
  }
  // Any preview slugs that had no SKILL_META entry -> still include them.
  for (const [slug, markdown] of Object.entries(SKILL_PREVIEWS)) {
    if (!skillFiles[slug]) {
      skillFiles[slug] = { slug, path: `skills/${slug}.md`, title: null, what: null, needs: null, markdown };
    }
  }

  // ---- data/summary.json -------------------------------------------------
  let totalFunctions = 0;
  let totalJobs = 0;
  const sectorList = TREE.map((sector) => {
    const nJobs = (sector.functions || []).reduce((acc, fn) => acc + (fn.jobs || []).length, 0);
    const nFns = (sector.functions || []).length;
    totalFunctions += nFns;
    totalJobs += nJobs;
    return { sector: sector.name, functions: nFns, jobs: nJobs };
  });

  const summary = {
    hub: HUB,
    sectors: TREE.length,
    functions: totalFunctions,
    jobs: totalJobs,
    skillFiles: Object.keys(skillFiles).length,
    sectorBreakdown: sectorList,
    counts: {
      TREE_jobs: totalJobs,
      PLAYBOOK_entries: Object.keys(PLAYBOOK).length,
      PLAYBOOK_entries_without_tree_job: playbookOnlyKeys,
      SKILL_META_entries: Object.keys(SKILL_META).length,
      SKILL_PREVIEWS_entries: Object.keys(SKILL_PREVIEWS).length,
    },
  };

  fs.writeFileSync(path.join(DATA_DIR, 'tree.json'), JSON.stringify(tree, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'skills.json'), JSON.stringify(skills, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'skill_files.json'), JSON.stringify(skillFiles, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  // -------------------------------------------------------------------
  // Verification pass (anti-false-positive): reread what we wrote, print
  // real counts and a full example job + skill file.
  // -------------------------------------------------------------------
  console.log('=== WRITTEN FILES ===');
  for (const f of ['tree.json', 'skills.json', 'skill_files.json', 'summary.json']) {
    const p = path.join(DATA_DIR, f);
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    console.log(`${p} -> ${count} top-level entries`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));

  console.log('\n=== EXAMPLE JOB: "ICP Definition" ===');
  console.log(JSON.stringify(skills['ICP Definition'], null, 2));

  const exampleSlug = 'billing-manager';
  console.log(`\n=== EXAMPLE SKILL FILE: "${exampleSlug}" ===`);
  console.log(JSON.stringify(skillFiles[exampleSlug], null, 2));

  if (playbookOnlyKeys.length) {
    console.log('\n=== WARNING: PLAYBOOK keys with no matching TREE job name ===');
    console.log(playbookOnlyKeys);
  }
}

main();
