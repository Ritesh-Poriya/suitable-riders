import { Injectable, Logger } from '@nestjs/common';
import { environment } from 'src/environments';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { EmailService } from '../mailer/email.service';
import { UsersService } from '../users/users.service';
import { SupportWebReqDTO } from './dto/support-email-web.dto';
import { SupportReqDTO } from './dto/support-email.dto';

@Injectable()
export class SupportService {
  constructor(
    private logger: Logger,
    private emailService: EmailService,
    private userService: UsersService,
  ) {}

  public async supportEmail(dto: SupportReqDTO, user: UserPayload) {
    this.logger.debug(
      `SupportService.supportEmail() with dto: ${JSON.stringify(
        dto,
      )} and user: ${JSON.stringify(user)}`,
    );

    const userDetail = await this.userService.findOneById(user.userID);

    this.emailService.supportRequest(environment.supportEmail, {
      name: userDetail.username,
      email: userDetail.email,
      title: dto.title,
      description: dto.description,
      role: user.role,
      files: dto.attachment,
    });

    this.emailService.supportRequestToUser(userDetail.email, {
      name: userDetail.username,
      email: userDetail.email,
      title: dto.title,
      description: dto.description,
      role: user.role,
      files: dto.attachment,
    });
  }

  public async supportWebEmail(dto: SupportWebReqDTO) {
    this.logger.debug(
      `SupportService.supportWebEmail() with dto: ${JSON.stringify(dto)}`,
    );
    this.emailService.webSupportRequest(environment.supportEmail, {
      name: dto.firstName + ' ' + dto.lastName,
      email: dto.email,
      message: dto.message,
    });
  }
}
