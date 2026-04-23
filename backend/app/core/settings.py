from pathlib import Path

import json

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"

    # Ollama (local LLM) - optional
    enable_ollama: bool = False
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.1:8b"

    # ChromaDB
    chroma_persist_directory: str = "./embeddings"
    chroma_collection_name: str = "healthcare_docs"

    # App
    app_name: str = "AI Healthcare Assistant"
    debug: bool = False

    # CORS — stored as string in .env to avoid pydantic-settings JSON decode issues on empty values
    allowed_origins_raw: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("ALLOWED_ORIGINS", "allowed_origins_raw"),
    )

    # Security
    rate_limit_per_minute: int = 60
    request_size_limit_bytes: int = 65536

    # Persistence and cache
    database_url: str = ""
    redis_url: str = ""
    cache_ttl_seconds: int = 300

    # Auth + platform SQLite (stored under repo /database)
    jwt_secret: str = "change-me-in-production"
    jwt_exp_days: int = 7

    @property
    def allowed_origins(self) -> list[str]:
        s = (self.allowed_origins_raw or "").strip()
        if not s:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        if s.startswith("["):
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except json.JSONDecodeError:
                pass
        return [part.strip() for part in s.split(",") if part.strip()]

    @property
    def sqlite_path(self) -> Path:
        if self.database_url.strip().lower().startswith("sqlite:///"):
            raw = self.database_url.split("sqlite:///", 1)[1]
            return Path(raw).expanduser()
        root = Path(__file__).resolve().parents[3]
        return root / "database" / "health.db"

    model_config = SettingsConfigDict(
        # Support multiple common locations:
        # - repo root ".env" (recommended)
        # - "backend/.env"
        # - legacy "backend/app/.env"
        env_file=(
            str(Path(__file__).resolve().parents[3] / ".env"),
            str(Path(__file__).resolve().parents[2] / ".env"),
            str(Path(__file__).resolve().parents[1] / ".env"),
        ),
        case_sensitive=False,
        enable_decoding=False,
    )

settings = Settings()