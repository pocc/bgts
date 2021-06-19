const fetch = require('node-fetch');

export async function authenticatedFetch(url: string, cookies: string, method: string, headers: Object): Promise<Response> {
    const params = {
        "headers": {
            "accept": "text/html",
            "cookie": cookies
        },
        "method": method
    }
    for (const hKey of Object.keys(headers)) {
        params[hKey] = headers[hKey]
    }
    const resp = await fetch(url, params);
    return resp;
}