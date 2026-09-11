export const projectName='china-ai-observatory';
export function requireOwnerCredentials(env: Record<string,string|undefined>) {
  const accountId=env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token=env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) throw new Error('Set CLOUDFLARE_ACCOUNT_ID to the repository owner’s verified Cloudflare account ID. No default account is configured.');
  if (!token) throw new Error('Set CLOUDFLARE_API_TOKEN securely, scoped to Cloudflare Pages in that account.');
  return {accountId,token};
}
