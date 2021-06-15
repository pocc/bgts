/* Board Game Arena */
import { HTTPRequest, Page, Browser } from "puppeteer";
require('dotenv').config()
import { URLSearchParams } from "url";
import { loginPuppeteer } from "../utils"
const puppeteer = require('puppeteer');


/** Return a page that has been logged into Board Game Arena
 * Manually logging into BGA (page render and redirects) takes ~2400ms
 * Directly calling login takes (this fn)                      ~600ms
 * 
 * @param browser shared browser object 
 * @param username BGA username
 * @param password BGA passwsord
 * @returns Page and response string. Response string is "" if authentication failed
*/
async function loginBGADirect(username: string, password: string): (Promise<[Browser, string]>) {
    const browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', async (interceptedRequest: HTTPRequest)  => {
        console.log("Intercepting", interceptedRequest.url())
        let postData = {
          "email": username,
          "password": password,
          "rememberme": "on", // Always remember this user with this browser
          "redirect": "join",
          "form_id": "loginform"
        };
        let postEncoded = new URLSearchParams(postData).toString();
        let data = {
            'method': 'POST',
            'postData': postEncoded,
            'headers': {
                ...interceptedRequest.headers(),
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
  
        await interceptedRequest.continue(data);  // Request modified... finish sending!
    });
  
    // Navigate, trigger the intercept, and resolve the response
    const response = await page.goto('https://boardgamearena.com/account/account/login.html');
    page.removeAllListeners('request'); // remove listeners we were using for this task.
    page.setRequestInterception(false)
    const responseJson = await response.json();
    if (responseJson['data']['success']) {
        const responseBody = await response.text();
        await page.goto('https://boardgamearena.com/community');
        await page.screenshot({"path":"screenshots/boardgamearena_direct.png"})    
        return [browser, responseBody];
    } else {
        return [browser, ""];
    }
}

/* Login with GUI. Should be 2-4x slower */
async function loginBGA() {
    const [browser, page, pagetext] = await loginPuppeteer(
        'https://en.boardgamearena.com/account',
        process.env.USER as string,
        process.env.PASSWORD as string,
        '#username_input',
        '#password_input',
        '#submit_login_button');
    await page.goto('https://boardgamearena.com/community');
    await page.waitForSelector('#community-module');
    await page.screenshot({"path":"screenshots/boardgamerena.png"});
    await browser.close();
}

(async () => {
    let user = process.env.USER as string;
    let password = process.env.PASSWORD as string;
    const [browser, pagetext] = await loginBGADirect(user, password);
    if (pagetext) {
        console.log("Authentication Successful!")
    } else {
        console.log("Authentication Failed!")
    }
    await browser.close();
})();