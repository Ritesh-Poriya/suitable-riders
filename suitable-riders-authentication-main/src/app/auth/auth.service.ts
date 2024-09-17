import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignUpRequestDTO } from './dtos/signup-request.dto';
import { UserRole } from '../users/@types/user-role-type';
import { SignUpVerifyDTO } from './dtos/signup-verify.dto';
import { JwtService } from '../jwt/jwt.service';
import { UserDocument } from '../users/entity/user.entity';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { LogInDTO } from './dtos/login.dto';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { OTPService } from '../otp/otp.service';
import { OTPRequestFactory } from '../otp/otp-request.factory';
import { ApprovalStatus } from '../users/@types/approval-status';
import { CreateAdminDTO } from './dtos/create-admin.dto';
import { HttpService } from '@nestjs/axios';
import { environment } from 'src/environments';
import { UtilService } from '../common/util.service';
import { UserStatus } from '../users/@types/user-status-types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthEventType } from './@types/auth-event-types';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import * as bcrypt from 'bcrypt';
import { ManagerAdminLoginReqDTO } from './dtos/login-manager-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OTPService,
    private jwtService: JwtService,
    private firebaseAuth: FirebaseAuthService,
    private otpRequestFactory: OTPRequestFactory,
    private http: HttpService,
    private utilService: UtilService,
    private logger: Logger,
    private eventEmitter: EventEmitter2,
  ) {}

  async signupRequest(signupRequestDto: SignUpRequestDTO, forRole: UserRole) {
    const { email, phoneNo } = signupRequestDto;
    const user = await this.usersService.findOneByEmailOrPhoneNo(
      email,
      phoneNo,
      forRole,
    );
    if (user) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_ALREADY_EXISTS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.USER_EXIST,
      );
    }
    await this.usersService.validateContact(email, phoneNo, forRole);
    const otpRequest = this.otpRequestFactory.otpRequestForSignUp({
      email,
      phoneNo,
      role: forRole,
    });
    const { uid } = await this.otpService.sendOTP(otpRequest);
    return {
      uid,
    };
  }

  async signupVerify(
    signupVerifyDto: SignUpVerifyDTO,
    uid: string,
    forRole: UserRole,
  ) {
    const { email, username } = signupVerifyDto;

    let firebaseUser: UserRecord;
    try {
      firebaseUser = await this.firebaseAuth.getUserFromIDToken(
        signupVerifyDto.firebaseIdToken,
      );
    } catch (error) {
      this.logger.error(error);
      throw new CustomHTTPException(
        {
          key: 'errors.BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.BAD_REQUEST,
      );
    }

    const verifyOTP = await this.otpService.verifyOTP({
      otp: signupVerifyDto.otp,
      uid,
      payload: {
        email,
        phoneNo: firebaseUser.phoneNumber,
        role: forRole,
      },
    });

    if (verifyOTP) {
      const user = await this.usersService.createUserForRole(
        {
          email,
          phoneNo: firebaseUser.phoneNumber,
          username,
        },
        forRole,
      );
      if (forRole === UserRole.DRIVER) {
        // this.eventEmitter.emit(AuthEventType.DRIVER_REGISTERED, user);
      } else {
        this.eventEmitter.emit(AuthEventType.MERCHANT_REGISTERED, user);
      }

      return this.logInWithUser(user, forRole);
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.MERCHANT_NOT_VERIFIED_IN_SE',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.MERCHANT_NOT_VERIFIED_IN_SE,
      );
    }
  }

  async loginWithRefreshToken(refreshToken: string) {
    const payload = await this.jwtService.validateRefreshToken(refreshToken);
    return this.logInWithUserID(payload.userID, payload.role);
  }

  private async logInWithUser(user: UserDocument, role: UserRole) {
    return this.logIn({
      user: user,
      role,
    });
  }

  private async logInWithUserID(userID: string, role: UserRole) {
    return this.logIn({
      userID,
      role,
    });
  }

  private async logInWithContact(contact: string, role: UserRole) {
    return this.logIn({
      contact,
      role,
    });
  }

  private async logIn(attr: {
    contact?: string;
    user?: UserDocument;
    userID?: string;
    role: UserRole;
  }) {
    let user: UserDocument = null;
    if (attr?.user) {
      user = attr.user;
    } else if (attr?.userID) {
      user = await this.usersService.findOneById(attr.userID);
    } else if (attr?.contact) {
      user = await this.usersService.findOneByContactAndRole(
        attr.contact,
        attr.role,
      );
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new CustomHTTPException(
        {
          key: 'errors.ACCOUNT_BLOCKED',
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.USER_BLOCKED,
      );
    }
    if (!user) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.USER_NOT_FOUND,
      );
    }
    const accessToken = this.jwtService.signAccessToken({
      userID: user.id,
      role: user.role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userID: user.id,
      role: user.role,
    });
    this.usersService.handleUserLogin(user._id);
    return {
      credentials: {
        accessToken,
        refreshToken,
        expiresIn: this.jwtService.getAccessTokenExpiryTime(true),
      },
      user,
    };
  }

  async handleLogin(loginDto: LogInDTO, role: UserRole) {
    try {
      const user = await this.firebaseAuth.getUserFromIDToken(
        loginDto.firebaseIdToken,
      );
      return this.logInWithContact(user.phoneNumber, role);
    } catch (error) {
      this.logger.error(error);
      throw new CustomHTTPException(
        {
          key: 'errors.BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.BAD_REQUEST,
      );
    }
  }

  async createAdminRequest(createAdmin: CreateAdminDTO) {
    const {
      data: { data },
    } = await this.utilService.observableToPromise(
      this.http.get(`${environment.seUrl}api/v0/admin/me`, {
        headers: {
          Authorization: `Bearer ${createAdmin.accessToken}`,
        },
      }),
    );
    let approvalStatus = ApprovalStatus.PENDING;
    if (data.user.status === 'VERIFIED') {
      approvalStatus = ApprovalStatus.APPROVED;
      const user = await this.usersService.createUserForRole(
        {
          email: data.user.email,
          phoneNo: data.user.phoneNumber,
          username: data.user.userName,
        },
        UserRole.MERCHANT,
        approvalStatus,
        true,
      );

      this.eventEmitter.emit(AuthEventType.MERCHANT_REGISTERED, user);
      return this.logInWithUser(user, UserRole.MERCHANT);
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.MERCHANT_NOT_VERIFIED_IN_SE',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.MERCHANT_NOT_VERIFIED_IN_SE,
      );
    }
  }

  public async loginManagerAdmin(dto: ManagerAdminLoginReqDTO) {
    const managerAdmin = await this.usersService.findOneByContact(dto.email);
    if (!managerAdmin) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.USER_NOT_FOUND,
      );
    }
    const validPassword = await bcrypt.compare(
      dto.password,
      managerAdmin.password,
    );
    if (!validPassword) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_CREDENTIALS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_CREDENTIALS,
      );
    }

    const accessToken = this.jwtService.signAccessToken({
      userID: managerAdmin?._id,
      role: managerAdmin?.role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userID: managerAdmin?._id,
      role: managerAdmin?.role,
    });
    return {
      credentials: {
        accessToken,
        refreshToken,
        expiresIn: this.jwtService.getAccessTokenExpiryTime(true),
      },
      managerAdmin,
    };
  }
}
