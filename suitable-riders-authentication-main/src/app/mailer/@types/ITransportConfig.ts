export type TransporterConfig =
  | {
      service: string;
      auth: {
        user: string;
        pass: string;
      };
    }
  | {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };

export type MailerConfig = {
  templateFolderPath: string;
  transportConfig: TransporterConfig;
};
