import { UserRole } from '../../users/@types/user-role-type';

export type UserPayload = {
  userID: string;
  role: UserRole;
};

export type UserRefreshTokenPayload = {
  userID: string;
  role: UserRole;
  isRefreshToken: boolean;
};
