import assert from 'node:assert/strict';

export function runHookTests(classify,feedback,opening){
  const fixtures=[
    ['If AI finishes a job faster, should the client pay less?','Question'],
    ['An agent moves work across systems. How do we know the task is finished?','Question'],
    ['A new moderation button is live, but who decides which posts get flagged?','Question'],
    ['Why do 42% of teams repeat the same checks?','Question'],
    ['How to build a weekly report in three steps.','How-To/Promise'],
    ['Our solution to delayed approvals: put reviewers inside the delivery team.','How-To/Promise'],
    ['Two-thirds of new roles ask for data skills.','Data/Stat'],
    ['Almost half of customers used the new flow.','Data/Stat'],
    ['The team supports eight regional languages.','Data/Stat'],
    ['The rollout reached 12,000 office-based employees.','Data/Stat'],
    ['Manual corrections: 72 before automation, 6 after.','Data/Stat'],
    ['The process moved from two weeks to 3 days.','Data/Stat'],
    ['Your most efficient analyst and your biggest compliance risk might skip the same review.','Problem/Mistake'],
    ['An attack campaign is targeting payment providers during reduced staffing.','Problem/Mistake'],
    ['My assistant had the complete history and still sent the wrong answer.','Problem/Mistake'],
    ['Our report is ready in ten minutes. It still waits four days for approval.','Problem/Mistake'],
    ['“Handle this” leaves too much unsaid when software can take actions.','Problem/Mistake'],
    ['Same input. Same template. Different layout. We call this format drift.','Problem/Mistake'],
    ['Stop choosing your next tool by which model is smartest.','Contrarian'],
    ['Most people copy the old process instead of redesigning it.','Contrarian'],
    ['Building a demo is easy. Keeping it useful six months later is harder.','Contrarian'],
    ["I could connect the agent to payments. I'm not going to.",'Contrarian'],
    ["The hiring panic just turned on its head.",'Contrarian'],
    ["The assistant worked well until the final edit.",'Curiosity/Open Loop'],
    ['Two examples caught my eye this week.','Curiosity/Open Loop'],
    ['Your role could survive automation and still look different.','Curiosity/Open Loop'],
    ['One thing most people missed: the free tier just ended.','Curiosity/Open Loop'],
    ['One of the most useful instructions I gave an assistant was about what to leave alone.','Story'],
    ['Six months ago I started writing about operations.','Story'],
    ['As an operations lead, I was relying on a manual workbook.','Story'],
    ['Let me share a small lesson from this week.','Story'],
    ['Have been using a new dictation tool for a month.','Story'],
    ["I went quiet for a few weeks.",'Story'],
    ['“That is not what we agreed.”','Story'],
    ['Name: Alex\nAge: 5\nOccupation: Stone Collector','Story'],
    ['A fictional character once demonstrated the problem with poorly scoped assistants.','Problem/Mistake'],
    ['I shipped the report with zero errors.','Story'],
    ['I found nothing wrong with the output.','Story']
  ];
  for(const [text,expected] of fixtures){
    const result=classify(text);
    assert.equal(result.category,expected,text);
    assert.ok(['clear','likely'].includes(result.confidence),text);
    assert.ok(result.reason&&result.opening,text);
    assert.equal(new Set(result.suggestions.map(s=>s.category)).size,result.suggestions.length,text);
    // Hard line wrapping must not change the result.
    assert.equal(classify(text.replace(/(.{15,28})\s/g,'$1\n')).category,expected,text);
  }
  for(const text of ['', 'Happy Diwali!','Merry Christmas!','Acme released a new service today.', 'The brief brings news every day. It also includes useful ideas.', 'There is no compliance risk in this hypothetical example.', 'We have not found errors.', 'A regular opening. Another sentence.\n\nWhy do we repeat this?']){
    assert.equal(classify(text).category,'Uncategorized',text);
  }
  const ambiguous=classify('Everyone believes this process is safe, but I discovered errors.');
  assert.equal(ambiguous.category,'Uncategorized');assert.equal(ambiguous.confidence,'review');
  assert.ok(ambiguous.suggestions.some(s=>s.category==='Contrarian'));
  assert.ok(ambiguous.suggestions.some(s=>s.category==='Problem/Mistake'));
  const weak=classify('Technology has changed the way you search.');
  assert.equal(weak.category,'Uncategorized');assert.equal(weak.confidence,'review');
  assert.equal(weak.suggestions[0].category,'Curiosity/Open Loop');
  const quote=classify('“That is not what we agreed.”');
  assert.match(feedback(quote),/^Likely hook: Story/);
  assert.match(feedback(quote,true),/manual hook choice is kept/);
  assert.match(feedback(ambiguous),/Choose a suggestion/);
  assert.ok(!opening('Same prompt. Same fields. Different design. I call this format drift.\n\nWhat do you think?').includes('What do you think'));
  assert.equal(classify('A useful report arrived today. What do you think?').category,'Uncategorized');
  console.log(`Hook families: ${fixtures.length} positive fixtures, wrapping checks, negative cases, ambiguity and fallback checks passed.`);
}
