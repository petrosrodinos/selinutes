import { Prisma } from 'generated/prisma'

export const PRODUCT_INCLUDE = {
    files: { orderBy: { created_at: 'asc' } },
    images: { orderBy: { created_at: 'asc' } },
} satisfies Prisma.ProductInclude

export const ORDER_INCLUDE = {
    product: { include: PRODUCT_INCLUDE },
    user: { select: { uuid: true, username: true, email: true } },
} satisfies Prisma.OrderInclude

export type ProductWithFiles = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>
export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>
