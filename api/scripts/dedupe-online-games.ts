import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

type DuplicateGroup = {
    user_uuid: string
    code: string
    ids: number[]
}

async function main() {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set')
    }

    const adapter = new PrismaPg({
        connectionString: databaseUrl
    })

    const prisma = new PrismaClient({ adapter })
    try {
        const duplicates = await prisma.$queryRaw<DuplicateGroup[]>`
            SELECT
                user_uuid,
                code,
                array_agg(id ORDER BY created_at ASC, id ASC) AS ids
            FROM games
            WHERE mode = 'ONLINE'
              AND code IS NOT NULL
              AND code <> ''
            GROUP BY user_uuid, code
            HAVING COUNT(*) > 1
        `

        if (duplicates.length === 0) {
            console.log('No duplicate online games found.')
            return
        }

        let deletedRows = 0
        for (const group of duplicates) {
            const idsToDelete = group.ids.slice(1)
            if (idsToDelete.length === 0) {
                continue
            }

            const deleteResult = await prisma.game.deleteMany({
                where: {
                    id: {
                        in: idsToDelete
                    }
                }
            })

            deletedRows += deleteResult.count
            console.log(
                `Removed ${deleteResult.count} duplicate(s) for user ${group.user_uuid} and game code ${group.code}.`
            )
        }

        console.log(`Done. Removed ${deletedRows} duplicate online game rows across ${duplicates.length} group(s).`)
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Failed to deduplicate online games:', error)
    process.exit(1)
})
