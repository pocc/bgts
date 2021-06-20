export interface BGANums {
    [s: string]: number;
}

export interface oneDeepJSON {
    [s: string]: string
}

export type selector = `#${string}`
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE"
export type BGAResponse = {
    "data": JSON
    "status": number | "0" // "0" is a string, but success is a 1 for some reason
    "success": boolean
    "error": string
}