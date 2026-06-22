export const MAX_LEVEL = 45

export function getPointsForLevel(level: number): number {
    if (level < 1 || level > MAX_LEVEL) return 0
    return Math.floor(80 + 0.9 * (level - 1) ** 2)
}

export function getTotalPointsToReachLevel(level: number): number {
    let total = 0
    for (let i = 1; i <= level; i++) total += getPointsForLevel(i)
    return total
}

export function getLevelFromPoints(points: number): number {
    if (points <= 0) return 1
    for (let l = MAX_LEVEL; l >= 1; l--) {
        if (points >= getTotalPointsToReachLevel(l)) return l
    }
    return 1
}
