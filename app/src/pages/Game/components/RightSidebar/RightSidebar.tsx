import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Piece } from "../../types";
import { PieceTypes, PlayerColors } from "../../types";
import { PIECE_RULES, PIECE_NAMES } from "../../constants";
import { useGameStore } from "../../../../store/gameStore";
import { getNecromancerKillTargets, getNecromancerFreezeTargets } from "../../utils";
import { getPiece2DAssetUrl } from "../../utils/figureAssets.utils";
import { POINTS_LABEL } from "../../../../constants/game";

const PIECE_ORDER = [PieceTypes.MONARCH, PieceTypes.DUCHESS, PieceTypes.RAM_TOWER, PieceTypes.CHARIOT, PieceTypes.PALADIN, PieceTypes.NECROMANCER, PieceTypes.WARLOCK, PieceTypes.BOMBER, PieceTypes.HOPLITE] as const;

interface CapturedPiecesContentProps {
  capturedPieces: { white: Piece[]; black: Piece[] };
  currentPlayer: string;
  onOpenZombieRevive?: () => void;
}

const sortedCapturedPieces = (pieces: Piece[]) =>
  [...pieces].sort((a, b) => {
    const aIndex = PIECE_ORDER.indexOf(a.type as (typeof PIECE_ORDER)[number]);
    const bIndex = PIECE_ORDER.indexOf(b.type as (typeof PIECE_ORDER)[number]);
    return aIndex - bIndex;
  });

const getTotalPointsForPieces = (pieces: Piece[]) =>
  pieces.reduce((total, piece) => {
    const rules = PIECE_RULES[piece.type];
    return total + (piece.isZombie && rules.zombiePoints ? rules.zombiePoints : rules.points);
  }, 0);

const CapturedPieceIcon = ({ piece }: { piece: Piece }) => {
  const imageUrl = getPiece2DAssetUrl(piece.type, piece.color);
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={PIECE_NAMES[piece.type]}
        className={`w-6 h-6 object-contain ${piece.isZombie ? "opacity-60" : ""}`}
        draggable={false}
      />
    );
  }

  return (
    <span className={`text-lg ${piece.isZombie ? "opacity-60" : ""}`}>
      {PIECE_NAMES[piece.type].charAt(0)}
    </span>
  );
};

export const CapturedPieces = ({ onOpenZombieRevive }: { onOpenZombieRevive?: () => void }) => {
  const { gameState } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const { white, black } = gameState.capturedPieces;
  const totalCount = white.length + black.length;
  const wPts = getTotalPointsForPieces(white);
  const bPts = getTotalPointsForPieces(black);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-700 bg-stone-800/80 backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="captured-pieces-panel"
        id="captured-pieces-trigger"
        className="flex w-full touch-manipulation items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-stone-700/35"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-sm font-medium text-amber-200">Captured pieces</h3>
            <span className="text-xs text-stone-500">
              {totalCount} pcs · W {wPts}
              {POINTS_LABEL} · B {bPts}
              {POINTS_LABEL}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
      </button>

      <div
        id="captured-pieces-panel"
        role="region"
        aria-labelledby="captured-pieces-trigger"
        hidden={!isOpen}
        className="border-t border-stone-700/80 px-3 pb-3 pt-2"
      >
        <CapturedPiecesContent capturedPieces={gameState.capturedPieces} currentPlayer={gameState.currentPlayer} onOpenZombieRevive={onOpenZombieRevive} />
      </div>
    </div>
  );
};

