require('dotenv').config();
import {nineMensMorris} from "../../src/bga/games/nine_mens_morris";
import { tableStatus } from "../../src/bga/http/noauth";
const puppeteer = require('puppeteer');

const username = process.env.USER as string;
const password = process.env.PASSWORD as string;
const email = process.env.EMAIL as string;

jest.setTimeout(20000)

describe('Test validation functions', () => {
  test.concurrent('Test what valid moves are available', async () => {
    const tableID = 181822479; // random table where nmm was being played
    const tableResp = await tableStatus(tableID);
    const game = new nineMensMorris("", tableResp, 90754082); // user asdfg8901
    await game.setGameData();
    game.boardState = {
        '54': {
          stone_id: '1',
          stone_player: '90754082',
          stone_x: '5',
          stone_y: '4'
        },
        '62': {
          stone_id: '10',
          stone_player: '88381369',
          stone_x: '6',
          stone_y: '2'
        }
    }
    const moves = await game.validMoves();
    expect(moves).toStrictEqual({'2':['11','14','17','22','24','26','33','34','35','41','42','43','45','46','47','53','54','55','62','64','66','71','74','77']})
  });
});