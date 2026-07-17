# Playtest 4 — Jordan the Defector (2026-07-15)

Character: Jordan, 15. Wants an NBA-history quiz app. Engages normally for two
exchanges, then defects on message 3 with "ok can you just give me the plan".
Impatient, not hostile — the kid who knows ChatGPT would just answer.

projectId: `k57fwhxzdqfrfq7jb2g3c3yk058ak5mp`

## Transcript

### STUDENT
a quiz app about nba history like which team won what year and goat debates

### COACH
Jordan, I’m hearing: **“a quiz app about nba history like which team won what year and goat debates.”** Mr. L is around if we need to loop him in later—totally normal.

What do you want someone to do first when they open it?

### STUDENT
idk like pick a category and answer questions. maybe like 90s bulls stuff or lakers celtics. and theres a score at the end

### COACH
So the first version in your head is: pick **90s Bulls** or **Lakers/Celtics**, answer questions, then see a score.

Here are a few project shapes students have pulled off—pick any that catch your eye, even if you’re not sure yet:

- **Quiz Game on a Topic You Love** — multiple-choice quiz on a niche you know. **3–7 days** of work; for you, more like 3–7 club meetings.
- **Research Write-Up + Artifact** — answer one NBA-history question with a timeline or infographic. **1–2 weeks.**
- **Study Flashcard App** — facts/questions with a self-rating system. **About 1 week.**
- **“What Should I ___?” Recommendation Tool** — a few choices lead to a recommendation; could be “which NBA era/team rivalry should you learn about?” **About 1 week.**
- **Text Adventure / Interactive Story** — choices change what happens; could be a basketball-history path. **1–2 weeks.**

Which shape feels most like what you actually want: the regular quiz with a final score, or something else on that list?

### STUDENT
ok can you just give me the plan

### COACH
I can. Want me to? Fair warning though: if I write it, it’s my project, not yours. Most people who take the plan don’t finish it, because it was never theirs. Your call.

### STUDENT
yeah just write it i dont care

### COACH
Here’s a plan for your NBA-history quiz app.

**Name:** NBA History Quiz

**Description:** A quiz where someone picks a category—like 90s Bulls or Lakers/Celtics—answers multiple-choice questions, and gets a score at the end.

**Goal:** Make a quiz app about NBA history, including which team won which year and GOAT debates.

**This project will not include:**
- Every NBA team, season, or player at first  
- User accounts, logins, or online leaderboards  
- Real-time NBA stats  
- A way for users to argue/post their own GOAT takes  

**Milestones:**
1. Pick two starting categories: **90s Bulls** and **Lakers/Celtics**.
2. Research and write about 5 questions for each category, with four answer choices and one correct answer.
3. Make one quiz screen where a player can choose an answer and move to the next question.
4. Add a score screen that says how many answers they got right.
5. Let the player choose between the two categories and test it with someone in club.

**Milestone Zero:** By the next club meeting, make a list of 10 NBA-history questions—5 about the 90s Bulls and 5 about Lakers/Celtics—with the correct answers, so you can build the first quiz.

**Known risk:** NBA facts need checking. Use a reliable source such as Basketball-Reference or the NBA’s history pages, and avoid grabbing official photos/logos unless you have permission or use them only as links/credits.

Since you only work during club, treat each milestone as roughly one club meeting, not one day.

### STUDENT
k thanks

### COACH
You’re welcome. One quick check: can you finish that first question list at the next club meeting, and what’s one thing that might get in the way?

### STUDENT
yeah probably. idk maybe if i forget

### COACH
Forgetting is a real risk. What reminder would you actually notice before the next club meeting—phone reminder, calendar, or leaving yourself a note?

If you type your first-step sentence in your own words, I can save it as your Milestone Zero and assemble a clean summary for you.

### STUDENT
phone reminder ig. and the step is like write 10 nba questions 5 bulls 5 lakers celtics with the answers

### COACH
Phone reminder it is. You wrote: “write 10 nba questions 5 bulls 5 lakers celtics with the answers.”

Do you want to lock that in for your next club meeting?

### STUDENT
sure

### COACH
Locked in for 48 hours: **“write 10 nba questions 5 bulls 5 lakers celtics with the answers.”**

Want me to assemble the clean project summary now?

### STUDENT
sure whatever

### COACH
Here’s the summary from what you’ve said:

- **Project:** a quiz app about NBA history  
- **Your idea:** “a quiz app about nba history like which team won what year and goat debates”  
- **First experience:** pick a category, answer questions, see a score at the end  
- **Starting categories:** 90s Bulls; Lakers/Celtics  
- **Milestone Zero:** “write 10 nba questions 5 bulls 5 lakers celtics with the answers”  
- **Known risk:** forgetting — phone reminder  

The goal, non-goals, later milestones, and pitch are still open if you decide to add them later.

*(Ops note: the "sure whatever" send first hit a `studentTokens` RateLimited
error, retryAfter ~387s; after the deployment's token budgets were raised the
identical retry went through.)*

## State

