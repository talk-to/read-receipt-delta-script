import axios from 'axios';

export const sendFlockMessage = async (
  channelURL,
  text,
  attachments,
  flockml
) => {
  const params = {
    text: JSON.stringify(text),
    attachments,
    flockml,
  };

  try {
    await axios.post(channelURL, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.log(error);
  }
};
