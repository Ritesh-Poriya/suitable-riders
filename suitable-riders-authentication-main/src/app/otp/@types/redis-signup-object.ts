import { UserRole } from '../../users/@types/user-role-type';

export interface SignupSendOTPRequest {
  email: string;
  phoneNo: string;
  role: UserRole;
}
