import { Flex } from "@chakra-ui/react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flex m="0" maxW="full" p="2.5" h="100dvh" minH="0" gap="2.5" bg="bg" direction={"row"}>
      <Flex minW="0" minH="0" flex="1" align="center" justify="center" overflow="hidden">
        <Flex
          position="relative"
          direction="column"
          h={"full"}
          w={"full"}
          minW="48rem"
          maxW="full"
          overflow="hidden"
          borderWidth="1px"
          borderColor="border"
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
