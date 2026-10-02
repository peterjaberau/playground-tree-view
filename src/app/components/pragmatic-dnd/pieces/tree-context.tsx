import { createContext, type Context } from "react"

import { attachInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item/attach-instruction"
import { extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item/extract-instruction"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/list-item"

import type { TreeAction } from "../data/tree"

export type TreeContextValue = {
  dispatch: (action: TreeAction) => void
  uniqueContextId: symbol
}

export const TreeContext: Context<TreeContextValue> = createContext<TreeContextValue>({
  dispatch: () => {},
  uniqueContextId: Symbol("tree-context"),
})

export type DependencyContextValue = {
  DropIndicator: typeof DropIndicator
  attachInstruction: typeof attachInstruction
  extractInstruction: typeof extractInstruction
}

export const DependencyContext: Context<DependencyContextValue> = createContext<DependencyContextValue>({
  DropIndicator,
  attachInstruction,
  extractInstruction,
})
