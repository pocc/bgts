
// There are the 3 phases of the game. Placing pieces initially (9 for each side)
// Moving the pieces, and then one person will eventually have 3 pieces (flying) and can force a draw.
export type nmmGameStage = "placing pieces" | "moving pieces" | "flying"

// Game data response interfaces
export interface GameDataResp {
    stones: nmmStoneJSON;
    players: {
        [PlayerID: string]: { // PlayerIDs as strings
            id: string;
            score: string;
            color: string;
            color_back: string;
            name: string;
            avatar: string;
            zombie: number;
            eliminated: number;
            is_ai: string;
            beginner: boolean;
        };
    };
    first: string;
    gamestate: {
        id: string;
        active_player: string;
        args: {
            stones: nmmStone[];
            locations: [{
                x: number;
                y: number;
            }];
            has_proposed_draw: string;
            remaining_moves: number;
        };
        reflexion: {
            total: {
                [key: string]: string | number
            }
        };
        updateGameProgression: number;
    };
    tablespeed: string;
    game_result_neutralized: string;
    neutralized_player_id: string;
    playerorder: any[];
    gamestates: {
        [key: string]: string
    };
    notifications: {
        last_packet_id: string;
        move_nbr: string;    
    };
}

export interface nmmStoneJSON {
    [StoneID: string]: nmmStone // 1 through 18
}

export interface nmmStone {  // Nine Men's Morris Stone
    stone_id: string;
    stone_player: string;
    stone_x: string;
    stone_y: string;
}

// Grid of stones. xy Coord is a string, so if x=4, y=1, xyCoord = 41
export interface nmmBoardState {
    [xyCoord: string]: nmmStone
}

export type location = "11" | "14" | "17" | "22" | "24" | "26" | "33" | "34" | "35" | "41" | "42" | "43" | "45" | "46" | "47" | "53" | "54" | "55" | "62" | "64" | "66" | "71" | "74" | "77";
export type adjacencyMap = {[key: string]: location[]};