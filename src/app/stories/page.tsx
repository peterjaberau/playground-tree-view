"use client"
import { ClientOnly } from "@chakra-ui/react"

export default function Page() {
  return (
    <ClientOnly>
      <div>stories</div>
    </ClientOnly>
  )
}
