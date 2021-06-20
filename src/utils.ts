require('dotenv').config();
import { Page, Browser, HTTPRequest, HTTPResponse } from 'puppeteer';
const puppeteer = require('puppeteer');

export async function loginPuppeteer(url: string, user: string, passwd: string,
    userSelector: string, passwordSelector: string, submitSelector: string): 
    Promise<[Browser, Page, HTTPResponse]> {
  const browser: Browser = await puppeteer.launch({headless:false});
  const [page] = await browser.pages();  // Use existing default page
  const response = await page.goto(url, { waitUntil: 'networkidle0' });
  await page.type(userSelector, user);
  await page.type(passwordSelector, passwd);
  await page.click(submitSelector);
  return [browser, page, response];
}