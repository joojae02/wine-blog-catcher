from fastapi import APIRouter

from app.api.routes import (
    blog_posts,
    blogs,
    items,
    login,
    private,
    proxy_image,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(blogs.router)
api_router.include_router(blog_posts.router)
api_router.include_router(proxy_image.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
