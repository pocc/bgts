import fetch from 'node-fetch';

// Login and get new http cookies. Looking at the expiry dates, cookies last for a year.
export async function makeBGACookies(username: string, password: string): Promise<[string, string]> {
    const loginUrl = 'https://boardgamearena.com/account/account/login.html';
    const temp = 5;
    console.log(temp);
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
        'body': postEncoded,
        'credentials': 'include',
        'headers': {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    const resp = await fetch(loginUrl, data);
    const respText = await resp.text();
    const receivedCookies = resp.headers.get('set-cookie');
    if (!receivedCookies) { // cookies will be null with no cookies
        console.log("No cookies found when trying to make BGA cookies.");
        return ["No cookies found", ""];
    }
    // This regex takes out the expire, path, Max-Age, domain components or deleted cookies
    // from a received set-cookie in the header that should not be sent as part of the cookie in the request 
    const sendableCookies = receivedCookies.replace(/((expires|path|Max-Age)=[^;]*|\S+=deleted|domain=[^,]*)[;,]? ?/g, '');
    return [respText, sendableCookies];
}
