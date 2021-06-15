require('dotenv').config();
const puppeteer = require('puppeteer');
import { loginPuppeteer } from "../utils";
import { Page, Browser, HTTPRequest } from 'puppeteer';

/*
It's probably possible to think of things.

fetch("https://tabletopia.com/login", 
  "headers": {
    "body": "login=email&password=password",
    "method": "POST",
});
*/
async function loginTabletopia(): Promise<Page | null> {
    const [browser, page, pagetext] = await loginPuppeteer(
        "https://tabletopia.com/login",
        process.env.EMAIL as string,
        process.env.PASSWORD as string,
        '[name=Login]',
        '[name=Password]',
        '.overall-login__submit');
    if (pagetext) {
        await page.screenshot({"path":"screenshots/tabletopia.png"});
        await browser.close();
        return page
    } else {
        console.log("Authentication failed!")
        await browser.close();
        return null
    }
}

(async () => {
    await loginTabletopia();
})();