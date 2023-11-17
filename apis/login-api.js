import axios from 'axios';
import { generateCrid } from '../utils/generate-crid.js';

const baseUrls = {
  apiBaseUrl: null,
  bllBaseUrl: null,
};

const apiPath = '/mail/login';
let accountService = null;
const newService = (defaults = {}) => {
  const _service = axios.create({
    ...defaults,
  });
  return _service;
};

export const getAppBaseUrl = async email => {
  const clusterConfigUrl = `${
    process.env.CLUSTER_CONFIG_URL
  }${encodeURIComponent(email)}`;
  return axios.get(clusterConfigUrl);
};

const getBaseUrl = apiBaseUrl => `${apiBaseUrl}/fa`;

export const loginAccountApi = async (
  { email, password } = {},
  extraHeaders = {}
) => {
  if (!baseUrls.apiBaseUrl) {
    const {
      data: { apiBaseUrl, bllBaseUrl },
    } = await getAppBaseUrl(email);
    baseUrls.apiBaseUrl = apiBaseUrl;
    baseUrls.bllBaseUrl = bllBaseUrl;
  }

  const { apiBaseUrl } = baseUrls;

  if (!accountService) {
    accountService = newService({
      baseURL: apiBaseUrl,
      headers: {
        'X-API-Endpoint': apiBaseUrl,
        ...extraHeaders,
      },
    });
  }

  try {
    const { data: result } = await accountService({
      method: 'POST',
      baseURL: `${getBaseUrl(apiBaseUrl)}/`,
      url: apiPath,
      data: {
        email: email.trim(),
        crid: generateCrid(apiPath),
        iid: 'AWS-Lambda-9999999999999',
        password,
        device: 'browser',
        rp: {
          brand: 'titan',
        },
      },
    });
    if (!result || !result.mailId || !result.session || !result.baseUrl) {
      throw new Error('Invalid Api response');
    }
    return {
      token: result.session,
      latestTxnId: result.latestTxnId,
      appBaseUrl: result.baseUrl,
    };
  } catch (error) {
    console.log(error.response || error);
    throw error;
  }
};
