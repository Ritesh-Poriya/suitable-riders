import { All, Controller, HttpStatus, Req, Res } from '@nestjs/common';
import qs from 'qs';
import { Request, Response } from 'express';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';

@Controller('api/googleMapsApi')
export class GoogleApiController {
  constructor(private http: HttpService) {}

  @All('/*')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiTags('Google API')
  async googleAPI(@Req() req: Request, @Res() res: Response) {
    const requestObj: any = {
      url:
        req.originalUrl.replace(
          '/api/googleMapsApi/',
          'https://maps.googleapis.com/',
        ) + `&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    };
    requestObj.method = req.method;
    if (requestObj.method === 'POST') {
      requestObj.data = qs.stringify(req.body);
    }
    try {
      const observable = this.http.request(requestObj);
      const googleRes = await firstValueFrom(observable);
      res.status(googleRes.status).json(googleRes.data);
    } catch (error) {
      throw new CustomHTTPException(
        {
          key: 'errors.SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        CustomErrorCodes.SERVER_ERROR,
      );
    }
  }
}
