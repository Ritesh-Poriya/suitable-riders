// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { SchedulerRegistry } from '@nestjs/schedule';
// import { CronJob } from 'cron';
// import moment from 'moment';
// import { AdminSettingServices } from 'src/app/admin-settings/admin-settings.service';
// import { EmailService } from 'src/app/mailer/email.service';
// import { MerchantProfileService } from 'src/app/merchant-profile/merchant-profile.service';
// import { UsersService } from 'src/app/users/users.service';
// import { MerchantCronType } from '../@types/merchant-cron-name.type';

// @Injectable()
// export class MonthlySubscriptionEmailService implements OnModuleInit {
//   constructor(
//     private userService: UsersService,
//     private emailService: EmailService,
//     private merchantProfileService: MerchantProfileService,
//     private adminSettingsService: AdminSettingServices,
//     private schedulerRegistry: SchedulerRegistry,
//   ) {}

//   async onModuleInit() {
//     let cronTime = 11; // every day at 11am in uk and  4:30pm in india
//     const adminSetting = await this.adminSettingsService.getAdminSettings();
//     if (adminSetting.isDayLightSavingEnabled === true) {
//       cronTime = 10; // every day at 10am in uk daylight saving and 3:30pm in india
//     }
//     const job = new CronJob(`0 ${cronTime} * * *`, async () => {
//       const toDay = moment(new Date()).format('YYYY-MM-DD');
//       const lastDayOfMonth = moment(toDay).endOf('month').format('YYYY-MM-DD');
//       console.log(toDay);
//       console.log(lastDayOfMonth);
//       const users = await this.userService.getAllMerchantUsers();

//       // if today is last day of month
//       if (toDay === lastDayOfMonth) {
//         for (const user of users) {
//           const merchantProfile =
//             await this.merchantProfileService.getMyMerchantProfile(user._id);
//           await this.emailService.monthlySubscriptionReminderToMerchantLastDay(
//             user.email,
//             {
//               merchantBusinessName: merchantProfile.businessInfo.businessName,
//               month: moment(new Date()).add(1, 'months').format('MMMM'),
//             },
//           );
//         }
//       }
//       const lastSevenDayOfMonth = moment(new Date())
//         .endOf('month')
//         .subtract(7, 'days')
//         .format('YYYY-MM-DD');

//       // if today is last 7 day of month
//       if (toDay === lastSevenDayOfMonth) {
//         for (const user of users) {
//           const merchantProfile =
//             await this.merchantProfileService.getMyMerchantProfile(user._id);
//           await this.emailService.monthlySubscriptionReminderToMerchantLastSevenDay(
//             user.email,
//             {
//               merchantBusinessName: merchantProfile.businessInfo.businessName,
//               month: moment(new Date()).add(1, 'months').format('MMMM'),
//             },
//           );
//         }
//       }
//     });

//     this.schedulerRegistry.addCronJob(
//       MerchantCronType.MONTHLY_SUBSCRIPTION_EMAIL_CRON,
//       job,
//     );
//     job.start();
//   }
// }
