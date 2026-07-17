# Project Archetypes Library
A reference of 24 project shapes students have actually built. Use these to expand what students think is possible before they commit to an idea.
 
Each entry includes: description, time estimate, difficulty, skills needed, planning hazards, and a remix prompt to help students personalize it.

**Goal / Non-goals / Milestones / M0 are WITHHELD BY DEFAULT during coaching.** They exist here so the archetype has something real to compare against at the reveal — see `iste-alignment.md` and `coaching-anti-patterns.md`. The coach does not read these fields to a student mid-conversation; the student derives their own first. These are generic, seeded versions — real student contributions (`archetypeContributions`) should eventually replace them with the real thing.
 
---
 
## 1. Personal Habit Tracker
Log one daily habit and visualize your streak over time.
- **Time:** 3–5 days
- **Difficulty:** Beginner
- **Skills:** Spreadsheet formulas OR basic HTML/CSS/JS
- **Hazards:** None
- **Goal:** Track one daily habit and see your streak build over time.
- **Non-goals:** Won't support multiple habits in v1; won't sync across devices; won't send reminder notifications.
- **Milestones:** M1 log 3 days manually in a sheet; M2 build the entry form; M3 calculate and display the streak; M4 add a history view.
- **M0:** "By tomorrow, I will have a spreadsheet with Date/Habit/Done/Notes columns and 3 real days logged so that I can see if the structure fits before building anything."
- **Remix prompt:** "Like a habit tracker but for tracking your mood / practice minutes / pages read / workouts"
---
 
## 2. Quiz Game on a Topic You Love
A multiple-choice quiz about a niche you know well — a TV show, sport, historical era, game, etc.
- **Time:** 3–7 days
- **Difficulty:** Beginner
- **Skills:** Basic JavaScript or a no-code tool (Typeform, Google Forms, Glitch)
- **Hazards:** Copyrighted images or media if you pull from official sources
- **Goal:** Let someone answer multiple-choice questions about a topic you know well and see their score.
- **Non-goals:** Won't have a timer or leaderboard in v1; won't pull questions from an external API; won't support user accounts.
- **Milestones:** M1 write and finalize all questions/answers; M2 build the question-display interface; M3 wire up scoring; M4 add a results screen.
- **M0:** "By tomorrow, I will have 10 questions and answers written in a doc so that I can start building the interface around real content."
- **Remix prompt:** "Like a quiz game but about [your favorite show / local history / your friend group's inside jokes]"
---
 
## 3. "What Should I ___?" Recommendation Tool
A short decision-tree or filter that helps someone pick a movie, recipe, book, workout, or game based on a few inputs.
- **Time:** 1 week
- **Difficulty:** Beginner–Intermediate
- **Skills:** Basic logic/conditionals; can be built in Notion, Google Sheets, or simple JS
- **Hazards:** None for a personal version; data permissions matter if you scrape a site
- **Goal:** Ask someone a few questions and give them one recommendation that fits.
- **Non-goals:** Won't personalize based on account history; won't scrape live data; won't cover more than one category (movies OR recipes, not both).
- **Milestones:** M1 map 5 recommendations and the conditions that lead to each; M2 build the input form; M3 wire the matching logic; M4 test with real people.
- **M0:** "By tomorrow, I will have 5 possible recommendations and their conditions mapped out on paper so that I know the logic before I code it."
- **Remix prompt:** "Like a recommendation tool but for choosing a study playlist / weekend activity / what to cook with what's in the fridge"
---
 
## 4. Personal Portfolio or "About Me" Site
A one-page website that shows who you are, what you've made, and what you're interested in.
- **Time:** 2–5 days
- **Difficulty:** Beginner
- **Skills:** HTML/CSS (or a site builder like Carrd, Webflow, Notion)
- **Hazards:** Hosting (free options: GitHub Pages, Netlify, Carrd); don't post personal contact info publicly
- **Goal:** Show who you are, what you've made, and what you're interested in on one page.
- **Non-goals:** Won't include a blog or CMS in v1; won't include a contact form that stores submissions; won't be a multi-page site.
- **Milestones:** M1 write the homepage copy; M2 build the page layout; M3 add real images/work samples; M4 deploy it live.
- **M0:** "By tomorrow, I will have my homepage copy written — one headline, 3 sentences about me, 3 things I've made — so that the site has real content to build around."
- **Remix prompt:** "Like a portfolio but for a fictional character / your pet / a project you're proud of"
---
 