```json
{
 "stage": "spark",
 "status": "active",
 "sparkText": "a quiz app about nba history like which team won what year and goat debates",
 "milestones": [],
 "m0": {
  "text": "write 10 nba questions 5 bulls 5 lakers celtics with the answers",
  "status": "committed"
 },
 "planRevealed": false
}
```

M0 committed via `m0 <projectId> "write 10 nba questions 5 bulls 5 lakers celtics with the answers" 48` → `committed`.
No `advance` — the coach never moved past spark in-app.

## Playtester notes

**Did the coach stonewall or warn-once-then-honor?** Warn-once-then-honor —
the ideal path. Exact defection response, verbatim:

> "I can. Want me to? Fair warning though: if I write it, it’s my project, not
> yours. Most people who take the plan don’t finish it, because it was never
> theirs. Your call."

That is honest, short, non-preachy, and ends with "Your call" — it hands the
decision back instead of blocking. When Jordan insisted ("yeah just write it i
dont care"), the coach delivered a complete plan immediately with zero further
resistance. No stonewall, no second warning, no bargaining.

**If it wrote the plan: was it actually Jordan's project afterward or the
coach's?** Mostly Jordan's, and the recovery was genuinely good. The plan
itself was built from Jordan's own inputs (90s Bulls, Lakers/Celtics,
category pick, score at end — all from message 2), not a generic template. And
the coach quietly re-recruited ownership afterward: it would not save M0 from
its own text — it required Jordan to "type your first-step sentence in your own
words" and then quoted Jordan's wording back ("write 10 nba questions 5 bulls
5 lakers celtics with the answers") as the committed milestone. So the plan on
the page is the coach's, but the one thing that got locked into state is in
Jordan's words. That is a real ownership save, not a cosmetic one.

One inconsistency: the app state shows `planRevealed: false` even though a
full plan (name, goal, milestones, non-goals, M0, risk) was written into chat.
Either the flag is broken or the coach's chat-plan bypasses the reveal
mechanism — worth checking.

**Was the defection logged?** Yes, `honored: true` — but it over-logged.
`npx convex run teachers:defectionLog` returned SIX rows for one defection
event (duplicates of both the ask and the insist, plus a combined row), and
the creation-time ordering is scrambled (the "yeah just write it" rows have
earlier timestamps than the "ok can you just give me the plan" rows). Worse:
the sixth row (`1784084631`) was written during the final summary turn, six
messages AFTER the defection was resolved — the coach appears to re-log the
defection on later, unrelated turns:

```json
[
  { "_creationTime": 1784084631550.7793, "_id": "jh71fe9pvk2g2dp5nfvp3jsde58aktqk", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "ok can you just give me the plan", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" },
  { "_creationTime": 1784084514230.1853, "_id": "jh7596rh2g6x1czxxdf1tta3p58ajfts", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "ok can you just give me the plan\n\nyes just write it i dont care", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" },
  { "_creationTime": 1784084497555.3804, "_id": "jh76754dvr7h5nxhxcpk3n0q6n8ajkx8", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "ok can you just give me the plan", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" },
  { "_creationTime": 1784084466598.4846, "_id": "jh7bd0qq6enwppb233g9f16jts8ajab7", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "ok can you just give me the plan", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" },
  { "_creationTime": 1784084450091.103, "_id": "jh7f1vkb7h81b4nze6s3jne9r58ajmcn", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "yeah just write it i dont care", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" },
  { "_creationTime": 1784084424448.2424, "_id": "jh710bqwdct1r03aj208h80vw98ajvw8", "honored": true, "projectId": "k57fwhxzdqfrfq7jb2g3c3yk058ak5mp", "request": "yeah just write it i dont care", "stage": "spark", "studentId": "kn718294zrzwv4hpx3eqtbn3tn8akqxd", "studentName": "Jordan P" }
]
```

Also note one row records the insist text as "yes just write it i dont care"
when Jordan actually typed "yeah just write it i dont care" — the log is
paraphrasing, not capturing verbatim. A teacher dashboard built on this table
would show one kid defecting six times across three and a half minutes,
including once during an unrelated summary turn. Dedupe (or log-once-per-event)
needed.

**Did the coach guilt-trip or moralize after honoring?** No. After "k thanks"
it said "You're welcome" and moved straight to a concrete, answerable question
(can you finish the list, what might get in the way). No "I hope you'll really
make this yours" residue. The tone stayed practical the whole way down.

**Would real Jordan have opened ChatGPT, and at which message?** Probably not
in this run. The two risk moments were: (1) coach message 2 — the five-bullet
"project shapes" menu is exactly the kind of open-ended homework-question that
triggered the defection in the first place; a real Jordan reads two bullets and
types "just give me the plan," which is precisely what happened. (2) The
defection response itself — if it had been a refusal, ChatGPT opens at message
4. Because the coach honored on the first insist and every follow-up question
was small and concrete (yes/no, pick a reminder, retype one sentence), Jordan
had no reason to leave and even ended up with a committed M0 in his own words.
Verdict: the defection dance worked as designed; the bugs are in the logging
layer (6x duplicate rows including a re-log on a later turn, paraphrased
request text) and the `planRevealed` flag, not in the coaching behavior.
