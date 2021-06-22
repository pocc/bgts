export interface TableData {
    status: number;
    data: {
        id: string;
        game_id: string;
        status: string;
        table_creator: string;
        max_player: string;
        level_filter: LevelFilter;
        filter_group?: any;
        filter_lang?: any;
        reputation_filter: ReputationFilter;
        presentation: string;
        cancelled: string;
        unranked: string;
        min_player: string;
        filter_group_name?: any;
        filter_group_visibility?: any;
        filter_group_type?: any;
        game_name: string;
        game_max_players: string;
        game_min_players: string;
        game_player_number: GamePlayerNumber;
        game_status: string;
        game_premium: string;
        game_expansion_premium: string;
        sandbox: string;
        scheduled: string;
        gamestart: string;
        gameserver: string;
        duration: string;
        initial_reflexion_time_advice: string;
        additional_reflexion_time_advice: string;
        progression: string;
        siteversion: string;
        gameversion: string;
        log_archived: string;
        news_id?: any;
        player_number_advice: string;
        player_number_not_recommended: string;
        fast: string;
        medium: string;
        slow: string;
        league_number: string;
        players: Players;
        level_filter_r: string;
        reputation_filter_r: string;
        current_player_nbr: number;
        current_present_player_nbr: number;
        player_display: any[];
        options: {[optionNumber: string]: Option};
        options_order: number[];
        beta_option_selected: boolean;
        alpha_option_selected: boolean;
        not_recommend_player_number: any[];
        beginner_not_recommended_player_number: any[];
        rtc_mode?: any;
        result: Result;
        estimated_duration: number;
        time_profile: TimeProfile;
        pma: boolean;
        thumbs: any[];
    };
}

export interface Label {
    log: string;
    args: any[];
}

export interface Details {
    "Beginners": boolean;
    "Apprentices": boolean;
    "Average players": boolean;
    "Good players": boolean;
    "Strong players": boolean;
    "Experts": boolean;
    "Masters": boolean;
}

export interface LevelFilter {
    label: Label;
    details: Details;
}

export interface Details2 {
    opinion: number;
    leave: number;
    clock: number;
    karma: number;
}

export interface ReputationFilter {
    label: string;
    details: Details2;
}

export interface GamePlayerNumber {
    2: number;
}

export interface Award {
    id: string;
    player: string;
    game: string;
    type_id: string;
    date: string;
    defending: string;
    linked_tournament?: any;
    prestige: string;
    tgroup?: any;
    tournament_name?: any;
    championship_name?: any;
    season?: any;
    group_avatar?: any;
    name: string;
    nametr: string;
    namearg: number;
    prestigeclass: number;
}

export interface playerID {
    id: string;
    table_status: string;
    fullname: string;
    avatar: string;
    rank: number;
    rank_victory: string;
    arena_points: string;
    table_order: string;
    is_admin: string;
    is_premium: string;
    is_beginner: string;
    is_confirmed: string;
    status: string;
    device: string;
    decision?: any;
    player_country: string;
    gender: string;
    grade: string;
    played: string;
    realPlayed: string;
    prestige: string;
    th_name?: any;
    thumb_up: string;
    thumb_down: string;
    recent_games: string;
    recent_leave: string;
    recent_clock: string;
    karma: string;
    karma_alert: string;
    victory: string;
    hit: number;
    ip: string;
    languages_fluent?: any;
    languages_normal: string;
    ranksummary: number;
    country: Country;
    languages: string[];
    freeaccount: boolean;
    premiumaccount: boolean;
    rank_no?: any;
    same_ip: number;
    awards: Award[];
}

export interface Award2 {
    id: string;
    player: string;
    game: string;
    type_id: string;
    date: string;
    defending: string;
    linked_tournament?: any;
    prestige: string;
    tgroup?: any;
    tournament_name?: any;
    championship_name?: any;
    season?: any;
    group_avatar?: any;
    name: string;
    nametr: string;
    namearg: number;
    prestigeclass: number;
}

export interface Players {
    [playerID: string]: playerID;
}

export interface Value {
    name: string;
    no_player_selection?: boolean;
}

export interface Values {
    [numberKeyStr: string]: number
}

export interface Displaycondition {
    type: string;
    id: number;
    value: number[];
}

export interface Template {
    namearg: string;
    default: number;
}

export interface Country {
    flag: number;
    name: string;
    cur: string;
    code: string;
    flag_x: number;
    flag_y: number;
}

export interface Player {
    player_id: string;
    score: string;
    score_aux: string;
    name: string;
    th_name?: any;
    avatar: string;
    gender: string;
    country: Country;
    gamerank: string;
    is_tie: string;
    point_win: string;
    rank_after_game: string;
    finish_game: string;
    arena_points_win?: any;
    arena_after_game: string;
    is_premium: string;
    is_beginner: string;
}

export type PlayerID = number;
export interface Penalties {
    [playerID: string]: playerID 
}

export interface PlayerNumber {
    id: number;
    name: string;
    type: string;
    value: string;
}

export interface AvgPoints {
    id: number;
    name: string;
    type: string;
    value: string;
}

export interface BestScore {
    id: number;
    name: string;
    type: string;
    value: string;
}

export interface TurnsNumber {
    id: number;
    name: string;
    type: string;
    value: string;
}

export interface Table {
    player_number: PlayerNumber;
    avg_points: AvgPoints;
    best_score: BestScore;
    turns_number: TurnsNumber;
}

export interface ReflexionTime {
    id: number;
    name: string;
    unit: string;
    type: string;
    values: Values;
    valuelabels: any[];
}

export interface TimeBonusNbr {
    id: number;
    name: string;
    type: string;
    values: Values;
    valuelabels: any[];
}

export interface ReflexionTimeSd {
    id: number;
    name: string;
    type: string;
    values: Values;
    valuelabels: any[];
}

export interface Stats {
    table: Table;
    player: Player;
}

export interface Trophies {
    [playerIDStr: string]: playerID[];
}

export interface Result {
    id: string;
    time_start: string;
    time_end: string;
    time_duration: string;
    table_level: string;
    game_id: string;
    concede: string;
    endgame_reason: string;
    game_name: string;
    game_status: string;
    losers_not_ranked: boolean;
    is_coop: boolean;
    player: Player[];
    penalties: Penalties;
    is_solo: boolean;
    stats: Stats;
    trophies: Trophies;
}

export interface TimeProfile {
    additional_time_per_move: string;
    maximum_time_per_move: number;
    extra_time_to_think_to_expel: number;
    initial_time_to_thing: number;
}
export interface Option {
    name: string;
    values: Values;
    type: string;
    value: string;
    displaycondition: Displaycondition[];
}
