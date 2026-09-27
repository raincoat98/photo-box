# Photo Box

사진 업로드 및 QR 코드 생성 서비스

## 기술 스택

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: MinIO (S3 호환)
- **Container**: Docker + Docker Compose

## 도커로 실행하기

### 1. 환경변수 설정

```bash
# 백엔드 환경변수 설정
cp backend/env.example backend/.env

# 프론트엔드 환경변수 설정
cp frontend/env.example frontend/.env

# .env 파일들을 편집하여 실제 값으로 설정
nano backend/.env
nano frontend/.env
```

필요한 환경변수:

**백엔드 (`backend/.env`)**:

- `NODE_ENV`: 실행 환경
- `PORT`: 백엔드 포트
- `SERVER_URL`: 외부에서 접근할 백엔드 주소
- `MINIO_ENDPOINT`: 백엔드에서 접근할 MinIO 주소
- `MINIO_PORT`: MinIO API 포트
- `MINIO_ROOT_USER`: MinIO 사용자
- `MINIO_ROOT_PASSWORD`: MinIO 비밀번호
- `MINIO_BUCKET_NAME`: MinIO 버킷 이름

**프론트엔드 (`frontend/.env`)**:

- `VITE_API_BASE_URL`: 브라우저에서 접근할 백엔드 API 주소

### 2. 도커 컴포즈로 실행

```bash
# 모든 서비스 빌드 및 실행
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml up --build

# 백그라운드에서 실행
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml up -d --build
```

### 3. 서비스 접속

- **Frontend**: http://localhost:4601
- **Backend API**: http://localhost:4600

### 4. 서비스 관리

```bash
# 서비스 중지
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml down

# 로그 확인
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml logs -f

# 특정 서비스 로그 확인
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml logs -f frontend
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml logs -f backend

# 서비스 재시작
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml restart

# 볼륨 삭제 (데이터 초기화)
docker compose --env-file backend/.env --env-file frontend/.env -f docker-compose.prod.yml down -v
```

## 개발 환경에서 실행하기

### Frontend

```bash
cd frontend
npm install

# 환경변수 설정
cp env.example .env
# .env 파일에서 VITE_API_BASE_URL을 백엔드 서버 주소로 설정

npm run dev
```

### Backend

```bash
cd backend
npm install

# 환경변수 설정
cp env.example .env
# .env 파일에서 MinIO 설정을 실제 값으로 변경

npm start
```

## API 엔드포인트

- `POST /api/upload`: 파일 업로드
- `GET /api/file/:fileId`: 파일 다운로드
- `GET /api/qr/:fileId`: QR 코드 생성
- `GET /api/health`: 헬스체크
- `GET /api/hello`: 테스트 엔드포인트

## 도커 이미지 빌드

### 개별 서비스 빌드

```bash
# Frontend 빌드
docker build -t photo-box-frontend ./frontend

# Backend 빌드
docker build -t photo-box-backend ./backend
```

### 개별 서비스 실행

```bash
# Frontend 실행
docker run -p 4601:80 photo-box-frontend

# Backend 실행
docker run -p 4600:4600 --env-file backend/.env photo-box-backend
```

## 문제 해결

### 포트 충돌

포트 4600이나 4601이 이미 사용 중인 경우 docker-compose.prod.yml에서 포트를 변경하세요.

### 환경변수 문제

backend/.env와 frontend/.env 파일이 올바르게 설정되었는지 확인하세요.

### 프론트엔드 API 연결 문제

프론트엔드의 VITE_API_BASE_URL이 올바른 백엔드 서버 주소를 가리키는지 확인하세요.