## 5. Data Story / Visual Essay
Take a public dataset you find interesting and turn it into a visual story with charts and written insight.
- **Time:** 1–2 weeks
- **Difficulty:** Intermediate
- **Skills:** Spreadsheets or Python (pandas + matplotlib), or Datawrapper for no-code charts
- **Hazards:** Attribution — cite your data source; check the dataset license
- **Goal:** Take a dataset and tell one clear, visual story about what it shows.
- **Non-goals:** Won't build an interactive dashboard; won't cover more than one central question; won't collect your own data.
- **Milestones:** M1 find and clean the dataset; M2 make the first chart; M3 write the narrative around it; M4 add 1–2 supporting charts.
- **M0:** "By tomorrow, I will have my dataset open in a spreadsheet, one chart made, and two sentences about what it shows so that I know if the story's actually interesting."
- **Remix prompt:** "Like a data story but about [your city's weather / your school sport's stats / a trend in music or film you've noticed]"
---
 
## 6. Small Platformer or Puzzle Game
A short browser or desktop game with a simple mechanic — jump, avoid, collect, or solve.
- **Time:** 2–4 weeks
- **Difficulty:** Intermediate
- **Skills:** JavaScript (Phaser.js or p5.js) or Python (Pygame) or GDScript (Godot)
- **Hazards:** Scope creep — commit to 3 levels max for v1; audio licensing if you add sound effects
- **Goal:** Build one small, playable level around a single mechanic.
- **Non-goals:** Won't have more than 3 levels in v1; won't include a scoring/leaderboard system; won't add sound until the mechanic is fun.
- **Milestones:** M1 get a character on screen and moving; M2 build one full level around the core mechanic; M3 playtest and tune the feel; M4 add a win/lose state.
- **M0:** "By tomorrow, I will have a character (stick figure is fine) that moves left/right on a background, with no enemies or levels yet, so that I can feel whether the controls are fun before building anything else."
- **Remix prompt:** "Like a platformer but with your own art style / set in your school / with a mechanic based on a sport you play"
---
 
## 7. Automation Script
A script that does a boring or repetitive task for you: rename files, sort a folder, send a weekly summary email, scrape a price, etc.
- **Time:** 2–5 days
- **Difficulty:** Intermediate
- **Skills:** Python (beginner-friendly) or JavaScript
- **Hazards:** Web scraping may violate a site's terms of service — check first; sending emails requires an API key
- **Goal:** Automate one specific repetitive task you actually do.
- **Non-goals:** Won't generalize to handle every edge case; won't build a UI — command line is fine; won't run on a schedule/server in v1.
- **Milestones:** M1 do the task by hand once and write down every step; M2 script the first step; M3 chain the remaining steps together; M4 run it on real data and fix what breaks.
- **M0:** "By tomorrow, I will have done the task once by hand and written down every step so that I know exactly what the script needs to do."
- **Remix prompt:** "Like an automation script but for [organizing your downloads folder / summarizing your notes / tracking a price you care about]"
---
 
## 8. Browser Extension
A small tool that changes how a website looks or works — block distracting elements, highlight key words, add a button that does something useful.
- **Time:** 1–2 weeks
- **Difficulty:** Intermediate
- **Skills:** HTML, CSS, JavaScript (Chrome/Firefox extension APIs)
- **Hazards:** Extensions need user consent to access page data; don't collect browsing history
- **Goal:** Change one specific thing about how a website looks or works.
- **Non-goals:** Won't work across every website — pick one or a small few; won't collect or store browsing data; won't publish to the extension store in v1.
- **Milestones:** M1 describe exactly what it detects and changes; M2 build a static before/after mockup; M3 get it working on one page; M4 test across a few real pages.
- **M0:** "By tomorrow, I will have written what page(s) it runs on, what it detects, and what it changes, plus a before/after mockup, so that I can explain it before I build it."
- **Remix prompt:** "Like a browser extension but that [hides spoilers on Reddit / adds a reading time estimate to any article / highlights your vocab words on any page]"
---
 
## 9. Study Flashcard App
A flashcard tool for a subject you're studying, with spaced repetition or a self-rating system.
- **Time:** 1 week
- **Difficulty:** Beginner–Intermediate
- **Skills:** Basic JavaScript or a no-code tool (Anki export, Notion database, Quizlet API)
- **Hazards:** None for personal use; copyrighted textbook content if you copy verbatim
- **Goal:** Drill yourself on one unit's worth of material with self-rating or spaced repetition.
- **Non-goals:** Won't support multiple subjects/decks in v1; won't sync across devices; won't auto-generate cards from a textbook.
- **Milestones:** M1 write all the cards for one unit; M2 build the flip/reveal interface; M3 add self-rating; M4 add a way to resurface missed cards.
- **M0:** "By tomorrow, I will have 20 flashcards for one unit written in a sheet, front and back, so that I can quiz myself manually before building any interface."
- **Remix prompt:** "Like a flashcard app but for [learning a language / memorizing music theory / drilling math facts]"
---
 
## 10. Event or Club Landing Page
A clean webpage for a real or imagined club, event, or cause — with a schedule, sign-up prompt, and description.
- **Time:** 3–5 days
- **Difficulty:** Beginner
- **Skills:** HTML/CSS or a site builder; optional: embed a Google Form for sign-ups
- **Hazards:** Don't collect emails without a plan for how you'll store and use them
- **Goal:** Give a visitor everything they need to know about this event or club in one page.
- **Non-goals:** Won't build a full registration system — a form embed is enough; won't include a members-only area; won't be a multi-page site.
- **Milestones:** M1 write the core copy (what/who/when-where/how to join); M2 build the page layout; M3 add the sign-up embed; M4 deploy and share the link.
- **M0:** "By tomorrow, I will have written the 5 things any visitor needs to know so that I have the page's structure and first draft of copy."
- **Remix prompt:** "Like a landing page but for [a club you wish existed / a community event / your friend group's project]"
---
 
## 11. Text Adventure / Interactive Story
A branching story where choices change the outcome — can be built in plain text, a web tool, or code.
- **Time:** 1–2 weeks
- **Difficulty:** Beginner (with Twine or Ink) / Intermediate (with code)
- **Skills:** Twine, Ink, or JavaScript
- **Hazards:** Scope — stories branch exponentially; plan your tree before writing
- **Goal:** Let someone make choices that change how the story goes.
- **Non-goals:** Won't branch infinitely — plan a fixed tree before writing; won't include save/load in v1; won't give every branch a fully distinct ending.
- **Milestones:** M1 map the branch structure on paper; M2 write the opening scene; M3 write the remaining branches; M4 playtest the full path start to finish.
- **M0:** "By tomorrow, I will have one room written — a description, two choices, and what happens for each — so that I know the mechanic works before writing the rest."
- **Remix prompt:** "Like a text adventure but set in [your school / a fantasy world you've invented / a retelling of a historical event]"
---
 
## 12. Physical + Digital Hybrid: Sensor Dashboard
Connect a cheap microcontroller (Arduino, Raspberry Pi) to a sensor (temperature, light, motion) and display the data on a simple webpage or app.
- **Time:** 2–4 weeks
- **Difficulty:** Intermediate–Advanced
- **Skills:** Basic electronics, Python or C++, simple HTML/JS for the display
- **Hazards:** Hardware costs (~$10–30); Raspberry Pi availability; don't expose a live server without basic security
- **Goal:** Read one sensor's data and display it somewhere you can check it.
- **Non-goals:** Won't monitor multiple sensors in v1; won't expose the dashboard on the public internet; won't add alerts until read-and-display works.
- **Milestones:** M1 get the sensor wired and reading raw values; M2 log those values to a file or console; M3 build a simple display page; M4 leave it running and check it holds up over a day.
- **M0:** "By tomorrow, I will have the sensor wired up and printing raw readings to the console so that I know the hardware works before building a display for it."
- **Remix prompt:** "Like a sensor dashboard but for [monitoring plant soil moisture / tracking noise levels in a room / logging how often a door opens]"
---
 
## 13. Research Write-Up + Artifact
A well-researched essay, explainer, or report on a question you care about — paired with one visual artifact (diagram, timeline, map, or infographic).
- **Time:** 1–2 weeks
- **Difficulty:** Beginner
- **Skills:** Writing, research, basic design (Canva, Figma, or even Google Slides for the artifact)
- **Hazards:** Cite your sources; images you didn't make need attribution
- **Goal:** Answer one question you care about, backed by real sources, with one visual to go with it.
- **Non-goals:** Won't try to cover the whole topic — one specific question only; won't include original data collection; won't run longer than the argument needs.
- **Milestones:** M1 write the question and a tentative answer; M2 gather and read the sources; M3 write the full piece; M4 build the visual artifact.
- **M0:** "By tomorrow, I will have my question and tentative answer written in 3 sentences, plus 3 sources that speak to it, so that I have an outline before I write anything."
- **Remix prompt:** "Like a research write-up but answering [a question you've always wondered about / a local history mystery / a comparison no one's made yet]"
---
 
