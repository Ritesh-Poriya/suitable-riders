import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApprovalStatus } from '../common/@types/approval-status';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from './@types/user-role-type';
import { UserStatus } from './@types/user-status-types';
import { IsUserExistDto } from './dtos/is-user-exist.dto';
import {
  UserSettings,
  UserSettingsDocument,
} from './entity/user-settings.entity';
import { User, UserDocument } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSettings.name)
    private readonly userSettingsModel: Model<UserSettingsDocument>,
    private logger: Logger,
  ) {}

  public async validateContact(email: string, phoneNo: string, role: UserRole) {
    this.logger.debug(
      `UserService.validateContact() email: ${email} - phoneNo: ${phoneNo} - role: ${role}`,
    );
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

  public async findOneById(id: string): Promise<UserDocument> {
    this.logger.debug(`UserService.findOneById() id: ${id}`);
    return await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });
  }

  public async findOneByEmail(
    email: string,
    role: UserRole,
  ): Promise<UserDocument> {
    this.logger.debug(
      `UserService.findOneByEmail() email: ${email} role: ${role}`,
    );
    return await this.userModel.findOne({
      email,
      roles: role,
      isDeleted: false,
    });
  }

  public async findOneByContact(contact: string) {
    this.logger.debug(`UserService.findOneByContact() contact: ${contact}`);
    return await this.userModel.findOne({
      $or: [{ email: contact }, { phoneNo: contact }],
      isDeleted: false,
    });
  }

  public async checkIsUserBlocked(userID: string) {
    this.logger.debug(`UserService.checkIsUserBlocked() userID: ${userID}`);
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userID),
      isDeleted: false,
    });
    return user && user.status === UserStatus.BLOCKED;
  }

  public async findOneByPhoneNo(
    phoneNo: string,
    role: UserRole,
  ): Promise<UserDocument> {
    this.logger.debug(
      `UserService.findOneByPhoneNo() phoneNo: ${phoneNo} role: ${role}`,
    );
    return await this.userModel.findOne({
      phoneNo,
      roles: role,
      isDeleted: false,
    });
  }

  public async findOneByEmailOrPhoneNo(
    email: string,
    phoneNo: string,
    role: UserRole,
  ): Promise<UserDocument> {
    this.logger.debug(
      `UserService.findOneByEmailOrPhoneNo() email: ${email}  phoneNo: ${phoneNo} role: ${role}`,
    );
    return await this.userModel.findOne({
      $or: [{ email }, { phoneNo }],
      roles: role,
      isDeleted: false,
    });
  }

  public async deleteUser(userID: string, user: UserPayload) {
    this.logger.debug(
      `UserService.deleteUser() userID: ${userID} user: ${JSON.stringify(
        user,
      )}`,
    );
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

  public async updateUsersPhoneNo(id: string, phoneNo: string) {
    this.logger.debug(
      `UserService.updateUsersPhoneNo() id: ${id} phoneNo: ${phoneNo}`,
    );
    return this.userModel.findByIdAndUpdate(id, { phoneNo }, { new: true });
  }

  public async updateEmail(id: string, email: string) {
    this.logger.debug(`UserService.updateEmail() id: ${id}  email: ${email}`);
    return this.userModel.findByIdAndUpdate(
      id,
      {
        email: email,
      },
      { new: true },
    );
  }
  public async findOneByContactAndRole(contact: string, role: UserRole) {
    this.logger.debug(
      `UserService.findOneByContactAndRole() contact: ${contact} role: ${role}`,
    );
    return await this.userModel.findOne({
      $or: [{ email: contact }, { phoneNo: contact }],
      role: role,
      isDeleted: false,
    });
  }
  public async isUserExist(dto: IsUserExistDto) {
    this.logger.debug(`UserService.isUserExist() dto: ${JSON.stringify(dto)}`);
    const user = await this.findOneByContact(dto.contact);
    return user ? true : false;
  }

  public async updateUserStatus(id: string, status: string) {
    this.logger.debug(
      `UserService.updateUserStatus() id: ${id} status: ${status}`,
    );
    if (status === ApprovalStatus.APPROVED) {
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            approvalStatus: status,
            role: UserRole.MERCHANT,
            isSubscriptionActive: true,
          },
        },
      );
    } else {
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { approvalStatus: status } },
      );
    }
    return true;
  }

  public async updateProfileImage(id: string, image: string) {
    this.logger.debug(
      `UserService.updateProfileImage() id: ${id} image: ${image}`,
    );
    const user = await this.userModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { profileImage: image } },
    );
    return user;
  }

  public async getUserIDsWithNotificationsTurnedOn(userIDs: string[]) {
    this.logger.debug(
      `UserService.getUserIDsWithNotificationsTurnedOn() userIDs: ${userIDs}`,
    );
    const ids = userIDs.map(
      (userID: string | Types.ObjectId) => new Types.ObjectId(userID),
    );
    const userSettings = await this.userSettingsModel.find({
      userID: { $in: ids },
      isDeleted: false,
      pushNotification: true,
    });
    return userSettings.map((userSetting) => userSetting.userID);
  }
  public async getAllDriverUsers() {
    return await this.userModel.find({
      role: UserRole.DRIVER,
      isDeleted: false,
    });
  }

  public async getAllMerchantUsers() {
    return await this.userModel.find({
      role: UserRole.MERCHANT,
      approvalStatus: ApprovalStatus.APPROVED,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    });
  }
  /**
   * Function to update user Subscription
   */
  public async updateUserSubscription(
    userID: string,
    isSubscriptionActive: boolean,
  ) {
    this.logger.debug(
      `UserService.updateUserSubscription() userID: ${userID} isSubscriptionActive: ${isSubscriptionActive}`,
    );
    return await this.userModel.updateOne(
      { _id: new Types.ObjectId(userID) },
      {
        $set: {
          isSubscriptionActive: isSubscriptionActive,
        },
      },
    );
  }
  /**
   *Function to check user subscription
   */
  public async isSubscriptionActive(userID: string) {
    this.logger.debug(`UserService.isSubscriptionActive()userID: ${userID}`);
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userID),
      isDeleted: false,
    });
    return user && user.isSubscriptionActive == false;
  }

  /**
   *Function to get user subscription status
   */
  public async isSubscription(userID: string) {
    this.logger.debug(`UserService.isSubscription() userID: ${userID}`);
    const isSubscribe = await this.userModel.findById({
      _id: new Types.ObjectId(userID),
    });
    return isSubscribe.isSubscriptionActive;
  }

  /**
   * Function to get merchant count
   */
  public async getMerchantCount() {
    return await this.userModel.count({
      isDeleted: false,
      role: UserRole.MERCHANT,
    });
  }

  // Delete user by id
  public async deleteUserByID(userID: string) {
    this.logger.debug(`UserService.deleteUserByID() userID: ${userID}`);
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

  // Get merchant without merchantProfile
  public async getIncompleteMerchantProfile() {
    const users = await this.userModel.aggregate([
      {
        $match: {
          isDeleted: false,
          role: UserRole.NOT_VERIFIED_MERCHANT,
        },
      },
      {
        $lookup: {
          from: 'merchantprofiles',
          localField: '_id',
          foreignField: 'ownerID',
          as: 'merchantProfile',
        },
      },
      {
        $match: {
          'merchantProfile.0': { $exists: false },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    return users;
  }
}
