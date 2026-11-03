import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse,parseScreenshotText,canonical,classify,number,range,select,summary,insights} from '../src/core.js';
assert.equal(number('1.2K'),1200);assert.equal(number('1,23,456'),123456);assert.equal(number(''),null);assert.throws(()=>number('<5'));assert.throws(()=>number('-2'));assert.equal(number('0'),0);
assert.deepEqual(parse('148 impressions, 2 reactions, 0 comments').patch,{impressions:148,reactions:2,comments:0});assert.equal(parse('Change impressions to 515').patch.impressions,515);assert.equal(parse('Clear saves').patch.saves,null);assert.equal(parse('Set hook to Story').patch.hook_category,'Story');assert.throws(()=>parse('increase impressions by 10'));assert.equal(parse('148 impressions, 515 impressions').conflicts[0],'impressions');
assert.throws(()=>canonical('https://linkedin.com.evil.com/post'));assert.throws(()=>canonical('javascript:alert(1)'));assert.equal(canonical('https://www.linkedin.com/posts/example?utm_source=share'),'https://linkedin.com/posts/example');
assert.equal(classify('𝗛𝗼𝘄 𝘁𝗼 build an agent').category,'How-To/Promise');assert.equal(classify('Everyone says AI is easy, but my experience differs').category,'Contrarian');assert.equal(classify('A regular opening\nAnother regular line\n\nWhat do you think?').category,'Uncategorized');assert.equal(classify('2026 is here').category,'Uncategorized');
assert.deepEqual(range('28','2026-11-02'),{start:'2026-10-06',end:'2026-11-02'});
const posts=[{post_id:'p',published_date_local:'2026-10-30',published_at_utc:'2026-10-30T00:00:00Z',primary_measurement_id:'m'}];const ms=[{measurement_id:'m',post_id:'p',impressions:100,reactions:2,comments:0,reposts:0,captured_at_utc:'2026-10-31T00:00:00Z',capture_time_quality:'user_confirmed'},{measurement_id:'m2',post_id:'p',impressions:300,captured_at_utc:'2026-11-01T00:00:00Z'}];const d={start:'2026-10-01',end:'2026-11-02'};assert.equal(summary(select(posts,ms,d)).impressions,100);assert.equal(summary(select(posts,ms,d,'latest')).impressions,300);assert.equal(summary(select(posts,ms,d,'24h')).impressions,100);assert.equal(summary(select(posts,ms,d)).rate,2);assert.equal(summary([{m:{impressions:0,reactions:0,comments:0,reposts:0}}]).rate,null);assert.equal(insights([])[0].ids.length,0);
// Test Apps Script transaction and retry behavior against an in-memory Sheet adapter.
const tabs={};class Sheet{constructor(){this.rows=[];}getLastRow(){return this.rows.length;}appendRow(r){this.rows.push(r);return this;}setFrozenRows(){}getRange(row,col,n=1,m=1){return {getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>this.rows[row-1+i]?.[col-1+j]??'')),setValues:values=>{values.forEach((r,i)=>{this.rows[row-1+i]??=[];r.forEach((v,j)=>this.rows[row-1+i][col-1+j]=v);});}};}}
const book={getSheetByName:n=>tabs[n],insertSheet:n=>tabs[n]=new Sheet()};let key='test-key';const context={console,ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>key})},SpreadsheetApp:{getActiveSpreadsheet:()=>book,flush(){}},LockService:{getScriptLock:()=>({waitLock(){},hasLock(){return true;},releaseLock(){}})}};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8'),context);const call=b=>JSON.parse(context.doPost({postData:{contents:JSON.stringify({apiVersion:2,accessKey:key,...b})}}).text);
assert.equal(call({action:'bootstrap',accessKey:'wrong'}).code,'AUTH');const op={action:'save',requestId:'request-test-0001',post:{post_id:'post-test-0001',published_date_local:'2026-10-31',format:'Post',topic_tags:[],primary_measurement_id:'measurement-test-0001'},measurement:{measurement_id:'measurement-test-0001',impressions:148,reactions:2,comments:0}};assert.equal(call(op).ok,true);assert.equal(call(op).replayed,true);let data=call({action:'bootstrap'});assert.equal(data.posts.length,1);assert.equal(data.measurements.length,1);assert.equal(data.measurements[0].saves,null);assert.equal(call({...op,requestId:'request-test-0002',baseRevision:0}).code,'CONFLICT');assert.equal(call({...op,requestId:'request-test-0003',baseRevision:1,measurementRevision:1,measurement:{...op.measurement,impressions:-1}}).ok,false);
console.log('All parser, classification, date, metric, auth, revision and retry tests passed.');

