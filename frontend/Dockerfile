# 👉 1단계: 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# VITE용 환경변수 전달을 위한 ARG 선언
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 실행 (Vite는 환경변수 사용 시 반드시 VITE_ 접두사 필요)
RUN npm run build

# 👉 2단계: 프로덕션 스테이지
FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 파일을 nginx로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]