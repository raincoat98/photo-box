require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");

// 환경변수 기본값 설정
const config = {
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  bucketName: process.env.MINIO_BUCKET_NAME || "photo-box",
};

console.log("🔧 MinIO 설정:", {
  endpoint: config.endpoint,
  accessKey: config.accessKey ? "설정됨" : "설정되지 않음",
  secretKey: config.secretKey ? "설정됨" : "설정되지 않음",
  bucketName: config.bucketName,
});

const s3Client = new S3Client({
  endpoint: config.endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
  },
  forcePathStyle: true,
});

module.exports = {
  s3Client,
  bucketName: config.bucketName,
};
