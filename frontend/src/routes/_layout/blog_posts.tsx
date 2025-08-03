import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { BlogPostsService } from "@/client"
import PendingBlogPosts from "@/components/Pending/PendingBlogPosts"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const blogPostsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getBlogPostsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      BlogPostsService.readBlogPosts({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["blog_posts", { page }],
  }
}

export const Route = createFileRoute("/_layout/blog_posts")({
  component: BlogPosts,
  validateSearch: (search) => blogPostsSearchSchema.parse(search),
})

function BlogPostsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getBlogPostsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const blogPosts = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingBlogPosts />
  }

  if (blogPosts.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>
              You don't have any blog posts yet
            </EmptyState.Title>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Blog Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">URL</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Post ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Published At</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {blogPosts?.map((blogPost) => (
            <Table.Row key={blogPost.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {blogPost.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blogPost.blog_name}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blogPost.url}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blogPost.post_id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blogPost.title}
              </Table.Cell>
              <Table.Cell
                color={!blogPost.published_at ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {blogPost.published_at || "N/A"}
              </Table.Cell>
              <Table.Cell>
                {/* TODO: Add BlogActionsMenu component */}
                <span>Actions</span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function BlogPosts() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Blog Posts Management
      </Heading>
      <BlogPostsTable />
    </Container>
  )
}
