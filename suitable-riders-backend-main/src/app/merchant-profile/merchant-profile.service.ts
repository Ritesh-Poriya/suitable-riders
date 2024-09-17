import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { environment } from 'src/environments';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { UtilService } from '../common/util.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { HttpService } from '@nestjs/axios';
import { MediaService } from '../media/media.service';
import { UsersService } from '../users/users.service';
import {
  CreateMerchantProfileReqDTO,
  CreateMerchantProfileResDTO,
} from './dto/create-merchant-profile.dto';
import { UpdateMerchantProfileReqSwaggerDTO } from './dto/update-merchant-profile.dto';
import { UpdateMerchantProfileStatusReqDTO } from './dto/update-merchant-profile-status.dto';
import {
  MerchantProfile,
  MerchantProfileDocument,
} from './entity/merchant-profile.entity';
import { ProtectionType } from '../media/@types/protection-type';
import { CreateMerchantProfileFromSeReqDTO } from './dto/create-merchant-profile-from-se.dto';
import { ApprovalStatus } from '../common/@types/approval-status';
import { JobService } from '../job/job.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventTypes } from '../common/@types/eventType';
import { searchMerchantProfileReqDTO } from './dto/search-merchant-profile.dto';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { MerchantEventType } from './@types/merchant-event-type';
import { GetRemainingSubscriptionMerchantProfileReqDTO } from './dto/subscription-remaining-merchant-profile.dto';
import moment from 'moment';
@Injectable()
export class MerchantProfileService {
  constructor(
    private mediaService: MediaService,
    private utilService: UtilService,
    private http: HttpService,
    private userService: UsersService,
    @Inject(forwardRef(() => JobService)) private jobService: JobService,
    private eventEmitter: EventEmitter2,
    @InjectModel(MerchantProfile.name)
    private merchantModel: Model<MerchantProfileDocument>,
    private logger: Logger,
  ) {}

