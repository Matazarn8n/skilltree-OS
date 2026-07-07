#!/usr/bin/env node
/*
 * agent_c_parse_dash.js — Agent C, BUT 1 (parse).
 *
 * Honest finding from tools/agent_c_hunt.py: the dashboard numbers ("31,587",
 * "Cost per Lead", "Paid Acquisition"...) are NOT served by any JSON/API
 * endpoint — 0 network response matched. They are computed CLIENT-SIDE by a
 * deterministic seeded PRNG (Park-Miller LCG, `seed = 20260611`,
 * `seed = (seed*16807) % 2147483647`) embedded directly in the captured page
 * captures/raw/skilltree_dash_index_html.txt. Since the seed, the "today"
 * date (hardcoded `new Date(2026,5,11)`), and every generator function are
 * fully deterministic and already captured verbatim, this script actually
 * EXECUTES that real code (Node vm, same technique as tools/parse_data.js)
 * instead of guessing/regex-scraping — the output is exactly what the live
 * site renders, not a fabrication.
 *
 * Approach: stub just enough DOM (document/addEventListener/MutationObserver/
 * requestAnimationFrame — the script touches these at module top-level even
 * before any dashboard is opened) so the untouched script can run, then
 * inject one small, targeted capture line right before each build function's
 * `el.innerHTML = ` assignment (6 anchors, one per dashboard) to stash the
 * real local data (KPI numbers, table rows) into a global __CAP__ object.
 * The template-literal HTML strings themselves are left completely alone.
 *
 * Input : captures/raw/skilltree_dash_index_html.txt (inline <script>)
 * Output: data/dashboards.json (overwrites the existing metadata-only file,
 *         keeping id/name/subtitle/color, adding stats/series/tables)
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

// ---------------------------------------------------------------------------
// 1. Extract the main inline <script> body (the one with the PRNG + builders)
// ---------------------------------------------------------------------------
function extractScriptBody(html) {
  const startMarker = '/* ============ utilities ============ */';
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error('marker de début du script principal introuvable');
  const end = html.indexOf('</script>', start);
  if (end === -1) throw new Error('</script> de fin introuvable');
  return html.slice(start, end);
}

