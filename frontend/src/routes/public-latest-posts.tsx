import { BlogPostsService } from "@/client"
import BlogImage from "@/components/ui/blog-image"
import {
  Badge,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/public-latest-posts")({
  component: PublicLatestPosts,
})

function getLatestPostsQueryOptions() {
  return {
    queryFn: () => BlogPostsService.readBlogPosts({ limit: 100 }),
    queryKey: ["latest_posts"],
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  }
}

function PublicLatestPosts() {
  const {
    data: blogPostsResponse,
    isLoading,
    error,
  } = useQuery(getLatestPostsQueryOptions())

  const [imageStates, setImageStates] = useState<
    Record<string, { loading: boolean; error: boolean }>
  >({})

  const handleImageLoad = (imageId: string) => {
    setImageStates((prev) => ({
      ...prev,
      [imageId]: { loading: false, error: false },
    }))
  }

  const handleImageError = (imageId: string) => {
    setImageStates((prev) => ({
      ...prev,
      [imageId]: { loading: false, error: true },
    }))
  }

  if (isLoading) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} mb={6}>
          Latest Blog Posts
        </Heading>
        <Text>Loading...</Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} mb={6}>
          Latest Blog Posts
        </Heading>
        <Text color="red.500">Error loading posts: {error.message}</Text>
      </Container>
    )
  }

  const blogPosts = blogPostsResponse?.data || []

  if (blogPosts.length === 0) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12} mb={6}>
          Latest Blog Posts
        </Heading>
        <Text>No posts found.</Text>
      </Container>
    )
  }

  // Group posts by blog name and get the latest post from each blog
  const blogGroups = blogPosts.reduce(
    (acc: Record<string, typeof blogPosts>, post) => {
      if (!acc[post.blog_name]) {
        acc[post.blog_name] = []
      }
      acc[post.blog_name].push(post)
      return acc
    },
    {},
  )

  // Get the latest post from each blog
  const latestPosts = Object.entries(blogGroups).map(([blogName, posts]) => {
    const latestPost = posts.sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
      return dateB - dateA
    })[0]
    return { blogName, latestPost, postCount: posts.length }
  })

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} mb={6}>
        Latest Blog Posts
      </Heading>
      <VStack gap={8} align="stretch">
        {latestPosts.map(({ blogName, latestPost, postCount }) => (
          <div
            key={latestPost.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Badge colorScheme="blue" variant="subtle">
                {blogName}
              </Badge>
              {latestPost.published_at && (
                <Text fontSize="sm" color="gray.500">
                  {new Date(latestPost.published_at).toLocaleDateString()}
                </Text>
              )}
            </div>
            <div>
              <VStack align="start" gap={4}>
                <Heading size="md">{latestPost.title}</Heading>
                <Text color="gray.600">
                  {latestPost.content.substring(0, 200)}...
                </Text>
                {latestPost.image_urls && latestPost.image_urls.length > 0 && (
                  <Grid
                    templateColumns={{
                      base: "repeat(auto-fit, minmax(120px, 1fr))",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                      xl: "repeat(6, 1fr)",
                    }}
                    maxW="100%"
                    gap={3}
                  >
                    {latestPost.image_urls.map((imageUrl, index) => {
                      const imageId = `${latestPost.id}-${index}`
                      const imageState = imageStates[imageId] || {
                        loading: true,
                        error: false,
                      }

                      return (
                        <BlogImage
                          key={imageId}
                          imageUrl={imageUrl}
                          imageId={imageId}
                          imageState={imageState}
                          onImageLoad={handleImageLoad}
                          onImageError={handleImageError}
                          fallbackUrl={latestPost.url}
                        />
                      )
                    })}
                  </Grid>
                )}
                <Flex gap={2}>
                  <Badge variant="outline" colorScheme="green">
                    {postCount} posts
                  </Badge>
                </Flex>
              </VStack>
            </div>
          </div>
        ))}
      </VStack>
    </Container>
  )
}
