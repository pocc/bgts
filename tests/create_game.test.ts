require('dotenv').config();
const bga = require("../build/bga/http/create_game");

const username = process.env.USER;
const password = process.env.PASSWORD;


describe('BGA game creation with non-premium game', () => {
    test('Test game creation for race for the galaxy', async () => {
        const raceForTheGalaxyID = 10;
        const bgaConnector = new bga.BoardGameArena(username, password);
        await bgaConnector.instantiate();
        await bgaConnector.quitRealtimeTables(); // ensure that no previous tables interfere
        const [tableID, err] = await bgaConnector.createTable(raceForTheGalaxyID);
        if (err) {
          throw new Error("Something went wrong" + err)
        } else {
          await bgaConnector.quitTable(tableID) // cleanup if it worked
        }
    });
    test('Test game creation for bad game ID', async () => {
        const invalidGameID = 3;
        const bgaConnector = new bga.BoardGameArena(username, password);
        await bgaConnector.instantiate();
        await bgaConnector.quitRealtimeTables(); // ensure that no previous tables interfere
        const [tableID, err] = await bgaConnector.createTable(invalidGameID);
        expect(err).toBe('You have no access to this game');
    });
});
