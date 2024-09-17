export interface ISettingsConfiguration {
  deleteLogsFileAfterDays: number;
  logsArchiveDirPath: string;
  OTPExpireAfterMins: number;
  IPBlocking: {
    sendOTPMaxRetry: number;
    maxWrongOTPTry: number;
    requestRateLimitInMinutes: number;
    wrongOTPRateLimitInMinutes: number;
    blockDurForOTPRetryInMinutes: number;
    blockDurForRetryForMinutes: number;
  };
}
