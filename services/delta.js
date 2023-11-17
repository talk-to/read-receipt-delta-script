import fs from 'fs';
import { fetchDeltas } from '../apis/delta-api.js';
import AccountManager from './account-manager.js';
import { fetchMessageBodyAndParse } from './message.js';
import { sendFlockMessage } from '../utils/send-flock-message.js';

let latestDeltaCursor;
export const areDetailsEmpty = ({ details }) =>
  details === 'null' || details === '';

const parseDeltaDetails = delta => {
  if (areDetailsEmpty(delta)) return {};
  return JSON.parse(delta.details);
};

const parseDeltaAndMarkReadReceipts = deltas => {
  deltas.forEach(delta => {
    if (!delta || delta.ot !== 't' || (delta.tt !== 'm' && delta.tt !== 'c'))
      return;
    const parsedDeltaDetails = parseDeltaDetails(delta);
    const { ma: messagesToBeAdded } = parsedDeltaDetails;

    if (!messagesToBeAdded || !Object.keys(messagesToBeAdded).length) return;
    const mids = Object.keys(messagesToBeAdded);
    fetchMessageBodyAndParse(mids);
  });
};

export const fetchAndParseDeltas = async ({
  lastDeltaCursor,
  deltaCronTime,
}) => {
  try {
    if (!latestDeltaCursor && lastDeltaCursor) {
      latestDeltaCursor = lastDeltaCursor;
      AccountManager.setAccount({
        latestTxnId: lastDeltaCursor,
      });
    } else if (!latestDeltaCursor && !lastDeltaCursor) {
      const { latestTxnId } = await AccountManager.getAccount(
        false,
        'LastDeltaCursor not found'
      );
      latestDeltaCursor = latestTxnId;
      fs.writeFileSync(process.env.DELTA_CURSOR_PATH, latestDeltaCursor);
    }

    console.log(`fetching delta using cursor ${latestDeltaCursor}`);

    const { deltas } = await fetchDeltas({
      params: {
        cursor: latestDeltaCursor,
        limit: 1500,
      },
    });
    if (!Array.isArray(deltas) || (Array.isArray(deltas) && !deltas.length)) {
      console.log('Empty Delta');
      return process.env.DELTA_CRON_TIME;
    }
    parseDeltaAndMarkReadReceipts(deltas);
    latestDeltaCursor = deltas[deltas.length - 1].id;
    fs.writeFileSync(process.env.DELTA_CURSOR_PATH, latestDeltaCursor);
    return process.env.DELTA_CRON_TIME;
  } catch (error) {
    console.log(error.response || error);
    sendFlockMessage(process.env.FLOCK_CHANNEL_URL, error);
    return deltaCronTime * 2;
  }
};
