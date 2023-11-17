import dotenv from 'dotenv';
import fs from 'fs';
import AccountManager from './services/account-manager.js';
import { fetchAndParseDeltas } from './services/delta.js';
import { sendFlockMessage } from './utils/send-flock-message.js';

dotenv.config();

let deltaCronTime = process.env.DELTA_CRON_TIME;
let lastDeltaCursor;
let lastSession;
let lastBaseUrl;

const originalConsoleLog = global.console.log;

global.console.log = (...log) => {
  originalConsoleLog(`${new Date()}`, ...log);
};

(async () => {
  try {
    lastDeltaCursor = fs.readFileSync(process.env.DELTA_CURSOR_PATH).toString();
    lastSessionString = fs.readFileSync(process.env.SESSION_PATH).toString();
    if (lastSessionString) {
      const { session, baseUrl } = JSON.parse(lastSessionString);
      lastSession = session;
      lastBaseUrl = baseUrl;
    }
  } catch (error) {
    lastDeltaCursor = undefined;
  }
  try {
    if (!lastSession || !lastBaseUrl) {
      const { token, baseUrl } = await AccountManager.getAccount(true);
      lastSession = token;
      lastBaseUrl = baseUrl;
    } else {
      AccountManager.setAccount({
        session: lastSession,
        baseUrl: lastBaseUrl,
      });
    }
    await fetchAndParseDeltas({
      lastDeltaCursor,
      deltaCronTime,
    });
    for (;;) {
      await new Promise(res => {
        setTimeout(async () => {
          const newDeltaCronTime = await fetchAndParseDeltas({
            deltaCronTime,
          });
          deltaCronTime = newDeltaCronTime;
          console.log(`newDeltaCronTime`, newDeltaCronTime);
          res();
        }, deltaCronTime);
      });
    }
  } catch (error) {
    console.log(error);
    sendFlockMessage(process.env.FLOCK_CHANNEL_URL, error);
  }
})();
