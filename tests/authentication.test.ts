require('dotenv').config();
import {loginBGA, loginBGADirect} from "../src/bga/authentication";
import {loginTabletopia} from "../src/tabletopia/authentication";
import {loginYucata} from "../src/Yucata/authentication";
const puppeteer = require('puppeteer');

const username = process.env.USER as string;
const password = process.env.PASSWORD as string;
const email = process.env.EMAIL as string;

jest.setTimeout(12000)

test.concurrent('Test BGA direct auth', async () => {
  const [browser, page, _] = await loginBGADirect(username, password);
  expect(page.url()).toBe('https://boardgamearena.com/');
  await browser.close();
});

test.concurrent('Test BGA direct auth bad password', async () => {
  const [browser, __, responseText] = await loginBGADirect(username, "badPassword");
  expect(responseText).toBe("");
  await browser.close();
});

test.concurrent('Test BGA auth', async () => {
  const [browser, page, _] = await loginBGA(username, password);
  expect(page.url()).toBe('https://en.boardgamearena.com/');
  await browser.close();
});

test.concurrent('Test BGA auth bad password', async () => {
  const [browser, _, success] = await loginBGA(username, "badPassword");
  expect(success).toBe(false);
  await browser.close();
});

test.concurrent('Test Yucata auth', async () => {
  const [browser, page, _] = await loginYucata(username, password);
  expect(page.url()).toBe('https://www.yucata.de/en/Overview');
  await browser.close();
});

test.concurrent('Test Yucata auth bad password', async () => {
  const [browser, _, success] = await loginYucata(username, "badPassword");
  expect(success).toBe(false);
  await browser.close();
});

test.concurrent('Test Tabletopia auth', async () => {
  const [browser, page, _] = await loginTabletopia(email, password);
  expect(page.url()).toBe('https://tabletopia.com/');
  await browser.close();
});

test.concurrent('Test BGA auth bad password', async () => {
  const [browser, _, success] = await loginTabletopia(email, "badPassword");
  expect(success).toBe(false);
  await browser.close();
});

/*
    ;
    loginBGA(username, "abc123");
    loginBGADirect(username, password);
    loginBGADirect(username, "abc123");
    loginTabletopia(username, password);
    loginTabletopia(username, "abc123");
    loginYucata(username, password);
    loginYucata(username, "abc123");
})();
*/