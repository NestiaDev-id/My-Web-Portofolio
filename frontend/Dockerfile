# Stage 1: Build the application
FROM node:20-alpine AS builder 
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application
FROM nginx:alpine 
COPY --from=builder /app/dist /usr/share/nginx/html # Sesuaikan /app/dist jika output build Vite Anda berbeda
# Anda mungkin perlu menambahkan file konfigurasi Nginx kustom jika diperlukan
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]