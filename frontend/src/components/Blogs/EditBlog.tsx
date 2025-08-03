import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import type { ApiError, BlogPublic } from "@/client"
import { BlogsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditBlogProps {
  blog: BlogPublic
}

interface BlogUpdateForm {
  name: string
  url: string
  blog_owner: string
  target_category: string
  description?: string
}

const EditBlog = ({ blog }: EditBlogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...blog,
      target_category: blog.target_category ?? "",
      description: blog.description ?? undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: BlogUpdateForm) =>
      BlogsService.updateBlog({ id: blog.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Blog updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
    },
  })

  const onSubmit: SubmitHandler<BlogUpdateForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Blog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the blog details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  placeholder="Name"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.url}
                errorText={errors.url?.message}
                label="URL"
              >
                <Input
                  id="url"
                  {...register("url", {
                    required: "URL is required",
                  })}
                  placeholder="URL"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.blog_owner}
                errorText={errors.blog_owner?.message}
                label="Blog Owner"
              >
                <Input
                  id="blog_owner"
                  {...register("blog_owner", {
                    required: "Blog Owner is required",
                  })}
                  placeholder="Blog Owner"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.target_category}
                errorText={errors.target_category?.message}
                label="Target Category"
              >
                <Input
                  id="target_category"
                  {...register("target_category", {
                    required: "Target Category is required",
                  })}
                  placeholder="Target Category"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description"
              >
                <Input
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  placeholder="Description"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditBlog
