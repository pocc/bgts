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
*/
export async function loginTabletopia(username: string, password: string): Promise<[Browser, Page, boolean]> {
    const [browser, page, pagetext] = await loginPuppeteer(
        "https://tabletopia.com/login",
        username,
        password,
        '[name=Login]',
        '[name=Password]',
        '.overall-login__submit',
        '#popup-profile'); // This should only be seen after login
    const success = pagetext === ""
    return [browser, page, success]
}
