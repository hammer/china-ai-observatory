import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { requireOwnerCredentials, projectName } from './deploy-config';
const {accountId,token}=requireOwnerCredentials(process.env);
const git=(args:string[])=>execFileSync('git',args,{encoding:'utf8'}).trim();
if (git(['status','--porcelain'])) throw new Error('Commit the source before deploying. The build must include the current data history.');
const head=git(['rev-parse','HEAD']);
const build=JSON.parse(readFileSync('dist/build.json','utf8'));
if (build.revision!==head) throw new Error('Build revision does not match HEAD. Run npm run build after committing.');
const endpoint=`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
const response=await fetch(`${endpoint}/${projectName}`,{headers});
if(response.status===404){
  const created=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({name:projectName,production_branch:'main'})});
  if(!created.ok) throw new Error(`Could not create the Pages project in the selected account (HTTP ${created.status}).`);
} else {
  if(!response.ok) throw new Error(`Could not verify the selected account's Pages project (HTTP ${response.status}).`);
  const project=(await response.json() as any).result;
  if(project.production_branch!=='main') throw new Error('Existing Pages project uses a different production branch. Review its configuration first.');
  const source=project.source?.config;
  if(source && (source.owner!=='hammer'||source.repo_name!=='china-ai-observatory')) throw new Error('Existing Pages project is connected to another repository.');
}
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','pages','deploy','dist','--project-name',projectName,'--branch','main','--commit-hash',head,'--commit-dirty=false'],{stdio:'inherit',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:accountId,CLOUDFLARE_API_TOKEN:token,WRANGLER_SEND_METRICS:'false'}});
