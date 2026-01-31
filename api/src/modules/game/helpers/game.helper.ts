import { GAME_KEY_PREFIX } from '../constants/game.constants'

const GAME_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const GAME_CODE_LENGTH = 6

export function generateGameCode(): string {
    let code = ''
    for (let i = 0; i < GAME_CODE_LENGTH; i++) {
        code += GAME_CODE_CHARACTERS.charAt(
            Math.floor(Math.random() * GAME_CODE_CHARACTERS.length)
        )
    }
    return code
}

export function getGameKey(code: string): string {
    return `${GAME_KEY_PREFIX}${code.toUpperCase()}`
}
