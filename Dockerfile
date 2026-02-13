# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Tambahkan ini untuk debugging:
RUN ls -la /app 
RUN ls -la /app/dist # Jika Anda menduga 'dist' adalah nama yang benar

# Stage 2: Serve the application
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html # Ganti /app/dist jika perlu
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]