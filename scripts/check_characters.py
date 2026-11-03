#!/usr/bin/env python3
"""Validate sprite slots and build a review sheet; never imply artistic approval."""
import argparse
import hashlib
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys

from PIL import Image, ImageDraw


def extract_assets(config):
    knight = re.search(
        r'knight:\s*Object\.freeze\(\{\s*idle:\s*"([^"]+)"', config
    )
    dex = re.search(
        r'frames:\s*Object\.freeze\(\[([\s\S]*?)\]\)', config
    )
    revision = re.search(r'artworkRevision:\s*"([^"]+)"', config)
    if not knight or not dex or not revision:
        raise ValueError("Character manifest does not have the expected fields")
    frames = re.findall(r'"([^"]+\.png)"', dex.group(1))
    if not frames:
        raise ValueError("Dex has no sprite frames")
    return revision.group(1), knight.group(1), frames


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-root", default=".")
    parser.add_argument("--output-dir", default="artifacts/site-qa")
    args = parser.parse_args()
    root = Path(args.site_root).resolve()
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    problems = []
    details = []
    try:
        revision, knight_path, dex_paths = extract_assets(
            (root / "characters.js").read_text(encoding="utf-8")
        )
    except Exception as exc:
        print("Character manifest error:", exc, file=sys.stderr)
        return 1
    asset_paths = [("knight", knight_path)] + [
        ("dex-" + str(i), p) for i, p in enumerate(dex_paths)
    ]
    if revision.startswith("knight-v2-approved"):
        master = root / "assets/characters/v2/knight-master.png"
        if not master.is_file():
            problems.append("Approved master knight source is missing")
        elif hashlib.sha256(master.read_bytes()).hexdigest() != "6a1a70915f94f565014209531c327f2c21f3efdbb8c8bcba46177692a869c65c":
            problems.append("Approved master knight source differs from owner-approved V2")
    previews = []
    for label, path in asset_paths:
        candidate = (root / path.lstrip("/")).resolve()
        if not candidate.is_relative_to(root):
            problems.append(label + ": path escapes site root")
            continue
        if not candidate.is_file():
            problems.append(label + ": missing " + path)
            continue
        if label == "knight" and revision.startswith("knight-v2-approved"):
            actual = hashlib.sha256(candidate.read_bytes()).hexdigest()
            if actual != "047736da82281cf6ecc0bada52a4b8939bf91897f286198c21e85f36cb1fd209":
                problems.append("Approved knight web image differs from owner-approved V2")
        try:
            with Image.open(candidate) as original:
                original.load()
                img = original.convert("RGBA")
            alpha = img.getchannel("A")
            extrema = alpha.getextrema()
            if extrema[0] > 0:
                problems.append(label + ": transparency missing")
            if img.width < 16 or img.height < 16:
                problems.append(label + ": image too small")
            if img.width > 2048 or img.height > 2048:
                problems.append(label + ": sprite unexpectedly large")
            details.append({
                "name": label, "path": path, "width": img.width,
                "height": img.height, "alpha_range": list(extrema),
                "bytes": candidate.stat().st_size,
            })
            previews.append((label, img))
        except Exception as exc:
            problems.append(label + ": " + str(exc))
    dex_sizes = {
        (entry["width"], entry["height"])
        for entry in details if entry["name"].startswith("dex-")
    }
    if len(dex_sizes) > 1:
        problems.append("Dex frames do not share a common canvas size")

    cell_w, cell_h = 290, 270
    sheet = Image.new("RGB", (cell_w * len(asset_paths), cell_h), "#0b0913")
    draw = ImageDraw.Draw(sheet)
    for idx, (label, sprite) in enumerate(previews):
        x = idx * cell_w
        draw.text((x + 12, 13), label.upper() + " / " + revision,
                  fill="#d5b2f9")
        # Checkerboard makes transparent pixels visible in art-review.
        grid = Image.new("RGBA", (cell_w - 24, cell_h - 64), "#241b32")
        grid_draw = ImageDraw.Draw(grid)
        for gy in range(0, grid.height, 18):
            for gx in range(0, grid.width, 18):
                if ((gx // 18) + (gy // 18)) % 2 == 0:
                    grid_draw.rectangle((gx, gy, gx + 17, gy + 17),
                                        fill="#312640")
        artwork = sprite.copy()
        artwork.thumbnail((grid.width - 24, grid.height - 24), Image.Resampling.NEAREST)
        px = (grid.width - artwork.width) // 2
        py = (grid.height - artwork.height) // 2
        grid.alpha_composite(artwork, (px, py))
        sheet.paste(grid.convert("RGB"), (x + 12, 39))
    sheet.save(out / "character-contact-sheet.png", optimize=True)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "artwork_revision": revision,
        "artwork_approved": False,  # Dex still awaits owner approval.
        "knight_owner_approved": revision.startswith("knight-v2-approved"),
        "dex_owner_approved": False,
        "art_approval_note": "Image validity cannot establish visual identity. Owner review is required.",
        "asset_checks_passed": not problems,
        "issues": problems, "files": details,
    }
    (out / "characters.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print("Character preflight:", "PASS" if not problems else "FAIL",
          "| revision", revision, "| artistic approval remains separate")
    for problem in problems:
        print("FAIL:", problem, file=sys.stderr)
    return 0 if not problems else 1


if __name__ == "__main__":
    raise SystemExit(main())
