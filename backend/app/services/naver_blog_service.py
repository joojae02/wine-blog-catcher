import json
import re

import requests
from bs4 import BeautifulSoup

from models.blog import NaverBlogPost


class NaverBlogSerivce:
    """
    Naver Blog API Service
    """

    def __init__(self, naver_blog_id: str) -> None:
        """
        Initialize Naver Blog API Service

        :param naver_blog_id: Naver blog id (e.g. "joyangmart" from https://blog.naver.com/joyangmart)
        """
        self.naver_blog_id = naver_blog_id
        self._get_categories()

    def _get_categories(self):
        response = requests.get(
            f"https://m.blog.naver.com/rego/CategoryList.nhn?blogId={self.naver_blog_id}",
            headers={"Referer": "https://m.blog.naver.com"},
        )

        data = json.loads(response.text.split("\n")[1])["result"]["mylogCategoryList"]
        self.categories = {
            d["categoryName"].replace("\xa0", "").replace(" ", ""): (
                d["categoryNo"],
                d["parentCategoryNo"],
            )
            for d in data
            if not d["divisionLine"]
        }
        self.categories["전체글"] = (0, None)

    def category_names(self):
        """
        Get all category names regardless of parent category
        """
        return list(self.categories.keys())

    def get_post_ids(self, category_name: str, count: int = 5) -> list[str]:
        """
        Get post ids in a category

        :param category_name: Category name to get post ids
        :param count: Number of posts to get
        :return: A list of post ids
        """

        url = "http://blog.naver.com/PostTitleListAsync.nhn"
        post_ids = set()

        params = {
            "blogId": self.naver_blog_id,
            "currentPage": 1,
            "categoryNo": self.categories[category_name][0],
            "parentCategoryNo": self.categories[category_name][1],
            "countPerPage": count,
            "viewdate": "",
        }

        try:
            response = requests.get(url, params=params)
            data = json.loads(response.text.replace("\\", "\\\\"))
            lists = data["postList"]
        except Exception as e:
            print(f"API Error occured restart... {e}")
            return []

        ids = [d["logNo"] for d in lists]

        if ids[0] not in post_ids:
            post_ids.update(ids)
            params["currentPage"] += 1
        else:
            print(f"Get post ids: {len(post_ids)} posts found.")
        return sorted(post_ids)

    def get_contents(self, post_id: str) -> NaverBlogPost:
        """
        Get contents of a post

        :param post_id: Post id to get contents
        :return: NaverBlogPost object
        """
        url = "http://blog.naver.com/PostView.nhn"
        params = {
            "blogId": self.naver_blog_id,
            "logNo": post_id,
        }

        response = requests.get(url, params=params)

        soup = BeautifulSoup(response.text, "html.parser")

        # Get title and date from first div (document title)
        title_div = soup.select_one(f"#post-view{post_id} > div > div.se-documentTitle")
        title = ""
        date = ""
        if title_div:
            # Get title from se-module-text
            title_elem = title_div.select_one(".se-title-text")
            if title_elem:
                title = title_elem.get_text().strip()

            # Get date from se_publishDate
            date_elem = title_div.select_one(".se_publishDate")
            if date_elem:
                date = date_elem.get_text().strip()

        # Get content from second div (main container)
        content_div = soup.select_one(
            f"#post-view{post_id} > div > div.se-main-container"
        )

        if not content_div:
            print(f"[Error] cannot select content in {post_id}.")
            return None

        content = content_div.get_text("\n").replace(
            "\xa0", " "
        )  # Space unicode replace
        content = re.sub(r"\s+", " ", content).strip()

        images = []
        img_tags = content_div.find_all("img")

        for img_tag in img_tags:
            img_src = img_tag.get("src")
            if not img_src:
                continue
            image_url = img_src
            if "?" in img_src:
                # Replace any type parameter with w966 image size
                image_url = img_src.split("?")[0] + "?type=w966"
            images.append(image_url)

        return NaverBlogPost(title=title, date=date, content=content, images=images)