## 14. "Learn With Me" Tutorial or Video Series
A short written or video tutorial that teaches something you know well to someone who doesn't.
- **Time:** 1–2 weeks
- **Difficulty:** Beginner
- **Skills:** Writing or screen recording (OBS, Loom); optional: a simple website to host it
- **Hazards:** Background music in videos needs a royalty-free license; if posting publicly, avoid showing other people's faces without permission
- **Goal:** Teach one thing you know well to someone who doesn't know it yet.
- **Non-goals:** Won't cover more than one topic/skill in v1; won't be professionally edited; won't assume the viewer has prior context.
- **Milestones:** M1 outline the steps you're teaching; M2 record a rough pilot of step 1; M3 watch it back and fix what's unclear; M4 record/write the remaining steps.
- **M0:** "By tomorrow, I will have a 2-minute unedited screen recording of just step 1 so that I can tell if the explanation actually makes sense."
- **Remix prompt:** "Like a tutorial but teaching [a skill you've learned this year / a trick in a game / how to navigate a confusing process]"
---
 
## 15. Mood Board / Aesthetic Archive
A curated, visual collection around a theme, style, or idea — built as a webpage, Notion page, or Are.na board.
- **Time:** 2–4 days
- **Difficulty:** Beginner
- **Skills:** Basic HTML/CSS or no-code (Notion, Cargo, Are.na)
- **Hazards:** Image attribution — credit artists and photographers; don't hotlink without permission
- **Goal:** Build a visual collection that captures one specific theme or feeling.
- **Non-goals:** Won't include images without attribution/license; won't try to cover multiple unrelated themes; won't require a login or account system.
- **Milestones:** M1 collect the first batch of images; M2 arrange them in a rough grid; M3 show it to someone and see if the vibe lands; M4 refine into a final layout.
- **M0:** "By tomorrow, I will have 12 images from royalty-free sources dropped into a rough grid so that I can show someone and see if they get the vibe."
- **Remix prompt:** "Like a mood board but for [a fictional world you're building / an era of design you love / a feeling you can't quite describe]"
---
 
## 16. Chatbot for a Narrow Topic
A simple rule-based or AI-powered chatbot that answers questions about one specific subject — a character, a manual, a FAQ.
- **Time:** 1–2 weeks
- **Difficulty:** Intermediate
- **Skills:** JavaScript or Python; optionally an AI API (OpenAI, Gemini, Claude)
- **Hazards:** AI APIs cost money after free tiers; don't let the bot answer questions outside its scope without a fallback message
- **Goal:** Answer questions about one specific, narrow subject.
- **Non-goals:** Won't try to answer questions outside its one topic — needs a fallback message; won't be open-ended/general-purpose; won't store user conversations.
- **Milestones:** M1 write the test question set and ideal answers; M2 build the basic Q&A logic; M3 add the out-of-scope fallback; M4 test against real questions from someone else.
- **M0:** "By tomorrow, I will have 10 questions someone might ask, and the ideal answer to each, written down so that I have my test script before writing any code."
- **Remix prompt:** "Like a chatbot but for [answering questions about your school / roleplaying as a historical figure / helping someone pick a book]"
---
 
## 17. Mapping Project
Visualize something on a map — local landmarks, historical events, fictional geography, community resources, or personal travel.
- **Time:** 1–2 weeks
- **Difficulty:** Intermediate
- **Skills:** Leaflet.js or Google Maps API (or no-code: Google My Maps, Felt)
- **Hazards:** Location data for real people requires consent; API keys need to be kept private
- **Goal:** Show something meaningful on a map — real or fictional.
- **Non-goals:** Won't include real-time/live data; won't collect location data on real people without consent; won't try to cover more than one topic per map.
- **Milestones:** M1 place the first handful of pins with descriptions; M2 finalize the data source/structure; M3 build or finalize the map display; M4 add remaining pins and polish.
- **M0:** "By tomorrow, I will have 5 pins placed on a Google My Maps with a name and one sentence each so that I can see if the map tells a story yet."
- **Remix prompt:** "Like a mapping project but for [every bookstore in your city / places mentioned in a novel / spots that mean something to you]"
---
 
