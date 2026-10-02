"use client"

import { Box, Button, ChakraProvider, HStack, Text } from "@chakra-ui/react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { memo, useCallback, useContext, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"

import {
  draggable,
  dropTargetForElements,
  type ElementDropTargetEventBasePayload,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/utils/combine"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/set-custom-native-drag-preview"
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item"
import { GroupDropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/group"

import type { TreeItem as TreeItemData } from "../data/tree"
import { chakraSystem } from "../../../provider"
import { DependencyContext, TreeContext } from "./tree-context"

const indentToken = "5"

type TreeItemProps = {
  item: TreeItemData
  level: number
  index: number
}


const TreeItem = memo(function TreeItem({ item, level, index }: TreeItemProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGroupOver, setIsGroupOver] = useState(false)
  const [instruction, setInstruction] = useState<Instruction | null>(null)
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { dispatch, uniqueContextId } = useContext(TreeContext)
  const { DropIndicator, attachInstruction, extractInstruction } = useContext(DependencyContext)

  const hasChildren = item.children.length > 0
  const isOpen = item.isOpen ?? false
  // const disableDrag = item.disableDrag ?? true


  const clearExpandTimer = useCallback(() => {
    if (expandTimer.current !== null) {
      clearTimeout(expandTimer.current)
      expandTimer.current = null
    }
  }, [])

  const toggleOpen = useCallback(() => {
    dispatch({ type: "toggle", itemId: item.id })
  }, [dispatch, item.id])

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const updateInstruction = ({ self }: ElementDropTargetEventBasePayload) => {
      const nextInstruction = extractInstruction(self.data)

      if (nextInstruction?.operation === "combine" && hasChildren && !isOpen && !expandTimer.current) {
        expandTimer.current = setTimeout(() => {
          expandTimer.current = null
          dispatch({ type: "expand", itemId: item.id })
        }, 500)
      } else if (nextInstruction?.operation !== "combine") {
        clearExpandTimer()
      }

      setInstruction(nextInstruction)
    }

    return combine(
      draggable({
        element: button,
        getInitialData: () => ({
          id: item.id,
          isOpenOnDragStart: isOpen,
          type: "tree-item",
          uniqueContextId,
        }),
        canDrag: () => !item.disableDrag,
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
            render: ({ container }) => {
              const root = createRoot(container)
              flushSync(() => {
                root.render(
                  <ChakraProvider value={chakraSystem}>
                    <Box bg="bg.panel" borderRadius="md" px="2" py="1" shadow="md">
                      Item {item.id}
                    </Box>
                  </ChakraProvider>,
                )
              })
              return () => root.unmount()
            },
            nativeSetDragImage,
          })
        },
        onDragStart: ({ source }) => {
          setIsDragging(true)
          if (source.data.isOpenOnDragStart) {
            dispatch({ type: "collapse", itemId: item.id })
          }
        },
        onDrop: ({ source }) => {
          setIsDragging(false)
          if (source.data.isOpenOnDragStart) {
            dispatch({ type: "expand", itemId: item.id })
          }
        },
      }),
      dropTargetForElements({
        element: button,
        getData: ({ input, element }) =>
          attachInstruction(
            { id: item.id },
            {
              input,
              element,
              operations:
                item.isDraft || item.disableDrop
                  ? { combine: "blocked" }
                  : {
                      combine: "available",
                      "reorder-before": "available",
                      "reorder-after": hasChildren && isOpen ? "not-available" : "available",
                    },
            },
          ),
        canDrop: ({ source }) =>
          source.data.type === "tree-item" &&
          source.data.id !== item.id &&
          source.data.uniqueContextId === uniqueContextId,
        onDragEnter: updateInstruction,
        onDrag: updateInstruction,
        onDragLeave: () => {
          clearExpandTimer()
          setInstruction(null)
        },
        onDrop: () => {
          clearExpandTimer()
          setInstruction(null)
        },
      }),
    )
  }, [clearExpandTimer, dispatch, hasChildren, isOpen, item.id, item.isDraft, uniqueContextId])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const updateGroupState = ({ location, self }: ElementDropTargetEventBasePayload) => {
      const innermostGroup = location.current.dropTargets.find((target) => target.data.type === "group")
      setIsGroupOver(innermostGroup?.element === self.element)
    }

    return dropTargetForElements({
      element: group,
      canDrop: ({ source }) => {
        return (
          source.data.type === "tree-item" &&
          source.data.id !== item.id &&
          source.data.uniqueContextId === uniqueContextId
        )
      },
      getData: () => ({ type: "group" }),
      getIsSticky: () => false,
      onDragStart: updateGroupState,
      onDropTargetChange: updateGroupState,
      onDragLeave: () => setIsGroupOver(false),
      onDrop: () => setIsGroupOver(false),
    })
  }, [isOpen, item.children, item.id, uniqueContextId])

  useEffect(() => clearExpandTimer, [clearExpandTimer])

  const subtreeId = `tree-item-${item.id}--subtree`

  return (
    <Box position="relative">
      <Button
        aria-controls={hasChildren ? subtreeId : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        _expanded={{ bg: "transparent", _hover: { bg: "colorPalette.subtle" } }}
        // colorPalette="blue"
        data-index={index}
        data-level={level}
        data-testid={`tree-item-${item.id}`}
        display="flex"
        // focusRing="inside"
        justifyContent="flex-start"
        minH="9"
        onClick={toggleOpen}
        opacity={isDragging ? 0.45 : 1}
        overflow="visible"
        px="2"
        position="relative"
        ref={buttonRef}
        variant="ghost"
        w="full"
      >
        <HStack flex="1" gap="2" minW="0">
          {hasChildren ? (
            isOpen ? <ChevronDown aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />
          ) : (
            <Box aria-hidden bg="fg.muted" borderRadius="full" boxSize="1.5" ml="1.5" mr="1.5" />
          )}
          <Text flex="1" textAlign="start" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            Item {item.id}
          </Text>
          {item.isDraft ? <Text color="fg.muted" fontSize="xs">Draft</Text> : null}
        </HStack>
        {instruction ? <DropIndicator instruction={instruction} /> : null}
        <Box
          aria-hidden
          bottom="0"
          left={level === 0 ? "0" : `calc(-${level} * var(--chakra-spacing-5))`}
          position="absolute"
          right="0"
          top="0"
        />
      </Button>

      {hasChildren && isOpen ? (
        <Box id={subtreeId} pl={indentToken}>
          <GroupDropIndicator isActive={isGroupOver} ref={groupRef}>
            {item.children.map((child, childIndex) => (
              <TreeItem item={child} index={childIndex} key={child.id} level={level + 1} />
            ))}
          </GroupDropIndicator>
        </Box>
      ) : null}
    </Box>
  )
})

export default TreeItem
