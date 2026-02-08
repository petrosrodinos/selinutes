import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { PlayerColors } from "../../types";
import { useGameStore } from "../../../../store/gameStore";
import { useUIStore } from "../../../../store/uiStore";
import { useGameMode } from "../../../../hooks";
import { Modal } from "../../../../components/Modal";
import { GameModes } from "../../../../constants";

interface TopMenuProps {
  onOpenSettings?: () => void;
}

export const TopMenu = ({ onOpenSettings }: TopMenuProps) => {
  const navigate = useNavigate();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const { gameState, botEnabled, botDifficulty, reset: resetOnlineState, gameSession, getCurrentTurnPlayer, isMyTurn } = useGameStore();

  const { devMode, toggleDevMode, closeTopMenu } = useUIStore();
  const { showBot, showDev, mode } = useGameMode();

  const isOnline = mode === GameModes.ONLINE;

  const handleLeaveGame = () => {
    setIsLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    if (isOnline) {
      resetOnlineState();
    } else {
      resetGame();
    }
    navigate("/");
  };

  const handleCancelLeave = () => {
    setIsLeaveModalOpen(false);
  };

  const resetGame = useGameStore((s) => s.resetGame);

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
      return "bg-rose-600 text-white";
    }
    const currentColor = isOnline ? currentTurnPlayer?.color : gameState.currentPlayer;
    if (currentColor === PlayerColors.WHITE) {
      return "bg-white text-stone-900 border border-stone-300";
    }
    return "bg-stone-900 text-white border border-stone-600";
  };

  const difficultyLabel = botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1);

  return (
    <>
      <div className="bg-stone-800/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-stone-700 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 ${getStatusColor()}`}>{getStatusText()}</div>

        {nightMode && <div className="px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-700/80 text-violet-100 border border-violet-500 shrink-0">Night</div>}

        {!isOnline && showBot && botEnabled && (
          <span className="text-xs text-stone-500 shrink-0" title="Bot difficulty">
            Bot: {difficultyLabel}
          </span>
        )}

        {showDev && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-orange-400 hidden sm:inline">Dev</span>
            <button onClick={toggleDevMode} className={`relative w-12 h-6 rounded-full transition-colors duration-200 overflow-hidden ${devMode ? "bg-orange-600" : "bg-stone-600"}`} aria-label={devMode ? "Disable dev mode" : "Enable dev mode"}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${devMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        )}

        <button onClick={handleLeaveGame} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0">
          <LogOut className="w-4 h-4" />
          <span>Leave</span>
        </button>

        <button
          onClick={() => {
            closeTopMenu();
            onOpenSettings?.();
          }}
          className="p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-700/80 transition-colors shrink-0"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <Modal isOpen={isLeaveModalOpen} onClose={handleCancelLeave} title="Leave Game">
        <div className="space-y-4">
          <p className="text-stone-300">{isOnline ? "Are you sure you want to leave this game? You will forfeit the match." : "Are you sure you want to leave? Your current game progress will be lost."}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCancelLeave} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirmLeave} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors">
              Leave Game
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
