from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # GraphDB
    graphdb_url: str = "http://localhost:7200"
    graphdb_repository: str = "animals"
    graphdb_default_graph: str = "http://example.org/graph/taxonomy"

    # LLM (Gemini)
    gemini_api_key: str = Field(...)
    gemini_model_name: str = "gemini-2.5-flash-preview-04-17"
    gemini_max_output_tokens: int = 65500

    base_concept_uri_prefix: str = "http://example.org/taxonomy/"

    @property
    def graphdb_query_endpoint(self) -> str:
        return f"{self.graphdb_url}/repositories/{self.graphdb_repository}"

    @property
    def graphdb_statements_endpoint(self) -> str:
        return f"{self.graphdb_url}/repositories/{self.graphdb_repository}/statements"

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=False
    )


try:
    settings = Settings()
except Exception as e:
    print(f"ERROR: Could not load settings. Ensure .env file is present and correctly configured: {e}")
    raise
