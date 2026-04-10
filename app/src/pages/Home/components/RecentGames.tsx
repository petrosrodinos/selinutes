import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { POINTS_LABEL } from "../../../constants/game";
import { useGetGames } from "../../../features/game/hooks";
import { useAuthStore } from "../../../store/authStore";
import type { GameRecord } from "../../../features/game/interfaces";
import { GameDetailModal } from "./GameDetailModal";

const LIMIT = 5;

const formatDate = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const modeLabel: Record<GameRecord['mode'], string> = {
    SINGLE: 'Single',
    OFFLINE: 'Local',
    ONLINE: 'Online',
};

const ResultBadge = ({ status }: { status: GameRecord['status'] }) => {
    const styles = {
        WIN: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
        LOSS: { dot: 'bg-rose-400', text: 'text-rose-400' },
        DRAW: { dot: 'bg-amber-400', text: 'text-amber-400' },
    }[status];

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
            <p className={`font-bold text-sm ${styles.text}`}>{status}</p>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30 animate-pulse">
        <div className="flex flex-col gap-2">
            <div className="h-4 w-12 bg-stone-700 rounded" />
            <div className="h-3 w-20 bg-stone-700 rounded" />
            <div className="h-3 w-16 bg-stone-700 rounded" />
        </div>
    </div>
);

export const RecentGames = () => {
    const [page, setPage] = useState(1);
    const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
    const user_uuid = useAuthStore((state) => state.user_uuid);

    const { data, isLoading } = useGetGames(
        user_uuid
            ? { user_uuid, page, limit: LIMIT, sort_by: 'created_at', sort_order: 'desc' }
            : undefined
    );

    const games = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / LIMIT);

    return (
        <>
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-bold text-amber-200">Recent Games</h3>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-sm">{page} / {totalPages}</span>
                        <button
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page === 1 || isLoading}
                            className="p-1 rounded-lg text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page === totalPages || isLoading}
                            className="p-1 rounded-lg text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {isLoading
                    ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)
                    : games.length === 0
                    ? <p className="text-stone-500 text-sm col-span-full">No games played yet.</p>
                    : games.map((game) => (
                        <button
                            key={game.uuid}
                            onClick={() => setSelectedGame(game)}
                            className="w-full text-left bg-stone-900/50 rounded-lg p-4 border border-stone-700/30 hover:border-stone-600/50 transition-colors cursor-pointer"
                        >
                            <div className="flex flex-col gap-2">
                                <ResultBadge status={game.status} />
                                <div>
                                    <p className="text-stone-200 font-medium text-sm">{game.board_size}</p>
                                    <p className="text-stone-500 text-xs">
                                        {modeLabel[game.mode]} • {formatDate(game.created_at)}
                                    </p>
                                </div>
                                <p className="text-amber-400 text-sm font-bold">
                                    +{game.points} {POINTS_LABEL}
                                </p>
                            </div>
                        </button>
                    ))}
            </div>
        </div>

        <GameDetailModal
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
        />
    </>
  );
};
