/* Board Game Arena */
require('dotenv').config()
import { URLSearchParams } from "url";
import { loginPuppeteer } from "../utils"
const puppeteer = require('puppeteer');
import { Page, Browser, HTTPRequest, HTTPResponse } from 'puppeteer';


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
    if (!response) {
        console.log("Error fetching", logonUrl)
        return [browser, page, ""]
    }
    page.removeAllListeners('request'); // remove listeners we were using for this task.
    await page.setRequestInterception(false);
    const respJSON = await response.json();
    // status 0 is a problem with too many attempts; success is auth success
    const success = respJSON.status === 1 && respJSON.data && respJSON.data.success
    // Redirect from JSON blob
    let responseText = "";
    if (success) {
        responseText = await response.text();
    }
    return [browser, page, responseText];
}

/* Login with GUI. Should be 2-4x slower 

selector '#login-status-wrap' will show on success
*/
export async function loginBGA(username: string, password: string): Promise<[Browser, Page, boolean]> {
    const [browser, page, _] = await loginPuppeteer(
        'https://boardgamearena.com/account?redirect=%2F',
        username,
        password,
        '#username_input',
        '#password_input',
        '#submit_login_button');
    try { // faster but can fail if page context is lost
        const loginPage = 'https://en.boardgamearena.com/account/account/login.html'
        const response = await page.waitForResponse(loginPage);
        const respJson = await response.json()
        let success = false;
        console.log(respJson)
        // status 0 is a problem with too many attempts; success is auth success
        if (respJson.status === 1 && respJson.data && respJson.data.success) success = true;
        return [browser, page, success];
    } catch {
        await Promise.race([
            page.waitForSelector('#login-status-wrap'), // on logged in page
            page.waitForSelector('#loginform') // on login page
        ]) 
        const pageText = await page.content();
        // not_logged_user is class on <body> on the login page
        const success = !pageText.includes('not_logged_user');
        if (!success) console.log(page.url(), "board game arena authentication failed.")
        return [browser, page, success]

    }
}
