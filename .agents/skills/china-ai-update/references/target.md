# Observatory source and deployment

- Canonical repository: https://github.com/hammer/china-ai-observatory
- Branch: `main`.
- Reference architecture: https://github.com/hammer/labs; exact shared revision is recorded in `docs/upstream-labs.md`.
- Local checkout used during migration: `/workspace/projects/china-ai-observatory`. Retrieve GitHub source if that transient path is absent.
- Website: Astro static output, TypeScript/Zod, per-record YAML, npm, native filters and Git-derived changes.
- Deployment target: Cloudflare Pages project `china-ai-observatory`, solely in the repository owner's explicitly verified account.
- Account ID and Pages API token come from secure environment or GitHub settings. No default account, copied D1 resource, or OpenAI Site is authorized.
- Publication timezone: Europe/London. Preserve existing research and weekly/monthly/quarterly schedules.
- Read `AGENTS.md`, `docs/content-workflow.md`, and `docs/deployment.md` from the current source before work.

The old ChatGPT-hosted Site is historical. GitHub is now the source of truth, not a pending mirror. Source synchronization, research completeness and Cloudflare publication are separate results. If deployment access is missing, commit authorized research and report publication pending. Do not invent account IDs, live URLs, deployment status or successful checks.

An isolated fixture or draft request stays in that scope and does not authorize production writes.
