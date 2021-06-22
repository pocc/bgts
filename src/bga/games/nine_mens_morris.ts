/* Nine Men's Morris bot player

Puppeteer is required to get new moves.
This gets sent to console on gameend: `Entering state: gameEnd`

Difference between start and middle is that #pagemaintitletext changes from "You must place a stone" to "You must move a stone"
Where You is changed to <player name> if it's the other player's turn. This data will also be found in page title.

White has stones 1-9, black has stones 10-18

* [ ] Figure out how to set cookies in puppeteer so that you can make requests with it
* [ ] Choose move by 
    * [ ] Trying to block a Mill
    * [ ] Else try to create your own mill
    * [ ] Else play adjacent to opponent's pieces
    * [ ] Else play adjacent to your own pieces
    * [ ] Else make a valid move

nine men's morris game ID: 1089

### Clicking on elements

These are the IDs of the 24 spots (as if they were on a 7x7 grid):
["location_1_1", "location_4_1", "location_7_1", "location_2_2", "location_4_2", "location_6_2", 
"location_3_3", "location_4_3", "location_5_3", "location_1_4", "location_2_4", "location_3_4", 
"location_5_4", "location_6_4", "location_7_4", "location_3_5", "location_4_5", "location_5_5", 
"location_2_6", "location_4_6", "location_6_6", "location_1_7", "location_4_7", "location_7_7"]

### Determining if you are active player

This will tell if you are the active player: document.title.includes('You must ')
The titles are going to one of (ignoring the triangle preface):

"◥ You must move a stone • Nine Men's Morris • Board Game Arena"

### Board state

It makes sense to define a 7x7 grid, and then moves that are adjacent are easy to determine.
Assume grid coords passed in are valid. 

### Statuses for moves

Good

    {"status":1,"data":{"valid":1,"data":null}}

Bad (when placing a stone where it cannot go)

    {"status":"0","error":"Invalid Location","expected":0,"code":100}
*/
require('dotenv').config();
import { authenticatedFetch } from "../http/utils";
import { BoardGameArena } from '../http/create_game';
import { GameDataResp, nmmStoneJSON, nmmBoardState, nmmStone, location, adjacencyMap, nmmGameStage } from '../types/games/nine_mens_morris';
import { TableData, playerID } from '../types/table';
const bga = require("../http/create_game");
const puppeteer = require('puppeteer');
const uuid = require('uuid');


const USERNAME = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const PLAYER_ID = process.env.PLAYER_ID as string;
const NINE_MENS_MORRIS_GAME_ID = 1186;


(async () => {
    const bgaConnector = new bga.BoardGameArena(USERNAME, PASSWORD);
    await bgaConnector.instantiate();
    
    await bgaConnector.quitRealtimeTables(); // ensure that no previous tables interfere
    const [tableID, tableResp] = await bgaConnector.createTable(NINE_MENS_MORRIS_GAME_ID);
    //const bot = new NineMensMorris(bgaConnector.cookies, tableResp, parseInt(PLAYER_ID, 10) as number);
    await bgaConnector.getTableMessages(tableID);

    const browser = await puppeteer.launch({headless:false});
    const [page] = await browser.pages();
    const cookies = await bgaConnector.generateCookies();
    await page.setCookie(...cookies);
    const resp = await page.goto(bgaConnector.domain + '/table?table=' + tableID.toString());
    await bgaConnector.openTable(tableID);
    // if you have the right number of players with realtime, it will autostart the game
    const acceptButtonSelector = '#ags_start_game_accept'
    await page.waitForSelector(acceptButtonSelector);
    await page.click(acceptButtonSelector);
})();

// consists of xy adjacencies, where board is a 7x7 grid (bga model)
const ADJACENCIES: {[key: string]: location[]} =  {
    "11": ["14", "41"], 
    "14": ["11", "17", "24"],
    "17": ["14", "47"],
    "22": ["24", "42"],
    "24": ["22", "14", "26", "34"],
    "26": ["24", "46"],
    "33": ["34", "43"],
    "34": ["33", "35", "24"],
    "35": ["34", "45"],
    "41": ["11", "42", "71"],
    "42": ["41", "22", "62", "43"],
    "43": ["42", "33", "53"],
    "45": ["35", "55", "46"],
    "46": ["45", "26", "66", "47"],
    "47": ["17", "77", "46"],
    "53": ["43", "54"],
    "54": ["53", "55", "64"],
    "55": ["45", "54"],
    "62": ["42", "64"],
    "64": ["54", "74", "62", "66"],
    "66": ["64", "46"],
    "71": ["41", "74"],
    "74": ["71", "77", "64"],
    "77": ["47", "74"]
};

