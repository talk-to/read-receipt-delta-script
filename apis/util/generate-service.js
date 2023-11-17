import axios from 'axios';
import AccountManager from '../../services/account-manager.js';

const account = {
  baseUrl: null,
  token: null,
};

const newService = (defaults = {}) => {
  const _service = axios.create({
    ...defaults,
  });
  return _service;
};

export const generateService = async (forceFetchToken, source) => {
  if (!account.baseUrl || forceFetchToken) {
    const acc = await AccountManager.getAccount(
      forceFetchToken,
      `${source} >> generateService, forceFetchToken: ${forceFetchToken}`
    );
    account.baseUrl = acc.baseUrl;
    account.token = acc.token;
  }

  const { baseUrl, token } = account;

  return {
    service: newService({
      baseURL: baseUrl,
      headers: {
        'X-Session-Token': token,
        'X-API-Endpoint': baseUrl,
      },
    }),
    baseUrl,
  };
};
