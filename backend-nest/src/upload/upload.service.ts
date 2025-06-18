import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import { uploadToNAS } from './uploadToNAS';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private tempUrls: Map<string, { path: string; expiresAt: number }>;
  private serverUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const bucket = this.configService.get<string>('MINIO_BUCKET_NAME');

    if (!endpoint || !accessKey || !secretKey || !bucket) {
      throw new Error('필수 환경 변수가 설정되지 않았습니다.');
    }

    this.s3Client = new S3Client({
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      region: 'us-east-1',
    });

    this.bucketName = bucket;
    this.tempUrls = new Map();
    this.serverUrl =
      this.configService.get<string>('SERVER_URL') || 'http://localhost:3001';

    // 만료된 URL 정리 (1시간마다)
    setInterval(
      () => {
        const now = Date.now();
        for (const [fileId, fileInfo] of this.tempUrls.entries()) {
          if (now > fileInfo.expiresAt) {
            this.tempUrls.delete(fileId);
          }
        }
      },
      60 * 60 * 1000,
    );
  }

  async uploadFile(file: any) {
    const remotePath = await uploadToNAS(file.path, file.filename);
    fs.unlinkSync(file.path);

    const fileId = path.parse(file.filename).name;
    const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2일 후
    const previewUrl = `${this.serverUrl}/preview/${fileId}`;

    this.tempUrls.set(fileId, {
      path: remotePath,
      expiresAt,
    });

    const qrCode = await QRCode.toDataURL(previewUrl);

    return {
      url: previewUrl,
      qrCode,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  async getFile(fileId: string) {
    const fileInfo = this.tempUrls.get(fileId);

    if (!fileInfo) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    if (Date.now() > fileInfo.expiresAt) {
      this.tempUrls.delete(fileId);
      throw new Error('파일이 만료되었습니다.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileInfo.path,
    });

    return this.s3Client.send(command);
  }

  async generateQRCode(fileId: string) {
    const fileInfo = this.tempUrls.get(fileId);

    if (!fileInfo) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    if (Date.now() > fileInfo.expiresAt) {
      this.tempUrls.delete(fileId);
      throw new Error('파일이 만료되었습니다.');
    }

    const fileUrl = `${this.serverUrl}/api/file/${fileId}`;
    return QRCode.toDataURL(fileUrl);
  }
}
