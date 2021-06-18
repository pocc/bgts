/* Board Game Arena */
require('dotenv').config()
import { URLSearchParams } from "url";
import { loginPuppeteer } from "../utils"
const puppeteer = require('puppeteer');
import { Page, Browser } from 'puppeteer';


/** Return a page that has been logged into Board Game Arena
 * Manually logging into BGA (page render and redirects) takes ~2400ms
 * Directly calling login takes (this fn)                      ~600ms
 *
 * @param browser shared browser object
 * @param username BGA username
 * @param password BGA passwsord
 * @returns Page and response string. Response string is "" if authentication failed
*/
export async function loginBGADirect(username: string, password: string): (Promise<[Browser, Page, string]>) {
    const browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    await page.setRequestInterception(true);

    page.once('request', async (interceptedRequest) => {
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
        } as any;

        await interceptedRequest.continue(data);  // Request modified... finish sending!
    });

    // Navigate, trigger the intercept, and resolve the response
    const logonUrl = 'https://boardgamearena.com/account/account/login.html'
    const response = await page.goto(logonUrl);
    if (response === null) {
        console.log("Error fetching", logonUrl)
        return [browser, page, ""]
    }
    page.removeAllListeners('request'); // remove listeners we were using for this task.
    page.setRequestInterception(false)
    const responseJson = await response.json() as JSON;
    const success = responseJson.hasOwnProperty('data') && responseJson['data']['success']
    // Redirect from JSON blob
    let responseText = "";
    if (success) {
        responseText = await response.text();
        await page.goto('https://boardgamearena.com/');
    }
    return [browser, page, responseText];
}

/* Login with GUI. Should be 2-4x slower */
export async function loginBGA(username: string, password: string): Promise<[Browser, Page, string]> {
    const [browser, page, pagetext] = await loginPuppeteer(
        'https://boardgamearena.com/account?redirect=%2F',
        username,
        password,
        '#username_input',
        '#password_input',
        '#submit_login_button',
        '#login-status-wrap');  // signifies login is successful
    return [browser, page, pagetext];
}
