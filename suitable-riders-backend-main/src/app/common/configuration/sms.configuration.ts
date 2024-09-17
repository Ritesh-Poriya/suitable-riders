export default () => {
  if (!process.env.SMS_APT_KEY) {
    throw new Error('SMS_API_KEY environment variable is not defined.');
  }
  if (!process.env.SMS_URL) {
    throw new Error('SMS_URL environment variable is not defined.');
  }
  if (!process.env.SMS_SENDER_ID) {
    throw new Error('SMS_SENDER_ID environment variable is not defined.');
  }
  return {
    sms: {
      key: process.env.SMS_APT_KEY,
      url: process.env.SMS_URL,
      senderID: process.env.SMS_SENDER_ID,
    },
  };
};
