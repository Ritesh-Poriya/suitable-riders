import { All, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/public-route.decorator';

@Controller({ path: 'api/stripe' })
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Public()
  @Post('event')
  @HttpCode(200)
  async event(@Req() req: Request) {
    return await this.stripeService.stripeEvent(req);
  }

  @All('*')
  @Roles(UserRole.DRIVER)
  async stripe(@Req() request: Request, @Res() response: Response) {
    this.stripeService.handleStripeCall(
      request.method,
      request.originalUrl,
      request.body,
      response,
    );
  }
}
