import type { Board, Position, Piece, PlayerColor, MysteryBoxState, MysteryBoxOption, MysteryBoxPhase, ObstacleType } from '../types'
import { PieceTypes, ObstacleTypes, MysteryBoxOptions, MysteryBoxPhases } from '../types'
import { isPiece, isObstacle } from '../types'
import { filterRevivableCapturedPieces } from './chariotSoulBindUtils'
import { OBSTACLE_NAMES } from '../constants'

export const getInitialMysteryBoxState = (): MysteryBoxState => ({
    isActive: false,
    option: null,
    phase: null,
    triggerPosition: null,
    diceRoll: null,
    firstFigurePosition: null,
    selectedObstacles: [],
    obstaclePlacementUnits: [],
    emptyPlacementUnits: [],
    selectedEmptyTiles: [],
    revivablePieces: [],
    selectedRevivePiece: null
})

export const rollDice = (): number => {
    return Math.floor(Math.random() * 6) + 1
}

export const getRandomMysteryBoxOption = (
    currentPlayerColor: PlayerColor,
    capturedPieces: { white: Piece[]; black: Piece[] }
): MysteryBoxOption => {
    const options: MysteryBoxOption[] = [
        MysteryBoxOptions.FIGURE_SWAP,
        MysteryBoxOptions.OBSTACLE_SWAP
    ]

    if (getRevivablePieces(currentPlayerColor, capturedPieces).length > 0) {
        options.push(MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE)
    }
    return options[1]

    return options[Math.floor(Math.random() * options.length)]
}

export const isMysteryBoxTile = (board: Board, pos: Position): boolean => {
    const cell = board[pos.row][pos.col]
    return cell !== null && isObstacle(cell) && cell.type === ObstacleTypes.MYSTERY_BOX
}

export const getPlayerFigures = (board: Board, playerColor: PlayerColor): Position[] => {
    const figures: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.color === playerColor) {
                figures.push({ row, col })
            }
        }
    }
    return figures
}

export const getPlayerHoplites = (board: Board, playerColor: PlayerColor): Position[] => {
    const hoplites: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.color === playerColor && cell.type === PieceTypes.HOPLITE) {
                hoplites.push({ row, col })
            }
        }
    }
    return hoplites
}

export const getEmptyTiles = (board: Board): Position[] => {
    const emptyTiles: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === null) {
                emptyTiles.push({ row, col })
            }
        }
    }
    return emptyTiles
}

export const getAllObstacles = (board: Board, types: string[]): Position[] => {
    const obstacles: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isObstacle(cell) && types.includes(cell.type)) {
                obstacles.push({ row, col })
            }
        }
    }
    return obstacles
}

export const WHOLE_MOVE_OBSTACLE_TYPES: readonly ObstacleType[] = [
    ObstacleTypes.RIVER,
    ObstacleTypes.LAKE,
    ObstacleTypes.CANYON
]

export const isWholeMoveObstacleType = (type: ObstacleType): boolean =>
    WHOLE_MOVE_OBSTACLE_TYPES.includes(type)

const adjacentPositions = (row: number, col: number): Position[] => [
    { row, col: col + 1 },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row: row - 1, col }
]

const positionKey = (pos: Position): string => `${pos.row},${pos.col}`

export const sortObstaclePositions = (positions: Position[]): Position[] =>
    [...positions].sort((a, b) => (a.row - b.row) || (a.col - b.col))

export const getConnectedObstacleGroup = (board: Board, start: Position): Position[] => {
    const cell = board[start.row][start.col]
    if (!cell || !isObstacle(cell) || !isWholeMoveObstacleType(cell.type)) {
        return [start]
    }

    const obstacleType = cell.type
    const visited = new Set<string>()
    const group: Position[] = []
    const queue: Position[] = [start]

    while (queue.length > 0) {
        const current = queue.shift()!
        const key = positionKey(current)
        if (visited.has(key)) continue
        visited.add(key)

        const currentCell = board[current.row][current.col]
        if (!currentCell || !isObstacle(currentCell) || currentCell.type !== obstacleType) continue

        group.push(current)
        for (const adjacent of adjacentPositions(current.row, current.col)) {
            const { row, col } = adjacent
            if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) continue
            queue.push(adjacent)
        }
    }

    return sortObstaclePositions(group)
}

export const getObstacleSelectionForClick = (board: Board, pos: Position): Position[] => {
    if (!isSelectableObstacle(board, pos)) return []
    return getConnectedObstacleGroup(board, pos)
}

