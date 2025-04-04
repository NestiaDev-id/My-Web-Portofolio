# Gunakan base image Python
FROM python:3.10

# Set working directory
WORKDIR /app

# Salin semua file ke dalam container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Jalankan aplikasi
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
