import base64
import json
import os

from google import genai
from google.oauth2 import service_account
from google.genai import types

from app.core.config import settings


class GoogleCredentialsConfigurationError(RuntimeError):
    pass


def environment_credentials():
    """Use an environment-provided service account on Railway, otherwise ADC locally."""
    encoded = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64")
    if not encoded:
        return None
    try:
        payload = json.loads(base64.b64decode(encoded, validate=True).decode("utf-8"))
        return service_account.Credentials.from_service_account_info(
            payload,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        raise GoogleCredentialsConfigurationError(
            "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is invalid"
        ) from exc


def create_vertex_client():
    credentials = environment_credentials()
    kwargs = {
        "vertexai": True,
        "project": settings.GOOGLE_CLOUD_PROJECT,
        "location": settings.GOOGLE_CLOUD_LOCATION,
        "http_options": types.HttpOptions(api_version="v1"),
    }
    if credentials is not None:
        kwargs["credentials"] = credentials
    return genai.Client(**kwargs)
