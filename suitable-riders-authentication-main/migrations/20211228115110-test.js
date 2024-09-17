module.exports = {
  async up(db) {
    const settings = await db
      .collection('authPlatformSettings')
      .find({})
      .toArray();
    console.log(settings);
    if (settings && settings.length === 0) {
      await db.collection('authPlatformSettings').insertOne({
        deleteLogsFileAfterDays: 1,
        logsArchiveDirPath: '/Users/jaymin/Desktop/temp/archive',
        OTPExpireAfterMins: 5,
        IPBlocking: {
          sendOTPMaxRetry: 4,
          maxWrongOTPTry: 5,
          requestRateLimitInMinutes: 10,
          wrongOTPRateLimitInMinutes: 60,
          blockDurForOTPRetryInMinutes: 1440,
          blockDurForRetryForMinutes: 60,
        },
        dev: {
          deleteLogsFileAfterDays: 2,
          IPBlocking: {
            sendOTPMaxRetry: 4,
            maxWrongOTPTry: 5,
            requestRateLimitInMinutes: 10,
            wrongOTPRateLimitInMinutes: 60,
            blockDurForOTPRetryInMinutes: 1,
            blockDurForRetryForMinutes: 1,
          },
        },
      });
    }
  },

  async down(db) {
    await db.collection('authPlatformSettings').deleteOne({});
  },
};
