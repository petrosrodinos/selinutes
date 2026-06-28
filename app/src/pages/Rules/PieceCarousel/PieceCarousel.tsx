import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Box } from "lucide-react";
import { RULES_FIGURE_ORDER, RULES_FIGURE_SECTION_TITLES } from "../../Game/constants";
import { PlayerColors, type PlayerColor } from "../../Game/types";
import { FigureSymbol } from "../../../components/FigureSymbol";
import { FIGURE_LEVELS, FIGURE_LEVEL_TIER_ORDER } from "../../../constants/figureLevels";
import { FIGURE_TIER_ORDER, FigureTiers, type FigureTierKey } from "../../../constants/figures";
import { Piece3DShowcase } from "./Piece3DShowcase";

type ViewMode = "2d" | "3d";

const FIGURE_TIER_OPTIONS = FIGURE_TIER_ORDER.map((tierKey, index) => ({
  tierKey,
  number: index + 1,
  label: FIGURE_LEVELS[FIGURE_LEVEL_TIER_ORDER[index]].label,
}));

export const PieceCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [figureVariant, setFigureVariant] = useState<PlayerColor>(PlayerColors.WHITE);
  const [figureTier, setFigureTier] = useState<FigureTierKey>(FigureTiers.TIER1);

  const pieceType = RULES_FIGURE_ORDER[activeIndex];
  const total = RULES_FIGURE_ORDER.length;
  const activeTierOption = FIGURE_TIER_OPTIONS.find((option) => option.tierKey === figureTier);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section className="relative z-10 w-full rounded-2xl border border-stone-700/60 bg-stone-900/40 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-stone-200">Figures</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex rounded-lg border border-stone-600/60 bg-stone-800/50 p-0.5">
            <button type="button" onClick={() => setViewMode("2d")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "2d" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-stone-200"}`}>
              <LayoutGrid className="w-4 h-4" />
              2D
            </button>
            <button type="button" onClick={() => setViewMode("3d")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "3d" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-stone-200"}`}>
              <Box className="w-4 h-4" />
              3D
            </button>
          </div>
          <div className="flex rounded-lg border border-stone-600/60 bg-stone-800/50 p-0.5" role="group" aria-label="Figure variant">
            <button
              type="button"
              onClick={() => setFigureVariant(PlayerColors.WHITE)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${figureVariant === PlayerColors.WHITE ? "bg-stone-100 text-stone-900 border border-stone-200/80" : "text-stone-400 hover:text-stone-200"}`}
              aria-pressed={figureVariant === PlayerColors.WHITE}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setFigureVariant(PlayerColors.BLACK)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${figureVariant === PlayerColors.BLACK ? "bg-stone-700 text-stone-100 border border-stone-500/60" : "text-stone-400 hover:text-stone-200"}`}
              aria-pressed={figureVariant === PlayerColors.BLACK}
            >
              Dark
            </button>
          </div>
          {viewMode === "3d" ? (
            <div className="flex rounded-lg border border-stone-600/60 bg-stone-800/50 p-0.5" role="group" aria-label="Figure tier">
              {FIGURE_TIER_OPTIONS.map(({ tierKey, number, label }) => (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setFigureTier(tierKey)}
                  className={`min-w-[2.25rem] px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${figureTier === tierKey ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-stone-200"}`}
                  aria-pressed={figureTier === tierKey}
                  aria-label={`Tier ${number}, ${label}`}
                  title={`Tier ${number} · ${label}`}
                >
                  {number}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-4">
        <button type="button" onClick={goPrev} className="flex-shrink-0 p-2 rounded-xl bg-stone-800 border border-stone-600/50 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors" aria-label="Previous figure">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex-1 min-w-0 rounded-xl overflow-hidden">
          {viewMode === "2d" ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-900/80 border border-stone-600/50 flex items-center justify-center mb-4">
                <FigureSymbol pieceType={pieceType} color={figureVariant} size="lg" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-amber-200/95">{RULES_FIGURE_SECTION_TITLES[pieceType]}</p>
            </div>
          ) : (
            <div className="flex flex-col rounded-xl bg-stone-800/50 border border-stone-700/50 overflow-hidden">
              <Piece3DShowcase pieceType={pieceType} playerColor={figureVariant} tier={figureTier} />
              <p className="text-center py-3 px-4 bg-stone-900/60 border-t border-stone-700/50">
                <span className="block text-base sm:text-lg font-semibold text-amber-200/95">{RULES_FIGURE_SECTION_TITLES[pieceType]}</span>
                {activeTierOption ? (
                  <span className="block mt-1 text-xs sm:text-sm text-stone-400">
                    Tier {activeTierOption.number} · {activeTierOption.label}
                  </span>
                ) : null}
              </p>
            </div>
          )}
        </div>

        <button type="button" onClick={goNext} className="flex-shrink-0 p-2 rounded-xl bg-stone-800 border border-stone-600/50 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors" aria-label="Next figure">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
        {RULES_FIGURE_ORDER.map((_, index) => (
          <button key={index} type="button" onClick={() => goTo(index)} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${index === activeIndex ? "bg-amber-500 w-6 sm:w-8" : "bg-stone-600 hover:bg-stone-500"}`} aria-label={`Go to figure ${index + 1}`} />
        ))}
      </div>
    </section>
  );
};
