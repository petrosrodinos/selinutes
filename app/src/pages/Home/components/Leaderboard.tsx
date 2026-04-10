import { useState } from "react";
import { Medal, Trophy, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { POINTS_LABEL } from "../../../constants/game";
import { useLeaderboard, type LeaderboardEntry } from "../../../features/stats";
import { PlayerStatsModal } from "./PlayerStatsModal";

export const Leaderboard = () => {
  const username = useAuthStore((state) => state.username);
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg p-3 border border-stone-700/30 bg-stone-900/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-stone-700 rounded w-1/2" />
                  <div className="h-2.5 bg-stone-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-rose-400 font-medium text-sm">Failed to load leaderboard</p>
          <p className="text-stone-500 text-xs">Please try again later</p>
        </div>
      );
    }

    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <Trophy className="w-8 h-8 text-stone-600" />
          <p className="text-stone-400 font-medium text-sm">No players yet</p>
          <p className="text-stone-500 text-xs">Be the first to finish a game!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
        {leaderboard.map((entry) => (
          <button
            key={entry.user_uuid}
            onClick={() => setSelectedPlayer(entry)}
            className={`w-full text-left rounded-lg p-3 border transition-colors cursor-pointer ${entry.username === username ? "bg-amber-900/30 border-amber-600/50 hover:border-amber-500/70" : "bg-stone-900/50 border-stone-700/30 hover:border-stone-600/50"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${entry.rank === 1 ? "bg-amber-500 text-stone-900" : entry.rank === 2 ? "bg-stone-400 text-stone-900" : entry.rank === 3 ? "bg-orange-600 text-white" : "bg-stone-700 text-stone-300"}`}>#{entry.rank}</div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-200 font-medium text-sm truncate">{entry.username}</p>
                <p className="text-amber-400 text-xs font-bold">{entry.points.toLocaleString()} {POINTS_LABEL}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-amber-200">Leaderboard</h3>
        </div>
        {renderContent()}
      </div>

      <PlayerStatsModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </>
  );
};
