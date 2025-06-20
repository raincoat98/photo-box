# 빌드 스테이지
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 모든 의존성 설치 (개발 의존성 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션 스테이지
FROM node:18-alpine AS production

# 시간 동기화 설정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# 업로드 및 임시 디렉토리 생성
RUN mkdir -p uploads temp

# 포트 노출
EXPOSE 4500

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4500/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# 애플리케이션 시작
CMD ["node", "server.js"] 