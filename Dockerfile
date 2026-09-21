FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build
ENV NODE_ENV=production
WORKDIR /app/backend
EXPOSE 3000
CMD ["node","server.js"]
