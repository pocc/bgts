require('dotenv').config();
import { Page, Browser, HTTPRequest, HTTPResponse } from 'puppeteer';
const puppeteer = require('puppeteer');

export async function loginPuppeteer(url: string, user: string, passwd: string,
    user_selector: string, password_selector: string, submit_selector: string): 
    Promise<[Browser, Page, HTTPResponse]> {
  const browser: Browser = await puppeteer.launch({headless:false});
  const [page] = await browser.pages();  // Use existing default page
  const response = await page.goto(url, { waitUntil: 'networkidle0' });
  await page.type(user_selector, user);
  await page.type(password_selector, passwd);
  await page.click(submit_selector);
  return [browser, page, response];
}