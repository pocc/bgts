import fetch from 'node-fetch';

// Login and get new http cookies. Looking at the expiry dates, cookies last for a year.
export async function makeBGACookies(username: string, password: string): Promise<[string, string]> {
    const loginUrl = 'https://boardgamearena.com/account/account/login.html';
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
    return [respText, receivedCookies];
}
