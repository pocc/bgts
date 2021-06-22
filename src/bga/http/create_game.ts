import { Page } from 'puppeteer';
import {puppeteerCookie} from "../../../index"
import {makeBGACookies} from './authenticate';
import {authenticatedFetch, authenticatedFetch as privilegedFetch} from './utils';
import { LoginResponse, TableCreationResp, messageResponse, gameRankings } from '../bga';
import { tableStatus } from './noauth';
import { Table, TableData } from '../types/table';


export class BoardGameArena {
    domain = "https://boardgamearena.com";
    cookies: string;
    rcvdCookies: string;
    loginResponse: LoginResponse;
    bgaID: number;
    username: string;
    password: string;
    successResp: string; // The expected response for many requests
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
    async instantiate(): Promise<void> { // no async constructor
        const [respText, receivedCookies] = await makeBGACookies(this.username, this.password);
        this.loginResponse = JSON.parse(respText) as LoginResponse;
        this.rcvdCookies = receivedCookies;
        // This regex takes out the expire, path, Max-Age, domain components or deleted cookies
        // from a received set-cookie in the header that should not be sent as part of the cookie in the request 
        const sendableCookies = receivedCookies.replace(/((expires|path|Max-Age)=[^;]*|\S+=deleted|domain=[^,]*)[;,]? ?/g, '');
        this.cookies = sendableCookies;
    }

    /**
     * This function will allow you to join a table, if possible
     * Sample URL: https://boardgamearena.com/table/table/joingame.html?table=181348399&dojo.preventCache=1524273004043
     * 
     * Sample good response: {"status":1,"data":"ok"}
     * Sample bad response: {"status":"0","error":"You have...","expected":1,"code":100}
     */    
    async joinTable(tableID: string): Promise<[boolean, string]> {
        const url = this.domain + `/table/table/joingame.html?table=${tableID}`;
        const resp = await privilegedFetch(url, this.cookies, "GET", {});
        const text = await resp.text();
        try {
           const respJson = JSON.parse(text); 
            const success = respJson.hasOwnProperty('status') && respJson.status === 1;    
            return [success, text];
        } catch { // If the response wasn't parseable  
            return [false, `When attempting to join table ${tableID} at ${url}, Unable to parse JSON from ${text}`];
        }
    }

