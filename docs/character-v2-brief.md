# Character V2 — source fidelity gate

**Status:** Art direction / source audit. No replacement sprites approved and no V2 character artwork published.

The public homepage currently uses version `concept-standins-v1`. This branch is isolated from `main` and exists to develop replacements without changing the live characters.

## Original purple knight

Canonical style references already supplied by the site owner:

- `De Paarse Ridder en de Escalatie.png` — four-panel illustrated purple knight.
- `Ridder met gouden fleur-de-lis.png` — a related heraldic variation.

**Non-negotiable traits:** closed, faceless great helm with narrow eye slit and vertical ventilation slots; purple riveted plate with gold edging; deep burgundy cloak or scarf; compact armored silhouette; medieval illustrated linework. No exposed human face, generic fantasy warrior, new logo, or change to the site's professional identity.

**Emblem variation:** the four-panel story uses a gold lion medallion. The separate portrait uses fleur-de-lis. Do not silently blend these or call either the unique standard without owner approval. The currently published lion-emblem placeholder is not evidence of approved V2 art.

## Dex

The source character is a stocky charcoal-and-brindle Cane Corso / pit-bull mix with an older grey muzzle and mustard bandana, from:

- https://github.com/Apathyte/HatchPetOnDesktop
- Source baseline: commit `3c83de1da07b2a3ad11b0f147db23ef495639a58`
- Exact original source image: `assets/assets/dex-concept/trot_0.png`
- Additional canonical pose family: `assets/assets/dex-corso-base/`

The existing website frame files are **byte-identical copies** from Dex's public source project; the owner has nevertheless flagged the *onscreen presentation* as not yet acceptable. The solution must address fidelity at display size, ground contact, proportions, framing and movement—not substitute a random new dog.

No terrier proportions, tan/white recolouring, thin body, inappropriate hat or cape, or another dog's face. Preserve the recognisable muzzle, bandana and build.

## Implementation contract

1. Stage proposed transparent artwork under new versioned paths (`assets/characters/v2/`); never overwrite the current baseline assets.
2. Update only `characters.js` to choose replacement paths, frame timing and geometry. Code changes, if unavoidable, must be isolated.
3. Keep the current published version as the fallback and retain the snapshot branch `snapshots/site-v1-approved-shell-20261103`.
4. Run the existing Playwright and image asset preflight; review screenshots at 1440, 1024, 768, 390 and 320 px.
5. Passing PNG dimensions, transparency and geometry does **not** establish visual identity. Owner artwork review is a separate release gate.
6. Do not merge this branch to `main` or change the public character assets before that gate.

## Initial art acceptance

- Recognisable at actual desktop and mobile render sizes.
- Consistent identity across idle/walk frames.
- No clipped extremities, flickering accessories or feet floating above the scene floor.
- Respect reduced motion; no animation without a complete fallback.
- No additional network calls, tracking or font dependencies.
- Preserve the existing SEO, publication links, professional title and original quote rotation.

**Decision:** a concept that fails fidelity is rejected, even if the overall rendering is attractive.
