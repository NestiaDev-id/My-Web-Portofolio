import logging

# Konfigurasi format logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Output ke terminal
        logging.FileHandler("app.log")  # Simpan log ke file
    ]
)

logger = logging.getLogger(__name__)
