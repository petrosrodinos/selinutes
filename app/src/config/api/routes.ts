export const ApiRoutes = {
    auth: {
        email: {
            login: "/auth/email/login",
            register: "/auth/email/register",
            refresh_token: "/auth/email/refresh-token",
            admin_login_to_account: (account_uuid: string) => `/auth/email/${account_uuid}/admin-login`,
            forgot_password: "/auth/forgot-password",
            reset_password: "/auth/reset-password",
            verify_email: "/auth/verify-email",
            resend_verification_email: "/auth/resend-verification-email",
        },
    },
    users: {
        prefix: "/users",
        me: "/users/me",
    },
    stats: {
        me: '/stats/me',
        byUser: (userUuid: string) => `/stats?user_uuid=${userUuid}`,
        leaderboard: (limit?: number) => `/stats/leaderboard${limit ? `?limit=${limit}` : ''}`,
    },
    games: {
        prefix: "/games",
        list: (params?: Record<string, string | number | undefined>) => {
            const query = params ? new URLSearchParams(
                Object.entries(params)
                    .filter(([, v]) => v !== undefined)
                    .map(([k, v]) => [k, String(v)])
            ).toString() : ''
            return `/games${query ? `?${query}` : ''}`
        },
        record: (uuid: string) => `/games/record/${uuid}`,
        create: "/games/create",
        join: "/games/join",
        get: (code: string) => `/games/${code}`,
        finish: (code: string) => `/games/${code}/finish`,
        finishOffline: "/games/offline/finish",
    },
}