## 18. Font / Type Specimen Page
Design a webpage that showcases a typeface (or your own hand-lettered font), with typographic specimens and usage examples.
- **Time:** 3–5 days
- **Difficulty:** Beginner
- **Skills:** HTML/CSS, basic design sense
- **Hazards:** Font licensing — only use fonts with free or open licenses for public projects
- **Goal:** Showcase a typeface (or your own lettering) with real specimens and usage examples.
- **Non-goals:** Won't design a full font file/typeface unless that's the explicit goal; won't use a font without a free/open license if it's public; won't be a multi-page site.
- **Milestones:** M1 draw/choose the letters that prove the concept; M2 test if they feel like one family; M3 build the specimen page layout; M4 add usage examples.
- **M0:** "By tomorrow, I will have 5 letters drawn on paper and placed next to each other so that I can tell if they feel like the same family."
- **Remix prompt:** "Like a type specimen but for [a font you love / a lettering style you've practiced / a made-up alphabet for a fictional world]"
---
 
## 19. Budget / Finance Tracker
A personal tool that tracks spending in categories and shows a simple summary — no bank connections, just manual entry.
- **Time:** 3–5 days
- **Difficulty:** Beginner
- **Skills:** Google Sheets formulas OR basic JavaScript
- **Hazards:** Don't connect to real bank APIs in v1 — that's a compliance minefield
- **Goal:** Track spending by category and see a simple summary.
- **Non-goals:** Won't connect to real bank accounts/APIs; won't support multiple users/shared budgets in v1; won't do forecasting or predictions.
- **Milestones:** M1 define categories and test them against real spending; M2 build the entry interface; M3 calculate category totals; M4 add a summary view.
- **M0:** "By tomorrow, I will have a spreadsheet with my categories and last week's spending entered from memory so that I know if the categories actually fit before building anything."
- **Remix prompt:** "Like a budget tracker but for [managing a club's funds / tracking how much you spend on a hobby / logging time instead of money]"
---
 
## 20. Generative Art Piece
A program that draws patterns, shapes, or visuals procedurally — the output is different every time you run it.
- **Time:** 3–7 days
- **Difficulty:** Intermediate
- **Skills:** p5.js (JavaScript) or Processing (Java) — both have excellent beginner tutorials
- **Hazards:** None — this is a low-risk, high-creativity project
- **Goal:** Write a program that procedurally draws something different each time it runs.
- **Non-goals:** Won't require user input/interactivity unless that's the point; won't be "finished" in the usual sense — generative work is explored, not completed; won't need a backend or database.
- **Milestones:** M1 get anything drawing/moving on screen; M2 introduce the core rule or pattern; M3 add randomness/variation; M4 tune parameters until it looks right.
- **M0:** "By tomorrow, I will have changed one number and one color in the default p5.js sketch and run it so that I've made something move or draw, however small."
- **Remix prompt:** "Like generative art but inspired by [a natural pattern / a piece of music / the shape of a word]"
---
 
## 21. Recipe Converter or Cooking Helper
A tool that scales recipes, converts units, substitutes ingredients, or builds a shopping list from a weekly meal plan.
- **Time:** 3–5 days
- **Difficulty:** Beginner
- **Skills:** Basic JavaScript or Google Sheets
- **Hazards:** None for personal use; if you publish recipes, credit the original source
- **Goal:** Help someone scale, convert, or adapt a recipe.
- **Non-goals:** Won't pull recipes from copyrighted sources without credit; won't handle every unit/ingredient edge case in v1; won't include meal-planning/scheduling.
- **Milestones:** M1 do one conversion by hand and list every unit involved; M2 build the core conversion logic; M3 build the input/output interface; M4 test against a few real recipes.
- **M0:** "By tomorrow, I will have manually converted one recipe from 4 to 7 servings and listed every unit I had to handle so that I have my coding spec."
- **Remix prompt:** "Like a recipe converter but for [a specific dietary need / a cuisine you're learning / your family's handwritten recipes]"
---
 
