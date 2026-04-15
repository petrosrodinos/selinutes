import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type Board3DLoadFallbackMode = "card" | "overlay";

interface Board3DLoadFallbackProps {
  /** `card` = fixed board size (lazy chunk). `overlay` = on top of canvas while GLBs load. */
  mode?: Board3DLoadFallbackMode;
}

export const Board3DLoadFallback = ({ mode = "card" }: Board3DLoadFallbackProps) => {
  const overlay = mode === "overlay";
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateMobileViewport = () => setIsMobileViewport(window.innerWidth < 640);
    updateMobileViewport();
    window.addEventListener("resize", updateMobileViewport);

    return () => window.removeEventListener("resize", updateMobileViewport);
  }, []);

  return (
    <div className={overlay ? "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-amber-500/25 bg-stone-950/70 shadow-inner backdrop-blur-sm" : "relative w-[680px] h-[680px] md:w-[800px] md:h-[800px] rounded-xl overflow-hidden shadow-2xl border border-stone-700/60 bg-[#1f2937]"} aria-busy="true" aria-live="polite" aria-label="Loading 3D board">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
          linear-gradient(90deg, rgba(212,165,116,0.35) 1px, transparent 1px),
          linear-gradient(rgba(212,165,116,0.35) 1px, transparent 1px)
        `,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-amber-950/15" />

      <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-6 px-6 py-8 md:gap-8 md:px-8">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
          <div className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-2xl border border-amber-500/35 bg-stone-950/70 shadow-[inset_0_1px_0_rgba(251,191,36,0.12)]">
            <Loader2 className="h-11 w-11 text-amber-400 animate-spin" strokeWidth={2} />
          </div>
        </div>

        <div className="max-w-md text-center space-y-3">
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-amber-200 via-amber-50 to-amber-200 bg-clip-text text-transparent">{overlay ? "Loading 3D models…" : "Preparing your 3D board"}</h2>
          <p className="text-stone-400 text-sm md:text-[0.9375rem] leading-relaxed">{overlay ? "Pieces and terrain are loading." : "Loading pieces, obstacles, and textures. On a slower connection this can take a little while — the board will appear as soon as everything is ready."}</p>
          {isMobileViewport ? (
            <p className="text-amber-200/90 text-xs md:text-sm leading-relaxed">
              Mobile note: loading can take longer depending on your device performance and network speed.
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-amber-400/80 animate-bounce shadow-[0_0_8px_rgba(251,191,36,0.45)]" style={{ animationDelay: `${i * 120}ms`, animationDuration: "0.9s" }} />
          ))}
        </div>
      </div>
    </div>
  );
};
