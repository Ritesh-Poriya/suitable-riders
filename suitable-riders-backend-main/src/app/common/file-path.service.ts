import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { environment } from 'src/environments';
import { Md5 } from 'ts-md5';
import { CropType, SizeType } from './@types/image-processing-types';

@Injectable()
export class FilePathService {
  private cacheImageFolderPath = environment.cacheImageFolderPath;
  private publicFolderPath = path.join(__dirname, '../../../public');

  constructor(private logger: Logger) {}

  get getPlaceHolderImagePath() {
    return environment.placeHolderImagePath;
  }

  public getCacheImagePath(
    filePath: string,
    size: SizeType,
    crop: CropType,
    background: string | number | null,
    quality: number,
    isPlaceHolder = false,
  ): string {
    this.logger.debug(
      `FilePathService.getCacheImagePath() is called with path: ${filePath} size: ${size} crop: ${crop} background: ${background} quality: ${quality} isPlaceHolder: ${isPlaceHolder}`,
    );
    const { width: imageWidth, height: imageHeight } = size;
    const md5 = new Md5();
    md5.appendStr(
      'image' +
        filePath +
        imageWidth +
        imageHeight +
        crop +
        background +
        quality +
        isPlaceHolder,
    );
    const imageName = md5.end().toString() + '-cache';
    this.logger.debug(
      `FilePathService.getCacheImagePath() imageName: ${imageName}`,
    );
    const imageExtension = path.extname(filePath);
    this.logger.debug(
      `FilePathService.getCacheImagePath() imageExtension: ${imageExtension}`,
    );
    const imagePath = path.join(
      this.cacheImageFolderPath,
      imageName + imageExtension,
    );
    this.logger.debug(
      `FilePathService.getCacheImagePath() imagePath: ${imagePath}`,
    );
    return imagePath;
  }

  public getFilePathForUrl(url: string): string {
    return path.join(this.publicFolderPath, url.replace('/media/', ''));
  }
}
