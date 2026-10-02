import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item"

export type TreeItem = {
  id: string
  isDraft?: boolean
  children: TreeItem[]
  isOpen?: boolean
}

export type TreeState = {
  lastAction: TreeAction | null
  data: TreeItem[]
}

export type TreeAction =
  | { type: "instruction"; instruction: Instruction; itemId: string; targetId: string }
  | { type: "toggle"; itemId: string }
  | { type: "expand"; itemId: string }
  | { type: "collapse"; itemId: string }

export function getInitialTreeState(): TreeState {
  return { data: getInitialData(), lastAction: null }
}

function getInitialData(): TreeItem[] {
  return [
    {
      id: "1",
      isOpen: true,
      children: [
        {
          id: "1.1",
          isOpen: true,
          children: [
            { id: "1.1.1", children: [] },
            { id: "1.1.2", isDraft: true, children: [] },
          ],
        },
        { id: "1.2", children: [] },
      ],
    },
    {
      id: "2",
      isOpen: true,
      children: [
        {
          id: "2.1",
          isOpen: true,
          children: [
            { id: "2.1.1", children: [] },
            { id: "2.1.2", children: [] },
          ],
        },
      ],
    },
  ]
}

export const tree = {
  find(data: TreeItem[], id: string): TreeItem | undefined {
    for (const item of data) {
      if (item.id === id) return item
      const result = tree.find(item.children, id)
      if (result) return result
    }
  },
  remove(data: TreeItem[], id: string): TreeItem[] {
    return data
      .filter((item) => item.id !== id)
      .map((item) => ({ ...item, children: tree.remove(item.children, id) }))
  },
  insertBefore(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap((item) =>
      item.id === targetId
        ? [newItem, item]
        : [{ ...item, children: tree.insertBefore(item.children, targetId, newItem) }],
    )
  },
  insertAfter(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap((item) =>
      item.id === targetId
        ? [item, newItem]
        : [{ ...item, children: tree.insertAfter(item.children, targetId, newItem) }],
    )
  },
  insertChild(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.map((item) =>
      item.id === targetId
        ? { ...item, isOpen: true, children: [newItem, ...item.children] }
        : { ...item, children: tree.insertChild(item.children, targetId, newItem) },
    )
  },
  updateOpen(data: TreeItem[], id: string, isOpen: boolean): TreeItem[] {
    return data.map((item) => {
      const children = tree.updateOpen(item.children, id, isOpen)
      return item.id === id ? { ...item, isOpen, children } : { ...item, children }
    })
  },
}

export function treeStateReducer(state: TreeState, action: TreeAction): TreeState {
  if (action.type === "toggle") {
    const item = tree.find(state.data, action.itemId)
    if (!item || item.children.length === 0) return state
    return { data: tree.updateOpen(state.data, item.id, !item.isOpen), lastAction: action }
  }

  if (action.type === "expand" || action.type === "collapse") {
    const item = tree.find(state.data, action.itemId)
    if (!item || item.children.length === 0) return state
    return { data: tree.updateOpen(state.data, item.id, action.type === "expand"), lastAction: action }
  }

  if (action.instruction.blocked || action.itemId === action.targetId) return state

  const item = tree.find(state.data, action.itemId)
  if (!item) return state
  const withoutItem = tree.remove(state.data, action.itemId)
  let data = withoutItem

  switch (action.instruction.operation) {
    case "reorder-before":
      data = tree.insertBefore(withoutItem, action.targetId, item)
      break
    case "reorder-after":
      data = tree.insertAfter(withoutItem, action.targetId, item)
      break
    case "combine":
      data = tree.insertChild(withoutItem, action.targetId, item)
      break
    default:
      return state
  }

  return { data, lastAction: action }
}
