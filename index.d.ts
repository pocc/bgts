export interface BGANums {
    [s: string]: number;
}

export interface oneDeepJSON {
    [s: string]: string
}

export interface twoDeepJSON {
    [s: string]: string | {[s: string]: string}
}

export type OneDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export interface Headers { // Can't seem to find node fetch's version
    headers: string | {
        "accept": string;
        "accept-language": string;
        "cache-control": string;
        "pragma": string;
        "sec-ch-ua": string;
        "sec-ch-ua-mobile": string;
        "sec-fetch-dest": string;
        "sec-fetch-mode": string;
        "sec-fetch-site": string;
        "sec-fetch-user": string;
        "upgrade-insecure-requests": string;
        "cookie": string;
    },
    referrer: string;
    referrerPolicy: string;
    body?: string;
    method: string;
    mode: string;
}


export type selector = `#${string}`
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE"