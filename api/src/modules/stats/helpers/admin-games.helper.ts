import { Game, GameMode } from 'generated/prisma'

export interface AdminGamePlayerEntry {
    user_uuid: string
    username: string
    status: string
    points: number
    moves: number
    time: number | null
    game_uuid: string
}

export interface AdminGameSessionEntry {
    id: string
    code: string | null
    board_size: string
    mode: GameMode
    players: AdminGamePlayerEntry[]
    created_at: Date
    finished_at: Date | null
}

type GameWithUser = Game & {
    user: {
        uuid: string
        username: string
    }
}

export const groupGamesBySession = (games: GameWithUser[]): AdminGameSessionEntry[] => {
    const sessionMap = new Map<string, AdminGameSessionEntry>()

    for (const game of games) {
        const sessionId = game.code ?? game.uuid
        const player: AdminGamePlayerEntry = {
            user_uuid: game.user_uuid,
            username: game.user.username,
            status: game.status,
            points: game.points,
            moves: game.moves,
            time: game.time,
            game_uuid: game.uuid,
        }

        const existing = sessionMap.get(sessionId)

        if (existing) {
            existing.players.push(player)
            if (game.finished_at && (!existing.finished_at || game.finished_at > existing.finished_at)) {
                existing.finished_at = game.finished_at
            }
            if (game.created_at < existing.created_at) {
                existing.created_at = game.created_at
            }
            continue
        }

        sessionMap.set(sessionId, {
            id: sessionId,
            code: game.code,
            board_size: game.board_size,
            mode: game.mode,
            players: [player],
            created_at: game.created_at,
            finished_at: game.finished_at,
        })
    }

    return Array.from(sessionMap.values()).sort((a, b) => {
        const aTime = (a.finished_at ?? a.created_at).getTime()
        const bTime = (b.finished_at ?? b.created_at).getTime()
        return bTime - aTime
    })
}
