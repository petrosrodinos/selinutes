import { Users, Clock, Hash, Grid3x3, Trash2 } from 'lucide-react'
import type { AdminGameSessionEntry } from '../../../../features/stats/interfaces/stats.interface'

const MODE_LABELS: Record<AdminGameSessionEntry['mode'], string> = {
    SINGLE: 'Single',
    OFFLINE: 'Local',
    ONLINE: 'Online',
}

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
    WIN: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
    LOSS: { dot: 'bg-rose-400', text: 'text-rose-400' },
    DRAW: { dot: 'bg-amber-400', text: 'text-amber-400' },
}

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return '—'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
}

interface GameSessionCardProps {
    session: AdminGameSessionEntry
    onDelete?: () => void
}

export const GameSessionCard = ({ session, onDelete }: GameSessionCardProps) => {
    const finishedAt = session.finished_at ?? session.created_at

    return (
        <article className="group rounded-2xl border border-stone-700/60 bg-stone-800/70 p-5 transition-all duration-200 hover:border-amber-500/30 hover:bg-stone-800/90">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
                            {MODE_LABELS[session.mode]}
                        </span>
                        <span className="text-xs text-stone-500">{session.board_size}</span>
                    </div>
                    {session.code ? (
                        <div className="flex items-center gap-1.5 text-sm text-stone-300">
                            <Hash className="h-3.5 w-3.5 text-stone-500" />
                            <span className="font-mono font-medium tracking-wider text-amber-200">{session.code}</span>
                        </div>
                    ) : (
                        <p className="text-xs text-stone-500">Solo session</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(finishedAt)}</span>
                    </div>
                    {onDelete ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="rounded-lg border border-rose-700/40 bg-rose-900/20 p-1.5 text-rose-400 transition-colors hover:bg-rose-800/40 hover:text-rose-300"
                            aria-label="Delete game"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="space-y-2">
                {session.players.map((player) => {
                    const styles = STATUS_STYLES[player.status] ?? STATUS_STYLES.DRAW

                    return (
                        <div
                            key={player.game_uuid}
                            className="flex items-center justify-between rounded-xl border border-stone-700/40 bg-stone-900/40 px-3 py-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <Users className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                                <span className="truncate font-medium text-stone-200">{player.username}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                                    <span className={`font-semibold ${styles.text}`}>{player.status}</span>
                                </div>
                                <span className="text-amber-400">+{player.points} pts</span>
                                <span className="text-stone-500">{player.moves} moves</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-3 flex items-center gap-4 border-t border-stone-700/40 pt-3 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                    <Grid3x3 className="h-3.5 w-3.5" />
                    <span>{session.players.length} player{session.players.length !== 1 ? 's' : ''}</span>
                </div>
                {session.players[0]?.time !== null ? (
                    <span>Duration: {formatDuration(session.players[0].time)}</span>
                ) : null}
            </div>
        </article>
    )
}
