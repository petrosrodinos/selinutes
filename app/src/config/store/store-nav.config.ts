import { STORE_ROUTES } from './store.config'

export const STORE_NAV_ITEMS = [
    { to: STORE_ROUTES.STORE, label: 'Store' },
    { to: STORE_ROUTES.ORDERS, label: 'My Orders' },
] as const

export const STORE_ADMIN_NAV_ITEMS = [
    { to: STORE_ROUTES.ADMIN_ORDERS, label: 'Store Dashboard' },
] as const
