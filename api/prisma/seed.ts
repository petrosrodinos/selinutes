import { PrismaClient, GameMode, GameStatus, AuthRole } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { getLevelFromPoints } from '../src/modules/game/constants/game-rewards.constants'

dotenv.config({ path: path.resolve(__dirname, '../.env.staging') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

const DEMO_PASSWORD = 'Password123!'

const USERS = [
    { username: 'alice_demo', email: 'alice@demo.com', },
    { username: 'bob_demo', email: 'bob@demo.com', },
    { username: 'charlie_demo', email: 'charlie@demo.com', },
    { username: 'diana_demo', email: 'diana@demo.com', },
    { username: 'eve_demo', email: 'eve@demo.com', },
]

// Online games: [code, [playerIndex, status, points], [playerIndex, status, points], boardSize, moves, time]
const ONLINE_GAMES: Array<{
    code: string
    boardSize: string
    moves: number
    time: number
    white: { userIndex: number; status: GameStatus; points: number }
    black: { userIndex: number; status: GameStatus; points: number }
}> = [
        {
            code: 'DEMO01',
            boardSize: '12x12',
            moves: 48,
            time: 720,
            white: { userIndex: 0, status: GameStatus.WIN, points: 10 }, // alice
            black: { userIndex: 1, status: GameStatus.LOSS, points: 2 }, // bob
        },
        {
            code: 'DEMO02',
            boardSize: '12x16',
            moves: 62,
            time: 940,
            white: { userIndex: 1, status: GameStatus.WIN, points: 10 }, // bob
            black: { userIndex: 2, status: GameStatus.LOSS, points: 2 }, // charlie
        },
        {
            code: 'DEMO03',
            boardSize: '12x12',
            moves: 35,
            time: 510,
            white: { userIndex: 0, status: GameStatus.WIN, points: 10 }, // alice
            black: { userIndex: 2, status: GameStatus.LOSS, points: 2 }, // charlie
        },
        {
            code: 'DEMO04',
            boardSize: '12x20',
            moves: 90,
            time: 1380,
            white: { userIndex: 3, status: GameStatus.DRAW, points: 5 }, // diana
            black: { userIndex: 4, status: GameStatus.DRAW, points: 5 }, // eve
        },
        {
            code: 'DEMO05',
            boardSize: '12x12',
            moves: 41,
            time: 600,
            white: { userIndex: 0, status: GameStatus.WIN, points: 10 }, // alice
            black: { userIndex: 4, status: GameStatus.LOSS, points: 2 }, // eve
        },
    ]

// Single / Offline games: [userIndex, mode, status, points, boardSize, moves, time]
const SOLO_GAMES: Array<{
    userIndex: number
    mode: GameMode
    status: GameStatus
    points: number
    boardSize: string
    moves: number
    time: number
}> = [
        { userIndex: 0, mode: GameMode.SINGLE, status: GameStatus.WIN, points: 10, boardSize: '12x12', moves: 30, time: 420 }, // alice
        { userIndex: 1, mode: GameMode.SINGLE, status: GameStatus.WIN, points: 10, boardSize: '12x12', moves: 44, time: 660 }, // bob
        { userIndex: 2, mode: GameMode.SINGLE, status: GameStatus.LOSS, points: 2, boardSize: '12x16', moves: 22, time: 310 }, // charlie
        { userIndex: 2, mode: GameMode.OFFLINE, status: GameStatus.LOSS, points: 2, boardSize: '12x12', moves: 18, time: 280 }, // charlie
        { userIndex: 4, mode: GameMode.OFFLINE, status: GameStatus.WIN, points: 10, boardSize: '12x20', moves: 55, time: 820 }, // eve
    ]

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
    console.log('Seeding demo data...')

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

    // 1. Upsert users
    const users = await Promise.all(
        USERS.map(u =>
            prisma.user.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    username: u.username,
                    email: u.email,
                    password: hashedPassword,
                    role: AuthRole.USER,
                },
            })
        )
    )

    console.log(`Created/found ${users.length} users`)

    // 2. Create online games (two rows per game, same code)
    for (const game of ONLINE_GAMES) {
        const whiteUser = users[game.white.userIndex]
        const blackUser = users[game.black.userIndex]
        const finishedAt = new Date()

        await prisma.game.createMany({
            data: [
                {
                    user_uuid: whiteUser.uuid,
                    code: game.code,
                    board_size: game.boardSize,
                    mode: GameMode.ONLINE,
                    status: game.white.status,
                    moves: game.moves,
                    points: game.white.points,
                    time: game.time,
                    finished_at: finishedAt,
                },
                {
                    user_uuid: blackUser.uuid,
                    code: game.code,
                    board_size: game.boardSize,
                    mode: GameMode.ONLINE,
                    status: game.black.status,
                    moves: game.moves,
                    points: game.black.points,
                    time: game.time,
                    finished_at: finishedAt,
                },
            ],
        })
    }

    console.log(`Created ${ONLINE_GAMES.length} online games (${ONLINE_GAMES.length * 2} records)`)

    // 3. Create solo/offline games
    await prisma.game.createMany({
        data: SOLO_GAMES.map(game => ({
            user_uuid: users[game.userIndex].uuid,
            code: null,
            board_size: game.boardSize,
            mode: game.mode,
            status: game.status,
            moves: game.moves,
            points: game.points,
            time: game.time,
            finished_at: new Date(),
        })),
    })

    console.log(`Created ${SOLO_GAMES.length} solo/offline games`)

    // 4. Calculate and upsert UserStats from all games
    for (const user of users) {
        const games = await prisma.game.findMany({ where: { user_uuid: user.uuid } })

        const totalPoints = games.reduce((sum, g) => sum + g.points, 0)
        const wins = games.filter(g => g.status === GameStatus.WIN).length
        const losses = games.filter(g => g.status === GameStatus.LOSS).length
        const draws = games.filter(g => g.status === GameStatus.DRAW).length
        const level = getLevelFromPoints(totalPoints)

        await prisma.userStats.upsert({
            where: { user_uuid: user.uuid },
            create: { user_uuid: user.uuid, points: totalPoints, wins, losses, draws, level },
            update: { points: totalPoints, wins, losses, draws, level },
        })

        console.log(`Stats for ${user.username}: ${wins}W/${losses}L/${draws}D — ${totalPoints}pts — lvl ${level}`)
    }

    console.log('Done.')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
