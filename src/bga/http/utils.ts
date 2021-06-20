import { HttpMethod, Headers, twoDeepJSON } from '../../../index';

const fetch = require('node-fetch');

export async function authenticatedFetch(url: string, cookies: string, method: HttpMethod, headers: twoDeepJSON): Promise<Response> {
    const Params: twoDeepJSON = {
        "headers": {
            "accept": "text/html",
            "cookie": cookies
        },
        "method": method
    };
    for (const hKey of Object.keys(headers)) {
        Params[hKey] = headers[hKey];
    }
    const resp = await fetch(url, Params);
    return resp;
}