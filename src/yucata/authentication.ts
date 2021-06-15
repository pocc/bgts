
require('dotenv').config()
import { Page } from "puppeteer";
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
async function loginYucata(): Promise<Page | null> {
    const [browser, page, pagetext] = await loginPuppeteer(
        "https://www.yucata.de/en",
        process.env.USER as string,
        process.env.PASSWORD as string,
        '#ctl00_ctl07_edtLogin',
        '#ctl00_ctl07_edtPassword',
        '#ctl00_ctl07_btnLogin');
    if (page.url() !== "https://www.yucata.de/en/AuthenticationFailed") {
        await page.screenshot({"path":"screenshots/yucata.png"});
        await browser.close()
        return page
    } else {
        console.log("Authentication failed!")
        await browser.close()
        return null
    }
}

(async () => {await loginYucata();})();