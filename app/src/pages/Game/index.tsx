import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Home, Loader2 } from "lucide-react";
import { Board } from "./components/Board";
import { Board3DLoadFallback } from "./components/Board3D/Board3DLoadFallback";
import { TopMenu } from "./components/TopMenu";
import { GameSettingsModal } from "./components/GameSettingsModal";
import { BottomMenu } from "./components/BottomMenu";
import { RightSidebar, CapturedPieces } from "./components/RightSidebar";
import { GameResultModal } from "./components/GameResultModal";
import { MysteryBoxReviveModal } from "./components/MysteryBoxReviveModal";
import { ZombieReviveModal } from "./components/ZombieReviveModal";
import { Modal } from "../../components/Modal";
import { RulesModal } from "../../components/RulesModal";
import { useGameStore } from "../../store/gameStore";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useGameMode, useOnlineGame, useSoundEffects } from "../../hooks";
import { PlayerColors, MysteryBoxPhases, PieceTypes, ObstacleTypes, isObstacle, type Piece } from "./types";
import { BOT_DELAY, PIECE_RULES } from "./constants";
import { PIECE_NAMES, PIECE_SYMBOLS } from "./constants";
import { environments } from "../../config/environments";
import { GameModes } from "../../constants";
import { areRevivalGuardsInPlace, findPiecePosition, filterZombieRevivablePieces, getZombieRevivePieces, getZombieReviveStatusMessage, getZombieReviveConfirmState, getZombieRevivePlacementTarget, hasChariotBoundCaptures, ZOMBIE_REVIVE_ALIGNMENT_HINT } from "./utils";
import { useSaveOfflineGame } from "../../features/game/hooks";
import { LeaveGameConfirmModal } from "./components/LeaveGameConfirmModal";
import { FigureTierProvider, useFigureTiers } from "./context/FigureTierContext";

const Board3DLazy = lazy(() =>
  import("./components/Board3D/Board3D").then((m) => ({ default: m.Board3D }))
);

const calculatePoints = (pieces: Piece[]): number =>
  pieces.reduce((total, piece) => {
    const rules = PIECE_RULES[piece.type];
    if (!rules) return total;
    return total + (piece.isZombie && rules.zombiePoints ? rules.zombiePoints : rules.points);
  }, 0);

export const Game = () => (
  <FigureTierProvider>
    <GamePage />
  </FigureTierProvider>
);