    async createTable(gameID: number): Promise<[string, TableData]> {    
        let url = this.domain + '/table/table/createnew.html';
        const params = {
            'game': gameID,
            'forceManual': 'true',
            'is_meeting': 'false',
            'dojo.preventCache': new Date().getTime()
        };
        url += '?' + new URLSearchParams(params as any).toString();
        const resp = await privilegedFetch(url, this.cookies, "GET", {});
        let respJson;
        let err = '';
        const respText = resp.text();
        try {
            respJson = JSON.parse(await respText) as TableCreationResp;
        } catch (e) {
            throw 'Unable to parse JSON from Board Game Arena.' + e;
        }
        if (respJson.status === '0' && respJson.error) {
            err = "BGA gave an error on game creation."
            if (err.includes("You have no access to this game")) {
                err = " This means that your game ID is wrong."
            }
            err += await respText;
        }
        if (err.includes('You have a game in progress')) {
            const matches = /^[\w !]*)[^\/]*([^\"]*)/g.exec(err);
            const errorPart = 'You cannot create another realtime game while you have one in progress. ';
            if (matches === null || matches.length < 3) {
                err = errorPart + "This bot encountered another error while identifying which game this was.";
            } else {
                err = errorPart + matches[1] + 'Quit this game first:' + this.domain + matches[2];
            }
        }
        if (err) { throw err; }
        const tableIDStr = respJson.data.table;
        const tableResp = await tableStatus(tableIDStr);
        return [tableIDStr, tableResp];
    }
    
    /** This function returns the only real time table (you are limited to one)
     * @returns The ID of the table or 0 if one is not found
     */
    async getRealtimeTable(): Promise<number> {
        const url = this.domain + '/player';
        const resp = await privilegedFetch(url, this.cookies, "GET", {});
        const respText = await resp.text();
        // Some version of "You are playing" or "Playing now at:"
        const matches = /[Pp]laying[^<]*<a href=\"\/table\?table=(\d+)/g.exec(respText);
        if (matches === null || matches.length < 2) {
            return 0;
        }
        const tableIDStr = matches[1];
        const TableID = parseInt(tableIDStr, 10); // No need to trycatch this parse, because it matches number regex
        return TableID;
    }

    /*  Quit all realtime tables for the given table ID */
    async quitTable(tableID: number): Promise<boolean> {
        // logger.debug('Quitting table ' + table_id);
        let quitURL = this.domain + '/table/table/quitgame.html';
        const params = {
            'table': tableID,
            'neutralized': 'true',
            's': 'table_quitgame',
            'dojo.preventCache': new Date().getTime(),
        };
        quitURL += '?' + new URLSearchParams(params as any).toString();
        await privilegedFetch(quitURL, this.cookies, "GET", {});
        return true;
    }

    /* Find and quit all realtime tables */
    async quitRealtimeTables(): Promise<boolean> {
        const tableID = await this.getRealtimeTable();
        if (tableID === 0) { return false; }
        return this.quitTable(tableID);
    }
    
    // Accept an invite to a game
    async acceptInvite(tableID: number): Promise<boolean> {
        const resp = await authenticatedFetch(this.domain + `/table?table=${tableID}&acceptinvit`, this.cookies, "GET", {});
        return await resp.text() === this.successResp;
    }

    // WORK IN PROGRESS DOES NOT WORK
    // Wait for the required number of players to join and then hit accept
    async waitForPlayers(tableID: string, minPlayerCount: number): Promise<boolean> {
        let resp = await privilegedFetch(this.domain + `/table?table=${tableID}`, this.cookies, "GET", {})
        const countPlayers = (respText: string) => {
            let playerCt = 1;
            const results = respText.matchAll(/"active_player whiteblock "/g) as any
            const results2 = /"active_player whiteblock "/g.exec(respText) as any
            if (results !== null && results2 !== null) console.log(results[1], results[2], results2[1], results2[2])
            // <a class="bgabutton bgabutton_always_big bgabutton_blue" id="ags_start_game_accept" href="#"><i class="fa fa-check"></i> <span>Accept</span></a>
            else console.log('couldnt find it')
            return playerCt
        }
        let respText = await resp.text();
        let numPlayers = countPlayers(respText);
        while (numPlayers < minPlayerCount) {
            resp = await new Promise((resolve) => {
                setTimeout(async () => {
                    resolve( await privilegedFetch(this.domain + `/table?table=${tableID}`, this.cookies, "GET", {}));
                }, 1000);
            });
            respText = await resp.text();
            numPlayers = countPlayers(respText);
        }
        // Should be able to join the game if the number of players is good. Returns success/fail
        return this.startGame(tableID)
    }

    // Refuse to play a game that everyone has agreed to play
    async refuseGame(tableID: number): Promise<boolean> {
        const params = `/table/table/refuseGameStart.html?table=${tableID}&dojo.preventCache=${new Date().getTime()}`
        const resp = await authenticatedFetch(this.domain + params, this.cookies, "GET", {});
        return await resp.text() === this.successResp;
    }

    // Message a table. Expected response is `{"status":1,"data":"ok"}`. Returns success/failure
    async messageTable(tableID: number, message: string): Promise<boolean> {
        const params = {
            table: tableID,
            msg: message,
            'dojo.preventCache': new Date().getTime(),
        };
        const url = this.domain + `/table/table/say.html?` + new URLSearchParams(params as any).toString();
        const resp = await authenticatedFetch(url, this.cookies, "POST", {});
        return await resp.text() === this.successResp;
    }

    async getTableMessages(tableID: string): Promise<messageResponse> {
        const baseUrl = this.domain + "/table/table/chatHistory.html"
        const paramStr = `?type=table&id=${tableID}&table=${tableID}&dojo.preventCache=${new Date().getTime()}`
        const resp = await privilegedFetch(baseUrl + paramStr, this.cookies, "GET", {});
        const text = await resp.text();
        try {
            return await JSON.parse(text) as messageResponse
        } catch (e) {
            throw "Problem parsing text to JSON. Received text\n" + text;
        }
    }

    // If you are game admin and want to start the game
    async startGame(tableID: string): Promise<boolean> {
        let url = this.domain + `/table/table/startgame.html`
        url += `?table=${tableID}&autostart=true&dojo.preventCache=${new Date().getTime()}`
        const resp = await authenticatedFetch(url, this.cookies, "GET", {})
        return await resp.text() === this.successResp;
    }

    // If someone else is game admin and has started the game
    async acceptGame(tableID: string): Promise<boolean> {
        let url = this.domain + `/table/table/acceptGameStart`
        url += `?table=${tableID}&dojo.preventCache=${new Date().getTime()}`
        const resp = await authenticatedFetch(url, this.cookies, "GET", {})
        return await resp.text() === this.successResp;
    }

    // Gets the top players for a game, including the champion.
    async getRankings(gameID: number): Promise<gameRankings> {
        let url = this.domain + `/gamepanel/gamepanel/getRanking.html`
        // Add this in before dojo if it's an issue &table=${tableID}
        url += `?game=${gameID}&start=0&mode=arena&dojo.preventCache=${new Date().getTime()}`
        const resp = await authenticatedFetch(url, this.cookies, "GET", {})
        const text = await resp.text();
        try {
            return await JSON.parse(text) as gameRankings
        } catch (e) {
            throw "Problem parsing text to JSON. Received text\n" + text;
        }
    }

    async openTable(tableID: number): Promise<boolean> {
        let url = this.domain + `/table/table/openTableNow.html`
        url += `?table=${tableID}&dojo.preventCache=${new Date().getTime()}`
        const resp = await authenticatedFetch(url, this.cookies, "GET", {})
        return await resp.text() === this.successResp;
    }

    /* Logout of current session. A good idea if you do not plan on reusing cookies (they last 1 year)*/
    async logout(): Promise<void> {
        let url = this.domain + '/account/account/logout.html';
        const Params = {'dojo.preventCache': new Date().getTime()};
        url += '?' + new URLSearchParams(Params as any).toString();
        await privilegedFetch(url, this.cookies, "GET", {});
    }

    // Convert cookies from a string to a ...[JSON] that can be set by Puppeteer
    // https://pptr.dev/#?product=Puppeteer&version=v10.0.0&show=api-pagesetcookiecookies
    async generateCookies(): Promise<puppeteerCookie[]> {
        let cookieList = this.cookies.split('; ');
        cookieList = cookieList.filter(c => c.length > 0)
        let cookies: puppeteerCookie[] = new Array(cookieList.length);
        for (let i=0; i < cookieList.length; i++) {
            const [name, value] = cookieList[i].split('=')
            cookies[i] = {
                name: name,
                value: value,
                path: "/",
                domain: "boardgamearena.com",
                url: "https://boardgamearena.com",
                sameSite: "Strict",
                expires: -1,
                size: name.length + value.length,
                httpOnly: false,
                secure: false,
                session: true,
                sameParty: false,
                sourceScheme: 'Secure',
                sourcePort: 443
            } as puppeteerCookie
        }
        return cookies;
    }

    async findGameNameByPart(gameNamePart: string): Promise<void> {
        console.log("One day I will be a real function!");
    /* 
        /* Create a table and return its url. 201,0 is to set to normal mode.
        Partial game names are ok, like race for raceforthegalaxy.
        Returns (table id (int), error string (str)) */
        // Try to close any logged-in session gracefully
        /*
        lower_game_name = re.sub(r'[^a-z0-9]', '', game_name_part.lower());
        await self.quit_table();
        await self.quit_playing_with_friends();
        games, err_msg = await get_game_list();
        if (len(err_msg) > 0) {
            return -1, err_msg;
        }
        let lower_games = {};
        for (game in games) {
            lower_name = re.sub(r'[^a-z0-9]', '', game.lower());
        }
            lower_games[lower_name] = games[game];
        // If name is unique like "race" for "raceforthegalaxy", use that
    let games_found = [];
    let game_name = '';
    for (game_i in list(lower_games.keys())) {
        if (game_i == lower_game_name:  // if there's an exact match, take it!
            game_name = lower_game_name;
        } else if (game_i.startswith(lower_game_name) {
            games_found.push(game_i);
        }
    if (len(game_name) == 0) {
        if (len(games_found) == 0) {
            err = (;
                f'`{lower_game_name}` is not available on BGA. Check your spelling ';
                f'(capitalization and special characters do not matter).';
            );
        }
            return -1, err;
    }
        } else if (len(games_found) > 1) {
            err = f'`{lower_game_name}` matches [{','.join(games_found)}]. Use more letters to match.';
            return -1, err;
        game_name = games_found[0];
    game_id = lower_games[game_name];
        */
    }
}
