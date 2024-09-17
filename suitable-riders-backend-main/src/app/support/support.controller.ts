import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public-route.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { SupportWebReqDTO } from './dto/support-email-web.dto';
import { SupportReqDTO } from './dto/support-email.dto';
import { SupportService } from './support.service';

@Controller({ path: 'api/support', version: ['0', '1'] })
export class SupportController {
  constructor(private supportService: SupportService) {}

  // Send support email for app
  @Version('0')
  @Post('/')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiTags('Support')
  @ApiBody({ type: SupportReqDTO })
  async supportEmail(@Body() dto: SupportReqDTO, @GetUser() user: UserPayload) {
    return this.supportService.supportEmail(dto, user);
  }

  // Send support email for web
  @Version('0')
  @Public()
  @Post('/web')
  @ApiTags('Support')
  @ApiBody({ type: SupportWebReqDTO })
  async supportWebEmail(@Body() dto: SupportWebReqDTO) {
    return this.supportService.supportWebEmail(dto);
  }
}
