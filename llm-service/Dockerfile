# Menggunakan image Python resmi yang ringan
FROM python:3.10-slim

# Set direktori kerja di dalam container
WORKDIR /code

# Copy file requirements.txt terlebih dahulu (untuk caching)
COPY ./requirements.txt /code/requirements.txt

# Install dependencies tanpa menyimpan cache agar image tetap kecil
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy seluruh folder proyek ke dalam container
COPY . /code

# Hugging Face Spaces mengharuskan aplikasi berjalan di port 7860
EXPOSE 7860

# Perintah untuk menjalankan FastAPI menggunakan Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
