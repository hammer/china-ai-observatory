---
name: china-ai-briefings
description: Write and publish sourced weekly, monthly or quarterly China AI Observatory briefings through the Astro and YAML repository in hammer/china-ai-observatory. Use for scheduled market synthesis, dependency assessments, forecast reviews and historical briefing corrections.
---

# China AI Briefings

Turn the Observatory's dated evidence into an archived market synthesis. Read `references/target.md`, then current GitHub main's `AGENTS.md`, `docs/content-workflow.md`, and briefing schema in `src/schema.ts`. Reuse the existing GitHub project and its owner's Cloudflare Pages target. Respect a draft-only request or supplied cutoff.

## Select a fully closed period

1. Determine the requested cadence and actual date in Europe/London. If cadence is omitted, select completed periods that are due and missing; do not repeatedly regenerate published editions.
2. Run `npm run briefing -- --cadence weekly --as-of YYYY-MM-DD`, substituting cadence and date. The TypeScript helper uses the last fully closed Monday–Sunday week, calendar month or quarter. It selects in-period events, checks for completed reports and flags coverage before the baseline. Never use an approximate 7/30/90-day subtraction.
3. If already published, report that fact. Corrections require a separately named edition and `correction_of`, with an explanation. Retain originals and initial period-to-date snapshots.

## Research and synthesize

Read selected events and their actual sources. Use `$china-ai-update` for supplemental research and gaps. Evidence used to characterize what was known during the period must have been public by its end. Later corrections can appear only as clearly labeled post-period context. An empty internal archive means insufficient recorded evidence, not necessarily an uneventful industry.

Write a concise thesis supported by consequential developments, company and stack impact, benchmark/manufacturing evidence, forecast implications, and next milestones. Weekly reports emphasize events; monthly reports assess adoption and production trends; quarterly reports revisit sovereignty and dependencies. Include capital and concentration when they change industrial capacity. Do not mechanically concatenate headlines.

Cite factual sections with source IDs. Keep forecasts and confidence separate from observed facts. Vendor results remain attributed; standardized submitter-run results are not automatically independent. Align model, quality, precision, device count, software, batching, context and latency before asserting a speedup. Track training time-to-quality/reliability separately from inference throughput. Distinguish prototypes, accepted equipment and qualified production volume. If production metrics or matched comparisons are unavailable, retain that uncertainty.

Do not manufacture growth figures, retrospective coverage, sources, or catch-up certainty. Preserve historical forecasts and what was known at the time.

## Append, validate, commit

Write `data/briefings/{cadence}/{slug}.yaml` with the helper's `-complete` slug, actual publication date, `status: complete`, and `through_date: period_end`. Include only covered-period events in `news_ids`. Older background may be source-linked in prose. Set `coverage_note` to the actual scope; resolve or disclose baseline gaps. Corrections get distinct slugs rather than replacing the original.

Record actual research/run coverage in `data/research-state.yaml`. Run `npm run validate && npm test && npm run build`, then inspect numbers, dates, citations and wording. Commit to the latest `hammer/china-ai-observatory` main through GitHub; preserve concurrent work, reconcile and revalidate without force-pushing. The user's standing authorization covers these recurring summaries and source updates. Draft-only requests stop before push or publication.

GitHub Actions publishes to the owner's Cloudflare Pages account using repository credentials. It builds after the commit so `/whats-new/` contains the change. Check Actions and deployment results separately from source synchronization. If Cloudflare is unconfigured, finish the authorized GitHub commit and report deployment pending; never fall back to an OpenAI-hosted Site or another account. Direct deployment must follow `docs/deployment.md`, verify the owner account, use the exact committed build, and await success. Do not change unrelated resources, spend money, expose credentials, or message people.

Return covered dates, key findings, changed forecasts, the GitHub commit, and verified publication status. Link the new briefing only if its deployment URL is known and confirmed. Never call an open week/month/quarter complete.
