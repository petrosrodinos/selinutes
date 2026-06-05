import { Injectable, NotFoundException } from '@nestjs/common'
import { readFile, writeFile, stat } from 'fs/promises'
import { join } from 'path'

export type GameRulesContent = {
    content: string
    updatedAt: string
}

@Injectable()
export class DocsService {
    private readonly gameRulesPath = join(process.cwd(), 'docs', 'game-rules.md')

    async getGameRules(): Promise<GameRulesContent> {
        try {
            const content = await readFile(this.gameRulesPath, 'utf-8')
            const stats = await stat(this.gameRulesPath)

            return {
                content,
                updatedAt: stats.mtime.toISOString(),
            }
        } catch {
            throw new NotFoundException('Game rules document not found')
        }
    }

    async updateGameRules(content: string): Promise<GameRulesContent> {
        await writeFile(this.gameRulesPath, content, 'utf-8')
        return this.getGameRules()
    }
}
