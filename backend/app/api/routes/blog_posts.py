import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import Blog, BlogPost, BlogPostPublic, BlogPostsPublic

router = APIRouter(prefix="/blog_posts", tags=["blog_posts"])


@router.get("/{blog_id}", response_model=BlogPostsPublic)
def read_blog_posts(
    session: SessionDep, blog_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve blog posts.
    """

    blog = session.get(Blog, blog_id)

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    count_statement = (
        select(func.count()).select_from(BlogPost).where(BlogPost.blog_id == blog_id)
    )
    count = session.exec(count_statement).one()

    statement = (
        select(BlogPost).where(BlogPost.blog_id == blog_id).offset(skip).limit(limit)
    )
    blog_posts = session.exec(statement).all()

    blog_posts_public = [
        BlogPostPublic(
            id=blog_post.id,
            blog_name=blog.name,
            url=blog_post.url,
            post_id=blog_post.post_id,
            title=blog_post.title,
            published_at=blog_post.published_at,
            content=blog_post.content,
            image_urls=blog_post.image_urls,
        )
        for blog_post in blog_posts
    ]

    return BlogPostsPublic(data=blog_posts_public, count=count)


@router.get("/{id}", response_model=BlogPostPublic)
def read_blog_post(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get blog post by ID.
    """
    blog_post = session.get(BlogPost, id)
    if not blog_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog_post
