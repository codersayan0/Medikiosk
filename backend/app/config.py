from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    app_name: str = "MediKiosk Backend"

    environment: str = "development"

    mongodb_uri: str
    mongodb_database: str = "medikiosk"

    frontend_url: str = "http://localhost:5173"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.5-flash-lite"

    gemini_embedding_model: str = "gemini-embedding-001"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()