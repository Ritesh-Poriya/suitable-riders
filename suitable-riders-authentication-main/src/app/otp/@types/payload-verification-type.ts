import { UserRole } from 'src/app/users/@types/user-role-type';

export interface PayloadVerificationType {
  email: string;
  phoneNo: string;
  role: UserRole;
}
