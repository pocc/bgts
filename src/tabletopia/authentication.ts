require('dotenv').config();
const puppeteer = require('puppeteer');
import { loginPuppeteer } from "../utils";
import { Page, Browser, HTTPRequest } from 'puppeteer';

/*
It's probably possible to get this to work, but it looks like
there's a cookie that needs to be sent with the user/pass.

fetch("https://tabletopia.com/login", 
  "headers": {
    "body": "login=email&password=password",
    "method": "POST",
});

selector '#popup-profile' will show on success
*/
export async function loginTabletopia(username: string, password: string): Promise<[Browser, Page, boolean]> {
    const [browser, page, _] = await loginPuppeteer(
        "https://tabletopia.com/login",
        username,
        password,
        '[name=Login]',
        '[name=Password]',
        '.overall-login__submit');
    await page.waitForNavigation();
    const pageText = await page.content();
    // if title remains login, login has failed
    const success = !pageText.includes('Log In • Tabletopia');
    if (!success) { console.log(page.url(), "tabletopia authentication failed."); }
    return [browser, page, success];
}
