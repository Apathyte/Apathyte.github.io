# Contributing to the public lab

Open an issue or pull request in this website repository, scoped to `demokit/`. Describe the operational question, behaviour, evidence, limitations and next action. Keep decisions useful when an experiment is inconclusive.

Use synthetic examples. Do not submit customer names, real plant layouts, recipes, production captures, internal architectures, private branch histories, credentials, endpoints, personnel data or copied vendor assets. Identify where each contribution came from and confirm your right to publish it under this directory's MIT licence. If ownership is unclear, leave it out until permission is established. Third-party additions require their exact version, licence and attribution. Do not copy standards text or figures.

Browser edits are local drafts. Exporting does not publish them. Review every field before placing exported JSON in a PR. Only reviewed source changes update the shared baseline.

Run the README commands, review source and generated files, and update the decision log when boundaries change. Attach the tested revision, environment, command, result and limitation. A screenshot proves appearance, not physical behaviour.

The automated audit enforces an allowlist and checks common credential patterns. It does not decide intellectual-property ownership or replace human review. `.gitignore` does not protect a secret already committed. If a credential is exposed, revoke it; do not repost it in a public issue.

## Learning scenarios and changes

Read `docs/PROJECT_PLAN.md` before choosing work. Keep the approved IDs and gates
traceable; record changes of approach and remaining verification in that plan.
`docs/DESIGN.md` explains the visual direction; `docs/SLICE_CONTRACT.md` defines the
bounded mapping preview. Lessons are authored in `src/lib/lessons.json`.

Every lesson needs provenance, assumptions, a six-stage narrative, named decision
owners, response consequences, residual risks and evidence questions. Synthetic
composites must remove identifying layouts, values, recipes, unusual sequences
and customer-specific combinations, not only names. Do not copy field notes into
the catalogue. Each response must be teachable without claiming predicted plant
performance. A future customer-specific workspace belongs in a separate approved
private environment and is outside this public contribution flow.
