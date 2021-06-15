
import { Page, Browser } from "puppeteer";
require('dotenv').config()
const puppeteer = require('puppeteer');

export async function loginPuppeteer(url: string, user: string, passwd: string,
    user_selector: string, password_selector: string, submit_selector: string): Promise<[Browser, Page, string]> {
  const browser: Browser = await puppeteer.launch({headless:false});
  const page: Page = await browser.newPage();
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
  return [browser, page, responseBody]
}