const GamePage = () => {
  const navigate = useNavigate();
  const { mode } = useGameMode();
  const isOnline = mode === GameModes.ONLINE;

  const {
    gameState,
    boardSizeKey,
    botEnabled,
    botDifficulty,
    botThinking,
    processBotMove,
    startGameTimer,
    mysteryBoxState: offlineMysteryBoxState,
    selectRevivePiece: offlineSelectRevivePiece,
    cancelMysteryBox: offlineCancelMysteryBox,
    selectSquare: offlineSelectSquare,
    reviveZombie: offlineReviveZombie,
    resetGame,
    reset: resetOnlineState,
  } = useGameStore();
  const attackMode = useGameStore((state) => state.attackMode);
  const { is3D, isTopMenuOpen, isRightMenuOpen, closeTopMenu, closeRightMenu } = useUIStore();
  const { tiersByColor } = useFigureTiers();

  useEffect(() => {
    if (!is3D) return;
    void import("./components/Board3D/board3dPreload").then((m) =>
      m.preloadBoard3DGltfs(tiersByColor.white, tiersByColor.black),
    );
  }, [is3D, tiersByColor.white, tiersByColor.black]);
  const userUuid = useAuthStore(state => state.user_uuid);
  const { mutate: saveOfflineGameResult } = useSaveOfflineGame();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isZombieReviveOpen, setIsZombieReviveOpen] = useState(false);
  const [selectedZombiePiece, setSelectedZombiePiece] = useState<Piece | null>(null);
  const offlineGameSavedRef = useRef(false);

  const { gameSession, board: onlineBoard, boardSize: onlineBoardSize, selectedPosition: onlineSelectedPosition, validMoves: onlineValidMoves, validAttacks: onlineValidAttacks, validSwaps: onlineValidSwaps, lastMove: onlineLastMove, capturedPieces: onlineCapturedPieces, gameOver: onlineGameOver, winner: onlineWinner, mysteryBoxState: onlineMysteryBoxState, currentPlayer, isMyTurn, isLoading, error, handleSquareClick, selectRevivePiece: onlineSelectRevivePiece, cancelMysteryBox: onlineCancelMysteryBox, requestZombieRevive, notifyReviveStarted } = useOnlineGame();

  const mysteryBoxState = isOnline ? onlineMysteryBoxState : offlineMysteryBoxState;
  const selectRevivePiece = isOnline ? onlineSelectRevivePiece : offlineSelectRevivePiece;
  const cancelMysteryBox = isOnline ? onlineCancelMysteryBox : offlineCancelMysteryBox;

  useEffect(() => {
    if (isOnline) return;
    if (!botEnabled) return;
    if (gameState.currentPlayer !== PlayerColors.BLACK) return;
    if (gameState.gameOver) return;
    if (botThinking) return;

    const timer = setTimeout(() => {
      processBotMove();
    }, BOT_DELAY[botDifficulty]);

    return () => clearTimeout(timer);
  }, [isOnline, botEnabled, botDifficulty, gameState.currentPlayer, gameState.gameOver, botThinking, processBotMove]);

  useEffect(() => {
    const isGameOver = isOnline ? onlineGameOver : gameState.gameOver;
    if (isGameOver) {
      setIsResultModalOpen(true);
    } else {
      setIsResultModalOpen(false);
      offlineGameSavedRef.current = false;
    }
  }, [isOnline, onlineGameOver, gameState.gameOver]);

  useEffect(() => {
    if (isOnline) return;
    if (!gameState.gameOver) return;
    if (!userUuid) return;
    if (offlineGameSavedRef.current) return;

    offlineGameSavedRef.current = true;

    const playerColor = PlayerColors.WHITE;
    const points = calculatePoints(gameState.capturedPieces.black);

    saveOfflineGameResult({
      boardSizeKey,
      mode: mode === GameModes.SINGLE ? 'SINGLE' : 'OFFLINE',
      winner: gameState.winner,
      playerColor,
      moves: gameState.moveHistory.length,
      points,
    });
  }, [isOnline, gameState.gameOver, gameState.winner, gameState.capturedPieces, gameState.moveHistory, userUuid, boardSizeKey, mode, saveOfflineGameResult]);

  const winner = isOnline ? onlineWinner : gameState.winner;
  const board = isOnline ? onlineBoard : gameState.board;
  const boardSize = isOnline ? onlineBoardSize : gameState.boardSize;
  const capturedPieces = isOnline ? onlineCapturedPieces : gameState.capturedPieces;
  const lastMove = isOnline ? onlineLastMove : gameState.lastMove;

  const { playBoardClick, playSwap, playMysteryBox, playCaveTeleport, playRevive, playGameOver } = useSoundEffects(lastMove);

  const prevGameOverRef = useRef(false);
  useEffect(() => {
    const isGameOver = isOnline ? onlineGameOver : gameState.gameOver;
    if (isGameOver) {
      if (!prevGameOverRef.current) {
        playGameOver();
      }
      prevGameOverRef.current = true;
    } else {
      prevGameOverRef.current = false;
    }
  }, [isOnline, onlineGameOver, gameState.gameOver, playGameOver]);

  const lastCaptureToastKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (isOnline) return;
    if (!lastMove || !lastMove.captured) return;
    const toastKey = `${lastMove.from.row},${lastMove.from.col}-${lastMove.to.row},${lastMove.to.col}-${lastMove.piece.id}-${lastMove.captured.id}`;
    if (lastCaptureToastKeyRef.current === toastKey) return;
    lastCaptureToastKeyRef.current = toastKey;
    const victimIcon = PIECE_SYMBOLS[lastMove.captured.color][lastMove.captured.type];
    const killerIcon = PIECE_SYMBOLS[lastMove.piece.color][lastMove.piece.type];
    if (lastMove.terminatedByNarc) {
      toast.info(`${killerIcon} killed ${victimIcon} ${PIECE_NAMES[lastMove.captured.type]}`, { autoClose: 2500 });
    } else {
      toast.info(`${killerIcon} ${PIECE_NAMES[lastMove.piece.type]} killed ${victimIcon} ${PIECE_NAMES[lastMove.captured.type]}`, { autoClose: 2500 });
    }
  }, [isOnline, lastMove]);

  useEffect(() => {
    if (!isOnline) startGameTimer();
  }, [isOnline, startGameTimer]);

  const prevMysteryBoxPhaseRef = useRef(mysteryBoxState.phase);
  useEffect(() => {
    const prevPhase = prevMysteryBoxPhaseRef.current;
    prevMysteryBoxPhaseRef.current = mysteryBoxState.phase;
    if (prevPhase === MysteryBoxPhases.WAITING_REVIVE_PLACEMENT && !mysteryBoxState.isActive) {
      playRevive();
    }
  }, [mysteryBoxState.phase, mysteryBoxState.isActive, playRevive]);

  const revivePlayerColor = gameState.currentPlayer;
  const revivableZombiePieces = useMemo(() => {
    return getZombieRevivePieces(capturedPieces, revivePlayerColor);
  }, [capturedPieces, revivePlayerColor]);
  const necromancerPosition = useMemo(() => {
    return findPiecePosition(board, PieceTypes.NECROMANCER, revivePlayerColor);
  }, [board, revivePlayerColor]);
  const reviveTarget = useMemo(() => {
    if (!selectedZombiePiece) return null;
    return getZombieRevivePlacementTarget(board, boardSize, selectedZombiePiece, revivePlayerColor);
  }, [board, boardSize, selectedZombiePiece, revivePlayerColor]);
  const canConfirmZombieRevive = useMemo(() => {
    return getZombieReviveConfirmState({
      board,
      boardSize,
      revivePlayerColor,
      necromancerPosition,
      selectedZombiePiece,
      reviveTarget,
      isOnline,
      isMyTurn,
    });
  }, [board, boardSize, revivePlayerColor, necromancerPosition, selectedZombiePiece, reviveTarget, isOnline, isMyTurn]);

  const hasChariotBoundZombieCaptures = useMemo(() => {
    const eligible = filterZombieRevivablePieces(capturedPieces[revivePlayerColor] || []);
    return hasChariotBoundCaptures(eligible);
  }, [capturedPieces, revivePlayerColor]);

  const zombieReviveStatusMessage = useMemo(() => {
    return getZombieReviveStatusMessage({
      isOnline,
      isMyTurn,
      necromancerPosition,
      revivableCount: revivableZombiePieces.length,
      hasChariotBoundCaptures: hasChariotBoundZombieCaptures,
      selectedZombiePiece,
      reviveTarget,
    });
  }, [isOnline, isMyTurn, necromancerPosition, revivableZombiePieces.length, hasChariotBoundZombieCaptures, selectedZombiePiece, reviveTarget]);

  const openZombieRevive = () => {
    setSelectedZombiePiece(null);
    setIsZombieReviveOpen(true);
  };

  const closeZombieRevive = () => {
    setIsZombieReviveOpen(false);
    setSelectedZombiePiece(null);
  };

  const executeRevive = (target: { row: number; col: number }) => {
    if (!selectedZombiePiece) return false;

    const { gameState: latestState } = useGameStore.getState();
    const latestBoard = latestState.board;
    const latestBoardSize = latestState.boardSize;
    const latestRevivePlayerColor = latestState.currentPlayer;
    const latestNecromancerPosition = findPiecePosition(latestBoard, PieceTypes.NECROMANCER, latestRevivePlayerColor);

    if (!latestNecromancerPosition) return false;
    if (!areRevivalGuardsInPlace(latestBoard, latestBoardSize, latestRevivePlayerColor)) {
      toast.error(ZOMBIE_REVIVE_ALIGNMENT_HINT, { autoClose: 3000 });
      return false;
    }

    if (isOnline) {
      const success = requestZombieRevive({
        necromancerPosition: latestNecromancerPosition,
        revivePiece: selectedZombiePiece,
        target,
      });
      if (success) {
        playRevive();
        closeZombieRevive();
      }
      return success;
    }
    const success = offlineReviveZombie({
      necromancerPosition: latestNecromancerPosition,
      revivePiece: selectedZombiePiece,
      target,
    });
    if (success) {
      playRevive();
      closeZombieRevive();
    }
    return success;
  };

  const confirmZombieRevive = () => {
    if (!selectedZombiePiece || !reviveTarget || !necromancerPosition) return;
    if (!canConfirmZombieRevive) return;
    executeRevive(reviveTarget);
  };

  const handleReviveZombieClick = () => {
    if (!selectedZombiePiece || !canConfirmZombieRevive) return;
    if (isOnline) notifyReviveStarted();
    confirmZombieRevive();
  };

  const handleLeaveConfirm = () => {
    setLeaveConfirmOpen(false);
    setIsSettingsOpen(false);
    if (isOnline) {
      resetOnlineState();
    }
    resetGame();
    navigate("/home");
  };

  const onSquareClick = (pos: { row: number; col: number }) => {
    const hasSelection = isOnline ? onlineSelectedPosition !== null : gameState.selectedPosition !== null;
    const currentSwaps = isOnline ? onlineValidSwaps : gameState.validSwaps;
    const currentValidMoves = isOnline ? onlineValidMoves : gameState.validMoves;
    const currentValidAttacks = isOnline ? onlineValidAttacks : gameState.validAttacks;

    const isSwapTarget = hasSelection && currentSwaps.some((s) => s.position.row === pos.row && s.position.col === pos.col);
    const isMoveOrAttack = hasSelection && (currentValidMoves.some((m) => m.row === pos.row && m.col === pos.col) || currentValidAttacks.some((a) => a.row === pos.row && a.col === pos.col));
    const targetCell = board[pos.row]?.[pos.col];
    const isMysteryBoxTarget = isMoveOrAttack && targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX;
    const isCaveTarget = isMoveOrAttack && targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.CAVE;

    if (isSwapTarget) {
      playSwap();
    } else if (isMysteryBoxTarget) {
      playMysteryBox();
    } else if (isCaveTarget) {
      playCaveTeleport();
    } else if (!hasSelection) {
      playBoardClick();
    }

    if (isOnline) {
      handleSquareClick(pos);
    } else {
      offlineSelectSquare(pos, false);
    }
  };

  if (isOnline && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
          <p className="text-amber-200 text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (isOnline && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center">
        <div className="bg-rose-600/20 border border-rose-500 rounded-xl p-6 max-w-md">
          <h2 className="text-rose-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-stone-200">{error}</p>
          <Link
            to="/home"
            onClick={() => {
              resetOnlineState();
              resetGame();
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-700 px-4 py-3 font-medium text-white transition-colors hover:bg-stone-600"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-2 sm:p-4">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text pt-[max(0.25rem,env(safe-area-inset-top))] text-center text-xl font-bold text-transparent sm:mb-3 sm:text-2xl lg:hidden">
          {environments.APP_NAME}
        </h1>

        <header className="sticky top-0 z-40 mb-3 border-b border-stone-700/50 bg-stone-950/75 px-2 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md sm:mb-4 sm:rounded-xl sm:border sm:border-stone-700/60 sm:px-4">
          <TopMenu
            gameTitle={environments.APP_NAME}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onRequestLeave={() => setLeaveConfirmOpen(true)}
          />
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-8 xl:gap-10">
          <div className={`flex min-w-0 flex-col items-stretch ${!isOnline ? "pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0" : ""}`}>
            <div className="mb-3 w-full lg:hidden">
              <CapturedPieces onOpenZombieRevive={openZombieRevive} />
            </div>

            <div className="mx-auto flex w-fit max-w-full flex-col items-stretch gap-4 lg:min-h-[min(100vh-12rem,900px)] lg:justify-center">
              {is3D ? (
                <Suspense fallback={<Board3DLoadFallback />}>
                  <Board3DLazy
                    isOnline={isOnline}
                    attackMode={attackMode}
                    onlineBoard={onlineBoard}
                    onlineBoardSize={onlineBoardSize}
                    onlineSelectedPosition={onlineSelectedPosition}
                    onlineValidMoves={onlineValidMoves}
                    onlineValidAttacks={onlineValidAttacks}
                    onlineValidSwaps={onlineValidSwaps}
                    onlineLastMove={onlineLastMove}
                    onlineMysteryBoxState={onlineMysteryBoxState}
                    onSquareClick={onSquareClick}
                    onMysteryBoxClick={playBoardClick}
                  />
                </Suspense>
              ) : (
                <Board
                  isOnline={isOnline}
                  attackMode={attackMode}
                  onlineBoard={onlineBoard}
                  onlineBoardSize={onlineBoardSize}
                  onlineSelectedPosition={onlineSelectedPosition}
                  onlineValidMoves={onlineValidMoves}
                  onlineValidAttacks={onlineValidAttacks}
                  onlineValidSwaps={onlineValidSwaps}
                  onlineLastMove={onlineLastMove}
                  onlineMysteryBoxState={onlineMysteryBoxState}
                  onSquareClick={onSquareClick}
                  onMysteryBoxClick={playBoardClick}
                />
              )}

              {!isOnline && <BottomMenu />}
            </div>
          </div>

          <aside className="mt-6 hidden min-w-0 lg:sticky lg:top-24 lg:mt-0 lg:block lg:self-start">
            <RightSidebar onOpenZombieRevive={openZombieRevive} />
          </aside>
        </div>

        <Modal isOpen={isTopMenuOpen} onClose={closeTopMenu} title={isOnline ? "Game Info" : "Game"}>
          <TopMenu
            gameTitle={environments.APP_NAME}
            onOpenSettings={() => {
              closeTopMenu();
              setIsSettingsOpen(true);
            }}
            onOpenRules={() => {
              closeTopMenu();
              setIsRulesOpen(true);
            }}
            onRequestLeave={() => {
              closeTopMenu();
              setLeaveConfirmOpen(true);
            }}
          />
        </Modal>

        <GameSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onRequestLeave={() => setLeaveConfirmOpen(true)} />

        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

        <LeaveGameConfirmModal
          isOpen={leaveConfirmOpen}
          onClose={() => setLeaveConfirmOpen(false)}
          onConfirm={handleLeaveConfirm}
          isOnline={isOnline}
        />

        <Modal isOpen={isRightMenuOpen} onClose={closeRightMenu} title="Game Info">
          <RightSidebar onOpenZombieRevive={openZombieRevive} />
        </Modal>

        <GameResultModal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} winner={winner} capturedPieces={isOnline ? onlineCapturedPieces : gameState.capturedPieces} isOnline={isOnline} currentPlayer={currentPlayer} players={gameSession?.players} />

        <MysteryBoxReviveModal isOpen={mysteryBoxState.isActive && mysteryBoxState.phase === MysteryBoxPhases.WAITING_REVIVE_FIGURE} onClose={cancelMysteryBox} pieces={mysteryBoxState.revivablePieces} onSelectPiece={selectRevivePiece} selectedPieceId={mysteryBoxState.selectedRevivePiece?.id || null} />

        <ZombieReviveModal
          isOpen={isZombieReviveOpen}
          onClose={closeZombieRevive}
          pieces={revivableZombiePieces}
          onSelectPiece={setSelectedZombiePiece}
          selectedPieceId={selectedZombiePiece?.id || null}
          selectedTarget={reviveTarget}
          onConfirm={handleReviveZombieClick}
          canConfirm={canConfirmZombieRevive}
          board={board}
          boardSize={boardSize}
          revivePlayerColor={revivePlayerColor}
          statusMessage={zombieReviveStatusMessage}
        />
      </div>
    </div>
  );
};
