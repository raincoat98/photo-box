import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    try {
      return await this.uploadService.uploadFile(file);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('file/:fileId')
  async getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const response = await this.uploadService.getFile(fileId);
      if (!response.Body) {
        throw new HttpException(
          '파일 스트림을 찾을 수 없습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${path.basename(fileId)}`,
      );

      if ('pipe' in response.Body) {
        response.Body.pipe(res);
      } else {
        throw new HttpException(
          '파일 스트림을 처리할 수 없습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('qr/:fileId')
  async generateQRCode(@Param('fileId') fileId: string) {
    try {
      const qrCode = await this.uploadService.generateQRCode(fileId);
      return { qrCode };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
