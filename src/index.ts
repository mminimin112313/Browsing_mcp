import { chromium, BrowserContext, Page } from 'playwright-core';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BrowseOptions {
    headless?: boolean;
    executablePath?: string;
}

interface BrowseResult {
    ok: boolean;
    url?: string;
    title?: string;
    content?: string;
    error?: string;
    screenshot?: string;
}

let context: BrowserContext | null = null;
let page: Page | null = null;

const SESSION_DIR = path.join(process.cwd(), '.session');

async function ensureBrowser(opts: BrowseOptions = {}): Promise<Page> {
    if (page && !page.isClosed()) return page;

    context = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: opts.headless ?? false,
        executablePath: opts.executablePath,
        viewport: { width: 1280, height: 720 }
    });

    const pages = context.pages();
    page = pages.length > 0 ? pages[0] : await context.newPage();
    return page;
}

async function closeBrowser(): Promise<void> {
    if (context) {
        await context.close().catch(() => { });
        context = null;
        page = null;
    }
}

export async function open(url: string, opts: BrowseOptions = {}): Promise<BrowseResult> {
    try {
        const p = await ensureBrowser(opts);
        await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        return {
            ok: true,
            url: p.url(),
            title: await p.title(),
        };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export async function snapshot(): Promise<BrowseResult> {
    try {
        if (!page || page.isClosed()) {
            return { ok: false, error: 'No page open. Call open() first.' };
        }
        const content = await page.content();
        const title = await page.title();
        return {
            ok: true,
            url: page.url(),
            title,
            content: content.slice(0, 50000), // Limit to 50k chars
        };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export async function screenshot(path?: string): Promise<BrowseResult> {
    try {
        if (!page || page.isClosed()) {
            return { ok: false, error: 'No page open. Call open() first.' };
        }
        const screenshotPath = path || `screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        return {
            ok: true,
            url: page.url(),
            screenshot: screenshotPath,
        };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveMouseHumanlike(page: Page, targetX: number, targetY: number) {
    const mouse = page.mouse;
    // Current mouse position is not directly available in Playwright without tracking.
    // We'll assume a starting point or just move relative if we had a state.
    // For simplicity, we'll move from a random offset if it's the first move.

    // Get current viewport size to stay within bounds
    const viewport = page.viewportSize() || { width: 1280, height: 720 };

    // Use a fixed start if we don't know it, or random near top-left
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;

    const steps = 20 + Math.floor(Math.random() * 10);

    // Control points for Bezier curve
    const cp1x = startX + (targetX - startX) * Math.random();
    const cp1y = startY + (targetY - startY) * Math.random();
    const cp2x = startX + (targetX - startX) * Math.random();
    const cp2y = startY + (targetY - startY) * Math.random();

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.pow(1 - t, 3) * startX +
            3 * Math.pow(1 - t, 2) * t * cp1x +
            3 * (1 - t) * Math.pow(t, 2) * cp2x +
            Math.pow(t, 3) * targetX;
        const y = Math.pow(1 - t, 3) * startY +
            3 * Math.pow(1 - t, 2) * t * cp1y +
            3 * (1 - t) * Math.pow(t, 2) * cp2y +
            Math.pow(t, 3) * targetY;

        // Add tiny jitter
        const jitterX = (Math.random() - 0.5) * 2;
        const jitterY = (Math.random() - 0.5) * 2;

        await mouse.move(x + jitterX, y + jitterY);
        if (i % 5 === 0) await sleep(10 + Math.random() * 20);
    }
}

export async function click(selector: string): Promise<BrowseResult> {
    try {
        if (!page || page.isClosed()) {
            return { ok: false, error: 'No page open. Call open() first.' };
        }

        const element = await page.waitForSelector(selector, { timeout: 10000 });
        if (!element) return { ok: false, error: `Element not found: ${selector}` };

        const box = await element.boundingBox();
        if (!box) return { ok: false, error: `Element not visible: ${selector}` };

        // Move mouse to center of element with human-like path
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        await moveMouseHumanlike(page, centerX, centerY);
        await sleep(100 + Math.random() * 200);

        await page.click(selector, { timeout: 10000 });
        return { ok: true, url: page.url() };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export async function type(selector: string, text: string): Promise<BrowseResult> {
    try {
        if (!page || page.isClosed()) {
            return { ok: false, error: 'No page open. Call open() first.' };
        }

        const element = await page.waitForSelector(selector, { timeout: 10000 });
        if (!element) return { ok: false, error: `Element not found: ${selector}` };

        const box = await element.boundingBox();
        if (box) {
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            await moveMouseHumanlike(page, centerX, centerY);
        }

        await sleep(100 + Math.random() * 200);
        await page.click(selector); // Focus input
        await sleep(100 + Math.random() * 200);

        // Use insertText to simulate copy-paste
        await page.keyboard.insertText(text);

        return { ok: true, url: page.url() };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export async function getText(selector: string): Promise<BrowseResult> {
    try {
        if (!page || page.isClosed()) {
            return { ok: false, error: 'No page open. Call open() first.' };
        }
        const element = await page.$(selector);
        if (!element) {
            return { ok: false, error: `Element not found: ${selector}` };
        }
        const text = await element.innerText();
        return { ok: true, content: text };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

export async function close(): Promise<BrowseResult> {
    await closeBrowser();
    return { ok: true };
}

async function executeBatch(commands: any[]): Promise<BrowseResult> {
    const results: BrowseResult[] = [];
    for (const [cmd, ...cmdArgs] of commands) {
        let res: BrowseResult;
        switch (cmd) {
            case 'wait':
                await sleep(parseInt(cmdArgs[0] || '1000'));
                res = { ok: true, url: page ? page.url() : '' };
                break;
            case 'open': res = await open(cmdArgs[0]); break;
            case 'snapshot': res = await snapshot(); break;
            case 'screenshot': res = await screenshot(cmdArgs[0]); break;
            case 'click': res = await click(cmdArgs[0]); break;
            case 'type': res = await type(cmdArgs[0], cmdArgs.slice(1).join(' ')); break;
            case 'getText': res = await getText(cmdArgs[0]); break;
            default: res = { ok: false, error: `Unknown batch command: ${cmd}` };
        }
        results.push(res);
        if (!res.ok) break;
    }
    return { ok: true, content: JSON.stringify(results) } as any;
}

// CLI Entry Point
async function main() {
    const args = process.argv.slice(2);
    const action = args[0];

    if (!action || action === '--help' || action === '-h') {
        console.log(`
Browsing Skill CLI

Usage:
  npm run browse open <url>
  npm run browse snapshot
  npm run browse screenshot [path]
  npm run browse click <selector>
  npm run browse type <selector> <text>
  npm run browse getText <selector>
  npm run browse close
`);
        process.exit(0);
    }

    let result: BrowseResult;

    switch (action) {
        case 'run':
            const commands = JSON.parse(args[1] || '[]');
            result = await executeBatch(commands);
            break;
        case 'run-file':
            const fileContent = fs.readFileSync(args[1], 'utf8');
            const fileCommands = JSON.parse(fileContent);
            result = await executeBatch(fileCommands);
            break;
        case 'wait':
            await ensureBrowser();
            await sleep(parseInt(args[1] || '1000'));
            result = { ok: true, url: page ? page.url() : '' };
            break;
        case 'open':
            result = await open(args[1]);
            break;
        case 'snapshot':
            result = await snapshot();
            break;
        case 'screenshot':
            result = await screenshot(args[1]);
            break;
        case 'click':
            result = await click(args[1]);
            break;
        case 'type':
            result = await type(args[1], args.slice(2).join(' '));
            break;
        case 'getText':
            result = await getText(args[1]);
            break;
        case 'close':
            result = await close();
            break;
        default:
            console.error(`Unknown action: ${action}`);
            process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));

    // Save result to file for reliable reading
    fs.writeFileSync(path.join(__dirname, '..', 'last_result.json'), JSON.stringify(result, null, 2));

    // Auto-close browser after single command
    await closeBrowser();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
