/* V2 character art swap: edit this file, not the page layout.
   Current frames are temporary layout stand-ins, not the approved canonical character art.
   Keep paths under assets/characters/ or point to existing site assets.
   Dimensions are in CSS pixels; they affect placement, not source-image resolution. */
window.SiteCharacters = Object.freeze({
  artworkRevision: "concept-standins-v1",
  knight: Object.freeze({
    idle: "/assets/knight/knight-idle.png",
    label: "Temporary purple knight illustration",
    width: 252,
    height: 325,
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
    label: "Temporary Dex animation",
    width: 195,
    height: 137,
    offsetX: 0,
    offsetY: 0
  })
});
