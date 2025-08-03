from sqlmodel import Session, select

from app.core.db import engine
from app.models import Blog, BlogPost
from app.services.naver_blog_service import NaverBlogSerivce


def create_blog_post():
    with Session(engine) as session:
        statement = select(Blog).where(Blog.name == "조양마트")
        blog = session.exec(statement).first()
        print(blog)

    blog_owner = blog.blog_owner
    target_category = blog.target_category
    naver_blog_service = NaverBlogSerivce(blog_owner)
    post_ids = naver_blog_service.get_post_ids(target_category, 1)

    blog_post = naver_blog_service.get_contents(post_ids[0])

    blog_post_in = {
        "blog_id": blog.id,
        "url": f"{blog.url}/{post_ids[0]}",
        "post_id": post_ids[0],
        "title": blog_post.title,
        "published_at": blog_post.published_at,
        "content": blog_post.content,
        "image_urls": blog_post.image_urls,
    }

    with Session(engine) as session:
        blog_post = BlogPost.model_validate(blog_post_in)
        session.add(blog_post)
        session.commit()
        session.refresh(blog_post)


if __name__ == "__main__":
    create_blog_post()
