import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { UserStats } from 'generated/prisma'

export interface LeaderboardEntry {
    rank: number
    user_uuid: string
    username: string
    points: number
    level: number
    wins: number
    losses: number
    draws: number
}

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) {}

    async getStats(userUuid: string): Promise<UserStats> {
        const stats = await this.prisma.userStats.findUnique({
            where: { user_uuid: userUuid },
        })

        if (!stats) {
            throw new NotFoundException('Stats not found')
        }

        return stats
    }

    async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
        const rows = await this.prisma.userStats.findMany({
            orderBy: { points: 'desc' },
            take: limit,
            include: { user: { select: { username: true } } },
        })

        return rows.map((row, index) => ({
            rank: index + 1,
            user_uuid: row.user_uuid,
            username: row.user.username,
            points: row.points,
            level: row.level,
            wins: row.wins,
            losses: row.losses,
            draws: row.draws,
        }))
    }
}
