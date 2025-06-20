// 환경변수에서 백엔드 서버 URL 가져오기
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4600";

// API 엔드포인트들
export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  FILE: (fileId: string) => `${API_BASE_URL}/api/file/${fileId}`,
  QR: (fileId: string) => `${API_BASE_URL}/api/qr/${fileId}`,
  HEALTH: `${API_BASE_URL}/api/health`,
  HELLO: `${API_BASE_URL}/api/hello`,
} as const;

// 앱 설정
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],
  UPLOAD_TIMEOUT: 30000, // 30초
} as const;
