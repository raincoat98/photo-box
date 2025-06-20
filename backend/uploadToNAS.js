const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const { s3Client, bucketName } = require("./config/minio");

async function uploadToNAS(localPath, remoteFileName) {
  // 날짜별 폴더 생성
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const remoteDir = `${year}${month}${day}`;
  const remotePath = `${remoteDir}/${remoteFileName}`;

  try {
    // 파일 존재 여부 확인
    if (!fs.existsSync(localPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${localPath}`);
    }

    // 파일 읽기
    const fileContent = fs.readFileSync(localPath);
    console.log("📁 파일 읽기 성공:", localPath);
    console.log("🔧 MinIO 설정 확인:", {
      endpoint: s3Client.config.endpoint,
      bucketName: bucketName,
      remotePath: remotePath,
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: fileContent,
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
      endpoint: s3Client.config.endpoint,
      bucketName: bucketName,
    });
    if (err.code === "ENOENT") {
      console.error("파일이 존재하지 않습니다:", localPath);
    }
    throw err;
  }
}

module.exports = { uploadToNAS };
