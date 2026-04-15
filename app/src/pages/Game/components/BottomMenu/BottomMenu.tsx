import { useState } from "react";
import { Lightbulb, Undo2, RotateCcw } from "lucide-react";
import { useGameStore } from "../../../../store/gameStore";
import { Modal } from "../../../../components/Modal";

const dockShadow = "shadow-[0_-6px_28px_rgba(0,0,0,0.35)]";

export const BottomMenu = () => {
  const { canUndo, canHint, undoMove, showHint, resetGame } = useGameStore();
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);

  const hintAvailable = canHint();
  const undoAvailable = canUndo();

  const handleNewGameClick = () => setIsNewGameModalOpen(true);
  const handleConfirmNewGame = () => {
    setIsNewGameModalOpen(false);
    resetGame();
  };
  const handleCancelNewGame = () => setIsNewGameModalOpen(false);

  const primaryBtn =
    "inline-flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-[transform,box-shadow,background-color] duration-150 motion-safe:active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 sm:min-h-[46px] sm:px-6 sm:text-base";
  const secondaryBtn =
    "inline-flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl border border-stone-600/90 bg-stone-800/90 px-4 py-2.5 text-sm font-medium text-stone-100 transition hover:border-cyan-500/50 hover:bg-stone-700/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 sm:min-h-[46px]";
  const tertiaryBtn =
    "inline-flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl border border-stone-600/70 bg-stone-900/60 px-4 py-2.5 text-sm font-medium transition hover:border-amber-600/50 hover:bg-stone-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 sm:min-h-[46px]";

  return (
    <>
      {/* Mobile / tablet — fixed tab bar: primary New first */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-lg px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-0.5">
          <div className={`overflow-hidden rounded-t-xl border border-stone-600/80 border-b-0 bg-stone-950/95 ring-1 ring-white/5 backdrop-blur-xl ${dockShadow}`}>
            <div className="grid h-full grid-cols-3 divide-x divide-stone-700/80">
              <button
                type="button"
                onClick={handleNewGameClick}
                className="flex min-h-[40px] flex-1 touch-manipulation flex-col items-center justify-center gap-0 rounded-none bg-rose-600/25 px-0.5 py-1 text-rose-100 transition hover:bg-rose-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400/80"
                aria-label="Start new game"
              >
                <RotateCcw className="h-5 w-5 text-rose-300" strokeWidth={2.25} />
                <span className="text-[10px] font-semibold tracking-wide">New</span>
              </button>

              <button
                type="button"
                onClick={showHint}
                disabled={!hintAvailable}
                className={`flex min-h-[40px] flex-1 touch-manipulation flex-col items-center justify-center gap-0 rounded-none px-0.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/70 ${
                  hintAvailable ? "bg-cyan-600/15 text-cyan-100 hover:bg-cyan-600/25" : "cursor-not-allowed text-stone-500 opacity-55"
                }`}
                aria-label={hintAvailable ? "Show hint" : "Hint not available"}
              >
                <Lightbulb className={`h-5 w-5 ${hintAvailable ? "text-cyan-300" : ""}`} strokeWidth={hintAvailable ? 2.25 : 2} />
                <span className="text-[10px] font-semibold tracking-wide">Hint</span>
              </button>

              <button
                type="button"
                onClick={undoMove}
                disabled={!undoAvailable}
                className={`flex min-h-[40px] flex-1 touch-manipulation flex-col items-center justify-center gap-0 rounded-none px-0.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/70 ${
                  undoAvailable ? "bg-amber-600/10 text-amber-100/95 hover:bg-amber-600/20" : "cursor-not-allowed text-stone-500 opacity-55"
                }`}
                aria-label={undoAvailable ? "Undo last move" : "Nothing to undo"}
              >
                <Undo2 className={`h-5 w-5 ${undoAvailable ? "text-amber-300" : ""}`} strokeWidth={undoAvailable ? 2.25 : 2} />
                <span className="text-[10px] font-semibold tracking-wide">Undo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop — docked bar aligned to board column; hierarchy: New &gt; Hint &gt; Undo */}
      <div className={`hidden w-full max-w-full flex-col gap-3 rounded-2xl border border-stone-700/70 bg-stone-900/55 p-3 backdrop-blur-md lg:flex ${dockShadow}`}>
        <div className="flex flex-wrap items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={handleNewGameClick}
            className={`${primaryBtn} max-w-[220px] bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600`}
          >
            <RotateCcw className="h-5 w-5 shrink-0" strokeWidth={2.25} />
            New Game
          </button>
          <button
            type="button"
            onClick={showHint}
            disabled={!hintAvailable}
            className={`${secondaryBtn} ${hintAvailable ? "text-cyan-50" : "cursor-not-allowed border-stone-700 text-stone-500 opacity-60"}`}
          >
            <Lightbulb className="h-4 w-4 shrink-0" />
            Hint
          </button>
          <button
            type="button"
            onClick={undoMove}
            disabled={!undoAvailable}
            className={`${tertiaryBtn} ${undoAvailable ? "border-amber-700/50 text-amber-100" : "cursor-not-allowed border-stone-700 text-stone-500 opacity-60"}`}
          >
            <Undo2 className="h-4 w-4 shrink-0" />
            Undo
          </button>
        </div>
      </div>

      <Modal isOpen={isNewGameModalOpen} onClose={handleCancelNewGame} title="New Game">
        <div className="space-y-4">
          <p className="text-stone-300">Starting a new game will reset the board and clear your current progress. All moves and piece positions will be lost. Are you sure you want to continue?</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleCancelNewGame} className="rounded-lg bg-stone-700 px-4 py-2 text-stone-200 transition-colors hover:bg-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/80">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmNewGame} className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-colors hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80">
              Start New Game
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
