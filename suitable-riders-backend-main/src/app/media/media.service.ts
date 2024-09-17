import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { environment } from 'src/environments';
import { FilesService } from '../common/files.service';
import { ProtectionType } from './@types/protection-type';
import { UploadFileDto } from './dto/upload-file.dto';
import path from 'path';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from '../users/@types/user-role-type';
import { CustomHTTPException } from '../common/errors/custom.exception';
import Downloader from 'nodejs-file-downloader';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import {
  BackGroundBlurType,
  BackGroundColorType,
  BackGroundType,
  CropType,
  SizeType,
} from '../common/@types/image-processing-types';
import { ImageProcessingService } from '../common/image-processing.service';
import { FilePathService } from '../common/file-path.service';
import { UtilService } from '../common/util.service';

const privateFolderPath = '../../../private';
const publicFolderPath = '../../../public';
const projectDirectoryPath = '../../../';

@Injectable()
export class MediaService {
  constructor(
    private filesService: FilesService,
    private logger: Logger,
    private imageProcessing: ImageProcessingService,
    private pathService: FilePathService,
    private utils: UtilService,
  ) {}
  public async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ) {
    this.logger.debug(
      `MediaService.uploadFile() is called with file: ${JSON.stringify(
        file,
      )} uploadFileDto: ${JSON.stringify(uploadFileDto)}`,
    );
    this.logger.debug(
      `MediaService.uploadFile() environment.fileMaxSizeInBytes: ${environment.fileMaxSizeInBytes}`,
    );
    if (file.size > environment.fileMaxSizeInBytes) {
      await this.filesService.deleteFile(file.path);
      throw new CustomHTTPException(
        {
          key: 'errors.FILE_SIZE_IS_TOO_BIG',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.FILE_SIZE_IS_TOO_BIG,
      );
    }
    let newPath: string;
    if (uploadFileDto.protection === ProtectionType.PRIVATE) {
      const pathToProtectedTemp = path.join(
        __dirname,
        `${privateFolderPath}/temp`,
      );
      this.logger.debug(
        `MediaService.uploadFile() pathToProtectedTemp: ${pathToProtectedTemp}`,
      );
      await this.filesService.moveFileToD
      irectory(
        file.path,
        pathToProtectedTemp,
      );
      newPath = `/media/private/temp/${file.filename}`;
      this.logger.debug(`MediaService.uploadFile() newPath: ${newPath}`);
    } else {
      const pathToPublicTemp = path.join(__dirname, `${publicFolderPath}/temp`);
      this.logger.debug(
        `MediaService.uploadFile() pathToPublicTemp: ${pathToPublicTemp}`,
      );
      await this.filesService.moveFileToDirectory(file.path, pathToPublicTemp);
      newPath = `/media/temp/${file.filename}`;
      this.logger.debug(`MediaService.uploadFile() newPath: ${newPath}`);
    }
    return {
      path: newPath,
    };
  }

  public async moveFile(filePath: string, userID: string) {
    const fileProtection = this.getFileProtectionType(filePath);
    let relativePath: string;
    if (!this.isTemp(filePath)) {
      return filePath;
    }
    let newPath: string;
    if (fileProtection === ProtectionType.PRIVATE) {
      newPath = path.resolve(__dirname, `${privateFolderPath}/${userID}`);
      relativePath = `/media/private/${userID}/${path.basename(filePath)}`;
      filePath = filePath.replace('media/', '');
      filePath = path.join(__dirname, `${projectDirectoryPath}${filePath}`);
      console.log(newPath);
    } else {
      newPath = path.resolve(__dirname, `${publicFolderPath}/images`);
      relativePath = `/media/images/${path.basename(filePath)}`;
      filePath = filePath.replace('media/', '');
      filePath = path.join(__dirname, `${publicFolderPath}${filePath}`);
      console.log(newPath);
    }
    await this.filesService.moveFileToDirectory(filePath, newPath);
    return relativePath;
  }

  private getFileProtectionType(filePath: string) {
    if (filePath.includes('/private/')) {
      return ProtectionType.PRIVATE;
    } else {
      return ProtectionType.PUBLIC;
    }
  }

  public isTemp(filePath: string) {
    if (filePath.includes('/temp/')) {
      return true;
    } else {
      return false;
    }
  }

  public getPrivateFiles(
    user: UserPayload,
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ) {
    let urlWithoutQuery = req.url.split('?')[0];
    urlWithoutQuery = decodeURI(urlWithoutQuery);
    if (this.isTemp(urlWithoutQuery)) {
      const filePath = this.getFilePathFromUrl(urlWithoutQuery);
      return res.sendFile(
        path.join(__dirname, `${projectDirectoryPath}${filePath}`),
      );
    }
    if (
      user.role === UserRole.ADMIN ||
      this.checkDoesUserOwnFile(user, urlWithoutQuery)
    ) {
      const filePath = this.getFilePathFromUrl(urlWithoutQuery);
      return res.sendFile(
        path.join(__dirname, `${projectDirectoryPath}/${filePath}`),
      );
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.FILE_NOT_FOUND,
      );
    }
  }

  private getFilePathFromUrl(url: string) {
    let filePath = url.replace('media/', '');
    const index = filePath.indexOf('?');
    if (index !== -1) {
      filePath = filePath.substring(0, index);
    }
    return filePath;
  }

  private checkDoesUserOwnFile(user: UserPayload, url: string) {
    const splitFilesPath = url.split('/');
    if (splitFilesPath[2] === 'private') {
      if (splitFilesPath[3] === user.userID) {
        return true;
      }
    }
    return false;
  }

  public deleteFile(filePath: string) {
    const protectionType = this.getFileProtectionType(filePath);
    if (protectionType === ProtectionType.PRIVATE) {
      filePath = filePath.replace('media/', '');
      const file = path.join(__dirname, `${projectDirectoryPath}${filePath}`);
      return this.filesService.deleteFile(file);
    } else {
      filePath = filePath.replace('media/', '');
      const file = path.join(__dirname, `${publicFolderPath}${filePath}`);
      return this.filesService.deleteFile(file);
    }
  }

  public async downloadFile(filePath: string, protection: ProtectionType) {
    let dirPath: string;
    let newPath: string;
    if (protection === ProtectionType.PRIVATE) {
      dirPath = path.join(__dirname, `${privateFolderPath}/temp`);
      newPath = `/media/private/temp/${path.basename(filePath)}`;
    } else {
      dirPath = path.join(__dirname, `${publicFolderPath}/temp`);
      newPath = `/media/temp/${path.basename(filePath)}`;
    }
    console.log(Downloader);
    const downloader = new Downloader({
      url: filePath,
      directory: dirPath,
    });
    await downloader.download();
    return newPath;
  }

  public async processImage(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    size: SizeType,
    crop: CropType,
    background: BackGroundType,
    quality: number,
  ) {
    this.logger.debug(
      `MediaService.processImage() size: ${JSON.stringify(
        size,
      )} crop: ${crop} background: ${JSON.stringify(
        background,
      )} quality: ${quality}`,
    );
    let url = req.url;
    this.logger.debug(`MediaService.processImage() url: ${url}`);
    url = this.getFileUrlFromRequest(url);
    this.logger.debug(`MediaService.processImage() fetched url: ${url}`);
    const filePath = this.pathService.getFilePathForUrl(url);
    this.logger.debug(`MediaService.processImage() filePath: ${filePath}`);
    const processedFilePath = await this.imageProcessing.processImageAndCacheIt(
      filePath,
      size,
      crop,
      (background as BackGroundColorType).color || null,
      (background as BackGroundBlurType).blur || null,
      quality,
    );
    this.logger.debug(
      `MediaService.processImage() processedFilePath: ${processedFilePath}`,
    );
    return res.sendFile(processedFilePath);
  }

  private getFileUrlFromRequest(url: string) {
    const pos = this.utils.getPosition(url, '/media', 2);
    return url.slice(pos);
  }
}
