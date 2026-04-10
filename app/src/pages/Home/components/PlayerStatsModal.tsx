import { Trophy, Crown, Target, Award, TrendingUp } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { useUserStats } from "../../../features/stats";
import { getStatsData } from "../../../lib/level";
import { POINTS_LABEL } from "../../../constants/game";
import type { LeaderboardEntry } from "../../../features/stats";

interface PlayerStatsModalProps {
  player: LeaderboardEntry | null;
  onClose: () => void;
}

export const PlayerStatsModal = ({ player, onClose }: PlayerStatsModalProps) => {
  const { data: stats, isLoading, isError } = useUserStats(player?.user_uuid ?? "");

  const level = stats?.level ?? player?.level ?? 1;
  const points = stats?.points ?? player?.points ?? 0;
  const wins = stats?.wins ?? player?.wins ?? 0;
  const losses = stats?.losses ?? player?.losses ?? 0;
  const draws = stats?.draws ?? player?.draws ?? 0;
  const rank = stats?.rank ?? player?.rank ?? 0;
  const total = wins + losses + draws;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const { progress, tier } = getStatsData(points, level);

  return (
    <Modal isOpen={!!player} onClose={onClose} title={player?.username ?? ""}>
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-stone-700 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-stone-700 rounded-xl" />
            ))}
          </div>
          <div className="h-12 bg-stone-700 rounded-xl" />
        </div>
      )}

      {isError && (
        <p className="text-center text-rose-400 text-sm py-6">Failed to load player stats.</p>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {/* Level + Points */}
          <div className="flex items-center gap-4 p-4 bg-stone-900/60 rounded-xl border border-stone-700/40">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg ring-2 ${tier.ring} flex-shrink-0`}>
              <span className="text-2xl font-black text-white drop-shadow-sm">{level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>{tier.label}</p>
              <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-500`} style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xl font-bold text-amber-400">{points.toLocaleString()}</span>
              </div>
              <p className="text-stone-500 text-xs">{POINTS_LABEL}</p>
            </div>
          </div>

          {/* Rank */}
          {rank > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-900/60 rounded-xl border border-stone-700/40">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300 text-sm">Global Rank</span>
              <span className="ml-auto font-bold text-amber-400">#{rank}</span>
            </div>
          )}

          {/* W/L/D */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-900/60 rounded-xl p-3 text-center border border-stone-700/40">
              <Crown className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-emerald-400">{wins}</p>
              <p className="text-stone-500 text-xs">Wins</p>
            </div>
            <div className="bg-stone-900/60 rounded-xl p-3 text-center border border-stone-700/40">
              <Target className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-rose-400">{losses}</p>
              <p className="text-stone-500 text-xs">Losses</p>
            </div>
            <div className="bg-stone-900/60 rounded-xl p-3 text-center border border-stone-700/40">
              <Award className="w-4 h-4 text-violet-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-violet-400">{draws}</p>
              <p className="text-stone-500 text-xs">Draws</p>
            </div>
          </div>

          {/* Win rate */}
          <div className="px-4 py-3 bg-stone-900/60 rounded-xl border border-stone-700/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-stone-400 text-sm">Win Rate</span>
              <span className="font-bold text-stone-200 text-sm">{winRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${winRate}%` }} />
            </div>
            <p className="text-stone-600 text-xs mt-1">{total} game{total !== 1 ? "s" : ""} played</p>
          </div>
        </div>
      )}
    </Modal>
  );
};
