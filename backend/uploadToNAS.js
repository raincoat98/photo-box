const AWS = require("aws-sdk");
const path = require("path");

const s3 = new AWS.S3({
  endpoint: process.env.MINIO_ENDPOINT || "http://NAS_IP:9000",
  accessKeyId: process.env.MINIO_ACCESS_KEY || "YOUR_ROOT_USER",
  secretAccessKey: process.env.MINIO_SECRET_KEY || "YOUR_ROOT_PASSWORD",
  s3ForcePathStyle: true,
});

async function uploadToNAS(localPath, remoteFileName) {
  // 날짜별 폴더 생성
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const remoteDir = `${year}${month}${day}`;
  const remotePath = `${remoteDir}/${remoteFileName}`;

  try {
    const fileContent = require("fs").readFileSync(localPath);

    const params = {
      Bucket: process.env.MINIO_BUCKET_NAME || "your-bucket-name",
      Key: remotePath,
      Body: fileContent,
    };

    await s3.upload(params).promise();
    console.log("✅ MinIO 업로드 성공:", remotePath);
    return remotePath;
  } catch (err) {
    console.error("❌ MinIO 업로드 실패:", err.message);
    throw err;
  }
}

module.exports = { uploadToNAS };
