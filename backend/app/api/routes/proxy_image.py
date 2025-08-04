from urllib.parse import unquote

import requests
from fastapi import APIRouter, HTTPException

from app.models import ProxyImagePublic

router = APIRouter(prefix="/proxy", tags=["proxy"])


@router.get("/image", response_model=ProxyImagePublic)
def proxy_image(url: str):
    """
    Proxy image from external sources to bypass CORS restrictions
    """
    try:
        # Decode the URL to handle Korean characters
        decoded_url = unquote(url)

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://blog.naver.com/",
        }

        response = requests.get(decoded_url, headers=headers, timeout=10)
        response.raise_for_status()

        return ProxyImagePublic(
            content=response.content,
            content_type=response.headers.get("content-type", "image/jpeg"),
            content_length=response.headers.get("content-length", 0),
            original_url=decoded_url,
            error_message=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to proxy image: {str(e)}")
