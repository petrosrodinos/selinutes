import { MAX_LEVEL } from "../constants/game";

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
    const tier = getLevelTier(level);
    const atMaxLevel = level >= MAX_LEVEL;
    const pointsForNext = atMaxLevel ? 0 : getPointsForLevel(level + 1);
    const pointsInCurrent = atMaxLevel ? 0 : points - getTotalPointsToReachLevel(level);
    const progress = atMaxLevel ? 1 : Math.min(1, Math.max(0, pointsInCurrent / pointsForNext));
    const pointsToNextLevel = atMaxLevel ? 0 : Math.max(0, pointsForNext - pointsInCurrent);
    return { progress, tier, pointsToNextLevel };
};

const getLevelTier = (level: number) => {
    if (level >= 32) return { label: "Elite", gradient: "from-cyan-300 via-sky-400 to-blue-500", ring: "ring-cyan-400/50" };
    if (level >= 28) return { label: "Mythic", gradient: "from-fuchsia-400 via-pink-500 to-rose-500", ring: "ring-fuchsia-400/50" };
    if (level >= 24) return { label: "Grandmaster", gradient: "from-rose-400 via-pink-400 to-rose-500", ring: "ring-rose-400/50" };
    if (level >= 20) return { label: "Champion", gradient: "from-red-400 to-rose-600", ring: "ring-red-400/50" };
    if (level >= 16) return { label: "Legend", gradient: "from-amber-400 via-yellow-300 to-amber-500", ring: "ring-amber-400/50" };
    if (level >= 13) return { label: "Master", gradient: "from-violet-400 to-purple-600", ring: "ring-violet-400/50" };
    if (level >= 10) return { label: "Expert", gradient: "from-indigo-400 to-violet-600", ring: "ring-indigo-400/50" };
    if (level >= 7) return { label: "Veteran", gradient: "from-emerald-400 to-teal-500", ring: "ring-emerald-400/50" };
    if (level >= 4) return { label: "Apprentice", gradient: "from-lime-400 to-emerald-500", ring: "ring-lime-400/50" };
    return { label: "Rookie", gradient: "from-stone-400 to-stone-500", ring: "ring-stone-400/50" };
};
