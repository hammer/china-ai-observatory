# Recurring maintenance

The existing Codex tasks use the installed `china-ai-update` and `china-ai-briefings` skills, whose portable copies live in `.agents/skills/`. They retrieve current GitHub main, edit canonical YAML, validate the records, and commit verified updates. These are externally scheduled Codex tasks; cloning this repository does not automatically create a scheduler or model credentials.

| Task | Existing schedule, Europe/London | Scope |
| --- | --- | --- |
| Research sweep | Around 08:00 daily | Priority companies, oldest-reviewed profiles, news and benchmarks |
| Weekly briefing | Around 11:00 Monday | Previous fully closed Monday–Sunday week |
| Monthly briefing | Around 14:00 on the first | Previous calendar month |
| Quarterly briefing | Around 17:00 on Jan/Apr/Jul/Oct 1 | Previous calendar quarter |

The source destination is `hammer/china-ai-observatory`, not the historical ChatGPT-hosted preview. Research tasks need the GitHub integration and web research tools. Cloudflare credentials stay in GitHub's secure settings; the research agent does not need the token. The deploy workflow publishes verified commits when those credentials are configured and reports pending setup otherwise.

Read `data/research-state.yaml` for actual review scope and run outcomes; do not infer freshness from the task schedule alone. Preserve concurrent source changes and immutable reports. A failed or partial run must retain that status rather than advancing success dates. Missing publication access does not prevent an authorized research commit.
