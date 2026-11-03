# Character art and version contract

## Current live intention
- **Knight:** V2 approved by the site owner on 3 November 2026. Web sprite: `assets/characters/v2/knight-idle.png` (240×263 PNG, exact SHA-256 `047736da82281cf6ecc0bada52a4b8939bf91897f286198c21e85f36cb1fd209`).
- **Canonical source:** `assets/characters/v2/knight-master.png` (1179×1290 RGBA PNG; exact SHA-256 `6a1a70915f94f565014209531c327f2c21f3efdbb8c8bcba46177692a869c65c`). Both were copied byte-for-byte from the approved review package.
- **Dex:** original source-derived assets from `Apathyte/HatchPetOnDesktop` remain in place. Website presentation/scale is still subject to a separate art-direction gate. Do not substitute a new dog.

`characters.js` is the sole configuration for asset paths, frame timing and geometry. New art must be staged in a versioned folder, compared via Playwright screenshots at desktop and mobile widths, and explicitly approved for character fidelity. Asset checks cannot grant artistic approval.

## Rollback
The pre-V2 live release is available on `snapshots/site-v1-approved-shell-20261103` (commit `535157d0f09b565e4e66c4759f8fb22148c807a4`). Preserve that branch; restore by ordinary revert/commit rather than force-pushing.