## 22. "This Day In…" Daily Digest
A page or script that pulls interesting historical events, releases, or facts for today's date from a public API or curated dataset.
- **Time:** 1 week
- **Difficulty:** Intermediate
- **Skills:** Basic JavaScript + fetch(), or Python with requests
- **Hazards:** API rate limits — check the terms; some "This Day In History" APIs are paid
- **Goal:** Show interesting things that happened on today's date.
- **Non-goals:** Won't pull from a paid API; won't cover every possible category — pick one; won't require a database of your own in v1.
- **Milestones:** M1 collect a sample set of events by hand; M2 decide the final data source; M3 build the display template; M4 wire it to update automatically.
- **M0:** "By tomorrow, I will have manually looked up and formatted 5 events for today's date so that I have my template before writing any fetch code."
- **Remix prompt:** "Like a daily digest but for [a specific topic like space exploration / a sport / events in your country's history]"
---
 
## 23. Zine or Digital Magazine
A short (4–8 page) designed publication on a topic you care about — interviews, essays, art, or a mix.
- **Time:** 1–2 weeks
- **Difficulty:** Beginner
- **Skills:** Canva, Figma, or InDesign for layout; writing
- **Hazards:** Images need to be your own or licensed; if you interview someone, get their consent to publish
- **Goal:** Publish a short, designed collection of pieces on a topic you care about.
- **Non-goals:** Won't try to cover more than 4–8 pages in v1; won't use images you don't have rights to; won't interview anyone without consent to publish.
- **Milestones:** M1 write the table of contents; M2 draft the first piece; M3 lay out the pages; M4 finish the remaining pieces.
- **M0:** "By tomorrow, I will have a table of contents with 4–6 pieces, each with a title and one sentence, plus 200 words of the first piece, so that I know what I'm actually making."
- **Remix prompt:** "Like a zine but about [a subculture you're part of / a skill you're learning / a place that matters to you]"
---
 
## 24. Community Resource Directory
A searchable or filterable list of local resources — tutoring, free food, mental health support, after-school activities — for a specific community.
- **Time:** 2–3 weeks
- **Difficulty:** Intermediate
- **Skills:** Basic HTML/CSS/JS with a JSON data file, or Airtable + a simple embed
- **Hazards:** Information goes out of date — plan how you'll maintain it; don't collect user data without a clear policy
- **Goal:** Help people find real, verified resources for a specific need in your community.
- **Non-goals:** Won't try to cover every category of resource — pick one community/need; won't collect user data without a clear policy; won't guarantee the list stays current without a maintenance plan.
- **Milestones:** M1 find and verify the first batch of resources; M2 decide the data structure/format; M3 build the list/filter interface; M4 add the remaining resources.
- **M0:** "By tomorrow, I will have found and verified 10 real resources, with name/website/one-sentence description, in a doc so that I have version 0 of the directory."
- **Remix prompt:** "Like a resource directory but for [students at your school / new residents in your neighborhood / people learning your hobby]"
---
 
## Quick Reference: Archetypes by Time
 
**1–5 days (fastest wins)**
- Personal Habit Tracker (#1)
- Personal Portfolio Site (#4)
- Event Landing Page (#10)
- Mood Board / Aesthetic Archive (#15)
- Recipe Converter (#21)
- Font / Type Specimen Page (#18)
**1–2 weeks (solid scope)**
- Quiz Game (#2)
- Recommendation Tool (#3)
- Data Story (#5)
- Automation Script (#7)
- Study Flashcard App (#9)
- Text Adventure (#11)
- Research Write-Up + Artifact (#13)
- Tutorial / Video Series (#14)
- Chatbot (#16)
- Mapping Project (#17)
- Budget Tracker (#19)
- Generative Art (#20)
- "This Day In…" Digest (#22)
- Zine (#23)
**2–4 weeks (ambitious, scoping required)**
- Small Platformer or Puzzle Game (#6)
- Browser Extension (#8)
- Physical + Digital Hybrid (#12)
- Community Resource Directory (#24)
---
 
## Quick Reference: Archetypes by Skill Level
 
**Beginner (no prior coding experience needed)**
#1, #3 (no-code path), #4, #9 (no-code path), #10, #13, #14, #15, #18, #19 (Sheets path), #21, #23
 
**Intermediate (some coding or willingness to learn)**
#2, #5, #6, #7, #8, #11 (coded path), #16, #17, #20, #22, #24
 
**Advanced (prior coding experience helpful)**
#12
