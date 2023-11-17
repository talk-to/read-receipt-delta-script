import { generateCrid } from '../utils/generate-crid.js';
import { generateService } from './util/generate-service.js';

const path = 'delta';
let deltaService = null;
let baseUrl;
let loginRetry = 0;

export const fetchDeltas = async (params = {}) => {
  if (!deltaService)
    ({ service: deltaService, baseUrl } = await generateService(
      params.forceFetchToken,
      'Fetch Delta'
    ));

  const crid = generateCrid(path);
  params.params.crid = crid;

  try {
    const res = await deltaService({
      method: 'GET',
      baseURL: baseUrl,
      url: path,
      ...params,
    });
    loginRetry = 0;
    return (res && res.data) || res;
  } catch (error) {
    if (
      loginRetry < process.env.MAX_TOKEN_REFETCH &&
      error.response.status === 401 &&
      error.response.statusText === 'Unauthorized'
    ) {
      loginRetry++;
      deltaService = null;
      return fetchDeltas({
        ...params,
        forceFetchToken: true,
      });
    }
    loginRetry = 0;
    throw error;
  }
};
