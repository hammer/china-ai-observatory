# China AI Observatory

A sourced record of China's AI hardware industry: companies, supply-chain dependencies, accelerator evidence, news, and weekly, monthly, and quarterly briefings.

This project follows [hammer/labs](https://github.com/hammer/labs): **Astro, TypeScript, Zod, YAML, native DOM scripts, npm, repository skills, and Cloudflare Pages**. It reuses the Lab Index filter framework and design tokens. See [the shared-code manifest](docs/upstream-labs.md) for the exact upstream revision and deliberate differences.

## Development

Use Node 22.13+ and npm.

```sh
npm ci
npm run dev
npm run validate
npm test
npm run build
```

With the dev server running, `npm run test:filter` and `npm run test:mobile` check actual desktop and phone behavior using Playwright. Install Chromium with `npx playwright install chromium` if needed.

## Data and maintenance

- `data/companies/*.yaml`: profiles, dated facts, watch items, layer membership.
- `data/news/*.yaml`: canonical events linked to companies and sources.
- `data/outputs/{vendor}/*.yaml`: typed accelerator records with numeric specifications and provenance.
- `data/sources/*.yaml`: the source register, including authorship category and review dates.
- `data/briefings/{cadence}/*.yaml`: immutable historical summaries and separately identified corrections.
- `src/schema.ts` and `src/data/loader.ts`: the validated data contract and referential-integrity checks.
- `.agents/skills/`: portable research and briefing skills, also installed as personal Codex skills.

Read [AGENTS.md](AGENTS.md) and [the content workflow](docs/content-workflow.md) before editing. This is an evidence register: peak specifications, vendor benchmarks, standardized submissions, and independent runs have separate meanings. Unknown performance comparisons remain unknown.

```sh
npm run briefing -- --cadence weekly --as-of 2026-09-14
```

The helper selects the last fully closed calendar period; it does not generate unsupported prose or publish a report.

## Deployment

The target is **Cloudflare Pages in the repository owner's Cloudflare account**. No OpenAI-hosted Site is used by this code or its deployment workflow. Account access and a successful deployment must be verified separately; the presence of this configuration does not mean the site is live.

See [deployment setup](docs/deployment.md). The workflow uses the repository variable `CLOUDFLARE_ACCOUNT_ID` and secret `CLOUDFLARE_API_TOKEN`, scoped to the owner's Pages account. It validates, tests, builds from committed source, then deploys to the `china-ai-observatory` Pages project. Missing credentials leave deployment pending; there is no fallback account. Do not commit credentials.

The research baseline was reviewed on 2026-09-11. Per-record dates indicate actual review coverage. Scheduled research runs and GitHub-to-Cloudflare publication are separate systems: a successful source update is not proof of a successful deployment.
