import { Trophy, Clock, Swords, Calendar, Hash, User } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { useGetGameRecord } from "../../../features/game/hooks";
import { POINTS_LABEL } from "../../../constants/game";
import type { GameRecord } from "../../../features/game/interfaces";

interface GameDetailModalProps {
  game: GameRecord | null;
  onClose: () => void;
}

const modeLabel: Record<GameRecord["mode"], string> = {
  SINGLE: "Single Player",
  OFFLINE: "Local Multiplayer",
  ONLINE: "Online",
};

const statusStyles: Record<GameRecord["status"], { dot: string; text: string; label: string }> = {
  WIN: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Victory" },
  LOSS: { dot: "bg-rose-400", text: "text-rose-400", label: "Defeat" },
  DRAW: { dot: "bg-amber-400", text: "text-amber-400", label: "Draw" },
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const GameDetailModal = ({ game, onClose }: GameDetailModalProps) => {
  const { data: record, isLoading, isError } = useGetGameRecord(game?.uuid ?? "");

  const details = record ?? game;

  return (
    <Modal isOpen={!!game} onClose={onClose} title="Game Details">
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-stone-700 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-stone-700 rounded-xl" />
            ))}
          </div>
          <div className="h-12 bg-stone-700 rounded-xl" />
        </div>
      )}

      {isError && !details && (
        <p className="text-center text-rose-400 text-sm py-6">Failed to load game details.</p>
      )}

      {details && !isLoading && (
        <div className="space-y-3">
          {/* Result banner */}
          {(() => {
            const s = statusStyles[details.status];
            return (
              <div className={`flex items-center gap-3 p-4 bg-stone-900/60 rounded-xl border border-stone-700/40`}>
                <div className={`w-3 h-3 rounded-full ${s.dot} flex-shrink-0`} />
                <span className={`text-lg font-bold ${s.text}`}>{s.label}</span>
                <span className="ml-auto text-stone-400 text-sm">{modeLabel[details.mode]}</span>
              </div>
            );
          })()}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-stone-400 text-xs">Points Earned</span>
              </div>
              <p className="text-amber-400 font-bold text-xl">+{details.points}</p>
              <p className="text-stone-600 text-xs">{POINTS_LABEL}</p>
            </div>

            <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40">
              <div className="flex items-center gap-2 mb-1">
                <Swords className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs">Moves</span>
              </div>
              <p className="text-stone-200 font-bold text-xl">{details.moves}</p>
            </div>

            <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs">Duration</span>
              </div>
              <p className="text-stone-200 font-bold text-lg">{formatDuration(details.time)}</p>
            </div>

            <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs">Board Size</span>
              </div>
              <p className="text-stone-200 font-bold text-lg">{details.board_size}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-500" />
                <span className="text-stone-400 text-xs">Started</span>
              </div>
              <span className="text-stone-300 text-xs">{formatDate(details.created_at)}</span>
            </div>
            {details.finished_at && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="text-stone-400 text-xs">Finished</span>
                </div>
                <span className="text-stone-300 text-xs">{formatDate(details.finished_at)}</span>
              </div>
            )}
          </div>

          {/* Opponent */}
          {details.opponent && (
            <div className="bg-stone-900/60 rounded-xl p-3 border border-stone-700/40 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs">Opponent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-200 font-semibold text-sm">{details.opponent.username}</span>
                {(() => {
                  const s = statusStyles[details.opponent.status];
                  return (
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                  );
                })()}
              </div>
              {details.opponent.stats && (
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-stone-700/40">
                  <div className="text-center">
                    <p className="text-amber-400 font-bold text-sm">{details.opponent.stats.points.toLocaleString()}</p>
                    <p className="text-stone-600 text-xs">{POINTS_LABEL}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-200 font-bold text-sm">Lv.{details.opponent.stats.level}</p>
                    <p className="text-stone-600 text-xs">Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-400 font-bold text-sm">{details.opponent.stats.wins}W</p>
                    <p className="text-stone-600 text-xs">/ {details.opponent.stats.losses}L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-300 font-bold text-sm">#{details.opponent.stats.rank}</p>
                    <p className="text-stone-600 text-xs">Rank</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game code for online games */}
          {details.code && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/60 rounded-xl border border-stone-700/40">
              <span className="text-stone-400 text-sm">Game Code</span>
              <span className="font-mono font-bold text-stone-200 text-sm">{details.code}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
