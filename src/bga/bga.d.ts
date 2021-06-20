import { OneDigit } from '../../index';

export interface TableCreationResponse {
    status: "0" | 1;  // Weirdness that BGA exhibits. 1 is success, "0" is fail
    error?: string; // Error string will occur on "0" status, like login failure
    code?: number ; // Error code on error
    expected?: 1; // Will only be 1 as that is "expected good"
    data: {
        table: string // Table ID str number
    }
}

// Response that you get for the post request to login
export interface LoginResponse {
    status: "0" | 1;  // Weirdness that BGA exhibits. 1 is success, "0" is fail
    error?: string; // Error string will occur on "0" status, like login failure
    code?: number ; // Error code on error
    expected?: 1; // Will only be 1 as that is "expected good"
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
            sound_list: SoundList;
            notifyGeneralChat: number;
            displayClubBanner: number;
            gamefilter: Gamefilter;
            playerTableStatus: any[];
            rtc_mode: number;
            rtc_room?: any;
            async_status: any[];
            unread_news: UnreadNews;
            latest_chat: LatestChat;
            friends_nbr: number;
            friends: any[];
            groups: any[];
            all_groups: AllGroups;
            red_thumbs_given: any[];
            red_thumbs_taken: any[];
            tutorial_seen: any[];
            pma: boolean;
            all_lang: AllLang;
            lang: string;
            gender?: any;
            underage: boolean;
            locked_url: string;
            timezone: string;
            playernotif_nbr: string;
            playernotif_splashed: any[];
            socketio_cred: string;
            easter_egg_2021: EasterEgg2021;
            }
    };
}

export interface SoundList {
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
}

export interface Gamefilter {
    [gameNumber: string]: string
}

export interface UnreadNews {
    [newsNumber: string]: string;
}

export interface General {
    player_id: string;
    player_name: string;
    text: string;
    time: string;
    type: string;
}

export interface LatestChat {
    general: General[];
    priv: any[];
    table: any[];
}

export interface AllGroups {
    [group: string]: number;
}

export interface AllLang {
    [lang: string]: OneDigit;
}

export interface EasterEgg2021 {
    eggs: boolean[];
    active: boolean;
}
// End login request interfaces