const CapturedPiecesContent = ({ capturedPieces, currentPlayer, onOpenZombieRevive }: CapturedPiecesContentProps) => {
  const wPts = getTotalPointsForPieces(capturedPieces.white);
  const bPts = getTotalPointsForPieces(capturedPieces.black);
  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-stone-600/60 bg-stone-950/40 p-3 shadow-inner ring-1 ring-white/[0.04]">
        <div className="mb-2 flex items-center gap-2 border-b border-stone-700/50 pb-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stone-100 ring-2 ring-amber-200/40" aria-hidden />
          <span className="text-xs font-semibold tracking-wide text-amber-100/95">White</span>
          <span className="ml-auto tabular-nums text-[11px] font-medium text-stone-400">
            {wPts}
            {POINTS_LABEL}
          </span>
        </div>
        <button
          type="button"
          onClick={currentPlayer === PlayerColors.WHITE ? onOpenZombieRevive : undefined}
          className={`flex min-h-[32px] w-full flex-wrap gap-1 text-left transition-colors ${currentPlayer === PlayerColors.WHITE && onOpenZombieRevive ? "rounded-lg hover:bg-stone-800/60" : ""}`}
        >
          {sortedCapturedPieces(capturedPieces.white).map((piece, i) => (
            <span key={`w-${i}`} className="inline-flex items-center justify-center">
              <CapturedPieceIcon piece={piece} />
            </span>
          ))}
        </button>
      </section>

      <section className="rounded-xl border border-stone-600/60 bg-black/25 p-3 shadow-inner ring-1 ring-black/30">
        <div className="mb-2 flex items-center gap-2 border-b border-stone-700/50 pb-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stone-900 ring-2 ring-amber-900/50" aria-hidden />
          <span className="text-xs font-semibold tracking-wide text-amber-100/95">Black</span>
          <span className="ml-auto tabular-nums text-[11px] font-medium text-stone-400">
            {bPts}
            {POINTS_LABEL}
          </span>
        </div>
        <button
          type="button"
          onClick={currentPlayer === PlayerColors.BLACK ? onOpenZombieRevive : undefined}
          className={`flex min-h-[32px] w-full flex-wrap gap-1 text-left transition-colors ${currentPlayer === PlayerColors.BLACK && onOpenZombieRevive ? "rounded-lg hover:bg-stone-800/60" : ""}`}
        >
          {sortedCapturedPieces(capturedPieces.black).map((piece, i) => (
            <span key={`b-${i}`} className="inline-flex items-center justify-center">
              <CapturedPieceIcon piece={piece} />
            </span>
          ))}
        </button>
      </section>
    </div>
  );
};

interface RightSidebarProps {
  onOpenZombieRevive?: () => void;
}

