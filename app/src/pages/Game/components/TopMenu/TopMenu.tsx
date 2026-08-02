import { LogOut, Settings } from "lucide-react";
import { RulesNavIcon } from "../../../../components/RulesNavIcon";
import { PlayerColors } from "../../types";
import { useGameStore } from "../../../../store/gameStore";
import { useUIStore } from "../../../../store/uiStore";
import { useGameMode, useCanAccessDevMode } from "../../../../hooks";
import { GameModes } from "../../../../constants";

interface TopMenuProps {
  onOpenSettings?: () => void;
  onOpenRules?: () => void;
  onRequestLeave?: () => void;
  gameTitle?: string;
}

const tapButtonBase =
  "inline-flex shrink-0 touch-manipulation select-none items-center justify-center rounded-xl transition-[transform,background-color,box-shadow] duration-150 ease-out motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

const iconGhost =
  "rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-800/90 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60";

export const TopMenu = ({ onOpenSettings, onOpenRules, onRequestLeave, gameTitle }: TopMenuProps) => {
  const { gameState, botEnabled, botDifficulty, gameSession, getCurrentTurnPlayer, isMyTurn } = useGameStore();

  const { devMode, toggleDevMode, closeTopMenu } = useUIStore();
  const { showBot, showDev, mode } = useGameMode();
  const canAccessDevMode = useCanAccessDevMode();

  const isOnline = mode === GameModes.ONLINE;
  const showDevToggle = showDev && mode === GameModes.SINGLE && canAccessDevMode;

  const players = gameSession?.players || [];
  const currentTurnPlayer = getCurrentTurnPlayer();
  const myTurn = isMyTurn();
  const winnerPlayer = gameState.winner ? players.find((p) => p.color === gameState.winner) : null;
  const gameOver = gameState.gameOver;
  const nightMode = gameState.nightMode;

  const getStatusText = () => {
    if (isOnline) {
      if (gameOver && winnerPlayer) {
        return `${winnerPlayer.name} Wins!`;
      }
      if (gameOver) {
        return "Game Over";
      }
      if (!currentTurnPlayer) {
        return "Waiting for players...";
      }
      if (myTurn) {
        return "Your Turn";
      }
      return `${currentTurnPlayer.name}'s Turn`;
    }
    if (gameOver && gameState.winner) {
      return `${gameState.winner === PlayerColors.WHITE ? "White" : "Black"} Wins!`;
    }
    if (gameOver) {
      return "Game Over";
    }
    return `${gameState.currentPlayer === PlayerColors.WHITE ? "White" : "Black"}'s Turn`;
  };

  const getStatusColor = () => {
    if (gameOver) {
      return "bg-rose-600 text-white shadow-inner";
    }
    const currentColor = isOnline ? currentTurnPlayer?.color : gameState.currentPlayer;
    if (currentColor === PlayerColors.WHITE) {
      return "bg-white text-stone-900 border border-stone-300/90 shadow-sm";
    }
    return "bg-stone-900 text-white border border-stone-600 shadow-sm";
  };

  const difficultyLabel = botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1);

  const openSettings = () => {
    closeTopMenu();
    onOpenSettings?.();
  };

  const openRules = () => {
    closeTopMenu();
    onOpenRules?.();
  };

  return (
    <>
      {/* Mobile & tablet — compact strip */}
      <div className="lg:hidden">
        <div className="rounded-2xl border border-stone-700/50 backdrop-blur-sm">
          <div className="flex items-stretch gap-1.5 px-2 py-1.5">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <div className={`rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold leading-tight ${getStatusColor()}`}>{getStatusText()}</div>
              {(nightMode || (!isOnline && showBot && botEnabled)) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {nightMode && (
                    <span className="rounded-full border border-violet-500/60 bg-violet-700/85 px-2 py-0.5 text-[10px] font-semibold text-violet-100">Night</span>
                  )}
                  {!isOnline && showBot && botEnabled && (
                    <span className="text-[10px] font-medium text-stone-500" title="Bot difficulty">
                      Bot · {difficultyLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {onOpenRules ? (
              <RulesNavIcon onClick={openRules} variant="ghost" compact />
            ) : null}

            <button type="button" onClick={openSettings} className={`${tapButtonBase} h-9 min-w-9 text-amber-300/95 hover:bg-stone-800/90`} aria-label="Open settings">
              <Settings className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>

          {showDevToggle && (
            <div className="flex items-center justify-center gap-2 border-t border-stone-700/60 px-3 py-2">
              <span className="text-[11px] font-medium text-orange-400">Dev mode</span>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${devMode ? "bg-orange-600" : "bg-stone-600"}`}
                aria-label={devMode ? "Disable dev mode" : "Enable dev mode"}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out ${devMode ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop — 3-zone header: status | title | actions */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start">
          <div className={`max-w-[min(100%,280px)] truncate rounded-lg px-3 py-1.5 text-sm font-semibold ${getStatusColor()}`}>{getStatusText()}</div>
          {nightMode && <span className="shrink-0 rounded-md border border-violet-500/70 bg-violet-800/90 px-2 py-0.5 text-[11px] font-semibold text-violet-100">Night</span>}
          {!isOnline && showBot && botEnabled && (
            <span className="text-[11px] text-stone-500" title="Bot difficulty">
              Bot · {difficultyLabel}
            </span>
          )}
        </div>

        <div className="justify-self-center px-2 text-center">
          {gameTitle ? (
            <div className="flex items-center justify-center gap-2.5">
              <img src="/logo.png" alt="" aria-hidden className="h-8 w-8 shrink-0 drop-shadow-[0_2px_8px_rgba(251,191,36,0.25)]" />
              <h2 className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl">{gameTitle}</h2>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 justify-self-end">
          {showDevToggle && (
            <div className="flex items-center gap-2 rounded-lg border border-stone-700/80 bg-stone-900/40 px-2 py-1">
              <span className="text-[11px] font-medium text-orange-400/90">Dev</span>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`relative h-6 w-11 overflow-hidden rounded-full transition-colors duration-200 ${devMode ? "bg-orange-600" : "bg-stone-600"}`}
                aria-label={devMode ? "Disable dev mode" : "Enable dev mode"}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${devMode ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          )}

          {onOpenRules ? (
            <RulesNavIcon onClick={openRules} variant="ghost" />
          ) : null}

          <button type="button" onClick={openSettings} className={iconGhost} aria-label="Open settings">
            <Settings className="h-5 w-5" strokeWidth={2} />
          </button>

          {onRequestLeave ? (
            <button
              type="button"
              onClick={onRequestLeave}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-900/30 transition hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/90"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Leave
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
};
