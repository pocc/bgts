// Functions that do not need privilege to access elements
// In order to respond to moves in realtime, you need to be able to intercept this request
// game_url + /wakeup.html?myturnack=true&table=181876399&dojo.preventCache=1624307746983
import fetch from 'node-fetch';
import { TableData as BGATableData } from '../types/table';


const DOMAIN = "https://boardgamearena.com";

export async function tableStatus(tableID: string): Promise<BGATableData> {
    const url = `${DOMAIN}/table/table/tableinfos.html?id=${tableID}`;
    const resp = await fetch(url);
    try {
        const respJson = await resp.json();
        // if it has a game_id, assume it's tabledata
        if (respJson.status && respJson.data && respJson.data.game_id) {
            return respJson;
        }
        const respText = await resp.text();
        throw "Problem parsing table response (JSON.data.game_id should exist). Received:\n";
    } catch (e) {
        throw "Problem accessing url " + url + ". ";
    }
}
