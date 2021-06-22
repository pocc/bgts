import { Page } from 'puppeteer';
import {makeBGACookies} from './authenticate';
import {authenticatedFetch, authenticatedFetch as privilegedFetch} from './utils';
import { LoginResponse, TableCreationResponse } from '../bga';
import { tableStatus } from './noauth';
import { TableData } from '../types/table';


export class BoardGameArena {
    domain = "https://boardgamearena.com";
    cookies: string;
    rcvdCookies: string;
    loginResponse: LoginResponse;
    bgaID: number;
    username: string;
    password: string;
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

    async createTable(gameID: number): Promise<[number, TableData]> {    
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
        try {
            respJson = JSON.parse(await resp.text()) as TableCreationResponse;
        } catch (e) {
            throw 'Unable to parse JSON from Board Game Arena.' + e;
        }
        if (respJson.status === '0' && respJson.error) {
            err = "BGA gave an error on game creation:" + await resp.text();
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
        let TableID = 0;
        if (err) { throw err; }
        const tableIDStr = respJson.data.table;
        try {
            TableID = parseInt(tableIDStr, 10);
        } catch { 
            err = "Unable to parse table ID."; 
        }
        const tableResp = await tableStatus(TableID);
        return [TableID, tableResp];
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
    async acceptInvite(tableID: number): Promise<void> {
        authenticatedFetch(this.domain + `/table?table=${tableID}&acceptinvit`, this.cookies, "GET", {});
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
        return await resp.text() === `{"status":1,"data":"ok"}`;
    }

    // Get table text
    async getTableMessages(tableID: number): Promise<string[]> {
        const tableData = await tableStatus(tableID);
        const serverID = tableData.data.gameserver;
        const game_name = tableData.data.game_name;
        const url = `${this.domain}/${serverID}/${game_name}?table=${tableID}`;
        console.log(url);
        const resp = await authenticatedFetch(url, this.cookies, "GET", {});
        const respText = await resp.text();
        // 3 parts of the message: 1st capture group captures user, 2nd captures message, 3rd captures time
        const matches = respText.matchAll(/>([^>]*?)<\/span>\s*<!--PNE-->(.*?)<div class="msgtime">([^<]*)/g);
        console.log(matches);
        const messages = [];
        for (const match of matches) {
            messages.push(match[1] + match[2] + match[3]);
        }
        console.log(messages);
        return messages;
    }

    /* Logout of current session. A good idea if you do not plan on reusing cookies (they last 1 year)*/
    async logout(): Promise<void> {
        let url = this.domain + '/account/account/logout.html';
        const Params = {'dojo.preventCache': new Date().getTime()};
        url += '?' + new URLSearchParams(Params as any).toString();
        await privilegedFetch(url, this.cookies, "GET", {});
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
