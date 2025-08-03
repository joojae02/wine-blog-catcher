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

import { BlogsService } from "@/client"
import AddBlog from "@/components/Blogs/AddBlog"
import { BlogActionsMenu } from "@/components/Common/BlogActionsMenu"
import PendingBlogs from "@/components/Pending/PendingBlogs"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const blogsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getBlogsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      BlogsService.readBlogs({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["blogs", { page }],
  }
}

export const Route = createFileRoute("/_layout/blogs")({
  component: Blogs,
  validateSearch: (search) => blogsSearchSchema.parse(search),
})

function BlogsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getBlogsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const blogs = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingBlogs />
  }

  if (blogs.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any blogs yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new blog to get started
            </EmptyState.Description>
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
            <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">URL</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Blog Owner</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Target Category</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {blogs?.map((blog) => (
            <Table.Row key={blog.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {blog.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blog.name}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blog.url}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blog.blog_owner}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {blog.target_category}
              </Table.Cell>
              <Table.Cell
                color={!blog.description ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {blog.description || "N/A"}
              </Table.Cell>
              <Table.Cell>
                <BlogActionsMenu blog={blog} />
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

function Blogs() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Blogs Management
      </Heading>
      <AddBlog />
      <BlogsTable />
    </Container>
  )
}
