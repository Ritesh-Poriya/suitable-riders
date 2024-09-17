// import {
//   OnQueueActive,
//   OnQueueCompleted,
//   OnQueueError,
//   OnQueueFailed,
//   OnQueueRemoved,
//   OnQueueStalled,
//   OnQueueWaiting,
//   Process,
//   Processor,
// } from '@nestjs/bull';
// import { JOB_QUEUE_NAME, NEW_JOB_AVAILABLE_PROCESS } from '../constants';
// import { Job } from 'bull';
// import { JobService } from '../job.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { Logger } from '@nestjs/common';
// import { AdminSettingServices } from 'src/app/admin-settings/admin-settings.service';
// import { SaveUserLocationServices } from 'src/app/save-user-location/save-user-location.service';
// import { JobApprovalStatus, JobEventType } from '../@types/job-type';
// import { Types } from 'mongoose';
// import customInterval from 'src/app/common/utils/custom-interval';

// @Processor(JOB_QUEUE_NAME)
// export class JobProcessor {
//   constructor(
//     private jobService: JobService,
//     private eventEmitter: EventEmitter2,
//     private logger: Logger,
//     private adminSettingsService: AdminSettingServices,
//     private locationService: SaveUserLocationServices,
//   ) {}

//   @Process(NEW_JOB_AVAILABLE_PROCESS)
//   async newJobAvailable(payload: Job<{ jobID: string }>) {
//     try {
//       this.logger.debug(`Process ${NEW_JOB_AVAILABLE_PROCESS} is called`);
//       this.logger.debug(
//         'JobProcessor.newJobAvailable() is called with payload: ',
//         payload,
//       );
//       const newJob = await this.jobService.getJobById(payload.data.jobID);
//       this.logger.debug('JobProcessor.newJobAvailable() newJob: ', newJob);
//       if (
//         !newJob?.merchantProfile?.businessInfo?.address?.location?.coordinates
//       ) {
//         this.logger.error(
//           'JobProcessor.newJobAvailable() is called but the job is not valid, (job does not have pickup location)',
//         );
//         return;
//       }
//       const adminSettings = await this.adminSettingsService.getAdminSettings();
//       this.logger.debug(
//         'JobProcessor.newJobAvailable() adminSettings: ',
//         adminSettings,
//       );
//       let driverIDsToExclude: Types.ObjectId[] = [];
//       let counter = 0;
//       const interval = customInterval(async () => {
//         this.logger.debug(
//           'JobProcessor.newJobAvailable() inside interval counter: ',
//           counter,
//         );
//         const job = await this.jobService.getJobById(payload.data.jobID);
//         this.logger.debug(
//           'JobProcessor.newJobAvailable() inside interval job: ',
//           job,
//         );
//         if (job.jobStatus === JobApprovalStatus.PENDING) {
//           const driversWhoDeclinedTheJob =
//             await this.jobService.getSingleDeclinedJobsByMultipleDriver(
//               payload.data.jobID,
//             );
//           this.logger.debug(
//             'JobProcessor.newJobAvailable() inside interval driversWhoDeclinedTheJob: ',
//             driversWhoDeclinedTheJob,
//           );
//           const concatedArray = driverIDsToExclude.concat(
//             driversWhoDeclinedTheJob.map((driver) => driver.driverID),
//           );
//           driverIDsToExclude = [...new Set(concatedArray)];
//           const nearestDrivers =
//             await this.locationService.getDriversListNearToJobPickupLocation(
//               newJob.merchantProfile.businessInfo.address.location
//                 .coordinates[1],
//               newJob.merchantProfile.businessInfo.address.location
//                 .coordinates[0],
//               adminSettings.findNearbyDriversWithinMiles * 1.60934 * 1000,
//               driverIDsToExclude,
//               newJob.preferredVehicle,
//             );
//           this.logger.debug(
//             'JobProcessor.newJobAvailable() nearestDrivers: ',
//             nearestDrivers,
//           );
//           if (counter < adminSettings.makeJobPublicAfterSentToNoOfDrivers) {
//             this.logger.debug(
//               'JobProcessor.newJobAvailable() inside interval counter < adminSettings.makeJobPublicAfterSentToNoOfDrivers',
//             );
//             if (nearestDrivers.length > 0) {
//               this.logger.debug(
//                 'JobProcessor.newJobAvailable() inside interval nearestDrivers.length > 0',
//               );
//               this.eventEmitter.emit(JobEventType.NEW_JOB_AVAILABLE, {
//                 jobID: job._id,
//                 userIDs: [nearestDrivers[0]._id],
//               });
//               driverIDsToExclude = [
//                 ...driverIDsToExclude,
//                 nearestDrivers[0]._id,
//               ];
//               counter++;
//             } else {
//               this.logger.debug(
//                 'JobProcessor.newJobAvailable() inside interval nearestDrivers.length > 0 else block',
//               );
//               clearInterval(interval);
//             }
//           } else {
//             clearInterval(interval);
//           }
//         } else {
//           this.logger.debug(
//             'JobProcessor.newJobAvailable() inside interval job.status === JobApprovalStatus.PENDING else block',
//           );
//           clearInterval(interval);
//         }
//       }, adminSettings.sendJobToNextNearestDriverInSeconds * 1000);
//     } catch (error) {
//       this.logger.error(
//         `JobProcessor.newJobAvailable() is called with payload: ${JSON.stringify(
//           payload,
//         )}, error:  ${JSON.stringify(error)}`,
//       );
//     }
//   }
//   // * Get all nearest drivers in order (nearest to farthest) (with check if they are available)
//   // * Get AdminSettings
//   // * Set Up counter
//   // * Setup Interval (save in the variable)
//   // *    Check Job Status
//   // *    If Job status is pending
//   // *        If Yes
//   // *            Check if counter is less than admin settings
//   // *                If yes
//   // *                    Check if nearestDriver array has other element
//   // *                        If yes
//   // *                            Emit event to send push notification to ith nearest driver
//   // *                            Increment counter
//   // *                        If no
//   // *                            Remove interval
//   // *                If no
//   // *                    Remove interval
//   // *          If No
//   // *              Remove interval

//   @OnQueueError()
//   async onQueueError(payload: Job<{ jobID: string }>, error: Error) {
//     this.logger.error(
//       `JobProcessor.onQueueError() is called with payload: ${JSON.stringify(
//         payload,
//       )}, error:  ${JSON.stringify(error)}`,
//     );
//   }

//   @OnQueueWaiting()
//   async onQueueWaiting(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueWaiting() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }

//   @OnQueueActive()
//   async onQueueActive(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueActive() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }

//   @OnQueueStalled()
//   async onQueueStalled(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueStalled() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }

//   @OnQueueCompleted()
//   async onQueueCompleted(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueCompleted() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }

//   @OnQueueFailed()
//   async onQueueFailed(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueFailed() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }

//   @OnQueueRemoved()
//   async onQueueRemoved(payload: Job<{ jobID: string }>) {
//     this.logger.debug(
//       `JobProcessor.onQueueRemoved() is called with payload: ${JSON.stringify(
//         payload,
//       )}`,
//     );
//   }
// }
