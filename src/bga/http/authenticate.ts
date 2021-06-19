const fetch = require('node-fetch');

// Login and get new http cookies. Looking at the expiry dates, cookies last for a year.
export async function makeBGACookies(username: string, password: string): Promise<string> {
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
    const receivedCookies = resp.headers.get('set-cookie');
    // This regex takes out the expire, path, Max-Age, domain components or deleted cookies
    // from a received set-cookie in the header that should not be sent as part of the cookie in the request 
    const sendableCookies = receivedCookies.replace(/((expires|path|Max-Age)=[^;]*|\S+=deleted|domain=[^,]*)[;,]? ?/g, '');
    return sendableCookies;
}
