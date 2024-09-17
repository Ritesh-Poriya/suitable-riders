import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Job, JobDocument } from './entity/job.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateJobReqDTO, CreateJobResDTO } from './dto/create-job.dto';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { UpdateJobReqDTO } from './dto/update-job.dto';
import { UpdateJobStatusReqDTO } from './dto/update-job-status.dto';
import { CancelJobReqDTO } from './dto/cancel-job.dto';
import { GetJobReqDTO } from './dto/get-job.dto';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { GetMyJobsReqDTO } from './dto/get-my-jobs.dto';
import {
  BucketJobsType,
  JobApprovalStatus,
  JobEventType,
  PreferredPaymentMethod,
} from './@types/job-type';
import { PreferredVehicle } from './@types/job-type';
import { VehicleTypes } from '../vehicle/@types/vehicle-types';
import { UserRole } from '../users/@types/user-role-type';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MerchantProfileService } from '../merchant-profile/merchant-profile.service';
import { DriverProfileService } from '../driver-profile/driver-profile.service';
import { UnexpectedError } from '../common/errors/unexpected.error';
import { PDFService } from '../pdf/pdf.service';
import { User, UserDocument } from '../users/entity/user.entity';
import { VehicleService } from '../vehicle/vehicle.service';
import moment from 'moment-timezone';
import {
  DeclinedJobs,
  DeclinedJobsDocument,
} from './entity/declined-job-entity';
import { Model, Types } from 'mongoose';
import { UtilService } from '../common/util.service';
import { InvoiceService } from './invoice.service';
import { DriverSearchJobFilterDTO } from './dto/driver-search-job.dto';
import { AdminSettingServices } from '../admin-settings/admin-settings.service';
import { NotificationService } from '../notification/notification.service';
import { environment } from 'src/environments';
import { OTPService } from '../otp/otp.services';
import { SaveUserLocationServices } from '../save-user-location/save-user-location.service';
import { SaveUserLocationReqDTO } from '../save-user-location/dto/save-user-location.dto';
import { SMSServices } from '../sms/sms.service';
import { SmsTemplatesService } from '../sms-templates/sms-templates.service';
import { NotificationNotes } from '../notification/@type/notification-type.enum';
import { WebHookEventType } from '../webhook/@types/webhook-type';
import { UnableToDeliverJobReqDTO } from './dto/unable-to-deliver-job.dto';
import { MerchantPayoutEventType } from '../merchant-payouts/@types/merchant-payouts-event-type';
import { MerchantProfile } from '../merchant-profile/entity/merchant-profile.entity';

/**
 * Services of the Job module
 */
