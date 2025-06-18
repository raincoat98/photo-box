import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';

export async function uploadToNAS(
  filePath: string,
  fileName: string,
): Promise<string> {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucketName = process.env.MINIO_BUCKET_NAME;

  if (!endpoint || !accessKey || !secretKey || !bucketName) {
    throw new Error('필수 환경 변수가 설정되지 않았습니다.');
  }

  const s3Client = new S3Client({
    endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    region: 'us-east-1',
  });

  const fileContent = fs.readFileSync(filePath);
  const remotePath = `uploads/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: remotePath,
    Body: fileContent,
  });

  await s3Client.send(command);
  return remotePath;
}
