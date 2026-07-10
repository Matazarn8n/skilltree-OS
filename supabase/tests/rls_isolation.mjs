// RLS tenant-isolation proof (BACK-01). Dependency-free: HTTP against local GoTrue + PostgREST.
// Anti-faux-positif : un client B authentifié NE DOIT lire AUCUNE ligne de A, tandis qu'un client
// service-role LIT bien la ligne de A (contrôle positif — prouve que la ligne existe, donc un PASS
// ne vient pas d'une table vide). Le test vire au ROUGE si le RLS est retiré (cf. counter-proof).
// exit 1 au premier échec. Écrit orchestration/verify/p6/rls-isolation.txt.
//
// Env requis (apps/web/.env.local, chargé plus bas) :
//   SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// Usage: node supabase/tests/rls_isolation.mjs

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = resolve(ROOT, 'orchestration/verify/p6/rls-isolation.txt');

// ── charge apps/web/.env.local ───────────────────────────────────────────────
function loadEnv() {
  const raw = readFileSync(resolve(ROOT, 'apps/web/.env.local'), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = loadEnv();
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SERVICE) throw new Error('env manquant (SUPABASE_URL/ANON/SERVICE_ROLE)');

const log = [];
const say = (s) => { console.log(s); log.push(s); };
let failed = false;
const fail = (s) => { failed = true; say('✗ FAIL: ' + s); };
const ok = (s) => say('✓ ' + s);

const USER_TABLES = ['installs', 'progress', 'brain', 'tree_state', 'onboarding'];

// ── helpers HTTP ─────────────────────────────────────────────────────────────
async function signup(email, password) {
  // local supabase auto-confirme (config [auth.email] enable_confirmations=false)
  let r = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  let j = await r.json();
  if (!j.access_token) {
    // pas de session directe → tente password grant
    r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON, 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    j = await r.json();
  }
  if (!j.access_token) throw new Error(`signup/signin échoué pour ${email}: ${JSON.stringify(j)}`);
  return { token: j.access_token, id: j.user?.id || j.user?.sub };
}

function rest(token, apikey = ANON) {
  return {
    async insert(table, row) {
      const r = await fetch(`${URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          apikey, authorization: `Bearer ${token}`,
          'content-type': 'application/json', prefer: 'return=representation',
        },
        body: JSON.stringify(row),
      });
      return { status: r.status, body: await r.json().catch(() => null) };
    },
    async selectAll(table) {
      const r = await fetch(`${URL}/rest/v1/${table}?select=*`, {
        headers: { apikey, authorization: `Bearer ${token}` },
      });
      const body = await r.json().catch(() => []);
      if (!Array.isArray(body)) throw new Error(`select ${table} a renvoyé une erreur (${r.status}): ${JSON.stringify(body)}`);
      return { status: r.status, rows: body };
    },
  };
}

async function setRls(table, enabled) {
  const sql = `alter table ${table} ${enabled ? 'enable' : 'disable'} row level security;`;
  const { execSync } = await import('node:child_process');
  execSync(`docker exec -i supabase_db_skilltree-OS psql -U postgres -d postgres -c "${sql}"`, { stdio: 'pipe' });
}

// ── scénario ─────────────────────────────────────────────────────────────────
const stamp = process.env.TEST_STAMP || 'x';
const A = await signup(`rls-a-${stamp}@example.com`, 'Passw0rd!aaa');
const B = await signup(`rls-b-${stamp}@example.com`, 'Passw0rd!bbb');
say(`user A = ${A.id}`);
say(`user B = ${B.id}`);

const aClient = rest(A.token);
const bClient = rest(B.token);
const svc = rest(SERVICE, SERVICE); // service-role : bypass RLS

// A écrit une ligne dans CHAQUE table user, via SA propre session (RLS with-check l'exige)
const aRows = {
  installs: { user_id: A.id, skill_slug: 'billing-manager' },
  progress: { user_id: A.id, lesson_id: 'start-here/welcome', status: 'done' },
  brain: { user_id: A.id, section: 'company', content: 'secret de A' },
  tree_state: { user_id: A.id, job_id: 'market-mapping', level: 'assisted' },
  onboarding: { user_id: A.id, path: 'agency', step: 3 },
};
for (const t of USER_TABLES) {
  const res = await aClient.insert(t, aRows[t]);
  if (res.status >= 300) fail(`A ne peut pas écrire sa propre ligne dans ${t} (${res.status}): ${JSON.stringify(res.body)}`);
  else ok(`A a écrit sa ligne dans ${t}`);
}

// Contrôle positif : service-role VOIT la ligne de A (donc elle existe)
for (const t of USER_TABLES) {
  const { rows } = await svc.selectAll(t);
  const aOwned = rows.filter((r) => r.user_id === A.id).length;
  if (aOwned < 1) fail(`contrôle positif KO : service-role ne voit pas la ligne de A dans ${t} (la ligne devrait exister)`);
  else ok(`service-role voit ${aOwned} ligne(s) de A dans ${t} (contrôle positif)`);
}

// Isolation : B authentifié ne voit AUCUNE ligne de A
for (const t of USER_TABLES) {
  const { rows } = await bClient.selectAll(t);
  const seesA = rows.filter((r) => r.user_id === A.id).length;
  if (seesA > 0) fail(`FUITE : B voit ${seesA} ligne(s) de A dans ${t}`);
  else ok(`B voit 0 ligne de A dans ${t} (isolation OK)`);
}

// Counter-proof : retirer le RLS sur installs DOIT rendre la fuite visible (test devient rouge)
say('--- counter-proof : disable RLS sur installs ---');
await setRls('installs', false);
try {
  const { rows } = await bClient.selectAll('installs');
  const seesA = rows.filter((r) => r.user_id === A.id).length;
  if (seesA > 0) ok(`counter-proof CONFIRMÉ : sans RLS, B voit ${seesA} ligne(s) de A dans installs → le test détecte bien la fuite (il virerait au ROUGE)`);
  else fail(`counter-proof KO : RLS retiré mais B ne voit toujours pas A — le test ne prouve pas ce qu'il prétend`);
} finally {
  await setRls('installs', true); // toujours réactiver
  ok('RLS ré-activé sur installs');
}

// re-vérifie l'isolation après réactivation
{
  const { rows } = await bClient.selectAll('installs');
  const seesA = rows.filter((r) => r.user_id === A.id).length;
  if (seesA > 0) fail(`après réactivation, B voit encore ${seesA} ligne(s) de A dans installs`);
  else ok('après réactivation RLS : B voit 0 ligne de A dans installs');
}

say(failed ? '\nRESULT: FAIL (isolation non prouvée)' : '\nRESULT: PASS (isolation tenant prouvée + counter-proof)');
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, log.join('\n') + '\n');
say(`\npreuve écrite: ${OUT}`);
process.exit(failed ? 1 : 0);
