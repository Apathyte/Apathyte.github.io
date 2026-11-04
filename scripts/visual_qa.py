#!/usr/bin/env python3
"""Render and test the static website in Chromium. Saves artifacts even on failure."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

VIEWPORTS = (
    ("desktop", 1440, 900),
    ("laptop", 1024, 768),
    ("tablet", 768, 1024),
    ("mobile", 390, 844),
    ("small-mobile", 320, 720),
)


def contact_sheet(folder):
    try:
        from PIL import Image, ImageDraw
        previews = []
        for name, _, _ in VIEWPORTS:
            filename = folder / (name + "-abovefold.png")
            if not filename.exists():
                continue
            with Image.open(filename) as source:
                shot = source.convert("RGB")
            width = 510 if name in ("desktop", "laptop", "tablet") else 260
            height = round(shot.height * width / shot.width)
            previews.append((name, shot.resize((width, height))))
        if not previews:
            return
        cell_w, cell_h = 560, 650
        sheet = Image.new("RGB", (3 * cell_w, 2 * cell_h), "#0b0913")
        draw = ImageDraw.Draw(sheet)
        for i, (name, img) in enumerate(previews):
            x = (i % 3) * cell_w + 20
            y = (i // 3) * cell_h + 38
            draw.text((x, y - 23), name, fill="#d9c5f2")
            sheet.paste(img.crop((0, 0, img.width, min(img.height, cell_h - 55))), (x, y))
        sheet.save(folder / "review-contact-sheet.png", optimize=True)
    except Exception as err:
        print("Contact sheet unavailable:", err, file=sys.stderr)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8765/")
    parser.add_argument("--output-dir", default="artifacts/site-qa")
    parser.add_argument("--chromium-path", default=os.getenv("CHROMIUM_PATH"))
    parser.add_argument("--skip-interactions", action="store_true")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/") + "/"
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    failures, warnings, reports = [], [], []
    with sync_playwright() as playwright:
        options = {"headless": True}
        if args.chromium_path:
            options["executable_path"] = args.chromium_path
            options["args"] = ["--no-sandbox"]
        browser = playwright.chromium.launch(**options)
        for name, width, height in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=1,
                reduced_motion="no-preference",
            )
            page = context.new_page()
            errors, missing_assets = [], []
            page.on("pageerror", lambda err: errors.append(str(err)))
            page.on(
                "response",
                lambda response: missing_assets.append(str(response.status) + ": " + response.url)
                if response.status >= 400 and urlparse(response.url).netloc == urlparse(base_url).netloc
                else None,
            )
            report = {"viewport": name, "width": width, "height": height, "checks": {}}
            try:
                page.goto(base_url, wait_until="domcontentloaded", timeout=25000)
                page.locator(".landing-cards").wait_for(timeout=10000)
                try:
                    page.wait_for_function("document.fonts.status === 'loaded'", timeout=9000)
                except Exception:
                    warnings.append(name + ": web fonts were not ready within 9 seconds")
                page.wait_for_timeout(250)
                dims = page.evaluate("""() => {
                  const html = document.documentElement, body = document.body;
                  const heading = document.querySelector('.family-name')?.getBoundingClientRect();
                  const ids = [...document.querySelectorAll('[id]')].map(x => x.id);
                  return {
                    documentWidth: Math.max(html.scrollWidth,body.scrollWidth),
                    missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
                      .map(a => decodeURIComponent(a.getAttribute('href').slice(1)))
                      .filter(id => id && !document.getElementById(id)),
                    duplicateIds: ids.filter((id,i) => ids.indexOf(id) !== i),
                    images: [...document.querySelectorAll('#knight-art, #dex-frame')]
                      .map(i => ({id:i.id, loaded:i.complete && i.naturalWidth > 0, src:i.currentSrc})),
                    heading: heading && {left:heading.left,right:heading.right},
                    landingCards:document.querySelectorAll('.landing-card').length,
                    openProjects:document.querySelectorAll('.open-project').length,
                    verified:Boolean(document.querySelector('meta[name="google-site-verification"]')),
                    canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
                    identity:(() => {
                      try {
                        const data = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
                        const person = data.mainEntity || {};
                        return {name:person.name,jobTitle:person.jobTitle,worksFor:person.worksFor?.name};
                      } catch {return null;}
                    })(),
                    publicEvidence:{
                      primary:Boolean(document.querySelector('a[href*="cybersecurity-smart-factories-when-trust"]')),
                      interview:Boolean(document.querySelector('a[href*="wtbe.nl/nieuws/interview-met-tim-boersma"]')),
                      regional:Boolean(document.querySelector('a[href*="it.linkedin.com/posts/ats-global-italy"]')),
                      project:Boolean(document.querySelector('a[href*="operational-authority-toolkit"]')),
                    },
                    protagonistText:document.querySelector('#page-title')?.textContent,
                    heroOrg:document.querySelector('.hero-org')?.textContent,
                    alignment:(() => {
                      const box = selector => {
                        const el = document.querySelector(selector);
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                          width:r.width,height:r.height,centerX:(r.left+r.right)/2,
                          centerY:(r.top+r.bottom)/2};
                      };
                      const root = document.querySelector('.wrap');
                      const bounds = root.getBoundingClientRect();
                      const style = getComputedStyle(root);
                      const rails = {
                        left:bounds.left+parseFloat(style.paddingLeft),
                        right:bounds.right-parseFloat(style.paddingRight)
                      };
                      const major = Object.fromEntries([
                        ['header','header'],['hero','.landing-hero'],
                        ['overview','.landing-overview'],['projects','.open-work'],
                        ['about','#about'],['field','#work'],
                        ['sources','#evidence'],['notebook','#notebook'],
                        ['footer','footer']
                      ].map(([name,selector]) => [name,box(selector)]));
                      const panels = Object.fromEntries([
                        ['work',box('#work')?.right],
                        ['demo',box('#work .media-layout')?.right],
                        ['sources',box('#evidence')?.right],
                        ['refs',box('#evidence .refs')?.right],
                        ['notebook',box('#notebook')?.right],
                        ['quote',box('#quote-rotator')?.right]
                      ]);
                      const quote = document.getElementById('notebook-quote');
                      const panel = box('#quote-rotator');
                      const quotation = box('#notebook-quote');
                      const label = box('#quote-provenance');
                      let sample = {count:0,maxVerticalDeviation:0,
                        maxHorizontalDeviation:0,overlapCount:0,heightVariation:0,
                        textAlign:getComputedStyle(quote).textAlign};
                      const source = [...document.querySelectorAll('script')]
                        .map(node => node.textContent)
                        .find(source => source.includes('const entries ='));
                      const match = source?.match(/const entries = (\[[\s\S]*?\]);/);
                      if (match && quote && panel && label) {
                        try {
                          const lines = JSON.parse(match[1]);
                          const original = quote.textContent;
                          const heights = [];
                          for (const entry of lines) {
                            quote.textContent = entry.quote;
                            const rect = quote.getBoundingClientRect();
                            const stage = document.getElementById('quote-rotator').getBoundingClientRect();
                            sample.maxVerticalDeviation=Math.max(sample.maxVerticalDeviation,
                              Math.abs((rect.top+rect.bottom-stage.top-stage.bottom)/2));
                            sample.maxHorizontalDeviation=Math.max(sample.maxHorizontalDeviation,
                              Math.abs((rect.left+rect.right-stage.left-stage.right)/2));
                            if(rect.top<label.bottom+6) sample.overlapCount++;
                            heights.push(stage.height);
                          }
                          quote.textContent=original;
                          sample.count=lines.length;
                          sample.heightVariation=Math.max(...heights)-Math.min(...heights);
                        } catch (e) {sample.error=String(e);}
                      }
                      return {rails,major,panels,panel,quotation,label,sample};
                    })()
                  };
                }""")
                report["measurements"] = dims
                checks = report["checks"]
                checks["no_horizontal_overflow"] = dims["documentWidth"] <= width + 2
                checks["valid_anchors"] = not dims["missingAnchors"]
                checks["unique_ids"] = not dims["duplicateIds"]
                checks["four_cards"] = dims["landingCards"] == 4
                checks["three_projects"] = dims["openProjects"] == 3
                checks["search_metadata"] = (
                    dims["verified"] and dims["canonical"] == "https://apathyte.github.io/"
                )
                person = dims.get("identity") or {}
                evidence = dims.get("publicEvidence") or {}
                checks["identity_is_attributable"] = (
                    person.get("name") == "Tim Boersma"
                    and "Operational Technology" in (person.get("jobTitle") or "")
                    and person.get("worksFor") == "ATS Global"
                    and "Tim" in (dims.get("protagonistText") or "")
                    and "Boersma" in (dims.get("protagonistText") or "")
                    and "ATS Global" in (dims.get("heroOrg") or "")
                )
                checks["public_evidence_preserved"] = (
                    all(evidence.get(x) for x in ("primary","interview","regional","project"))
                )
                alignment = dims.get("alignment") or {}
                rails = alignment.get("rails") or {}
                major = alignment.get("major") or {}
                panels = alignment.get("panels") or {}
                expected_left = rails.get("left", -9999)
                expected_right = rails.get("right", -9999)
                checks["consistent_page_rails"] = (
                    len(major) == 9 and all(
                        rect is not None
                        and abs(rect["left"] - expected_left) <= 2
                        and abs(rect["right"] - expected_right) <= 2
                        for rect in major.values()
                    )
                )
                checks["functional_panels_fill_columns"] = (
                    all(isinstance(panels.get(k), (int,float))
                        for k in ("work","demo","sources","refs","notebook","quote"))
                    and abs(panels["work"] - panels["demo"]) <= 2
                    and abs(panels["sources"] - panels["refs"]) <= 2
                    and abs(panels["notebook"] - panels["quote"]) <= 2
                )
                sample = alignment.get("sample") or {}
                checks["quote_centered_all_lines"] = (
                    sample.get("count") == 29
                    and sample.get("textAlign") == "center"
                    and sample.get("maxHorizontalDeviation", 999) <= 3
                    and sample.get("maxVerticalDeviation", 999) <= 17
                    and sample.get("overlapCount") == 0
                    and sample.get("heightVariation", 999) <= 4
                )
                checks["character_images"] = (
                    len(dims["images"]) == 2 and all(i["loaded"] for i in dims["images"])
                )
                heading = dims["heading"]
                checks["heading_fits"] = bool(
                    heading and heading["left"] >= -2 and heading["right"] <= width + 2
                )
                page.screenshot(
                    path=str(output / (name + "-abovefold.png")),
                    animations="disabled", full_page=False,
                )
                page.screenshot(
                    path=str(output / (name + "-full.png")),
                    animations="disabled", full_page=True,
                )
                if name == "desktop" and not args.skip_interactions:
                    page.locator("#dex-patrol").scroll_into_view_if_needed()
                    page.locator("#dex-patrol").click(timeout=10000)
                    checks["dex_responds"] = (
                        page.locator("#dex-response").text_content() == "Good dog, Dex."
                    )
                    page.locator("#preview-notebook").scroll_into_view_if_needed()
                    page.wait_for_timeout(250)
                    original = page.locator("#preview-quote").text_content()
                    page.wait_for_timeout(5400)
                    checks["notebook_rotates"] = (
                        page.locator("#preview-quote").text_content() != original
                    )
                    checks["notebook_synced"] = (
                        page.locator("#preview-quote").text_content()
                        == page.locator("#notebook-quote").text_content()
                    )
                dex_geometry = page.evaluate("""() => {
                  const stage = document.querySelector('#night-stage').getBoundingClientRect();
                  const dog = document.querySelector('#dex-patrol');
                  const image = document.querySelector('#dex-frame');
                  const rendering = getComputedStyle(image).imageRendering;
                  const animation = dog.getAnimations().find(a => a.animationName === 'dex-patrol');
                  const originalTime = animation?.currentTime ?? null;
                  const wasRunning = animation?.playState === 'running';
                  if (animation) animation.pause();
                  const duration = animation ? Number(animation.effect.getComputedTiming().duration) : 0;
                  const samples = (animation ? [0, .07, .44, .49, .50, .55, .94, .99] : [0]).map(fraction => {
                    if (animation) animation.currentTime = fraction * duration;
                    const rect = dog.getBoundingClientRect();
                    const gap = {
                      left: rect.left - stage.left,
                      right: stage.right - rect.right,
                      top: rect.top - stage.top,
                      bottom: stage.bottom - rect.bottom
                    };
                    return {fraction, gap, fits: Object.values(gap).every(v => v >= -2)};
                  });
                  if (animation) {
                    animation.currentTime = originalTime;
                    if (wasRunning) animation.play();
                  }
                  return {
                    rendering, animationSampled: Boolean(animation), stageWidth: stage.width,
                    samples, fits: rendering === 'auto' && samples.every(s => s.fits)
                  };
                }""")
                report["dex_geometry"] = dex_geometry
                checks["dex_stage_framing"] = dex_geometry["fits"]
                checks["no_script_errors"] = not errors
                checks["no_missing_site_assets"] = not missing_assets
                report["script_errors"] = errors
                report["asset_errors"] = missing_assets
                failures.extend(name + ": " + key for key, passed in checks.items() if not passed)
            except Exception as err:
                failures.append(name + ": " + str(err))
                report["exception"] = str(err)
                try:
                    page.screenshot(path=str(output / (name + "-error.png")), full_page=True)
                except Exception:
                    pass
            reports.append(report)
            context.close()

        if not args.skip_interactions:
            context = browser.new_context(
                viewport={"width": 1024, "height": 768}, reduced_motion="reduce"
            )
            page = context.new_page()
            try:
                page.goto(base_url, wait_until="domcontentloaded", timeout=25000)
                animation = page.locator(".night-knight").evaluate(
                    "element => getComputedStyle(element).animationName"
                )
                if animation != "none":
                    failures.append("reduced-motion: knight animation must be disabled")
                reports.append({"viewport": "reduced-motion", "animationName": animation})
            except Exception as err:
                failures.append("reduced-motion: " + str(err))
            finally:
                context.close()
        browser.close()

    contact_sheet(output)
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": base_url,
        "passed": not failures,
        "failures": failures,
        "warnings": warnings,
        "viewports": reports,
    }
    (output / "results.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (output / "results.md").write_text(
        "# Visual QA\n\n" + ("PASS" if not failures else "FAIL") + "\n\n"
        + "\n".join("- " + f for f in failures) + "\n",
        encoding="utf-8",
    )
    print("Visual QA:", "PASS" if not failures else "FAIL")
    for failure in failures:
        print("FAIL:", failure, file=sys.stderr)
    for warning in warnings:
        print("WARN:", warning, file=sys.stderr)
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
