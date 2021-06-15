"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginPuppeteer = void 0;
require('dotenv').config();
const puppeteer = require('puppeteer');
async function loginPuppeteer(url, user, passwd, user_selector, password_selector, submit_selector) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.type(user_selector, user);
    await page.type(password_selector, passwd);
    await Promise.all([
        await page.click(submit_selector),
        await page.waitForNavigation({ timeout: 5000 }).catch((e) => {
            console.log("Authentication failed!");
            return [browser, page, ""];
        }),
    ]);
    const responseBody = await page.content();
    return [browser, page, responseBody];
}
exports.loginPuppeteer = loginPuppeteer;
