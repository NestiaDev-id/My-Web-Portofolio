# Gunakan image Node.js sebagai base image
FROM node:18-alpine

# Set working directory dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json ke dalam container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy semua file proyek ke dalam container
COPY . .

# Expose port backend
EXPOSE 5000

# Jalankan server backend
CMD ["npm", "start"]
