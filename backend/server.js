const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const QRCode = require("qrcode");
const { uploadToNAS } = require("./uploadToNAS");
const {
  s3Client,
  bucketName,
  testMinIOConnection,
  createBucketIfNotExists,
} = require("./config/minio");
require("dotenv").config();

// 필수 환경변수 체크
const requiredEnvVars = [
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET_NAME",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`환경변수 ${envVar}가 설정되지 않았습니다.`);
  }
});

const app = express();
const port = process.env.PORT || 4600;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

// CORS 설정
const corsOptions = {
  origin: [
    "http://localhost:4601",
    "http://localhost:5173",
    // 프로덕션 도메인 추가 가능
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// 임시 파일 저장을 위한 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 임시 URL 저장소
const tempUrls = new Map();

// 헬스체크 엔드포인트
app.get("/api/hello", (req, res) => {
  res.status(200).json({ status: "OK", message: "Hello, World!" });
});

// 헬스체크 엔드포인트
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 파일 업로드 엔드포인트
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    const file = req.file;
    console.log("📁 파일 업로드 시작:", file.filename);

    const remotePath = await uploadToNAS(file.path, file.filename);

    // 임시 파일 삭제
    fs.unlinkSync(file.path);

    const fileId = path.parse(file.filename).name;
    const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2일 후
    const previewUrl = `${serverUrl}/preview/${fileId}`;

    tempUrls.set(fileId, {
      path: remotePath,
      expiresAt,
    });

    // QR 코드 생성
    const qrCode = await QRCode.toDataURL(previewUrl);

    console.log("✅ 파일 업로드 완료:", fileId);
    res.json({
      url: previewUrl,
      qrCode,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      error: "파일 업로드 실패",
      details: error.message,
    });
  }
});

// 파일 다운로드 엔드포인트
app.get("/api/file/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const fileInfo = tempUrls.get(fileId);

  if (!fileInfo) {
    return res.status(404).json({ error: "파일을 찾을 수 없습니다." });
  }

  if (Date.now() > fileInfo.expiresAt) {
    tempUrls.delete(fileId);
    return res.status(410).json({ error: "파일이 만료되었습니다." });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileInfo.path,
    });

    const response = await s3Client.send(command);
    const stream = response.Body;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(fileInfo.path)}`
    );

    stream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "파일 다운로드 실패" });
  }
});

// QR 코드 생성 엔드포인트
app.get("/api/qr/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const fileInfo = tempUrls.get(fileId);

  if (!fileInfo) {
    return res.status(404).json({ error: "파일을 찾을 수 없습니다." });
  }

  if (Date.now() > fileInfo.expiresAt) {
    tempUrls.delete(fileId);
    return res.status(410).json({ error: "파일이 만료되었습니다." });
  }

  try {
    const fileUrl = `${serverUrl}/api/file/${fileId}`;
    const qrCode = await QRCode.toDataURL(fileUrl);
    res.json({ qrCode });
  } catch (error) {
    console.error("QR code generation error:", error);
    res.status(500).json({ error: "QR 코드 생성 실패" });
  }
});

// 만료된 URL 정리 (1시간마다)
setInterval(() => {
  const now = Date.now();
  for (const [fileId, fileInfo] of tempUrls.entries()) {
    if (now > fileInfo.expiresAt) {
      tempUrls.delete(fileId);
    }
  }
}, 60 * 60 * 1000);

app.listen(port, async () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);

  // MinIO 연결 테스트
  console.log("🔍 MinIO 연결 테스트 중...");
  const isConnected = await testMinIOConnection();
  if (!isConnected) {
    console.warn(
      "⚠️  MinIO 연결에 실패했습니다. 파일 업로드가 작동하지 않을 수 있습니다."
    );
  } else {
    // MinIO 버킷 생성
    console.log("📦 MinIO 버킷 확인/생성 중...");
    const bucketCreated = await createBucketIfNotExists();
    if (bucketCreated) {
      console.log("✅ MinIO 설정이 완료되었습니다.");
    } else {
      console.warn("⚠️  MinIO 버킷 생성에 실패했습니다.");
    }
  }
});