export const RightSidebar = ({ onOpenZombieRevive }: RightSidebarProps) => {
  const { gameState, selectedPosition, validMoves, validAttacks, attackMode, necromancerActionMode, setAttackMode, setNecromancerActionMode } = useGameStore();

  const capturedPieces = gameState.capturedPieces;
  // const moveHistory = isOnline && onlineMoveHistory
  //     ? onlineMoveHistory
  //     : gameState.moveHistory
  // const boardSize = isOnline && onlineBoardSize
  //     ? onlineBoardSize
  //     : BOARD_SIZES[boardSizeKey as keyof typeof BOARD_SIZES]

  // const files = generateFiles(boardSize.cols)

  // const formatMove = (move: Move, _index: number) => {
  //     const from = `${files[move.from.col]}${boardSize.rows - move.from.row}`
  //     const to = `${files[move.to.col]}${boardSize.rows - move.to.row}`
  //     const piece = move.piece.type === PieceTypes.HOPLITE ? '' : move.piece.type[0].toUpperCase()
  //     const action = move.isAttack ? '⚔' : (move.captured ? 'x' : '-')

  //     return `${piece}${from}${action}${to}`
  // }

  const reviveSectionColor = gameState.currentPlayer;
  const currentSelectedPosition = gameState.selectedPosition ?? selectedPosition;
  const currentValidMoves = gameState.selectedPosition ? gameState.validMoves : validMoves;
  const currentValidAttacks = gameState.selectedPosition ? gameState.validAttacks : validAttacks;
  const selectedCell = currentSelectedPosition ? gameState.board[currentSelectedPosition.row]?.[currentSelectedPosition.col] : null;
  const showAttackModeMenu = Boolean(
    selectedCell &&
    "color" in selectedCell &&
    selectedCell.type !== PieceTypes.NECROMANCER &&
    PIECE_RULES[selectedCell.type].canChooseAttackMode &&
    (currentValidMoves.length > 0 || currentValidAttacks.length > 0)
  );
  const necromancerKillTargets = selectedCell && "color" in selectedCell && selectedCell.type === PieceTypes.NECROMANCER && currentSelectedPosition ? getNecromancerKillTargets(gameState.board, currentSelectedPosition, gameState.boardSize) : [];
  const necromancerFreezeTargets = selectedCell && "color" in selectedCell && selectedCell.type === PieceTypes.NECROMANCER && currentSelectedPosition ? getNecromancerFreezeTargets(gameState.board, currentSelectedPosition, gameState.boardSize) : [];
  const showNecromancerMenu = Boolean(selectedCell && "color" in selectedCell && selectedCell.type === PieceTypes.NECROMANCER);
  const isRamTower = Boolean(selectedCell && "color" in selectedCell && selectedCell.type === PieceTypes.RAM_TOWER);
  const hasRangedTargetsWithinFive = currentValidAttacks.length > 0;
  const isRangedAttackDisabled =
    Boolean(selectedCell && "color" in selectedCell && selectedCell.isZombie) ||
    (isRamTower && !hasRangedTargetsWithinFive);

  useEffect(() => {
    if (!isRamTower || !isRangedAttackDisabled || attackMode !== "ranged") return;
    setAttackMode("capture");
  }, [isRamTower, isRangedAttackDisabled, attackMode, setAttackMode]);

  return (
    <div className="w-full rounded-2xl border border-stone-700/80 bg-stone-900/45 p-4 shadow-lg shadow-black/20 backdrop-blur-md sm:p-5">
      {showAttackModeMenu && selectedCell && "color" in selectedCell && (
        <div className="mb-4 border border-stone-700 rounded-lg p-3 bg-stone-900/50">
          <h3 className="text-sm font-medium text-amber-200 mb-2">{PIECE_NAMES[selectedCell.type]} Attack Mode</h3>
          <div className="grid gap-2">
            {isRangedAttackDisabled ? (
              <div className="group relative">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed text-xs rounded-md px-2 py-2 border border-stone-700 bg-stone-800/40 text-stone-500 line-through"
                >
                  Range attack (kill without moving)
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-amber-900/60 bg-stone-950 px-2.5 py-2 text-center text-[11px] leading-snug text-amber-200/80 shadow-xl group-hover:block">
                  {selectedCell.isZombie
                    ? "Zombie pieces cannot use ranged attacks — they must move to kill"
                    : "No enemies within 5 squares — use capture and move for distant targets"}
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setAttackMode("ranged")} className={`text-xs rounded-md px-2 py-2 border transition-colors ${attackMode === "ranged" ? "bg-rose-700 border-rose-500 text-rose-100" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}>
                Range attack (kill without moving)
              </button>
            )}
            <button type="button" onClick={() => setAttackMode("capture")} className={`text-xs rounded-md px-2 py-2 border transition-colors ${attackMode === "capture" ? "bg-emerald-700 border-emerald-500 text-emerald-100" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}>
              Capture and move to target
            </button>
          </div>
        </div>
      )}
      {showNecromancerMenu && selectedCell && "color" in selectedCell && (
        <div className="mb-4 border border-stone-700 rounded-lg p-3 bg-stone-900/50">
          <h3 className="text-sm font-medium text-amber-200 mb-2">{PIECE_NAMES[selectedCell.type]} Action</h3>
          <div className="grid gap-2">
            <button type="button" onClick={() => setNecromancerActionMode("move")} className={`text-xs rounded-md px-2 py-2 border transition-colors ${necromancerActionMode === "move" ? "bg-sky-700 border-sky-500 text-sky-100" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}>
              Move
            </button>
            {necromancerKillTargets.length > 0 && (
              <button type="button" onClick={() => setNecromancerActionMode("kill")} className={`text-xs rounded-md px-2 py-2 border transition-colors ${necromancerActionMode === "kill" ? "bg-rose-700 border-rose-500 text-rose-100" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}>
                Kill (1-step attack)
              </button>
            )}
            <button type="button" onClick={() => setNecromancerActionMode("freeze")} disabled={necromancerFreezeTargets.length === 0} className={`text-xs rounded-md px-2 py-2 border transition-colors ${necromancerActionMode === "freeze" ? "bg-violet-700 border-violet-500 text-violet-100" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}>
              Freeze (ranged stun)
            </button>
          </div>
        </div>
      )}
      <div className="mb-1 hidden lg:block">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Captured</h3>
        <CapturedPiecesContent capturedPieces={capturedPieces} currentPlayer={reviveSectionColor} onOpenZombieRevive={onOpenZombieRevive} />
      </div>
    </div>
  );
};
