#!/usr/bin/env node
/*
 * agent_c_parse.js — Agent C, BUT 2
 *
 * Parses stage (rollout wave 1-4 -> Foundation/Capture/Generate/Orchestrate)
 * and level (human-led/assisted/autonomous) per job, and MERGES them into
 * data/skills.json (137 jobs already present from tools/parse_data.js).
 *
 * Honest finding: skilltree_hub_vercel_app_app_map_html.txt (TREE via L()/F())
 * does NOT carry stage/wave data at all (grep confirms 0 hits for "Foundation"
 * or "wave" in that file) — it only carries `level`. The wave/stage numbers
 * live in a DIFFERENT captured file: skilltree_hub_vercel_app_chart_html.txt,
 * in `const DEPTS = {...}` (per-department teams/jobs, each job has
 * `level` + `wave`) and the single global `const STAGES = [...]` ribbon
 * (Foundation/Capture/Generate/Orchestrate, index = wave-1). The file's own
 * comment says it plainly: "STAGES is a SINGLE GLOBAL const ... the per-dept
 * `stages` arrays in DEPTS are now unused — the ribbon + stageName() read
 * this global." So: stage(job) = STAGES[job.wave - 1].name, driven by
 * job.wave from chart_html.txt. Uses Node vm (like tools/parse_data.js) to
 * actually evaluate the captured JS rather than regex-scrape it.
 *
 * Input : captures/raw/skilltree_hub_vercel_app_chart_html.txt
 * Merge target: data/skills.json (in place, read-then-rewrite)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'captures', 'raw');
const DATA = path.join(ROOT, 'data');

function readRaw(name) {
  return fs.readFileSync(path.join(RAW, name), 'utf8');
}

function extractBlock(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`marker introuvable: ${startMarker}`);
  const end = src.indexOf(endMarker, start);
  if (end === -1) throw new Error(`marker de fin introuvable après ${startMarker}: ${endMarker}`);
  return src.slice(start, end);
}

function parseChart() {
  const src = readRaw('skilltree_hub_vercel_app_chart_html.txt');

  // const DEPTS = { ... };  (ends right before the STAGES comment block)
  const deptsDecl = extractBlock(
    src,
    'const DEPTS = {',
    '/* ============ UNIVERSAL TECHNICAL LAYERS'
  ).replace(/\};\s*$/, '};'); // keep trailing ';' — trim trailing comment start already excluded

  // const STAGES = [ ... ];
  const stagesStart = src.indexOf('const STAGES = [');
  if (stagesStart === -1) throw new Error('const STAGES = [ introuvable');
  const stagesEnd = src.indexOf('];', stagesStart) + 2;
  const stagesDecl = src.slice(stagesStart, stagesEnd);

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(deptsDecl + '\nthis.__DEPTS__ = DEPTS;', sandbox, { filename: 'chart:DEPTS' });
  vm.runInContext(stagesDecl + '\nthis.__STAGES__ = STAGES;', sandbox, { filename: 'chart:STAGES' });

  const DEPTS = sandbox.__DEPTS__;
  const STAGES = sandbox.__STAGES__;
  if (!DEPTS || typeof DEPTS !== 'object') throw new Error('DEPTS did not evaluate to an object');
  if (!Array.isArray(STAGES)) throw new Error('STAGES did not evaluate to an array');
  return { DEPTS, STAGES };
}

function main() {
  const { DEPTS, STAGES } = parseChart();
  const stageName = (wave) => (wave ? (STAGES[wave - 1] || {}).name || null : null);

  // Build jobName -> { wave, stage, level, dept, team } across every dept's
  // teams[].jobs[] AND humanLed[] (residual human-led jobs also carry a level).
  const byJob = new Map();
  const collisions = [];

  for (const [deptName, dept] of Object.entries(DEPTS)) {
    for (const team of dept.teams || []) {
      for (const job of team.jobs || []) {
        const rec = {
          dept: deptName,
          team: team.team,
          wave: job.wave != null ? job.wave : null,
          stage: stageName(job.wave),
          level: job.level != null ? job.level : null,
        };
        if (byJob.has(job.name)) collisions.push({ name: job.name, prev: byJob.get(job.name), next: rec });
        byJob.set(job.name, rec);
      }
    }
    for (const hl of dept.humanLed || []) {
      const rec = {
        dept: deptName,
        team: hl.team || null,
        wave: null,
        stage: stageName(null), // 'Stays human' semantics — null here, filled below
        level: 'human-led',
      };
      if (byJob.has(hl.name)) collisions.push({ name: hl.name, prev: byJob.get(hl.name), next: rec });
      byJob.set(hl.name, rec);
    }
  }

  // ---- merge into data/skills.json --------------------------------------
  const skillsPath = path.join(DATA, 'skills.json');
  const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

  let matched = 0;
  let unmatched = [];
  let levelConflicts = [];

  for (const [jobName, job] of Object.entries(skills)) {
    const found = byJob.get(jobName);
    if (!found) {
      unmatched.push(jobName);
      continue;
    }
    matched++;
    // stage: 1-4 int (wave) when the job is on the AI rollout ladder; null
    // for human-led jobs ("Stays human" per the source's own stageName()).
    job.stage = found.wave; // integer 1-4 or null — do NOT fabricate a stage for human-led jobs
    job.stage_name = found.stage; // 'Foundation'/'Capture'/'Generate'/'Orchestrate' or null
    // Confirm (not overwrite blindly) the existing `level` from app_map.html
    // against chart_html.txt's independent copy of the same field.
    if (job.level && found.level && job.level !== found.level) {
      levelConflicts.push({ job: jobName, app_map: job.level, chart: found.level });
    }
    job.level = job.level || found.level;
  }

  fs.writeFileSync(skillsPath, JSON.stringify(skills, null, 2) + '\n');

  // ---- verification report ----------------------------------------------
  const total = Object.keys(skills).length;
  const withLevel = Object.values(skills).filter((j) => j.level).length;
  const withStage = Object.values(skills).filter((j) => [1, 2, 3, 4].includes(j.stage)).length;
  const humanLedInSkills = Object.values(skills).filter((j) => j.level === 'human-led').length;

  console.log(`[chart_html.txt] DEPTS: ${Object.keys(DEPTS).length} départements, STAGES global: ${STAGES.map((s) => s.name).join(' > ')}`);
  console.log(`[merge] jobs chart_html trouvés: ${byJob.size} | data/skills.json jobs: ${total} | matched: ${matched} | unmatched: ${unmatched.length}`);
  if (unmatched.length) console.log(`  unmatched (pas dans chart_html.txt, stage non renseigné): ${unmatched.join(', ')}`);
  if (collisions.length) console.log(`  [!] collisions nom de job entre départements: ${collisions.length}`, collisions.slice(0, 5));
  if (levelConflicts.length) console.log(`  [!] conflits level (app_map vs chart): ${levelConflicts.length}`, levelConflicts);
  console.log(`[verif] jobs avec level: ${withLevel}/${total} | jobs avec stage 1-4: ${withStage}/${total} | dont level=human-led (mais wave/stage renseigné dans chart_html.txt): ${humanLedInSkills}`);
  console.log(`[note] les 4 archétypes purement humains par département (dept.humanLed[] tels 'Offer & positioning', 'Key-account relationships'...) ne sont PAS dans data/skills.json (137 jobs) — ils ne viennent pas de app_map.html/TREE, donc pas de stage à leur fabriquer.`);

  const sample = Object.entries(skills)
    .filter(([, j]) => [1, 2, 3, 4].includes(j.stage))
    .slice(0, 3);
  console.log('[sample] 3 jobs avec stage+level:');
  for (const [name, j] of sample) {
    console.log(`  - ${name}: stage=${j.stage} (${j.stage_name}), level=${j.level}`);
  }
}

main();
