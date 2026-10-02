"use client"

import { Box } from "@chakra-ui/react"
import { useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"

import {
  dropTargetForElements,
  monitorForElements,
  type ElementDropTargetEventBasePayload,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/utils/combine"
import { GroupDropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/group"

import { getInitialTreeState, treeStateReducer } from "./data/tree"
import { DependencyContext, TreeContext, type TreeContextValue } from "./pieces/tree-context"
import TreeItem from "./pieces/tree-item"

export default function PragmaticDnd(): React.JSX.Element {
  const [state, dispatch] = useReducer(treeStateReducer, undefined, getInitialTreeState)
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [isRootOver, setIsRootOver] = useState(false)
  const uniqueContextId = useRef(Symbol("tree-dnd-context"))
  const { extractInstruction } = useContext(DependencyContext)

  const context = useMemo<TreeContextValue>(
    () => ({ dispatch, uniqueContextId: uniqueContextId.current }),
    [dispatch],
  )

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const updateRootState = ({ location, self }: ElementDropTargetEventBasePayload) => {
      const innermostGroup = location.current.dropTargets.find((target) => target.data.type === "group")
      setIsRootOver(innermostGroup?.element === self.element)
    }

    return combine(
      monitorForElements({
        canMonitor: ({ source }) =>
          source.data.type === "tree-item" && source.data.uniqueContextId === uniqueContextId.current,
        onDrop: ({ location, source }) => {
          const target = location.current.dropTargets[0]
          if (!target || target.data.type === "group") return

          const instruction = extractInstruction(target.data)
          if (instruction) {
            dispatch({
              type: "instruction",
              instruction,
              itemId: source.data.id as string,
              targetId: target.data.id as string,
            })
          }
        },
      }),
      dropTargetForElements({
        element: group,
        canDrop: ({ source }) =>
          source.data.type === "tree-item" && source.data.uniqueContextId === uniqueContextId.current,
        getData: () => ({ type: "group" }),
        onDragStart: updateRootState,
        onDropTargetChange: updateRootState,
        onDragLeave: () => setIsRootOver(false),
        onDrop: () => setIsRootOver(false),
      }),
    )
  }, [extractInstruction])

  return (
    <TreeContext.Provider value={context}>
      <Box display="flex" justifyContent="center" py="6">
        <Box
          aria-label="Draggable tree"
          bg="bg.subtle"
          borderColor="border"
          borderRadius="lg"
          borderWidth="1px"
          minW="72"
          p="2"
          shadow="sm"
        >
          <GroupDropIndicator isActive={isRootOver} ref={groupRef}>
            {state.data.map((item, index) => (
              <TreeItem item={item} index={index} key={item.id} level={0} />
            ))}
          </GroupDropIndicator>
        </Box>
      </Box>
    </TreeContext.Provider>
  )
}
