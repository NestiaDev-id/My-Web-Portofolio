# Read the doc: https://huggingface.co/docs/hub/spaces-sdks-docker
FROM python:3.10-slim

# Hugging Face mengharuskan kita membuat user non-root dengan ID 1000
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements dan install dependencies
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy seluruh file proyek
COPY --chown=user . /app

# Perintah untuk menjalankan FastAPI
# (Gunakan main:app karena entry point kita ada di main.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
