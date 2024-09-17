import { Injectable, Logger } from '@nestjs/common';
import Jimp from 'jimp';
import fs from 'fs';
import { JIMP_MAX_FILE_SIZE_FOR_PROCESSING_IN_MB } from './constants';
import { environment } from 'src/environments';
import { FilePathService } from './file-path.service';
import { UnexpectedError } from './errors/unexpected.error';
import { CropType, SizeType } from './@types/image-processing-types';

@Injectable()
export class ImageProcessingService {
  private maxImageSize = environment.maxImageSize;
  private minImageQualityLimit = environment.minImageQualityLimit;
  private standardImageQuality = environment.standardImageQuality;
  private standardImageBlurRatio = environment.standardImageBlurRatio;

  constructor(
    private logger: Logger,
    private filePathService: FilePathService,
  ) {}

  public async processImageAndCacheIt(
    filePath: string,
    size: SizeType,
    crop: CropType,
    background: string | null,
    blur: number | null,
    quality = this.standardImageQuality,
  ) {
    const { width: imageWidth, height: imageHeight } = size;
    this.logger.debug(
      `ImageProcessingService.processImage() imageWidth: ${imageWidth} imageHeight: ${imageHeight}`,
    );

    this.logger.debug(
      `ImageProcessingService.processImage() is called with path: ${filePath}`,
    );
    let fileSizeInMegabytes = 0;
    try {
      const fsStat = fs.statSync(filePath);
      this.logger.debug(
        `ImageProcessingService.processImage() fsStat: ${JSON.stringify(
          fsStat,
        )}`,
      );
      fileSizeInMegabytes = fsStat.size / (1024 * 1024);
    } catch (err) {
      this.logger.error(
        `ImageProcessingService.processImage() error: ${JSON.stringify(err)}`,
      );
    }
    if (fileSizeInMegabytes > JIMP_MAX_FILE_SIZE_FOR_PROCESSING_IN_MB) {
      this.logger.error(
        `ImageProcessingService.processImage() fileSizeInMegabytes: ${fileSizeInMegabytes} is greater than ${JIMP_MAX_FILE_SIZE_FOR_PROCESSING_IN_MB}`,
      );
      return filePath;
    }
    const cacheFilePath = this.filePathService.getCacheImagePath(
      filePath,
      size,
      crop,
      background || blur,
      quality,
    );
    this.logger.debug(
      `ImageProcessingService.processImage() cacheFilePath: ${cacheFilePath}`,
    );

    if (fs.existsSync(cacheFilePath)) {
      return cacheFilePath;
    }

    if (quality < this.minImageQualityLimit) {
      quality = this.minImageQualityLimit;
    }

    try {
      if (!fs.existsSync(filePath)) {
        const error: any = new Error('File not found');
        error.code = 'ENOENT';
        throw error;
      }
      const image = await this.processImage(
        filePath,
        imageWidth,
        imageHeight,
        crop,
        background,
        blur,
        quality,
      );
      await image.writeAsync(cacheFilePath);
      return cacheFilePath;
    } catch (error) {
      this.logger.error(error);
      this.logger.debug(
        `ImageProcessingService.processImage() error: ${JSON.stringify(error)}`,
      );
      if (
        error.code === 'ENOENT' ||
        error.message ===
          'There is a memory issue with the file which size greater than 7 MB so revert back source file'
      ) {
        try {
          const placeHolderImagePath =
            this.filePathService.getPlaceHolderImagePath;
          this.logger.debug(
            `ImageProcessingService.processImage() placeHolderImagePath: ${placeHolderImagePath}`,
          );
          const placeholderCacheFilePath =
            this.filePathService.getCacheImagePath(
              filePath,
              size,
              crop,
              background || blur,
              quality,
              true,
            );
          this.logger.debug(
            `ImageProcessingService.processImage() placeholderCacheFilePath: ${placeholderCacheFilePath}`,
          );
          const image = await this.processImage(
            placeHolderImagePath,
            imageWidth,
            imageHeight,
            crop,
            background,
            blur,
            quality,
          );
          await image.writeAsync(placeholderCacheFilePath);
          return placeholderCacheFilePath;
        } catch (err) {
          this.logger.error(
            `ImageProcessingService.processImage() error: ${JSON.stringify(
              err,
            )}`,
          );
          fs.unlinkSync(cacheFilePath);
          throw new UnexpectedError(err.message);
        }
      }
    }
  }

  private async processImage(
    filePath: string,
    imageWidth: number,
    imageHeight: number,
    crop: CropType,
    background: string | null,
    blur: number | null,
    quality: number,
  ) {
    const image = await Jimp.read(filePath);

    image.quality(quality);

    if (imageWidth === 0 || isNaN(imageWidth)) {
      imageWidth = image.getWidth();
    }
    if (imageHeight === 0 || isNaN(imageHeight)) {
      imageHeight = image.getHeight();
    }

    if (imageWidth > this.maxImageSize || imageHeight > this.maxImageSize) {
      if (imageWidth > imageHeight) {
        const ratio = imageHeight / imageWidth;
        imageWidth = this.maxImageSize;
        imageHeight = ratio * imageWidth;
      } else {
        const ratio = imageWidth / imageHeight;
        imageHeight = this.maxImageSize;
        imageWidth = ratio * imageHeight;
      }
    }
    if (crop === CropType.FIT) {
      await this.imageScaleToFit(
        image,
        imageWidth,
        imageHeight,
        background,
        blur,
        this.standardImageBlurRatio,
        filePath,
      );
    } else if (crop === CropType.FILL) {
      this.imageScaleToFill(image, imageWidth, imageHeight);
    }
    return image;
  }

  private async imageScaleToFit(
    image: Jimp,
    w: number,
    h: number,
    background: string | null,
    blur: number | null,
    standardImageBlurRatio: number,
    sourceImagePath: string,
  ) {
    this.logger.debug(
      `ImageProcessingService.imageScaleToFit() is called with w: ${w}, h: ${h}, background: ${background}, standardImageBlurRatio: ${standardImageBlurRatio}, sourceImagePath: ${sourceImagePath}`,
    );
    const sourceImage = await Jimp.read(sourceImagePath);

    if (blur) {
      await image.blur(blur === 0 ? standardImageBlurRatio : blur);
      image
        .cover(w, h)
        .composite(
          sourceImage.scaleToFit(w, h),
          (w - sourceImage.getWidth()) / 2,
          (h - sourceImage.getHeight()) / 2,
        );
    } else {
      image.contain(w, h).background(+background);
    }
  }

  private imageScaleToFill(image: Jimp, w: number, h: number) {
    this.logger.debug(
      `ImageProcessingService.imageScaleToFill() is called with w: ${w}, h: ${h}, image: ${JSON.stringify(
        image,
      )}`,
    );
    image.cover(w, h);
  }
}
