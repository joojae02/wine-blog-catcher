import io
from urllib.parse import unquote

import requests
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/proxy", tags=["proxy"])


@router.get("/image")
def proxy_image(url: str):
    """
    Proxy image from external sources to bypass CORS restrictions
    """
    # Decode the URL to handle Korean characters
    decoded_url = unquote(url)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://blog.naver.com/",
    }

    response = requests.get(decoded_url, headers=headers, timeout=10)
    response.raise_for_status()

    return StreamingResponse(
        io.BytesIO(response.content),
        media_type=response.headers.get("content-type", "image/jpeg"),
        headers={
            "Content-Length": str(len(response.content)),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "*",
        },
    )
