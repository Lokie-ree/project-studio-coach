import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_DIR;
mkdirSync(OUT, { recursive: true });
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${String(e).slice(0, 300)}`));

// 1. Join
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await shot(page, "01-join");
await page.fill("#name", "Playwright Kid");
await page.click("text=Come on in");

// 2. Onboarding
await page.waitForSelector("text=Three things", { timeout: 10000 });
await shot(page, "02-onboarding");
await page.click("text=Mostly just club time");
await page.click("text=Got it — let's go");

// 3. Home empty state
await page.waitForSelector("text=What do you want to make?", { timeout: 10000 });
await shot(page, "03-home");
await page.click("text=Start something");

// 4. Spark
await page.waitForSelector("textarea", { timeout: 15000 });
await shot(page, "04-spark");
await page.fill("textarea", "a multiplayer battle royale but underwater in a sunken city");
await page.click("text=That's the idea");

// 5. Conversation view appears (coach reply will fail without a valid key — that's a known gap)
await page.waitForSelector("text=you", { timeout: 15000 });
await page.waitForTimeout(2500);
await shot(page, "05-project-spark-sent");

// 6. Advance to Expand, see the menu (pure DB, no LLM needed)
await page.click("text=Spark is done");
await page.waitForSelector("text=Shapes other people", { timeout: 10000 });
await page.waitForTimeout(800);
await shot(page, "06-expand-menu");

// Withholding check in the DOM: no goal/nonGoal/M0 text should be rendered
const html = await page.content();
const leaks = ["Won't support multiple habits", "By tomorrow, I will have a spreadsheet", "M1 log 3 days"].filter((s) => html.includes(s));
console.log("WITHHOLDING-DOM-LEAKS:", leaks.length === 0 ? "none" : leaks);

// 7. Pick an archetype card
await page.click(".arch-card >> nth=0");
await page.waitForTimeout(600);
await shot(page, "07-expand-picked");

// 8. Teacher screen
await page.goto("http://localhost:5173/#/teacher", { waitUntil: "networkidle" });
await page.waitForSelector("text=Review queue", { timeout: 10000 });
await page.waitForTimeout(800);
await shot(page, "08-teacher");

// 9. Mobile
await page.setViewportSize({ width: 360, height: 780 });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await shot(page, "09-mobile-home");

console.log("CONSOLE-ISSUES:", errors.length);
for (const e of errors.slice(0, 12)) console.log(" ", e);
await browser.close();
console.log("VERIFY-DONE");
