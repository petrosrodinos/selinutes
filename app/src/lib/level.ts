import { MAX_LEVEL } from "../constants/game";
import { buildPlayerLevelCatalog, getPlayerLevelMeta } from "../constants/figureLevels";

export const PLAYER_LEVELS = buildPlayerLevelCatalog(MAX_LEVEL);

export const getPointsForLevel = (level: number): number => {
    if (level < 1 || level > MAX_LEVEL) return 0;
    return Math.floor(80 + 0.9 * (level - 1) ** 2);
};

const getTotalPointsToReachLevel = (level: number): number => {
    let total = 0;
    for (let i = 1; i <= level; i++) total += getPointsForLevel(i);
    return total;
};

export const getLevelFromPoints = (points: number): number => {
    if (points <= 0) return 1;
    for (let l = MAX_LEVEL; l >= 1; l--) {
        if (points >= getTotalPointsToReachLevel(l)) return l;
    }
    return 1;
};

export const getStatsData = (points: number, level: number) => {
    const levelMeta = getPlayerLevelMeta(level, MAX_LEVEL);
    const atMaxLevel = level >= MAX_LEVEL;
    const pointsForNext = atMaxLevel ? 0 : getPointsForLevel(level + 1);
    const pointsInCurrent = atMaxLevel ? 0 : points - getTotalPointsToReachLevel(level);
    const progress = atMaxLevel ? 1 : Math.min(1, Math.max(0, pointsInCurrent / pointsForNext));
    const pointsToNextLevel = atMaxLevel ? 0 : Math.max(0, pointsForNext - pointsInCurrent);
    return { progress, levelMeta, pointsToNextLevel };
};
