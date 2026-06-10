import type { Move, Piece } from '../types'
import { PieceTypes } from '../types'

export const isChariotCaptureMove = (move: Move): boolean =>
  move.piece.type === PieceTypes.CHARIOT && Boolean(move.captured) && !move.isAttack

export const bindCaptureToChariot = (captured: Piece, chariotId: string): Piece => ({
  ...captured,
  chariotHeldBy: chariotId
})

export const releaseCapturesBoundToChariot = (
  capturedPieces: { white: Piece[]; black: Piece[] },
  chariotId: string
): { white: Piece[]; black: Piece[] } => {
  const release = (pieces: Piece[]): Piece[] =>
    pieces.map(piece =>
      piece.chariotHeldBy === chariotId
        ? { ...piece, chariotHeldBy: undefined }
        : piece
    )

  return {
    white: release(capturedPieces.white),
    black: release(capturedPieces.black)
  }
}

export const isRevivableCapturedPiece = (piece: Piece): boolean => !piece.chariotHeldBy

export const filterRevivableCapturedPieces = (pieces: Piece[]): Piece[] =>
  pieces.filter(isRevivableCapturedPiece)

export const hasChariotBoundCaptures = (pieces: Piece[]): boolean =>
  pieces.some(piece => Boolean(piece.chariotHeldBy))
