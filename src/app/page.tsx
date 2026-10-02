import { Container } from "@chakra-ui/react"
import PragmaticDnd from "./components/pragmatic-dnd"

export default function Page() {
  return (
    <Container maxW="xl" minH="dvh">
      <PragmaticDnd />
    </Container>
  )
}