export const partitionObstaclePlacementUnits = (
    board: Board,
    selectedObstacles: Position[]
): Position[][] => {
    const remaining = new Set(selectedObstacles.map(positionKey))
    const units: Position[][] = []

    for (const pos of selectedObstacles) {
        const key = positionKey(pos)
        if (!remaining.has(key)) continue

        const selection = getConnectedObstacleGroup(board, pos).filter(p => remaining.has(positionKey(p)))
        for (const p of selection) remaining.delete(positionKey(p))
        units.push(sortObstaclePositions(selection))
    }

    return units
}

export const getObstaclePlacementUnitForPosition = (
    placementUnits: Position[][],
    pos: Position
): { unit: Position[]; unitIndex: number } | null => {
    const unitIndex = placementUnits.findIndex(unit =>
        unit.some(p => p.row === pos.row && p.col === pos.col)
    )
    if (unitIndex < 0) return null
    return { unit: placementUnits[unitIndex], unitIndex }
}

export const removeObstaclePlacementUnitAtPosition = (
    placementUnits: Position[][],
    emptyPlacementUnits: Position[][],
    pos: Position
): {
    obstaclePlacementUnits: Position[][]
    emptyPlacementUnits: Position[][]
    selectedObstacles: Position[]
    selectedEmptyTiles: Position[]
} | null => {
    const match = getObstaclePlacementUnitForPosition(placementUnits, pos)
    if (!match) return null

    const newObstacleUnits = placementUnits.filter((_, index) => index !== match.unitIndex)
    const newEmptyUnits = emptyPlacementUnits.filter((_, index) => index !== match.unitIndex)

    return {
        obstaclePlacementUnits: newObstacleUnits,
        emptyPlacementUnits: newEmptyUnits,
        selectedObstacles: newObstacleUnits.flat(),
        selectedEmptyTiles: newEmptyUnits.flat()
    }
}

export const getWholeObstacleSelectionBlockedMessage = (
    board: Board,
    pos: Position,
    diceRoll: number,
    selectedCount: number
): string | null => {
    const cell = board[pos.row][pos.col]
    if (!cell || !isObstacle(cell) || !isWholeMoveObstacleType(cell.type)) return null

    const group = getConnectedObstacleGroup(board, pos)
    const remaining = diceRoll - selectedCount
    if (group.length <= remaining) return null

    const obstacleName = OBSTACLE_NAMES[cell.type]
    return `❌ This ${obstacleName} has ${group.length} tiles but you only have ${remaining} move${remaining === 1 ? '' : 's'} left (rolled ${diceRoll}). ${obstacleName}s must be moved as a whole.`
}

export const computeGroupPlacementDestinations = (
    board: Board,
    group: Position[],
    anchor: Position
): Position[] | null => {
    if (group.length === 0) return null

    const sortedGroup = sortObstaclePositions(group)
    const origin = sortedGroup[0]
    const destinations = sortedGroup.map(p => ({
        row: anchor.row + (p.row - origin.row),
        col: anchor.col + (p.col - origin.col)
    }))

    const rows = board.length
    const cols = board[0].length
    const sourceKeys = new Set(sortedGroup.map(positionKey))

    for (const dest of destinations) {
        if (dest.row < 0 || dest.row >= rows || dest.col < 0 || dest.col >= cols) return null
        if (!isObstacleSwapPlacementAllowed(board, dest)) return null
        const cell = board[dest.row][dest.col]
        if (cell !== null && !sourceKeys.has(positionKey(dest))) return null
    }

    return destinations
}

export const getGroupPlacementBlockedMessage = (
    board: Board,
    group: Position[],
    anchor: Position
): string | null => {
    if (computeGroupPlacementDestinations(board, group, anchor)) return null
    return '❌ Cannot place this obstacle set here — the whole shape must fit on empty tiles outside the disabled rows.'
}

export const isSelectableObstacle = (board: Board, pos: Position): boolean => {
    const cell = board[pos.row][pos.col]
    if (!cell || !isObstacle(cell)) return false
    return cell.type !== ObstacleTypes.MYSTERY_BOX
}

export const executeFigureSwap = (
    board: Board,
    pos1: Position,
    pos2: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    const temp = newBoard[pos1.row][pos1.col]
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
    newBoard[pos2.row][pos2.col] = temp
    return { success: true, newBoard }
}

