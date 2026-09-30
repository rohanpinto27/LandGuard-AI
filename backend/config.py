import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

class Config:
    # Server Port
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")

    # MySQL Database Configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "Rohan@27")
    DB_NAME = os.getenv("DB_NAME", "landguard")

    # Secret Key
    SECRET_KEY = os.getenv("SECRET_KEY", "landguard_ai_academic_prototype_key_2026")
