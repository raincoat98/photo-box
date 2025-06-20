require("dotenv").config();
const {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");

// 환경변수 기본값 설정
const config = {
  endpoint: process.env.MINIO_ENDPOINT
    ? `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || 4610}`
    : "http://minio:4610",
  accessKey: process.env.MINIO_ACCESS_KEY || "photoadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "photo123456",
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
  // SSL 설정 추가
  useAccelerateEndpoint: false,
  // 타임아웃 설정
  requestHandler: {
    httpOptions: {
      timeout: 30000,
    },
  },
});

// MinIO 버킷 생성 함수
async function createBucketIfNotExists() {
  try {
    // 버킷이 존재하는지 확인
    const headCommand = new HeadBucketCommand({
      Bucket: config.bucketName,
    });

    try {
      await s3Client.send(headCommand);
      console.log(`✅ 버킷 '${config.bucketName}'이 이미 존재합니다.`);
      return true;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        // 버킷이 존재하지 않으면 생성
        console.log(`📦 버킷 '${config.bucketName}'을 생성 중...`);
        const createCommand = new CreateBucketCommand({
          Bucket: config.bucketName,
        });

        await s3Client.send(createCommand);
        console.log(
          `✅ 버킷 '${config.bucketName}'이 성공적으로 생성되었습니다.`
        );
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ 버킷 생성 실패:", error.message);
    console.error("❌ 에러 코드:", error.$metadata?.httpStatusCode);
    console.error("❌ 에러 타입:", error.name);
    return false;
  }
}

// MinIO 연결 테스트 함수
async function testMinIOConnection() {
  try {
    const { ListBucketsCommand } = require("@aws-sdk/client-s3");
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log("✅ MinIO 연결 성공");
    console.log(
      "📦 사용 가능한 버킷:",
      response.Buckets?.map((b) => b.Name) || []
    );
    return true;
  } catch (error) {
    console.error("❌ MinIO 연결 실패:", error.message);
    console.error("❌ 에러 코드:", error.$metadata?.httpStatusCode);
    console.error("❌ 에러 타입:", error.name);
    return false;
  }
}

module.exports = {
  s3Client,
  bucketName: config.bucketName,
  testMinIOConnection,
  createBucketIfNotExists,
};