export const executeHopliteSacrifice = (
    board: Board,
    hoplitePos: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    newBoard[hoplitePos.row][hoplitePos.col] = null
    return { success: true, newBoard }
}

export const executeRevivePiece = (
    board: Board,
    piece: Piece,
    position: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    newBoard[position.row][position.col] = { ...piece }
    return { success: true, newBoard }
}

export const executeObstacleSwap = (
    board: Board,
    obstaclePositions: Position[],
    emptyPositions: Position[]
): { success: boolean; newBoard: Board } => {
    if (obstaclePositions.length !== emptyPositions.length) {
        return { success: false, newBoard: board }
    }
    const rows = board.length
    const hasDisabledPlacement = emptyPositions.some(pos => isObstacleSwapPlacementRowDisabled(pos.row, rows))
    if (hasDisabledPlacement) {
        return { success: false, newBoard: board }
    }

    const newBoard = board.map(row => [...row])

    for (let i = 0; i < obstaclePositions.length; i++) {
        const obstaclePos = obstaclePositions[i]
        const emptyPos = emptyPositions[i]

        const temp = newBoard[obstaclePos.row][obstaclePos.col]
        newBoard[obstaclePos.row][obstaclePos.col] = newBoard[emptyPos.row][emptyPos.col]
        newBoard[emptyPos.row][emptyPos.col] = temp
    }

    return { success: true, newBoard }
}

export const canPlayerUseMysteryBoxOption1 = (board: Board, playerColor: PlayerColor): boolean => {
    return getPlayerFigures(board, playerColor).length >= 2
}

export const canPlayerUseMysteryBoxOption2 = (board: Board, playerColor: PlayerColor, capturedPieces: { white: Piece[]; black: Piece[] }): boolean => {
    const hasHoplite = getPlayerHoplites(board, playerColor).length > 0
    const hasRevivable = getRevivablePieces(playerColor, capturedPieces).length > 0
    return hasHoplite && hasRevivable
}

export const canPlayerUseMysteryBoxOption3 = (board: Board): boolean => {
    const selectableObstacles = getAllObstacles(board, [
        ObstacleTypes.TREE,
        ObstacleTypes.ROCK,
        ObstacleTypes.CAVE,
        ObstacleTypes.RIVER,
        ObstacleTypes.LAKE,
        ObstacleTypes.CANYON
    ])
    const rows = board.length
    const hasAllowedEmptyTiles = getEmptyTiles(board).some(pos => !isObstacleSwapPlacementRowDisabled(pos.row, rows))
    return selectableObstacles.length > 0 && hasAllowedEmptyTiles
}

export const isObstacleSwapPlacementRowDisabled = (row: number, rows: number): boolean => {
    return row === 2 || row === rows - 3
}

export const isObstacleSwapPlacementAllowed = (board: Board, pos: Position): boolean => {
    return !isObstacleSwapPlacementRowDisabled(pos.row, board.length)
}

export const getRevivablePieces = (
    color: PlayerColor,
    capturedPieces: { white: Piece[]; black: Piece[] }
): Piece[] => {
    return filterRevivableCapturedPieces(capturedPieces[color] || [])
}

export const getPhaseForOption = (option: MysteryBoxOption): MysteryBoxPhase => {
    switch (option) {
        case MysteryBoxOptions.FIGURE_SWAP:
            return MysteryBoxPhases.WAITING_FIRST_FIGURE
        case MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE:
            return MysteryBoxPhases.WAITING_HOPLITE_SACRIFICE
        case MysteryBoxOptions.OBSTACLE_SWAP:
            return MysteryBoxPhases.WAITING_OBSTACLE_SELECTION
        default:
            return MysteryBoxPhases.WAITING_FIRST_FIGURE
    }
}

export const getMysteryBoxOptionName = (option: MysteryBoxOption): string => {
    switch (option) {
        case MysteryBoxOptions.FIGURE_SWAP:
            return 'Figure Swap'
        case MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE:
            return 'Hoplite Sacrifice & Revive'
        case MysteryBoxOptions.OBSTACLE_SWAP:
            return 'Obstacle Swap'
        default:
            return 'Unknown'
    }
}

export const removeMysteryBoxFromBoard = (board: Board, pos: Position): Board => {
    const newBoard = board.map(row => [...row])
    newBoard[pos.row][pos.col] = null
    return newBoard
}

export const isPositionInList = (pos: Position, list: Position[]): boolean => {
    return list.some(p => p.row === pos.row && p.col === pos.col)
}
