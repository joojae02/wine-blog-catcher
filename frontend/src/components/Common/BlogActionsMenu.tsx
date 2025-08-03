import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { BlogPublic } from "@/client"
import DeleteBlog from "../Blogs/DeleteBlog"
import EditBlog from "../Blogs/EditBlog"

interface BlogActionsMenuProps {
  blog: BlogPublic
}

export const BlogActionsMenu = ({ blog }: BlogActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditBlog blog={blog} />
        <DeleteBlog id={blog.id} />
      </MenuContent>
    </MenuRoot>
  )
}
