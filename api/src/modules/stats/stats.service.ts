import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { GameMode, GameStatus, Prisma, UserStats } from 'generated/prisma'
import { getLevelFromPoints } from '../game/constants/game-rewards.constants'
import { groupGamesBySession, AdminGameSessionEntry } from './helpers/admin-games.helper'
import { GetAdminGamesDto } from './dto/get-admin-games.dto'

export type { AdminGameSessionEntry, AdminGamePlayerEntry } from './helpers/admin-games.helper'

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
    online_games_played: number
    non_online_games_played: number
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

        return this.syncLevelFromPoints(stats)
    }

    private async syncLevelFromPoints(stats: UserStats): Promise<UserStats> {
        const level = getLevelFromPoints(stats.points)

        if (level === stats.level) {
            return stats
        }

        return this.prisma.userStats.update({
            where: { user_uuid: stats.user_uuid },
            data: { level },
        })
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
                level: getLevelFromPoints(points),
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
            },
            orderBy: {
                created_at: 'desc',
            },
        })

        const userUuids = users.map((user) => user.uuid)

        const [onlineGameGroups, nonOnlineGameCounts] = await Promise.all([
            this.prisma.game.groupBy({
                by: ['user_uuid', 'code'],
                where: {
                    user_uuid: { in: userUuids },
                    mode: GameMode.ONLINE,
                    code: { not: null },
                },
            }),
            this.prisma.game.groupBy({
                by: ['user_uuid'],
                where: {
                    user_uuid: { in: userUuids },
                    mode: { in: [GameMode.OFFLINE, GameMode.SINGLE] },
                },
                _count: {
                    _all: true,
                },
            }),
        ])

        const onlineGamesCountByUser = new Map<string, number>()
        for (const group of onlineGameGroups) {
            if (!group.code) {
                continue
            }
            onlineGamesCountByUser.set(
                group.user_uuid,
                (onlineGamesCountByUser.get(group.user_uuid) ?? 0) + 1
            )
        }

        const nonOnlineGamesCountByUser = new Map(
            nonOnlineGameCounts.map((group) => [group.user_uuid, group._count._all])
        )

        return users.map((user) => ({
            online_games_played: onlineGamesCountByUser.get(user.uuid) ?? 0,
            non_online_games_played: nonOnlineGamesCountByUser.get(user.uuid) ?? 0,
            user_uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            games_played: (onlineGamesCountByUser.get(user.uuid) ?? 0) + (nonOnlineGamesCountByUser.get(user.uuid) ?? 0),
            points: user.stats?.points ?? 0,
            level: getLevelFromPoints(user.stats?.points ?? 0),
            wins: user.stats?.wins ?? 0,
            losses: user.stats?.losses ?? 0,
            draws: user.stats?.draws ?? 0,
            rank: user.stats?.rank ?? 0,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }))
    }

    async getAdminGamesOverview(dto: GetAdminGamesDto): Promise<{
        data: AdminGameSessionEntry[]
        total: number
        page: number
        limit: number
    }> {
        const { page = 1, limit = 20 } = dto

        const games = await this.prisma.game.findMany({
            include: {
                user: {
                    select: {
                        uuid: true,
                        username: true,
                    },
                },
            },
            orderBy: { finished_at: 'desc' },
        })

        const grouped = groupGamesBySession(games)
        const total = grouped.length
        const skip = (page - 1) * limit

        return {
            data: grouped.slice(skip, skip + limit),
            total,
            page,
            limit,
        }
    }

    async deleteAdminGameSession(sessionId: string): Promise<{ message: string }> {
        const gamesByCode = await this.prisma.game.findMany({
            where: { code: sessionId },
        })

        const games = gamesByCode.length > 0
            ? gamesByCode
            : await this.prisma.game.findMany({
                where: { uuid: sessionId },
            })

        if (games.length === 0) {
            throw new NotFoundException('Game session not found')
        }

        await this.prisma.$transaction(async (tx) => {
            for (const game of games) {
                const existingStats = await tx.userStats.findUnique({
                    where: { user_uuid: game.user_uuid },
                })

                if (existingStats) {
                    const newPoints = Math.max(0, existingStats.points - game.points)
                    const newWins = Math.max(0, existingStats.wins - (game.status === GameStatus.WIN ? 1 : 0))
                    const newLosses = Math.max(0, existingStats.losses - (game.status === GameStatus.LOSS ? 1 : 0))
                    const newDraws = Math.max(0, existingStats.draws - (game.status === GameStatus.DRAW ? 1 : 0))
                    const newLevel = getLevelFromPoints(newPoints)
                    const newRank = await this.calculateRankWithTx(tx, game.user_uuid, newPoints)

                    await tx.userStats.update({
                        where: { user_uuid: game.user_uuid },
                        data: {
                            points: newPoints,
                            wins: newWins,
                            losses: newLosses,
                            draws: newDraws,
                            level: newLevel,
                            rank: newRank,
                        },
                    })
                }

                await tx.game.delete({
                    where: { id: game.id },
                })
            }
        })

        return { message: 'Game session deleted successfully' }
    }

    private async calculateRankWithTx(
        tx: Prisma.TransactionClient,
        userUuid: string,
        newPoints: number,
    ): Promise<number> {
        const usersAhead = await tx.userStats.count({
            where: {
                points: { gt: newPoints },
                user_uuid: { not: userUuid },
            },
        })

        return usersAhead + 1
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
