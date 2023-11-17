import moment from 'moment';
import { apiToShortFormMap } from './api-constants.js';

const CRID_COUNTER_THRESHOLD = 1000;

const getRequestNameShortForm = (path, method) => {
  //  path is a string '/v2/receipts' etc
  const short_form = apiToShortFormMap.get(path);
  if (short_form) {
    if (typeof short_form === 'object' && method) return short_form[method];
    return short_form;
  }
};

export const generateCrid = (function () {
  let counter = 0;
  return function (path, method) {
    if (counter >= CRID_COUNTER_THRESHOLD) counter = 0;
    const short_form = getRequestNameShortForm(path, method);
    const dateTimeinUtc = moment.utc(new Date()).format('DDHHmmss');

    const randomChars = Math.random().toString(36).substring(2, 6);
    const crid = `w_${dateTimeinUtc}_${short_form}_${counter++}_${999}_${randomChars}`;
    return crid;
  };
})();
