
require('dotenv').config()
import { Page, Browser } from "puppeteer";
import { loginPuppeteer } from "../utils"

/* This function will login to Yucata. Using the GUI avoids using NTLM authentication, which is more time
than it's worth.

Yucata uses NTLM authentication, which works in python with this
    import requests
    from requests_ntlm import HttpNtlmAuth

    # user and password need to be changed in this line
    requests.get("http://www.yucata.de/",auth=HttpNtlmAuth('domain\\user','password'))

This will produce an ASP.net_sessionID value in headers as well as a stackify.rum value 
which is important in authentication.
But I haven't figured out how to login with nodejs. (Using node library httpntlm produces a 401).
Asked this on https://stackoverflow.com/questions/67978605
*/
export async function loginYucata(username: string, password: string): Promise<[Browser, Page, boolean]> {
    const [browser, page, pagetext] = await loginPuppeteer(
        "https://www.yucata.de/en",
        username,
        password,
        '#ctl00_ctl07_edtLogin',
        '#ctl00_ctl07_edtPassword',
        '#ctl00_ctl07_btnLogin',
        '#PlayerStatusContainer'); // Should only be seen after login
    const success = page.url() === "https://www.yucata.de/en/AuthenticationFailed";
    if (!success) console.log("Authentication failed!")
    return [browser, page, success]
}

/* This logs in directly by getting cookies from yucata.de and then logging in with them. */
export async function loginYucataDirect(username: string, password: string): Promise<Page | null> {
    const resp = await fetch("https://www.yucata.de/", {
      "method": "GET"
    })
    const cookies = resp.headers.get('set-cookie')
    return null;
}
