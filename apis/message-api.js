import axios from 'axios';
import { generateCrid } from '../utils/generate-crid.js';
import { generateService } from './util/generate-service.js';

const path = 'v2/messages/body';
let baseUrl;
let messageService;

export const fetchMessageBody = async (params = {}) => {
  if (!messageService)
    ({ service: messageService, baseUrl } = await generateService());
  const crid = generateCrid(path);
  params.params.crid = crid;

  try {
    const {
      data: { body },
    } = await messageService({
      method: 'GET',
      baseURL: baseUrl,
      url: path,
      ...params,
    });
    return body;
  } catch (error) {
    console.log(error);
  }
};

export const hitReadReceipt = async readReceiptLink => {
  axios.get(readReceiptLink);
};
