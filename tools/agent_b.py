#!/usr/bin/env python3
"""Agent B — capture DASHBOARDS (command centers, full opened view + all period tabs)
et CHART (7 secteurs, matrice complete + tous les jobs/skills) sur /map.

Interpreteur: ~/.higgsfield-login-venv/bin/python
Usage: python tools/agent_b.py
"""
import sys, re, json, time, pathlib
sys.path.insert(0, "tools")
from skilltree import driver, goto, shot, save_json

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    return s.strip("-")

PERIOD_RE = re.compile(r"^\d+\s*(d|mo)$", re.I)

def capture_dashboards(pg, mapfr):
    print("\n=== DASHBOARDS ===")
    mapfr.click("a:text-is('DASHBOARDS')")
    pg.wait_for_timeout(2500)
    mapfr.click(".ccard.focused")
    pg.wait_for_timeout(1500)

    results = []
    for i in range(6):
        name = mapfr.evaluate("() => document.getElementById('state-name')?.textContent.trim()")
        slug = slugify(name) or f"dashboard-{i}"
        print(f"[{i}] {name} -> {slug}")

        # default period screenshot (full page)
        png = f"captures/dashboards/{slug}_full.png"
        shot(pg, png)

        default_text = mapfr.evaluate("() => document.getElementById('dwrap')?.innerText || document.body.innerText")
        kpis = mapfr.evaluate("""() => [...document.querySelectorAll('#dwrap .kpi')].map(k => k.textContent.trim().replace(/\\s+/g,' '))""")
        panels = mapfr.evaluate("""() => [...document.querySelectorAll('#dwrap .panel')].map(p => ({
            title: (p.querySelector('h2,h3,[class*=title]')?.textContent || '').trim(),
            text: p.textContent.trim().replace(/\\s+/g,' ').slice(0, 4000)
        }))""")

        # period buttons (7d/14d/30d/90d or 6mo/12mo)
        period_buttons = mapfr.evaluate("""() => [...document.querySelectorAll('#dwrap button')]
            .map(b => b.textContent.trim())
            .filter(t => /^\\d+\\s*(d|mo)$/i.test(t))""")
        periods = {}
        for label in period_buttons:
            try:
                el = mapfr.query_selector(f"#dwrap button:text-is('{label}')")
                if not el:
                    continue
                el.click()
                pg.wait_for_timeout(900)
                periods[label] = mapfr.evaluate("""() => [...document.querySelectorAll('#dwrap .kpi')].map(k => k.textContent.trim().replace(/\\s+/g,' '))""")
            except Exception as e:
                print(f"  [!] periode {label}: {type(e).__name__}")

        data = {
            "index": i, "name": name, "slug": slug,
            "default_kpis": kpis, "panels": panels,
            "periods": periods,
            "full_text": default_text,
        }
        save_json(f"captures/dashboards/{slug}_full.json", data)
        results.append({"index": i, "name": name, "slug": slug, "n_panels": len(panels), "n_periods": len(periods)})

        # advance to next dashboard via edge-dr (stays in dashmode)
        if i < 5:
            mapfr.click("#edge-dr")
            pg.wait_for_timeout(1600)

    save_json("captures/dashboards/_manifest.json", results)
    return results


def capture_chart(pg, mapfr):
    print("\n=== CHART ===")
    mapfr.click("a:text-is('CHART')")
    pg.wait_for_timeout(2500)

    sector_names = mapfr.evaluate("() => [...document.querySelectorAll('button.dept')].map(b => b.textContent.trim())")
    print("Secteurs:", sector_names)

    results = []
    for name in sector_names:
        slug = slugify(name)
        print(f"[sector] {name} -> {slug}")
        btn = mapfr.query_selector(f"button.dept:text-is('{name}')")
        btn.click()
        pg.wait_for_timeout(1200)

        summary = mapfr.evaluate("() => document.querySelector('.pagehead .subline')?.textContent.trim()")

        # matrix collapsed screenshot
        shot(pg, f"captures/chart/{slug}__matrix.png")

        # expand every card at once (bypasses single-open UI limit) then screenshot
        mapfr.evaluate("() => document.querySelectorAll('#boardgrid .card').forEach(c=>c.classList.add('open'))")
        pg.wait_for_timeout(600)
        shot(pg, f"captures/chart/{slug}__expanded.png")

        jobs = mapfr.evaluate("""() => {
            const out = [];
            document.querySelectorAll('#boardgrid .lane').forEach(lane => {
                const laneCls = ['led','ass','aut'].find(c => lane.classList.contains(c));
                const level = {led:'human-led', ass:'assisted', aut:'autonomous'}[laneCls];
                const cells = [...lane.querySelectorAll('.cell')];
                cells.forEach((cell, idx) => {
                    cell.querySelectorAll('.card').forEach(card => {
                        out.push({
                            name: card.querySelector('.card-name')?.textContent.trim(),
                            level: level,
                            stage: level === 'human-led' ? null : idx + 1,
                            meta: card.querySelector('.card-meta')?.textContent.trim(),
                            desc: card.querySelector('.desc')?.textContent.trim(),
                            skills: [...card.querySelectorAll('.chip')].map(c => c.textContent.trim())
                        });
                    });
                });
            });
            return out;
        }""")

        data = {"sector": name, "slug": slug, "summary": summary, "n_jobs": len(jobs), "jobs": jobs}
        save_json(f"captures/chart/{slug}.json", data)
        results.append({"sector": name, "slug": slug, "summary": summary, "n_jobs": len(jobs)})

    save_json("captures/chart/_manifest.json", results)
    return results


if __name__ == "__main__":
    with driver() as (pg, BASE):
        goto(pg, BASE + "/map", wait=3)
        mapfr = next(f for f in pg.frames if "app-map" in f.url)

        dash_results = capture_dashboards(pg, mapfr)

        # re-fetch map frame reference before switching to chart (dash navigation reused same frame obj, still valid)
        chart_results = capture_chart(pg, mapfr)

        print("\n=== SUMMARY ===")
        print("Dashboards:", json.dumps(dash_results, indent=2))
        print("Chart sectors:", json.dumps(chart_results, indent=2))
