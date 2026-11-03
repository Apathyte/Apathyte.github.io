# Release checkpoint: 3 November 2026

This repository is a static personal site. The last tested layout before the next character-art sprint is preserved on the branch:

- `snapshots/site-v1-approved-shell-20261103`
- Commit `535157d0f09b565e4e66c4759f8fb22148c807a4`
- GitHub Pages and Website Visual QA both passed at that commit.

## Rollback

Prefer a non-destructive Git revert on `main` to undo any later changes, followed by the normal Pages deployment. If restoring an entire historical state, compare the snapshot branch and `main`, then commit the desired earlier file contents onto `main`. Keep the snapshot branch unchanged.

Avoid force-pushing main; preserve the commit history as the audit trail.

## Release gates

A major layout or content revision is complete only when:

- GitHub Pages deployment succeeds.
- Website Visual QA passes (desktop, laptop, tablet and two mobile widths).
- Screenshots are reviewed for composition and typography; automated geometry checks are not visual approval.
- Identity attribution, original articles, independent interview, and canonical URL remain intact.
- Character image preflight passes without pretending the artwork has been approved.

## Character art

The currently published knight and Dex images are **temporary stand-ins**. The canonical illustrations are source references; approved website sprites do not exist yet. Their replacement is controlled by `characters.js` and must receive a separate visual gate.

Do not add private plans, customer records, or unpublished credentials to this repository.