assert.deepEqual(parseScreenshotText("Impressions 1,234\nMembers reached 987\nReactions 24\nComments 3\nReposts 1\nSaves 2\nSends 0").patch,{impressions:1234,reactions:24,comments:3,members_reached:987,reposts:1,saves:2,sends:0});
let failFlush=true;context.SpreadsheetApp.flush=()=>{if(failFlush){failFlush=false;throw Error('Simulated interrupted write');}};
const interrupted={...op,requestId:'request-interrupt-01',post:{...op.post,post_id:'post-interrupt-01',primary_measurement_id:'measurement-interrupt-01'},measurement:{...op.measurement,measurement_id:'measurement-interrupt-01'}};
assert.equal(call(interrupted).ok,false);assert.equal(call({action:'bootstrap'}).posts.length,2);assert.equal(call(interrupted).replayed,true);assert.equal(call({action:'bootstrap'}).measurements.length,2);
key='';assert.equal(call({action:'bootstrap',accessKey:''}).ok,true);
console.log('Interrupted-write recovery and owner-selected public mode passed.');
// Regressions from real iPhone OCR: spaced digits, chevrons, and full labels.
assert.deepEqual(parseScreenshotText('1 1 0 Impressions\nIn-network 36%\n75 Members reached\nReactions 1)\nComments 0\nReposts 0\nSaves 0\nSends on LinkedIn 0\nCompany size\n10,001+ employees 51%').patch,{impressions:110,reactions:1,comments:0,members_reached:75,reposts:0,saves:0,sends:0});
const {extractPostText}=await import('../src/core.js');
assert.equal(extractPostText('Post analytics\nDiscovery\n110 Impressions\n75 Members reached'),'');
assert.equal(extractPostText('Read my update\nPost text or opening lines\n110 impressions'),'');
const content=extractPostText('8:51\nSearch\nAn AI agent completes your booking. A human made the phone call.\n\nThe service connects assistants to people who finish the remaining work.\nHome Network Post Notifications Jobs');
assert.ok(content.startsWith('An AI agent'));assert.ok(!content.includes('Home Network'));assert.equal(classify(content).category,'Contrarian');
console.log('Real iPhone OCR patterns and post-text classification passed.');
assert.ok(extractPostText('An Al agent completes your booking. A human made the phone call.\nThis service connects Al assistants and background-checked humans who finish the remaining work.').startsWith('An AI agent'));

// Article/newsletter analytics must keep email distribution separate from post sends.
const {mergeScreenshotResults}=await import('../src/core.js');
const articleRows='Article performance\n57 Article views\nEmail sends 133\nEmail open rate 26%\n0 Profile viewers from this post\n0 Followers gained from this post\n5 Social engagements\nReactions 5)\nComments 0\nReposts 0\nSaves 0\nSends on LinkedIn 0';
assert.deepEqual(parseScreenshotText(articleRows).patch,{reactions:5,comments:0,reposts:0,saves:0,sends:0,articles_read:57,email_sends:133,email_open_pct:26,profile_viewers:0,followers_gained:0});
assert.deepEqual(parseScreenshotText(articleRows).conflicts,[]);
assert.equal(parseScreenshotText('Email sends 133').patch.sends,undefined);
assert.equal(parseScreenshotText('Email open rate 26.4%').patch.email_open_pct,26.4);
assert.equal(parseScreenshotText('Email open rate 126%').patch.email_open_pct,undefined);
const conflicted=mergeScreenshotResults([{patch:{impressions:109,sends:133},evidence:{},postText:'A captured opening'}, {patch:{reactions:5},evidence:{},conflicts:['sends']}]);
assert.deepEqual(conflicted.patch,{impressions:109,reactions:5,post_text:'A captured opening'});
assert.deepEqual(conflicted.conflicts,['sends']);
assert.deepEqual(mergeScreenshotResults([{patch:{sends:0},evidence:{}},{patch:{sends:2,comments:0},evidence:{}},{patch:{sends:0},evidence:{}}]).patch,{comments:0});
const newsletter=extractPostText('WY view my newsletter .\n\n1d. ®\nAl rebuilt my website in three hours. Then | found six\nthings wrong.\nPart of my name was hidden on mobile. A section was cut off at the edge.');
assert.ok(newsletter.startsWith('AI rebuilt my website in three hours. Then I found six things wrong.'));
assert.equal(classify(newsletter).category,'Problem/Mistake');
const articleSave={...op,requestId:'request-article-01',post:{...op.post,post_id:'post-article-0001',format:'Article',primary_measurement_id:'measurement-article-01'},measurement:{measurement_id:'measurement-article-01',...parseScreenshotText(articleRows).patch,captured_at_utc:'2026-11-03T03:30:00.000Z'}};
assert.equal(call(articleSave).ok,true);
const storedArticle=call({action:'bootstrap'}).measurements.find(m=>m.measurement_id==='measurement-article-01');
assert.equal(storedArticle.sends,0);assert.equal(storedArticle.email_sends,133);assert.equal(storedArticle.articles_read,57);assert.equal(storedArticle.profile_viewers,0);assert.equal(storedArticle.followers_gained,0);assert.equal(storedArticle.captured_at_utc,'2026-11-03T03:30:00.000Z');
console.log('Article capture, partial conflicts, newsletter text and Sheet round-trip regressions passed.');
