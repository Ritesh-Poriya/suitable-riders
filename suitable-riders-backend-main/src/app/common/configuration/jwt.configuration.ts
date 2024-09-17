import path from 'path';
import fs from 'fs';
import { ConfigService } from '@nestjs/config';

const secretsFolder = `../../../environments/${process.env.NODE_ENV}/secrets`;

const convertExpireInToMilliSeconds = (expireIn: string): number => {
  const regex = /(\d+)([smhd])/;
  const match = regex.exec(expireIn);
  if (match) {
    const [, value, unit] = match;
    const accessTokenExpireIn = Number(value);
    switch (unit) {
      case 's':
        return accessTokenExpireIn * 1000;
      case 'm':
        return accessTokenExpireIn * 1000 * 60;
      case 'h':
        return accessTokenExpireIn * 1000 * 60 * 60;
      case 'd':
        return accessTokenExpireIn * 1000 * 60 * 60 * 24;
      default:
        throw new Error('Invalid JWT_ACCESS_EXPIRES_IN');
    }
  } else {
    throw new Error('Invalid JWT_ACCESS_EXPIRES_IN');
  }
};

export default async () => {
  let accessTokenExpireIn = 0;
  let refreshTokenExpireIn = 0;
  if (!process.env.JWT_ACCESS_EXPIRES_IN) {
    throw new Error(
      'JWT_ACCESS_EXPIRES_IN environment variable is not defined.',
    );
  } else {
    accessTokenExpireIn = convertExpireInToMilliSeconds(
      process.env.JWT_ACCESS_EXPIRES_IN,
    );
  }
  if (!process.env.JWT_REFRESH_EXPIRES_IN) {
    throw new Error(
      'JWT_REFRESH_EXPIRES_IN environment variable is not defined.',
    );
  } else {
    refreshTokenExpireIn = convertExpireInToMilliSeconds(
      process.env.JWT_REFRESH_EXPIRES_IN,
    );
  }

  const publicKey = await fs.readFileSync(
    path.resolve(__dirname, `${secretsFolder}/jwtRS256.key.pub`),
    'utf8',
  );

  return {
    jwtConfig: new ConfigService({
      accessTokenExpireIn,
      refreshTokenExpireIn,
      accessTokenOptions: {
        algorithm: 'RS256',
        expiresIn: `${accessTokenExpireIn / 1000}s`,
      },
      refreshTokenOptions: {
        algorithm: 'RS256',
        expiresIn: `${refreshTokenExpireIn / 1000}s`,
      },
      publicKey,
    }),
  };
};
