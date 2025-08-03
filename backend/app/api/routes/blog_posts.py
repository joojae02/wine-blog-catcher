import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import Blog, BlogPost, BlogPostPublic, BlogPostsPublic

router = APIRouter(prefix="/blog/posts", tags=["blog_posts"])


@router.get("/", response_model=BlogPostsPublic)
def read_blog_posts(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    blog_id: uuid.UUID | None = None,
) -> Any:
    """
    Retrieve all blog posts with optional blog filtering.
    """

    # Base query for blog posts
    base_query = select(BlogPost)

    # Add blog filter if blog_id is provided
    if blog_id:
        blog = session.get(Blog, blog_id)
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        base_query = base_query.where(BlogPost.blog_id == blog_id)

    # Count query
    count_query = select(func.count()).select_from(base_query.subquery())
    count = session.exec(count_query).one()

    # Data query with pagination
    statement = base_query.offset(skip).limit(limit)
    blog_posts = session.exec(statement).all()

    # Get all unique blog IDs to fetch blog names efficiently
    blog_ids = list({post.blog_id for post in blog_posts})
    blogs = {}
    if blog_ids:
        blogs_query = select(Blog).where(Blog.id.in_(blog_ids))
        blogs_list = session.exec(blogs_query).all()
        blogs = {blog.id: blog for blog in blogs_list}

    # Convert to BlogPostPublic with blog_name
    blog_posts_public = [
        BlogPostPublic(
            id=blog_post.id,
            blog_name=blogs.get(blog_post.blog_id, {}).name
            if blogs.get(blog_post.blog_id)
            else "Unknown Blog",
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


@router.get("/post/{id}", response_model=BlogPostPublic)
def read_blog_post(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get blog post by ID.
    """
    blog_post = session.get(BlogPost, id)
    if not blog_post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Get the associated blog
    blog = session.get(Blog, blog_post.blog_id)

    return BlogPostPublic(
        id=blog_post.id,
        blog_name=blog.name if blog else "Unknown Blog",
        url=blog_post.url,
        post_id=blog_post.post_id,
        title=blog_post.title,
        published_at=blog_post.published_at,
        content=blog_post.content,
        image_urls=blog_post.image_urls,
    )
