#!/usr/bin/env python3
"""Authenticated capture of skilltree-hub for personal FR reconstruction.
Reads creds from ../.env.md (never printed). Logs in, walks nav, screenshots each route.
ponytail: one script, no framework. Discovers routes from the DOM instead of hardcoding.
"""
import os, re, sys, json, time, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENV = ROOT / ".env.md"
OUT = ROOT / "captures"
OUT.mkdir(exist_ok=True)

def load_env(p):
    d = {}
    for line in p.read_text().splitlines():
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            d[k.strip()] = v.strip()
    return d

env = load_env(ENV)
BASE = env["URL"].rstrip("/")
LOGIN = env.get("URL_login", BASE + "/login")
USER = env["login"]; PWD = env["password"]

from playwright.sync_api import sync_playwright

def slug(u):
    path = re.sub(r"^https?://[^/]+", "", u).strip("/") or "home"
    return re.sub(r"[^a-zA-Z0-9]+", "_", path)[:60]

results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
    page = ctx.new_page()

    print("[*] login page")
    page.goto(LOGIN, wait_until="networkidle", timeout=45000)
    page.screenshot(path=str(OUT / "00_login.png"))
    # fill credentials
    try:
        page.fill("input[type=email], input[name=email], input[name=identifier]", USER, timeout=10000)
        page.fill("input[type=password], input[name=password]", PWD, timeout=10000)
        # submit
        btn = page.query_selector("button[type=submit]") or page.query_selector("button:has-text('Sign in')") or page.query_selector("button:has-text('Log in')") or page.query_selector("button:has-text('Continue')")
        if btn: btn.click()
        else: page.keyboard.press("Enter")
    except Exception as e:
        print("[!] login fill error:", type(e).__name__, e)
    page.wait_for_load_state("networkidle", timeout=45000)
    time.sleep(3)
    print("[*] post-login url:", page.url)
    page.screenshot(path=str(OUT / "01_after_login.png"), full_page=True)

    logged_in = "/login" not in page.url
    print("[*] logged_in:", logged_in)

    # discover internal nav links
    links = page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))")
    routes = set()
    for h in links:
        if not h: continue
        if h.startswith("/") and not h.startswith("//"):
            routes.add(h.split("?")[0].split("#")[0])
        elif h.startswith(BASE):
            routes.add(re.sub(r"^https?://[^/]+", "", h).split("?")[0].split("#")[0])
    # also try common SPA routes observed in the walkthrough video
    for r in ["/", "/play", "/map", "/hub", "/modules", "/tree", "/my-tree", "/brain",
              "/community", "/settings", "/account", "/skills", "/onboarding", "/dashboard"]:
        routes.add(r)
    routes = sorted(r for r in routes if not any(x in r for x in ["/login", "/logout", "/api/", ".png", ".xml"]))
    print(f"[*] {len(routes)} candidate routes:", routes)

    for r in routes:
        url = BASE + r
        name = slug(url)
        try:
            page.goto(url, wait_until="networkidle", timeout=40000)
            time.sleep(2.5)  # let SPA + graph render
            title = page.title()
            final = page.url
            path = OUT / f"route_{name}.png"
            page.screenshot(path=str(path), full_page=True)
            results.append({"route": r, "final_url": final, "title": title, "file": path.name})
            print(f"[+] {r} -> {final} :: {title}")
        except Exception as e:
            print(f"[!] {r}: {type(e).__name__}")
            results.append({"route": r, "error": type(e).__name__})

    (OUT / "manifest.json").write_text(json.dumps({"base": BASE, "logged_in": logged_in, "routes": results}, indent=2))
    browser.close()
print("[*] done. captures in", OUT)
