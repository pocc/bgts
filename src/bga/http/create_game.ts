import { Page } from 'puppeteer';
import {makeBGACookies} from './authenticate'
import {authenticatedFetch} from './utils'

const username = process.env.USER as string;
const password = process.env.PASSWORD as string;

export class BoardGameArena {
    domain = "https://boardgamearena.com";
    cookies: string;
    constructor() {
        makeBGACookies(username, password).then((cookies) => this.cookies = cookies)
    }

    /**
     * This function will allow you to join a table, if possible
     * Sample URL: https://boardgamearena.com/table/table/joingame.html?table=181348399&dojo.preventCache=1524273004043
     * 
     * Sample good response: {"status":1,"data":"ok"}
     * Sample bad response: {"status":"0","error":"You have...","expected":1,"code":100}
     */    
    async join_table(table_id: string): Promise<[boolean, string]> {
        const url = this.domain + `/table/table/joingame.html?table=${table_id}`
        const resp = await authenticatedFetch(url, this.cookies, "GET", {});
        const text = await resp.text()
        try {
           const respJson = JSON.parse(text); 
            const success = respJson.hasOwnProperty('status') && respJson.status === 1;    
            return [success, text];
        } catch { // If the response wasn't parseable  
            return [false, `When attempting to join table ${table_id} at ${url}, Unable to parse JSON from ${text}`]
        }
    }

    async createTable(game_id: number): Promise<[number, string]> {    
        let url = this.domain + '/table/table/createnew.html';
        const params = {
            'game': game_id,
            'forceManual': 'true',
            'is_meeting': 'false',
            'dojo.preventCache': new Date().getTime()
        };
        url += '?' + new URLSearchParams(params as any).toString();
        const resp = await authenticatedFetch(url, this.cookies, "GET", {});
        let respJson: JSON;
        let err = '';
        try {
            respJson = JSON.parse(await resp.text())
        } catch (e) {
            return [-1, 'Unable to parse JSON from Board Game Arena.'];
        }
        if (respJson['status'] === '0') {
            err = respJson['error'];
        }
        if (err.includes('You have a game in progress')) {
            const matches = err.search(/^[\w !]*)[^\/]*([^\"]*)/g);
            err = matches[1] + 'Quit this game first (1 realtime game at a time): ' + this.domain + matches[2];
        }
        const tableID = respJson['data']['table'];
        return [tableID, err];
    }

    async findGameNameByPart(game_name_part: string) {}
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
