export interface IJwtConfiguration {
  accessTokenExpireIn: number;
  refreshTokenExpireIn: number;
  privateKey: string;
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
