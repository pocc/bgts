require('dotenv').config();
import { Page, Browser } from "puppeteer";
const puppeteer = require('puppeteer');

export async function loginPuppeteer(url: string, user: string, passwd: string,
    user_selector: string, password_selector: string, submit_selector: string, waitfor_selector: string): 
    Promise<[Browser, Page, string]> {
  const browser: Browser = await puppeteer.launch({headless:false});
  const page: Page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.type(user_selector, user);
  await page.type(password_selector, passwd);
  const responseBody = await page.content();
  await Promise.all([
    page.click(submit_selector),
    page.waitForSelector(waitfor_selector),
    page.waitForNavigation()
  ])
  return [browser, page, responseBody];
}