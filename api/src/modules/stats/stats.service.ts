import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { GameMode, UserStats } from 'generated/prisma'
import { getLevelFromPoints } from '../game/constants/game-rewards.constants'

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

export interface AdminUserOverviewEntry {
    user_uuid: string
    username: string
    email: string
    role: string
    games_played: number
    points: number
    level: number
    wins: number
    losses: number
    draws: number
    rank: number
    created_at: Date
    updated_at: Date
}

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) { }

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
        const groups = await this.prisma.game.groupBy({
            by: ['user_uuid'],
            where: { mode: GameMode.ONLINE },
            _sum: { points: true },
            orderBy: { _sum: { points: 'desc' } },
            take: limit,
        })

        if (groups.length === 0) return []

        const userUuids = groups.map(g => g.user_uuid)

        const [users, statsRows] = await Promise.all([
            this.prisma.user.findMany({
                where: { uuid: { in: userUuids } },
                select: { uuid: true, username: true },
            }),
            this.prisma.userStats.findMany({
                where: { user_uuid: { in: userUuids } },
            }),
        ])

        const usernameMap = new Map(users.map(u => [u.uuid, u.username]))
        const statsMap = new Map(statsRows.map(s => [s.user_uuid, s]))

        return groups.map((g, index) => {
            const points = g._sum.points ?? 0
            const stats = statsMap.get(g.user_uuid)
            return {
                rank: index + 1,
                user_uuid: g.user_uuid,
                username: usernameMap.get(g.user_uuid) ?? 'Unknown',
                points,
                level: stats?.level ?? 0,
                wins: stats?.wins ?? 0,
                losses: stats?.losses ?? 0,
                draws: stats?.draws ?? 0,
            }
        })
    }

    async getAdminUsersOverview(): Promise<AdminUserOverviewEntry[]> {
        const users = await this.prisma.user.findMany({
            include: {
                stats: true,
                _count: {
                    select: {
                        games: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        return users.map((user) => ({
            user_uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            games_played: user._count.games,
            points: user.stats?.points ?? 0,
            level: user.stats?.level ?? 0,
            wins: user.stats?.wins ?? 0,
            losses: user.stats?.losses ?? 0,
            draws: user.stats?.draws ?? 0,
            rank: user.stats?.rank ?? 0,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }))
    }

    async deleteUserByUuid(adminUuid: string, userUuid: string): Promise<{ message: string }> {
        if (adminUuid === userUuid) {
            throw new BadRequestException('You cannot delete your own account')
        }

        const user = await this.prisma.user.findUnique({
            where: { uuid: userUuid },
            select: { uuid: true },
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        await this.prisma.user.delete({
            where: { uuid: userUuid },
        })

        return { message: 'User deleted successfully' }
    }
}
