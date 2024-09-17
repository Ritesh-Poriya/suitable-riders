export interface IEnvironmentVariables {
  MONGO_URL: string;
  MONGO_DB_NAME: string;
  NODE_ENV: 'dev' | 'prod' | 'test' | 'local';
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
}

export type NODE_ENV_TYPE = 'dev' | 'prod' | 'test' | 'local';
