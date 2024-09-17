import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import path from 'path';
import multer from 'multer';
import { environment } from 'src/environments';
import { MediaService } from './media.service';
import { Public } from '../common/decorators/public-route.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { Request, Response } from 'express';
import { ProtectionType } from './@types/protection-type';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CustomHTTPException } from '../common/errors/custom.exception';
import logger from '../common/logger';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { SizeValidationAndParserPipe } from './pipes/size-validation.pipe';
import { CropValidationPipe } from './pipes/crop-validation.pipe';
import { BackgroundValidationPipe } from './pipes/background-validation.pipe';
import { QualityValidationPipe } from './pipes/quality-validation.pipe';
import {
  BackGroundType,
  CropType,
  SizeType,
} from '../common/@types/image-processing-types';

const multerTemp = '../../../multer-store';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private logger: Logger,
  ) {}
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: path.join(__dirname, multerTemp),
        filename: (req, file, cb) => {
          logger.debug(
            'MediaController.FileInterceptor.storage',
            file.originalname,
          );
          const spitName = file.originalname.split('.');
          const extension = spitName[spitName.length - 1];
          const fileName = spitName.slice(0, spitName.length - 1).join('.');
          cb(null, `${fileName}-${Date.now()}.${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExt = environment.fileUploadAllowedExtensions;
        logger.debug(
          'MediaController.FileInterceptor.fileFilter',
          file.originalname,
        );
        const ext = path.extname(file.originalname);
        logger.debug('MediaController.FileInterceptor.fileFilter', ext);
        if (allowedExt.includes(ext.toLowerCase())) {
          cb(null, true);
        } else {
          cb(
            new CustomHTTPException(
              {
                key: 'errors.INVALID_FILE_TYPE',
              },
              HttpStatus.BAD_REQUEST,
              CustomErrorCodes.INVALID_FILE_TYPE,
            ),
            false,
          );
        }
      },
    }),
  )
  @Post('upload')
  @ApiTags('Media')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        protection: { type: 'string', enum: Object.values(ProtectionType) },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return this.mediaService.uploadFile(file, uploadFileDto);
  }

  @Public()
  @Get('/process-image/:size/:crop/:background/:quality/*')
  async processImage(
    @Req() req: Request,
    @Res() res: Response,
    @Param('size', SizeValidationAndParserPipe) size: SizeType,
    @Param('crop', CropValidationPipe) crop: CropType,
    @Param('background', BackgroundValidationPipe) background: BackGroundType,
    @Param('quality', QualityValidationPipe) quality: number,
  ) {
    // return false;
    this.mediaService.processImage(req, res, size, crop, background, quality);
  }

  @Get('private/*')
  @ApiTags('Media')
  async getPrivateFiles(
    @GetUser() user: UserPayload,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.mediaService.getPrivateFiles(user, req, res);
  }
}
