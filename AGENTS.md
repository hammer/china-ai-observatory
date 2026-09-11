# China AI Observatory

This repository follows `hammer/labs`: Astro, TypeScript, Zod, per-record YAML, native DOM scripts, npm, small repository skills, and Cloudflare Pages. Read `docs/upstream-labs.md`, `docs/content-workflow.md`, and the applicable `.agents/skills/` instructions before changing code or research.

## Source and evidence

- `data/` is canonical. `src/schema.ts` defines strict shapes and `src/data/loader.ts` validates references and dates. Do not silently add fields outside the contract.
- Facts have evidence categories, review dates and source IDs. Preserve unknowns, vendor attribution, historical snapshots and correction trails.
- Do not overwrite contemporaneous forecasts with hindsight. Never equate a prototype with qualified volume production or peak FLOPS with measured AI performance.
- Keep automated research and deployment status separate. A fresh build does not mean fresh research; a commit does not prove publication.

## UI conventions shared with Lab Index

- Native Astro markup and small TypeScript scripts. Reuse `FilterBar.astro` and `src/lib/filters/`; do not add a second filter framework or React runtime.
- Use data attributes for sortable/filterable rows and URL state for shareable filters. Support initialization ordering and browser history.
- Phone breakpoint: 600px. At 880px trim low-priority table columns. Touch inputs are at least 16px; do not autofocus on phones. Keyboard-only hints use `.kbd-only`.
- Do not wrap sticky-header tables in overflow containers. Wide benchmark tables use explicitly labeled scroll regions and non-sticky headers.
- Measure rendered layouts at 375×720 and 1280×800; inspect screenshots. For substantial layout changes, get an adversarial review with actual measurements. UI checks must be structural and discover example profiles from current data.

## Verification and publishing

`npm run validate && npm test && npm run build` must pass. With the dev server running, use `npm run test:filter` and `npm run test:mobile`; `npm run test:ui` runs both against a temporary static server. `npm run test:changelog` checks rendering inputs against real Git history. Do not add tests that merely mirror implementation.

`/whats-new/` reads actual Git history, so build again after committing before publishing. GitHub Actions checks out full history. Keep the working tree clean and verify the deployed `/build.json` revision.

The source of truth is `https://github.com/hammer/china-ai-observatory`, branch `main`. The deployment target is Cloudflare Pages project `china-ai-observatory` in the repository owner's explicitly selected account. Read `docs/deployment.md`. Never use OpenAI-managed Sites or copy another project's account ID, D1 database, or secrets. Missing Cloudflare access means deployment pending; it is not permission to select another host.

The user authorized this project, GitHub commits, deployment to their own account, and recurring research/briefings. Complete work within that standing scope without repeated confirmation. A later draft-only or restricted request overrides it. Do not spend money, buy domains, expand access, change unrelated repositories, send messages to people, force-push, or claim success without evidence.
