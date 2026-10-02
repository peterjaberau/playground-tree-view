"use client"
import { ChakraProvider, defineConfig, defaultConfig, createSystem } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"

const themeConfig: any = defineConfig({
  ...defaultConfig,
  // preflight: false,
  // cssVarsPrefix: 'chakra',
} as any)
const theme = createSystem(themeConfig)

export const Provider = (props: { children: React.ReactNode }) => {
  return (
    <ChakraProvider value={theme}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  )
}
