import {readdir, readFile, lstat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {isIP} from 'node:net';

// Never print matched material. Locations and categories are enough for triage.
const findings=[];
let files=0, objects=0;
const rules=[
  ['private-key', /-----BEGIN (?:[A-Z ]*PRIVATE KEY|OPENSSH PRIVATE KEY)-----/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g],
  ['service-token', /\b(?:sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{15,}|AKIA[0-9A-Z]{16})\b/g],
  ['wallet-address', /\b0x[0-9a-fA-F]{40}\b/g],
  ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{10,}\b/g],
  ['absolute-host-path', /(?:\/(?:home|root|workspace|Users)\/[A-Za-z0-9_.-]+|[A-Z]:\\Users\\[^\s"']+)/g],
  ['private-link', /https?:\/\/(?:claude\.ai|chatgpt\.com|github\.com)\/[^\s"'<>]+/g],
  ['signed-url', /[?&](?:X-Amz-Signature|sig|signature|access_token)=[A-Za-z0-9%+/_=-]{12,}/gi],
  ['credential-assignment', /(?:api[_-]?key|secret|access[_-]?token|password)\s*[=:]\s*["'][A-Za-z0-9+/_=-]{12,}["']/gi],
  ['ipv4', /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g],
  ['email', /\b[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
  ['url', /https?:\/\/[^\s"'<>`\)]+/g],
  ['hostname', /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|net|org|io|site|ru|xyz|dev|app|local|internal|ai)\b/gi]
];
function scan(location,bytes) {
  const text=bytes.toString('utf8');
  for(const [category,pattern]of rules) {
    pattern.lastIndex=0;
    for(const m of text.matchAll(pattern)) {
      const v=m[0];
      if(category==='ipv4'&&v==='127.0.0.1')continue;
      if(category==='email'&&v.endsWith('@example.invalid'))continue;
      if(category==='hostname'&&v==='www.w3.org')continue;
      if(category==='hostname'&&/^README\.(?:ru|fr|it|de|uk)$/i.test(v))continue;
      if(category==='url'&&(/^https?:\/\/localhost(?::[^/]+)?(?:\/|$)/.test(v)||/^http:\/\/www\.w3\.org\/2000\/svg$/.test(v)))continue;
      const line=text.slice(0,m.index).split('\n').length;
      findings.push({category,location,line});
    }
  }
  for(const m of text.matchAll(/[a-fA-F0-9:]{3,}/g)) {
    if(isIP(m[0])===6&&m[0]!=='::1')findings.push({category:'ipv6',location,line:text.slice(0,m.index).split('\n').length});
  }
  // Broad entropy heuristic: keys without a known provider prefix.
  for(const m of text.matchAll(/(?<![\w])(?:[A-Za-z0-9+/_=-]{40,})(?![\w])/g)) {
    const v=m[0];
    if(/^[a-f\d]{40}$|^[a-f\d]{64}$|^\d+$/.test(v))continue;
    const counts={}; for(const c of v)counts[c]=(counts[c]||0)+1;
    const entropy=Object.values(counts).reduce((sum,n)=>sum-(n/v.length)*Math.log2(n/v.length),0);
    if(entropy>4.6)findings.push({category:'high-entropy-review',location,line:text.slice(0,m.index).split('\n').length});
  }
}
async function walk(dir) {
  for(const name of await readdir(dir)) {
    const full=path.join(dir,name), relative=path.relative('.',full);
    if(relative==='node_modules'||relative.startsWith(`.git${path.sep}objects`))continue;
    const stat=await lstat(full);
    if(stat.isSymbolicLink()){findings.push({category:'symlink',location:relative});continue;}
    if(stat.isDirectory()){await walk(full);continue;}
    if(!stat.isFile()){findings.push({category:'nonregular-file',location:relative});continue;}
    files++;
    if(!relative.startsWith('.git')&&/(?:\.map$|\.sqlite\w*$|\.db$|\.log$|\.env(?:\.|$)|\.(?:png|jpg|jpeg|mp4|zip|gz|pdf)$)/i.test(name))findings.push({category:'forbidden-artifact',location:relative});
    scan(relative,await readFile(full));
  }
}
await walk('.');
try {
  const list=execFileSync('git',['cat-file','--batch-all-objects','--batch-check=%(objectname) %(objecttype)'],{encoding:'utf8'}).trim();
  for(const row of list.split('\n').filter(Boolean)) {
    const [oid,type]=row.split(' ');
    scan(`git:${oid}:${type}`,execFileSync('git',['cat-file',type,oid]));
    objects++;
  }
} catch {findings.push({category:'git-scan-unavailable',location:'.git'});}
console.log(JSON.stringify({files,objects,findings,exitCode:findings.length?1:0},null,2));
process.exitCode=findings.length?1:0;
