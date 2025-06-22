const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const { s3Client, bucketName } = require("./config/minio");

async function uploadToNAS(localPath, remoteFileName) {
  const date = new Date();
  const remoteDir = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
  const remotePath = `${remoteDir}/${remoteFileName}`;

  try {
    if (!fs.existsSync(localPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${localPath}`);
    }

    const fileContent = fs.readFileSync(localPath);
    const contentType = mime.lookup(localPath) || "application/octet-stream";

    console.log("📁 파일 읽기 성공:", localPath);
    console.log("🔧 MinIO 업로드 대상:", remotePath);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
    });

    console.log("🚀 MinIO 업로드 시작...");
    await s3Client.send(command);
    console.log("✅ MinIO 업로드 성공:", remotePath);

    return remotePath;
  } catch (err) {
    console.error("❌ MinIO 업로드 실패:", err.message);
    console.error("❌ 에러 상세 정보:", {
      name: err.name,
      code: err.code,
      statusCode: err.$metadata?.httpStatusCode,
      requestId: err.$metadata?.requestId,
    });
    if (err.code === "ENOENT") {
      console.error("파일이 존재하지 않습니다:", localPath);
    }
    throw err;
  }
}

module.exports = { uploadToNAS };
