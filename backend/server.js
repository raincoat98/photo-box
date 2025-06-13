const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Client } = require("basic-ftp");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
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

// FTP 클라이언트 설정
const ftpConfig = {
  host: process.env.NAS_HOST || "ww57403.synology.me",
  port: process.env.NAS_PORT || 2121,
  username: process.env.NAS_USERNAME || "kuro",
  password: process.env.NAS_PASSWORD || "sw4261!@sw",
};

// FTP를 사용하여 NAS에 파일 업로드
async function uploadToNAS(localPath, filename) {
  const client = new Client();
  try {
    await client.access(ftpConfig);
    const remotePath = `/photo-box/${filename}`;
    await client.uploadFrom(localPath, remotePath);
    return remotePath;
  } finally {
    client.close();
  }
}

// 파일 업로드 엔드포인트
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    const file = req.file;
    const remotePath = await uploadToNAS(file.path, file.filename);

    // 임시 파일 삭제
    fs.unlinkSync(file.path);

    const fileId = path.parse(file.filename).name;
    const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2일 후

    tempUrls.set(fileId, {
      path: remotePath,
      expiresAt,
    });

    res.json({
      url: `${
        process.env.SERVER_URL || "http://localhost:3001"
      }/api/file/${fileId}`,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "파일 업로드 실패" });
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

  const client = new Client();
  try {
    await client.access(ftpConfig);
    const stream = await client.downloadToBuffer(fileInfo.path);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(fileInfo.path)}`
    );
    res.send(stream);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "파일 다운로드 실패" });
  } finally {
    client.close();
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

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
