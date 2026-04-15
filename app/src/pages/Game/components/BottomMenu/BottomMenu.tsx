import { useState } from "react";
import { Lightbulb, Undo2, RotateCcw } from "lucide-react";
import { useGameStore } from "../../../../store/gameStore";
import { Modal } from "../../../../components/Modal";

const tabHit =
  "flex min-h-[40px] flex-1 touch-manipulation flex-col items-center justify-center gap-0 rounded-lg px-0.5 py-1 transition-[transform,background-color,color,opacity] duration-150 ease-out motion-safe:active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

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

  return (
    <>
      {/* Mobile: fixed tab bar — thumb zone, safe area, native-like bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-lg px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-0.5">
          <div className="overflow-hidden rounded-t-xl border border-stone-600/80 border-b-0 bg-stone-950/95 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/5 backdrop-blur-xl">
            <div className="grid h-full grid-cols-3 divide-x divide-stone-700/80">
              <button
                type="button"
                onClick={showHint}
                disabled={!hintAvailable}
                className={`${tabHit} ${
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
                className={`${tabHit} ${
                  undoAvailable ? "bg-amber-600/15 text-amber-100 hover:bg-amber-600/25" : "cursor-not-allowed text-stone-500 opacity-55"
                }`}
                aria-label={undoAvailable ? "Undo last move" : "Nothing to undo"}
              >
                <Undo2 className={`h-5 w-5 ${undoAvailable ? "text-amber-300" : ""}`} strokeWidth={undoAvailable ? 2.25 : 2} />
                <span className="text-[10px] font-semibold tracking-wide">Undo</span>
              </button>

              <button
                type="button"
                onClick={handleNewGameClick}
                className={`${tabHit} bg-rose-600/20 text-rose-100 hover:bg-rose-600/35`}
                aria-label="Start new game"
              >
                <RotateCcw className="h-5 w-5 text-rose-300" strokeWidth={2.25} />
                <span className="text-[10px] font-semibold tracking-wide">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: inline toolbar */}
      <div className="mt-3 hidden w-full rounded-xl border border-stone-700 bg-stone-800/80 p-3 backdrop-blur md:mt-4 md:block">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={showHint}
            disabled={!hintAvailable}
            className={`flex min-h-[38px] min-w-[100px] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
              hintAvailable ? "bg-cyan-600 text-white hover:bg-cyan-500" : "cursor-not-allowed bg-stone-700 text-stone-500"
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            Hint
          </button>
          <button
            type="button"
            onClick={undoMove}
            disabled={!undoAvailable}
            className={`flex min-h-[38px] min-w-[100px] items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
              undoAvailable ? "bg-amber-600 text-white hover:bg-amber-500" : "cursor-not-allowed bg-stone-700 text-stone-500"
            }`}
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleNewGameClick}
            className="flex min-h-[38px] min-w-[100px] items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-4 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-rose-500 hover:to-rose-600 hover:shadow-rose-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            New Game
          </button>
        </div>
      </div>

      <Modal isOpen={isNewGameModalOpen} onClose={handleCancelNewGame} title="New Game">
        <div className="space-y-4">
          <p className="text-stone-300">Starting a new game will reset the board and clear your current progress. All moves and piece positions will be lost. Are you sure you want to continue?</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleCancelNewGame} className="rounded-lg bg-stone-700 px-4 py-2 text-stone-200 transition-colors hover:bg-stone-600">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmNewGame} className="rounded-lg bg-rose-600 px-4 py-2 text-white transition-colors hover:bg-rose-500">
              Start New Game
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