@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    private eventEmitter: EventEmitter2,
    private logger: Logger,
    @Inject(forwardRef(() => MerchantProfileService))
    private merchantProfileService: MerchantProfileService,
    @Inject(forwardRef(() => DriverProfileService))
    private driverProfileService: DriverProfileService,
    private pdfService: PDFService,
    @Inject(forwardRef(() => VehicleService))
    private vehicleService: VehicleService,
    @InjectModel(DeclinedJobs.name)
    private declinedJobsModel: Model<DeclinedJobsDocument>,
    private utilService: UtilService,
    private invoiceService: InvoiceService,
    private adminSettingsService: AdminSettingServices,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => OTPService))
    private otpService: OTPService,
    private saveUserLocationServices: SaveUserLocationServices,
    private smsServices: SMSServices,
    private smsTemplateService: SmsTemplatesService,
  ) {}

  /**
   * Function to create new job
   */
  public async createJob(
    dto: CreateJobReqDTO,
    user: UserPayload,
  ): Promise<CreateJobResDTO> {
    this.logger.debug(
      `JobService.createJob() dto: ${JSON.stringify(
        dto,
      )} and user: ${JSON.stringify(user)}`,
    );
    dto.statusLogs = [
      {
        jobStatus: JobApprovalStatus.PENDING,
        date: new Date(),
      },
    ];
    if (dto.preferredVehicle.includes(PreferredVehicle.ANY)) {
      dto.preferredVehicle = Object.values(
        VehicleTypes as unknown as PreferredVehicle,
      ) as PreferredVehicle[];
    }
    const merchantProfileID =
      await this.merchantProfileService.getMerchantProfileByUserID(user.userID);
    try {
      const newJob = await this.jobModel.create({
        ...dto,
        userID: user.userID,
        merchantProfileID: merchantProfileID._id,
      });
      this.eventEmitter.emit(
        JobEventType.NEW_JOB_AVAILABLE_PROCESS,
        String(newJob._id),
      );
      return newJob;
    } catch (error) {
      this.logger.error(error);
      throw new UnexpectedError(error.message);
    }
  }

  /**
   * Select object by id
   */
  public async selectJobById(id: string) {
    this.logger.debug(`JobService.selectJobById() id: ${id}`);
    const isExist = await this.jobModel.findById(id);
    return isExist;
  }

  /**
   * Function to search jobs
   */
  public async searchJobs(
    dto: GetJobReqDTO,
    role: UserRole,
    customSearchQuery: any = null,
  ) {
    this.logger.debug(
      `JobService.searchJobs() dto: ${JSON.stringify(dto)} role: ${role}`,
    );
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'driver.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              customerName: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              jobID: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    this.logger.debug(dto);
    this.logger.debug(search);
    const totalCount = await this.jobModel.count({
      isDeleted: false,
    });
    const unsetList = [
      'driver.approvalStatus',
      'driver.status',
      'driver.isDeleted',
      'driver.role',
      'driver.createdAt',
      'driver.updatedAt',
      'merchant.approvalStatus',
      'merchant.status',
      'merchant.isDeleted',
      'merchant.role',
      'merchant.createdAt',
      'merchant.updatedAt',
      'merchantProfile.isDeleted',
      'merchantProfile.isContractAccepted',
      'merchantProfile.ownerID',
      'merchantProfile.createAt',
      'merchantProfile.updatedAt',
    ];
    if (role === UserRole.ADMIN || role === UserRole.MERCHANT) {
      unsetList.push('otp');
    }
    const filterQuery = {
      ...dto.fields,
      isDeleted: false,
    };
    this.logger.debug(filterQuery);
    const job = await this.jobModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverID',
          foreignField: '_id',
          as: 'driver',
        },
      },
      {
        $lookup: {
          from: 'merchantprofiles',
          localField: 'merchantProfileID',
          foreignField: '_id',
          as: 'merchantProfile',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$merchantProfile',
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
      {
        $unset: unsetList,
      },
    ]);
    const filterCount = (
      await this.jobModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverID',
            foreignField: '_id',
            as: 'driver',
          },
        },
        {
          $lookup: {
            from: 'merchantprofiles',
            localField: 'merchantProfileID',
            foreignField: '_id',
            as: 'merchantProfile',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$driver',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$merchantProfile',
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
      jobs: job,
      totalCount: totalCount,
      filterCount: filterCount,
    };
  }

  /**
   * Function to get jobs by id
   */
  public async getJobById(id: string) {
    const job = await this.jobModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverID',
          foreignField: '_id',
          as: 'driver',
        },
      },
      {
        $lookup: {
          from: 'merchantprofiles',
          localField: 'merchantProfileID',
          foreignField: '_id',
          as: 'merchantProfile',
        },
      },
      {
        $lookup: {
          from: 'driverprofiles',
          localField: 'driverProfileID',
          foreignField: '_id',
          as: 'driverProfile',
        },
      },
      {
        $lookup: {
          from: 'locationLogs',
          let: {
            driverID: '$driverID',
            createdAt: '$createdAt',
            updatedAt: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$jobStatus', JobApprovalStatus.ACCEPTED] },
                    {
                      $eq: ['$jobStatus', JobApprovalStatus.ARRIVED_TO_PICKUP],
                    },
                    { $eq: ['$jobStatus', JobApprovalStatus.PICKEDUP] },
                  ],
                },
                new Date(Date.now()),
                '$updatedAt',
              ],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$response.userID', '$$driverID'] },
                    { $gte: ['$response.updatedAt', '$$createdAt'] },
                    { $lte: ['$response.updatedAt', '$$updatedAt'] },
                  ],
                },
              },
            },
            {
              $project: {
                location: '$response.location',
                userID: '$response.userID',
                createdAt: '$response.createdAt',
                updatedAt: '$response.updatedAt',
              },
            },
          ],
          as: 'driverLocations',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$merchantProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driverProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: [
          'driver.approvalStatus',
          'driver.status',
          'driver.isDeleted',
          'driver.role',
          'driver.createdAt',
          'driver.updatedAt',
        ],
      },
      {
        $unset: [
          'merchant.approvalStatus',
          'merchant.status',
          'merchant.isDeleted',
          'merchant.role',
          'merchant.createdAt',
          'merchant.updatedAt',
        ],
      },
      {
        $unset: [
          'merchantProfile.isDeleted',
          'merchantProfile.isContractAccepted',
          'merchantProfile.ownerID',
          'merchantProfile.createAt',
          'merchantProfile.updatedAt',
        ],
      },
      {
        $unset: [
          'driverProfile.isDeleted',
          'driverProfile.isContractAccepted',
          'driverProfile.ownerID',
          'driverProfile.createAt',
          'driverProfile.updatedAt',
        ],
      },
    ]);
    if (job.length === 0) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    } else {
      return job[0];
    }
  }

  /**
   * Function to get riders coordinations
   */
  public async getRidersCoordinationsByOrderID(id: string) {
    const job = await this.jobModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'locationLogs',
          let: {
            driverID: '$driverID',
            createdAt: '$createdAt',
            updatedAt: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$jobStatus', JobApprovalStatus.ACCEPTED] },
                    {
                      $eq: ['$jobStatus', JobApprovalStatus.ARRIVED_TO_PICKUP],
                    },
                    { $eq: ['$jobStatus', JobApprovalStatus.PICKEDUP] },
                  ],
                },
                new Date(Date.now()),
                '$updatedAt',
              ],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$response.userID', '$$driverID'] },
                    { $gte: ['$response.updatedAt', '$$createdAt'] },
                    { $lte: ['$response.updatedAt', '$$updatedAt'] },
                  ],  
                },
              },
            },
            {
              $project: {
                location: '$response.location',
                userID: '$response.userID',
                createdAt: '$response.createdAt',
                updatedAt: '$response.updatedAt',
              },
            },
          ],
          as: 'driverLocations',
        },
      },
      {
        $project:
          {
            driverLocations: 1,
          },
      },
    ]);

    if (job.length === 0) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    } else {
      return job[0].driverLocations;
    }
  }

  /**
   * Function to get running job
   */
  public async getRunningJOb(userID: string) {
    this.logger.debug(`JobService.getRunningJOb: userID: ${userID}`);
    const jobs = await this.jobModel.aggregate([
      {
        $match: {
          driverID: new Types.ObjectId(userID),
          isDeleted: false,
          jobStatus: {
            $in: [
              JobApprovalStatus.ACCEPTED,
              JobApprovalStatus.ARRIVED_TO_PICKUP,
              JobApprovalStatus.PICKEDUP,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverID',
          foreignField: '_id',
          as: 'driver',
        },
      },
      {
        $lookup: {
          from: 'merchantprofiles',
          localField: 'merchantProfileID',
          foreignField: '_id',
          as: 'merchantProfile',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$merchantProfile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: [
          'driver.approvalStatus',
          'driver.status',
          'driver.isDeleted',
          'driver.role',
          'driver.createdAt',
          'driver.updatedAt',
          'otp',
          'merchant.approvalStatus',
          'merchant.status',
          'merchant.isDeleted',
          'merchant.role',
          'merchant.createdAt',
          'merchant.updatedAt',
          'merchantProfile.isDeleted',
          'merchantProfile.isContractAccepted',
          'merchantProfile.ownerID',
          'merchantProfile.createAt',
          'merchantProfile.updatedAt',
        ],
      },
    ]);
    return jobs.length > 0 ? jobs[0] : null;
  }

  /**
   * Function to update job details by id
   */
  public async updateJobById(id: string, dto: UpdateJobReqDTO) {
    this.logger.debug(
      `JobService.updateJobById: id: ${id} dto: ${JSON.stringify(dto)}`,
    );
    const isExist = await this.selectJobById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    if (dto.preferredVehicle.includes(PreferredVehicle.ANY)) {
      dto.preferredVehicle = Object.values(
        VehicleTypes as unknown as PreferredVehicle,
      ) as PreferredVehicle[];
    }
    this.logger.debug(dto);
    const updateJob = await this.jobModel.findByIdAndUpdate(
      id,
      {
        $set: dto,
      },
      { new: true },
    );
    return updateJob;
  }

  /**
   * Function to validate job status
   */
  public async validateJobStatus(id: string, dto: UpdateJobStatusReqDTO) {
    this.logger.debug(
      `jobService.validateJobStatus: ID ${id}, DTO ${JSON.stringify(dto)}`,
    );

    const beforeAcceptedStatus = [
      JobApprovalStatus.ACCEPTED,
      JobApprovalStatus.ARRIVED_TO_PICKUP,
      JobApprovalStatus.PICKEDUP,
      JobApprovalStatus.DELIVERED,
    ];
    const preJobStatus = await this.jobModel.findOne(
      { _id: id },
      { _id: 0, jobStatus: 1, pickupTime: 1 },
    );

    if (
      preJobStatus.jobStatus === JobApprovalStatus.PENDING &&
      dto.jobStatus === JobApprovalStatus.ACCEPTED
    ) {
      if (new Date() > preJobStatus.pickupTime) {
        this.eventEmitter.emit(JobEventType.JOB_EXPIRED, id);
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_EXPIRED',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_EXPIRED,
        );
      }
      return true;
    }
    if (preJobStatus.jobStatus === JobApprovalStatus.EXPIRED) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_EXPIRED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_EXPIRED,
      );
    }
    if (
      dto.jobStatus === JobApprovalStatus.ACCEPTED &&
      preJobStatus.preferredPaymentMethod == PreferredPaymentMethod.EITHER &&
      dto.preferredPaymentMethod != PreferredPaymentMethod.EITHER_CARD &&
      dto.preferredPaymentMethod != PreferredPaymentMethod.EITHER_CASH
    ) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_PREFERRED_PAYMENT_METHOD',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_PREFERRED_PAYMENT_METHOD,
      );
    }

    // ~ Status Already Updated.
    if (preJobStatus.jobStatus === JobApprovalStatus.CANCELLED_BY_MERCHANT) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_CANCELLED_BY_MERCHANT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_CANCELLED_BY_MERCHANT,
      );
    }
    if (preJobStatus.jobStatus === JobApprovalStatus.CANCELLED_BY_DRIVER) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_CANCELLED_BY_DRIVER',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_CANCELLED_BY_DRIVER,
      );
    }
    if (
      beforeAcceptedStatus.includes(preJobStatus.jobStatus) &&
      dto.jobStatus === JobApprovalStatus.ACCEPTED
    ) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_ACCEPTED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_ACCEPTED,
      );
    }
    if (
      preJobStatus.jobStatus === JobApprovalStatus.ARRIVED_TO_PICKUP &&
      dto.jobStatus === JobApprovalStatus.ARRIVED_TO_PICKUP
    ) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_ARRIVED_TO_PICKUP',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_ARRIVED_TO_PICKUP,
      );
    }
    if (
      preJobStatus.jobStatus === JobApprovalStatus.PICKEDUP &&
      dto.jobStatus === JobApprovalStatus.PICKEDUP
    ) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_PICKEDUP',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_PICKEDUP,
      );
    }
    if (
      preJobStatus.jobStatus === JobApprovalStatus.DELIVERED &&
      dto.jobStatus === JobApprovalStatus.DELIVERED
    ) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_ALREADY_DELIVERED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_DELIVERED,
      );
    }
    return true;
  }

  /**
   * Function to update job status by job id
   * Managing job status
   */
  public async updateJobStatusById(
    id: string,
    statusDto: UpdateJobStatusReqDTO,
    user: UserPayload,
  ) {
    const isExist = await this.selectJobById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    this.logger.debug(
      `jobService.updateJobStatusById: ${id} ,${JSON.stringify(
        statusDto,
      )}, ${user}`,
    );
    await this.validateJobStatus(id, statusDto);
    const updateJobProps: any = {
      jobStatus: statusDto.jobStatus,
    };
    let driverNumber: string;
    if (user.role === UserRole.DRIVER) {
      const driverProfile = await this.driverProfileService.getMyDriverProfile(
        user.userID,
      );
      const vehicle = await this.vehicleService.getActiveVehicleByUserId(
        user.userID,
      );
      driverNumber = driverProfile.driverNumber;
      updateJobProps.driverID = new Types.ObjectId(user.userID);
      updateJobProps.driverProfileID = driverProfile._id;
      updateJobProps.usedVehicle = vehicle._id;
      if (
        statusDto.jobStatus === JobApprovalStatus.ACCEPTED &&
        isExist.preferredPaymentMethod == PreferredPaymentMethod.EITHER
      ) {
        updateJobProps.preferredPaymentMethod =
          statusDto.preferredPaymentMethod;
      }
    }
    if (statusDto.jobStatus === JobApprovalStatus.DELIVERED) {
      if (!statusDto.jobDeliveredImage) {
        const otp = await this.verifiedDeliveryCode(id, statusDto.otp);
        if (!otp) {
          throw new CustomHTTPException(
            {
              key: 'errors.OTP_VERIFICATION_FAILED',
            },
            HttpStatus.BAD_REQUEST,
            CustomErrorCodes.OTP_VERIFICATION_FAILED,
          );
        }
      }
      updateJobProps.jobDeliveredImage = statusDto.jobDeliveredImage;
    }
    const updateStatus = await this.jobModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...updateJobProps,
          $push: {
            statusLogs: [
              {
                jobStatus: statusDto.jobStatus,
                date: new Date(),
              },
            ],
          },
        },
        { new: true },
      )
      .populate('driverID', 'username phoneNo profileImage')
      .populate('merchantProfileID', 'ownerID');

    if (statusDto.jobStatus === JobApprovalStatus.DELIVERED) {
      await this.invoiceService.generateInvoiceID(
        user.userID,
        driverNumber,
        new Types.ObjectId(id),
      );
      this.eventEmitter.emit(JobEventType.JOB_COMPLETED, updateStatus._id);
      this.eventEmitter.emit(
        MerchantPayoutEventType.JOB_COMPLETED,
        (updateStatus.merchantProfileID as MerchantProfile)?.ownerID,
        updateStatus.isFromOutsideRiders,
      );
    }
    if (statusDto.jobStatus === JobApprovalStatus.ACCEPTED) {
      this.eventEmitter.emit(JobEventType.JOB_ACCEPTED, updateStatus._id);
    }
    if (statusDto.jobStatus === JobApprovalStatus.ARRIVED_TO_PICKUP) {
      this.eventEmitter.emit(JobEventType.RIDER_HAS_ARRIVED, updateStatus._id);
    }
    if (
      statusDto.jobStatus === JobApprovalStatus.PICKEDUP &&
      user.role === UserRole.MERCHANT
    ) {
      this.eventEmitter.emit(
        JobEventType.ORDER_PICKED_UP_BY_MERCHANT,
        updateStatus._id,
      );
    }
    if (
      statusDto.jobStatus === JobApprovalStatus.PICKEDUP &&
      user.role === UserRole.DRIVER
    ) {
      this.eventEmitter.emit(
        JobEventType.ORDER_PICKED_UP_BY_DRIVER,
        updateStatus._id,
      );
    }
    if (isExist.jobStatus != statusDto.jobStatus) {
      this.eventEmitter.emit(WebHookEventType.JOB_STATUS_CHANGED, updateStatus);
    }
    return updateStatus;
  }

  /**
   * Function to delete job by id
   */
  public async deleteJodById(id: string) {
    this.logger.debug(`jobService.deleteJodById() id: ${id}`);
    const isExistJob = await this.selectJobById(id);
    if (!isExistJob) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    } else {
      const job = await this.jobModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { isDeleted: true } },
      );
      if (job) {
        this.notificationService.disableJobNotification(
          new Types.ObjectId(id),
          NotificationNotes.JOb_REMOVED,
        );
        return {
          deleted: true,
        };
      }
    }
  }

  /**
   * Function to cancel job by merchant
   */
  public async cancelJobById(
    id: string,
    dto: CancelJobReqDTO,
    user: UserPayload,
  ) {
    this.logger.debug(
      `jobServices.cancelJobById() id: ${id} , dto: ${JSON.stringify(
        dto,
      )} , user: ${user}`,
    );
    const isExistJob = await this.selectJobById(id);
    if (!isExistJob) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    } else {
      if (isExistJob.jobStatus === JobApprovalStatus.DELIVERED) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_DELIVERED',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_DELIVERED,
        );
      }
      if (isExistJob.jobStatus === JobApprovalStatus.CANCELLED_BY_MERCHANT) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_CANCELLED_BY_MERCHANT',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_CANCELLED_BY_MERCHANT,
        );
      }
      if (isExistJob.jobStatus === JobApprovalStatus.CANCELLED_BY_DRIVER) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_CANCELLED_BY_DRIVER',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_CANCELLED_BY_DRIVER,
        );
      }

      const updateJob = await this.jobModel.findOneAndUpdate(
        { _id: id },
        {
          ...dto,
          $set: { jobStatus: JobApprovalStatus.CANCELLED_BY_MERCHANT },
          $push: {
            statusLogs: [
              {
                jobStatus: JobApprovalStatus.CANCELLED_BY_MERCHANT,
                date: new Date(),
              },
            ],
          },
        },
        { new: true },
      );
      this.eventEmitter.emit(
        JobEventType.JOB_CANCELLED_BY_MERCHANT,
        updateJob._id,
      );

      return updateJob;
    }
  }

  /**
   * Function to get job by user id
   */
  public async getJobsByUserId(
    dto: GetMyJobsReqDTO,
    userID: string,
    role: UserRole | null = null,
  ) {
    this.logger.debug(
      `jobServices.getJobsByUserId() dto: ${dto} userID: ${userID} role: ${role}`,
    );
    let search = {};
    if (role === UserRole.MERCHANT) {
      dto.fields = {
        ...dto.fields,
        userID: new Types.ObjectId(userID),
      };
    }
    if (dto.searches && role === UserRole.MERCHANT) {
      search = {
        $or: [
          {
            'driver.username': {
              $regex: dto.searches,
              $options: 'i',
            },
          },
          {
            customerName: {
              $regex: dto.searches,
              $options: 'i',
            },
          },
          {
            jobID: {
              $regex: dto.searches,
              $options: 'i',
            },
          },
        ],
      };
    } else {
      search = {
        $or: [
          {
            customerName: {
              $regex: dto.searches,
              $options: 'i',
            },
          },
          {
            jobID: {
              $regex: dto.searches,
              $options: 'i',
            },
          },
          {
            'merchant.username': {
              $regex: dto.searches,
              $options: 'i',
            },
          },
        ],
      };
    }
    this.logger.debug(
      `jobServices.getJobsByUserId() dto: ${JSON.stringify(
        dto,
      )} userID: ${userID}`,
    );
    if (role === UserRole.DRIVER) {
      //Collect all declined jobIds by driver
      dto.fields = {
        ...dto.fields,
        driverID: new Types.ObjectId(userID),
      };
    }
    return this.searchJobs(dto, role, search);
  }

  /**
   * Function to get active jobs for merchant by id
   */
  public async getActiveJobsForMerchantByUserId(userId: string) {
    this.logger.debug(
      `jobServices.getActiveJobsForMerchantByUserId() userID: ${userId}`,
    );
    const jobs = await this.jobModel.find({
      userID: new Types.ObjectId(userId),
      isDeleted: false,
      jobStatus: {
        $in: [
          JobApprovalStatus.ACCEPTED,
          JobApprovalStatus.ARRIVED_TO_PICKUP,
          JobApprovalStatus.PICKEDUP,
        ],
      },
    });
    return jobs;
  }

  /**
   * Function to get active jobs for driver by id
   */
  public async getActiveJobsForDriverByUserId(userId: string) {
    this.logger.debug(
      `jobServices.getActiveJobsForDriverByUserId() userID: ${userId}`,
    );
    const jobs = await this.jobModel.find({
      driverID: new Types.ObjectId(userId),
      isDeleted: false,
      jobStatus: {
        $in: [
          JobApprovalStatus.ACCEPTED,
          JobApprovalStatus.ARRIVED_TO_PICKUP,
          JobApprovalStatus.PICKEDUP,
        ],
      },
    });
    return jobs;
  }

  /**
   * Function to delete job by user id
   */
  public async deleteJobByUserId(userId: string) {
    this.logger.debug(`jobServices.deleteJobByUserId() userID: ${userId}`);
    const jobs = await this.jobModel.find({
      userID: new Types.ObjectId(userId),
      jobStatus: JobApprovalStatus.PENDING,
    });
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        this.eventEmitter.emit(JobEventType.JOB_EXPIRED, job._id);
      }
    }
  }

  public async findOneWithDriverAndMerchant(
    jobID: Types.ObjectId,
  ): Promise<JobDocument> {
    this.logger.debug(
      `JobServices.findOneWithDriverAndMerchant() jobID: ${jobID}`,
    );
    return await this.jobModel
      .findById(jobID)
      .populate('driverID')
      .populate('userID')
      .exec();
  }

  public async findOneWithDriverAndMerchantAndMerchantProfile(
    jobID: Types.ObjectId,
  ): Promise<JobDocument> {
    this.logger.debug(
      `JobServices.findOneWithDriverAndMerchantAndMerchantProfile() jobID: ${jobID}`,
    );
    return await this.jobModel
      .findById(jobID)
      .populate('driverID')
      .populate('userID')
      .populate('merchantProfileID')
      .exec();
  }

  public async downloadInvoice(jobID: string, userRole: UserRole) {
    this.logger.debug(`JobServices.downloadInvoice() jobID: ${jobID}`);
    const job = await this.findOneWithDriverAndMerchant(
      new Types.ObjectId(jobID),
    );
    if (job.jobStatus === JobApprovalStatus.DELIVERED) {
      const merchant = await this.merchantProfileService.findMerchantByUserId(
        (job.userID as UserDocument)._id,
      );
      if (!merchant) {
        throw new CustomHTTPException(
          {
            key: 'errors.MERCHANT_PROFILE_NOT_FOUND',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
        );
      }
      const vehicle = await this.vehicleService.getVehicleById(
        String(job.usedVehicle),
      );
      if (!vehicle) {
        throw new CustomHTTPException(
          {
            key: 'errors.VEHICLE_DETAILS_NOT_FOUND',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.VEHICLE_NOT_FOUND,
        );
      }
      const driverProfile = await this.driverProfileService.getMyDriverProfile(
        (job.driverID as UserDocument)._id,
      );
      if (!driverProfile) {
        throw new CustomHTTPException(
          {
            key: 'errors.DRIVER_DETAILS_NOT_FOUND',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
        );
      }
      const deliveryDate = this.getJobStatusDate(
        job.statusLogs,
        JobApprovalStatus.DELIVERED,
      );
      const pickupTime = this.getJobStatusDate(
        job.statusLogs,
        JobApprovalStatus.PICKEDUP,
      );
      const invoice = await this.invoiceService.getInvoiceID(jobID);
      const localData: any = {
        invoiceNumber: invoice.invoiceID,
        driverName: (job.driverID as User).username,
        driverEmail: (job.driverID as User).email,
        driverPhoneNo: (job.driverID as User).phoneNo,
        vehicle: vehicle,
        vehicleName: vehicle.vehicleType.toLowerCase(),
        todayDate: moment(new Date())
          .tz('Europe/London')
          .format('DD MMM, YYYY'),
        jobDate: moment(job.createdAt)
          .tz('Europe/London')
          .format('DD MMM, YYYY'),
        pickupTime: moment(pickupTime)
          .tz('Europe/London')
          .format('DD MMM YYYY, h:mm A'),
        deliveryTime: moment(deliveryDate)
          .tz('Europe/London')
          .format('DD MMM YYYY, h:mm A'),
        job: job,
        merchant: merchant,
        merchantEmail: (job.userID as User).email,
        merchantPhoneNo: (job.userID as User).phoneNo,
        driverProfile: driverProfile,
        SRUrl: environment.SRUrl,
        jobOfferAmount: job.jobOfferAmount.toFixed(2),
        packageType: this.utilService.stringFormat(job.requiredPackageType),
        orderAmount: job.orderAmount.toFixed(2),
        payToMerchantAmount: (job.orderAmount - job.jobOfferAmount).toFixed(2),
        forRider: userRole === UserRole.DRIVER,
      };
      this.logger.debug(localData);
      return this.pdfService.generatePDF('/invoice.ejs', localData, 'invoice');
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_NOT_COMPLETED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_NOT_COMPLETED,
      );
    }
  }

  /**
   * Function to declined job by driver
   */
  public async declinedJobByDriver(id: string, user: UserPayload) {
    this.logger.debug(
      `jobServices.declinedJobByDriver() id: ${id} user: ${JSON.stringify(
        user,
      )}`,
    );
    const isExistJob = await this.declinedJobsModel.findOne({
      driverID: new Types.ObjectId(user.userID),
      jobID: new Types.ObjectId(id),
    });
    if (isExistJob) {
      throw new CustomHTTPException(
        {
          key: 'error.JOB_ALREADY_DECLINED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_ALREADY_DECLINED,
      );
    }
    const data = {
      driverID: new Types.ObjectId(user.userID),
      jobID: new Types.ObjectId(id),
    };
    const decline = await this.declinedJobsModel.create({ ...data });
    this.eventEmitter.emit(
      JobEventType.JOB_DECLINED_BY_DRIVER,
      id,
      user.userID,
    );
    return decline ? true : false;
  }

  /**
   * Function to get all declined jobs by single driver
   */
  public async getAllDeclinedJobsBySingleDriver(userID: string) {
    this.logger.debug(
      `JobServices.getAllDeclinedJobsBySingleDriver() userID: ${userID}`,
    );
    const jobs = await this.declinedJobsModel.find({
      driverID: new Types.ObjectId(userID),
    });
    return jobs;
  }

  /**
   * Function to get single job declined by multiple driver
   */
  public async getSingleDeclinedJobsByMultipleDriver(jobID: string) {
    this.logger.debug(
      `JobServices.getSingleDeclinedJobsByMultipleDriver() jobID: ${jobID}`,
    );
    const driver = await this.declinedJobsModel.find({
      jobID: new Types.ObjectId(jobID),
    });
    return driver;
  }

  /**
   * Function get job for driver without declined job
   */

  public async getMyJob(userID: string, dto: DriverSearchJobFilterDTO) {
    this.logger.debug(
      `JobServices.getMyJob() UserID: ${userID} dto: ${JSON.stringify(dto)}`,
    );
    const lat = dto.fields.lat;
    const lng = dto.fields.lng;
    const adminSettings = await this.adminSettingsService.getAdminSettings();
    const maxDistInMiles = adminSettings.findNearbyDriversWithinMiles;

    delete dto.fields.lat;
    delete dto.fields.lng;
    const declinedJob = await this.getAllDeclinedJobsBySingleDriver(userID);
    const myVehicle = await this.vehicleService.getActiveVehicleByUserId(
      userID,
    );
    const location = this.driverSaveLocationDTOAdapter(lat, lng);
    await this.saveUserLocationServices.saveLocation(location, { userID });
    const declinedJobID = [];
    for (const ID of declinedJob) {
      declinedJobID.push(ID.jobID);
    }
    let filterQuery = {
      ...dto.fields,
      isDeleted: false,
      preferredVehicle: myVehicle?.vehicleType,
      $or: [
        {
          driverID: {
            $exists: false,
          },
        },
        {
          driverID: new Types.ObjectId(userID),
        },
      ],
      _id: { $nin: declinedJobID },
    };
    const jobIDsFromNotifications =
      await this.notificationService.getMyJobsIdsFromNotifications(userID);
    this.logger.debug(
      `JobServices.getMyJob() jobIDsFromNotifications: ${jobIDsFromNotifications}`,
    );
    const secondsToDelay =
      adminSettings.makeJobPublicAfterSentToNoOfDrivers *
        adminSettings.sendJobToNextNearestDriverInSeconds +
      environment.allowJobInSearchAfterItBroadcastedInSeconds;
    this.logger.debug(
      `JobServices.getMyJob() secondsToDelay: ${secondsToDelay}`,
    );
    this.logger.debug(`JobServices.getMyJob() now: ${new Date()}`);
    const searchJobCreatedAfterTime = moment(new Date())
      .subtract(secondsToDelay, 'seconds')
      .toDate();
    this.logger.debug(
      `JobServices.getMyJob() searchJobCreatedAfterTime: ${searchJobCreatedAfterTime}`,
    );
    if (dto.fields.$or && Array.isArray(dto.fields.$or)) {
      filterQuery = {
        ...filterQuery,
        $or: [...(dto.fields.$or as any[]), ...filterQuery.$or],
      };
    }
    this.logger.debug(`JobServices.getMyJob() filterQuery: ${filterQuery}`);
    let search = {};
    const customSearchQuery: any = null;
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'driver.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              customerName: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              jobID: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    this.logger.debug(`JobServices.getMyJob() dto: ${dto}`);
    this.logger.debug(`JobServices.getMyJob() search: ${search}`);

    const job =
      await this.merchantProfileService.merchantProfileModel.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: maxDistInMiles * 1.60934 * 1000,
            spherical: true,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'ownerID',
            foreignField: 'userID',
            as: 'jobs',
          },
        },
        {
          $unwind: {
            path: '$jobs',
          },
        },
        {
          $addFields: {
            'jobs.pickupDistance': {
              $multiply: [
                '$distance',
                adminSettings.distanceMultiplierFactor,
                0.000621371,
              ],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$jobs',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverID',
            foreignField: '_id',
            as: 'driver',
          },
        },
        {
          $lookup: {
            from: 'merchantprofiles',
            localField: 'merchantProfileID',
            foreignField: '_id',
            as: 'merchantProfile',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$driver',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$merchantProfile',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                createdAt: {
                  $lte: searchJobCreatedAfterTime,
                },
              },
              {
                _id: {
                  $in: jobIDsFromNotifications,
                },
              },
            ],
          },
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
        {
          $skip: dto.options.skip,
        },
        {
          $limit: dto.options.limit,
        },
        {
          $unset: [
            'driver.approvalStatus',
            'driver.status',
            'driver.isDeleted',
            'driver.role',
            'driver.createdAt',
            'driver.updatedAt',
            'merchant.approvalStatus',
            'merchant.status',
            'merchant.isDeleted',
            'merchant.role',
            'merchant.createdAt',
            'merchant.updatedAt',
            'merchantProfile.isDeleted',
            'merchantProfile.isContractAccepted',
            'merchantProfile.ownerID',
            'merchantProfile.createAt',
            'merchantProfile.updatedAt',
          ],
        },
      ]);
    const filterCount = (
      await this.merchantProfileService.merchantProfileModel.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            maxDistance: maxDistInMiles * 1.60934 * 1000,
            spherical: true,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'ownerID',
            foreignField: 'userID',
            as: 'jobs',
          },
        },
        {
          $unwind: {
            path: '$jobs',
          },
        },
        {
          $addFields: {
            'jobs.pickupDistance': {
              $multiply: [
                '$distance',
                adminSettings.distanceMultiplierFactor,
                0.000621371,
              ],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$jobs',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverID',
            foreignField: '_id',
            as: 'driver',
          },
        },
        {
          $lookup: {
            from: 'merchantprofiles',
            localField: 'merchantProfileID',
            foreignField: '_id',
            as: 'merchantProfile',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$driver',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$merchantProfile',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                createdAt: {
                  $lte: searchJobCreatedAfterTime,
                },
              },
              {
                _id: {
                  $in: jobIDsFromNotifications,
                },
              },
            ],
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
      jobs: job,
      filterCount: filterCount,
    };
  }

  /**
   * Get Job count by merchant id
   */

  public async getJobCountForMerchant(id: string, fields = {}) {
    this.logger.debug(`JobServices.getJobCountForMerchant() id: ${id}`);
    const totalJobCount = await this.getJobCount({
      ...fields,
      userID: new Types.ObjectId(id),
      isDeleted: false,
    });
    const totalCompletedJobCount = await this.getJobCount({
      ...fields,
      userID: new Types.ObjectId(id),
      isDeleted: false,
      jobStatus: JobApprovalStatus.DELIVERED,
    });
    const totalCancelledJobCount = await this.getJobCount({
      ...fields,
      userID: new Types.ObjectId(id),
      isDeleted: false,
      jobStatus: {
        $in: [
          JobApprovalStatus.CANCELLED_BY_MERCHANT,
          JobApprovalStatus.CANCELLED_BY_DRIVER,
        ],
      },
    });
    const totalExpiredJobCount = await this.getJobCount({
      ...fields,
      userID: new Types.ObjectId(id),
      isDeleted: false,
      jobStatus: JobApprovalStatus.EXPIRED,
    });
    const totalSum = await this.jobModel.aggregate([
      {
        $match: {
          ...fields,
          userID: new Types.ObjectId(id),
          isDeleted: false,
          jobStatus: JobApprovalStatus.DELIVERED,
        },
      },
      {
        $group: {
          _id: '$merchantProfileID',
          totalSpend: { $sum: '$jobOfferAmount' },
        },
      },
    ]);
    const totalJobCountFromRider = await this.getJobCount({
      ...fields,
      userID: new Types.ObjectId(id),
      isFromOutsideRiders: false,
      isDeleted: false,
    });
    return {
      totalJobCount: totalJobCount,
      totalCompletedJobCount: totalCompletedJobCount,
      totalCancelledJobCount: totalCancelledJobCount,
      totalExpiredJobCount: totalExpiredJobCount,
      totalSpend: totalSum[0] ? totalSum[0].totalSpend : 0,
      totalPlatformFees: totalJobCountFromRider * 0.25,
    };
  }
  /**
   * Get Job fees
   */
  public async getJobFees() {
    const jobFees = await this.jobModel.aggregate([
      {
        $match: {
          isDeleted: false,
          jobStatus: JobApprovalStatus.DELIVERED,
        },
      },
      {
        $group: {
          _id: 0,
          totalSpend: { $sum: '$jobOfferAmount' },
        },
      },
    ]);
    return jobFees[0] ? jobFees[0].totalSpend : 0;
  }

  /**
   * Get job count for driver id
   */
  public async getJobCountForDriver(id: string) {
    this.logger.debug(`JobServices.getJobCountForDriver() id: ${id}`);
    const totalJobCount = await this.jobModel.count({
      driverID: new Types.ObjectId(id),
      isDeleted: false,
    });
    const totalCompletedJobCount = await this.jobModel.count({
      driverID: new Types.ObjectId(id),
      isDeleted: false,
      jobStatus: JobApprovalStatus.DELIVERED,
    });
    const totalCancelledJobCount = await this.jobModel.count({
      driverID: new Types.ObjectId(id),
      isDeleted: false,
      jobStatus: JobApprovalStatus.CANCELLED_BY_DRIVER,
    });
    return {
      totalJobCount: totalJobCount,
      totalCompletedJobCount: totalCompletedJobCount,
      totalCancelledJobCount: totalCancelledJobCount,
    };
  }
  /**
   * Get date boundaries
   */
  private getBoundaries(date: Date, limit: number): Date[] {
    const dateM = moment(date)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .add(1, 'day');
    const list = [dateM.toDate()];
    for (let i = 1; i <= limit; i++) {
      const tempDate = dateM.clone().subtract(i, 'days');
      list.unshift(tempDate.toDate());
    }
    return list;
  }
  /**
   * get job count for last 30 days
   */
  private getJobCountFor30Days(
    buckets: { _id: Date }[],
    dateBoundaries: Date[],
    calculateCount?: Function,
  ) {
    const datesAndJob: {
      date: Date;
      count: number;
    }[] = [];
    for (let i = 1; i < dateBoundaries.length; i++) {
      let bucket = null;
      for (const buck of buckets) {
        if (dateBoundaries[i].toString() === buck._id.toString()) {
          bucket = buck;
          break;
        }
      }
      if (bucket) {
        datesAndJob.push({
          date: dateBoundaries[i],
          count: calculateCount
            ? calculateCount(bucket.jobs)
            : bucket.jobs.length,
        });
      } else {
        datesAndJob.push({
          date: dateBoundaries[i],
          count: 0,
        });
      }
    }
    return datesAndJob;
  }
  /**
   *  Get driver revenue
   */
  private getRevenueDriver(
    buckets: { _id: Date; jobs: BucketJobsType[] }[],
    dateBoundaries: Date[],
  ) {
    const datesAndRevenue: { date: Date; revenue: number; count: number }[] =
      [];
    for (let i = 1; i < dateBoundaries.length; i++) {
      let bucket = null;
      for (const buck of buckets) {
        if (dateBoundaries[i].toString() === buck._id.toString()) {
          bucket = buck;
          break;
        }
      }
      if (bucket) {
        datesAndRevenue.push({
          date: dateBoundaries[i],
          revenue: this.calculateTotalForDayDriver(bucket),
          count: bucket.jobs.length,
        });
      } else {
        datesAndRevenue.push({
          date: dateBoundaries[i],
          revenue: 0,
          count: 0,
        });
      }
    }
    return datesAndRevenue;
  }
  /**
   * Calculate single day revenue
   */
  private calculateTotalForDayDriver(bucket: {
    _id: Date;
    jobs: BucketJobsType[];
  }): number {
    let amount = 0;
    for (const job of bucket.jobs) {
      if (job.jobStatus) {
        amount += job.jobOfferAmount;
      }
    }
    return amount;
  }
  /**
   * Get job revenue for driver
   */
  public async getJobRevenueForDriver(id: string) {
    this.logger.debug(`JobServices.getJobRevenueForDriver() id: ${id}`);
    let dateBoundaries = this.getBoundaries(new Date(), 30);
    let buckets = await this.jobModel.aggregate([
      {
        $match: { driverID: new Types.ObjectId(id) },
      },
      { $project: { statusLogs: 1 } },
      { $unwind: { path: '$statusLogs' } },
      {
        $match: {
          $or: [
            { 'statusLogs.jobStatus': { $exists: false } },
            { 'statusLogs.jobStatus': 'DELIVERED' },
          ],
        },
      },
      {
        $bucket: {
          groupBy: '$statusLogs.date',
          boundaries: dateBoundaries,
          default: 'other',
          output: {
            jobs: {
              $push: {
                _id: '$_id',
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs._id',
          foreignField: '_id',
          as: 'jobs',
        },
      },
    ]);
    buckets = buckets.reverse();
    dateBoundaries = dateBoundaries.reverse();
    const last30DaysRevenue = this.getRevenueDriver(
      buckets,
      dateBoundaries,
    ).reverse();
    return last30DaysRevenue;
  }
  /**
   * Get job count per day
   */
  public async getJobCountPerDay(countSpending: boolean = false, fields = {}) {
    let dateBoundaries = this.getBoundaries(new Date(), 30);
    const buckets = await this.jobModel.aggregate([
      { $match: { ...fields, isDeleted: false } },
      { $project: { statusLogs: 1 } },
      { $unwind: { path: '$statusLogs' } },
      {
        $match: {
          $or: [
            { 'statusLogs.jobStatus': { $exists: false } },
            { 'statusLogs.jobStatus': 'PENDING' },
          ],
        },
      },
      {
        $bucket: {
          groupBy: '$statusLogs.date',
          boundaries: dateBoundaries,
          default: 'other',
          output: {
            jobs: {
              $push: {
                _id: '$_id',
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs._id',
          foreignField: '_id',
          as: 'jobs',
        },
      },
    ]);
    dateBoundaries = dateBoundaries.reverse();
    const last30DaysJob = this.getJobCountFor30Days(
      buckets,
      dateBoundaries,
      countSpending
        ? (jobs: any[]) =>
            jobs
              ? jobs.reduce((spending, job) => spending + job.jobOfferAmount, 0)
              : 0
        : undefined,
    ).reverse();
    return last30DaysJob;
  }
  /**
   * Get total job count
   */

  public async getTotalJobCOunt() {
    return await this.jobModel.count({ isDeleted: false });
  }

  /**
   * Job expired by job id
   */
  public async expireJobById(jobID: string) {
    this.logger.debug(`JobServices.jobExpireById() jobID: ${jobID}`);
    return await this.jobModel.updateOne(
      { _id: new Types.ObjectId(jobID) },
      {
        $set: {
          jobStatus: JobApprovalStatus.EXPIRED,
        },
        $push: {
          statusLogs: [
            {
              jobStatus: JobApprovalStatus.EXPIRED,
              date: new Date(),
            },
          ],
        },
      },
    );
  }

  /**
   * Get all pending jobs
   */
  public async getJobsToExpire() {
    return await this.jobModel.find({
      jobStatus: JobApprovalStatus.PENDING,
      pickupTime: { $lte: new Date() },
    });
  }

  public hadStatus(job: Job, status: JobApprovalStatus) {
    this.logger.debug(`JobServices.hadStatus() job: ${job} status: ${status}`);
    return job.statusLogs.some((log) => log.jobStatus === status);
  }

  /**
   * delivery code verification
   */
  public async verifiedDeliveryCode(id: string, otp: string) {
    this.logger.debug(
      `JobServices.verifiedDeliveryCode() id: ${id} otp: ${otp}`,
    );
    const verified = await this.otpService.verifyOTP(id, otp);
    return verified ? true : false;
  }
  public driverSaveLocationDTOAdapter(lat: number, lng: number) {
    this.logger.debug(
      `JobServices.driverSaveLocationDTOAdapter() lat: ${lat} lng: ${lng}`,
    );
    const dto: SaveUserLocationReqDTO = {
      locationAtTime: [
        {
          location: { coordinates: [lng, lat], type: 'Point' },
          timeStamp: new Date(),
        },
      ],
    };
    return dto;
  }
  public getJobStatusDate(
    statuses: { jobStatus: JobApprovalStatus; date: Date }[],
    status: JobApprovalStatus,
  ) {
    this.logger.debug(
      `JobServices.getJobStatusDate() statuses: ${statuses} status: ${status}`,
    );
    const stat = statuses.find((st) => st.jobStatus === status);
    return stat.date;
  }

  public async sendSMS(user: UserPayload, templateID: string) {
    this.logger.debug(
      `JobServices.sendSMS() user: ${JSON.stringify(
        user,
      )}, templateID: ${templateID}`,
    );
    const job = await this.jobModel.findOne({
      driverID: new Types.ObjectId(user.userID),
      jobStatus: JobApprovalStatus.PICKEDUP,
    });
    if (!job) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    const template = await this.smsTemplateService.getSmsTemplateById(
      templateID,
    );
    this.logger.debug(`JobServices.sendSMS() message: ${template.message}`);
    if (!job.sms) {
      const SMSObject = {
        msg: template.message,
      };
      this.smsServices.sendSMS(job.phoneNumber, SMSObject);
      this.logger.debug(
        `JobServices.sendSMS() message sent to ${job.phoneNumber}, message: ${template.message}`,
      );
      await this.jobModel.findOneAndUpdate(
        { _id: new Types.ObjectId(job._id) },
        { $set: { sms: template.message } },
        { new: true },
      );
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.SMS_ALREADY_SENT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.SMS_ALREADY_SENT,
      );
    }
    return true;
  }

  public async getEarnings(userID: string) {
    const todayEarning = await this.jobModel.aggregate([
      {
        $match: {
          driverID: new Types.ObjectId(userID),
          isDeleted: false,
          jobStatus: { $in: [JobApprovalStatus.DELIVERED] },
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: '$driverID',
          total: { $sum: '$jobOfferAmount' },
        },
      },
    ]);
    const totalEarnings = await this.jobModel.aggregate([
      {
        $match: {
          driverID: new Types.ObjectId(userID),
          isDeleted: false,
          jobStatus: { $in: [JobApprovalStatus.DELIVERED] },
        },
      },
      {
        $group: {
          _id: '$driverID',
          total: { $sum: '$jobOfferAmount' },
        },
      },
    ]);
    return {
      todaysEarning: todayEarning.length > 0 ? todayEarning[0].total : 0,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
    };
  }

  public async addJobOtp(jobID: string, otp: string) {
    this.logger.debug(`JobServices.addJobOtp() jobID: ${jobID}, otp: ${otp}`);
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobID),
    });
    if (!job) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    return await this.jobModel.findOneAndUpdate(
      { _id: new Types.ObjectId(jobID) },
      { $set: { otp: otp } },
      { new: true },
    );
  }

  public async getJobOtp(jobID: string) {
    this.logger.debug(`JobServices.getJobOtp() jobID: ${jobID}`);
    const job = await this.jobModel.findOne({
      _id: new Types.ObjectId(jobID),
    });
    if (!job) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    return job.otp;
  }

  public async resendOTP(user: UserPayload) {
    this.logger.debug(`JobServices.resendOTP() user: ${JSON.stringify(user)}`);
    const job = await this.jobModel.findOne({
      driverID: new Types.ObjectId(user.userID),
      jobStatus: JobApprovalStatus.PICKEDUP,
    });
    if (!job) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    }
    const otp = await this.otpService.sendOTP(job.id);
    const SMSObject = {
      msg: `Order on the way. Please provide the driver ${otp} as a verification code. You can track the order here - ${environment.SRUrl+'/tracking#'+job.id}`,
    };
    console.log("🚀 ~ file: job.service.ts:2269 ~ JobService ~ resendOTP ~ ${environment.SRUrl+'/tracking#'+job.id}:", `${environment.SRUrl+'/tracking#'+job.id}`)
    this.smsServices.sendSMS(job.phoneNumber, SMSObject);
    await this.jobModel.findOneAndUpdate(
      { _id: new Types.ObjectId(job._id) },
      { $set: { otp: otp } },
      { new: true },
    );
    return true;
  }

  /**
   * Function to set unable to deliver job by driver
   */
  public async unableToDeliverJobById(
    id: string,
    dto: UnableToDeliverJobReqDTO,
    user: UserPayload,
  ) {
    this.logger.debug(
      `jobServices.unableToDeliverJobById() id: ${id} , dto: ${JSON.stringify(
        dto,
      )} , user: ${user}`,
    );
    const isExistJob = await this.selectJobById(id);
    if (!isExistJob) {
      throw new CustomHTTPException(
        {
          key: 'errors.JOB_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.JOB_NOT_FOUND,
      );
    } else {
      if (isExistJob.jobStatus === JobApprovalStatus.DELIVERED) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_DELIVERED',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_DELIVERED,
        );
      }
      if (isExistJob.jobStatus === JobApprovalStatus.CANCELLED_BY_MERCHANT) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_CANCELLED_BY_MERCHANT',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_CANCELLED_BY_MERCHANT,
        );
      }
      if (isExistJob.jobStatus === JobApprovalStatus.EXPIRED) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_EXPIRED',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_EXPIRED,
        );
      }
      if (isExistJob.jobStatus === JobApprovalStatus.PENDING) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_NOT_ACCEPTED_YET',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_NOT_ACCEPTED_YET,
        );
      }
      if (isExistJob.unableToDeliverReason) {
        throw new CustomHTTPException(
          {
            key: 'errors.JOB_ALREADY_UNABLE_TO_DELIVER',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.JOB_ALREADY_UNABLE_TO_DELIVER,
        );
      }

      const updateJob = await this.jobModel.findOneAndUpdate({ _id: id }, dto, {
        new: true,
      });
      this.eventEmitter.emit(JobEventType.JOB_UNABLE_TO_DELIVER, updateJob._id);

      return updateJob;
    }
  }

  getUnavailableDrivers(driversIds?: string[]) {
    const filter = {
      jobStatus: {
        $in: [
          JobApprovalStatus.ACCEPTED,
          JobApprovalStatus.ARRIVED_TO_PICKUP,
          JobApprovalStatus.PICKEDUP,
        ],
      },
    };
    if (driversIds) {
      filter['driverID'] = { $in: driversIds };
    }
    return this.jobModel.find(filter);
  }

  async getJobCount(filter) {
    const data = await this.jobModel.aggregate([
      {
        $match: filter,
      },
      {
        $count: 'count',
      },
    ]);
    return data.length ? data[0]['count'] : 0;
  }
}
