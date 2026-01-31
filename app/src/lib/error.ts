export const getErrorMessage = (error: any): string => {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message[0]
    if (typeof message === 'string') return message
    return 'An unexpected error occurred'
}
