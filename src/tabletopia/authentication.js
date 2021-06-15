"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const puppeteer = require('puppeteer');
const utils_1 = require("../utils");
/*
It's probably possible to think of things.

fetch("https://tabletopia.com/login",
  "headers": {
    "body": "login=email&password=password",
    "method": "POST",
});
*/
async function loginTabletopia() {
    const [browser, page, pagetext] = await utils_1.loginPuppeteer("https://tabletopia.com/login", process.env.EMAIL, process.env.PASSWORD, '[name=Login]', '[name=Password]', '.overall-login__submit');
    if (pagetext) {
        await page.screenshot({ "path": "screenshots/tabletopia.png" });
        await browser.close();
        return page;
    }
    else {
        console.log("Authentication failed!");
        await browser.close();
        return null;
    }
}
(async () => {
    await loginTabletopia();
})();
