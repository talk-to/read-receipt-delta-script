import { fetchMessageBody, hitReadReceipt } from '../apis/message-api.js';

const linkRegex =
  /^https:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b([-a-zA-Z0-9()@:%_\+.~#?&=\/]*)$/g;

const isValidLink = link => {
  const [matchedValue] = link.match(linkRegex) || [];
  if (matchedValue !== undefined && matchedValue.length === link.length)
    return true;
  return false;
};

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
    console.log('Fetching and parsing body for', mid);
    const htmlBody = await fetchMessageBody({
      params: {
        mid,
      },
    });
    const readReceiptLink = getReadReceiptFromBodyString(htmlBody);
    if (!readReceiptLink || !isValidLink(readReceiptLink)) {
      console.log(`No read receipt found for ${mid}`);
      return;
    }
    console.log(`Hitting read receipt for ${mid}`);
    hitReadReceipt(readReceiptLink);
  });
};
