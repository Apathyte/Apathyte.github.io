# DemoKit · Open Factory Lab

[Open the lab](https://apathyte.github.io/demokit/) · [Contribute](CONTRIBUTING.md) · [Release review](docs/PUBLIC_RELEASE_REVIEW.md)

A public, independent teaching vehicle for factory models, operational meaning, pub/sub, evidence and design decisions. Thirteen fictional zones and five walkthroughs illustrate how people, data and machines interact. The diagrams and narratives are educational examples, not an implementation of the ISA-95 standard or an actual plant.

The lab includes a Three.js factory with a keyboard-accessible SVG fallback, an editable planning workboard, an acceptance register, a teaching room and a decision log. Local model checks test the workspace schema. Physics, OPC UA, recorded replay and hardware acceptance remain separate, unproven gates until public evidence is attached.

## Use and save

No account is required. Changes are saved only in this browser's local storage. Nothing is sent to a server. Export JSON to keep a portable copy; clearing browser data may remove local changes. Review exports before sharing. The published baseline changes through reviewed source commits, not through the browser editor. There is no live repository sync.

## Develop and release

Use Node.js 24 and npm. From this directory:

```sh
npm ci --ignore-scripts
npm test
npm run build
node scripts/release.mjs
npm run audit:release
```

The lockfile is committed. Vite compiles the client into `dist/`; the release script copies reviewed HTML/CSS/JavaScript to `index.html` and `assets/`. Those outputs are deliberately versioned because this website deploys its root directly with GitHub Pages. Dependencies, credentials, build staging, runtime state and workspace exports are ignored. Source maps are not published.

`src/lib/public-seed.json` holds the editable baseline. `src/lib/schema.ts` defines validation. `src/components/` contains procedural geometry only. There are no imported CAD, glTF, Blender or simulation assets. `docs/` records decisions, acceptance criteria and publication boundaries.

## Licence and attribution

The original code, synthetic data and documentation in **this `demokit/` directory only** are MIT-licensed. See [LICENSE](LICENSE). The rest of the website is outside this grant. Bundled dependencies retain their licences in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt). The lockfile also identifies development dependencies, which are not shipped as browser code.

This independent project is not an official ATS Global product or website. Names of standards and third-party tools identify concepts or candidates; no trademark rights or endorsement are granted. No other repository, employer or customer material is licensed by this release.