// ---------------------------------------------------------------------------
// 2. Inject one capture line right before each of the 6 `el.innerHTML = `
//    assignments (Meta, Pipeline, Finance, Content, Outbound, Ops, in that
//    source order — verified via `grep -c 'el.innerHTML = \`'` == 6).
// ---------------------------------------------------------------------------
function injectCaptures(src) {
  const DELIM = 'el.innerHTML = `';
  const parts = src.split(DELIM);
  if (parts.length !== 7) {
    throw new Error(`attendu 6 occurrences de "${DELIM}", trouvé ${parts.length - 1} — source a changé, ne pas deviner`);
  }
  const injections = [
    // 1) META ADS — recompute cleanly from CAMPAIGNS/rollup/kpisOf (real engine fns)
    `__CAP__.meta = {
      range,
      totals: k,
      prev_totals: pk,
      campaigns: CAMPAIGNS.map(c => Object.assign({ id: c.id, name: c.name, status: c.status, budget: c.budget }, kpisOf(rollup([c.id], range)))),
    };\n`,
    // 2) PIPELINE
    `__CAP__.pipeline = {
      deal_count: deals.length, open, weighted, stalledVal, stalledCount: stalledDeals.length,
      closingVal, closingCount: closing.length, byStage, bySrc,
      deals: deals.map(d => ({ company: d.co, project: d.proj, stage: d.stage.label, amount: d.amount, owner: d.owner, closeIn: d.closeIn, stalled: d.stalled })),
    };\n`,
    // 3) FINANCE
    `__CAP__.finance = {
      months: finMonths, pl, cashTotal, burn, ar, arTotal, overdue,
      invoices: inv.map(v => ({ no: v.no, client: v.c, total: v.t, due: v.due, when: v.dd, status: v.st })),
    };\n`,
    // 4) CONTENT
    `__CAP__.content = {
      range: cRange, views, prevViews: pviews, reach, engaged, interactions: inter, netFollowers: fol,
      posts: media.map(m => ({ caption: m.cap, date: m.date, type: m.type, views: m.views, reach: m.reach, saved: m.saved, shares: m.shares })),
    };\n`,
    // 5) OUTBOUND
    `__CAP__.outbound = {
      range: oRange, sent, prevSent: psent, replies, realReplies, opportunities: opps, oppValue, bounceRate: bounce,
      campaigns: camps.map(c => ({ name: c.n, list: c.list, sent: c.sent, replyRate: c.rr, opportunities: c.opp, bounce: c.b })),
    };\n`,
    // 6) OPS (client delivery) — KPI row is hardcoded literal strings in the
    // template (not variables) since it's the one dashboard without a
    // generated series; capture the real table data (projects/feed) plus
    // those literals verbatim from source, not fabricated.
    `__CAP__.ops = {
      kpis: { activeEngagements: 6, shippedThisWeek: 14, onTimeRate: '92%', openItems: 23, avgResponse: '3.1h' },
      projects: projects.map(p => ({ client: p.c, phase: p.ph, pct: p.pct, status: p.st, next: p.next })),
      feed: feed.map(f => ({ time: f[0], event: f[1], agent: f[2] })),
    };\n`,
  ];
  let out = parts[0];
  for (let i = 0; i < injections.length; i++) {
    out += injections[i] + DELIM + parts[i + 1];
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Minimal DOM stub — just enough for top-level script code (which runs
//    unconditionally on load, before any build*() call) to not throw.
// ---------------------------------------------------------------------------
function makeSandbox() {
  function fakeEl() {
    const el = {
      _html: '',
      classList: { contains: () => false, add() {}, remove() {}, toggle() {} },
      style: { setProperty() {}, removeProperty() {} },
      dataset: {},
      querySelector: () => fakeEl(),
      querySelectorAll: () => [],
      appendChild() { return arguments[0]; },
      addEventListener() {},
      removeEventListener() {},
      setAttribute() {},
      getAttribute: () => null,
      scrollIntoView() {},
      closest: () => null,
    };
    Object.defineProperty(el, 'innerHTML', {
      get() { return this._html; },
      set(v) { this._html = v; },
    });
    return el;
  }
  const documentStub = {
    body: fakeEl(),
    documentElement: fakeEl(),
    querySelector: () => fakeEl(),
    querySelectorAll: () => [],
    getElementById: () => fakeEl(),
    createElement: () => fakeEl(),
    addEventListener() {},
  };
  const sandbox = {
    document: documentStub,
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame() { /* no-op: never re-invoke, avoids infinite tick() recursion */ },
    requestIdleCallback() { /* no-op */ },
    setTimeout,
    clearTimeout,
    MutationObserver: class { constructor(cb) { this.cb = cb; } observe() {} disconnect() {} },
    console,
    innerWidth: 1600,
    innerHeight: 1000,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'node', vibrate() {} },
    matchMedia() { return { matches: false, addEventListener() {}, addListener() {} }; },
    getComputedStyle() { return { getPropertyValue: () => '' }; },
    ResizeObserver: class { observe() {} disconnect() {} },
    performance: { now: () => Date.now() },
    location: { href: 'https://skilltree-hub.vercel.app/app/dash/index.html', pathname: '/app/dash/index.html', hash: '' },
    __CAP__: {},
    __fakeEl: fakeEl,
  };
  sandbox.window = sandbox;
  return sandbox;
}

function main() {
  const html = readRaw('skilltree_dash_index_html.txt');
  const scriptBody = extractScriptBody(html);
  const patched = injectCaptures(scriptBody);

  const sandbox = makeSandbox();
  vm.createContext(sandbox);

  vm.runInContext(patched, sandbox, { filename: 'dash-index:script' });

  // Call each builder in preview mode (skips event wiring, which needs a
  // richer querySelectorAll than our stub provides) so el.innerHTML is
  // assigned and, more importantly, our injected __CAP__ line runs.
  vm.runInContext(
    `
    buildMeta(__fakeEl(), true);
    buildPipeline(__fakeEl(), true);
    buildFinance(__fakeEl(), true);
    buildContent(__fakeEl(), true);
    buildOutbound(__fakeEl(), true);
    buildOps(__fakeEl(), true);
    `,
    sandbox,
    { filename: 'dash-index:invoke' }
  );

  const CAP = sandbox.__CAP__;
  for (const k of ['meta', 'pipeline', 'finance', 'content', 'outbound', 'ops']) {
    if (!CAP[k]) throw new Error(`__CAP__.${k} n'a pas été rempli — l'injection ou l'exécution a échoué`);
  }

  // ---- shape into data/dashboards.json --------------------------------
  const fmt$ = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const fmt$2 = (v) => '$' + v.toFixed(2);
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');
  const fmtPct = (v) => v.toFixed(2) + '%';
  const pct = (a, b) => (b ? ((a - b) / b) * 100 : 0);

  const meta = CAP.meta, pipeline = CAP.pipeline, finance = CAP.finance, content = CAP.content, outbound = CAP.outbound, ops = CAP.ops;

  const centers = [
    {
      id: 'meta', short: 'Meta Ads', name: 'Meta Ads · Paid Acquisition',
      sub: 'Every dollar, every lead, every fatigue signal · one screen', color: '#A78BFA',
      range_days: meta.range,
      stats: [
        { label: 'Total Spend', value: fmt$(meta.totals.spend), delta: pct(meta.totals.spend, meta.prev_totals.spend).toFixed(1) + '%' },
        { label: 'Leads', value: fmtN(meta.totals.leads), delta: pct(meta.totals.leads, meta.prev_totals.leads).toFixed(1) + '%' },
        { label: 'Cost per Lead', value: fmt$2(meta.totals.cpl), delta: pct(meta.totals.cpl, meta.prev_totals.cpl).toFixed(1) + '%' },
        { label: 'Link CTR', value: fmtPct(meta.totals.ctr), delta: pct(meta.totals.ctr, meta.prev_totals.ctr).toFixed(1) + '%' },
        { label: 'CPM', value: fmt$2(meta.totals.cpm), delta: pct(meta.totals.cpm, meta.prev_totals.cpm).toFixed(1) + '%' },
        { label: 'Frequency', value: meta.totals.freq.toFixed(2), delta: pct(meta.totals.freq, meta.prev_totals.freq).toFixed(1) + '%' },
      ],
      tables: {
        campaigns: meta.campaigns.map((c) => ({
          name: c.name, status: c.status, budget_per_day: c.budget,
          spend: fmt$(c.spend), leads: fmtN(c.leads), cpl: c.leads > 1 ? fmt$2(c.cpl) : null, ctr: c.spend > 1 ? fmtPct(c.ctr) : null,
        })),
      },
    },
    {
      id: 'pipeline', short: 'Pipeline', name: 'HubSpot · Sales Pipeline',
      sub: 'Weighted forecast, stalled-deal radar, honest win rates', color: '#EF4444',
      stats: [
        { label: 'Open Pipeline', value: fmt$(pipeline.open), delta: '+8.2%' },
        { label: 'Weighted Forecast', value: fmt$(pipeline.weighted), delta: '+11.4%' },
        { label: 'Won This Quarter', value: fmt$(86500), delta: '5 deals' },
        { label: 'Win Rate', value: '27%', delta: '+4 pts' },
        { label: 'Avg Cycle', value: '47 days', delta: '-6d' },
      ],
      tables: {
        by_stage: pipeline.byStage.map((s) => ({ label: s.label, value: fmt$(s.v) })),
        by_source: pipeline.bySrc.map((s) => ({ label: s.label, value: fmt$(s.v) })),
        open_deals: pipeline.deals.slice(0, 15).map((d) => ({ company: d.company, project: d.project, stage: d.stage, amount: fmt$(d.amount), owner: d.owner, close_in_days: d.closeIn, stalled: d.stalled })),
      },
    },
    {
      id: 'finance', short: 'Finance', name: 'Xero · Finance',
      sub: 'Cash, P&L, and who owes you money · chased automatically', color: '#FACC15',
      stats: [
        { label: 'Cash On Hand', value: fmt$(finance.cashTotal), delta: '+5.1%' },
        { label: 'Revenue · May', value: fmt$(finance.pl[11].bar), delta: '+12.4%' },
        { label: 'Net Profit · May', value: fmt$(finance.pl[11].line), delta: ((finance.pl[11].line / finance.pl[11].bar) * 100).toFixed(0) + '%' },
        { label: 'Receivables', value: fmt$(finance.arTotal), delta: fmt$(finance.overdue) + ' late' },
      ],
      tables: {
        aged_receivables: finance.ar.map((a) => ({ label: a.label, value: fmt$(a.v) })),
        pl_monthly: finance.pl.map((p) => ({ month: p.label, revenue: Math.round(p.bar), net_profit: Math.round(p.line) })),
        invoices: finance.invoices.map((v) => ({ no: v.no, client: v.client, total: fmt$(v.total), due: v.due ? fmt$(v.due) : null, when: v.when, status: v.status })),
      },
    },
    {
      id: 'content', short: 'Content', name: 'Instagram + TikTok · Content',
      sub: 'What ran, what worked, what to re-hash next', color: '#FB7185',
      range_days: content.range,
      stats: [
        { label: 'Views', value: fmtN(content.views), delta: pct(content.views, content.prevViews).toFixed(1) + '%' },
        { label: 'Reach', value: fmtN(content.reach), delta: '+18%' },
        { label: 'Engaged', value: fmtN(content.engaged), delta: ((content.engaged / content.reach) * 100).toFixed(1) + '% of reach' },
        { label: 'Net Followers', value: '+' + fmtN(content.netFollowers), delta: 'last ' + content.range + 'd' },
        { label: 'Interactions', value: fmtN(content.interactions), delta: '+9%' },
      ],
      tables: {
        top_posts: content.posts.map((m) => ({ caption: m.caption, date: m.date, type: m.type, views: m.views, reach: m.reach, saved: m.saved, shares: m.shares })),
      },
    },
    {
      id: 'outbound', short: 'Outbound', name: 'Instantly + HeyReach · Outbound',
      sub: 'From cold send to booked call, counted honestly', color: '#FF9D5C',
      range_days: outbound.range,
      stats: [
        { label: 'Emails Sent', value: fmtN(outbound.sent), delta: pct(outbound.sent, outbound.prevSent).toFixed(1) + '%' },
        { label: 'Real Replies', value: fmtN(outbound.realReplies), delta: ((outbound.realReplies / outbound.sent) * 100).toFixed(1) + '%' },
        { label: 'Opportunities', value: fmtN(outbound.opportunities), delta: ((outbound.opportunities / outbound.sent) * 100).toFixed(2) + '%' },
        { label: 'Pipeline Value', value: fmt$(outbound.oppValue), delta: '+24%' },
        { label: 'Bounce Rate', value: outbound.bounceRate.toFixed(1) + '%', delta: '< 3% healthy' },
      ],
      tables: {
        campaigns: outbound.campaigns.map((c) => ({ name: c.name, list: c.list, sent: c.sent, reply_rate: c.replyRate + '%', opportunities: c.opportunities, bounce: c.bounce + '%' })),
      },
    },
    {
      id: 'ops', short: 'Delivery', name: 'Mission Control · Client Delivery',
      sub: 'Six engagements, one ops room · agents doing the work', color: '#5EEAD4',
      stats: [
        { label: 'Active Engagements', value: String(ops.kpis.activeEngagements), delta: '5 verticals' },
        { label: 'Shipped This Week', value: String(ops.kpis.shippedThisWeek), delta: '+3 vs avg' },
        { label: 'On-Time Rate', value: ops.kpis.onTimeRate, delta: '30d' },
        { label: 'Open Items', value: String(ops.kpis.openItems), delta: '3 overdue' },
        { label: 'Avg Response', value: ops.kpis.avgResponse, delta: '-40min' },
      ],
      tables: {
        engagements: ops.projects.map((p) => ({ client: p.client, phase: p.phase, pct: p.pct, status: p.status, next: p.next })),
        activity_feed: ops.feed,
      },
    },
  ];

  const out = {
    source: 'captures/raw/skilltree_dash_index_html.txt (const CAMPAIGNS/deals/pl/media/camps/projects + seeded PRNG, executed via Node vm — see tools/agent_c_parse_dash.js)',
    method: 'Executed the real client-side generator (not fetched from any API — confirmed 0 network hits by tools/agent_c_hunt.py). seed=20260611 (Park-Miller LCG), "today" hardcoded to 2026-06-11 in source, so values are exactly reproducible.',
    count: centers.length,
    centers,
  };

  fs.mkdirSync(DATA, { recursive: true });
  const outPath = path.join(DATA, 'dashboards.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');

  console.log(`[write] data/dashboards.json — ${centers.length} centers`);
  const example = centers.find((c) => c.id === 'meta');
  console.log('[example] Meta Ads:');
  console.log(JSON.stringify(example, null, 2));
}

main();
