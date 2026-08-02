import { useRef, useState, type PointerEvent, type RefObject } from 'react'
import type { BoardSize, Position } from '../types'
import { clientPointToBoardPosition, normalizeRect } from '../utils'

const DRAG_THRESHOLD_PX = 6

interface MarqueeRect {
  left: number
  top: number
  width: number
  height: number
}

interface UseDevModeMarqueeParams {
  enabled: boolean
  squareSize: number
  boardSize: BoardSize
  hasSelection: boolean
  onSelect: (from: Position, to: Position) => void
  onPlace: (from: Position, to: Position) => void
  onClickSquare: (pos: Position) => void
}

interface UseDevModeMarqueeResult {
  boardRef: RefObject<HTMLDivElement | null>
  marqueeStyle: MarqueeRect | null
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
}

export const useDevModeMarquee = ({
  enabled,
  squareSize,
  boardSize,
  hasSelection,
  onSelect,
  onPlace,
  onClickSquare
}: UseDevModeMarqueeParams): UseDevModeMarqueeResult => {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const dragStartClient = useRef<{ x: number; y: number } | null>(null)
  const dragStartPos = useRef<Position | null>(null)
  const dragCurrentPos = useRef<Position | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [marqueeStyle, setMarqueeStyle] = useState<MarqueeRect | null>(null)

  const clearDrag = () => {
    dragStartClient.current = null
    dragStartPos.current = null
    dragCurrentPos.current = null
    pointerIdRef.current = null
    setMarqueeStyle(null)
  }

  const updateMarquee = (from: Position, to: Position) => {
    const rect = normalizeRect(from, to)
    setMarqueeStyle({
      left: rect.minCol * squareSize,
      top: rect.minRow * squareSize,
      width: (rect.maxCol - rect.minCol + 1) * squareSize,
      height: (rect.maxRow - rect.minRow + 1) * squareSize
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button !== 0) return
    const boardEl = boardRef.current
    if (!boardEl) return

    const pos = clientPointToBoardPosition(
      event.clientX,
      event.clientY,
      boardEl.getBoundingClientRect(),
      squareSize,
      boardSize
    )
    if (!pos) return

    event.preventDefault()
    boardEl.setPointerCapture(event.pointerId)
    pointerIdRef.current = event.pointerId
    dragStartClient.current = { x: event.clientX, y: event.clientY }
    dragStartPos.current = pos
    dragCurrentPos.current = pos
    updateMarquee(pos, pos)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || pointerIdRef.current !== event.pointerId || !dragStartPos.current) return
    const boardEl = boardRef.current
    if (!boardEl) return

    const pos = clientPointToBoardPosition(
      event.clientX,
      event.clientY,
      boardEl.getBoundingClientRect(),
      squareSize,
      boardSize
    )
    if (!pos) return

    dragCurrentPos.current = pos
    updateMarquee(dragStartPos.current, pos)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || pointerIdRef.current !== event.pointerId || !dragStartPos.current || !dragStartClient.current) {
      clearDrag()
      return
    }

    const boardEl = boardRef.current
    const start = dragStartPos.current
    const startClient = dragStartClient.current
    const end =
      dragCurrentPos.current ??
      (boardEl
        ? clientPointToBoardPosition(
            event.clientX,
            event.clientY,
            boardEl.getBoundingClientRect(),
            squareSize,
            boardSize
          )
        : null) ??
      start

    const dx = event.clientX - startClient.x
    const dy = event.clientY - startClient.y
    const isDrag = Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX

    clearDrag()

    if (!isDrag) {
      onClickSquare(start)
      return
    }

    if (hasSelection) {
      onPlace(start, end)
      return
    }

    onSelect(start, end)
  }

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    clearDrag()
  }

  return {
    boardRef,
    marqueeStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  }
}
