require('dotenv').config();
import {loginBGA, loginBGADirect} from "../src/bga/puppeteer/authentication";
import {loginTabletopia} from "../src/tabletopia/authentication";
import {loginYucata} from "../src/Yucata/authentication";
const puppeteer = require('puppeteer');

const username = process.env.USER as string;
const password = process.env.PASSWORD as string;
const email = process.env.EMAIL as string;

jest.setTimeout(20000)


describe('BGA direct auth', () => {
  test.concurrent('Test BGA direct auth', async () => {
    const [browser, _, responseText] = await loginBGADirect(username, password);
    expect(responseText).not.toBe("");
    await browser.close();
  });

  // Skip this test. If BGA sees 2 bad password tests in 5s, a backoff timer will trigger
  test.skip('Test BGA direct auth bad password', async () => {
    const [browser, _, responseText] = await loginBGADirect(username, "badPassword");
    expect(responseText).toBe("");
    await browser.close();
  });
});

describe('BGA auth', () => {
  test.concurrent('Test BGA auth', async () => {
    const [browser, _, success] = await loginBGA(username, password);
    expect(success).toBe(true);
    await browser.close();
  });

  // this needs to run after all other BGA tests
  test('Test BGA auth bad password', async () => {
    const [browser, _, success] = await loginBGA(username, "badPassword");
    expect(success).toBe(false);
    await browser.close();
  });
});

describe('Yucata auth', () => {
  test.concurrent('Test Yucata auth', async () => {
    const [browser, _, success] = await loginYucata(username, password);
    expect(success).toBe(true);
    await browser.close();
  });

  test('Test Yucata auth bad password', async () => {
    const [browser, _, success] = await loginYucata(username, "badPassword");
    expect(success).toBe(false);
    await browser.close();
  });
});

describe('Tabletopia auth', () => {
  test.concurrent('Test Tabletopia auth', async () => {
    const [browser, _, success] = await loginTabletopia(email, password);
    expect(success).toBe(true);
    await browser.close();
  });

  // Remove skip to run. Bad password will cause captcha to trigger, which kills testing
  test.skip('Test Tabletopia auth bad password', async () => {
    const [browser, _, success] = await loginTabletopia(email, "badPassword");
    expect(success).toBe(false);
    await browser.close();
  });
});
