"""Candidate browser gate; serves freshly built dist, not the currently published site."""
import argparse, json
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright, expect

parser=argparse.ArgumentParser()
parser.add_argument("--url",default="http://127.0.0.1:8766/")
parser.add_argument("--output",default="artifacts/event-lab")
args=parser.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
    ctx=browser.new_context(viewport={"width":1440,"height":1000},reduced_motion="reduce")
    ctx.tracing.start(screenshots=True,snapshots=True,sources=True)
    page=ctx.new_page();errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
    def click(name):page.get_by_role("button",name=name,exact=True).click()
    def phase(name):expect(page.get_by_test_id("run-phase")).to_have_text(name)
    def shot(name):
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        page.locator(".event-scene").screenshot(path=str(out/(name+".png")),animations="disabled")
    try:
        page.goto(args.url);expect(page.get_by_role("heading",name="Factory overview.")).to_be_visible()
        click("Scenario lab");phase("idle")
        expect(page.get_by_role("button",name="Start order B")).to_be_disabled()
        click("Allocate order A");phase("reference");shot("01-reference")
        click("Inject material shortage");phase("blocked")
        expect(page.get_by_test_id("original-state")).to_have_text("held")
        expect(page.get_by_test_id("active-route")).to_contain_text("notified")
        expect(page.get_by_test_id("event-trace").locator("details")).to_have_count(3)
        shot("02-shortage")
        click("Attempt unauthorized shortcut");phase("rejected")
        click("Propose eligible order B");phase("proposed")
        expect(page.get_by_role("button",name="Start order B")).to_be_disabled()
        click("Proposed");expect(page.get_by_test_id("alternative-state")).to_have_text("proposed")
        shot("03-proposed")
        click("Reference");expect(page.get_by_test_id("original-state")).to_have_text("allocated")
        click("Operational");phase("proposed")
        click("Authorize B readiness");phase("authorized")
        click("Start order B");phase("running");shot("04-running")
        click("Complete processing B");phase("complete")
        expect(page.get_by_test_id("original-state")).to_have_text("held")
        expect(page.get_by_test_id("alternative-state")).to_have_text("complete")
        expect(page.get_by_test_id("event-trace").locator("details")).to_have_count(9)
        shot("05-complete-hold")
        renderer="WebGL" if page.locator(".event-scene canvas").count()==1 else "SVG fallback"
        diffs={}
        for first,second in [("01-reference","02-shortage"),("02-shortage","03-proposed"),("03-proposed","04-running"),("04-running","05-complete-hold")]:
            a=Image.open(out/(first+".png")).convert("RGB");b=Image.open(out/(second+".png")).convert("RGB")
            assert a.size==b.size,(first,second,a.size,b.size)
            change=ImageChops.difference(a,b).convert("L").point(lambda p:255 if p>12 else 0).histogram()[255]
            diffs[first+" -> "+second]=change
            assert change>100,(first,second,"Scene visually unchanged",change)
        click("Event explorer");expect(page.get_by_test_id("event-trace").locator("details")).to_have_count(9)
        click("Test suite");click("Run scenario tests")
        expect(page.get_by_test_id("scenario-results").locator("p")).to_have_count(8)
        expect(page.get_by_test_id("scenario-results")).not_to_contain_text("FAIL")
        click("Scenario lab");phase("complete");click("Reset event run");phase("idle")
        expect(page.get_by_test_id("event-trace").locator("details")).to_have_count(0)
        click("Test suite");click("Watch complete test journey")
        expect(page.get_by_test_id("run-phase")).to_have_text("complete",timeout=25000)
        expect(page.get_by_test_id("event-trace").locator("details")).to_have_count(9)
        click("Reset event run");phase("idle")
        page.set_viewport_size({"width":390,"height":844})
        assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"),"Mobile horizontal overflow"
        page.screenshot(path=str(out/"06-mobile.png"),full_page=True)
        assert not errors,errors
        report={"renderer":renderer,"scene_changed_pixels":diffs,"hardware_gpu":"NOT RUN","transport":"browser memory","browser_journey":"PASS"}
        (out/"result.json").write_text(json.dumps(report,indent=2));print(json.dumps(report))
        # SVG is useful evidence, but not a successful WebGL gate.
        assert renderer=="WebGL","Software WebGL unavailable; SVG checks passed, WebGL gate open"
    finally:
        ctx.tracing.stop(path=str(out/"trace.zip"))
        ctx.close();browser.close()
