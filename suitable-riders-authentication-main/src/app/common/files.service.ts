import { Injectable, Logger } from '@nestjs/common';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

@Injectable()
export class FilesService {
  constructor(private logger: Logger) {}
  public zipDirectory(source: string[], output: string): Promise<void> {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    const stream = fs.createWriteStream(output);

    return new Promise((resolve, reject) => {
      for (const file of source) {
        archive.file(file, { name: path.basename(file) });
      }
      archive
        .on('error', (err) => {
          this.logger.error(err);
          reject(err);
        })
        .pipe(stream);

      stream.on('close', () => {
        resolve();
      });
      archive.finalize();
    });
  }

  public async findFilesWithWildcard(wildString: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(wildString, function (err, files) {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  public async moveFilesToDirectory(
    files: string[],
    destination: string,
  ): Promise<void> {
    for (const file of files) {
      await this.moveFileToDirectory(file, destination);
    }
  }

  public async moveFileToDirectory(
    source: string,
    destination: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.mkdirSync(destination, { recursive: true });
      fs.rename(
        source,
        path.join(destination, path.basename(source)),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  public deleteFile(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(file, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async deleteFiles(files: string[]): Promise<void> {
    for (const file of files) {
      await this.deleteFile(file);
    }
  }
}
