# Character artwork slots

The illustrated hero has two **temporary stand-ins**. Neither should be treated as the final approved character design.

The source of truth for the browser is [`/characters.js`](../characters.js). It defines the knight's image, Dex's animation frames, frame speed, and display dimensions. The layout and movement code should not require changes when approved sprite art arrives.

## To replace the character art

1. Add the approved transparent files under `assets/knight/` and `assets/dex/` (or another stable public assets directory).
2. Update the `knight.idle` and `dex.frames` paths in `characters.js`.
3. Adjust the configured `width`, `height`, `offsetX` and `offsetY` values for the new artwork's dimensions and visual anchors.
4. Check desktop and narrow mobile breakpoints, background contrast, sprite clipping, and the no-motion state.
5. Keep an attribution record and use only artwork the site owner approves for public publication.

Dex's current four walk frames were copied from the public [Dex Desktop Pet repository](https://github.com/Apathyte/HatchPetOnDesktop). They are separate from the final website illustration decision. The existing interim knight pixel sprite is also **not** the earlier purple/gold storybook knight approved for the comic.

Do not silently overwrite the existing originals. Prefer adding a new versioned asset directory and switching the manifest after visual review.
