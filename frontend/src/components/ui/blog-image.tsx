import { OpenAPI } from "@/client"
import { Box, Image, Text, VStack } from "@chakra-ui/react"
import { useEffect, useRef } from "react"

// 이미지 컴포넌트 분리
interface BlogImageProps {
  imageUrl: string
  imageId: string
  imageState: { loading: boolean; error: boolean }
  onImageLoad: (imageId: string) => void
  onImageError: (imageId: string) => void
  fallbackUrl?: string
}

function BlogImage({
  imageUrl,
  imageId,
  imageState,
  onImageLoad,
  onImageError,
  fallbackUrl,
}: BlogImageProps) {
  const blobUrlRef = useRef<string | null>(null)

  // Blob URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [])

  // 프록시 URL 생성 - OpenAPI.BASE 사용
  const proxyUrl = `${OpenAPI.BASE}/api/v1/proxy/image?url=${encodeURIComponent(imageUrl)}`

  return (
    <Box position="relative" flexShrink={0} w="100%" aspectRatio="1">
      {!imageState.error ? (
        <Image
          src={proxyUrl}
          alt={"Blog post image"}
          w="100%"
          h="100%"
          objectFit="cover"
          borderRadius="md"
          onLoad={() => onImageLoad(imageId)}
          onError={() => onImageError(imageId)}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          onClick={() => window.open(imageUrl, "_blank")}
        />
      ) : (
        <Box
          w="100%"
          h="100%"
          bg="gray.200"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          color="gray.500"
          cursor="pointer"
          _hover={{ bg: "gray.300" }}
          onClick={() => window.open(fallbackUrl || imageUrl, "_blank")}
          title="네이버 블로그 원본에서 보기"
        >
          <VStack gap={1}>
            <Text fontSize="12px">이미지</Text>
            <Text fontSize="12px">접근 제한</Text>
            <Text fontSize="10px" color="blue.500">
              원본 보기
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default BlogImage
