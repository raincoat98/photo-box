# 👉 빌드 스테이지 (필요 시 따로 분리 가능)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 👉 프로덕션 스테이지
FROM node:18-alpine AS production

# 시간대 설정 (한국 시간)
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

WORKDIR /app

# 패키지 복사 및 설치 (프로덕션 전용)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 앱 소스 복사
COPY . .

# 업로드/임시 폴더 생성 (볼륨으로도 연결 예정)
RUN mkdir -p uploads temp

# 포트 노출 (NestJS 기준으로 수정 가능)
EXPOSE 4600

CMD ["node", "server.js"]