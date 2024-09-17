import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public-route.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import {
  AddSubscribeNewsLetterEmailReqDTO,
  AddSubscribeNewsLetterEmailResDTO,
} from './dtos/add-subscribe-news-latter-email.dto';
import { DeleteSubscribeNewsLetterEmailReqDTO } from './dtos/delete-subscribe-news-letter-email.dto';
import { SendEmailReqDTO } from './dtos/send-email.dto';
import { SubscribeNewsLetterService } from './subscribe-news-latter.service';

@Controller({ path: 'api/subscribeNewsLetter', version: ['0', '1'] })
export class SubscribeNewsLetterController {
  constructor(private subscribeNewsLetterService: SubscribeNewsLetterService) {}

  // Add news letter email
  @Version('0')
  @Public()
  @Post('/')
  @ApiTags('subscribeNewsLetter')
  @ApiBody({ type: AddSubscribeNewsLetterEmailReqDTO })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AddSubscribeNewsLetterEmailResDTO,
  })
  async addSubscribeEmail(@Body() dto: AddSubscribeNewsLetterEmailReqDTO) {
    return this.subscribeNewsLetterService.addSubscribeEmail(dto);
  }

  // Delete news letter email
  @Version('0')
  @Public()
  @Delete('/')
  @ApiTags('subscribeNewsLetter')
  @ApiBody({ type: DeleteSubscribeNewsLetterEmailReqDTO })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean,
  })
  async deleteSubscribeEmail(
    @Body() dto: DeleteSubscribeNewsLetterEmailReqDTO,
  ) {
    return this.subscribeNewsLetterService.deleteSubscribeEmail(dto);
  }

  // Send email to news letter subscribe email
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('/sendEmail')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiTags('subscribeNewsLetter')
  @ApiBody({ type: SendEmailReqDTO })
  async sendSubscribeEmail(@Body() dto: SendEmailReqDTO) {
    return this.subscribeNewsLetterService.sendSubscribeEmail(dto);
  }
}
