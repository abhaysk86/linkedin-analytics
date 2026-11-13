// Deterministic rhetorical patterns, not topic keywords or an external model.
// Scores are rule strengths, not probabilities. Categories can overlap.
const rules=[
  ['Question','direct-question',6,/^(?:["']?)(?:why|what|how(?! to)|when|who|where|can|could|would|do|does|is|are|should|will)\b.*\?/,'The opening asks a direct question.'],
  ['Question','setup-question',6,/(?:^|[.!]\s+)(?:if\b[^?]*,\s*)?(?:why|what|how(?! to)|when|who|where|can|could|would|do|does|is|are|should|will)\b[^?]*\?/,'A setup leads into a question in the opening.'],
  ['Question','conditional-question',6,/^if\b[^?]+\?/,'The opening frames a conditional question.'],
  ['Question','embedded-question',6,/\b(?:but|and|yet|so)[, ]+(?:who|what|why|how|where|when|should|can)\b[^?]*\?/,'The opening moves from a statement into a question.'],
  ['How-To/Promise','guide',6,/^(?:how to|here.s how|a guide to|learn how|\d+ (?:ways|steps|tips) to)\b/,'The opening promises a method or practical guide.'],
  ['How-To/Promise','practical-promise',5,/\b(?:here are|try these|follow these)\b.{0,35}\b(?:steps|tips|ways|checks|questions)\b/,'The opening promises practical steps or checks.'],
  ['How-To/Promise','solution',4,/\b(?:answer|solution) to\b.{0,100}:\s*(?:put|start|build|use|give|make|set|take|keep)\b/,'The opening introduces a practical solution.'],
  ['Data/Stat','percentage',5,/\b\d+(?:\.\d+)?\s*(?:%|percent\b)/,'The opening contains a numerical percentage.'],
  ['Data/Stat','fraction',5,/\b(?:(?:one|two|three)[ -](?:thirds?|quarters?)|half|a majority)\s+of\b/,'The opening leads with a proportion written in words.'],
  ['Data/Stat','count',5,/\b\d[\d,.]*\s+(?:[\w-]+\s+){0,3}(?:employees|people|companies|teams|users|customers|respondents|businesses|roles|cases)\b/,'The opening includes a quantified group or sample.'],
  ['Data/Stat','word-count',5,/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million)\s+(?:[\w-]+\s+){0,2}(?:employees|companies|teams|users|customers|respondents|languages|roles|cases)\b/,'The opening quantifies a group or capability using a number written in words.'],
  ['Data/Stat','before-after',5,/\b\d[\d,.]*\s+before\b.{0,50}\b\d[\d,.]*\s+after\b/,'The opening compares numerical results before and after a change.'],
  ['Data/Stat','measured-change',4,/\bfrom\s+(?:\d[\d,.]*|one|two|three|four|five|six|seven|eight|nine|ten)\b.{0,25}\b(?:hours?|days?|weeks?|minutes?|seconds?)\b.{0,20}\bto\s+\d[\d,.]*\s+(?:hours?|days?|weeks?|minutes?|seconds?)\b/,'The opening compares measured durations.'],
  ['Problem/Mistake','explicit-problem',5,/\b(?:biggest mistake|stop doing|struggling with|kept failing|went wrong|mistakes? you|compliance risk|security risk|attack campaign|data breach|fraud|broken|errors?|failures?|bottleneck|format drift|poorly scoped)\b/,'The opening names a failure, risk or operational problem.'],
  ['Problem/Mistake','broken-result',5,/\b(?:found|discovered)\b.{0,40}\b(?:wrong|broken|mistakes?|issues?)\b/,'The opening reveals something that went wrong.'],
  ['Problem/Mistake','outcome-gap',5,/^[^.!?]{0,120}\b(?:kept|keeps)\b[^.!?]{1,100}[.!?]\s*(?:but\s+)?(?:i|we)\s+(?:wanted|needed)\s+(?:it|them)\s+to\b/,'The repeated result is contrasted with the outcome you wanted.'],
  ['Problem/Mistake','expectation-gap',5,/\b(?:i|we)\s+(?:wanted|needed|expected)\b.{1,90}\b(?:but|instead|yet)\b.{1,70}\b(?:got|gave|kept|found|was|were|didn.t|couldn.t)\b/,'The opening contrasts an intended outcome with what happened.'],
  ['Problem/Mistake','remaining-friction',5,/\bstill\s+(?:waits?|waiting|needs?|requires?|takes?|relies?|depends?|cannot|can.t|doesn.t|didn.t|has to|have to)\b/,'The opening highlights work or delay that remains despite progress.'],
  ['Problem/Mistake','capability-gap',5,/\b(?:had|has|have|given)\b.{0,50}\b(?:whole|all|complete|correct)\b.{0,70}\bstill\b.{0,70}\b(?:wrong|oldest|outdated|irrelevant|missed|failed)\b/,'The opening contrasts available information with an incorrect result.'],
  ['Problem/Mistake','hidden-requirements',5,/\b(?:leaves? (?:a lot|much|too much) unsaid|missing (?:instructions|context|requirements)|unclear instructions|unnecessary work)\b/,'The opening points to missing instructions or avoidable work.'],
  ['Problem/Mistake','unexpected-limit',4,/\b(?:expiry date|usage limit|hidden costs?|hidden trade-offs?)\b/,'The opening introduces a limitation or cost to examine.'],
  ['Contrarian','belief-challenge',5,/\b(?:unpopular opinion|everyone (?:says|thinks|believes).{0,100}\bbut|most people.{0,90}\b(?:wrong|instead of)|contrary to|turned on its head)\b/,'The opening challenges a common belief or practice.'],
  ['Contrarian','stop-criterion',5,/^stop (?:picking|choosing|judging|measuring|treating|assuming|basing)\b/,'The opening challenges a common way of choosing or judging something.'],
  ['Contrarian','corrective-contrast',5,/\b(?:isn.t|is not|aren.t|are not|not about)\b.{1,80}(?:\bit.s\b|\bit is\b|\bbut\b)/,'The opening replaces one explanation with another.'],
  ['Contrarian','difficulty-contrast',5,/\bis easy\b.{0,100}\b(?:harder|difficult|hard)\b/,'The opening contrasts an easy first step with a harder real outcome.'],
  ['Contrarian','deliberate-refusal',5,/\bi could\b.{0,160}\bi.m not going to\b/,'The opening contrasts what is possible with a deliberate decision not to do it.'],
  ['Contrarian','less-is-more',4,/\b(?:best|better|most useful)\b.{0,100}\b(?:least|less|fewer)\b/,'The opening presents an unexpected less-is-more comparison.'],
  ['Contrarian','human-handoff',5,/^an ai[^.!?]{8,100}[.!?]\s*a human\b/,'The opening contrasts an AI outcome with the human work behind it.'],
  ['Curiosity/Open Loop','surprise',4,/\b(?:i (?:never|didn.t) (?:told|tell|expect)|then (?:everything|something) changed|what happened next|didn.t see.{0,20}coming|wasn.t expecting|one thing.{0,30}(?:didn.t notice|missed))\b/,'The opening introduces a surprise or a detail that was missed.'],
  ['Curiosity/Open Loop','until-turn',4,/\b(?:impressed|worked|fine|great)\b.{0,60}\buntil\b/,'The opening introduces a turning point without resolving it.'],
  ['Curiosity/Open Loop','attention',4,/\b(?:caught my eye|got me curious|the numbers got me)\b/,'The opening signals an observation worth investigating.'],
  ['Curiosity/Open Loop','unexpected-change',4,/\b(?:could|can|might)\b.{0,65}\band still\s+(?:look|become|mean|leave)\b/,'The opening points to an unexpected consequence.'],
  ['Story','first-person-experience',4,/^(?:i|we)\s+(?:built|started|tried|learned|spent|went|wrote|used|tested|worked|asked|found|noticed|made|launched|shipped|decided|was|were|had)\b/,'The opening introduces a personal experience.'],
  ['Story','personal-action',4,/\b(?:i|we)\s+(?:gave|built|rebuilt|started|tried|learned|spent|wrote|used|tested|asked|noticed|made|launched)\b/,'The opening describes something the author did.'],
  ['Story','time-setting',4,/^(?:(?:last|this) (?:week|month|year|morning|weekend)|yesterday|(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+) (?:days?|weeks?|months?|years?) ago|saturday|sunday|monday)\b/,'The opening sets a time for an experience or event.'],
  ['Story','personal-role',4,/^as (?:a|an)\b.{0,70}\b(?:i|we)\b/,'The opening frames an experience through the author’s role.'],
  ['Story','invitation',4,/^let me (?:share|tell)\b/,'The opening invites the reader into a story.'],
  ['Story','implied-personal-experience',4,/^(?:have been (?:using|building|working|testing)|started (?:writing|building|working|using))\b/,'The opening describes an ongoing or past personal activity.'],
  ['Story','dialogue',4,/^"(?:that|this|it|we|i|you|what|why|how|can|don.t|stop)\b[^"]{3,155}"(?:\s|$)/,'The opening uses a line of dialogue or a quoted scenario.'],
  ['Story','character',4,/^name:\s*\w+.{0,50}\bage:\s*\d+/,'The opening introduces a character.'],
  ['Story','third-person-scene',4,/\bonce (?:demonstrated|showed|told|asked|said|tried)\b/,'The opening introduces an event involving another person.'],
  // Weak patterns produce choices, not automatic labels.
  ['Curiosity/Open Loop','change-claim',3,/\b(?:has changed the way|new perspective|something changed)\b/,'A change or new perspective may be used to create curiosity.'],
  ['Problem/Mistake','constraint',3,/\b(?:reliant on|had to|too small|too long|wasn.t working|couldn.t)\b/,'The opening may describe a constraint or problem.']
];

export function hookOpening(text){
  const raw=String(text||'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
  let opening=raw.split(/\n\s*\n/)[0].replace(/\s+/g,' ').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/^[^\p{L}\p{N}"']+/u,'');
  // Keep short, staccato hooks together, but never scan the body/closing CTA.
  const ends=[...opening.matchAll(/[.!?]["')\]]*(?=\s|$)/g)];
  let end=ends[1];
  for(let i=2;end&&i<Math.min(4,ends.length)&&opening.slice(0,end.index+end[0].length).split(/\s+/).length<12;i++)end=ends[i];
  if(end)opening=opening.slice(0,end.index+end[0].length);
  return opening.slice(0,360).trim();
}

export function classify(text){
  const opening=hookOpening(text),lower=opening.toLowerCase(),byCategory=new Map();
  // Greetings are valid posts but do not imply one of the rhetorical hooks.
  const greeting=/^(?:happy (?:diwali|holi|new year|christmas|eid)|merry christmas|wishing you|season.s greetings)\b/.test(lower);
  if(!greeting)for(const [category,rule,score,pattern,reason]of rules){
    const candidate=rule==='explicit-problem'?lower.replace(/\b(?:no|not|zero|without|avoided|prevented|eliminated|fixed|resolved)\s+(?:(?:found|seen|identified|reported|encountered)\s+)?(?:(?:any|a|the|all)\s+)?(?:(?:data|security|compliance)\s+)?(?:errors?|failures?|risks?|mistakes?|problems?|bottlenecks?|breaches?|fraud)\b/g,m=>' '.repeat(m.length)):lower;
    const match=candidate.match(pattern);if(!match)continue;
    if(rule==='broken-result'&&/\b(?:nothing|no|not)\b/.test(match[0]))continue;
    if(category==='Question'&&/^(?:what do you think|what.s your take|do you agree|how about you)\b/.test(match[0].replace(/^(?:[.!]\s*|(?:but|and|yet|so)[, ]+)+/,'')))continue;
    const previous=byCategory.get(category);
    if(!previous||score>previous.score)byCategory.set(category,{category,rule,score,reason,evidence:opening.slice(match.index,match.index+match[0].length)});
  }
  const suggestions=[...byCategory.values()].sort((a,b)=>b.score-a.score);
  const top=suggestions[0];
  // Personal narration can coexist with a more specific rhetorical device.
  const competitor=suggestions.find(s=>s.category!==top?.category&&s.category!=='Story');
  const ambiguous=top&&competitor&&top.score===competitor.score;
  const confidence=!top?'none':ambiguous||top.score<4?'review':top.score>=5?'clear':'likely';
  const category=confidence==='clear'||confidence==='likely'?top.category:'Uncategorized';
  return {category,confidence,suggestions:suggestions.slice(0,3),reason:category!=='Uncategorized'?top.reason:greeting?'This is a greeting; no rhetorical hook is assigned.':'',opening,version:'3'};
}

export function hookFeedback(result,manual=false){
  let message=!result.opening?'Add the post opening to get a hook suggestion.':result.category!=='Uncategorized'?(result.confidence==='likely'?'Likely hook: ':'Suggested: ')+result.category+'. '+result.reason:result.suggestions.length?'More than one hook could fit, or the evidence is weak. Choose a suggestion below.':result.reason||'No clear match for these hook categories. You can choose one or leave it uncategorized.';
  if(manual)message+=' Your manual hook choice is kept.';
  return message;
}
