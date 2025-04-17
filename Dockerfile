# Node.js 18 기반 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json을 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 기본 포트 설정
EXPOSE 3000

# 컨테이너 실행 시 개발 서버를 폴링 옵션으로 시작
CMD ["npm", "start", "--", "--poll=500"]
