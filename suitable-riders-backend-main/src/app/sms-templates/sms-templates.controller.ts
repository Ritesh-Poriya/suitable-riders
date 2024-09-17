import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';

import {
  CreateSmsTemplateReqDTO,
  CreateSmsTemplateResDTO,
} from './dtos/create-sms-template.dto';
import { DeleteSmsTemplateResDTO } from './dtos/delete-sms-template.dto';
import { GetSmsTemplateResDTO } from './dtos/get-sms-template.dto';
import {
  UpdateSmsTemplateReqDTO,
  UpdateSmsTemplateResDTO,
} from './dtos/update-sms-template.dto';
import { SmsTemplatesService } from './sms-templates.service';

@Controller({ path: 'api/smsTemplates', version: ['0', '1'] })
export class SmsTemplatesController {
  constructor(private smsTemplateService: SmsTemplatesService) {}

  // Create SmsTemplate
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('/')
  @ApiTags('SmsTemplates')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CreateSmsTemplateReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: CreateSmsTemplateResDTO })
  async createSmsTemplate(@Body() dto: CreateSmsTemplateReqDTO) {
    return this.smsTemplateService.createSmsTemplate(dto);
  }

  // Update SmsTemplate
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Put('/:id')
  @ApiTags('SmsTemplates')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateSmsTemplateResDTO })
  @CommonApiResponses()
  @ApiBody({ type: UpdateSmsTemplateReqDTO })
  async updateSmsTemplate(
    @Body() dto: UpdateSmsTemplateReqDTO,
    @Param('id') id: string,
  ) {
    return this.smsTemplateService.updateSmsTemplate(dto, id);
  }

  // Get all SmsTemplates
  @Version('0')
  @Get('/all')
  @ApiTags('SmsTemplates')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetSmsTemplateResDTO })
  @CommonApiResponses()
  async getSmsTemplate() {
    return this.smsTemplateService.getSmsTemplate();
  }

  // Delete Sms Template
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Delete('/:id')
  @ApiTags('SmsTemplates')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @CommonApiResponses()
  @ApiResponse({ status: HttpStatus.OK, type: DeleteSmsTemplateResDTO })
  async deleteSmsTemplate(@Param('id') id: string) {
    return this.smsTemplateService.deleteSmsTemplate(id);
  }
}
