import { chromium, BrowserContext, Page } from 'playwright-core';
import * as path from 'path';
import * as fs from 'fs';

const SESSION_DIR = path.join(process.cwd(), '.session');
const CAPTCHA_IMAGE_PATH = path.join(process.cwd(), 'captcha.png');
const HTML_DUMP_PATH = path.join(process.cwd(), 'captcha_page.html');
const SOLUTION_FILE_PATH = path.join(process.cwd(), 'captcha_solution.txt');
const EDITOR_HTML_PATH = path.join(process.cwd(), 'editor_page.html');
const EDITOR_IMAGE_PATH = path.join(process.cwd(), 'editor_view.png');

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Starting Interactive Login Agent...');

    const context = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: false,
        viewport: { width: 1280, height: 720 }
    });

    try {
        const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
        await page.goto('https://nid.naver.com/nidlogin.login');
        await page.waitForTimeout(2000);

        if (!page.url().includes('nidlogin.login')) {
            console.log('Already logged in!');
        } else {
            console.log('Entering credentials...');
            await page.click('#id');
            await page.keyboard.insertText('kmg9463');
            await page.waitForTimeout(1000);
            await page.click('#pw');
            await page.keyboard.insertText('wjddhr628584*');
            await page.waitForTimeout(1000);
            await page.click('.btn_login');
            await page.waitForTimeout(5000);

            if (page.url().includes('nidlogin.login')) {
                console.log('Login likely failed or Captcha appeared.');
                const html = await page.content();
                fs.writeFileSync(HTML_DUMP_PATH, html);
                await page.screenshot({ path: CAPTCHA_IMAGE_PATH });
                console.log(`Screenshot saved to ${CAPTCHA_IMAGE_PATH}`);
                console.log('Waiting for captcha_solution.txt...');

                let solution = '';
                while (true) {
                    if (fs.existsSync(SOLUTION_FILE_PATH)) {
                        solution = fs.readFileSync(SOLUTION_FILE_PATH, 'utf8').trim();
                        fs.unlinkSync(SOLUTION_FILE_PATH);
                        break;
                    }
                    await sleep(2000);
                }

                const captchaInput = await page.$('input[placeholder*="정답"]');
                if (captchaInput) {
                    await captchaInput.click();
                    await page.keyboard.insertText(solution);
                } else {
                    await page.type('#captcha', solution).catch(() => { });
                    await page.type('#chptcha', solution).catch(() => { });
                }

                console.log('Re-entering password...');
                await page.click('#pw');
                await page.keyboard.insertText('wjddhr628584*');
                await page.waitForTimeout(1000);
                await page.click('.btn_login');
                await page.waitForTimeout(5000);
            }
        }

        if (!page.url().includes('nidlogin.login')) {
            console.log('Login Success!');
            console.log('Navigating to Editor...');
            await page.goto('https://blog.naver.com/kmg9463/postwrite');
            await page.waitForTimeout(10000);

            const editorHtml = await page.content();
            fs.writeFileSync(EDITOR_HTML_PATH, editorHtml);
            console.log(`Editor HTML saved to ${EDITOR_HTML_PATH}`);
            await page.screenshot({ path: EDITOR_IMAGE_PATH });
        } else {
            console.log('Final Login Check Failed.');
            await page.screenshot({ path: 'login_failed_final.png' });
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await context.close();
    }
}

main();
