import { useState } from "react";
import { Trophy, Crown, Target, Award } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { PLAYER_LEVELS, getStatsData, getPointsForLevel } from "../../../lib/level";
import { MAX_LEVEL, POINTS_LABEL } from "../../../constants/game";
import type { PlayerLevelMeta } from "../../../constants/figureLevels";
import { Modal } from "../../../components/Modal";
import { PlayerLevelBadge } from "../../../components/PlayerLevelBadge";
import { PlayerLevelPreviewModal } from "../../../components/PlayerLevelPreviewModal";
import { useMyStats } from "../../../features/stats";

export const UserStats = () => {
  const username = useAuthStore((state) => state.username);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [previewLevel, setPreviewLevel] = useState<PlayerLevelMeta | null>(null);
  const { data: stats } = useMyStats();

  const level = stats?.level ?? 1;
  const points = stats?.points ?? 0;
  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const rank = stats?.rank ?? 0;
  const total = wins + losses + (stats?.draws ?? 0);
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const { progress, levelMeta, pointsToNextLevel } = getStatsData(points, level);
  const atMaxLevel = level >= MAX_LEVEL;

  const openPreview = (entry: PlayerLevelMeta) => {
    setPreviewLevel(entry);
  };

  return (
    <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-start gap-3 sm:items-center sm:gap-4">
          <PlayerLevelBadge
            levelMeta={levelMeta}
            onClick={() => setLevelModalOpen(true)}
          />
          <div className="mb-0">
            <h2 className="text-2xl font-bold text-amber-400">{username}</h2>
            <div className="w-24 h-1.5 bg-stone-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-stone-500 text-xs mt-0.5">
              {atMaxLevel ? "Max level reached" : `${pointsToNextLevel} to level ${level + 1}`}
            </p>
          </div>
          {rank > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/50 rounded-lg border border-stone-700/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">Rank #{rank}</span>
            </div>
          )}
        </div>
        <div className="text-left sm:text-right">
          <div className="mb-1 flex items-center gap-2 justify-start sm:justify-end">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="text-3xl font-bold text-amber-400">{points.toLocaleString()}</span>
          </div>
          <p className="text-stone-400 text-sm">Total {POINTS_LABEL}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
          <div className="flex items-center justify-center mb-2">
            <Crown className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{wins}</p>
          <p className="text-stone-400 text-xs">Wins</p>
        </div>
        <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{losses}</p>
          <p className="text-stone-400 text-xs">Losses</p>
        </div>
        <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
          <div className="flex items-center justify-center mb-2">
            <Award className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-violet-400">{winRate}%</p>
          <p className="text-stone-400 text-xs">Win Rate</p>
        </div>
      </div>

      <Modal isOpen={levelModalOpen} onClose={() => setLevelModalOpen(false)} title="Levels">
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
          {PLAYER_LEVELS.map((entry) => {
            const pts = getPointsForLevel(entry.playerLevel);
            const isUserLevel = entry.playerLevel === level;
            return (
              <li
                key={entry.playerLevel}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isUserLevel ? "bg-amber-500/20 border border-amber-400/50" : "bg-stone-900/50 border border-transparent"}`}
              >
                <PlayerLevelBadge
                  levelMeta={entry}
                  size="sm"
                  showLevelNumber={false}
                  onClick={() => openPreview(entry)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`truncate ${isUserLevel ? "font-bold text-amber-400" : "text-stone-300"}`}>
                    Level {entry.playerLevel}{isUserLevel ? " (you)" : ""}
                  </p>
                  <p className={`text-xs truncate ${isUserLevel ? "text-amber-300/80" : "text-stone-500"}`}>
                    {entry.tierLabel} · {entry.figureTitle}
                  </p>
                </div>
                <span className={`flex-shrink-0 ${isUserLevel ? "font-semibold text-amber-400" : "text-stone-400"}`}>
                  {pts.toLocaleString()} {POINTS_LABEL}
                </span>
              </li>
            );
          })}
        </ul>
      </Modal>

      <PlayerLevelPreviewModal
        levelMeta={previewLevel}
        onClose={() => setPreviewLevel(null)}
        pointsRequired={previewLevel ? getPointsForLevel(previewLevel.playerLevel) : undefined}
      />
    </div>
  );
};
