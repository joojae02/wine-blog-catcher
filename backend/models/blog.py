import uuid
from datetime import datetime

from sqlmodel import JSON, Column, Field, Relationship, SQLModel


class Blog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(max_length=500)
    blog_owner: str = Field(min_length=1, max_length=255)
    target_category: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    posts: list["BlogPost"] = Relationship(back_populates="blog", cascade_delete=True)


class BlogPost(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    blog_id: uuid.UUID = Field(
        foreign_key="blog.id", nullable=False, ondelete="CASCADE"
    )
    blog: Blog | None = Relationship(back_populates="posts")
    title: str = Field(min_length=1, max_length=255)
    published_at: datetime | None = Field(default=None)
    content: str = Field(min_length=1, max_length=255)
    image_urls: list = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class BlogCreate(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(max_length=500)
    blog_owner: str = Field(min_length=1, max_length=255)
    target_category: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class BlogUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    blog_owner: str | None = Field(default=None, min_length=1, max_length=255)
    target_category: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class BlogPublic(SQLModel):
    id: uuid.UUID
    name: str
    url: str
    blog_owner: str
    target_category: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime


class BlogsPublic(SQLModel):
    data: list[BlogPublic]
    count: int


class NaverBlogPost(SQLModel):
    title: str
    published_at: datetime
    content: str
    image_urls: list[str]
