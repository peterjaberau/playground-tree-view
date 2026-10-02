import { Container } from "@chakra-ui/react"
import PragmaticDnd from "./components/pragmatic-dnd"

export default function Page() {
  return (
    <Container css={{ h: "100vh", w: "xl" }}>
      <PragmaticDnd/>
    </Container>
  )
}
