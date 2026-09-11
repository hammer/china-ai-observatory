# Deploy to the owner's Cloudflare account

The production target is Cloudflare Pages project `china-ai-observatory` in the repository owner's account. An email address identifies the account holder but is not a Cloudflare account ID. No account ID, token, D1 database, OpenAI Site, or hosting resource from `hammer/labs` is copied.

## GitHub Actions setup

1. Sign in to the intended Cloudflare account and copy its account ID from the dashboard. If the account selector shows several accounts, choose the one you want to own this site.
2. Create a token with **Account → Cloudflare Pages → Edit**, scoped to that account.
3. In `hammer/china-ai-observatory` → Settings → Secrets and variables → Actions, set variable `CLOUDFLARE_ACCOUNT_ID` and secret `CLOUDFLARE_API_TOKEN`. The workflow also accepts an account ID stored as a secret. Never paste a token into a chat, issue, source file, or commit.
4. Run the deployment workflow from the Actions tab. It creates the named Pages project if absent, after validating account access, then deploys `dist` from the committed revision. Later pushes to `main` repeat validation and publication. Pull requests only validate and build.
5. Verify the successful Cloudflare deployment and its returned URL. Check `/build.json` against the GitHub commit before calling the migration live. Add a custom domain through Pages settings if desired; domain purchase is not required.

This is Cloudflare's [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) approach. Source is public because the chosen GitHub repository is public; the resulting Pages endpoint is public unless the owner configures access restrictions.

## Local deployment

Provision the same two environment variables through your local secret manager, then:

```sh
npm ci
npm run validate
npm test
git add <reviewed-files>
git commit -m "Describe the evidence or application change"
npm run build
npm run deploy
```

Commit before the final build: `/whats-new/` reads Git history, and the deploy script requires `/build.json` to match HEAD and a clean working tree. It refuses absent credentials and never selects a default account. A failed deployment leaves the previously published site intact. Do not mark a research run as successfully published just because its commit exists.

## Separate systems

The Codex schedules research, commits verified data, and checks Actions results. GitHub Actions builds and deploys using repository secrets. It does not perform web research or call a model. The old ChatGPT-hosted preview is a historical artifact and is not a deployment target of this repository or the updated skills.

Cloudflare connection and successful deployment are external setup state, deliberately not hard-coded as “active” in the website's research data.
