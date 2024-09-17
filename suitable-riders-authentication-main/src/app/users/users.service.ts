import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { Model, Types } from 'mongoose';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { OTPRequestFactory } from '../otp/otp-request.factory';
import { OTPService } from '../otp/otp.service';
import { ApprovalStatus } from './@types/approval-status';
import { CreateUserInputType } from './@types/create-user-input';
import { UserRole } from './@types/user-role-type';
import { UpdateStatusReqDTO } from './dtos/disable-user-by-admin.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { UpdatePhoneDto } from './dtos/update-phone.dto';
import { UpdateUserSettingsReqDTO } from './dtos/update-user-setting.dto';
import { VerifyUpdateEmailDto } from './dtos/verify-update-email.dto';
import {
  UserSettings,
  UserSettingsDocument,
} from './entity/user-settings.entity';
import { User, UserDocument } from './entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettingsDocument>,
    private firebaseAuthService: FirebaseAuthService,
    private otpRequestFactory: OTPRequestFactory,
    private otpService: OTPService,
  ) {}

  public async createUserForRole(
    user: CreateUserInputType,
    role: UserRole,
    approvalStatus: ApprovalStatus = ApprovalStatus.PENDING,
    isMerchantFromSE = false,
  ) {
    const isUserExist = await this.findOneByEmailOrPhoneNo(
      user.email,
      user.phoneNo,
      role,
    );

    if (isMerchantFromSE !== true)
      await this.validateContact(user.email, user.phoneNo, role);

    if (isUserExist && isMerchantFromSE === false) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_ALREADY_EXISTS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.USER_EXIST,
      );
    }
    let userProfile;
    if (isMerchantFromSE === true && isUserExist) {
      if (isUserExist.approvalStatus !== ApprovalStatus.APPROVED) {
        userProfile = await this.userModel.findByIdAndUpdate(
          {
            _id: isUserExist._id,
          },
          {
            $set: {
              approvalStatus: approvalStatus,
              role: role,
            },
          },
          { new: true },
        );
      } else {
        throw new CustomHTTPException(
          {
            key: 'errors.USER_ALREADY_EXISTS',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.USER_EXIST,
        );
      }
    } else {
      if (role === UserRole.MERCHANT) {
        userProfile = await this.userModel.create({
          ...user,
          role: UserRole.NOT_VERIFIED_MERCHANT,
          approvalStatus: approvalStatus,
        });
      } else {
        userProfile = await this.userModel.create({
          ...user,
          role: role,
          approvalStatus: ApprovalStatus.APPROVED,
        });
      }
      await this.userSettingsModel.create({
        userID: userProfile._id,
      });
    }
    return userProfile;
  }

  public async handleUserLogin(userID: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne(
      { _id: userID },
      { $set: { lastLogin: new Date() } },
    );
  }
  //will review
  public async validateContact(email: string, phoneNo: string, role: UserRole) {
    const userByEmail = await this.findOneByContactAndRole(email, role);
    if (userByEmail && userByEmail.phoneNo !== phoneNo) {
      throw new CustomHTTPException(
        {
          key: 'errors.EMAIL_ALREADY_EXISTS_WITH_DIFFERENT_PHONE_NO',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.EMAIL_ALREADY_EXISTS_WITH_DIFFERENT_PHONE_NO,
      );
    }
    const userByPhoneNo = await this.findOneByContactAndRole(phoneNo, role);
    if (userByPhoneNo && userByPhoneNo.email !== email) {
      throw new CustomHTTPException(
        {
          key: 'errors.PHONE_NO_ALREADY_EXISTS_WITH_DIFFERENT_EMAIL',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.PHONE_NO_ALREADY_EXISTS_WITH_DIFFERENT_EMAIL,
      );
    }
    return true;
  }
  //No change required
  public async findOneById(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  //Done
  public async findOneByEmail(
    email: string,
    role: UserRole,
  ): Promise<UserDocument> {
    return await this.userModel.findOne({
      email,
      role: role,
      isDeleted: false,
    });
  }
  //Done
  public async findOneByContact(contact: string) {
    return await this.userModel.findOne({
      $or: [{ email: contact }, { phoneNo: contact }],
      isDeleted: false,
    });
  }

  //Done
  public async findOneByPhoneNo(
    phoneNo: string,
    role: UserRole,
  ): Promise<UserDocument> {
    return await this.userModel.findOne({
      phoneNo,
      role: role,
      isDeleted: false,
    });
  }

  //Done
  public async findOneByEmailOrPhoneNo(
    email: string,
    phoneNo: string,
    role: UserRole,
  ): Promise<UserDocument> {
    if (role === UserRole.MERCHANT) {
      return await this.userModel.findOne({
        $or: [{ email }, { phoneNo }],
        role: { $in: [UserRole.MERCHANT, UserRole.NOT_VERIFIED_MERCHANT] },
        isDeleted: false,
      });
    } else {
      return await this.userModel.findOne({
        $or: [{ email }, { phoneNo }],
        role: role,
        isDeleted: false,
      });
    }
  }

  public async deleteUser(role: UserRole, userID: string, user: UserPayload) {
    if (user.userID !== userID) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_NOT_ALLOWED_TO_DELETE',
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.USER_NOT_ALLOWED_TO_DELETE,
      );
    }
    const userToDelete = await this.findOneById(userID);
    if (!userToDelete) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.USER_NOT_FOUND,
      );
    }
    const data = await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(userID),
      },
      { $set: { isDeleted: true } },
    );
    if (data)
      return {
        deleted: true,
        message: `Your account has been deleted successfully.`,
      };
  }

  //No change required
  public async updatePhoneNo(
    updatePhoneDto: UpdatePhoneDto,
    user: UserPayload,
  ) {
    const { firebaseIdToken } = updatePhoneDto;
    let firebaseUser: UserRecord;
    try {
      firebaseUser = await this.firebaseAuthService.getUserFromIDToken(
        firebaseIdToken,
      );
    } catch (error) {
      throw new CustomHTTPException(
        {
          key: 'errors.BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.BAD_REQUEST,
      );
    }
    const userToUpdate = await this.findOneById(user.userID);
    if (!userToUpdate) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_NOT_EXIST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.USER_NOT_FOUND,
      );
    }
    if (userToUpdate.phoneNo === firebaseUser.phoneNumber) {
      throw new CustomHTTPException(
        {
          key: 'errors.PHONE_NO_NOT_CHANGED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.PHONE_NO_NOT_CHANGED,
      );
    }
    userToUpdate.phoneNo = firebaseUser.phoneNumber;
    await userToUpdate.save();
    return userToUpdate;
  }

  //No change required
  public async updateUsersPhoneNo(id: string, phoneNo: string) {
    return this.userModel.findByIdAndUpdate(id, { phoneNo }, { new: true });
  }
  //No change required
  public async updateEmail(id: string, email: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        email: email,
      },
      { new: true },
    );
  }
  //Done
  public async updateRequestEmail(
    updateEmailDto: UpdateEmailDto,
    user: UserPayload,
  ) {
    const otpRequest = this.otpRequestFactory.otpRequestToUpdateEmail(
      updateEmailDto.email,
      user.role,
    );
    return await this.otpService.sendOTP(otpRequest);
  }

  //Done
  public async updateEmailVerify(dto: VerifyUpdateEmailDto, user: UserPayload) {
    const verifyOTP = await this.otpService.verifyOTP({
      uid: dto.uid,
      otp: dto.otp,
      payload: {
        email: dto.email,
        phoneNo: null,
        role: user.role,
      },
    });
    if (verifyOTP) {
      return this.updateEmail(user.userID, dto.email);
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.BAD_REQUEST,
      );
    }
  }

  //done
  public async findOneByContactAndRole(contact: string, role: UserRole) {
    if (role === UserRole.MERCHANT) {
      return await this.userModel.findOne({
        $or: [{ email: contact }, { phoneNo: contact }],
        role: { $in: [UserRole.MERCHANT, UserRole.NOT_VERIFIED_MERCHANT] },
        isDeleted: false,
      });
    } else {
      return await this.userModel.findOne({
        $or: [{ email: contact }, { phoneNo: contact }],
        role: role,
        isDeleted: false,
      });
    }
  }

  //No change required
  public async isUserExist(contact, role) {
    const user = await this.findOneByContactAndRole(contact, role);
    return user ? true : false;
  }
  /**
   *  Function to account disabled by admin
   */
  public async accountDisabledByAdmin(userID: string, dto: UpdateStatusReqDTO) {
    const user = await this.findOneById(userID);
    if (!user) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.USER_NOT_FOUND,
      );
    }
    const blockedUser = await this.userModel.findByIdAndUpdate(
      userID,
      { status: dto.status },
      { new: true },
    );
    return blockedUser;
  }

  public async updateUserSettings(
    dto: UpdateUserSettingsReqDTO,
    user: UserPayload,
  ) {
    const userSetting = await this.userSettingsModel.findOneAndUpdate(
      { userID: new Types.ObjectId(user.userID) },
      { $set: { pushNotification: dto.pushNotification } },
      { new: true },
    );
    return userSetting;
  }

  public async getUserSettings(user: UserPayload) {
    const userSetting = await this.userSettingsModel.findOne({
      userID: new Types.ObjectId(user.userID),
    });
    return userSetting;
  }

  public async createManagerAdmin(dto: {
    email: string;
    username: string;
    password: string;
    role: UserRole;
  }) {
    const isExists = await this.userModel.findOne({
      email: dto.email,
    });
    if (isExists) {
      throw new CustomHTTPException(
        {
          key: 'errors.USER_ALREADY_EXISTS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.USER_ALREADY_EXISTS,
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(dto.password, salt);
    const user = this.userModel.create({
      ...dto,
      password: hashPassword,
    });
    return user;
  }
}
