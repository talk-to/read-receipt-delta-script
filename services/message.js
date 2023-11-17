import { fetchMessageBody, hitReadReceipt } from '../apis/message-api.js';

const getReadReceiptFromBodyString = htmlString => {
  const srcRegex = /<img.*?src=["'](.*?)["']/;
  const match = htmlString.match(srcRegex);

  if (match && match.length > 1) {
    const srcValue = match[1];
    return srcValue;
  }
};

export const fetchMessageBodyAndParse = async mids => {
  mids.forEach(async mid => {
    const htmlBody = await fetchMessageBody({
      params: {
        mid,
      },
    });
    const readReceiptLink = getReadReceiptFromBodyString(htmlBody);
    if (!readReceiptLink) {
      console.log(`No read receipt found for ${mid}`);
      return;
    }
    console.log(`Hitting read receipt for ${mid}`);
    hitReadReceipt(readReceiptLink);
  });
};