  /**
   * Function to create merchantProfile
   */
  public async create(
    dto: CreateMerchantProfileReqDTO,
    user: UserPayload,
  ): Promise<CreateMerchantProfileResDTO> {
    this.logger.debug(
      `MerchantProfileService.create() dto: ${JSON.stringify(
        dto,
      )} user: ${JSON.stringify(user)}`,
    );
    try {
      const foundMerchant = await this.merchantModel.findOne({
        ownerID: user.userID,
        isDeleted: false,
      });
      if (foundMerchant) {
        throw new CustomHTTPException(
          {
            key: 'errors.MERCHANT_ALREADY_EXISTS',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.MERCHANT_PROFILE_ALREADY_EXISTS,
        );
      }
      const newProfileImage = await this.mediaService.moveFile(
        dto.businessInfo.profileImage,
        user.userID,
      );
      const newPhotoID = await this.mediaService.moveFile(
        dto.photoIDInfo.photoID,
        user.userID,
      );
      const newTexCertificate = await this.mediaService.moveFile(
        dto.TaxCertificateInfo.TaxCertificate,
        user.userID,
      );
      const newVATCertificate = await this.mediaService.moveFile(
        dto.VATCertificateInfo.VATCertificate,
        user.userID,
      );
      const merchant = await this.merchantModel.create({
        ownerID: user.userID,
        'businessInfo.profileImage': newProfileImage,
        'photoIDInfo.photoID': newPhotoID,
        'TaxCertificateInfo.TaxCertificate': newTexCertificate,
        'VATCertificateInfo.VATCertificate': newVATCertificate,
        ...dto,
      });
      await this.userService.updateProfileImage(
        user.userID,
        merchant.businessInfo.profileImage,
      );
      await this.eventEmitter.emit(
        MerchantEventType.SUCCESSFULLY_APPLIED_FOR_MERCHANT_ENROLLMENT,
        merchant.ownerID,
      );
      return merchant;
    } catch (error) {
      throw error;
    }
  }
  //
  public get merchantProfileModel() {
    return this.merchantModel;
  }

  /**
   * Function to update merchant profile details
   */
  private async update(merchant: Partial<MerchantProfile>, id: string) {
    this.logger.debug(
      `MerchantProfileService.update() merchant: ${merchant} id: ${id}`,
    );
    const prevObj = await this.merchantModel.findOne({
      ownerID: new Types.ObjectId(id),
    });
    if (
      merchant.businessInfo.profileImage &&
      prevObj.businessInfo.profileImage &&
      prevObj.businessInfo.profileImage !== merchant.businessInfo.profileImage
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.businessInfo.profileImage);
      } catch (error) {
        this.logger.error(error);
      }
      merchant.businessInfo.profileImage = await this.mediaService.moveFile(
        merchant.businessInfo.profileImage,
        String(prevObj.ownerID),
      );
    }
    if (
      merchant.photoIDInfo.photoID &&
      prevObj.photoIDInfo.photoID &&
      prevObj.photoIDInfo.photoID !== merchant.photoIDInfo.photoID
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.photoIDInfo.photoID);
      } catch (error) {
        this.logger.error(error);
      }
      merchant.photoIDInfo.photoID = await this.mediaService.moveFile(
        merchant.photoIDInfo.photoID,
        String(prevObj.ownerID),
      );
    }
    if (
      merchant.TaxCertificateInfo.TaxCertificate &&
      prevObj.TaxCertificateInfo.TaxCertificate &&
      prevObj.TaxCertificateInfo.TaxCertificate !==
        merchant.TaxCertificateInfo.TaxCertificate
    ) {
      try {
        await this.mediaService.deleteFile(
          prevObj.TaxCertificateInfo.TaxCertificate,
        );
      } catch (error) {
        this.logger.error(error);
      }
      merchant.TaxCertificateInfo.TaxCertificate =
        await this.mediaService.moveFile(
          merchant.TaxCertificateInfo.TaxCertificate,
          String(prevObj.ownerID),
        );
    }
    if (
      merchant.VATCertificateInfo.VATCertificate &&
      prevObj.VATCertificateInfo.VATCertificate &&
      prevObj.VATCertificateInfo.VATCertificate !==
        merchant.VATCertificateInfo.VATCertificate
    ) {
      try {
        await this.mediaService.deleteFile(
          prevObj.VATCertificateInfo.VATCertificate,
        );
      } catch (error) {
        this.logger.error(error);
      }
      merchant.VATCertificateInfo.VATCertificate =
        await this.mediaService.moveFile(
          merchant.VATCertificateInfo.VATCertificate,
          String(prevObj.ownerID),
        );
    }
    const updatedMerchant = await this.merchantModel.findOneAndUpdate(
      { ownerID: new Types.ObjectId(id) },
      {
        $set: merchant,
      },
      { new: true },
    );
    await this.userService.updateProfileImage(
      String(prevObj.ownerID),
      merchant.businessInfo.profileImage,
    );
    return updatedMerchant;
  }

  public async updateMerchant(
    dto: UpdateMerchantProfileReqSwaggerDTO,
    user: UserPayload,
    id: string,
  ) {
    this.logger.debug(
      `MerchantProfileService.updateMerchant() dto:${JSON.stringify(
        dto,
      )} user: ${user}, id: ${id}`,
    );
    const merchantProfile = await this.merchantModel.findOne({
      ownerID: new Types.ObjectId(id),
    });
    const isAUthorized = await this.checkAuthorization(
      user,
      merchantProfile._id,
    );
    if (!isAUthorized) {
      throw new CustomHTTPException(
        {
          key: 'errors.FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    return await this.update(dto, id);
  }

  /**
   * Function to check merchant authorization
   */
  public async checkAuthorization(user: UserPayload, id: string) {
    this.logger.debug(
      `MerchantProfileService.checkAuthorization() user: ${user} id: ${id}`,
    );
    const merchant = await this.merchantModel.findOne({
      _id: id,
    });
    if (!merchant) {
      throw new CustomHTTPException(
        {
          key: 'errors.MERCHANT_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    }
    return true;
  }

  /**
   * Function to get merchantProfile
   */
  public async getMerchant(id: string, user: UserPayload) {
    this.logger.debug(
      `MerchantProfileService.getMerchant() id: ${id} user: ${JSON.stringify(
        user,
      )}`,
    );
    const isAuthorized = await this.checkAuthorization(user, id);
    if (!isAuthorized) {
      throw new CustomHTTPException(
        {
          key: 'errors.FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    const merchantRes = await this.merchantModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('ownerID');
    if (!merchantRes) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    } else {
      return merchantRes;
    }
  }

  /**
   * Function to get merchantProfile by userID
   */
  public async getMyMerchantProfile(userID: string) {
    this.logger.debug(
      `MerchantProfileService.getMyMerchantProfile() userID: ${userID}`,
    );
    const merchantProfile = await this.merchantModel.findOne({
      ownerID: new Types.ObjectId(userID),
    });
    if (!merchantProfile) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    }
    return merchantProfile;
  }

  /**
   * Function to update status of documents
   */
  public async updateStatus(
    dto: UpdateMerchantProfileStatusReqDTO,
    id: string,
  ) {
    this.logger.debug(
      `MerchantProfileService.updateStatus() dto:${JSON.stringify(
        dto,
      )} id:${id}`,
    );
    const merchant = await this.merchantModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: false },
      {
        $set: {
          businessInfo: dto.businessInfo,
          photoIDInfo: dto.photoIDInfo,
          TaxCertificateInfo: dto.TaxCertificateInfo,
          VATCertificateInfo: dto.VATCertificateInfo,
          rejectionReason: dto.rejectionReason,
        },
      },
      { new: true },
    );
    if (
      dto.businessInfo.businessStatus === ApprovalStatus.APPROVED &&
      dto.photoIDInfo.photoIDStatus === ApprovalStatus.APPROVED &&
      dto.TaxCertificateInfo.TaxCertificateStatus === ApprovalStatus.APPROVED &&
      dto.VATCertificateInfo.VATCertificateStatus === ApprovalStatus.APPROVED
    ) {
      await this.eventEmitter.emit(
        MerchantEventType.MERCHANT_ACCOUNT_APPROVED,
        merchant.ownerID,
      ),
        await this.userService.updateUserStatus(
          String(merchant.ownerID),
          ApprovalStatus.APPROVED,
        );
    } else if (
      dto.businessInfo.businessStatus === ApprovalStatus.REJECTED ||
      dto.photoIDInfo.photoIDStatus === ApprovalStatus.REJECTED ||
      dto.TaxCertificateInfo.TaxCertificateStatus === ApprovalStatus.REJECTED ||
      dto.VATCertificateInfo.VATCertificateStatus === ApprovalStatus.REJECTED
    ) {
      await this.eventEmitter.emit(
        MerchantEventType.MERCHANT_VERIFICATION_FAILED,
        merchant.ownerID,
      );
      await this.userService.updateUserStatus(id, ApprovalStatus.REJECTED);
    }

    return merchant;
  }

  /**
   * Create merchant form suitable eats project api =>"https://dev.suitableeats.com/api/v0/getRestaurantDetails/me"
   */
  public async createMerchantFromSe(
    dto: CreateMerchantProfileFromSeReqDTO,
    user: UserPayload,
  ) {
    this.logger.debug(
      `MerchantProfileService.createMerchantFromSe() dto: ${JSON.stringify(
        dto,
      )} user: ${JSON.stringify(user)}`,
    );
    const {
      data: { data },
    } = await this.utilService.observableToPromise(
      this.http.get(`${environment.seUrl}api/v0/getRestaurantDetails/me`, {
        headers: {
          Authorization: `Bearer ${dto.accessToken}`,
        },
      }),
    );
    this.logger.debug('Merchant Profile data from SE', data);
    if (data.admin.status === 'VERIFIED') {
      if (
        data.restaurant.contact.address == null ||
        data.restaurantDetails.photoIDsStep == null ||
        data.restaurantDetails.documentsStep == null ||
        data.restaurantDetails.restaurantInfoStep == null ||
        data.restaurantDetails.bankDetailsStep == null
      ) {
        throw new CustomHTTPException(
          {
            key: 'errors.INSUFFICIENT_DATA',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.BAD_REQUEST,
        );
      } else {
        const icon = data.restaurant.icon;
        const photoId = data.restaurantDetails.photoIDsStep.photoIDs;
        const VATCertificate =
          data.restaurantDetails.documentsStep.VATCertificate;
        const TaxCertificate =
          data.restaurantDetails.documentsStep.TaxCertificate;
        let resIcon = '';
        if (icon) {
          resIcon = await this.mediaService.downloadFile(
            `${environment.seUrl}${icon}`,
            ProtectionType.PUBLIC,
          );
        }
        const photoIDs = await this.mediaService.downloadFile(
          `${environment.seUrl}${photoId[0]}`,
          ProtectionType.PRIVATE,
        );
        let VATCert = '';
        if (VATCertificate) {
          VATCert = await this.mediaService.downloadFile(
            `${environment.seUrl}${VATCertificate}`,
            ProtectionType.PRIVATE,
          );
        }
        const TaxCert = await this.mediaService.downloadFile(
          `${environment.seUrl}${TaxCertificate}`,
          ProtectionType.PRIVATE,
        );

        const isMerchantExist = await this.merchantModel.findOne({
          ownerID: new Types.ObjectId(user.userID),
        });

        let merchant;

        if (isMerchantExist) {
          const approvalStatus = [
            ApprovalStatus.PENDING,
            ApprovalStatus.REJECTED,
            ApprovalStatus.IN_REVIEW,
          ];
          if (
            approvalStatus.includes(
              isMerchantExist.businessInfo.businessStatus,
            ) ||
            approvalStatus.includes(
              isMerchantExist.photoIDInfo.photoIDStatus,
            ) ||
            approvalStatus.includes(
              isMerchantExist.TaxCertificateInfo.TaxCertificateStatus,
            ) ||
            approvalStatus.includes(
              isMerchantExist.VATCertificateInfo.VATCertificateStatus,
            )
          ) {
            merchant = await this.update(
              {
                businessInfo: {
                  businessName: data.restaurant.restaurantName,
                  profileImage: resIcon,
                  email: data.restaurant.contact.email,
                  phoneNo: data.restaurant.contact.phoneNumber,
                  address: {
                    location: data.restaurant.contact.address.location,
                    formattedAddress:
                      data.restaurant.contact.address.formattedAddress,
                    postalCode: data.restaurant.contact.address.postalCode,
                    additionalAddressNotes: '',
                  },
                  businessEntity:
                    data.restaurantDetails.restaurantInfoStep.businessEntity,
                  businessStatus: ApprovalStatus.APPROVED,
                },
                photoIDInfo: {
                  photoID: photoIDs,
                  photoIDStatus: ApprovalStatus.APPROVED,
                },
                VATCertificateInfo: {
                  VATCertificate: VATCert,
                  VATCertificateStatus: ApprovalStatus.APPROVED,
                },
                TaxCertificateInfo: {
                  TaxCertificate: TaxCert,
                  TaxCertificateStatus: ApprovalStatus.APPROVED,
                },
                isContractAccepted: false,
                rejectionReason: '',
              },
              user.userID,
            );
            await this.eventEmitter.emit(
              MerchantEventType.SUCCESSFULLY_APPLIED_FOR_MERCHANT_ENROLLMENT,
              merchant.ownerID,
            );
            await this.userService.updateUserStatus(
              user.userID,
              ApprovalStatus.APPROVED,
            );
          } else {
            merchant = isMerchantExist;
          }
        } else {
          merchant = await this.create(
            {
              businessInfo: {
                businessName: data.restaurant.restaurantName,
                profileImage: resIcon,
                email: data.restaurant.contact.email,
                phoneNo: data.restaurant.contact.phoneNumber,
                address: {
                  location: data.restaurant.contact.address.location,
                  formattedAddress:
                    data.restaurant.contact.address.formattedAddress,
                  postalCode: data.restaurant.contact.address.postalCode,
                  additionalAddressNotes: '',
                },
                businessEntity:
                  data.restaurantDetails.restaurantInfoStep.businessEntity,
                businessStatus: ApprovalStatus.APPROVED,
              },
              photoIDInfo: {
                photoID: photoIDs,
                photoIDStatus: ApprovalStatus.APPROVED,
              },
              VATCertificateInfo: {
                VATCertificate: VATCert,
                VATCertificateStatus: ApprovalStatus.APPROVED,
              },
              TaxCertificateInfo: {
                TaxCertificate: TaxCert,
                TaxCertificateStatus: ApprovalStatus.APPROVED,
              },
              isContractAccepted: false,
              rejectionReason: '',
            },
            user,
          );
          await this.eventEmitter.emit(
            MerchantEventType.SUCCESSFULLY_APPLIED_FOR_MERCHANT_ENROLLMENT,
            merchant.ownerID,
          );
          await this.userService.updateUserStatus(
            user.userID,
            ApprovalStatus.APPROVED,
          );
        }

        return merchant;
      }
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.MERCHANT_NOT_VERIFIED_IN_SE',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.BAD_REQUEST,
      );
    }
  }

  /**
   *  Delete merchant services
   */
  public async deleteMerchantByUserId(user: UserPayload) {
    this.logger.debug(
      `MerchantProfileService.deleteMerchantByUserId() user: ${JSON.stringify(
        user,
      )}`,
    );
    const merchant = await this.merchantModel.findOne({
      ownerID: new Types.ObjectId(user.userID),
      isDeleted: false,
    });
    if (!merchant) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    }
    const activeJobs = await this.jobService.getActiveJobsForMerchantByUserId(
      user.userID,
    );
    if (activeJobs.length > 0) {
      throw new CustomHTTPException(
        {
          key: 'errors.CANNOT_DELETE_MERCHANT_WITH_ACTIVE_JOBS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.CANNOT_DELETE_MERCHANT_WITH_ACTIVE_JOBS,
      );
    }
    await this.merchantModel.updateOne(
      { ownerID: new Types.ObjectId(user.userID) },
      { $set: { isDeleted: true } },
    );
    await this.userService.deleteUser(user.userID, user);
    this.eventEmitter.emit(EventTypes.MerchantDeleted, {
      userID: user.userID,
    });
    return {
      deleted: true,
    };
  }

  /**
   * Get merchant profile by userID
   */
  async getMerchantProfileByUserID(userID: string) {
    this.logger.debug(
      `MerchantProfileService.getMerchantProfileByUserID() userID: ${userID}`,
    );
    return this.merchantModel.findOne({
      ownerID: new Types.ObjectId(userID),
      isDeleted: false,
    });
  }

  /**
   * Search merchant profile
   */
  async searchMerchantProfile(
    dto: searchMerchantProfileReqDTO,
    customSearchQuery: any = null,
  ) {
    this.logger.debug(
      `MerchantProfileService.searchMerchantProfile() dto: ${JSON.stringify(
        dto,
      )}`,
    );
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'merchant.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'businessInfo.businessName': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.email': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.phone': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              merchantNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    const count = await this.merchantModel.count({
      isDeleted: false,
    });
    const filterQuery = {
      ...dto.fields,
      isDeleted: false,
    };
    const merchantProfile = await this.merchantModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filterQuery,
      },
      {
        $match: search,
      },
      { $sort: dto.options.sort || { createdAt: -1 } },
      {
        $skip: dto.options.skip,
      },
      {
        $limit: dto.options.limit,
      },
    ]);
    const filterCount = (
      await this.merchantModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'ownerID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
      ])
    ).length;
    return {
      merchantProfile: merchantProfile,
      filterCount: filterCount,
      totalCount: count,
    };
  }

  async getSubscriptionRemainingMerchant(
    dto: GetRemainingSubscriptionMerchantProfileReqDTO,
    customSearchQuery: any = null,
  ) {
    this.logger.debug(
      `MerchantProfileService.getSubscriptionRemainingMerchant() dto: ${JSON.stringify(
        dto,
      )}`,
    );
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'merchant.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'businessInfo.businessName': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.email': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.phone': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              merchantNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }

    const filterQuery = {
      ...dto.fields,
      isDeleted: false,
    };
    const startOfMonth = moment().startOf('month').toDate();
    const merchantProfile = await this.merchantModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'subscriptiontransactions',
          as: 'transactions',
          let: {
            merchantProfileID: '$_id',
          },
          pipeline: [
            {
              $match: {
                isDeleted: false,
                subscriptionMonth: {
                  $gte: startOfMonth,
                },
                $expr: {
                  $eq: ['$merchantProfileID', '$$merchantProfileID'],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          transactions: [],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: ['transactions'],
      },
      {
        $match: filterQuery,
      },
      {
        $match: search,
      },
      { $sort: dto.options.sort || { 'businessInfo.businessName': -1 } },
      {
        $skip: dto.options.skip,
      },
      {
        $limit: dto.options.limit,
      },
    ]);

    const filteredCount = (
      await this.merchantModel.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: 'subscriptiontransactions',
            as: 'transactions',
            let: {
              merchantProfileID: '$_id',
            },
            pipeline: [
              {
                $match: {
                  isDeleted: false,
                  subscriptionMonth: {
                    $gte: startOfMonth,
                  },
                  $expr: {
                    $eq: ['$merchantProfileID', '$$merchantProfileID'],
                  },
                },
              },
            ],
          },
        },
        {
          $match: {
            transactions: [],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
      ])
    ).length;
    return {
      merchantProfile: merchantProfile,
      filteredCount: filteredCount,
    };
  }

  public async findMerchantByUserId(
    userID: Types.ObjectId,
  ): Promise<MerchantProfileDocument> {
    this.logger.debug(
      `MerchantProfileService.findMerchantByUserId() userID: ${userID}`,
    );
    return await this.merchantModel.findOne({ ownerID: userID });
  }

  public async deleteMerchantProfile(ownerID: string) {
    this.logger.debug(
      `MerchantProfileService.deleteMerchantProfile() ownerID: ${ownerID}`,
    );
    await this.merchantModel.updateOne(
      { ownerID: new Types.ObjectId(ownerID) },
      { $set: { isDeleted: true } },
    );
  }
  public async getNotifications() {
    let notification = false;
    const conditions: any = {
      $or: [
        {
          'TaxCertificateInfo.TaxCertificateStatus': ApprovalStatus.IN_REVIEW,
        },
        {
          'VATCertificateInfo.VATCertificateStatus': ApprovalStatus.IN_REVIEW,
        },
        {
          'photoIDInfo.photoIDStatus': ApprovalStatus.IN_REVIEW,
        },
        {
          'businessInfo.businessStatus': ApprovalStatus.IN_REVIEW,
        },
      ],
    };

    const merchantDetails = await this.merchantModel.find({
      isDeleted: false,
      $and: [conditions],
    });
    if (merchantDetails.length > 0) {
      notification = true;
    }
    return {
      notifications: notification,
      totalCount: merchantDetails.length === 0 ? 0 : merchantDetails.length,
    };
  }

  /**
   * Get inComplete merchant profile
   */
  public async getIncompleteMerchantProfile() {
    const merchant = await this.userService.getIncompleteMerchantProfile();
    return {
      data: merchant,
      merchantCount: merchant.length === 0 ? 0 : merchant.length,
    };
  }
}
