module.exports = {
  async up(db) {
    await db.collection('authPlatformSettings').updateOne(
      {},
      {
        $set: {
          deleteLogsFileAfterDays: 1,
          logsArchiveDirPath:
            '/home/suitableriders/web/suitableriders.com/logs/nodejs-archive',
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
            logsArchiveDirPath:
              '/home/suitableriders/web/dev.suitableriders.com/logs/nodejs-archive',
            IPBlocking: {
              sendOTPMaxRetry: 4,
              maxWrongOTPTry: 5,
              requestRateLimitInMinutes: 10,
              wrongOTPRateLimitInMinutes: 60,
              blockDurForOTPRetryInMinutes: 1,
              blockDurForRetryForMinutes: 1,
            },
          },
          local: {
            logsArchiveDirPath: '',
          },
        },
      },
    );
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
