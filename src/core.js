export const METRICS=['impressions','reactions','comments','members_reached','reposts','saves','sends'];
export const EXTRA_METRICS=['articles_read','email_sends','email_open_pct','profile_viewers','followers_gained'];
export const METRIC_LABELS={articles_read:'Article views',email_sends:'Email sends',email_open_pct:'Email open %',profile_viewers:'Profile viewers from this post',followers_gained:'Followers gained from this post'};
export const HOOKS=['Uncategorized','Question','Data/Stat','How-To/Promise','Problem/Mistake','Story','Contrarian','Curiosity/Open Loop'];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function shift(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function range(preset,now=today()){let start=shift(now,-27),end=now;if(['7','28','90'].includes(preset))start=shift(now,1-Number(preset));if(preset==='month')start=now.slice(0,7)+'-01';if(preset==='lastmonth'){end=shift(now.slice(0,7)+'-01',-1);start=end.slice(0,7)+'-01';}if(preset==='year')start=now.slice(0,4)+'-01-01';if(preset==='all')start='2000-01-01';return {start,end};}
export function canonical(value){if(!value?.trim())return '';const u=new URL(value);if(u.protocol!=='https:'||!['linkedin.com','www.linkedin.com','lnkd.in'].includes(u.hostname))throw Error('Use an HTTPS LinkedIn or lnkd.in post link.');['utm_source','utm_medium','utm_campaign','rcm','trk'].forEach(k=>u.searchParams.delete(k));u.hostname=u.hostname.replace(/^www\./,'');u.hash='';return u.toString();}
export function number(value){const s=String(value??'').trim();if(!s)return null;if(!/^\d[\d,]*(?:\.\d+)?\s*[kKmM]?$/.test(s))throw Error('Use a count, such as 1234 or 1.2K.');const n=Number(s.replace(/[,kKmM\s]/g,''))*(/k$/i.test(s)?1000:/m$/i.test(s)?1e6:1);if(!Number.isSafeInteger(n)||n<0)throw Error('Counts must be positive whole numbers or zero.');return n;}
const hookRules=[
  ['Question','question',/^(?:why|what|how(?! to)|when|who|where|can|could|would|do|does|is|are)\b.*\?/,4,'The opening asks a direct question.'],
  ['Data/Stat','stat',/\b\d+(?:\.\d+)?\s*(?:%|percent|out of|people|companies|teams|users)\b|\d+(?:\.\d+)?%/,4,'The opening leads with a number or statistic.'],
  ['How-To/Promise','how-to',/^(?:how to|here.s how|a guide to|learn how|\d+ ways to)\b/,4,'The opening promises a method or practical guide.'],
  ['Problem/Mistake','mistake',/\b(?:biggest mistake|stop doing|struggling with|kept failing|kept showing up|went wrong|mistakes? you)\b/,4,'The opening identifies a problem or mistake.'],
  ['Problem/Mistake','broken-result',/\b(?:found|discovered)\b.{0,35}\b(?:wrong|broken|mistakes?|issues?)\b/,4,'The opening reveals something that went wrong.'],
  ['Problem/Mistake','outcome-gap',/^[^.!?]{0,120}\b(?:kept|keeps)\b[^.!?]{1,100}[.!?]\s*(?:but\s+)?(?:i|we)\s+(?:wanted|needed)\s+(?:it|them)\s+to\b/,4,'The repeated result is contrasted with the outcome you wanted.'],
  ['Problem/Mistake','expectation-gap',/\b(?:i|we)\s+(?:wanted|needed|expected)\b.{1,90}\b(?:but|instead|yet)\b.{1,70}\b(?:got|gave|kept|found|was|were|didn.t|couldn.t)\b/,4,'The opening contrasts an intended outcome with what happened.'],
  ['Story','story',/^(?:(?:last|this) (?:week|month|year|morning)|yesterday|when i|i (?:built|started|tried|learned|spent))\b/,3,'The opening introduces a personal experience.'],
  ['Contrarian','human-handoff',/^an ai[^.!?]{8,100}[.!?]\s*a human\b/,4,'The opening contrasts an AI outcome with the human work behind it.'],
  ['Contrarian','contrast',/\b(?:unpopular opinion|everyone (?:says|thinks|believes).{0,100}\bbut|most people.{0,80}\bwrong|contrary to)\b/,5,'The opening challenges a commonly held view.'],
  ['Curiosity/Open Loop','curiosity',/\b(?:i (?:never|didn.t) (?:told|tell|expect)|then (?:everything|something) changed|what happened next|didn.t see.{0,20}coming)\b/,4,'The opening withholds an outcome or introduces a surprise.']
];
export function classify(text){
  // OCR line wrapping must not change the hook. Stop at the first paragraph or
  // two sentences so questions in the body/closing CTA do not become the hook.
  let opening=String(text||'').normalize('NFKC').trim().split(/\n\s*\n/)[0].replace(/\s+/g,' ').replace(/[‘’]/g,"'");
  const ends=[...opening.matchAll(/[.!?]["')\]]*(?=\s|$)/g)];
  if(ends[1])opening=opening.slice(0,ends[1].index+ends[1][0].length);
  opening=opening.slice(0,280).toLowerCase();
  const byCategory=new Map();
  for(const [category,rule,pattern,score,reason]of hookRules){
    if(pattern.test(opening)&&(!byCategory.has(category)||score>byCategory.get(category).score))byCategory.set(category,{category,rule,score,reason});
  }
  const hits=[...byCategory.values()].sort((a,b)=>b.score-a.score);
  // A generic personal-story frame can support a more specific rhetorical hook.
  const competing=hits.filter(h=>h.category!=='Story'||hits[0]?.category==='Story');
  const clear=hits[0]&&hits[0].score>=3&&(!competing[1]||hits[0].score-competing[1].score>1);
  return {category:clear?hits[0].category:'Uncategorized',suggestions:hits.slice(0,2),reason:clear?hits[0].reason:'',version:'2'};
}
export function hookFeedback(result,manual=false){
  let message=result.category!=='Uncategorized'?'Suggested: '+result.category+'. '+result.reason:result.suggestions.length?'Possible hooks: '+result.suggestions.map(s=>s.category).join(' / ')+'. Choose a category.':'No clear hook rule matched the opening. Choose a category.';
  if(manual)message+=' Your manual hook choice is kept.';
  return message;
}
export function topics(text){const t=String(text).normalize('NFKC').toLowerCase();return [['AI agents',/\bagent(?:s|ic)?\b/],['Automation',/automat|workflow/],['Building with AI',/buildingwithai|\bi built\b|\bclaude\b|\bchatgpt\b/],['Operations',/operations|productivity|process/],['Career & work',/career|\bjobs?\b|hiring/]].filter(x=>x[1].test(t)).map(x=>x[0]);}
const labels={impressions:'impressions?',reactions:'reactions?|likes?',comments:'comments?',members_reached:'members? reached|reach',reposts:'reposts?|reshares?',saves:'saves?',sends:'sends?'};
export function parse(text){const patch={},evidence={},conflicts=[];if(/\b(?:increase|increment|add)\b.{0,30}\bby\s+\d/i.test(text))throw Error('Enter absolute counts, for example “set impressions to 515”.');for(const [key,label] of Object.entries(labels)){if(new RegExp('(?:<\\s*\\d+|\\d+\\s*[-–]\\s*\\d+)\\s*(?:'+label+')','i').test(text))continue;const vals=[];const patterns=[new RegExp('(?:'+label+')\\s*(?:to|:|=)?\\s*([<]?\\d[\\d,.]*[ \t]*[kKmM]?(?![a-zA-Z]))(?![\\d])','ig'),new RegExp('([<]?\\d[\\d,.]*[ \t]*[kKmM]?(?![a-zA-Z]))\\s*(?:'+label+')\\b','ig')];for(const re of patterns)for(const m of text.matchAll(re)){try{if(m[1].includes('<')||/\d\s*[-–]\s*\d/.test(m[0]))continue;vals.push(number(m[1].trim()));evidence[key]=m[0];}catch{}}const unique=[...new Set(vals)];if(unique.length===1)patch[key]=unique[0];if(unique.length>1)conflicts.push(key);if(new RegExp('clear\\s+(?:'+label+')','i').test(text))patch[key]=null;}
 const link=text.match(/https:\/\/[^\s<>]+/);if(link)patch.original_url=canonical(link[0]);const hook=text.match(/(?:set|change)\s+hook\s+(?:to\s+)?(.+)/i);if(hook){const h=HOOKS.find(h=>h.toLowerCase()===hook[1].trim().toLowerCase());if(!h)throw Error('Choose one of the listed hook categories.');patch.hook_category=h;patch.hook_source='manual';}const date=text.match(/(?:post date|published)\s*(?:to|:)?\s*(\d{4}-\d{2}-\d{2}|\d{1,2} [a-z]+ \d{4}|yesterday|today)/i);if(date){let d=date[1].toLowerCase();d=d==='today'?today():d==='yesterday'?shift(today(),-1):/^\d{4}-/.test(d)?d:new Date(d+' 12:00:00 GMT').toISOString().slice(0,10);patch.published_date_local=d;}return {patch,evidence,conflicts};}
export function median(values){const a=values.filter(v=>v!==null&&v!==undefined).sort((a,b)=>a-b);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2:null;}
export function select(posts,measurements,dates,basis='primary'){return posts.filter(p=>!p.archived_at&&p.published_date_local>=dates.start&&p.published_date_local<=dates.end).map(p=>{const ms=measurements.filter(m=>m.post_id===p.post_id&&!m.archived_at);let m=ms.find(m=>m.measurement_id===p.primary_measurement_id);if(basis==='latest')m=ms.slice().sort((a,b)=>(b.captured_at_utc||b.logged_at_utc).localeCompare(a.captured_at_utc||a.logged_at_utc))[0];if(basis==='24h')m=ms.filter(m=>p.published_at_utc&&m.captured_at_utc&&m.capture_time_quality!=='legacy_unknown').map(m=>({m,age:(Date.parse(m.captured_at_utc)-Date.parse(p.published_at_utc))/36e5})).filter(x=>x.age>=20&&x.age<=30).sort((a,b)=>Math.abs(a.age-24)-Math.abs(b.age-24))[0]?.m;return {...p,m};});}
export function summary(rows){const measured=rows.filter(p=>p.m?.impressions!=null);const rateRows=rows.filter(p=>p.m&&p.m.impressions>0&&!p.m.legacy_zero_ambiguity&&['reactions','comments','reposts'].every(k=>p.m[k]!=null));const den=rateRows.reduce((s,p)=>s+p.m.impressions,0);return {posts:rows.length,measured:measured.length,impressions:measured.reduce((s,p)=>s+p.m.impressions,0),median:median(measured.map(p=>p.m.impressions)),rate:den?100*rateRows.reduce((s,p)=>s+p.m.reactions+p.m.comments+p.m.reposts,0)/den:null,rateCount:rateRows.length};}
export function groups(rows,key,metric='impressions'){const out={};for(const p of rows){const tags=key==='topic_tags'?p.topic_tags||[]:[p[key]||'Uncategorized'];for(const t of tags){out[t]??=[];if(p.m?.[metric]!=null)out[t].push(p);}}return Object.entries(out).map(([name,posts])=>({name,posts,n:posts.length,value:median(posts.map(p=>p.m[metric]))})).sort((a,b)=>(b.value??-1)-(a.value??-1));}
export function insights(rows){rows=rows.filter(p=>!p.m?.approximate_fields?.includes('impressions'));const results=[];for(const [key,label] of [['hook_category','hook'],['format','format'],['topic_tags','topic']]){const gs=groups(rows,key).filter(g=>g.n>=5);if(gs.length>1&&rows.filter(p=>p.m?.impressions!=null).length>=10&&gs[0].value>gs[gs.length-1].value){results.push({title:`A ${label} worth testing again`,text:`${gs[0].name} has a median of ${gs[0].value.toLocaleString()} recorded impressions (n=${gs[0].n}), compared with ${gs[gs.length-1].value.toLocaleString()} for ${gs[gs.length-1].name} (n=${gs[gs.length-1].n}). This is a pattern in your sample, not a causal conclusion.`,ids:gs[0].posts.map(p=>p.post_id)});}}
const s=summary(rows);const best=rows.filter(p=>p.m?.impressions!=null).sort((a,b)=>b.m.impressions-a.m.impressions)[0];if(s.measured>=10&&s.median>0&&best.m.impressions>=s.median*1.5)results.push({title:'Above your usual range',text:`Your strongest post recorded ${best.m.impressions.toLocaleString()} impressions versus a median of ${s.median.toLocaleString()}. Revisit its opening and topic.`,ids:[best.post_id]});if(!results.length)results.push({title:'Build your comparison sample',text:'Keep your usual one-update routine. Comparisons become more useful with at least five measured posts in each category.',ids:[]});return results;}
export function parseScreenshotText(text){
  const lines=String(text).normalize('NFKC').split(/\n/).map(s=>s.trim()).filter(Boolean),patch={},evidence={},conflicts=[];
  const numeric='(\\d[\\d,]*(?:\\.\\d+)?[ \\t]*[kKmM]?)';
  const aliases={...labels,sends:'sends?(?: on linkedin)?',articles_read:'article(?:s)? (?:read|views?)',email_sends:'email sends?',email_open_pct:'email open(?: rate)?',profile_viewers:'profile viewers?(?: from this post)?',followers_gained:'followers? gained(?: from this post)?'};
  for(const [key,label]of Object.entries(aliases)){
    const values=[];
    for(let i=0;i<lines.length;i++){
      const line=lines[i].replace(/^[^a-z0-9]+/i,'').replace(/[\s>›»→|)]+$/g,'').replace(/(\d)[ \t]+(?=\d)/g,'$1');
      // Match the complete label/value row: "Email sends" is never "Sends".
      const valuePattern=numeric+(key==='email_open_pct'?'\\s*%?':'');
      let match=line.match(new RegExp('^(?:'+label+')[ \\t]*[:=]?[ \\t]*'+valuePattern+'$','i'))||line.match(new RegExp('^'+valuePattern+'[ \\t]*(?:'+label+')$','i'));
      if(!match&&new RegExp('^(?:'+label+')$','i').test(line)){
        const neighbors=[lines[i-1],lines[i+1]].filter(Boolean).map(s=>s.replace(/(\d)[ \t]+(?=\d)/g,'$1')).filter(s=>new RegExp('^'+valuePattern+'$','i').test(s));
        if(neighbors.length===1)match=neighbors[0].match(new RegExp('^'+valuePattern+'$','i'));
      }
      if(match){try{const value=key==='email_open_pct'?Number(match[1]):number(match[1]);if(key==='email_open_pct'&&(!Number.isFinite(value)||value<0||value>100))continue;values.push(value);evidence[key]=line;}catch{}}
    }
    const unique=[...new Set(values)];if(unique.length===1)patch[key]=unique[0];else if(unique.length>1)conflicts.push(key);
  }
  return {patch,evidence,conflicts};
}

// Keep readable fields even when another screenshot contains a conflicting value.
export function mergeScreenshotResults(results){
  const patch={},evidence={},conflicts=new Set(),bodies=[];
  for(const result of results){
    for(const key of result.conflicts||[]){conflicts.add(key);delete patch[key];}
    for(const [key,value]of Object.entries(result.patch||{})){
      if(conflicts.has(key))continue;
      if(key in patch&&patch[key]!==value){conflicts.add(key);delete patch[key];}
      else patch[key]=value;
    }
    Object.assign(evidence,result.evidence);
    if(result.postText)bodies.push(result.postText);
  }
  if(bodies.length){patch.post_text=[...new Set(bodies)].join('\n\n');evidence.post_text='Post text read from content screenshot. Review the opening and wording.';}
  return {patch,evidence,conflicts:[...conflicts]};
}

// OCR rows can contain navigation glyphs and values on either side of labels.
export function extractPostText(text){
  const raw=String(text||'').normalize('NFKC');
  if(/post analytics|social engagements|members reached|top demographics|profile activity|read my update|review & save|match an existing post/i.test(raw))return '';
  let lines=raw.split('\n').map(s=>s.trim());
  while(lines.length&&(!lines[0]||/^\d{1,2}:\d{2}\b|^search\b|^.{0,8}view my newsletter[^a-z]*$|^\d+\s*[smhdw]\b|^[^a-z0-9]+$/i.test(lines[0])))lines.shift();
  const end=lines.findIndex(s=>/^(?:home\s+network|notifications|like\s+comment|add a comment|network\s+post)\b/i.test(s));
  if(end>=0)lines=lines.slice(0,end);
  while(lines.length&&(!lines.at(-1)||!/[a-z]{2}/i.test(lines.at(-1))))lines.pop();
  const unwrapped=[];for(const line of lines){if(line&&unwrapped.at(-1)&&!/[.!?:]$/.test(unwrapped.at(-1)))unwrapped[unwrapped.length-1]+=' '+line;else unwrapped.push(line);}const body=unwrapped.join('\n').trim().replace(/(^|[ \n,.])\|(?=\s+[a-z])/gi,'$1I').replace(/BuildingWithAl\b/g,'BuildingWithAI').replace(/\bAl(?=\s+(?:agents?|assistants?|handle|has|rebuilt|pilots?|models?|tools?))/g,'AI');
  return body.length>=60&&body.split(/\s+/).length>=12?body:'';
}
