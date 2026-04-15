import { Settings } from "lucide-react";
import { PlayerColors } from "../../types";
import { useGameStore } from "../../../../store/gameStore";
import { useUIStore } from "../../../../store/uiStore";
import { useGameMode } from "../../../../hooks";
import { GameModes } from "../../../../constants";

interface TopMenuProps {
  onOpenSettings?: () => void;
}

const tapButtonBase =
  "inline-flex shrink-0 touch-manipulation select-none items-center justify-center rounded-2xl transition-[transform,background-color,box-shadow] duration-150 ease-out motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

export const TopMenu = ({ onOpenSettings }: TopMenuProps) => {
  const { gameState, botEnabled, botDifficulty, gameSession, getCurrentTurnPlayer, isMyTurn } = useGameStore();

  const { devMode, toggleDevMode, closeTopMenu } = useUIStore();
  const { showBot, showDev, mode } = useGameMode();

  const isOnline = mode === GameModes.ONLINE;
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === "development";
  const showDevToggle = showDev && mode === GameModes.SINGLE && isDevelopment;

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

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
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

      {/* Desktop / tablet */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:justify-center md:gap-3 md:rounded-xl md:border md:border-stone-700 md:bg-stone-800/90 md:px-4 md:py-2 md:backdrop-blur-sm">
        <div className={`max-w-full shrink-0 break-words rounded-lg px-3 py-1.5 text-center text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</div>

        {nightMode && <div className="shrink-0 rounded-md border border-violet-500 bg-violet-700/80 px-2 py-1 text-xs font-semibold text-violet-100">Night</div>}

        {!isOnline && showBot && botEnabled && (
          <span className="shrink-0 text-xs text-stone-500" title="Bot difficulty">
            Bot: {difficultyLabel}
          </span>
        )}

        {showDevToggle && (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-xs font-medium text-orange-400">Dev</span>
            <button
              type="button"
              onClick={toggleDevMode}
              className={`relative h-6 w-12 overflow-hidden rounded-full transition-colors duration-200 ${devMode ? "bg-orange-600" : "bg-stone-600"}`}
              aria-label={devMode ? "Disable dev mode" : "Enable dev mode"}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${devMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        )}

        <button type="button" onClick={openSettings} className="shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-700/80 hover:text-amber-400" aria-label="Open settings">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};
