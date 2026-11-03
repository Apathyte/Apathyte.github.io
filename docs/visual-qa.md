# Website visual QA

Runs automatically on main and pull requests; also available via **Actions → Website Visual QA → Run workflow**.

The workflow serves the checked-out static site locally and runs real Chromium Playwright tests at **1440, 1024, 768, 390 and 320 pixels**, capturing an above-the-fold screenshot and full-page screenshot at each width.

Assertions cover horizontal overflow, navigation anchors, unique IDs, hero typography, loaded character assets, the four overview cards, three public projects, canonical URL, Search Console verification, JavaScript errors, Dex click interaction, five-second quote rotation and reduced-motion support.

Each workflow run uploads the **visual-qa** artifact containing images, a contact sheet and results.json. If a check fails, the artifact is still uploaded.

The browser test has no access to personal accounts or credentials. External font loading is best effort; site assets and content are the hard assertions.

This protects layout and interaction, not artwork authenticity. The knight and Dex are currently placeholders; canonical art must be approved separately and replaced through characters.js.
