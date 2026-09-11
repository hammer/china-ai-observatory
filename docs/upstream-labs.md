# Shared foundation with hammer/labs

Reference revision: [`f8db869`](https://github.com/hammer/labs/commit/f8db86949b5274bd6cebee14ae7a510389adf86a), inspected on 2026-09-11. `upstream-labs.json` records source and local hashes for explicit shared-code review.

| Layer | Shared convention or implementation |
| --- | --- |
| Framework | Astro, TypeScript and npm; current security fixes applied to the initial labs dependency baseline |
| Data | Per-entity YAML, stable slugs, centralized Zod schemas and typed loader |
| Releases | `data/outputs/{vendor}` follows `data/outputs/{lab}` |
| Filters | Reused FilterBar.astro and all five filter modules: types, state, runtime, format, position |
| Style | Reused global.css tokens and base rules; same 1080px layout and 600px phone breakpoint |
| Interaction | Native DOM scripts, data attributes, URL filters, responsive sheets and keyboard support |
| History | `/whats-new/` from committed data changes; full-history checkout and post-commit build |
| Skills | Repository `.agents/skills`, research workflow, validation gates, responsive smoke tests |
| Hosting | Cloudflare Pages through Wrangler, using the project owner's account |

Five shared files are unchanged. FilterBar.astro additionally escapes `<` when embedding JSON configuration, so future data cannot prematurely terminate its script element. The runtime also restores control state on browser history navigation and declares its existing cycleTristate method in the return type. `src/styles/observatory.css` contains product-specific additions; no React, Shadcn or Tailwind runtime is retained.

The application uses static Astro output. Labs was on Astro 5.18 when inspected; this project uses Astro 7.3 with security fixes while preserving the shared components and data conventions. The unused Cloudflare SSR adapter is omitted because these public research pages need no account APIs or D1 bindings. Wrangler still deploys the static output to Cloudflare Pages. No user database, authentication endpoints, database ID, account ID, or secret was copied.

Canonical news records can link multiple companies, avoiding duplicated cross-company events. Sources have a shared register. Accelerator releases follow per-vendor typed outputs, while multi-vendor benchmark studies retain an explicitly caveated comparison register. This preserves the original source distinctions instead of forcing specifications and workload measurements into a single metric.

The reference repo's checked-in deploy workflow currently targets GitHub Pages despite its Cloudflare production convention. This project deliberately supplies a working Cloudflare Pages workflow. It requires owner-account credentials and has no alternate hosting fallback.

## Refreshing shared code

Choose and record a newer hammer/labs commit; inspect upstream diffs for the seven paths in the manifest. Apply appropriate changes without overwriting Observatory data. Retain the inline JSON escape, run unit/filter/mobile checks, inspect phone and desktop screenshots, and update both hashes and this revision note. Do not silently track upstream main or modify hammer/labs while maintaining this site.
