export interface IJwtConfiguration {
  accessTokenExpireIn: number;
  refreshTokenExpireIn: number;
  publicKey: string;
  accessTokenOptions: {
    algorithm: string;
    expiresIn: string;
  };
  refreshTokenOptions: {
    algorithm: string;
    expiresIn: string;
  };
}
