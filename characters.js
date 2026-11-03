/* V2 character art swap: edit this file, not the page layout.
   Knight V2 is owner-approved; Dex remains source-derived but awaiting a separate visual approval.
   Keep paths under assets/characters/ or point to existing site assets.
   Dimensions are in CSS pixels; they affect placement, not source-image resolution. */
window.SiteCharacters = Object.freeze({
  artworkRevision: "knight-v2-approved-dex-v1-provisional",
  knight: Object.freeze({
    idle: "/assets/characters/v2/knight-idle.png",
    label: "Owner-approved Purple Knight V2",
    width: 260,
    height: 292,
    offsetX: 0,
    offsetY: 0
  }),
  dex: Object.freeze({
    frames: Object.freeze([
      "/assets/dex/trot-0.png",
      "/assets/dex/trot-1.png",
      "/assets/dex/trot-2.png",
      "/assets/dex/trot-3.png"
    ]),
    frameMs: 270,
    label: "Source-derived Dex; presentation pass, canonical approval pending",
    width: 220,
    height: 153,
    offsetX: 0,
    offsetY: 0
  })
});
