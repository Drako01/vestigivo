'use strict';
/** Release authorization is intentionally distinct from PR CI. No checks rerun on main. */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync, appendFileSync } = require('node:fs');
const REQUIRED_JOBS = Object.freeze([
  'TypeScript, core tests, scoped E2E and private VSIX',
  'Native OS validation (windows-latest)',
  'Native OS validation (macos-latest)'
]);
function versionParts(s) {
  assert(/^\d+\.\d+\.\d+$/.test(s), 'Exact stable semver required');
  return s.split('.').map(Number);
}
function newer(next, prev) {
  const a=versionParts(next), b=versionParts(prev);
  for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}
  return false;
}
function git(...args) { return execFileSync('git',args,{encoding:'utf8'}).trim(); }
async function api(path) {
  const result=await fetch('https://api.github.com/repos/Drako01/vestigivo/'+path,{
    headers:{'Authorization':'Bearer '+process.env.GH_TOKEN,'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28','User-Agent':'vestigivo-release-guard'},
    signal:AbortSignal.timeout(20000)
  });
  if(!result.ok)throw new Error('GitHub release verification HTTP '+result.status+': '+path);
  return result.json();
}
function output(publish,version='') {
  appendFileSync(process.env.GITHUB_OUTPUT,'publish='+String(publish)+'\n'+(publish?'version='+version+'\n':''));
}
async function authorize() {
  assert.equal(process.env.GITHUB_EVENT_NAME,'push','Only a reviewed main push can initiate a new release');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main','Release must run on main');
  assert.equal(process.env.GITHUB_REPOSITORY,'Drako01/vestigivo','Unexpected repository');
  assert.equal(git('rev-parse','HEAD'),process.env.GITHUB_SHA,'Checked-out SHA differs from trigger');
  assert(process.env.GH_TOKEN,'GitHub read token required');
  const pkg=JSON.parse(readFileSync('package.json','utf8'));
  assert.equal(pkg.publisher,'armotusitio');
  assert.equal(pkg.name,'vestigivo');
  const previous=JSON.parse(git('show','HEAD^:package.json'));
  if(previous.version===pkg.version){output(false);console.log('Version unchanged: no publication.');return;}
  assert(newer(pkg.version,previous.version),'Version must strictly increase');
  assert(readFileSync('CHANGELOG.md','utf8').includes('## ['+pkg.version+']'),'Missing changelog for released version');
  assert(pkg.version!=='0.1.0','Initial 0.1.0 publication is explicitly manual');
  const pulls=await api('commits/'+process.env.GITHUB_SHA+'/pulls');
  const merged=pulls.filter(x=>x.merged_at && x.base?.ref==='main' &&
    x.merge_commit_sha===process.env.GITHUB_SHA && x.head?.sha);
  assert.equal(merged.length,1,'Expected exactly one squash-merged PR matching main commit');
  const head=merged[0].head.sha;
  const original=await api('git/commits/'+head);
  assert.equal(original.tree.sha,git('rev-parse','HEAD^{tree}'),
    'Merged tree differs from exact green PR HEAD');
  const runData=await api('actions/runs?head_sha='+head+'&event=pull_request&per_page=100');
  const runs=(runData.workflow_runs||[]).filter(x=>x.head_sha===head &&
    x.name==='Vestigivo RCA PR Verification' && x.path==='.github/workflows/ci.yml')
    .sort((a,b)=>b.id-a.id);
  assert(runs.length,'Missing PR CI for exact HEAD');
  assert.equal(runs[0].conclusion,'success','Latest exact HEAD PR CI is not green');
  const jobData=await api('actions/runs/'+runs[0].id+'/jobs?per_page=100');
  assert((jobData.total_count||0)<=100,'Unexpected CI pagination');
  for(const name of REQUIRED_JOBS){
    const found=(jobData.jobs||[]).filter(j=>j.name===name);
    assert.equal(found.length,1,'Missing or duplicated CI job: '+name);
    assert.equal(found[0].conclusion,'success','CI job is not green: '+name);
    if(name.includes('macos')){
      const native=found[0].steps?.find(s=>s.name==='Attempt native VS Code Extension Host smoke');
      assert.equal(native?.conclusion,'success','macOS Host smoke was not actually successful, even if its matrix job appears green');
    }
  }
  console.log('Approved PR #'+merged[0].number+' exact tree and CI #'+runs[0].id+' validated for '+pkg.version);
  output(true,pkg.version);
}
if(require.main===module)authorize().catch(e=>{console.error('RELEASE BLOCKED:',e.message);process.exitCode=1;});
module.exports={versionParts,newer,REQUIRED_JOBS};