const LOCATIONS = Object.keys(ADJACENCIES);

/** There are a limited number of moves that can be made in this game.
 * Essentially, you can move a piece, or propose a draw.
 * If 40 moves pass with no capture, 
 */
export class NineMensMorris {
    cookies: string;
    tableID: string;
    tableURL: string;
    tableData: TableData;
    boardState: nmmBoardState = {};
    stones: nmmStoneJSON;
    playerID: string;
    domain: string;
    gameStage: nmmGameStage;
    flyingPlayers: string[];
    isFlyingOn: boolean; // Whether Wild/Flying is set to on for final stone

    constructor(_cookies: string, _tableResp: TableData, _playerID: number) {
        this.domain = "https://boardgamearena.com";
        this.cookies = _cookies;
        this.tableData = _tableResp;
        this.tableID = _tableResp.data.id;
        this.tableURL = this.domain + `/${_tableResp.data.gameserver}/ninemensmorris?table=${this.tableID}`;
        this.playerID = _playerID.toString();
        this.boardState = {};
        this.gameStage = "placing pieces";
        this.isFlyingOn = _tableResp.data.options['100'].value === '2';
        this.flyingPlayers = [];
    }

    /**
     * 
     */
    async setGameData(): Promise<string> {
        const resp = await authenticatedFetch(this.tableURL, this.cookies, "GET", {});
        const tableHTML = await resp.text();
        const gameData = /gameui\.completesetup\(.*({"players.*?}), /.exec(tableHTML);
        if (gameData && gameData.length >= 2) {
            try {
                const gameDataJson = JSON.parse(gameData[1]) as GameDataResp;
                this.stones = gameDataJson.stones;
                this.setFlyingPlayers();
                if (this.flyingPlayers) {
                    this.gameStage = "flying";
                } else {
                    const gameStage = /must (place|move) a stone/.exec(tableHTML);
                    if (!gameStage) { return "Problem finding game stage in HTML."; }
                    this.gameStage = gameStage[1].slice(0, -1) + 'ing pieces' as nmmGameStage;
                }
                this.setBoardState(gameDataJson.stones);
                return "";
            } catch {
                return "Problem parsing game data: " + gameData[1];
            }
        } else {
            return "Unable to get game data from HTML: " + tableHTML;
        }
    }

    // Determines if one player has 3 pieces left, thus triggering flying stage
    // Set the class variable if this is the case
    setFlyingPlayers(): void {
        let numWhitePieces = 0;
        let numBlackPieces = 0;
        let flyingPlayers: string[] = [];
        let whitePlayerID = "";
        let blackPlayerID = "";
        for (const stone in Object.keys(this.stones)) {
            if (stone < "10") { // white player is 1-9, black player is 10-18
                numWhitePieces += 1;
                whitePlayerID = this.stones[stone].stone_player;
            } else {
                numBlackPieces += 1;
                blackPlayerID = this.stones[stone].stone_player;
            }
        }
        if (numWhitePieces === 3) {
            this.flyingPlayers.push(whitePlayerID);
        }
        if (numBlackPieces === 3) {
            this.flyingPlayers.push(blackPlayerID);
        }
        this.flyingPlayers = flyingPlayers;
    }

    // Change the key of the stones json from the stone ID to xycoord
    setBoardState(stones: nmmStoneJSON): void {
        for (const stoneID of Object.keys(stones)) {
            const stone: nmmStone = stones[stoneID];
            const xyCoord = stone.stone_x + stone.stone_y;
            this.boardState[xyCoord] = stone;
        }
    }

    // See what valid moves are from the board state, assuming all pieces have been placed
    async validMoves(): Promise<adjacencyMap> {
        let moves: adjacencyMap = {};
        if (Object.keys(this.boardState).length === 0) {
            const error = await this.setGameData();
            if (error) { throw error; }
        }
        const currPlayerStones = Object.keys(this.stones).filter(stoneID => 
            this.stones[stoneID].stone_player === this.playerID
        );
        const isPlayerFirst = this.tableData.data.players[this.playerID].table_order === "1"; // White as well
        let playerStoneIDs = [];
        if (isPlayerFirst) {
            playerStoneIDs = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        } else {
            playerStoneIDs = ["10", "11", "12", "13", "14", "15", "16", "17", "18"];
        }

        const unoccupiedLocations = LOCATIONS.filter(loc => !Object.keys(this.stones).includes(loc)) as location[];
        // Any spot that isn't occupied by a stone is valid
        if (this.gameStage === "placing pieces") { 
            let unplacedCurrPlayerStoneIDs = playerStoneIDs.filter(loc => !currPlayerStones.includes(loc));
            const nextStoneToPlace = unplacedCurrPlayerStoneIDs[0];
            // Only one move needs to be registered because one piece will be placed
            moves[nextStoneToPlace] = unoccupiedLocations;
            return moves;
        }
        // flying players can place anywhere but moving players must move adjacent.
        else if (Object.keys(currPlayerStones).length === 3 && this.isFlyingOn) { 
            // Must use existing stones
            for (const loc of currPlayerStones) {
                moves[loc] = unoccupiedLocations; 
            }
            return moves;
        }
        // Remaining game stage is moving pieces
        for (const stoneID of currPlayerStones) {
            const stone = this.stones[stoneID];
            const stoneLoc = stone.stone_x + stone.stone_y;
            moves[stoneLoc] = [];
            const adjacencies = ADJACENCIES[stoneLoc];
            for (const adj of adjacencies) {
                if (!this.boardState[adj]) { // if this location has no stone
                    moves[stoneID].push(adj); 
                }
            }
        }
        return moves;
    }

    /** Function to make a move in Nine Men's Morris. Returns success as boolean.
     * x and y coords in 7x7 grid while the stones are numbered 1-18.
     */
    async makeMove(x: number, y: number, stoneID: number): Promise<boolean> {
        const route = "/ninemensmorris/makeMove.html";
        const params = {
            "lock": uuid.v4(),
            "x": x, 
            "y": y,
            "id": stoneID,
            "table": this.tableID,
            "dojo.preventCache": new Date().getTime()
        };
        const url = this.domain + route + '?' + new URLSearchParams(params as any).toString();
        const resp = await authenticatedFetch(url, this.cookies, "GET", {});
        try {
            const respJson = await resp.json();
            return respJson.status === 1;
        } catch {
            return false;
        } 
    }

    // Number the points as a 3x8 grid with 3 horizontals and verticals on evens
    // (The board into a doughnut, but slice it across so it's a rectangle)
    // Point number is 8*y + x
    // Given a point, this array provides the adjacencies
    generateAdjacencies(): Array<Array<number>> {
        // better module that takes care of negative numbers
        function mod(n: number, m: number): number {
            return ((n % m) + m) % m;
        }
        let adj = new Array(24);
        for (let y=0; 3 > y; y++) {
            for (let x=0; 8 > x; x++) {
                let pointAdj = new Set();
                if (y === 1 && mod(x,2) === 0) {
                    pointAdj.add(x);
                    pointAdj.add(8*2+x);
                } else {
                    pointAdj.add(8+x);
                }
                pointAdj.add(8*y+(mod(x+1,8)));
                pointAdj.add(8*y+(mod(x-1,8)));
                adj[8*y+x] = Array.from(pointAdj);
            }
        }
        return adj;
    }

    /* Strategy for NMM

    http://library.msri.org/books/Book29/files/gasser.pdf
    https://github.com/exp0nge/nine-mens-morris

    Overall, it doesn't matter how you play, so long as you have valid moves until there are 3 pieces left.
    After that, you just need to force a draw with 3 pieces lef.t
    
    # Placement
        If your opponent has 2 in a row, block the third.
    */
}

