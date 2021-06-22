import { OneDigit } from '../../index';


export interface BGAResp {
    status: "0" | 1; // Weirdness that BGA exhibits. 1 is success, 0 is fail  
    error?: string; // Error string will occur on 0 status, like login failure
    code?: number ; // Error code on error
    expected?: 1; // Will only be 1 as that is expected good
}

export interface messageResponse extends BGAResp {
    data: {
        type: string;
        id: string;
        history: [{
            id: string;
            player_id: string;
            player_name: string;
            type: string;
            time: string;
            is_new: string;
            text: string;
        }] | null;
    }
}

export interface gameRankings extends BGAResp {
    data: {
        ranks: [{
            id: string;
            name: string;
            country: Country
            arena: string;
            rank_no: string;
            avatar: string;
            device: string;
            status: string;
        }];
        champion: {
            id: string;
            name: string;
            country: Country;
            avatar: string;
            device: string;
            status: string;
        };
    }    
}

interface Country {
    flag: number;
    name: string;
    cur: string;
    code: string;
    flag_x: number;
    flag_y: number;
}    


export interface TableCreationResp extends BGAResp {
    data: {
        table: string // Table ID str number
    }
}

// Response that you get for the post request to login
export interface LoginResponse extends BGAResp {
    data: {
        success: boolean;
        redirect: string;
        infos: {
            id: string;
            name: string;
            homepage: string;
            mute_sound: boolean;
            date_use_iso: boolean;
            sound_volume: number;
            sound_mode: number;
            preferences: string;
            sound_list: {
                yourturn: string;
                chatmessage: string;
                move: string;
                joinTable: string;
                tableReady: string;
                victory: string;
                lose: string;
                tie: string;
                elochange: string;
                new_trophy: string;
                time_alarm: string;
            };
            notifyGeneralChat: number;
            displayClubBanner: number;
            gamefilter: {[gameNumber: string]: string};
            playerTableStatus: any[];
            rtc_mode: number;
            rtc_room?: any;
            async_status: any[];
            unread_news: {[newsNumber: string]: string};
            latest_chat: {
                general: [{
                    player_id: string;
                    player_name: string;
                    text: string;
                    time: string;
                    type: string;
                }];
                priv: any[];
                table: any[];
            };
            friends_nbr: number;
            friends: any[];
            groups: any[];
            all_groups: {[group: string]: number};
            red_thumbs_given: any[];
            red_thumbs_taken: any[];
            tutorial_seen: any[];
            pma: boolean;
            all_lang: {[lang: string]: OneDigit};
            lang: string;
            gender?: any;
            underage: boolean;
            locked_url: string;
            timezone: string;
            playernotif_nbr: string;
            playernotif_splashed: any[];
            socketio_cred: string;
            easter_egg_2021: {
                eggs: boolean[];
                active: boolean;
            };
            }
    };
}
